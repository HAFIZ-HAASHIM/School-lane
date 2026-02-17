// server/src/routes/timetable.routes.js

const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getTimetableEntries,
  createTimetableEntry,
  deleteTimetableEntry,
} = require('../controllers/timetable.controller');

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(authorize('admin', 'teacher', 'student', 'parent'), getTimetableEntries)
  .post(authorize('admin'), createTimetableEntry);

router.route('/:id')
  .delete(authorize('admin'), deleteTimetableEntry);

module.exports = router;