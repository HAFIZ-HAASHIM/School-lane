// server/src/routes/teacher.routes.js

const express = require('express');
const TeacherProfile = require('../models/TeacherProfile');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();

router.use(authenticate);

// --- We are replacing the generic getMany with a custom handler ---
router.get('/', authorize('admin', 'teacher'), async (req, res) => {
  try {
    // .populate() tells the DB to include the referenced User details
    const teachers = await TeacherProfile.find({})
      .populate('userId', 'name') // <-- This is the magic line
      .sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching teachers' });
  }
});

router.post('/', authorize('admin'), createOne(TeacherProfile));
router.get('/:id', authorize('admin', 'teacher'), getOne(TeacherProfile)); // This will need populating too if you build a detail view
router.put('/:id', authorize('admin', 'teacher'), updateOne(TeacherProfile));
router.delete('/:id', authorize('admin'), deleteOne(TeacherProfile));

module.exports = router;