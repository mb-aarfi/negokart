from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from typing import List
from fastapi import status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi import Header
import random
from collections import defaultdict
from fastapi import Body
from datetime import datetime
import json
import httpx
import re

# Database setup
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT config
SECRET_KEY = "secretkeyforjwt"  # Change this in production
ALGORITHM = "HS256"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # 'retailer' or 'wholesaler'

Base.metadata.create_all(bind=engine)

# Pydantic schemas
class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # 'retailer' or 'wholesaler'

class Token(BaseModel):
    access_token: str
    token_type: str

# FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Registration endpoint
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

# Login endpoint
@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token_data = {"sub": user.username, "role": user.role}
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
def read_root():
    return {"message": "Hello, AI Negotiator Backend!"}

# Product list model
class ProductList(Base):
    __tablename__ = "product_lists"
    id = Column(Integer, primary_key=True, index=True)
    retailer_id = Column(Integer)
    products = Column(String)  # Store as JSON string for simplicity

Base.metadata.create_all(bind=engine)

class ProductItem(BaseModel):
    name: str
    quantity: int

class ProductListRequest(BaseModel):
    products: List[ProductItem]

# Negotiation session and offer models
class NegotiationSession(Base):
    __tablename__ = "negotiation_sessions"
    id = Column(Integer, primary_key=True, index=True)
    product_list_id = Column(Integer, ForeignKey("product_lists.id"))

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("negotiation_sessions.id"))
    wholesaler_id = Column(Integer)
    product_name = Column(String)
    price = Column(Float)

# Per-wholesaler negotiation status
class WholesalerNegotiation(Base):
    __tablename__ = "wholesaler_negotiations"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    wholesaler_id = Column(Integer, index=True)
    status = Column(String, default="in_progress")  # in_progress | finalized
    finalized_at = Column(String, nullable=True)

# Archived history per wholesaler after finalization
class WholesalerHistory(Base):
    __tablename__ = "wholesaler_history"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    wholesaler_id = Column(Integer, index=True)
    retailer_id = Column(Integer, index=True)
    finalized_at = Column(String)
    data = Column(String)  # JSON snapshot including currency and items with final prices

# Chat message model for AI ↔ wholesaler conversation
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    wholesaler_id = Column(Integer, index=True)
    role = Column(String)  # 'system' | 'assistant' | 'user'
    content = Column(String)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

Base.metadata.create_all(bind=engine)

# Helper to get current user from JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Configuration for local LLM via Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

# Helper: build system prompt from context
def build_system_prompt(retailer_username: str, products: list[dict]):
    product_lines = "\n".join([f"- {p['name']} x {p['quantity']}" for p in products])
    return (
        "You are an expert B2B purchasing agent negotiating on behalf of a retailer. "
        "Be concise, professional, and aim to get the best all-in price per product. "
        "Ask for per-unit prices, bulk discounts, MOQs, and confirm currency. Use short messages (2-4 sentences).\n\n"
        f"Retailer: {retailer_username}\nRequested products:\n{product_lines}\n\n"
        "Negotiation rules:\n"
        "- Start by greeting and requesting their BEST FINAL per-unit price for each item\n"
        "- If prices seem high, propose reasonable counter-offers leveraging quantities\n"
        "- Once final agreement is reached for ALL items, OUTPUT A SINGLE JSON BLOCK between markers like this exactly:\n"
        "<FINAL_JSON> {\n  \"currency\": \"INR\",\n  \"items\": [{\"name\": \"ITEM_NAME\", \"final_price\": 123.45}]\n} </FINAL_JSON>\n"
        "- Do not include any commentary inside the JSON markers.\n"
    )

# Helper: call local LLM via Ollama chat API
async def generate_ai_reply(messages: list[dict]) -> str:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content")
            return content or ""
    except Exception:
        return "Thanks. Please provide your best per-unit prices, any bulk discounts, and MOQs for the listed items."

# Detect and parse final JSON from AI content
FINAL_JSON_RE = re.compile(r"<FINAL_JSON>\s*(\{[\s\S]*?\})\s*</FINAL_JSON>", re.IGNORECASE)

def maybe_apply_final_json(session_id: int, wholesaler_id: int, content: str, db: Session):
    m = FINAL_JSON_RE.search(content or "")
    if not m:
        return False
    try:
        data = json.loads(m.group(1))
        items = data.get("items", [])
        # Upsert offers for this wholesaler/session
        for item in items:
            name = item.get("name")
            price = float(item.get("final_price")) if item.get("final_price") is not None else None
            if not name or price is None:
                continue
            existing = db.query(Offer).filter(Offer.session_id == session_id, Offer.wholesaler_id == wholesaler_id, Offer.product_name == name).first()
            if existing:
                existing.price = price
            else:
                db.add(Offer(session_id=session_id, wholesaler_id=wholesaler_id, product_name=name, price=price))
        # Mark wholesaler negotiation finalized
        wn = db.query(WholesalerNegotiation).filter(WholesalerNegotiation.session_id == session_id, WholesalerNegotiation.wholesaler_id == wholesaler_id).first()
        if wn:
            wn.status = "finalized"
            wn.finalized_at = datetime.utcnow().isoformat()
        # Create history snapshot
        session = db.query(NegotiationSession).filter(NegotiationSession.id == session_id).first()
        product_list = db.query(ProductList).filter(ProductList.id == session.product_list_id).first() if session else None
        retailer_id = product_list.retailer_id if product_list else None
        existing_hist = db.query(WholesalerHistory).filter(WholesalerHistory.session_id == session_id, WholesalerHistory.wholesaler_id == wholesaler_id).first()
        if not existing_hist:
            snapshot = {
                "currency": data.get("currency", "INR"),
                "items": items
            }
            db.add(WholesalerHistory(
                session_id=session_id,
                wholesaler_id=wholesaler_id,
                retailer_id=retailer_id or 0,
                finalized_at=wn.finalized_at if wn else datetime.utcnow().isoformat(),
                data=json.dumps(snapshot)
            ))
        db.commit()
        return True
    except Exception:
        return False

# Endpoint modifications: on product list submit, create session and seed initial chat per wholesaler
@app.post("/retailer/products")
def submit_product_list(
    req: ProductListRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "retailer":
        raise HTTPException(status_code=403, detail="Only retailers can submit product lists.")
    product_list = ProductList(
        retailer_id=current_user.id,
        products=json.dumps([item.dict() for item in req.products])
    )
    db.add(product_list)
    db.commit()
    db.refresh(product_list)

    # Create negotiation session
    session = NegotiationSession(product_list_id=product_list.id)
    db.add(session)
    db.commit()
    db.refresh(session)

    # Seed chat for each wholesaler with a greeting from AI and create WholesalerNegotiation rows
    wholesalers = db.query(User).filter(User.role == "wholesaler").all()
    products = [item.dict() for item in req.products]
    system_prompt = build_system_prompt(current_user.username, products)

    for wholesaler in wholesalers:
        db.add(WholesalerNegotiation(session_id=session.id, wholesaler_id=wholesaler.id, status="in_progress"))
        db.add(ChatMessage(session_id=session.id, wholesaler_id=wholesaler.id, role="system", content=system_prompt))
        greeting = (
            f"Hello! I'm the AI negotiator for {current_user.username}. "
            f"They're looking to purchase: " + ", ".join([f"{p['name']} (quantity: {p['quantity']})" for p in products]) + ". "
            "What's your best per-unit price for each item? Please include any bulk discounts or MOQs."
        )
        db.add(ChatMessage(session_id=session.id, wholesaler_id=wholesaler.id, role="assistant", content=greeting))
    db.commit()

    return {"message": "Product list submitted and negotiation started!"}

# Endpoint for retailer to fetch negotiation results for their latest product list (include status)
@app.get("/retailer/negotiation_results")
def get_negotiation_results(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "retailer":
        raise HTTPException(status_code=403, detail="Only retailers can view negotiation results.")
    product_list = db.query(ProductList).filter(ProductList.retailer_id == current_user.id).order_by(ProductList.id.desc()).first()
    if not product_list:
        return {"results": []}
    session = db.query(NegotiationSession).filter(NegotiationSession.product_list_id == product_list.id).first()
    if not session:
        return {"results": []}
    offers = db.query(Offer).filter(Offer.session_id == session.id).all()
    from collections import defaultdict
    wholesaler_offers = defaultdict(list)
    for offer in offers:
        wholesaler_offers[offer.wholesaler_id].append({
            "product_name": offer.product_name,
            "price": offer.price
        })
    results = []
    for wholesaler_id, offers_list in wholesaler_offers.items():
        wholesaler = db.query(User).filter(User.id == wholesaler_id).first()
        wn = db.query(WholesalerNegotiation).filter(WholesalerNegotiation.session_id == session.id, WholesalerNegotiation.wholesaler_id == wholesaler_id).first()
        results.append({
            "wholesaler": wholesaler.username if wholesaler else f"Wholesaler {wholesaler_id}",
            "status": wn.status if wn else "in_progress",
            "offers": offers_list
        })
    return {"results": results}

# Endpoint for wholesaler to view negotiation requests (sessions) - exclude finalized
@app.get("/wholesaler/negotiations")
def wholesaler_negotiations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "wholesaler":
        raise HTTPException(status_code=403, detail="Only wholesalers can view negotiation requests.")
    sessions = db.query(NegotiationSession).all()
    results = []
    for session in sessions:
        product_list = db.query(ProductList).filter(ProductList.id == session.product_list_id).first()
        if not product_list:
            continue
        products = json.loads(product_list.products)
        offers = db.query(Offer).filter(Offer.session_id == session.id, Offer.wholesaler_id == current_user.id).all()
        offer_map = {(offer.product_name): offer.price for offer in offers}
        wn = db.query(WholesalerNegotiation).filter(WholesalerNegotiation.session_id == session.id, WholesalerNegotiation.wholesaler_id == current_user.id).first()
        # Skip finalized to "delete" from active list
        if wn and wn.status == "finalized":
            continue
        results.append({
            "session_id": session.id,
            "retailer_id": product_list.retailer_id,
            "status": wn.status if wn else "in_progress",
            "products": [
                {
                    "name": p["name"],
                    "quantity": p["quantity"],
                    "your_price": offer_map.get(p["name"])
                } for p in products
            ]
        })
    return {"negotiations": results}

# New endpoint: wholesaler history (finalized sessions)
@app.get("/wholesaler/history")
def wholesaler_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "wholesaler":
        raise HTTPException(status_code=403, detail="Only wholesalers can view history.")
    rows = db.query(WholesalerHistory).filter(WholesalerHistory.wholesaler_id == current_user.id).all()
    # Include retailer username
    out = []
    for row in rows:
        retailer = db.query(User).filter(User.id == row.retailer_id).first()
        try:
            payload = json.loads(row.data)
        except Exception:
            payload = {"items": []}
        out.append({
            "session_id": row.session_id,
            "retailer": retailer.username if retailer else f"Retailer {row.retailer_id}",
            "finalized_at": row.finalized_at,
            "currency": payload.get("currency", "INR"),
            "items": payload.get("items", [])
        })
    # Newest first
    out.sort(key=lambda r: r.get("finalized_at") or "", reverse=True)
    return {"history": out}

# Endpoint for wholesaler to submit/update their offer for a product in a session
class OfferRequest(BaseModel):
    session_id: int
    product_name: str
    price: float

@app.post("/wholesaler/offer")
def submit_offer(
    req: OfferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "wholesaler":
        raise HTTPException(status_code=403, detail="Only wholesalers can submit offers.")
    # Check if offer exists
    offer = db.query(Offer).filter(
        Offer.session_id == req.session_id,
        Offer.wholesaler_id == current_user.id,
        Offer.product_name == req.product_name
    ).first()
    if offer:
        offer.price = req.price
    else:
        offer = Offer(
            session_id=req.session_id,
            wholesaler_id=current_user.id,
            product_name=req.product_name,
            price=req.price
        )
        db.add(offer)
    db.commit()
    return {"message": "Offer submitted!"}

# Wholesaler chat: list messages
@app.get("/wholesaler/chat/{session_id}")
def get_chat(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "wholesaler":
        raise HTTPException(status_code=403, detail="Only wholesalers can access this chat.")
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id, ChatMessage.wholesaler_id == current_user.id).order_by(ChatMessage.id.asc()).all()
    # Include status
    wn = db.query(WholesalerNegotiation).filter(WholesalerNegotiation.session_id == session_id, WholesalerNegotiation.wholesaler_id == current_user.id).first()
    return {
        "status": wn.status if wn else "in_progress",
        "messages": [
            {"role": m.role, "content": m.content, "created_at": m.created_at}
            for m in msgs if m.role != "system"  # Filter out system messages
        ]
    }

class ChatSendRequest(BaseModel):
    message: str

# Wholesaler chat: send a message, AI replies
@app.post("/wholesaler/chat/{session_id}")
async def send_chat(session_id: int, req: ChatSendRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "wholesaler":
        raise HTTPException(status_code=403, detail="Only wholesalers can send chat messages.")
    # Persist wholesaler message
    user_msg = ChatMessage(session_id=session_id, wholesaler_id=current_user.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Build conversation history for LLM
    raw_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id, ChatMessage.wholesaler_id == current_user.id).order_by(ChatMessage.id.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in raw_msgs]

    # Generate AI reply
    ai_text = await generate_ai_reply(history)

    ai_msg = ChatMessage(session_id=session_id, wholesaler_id=current_user.id, role="assistant", content=ai_text or "")
    db.add(ai_msg)
    db.commit()

    # If AI produced final JSON, parse and store offers + mark finalized
    finalized = maybe_apply_final_json(session_id, current_user.id, ai_text or "", db)

    return {"reply": ai_msg.content, "finalized": finalized}
