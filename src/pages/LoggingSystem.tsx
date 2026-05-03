import React from 'react';
import { Link } from 'react-router-dom';

export default function LoggingSystem() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Logging System</h2>
      <ul className="space-y-2">
        <li><Link to="/logs/errors" className="text-blue-600 hover:underline">Error logs</Link></li>
        <li><Link to="/logs/activity" className="text-blue-600 hover:underline">Activity logs</Link></li>
      </ul>
      <p className="mt-4 text-sm text-gray-600">Click a log type to view sample entries. Replace with real log viewer or integrate with your backend logging service.</p>
    </div>
  );
}
