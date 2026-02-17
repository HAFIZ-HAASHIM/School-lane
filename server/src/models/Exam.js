const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g., Midterm
    date: { type: Date, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: String, required: true },
    maxMarks: { type: Number, default: 100 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);