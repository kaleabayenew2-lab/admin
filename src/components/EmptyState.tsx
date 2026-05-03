import React from 'react';

export default function EmptyState({
  title = 'No data found',
  subtitle = '',
  small = false,
}: {
  title?: string;
  subtitle?: string;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center p-4 ${small ? 'text-sm' : 'text-base'}`}>
      <div className="text-center text-gray-500">
        <div className="mb-2 text-2xl" role="img" aria-label={title}>⚠️</div>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
