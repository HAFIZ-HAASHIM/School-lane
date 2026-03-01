const express = require('express');
const ClassModel = require('../models/Class');
const { authenticate, authorize } = require('../middleware/auth');
const { createOne, getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('admin'), createOne(ClassModel));
router.get('/', authorize('admin', 'teacher', 'student', 'parent'), getMany(ClassModel));
router.get('/:id', authorize('admin', 'teacher', 'student', 'parent'), getOne(ClassModel));
router.put('/:id', authorize('admin'), updateOne(ClassModel));
router.delete('/:id', authorize('admin'), deleteOne(ClassModel));

module.exports = router;