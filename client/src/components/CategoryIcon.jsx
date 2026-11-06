import React from 'react';
import {
  BookOpen,
  Cpu,
  FlaskConical,
  PenTool,
  Trophy,
  Package,
  Calculator,
  Laptop,
  Zap,
  Wrench
} from 'lucide-react';

export function CategoryIcon({ category, itemType, className = 'w-6 h-6' }) {
  // First check itemType specific icon if available
  if (itemType === 'calculator') return <Calculator className={className} />;
  if (itemType === 'laptop') return <Laptop className={className} />;
  if (itemType === 'charger') return <Zap className={className} />;
  if (itemType === 'tools') return <Wrench className={className} />;
  if (itemType === 'lab') return <FlaskConical className={className} />;
  if (itemType === 'book') return <BookOpen className={className} />;
  if (itemType === 'sports') return <Trophy className={className} />;
  if (itemType === 'stationery') return <PenTool className={className} />;

  // Match by category
  switch (category) {
    case 'Books and Notes':
      return <BookOpen className={className} />;
    case 'Electronics':
      return <Cpu className={className} />;
    case 'Lab Equipment':
      return <FlaskConical className={className} />;
    case 'Stationery':
      return <PenTool className={className} />;
    case 'Sports Equipment':
      return <Trophy className={className} />;
    default:
      return <Package className={className} />;
  }
}

export function CategoryBadge({ category }) {
  return (
    <span className="badge badge-condition">
      <CategoryIcon category={category} className="w-3.5 h-3.5" />
      {category}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  let color = 'badge-condition';
  if (condition === 'Like New') color = 'badge-cyan';
  return <span className={`badge ${color}`}>{condition}</span>;
}

export function StatusBadge({ status }) {
  let badgeClass = 'badge-pending';
  let label = status;

  if (status === 'Available') {
    badgeClass = 'badge-available';
    label = 'Available';
  } else if (status === 'pending') {
    badgeClass = 'badge-pending';
    label = 'Request Pending';
  } else if (status === 'approved' || status === 'Reserved (Approved)') {
    badgeClass = 'badge-cyan';
    label = 'Approved / Ready';
  } else if (status === 'borrowed' || status === 'Borrowed') {
    badgeClass = 'badge-borrowed';
    label = 'Borrowed';
  } else if (status === 'returned') {
    badgeClass = 'badge-returned';
    label = 'Returned';
  } else if (status === 'cancelled') {
    badgeClass = 'badge-cancelled';
    label = 'Cancelled';
  } else if (status === 'rejected') {
    badgeClass = 'badge-rejected';
    label = 'Rejected';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
}
