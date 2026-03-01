import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Save, Loader2, BookOpen, Clock, Users, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { id: 1, time: '08:30 - 09:30' },
  { id: 2, time: '09:30 - 10:30' },
  { id: 3, time: '10:45 - 11:45' },
  { id: 4, time: '11:45 - 12:45' },
  { id: 'lunch', time: '12:45 - 01:30', isBreak: true },
  { id: 5, time: '01:30 - 02:30' },
  { id: 6, time: '02:30 - 03:30' },
];

export default function AdminTimetable() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetableData, setTimetableData] = useState({}); // { [day]: { [periodId]: { entry data } } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal state for editing a cell
  const [editingCell, setEditingCell] = useState(null); // { day, periodId }
  const [cellForm, setCellForm] = useState({ subject: '', teacherId: '', room: '', color: 'primary' });

  useEffect(() => {
    fetchClassesAndTeachers();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable();
    } else {
      setTimetableData({});
    }
  }, [selectedClassId]);

  const fetchClassesAndTeachers = async () => {
    try {
      const [clsRes, tchrRes] = await Promise.all([
        fetch('http://localhost:5000/api/classes'),
        fetch('http://localhost:5000/api/users')
      ]);
      const clsJson = await clsRes.json();
      const tchrJson = await tchrRes.json();

      if (clsJson.data) setClasses(clsJson.data);
      if (tchrJson.data) {
        // filter active teachers
        setTeachers(tchrJson.data.filter(u => u.role === 'teacher' && u.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching baseline data:', error);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/timetable?classId=${selectedClassId}`);
      const json = await res.json();

      const formatted = {};
      if (json.data) {
        json.data.forEach(entry => {
          if (!formatted[entry.day]) formatted[entry.day] = {};
          formatted[entry.day][entry.periodId] = entry;
        });
      }
      setTimetableData(formatted);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (day, periodId) => {
    const existing = timetableData[day]?.[periodId];
    setCellForm({
      subject: existing?.subject || '',
      teacherId: existing?.teacherId || '',
      room: existing?.room || '',
      color: existing?.color || 'primary',
      id: existing?.id || null // keep track if updating
    });
    setEditingCell({ day, periodId });
  };

  const handleSaveCell = () => {
    const { day, periodId } = editingCell;
    setTimetableData(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [periodId]: { ...cellForm, day, periodId, classId: selectedClassId }
      }
    }));
    setEditingCell(null);
  };

  const handleDeleteCell = () => {
    const { day, periodId } = editingCell;

    setTimetableData(prev => {
      const newData = { ...prev };
      if (newData[day]) {
        const newDay = { ...newData[day] };
        delete newDay[periodId];
        newData[day] = newDay;
      }
      return newData;
    });

    // Also if it had an ID, we should potentially track it for deletion on the backend
    // For simplicity in this demo, we'll just not send it during save, and the backend might need a sync logic 
    // Actually, the backend save was written as batch update/create. We would need a separate API call to delete.
    if (cellForm.id) {
      fetch(`http://localhost:5000/api/timetable/${cellForm.id}`, { method: 'DELETE' }).catch(console.error);
    }

    setEditingCell(null);
  };

  const handleSaveTimetable = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      // Flatten timetableData back to an array
      const entries = [];
      Object.values(timetableData).forEach(dayObj => {
        Object.values(dayObj).forEach(entry => {
          entries.push(entry);
        });
      });

      const res = await fetch('http://localhost:5000/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });

      if (res.ok) {
        alert('Timetable saved successfully');
        fetchTimetable(); // refresh IDs
      } else {
        alert('Error saving timetable');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving timetable');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout breadcrumbs={['Administration', 'Timetable Engine']}>
      <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Timetable Engine</h1>
            <p className="text-textSecondary text-sm">Build and manage schedules for individual classes.</p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="input-field max-w-[200px] bg-surfaceSolid/50 p-2 text-sm border-white/10"
            >
              <option value="">Select a Class...</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveTimetable}
              disabled={saving || !selectedClassId}
              className={`btn-primary flex items-center space-x-2 ${(saving || !selectedClassId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {!selectedClassId ? (
          <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex items-center justify-center flex-col p-12 text-center bg-surfaceSolid/20">
            <Clock className="w-16 h-16 text-textSecondary mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Class Selected</h3>
            <p className="text-textSecondary">Select a class from the dropdown above to view or edit its timetable.</p>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="flex-1 glass-card overflow-auto custom-scrollbar p-6">
            <div className="min-w-[800px]">
              {/* Header Row (Days) */}
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="flex items-end justify-end p-2 text-xs font-bold text-textSecondary uppercase">Time</div>
                {DAYS.map(day => (
                  <div key={day} className="text-center py-2 rounded-lg border bg-surfaceSolid/50 border-white/5 text-textSecondary">
                    <span className="font-bold">{day}</span>
                  </div>
                ))}
              </div>

              {/* Grid Rows (Periods) */}
              <div className="space-y-4 relative">
                {PERIODS.map((period) => (
                  <div key={period.id} className="grid grid-cols-6 gap-4 relative">
                    <div className="flex flex-col items-end justify-center pr-4 text-xs font-mono text-textSecondary relative">
                      {period.time.split(' - ').map(t => <span key={t}>{t}</span>)}
                    </div>

                    {period.isBreak ? (
                      <div className="col-span-5 bg-surfaceSolid/30 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-textSecondary/50 font-bold uppercase tracking-widest text-xs h-12">
                        Break / Lunch
                      </div>
                    ) : (
                      DAYS.map((day) => {
                        const cellData = timetableData[day]?.[period.id];
                        const tName = teachers.find(t => t.id === cellData?.teacherId)?.name || 'Unassigned';

                        return (
                          <div
                            key={`${day}-${period.id}`}
                            onClick={() => handleCellClick(day, period.id)}
                            className={`min-h-[100px] rounded-xl border p-3 transition-all ${cellData
                              ? `bg-${cellData.color}-500/10 border-${cellData.color}-500/20 hover:border-${cellData.color}-500/50 cursor-pointer hover:-translate-y-1`
                              : 'bg-surfaceSolid/20 border-white/5 border-dashed hover:bg-white/10 cursor-pointer'
                              }`}
                          >
                            {cellData ? (
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <div className={`font-bold text-sm mb-1 text-${cellData.color}-400`}>{cellData.subject}</div>
                                  <div className="text-xs text-textSecondary flex items-center mb-1">
                                    <Users className="w-3 h-3 mr-1" /> {tName}
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono bg-background/50 text-white w-fit px-2 py-0.5 rounded border border-white/10">
                                  {cellData.room || 'TBD'}
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-light text-white/5">+</div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Period</h2>
              <button onClick={() => setEditingCell(null)} className="text-textSecondary hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Subject</label>
                <input
                  type="text"
                  value={cellForm.subject}
                  onChange={e => setCellForm({ ...cellForm, subject: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Teacher</label>
                <select
                  value={cellForm.teacherId}
                  onChange={e => setCellForm({ ...cellForm, teacherId: e.target.value })}
                  className="input-field bg-[#0D1117] border-white/10"
                >
                  <option value="">Select Teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Room</label>
                <input
                  type="text"
                  value={cellForm.room}
                  onChange={e => setCellForm({ ...cellForm, room: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Lab 3"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-textSecondary mb-2">Color Label</label>
                <div className="flex gap-3">
                  {['primary', 'success', 'warning', 'danger', 'secondary'].map(c => (
                    <button
                      key={c}
                      onClick={() => setCellForm({ ...cellForm, color: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${cellForm.color === c ? 'scale-125 border-white' : `border-transparent bg-${c}-500/50 hover:scale-110`}`}
                      style={{ backgroundColor: `var(--color-${c}, teal)` }} // fallback inline handling or rely on tailwind classes if we defined them
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
              {cellForm.id || (cellForm.subject && cellForm.teacherId) ? (
                <button onClick={handleDeleteCell} className="text-danger text-sm hover:underline font-medium">Clear Slot</button>
              ) : <div></div>}
              <div className="flex space-x-3">
                <button onClick={() => setEditingCell(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleSaveCell} className="btn-primary px-6" disabled={!cellForm.subject || !cellForm.teacherId}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
