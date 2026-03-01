import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, Calendar, FileText, GraduationCap,
    Megaphone, MessageSquare, PieChart, User, Settings, Search, Bell,
    ChevronLeft, ChevronRight, LogOut, ShieldCheck, Database, CreditCard,
    Library, Map, CalendarDays, Activity, Server, FileBarChart, FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Layout({ children, breadcrumbs }) {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userRole } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="flex bg-background min-h-screen text-textPrimary overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
                className="glass-card hidden md:flex flex-col m-4 mr-0 border-r border-white/5 z-20"
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    {!isSidebarCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-wide">School Lane</span>
                        </motion.div>
                    )}
                    {isSidebarCollapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8 px-4 custom-scrollbar">
                    {/* ===== ADMIN SIDEBAR ===== */}
                    {userRole === 'admin' ? (
                        <>
                            <NavGroup title="OVERVIEW" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<LayoutDashboard />} label="Dashboard" active={location.pathname === '/admin/dashboard'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/dashboard')} />
                                <NavItem icon={<Activity />} label="Analytics & Reports" active={location.pathname === '/admin/analytics'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/analytics')} />
                            </NavGroup>

                            <NavGroup title="ADMINISTRATION" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<ShieldCheck />} label="User Management" active={location.pathname === '/admin/users'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/users')} />
                                <NavItem icon={<CreditCard />} label="Fees Management" active={location.pathname === '/admin/fees'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/fees')} />
                                <NavItem icon={<Megaphone />} label="Communications" active={location.pathname === '/admin/communications'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/communications')} />
                            </NavGroup>

                            <NavGroup title="ACADEMICS BASE" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<Database />} label="Classes & Subjects" active={location.pathname === '/admin/classes'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/classes')} />
                                <NavItem icon={<Calendar />} label="Timetable Engine" active={location.pathname === '/admin/timetable'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/timetable')} />
                                <NavItem icon={<CalendarDays />} label="Academic Calendar" active={location.pathname === '/admin/calendar'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/calendar')} />
                            </NavGroup>

                            <NavGroup title="MONITORING" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<UserCheck />} label="Attendance Logs" active={location.pathname === '/admin/attendance'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/attendance')} />
                                <NavItem icon={<FileText />} label="Assignments Audit" active={location.pathname === '/admin/assignments'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/assignments')} />
                                <NavItem icon={<GraduationCap />} label="Exams & Results" active={location.pathname === '/admin/exams'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/exams')} />
                            </NavGroup>

                            <NavGroup title="OPERATIONS" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<Library />} label="Library Records" active={location.pathname === '/admin/library'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/library')} />
                                <NavItem icon={<Map />} label="Transport & Routes" active={location.pathname === '/admin/transport'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/transport')} />
                            </NavGroup>

                            <NavGroup title="SYSTEM" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<Server />} label="Integrations & API" active={location.pathname === '/admin/integrations'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/integrations')} />
                                <NavItem icon={<Settings />} label="Security Settings" active={location.pathname === '/admin/settings'} collapsed={isSidebarCollapsed} onClick={() => navigate('/admin/settings')} />
                                <NavItem icon={<LogOut />} label="Sign Out" active={false} collapsed={isSidebarCollapsed} onClick={handleLogout} />
                            </NavGroup>
                        </>
                    ) : (
                        /* ===== TEACHER / STUDENT SIDEBAR ===== */
                        <>
                            <NavGroup title="MAIN" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<LayoutDashboard />} label="Dashboard" active={['/dashboard', '/student/dashboard'].includes(location.pathname)} collapsed={isSidebarCollapsed} onClick={() => navigate(userRole === 'student' ? '/student/dashboard' : '/dashboard')} />
                                {userRole !== 'student' && <NavItem icon={<Users />} label="My Classes" active={location.pathname === '/classes'} collapsed={isSidebarCollapsed} onClick={() => navigate('/classes')} />}
                                <NavItem icon={<UserCheck />} label="Attendance" active={location.pathname === '/attendance'} collapsed={isSidebarCollapsed} onClick={() => navigate('/attendance')} />
                                <NavItem icon={<Calendar />} label="Timetable" active={location.pathname === '/timetable'} collapsed={isSidebarCollapsed} onClick={() => navigate('/timetable')} />
                            </NavGroup>

                            <NavGroup title="ACADEMICS" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<FileText />} label="Assignments" active={['/assignments', '/student/assignments'].includes(location.pathname)} collapsed={isSidebarCollapsed} onClick={() => navigate(userRole === 'student' ? '/student/assignments' : '/assignments')} />
                                <NavItem icon={<GraduationCap />} label="Exams & Grades" active={['/exams', '/student/exams'].includes(location.pathname)} collapsed={isSidebarCollapsed} onClick={() => navigate(userRole === 'student' ? '/student/exams' : '/exams')} />
                            </NavGroup>

                            <NavGroup title="COMMUNICATION" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<Megaphone />} label="Announcements" active={location.pathname === '/announcements'} collapsed={isSidebarCollapsed} onClick={() => navigate('/announcements')} />
                                <NavItem icon={<MessageSquare />} label="Messages" active={location.pathname === '/messages'} collapsed={isSidebarCollapsed} onClick={() => navigate('/messages')} />
                            </NavGroup>

                            <NavGroup title="SETTINGS" collapsed={isSidebarCollapsed}>
                                <NavItem icon={<PieChart />} label="Analytics" active={location.pathname === '/analytics'} collapsed={isSidebarCollapsed} onClick={() => navigate('/analytics')} />
                                <NavItem icon={<User />} label="My Profile" active={location.pathname === '/profile'} collapsed={isSidebarCollapsed} onClick={() => navigate('/profile')} />
                                <NavItem icon={<LogOut />} label="Sign Out" active={false} collapsed={isSidebarCollapsed} onClick={handleLogout} />
                            </NavGroup>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 flex justify-center">
                    <button
                        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-textSecondary hover:text-white"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-600 rounded-full mix-blend-screen filter blur-[150px] opacity-[0.07] pointer-events-none"></div>

                {/* Top Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-white/5"
                >
                    <div className="flex items-center space-x-2 text-sm text-textSecondary font-medium">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                        {breadcrumbs && breadcrumbs.map((crumb, idx) => (
                            <span key={idx} className="flex items-center space-x-2">
                                <ChevronRight className="w-4 h-4" />
                                <span className={idx === breadcrumbs.length - 1 ? "text-white" : "hover:text-white cursor-pointer transition-colors"}>{crumb}</span>
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surfaceSolid border border-white/10 text-textSecondary hover:text-white hover:border-white/20 transition-all text-sm w-64 justify-between">
                            <div className="flex items-center space-x-2"><Search className="w-4 h-4" /> <span>Search students, classes...</span></div>
                            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded border border-white/10">⌘K</span>
                        </button>
                        <button className="relative text-textSecondary hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full ring-2 ring-background"></span>
                        </button>
                        <div className="flex items-center space-x-3 cursor-pointer group">
                            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-9 h-9 rounded-full border border-white/20 group-hover:border-primary-500 transition-colors" />
                            <div className="hidden md:block text-sm">
                                <p className="font-semibold text-white truncate max-w-[150px]">{currentUser?.displayName || currentUser?.email || 'User'}</p>
                                <p className="text-xs text-textSecondary capitalize">{userRole === 'admin' ? 'System Administrator' : userRole || 'Loading...'}</p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {children}
            </div>
        </div>
    );
}

// --- Subcomponents ---

function NavGroup({ title, collapsed, children }) {
    return (
        <div className="mb-2">
            {!collapsed && <h4 className="text-[10px] font-bold text-textSecondary/50 uppercase tracking-widest px-4 mb-2">{title}</h4>}
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function NavItem({ icon, label, active, collapsed, onClick }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'space-x-3 px-4'} py-2.5 rounded-xl transition-all relative group ${active
            ? 'bg-primary-500/10 text-primary-400 font-bold border border-primary-500/20'
            : 'text-textSecondary hover:bg-white/5 hover:text-white font-medium border border-transparent'
            }`}>
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-500 rounded-r-full shadow-[0_0_8px_#6366F1]"></div>}
            <div className={`${active ? 'text-primary-400' : 'text-textSecondary group-hover:text-white'}`}>
                {icon}
            </div>
            {!collapsed && <span>{label}</span>}

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-14 bg-surfaceSolid border border-white/10 text-white text-xs px-2 py-1 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {label}
                </div>
            )}
        </button>
    );
}
