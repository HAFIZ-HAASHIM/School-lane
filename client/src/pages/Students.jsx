import { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [form, setForm] = useState({ name: '', rollNumber: '', classId: '', contact: { phone: '', email: '' } });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [s, c] = await Promise.all([
      api.get('/students', { params: filterClass ? { classId: filterClass } : {} }),
      api.get('/classes')
    ]);
    setStudents(s.data);
    setClasses(c.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, [filterClass]);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/students', form);
      setForm({ name: '', rollNumber: '', classId: '', contact: { phone: '', email: '' } });
      await load();
    } finally {
      setLoading(false);
    }
  };

  const classOptions = useMemo(() => classes.map((c) => ({ id: c._id, label: `${c.name} - ${c.section}` })), [classes]);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Students</h2>
          <select
            className="border rounded px-2 py-1"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-2">Name</th>
                <th className="p-2">Roll</th>
                <th className="p-2">Class</th>
                <th className="p-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.rollNumber}</td>
                  <td className="p-2">{classes.find((c) => c._id === s.classId)?.name} {classes.find((c) => c._id === s.classId)?.section}</td>
                  <td className="p-2">{s?.contact?.phone || '-'}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td className="p-2 text-gray-500" colSpan="4">No students</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Add Student</h2>
        <form className="space-y-3" onSubmit={create}>
          <input className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input className="w-full border rounded px-3 py-2" placeholder="Roll Number" value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} />
          <select className="w-full border rounded px-3 py-2" value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))} required>
            <option value="">Select Class</option>
            {classOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <input className="w-full border rounded px-3 py-2" placeholder="Phone" value={form.contact.phone} onChange={(e) => setForm((f) => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))} />
          <input className="w-full border rounded px-3 py-2" placeholder="Email" value={form.contact.email} onChange={(e) => setForm((f) => ({ ...f, contact: { ...f.contact, email: e.target.value } }))} />
          <button disabled={loading} className="w-full bg-primary text-white rounded py-2">{loading ? 'Saving...' : 'Save'}</button>
        </form>
      </div>
    </div>
  );
}