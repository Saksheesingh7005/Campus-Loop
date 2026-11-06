import React from 'react';
import { Share2, Heart, ShieldCheck } from 'lucide-react';

export function Footer({ setCurrentView }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div style={{ maxWidth: '380px' }}>
            <div className="brand-logo" style={{ marginBottom: '0.85rem' }}>
              <div className="brand-icon-box">
                <Share2 className="w-5 h-5 text-cyan" />
              </div>
              <span>Campus Resource Sharing</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Empowering college students to discover, borrow, and lend essential academic textbooks, lab equipment, electronics, and sports items safely within our campus community.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.85rem' }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </a>
              <a
                href="#explore"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Explore Resources
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView('landing');
                  setTimeout(() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                How It Works
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.85rem' }}>Resource Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>Books & Notes</span>
              <span>Electronics & Calculators</span>
              <span>Lab Coats & Scientific Tools</span>
              <span>Engineering Stationery</span>
              <span>Sports Equipment</span>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="footer-disclaimer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            <ShieldCheck className="w-4 h-4 text-cyan" />
            <span>Campus Resource Sharing — Academic Demonstration Prototype</span>
          </div>
          <div>
            Notice: This application is a prototype built for demonstration and evaluation purposes. Not for production financial transactions. Student names and listings are fictional demo seed data. Rental rates are formatted in Indian Rupees (₹) for realistic context.
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Campus Resource Sharing Prototype. Built with React & Express.
        </div>
      </div>
    </footer>
  );
}
