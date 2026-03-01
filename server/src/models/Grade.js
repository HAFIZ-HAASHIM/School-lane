const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    marks: { type: Number, required: true },
    remarks: String
  },
  { timestamps: true }
);

gradeSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);