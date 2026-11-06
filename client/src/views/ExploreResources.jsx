import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import { Search, Filter, SlidersHorizontal, RefreshCw, AlertCircle, Package } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Books and Notes',
  'Electronics',
  'Lab Equipment',
  'Stationery',
  'Sports Equipment',
  'Other'
];

export function ExploreResources({ onSelectResource, onOpenListModal }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [sort, setSort] = useState('newest');

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getResources({
        search,
        category,
        availability,
        sort
      });
      setResources(res.resources || []);
    } catch (err) {
      setError(err.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, availability, sort]);

  // Debounced search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Campus Resource Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse and reserve verified academic equipment, course books, and tools shared by college students.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenListModal}>
          + List an Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="filter-row">
          <div className="search-input-box">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by book name, equipment, calculator model, or student lender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Availability filter */}
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="All">All Availabilities</option>
            <option value="Available">Available Now</option>
            <option value="Free">Free to Borrow (₹0)</option>
            <option value="Borrowed">Currently Borrowed</option>
          </select>

          {/* Sort dropdown */}
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '160px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Sort: Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Sort: Title (A-Z)</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm" title="Search">
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchResources} style={{ marginLeft: 'auto' }}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <RefreshCw className="w-8 h-8 text-cyan animate-spin" style={{ margin: '0 auto 1rem' }} />
          <div>Loading campus resources...</div>
        </div>
      ) : resources.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            No Resources Matched Your Query
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Try adjusting your search terms, changing the category filter, or list this resource yourself to help peers!
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setAvailability('All');
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Resources Grid */
        <div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Showing <strong>{resources.length}</strong> items in campus catalog
          </div>

          <div className="resources-grid">
            {resources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onSelect={onSelectResource}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
