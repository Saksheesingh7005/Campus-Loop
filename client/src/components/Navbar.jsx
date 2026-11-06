import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Share2,
  LogIn,
  UserPlus,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Shield,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export function Navbar({ currentView, setCurrentView, onOpenListModal }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal, quickLoginDemo } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleNav = (viewId) => {
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <div className="container navbar-content">
        {/* Brand Logo */}
        <a
          href="#home"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            handleNav('landing');
          }}
        >
          <div className="brand-icon-box">
            <Share2 className="w-5 h-5 text-cyan" />
          </div>
          <span>Campus Resource Sharing</span>
        </a>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => handleNav('landing')}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentView === 'explore' ? 'active' : ''}`}
            onClick={() => handleNav('explore')}
          >
            Explore Resources
          </button>
          <button
            className="nav-link"
            onClick={() => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
                setTimeout(() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            How It Works
          </button>

          {isAuthenticated && !isAdmin && (
            <>
              <button
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${currentView === 'activity' ? 'active' : ''}`}
                onClick={() => handleNav('activity')}
              >
                My Requests & Listings
              </button>
            </>
          )}

          {isAdmin && (
            <button
              className={`nav-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNav('admin')}
            >
              Admin Dashboard
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={onOpenListModal}
                title="List a new resource"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List an Item</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem'
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-cyan-subtle)',
                      color: isAdmin ? '#f87171' : 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.72rem'
                    }}
                  >
                    {user.avatar || 'US'}
                  </span>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {isAdmin ? 'Administrator' : user.department ? user.department.split('&')[0].trim() : 'Student'}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={logout}
                  title="Log out of prototype"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Quick Demo Switcher Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowDemoMenu(!showDemoMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan" />
                  <span>Try Demo</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showDemoMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.4rem',
                      width: '210px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      zIndex: 60
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '0.5rem' }}
                      onClick={async () => {
                        await quickLoginDemo('student');
                        setShowDemoMenu(false);
                        setCurrentView('dashboard');
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Student Demo</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aarav Sharma (CSE 3rd Yr)</div>
                      </div>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', padding: '0.5rem' }}
                      onClick={async () => {
                        await quickLoginDemo('admin');
                        setShowDemoMenu(false);
                        setCurrentView('admin');
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>Admin Demo</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dr. S. K. Raman (Dean)</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => openAuthModal('login')}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => openAuthModal('register')}
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
