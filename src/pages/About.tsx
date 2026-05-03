import React from 'react';
import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">About</h1>
        <p className="mt-4 text-gray-600">FindMed admin portal — manage facilities, content, ads and support.</p>
      </div>
    </Layout>
  );
}
