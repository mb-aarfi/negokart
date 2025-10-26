import React from 'react';
import './Landing.css';
import Navbar from './Navbar';

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
								<button onClick={onRegisterClick} className="btn btn-primary">Start Negotiating</button>
								<button className="btn btn-outline">Watch Demo</button>
							</div>
							<div className="stats">
								<div>✔ Average Savings <strong>15-25%</strong></div>
								<div>✔ Saves <strong>5+ hours/week</strong></div>
							</div>
						</div>
						<div className="hero-visual">
							<img className="hero-image glass" src="https://images.unsplash.com/photo-1758519288905-38b7b00c1023?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5lZ290aWF0aW9uJTIwaGFuZHNoYWtlfGVufDF8fHx8MTc1ODg4ODAxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="NegoKart" />
						</div>
					</div>
				</section>

				<section id="features" className="section">
					<div className="container">
						<h2 className="section-title">Powerful Features for Smart Negotiations</h2>
						<div className="cards">
							{[
								{ title: 'AI-Powered Negotiation', desc: 'Advanced AI matching algorithms that negotiate deals with wholesalers for you.', icon: '🤖' },
								{ title: 'Location-Based Matching', desc: 'Automatically connects you with nearby wholesalers, reducing shipping costs and delivery times.', icon: '📍' },
								{ title: '24/7 Automated Negotiations', desc: 'Our AI works around the clock, ensuring you never miss out on deals and opportunities.', icon: '⏱️' },
								{ title: 'Secure Transactions', desc: 'Enterprise-grade security ensures all your negotiations and transactions are protected and encrypted.', icon: '🔒' },
								{ title: 'Smart Analytics', desc: 'Detailed insights into your negotiation patterns and pricing trends.', icon: '📊' },
								{ title: 'Multi-Supplier Network', desc: 'Access thousands of verified wholesalers across categories and locations.', icon: '🌐' }
							].map((f, i) => (
								<div key={i} className="glass card">
									<div className="card-head">
										<div className="icon-wrap">{f.icon}</div>
										<h3>{f.title}</h3>
									</div>
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
									<img alt="step" src={
										i === 0 ? 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=200&auto=format&fit=crop' :
										i === 1 ? 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=200&auto=format&fit=crop' :
										i === 2 ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop' :
										'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=200&auto=format&fit=crop'
									} />
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
						<p className="section-subtitle">Whether you're buying or selling, NegoKart helps you succeed</p>
						<div className="benefits-section">
							<div className="benefits-cards">
								<div className="benefit-card retailer-card">
									<div className="benefit-icon">🛍️</div>
									<h3>For Retailers</h3>
									<p className="benefit-subtitle">Streamline your sourcing process</p>
									<ul className="benefit-list">
										<li><span className="check-icon">✓</span> Reduce procurement costs by 15-25%</li>
										<li><span className="check-icon">✓</span> Save 5+ hours per week on negotiations</li>
										<li><span className="check-icon">✓</span> Increase profit margins with better deals</li>
										<li><span className="check-icon">✓</span> Access to thousands of verified suppliers</li>
									</ul>
								</div>
								<div className="benefit-card wholesaler-card">
									<div className="benefit-icon">🏭</div>
									<h3>For Wholesalers</h3>
									<p className="benefit-subtitle">Grow your business effortlessly</p>
									<ul className="benefit-list">
										<li><span className="check-icon">✓</span> Connect with more potential customers</li>
										<li><span className="check-icon">✓</span> Predictable and consistent revenue streams</li>
										<li><span className="check-icon">✓</span> Automated sales with 24/7 negotiations</li>
										<li><span className="check-icon">✓</span> Efficient order management system</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="section cta-wrap">
					<h2 className="section-title" style={{ marginBottom: 8 }}>Ready to Transform Your Business?</h2>
					<p className="muted" style={{ maxWidth: 800, margin: '0 auto 16px' }}>Join retailers saving time and money with AI-powered negotiations.</p>
					<div className="badges">
						<div>✔ 24/7 AI negotiations</div>
						<div>✔ Instant supplier matching</div>
					</div>
					{/* Start Free Trial button removed per request */}
				</section>
			</main>

			<footer className="footer">
				<div className="container footer-grid">
					<div className="footer-brand">
						<div className="footer-logo">
							<img src="https://img.freepik.com/premium-vector/negotiation-icon_1134104-20778.jpg" alt="NegoKart" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
							<span style={{ fontWeight: 800, fontSize: 18, color: 'white' }}>NegoKart</span>
						</div>
						<p className="footer-description">Revolutionizing wholesale negotiations with AI-powered automation. Save time, reduce costs, and maximize your profit margins.</p>
						<div className="footer-social">
							<span>Follow us:</span>
							<div className="social-links">
								<a href="#" className="social-link">Twitter</a>
								<a href="#" className="social-link">LinkedIn</a>
								<a href="#" className="social-link">GitHub</a>
							</div>
						</div>
					</div>
					<div className="footer-column">
						<h4 className="footer-title">Product</h4>
						<ul className="footer-links">
							<li><a href="#features">Features</a></li>
							<li><a href="#how">How it Works</a></li>
							<li><a href="#">Pricing</a></li>
							<li><a href="#">API Documentation</a></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4 className="footer-title">Company</h4>
						<ul className="footer-links">
							<li><a href="#">About Us</a></li>
							<li><a href="#">Careers</a></li>
							<li><a href="#">Contact</a></li>
							<li><a href="#">Blog</a></li>
						</ul>
					</div>
					<div className="footer-column">
						<h4 className="footer-title">Support</h4>
						<ul className="footer-links">
							<li><a href="#">Help Center</a></li>
							<li><a href="#">Customer Support</a></li>
							<li><a href="#">Status</a></li>
							<li><a href="#">Community</a></li>
						</ul>
					</div>
				</div>
				<div className="footer-bottom">
					<div className="footer-legal">
						<span>© {new Date().getFullYear()} NegoKart. All rights reserved.</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default Landing;
