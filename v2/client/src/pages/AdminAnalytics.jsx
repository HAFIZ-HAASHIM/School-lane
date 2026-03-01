import React from 'react';
import Layout from '../components/Layout';

export default function AdminAnalytics() {
  return (
    <Layout breadcrumbs={['Admin', 'Analytics & Reports']}>
      <main className="p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-6">Analytics & Reports</h1>
        <div className="glass-card p-8 flex items-center justify-center min-h-[400px]">
          <p className="text-textSecondary text-lg">Analytics & Reports module is currently under construction.</p>
        </div>
      </main>
    </Layout>
  );
}
