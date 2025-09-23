# NegoKart – AI Negotiator

An end‑to‑end system where a Retailer submits a product list and an AI agent negotiates prices with multiple Wholesalers individually over chat, collects final prices, and presents the best deals back to the Retailer.

## Features
- AI‑driven negotiation chats (per wholesaler)
- Multi‑wholesaler parallel sessions
- Finalization workflow with structured results
- Retailer results dashboard with best‑price highlighting
- Wholesaler dashboard with chat + “Send My Prices”
- History archive for finalized sessions (wholesaler)
- Responsive dark UI + sticky navbar and landing page
- Local LLM support via Ollama (no paid API required)

## Architecture
- Frontend: React + Vite
- Backend: FastAPI (Python)
- DB: SQLite (dev) via SQLAlchemy
- AI: Local LLM through Ollama Chat API

```
Retailer -> Frontend -> FastAPI -> Ollama (LLM)
                   \-> SQLite (users, sessions, offers, chat, history)
Wholesaler -> Frontend -> FastAPI -> Ollama (LLM)
```

## Tech Stack
- Frontend: React, Vite
- Backend: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Auth: JWT (password hashed with bcrypt via passlib)
- AI: Ollama (e.g., `llama3.2:3b`)

## Getting Started

### 1) Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- Ollama (Windows/macOS/Linux)

### 2) Clone
```bash
git clone <your-repo-url>
cd negokart
```

### 3) Backend setup
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy pydantic[dotenv] python-jose[cryptography] passlib[bcrypt] httpx
```
Create `backend/main.py` already present in repo. Run dev server:
```powershell
# optional env (choose the model you pulled in Ollama)
$env:OLLAMA_MODEL="llama3.2:3b"
$env:OLLAMA_BASE_URL="http://127.0.0.1:11434"
uvicorn main:app --reload
```
FastAPI runs at `http://127.0.0.1:8000`.

### 4) Frontend setup
```powershell
cd ../frontend
npm install
npm run dev
```
Vite dev server is printed (usually `http://localhost:5173`).

### 5) Ollama (Local LLM)
1. Install Ollama (see `https://ollama.com`).
2. Pull a model:
```powershell
ollama pull llama3.2:3b
```
3. Ensure server is up (defaults to `http://127.0.0.1:11434`):
```powershell
(Invoke-WebRequest http://127.0.0.1:11434/api/tags).Content
```
If you see your model listed, you’re good.

## Usage

### Roles
- Retailer: creates account, submits product list, sees finalized results.
- Wholesaler: creates account, negotiates via chat, sends prices, finalizes.

### Flow
1. Open `frontend` URL → Landing page → Register/Login.
2. Retailer: submit product list. System creates a negotiation session with each registered Wholesaler.
3. Wholesaler: Dashboard → Load Chat → negotiate with AI → use “Send My Prices” to propose prices for all items. AI can counter; once agreement is reached, AI outputs a final JSON internally.
4. Backend parses final JSON, stores offers, marks wholesaler session as finalized, and archives to history.
5. Retailer: Results page auto‑polls and shows finalized offers, highlights best prices, and sorts by total cost.

## Important Endpoints (dev)
- Auth
  - POST `/register` { username, password, role: retailer|wholesaler }
  - POST `/login` (form): username, password → JWT
- Retailer
  - POST `/retailer/products` { products: [{ name, quantity }] }
  - GET `/retailer/negotiation_results`
- Wholesaler
  - GET `/wholesaler/negotiations` (active)
  - GET `/wholesaler/history` (finalized)
  - GET `/wholesaler/chat/{session_id}` (messages, status)
  - POST `/wholesaler/chat/{session_id}` { message }
  - POST `/wholesaler/offer` { session_id, product_name, price } (used internally; optional with AI-driven flow)

All protected endpoints require header: `Authorization: Bearer <JWT>`.

## Environment Variables (optional)
- `OLLAMA_MODEL` – default `llama3.1` (override e.g., `llama3.2:3b`)
- `OLLAMA_BASE_URL` – default `http://127.0.0.1:11434`

## Project Structure (key)
```
backend/
  main.py                  # FastAPI app, models, endpoints, AI integration
  venv/                    # Python virtual env (local)
frontend/
  src/
    App.jsx                # Views and routing
    Landing.jsx            # Landing page (dark theme)
    Navbar.jsx             # Sticky navbar (logo, auth buttons)
    Login.jsx, Register.jsx
    ProductListForm.jsx    # Retailer submit list
    NegotiationResults.jsx # Retailer results with best-price highlight
    WholesalerDashboard.jsx# Chat + Send My Prices + History
    assets/logo_nego.*
```

## Troubleshooting
- Backend error: `Form data requires "python-multipart"` → install it or ensure login uses `application/x-www-form-urlencoded` (already configured).
- `httpx` not found → `pip install httpx` in the backend venv.
- Ollama not reachable → ensure it’s running and your model is pulled; verify with `/api/tags`.
- CORS blocked → CORS middleware is enabled in `main.py` for dev.
- Reset sessions (keep users): run a small SQLite cleanup script to delete from `offers`, `chat_messages`, `wholesaler_negotiations`, `wholesaler_history`, `negotiation_sessions`, and `product_lists`.

## Roadmap
- WebSocket push notifications for instant retailer updates
- Admin dashboard and analytics
- Email/SMS notifications on finalization
- Payments/ordering workflow after negotiation

## License
MIT (or your preferred license).
