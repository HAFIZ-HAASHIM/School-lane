import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Profile() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    api.get('/auth/me').then((res) => setMe(res.data.user));
  }, []);
  if (!me) return null;
  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-xl">
      <h2 className="text-lg font-semibold mb-3">Profile</h2>
      <div className="space-y-2">
        <div><span className="font-medium">Name:</span> {me.name}</div>
        <div><span className="font-medium">Email:</span> {me.email}</div>
        <div><span className="font-medium">Role:</span> {me.role}</div>
      </div>
    </div>
  );
}