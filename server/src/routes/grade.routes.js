const express = require('express');
const Grade = require('../models/Grade');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), createOne(Grade));
router.get(
  '/',
  authorize('admin', 'teacher', 'student', 'parent'),
  getMany(Grade, (req) => {
    const filter = {};
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    return filter;
  })
);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getOne(Grade));
router.put('/:id', authorize('admin', 'teacher'), updateOne(Grade));
router.delete('/:id', authorize('admin'), deleteOne(Grade));

module.exports = router;