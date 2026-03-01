import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Download, Printer, Filter, Search, ChevronDown, ListFilter,
    TrendingUp, Award, CheckCircle2, AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';

// Mock Data
const ATTENDANCE_TREND = [
    { name: 'Week 1', 'Grade 10': 94, 'Grade 11': 92, 'Grade 12': 90 },
    { name: 'Week 2', 'Grade 10': 96, 'Grade 11': 91, 'Grade 12': 89 },
    { name: 'Week 3', 'Grade 10': 95, 'Grade 11': 93, 'Grade 12': 94 },
    { name: 'Week 4', 'Grade 10': 92, 'Grade 11': 90, 'Grade 12': 91 },
    { name: 'Week 5', 'Grade 10': 97, 'Grade 11': 95, 'Grade 12': 96 },
];

const GRADE_DISTRIBUTION = [
    { grade: 'A+', count: 15 },
    { grade: 'A', count: 28 },
    { grade: 'B', count: 42 },
    { grade: 'C', count: 20 },
    { grade: 'D', count: 8 },
    { grade: 'F', count: 2 },
];

const ASSIGNMENT_COMPLETION = [
    { name: 'Week 1', Completed: 85, Late: 10, Missing: 5 },
    { name: 'Week 2', Completed: 88, Late: 8, Missing: 4 },
    { name: 'Week 3', Completed: 92, Late: 5, Missing: 3 },
    { name: 'Week 4', Completed: 80, Late: 15, Missing: 5 },
    { name: 'Week 5', Completed: 90, Late: 8, Missing: 2 },
];

const TOP_PERFORMERS = [
    { id: 1, name: 'Ananya Verma', avatar: 'https://i.pravatar.cc/150?img=15', score: 98, trend: '+2%' },
    { id: 2, name: 'Aarav Patel', avatar: 'https://i.pravatar.cc/150?img=11', score: 95, trend: '+1%' },
    { id: 3, name: 'Isha Singh', avatar: 'https://i.pravatar.cc/150?img=14', score: 94, trend: '-1%' },
    { id: 4, name: 'Kabir Das', avatar: 'https://i.pravatar.cc/150?img=16', score: 91, trend: '0%' },
];

export default function Analytics() {
    const customTooltipStyle = { backgroundColor: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F0F6FF' };

    return (
        <Layout breadcrumbs={['Analytics & Reports']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col">
                {/* Header & Filter Bar */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col mb-8 gap-6 shadow-sm">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-white mb-2 flex items-center"><TrendingUp className="w-8 h-8 mr-3 text-primary-400" /> Institution Analytics</h1>
                            <p className="text-textSecondary text-sm flex items-center">
                                <Filter className="w-4 h-4 mr-2" /> Global dataset reflecting Term 1 performance.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surfaceSolid border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-bold">
                                <Download className="w-4 h-4" /> <span>Download CSV</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surfaceSolid border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-bold">
                                <Printer className="w-4 h-4" /> <span>Print Full Report</span>
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-4 flex flex-wrap gap-4 items-center">
                        <select className="input-field max-w-[180px] bg-surfaceSolid/50 p-2 text-sm border-white/10 text-white">
                            <option>All Classes</option>
                            <option>Grade 12</option>
                            <option>Grade 11</option>
                        </select>
                        <select className="input-field max-w-[180px] bg-surfaceSolid/50 p-2 text-sm border-white/10 text-white">
                            <option>All Subjects</option>
                            <option>Mathematics</option>
                            <option>Physics</option>
                        </select>
                        <select className="input-field max-w-[200px] bg-surfaceSolid/50 p-2 text-sm border-white/10 text-white">
                            <option>Last 30 Days</option>
                            <option>Term 1 (Sep - Dec)</option>
                            <option>Year to Date</option>
                        </select>
                        <button className="ml-auto flex items-center space-x-2 px-4 py-2 rounded bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all text-sm font-bold border border-primary-500/20">
                            <ListFilter className="w-4 h-4" /> <span>Apply Filters</span>
                        </button>
                    </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Chart 1: Attendance Trend */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 min-h-[350px] flex flex-col">
                        <div className="flex justify-between w-full mb-6">
                            <h3 className="font-bold text-white text-lg">Attendance Trend (%)</h3>
                            <button className="text-textSecondary hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ATTENDANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                                    <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#F0F6FF' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8B99B5' }} />
                                    <Line type="monotone" dataKey="Grade 10" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="Grade 11" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="Grade 12" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Chart 2: Grade Distribution */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 min-h-[350px] flex flex-col">
                        <div className="flex justify-between w-full mb-6">
                            <h3 className="font-bold text-white text-lg">Grade Distribution</h3>
                            <button className="text-textSecondary hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={GRADE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="grade" stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40}>
                                        {GRADE_DISTRIBUTION.map((entry, index) => {
                                            let color = '#4f46e5';
                                            if (entry.grade === 'F') color = '#F43F5E';
                                            if (entry.grade === 'A+' || entry.grade === 'A') color = '#10B981';
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Chart 3: Assignment Completion Rate */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 min-h-[350px] flex flex-col">
                        <div className="flex justify-between w-full mb-6">
                            <h3 className="font-bold text-white text-lg flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-primary-400" /> Completion Rate</h3>
                            <button className="text-textSecondary hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ASSIGNMENT_COMPLETION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} hide />
                                    <YAxis dataKey="name" type="category" stroke="#8B99B5" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                    <RechartsTooltip contentStyle={customTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={20} />
                                    <Bar dataKey="Late" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="Missing" stackId="a" fill="#F43F5E" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Chart 4: Top 10 Performers */}
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 min-h-[350px] flex flex-col">
                        <div className="flex justify-between w-full mb-6">
                            <h3 className="font-bold text-white text-lg flex items-center"><Award className="w-5 h-5 mr-2 text-warning" /> Top Performers</h3>
                            <button className="text-textSecondary hover:text-white bg-white/5 text-xs px-3 py-1.5 rounded-md border border-white/10">View All</button>
                        </div>

                        <div className="flex-1 w-full space-y-4 pt-2">
                            {TOP_PERFORMERS.map((student, idx) => (
                                <div key={student.id} className="flex items-center space-x-4 group border border-transparent hover:border-white/5 hover:bg-white/5 p-2 rounded-xl transition-all">
                                    <span className="font-display font-bold text-2xl text-slate-700 w-6 drop-shadow-md group-hover:text-primary-500 transition-colors">{idx + 1}</span>
                                    <img src={student.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-white/10" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-sm">{student.name}</h4>
                                        <div className="w-full h-1.5 bg-background rounded-full mt-1.5 relative overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${student.score}%` }}
                                                transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-[0_0_10px_#6366F1]"
                                            ></motion.div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-display font-bold text-lg text-white">{student.score}%</span>
                                        <span className="block text-xs font-bold text-success">{student.trend}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>
        </Layout>
    );
}

function MoreVertical(props) {
    // Polyfill for lucide icon missing from imports above if not explicitly destructured
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
        </svg>
    );
}
