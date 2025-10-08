import React from 'react';
import Navbar from './Navbar';
import './Landing.css';

function Landing({ onLoginClick, onRegisterClick, isAuthenticated, role, onLogoutClick }) {
	return (
		<div className="landing">
			<Navbar isAuthenticated={isAuthenticated} role={role} onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} onLogoutClick={onLogoutClick} />
			<main style={{ flex: 1 }}>
				<section className="hero">
					<div className="container hero-grid">
						<div>
							<span className="kicker">AI Powered Negotiation</span>
							<h1>Smart Negotiations<br />Made Simple</h1>
							<p className="lead muted">
								Let AI negotiate with nearby wholesalers on your behalf. Get better deals, save time, and focus on growing your retail business while our intelligent system handles the bargaining.
							</p>
							<div className="cta">
								<button onClick={onRegisterClick} className="btn btn-outline">Start Negotiating</button>
								<button className="btn btn-outline">Watch Demo</button>
							</div>
							<div className="stats">
								<div>✔ Average Savings <strong>15-25%</strong></div>
								<div>✔ Saves <strong>5+ hours/week</strong></div>
							</div>
						</div>
						<div className="hero-visual">
							<div className="glow float" />
							<img className="hero-image glass" src="https://images.unsplash.com/photo-1758519288905-38b7b00c1023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5lZ290aWF0aW9uJTIwaGFuZHNoYWtlfGVufDF8fHx8MTc1ODg4ODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Negotiation" />
						</div>
					</div>
				</section>

				<section id="features" className="section">
					<div className="container">
						<h2 className="section-title">Powerful Features for Smart Negotiations</h2>
						<div className="cards">
							{[
								{ title: 'AI-Powered Negotiation', desc: 'Advanced AI matching algorithms that negotiate deals with wholesalers for you.' },
								{ title: 'Location-Based Matching', desc: 'Automatically connects you with nearby wholesalers, reducing shipping costs and delivery times.' },
								{ title: '24/7 Automated Negotiations', desc: 'Our AI works around the clock, ensuring you never miss out on deals and opportunities.' },
								{ title: 'Secure Transactions', desc: 'Enterprise-grade security ensures all your negotiations and transactions are protected and encrypted.' },
								{ title: 'Smart Analytics', desc: 'Detailed insights into your negotiation patterns, pricing trends, and market trends to optimize future deals.' },
								{ title: 'Multi-Supplier Network', desc: 'Access thousands of verified wholesalers across different categories and geographic locations.' }
							].map((f, i) => (
								<div key={i} className="glass card">
									<h3>{f.title}</h3>
									<p className="muted">{f.desc}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="how" className="section">
					<div className="container">
						<h2 className="section-title">How NegoKart Works</h2>
						<div className="steps">
							{[
								{ step: '01', title: 'Set Your Requirements', desc: 'Tell us what products you need, your target price, and preferred delivery timeline.' },
								{ step: '02', title: 'AI Finds Best Matches', desc: 'Our intelligent system identifies and connects with the most suitable wholesalers in your area.' },
								{ step: '03', title: 'Automated Negotiation', desc: 'Our AI negotiates on your behalf, using proven strategies to secure the best possible deals.' },
								{ step: '04', title: 'Secure Deal Closure', desc: 'Review and approve the negotiated terms, then enjoy seamless order fulfillment and delivery.' }
							].map((s, i) => (
								<div key={i} className="step">
									<div className="icon-circle">
										{/* step icon */}
										{ i === 0 && (
											<svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M4 7h16M4 12h10M4 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
											</svg>
										)}
										{ i === 1 && (
											<svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
										)}
										{ i === 2 && (
											<svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
												<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
											</svg>
										)}
										{ i === 3 && (
											<svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
												<rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
											</svg>
										)}
									</div>
									<div>
										<div className="num">{s.step}</div>
										<h3 style={{ marginTop: 4 }}>{s.title}</h3>
										<p className="muted" style={{ marginTop: 8 }}>{s.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section id="benefits" className="section">
					<div className="container">
						<h2 className="section-title">Benefits for Everyone</h2>
						<div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
							<div className="glass card">
								<h3>For Retailers</h3>
								<ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
									<li>Reduce Costs</li>
									<li>Save Time</li>
									<li>Increase Margins</li>
									<li>Access More Suppliers</li>
								</ul>
							</div>
							<div className="glass card">
								<h3>For Wholesalers</h3>
								<ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
									<li>More Customers</li>
									<li>Predictable Revenue</li>
									<li>Consistent Sales</li>
									<li>Efficient Sales</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section className="section cta-wrap">
					<h2 className="section-title" style={{ marginBottom: 8 }}>Ready to Transform Your Business?</h2>
					<p className="muted" style={{ maxWidth: 800, margin: '0 auto 16px' }}>Join retailers saving time and money with AI-powered negotiations. Start your free trial today.</p>
					<div className="badges">
						<div>✔ Free 30-day trial</div>
						<div>✔ 24/7 AI negotiations</div>
						<div>✔ Instant supplier matching</div>
					</div>
					{/* Start Free Trial button removed per request */}
				</section>
			</main>

			<footer className="footer">
				<div className="container footer-grid">
					<div>
						<div style={{ fontWeight: 800, marginBottom: 8 }}>NegoKart</div>
						<p className="muted">Revolutionizing wholesale negotiations with AI-powered automation. Save time, reduce costs, and maximize your profit margins.</p>
					</div>
					<div>
						<div style={{ fontWeight: 700, marginBottom: 8 }}>Product</div>
						<ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
							<li>Features</li>
							<li>How it Works</li>
							<li>Pricing</li>
							<li>API Documentation</li>
						</ul>
					</div>
					<div>
						<div style={{ fontWeight: 700, marginBottom: 8 }}>Company</div>
						<ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
							<li>About Us</li>
							<li>Careers</li>
							<li>Contact</li>
						</ul>
					</div>
					<div>
						<div style={{ fontWeight: 700, marginBottom: 8 }}>Support</div>
						<ul className="muted" style={{ margin: 0, paddingLeft: 18 }}>
							<li>Help Center</li>
							<li>Customer Support</li>
							<li>Status</li>
						</ul>
					</div>
				</div>
				<div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 }}>© {new Date().getFullYear()} NegoKart. All rights reserved.</div>
			</footer>
		</div>
	);
}

export default Landing;
