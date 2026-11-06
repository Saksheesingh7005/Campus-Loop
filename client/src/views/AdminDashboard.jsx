import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge, CategoryBadge } from '../components/CategoryIcon';
import {
  Shield,
  Layers,
  Inbox,
  Users,
  RotateCcw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';

export function AdminDashboard({ onOpenChat }) {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'resources' | 'students'
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, reqRes, resRes, usersRes] = await Promise.all([
        api.getStats(),
        api.getRequests(),
        api.getResources(),
        api.getDemoUsers()
      ]);

      setStats(statsRes.stats);
      setRequests(reqRes.requests || []);
      setResources(resRes.resources || []);
      setDemoUsers(usersRes.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusTransition = async (requestId, targetStatus) => {
    setMsg('');
    setError('');
    try {
      const res = await api.updateRequestStatus(requestId, targetStatus);
      setMsg(res.message || `Request status updated to ${targetStatus}`);
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Transition failed.');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Admin action: Remove this resource listing?')) return;
    setMsg('');
    setError('');
    try {
      const res = await api.deleteResource(resourceId);
      setMsg(res.message || 'Resource deleted by admin.');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo data back to the clean 16 seed resources and requests?')) return;
    setLoading(true);
    try {
      await api.resetDemoData();
      setMsg('Prototype database successfully reset to clean seed state!');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <Shield className="w-12 h-12 text-cyan" style={{ margin: '0 auto 1rem' }} />
        <h2>Administrator Access Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Please log in with the administrator demo account (<code>admin@campus.edu</code>) to view this console.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Admin Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield className="w-5 h-5" style={{ color: '#f87171' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', letterSpacing: '0.05em' }}>
              ADMINISTRATIVE DEMO CONSOLE
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Office of Student Affairs & Campus Assets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Administrator: {user.name} ({user.department})
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleResetData}
          title="Restore prototype seed state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {msg && (
        <div className="alert alert-success">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="stats-grid" style={{ marginTop: 0, marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value text-cyan">{stats?.totalResources || 0}</div>
          <div className="stat-label">Total Listed Resources</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#fbbf24' }}>{stats?.activeRequests || 0}</div>
          <div className="stat-label">Active / Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#34d399' }}>{stats?.completedBorrows || 0}</div>
          <div className="stat-label">Completed Returns</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#a5b4fc' }}>{demoUsers.length}</div>
          <div className="stat-label">Registered Accounts</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Inbox className="w-4 h-4" />
          <span>All Campus Requests ({requests.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <Layers className="w-4 h-4" />
          <span>All Resources Catalog ({resources.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory ({demoUsers.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <RefreshCw className="w-6 h-6 text-cyan animate-spin" style={{ margin: '0 auto 0.75rem' }} />
          <div>Refreshing campus records...</div>
        </div>
      ) : activeTab === 'requests' ? (
        /* REQUESTS MANAGEMENT */
        <div className="table-container">
          <table className="crs-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Borrower</th>
                <th>Lender</th>
                <th>Duration & Cost</th>
                <th>Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.resourceName}</td>
                  <td>
                    <div>{r.borrowerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.borrowerDept}</div>
                  </td>
                  <td>{r.ownerName}</td>
                  <td>
                    {r.days} days • <strong style={{ color: 'var(--accent-cyan)' }}>₹{r.totalCost}</strong>
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenChat && onOpenChat(r)}
                        title="View coordination chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      {r.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusTransition(r.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusTransition(r.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStatusTransition(r.id, 'borrowed')}
                        >
                          Confirm Handover
                        </button>
                      )}
                      {r.status === 'borrowed' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStatusTransition(r.id, 'returned')}
                        >
                          Mark Returned
                        </button>
                      )}
                      {['returned', 'rejected', 'cancelled'].includes(r.status) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'resources' ? (
        /* RESOURCES INVENTORY */
        <div className="table-container">
          <table className="crs-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Daily Price</th>
                <th>Lender</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 600 }}>{res.name}</td>
                  <td>
                    <CategoryBadge category={res.category} />
                  </td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    {Number(res.dailyPrice) === 0 ? 'Free' : `₹${res.dailyPrice}/day`}
                  </td>
                  <td>
                    <div>{res.ownerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{res.location}</div>
                  </td>
                  <td>
                    <StatusBadge status={res.availability} />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteResource(res.id)}
                      title="Admin remove inappropriate or damaged listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* STUDENTS DIRECTORY */
        <div className="table-container">
          <table className="crs-table">
            <thead>
              <tr>
                <th>User / Student</th>
                <th>Email (Campus ID)</th>
                <th>Department</th>
                <th>Academic Year</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {demoUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: u.role === 'admin' ? 'rgba(239,68,68,0.2)' : 'var(--accent-cyan-subtle)',
                          color: u.role === 'admin' ? '#f87171' : 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {u.avatar || 'ST'}
                      </span>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <code>{u.email}</code>
                  </td>
                  <td>{u.department}</td>
                  <td>{u.year || 'N/A'}</td>
                  <td>
                    <span
                      className={`badge ${u.role === 'admin' ? 'badge-cancelled' : 'badge-cyan'}`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
