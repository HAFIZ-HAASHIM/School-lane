import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import {
    Search, Filter, ChevronDown, ChevronRight, FileText, CheckCircle2,
    Printer, TrendingUp, TrendingDown, Minus, Plus, X
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Exams() {
    const { currentUser } = useAuth();
    const [examsList, setExamsList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [expandedTerms, setExpandedTerms] = useState(['All Exams']);

    // Grading state
    const [studentMarks, setStudentMarks] = useState([]);
    const [saveStatus, setSaveStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Create Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', classId: '', date: '', type: 'Unit Test', totalMarks: '100' });

    useEffect(() => {
        if (currentUser) {
            fetchClasses();
            fetchExams();
        }
    }, [currentUser]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/classes?teacherId=${currentUser.uid}`);
            const json = await res.json();
            if (json.data) setClasses(json.data);
        } catch (error) { console.error(error); }
    };

    const fetchExams = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/exams?teacherId=${currentUser.uid}`);
            const data = await res.json();
            if (data.data) {
                const grouped = {
                    term: 'All Exams', exams: data.data.map(exam => ({
                        ...exam,
                        // Inject class name for display
                        class: classes.find(c => c.id === exam.classId)?.name || exam.classId,
                        date: new Date(exam.date).toLocaleDateString() || exam.createdAt.split('T')[0]
                    }))
                };
                // reverse to show newest first
                grouped.exams.reverse();
                setExamsList([grouped]);

                // Auto-select first if none selected
                if (!selectedExam && grouped.exams.length > 0) {
                    openExam(grouped.exams[0]);
                } else if (selectedExam) {
                    // Refresh selected exam stats if it exists
                    const refreshed = grouped.exams.find(e => e.id === selectedExam.id);
                    if (refreshed) setSelectedExam(refreshed);
                }
            }
        } catch (error) {
            console.error('Failed to fetch exams:', error);
        }
    };

    const openExam = async (exam) => {
        setSelectedExam(exam);
        setStudentMarks([]);
        try {
            // Fetch enrolled students for this class
            const stRes = await fetch(`http://localhost:5000/api/users?role=student&classId=${exam.classId}`);
            const stData = await stRes.json();
            let students = stData.data || [];

            // Fetch existing marks
            const markRes = await fetch(`http://localhost:5000/api/exams/${exam.id}/marks`);
            const markData = await markRes.json();
            const existingMarks = markData.data || [];

            const avgMarks = exam.analytics?.averageMarks || 0;

            const merged = students.map((s, idx) => {
                const markDoc = existingMarks.find(m => m.studentId === s.id);
                return {
                    id: s.id,
                    roll: s.regNo || `ST-${idx + 1}`,
                    name: s.displayName || s.email,
                    avatar: `https://i.pravatar.cc/150?u=${s.id}`,
                    max: exam.totalMarks || 100,
                    obtained: markDoc ? markDoc.marks : '',
                    avg: avgMarks
                };
            });
            setStudentMarks(merged);
        } catch (error) {
            console.error('Failed to fetch students or marks:', error);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...createForm, teacherId: currentUser.uid, teacherEmail: currentUser.email };
            const res = await fetch('http://localhost:5000/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsCreateOpen(false);
                setCreateForm({ title: '', classId: '', date: '', type: 'Unit Test', totalMarks: '100' });
                fetchExams();
            }
        } catch (error) {
            console.error('Failed to create exam', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await fetch(`http://localhost:5000/api/exams/${id}`, { method: 'DELETE' });
                // If selected is deleted, unselect it
                if (selectedExam?.id === id) setSelectedExam(null);
                fetchExams();
            } catch (error) { console.error('Failed to delete exam', error); }
        }
    };

    const handleSaveGrades = async () => {
        if (!selectedExam) return;
        setSaveStatus('Saving...');
        setLoading(true);

        // Only save valid numbers
        const marksPayload = studentMarks
            .filter(s => s.obtained !== '')
            .map(s => ({
                studentId: s.id,
                marks: s.obtained
            }));

        try {
            const res = await fetch(`http://localhost:5000/api/exams/${selectedExam.id}/marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentMarks: marksPayload })
            });

            if (res.ok) {
                setSaveStatus('Grades Saved!');
                setTimeout(() => setSaveStatus(''), 3000);
                fetchExams(); // Refresh to get new analytics
                openExam(selectedExam); // Refresh marks grid
            } else {
                setSaveStatus('Failed to save');
            }
        } catch (error) {
            setSaveStatus('Error saving');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (id, value) => {
        setStudentMarks(prev => prev.map(s => s.id === id ? { ...s, obtained: value === '' ? '' : Number(value) } : s));
    };

    const toggleTerm = (term) => {
        if (expandedTerms.includes(term)) {
            setExpandedTerms(expandedTerms.filter(t => t !== term));
        } else {
            setExpandedTerms([...expandedTerms, term]);
        }
    };

    const getGrade = (percentage) => {
        if (isNaN(percentage)) return { letter: '-', color: 'text-textSecondary bg-white/5 border-white/10' };
        if (percentage >= 90) return { letter: 'A+', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (percentage >= 80) return { letter: 'A', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
        if (percentage >= 70) return { letter: 'B', color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' };
        if (percentage >= 60) return { letter: 'C', color: 'text-warning bg-warning/10 border-warning/20' };
        if (percentage >= 50) return { letter: 'D', color: 'text-warning bg-warning/10 border-warning/20' };
        return { letter: 'F', color: 'text-danger bg-danger/10 border-danger/20' };
    };

    const getDeviation = (obtained, avg) => {
        if (obtained === '' || avg === 0) return { icon: <Minus className="w-3 h-3 mr-1 text-textSecondary" />, text: `-`, color: 'text-textSecondary', barScale: 0, barDir: 'center' };
        const diff = obtained - avg;
        if (diff > 5) return { icon: <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" />, text: `+${diff.toFixed(1)}`, color: 'text-emerald-400', barScale: (diff / 22) * 100, barDir: 'right' };
        if (diff < -5) return { icon: <TrendingDown className="w-3 h-3 mr-1 text-danger" />, text: `${diff.toFixed(1)}`, color: 'text-danger', barScale: (Math.abs(diff) / 33) * 100, barDir: 'left' };
        return { icon: <Minus className="w-3 h-3 mr-1 text-textSecondary" />, text: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`, color: 'text-textSecondary', barScale: 5, barDir: 'center' };
    };

    // calculate pass rate locally
    let passedCount = 0;
    let gradedCount = 0;
    studentMarks.forEach(s => {
        if (s.obtained !== '') {
            gradedCount++;
            if ((s.obtained / s.max) * 100 >= 50) passedCount++;
        }
    });
    const passRate = gradedCount > 0 ? Math.round((passedCount / gradedCount) * 100) : 0;
    const passRateData = [
        { name: 'Passed', value: passRate, color: '#10B981' },
        { name: 'Failed', value: 100 - passRate, color: '#F43F5E' },
    ];

    return (
        <Layout breadcrumbs={['Exams & Grades']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col md:flex-row gap-6">

                {/* Left Panel: Exam List */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-display text-xl font-bold text-white">Assessments</h2>
                        <button onClick={() => setIsCreateOpen(true)} className="p-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-primary-400 hover:bg-primary-500 hover:text-white transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {examsList.map((termGroup) => (
                            <div key={termGroup.term} className="glass-card overflow-hidden">
                                <button
                                    onClick={() => toggleTerm(termGroup.term)}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-bold text-sm text-white uppercase tracking-wider">{termGroup.term}</span>
                                    {expandedTerms.includes(termGroup.term) ? <ChevronDown className="w-4 h-4 text-textSecondary" /> : <ChevronRight className="w-4 h-4 text-textSecondary" />}
                                </button>

                                {expandedTerms.includes(termGroup.term) && (
                                    <div className="divide-y divide-white/5">
                                        {termGroup.exams.length === 0 && <div className="p-4 text-sm text-textSecondary text-center italic">No exams recorded.</div>}
                                        {termGroup.exams.map(exam => (
                                            <button
                                                key={exam.id}
                                                onClick={() => openExam(exam)}
                                                className={`w-full text-left p-4 transition-colors hover:bg-white/5 relative ${selectedExam?.id === exam.id ? 'bg-primary-500/10' : ''}`}
                                            >
                                                {selectedExam?.id === exam.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 shadow-[0_0_8px_#6366F1]"></div>}
                                                <h4 className={`font-bold text-sm mb-1 ${selectedExam?.id === exam.id ? 'text-primary-300' : 'text-white'}`}>{exam.title}</h4>
                                                <div className="text-xs text-textSecondary mb-2 flex justify-between">
                                                    <span>{classes.find(c => c.id === exam.classId)?.name || exam.classId}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${exam.status === 'Graded' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                        {exam.status}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Panel: Grade Entry & Analytics */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col gap-6 overflow-hidden">

                    {/* Active Exam Header */}
                    {selectedExam ? (
                        <>
                            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-textSecondary bg-white/5 px-2 py-1 rounded border border-white/10">{(classes.find(c => c.id === selectedExam.classId)?.name || selectedExam.classId)}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-textSecondary bg-white/5 px-2 py-1 rounded border border-white/10">{selectedExam.date}</span>
                                    </div>
                                    <h1 className="font-display text-3xl font-bold text-white flex items-center">
                                        {selectedExam.title}
                                        <button onClick={() => handleDelete(selectedExam.id)} className="ml-4 text-xs font-normal text-danger opacity-50 hover:opacity-100 uppercase tracking-wider border border-danger/20 bg-danger/10 px-2 py-0.5 rounded">Delete</button>
                                    </h1>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors">
                                        <Printer className="w-4 h-4 mr-2" /> Report Cards
                                    </button>
                                    <button onClick={handleSaveGrades} disabled={loading} className="btn-primary">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {loading ? 'Saving...' : 'Save Grades'}
                                    </button>
                                    {saveStatus && <span className="text-sm font-bold text-success flex items-center">{saveStatus}</span>}
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
                                {/* Grade Table */}
                                <div className="flex-1 glass-card overflow-hidden flex flex-col">
                                    <div className="overflow-auto custom-scrollbar flex-1">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-textSecondary uppercase bg-surfaceSolid/50 sticky top-0 z-10 border-b border-white/5">
                                                <tr>
                                                    <th className="px-6 py-4 font-semibold w-24">Reg No</th>
                                                    <th className="px-6 py-4 font-semibold">Student</th>
                                                    <th className="px-6 py-4 font-semibold text-center w-24">Max</th>
                                                    <th className="px-6 py-4 font-semibold text-center w-32">Obtained</th>
                                                    <th className="px-6 py-4 font-semibold text-center w-20">Grade</th>
                                                    <th className="px-6 py-4 font-semibold w-40">Deviation from Avg</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {studentMarks.map((student) => {
                                                    const grade = getGrade(student.obtained !== '' ? (student.obtained / student.max) * 100 : NaN);
                                                    const dev = getDeviation(student.obtained, student.avg);

                                                    return (
                                                        <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                                            <td className="px-6 py-4 font-mono text-textSecondary text-xs">{student.roll}</td>
                                                            <td className="px-6 py-4 flex items-center space-x-3">
                                                                <img src={student.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-white/10 group-hover:border-primary-500 transition-colors" />
                                                                <span className="font-bold text-white whitespace-nowrap">{student.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-textSecondary font-mono">{student.max}</td>
                                                            <td className="px-6 py-4 text-center flex justify-center">
                                                                <input
                                                                    type="number"
                                                                    value={student.obtained}
                                                                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                                    placeholder="--"
                                                                    className="w-16 bg-background border border-white/10 rounded px-2 py-1.5 text-sm font-mono text-center focus:border-primary-500 outline-none text-white focus:ring-1 focus:ring-primary-500 transition-all font-bold"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`inline-block w-8 text-center font-bold px-1 py-0.5 rounded border ${grade.color}`}>{grade.letter}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-between w-full relative h-6">
                                                                    <span className={`flex items-center text-xs font-mono font-bold w-12 ${dev.color}`}>
                                                                        {dev.icon} {dev.text}
                                                                    </span>

                                                                    {/* Spark bar visualization */}
                                                                    <div className="flex-1 mx-2 relative h-1.5 bg-surfaceSolid rounded-full">
                                                                        {dev.barDir === 'right' && (
                                                                            <div className="absolute left-1/2 h-full bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(dev.barScale, 50)}%` }}></div>
                                                                        )}
                                                                        {dev.barDir === 'left' && (
                                                                            <div className="absolute right-1/2 h-full bg-danger rounded-l-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" style={{ width: `${Math.min(dev.barScale, 50)}%` }}></div>
                                                                        )}
                                                                        {dev.barDir === 'center' && (
                                                                            <div className="absolute left-[45%] right-[45%] h-full bg-textSecondary rounded-full"></div>
                                                                        )}
                                                                        {/* Center line marker */}
                                                                        <div className="absolute top-[-2px] bottom-[-2px] left-1/2 w-px bg-slate-600"></div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {studentMarks.length === 0 && (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-12 text-textSecondary italic">No students enrolled in this class.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Analytics Strip */}
                                <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-6 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                                    <div className="glass-card p-6 flex-1 min-w-[250px]">
                                        <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-6">Class Performance</h3>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-xs text-textSecondary mb-1">Class Average</div>
                                                <div className="text-3xl font-display font-bold text-white">{selectedExam.analytics?.averageMarks || '--'}<span className="text-lg text-textSecondary">/{selectedExam.totalMarks || 100}</span></div>
                                            </div>

                                            <div className="flex justify-between border-t border-white/5 pt-4">
                                                <div>
                                                    <div className="text-xs text-textSecondary mb-1">Graded Count</div>
                                                    <div className="text-xl font-bold text-emerald-400">{gradedCount} / {studentMarks.length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 flex-1 min-w-[250px] flex flex-col items-center justify-center relative">
                                        <h3 className="absolute top-6 left-6 text-xs font-bold text-textSecondary uppercase tracking-wider">Pass Rate</h3>
                                        <div className="w-40 h-40 mt-4 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={passRateData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {passRateData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-2xl font-display font-bold text-white">{passRate}%</span>
                                                <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Passed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 glass-card flex items-center justify-center font-bold text-textSecondary text-xl">
                            <FileText className="w-12 h-12 text-primary-500/50 mb-4 block mx-auto" />
                            Select an exam to view and grade.
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {isCreateOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Schedule Exam</h2>
                                    <button onClick={() => setIsCreateOpen(false)} className="text-textSecondary hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-textSecondary mb-1">Title</label>
                                        <input required type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="input-field" placeholder="e.g. Midterm Examination" />
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
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Date</label>
                                            <input required type="date" value={createForm.date} onChange={e => setCreateForm({ ...createForm, date: e.target.value })} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Type</label>
                                            <select required value={createForm.type} onChange={e => setCreateForm({ ...createForm, type: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                                                <option value="Unit Test">Unit Test</option>
                                                <option value="Midterm">Midterm</option>
                                                <option value="Final">Final</option>
                                                <option value="Quiz">Quiz</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-textSecondary mb-1">Total Marks</label>
                                            <input required type="number" min="1" value={createForm.totalMarks} onChange={e => setCreateForm({ ...createForm, totalMarks: e.target.value })} className="input-field" />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end space-x-3">
                                        <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">Cancel</button>
                                        <button type="submit" className="btn-primary">Schedule Exam</button>
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
