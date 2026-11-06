import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge, CategoryIcon } from '../components/CategoryIcon';
import {
  Clock,
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export function MyActivity({ onOpenListModal, onEditResource, onOpenChat }) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'listings'
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const [reqRes, listRes] = await Promise.all([
        api.getRequests({ borrowerId: user.id }),
        api.getResources({ ownerId: user.id })
      ]);
      setRequests(reqRes.requests || []);
      setListings(listRes.resources || []);
    } catch (err) {
      setError(err.message || 'Error loading activity data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Request transitions
  const handleRequestStatusChange = async (requestId, targetStatus) => {
    setMsg('');
    setError('');
    try {
      const res = await api.updateRequestStatus(requestId, targetStatus);
      setMsg(res.message || `Status updated to ${targetStatus}`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };

  // Delete listing
  const handleDeleteListing = async (resourceId) => {
    if (!window.confirm('Are you sure you want to remove this resource listing from the campus marketplace?')) {
      return;
    }
    setMsg('');
    setError('');
    try {
      const res = await api.deleteResource(resourceId);
      setMsg(res.message || 'Listing removed successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete listing.');
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Please log in to view your requests and listings.</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            My Campus Activity
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Manage your outgoing borrow requests, equipment loans, and listed campus inventory.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenListModal}>
          <PlusCircle className="w-4 h-4" />
          <span>List New Item</span>
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

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Clock className="w-4 h-4" />
          <span>My Borrow Requests ({requests.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          <Layers className="w-4 h-4" />
          <span>My Resource Listings ({listings.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <RefreshCw className="w-6 h-6 text-cyan animate-spin" style={{ margin: '0 auto 0.75rem' }} />
          <div>Loading activity records...</div>
        </div>
      ) : activeTab === 'requests' ? (
        /* MY REQUESTS TAB */
        <div>
          {requests.length === 0 ? (
            <div className="empty-state">
              <Clock className="empty-state-icon" />
              <h3>No Borrow Requests Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                You haven't requested any items yet. Search the catalog for reference books, electronics, or lab gear.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="crs-table">
                <thead>
                  <tr>
                    <th>Resource Name</th>
                    <th>Request Date</th>
                    <th>Requested Duration</th>
                    <th>Estimated Cost (INR)</th>
                    <th>Current Status</th>
                    <th>Lender & Pickup</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ color: 'var(--text-primary)' }}>{req.resourceName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{req.resourceCategory}</div>
                      </td>
                      <td>{req.requestDate}</td>
                      <td>
                        <strong>{req.days} days</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {req.startDate}</div>
                      </td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.98rem' }}>
                        {req.totalCost === 0 ? 'Free' : `₹${req.totalCost}`}
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td>
                        <div>{req.ownerName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{req.pickupLocation}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => onOpenChat && onOpenChat(req)}
                            title="Chat with lender to coordinate pickup"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>

                          {req.status === 'pending' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRequestStatusChange(req.id, 'cancelled')}
                              title="Cancel this pending request"
                            >
                              Cancel
                            </button>
                          )}
                          {req.status === 'approved' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleRequestStatusChange(req.id, 'borrowed')}
                              title="Confirm physical pickup from lender"
                            >
                              Confirm Pickup
                            </button>
                          )}
                          {req.status === 'borrowed' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRequestStatusChange(req.id, 'returned')}
                              title="Mark item returned back to owner"
                            >
                              Mark Returned
                            </button>
                          )}
                          {['returned', 'rejected', 'cancelled'].includes(req.status) && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
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
      ) : (
        /* MY LISTINGS TAB */
        <div>
          {listings.length === 0 ? (
            <div className="empty-state">
              <Layers className="empty-state-icon" />
              <h3>You Have Not Listed Any Items</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Share your spare textbooks, lab goggles, or drafters with fellow students.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onOpenListModal}>
                + Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="crs-table">
                <thead>
                  <tr>
                    <th>Item Title</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th>Daily Rate</th>
                    <th>Availability</th>
                    <th>Pickup Point</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className="badge badge-condition">{item.condition}</span>
                      </td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {Number(item.dailyPrice) === 0 ? 'Free' : `₹${item.dailyPrice}/day`}
                      </td>
                      <td>
                        <StatusBadge status={item.availability} />
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item.location}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onEditResource(item)}
                            title="Edit listing details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteListing(item.id)}
                            title="Delete this listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
