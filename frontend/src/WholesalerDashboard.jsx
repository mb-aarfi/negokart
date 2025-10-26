import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function WholesalerDashboard({ token }) {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerStatus, setOfferStatus] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [chats, setChats] = useState({}); 
  const [sendingPrices, setSendingPrices] = useState({}); 
  const [tab, setTab] = useState('active'); 
  const [history, setHistory] = useState([]);

  const fetchNegotiations = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
      const res = await fetch(`${API_BASE}/wholesaler/negotiations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNegotiations(data.negotiations || []);
        setLastUpdated(new Date());
      } else {
        setError(data.detail || 'Failed to fetch negotiations');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
      const res = await fetch(`${API_BASE}/wholesaler/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      }
    } catch {}
  };

  const fetchChat = async (sessionId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
      const res = await fetch(`${API_BASE}/wholesaler/chat/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setChats(ch => ({ ...ch, [sessionId]: { ...(ch[sessionId] || { input: '' }), messages: data.messages || [], status: data.status } }));
      }
    } catch {}
  };

  const sendChat = async (sessionId, textOverride) => {
    const current = chats[sessionId] || { input: '' };
    const text = (textOverride !== undefined ? textOverride : current.input || '').trim();
    if (!text) return;
    setChats(ch => ({ ...ch, [sessionId]: { ...current, input: '' } }));
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
      const res = await fetch(`${API_BASE}/wholesaler/chat/${sessionId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchChat(sessionId);
        await fetchNegotiations();
        await fetchHistory();
      }
    } catch {}
  };

  useEffect(() => {
    fetchNegotiations();
    fetchHistory();
    // eslint-disable-next-line
  }, [token]);

  const handleOfferChange = (sessionId, productName, value) => {
    setNegotiations(negotiations => negotiations.map(n => {
      if (n.session_id !== sessionId) return n;
      return {
        ...n,
        products: n.products.map(p =>
          p.name === productName ? { ...p, your_price: value } : p
        )
      };
    }));
  };

  const sendMyPrices = async (sessionId) => {
    const session = negotiations.find(n => n.session_id === sessionId);
    if (!session) return;
    const pricePairs = session.products
      .filter(p => p.your_price !== undefined && p.your_price !== '' && p.your_price !== null)
      .map(p => `${p.name}: ${p.your_price}`)
      .join(', ');
    if (!pricePairs) return;
    setSendingPrices(s => ({ ...s, [sessionId]: true }));
    const composed = `My current best per-unit prices are: ${pricePairs}. Currency is INR. MOQ as previously stated if any. Please review.`;
    await sendChat(sessionId, composed);
    setSendingPrices(s => ({ ...s, [sessionId]: false }));
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading negotiations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-tabs" style={{ marginBottom: 24 }}>
          <button 
            onClick={() => setTab('active')} 
            className={`dashboard-tab ${tab === 'active' ? 'active' : ''}`}
          >
            Active Negotiations
          </button>
          <button 
            onClick={() => setTab('history')} 
            className={`dashboard-tab ${tab === 'history' ? 'active' : ''}`}
          >
            History
          </button>
          <button 
            onClick={() => { fetchNegotiations(); fetchHistory(); }} 
            className="btn btn-secondary btn-sm"
          >
            🔄 Refresh
          </button>
        </div>
        {lastUpdated && (
          <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {tab === 'active' ? (
          <>
            {negotiations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3 className="empty-state-title">No Active Negotiations</h3>
                <p className="empty-state-description">
                  You don't have any active negotiation requests at the moment.
                </p>
              </div>
            ) : (
              negotiations.map((neg, idx) => (
                <div key={idx} className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Negotiation Session #{neg.session_id}</h3>
                      <p className="card-subtitle">Retailer request for product pricing</p>
                    </div>
                    <span className={`status-badge ${neg.status === 'finalized' ? 'status-finalized' : 'status-pending'}`}>
                      {neg.status}
                    </span>
                  </div>

                  <div className="table-wrapper">
                    <div className="dashboard-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Your Price (₹)</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {neg.products.map((p, i) => (
                            <tr key={i}>
                              <td>{p.name}</td>
                              <td>{p.quantity}</td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={p.your_price !== undefined && p.your_price !== null ? p.your_price : ''}
                                  onChange={e => handleOfferChange(neg.session_id, p.name, e.target.value)}
                                  className="form-input"
                                  style={{ width: 120 }}
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() => sendMyPrices(neg.session_id)}
                                  disabled={sendingPrices[neg.session_id]}
                                  className="btn btn-success btn-sm"
                                >
                                  {sendingPrices[neg.session_id] ? 'Sending...' : 'Send Prices'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="chat-container" style={{ marginTop: 24 }}>
                    <div className="chat-header">
                      <h4 className="chat-title">💬 Chat with AI Negotiator</h4>
                      <button 
                        onClick={() => fetchChat(neg.session_id)} 
                        className="btn btn-secondary btn-sm"
                      >
                        Load Chat
                      </button>
                    </div>
                    <div className="chat-messages">
                      {(chats[neg.session_id]?.messages || []).map((m, i) => (
                        <div key={i} className={`chat-message ${m.role}`}>
                          <div className="chat-meta">{m.role.toUpperCase()} • {new Date(m.created_at).toLocaleTimeString?.() || ''}</div>
                          <div className="chat-content">{m.content}</div>
                        </div>
                      ))}
                      {!(chats[neg.session_id]?.messages) && (
                        <div className="empty-state">
                          <p className="empty-state-description">Click "Load Chat" to view messages.</p>
                        </div>
                      )}
                    </div>
                    <div className="chat-input-container">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={chats[neg.session_id]?.input || ''}
                        onChange={e => setChats(ch => ({ ...ch, [neg.session_id]: { ...(ch[neg.session_id] || { messages: [] }), input: e.target.value } }))}
                        className="chat-input"
                      />
                      <button 
                        onClick={() => sendChat(neg.session_id)} 
                        className="chat-send"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          // History tab
          <div>
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3 className="empty-state-title">No History Yet</h3>
                <p className="empty-state-description">
                  Your completed negotiations will appear here.
                </p>
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} className="dashboard-card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Session #{h.session_id}</h3>
                      <p className="card-subtitle">Retailer: {h.retailer}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="status-badge status-finalized">
                        Finalized
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        {new Date(h.finalized_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="table-wrapper">
                    <div className="dashboard-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Final Price ({h.currency})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h.items.map((item, idx2) => (
                            <tr key={idx2}>
                              <td>{item.name}</td>
                              <td>₹{item.final_price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WholesalerDashboard;
