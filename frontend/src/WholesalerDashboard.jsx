import React, { useEffect, useState } from 'react';

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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
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

  if (loading) return <div style={{ color: '#e5e7eb', background: '#0b1220', minHeight: '100vh', padding: 20 }}>Loading negotiations...</div>;
  if (error) return <div style={{ color: '#f87171', background: '#0b1220', minHeight: '100vh', padding: 20 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, background: '#0b1220', minHeight: '100vh', color: '#e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#cbd5e1' }}>Wholesaler</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('active')} style={{ background: tab === 'active' ? '#2563eb' : '#1f2937', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Active</button>
          <button onClick={() => setTab('history')} style={{ background: tab === 'history' ? '#2563eb' : '#1f2937', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>History</button>
          <button onClick={() => { fetchNegotiations(); fetchHistory(); }} style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #4b5563', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Refresh</button>
        </div>
      </div>
      {tab === 'active' ? (
        <>
          {lastUpdated && <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
          {negotiations.length === 0 ? (
            <div style={{ color: '#e5e7eb' }}>No active negotiation requests.</div>
          ) : (
            negotiations.map((neg, idx) => (
              <div key={idx} style={{ marginBottom: 32, background: '#111827', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                <div style={{ padding: 12, background: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ color: '#93c5fd', margin: 0 }}>Negotiation Session #{neg.session_id}</h3>
                  <span style={{ fontSize: 12, color: neg.status === 'finalized' ? '#34d399' : '#fbbf24', background: neg.status === 'finalized' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', padding: '4px 10px', borderRadius: 999 }}>{neg.status}</span>
                </div>

                <div style={{ padding: 12 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0b1220', border: '1px solid #334155' }}>
                    <thead>
                      <tr style={{ background: '#1f2937' }}>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Product</th>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Quantity</th>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Your Price</th>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {neg.products.map((p, i) => (
                        <tr key={i}>
                          <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb' }}>{p.name}</td>
                          <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb' }}>{p.quantity}</td>
                          <td style={{ border: '1px solid #334155', padding: 8 }}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={p.your_price !== undefined && p.your_price !== null ? p.your_price : ''}
                              onChange={e => handleOfferChange(neg.session_id, p.name, e.target.value)}
                              style={{ width: 100, padding: '6px 8px', background: '#0f172a', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 6 }}
                            />
                          </td>
                          <td style={{ border: '1px solid #334155', padding: 8, display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => sendMyPrices(neg.session_id)}
                              disabled={sendingPrices[neg.session_id]}
                              style={{ background: '#22c55e', color: '#052e2b', fontWeight: 600, border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
                            >
                              {sendingPrices[neg.session_id] ? 'Sending...' : 'Send My Prices'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Chat UI */}
                  <div style={{ marginTop: 16, background: '#0b1220', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: 10, background: '#1f2937', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#cbd5e1' }}>Chat with AI Negotiator</strong>
                      <button onClick={() => fetchChat(neg.session_id)} style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #4b5563', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Load Chat</button>
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto', padding: 10 }}>
                      {(chats[neg.session_id]?.messages || []).map((m, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{m.role.toUpperCase()} • {new Date(m.created_at).toLocaleTimeString?.() || ''}</div>
                          <div style={{ whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>{m.content}</div>
                        </div>
                      ))}
                      {!(chats[neg.session_id]?.messages) && (
                        <div style={{ color: '#94a3b8' }}>Click "Load Chat" to view messages.</div>
                      )}
                    </div>
                    <div style={{ padding: 10, borderTop: '1px solid #334155', display: 'flex', gap: 8, background: '#0f172a' }}>
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={chats[neg.session_id]?.input || ''}
                        onChange={e => setChats(ch => ({ ...ch, [neg.session_id]: { ...(ch[neg.session_id] || { messages: [] }), input: e.target.value } }))}
                        style={{ flex: 1, padding: 10, background: '#0b1220', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 8 }}
                      />
                      <button onClick={() => sendChat(neg.session_id)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>Send</button>
                    </div>
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
            <div style={{ color: '#e5e7eb' }}>No history yet.</div>
          ) : (
            history.map((h, i) => (
              <div key={i} style={{ marginBottom: 20, background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#93c5fd', fontWeight: 600 }}>Session #{h.session_id}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>Retailer: {h.retailer}</div>
                  </div>
                  <div style={{ color: '#34d399', fontSize: 12 }}>Finalized: {new Date(h.finalized_at).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0b1220', border: '1px solid #334155' }}>
                    <thead>
                      <tr style={{ background: '#1f2937' }}>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Product</th>
                        <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Final Price ({h.currency})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.items.map((item, idx2) => (
                        <tr key={idx2}>
                          <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb' }}>{item.name}</td>
                          <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb' }}>{item.final_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default WholesalerDashboard;
