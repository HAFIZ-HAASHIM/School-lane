// client/src/pages/Teachers.jsx

import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Teachers() {
  const { signup } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const initialFormState = { name: '', email: '', password: '', qualifications: '', subjects: '', phone: '' };
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const loadTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers", error);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) {
      alert('Name, Email, and Password are required.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create the User account with 'teacher' role
      const userPayload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'teacher',
      };
      const newUser = await signup(userPayload);

      // Step 2: Create the Teacher Profile linked to the new User
      const teacherProfilePayload = {
        userId: newUser.id,
        qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
        subjects: form.subjects.split(',').map(s => s.trim()).filter(s => s),
        contact: {
          phone: form.phone,
          email: form.email,
        },
      };
      await api.post('/teachers', teacherProfilePayload);

      alert(`Teacher '${form.name}' created successfully.`);
      setForm(initialFormState);
      await loadTeachers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create teacher. The email may already be in use.');
      console.error("Teacher creation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Teacher Roster</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Subjects</th>
                <th className="p-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id} className="border-b">
                  <td className="p-2 font-medium">{t.userId?.name || 'N/A'}</td>
                  <td className="p-2">{t.subjects.join(', ')}</td>
                  <td className="p-2">{t.contact?.email || t.contact?.phone || 'N/A'}</td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td className="p-2 text-gray-500" colSpan="3">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Add New Teacher</h2>
        <form className="space-y-3" onSubmit={handleCreate}>
          <p className="text-sm font-medium text-gray-700">Login Credentials</p>
          <input className="w-full border rounded px-3 py-2" placeholder="Full Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input className="w-full border rounded px-3 py-2" placeholder="Login Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} type="email" required />
          <input className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} type="password" required />
          
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-gray-700 mt-2">Profile Information</p>
            <input className="w-full border rounded px-3 py-2" placeholder="Contact Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2 mt-2" placeholder="Qualifications (comma-separated)" value={form.qualifications} onChange={(e) => setForm(f => ({ ...f, qualifications: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2 mt-2" placeholder="Subjects Taught (comma-separated)" value={form.subjects} onChange={(e) => setForm(f => ({ ...f, subjects: e.target.value }))} />
          </div>

          <button disabled={loading} className="w-full bg-primary text-white rounded py-2">{loading ? 'Saving...' : 'Save Teacher'}</button>
        </form>
      </div>
    </div>
  );
}