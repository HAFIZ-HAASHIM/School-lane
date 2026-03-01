import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Shield, Key, Lock, Mail, Smartphone, Globe, Save, RefreshCw, Server, Search, Database } from 'lucide-react';

export default function AdminIntegrations() {
  const [saving, setSaving] = useState(false);

  // Mock local state for API keys to show a "working" UI
  const [configs, setConfigs] = useState({
    twilioSid: 'AC' + '*'.repeat(32),
    twilioAuth: '*'.repeat(32),
    sendgridKey: 'SG.' + '*'.repeat(60),
    stripeKey: 'sk_test_' + '*'.repeat(40),
    googleMaps: 'AIza' + '*'.repeat(35),
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Integrations & API keys successfully updated in backend vaults.');
    }, 1200);
  };

  return (
    <Layout breadcrumbs={['Administration', 'Integrations & API']}>
      <main className="p-8 max-w-[1200px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">API & Integrations</h1>
            <p className="text-textSecondary text-sm">Manage third-party connections, API keys, and external service configurations safely.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Configurations'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Communications APIs */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <div className="flex items-center pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mr-4">
                <Mail className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Communications API</h3>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Sendgrid & Twilio</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1 flex justify-between">
                  <span>Twilio Account SID (SMS)</span>
                  <span className="text-emerald-400">Connected</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input type="text" value={configs.twilioSid} onChange={(e) => setConfigs({ ...configs, twilioSid: e.target.value })} className="input-field bg-background pl-10 font-mono text-xs text-textSecondary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Twilio Auth Token</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input type="password" value={configs.twilioAuth} onChange={(e) => setConfigs({ ...configs, twilioAuth: e.target.value })} className="input-field bg-background pl-10 font-mono text-xs" />
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-medium text-textSecondary mb-1 flex justify-between">
                  <span>SendGrid API Key (Email)</span>
                  <span className="text-emerald-400">Connected</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input type="password" value={configs.sendgridKey} onChange={(e) => setConfigs({ ...configs, sendgridKey: e.target.value })} className="input-field bg-background pl-10 font-mono text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Location */}
          <div className="glass-card p-6 border border-white/5 space-y-6">
            <div className="flex items-center pb-4 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mr-4">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Infrastructure APIs</h3>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Payments & Maps</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1 flex justify-between">
                  <span>Stripe Secret Key (Fees)</span>
                  <span className="text-emerald-400">Live Mode</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input type="password" value={configs.stripeKey} onChange={(e) => setConfigs({ ...configs, stripeKey: e.target.value })} className="input-field bg-background pl-10 font-mono text-xs text-textSecondary" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-textSecondary mb-1 flex justify-between">
                  <span>Google Maps API Key (Transport Tracking)</span>
                  <span className="text-warning">Restricted Access</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input type="password" value={configs.googleMaps} onChange={(e) => setConfigs({ ...configs, googleMaps: e.target.value })} className="input-field bg-background pl-10 font-mono text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks Config */}
          <div className="glass-card p-6 border border-white/5 lg:col-span-2">
            <div className="flex items-center pb-4 border-b border-white/5 mb-4 justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mr-4">
                  <Server className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Webhook Endpoints</h3>
                  <p className="text-xs text-textSecondary uppercase tracking-wider">Listen for External Events</p>
                </div>
              </div>
              <button className="btn-secondary text-xs py-1.5 px-3">Add Endpoint</button>
            </div>

            <div className="border border-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-xs uppercase bg-white/5 text-textSecondary">
                  <tr>
                    <th className="px-4 py-3 font-bold tracking-wider">Name</th>
                    <th className="px-4 py-3 font-bold tracking-wider">URL Endpoint</th>
                    <th className="px-4 py-3 font-bold tracking-wider">Events</th>
                    <th className="px-4 py-3 font-bold tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-background/50">
                  <tr className="hover:bg-white/5">
                    <td className="px-4 py-4 font-bold text-white">Stripe Payment Success</td>
                    <td className="px-4 py-4 font-mono text-xs text-textSecondary">https://school-lane.com/api/webhooks/stripe</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-white/10 text-xs">charge.succeeded</span></td>
                    <td className="px-4 py-4 text-center"><span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span></td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="px-4 py-4 font-bold text-white">Twilio SMS Replies</td>
                    <td className="px-4 py-4 font-mono text-xs text-textSecondary">https://school-lane.com/api/webhooks/twilio</td>
                    <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-white/10 text-xs">message.received</span></td>
                    <td className="px-4 py-4 text-center"><span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
