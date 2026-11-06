import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CategoryIcon, ConditionBadge, StatusBadge } from './CategoryIcon';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export function ResourceDetailsModal({ resource, onClose, onRequestSuccess, onNavigateToRequests }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!resource) return null;

  const isOwner = user && user.id === resource.ownerId;
  const isAvailable = resource.availability === 'Available';
  const dailyPrice = Number(resource.dailyPrice) || 0;
  const totalCostINR = dailyPrice * days;

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await api.createRequest({
        resourceId: resource.id,
        days,
        startDate,
        notes
      });
      setSuccessMsg(res.message || 'Borrow request submitted successfully!');
      if (onRequestSuccess) {
        onRequestSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit borrow request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-cyan-subtle)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CategoryIcon category={resource.category} itemType={resource.itemType} className="w-5 h-5" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {resource.category}
              </div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>
                {resource.name}
              </h2>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} title="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle className="w-12 h-12 text-cyan" style={{ margin: '0 auto 1rem', color: 'var(--status-available-text)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Request Sent to Lender!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {resource.ownerName} has been notified. You can track this request and pickup coordinates from your dashboard.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                >
                  Close Window
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onClose();
                    if (onNavigateToRequests) onNavigateToRequests();
                  }}
                >
                  View in My Requests
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Badges Bar */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <ConditionBadge condition={resource.condition} />
                <StatusBadge status={resource.availability} />
                <span className="badge badge-cyan">
                  {dailyPrice === 0 ? 'Free to Borrow' : `₹${dailyPrice} / day`}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Resource Description
                </h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {resource.description}
                </p>
              </div>

              {/* Lender & Pickup Location */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.9rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.25rem',
                  fontSize: '0.84rem'
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <User className="w-3.5 h-3.5 text-cyan" />
                    <span>Lender Info</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resource.ownerName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>{resource.ownerDept}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <MapPin className="w-3.5 h-3.5 text-cyan" />
                    <span>Campus Pickup Point</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resource.location}</div>
                </div>
              </div>

              {/* Borrowing Terms */}
              <div
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid var(--accent-cyan-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <FileText className="w-4 h-4" />
                  <span>Borrowing Guidelines & Terms</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {resource.terms}
                </p>
              </div>

              {/* Request Form */}
              {isOwner ? (
                <div className="alert alert-info">
                  <ShieldAlert className="w-4 h-4" />
                  <span>You listed this resource. Manage incoming requests from your Dashboard.</span>
                </div>
              ) : !isAvailable ? (
                <div className="alert alert-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>This resource is currently marked as <strong>{resource.availability}</strong> and cannot accept new borrow requests.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest}>
                  <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                    Borrow Request Configuration
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">
                        <Clock className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                        Duration: <strong>{days} days</strong>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value, 10))}
                        style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>1 day</span>
                        <span>15 days</span>
                        <span>30 days</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">
                        <Calendar className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                        Required From
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rental Calculation Card */}
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Calculated Rental ({dailyPrice === 0 ? 'Free' : `₹${dailyPrice} × ${days} days`})
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {dailyPrice === 0 ? '₹0 (Free Sharing)' : `₹${totalCostINR}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div>Pay on campus handover</div>
                      <div style={{ color: 'var(--text-muted)' }}>No online gateway needed</div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message for Lender (Optional)</label>
                    <textarea
                      className="form-control"
                      placeholder="e.g. Need this for Lab practicals on Thursday. Can pick it up during lunch break."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="2"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting Request...' : `Confirm Request • ${dailyPrice === 0 ? 'Free' : `₹${totalCostINR}`}`}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
