// server/src/models/Timetable.js

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile', required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true }, // e.g., "10:00"
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same class at the same time on the same day
timetableSchema.index({ classId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);