import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        attendance: 0,
        pendingAssignmentsCount: 0,
        upcomingExams: 0,
    });

    const [schedule, setSchedule] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [pendingAssignments, setPendingAssignments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState('');

    useEffect(() => {
        const fetchStudentStats = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/dashboard/student?email=${currentUser?.email}`);
                const { data } = await res.json();
                if (data) {
                    setStats({
                        attendance: data.attendance || 0,
                        pendingAssignmentsCount: data.pendingAssignments || 0,
                        upcomingExams: data.upcomingExams || 0
                    });
                    setSchedule(data.schedule || []);
                    setAnnouncements(data.announcements || []);

                    // Mock some pending assignment objects for UI
                    if (data.pendingAssignments > 0) {
                        setPendingAssignments([
                            { id: 'math-hw-1', title: 'Calculus Ch 3', subject: 'Math', dueDate: 'Tomorrow' },
                            { id: 'phys-lab-1', title: 'Physics Lab 04', subject: 'Science', dueDate: 'Friday' }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch student data");
            }
        };
        if (currentUser?.email) fetchStudentStats();
    }, [currentUser]);

    const handleFileUpload = async (e, assignmentId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadMessage('');

        try {
            // Create a reference to the file in Firebase Storage
            const storageRef = ref(storage, `assignments/${currentUser.uid}/${assignmentId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setUploading(false);
                    setUploadMessage('Upload failed. Please try again.');
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Here you would typically save the downloadURL to Firestore as the student's submission
                    // await saveSubmissionToFirestore(assignmentId, downloadURL);

                    setUploadMessage(`Successfully submitted: ${file.name}`);
                    setUploading(false);
                    setUploadProgress(0);
                }
            );

        } catch (error) {
            console.error("Error setting up upload:", error);
            setUploading(false);
        }
    };

    return (
        <Layout breadcrumbs={['Student Dashboard']}>
            <main className="p-8 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Welcome back, {currentUser?.email?.split('@')[0] || 'Student'} 👋
                    </h1>
                    <p className="text-textSecondary text-sm font-medium">
                        Grade 12-A • Term 2 • Week 8
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="My Attendance"
                        value={`${stats.attendance}%`}
                        icon={<Clock className="text-success" />}
                        color="success"
                    />
                    <StatCard
                        title="Pending Assignments"
                        value={stats.pendingAssignmentsCount}
                        icon={<BookOpen className="text-warning" />}
                        color="warning"
                    />
                    <StatCard
                        title="Upcoming Exams"
                        value={stats.upcomingExams}
                        icon={<AlertCircle className="text-danger" />}
                        color="danger"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
                        <div className="space-y-4">
                            {schedule.length > 0 ? schedule.map((item, idx) => (
                                <ScheduleItem key={idx} time={item.time} subject={item.subject} type={item.type} active={item.active} />
                            )) : <p className="text-sm text-textSecondary italic">No schedule for today.</p>}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Pending Assignments</h2>

                        {uploadMessage && (
                            <div className="mb-4 p-2 rounded text-xs font-bold text-success bg-success/10 border border-success/20">
                                {uploadMessage}
                            </div>
                        )}

                        <div className="space-y-4">
                            {pendingAssignments.length > 0 ? pendingAssignments.map((assignment) => (
                                <div key={assignment.id} className="p-4 rounded-lg bg-surfaceSolid border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{assignment.title}</h3>
                                        <p className="text-xs text-textSecondary mt-1">Due: {assignment.dueDate} • {assignment.subject}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <label className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${uploading ? 'bg-primary-500/50 text-white/50 border-primary-500/20 cursor-not-allowed' : 'bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20'}`}>
                                            {uploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Upload Work (PDF)'}
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                disabled={uploading}
                                                onChange={(e) => handleFileUpload(e, assignment.id)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-textSecondary italic">No pending assignments!</p>}
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

function ScheduleItem({ time, subject, type, active }) {
    return (
        <div className={`flex items-center p-3 rounded-lg border ${active ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surfaceSolid border-white/5'}`}>
            <span className="text-sm font-mono text-textSecondary w-16">{time}</span>
            <div className={`w-1 h-8 rounded-full bg-${type} mx-4`}></div>
            <span className={`font-medium ${active ? 'text-primary-300' : 'text-white'}`}>{subject}</span>
        </div>
    );
}
