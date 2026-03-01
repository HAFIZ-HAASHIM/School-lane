import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, UserCircle, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (role === 'admin') {
                if (email.toLowerCase() !== 'admin@schoollane.dev') {
                    throw new Error('You are not authorized to register as an Administrator.');
                }
            } else {
                // First check if the user is pre-registered
                const res = await fetch(`http://localhost:5000/api/users/check-pre-registered/${encodeURIComponent(email)}`);
                const data = await res.json();

                if (!data.preRegistered) {
                    // Not pre-registered
                    throw new Error('Your email is not on the pre-approved registration list. Please contact your administrator or teacher.');
                }

                // Check if the role they are trying to register as matches what they were pre-registered for
                if (data.data.role !== role) {
                    throw new Error(`You have been pre-registered as a ${data.data.role}, not a ${role}.`);
                }

                // Keep classId for Firestore later if student
                if (data.data.classId) {
                    // We can pass this indirectly, or attach it to the component state.
                }
            }

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user details and role to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                name: name,
                role: role,
                classId: data.data.classId || null,
                createdAt: new Date().toISOString()
            });

            // Redirect based on role
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'student') navigate('/student/dashboard');
            else navigate('/dashboard'); // default to teacher

        } catch (err) {
            setError(err.message || 'Failed to register account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-textPrimary overflow-hidden font-sans">
            {/* Left Panel: Graphic & Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-[rgba(255,255,255,0.05)] bg-[#0A0D14]"
            >
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 text-primary-400 mb-6">
                        <GraduationCap className="w-8 h-8" />
                        <span className="font-display font-bold text-2xl tracking-wide text-white">School Lane</span>
                    </div>
                    <h1 className="font-display text-5xl font-semibold leading-tight text-white mt-16 max-w-lg">
                        Join the future of education management.
                    </h1>
                </div>
            </motion.div>

            {/* Right Panel: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md my-auto"
                >
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="font-display text-4xl font-semibold text-white mb-3">Create Account</h2>
                        <p className="text-textSecondary">Sign up to access your dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary px-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary group-focus-within:text-primary-500 transition-colors">
                                    <UserCircle className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11 h-12 bg-[#0F141E]"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary px-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary group-focus-within:text-primary-500 transition-colors">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11 h-12 bg-[#0F141E]"
                                    placeholder="email@school.edu"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary px-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary group-focus-within:text-primary-500 transition-colors">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 h-12 bg-[#0F141E]"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-textSecondary px-1">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${role === 'student' ? 'border-primary-500 bg-primary-500/10 text-primary-400 font-bold' : 'border-white/10 text-textSecondary hover:bg-white/5'}`}>
                                    <input type="radio" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                    Student
                                </label>
                                <label className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${role === 'teacher' ? 'border-primary-500 bg-primary-500/10 text-primary-400 font-bold' : 'border-white/10 text-textSecondary hover:bg-white/5'}`}>
                                    <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                    Teacher
                                </label>
                                <label className={`border rounded-lg p-3 text-center cursor-pointer transition-all ${role === 'admin' ? 'border-primary-500 bg-primary-500/10 text-primary-400 font-bold' : 'border-white/10 text-textSecondary hover:bg-white/5'}`}>
                                    <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value)} className="hidden" />
                                    Admin
                                </label>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary h-14 mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            <span>{loading ? 'Creating Account...' : 'Register'}</span>
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
                        <p className="text-sm text-textSecondary">
                            Already have an account? {' '}
                            <Link to="/login" className="font-medium text-white hover:text-primary-400 transition-colors">Sign in</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
