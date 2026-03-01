const express = require('express');
const Exam = require('../models/Exam');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), createOne(Exam));
router.get(
  '/',
  authorize('admin', 'teacher', 'student', 'parent'),
  getMany(Exam, (req) => {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    return filter;
  })
);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getOne(Exam));
router.put('/:id', authorize('admin', 'teacher'), updateOne(Exam));
router.delete('/:id', authorize('admin'), deleteOne(Exam));

module.exports = router;