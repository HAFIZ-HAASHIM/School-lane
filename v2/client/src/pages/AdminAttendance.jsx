import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle, TrendingDown } from 'lucide-react';

export default function AdminAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    classes: []
  });

  useEffect(() => {
    fetchSummary();
  }, [date]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/summary?date=${date}`);
      const json = await res.json();
      if (json.data) {
        setSummary(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallPercentage = summary.totalStudents > 0
    ? Math.round((summary.totalPresent / summary.totalStudents) * 100)
    : 0;

  // Find classes with < 75% attendance
  const lowAttendanceClasses = summary.classes.filter(c => c.attendancePercentage < 75 && c.studentCount > 0);

  return (
    <Layout breadcrumbs={['Administration', 'Attendance Logs']}>
      <main className="p-8 max-w-7xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center">
              School-Wide Attendance
            </h1>
            <p className="text-textSecondary text-sm mt-1">Monitor daily attendance trends across all classes.</p>
          </div>
          <div className="flex items-center space-x-3 bg-surfaceSolid/50 p-2 rounded-xl border border-white/5">
            <Calendar className="w-5 h-5 text-primary-400 ml-2" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input-field bg-transparent border-none w-[150px] text-sm focus:ring-0"
            />
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value={summary.totalStudents} icon={<Users className="w-6 h-6 text-primary-400" />} color="primary" />
          <StatCard title="Present" value={summary.totalPresent} icon={<CheckCircle className="w-6 h-6 text-success" />} color="success" />
          <StatCard title="Absent" value={summary.totalAbsent} icon={<XCircle className="w-6 h-6 text-danger" />} color="danger" />
          <StatCard title="Overall Rate" value={`${overallPercentage}%`} icon={<TrendingDown className="w-6 h-6 text-warning" />} color="warning" />
        </div>

        {/* Low Attendance Alerts */}
        {lowAttendanceClasses.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-danger mb-1">Low Attendance Alert</h3>
              <p className="text-xs text-danger/80">The following classes have an attendance rate below 75% today:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowAttendanceClasses.map(c => (
                  <span key={c.id} className="text-xs font-bold px-2 py-1 bg-danger/20 text-danger rounded">
                    {c.name} ({c.attendancePercentage}%)
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Classes Breakdown */}
        <div className="glass-card flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surfaceSolid/30">
            <h2 className="text-lg font-bold text-white">Class-wise Breakdown</h2>
          </div>
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceSolid/50 border-b border-white/5 text-xs uppercase tracking-wider text-textSecondary font-bold">
                  <th className="p-4 pl-6 whitespace-nowrap">Class Name</th>
                  <th className="p-4 whitespace-nowrap">Class Teacher</th>
                  <th className="p-4 text-center whitespace-nowrap">Students</th>
                  <th className="p-4 text-center whitespace-nowrap">Present</th>
                  <th className="p-4 whitespace-nowrap w-48">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse bg-white/5">
                      <td className="p-4 pl-6"><div className="w-32 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-40 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-12 h-4 bg-white/10 rounded mx-auto"></div></td>
                      <td className="p-4"><div className="w-12 h-4 bg-white/10 rounded mx-auto"></div></td>
                      <td className="p-4"><div className="w-full h-2 bg-white/10 rounded mt-2"></div></td>
                    </tr>
                  ))
                ) : summary.classes.length > 0 ? (
                  summary.classes.sort((a, b) => b.attendancePercentage - a.attendancePercentage).map(cls => (
                    <tr key={cls.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 pl-6 font-bold text-white group-hover:text-primary-400 transition-colors">{cls.name}</td>
                      <td className="p-4 text-sm text-textSecondary">{cls.teacherName || 'Unassigned'}</td>
                      <td className="p-4 text-center font-mono text-sm">{cls.studentCount}</td>
                      <td className="p-4 text-center font-mono text-sm text-success font-bold">{cls.presentCount}</td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs font-bold w-9 text-right ${cls.attendancePercentage >= 90 ? 'text-success' : cls.attendancePercentage >= 75 ? 'text-warning' : 'text-danger'}`}>
                            {cls.attendancePercentage}%
                          </span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cls.attendancePercentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className={`h-full rounded-full ${cls.attendancePercentage >= 90 ? 'bg-success' : cls.attendancePercentage >= 75 ? 'bg-warning' : 'bg-danger'}`}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-textSecondary italic">
                      No classes found. Please ensure classes are active and students are enrolled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }) {
  const bgColors = {
    primary: 'bg-primary-500/10 border-primary-500/20',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    danger: 'bg-danger/10 border-danger/20',
    secondary: 'bg-secondary/10 border-secondary/20'
  };
  return (
    <div className={`glass-card p-6 border ${bgColors[color]} flex items-center justify-between`}>
      <div>
        <p className="text-xs text-textSecondary font-bold uppercase tracking-wider mb-2">{title}</p>
        <p className={`text-3xl font-display font-bold text-white`}>{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-white/5 border border-white/5`}>
        {icon}
      </div>
    </div>
  );
}
