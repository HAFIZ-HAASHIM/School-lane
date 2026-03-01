import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, MessageSquare, Plus, Bell, Mail, Smartphone, Users, ChevronRight, X, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminCommunications() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements'); // announcements or alerts
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Announcement Form
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
    priority: 'normal'
  });

  // Alert Form
  const [alertForm, setAlertForm] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/announcements');
      const data = await res.json();
      if (data.data) {
        setAnnouncements(data.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newAnnouncement,
        senderName: currentUser.displayName || 'Administrator',
        senderRole: 'admin'
      };
      const res = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewAnnouncement({ title: '', message: '', targetAudience: 'all', priority: 'normal' });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement across the school?')) {
      try {
        await fetch(`http://localhost:5000/api/announcements/${id}`, { method: 'DELETE' });
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertForm)
      });
      if (res.ok) {
        alert(`Alert sent successfully via ${alertForm.type.toUpperCase()}`);
        setAlertForm({ type: 'email', recipient: '', subject: '', message: '' });
      } else {
        alert('Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  return (
    <Layout breadcrumbs={['Administration', 'Communications']}>
      <main className="p-8 max-w-[1400px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Communications Center</h1>
            <p className="text-textSecondary text-sm">Post digital noticeboards spanning the campus and send urgent SMS/Email alerts.</p>
          </div>
          {activeTab === 'announcements' && (
            <div className="flex space-x-3">
              <button onClick={() => setIsAddOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" /> New Announcement
              </button>
            </div>
          )}
        </div>

        <div className="glass-card flex flex-col flex-1 border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5 bg-surfaceSolid/50">
            <button onClick={() => setActiveTab('announcements')} className={`px-6 py-4 flex items-center text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'announcements' ? 'text-primary-400 border-primary-500 bg-white/5' : 'text-textSecondary border-transparent hover:text-white hover:bg-white/5'}`}>
              <Megaphone className="w-4 h-4 mr-2" /> Digital Noticeboard
            </button>
            <button onClick={() => setActiveTab('alerts')} className={`px-6 py-4 flex items-center text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'alerts' ? 'text-warning border-warning bg-white/5' : 'text-textSecondary border-transparent hover:text-white hover:bg-white/5'}`}>
              <MessageSquare className="w-4 h-4 mr-2" /> Direct Alerts (SMS/Email)
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-background/30">
            {activeTab === 'announcements' ? (
              <>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-64 text-center">
                    <Megaphone className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Announcements Yet</h3>
                    <p className="text-textSecondary max-w-sm">Use the new announcement button to pin a notice to dashboards.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map(notice => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={notice.id} className="glass-card flex flex-col h-full border border-white/5 hover:border-white/10 transition-colors group relative overflow-hidden">
                        {notice.priority === 'high' && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-danger/10 rounded-bl-full border-b border-l border-danger/20 flex items-start justify-end p-2.5">
                            <AlertCircle className="w-4 h-4 text-danger" />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="text-xs font-mono font-bold text-primary-400 mb-2">{new Date(notice.date).toLocaleDateString()} at {new Date(notice.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <h3 className="text-xl font-bold text-white mb-3 pr-8">{notice.title}</h3>
                          <p className="text-sm text-textSecondary line-clamp-4 flex-1">{notice.message}</p>
                        </div>
                        <div className="p-4 border-t border-white/5 bg-surfaceSolid/50 flex items-center justify-between">
                          <div className="flex items-center text-xs text-textSecondary uppercase tracking-wider font-bold">
                            <Users className="w-3.5 h-3.5 mr-1.5" /> {notice.targetAudience}
                          </div>
                          <button onClick={() => handleDeleteEvent(notice.id)} className="text-xs font-bold text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:text-danger/80">Delete</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-2xl mx-auto py-8">
                <div className="glass-card border border-white/5 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                  <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Send Urgent Alert</h2>
                  <p className="text-sm text-textSecondary mb-8 max-w-md relative z-10">Trigger an immediate outbound notification via Twilio (SMS) or SendGrid (Email) endpoints.</p>

                  <form onSubmit={handleSendAlert} className="space-y-6 relative z-10">
                    <div className="flex space-x-4">
                      <button type="button" onClick={() => setAlertForm({ ...alertForm, type: 'email' })} className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors ${alertForm.type === 'email' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-white/10 bg-surfaceSolid text-textSecondary hover:border-white/20'}`}>
                        <Mail className="w-8 h-8 mb-3" />
                        <span className="font-bold">Email Blast</span>
                      </button>
                      <button type="button" onClick={() => setAlertForm({ ...alertForm, type: 'sms' })} className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors ${alertForm.type === 'sms' ? 'border-warning bg-warning/10 text-warning' : 'border-white/10 bg-surfaceSolid text-textSecondary hover:border-white/20'}`}>
                        <Smartphone className="w-8 h-8 mb-3" />
                        <span className="font-bold">SMS Text Message</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1 uppercase tracking-wider">Recipient (Email or Phone Number)</label>
                      <input required type="text" value={alertForm.recipient} onChange={e => setAlertForm({ ...alertForm, recipient: e.target.value })} className="input-field bg-background font-mono" placeholder={alertForm.type === 'email' ? 'parent@example.com' : '+1234567890'} />
                    </div>

                    {alertForm.type === 'email' && (
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1 uppercase tracking-wider">Subject</label>
                        <input required type="text" value={alertForm.subject} onChange={e => setAlertForm({ ...alertForm, subject: e.target.value })} className="input-field bg-background" placeholder="Important Notice" />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1 uppercase tracking-wider">Message Content</label>
                      <textarea required value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} className="input-field bg-background h-32 resize-none" placeholder="Type your message here..." />
                    </div>

                    <button type="submit" className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors ${alertForm.type === 'sms' ? 'bg-warning hover:bg-warning/90' : 'bg-primary-600 hover:bg-primary-700'}`}>
                      Send {alertForm.type.toUpperCase()} Notification Let's Fly
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Announcement Modal */}
        <AnimatePresence>
          {isAddOpen && activeTab === 'announcements' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Post Noticeboard Update</h2>
                  <button onClick={() => setIsAddOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Headline</label>
                    <input required type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. End of Term Holiday Dates" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Notice Body</label>
                    <textarea required value={newAnnouncement.message} onChange={e => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} className="input-field bg-[#0D1117] h-32 resize-none" placeholder="Details of the announcement..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Priority Level</label>
                      <select value={newAnnouncement.priority} onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                        <option value="normal">Normal</option>
                        <option value="high">Urgent/High Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Target Audience</label>
                      <select value={newAnnouncement.targetAudience} onChange={e => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                        <option value="all">Entire School</option>
                        <option value="students">Students / Parents</option>
                        <option value="teachers">Staff / Faculty</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Post to Noticeboard</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
