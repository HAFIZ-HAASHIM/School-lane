// client/src/pages/Timetable.jsx

import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Timetable() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const initialFormState = { classId: '', teacherId: '', dayOfWeek: 'Monday', startTime: '', endTime: '', subject: '' };
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [entriesRes, classesRes, teachersRes] = await Promise.all([
        api.get('/timetables'),
        api.get('/classes'),
        api.get('/teachers'),
      ]);
      setEntries(entriesRes.data);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetables', form);
      setForm(initialFormState);
      await loadData(); // Reload all data
    } catch (error) {
      alert('Failed to create entry. A class may already be scheduled at that time.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.delete(`/timetables/${id}`);
        await loadData();
      } catch (error) {
        alert('Failed to delete entry.');
      }
    }
  };

  if (loading) return <div>Loading timetable...</div>;

  // For now, we only build the Admin view. Student/Teacher view will come next.
  if (user.role !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Weekly Timetable</h2>
        <p>Read-only view for your timetable is coming soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Scheduled Periods</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">Day</th>
                <th className="p-2">Time</th>
                <th className="p-2">Class</th>
                <th className="p-2">Subject</th>
                <th className="p-2">Teacher</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id} className="border-b">
                  <td className="p-2">{entry.dayOfWeek}</td>
                  <td className="p-2">{entry.startTime} - {entry.endTime}</td>
                  <td className="p-2">{entry.classId.name} - {entry.classId.section}</td>
                  <td className="p-2 font-medium">{entry.subject}</td>
                  <td className="p-2">{entry.teacherId.userId?.name || 'N/A'}</td>
                  <td className="p-2">
                    <button onClick={() => handleDelete(entry._id)} className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Add New Period</h2>
        <form className="space-y-3" onSubmit={handleCreate}>
          <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))} className="w-full border rounded px-3 py-2" required>
            <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
          </select>
          <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Subject Name" required />
          <div className="flex gap-2">
            <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full border rounded px-3 py-2" required />
            <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full border rounded px-3 py-2" required />
          </div>
          <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className="w-full border rounded px-3 py-2" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
          </select>
          <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} className="w-full border rounded px-3 py-2" required>
            <option value="">Select Teacher</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.userId?.name || t.contact.email}</option>)}
          </select>
          <button className="w-full bg-primary text-white rounded py-2">Add to Timetable</button>
        </form>
      </div>
    </div>
  );
}