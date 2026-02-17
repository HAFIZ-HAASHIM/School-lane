// client/src/pages/Announcements.jsx

import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx'; // <-- Import useAuth

export default function Announcements() {
  const { user } = useAuth(); // <-- Get the current user
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', targetAudience: 'all' });

  const load = async () => {
    const { data } = await api.get('/announcements');
    setAnnouncements(data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/announcements', form);
    setForm({ title: '', content: '', targetAudience: 'all' });
    await load();
  };

  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className={isPrivilegedUser ? "lg:col-span-2" : "col-span-full"}>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Announcements</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="p-3 border rounded">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-gray-600">{a.content}</div>
                <div className="text-xs text-gray-500 uppercase">{a.targetAudience}</div>
              </div>
            ))}
            {announcements.length === 0 && <div className="text-sm text-gray-500">No announcements</div>}
          </div>
        </div>
      </div>
      
      {/* --- This form will now only render for admins and teachers --- */}
      {isPrivilegedUser && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Create Announcement</h2>
          <form className="space-y-3" onSubmit={create}>
            <input className="w-full border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
            <select className="w-full border rounded px-3 py-2" value={form.targetAudience} onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}>
              <option value="all">All</option>
              <option value="teachers">Teachers</option>
              <option value="students">Students</option>
              <option value="parents">Parents</option>
            </select>
            <button className="w-full bg-primary text-white rounded py-2">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}