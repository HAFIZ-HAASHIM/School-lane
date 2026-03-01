import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Clock, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/classes');
            const data = await res.json();
            if (data.data) {
                setClasses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout breadcrumbs={['My Classes']}>
            <main className="p-8 max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">My Classes</h1>
                        <p className="text-textSecondary text-sm font-medium">Classes you are assigned to teach this term.</p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-textSecondary">
                                You have no assigned classes.
                            </div>
                        ) : (
                            classes.map((cls, index) => (
                                <motion.div
                                    key={cls.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card hover:-translate-y-1 transition-all overflow-hidden cursor-pointer group"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <span className="px-2 py-1 bg-surfaceSolid border border-white/5 rounded text-xs text-textSecondary font-mono">
                                                {cls.id.toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="font-display text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">
                                            {cls.name}
                                        </h3>
                                        <p className="text-primary-400 text-sm font-medium mb-4">{cls.subject}</p>

                                        <div className="flex items-center space-x-6 text-sm text-textSecondary">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4" />
                                                <span>32 Students</span> {/* Ideally aggregated */}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4" />
                                                <span>10:00 AM</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-t border-white/5 bg-surfaceSolid/30 flex justify-between items-center group-hover:bg-primary-500/10 transition-colors">
                                        <span className="text-sm font-medium text-white group-hover:text-primary-400">Manage Class</span>
                                        <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary-400 transform group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </Layout>
    );
}
