// server/src/models/Attendance.js

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile' },
    records: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
        // Updated enum to include 'late' and 'excused'
        status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
        remarks: String
      }
    ]
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);