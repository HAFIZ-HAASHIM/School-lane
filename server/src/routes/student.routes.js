const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), createOne(StudentProfile));
router.get(
  '/',
  authorize('admin', 'teacher'),
  getMany(StudentProfile, (req) => {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    return filter;
  })
);
router.get('/:id', authorize('admin', 'teacher', 'parent', 'student'), getOne(StudentProfile));
router.put('/:id', authorize('admin', 'teacher'), updateOne(StudentProfile));
router.delete('/:id', authorize('admin'), deleteOne(StudentProfile));

module.exports = router;