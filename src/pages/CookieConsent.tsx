import React from 'react';

export default function CookieConsent() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Cookie Consent</h2>
      <p className="text-sm text-gray-700">This page explains how cookies are used on the site and how users can manage them.</p>
      <ul className="list-disc ml-5 mt-3 text-sm text-gray-600">
        <li>Essential cookies for site operation</li>
        <li>Analytics cookies (optional)</li>
        <li>Third-party cookies</li>
      </ul>
    </div>
  );
}
