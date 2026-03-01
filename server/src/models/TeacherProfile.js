const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    contact: {
      phone: String,
      email: String
    },
    qualifications: [String],
    subjects: [String],
    classesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    availability: [
      {
        day: { type: String }, // e.g., Monday
        startTime: String,
        endTime: String
      }
    ],
    substitutionPreferences: [String],
    homeroomDuties: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);