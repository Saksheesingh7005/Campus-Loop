import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, PlusCircle, AlertCircle, CheckCircle, Tag, DollarSign, MapPin, FileText } from 'lucide-react';

export function ListResourceModal({ isOpen, onClose, onResourceSaved, editingResource = null }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Books and Notes');
  const [condition, setCondition] = useState('Good');
  const [isFree, setIsFree] = useState(false);
  const [dailyPrice, setDailyPrice] = useState('20');
  const [location, setLocation] = useState('Campus Central Library');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('Handle with care. Return in original condition.');
  const [itemType, setItemType] = useState('book');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editingResource) {
      setName(editingResource.name || '');
      setCategory(editingResource.category || 'Books and Notes');
      setCondition(editingResource.condition || 'Good');
      const price = Number(editingResource.dailyPrice) || 0;
      setIsFree(price === 0);
      setDailyPrice(price.toString());
      setLocation(editingResource.location || '');
      setDescription(editingResource.description || '');
      setTerms(editingResource.terms || '');
      setItemType(editingResource.itemType || 'default');
    } else {
      setName('');
      setCategory('Books and Notes');
      setCondition('Good');
      setIsFree(false);
      setDailyPrice('20');
      setLocation('Campus Central Library');
      setDescription('');
      setTerms('Handle with care. Return in original condition.');
      setItemType('book');
    }
    setError('');
    setSuccess('');
  }, [editingResource, isOpen]);

  // Adjust default itemType when category changes
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'Books and Notes') setItemType('book');
    else if (newCat === 'Electronics') setItemType('electronics');
    else if (newCat === 'Lab Equipment') setItemType('lab');
    else if (newCat === 'Stationery') setItemType('stationery');
    else if (newCat === 'Sports Equipment') setItemType('sports');
    else setItemType('default');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!name.trim()) {
      setError('Please provide a title for the resource.');
      return;
    }

    const priceNum = isFree ? 0 : Math.max(0, Number(dailyPrice) || 0);

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        category,
        condition,
        dailyPrice: priceNum,
        location: location.trim() || 'Campus Main Library',
        description: description.trim() || 'No additional details provided.',
        terms: terms.trim() || 'Handle responsibly and return on time.',
        itemType
      };

      if (editingResource) {
        await api.updateResource(editingResource.id, payload);
        setSuccess('Listing updated successfully!');
      } else {
        await api.createResource(payload);
        setSuccess('Your item is now live on the Campus Marketplace!');
      }

      if (onResourceSaved) {
        onResourceSaved();
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save resource listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle className="w-5 h-5 text-cyan" />
            <h2 className="modal-title">
              {editingResource ? 'Edit Resource Listing' : 'List a Resource for Campus Sharing'}
            </h2>
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

          {success && (
            <div className="alert alert-success">
              <CheckCircle className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Resource Item Name *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Casio fx-991EX Calculator / Operating Systems Book"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="Books and Notes">Books and Notes</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Item Condition *</label>
                <select
                  className="form-control"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="Like New">Like New (Mint)</option>
                  <option value="Good">Good (Working nicely)</option>
                  <option value="Fair">Fair (Usable with signs of wear)</option>
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Rental Rate (INR ₹)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>Share for Free (₹0)</span>
                </label>
              </div>

              {!isFree && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem' }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required={!isFree}
                    className="form-control"
                    placeholder="25"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    style={{ maxWidth: '120px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>per day</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                Handover & Pickup Point on Campus *
              </label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Central Library 2nd Floor / Hostel 3 Common Room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brief Description</label>
              <textarea
                className="form-control"
                placeholder="Describe edition, specs, accessories, or any helpful context for your campus peers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText className="w-3.5 h-3.5" style={{ display: 'inline', marginRight: '4px' }} />
                Borrowing Terms & Conditions
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Valid college ID card required. Return before exam week."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? 'Saving Listing...'
                : editingResource
                ? 'Update Resource Listing'
                : 'Publish to Marketplace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
