import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard'; // Added ParentDashboard import
import Classes from './pages/Classes';
import StudentDashboard from './pages/StudentDashboard';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import StudentAssignments from './pages/StudentAssignments';
import Exams from './pages/Exams';
import StudentExams from './pages/StudentExams';
import Announcements from './pages/Announcements';
import Analytics from './pages/Analytics';

// New Admin ERP Modules
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AdminFees from './pages/AdminFees';
import AdminCommunications from './pages/AdminCommunications';
import AdminClasses from './pages/AdminClasses';
import AdminTimetable from './pages/AdminTimetable';
import AdminCalendar from './pages/AdminCalendar';
import AdminAttendance from './pages/AdminAttendance';
import AdminAssignments from './pages/AdminAssignments';
import AdminExams from './pages/AdminExams';
import AdminLibrary from './pages/AdminLibrary';
import AdminTransport from './pages/AdminTransport';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminSettings from './pages/AdminSettings';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Teacher Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><Dashboard /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute allowedRoles={['teacher']}><Classes /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><Attendance /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={['teacher']}><Timetable /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><Assignments /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={['teacher']}><Exams /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Analytics /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['admin']}><AdminFees /></ProtectedRoute>} />
          <Route path="/admin/communications" element={<ProtectedRoute allowedRoles={['admin']}><AdminCommunications /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminClasses /></ProtectedRoute>} />
          <Route path="/admin/timetable" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimetable /></ProtectedRoute>} />
          <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin']}><AdminCalendar /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/assignments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssignments /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><AdminExams /></ProtectedRoute>} />
          <Route path="/admin/library" element={<ProtectedRoute allowedRoles={['admin']}><AdminLibrary /></ProtectedRoute>} />
          <Route path="/admin/transport" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransport /></ProtectedRoute>} />
          <Route path="/admin/integrations" element={<ProtectedRoute allowedRoles={['admin']}><AdminIntegrations /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><StudentExams /></ProtectedRoute>} />

          {/* Parent Routes */}
          <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

          {/* Shared Routes */}
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
