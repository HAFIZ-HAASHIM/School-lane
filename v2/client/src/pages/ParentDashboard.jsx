import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, BookOpen, Clock, Calendar as CalendarIcon, ArrowUpRight,
    TrendingUp, Award, Bell, CheckCircle2, FileText, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function ParentDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        attendance: "0%",
        averageScore: "0",
        pendingHomework: 0,
        upcomingExams: 0,
        attendanceWeekly: [],
        performance: [],
        notices: []
    });

    useEffect(() => {
        const fetchParentStats = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/dashboard/parent?email=${currentUser?.email}`);
                const { data } = await res.json();
                if (data) {
                    setStats({
                        attendance: data.attendance || "0%",
                        averageScore: data.averageScore || "0",
                        pendingHomework: data.pendingHomework || 0,
                        upcomingExams: data.upcomingExams || 0,
                        attendanceWeekly: data.attendanceWeekly || [],
                        performance: data.performance || [],
                        notices: data.notices || []
                    });
                }
            } catch (error) {
                console.error("Failed to fetch parent dashboard stats");
            }
        };

        if (currentUser?.email) fetchParentStats();
    }, [currentUser]);

    return (
        <Layout breadcrumbs={['Parent Portal']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-white mb-2 tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary">{currentUser?.displayName?.split(' ')[0] || 'Parent'}</span>
                        </h1>
                        <p className="text-textSecondary text-lg max-w-2xl">Here is the latest progress report for your child.</p>
                    </div>
                </motion.div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard title="Overall Attendance" value={stats.attendance} icon={<Clock className="w-5 h-5 text-warning" />} color="warning" />
                    <MetricCard title="Average Score" value={stats.averageScore} icon={<Award className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
                    <MetricCard title="Pending Homework" value={stats.pendingHomework} icon={<BookOpen className="w-5 h-5 text-primary-400" />} color="primary-500" />
                    <MetricCard title="Upcoming Exams" value={stats.upcomingExams} icon={<CalendarIcon className="w-5 h-5 text-secondary" />} color="secondary" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Attendance Chart */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-white mb-1">Weekly Attendance</h2>
                                    <p className="text-sm text-textSecondary">Your child was absent on Wednesday.</p>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.attendanceWeekly}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="none" tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                        <YAxis stroke="none" tick={{ fill: '#94A3B8', fontSize: 12 }} dx={-10} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Recent Academics */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 border border-white/5">
                            <h2 className="font-display text-xl font-bold text-white mb-6">Subject Performance</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.performance} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" stroke="none" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                                        <YAxis dataKey="subject" type="category" stroke="none" tick={{ fill: '#94A3B8', fontSize: 12 }} width={80} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Bar dataKey="score" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Notices & Agenda */}
                    <div className="space-y-8">
                        {/* Important Notices */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border border-white/5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display text-xl font-bold text-white flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-warning" /> School Notices
                                </h2>
                            </div>

                            <div className="space-y-4 flex-1">
                                {stats.notices?.length > 0 ? stats.notices.map(notice => (
                                    <div key={notice.id || notice.title} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-white text-sm flex items-center">
                                                {notice.type === 'warning' && <AlertTriangle className="w-4 h-4 mr-1.5 text-danger" />}
                                                {notice.title}
                                            </h4>
                                            <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider">{notice.date || notice.type}</span>
                                        </div>
                                        <p className="text-xs text-textSecondary leading-relaxed">{notice.desc}</p>
                                    </div>
                                )) : <p className="text-sm text-textSecondary italic">No urgent notices.</p>}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5">
                                <h3 className="text-sm font-bold text-white mb-4">Pending Homework</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 rounded bg-danger/10 border border-danger/20">
                                        <div>
                                            <p className="text-xs font-bold text-danger">Linear Equation Practice</p>
                                            <p className="text-[10px] text-danger/70">Due: Yesterday</p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-danger px-2 border border-danger/20 rounded">Late</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded bg-surfaceSolid border border-white/5">
                                        <div>
                                            <p className="text-xs font-bold text-white">English Essay Draft</p>
                                            <p className="text-[10px] text-textSecondary">Due: Tomorrow</p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-warning px-2 border border-warning/20 rounded">Pending</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

function MetricCard({ title, value, icon, trend, trendUp, color }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-textSecondary mb-1">{title}</p>
                    <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-${color}/10 border border-${color}/20`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm font-medium relative z-10">
                    <span className={`flex items-center ${trendUp ? 'text-emerald-400' : 'text-danger'}`}>
                        {trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 rotate-180" />}
                        {trend}
                    </span>
                    <span className="text-textSecondary ml-2 text-xs">vs last week</span>
                </div>
            )}
        </motion.div>
    );
}
