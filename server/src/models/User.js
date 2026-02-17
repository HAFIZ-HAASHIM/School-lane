const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = ['admin', 'teacher', 'student', 'parent'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: roles, default: 'student', index: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function onSave(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  // eslint-disable-next-line no-param-reassign
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.roles = roles;
