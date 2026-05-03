import React from 'react';

export default function ErrorLogs(){
  const sample = [
    { id: 1, ts: '2026-02-14T08:21:00Z', message: 'Database connection timeout' },
    { id: 2, ts: '2026-02-14T09:02:33Z', message: 'Unhandled exception in /api/facilities' }
  ];
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Error logs</h2>
      <div className="space-y-2">
        {sample.map(s => (
          <div key={s.id} className="p-3 border rounded">
            <div className="text-xs text-gray-500">{s.ts}</div>
            <div className="text-sm">{s.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
