const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { db, auth } = require('./config/firebase');

const app = express();

app.use(cors());
app.use(express.json());

// Pass db and auth to routes later via req or import
app.locals.db = db;
app.locals.auth = auth;

// Routes
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const timetableRoutes = require('./routes/timetable');
const assignmentRoutes = require('./routes/assignments');
const userRoutes = require('./routes/users');
const examRoutes = require('./routes/exams');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const libraryRoutes = require('./routes/library');
const transportRoutes = require('./routes/transport');
const calendarRoutes = require('./routes/calendar');
const announcementsRoutes = require('./routes/announcements');
const feesRoutes = require('./routes/fees'); // Added Fees route

app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/fees', feesRoutes); // Enable Fees endpoints

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'School Lane v2 API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
