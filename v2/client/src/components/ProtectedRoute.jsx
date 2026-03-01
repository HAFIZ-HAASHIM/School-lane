import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userRole } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to their default dashboard if they try to access an unauthorized route
        if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (userRole === 'student') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/dashboard" replace />; // Default teacher
    }

    return children;
}
