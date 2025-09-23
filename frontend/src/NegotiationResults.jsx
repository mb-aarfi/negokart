import React, { useEffect, useState, useRef } from 'react';

function NegotiationResults({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newOffers, setNewOffers] = useState(false);
  const [finalizedAlerts, setFinalizedAlerts] = useState([]); 
  const prevResults = useRef([]);
  const pollRef = useRef(null);

  const fetchResults = async () => {
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/retailer/negotiation_results`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const current = data.results || [];
        // Detect general changes
        if (JSON.stringify(current) !== JSON.stringify(prevResults.current)) {
          setNewOffers(prevResults.current.length > 0);
        } else {
          setNewOffers(false);
        }
        // Detect wholesalers that newly became finalized
        const prevStatus = new Map(prevResults.current.map(r => [r.wholesaler, r.status]));
        const newlyFinalized = current
          .filter(r => r.status === 'finalized' && prevStatus.get(r.wholesaler) !== 'finalized')
          .map(r => r.wholesaler);
        if (newlyFinalized.length) {
          setFinalizedAlerts(newlyFinalized);
          // auto-clear banner after 8s
          setTimeout(() => setFinalizedAlerts([]), 8000);
        }
        setResults(current);
        prevResults.current = current;
        setLastUpdated(new Date());
      } else {
        setError(data.detail || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchResults().finally(() => setLoading(false));
    // start polling every 10s
    pollRef.current = setInterval(fetchResults, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line
  }, [token]);

  // Calculate total cost per wholesaler and find best prices
  const processedResults = results.map(wholesaler => {
    const totalCost = wholesaler.offers.reduce((sum, offer) => sum + (offer.price || 0), 0);
    return { ...wholesaler, totalCost };
  });

  // Sort by total cost (lowest first) and status (finalized first)
  const sortedResults = processedResults.sort((a, b) => {
    if (a.status === 'finalized' && b.status !== 'finalized') return -1;
    if (a.status !== 'finalized' && b.status === 'finalized') return 1;
    if (a.status === 'finalized' && b.status === 'finalized') {
      return a.totalCost - b.totalCost;
    }
    return 0;
  });

  // Find best price per product
  const finalizedOffers = sortedResults.filter(r => r.status === 'finalized');
  const bestPrices = {};
  finalizedOffers.forEach(wholesaler => {
    wholesaler.offers.forEach(offer => {
      if (!bestPrices[offer.product_name] || offer.price < bestPrices[offer.product_name]) {
        bestPrices[offer.product_name] = offer.price;
      }
    });
  });

  if (loading) return <div style={{ color: '#e5e7eb', background: '#0b1220', minHeight: '100vh', padding: 20 }}>Loading negotiation results...</div>;
  if (error) return <div style={{ color: '#f87171', background: '#0b1220', minHeight: '100vh', padding: 20 }}>{error}</div>;
  if (!results.length) return <div style={{ color: '#e5e7eb', background: '#0b1220', minHeight: '100vh', padding: 20 }}>No negotiation results yet.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, background: '#0b1220', minHeight: '100vh', color: '#e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#cbd5e1' }}>Negotiation Results</h2>
        <button onClick={fetchResults} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Refresh</button>
      </div>
      {newOffers && <div style={{ color: '#34d399', marginTop: 10, fontWeight: 'bold' }}>New offers available!</div>}
      {finalizedAlerts.length > 0 && (
        <div style={{ marginTop: 10, padding: '12px 16px', background: '#064e3b', border: '1px solid #34d399', color: '#34d399', borderRadius: 8, fontWeight: 600 }}>
          Finalized offer received from: {finalizedAlerts.join(', ')}
        </div>
      )}
      {lastUpdated && <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
      
      {/* Summary Stats */}
      {finalizedOffers.length > 0 && (
        <div style={{ marginBottom: 20, padding: 12, background: '#1f2937', border: '1px solid #334155', borderRadius: 8 }}>
          <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 8 }}>Summary</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            <span style={{ color: '#34d399' }}>Finalized: {finalizedOffers.length} wholesaler{finalizedOffers.length > 1 ? 's' : ''}</span>
            <span style={{ color: '#93c5fd' }}>Best Total: ₹{Math.min(...finalizedOffers.map(w => w.totalCost)).toFixed(2)}</span>
            <span style={{ color: '#fbbf24' }}>Products: {Object.keys(bestPrices).length}</span>
          </div>
        </div>
      )}

      {sortedResults.map((wholesaler, idx) => (
        <div key={idx} style={{ marginBottom: 24, background: '#111827', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
          <div style={{ padding: 12, background: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ color: '#93c5fd', margin: 0 }}>{wholesaler.wholesaler}</h3>
              {wholesaler.status === 'finalized' && wholesaler.totalCost === Math.min(...finalizedOffers.map(w => w.totalCost)) && (
                <span style={{ fontSize: 11, color: '#052e16', background: '#34d399', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>BEST DEAL</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {wholesaler.status === 'finalized' && (
                <span style={{ fontSize: 12, color: '#cbd5e1' }}>Total: ₹{wholesaler.totalCost.toFixed(2)}</span>
              )}
              <span style={{ fontSize: 12, color: wholesaler.status === 'finalized' ? '#34d399' : '#fbbf24', background: wholesaler.status === 'finalized' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', padding: '4px 10px', borderRadius: 999 }}>
                {wholesaler.status}
              </span>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0b1220', border: '1px solid #334155' }}>
              <thead>
                <tr style={{ background: '#1f2937' }}>
                  <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Product</th>
                  <th style={{ border: '1px solid #334155', padding: 8, textAlign: 'left', color: '#cbd5e1' }}>Offered Price</th>
                </tr>
              </thead>
              <tbody>
                {wholesaler.offers.map((offer, i) => (
                  <tr key={i} style={{ 
                    background: wholesaler.status === 'finalized' && offer.price === bestPrices[offer.product_name] ? 'rgba(52,211,153,0.1)' : 'transparent'
                  }}>
                    <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb' }}>{offer.product_name}</td>
                    <td style={{ border: '1px solid #334155', padding: 8, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                      ₹{offer.price}
                      {wholesaler.status === 'finalized' && offer.price === bestPrices[offer.product_name] && (
                        <span style={{ fontSize: 10, color: '#052e16', background: '#34d399', padding: '1px 4px', borderRadius: 3 }}>BEST</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NegotiationResults;
