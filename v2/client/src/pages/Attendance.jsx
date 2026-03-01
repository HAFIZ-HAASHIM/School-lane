import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, AlertCircle, Save, Download, Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Attendance() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { currentUser, userRole } = useAuth();

    // Calculate Live Summary
    const summary = useMemo(() => {
        return students.reduce((acc, student) => {
            if (student.status) {
                acc[student.status] = (acc[student.status] || 0) + 1;
            }
            return acc;
        }, {});
    }, [students]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass && date) {
            fetchAttendance();
        }
    }, [selectedClass, date]);

    const fetchClasses = async () => {
        if (!currentUser) return;
        try {
            const url = userRole === 'admin'
                ? 'http://localhost:5000/api/classes'
                : `http://localhost:5000/api/classes?teacherId=${currentUser.uid}`;

            const res = await fetch(url);
            const json = await res.json();
            if (json.data && json.data.length > 0) {
                setClasses(json.data);
                setSelectedClass(json.data[0].id);
            } else {
                setClasses([]);
                setSelectedClass('');
            }
        } catch (error) {
            console.error('Failed to fetch classes', error);
        }
    };

    const fetchAttendance = async () => {
        if (!selectedClass || !date) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance?classId=${selectedClass}&date=${date}`);
            const json = await res.json();
            setStudents(json.data || []);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const setStatus = (id, newStatus) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, status: newStatus } : s));
    };

    const setRemarks = (id, newRemarks) => {
        setStudents(prev => prev.map(s => s.studentId === id ? { ...s, remarks: newRemarks } : s));
    };

    const markAllPresent = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: 'Present' })));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId: selectedClass,
                    date: date,
                    records: students
                })
            });
            if (res.ok) {
                alert('Attendance saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save attendance', error);
            alert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout breadcrumbs={['Attendance']}>
            <main className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full">
                {/* Header & Live Summary */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white">Daily Attendance</h1>
                        <p className="text-textSecondary text-sm mt-1">Marking attendance for period 1.</p>
                    </div>
                    <div className="flex space-x-3">
                        <SummaryChip icon={<CheckCircle className="w-4 h-4" />} count={summary['Present'] || 0} label="Present" color="text-success bg-success/10 border-success/20" />
                        <SummaryChip icon={<XCircle className="w-4 h-4" />} count={summary['Absent'] || 0} label="Absent" color="text-danger bg-danger/10 border-danger/20" />
                        <SummaryChip icon={<Clock className="w-4 h-4" />} count={summary['Late'] || 0} label="Late" color="text-warning bg-warning/10 border-warning/20" />
                        <SummaryChip icon={<AlertCircle className="w-4 h-4" />} count={summary['Excused'] || 0} label="Excused" color="text-primary-400 bg-primary-500/10 border-primary-500/20" />
                    </div>
                </motion.div>

                {/* Top Filter Bar */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <select
                        className="input-field max-w-[200px] bg-surfaceSolid/50 p-2 text-sm border-white/10"
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                    >
                        {classes.length === 0 && <option value="" disabled>No classes found</option>}
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="input-field max-w-[180px] bg-surfaceSolid/50 p-2 text-sm border-white/10"
                    />
                    <div className="flex-1"></div>
                    <button onClick={markAllPresent} className="btn-primary text-sm py-2 px-4 whitespace-nowrap bg-success border border-success/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-success/80">
                        Mark All Present
                    </button>
                </motion.div>

                {/* Attendance Grid */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card flex-1 overflow-hidden flex flex-col mb-24">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-textSecondary uppercase bg-surfaceSolid/50 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-24">Roll No</th>
                                    <th className="px-6 py-4 font-semibold">Student</th>
                                    <th className="px-6 py-4 font-semibold text-center w-80">Status</th>
                                    <th className="px-6 py-4 font-semibold">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-textSecondary">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-500" />
                                            Loading students...
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-textSecondary">
                                            No students found for this class.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => {
                                        const statusColors = {
                                            Present: 'bg-success/5 border-success/20',
                                            Absent: 'bg-danger/5 border-danger/20',
                                            Late: 'bg-warning/5 border-warning/20',
                                            Excused: 'bg-primary-500/5 border-primary-500/20'
                                        };
                                        const rowColor = student.status ? statusColors[student.status] : '';
                                        return (
                                            <tr key={student.studentId} className={`hover:bg-white/5 transition-colors ${rowColor}`}>
                                                <td className="px-6 py-4 font-mono text-textSecondary">{student.rollNo}</td>
                                                <td className="px-6 py-4 flex items-center space-x-3">
                                                    <img src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=random`} alt="avatar" className="w-8 h-8 rounded-full border border-white/10" />
                                                    <span className="font-semibold text-white">{student.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2 bg-surfaceSolid p-1 rounded-lg border border-white/5 w-fit mx-auto">
                                                        <StatusToggle active={student.status === 'Present'} onClick={() => setStatus(student.studentId, 'Present')} label="P" color="bg-success text-white" />
                                                        <StatusToggle active={student.status === 'Absent'} onClick={() => setStatus(student.studentId, 'Absent')} label="A" color="bg-danger text-white" />
                                                        <StatusToggle active={student.status === 'Late'} onClick={() => setStatus(student.studentId, 'Late')} label="L" color="bg-warning text-white" />
                                                        <StatusToggle active={student.status === 'Excused'} onClick={() => setStatus(student.studentId, 'Excused')} label="E" color="bg-primary-500 text-white" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={student.remarks || ''}
                                                        onChange={(e) => setRemarks(student.studentId, e.target.value)}
                                                        placeholder="Add note..."
                                                        className="bg-transparent border-b border-white/10 focus:border-primary-400 outline-none w-full text-textSecondary focus:text-white px-2 py-1 text-xs transition-colors"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Sticky Bottom Action Bar */}
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: "spring", bounce: 0.3 }} className="fixed bottom-0 right-0 left-0 md:left-80 z-30 p-4 bg-background/80 backdrop-blur-xl border-t border-white/5 flex justify-end space-x-4 items-center px-8">
                <button className="text-sm font-medium text-textSecondary hover:text-white transition-colors flex items-center space-x-2 px-4 py-2">
                    <span>Save as Draft</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surfaceSolid border border-white/10 text-white hover:bg-white/5 transition-all text-sm">
                    <Download className="w-4 h-4" />
                    <span>Export Excel</span>
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`btn-primary text-sm py-2 px-8 flex items-center space-x-2 ${saving ? 'opacity-70' : ''}`}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Submit Attendance'}</span>
                </button>
            </motion.div>
        </Layout>
    );
}

function SummaryChip({ icon, count, label, color }) {
    return (
        <div className={`flex items-center space-x-2 border rounded-full px-3 py-1.5 ${color}`}>
            {icon}
            <span className="font-bold text-sm">{count} <span className="font-normal opacity-80">{label}</span></span>
        </div>
    );
}

function StatusToggle({ active, onClick, label, color }) {
    return (
        <button
            onClick={onClick}
            className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${active ? `${color} shadow-lg scale-110` : 'text-textSecondary hover:bg-white/10'
                }`}
        >
            {label}
        </button>
    );
}
