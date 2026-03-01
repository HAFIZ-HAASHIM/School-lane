import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Clock, FileText, CheckCircle2, Upload, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function StudentAssignments() {
    const { currentUser } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submitFile, setSubmitFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) fetchStudentAssignments();
    }, [currentUser]);

    const fetchStudentAssignments = async () => {
        setLoading(true);
        try {
            // First get the student's classId
            const stRes = await fetch(`http://localhost:5000/api/users`);
            const stJson = await stRes.json();
            const me = stJson.data?.find(u => u.email === currentUser.email);

            if (me && me.classId) {
                const res = await fetch(`http://localhost:5000/api/assignments?classId=${me.classId}`);
                const data = await res.json();
                if (data.data) {
                    // check if student has already submitted
                    for (let i = 0; i < data.data.length; i++) {
                        const item = data.data[i];
                        const subRes = await fetch(`http://localhost:5000/api/assignments/${item.id}/submissions`);
                        const subJson = await subRes.json();
                        const mySub = subJson.data?.find(s => s.studentId === currentUser.uid);
                        item.mySubmission = mySub || null;
                        item.status = mySub ? (mySub.score ? 'Graded' : 'Submitted') : 'Pending';
                    }
                    setAssignments(data.data.reverse());
                }
            }
        } catch (error) {
            console.error('Failed to fetch assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmitFile(null);
    };

    const handleSubmitAssignment = async () => {
        if (!submitFile || !selectedAssignment) return;
        setSubmitting(true);
        try {
            await fetch(`http://localhost:5000/api/assignments/${selectedAssignment.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: currentUser.uid,
                    studentName: currentUser.displayName || 'Student',
                    fileName: submitFile.name
                })
            });
            setSelectedAssignment(null);
            fetchStudentAssignments();
        } catch (error) {
            console.error('Failed to submit:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout breadcrumbs={['My Coursework']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col min-h-full pb-24">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2">My Assignments</h1>
                    <p className="text-textSecondary text-sm">View and submit your coursework.</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {assignments.map(assignment => (
                            <div key={assignment.id} className="glass-card flex flex-col hover:-translate-y-1 transition-all duration-300">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                            {assignment.type}
                                        </span>
                                        <StatusBadge status={assignment.status} />
                                    </div>
                                    <h3 className="font-display text-lg font-bold text-white mb-2 pr-4">{assignment.title}</h3>
                                    <p className="text-sm text-textSecondary line-clamp-2 mb-4">{assignment.description}</p>

                                    <div className="space-y-2 mt-auto text-sm text-textSecondary bg-white/5 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Due Date</span>
                                            <span className="font-bold text-white">{assignment.dueDate}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Points</span>
                                            <span className="font-bold text-white">{assignment.points}</span>
                                        </div>
                                        {assignment.mySubmission?.score !== null && assignment.mySubmission?.score !== undefined && (
                                            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                                                <span className="flex items-center text-success"><CheckCircle2 className="w-4 h-4 mr-2" /> Graded</span>
                                                <span className="font-bold text-success bg-success/10 px-2 rounded-sm border border-success/20">{assignment.mySubmission.score} / {assignment.points}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        {assignment.status === 'Pending' ? (
                                            <button onClick={() => handleUploadClick(assignment)} className="w-full btn-primary py-2 text-sm justify-center flex items-center">
                                                <Upload className="w-4 h-4 mr-2" /> Submit Work
                                            </button>
                                        ) : (
                                            <div className="w-full text-center py-2 text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Work Submitted
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="col-span-3 text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <FileText className="w-12 h-12 text-textSecondary opacity-50 mx-auto mb-4" />
                                <p className="text-textSecondary">You're all caught up! No active assignments.</p>
                            </div>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {selectedAssignment && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white">Upload Submission</h2>
                                    <button onClick={() => setSelectedAssignment(null)} className="text-textSecondary hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl text-sm">
                                        <p className="font-bold text-primary-400 mb-1">{selectedAssignment.title}</p>
                                        <p className="text-primary-300 opacity-80">Make sure your file is labeled correctly before uploading.</p>
                                    </div>
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setSubmitFile(e.target.files[0])}
                                        />
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6 text-textSecondary" />
                                        </div>
                                        {submitFile ? (
                                            <p className="text-sm font-bold text-white text-center break-all">{submitFile.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-white mb-1">Click to browse</p>
                                                <p className="text-xs text-textSecondary">PDF, DOCX, JPG or PNG (Max. 10MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end space-x-3">
                                    <button onClick={() => setSelectedAssignment(null)} className="btn-secondary">Cancel</button>
                                    <button onClick={handleSubmitAssignment} disabled={!submitFile || submitting} className="btn-primary flex items-center">
                                        {submitting ? 'Submitting...' : 'Upload & Turn In'}
                                    </button>
                                </div>
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
        Pending: 'bg-warning/10 text-warning border-warning/20',
        Submitted: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
        Graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status]}`}>
            {status}
        </span>
    );
}
