import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = [
    { id: 1, time: '08:30 - 09:30' },
    { id: 2, time: '09:30 - 10:30' },
    { id: 3, time: '10:45 - 11:45' },
    { id: 4, time: '11:45 - 12:45' },
    { id: 'lunch', time: '12:45 - 01:30', isBreak: true },
    { id: 5, time: '01:30 - 02:30' },
    { id: 6, time: '02:30 - 03:30' },
];

export default function Timetable() {
    const [view, setView] = useState('week'); // week, month, agenda
    const [timetableData, setTimetableData] = useState({});
    const [loading, setLoading] = useState(true);

    const currentDayIndex = new Date().getDay() - 1; // 0 for Mon
    const currentPeriod = 2; // Hardcoded stub for active period

    const { currentUser, userRole } = useAuth();

    useEffect(() => {
        if (currentUser) {
            fetchTimetable();
        }
    }, [currentUser]);

    const fetchTimetable = async () => {
        try {
            let url = 'http://localhost:5000/api/timetable'; // admin gets all by default or we can leave it empty
            if (userRole === 'teacher') {
                url += `?teacherId=${currentUser.uid}`;
            }
            const res = await fetch(url);
            const result = await res.json();

            // Transform array into [dayIndex][periodId]
            if (result.data) {
                const dayMap = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4 };
                const formatted = {};

                result.data.forEach(item => {
                    const dIdx = dayMap[item.day];
                    if (dIdx !== undefined) {
                        if (!formatted[dIdx]) formatted[dIdx] = {};
                        formatted[dIdx][item.periodId] = {
                            subject: item.subject,
                            class: item.classId || 'Class', // Could fetch class Name if we stored it
                            room: item.room || 'TBD',
                            color: item.color || 'primary'
                        };
                    }
                });
                setTimetableData(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout breadcrumbs={['Timetable & Calendar']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col">
                {/* Header & Controls */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shadow-sm">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">My Schedule</h1>
                        <p className="text-textSecondary text-sm">October 21 - October 25, 2026</p>
                    </div>
                    <div className="flex bg-surfaceSolid p-1 rounded-xl border border-white/5 w-fit">
                        <ViewToggle active={view === 'agenda'} onClick={() => setView('agenda')} label="Agenda" />
                        <ViewToggle active={view === 'week'} onClick={() => setView('week')} label="Week" />
                        <ViewToggle active={view === 'month'} onClick={() => setView('month')} label="Month" />
                    </div>
                </motion.div>

                {/* Timetable Grid */}
                <div className="flex gap-6 flex-1 overflow-hidden">

                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 glass-card overflow-auto custom-scrollbar flex flex-col">
                        <div className="min-w-[800px] p-6">

                            {/* Header Row (Days) */}
                            <div className="grid grid-cols-6 gap-4 mb-4">
                                <div className="flex items-end justify-end p-2 text-xs font-bold text-textSecondary uppercase">Time</div>
                                {DAYS.map((day, idx) => (
                                    <div key={day} className={`text-center py-2 rounded-lg border ${idx === currentDayIndex ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-surfaceSolid/50 border-white/5 text-textSecondary'}`}>
                                        <span className="font-bold">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Rows (Periods) */}
                            <div className="space-y-4 relative">
                                {PERIODS.map((period) => (
                                    <div key={period.id} className="grid grid-cols-6 gap-4 relative">
                                        {/* Time Column */}
                                        <div className="flex flex-col items-end justify-center pr-4 text-xs font-mono text-textSecondary relative">
                                            {period.time.split(' - ').map(t => <span key={t}>{t}</span>)}
                                            {/* Active Time Indicator line */}
                                            {currentDayIndex >= 0 && currentDayIndex < 5 && period.id === currentPeriod && (
                                                <div className="absolute right-0 top-1/2 w-[calc(100%+40px)] h-px bg-primary-500 z-10 pointer-events-none origin-left animate-pulse-border shadow-[0_0_10px_#6366F1]">
                                                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-primary-500"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Day Columns */}
                                        {period.isBreak ? (
                                            <div className="col-span-5 bg-surfaceSolid/30 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-textSecondary/50 font-bold uppercase tracking-widest text-xs h-12">
                                                Lunch Break
                                            </div>
                                        ) : (
                                            DAYS.map((day, idx) => {
                                                const cellData = timetableData[idx]?.[period.id];
                                                const isActive = idx === currentDayIndex && period.id === currentPeriod;

                                                return (
                                                    <div key={`${day}-${period.id}`} className={`min-h-[100px] rounded-xl border p-3 transition-all ${cellData
                                                        ? `bg-${cellData.color}-500/10 border-${cellData.color}-500/20 hover:border-${cellData.color}-500/50 cursor-pointer hover:-translate-y-1`
                                                        : 'bg-surfaceSolid/20 border-white/5 border-dashed hover:bg-white/5 cursor-crosshair'
                                                        } ${isActive ? 'ring-2 ring-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] z-10' : ''}`
                                                    }>
                                                        {cellData && (
                                                            <div className="flex flex-col h-full justify-between">
                                                                <div>
                                                                    <div className={`font-bold text-sm mb-1 ${cellData.color === 'primary' ? 'text-primary-300' :
                                                                        cellData.color === 'success' ? 'text-emerald-300' :
                                                                            cellData.color === 'warning' ? 'text-amber-300' :
                                                                                cellData.color === 'danger' ? 'text-rose-300' : 'text-slate-300'
                                                                        }`}>{cellData.subject}</div>
                                                                    <div className="text-xs text-textSecondary flex items-center mb-1">
                                                                        <Users className="w-3 h-3 mr-1" /> {cellData.class}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs font-mono bg-background/50 text-white w-fit px-2 py-0.5 rounded border border-white/10 flex items-center">
                                                                    <MapPin className="w-3 h-3 mr-1" /> {cellData.room}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Upcoming Events */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="w-80 glass-card p-6 hidden xl:block flex flex-col">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-primary-400" /> Upcoming Events</h2>

                        <div className="space-y-4">
                            <EventCard title="Faculty Meeting" time="Today, 04:00 PM" room="Conference Room A" type="warning" />
                            <EventCard title="Science Fair Judging" time="Oct 24, 09:00 AM" room="Main Auditorium" type="info" />
                            <EventCard title="Midterm Grading Deadline" time="Oct 26, 11:59 PM" room="Online System" type="danger" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Exam Deadlines</h3>
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                                <div className="font-bold text-primary-300 text-sm mb-1">AP Physics Final</div>
                                <div className="text-xs text-textSecondary mb-2">Grade 11</div>
                                <div className="w-full bg-background rounded-full h-1.5 mb-1">
                                    <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <div className="text-[10px] font-mono text-primary-400 text-right">In 12 Days</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </main>
        </Layout>
    );
}

function ViewToggle({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${active ? 'bg-primary-500 text-white shadow-md' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}
        >
            {label}
        </button>
    );
}

function EventCard({ title, time, room, type }) {
    const colors = {
        info: 'border-primary-500 bg-primary-500/5',
        warning: 'border-warning bg-warning/5',
        danger: 'border-danger bg-danger/5',
    };

    return (
        <div className={`p-4 rounded-xl border-l-2 border-y border-r border-y-white/5 border-r-white/5 ${colors[type]}`}>
            <h4 className="font-bold text-white text-sm mb-2">{title}</h4>
            <div className="text-xs text-textSecondary flex items-center mb-1">
                <Clock className="w-3 h-3 mr-2" /> {time}
            </div>
            <div className="text-xs text-textSecondary flex items-center">
                <MapPin className="w-3 h-3 mr-2" /> {room}
            </div>
        </div>
    );
}
