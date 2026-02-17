const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { connectDB } = require('./lib/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

connectDB();

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'School Lane API' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/grades', require('./routes/grade.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/timetables', require('./routes/timetable.routes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
