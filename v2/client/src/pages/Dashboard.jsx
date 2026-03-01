import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Users, UserCheck, FileText, GraduationCap,
    Megaphone, Download, ChevronDown, Calendar, Plus
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

// --- Dummy Data ---
const attendanceData = [
    { day: 'Mon', 'Grade 10': 94, 'Grade 11': 92, 'Grade 12': 90 },
    { day: 'Tue', 'Grade 10': 96, 'Grade 11': 91, 'Grade 12': 89 },
    { day: 'Wed', 'Grade 10': 95, 'Grade 11': 93, 'Grade 12': 94 },
    { day: 'Thu', 'Grade 10': 92, 'Grade 11': 90, 'Grade 12': 91 },
    { day: 'Fri', 'Grade 10': 97, 'Grade 11': 95, 'Grade 12': 96 },
];

const events = [
    { id: 1, date: 'Oct 24', name: 'Science Fair Judging', tag: 'All Classes', type: 'info' },
    { id: 2, date: 'Oct 26', name: 'Midterm Grading Deadline', tag: 'Faculty', type: 'danger' },
    { id: 3, date: 'Nov 02', name: 'Parent-Teacher Meeting', tag: 'Grade 10', type: 'warning' },
];

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function Dashboard() {
    const { currentUser } = useAuth(); // Import useAuth

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        attendanceToday: 0,
        pendingAssignments: 0,
        upcomingExams: 0,
        recentSubmissions: [],
        todayTimetable: []
    });

    // Student Pre-registration state
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentClass, setNewStudentClass] = useState('class_1');
    const [addMessage, setAddMessage] = useState({ type: '', text: '' });
    const [loadingAdd, setLoadingAdd] = useState(false);

    useEffect(() => {
        if (currentUser?.email) {
            fetchStats(currentUser.email);
        }
    }, [currentUser]);

    const fetchStats = async (email) => {
        try {
            const res = await fetch(`http://localhost:5000/api/dashboard?email=${encodeURIComponent(email)}`);
            const json = await res.json();
            if (json.data) {
                setStats(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setAddMessage({ type: '', text: '' });
        setLoadingAdd(true);

        try {
            const res = await fetch('http://localhost:5000/api/users/pre-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newStudentEmail, name: newStudentName, role: 'student', classId: newStudentClass })
            });

            const data = await res.json();

            if (res.ok) {
                setAddMessage({ type: 'success', text: `Successfully pre-registered ${newStudentName}` });
                setNewStudentName('');
                setNewStudentEmail('');
            } else {
                setAddMessage({ type: 'error', text: data.error || 'Failed to pre-register student' });
            }
        } catch (error) {
            setAddMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoadingAdd(false);
        }
    };

    return (
        <Layout breadcrumbs={['Dashboard']}>
            <main className="p-8 max-w-7xl mx-auto w-full">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Good Morning, {currentUser?.displayName?.split(' ')[0] || 'Teacher'} <span className="inline-block animate-bounce ml-2">👋</span>
                    </h1>
                    <p className="text-textSecondary flex items-center text-sm font-medium">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="mx-3 text-white/20">|</span>
                        <span className="text-primary-400">Term 2 • Week 8</span>
                        <span className="mx-3 text-white/20">|</span>
                        You have 3 classes today
                    </p>
                </motion.div>

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

                    {/* ROW 1: Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Students" value={stats.totalStudents || 0} subtext={`across ${stats.totalClasses || 0} classes`} icon={<Users className="text-primary-400" />} color="primary" />
                        <StatCard title="Attendance Today" value={`${stats.attendanceToday || 0}%`} subtext="across all classes" icon={<UserCheck className="text-success" />} color="success" />
                        <StatCard title="Pending Assignments" value={stats.pendingAssignments || 0} subtext="due this week" icon={<FileText className="text-secondary" />} color="warning" />
                        <StatCard title="Upcoming Exams" value={stats.upcomingExams || 0} subtext="next 7 days" icon={<GraduationCap className="text-danger" />} color="danger" />
                    </div>

                    {/* ROW 2: Split (Chart & Timetable) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <motion.div variants={itemVariants} className="lg:col-span-7 xl:col-span-8 glass-card p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Attendance Trends</h2>
                                    <p className="text-xs text-textSecondary mt-1">Last 5 days across classes</p>
                                </div>
                                <button className="flex items-center text-xs text-textSecondary hover:text-white bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                                    This Week <ChevronDown className="w-3 h-3 ml-2" />
                                </button>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorG10" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="day" stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#F0F6FF' }}
                                        />
                                        <Area type="monotone" dataKey="Grade 10" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorG10)" />
                                        <Area type="monotone" dataKey="Grade 11" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-5 xl:col-span-4 glass-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white">Today's Timetable</h2>
                                <span className="text-xs font-mono text-primary-400 bg-primary-400/10 px-2 py-1 rounded">Thursday</span>
                            </div>
                            <div className="space-y-4">
                                {stats.todayTimetable?.length > 0 ? stats.todayTimetable.map((session) => (
                                    <div key={session.id} className={`relative pl-6 py-3 border border-white/5 rounded-xl transition-all ${session.active ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surfaceSolid'}`}>
                                        {/* Timeline dot */}
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#161B22] ${session.active ? 'bg-primary-500 shadow-[0_0_10px_#6366F1]' : 'bg-slate-600'}`}>
                                            {session.active && <div className="absolute inset-0 rounded-full animate-ping bg-primary-500 opacity-75"></div>}
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-mono text-textSecondary mb-1">{session.time} — {session.period} Pd</p>
                                                <p className={`font-bold ${session.active ? 'text-primary-300' : 'text-white'}`}>{session.subject}</p>
                                                <p className="text-sm text-textSecondary">Class: {session.class}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="text-sm text-textSecondary italic">No classes scheduled today.</div>}
                            </div>
                        </motion.div>
                    </div>

                    {/* ROW 3: Split (Submissions & Quick Actions) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <motion.div variants={itemVariants} className="lg:col-span-7 glass-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
                                <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-textSecondary uppercase bg-surfaceSolid/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-l-lg">Student</th>
                                            <th className="px-4 py-3 font-medium">Assignment</th>
                                            <th className="px-4 py-3 font-medium">Time</th>
                                            <th className="px-4 py-3 font-medium rounded-r-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats.recentSubmissions?.length > 0 ? stats.recentSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{sub.student}</td>
                                                <td className="px-4 py-3 text-textSecondary">{sub.assignment}</td>
                                                <td className="px-4 py-3 text-textSecondary font-mono text-xs">{sub.time}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${sub.status === 'Graded' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="4" className="text-center py-4 text-sm text-textSecondary italic">No recent submissions.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-5 glass-card p-6">
                            <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <QuickActionButton icon={<UserCheck className="w-6 h-6" />} label="Mark Attendance" color="from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20" />
                                <QuickActionButton icon={<Plus className="w-6 h-6" />} label="New Assignment" color="from-primary-500/20 to-primary-500/5 text-primary-400 border-primary-500/20" />
                                <QuickActionButton icon={<Megaphone className="w-6 h-6" />} label="Post Notice" color="from-secondary/20 to-secondary/5 text-secondary border-secondary/20" />
                                <QuickActionButton icon={<Download className="w-6 h-6" />} label="Export Reports" color="from-slate-500/20 to-slate-500/5 text-slate-300 border-slate-500/20" />
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h3 className="text-sm font-bold text-white mb-4 flex items-center">
                                    <UserCheck className="w-4 h-4 mr-2 text-primary-400" /> Pre-Register Student
                                </h3>
                                {addMessage.text && (
                                    <div className={`mb-3 p-2 rounded text-xs font-medium border ${addMessage.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                        {addMessage.text}
                                    </div>
                                )}
                                <form onSubmit={handleAddStudent} className="space-y-3">
                                    <input
                                        type="text"
                                        value={newStudentName}
                                        onChange={e => setNewStudentName(e.target.value)}
                                        required
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-primary-500 outline-none"
                                        placeholder="Student Full Name"
                                    />
                                    <input
                                        type="email"
                                        value={newStudentEmail}
                                        onChange={e => setNewStudentEmail(e.target.value)}
                                        required
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-primary-500 outline-none"
                                        placeholder="student@school.edu"
                                    />
                                    <select
                                        value={newStudentClass}
                                        onChange={e => setNewStudentClass(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-primary-500 outline-none"
                                    >
                                        <option value="class_1">Grade 12-A</option>
                                        <option value="class_2">Grade 11-B</option>
                                    </select>
                                    <button type="submit" disabled={loadingAdd} className="w-full btn-primary h-8 px-4 text-xs">
                                        {loadingAdd ? 'Adding...' : 'Authorize Student'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>

                    {/* ROW 4: Upcoming Events */}
                    <motion.div variants={itemVariants} className="w-full relative">
                        <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-4 px-2">Upcoming Events</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {events.map((ev) => (
                                <div key={ev.id} className="glass-card min-w-[300px] p-4 flex items-center space-x-4 border-l-4"
                                    style={{ borderLeftColor: ev.type === 'danger' ? '#F43F5E' : ev.type === 'warning' ? '#F59E0B' : '#6366F1' }}>
                                    <div className="bg-surfaceSolid rounded-lg px-3 py-2 text-center border border-white/5">
                                        <div className="text-xs text-textSecondary uppercase font-bold">{ev.date.split(' ')[0]}</div>
                                        <div className="text-lg font-display font-bold text-white">{ev.date.split(' ')[1]}</div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{ev.name}</h4>
                                        <span className="text-xs px-2 py-0.5 mt-1 inline-block rounded-full bg-white/5 text-textSecondary border border-white/10">{ev.tag}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </motion.div>
            </main>
        </Layout>
    );
}

// --- Subcomponents ---

function StatCard({ title, value, subtext, icon, color }) {
    const bgColors = {
        primary: 'bg-primary-500/10',
        success: 'bg-success/10',
        warning: 'bg-warning/10',
        danger: 'bg-danger/10',
    };

    return (
        <motion.div variants={itemVariants} className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${bgColors[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-textSecondary text-sm font-medium mb-1">{title}</h3>
                <div className="flex items-end justify-between">
                    <NumberCounter endValue={value} />
                    <span className="text-xs font-medium text-textSecondary mb-1 bg-surfaceSolid px-2 py-1 rounded border border-white/5">{subtext}</span>
                </div>
            </div>
        </motion.div>
    );
}

function NumberCounter({ endValue }) {
    const [count, setCount] = useState(0);
    const isPercent = String(endValue).includes('%');
    const target = parseInt(String(endValue).replace(/\D/g, ''));

    useEffect(() => {
        let start = 0;
        const duration = 1000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target]);

    return <span className="font-display text-3xl font-bold text-white">{count}{isPercent ? '%' : ''}</span>;
}

function QuickActionButton({ icon, label, color }) {
    return (
        <button className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-gradient-to-b ${color} hover:brightness-125 hover:shadow-lg transition-all active:scale-95`}>
            <div className="mb-2">{icon}</div>
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
}
