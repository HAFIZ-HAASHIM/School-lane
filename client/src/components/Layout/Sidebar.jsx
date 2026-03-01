import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NavItem = ({ to, icon, label, active }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive || active
          ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 border-l-4 border-blue-500'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`
    }
  >
    <span className="mr-3">{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/students', label: 'Students', roles: ['admin', 'teacher'] },
    { to: '/teachers', label: 'Faculty', roles: ['admin'] },
    { to: '/attendance', label: 'Attendance' },
    { to: '/assignments', label: 'Assignments' },
    { to: '/exams', label: 'Exams' },
    { to: '/timetable', label: 'Schedule' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/profile', label: 'My Profile' }
  ];

  const allowed = (l) => (user ? (l.roles ? l.roles.includes(user.role) : true) : false);

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-border/60 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          School Lane
        </h1>
        <p className="text-xs text-slate-500 mt-1">Education Management System</p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.filter(allowed).map((link) => (
          <NavItem
            key={link.to}
            to={link.to}
            label={link.label}
            active={pathname === link.to}
          />
        ))}
      </nav>
      <div className="p-4 border-t border-border/60 mt-auto">
        <div className="text-xs text-slate-500 text-center">
          {new Date().getFullYear()} School Lane
        </div>
      </div>
    </aside>
  );
}

