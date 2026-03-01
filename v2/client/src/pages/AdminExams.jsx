import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { GraduationCap, Search, Filter, TrendingUp, AlertCircle, Users, Award, BookOpen } from 'lucide-react';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalExams: 0, pendingGrades: 0, avgSchoolScore: 0, highestAvg: 0 });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/exams');
      const data = await res.json();
      if (data.data) {
        let pending = 0;
        let totalScoreSum = 0;
        let gradedExamsCount = 0;
        let maxAvg = 0;

        const formatted = data.data.map(item => {
          if (item.status === 'Scheduled' || item.status === 'Grading') pending++;

          let avg = 0;
          if (item.analytics && item.analytics.averageMarks) {
            avg = parseFloat(item.analytics.averageMarks);
            totalScoreSum += avg;
            gradedExamsCount++;
            if (avg > maxAvg) maxAvg = avg;
          }

          return {
            id: item.id,
            title: item.title,
            teacher: item.teacherEmail || 'Unknown Teacher',
            class: item.classId,
            date: new Date(item.date).toLocaleDateString(),
            status: item.status || 'Scheduled',
            type: item.type,
            average: avg > 0 ? avg : null
          };
        });

        setExams(formatted.reverse());
        setMetrics({
          totalExams: formatted.length,
          pendingGrades: pending,
          avgSchoolScore: gradedExamsCount > 0 ? Math.round(totalScoreSum / gradedExamsCount) : 0,
          highestAvg: Math.round(maxAvg)
        });
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout breadcrumbs={['Administration', 'Exams & Results Audit']}>
      <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Exams & Results Audit</h1>
            <p className="text-textSecondary text-sm">Oversee school-wide assessment performance and grade distributions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Assessments" value={metrics.totalExams} icon={<BookOpen className="w-5 h-5 text-primary-400" />} color="primary-500" />
          <MetricCard title="Pending Grading" value={metrics.pendingGrades} icon={<AlertCircle className="w-5 h-5 text-warning" />} color="warning" />
          <MetricCard title="School Average" value={`${metrics.avgSchoolScore}%`} icon={<GraduationCap className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
          <MetricCard title="Highest Class Avg" value={`${metrics.highestAvg}%`} icon={<Award className="w-5 h-5 text-secondary" />} color="secondary" trend="Up 4% this term" trendUp={true} />
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
                  <th className="px-6 py-4 font-bold tracking-wider">Exam Title & Type</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Teacher</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Class</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Class Average</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12"><div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto"></div></td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-textSecondary italic">No exams have been scheduled yet.</td>
                  </tr>
                ) : exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-1">{exam.title}</div>
                      <div className="text-[10px] uppercase font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded w-fit border border-primary-500/20">{exam.type}</div>
                    </td>
                    <td className="px-6 py-4 flex items-center mt-2">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center mr-3">
                        <Users className="w-3 h-3 text-primary-400" />
                      </div>
                      <span className="text-white">{exam.teacher.split('@')[0]}</span>
                    </td>
                    <td className="px-6 py-4">{exam.class}</td>
                    <td className="px-6 py-4 font-mono text-xs">{exam.date}</td>
                    <td className="px-6 py-4 text-center">
                      {exam.average !== null ? (
                        <span className="font-mono font-bold text-white bg-white/5 px-3 py-1 rounded border border-white/10">{Math.round(exam.average)}%</span>
                      ) : (
                        <span className="text-textSecondary italic text-xs">Awaiting Grades</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={exam.status} />
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
    Scheduled: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    Grading: 'bg-warning/10 text-warning border-warning/20',
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
