import React from 'react';
import { Link } from 'react-router-dom';

export default function LegalAndTrust() {
  const items = [
    { id: 24, title: 'Privacy Policy', path: '/privacy' },
    { id: 25, title: 'Terms & Conditions', path: '/terms' },
    { id: 26, title: 'Cookie Consent', path: '/cookie-consent' },
    { id: 27, title: 'Contact Page', path: '/contact' },
    { id: 28, title: 'About Page', path: '/about' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Legal & Trust</h2>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="flex items-center">
            <span className="mr-3">✅</span>
            <Link to={i.path} className="text-blue-600 hover:underline">{i.id}. {i.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
