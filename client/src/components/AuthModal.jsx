import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, LogIn, UserPlus, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    quickLoginDemo
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, department, year });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (type) => {
    setError('');
    setLoading(true);
    try {
      await quickLoginDemo(type);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              className={`tab-btn ${authModalTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalTab('login');
                setError('');
              }}
              style={{ paddingBottom: '0.4rem' }}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button
              className={`tab-btn ${authModalTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalTab('register');
                setError('');
              }}
              style={{ paddingBottom: '0.4rem' }}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={closeAuthModal} title="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Switcher Section */}
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              <Sparkles className="w-4 h-4" />
              <span>One-Click Demo Access</span>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.8rem' }}
                onClick={() => handleDemoFill('student')}
                disabled={loading}
              >
                Student: Aarav (CSE)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
                onClick={() => handleDemoFill('admin')}
                disabled={loading}
              >
                Admin: Dr. Raman
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Credentials: <code>aarav@campus.edu</code> (pass: <code>password123</code>) | Admin: <code>admin@campus.edu</code> (pass: <code>adminpassword</code>)
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {authModalTab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Rahul Dev"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-control"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Mechanical Engineering">Mechanical</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Civil Engineering">Civil</option>
                      <option value="Management Studies">MBA / Management</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <select
                      className="form-control"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">College Email Address *</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="rollnumber@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : authModalTab === 'login'
                ? 'Sign In to Campus Portal'
                : 'Complete Registration'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldAlert className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            Prototype security notice: Demo authentication for evaluation only.
          </div>
        </div>
      </div>
    </div>
  );
}
