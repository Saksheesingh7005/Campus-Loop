import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  ArrowRight,
  Sparkles,
  Search,
  Handshake,
  Repeat,
  ShieldCheck,
  TrendingUp,
  Users,
  Layers,
  BookOpen,
  Calculator,
  FlaskConical,
  Laptop
} from 'lucide-react';

export function LandingPage({ setCurrentView, onSelectResource, previewResources = [] }) {
  const { isAuthenticated, openAuthModal, quickLoginDemo } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-pill">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span>Smart College Resource Sharing Prototype</span>
          </div>

          <h1 className="hero-heading">
            Share More. <span className="text-cyan">Spend Less.</span> <br />
            Campus Together.
          </h1>

          <p className="hero-subtitle">
            A trusted peer-to-peer campus platform where students borrow, lend, and exchange expensive textbooks, scientific calculators, lab aprons, and tech essentials without burning a hole in their wallets.
          </p>

          <div className="hero-ctas">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setCurrentView('explore')}
            >
              <span>Explore Resources</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated ? (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => openAuthModal('register')}
              >
                <span>Get Started</span>
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setCurrentView('dashboard')}
              >
                <span>Go to Dashboard</span>
              </button>
            )}
          </div>

          {/* Quick Category Showcase Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <span className="cat-pill" onClick={() => setCurrentView('explore')}>📚 Books & Notes</span>
            <span className="cat-pill" onClick={() => setCurrentView('explore')}>⚡ Calculators & Electronics</span>
            <span className="cat-pill" onClick={() => setCurrentView('explore')}>🧪 Lab Aprons & Equipment</span>
            <span className="cat-pill" onClick={() => setCurrentView('explore')}>📐 Drafters & Stationery</span>
            <span className="cat-pill" onClick={() => setCurrentView('explore')}>🏸 Sports Gear</span>
          </div>
        </div>
      </section>

      {/* Illustrative Demo Statistics Section */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container" style={{ padding: '2rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <TrendingUp className="w-3.5 h-3.5 text-cyan" />
            <span>Illustrative Campus Demo Impact</span>
          </div>
          <div className="stats-grid" style={{ margin: '0' }}>
            <div className="stat-card">
              <div className="stat-value text-cyan">180+</div>
              <div className="stat-label">Active Campus Resources</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--status-available-text)' }}>₹1.4L+</div>
              <div className="stat-label">Estimated Student Savings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">450+</div>
              <div className="stat-label">Verified Peer Exchanges</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">14</div>
              <div className="stat-label">Engineering & Science Branches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resource Preview Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                Campus Essentials
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Featured Resources on Campus
              </h2>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentView('explore')}
            >
              <span>View All 16+ Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="resources-grid">
            {previewResources.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="resource-card"
                onClick={() => onSelectResource(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="resource-card-media">
                  <div className="resource-badges-top">
                    <span className="badge badge-cyan">{item.condition}</span>
                    <span className={`badge ${item.availability === 'Available' ? 'badge-available' : 'badge-borrowed'}`}>
                      {item.availability}
                    </span>
                  </div>
                  <div className="resource-media-icon">
                    <CategoryIcon category={item.category} itemType={item.itemType} className="w-12 h-12" />
                  </div>
                </div>

                <div className="resource-card-body">
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    {item.category}
                  </div>
                  <h3 className="resource-title" style={{ fontSize: '1rem' }}>
                    {item.name}
                  </h3>
                  <p className="resource-desc" style={{ fontSize: '0.82rem' }}>
                    {item.description}
                  </p>

                  <div className="resource-footer" style={{ marginTop: '0.75rem' }}>
                    <div className="resource-price">
                      {Number(item.dailyPrice) === 0 ? 'Free' : `₹${item.dailyPrice}/day`}
                    </div>
                    <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                      Request Item
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
            <div style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Simple 3-Step Process
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              How Campus Resource Sharing Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Connect with fellow students, reserve academic essentials for your semester, and return them safely when done.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Discover</h3>
              <p className="step-desc">
                Search the campus catalog for required course textbooks, drafters, scientific calculators, sensors, or lab coats. Filter by branch, condition, and availability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Request</h3>
              <p className="step-desc">
                Select your required loan duration and desired pickup date. The rental amount is calculated automatically in Indian Rupees (₹). Send your request to the student lender.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Share</h3>
              <p className="step-desc">
                Meet up at designated campus spots (Library, Hostel, or Department foyer) for handover. Mark the item returned once your practical exams or project concludes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action banner */}
      <section style={{ padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div
            style={{
              padding: '3rem 2rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--accent-cyan-border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              Have textbooks or equipment lying idle?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: '1.6' }}>
              Help your juniors and fellow peers while earning modest daily compensation or lending for free as community goodwill.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (isAuthenticated) {
                    setCurrentView('activity');
                  } else {
                    quickLoginDemo('student');
                    setCurrentView('dashboard');
                  }
                }}
              >
                <span>List an Item Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentView('explore')}
              >
                <span>Browse All Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
