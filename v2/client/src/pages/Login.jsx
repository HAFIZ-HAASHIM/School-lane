import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        if (currentUser && userRole) {
            if (userRole === 'admin') {
                navigate('/admin/dashboard');
            } else if (userRole === 'student') {
                navigate('/student/dashboard');
            } else {
                navigate('/dashboard'); // default to teacher
            }
        }
    }, [currentUser, userRole, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirection logic should follow the role check in AuthContext. Not here.
        } catch (err) {
            setError(err.message || 'Failed to sign in');
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
                {/* Subtle Background Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 text-primary-400 mb-6">
                        <GraduationCap className="w-8 h-8" />
                        <span className="font-display font-bold text-2xl tracking-wide text-white">School Lane</span>
                    </div>
                    <h1 className="font-display text-5xl font-semibold leading-tight text-white mt-16 max-w-lg">
                        Empowering educators to shape the future.
                    </h1>
                    <p className="mt-6 text-textSecondary text-lg max-w-md leading-relaxed">
                        A premium faculty management system designed for precision, clarity, and daily institutional workflows.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-mono text-textSecondary">
                    © {new Date().getFullYear()} School Lane Inc. All rights reserved.
                </div>
            </motion.div>

            {/* Right Panel: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="font-display text-4xl font-semibold text-white mb-3">Welcome back</h2>
                        <p className="text-textSecondary">Please enter your credentials to access your dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textSecondary px-1">Institutional Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-textSecondary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11 h-14 bg-[#0F141E]"
                                    placeholder="e.g. j.sharma@school.edu"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-medium text-textSecondary">Password</label>
                                <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500 text-textSecondary">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 h-14 bg-[#0F141E]"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 px-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-700 bg-[#0F141E] text-primary-500 focus:ring-primary-500 focus:ring-offset-background" />
                            <label htmlFor="remember" className="text-sm text-textSecondary select-none cursor-pointer">
                                Remember me on this specific device
                            </label>
                        </div>

                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary h-14 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            <span>{loading ? 'Signing in...' : 'Sign in to Dashboard'}</span>
                        </motion.button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
                        <p className="text-sm text-textSecondary">
                            Don't have an account? {' '}
                            <Link to="/register" className="font-medium text-white hover:text-primary-400 transition-colors">Register here</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
