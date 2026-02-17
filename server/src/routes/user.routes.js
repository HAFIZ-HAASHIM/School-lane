const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { getMany, getOne, updateOne, deleteOne } = require('../controllers/generic.controller');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin'), getMany(User));
router.get('/:id', authorize('admin'), getOne(User));
router.put('/:id', authorize('admin'), updateOne(User));
router.delete('/:id', authorize('admin'), deleteOne(User));

module.exports = router;