const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema(
  {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional account
    name: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    rollNumber: { type: String, index: true },
    contact: {
      phone: String,
      email: String,
      address: String
    },
    guardians: [guardianSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);