// client/src/pages/Exams.jsx

import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx'; // <-- Import useAuth

export default function Exams() {
  const { user } = useAuth(); // <-- Get the current user
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ type: '', date: '', subject: '', maxMarks: 100, classId: '' });

  const load = async () => {
    const [e, c] = await Promise.all([api.get('/exams'), api.get('/classes')]);
    setExams(e.data);
    setClasses(c.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/exams', form);
    setForm({ type: '', date: '', subject: '', maxMarks: 100, classId: '' });
    await load();
  };

  const isPrivilegedUser = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className={isPrivilegedUser ? "lg:col-span-2" : "col-span-full"}>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Exams</h2>
          <div className="space-y-3">
            {exams.map((x) => (
              <div key={x._id} className="p-3 border rounded">
                <div className="font-semibold">{x.subject} - {x.type}</div>
                <div className="text-sm text-gray-600">{new Date(x.date).toLocaleDateString()} | Max: {x.maxMarks}</div>
              </div>
            ))}
            {exams.length === 0 && <div className="text-sm text-gray-500">No exams</div>}
          </div>
        </div>
      </div>

      {/* --- This form will now only render for admins and teachers --- */}
      {isPrivilegedUser && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Create Exam</h2>
          <form className="space-y-3" onSubmit={create}>
            <input className="w-full border rounded px-3 py-2" placeholder="Type (Midterm)" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} required />
            <input className="w-full border rounded px-3 py-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} required />
            <input className="w-full border rounded px-3 py-2" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            <input className="w-full border rounded px-3 py-2" type="number" value={form.maxMarks} onChange={(e) => setForm((f) => ({ ...f, maxMarks: Number(e.target.value) }))} required />
            <select className="w-full border rounded px-3 py-2" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
            </select>
            <button className="w-full bg-primary text-white rounded py-2">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}