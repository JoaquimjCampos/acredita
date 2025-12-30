import React from 'react';

interface ActivityBadgeProps {
  count: number;
  className?: string;
  showZero?: boolean;
}

/**
 * ActivityBadge Component
 * 
 * Shows notification badge with count of new activities
 * Appears on navigation links when user has unread activity
 * 
 * Props:
 * - count: Number of unread activities (0 = hidden)
 * - className: Additional Tailwind classes
 * - showZero: Force show badge even when count is 0 (default: false)
 */
const ActivityBadge: React.FC<ActivityBadgeProps> = ({
  count,
  className = '',
  showZero = false
}) => {
  // Hide badge if no unread and showZero is false
  if (count === 0 && !showZero) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[1.5rem] ${className}`}
      title={`${count} novas atividades`}
    >
      {displayCount}
    </span>
  );
};

export default ActivityBadge;
