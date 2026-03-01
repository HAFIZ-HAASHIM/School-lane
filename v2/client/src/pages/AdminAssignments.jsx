import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, TrendingUp, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ total: 0, active: 0, graded: 0, overallSubmissionRate: 0 });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assignments');
      const data = await res.json();
      if (data.data) {
        let active = 0, graded = 0, totalSubmissions = 0;
        // Assuming an average class size of 30 for the prototype metric
        const AVG_CLASS_SIZE = 30;

        const formatted = data.data.map(item => {
          if (item.status === 'active') active++;
          else graded++;

          totalSubmissions += (item.submittedCount || 0);

          return {
            id: item.id,
            title: item.title,
            teacher: item.teacherEmail || 'Unknown Teacher',
            class: item.classId,
            dueDate: item.dueDate,
            submitted: item.submittedCount || 0,
            total: AVG_CLASS_SIZE,
            status: item.status === 'active' ? 'Active' : 'Graded',
            type: item.type
          };
        });

        setAssignments(formatted.reverse());

        const possibleSubmissions = formatted.length * AVG_CLASS_SIZE;
        const submissionRate = possibleSubmissions > 0 ? Math.round((totalSubmissions / possibleSubmissions) * 100) : 0;

        setMetrics({
          total: formatted.length,
          active,
          graded,
          overallSubmissionRate: submissionRate
        });
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout breadcrumbs={['Administration', 'Assignments Audit']}>
      <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Assignments Audit</h1>
            <p className="text-textSecondary text-sm">Oversee school-wide coursework volume and submission compliance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Assignments" value={metrics.total} icon={<FileText className="w-5 h-5 text-primary-400" />} color="primary-500" />
          <MetricCard title="Active (Ungraded)" value={metrics.active} icon={<AlertCircle className="w-5 h-5 text-warning" />} color="warning" />
          <MetricCard title="Fully Graded" value={metrics.graded} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
          <MetricCard title="Global Turn-in Rate" value={`${metrics.overallSubmissionRate}%`} icon={<TrendingUp className="w-5 h-5 text-secondary" />} color="secondary" trend="Up 2% this week" trendUp={true} />
        </div>

        <div className="glass-card flex flex-col flex-1 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surfaceSolid/50">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input type="text" placeholder="Search by teacher or title..." className="input-field pl-10 border-none bg-background text-sm" />
            </div>
            <button className="flex items-center text-sm font-bold text-textSecondary hover:text-white transition-colors p-2 bg-white/5 rounded-lg border border-white/10">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-textSecondary whitespace-nowrap">
              <thead className="text-xs uppercase bg-surfaceSolid/80 text-textSecondary sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Title & Type</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Teacher</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Class</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Due Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Submission Rate</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12"><div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto"></div></td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-textSecondary italic">No assignments found.</td>
                  </tr>
                ) : assignments.map(assignment => (
                  <tr key={assignment.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">{assignment.title}</div>
                      <div className="text-[10px] uppercase font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded w-fit border border-primary-500/20">{assignment.type}</div>
                    </td>
                    <td className="px-6 py-4 flex items-center mt-2">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                        <Users className="w-3 h-3 text-primary-400" />
                      </div>
                      <span className="text-white">{assignment.teacher.split('@')[0]}</span>
                    </td>
                    <td className="px-6 py-4">{assignment.class}</td>
                    <td className="px-6 py-4 font-mono text-xs">{assignment.dueDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <div className="flex-1 max-w-[120px] bg-background rounded-full h-1.5 mr-3 border border-white/5">
                          <div className={`h-1.5 rounded-full ${assignment.submitted === assignment.total ? 'bg-success' : 'bg-primary-500'}`} style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}></div>
                        </div>
                        <span className="font-mono text-white min-w-[30px]">{Math.round((assignment.submitted / assignment.total) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={assignment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    Graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-white/5 text-textSecondary border-white/10'}`}>
      {status}
    </span>
  );
}

function MetricCard({ title, value, icon, color, trend, trendUp }) {
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
