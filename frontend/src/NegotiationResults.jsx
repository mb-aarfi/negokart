import React, { useEffect, useState, useRef } from 'react';
import './Dashboard.css';

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
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend.onrender.com';
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading negotiation results...
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

  if (!results.length) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Negotiation Results Yet</h3>
          <p className="empty-state-description">
            Your negotiation results will appear here once wholesalers respond to your requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          📊 Negotiation Results
        </h1>
        <p className="dashboard-subtitle">Compare offers from different wholesalers</p>
        <div style={{ marginTop: 16 }}>
          <button 
            onClick={fetchResults} 
            className="btn btn-secondary btn-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {newOffers && (
          <div className="alert alert-info">
            🎉 New offers available!
          </div>
        )}
        
        {finalizedAlerts.length > 0 && (
          <div className="alert alert-success">
            ✅ Finalized offer received from: {finalizedAlerts.join(', ')}
          </div>
        )}
        
        {lastUpdated && (
          <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
        
        {/* Summary Stats */}
        {finalizedOffers.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{finalizedOffers.length}</div>
              <div className="stat-label">Finalized Offers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{Math.min(...finalizedOffers.map(w => w.totalCost)).toFixed(2)}</div>
              <div className="stat-label">Best Total Price</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Object.keys(bestPrices).length}</div>
              <div className="stat-label">Products</div>
            </div>
          </div>
        )}

        {sortedResults.map((wholesaler, idx) => (
          <div key={idx} className="dashboard-card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h3 className="card-title">{wholesaler.wholesaler}</h3>
                {wholesaler.status === 'finalized' && wholesaler.totalCost === Math.min(...finalizedOffers.map(w => w.totalCost)) && (
                  <span className="status-badge status-best">BEST DEAL</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {wholesaler.status === 'finalized' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>
                      ₹{wholesaler.totalCost.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Total Cost</div>
                  </div>
                )}
                <span className={`status-badge ${wholesaler.status === 'finalized' ? 'status-finalized' : 'status-pending'}`}>
                  {wholesaler.status}
                </span>
              </div>
            </div>
            
            <div className="table-wrapper">
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Offered Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wholesaler.offers.map((offer, i) => (
                      <tr key={i} style={{ 
                        background: wholesaler.status === 'finalized' && offer.price === bestPrices[offer.product_name] ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                      }}>
                        <td>{offer.product_name}</td>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 500 }}>₹{offer.price}</span>
                          {wholesaler.status === 'finalized' && offer.price === bestPrices[offer.product_name] && (
                            <span className="status-badge status-best" style={{ fontSize: 10, padding: '2px 6px' }}>
                              BEST
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NegotiationResults;
