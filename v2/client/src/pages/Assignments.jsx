import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, MoreVertical, Edit2, Trash2, Users, Clock,
    FileText, CheckCircle2, AlertCircle, X, MessageSquare
} from 'lucide-react';
import Layout from '../components/Layout';

import { useAuth } from '../contexts/AuthContext';

// Mock Data
// Constants mapping
const CLASS_MAP = {
    'class_1': 'Grade 12-A',
    'class_2': 'Grade 11-B'
};

const COLOR_MAP = {
    'homework': 'primary',
    'project': 'success',
    'quiz': 'warning'
};

const DUMMY_SUBMISSIONS = [
    { id: 1, name: 'Aarav Patel', file: 'math_homework.pdf', status: 'Graded', score: 95, late: false },
    { id: 2, name: 'Diya Sharma', file: 'calc_practice.pdf', status: 'Submitted', score: null, late: true },
    { id: 3, name: 'Rohan Gupta', file: 'notes.pdf', status: 'Submitted', score: null, late: false },
    { id: 4, name: 'Isha Singh', file: 'assignment.pdf', status: 'Submitted', score: null, late: true },
    { id: 5, name: 'Ananya Verma', file: 'solution.pdf', status: 'Graded', score: 88, late: false },
];

export default function Assignments() {
    const { currentUser, userRole } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    // Create Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', classId: '', dueDate: '', type: 'homework', points: '100', description: '' });
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
            fetchAssignments();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/classes${userRole === 'teacher' ? `?teacherId=${currentUser.uid}` : ''}`);
            const json = await res.json();
            if (json.data) setClasses(json.data);
        } catch (error) { console.error(error); }
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:5000/api/assignments';
            if (userRole === 'teacher') url += `?teacherId=${currentUser.uid}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.data) {
                const formatted = data.data.map(item => ({
                    id: item.id,
                    title: item.title,
                    subject: item.type.toUpperCase(),
                    classId: item.classId,
                    class: classes.find(c => c.id === item.classId)?.name || item.classId,
                    dueDate: item.dueDate,
                    submitted: item.submittedCount || 0,
                    total: 30, // ideally from class size
                    status: item.status === 'active' ? 'Active' : 'Graded',
                    color: COLOR_MAP[item.type] || 'primary',
                    points: item.points || 100
                }));
                // reverse to show newest first
                setAssignments(formatted.reverse());
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...createForm, teacherId: currentUser.uid, teacherEmail: currentUser.email };
            const res = await fetch('http://localhost:5000/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsCreateOpen(false);
                setCreateForm({ title: '', classId: '', dueDate: '', type: 'homework', points: '100', description: '' });
                fetchAssignments();
            }
        } catch (error) {
            console.error('Failed to create assignment', error);
        }
    };

    const openSubmissions = async (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissions([]);
        try {
            const res = await fetch(`http://localhost:5000/api/assignments/${assignment.id}/submissions`);
            const json = await res.json();
            if (json.data) setSubmissions(json.data);
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        }
    };

    const handleSaveGrade = async (studentId, score) => {
        try {
            await fetch(`http://localhost:5000/api/assignments/${selectedAssignment.id}/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, score })
            });
            // refresh submissions
            openSubmissions(selectedAssignment);
        } catch (error) {
            console.error('Failed to grade', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await fetch(`http://localhost:5000/api/assignments/${id}`, { method: 'DELETE' });
                fetchAssignments();
            } catch (error) { console.error('Failed to delete assignment', error); }
        }
    };

    return (
        <Layout breadcrumbs={['Assignments']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col min-h-full pb-24">
                {/* Header Bar */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">Assignments Master</h1>
                        <p className="text-textSecondary text-sm">Manage coursework, track submissions, and grade.</p>
                    </div>
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                        <Plus className="w-5 h-5 mr-2" />
                        <span>Create Assignment</span>
                    </button>
                </motion.div>

                {/* Filter Bar */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 mb-8 flex flex-wrap gap-4 items-center border border-white/5">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                        <input type="text" placeholder="Search assignments..." className="input-field pl-10 border-white/10 bg-surfaceSolid/50 text-sm" />
                    </div>
                    <select className="input-field w-auto min-w-[150px] bg-surfaceSolid/50 p-2 text-sm border-white/10 text-textSecondary">
                        <option>All Classes</option>
                        <option>Grade 12-A</option>
                        <option>Grade 11-B</option>
                    </select>
                    <select className="input-field w-auto min-w-[150px] bg-surfaceSolid/50 p-2 text-sm border-white/10 text-textSecondary">
                        <option>Status: All</option>
                        <option>Active</option>
                        <option>Graded</option>
                        <option>Overdue</option>
                        <option>Draft</option>
                    </select>
                    <button className="p-2.5 rounded-lg border border-white/10 text-textSecondary hover:text-white hover:bg-white/5 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Assignment Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {assignments.map((assignment, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={assignment.id}
                                className="glass-card flex flex-col overflow-visible hover:-translate-y-1 transition-all duration-300 group"
                            >
                                {/* Card Color Bar Top */}
                                <div className={`h-1 w-full bg-${assignment.color}-500 opacity-50 absolute top-0 left-0`}></div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-${assignment.color}-500/10 text-${assignment.color}-400 border border-${assignment.color}-500/20`}>
                                            {assignment.subject}
                                        </span>
                                        <StatusBadge status={assignment.status} />
                                    </div>

                                    <h3 className="font-display text-lg font-bold text-white mb-4 line-clamp-2 pr-4">{assignment.title}</h3>

                                    <div className="space-y-2 mt-auto text-sm">
                                        <div className="flex items-center text-textSecondary">
                                            <Users className="w-4 h-4 mr-2 opacity-70" /> {assignment.class}
                                        </div>
                                        <div className={`flex items-center ${assignment.status === 'Overdue' ? 'text-danger' : 'text-textSecondary'}`}>
                                            <Clock className="w-4 h-4 mr-2 opacity-70" /> {assignment.dueDate}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5 pt-4 border-t border-white/5">
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className="text-white">{assignment.submitted} / {assignment.total} <span className="text-textSecondary font-normal ml-1">Submitted</span></span>
                                            <span className="text-primary-400">{Math.round((assignment.submitted / assignment.total) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full rounded-full ${assignment.submitted === assignment.total ? 'bg-success' : 'bg-primary-500'}`}
                                                style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-3 border-t border-white/5 bg-surfaceSolid/30 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openSubmissions(assignment)}
                                        className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        View Submissions →
                                    </button>
                                    <div className="flex space-x-2 text-textSecondary">
                                        <button className="p-1 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(assignment.id)} className="p-1 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Slide-over Detail Modal */}
                <AnimatePresence>
                    {selectedAssignment && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                                onClick={() => setSelectedAssignment(null)}
                            />

                            {/* Slide panel */}
                            <motion.div
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-full max-w-2xl glass-card bg-[#0D1117]/95 border-l border-white/10 z-50 rounded-l-2xl rounded-r-none flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-white/5 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-${selectedAssignment.color}-500/10 text-${selectedAssignment.color}-400 border border-${selectedAssignment.color}-500/20`}>
                                                {selectedAssignment.subject} • {selectedAssignment.class}
                                            </span>
                                            <StatusBadge status={selectedAssignment.status} />
                                        </div>
                                        <h2 className="font-display text-2xl font-bold text-white pr-8">{selectedAssignment.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedAssignment(null)} className="p-2 text-textSecondary hover:text-white bg-white/5 rounded-full transition-colors absolute top-6 right-6">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-surfaceSolid p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs text-textSecondary uppercase font-bold mb-1">Due Date</h4>
                                            <p className="font-bold text-white flex items-center"><Clock className="w-4 h-4 mr-2 text-primary-400" /> {selectedAssignment.dueDate}</p>
                                        </div>
                                        <div className="bg-surfaceSolid p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs text-textSecondary uppercase font-bold mb-1">Total Points</h4>
                                            <p className="font-bold text-white flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-primary-400" /> 100 PTS</p>
                                        </div>
                                    </div>

                                    {/* Submissions List */}
                                    <h3 className="font-display text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Student Submissions ({submissions.length})</h3>
                                    <div className="space-y-3">
                                        {submissions.length === 0 ? (
                                            <p className="text-textSecondary text-sm italic py-4 text-center">No submissions yet.</p>
                                        ) : submissions.map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors group">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <p className="font-bold text-white text-sm">
                                                            {sub.studentName}
                                                            {sub.late && <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">Late</span>}
                                                        </p>
                                                        <p className="text-xs text-textSecondary flex items-center hover:text-primary-400 cursor-pointer transition-colors">
                                                            <FileText className="w-3 h-3 mr-1" /> {sub.fileName}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {sub.status === 'Graded' ? (
                                                        <span className="font-mono font-bold text-success bg-success/10 px-2 py-1 rounded border border-success/20">{sub.score}/{selectedAssignment.points}</span>
                                                    ) : (
                                                        <div className="flex space-x-2">
                                                            <input
                                                                id={`score-${sub.id}`}
                                                                type="number"
                                                                placeholder={`-- / ${selectedAssignment.points}`}
                                                                className="w-20 bg-background border border-white/10 rounded px-2 py-1 text-xs font-mono text-center focus:border-primary-500 outline-none text-white"
                                                            />
                                                            <button
                                                                onClick={(e) => {
                                                                    const val = document.getElementById(`score-${sub.id}`).value;
                                                                    if (val) handleSaveGrade(sub.studentId, val);
                                                                }}
                                                                className="p-1.5 bg-primary-500/10 text-primary-400 rounded hover:bg-primary-500/20 transition-colors border border-primary-500/20"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-white/5 bg-surfaceSolid/50 flex justify-end space-x-3">
                                    <button className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors">Mark All Graded</button>
                                    <button className="btn-primary">Save Grades</button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isCreateOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Create Assignment</h2>
                                    <button onClick={() => setIsCreateOpen(false)} className="text-textSecondary hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-textSecondary mb-1">Title</label>
                                        <input required type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="input-field" placeholder="e.g. Chapter 4 Practice" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Class</label>
                                            <select required value={createForm.classId} onChange={e => setCreateForm({ ...createForm, classId: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                                                <option value="">Select Class...</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Due Date</label>
                                            <input required type="date" value={createForm.dueDate} onChange={e => setCreateForm({ ...createForm, dueDate: e.target.value })} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Type</label>
                                            <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                                                <option value="homework">Homework</option>
                                                <option value="project">Project</option>
                                                <option value="quiz">Quiz</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Total Points</label>
                                            <input required type="number" min="1" value={createForm.points} onChange={e => setCreateForm({ ...createForm, points: e.target.value })} className="input-field" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-textSecondary mb-1">Instructions</label>
                                        <textarea rows="3" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="input-field" placeholder="Provide details on what students should submit..."></textarea>
                                    </div>
                                    <div className="pt-4 flex justify-end space-x-3">
                                        <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">Cancel</button>
                                        <button type="submit" className="btn-primary">Create Assignment</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </Layout>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Active: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
        Draft: 'bg-warning/10 text-warning border-warning/20',
        Overdue: 'bg-danger/10 text-danger border-danger/20',
        Graded: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    const icons = {
        Active: <AlertCircle className="w-3 h-3 mr-1" />,
        Draft: <FileText className="w-3 h-3 mr-1" />,
        Overdue: <Clock className="w-3 h-3 mr-1" />,
        Graded: <CheckCircle2 className="w-3 h-3 mr-1" />,
    };

    return (
        <span className={`flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
            {icons[status]} {status}
        </span>
    );
}
