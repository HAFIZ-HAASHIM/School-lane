import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Server, Activity, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeTeachers: 0,
        activeStudents: 0,
        systemHealth: '100%'
    });
    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherEmail, setNewTeacherEmail] = useState('');
    const [addMessage, setAddMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [systemLogs, setSystemLogs] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/stats');
                const data = await res.json();
                if (data.data) {
                    setStats({
                        totalUsers: data.data.totalUsers || 0,
                        activeTeachers: data.data.activeTeachers || 0,
                        activeStudents: data.data.activeStudents || 0,
                        systemHealth: data.data.systemHealth || '100%'
                    });
                    setSystemLogs(data.data.systemLogs || []);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };

        fetchStats();
    }, []);

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setAddMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/users/pre-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newTeacherEmail, name: newTeacherName, role: 'teacher' })
            });

            const data = await res.json();

            if (res.ok) {
                setAddMessage({ type: 'success', text: `Successfully pre-registered ${newTeacherName} (${newTeacherEmail})` });
                setNewTeacherName('');
                setNewTeacherEmail('');
            } else {
                setAddMessage({ type: 'error', text: data.error || 'Failed to pre-register teacher' });
            }
        } catch (error) {
            setAddMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout breadcrumbs={['Admin Dashboard']}>
            <main className="p-8 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        System Administration <span className="text-primary-400">Terminal</span>
                    </h1>
                    <p className="text-textSecondary text-sm font-medium">
                        Welcome back, Admin. System systems are optimal.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="text-primary-400" />} color="primary" />
                    <StatCard title="Active Teachers" value={stats.activeTeachers} icon={<ShieldCheck className="text-success" />} color="success" />
                    <StatCard title="Active Students" value={stats.activeStudents} icon={<Users className="text-warning" />} color="warning" />
                    <StatCard title="System Uptime" value={stats.systemHealth} icon={<Activity className="text-secondary" />} color="secondary" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Recent System Logs</h2>
                        <div className="space-y-3 font-mono text-sm max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {systemLogs.length > 0 ? (
                                systemLogs.map(log => (
                                    <LogEntry key={log.id || log.timestamp} time={new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} msg={log.msg} type={log.type} />
                                ))
                            ) : (
                                <div className="text-textSecondary italic">No system logs available.</div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Quick Tools</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-surfaceSolid border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left">
                                <Users className="text-primary-400 mb-2" />
                                <div className="font-bold text-white">Manage Users</div>
                                <div className="text-xs text-textSecondary mt-1">Add/Edit Roles</div>
                            </button>
                            <button className="p-4 bg-surfaceSolid border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-left">
                                <Server className="text-secondary mb-2" />
                                <div className="font-bold text-white">Database</div>
                                <div className="text-xs text-textSecondary mt-1">Manage Firestore</div>
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <h3 className="font-bold text-white mb-4 flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-2 text-success" /> Pre-Register New Teacher
                            </h3>
                            {addMessage.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${addMessage.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                    {addMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleAddTeacher} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={newTeacherName}
                                        onChange={e => setNewTeacherName(e.target.value)}
                                        required
                                        className="input-field bg-surfaceSolid/50"
                                        placeholder="Teacher Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Email Address</label>
                                    <input
                                        type="email"
                                        value={newTeacherEmail}
                                        onChange={e => setNewTeacherEmail(e.target.value)}
                                        required
                                        className="input-field bg-surfaceSolid/50"
                                        placeholder="teacher@school.edu"
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full btn-primary h-10 px-4 mt-2">
                                    {loading ? 'Processing...' : 'Authorize Teacher'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

function StatCard({ title, value, icon, color }) {
    const bgColors = {
        primary: 'bg-primary-500/10',
        success: 'bg-success/10',
        warning: 'bg-warning/10',
        danger: 'bg-danger/10',
        secondary: 'bg-secondary/10'
    };
    return (
        <div className="glass-card p-6 flex items-center justify-between hover:-translate-y-1 transition-transform">
            <div>
                <p className="text-sm text-textSecondary font-medium mb-1">{title}</p>
                <p className="text-3xl font-display font-bold text-white">{value}</p>
            </div>
            <div className={`p-4 rounded-xl ${bgColors[color]}`}>
                {icon}
            </div>
        </div>
    );
}

function LogEntry({ time, msg, type }) {
    const colors = {
        info: 'text-primary-300',
        success: 'text-success',
        danger: 'text-danger',
        warning: 'text-warning'
    };
    return (
        <div className="flex space-x-3 border-b border-white/5 pb-2">
            <span className="text-textSecondary">[{time}]</span>
            <span className={colors[type]}>{msg}</span>
        </div>
    );
}
