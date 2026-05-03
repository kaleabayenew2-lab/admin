import React from 'react';

export default function Loading({ visible = true, text = 'Loading…' }: { visible?: boolean; text?: string }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-72 text-center">
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <div className="mt-4">
          <div className="text-lg font-semibold">{text}</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we load data.</div>
        </div>
      </div>
    </div>
  );
}
