// client/src/pages/Assignments.jsx

import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx'; // <-- Import useAuth

export default function Assignments() {
  const { user } = useAuth(); // <-- Get the current user
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '' });

  const load = async () => {
    const [a, c] = await Promise.all([api.get('/assignments'), api.get('/classes')]);
    setAssignments(a.data);
    setClasses(c.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/assignments', form);
    setForm({ title: '', description: '', dueDate: '', classId: '' });
    await load();
  };

  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className={isPrivilegedUser ? "lg:col-span-2" : "col-span-full"}>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a._id} className="p-3 border rounded">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-gray-600">{a.description}</div>
                <div className="text-xs text-gray-500">Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            ))}
            {assignments.length === 0 && <div className="text-sm text-gray-500">No assignments</div>}
          </div>
        </div>
      </div>

      {/* --- This form will now only render for admins and teachers --- */}
      {isPrivilegedUser && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Create Assignment</h2>
          <form className="space-y-3" onSubmit={create}>
            <input className="w-full border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <select className="w-full border rounded px-3 py-2" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
              ))}
            </select>
            <button className="w-full bg-primary text-white rounded py-2">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}