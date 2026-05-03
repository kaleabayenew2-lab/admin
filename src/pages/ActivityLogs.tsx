import React from 'react';

export default function ActivityLogs(){
  const sample = [
    { id: 1, ts: '2026-02-14T07:45:00Z', user: 'admin@example.com', action: 'Logged in' },
    { id: 2, ts: '2026-02-14T08:10:12Z', user: 'editor@example.com', action: 'Updated facility details' }
  ];
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Activity logs</h2>
      <div className="space-y-2">
        {sample.map(s => (
          <div key={s.id} className="p-3 border rounded">
            <div className="text-xs text-gray-500">{s.ts} — {s.user}</div>
            <div className="text-sm">{s.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
