import React from 'react';
import Navbar from './Navbar';

function Landing({ onLoginClick, onRegisterClick }) {
  return (
    <div style={{ background: '#0b1220', color: '#e5e7eb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar isAuthenticated={false} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: 24, padding: '32px 24px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div style={{ textAlign: 'center', maxWidth: 920, margin: '0 auto' }}>
            <h1 style={{ margin: 0, fontSize: 36, lineHeight: 1.2 }}>AI Negotiator</h1>
            <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 16 }}>
            Supercharge your business with smart negotiation and real-
            time insights. 
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={onRegisterClick} style={{ background: '#22c55e', color: '#052e2b', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>Create Retailer Account</button>
              <button onClick={onLoginClick} style={{ background: '#1f2937', color: '#e5e7eb', border: '1px solid #334155', borderRadius: 8, padding: '10px 18px', cursor: 'pointer' }}>I am a Wholesaler</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 28, maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Smart Suggestion</div>
              <div style={{ color: '#94a3b8' }}>AI-powered recommendations to
              maximize your sales and profits.</div>
            </div>
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Business Insights</div>
              <div style={{ color: '#94a3b8' }}>Visualize your revenue, sales,
              and inventory real-time analytics.</div>
            </div>
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Easy Integration</div>
              <div style={{ color: '#94a3b8' }}>Seamlessly connect with your
              business tools and workflows.</div>
            </div>
            <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Best Deal Summary</div>
              <div style={{ color: '#94a3b8' }}>Retailers see finalized prices and best offers per item and total.</div>
            </div>
          </div>
        </section>

        <section style={{ background: 'radial-gradient(1200px 400px at 50% -10%, rgba(37,99,235,0.25), rgba(34,197,94,0.05))', border: '1px solid #1f2937', borderRadius: 12, padding: 20, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>How it works</div>
            <ol style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1' }}>
              <li>Retailer registers and submits a product list.</li>
              <li>AI negotiates with all wholesalers independently via chat.</li>
              <li>Wholesalers finalize prices; AI stores results.</li>
              <li>Retailer receives the best offers and can proceed to order.</li>
            </ol>
          </div>
        </section>
      </main>

      <footer style={{ padding: 16, color: '#94a3b8', borderTop: '1px solid #1f2937', textAlign: 'center' }}>
        © {new Date().getFullYear()} AI Negotiator. All rights reserved.
      </footer>
    </div>
  );
}

export default Landing;
