import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Settings, Shield, Globe, Bell, Palette, Save, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);

  // Global Settings State
  const [settings, setSettings] = useState({
    schoolName: 'School Lane International',
    contactEmail: 'admin@school-lane.com',
    academicYear: '2024-2025',
    currency: 'USD ($)',
    timezone: 'America/New_York',
    allowStudentRegistration: false,
    require2FA: true,
    maintenanceMode: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Global system settings updated successfully.');
    }, 1000);
  };

  return (
    <Layout breadcrumbs={['Administration', 'Security & Settings']}>
      <main className="p-8 max-w-[1200px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Security & Settings</h1>
            <p className="text-textSecondary text-sm">Configure school-wide profiles, global security constraints, and maintenance toggles.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Apply Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* General Settings */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 border border-white/5">
              <div className="flex items-center pb-4 border-b border-white/5 mb-6">
                <Globe className="w-5 h-5 text-primary-400 mr-3" />
                <h3 className="text-lg font-bold text-white">General Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Institution Name</label>
                  <input type="text" value={settings.schoolName} onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })} className="input-field bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Primary Support Email</label>
                  <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="input-field bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Current Academic Year</label>
                  <select value={settings.academicYear} onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })} className="input-field bg-background border-white/10">
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Currency</label>
                    <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="input-field bg-background border-white/10">
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Timezone</label>
                    <input type="text" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="input-field bg-background text-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Access */}
            <div className="glass-card p-6 border border-white/5">
              <div className="flex items-center pb-4 border-b border-white/5 mb-6">
                <Shield className="w-5 h-5 text-emerald-400 mr-3" />
                <h3 className="text-lg font-bold text-white">Security & Access Management</h3>
              </div>

              <div className="space-y-6">
                <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-background/50 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-emerald-500/10 mr-4 group-hover:bg-emerald-500/20 transition-colors">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm shrink-0">Enforce Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-textSecondary mt-1">Require all administrative and teacher accounts to verify logins using an OTP sent via email.</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.require2FA ? 'bg-primary-500' : 'bg-white/10'}`}>
                    <input type="checkbox" className="sr-only" checked={settings.require2FA} onChange={(e) => setSettings({ ...settings, require2FA: e.target.checked })} />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.require2FA ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-background/50 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-primary-500/10 mr-4 group-hover:bg-primary-500/20 transition-colors">
                      <UserCheck className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm shrink-0">Open Student/Parent Registration</p>
                      <p className="text-xs text-textSecondary mt-1">Allow anyone to register from the homepage without needing a pre-registered system email.</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.allowStudentRegistration ? 'bg-primary-500' : 'bg-white/10'}`}>
                    <input type="checkbox" className="sr-only" checked={settings.allowStudentRegistration} onChange={(e) => setSettings({ ...settings, allowStudentRegistration: e.target.checked })} />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.allowStudentRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-danger/20 bg-danger/5 hover:bg-danger/10 transition-colors cursor-pointer group">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-danger/10 mr-4">
                      <AlertCircle className="w-5 h-5 text-danger" />
                    </div>
                    <div>
                      <p className="font-bold text-danger text-sm shrink-0">Maintenance Mode</p>
                      <p className="text-xs text-textSecondary mt-1">Lock out all non-admin users and display a "System Update in Progress" screen.</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-danger' : 'bg-white/10'}`}>
                    <input type="checkbox" className="sr-only" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Meta Options */}
          <div className="space-y-8">
            <div className="glass-card p-6 border border-white/5 text-center">
              <div className="w-24 h-24 rounded-2xl bg-surfaceSolid border border-white/10 mx-auto flex items-center justify-center mb-4 overflow-hidden relative group cursor-pointer">
                <div className="hidden group-hover:flex absolute inset-0 bg-background/80 items-center justify-center text-xs font-bold text-white">Upload New</div>
                <img src="https://ui-avatars.com/api/?name=School+Lane&background=6366F1&color=fff&size=128&rounded=false" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-white">School Logo</h4>
              <p className="text-xs text-textSecondary mt-1">Recommended: 256x256 PNG</p>
              <button className="btn-secondary w-full justify-center mt-4">Change Logo</button>
            </div>

            <div className="glass-card p-6 border border-white/5">
              <h4 className="font-bold text-white border-b border-white/5 pb-3 mb-4">System Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-textSecondary">Platform Version</span> <span className="font-mono text-white">v2.4.0-stable</span></div>
                <div className="flex justify-between items-center"><span className="text-textSecondary">Firebase SDK</span> <span className="font-mono text-white">v11.x</span></div>
                <div className="flex justify-between items-center"><span className="text-textSecondary">Database Region</span> <span className="font-mono text-white">us-central</span></div>
                <div className="flex justify-between items-center"><span className="text-textSecondary">Last Backup</span> <span className="font-mono text-emerald-400">2 hrs ago</span></div>
              </div>
              <button className="btn-secondary w-full justify-center mt-6 text-xs text-primary-400 border-primary-500/30 hover:bg-primary-500/10">Force Manual DB Backup</button>
            </div>
          </div>

        </div>
      </main>
    </Layout>
  );
}
