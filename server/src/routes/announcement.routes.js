const express = require('express');
const Announcement = require('../models/Announcement');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin', 'teacher'), createOne(Announcement));
router.get(
  '/',
  authorize('admin', 'teacher', 'student', 'parent'),
  getMany(Announcement, (req) => {
    const filter = {};
    if (req.query.targetAudience) filter.targetAudience = req.query.targetAudience;
    if (req.query.classId) filter.classId = req.query.classId;
    return filter;
  })
);
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getOne(Announcement));
router.put('/:id', authorize('admin', 'teacher'), updateOne(Announcement));
router.delete('/:id', authorize('admin'), deleteOne(Announcement));

module.exports = router;