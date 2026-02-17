// server/src/routes/attendance.routes.js

const express = require('express');
const Attendance = require('../models/Attendance');
const StudentProfile = require('../models/StudentProfile'); // Import StudentProfile model
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

// --- Custom GET route to handle different roles ---
router.get('/', authorize('admin', 'teacher', 'student', 'parent'), async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let attendanceRecords;

    if (role === 'admin' || role === 'teacher') {
      // Teacher/Admin: Filter by class and date from query
      const filter = {};
      if (req.query.classId) filter.classId = req.query.classId;
      if (req.query.date) filter.date = new Date(req.query.date);
      attendanceRecords = await Attendance.find(filter).sort({ date: -1 });
    } else {
      // Student/Parent: Securely find their own records
      // Find the student profile linked to the logged-in user ID
      const studentProfile = await StudentProfile.findOne({ userId });
      if (!studentProfile) {
        return res.json([]); // No linked student, return empty array
      }
      // Find all attendance documents that include this student's ID in their records
      attendanceRecords = await Attendance.find({ 'records.studentId': studentProfile._id }).sort({ date: -1 });
    }
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authorize('admin', 'teacher'), createOne(Attendance));
router.get('/:id', authorize('admin', 'teacher'), getOne(Attendance));
router.put('/:id', authorize('admin', 'teacher'), updateOne(Attendance));
router.delete('/:id', authorize('admin'), deleteOne(Attendance));

module.exports = router;