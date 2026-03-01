// client/src/pages/Attendance.jsx

import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// --- Helper component for the 4 status buttons ---
const StatusButtons = ({ currentStatus, onUpdate }) => {
  const statuses = ['present', 'absent', 'late', 'excused'];
  
  const baseStyle = "px-3 py-1 text-sm font-medium rounded border transition-colors";
  const activeStyles = {
    present: 'bg-green-600 text-white border-green-600',
    absent: 'bg-red-600 text-white border-red-600',
    late: 'bg-yellow-500 text-white border-yellow-500',
    excused: 'bg-blue-600 text-white border-blue-600',
  };
  const inactiveStyle = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="flex items-center flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onUpdate(status)}
          className={`${baseStyle} ${currentStatus === status ? activeStyles[status] : inactiveStyle}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};

// --- New component for the Student's View ---
const StudentAttendanceView = () => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentHistory = async () => {
      try {
        const res = await api.get('/attendance');
        // The backend returns the full attendance documents, so we need to process them.
        const processedHistory = res.data.map(doc => {
          // Find the specific record for our student within the document
          const myRecord = doc.records.find(rec => rec.studentId === user.studentProfileId); // Assumes studentProfileId is on user
          return {
            date: new Date(doc.date).toLocaleDateString(),
            status: myRecord ? myRecord.status : 'N/A',
          };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
        setAttendanceHistory(processedHistory);
      } catch (error) {
        console.error("Could not fetch attendance history", error);
      } finally {
        setLoading(false);
      }
    };
    
    // This assumes we have a way to get the student's profile ID.
    // We'll need to modify the login logic slightly to get this.
    // For now, let's just make the call.
    fetchStudentHistory();
  }, [user]);

  if (loading) return <div className="text-center p-4">Loading your attendance history...</div>;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Attendance History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceHistory.map((record, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendanceHistory.length === 0 && <div className="text-center p-4 text-gray-500">No attendance records found.</div>}
      </div>
    </div>
  );
};


export default function Attendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'teacher' || user.role === 'admin') {
      api.get('/classes').then((res) => setClasses(res.data));
    }
  }, [user.role]);

  const fetchAttendanceData = useCallback(async () => {
    if (!classId || !date) return;
    setLoading(true);
    try {
      const studentsRes = await api.get('/students', { params: { classId } });
      setStudents(studentsRes.data);
      const attendanceRes = await api.get('/attendance', { params: { classId, date } });
      if (attendanceRes.data.length > 0) {
        setRecords(attendanceRes.data[0].records);
      } else {
        setRecords(studentsRes.data.map((s) => ({ studentId: s._id, status: 'present' })));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setStudents([]); setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [classId, date]);

  useEffect(() => {
    if (user.role === 'teacher' || user.role === 'admin') {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, user.role]);

  const updateStatus = (studentId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/attendance', { date, classId, records });
      alert('Attendance saved');
    } catch (e) {
      alert('Failed to save attendance. A record for this day may already exist.');
    } finally {
      setSaving(false);
    }
  };
  
  // --- This is the main router for this page ---
  if (user.role === 'student' || user.role === 'parent') {
    return <StudentAttendanceView />;
  }
  
  if (user.role === 'teacher' || user.role === 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end mb-4 pb-4 border-b">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="ml-auto bg-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-800 disabled:bg-gray-400" onClick={save} disabled={!classId || saving || loading}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
        <div className="space-y-3">
          {loading && <div className="text-center p-4">Loading students...</div>}
          {!loading && students.map((s) => (
            <div key={s._id} className="flex items-center justify-between border-b py-3">
              <div>
                <div className="font-medium text-gray-800">{s.name}</div>
                <div className="text-xs text-gray-500">{s.rollNumber}</div>
              </div>
              <StatusButtons
                currentStatus={records.find((r) => r.studentId === s._id)?.status}
                onUpdate={(newStatus) => updateStatus(s._id, newStatus)}
              />
            </div>
          ))}
          {!loading && !classId && <div className="text-center p-4 text-gray-500">Please select a class and date to view or mark attendance.</div>}
          {!loading && classId && students.length === 0 && <div className="text-center p-4 text-gray-500">No students found in this class.</div>}
        </div>
      </div>
    );
  }

  return null; // Should not be reached
}