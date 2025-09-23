import React, { useState } from 'react';
import NegotiationResults from './NegotiationResults';

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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
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
      <div>
        <NegotiationResults token={token} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => setShowResults(false)}>
            Submit a new product list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Enter Product List</h2>
      <form onSubmit={handleSubmit}>
        {products.map((product, idx) => (
          <div key={idx} style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
            <input
              placeholder="Product name"
              value={product.name}
              onChange={e => handleProductChange(idx, 'name', e.target.value)}
              required
              style={{ flex: 2 }}
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={product.quantity}
              onChange={e => handleProductChange(idx, 'quantity', e.target.value)}
              required
              style={{ width: 80 }}
            />
            {products.length > 1 && (
              <button type="button" onClick={() => removeProduct(idx)} style={{ color: 'red' }}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addProduct} style={{ marginBottom: 12 }}>Add Product</button>
        <br />
        <button type="submit">Submit List</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </div>
  );
}

export default RetailerDashboard;
