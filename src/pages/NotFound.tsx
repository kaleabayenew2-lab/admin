import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-600 mb-4">The page you're looking for doesn't exist or hasn't been created yet.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded">Go to dashboard</Link>
          <Link to="/help" className="px-4 py-2 border rounded">Help</Link>
        </div>
      </div>
    </div>
  );
}
