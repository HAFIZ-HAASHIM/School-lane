const express = require('express');
const Assignment = require('../models/Assignment');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), createOne(Assignment));
router.get(
  '/',
  authorize('admin', 'teacher', 'student', 'parent'),
  getMany(Assignment, (req) => {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    return filter;
  })
);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getOne(Assignment));
router.put('/:id', authorize('admin', 'teacher'), updateOne(Assignment));
router.delete('/:id', authorize('admin'), deleteOne(Assignment));

// Add submission to an assignment
router.post('/:id/submissions', authorize('student', 'teacher', 'admin'), async (req, res) => {
  const { studentId, attachmentUrl, grade, feedback } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Not found' });
  assignment.submissions.push({ studentId, attachmentUrl, grade, feedback });
  await assignment.save();
  res.status(201).json(assignment);
});

module.exports = router;