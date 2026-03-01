const express = require('express');
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  authenticate, // only admin can create, or setup will bypass in controller
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent']),
  signup
);

router.post('/login', body('email').isEmail(), body('password').notEmpty(), login);
router.get('/me', authenticate, me);

module.exports = router;