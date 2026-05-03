import React from 'react';
import NavBar from '../components/NavBar';

export default function TelegramPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Telegram Bot</h1>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <p>Bot status: <strong>Not connected</strong></p>
          <button className="mt-4 bg-blue-600 text-white px-3 py-2 rounded">Reconnect Bot</button>
        </div>
      </main>
    </div>
  );
}
