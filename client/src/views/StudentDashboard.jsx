import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge, CategoryIcon } from '../components/CategoryIcon';
import {
  Layers,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Calendar,
  BookOpen,
  DollarSign,
  TrendingUp,
  Inbox,
  MessageSquare
} from 'lucide-react';

export function StudentDashboard({ setCurrentView, onOpenListModal, onSelectResource, onOpenChat }) {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const [statsRes, myReqRes, incomingReqRes, listingsRes] = await Promise.all([
        api.getStats(),
        api.getRequests({ borrowerId: user.id }),
        api.getRequests({ ownerId: user.id }),
        api.getResources({ ownerId: user.id })
      ]);

      setStats(statsRes.stats);
      setMyRequests(myReqRes.requests || []);
      setIncomingRequests(incomingReqRes.requests || []);
      setMyListings(listingsRes.resources || []);
    } catch (err) {
      setErrorMsg(err.message || 'Error loading dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle request lifecycle transitions
  const handleTransition = async (requestId, targetStatus) => {
    setActionMsg('');
    setErrorMsg('');
    try {
      const res = await api.updateRequestStatus(requestId, targetStatus);
      setActionMsg(res.message || `Request status updated to ${targetStatus}`);
      await loadDashboardData();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.');
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Please log in to view your Student Dashboard.</h2>
      </div>
    );
  }

  const activeBorrows = myRequests.filter((r) => ['pending', 'approved', 'borrowed'].includes(r.status));
  const pendingIncoming = incomingRequests.filter((r) => r.status === 'pending');

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #101726 0%, #152238 100%)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              STUDENT DASHBOARD
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {user.department || 'Campus Student'} ({user.year || '3rd Year'})
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user.name} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
            College ID: <code>{user.email}</code>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onOpenListModal}>
            <PlusCircle className="w-4 h-4" />
            <span>List an Item</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setCurrentView('explore')}>
            <span>Browse Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginTop: 0, marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-value text-cyan">
            {stats ? stats.availableResources : '...'}
          </div>
          <div className="stat-label">Available on Campus</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {activeBorrows.length}
          </div>
          <div className="stat-label">My Active Borrow Requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#38bdf8' }}>
            {myListings.length}
          </div>
          <div className="stat-label">Items I Have Listed</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--status-available-text)' }}>
            ₹{stats ? stats.totalSavedINR : '...'}
          </div>
          <div className="stat-label">Community Savings (INR)</div>
        </div>
      </div>

      {/* Grid: 2 columns for Incoming Requests on My Items & Active Borrows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Incoming Requests on My Items (Student can Approve / Reject here) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox className="w-5 h-5 text-cyan" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Incoming Requests on My Items ({pendingIncoming.length} Pending)
              </h2>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentView('activity')}
            >
              <span>Manage Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '1rem 0' }}>
              No students have requested your items yet. List more college essentials to help your campus community!
            </p>
          ) : (
            <div className="table-container">
              <table className="crs-table">
                <thead>
                  <tr>
                    <th>Item Requested</th>
                    <th>Borrower</th>
                    <th>Duration & Cost</th>
                    <th>Date Needed</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.resourceName}</td>
                      <td>
                        <div>{req.borrowerName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{req.borrowerDept}</div>
                      </td>
                      <td>
                        {req.days} days •{' '}
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          {req.totalCost === 0 ? 'Free' : `₹${req.totalCost}`}
                        </strong>
                      </td>
                      <td>{req.startDate}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenChat && onOpenChat(req)}
                            title="Open coordination chat with borrower"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          {req.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleTransition(req.id, 'approved')}
                                title="Approve borrow request"
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleTransition(req.id, 'rejected')}
                                title="Reject borrow request"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransition(req.id, 'borrowed')}
                              title="Confirm student collected the item"
                            >
                              Mark Handed Over
                            </button>
                          )}
                          {req.status === 'borrowed' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleTransition(req.id, 'returned')}
                              title="Confirm item was safely returned"
                            >
                              Mark Returned
                            </button>
                          )}
                          {['returned', 'rejected', 'cancelled'].includes(req.status) && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* My Active Borrows & Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock className="w-5 h-5 text-cyan" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Items I Am Borrowing / Requested
              </h2>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentView('activity')}
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '1rem' }}>You haven't requested any items yet.</p>
              <button className="btn btn-outline btn-sm" onClick={() => setCurrentView('explore')}>
                Explore Campus Catalog
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="crs-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Lender & Location</th>
                    <th>Duration</th>
                    <th>Estimated Cost</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.slice(0, 5).map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.resourceName}</td>
                      <td>
                        <div>{req.ownerName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{req.pickupLocation}</div>
                      </td>
                      <td>{req.days} days</td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {req.totalCost === 0 ? 'Free' : `₹${req.totalCost}`}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenChat && onOpenChat(req)}
                            title="Chat with lender"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          {req.status === 'pending' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleTransition(req.id, 'cancelled')}
                              title="Cancel this request"
                            >
                              Cancel
                            </button>
                          )}
                          {req.status === 'approved' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransition(req.id, 'borrowed')}
                              title="Mark as collected"
                            >
                              Confirm Pickup
                            </button>
                          )}
                          {req.status === 'borrowed' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleTransition(req.id, 'returned')}
                              title="Mark as returned to lender"
                            >
                              Mark Returned
                            </button>
                          )}
                          {['returned', 'rejected', 'cancelled'].includes(req.status) && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Finished</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
