import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  const roleDisplayNames = {
    admin: 'Administrator',
    teacher: 'Faculty',
    student: 'Student',
    parent: 'Parent'
  };

  return (
    <header className="w-full bg-white border-b border-slate-100 shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          School Lane
        </span>
        <span className="ml-2 text-sm text-slate-500 hidden md:inline">
          Streamlining Education Management
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-700 text-right">
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-slate-500">{roleDisplayNames[user?.role] || user?.role}</div>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

