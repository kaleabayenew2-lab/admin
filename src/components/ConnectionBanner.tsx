import React from 'react';
import { useConnection } from '../contexts/ConnectionContext';

export default function ConnectionBanner() {
  const { online, checking } = useConnection();
  if (online) return null;
  return (
    <div className="bg-red-600 text-white text-center py-2">
      <div className="container mx-auto">
        <span className="font-medium">You're offline — reconnecting{checking ? '…' : ''}</span>
      </div>
    </div>
  );
}
