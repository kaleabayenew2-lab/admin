import React from 'react';
import Layout from '../components/Layout';

export default function Help() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Help</h1>
        <p className="mt-4 text-gray-600">See the documentation or reach out via the Contact page for assistance.</p>
      </div>
    </Layout>
  );
}
