import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [a, e] = await Promise.all([
        api.get('/announcements'),
        api.get('/exams')
      ]);
      setAnnouncements(a.data.slice(0, 5));
      setExams(e.data.slice(0, 5));
    };
    load().catch(() => {});
  }, []);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div className="col-span-2 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Latest Announcements</h2>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a._id} className="p-3 rounded border">
              <div className="font-semibold">{a.title}</div>
              <div className="text-sm text-gray-600">{a.content}</div>
            </div>
          ))}
          {announcements.length === 0 && <div className="text-sm text-gray-500">No announcements</div>}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Upcoming Exams</h2>
        <div className="space-y-3">
          {exams.map((x) => (
            <div key={x._id} className="p-3 rounded border">
              <div className="font-semibold">{x.subject} - {x.type}</div>
              <div className="text-sm text-gray-600">{new Date(x.date).toLocaleDateString()}</div>
            </div>
          ))}
          {exams.length === 0 && <div className="text-sm text-gray-500">No exams</div>}
        </div>
      </div>
    </div>
  );
}