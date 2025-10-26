import React, { useState } from 'react';
import NegotiationResults from './NegotiationResults';
import './Dashboard.css';

function RetailerDashboard({ token }) {
  const [products, setProducts] = useState([{ name: '', quantity: 1 }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleProductChange = (idx, field, value) => {
    const newProducts = [...products];
    newProducts[idx][field] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: 1 }]);
  };

  const removeProduct = (idx) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://negokart-backend-8pt9.onrender.com';
      const res = await fetch(`${API_BASE}/retailer/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Product list submitted successfully!');
        setProducts([{ name: '', quantity: 1 }]);
        setShowResults(true);
      } else {
        setError(data.detail || 'Submission failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (showResults) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-content">
          <NegotiationResults token={token} />
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button 
              onClick={() => setShowResults(false)}
              className="btn btn-secondary"
            >
              Submit a New Product List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Product Requirements</h2>
              <p className="card-subtitle">Add the products you need and their quantities</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="product-list">
              {products.map((product, idx) => (
                <div key={idx} className="product-item">
                  <input
                    className="form-input product-input"
                    placeholder="Enter product name"
                    value={product.name}
                    onChange={e => handleProductChange(idx, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-input product-quantity"
                    placeholder="Qty"
                    value={product.quantity}
                    onChange={e => handleProductChange(idx, 'quantity', e.target.value)}
                    required
                  />
                  {products.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeProduct(idx)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <button 
                type="button" 
                onClick={addProduct}
                className="btn btn-secondary"
              >
                + Add Product
              </button>
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg">
              Submit Product List
            </button>
          </form>
          
          {message && (
            <div className="alert alert-success">
              ✅ {message}
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              ❌ {error}
            </div>
          )}
        </div>
        
        {/* Quick Tips */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">💡 Quick Tips</h3>
          </div>
          <div className="tips-grid">
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>Be Specific</h4>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                Include detailed product specifications, brands, or models for better quotes.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>Quantity Matters</h4>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                Higher quantities often lead to better per-unit pricing from wholesalers.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>Compare Offers</h4>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                Review all offers carefully and negotiate for the best possible deal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;
