import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap, Calendar, CheckCircle, Clock, XCircle, ChevronDown, ChevronRight, FileText, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function StudentExams() {
    const { currentUser } = useAuth();
    const [examsList, setExamsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ highestGrade: '-', avgGrade: 0, examsTaken: 0, examsPending: 0 });

    useEffect(() => {
        if (currentUser) {
            fetchStudentExams();
        }
    }, [currentUser]);

    const fetchStudentExams = async () => {
        try {
            // 1. Get Student Class ID
            const meRes = await fetch(`http://localhost:5000/api/dashboard/student?uid=${currentUser.uid}`);
            const meData = await meRes.json();
            const classId = meData.classId;

            if (!classId) {
                setLoading(false);
                return;
            }

            // 2. Get Exams for Class
            const examsRes = await fetch(`http://localhost:5000/api/exams?classId=${classId}`);
            const examsData = await examsRes.json();
            let allExams = examsData.data || [];

            // 3. Get Student's Marks
            const marksRes = await fetch(`http://localhost:5000/api/exams/student/${currentUser.uid}/marks`);
            const marksData = await marksRes.json();
            const myMarks = marksData.data || [];

            let taken = 0;
            let pending = 0;
            let totalGradeSum = 0;
            let highest = 0;

            const merged = allExams.map(exam => {
                const myMarkDoc = myMarks.find(m => m.examId === exam.id);
                const mark = myMarkDoc ? myMarkDoc.marks : null;
                const max = exam.totalMarks || 100;

                if (mark !== null) {
                    taken++;
                    const percent = (mark / max) * 100;
                    totalGradeSum += percent;
                    if (percent > highest) highest = percent;
                } else {
                    pending++;
                }

                return {
                    id: exam.id,
                    title: exam.title,
                    type: exam.type || 'Exam',
                    date: new Date(exam.date).toLocaleDateString() || '--',
                    totalMarks: max,
                    obtained: mark,
                    status: mark !== null ? 'Graded' : (new Date(exam.date) < new Date() ? 'Awaiting Grades' : 'Upcoming'),
                    classAvg: exam.analytics?.averageMarks || null
                };
            });

            // Group by Type (e.g. Unit Test, Midterm)
            const grouped = {};
            merged.forEach(ex => {
                if (!grouped[ex.type]) grouped[ex.type] = [];
                grouped[ex.type].push(ex);
            });

            const finalList = Object.keys(grouped).map(key => ({
                term: key,
                exams: grouped[key]
            }));

            setExamsList(finalList);
            setMetrics({
                highestGrade: taken > 0 ? getGrade(highest).letter : '-',
                avgGrade: taken > 0 ? Math.round(totalGradeSum / taken) : 0,
                examsTaken: taken,
                examsPending: pending
            });

        } catch (error) {
            console.error('Failed to fetch exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { letter: 'A+', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (percentage >= 80) return { letter: 'A', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' };
        if (percentage >= 70) return { letter: 'B', color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' };
        if (percentage >= 60) return { letter: 'C', color: 'text-warning bg-warning/10 border-warning/20' };
        if (percentage >= 50) return { letter: 'D', color: 'text-warning bg-warning/10 border-warning/20' };
        return { letter: 'F', color: 'text-danger bg-danger/10 border-danger/20' };
    };

    return (
        <Layout breadcrumbs={['My Assessment Results']}>
            <main className="p-8 max-w-[1200px] mx-auto w-full flex flex-col h-full">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Report Card & Exams</h1>
                        <p className="text-textSecondary text-sm mt-1">Track your academic progress and upcoming assessments.</p>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors">
                        <Download className="w-4 h-4 mr-2" /> Download Report PDF
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <MetricCard title="Overall Average" value={`${metrics.avgGrade}%`} icon={<Award className="w-5 h-5 text-primary-400" />} color="primary-500" />
                    <MetricCard title="Highest Grade" value={metrics.highestGrade} icon={<GraduationCap className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
                    <MetricCard title="Exams Taken" value={metrics.examsTaken} icon={<CheckCircle className="w-5 h-5 text-secondary" />} color="secondary" />
                    <MetricCard title="Upcoming / Pending" value={metrics.examsPending} icon={<Clock className="w-5 h-5 text-warning" />} color="warning" />
                </div>

                {loading ? (
                    <div className="glass-card p-12 flex justify-center items-center h-64 border border-white/5">
                        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : examsList.length === 0 ? (
                    <div className="glass-card p-12 flex flex-col justify-center items-center h-64 border border-white/5 text-center">
                        <FileText className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Exams Found</h3>
                        <p className="text-textSecondary max-w-sm">You do not have any scheduled or graded exams recorded currently.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {examsList.map((group, idx) => (
                            <div key={idx} className="glass-card border border-white/5 overflow-hidden">
                                <div className="p-4 border-b border-white/5 bg-surfaceSolid/50">
                                    <h3 className="font-bold text-white uppercase tracking-wider">{group.term}</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {group.exams.map((exam) => (
                                        <div key={exam.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/5 transition-colors gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-white mb-1">{exam.title}</h4>
                                                <div className="flex items-center space-x-4 text-xs font-medium">
                                                    <span className="flex items-center text-textSecondary"><Calendar className="w-3.5 h-3.5 mr-1" /> {exam.date}</span>
                                                    <span className={`px-2 py-0.5 rounded border uppercase tracking-widest text-[10px] ${exam.status === 'Graded' ? 'bg-success/10 text-success border-success/20' : exam.status === 'Upcoming' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                                        {exam.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {exam.obtained !== null ? (
                                                <div className="flex items-center space-x-6">
                                                    <div className="text-right">
                                                        <div className="text-[10px] uppercase font-bold text-textSecondary tracking-wider mb-1">Score</div>
                                                        <div className="font-display font-bold text-2xl text-white">{exam.obtained}<span className="text-sm text-textSecondary">/{exam.totalMarks}</span></div>
                                                    </div>
                                                    <div className="hidden md:block w-px h-10 bg-white/10"></div>
                                                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                                                        <div className={`text-xl font-display font-bold w-12 h-12 flex items-center justify-center rounded-xl border ${getGrade((exam.obtained / exam.totalMarks) * 100).color}`}>
                                                            {getGrade((exam.obtained / exam.totalMarks) * 100).letter}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-right text-textSecondary italic text-sm py-4">
                                                    {exam.status === 'Upcoming' ? 'Exam scheduled' : 'Waiting on teacher grading'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </Layout>
    );
}

function MetricCard({ title, value, icon, color }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-textSecondary">{title}</p>
                    <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
                        {icon}
                    </div>
                </div>
                <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
            </div>
        </motion.div>
    );
}
