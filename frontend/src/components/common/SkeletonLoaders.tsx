import React from 'react';

interface SkeletonCardProps {
  count?: number;
  columns?: number;
}

/**
 * SkeletonCard - Reusable skeleton loader for card components
 * Creates animated placeholder while content loads
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, columns = 3 }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
          
          {/* Title placeholder */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
          
          {/* Description lines */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          
          {/* Footer placeholder */}
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded flex-1" />
            <div className="h-10 bg-gray-200 rounded flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonTable - Skeleton loader for table/list components
 */
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-gray-50">
        <div className="h-6 bg-gray-200 rounded w-1/6" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b last:border-b-0">
          <div className="h-5 bg-gray-200 rounded w-1/6" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonListItem - Skeleton loader for list items
 */
export const SkeletonListItem: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg shadow animate-pulse">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          
          {/* Content placeholders */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
          
          {/* Action placeholder */}
          <div className="h-10 bg-gray-200 rounded w-20 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonText - Generic text skeleton loader
 */
export const SkeletonText: React.FC<{ lines?: number; maxWidth?: string }> = ({
  lines = 3,
  maxWidth = 'w-full',
}) => {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-4/5' : maxWidth}`}
        />
      ))}
    </div>
  );
};
