import React from 'react';
import { CategoryIcon, ConditionBadge, StatusBadge } from './CategoryIcon';
import { MapPin, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export function ResourceCard({ resource, onSelect, onBorrowDirect }) {
  const isAvailable = resource.availability === 'Available';
  const isFree = Number(resource.dailyPrice) === 0;

  return (
    <div className="resource-card">
      {/* Media Header with Icon */}
      <div className="resource-card-media">
        <div className="resource-badges-top">
          <ConditionBadge condition={resource.condition} />
          <StatusBadge status={resource.availability} />
        </div>
        <div className="resource-media-icon">
          <CategoryIcon
            category={resource.category}
            itemType={resource.itemType}
            className="w-12 h-12"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="resource-card-body">
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
          {resource.category}
        </div>

        <h3 className="resource-title" title={resource.name}>
          {resource.name}
        </h3>

        <p className="resource-desc" title={resource.description}>
          {resource.description}
        </p>

        {/* Metadata: Lender & Location */}
        <div className="resource-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={`Lender: ${resource.ownerName}`}>
            <User className="w-3.5 h-3.5 text-cyan" />
            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {resource.ownerName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} title={`Location: ${resource.location}`}>
            <MapPin className="w-3.5 h-3.5" />
            <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {resource.location ? resource.location.split('/')[0].trim() : 'Campus'}
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="resource-footer">
          <div className="resource-price">
            {isFree ? (
              <span style={{ color: 'var(--status-available-text)' }}>Free</span>
            ) : (
              <>
                ₹{resource.dailyPrice}
                <small>/day</small>
              </>
            )}
          </div>

          <button
            className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSelect(resource)}
          >
            <span>{isAvailable ? 'Request' : 'Details'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
