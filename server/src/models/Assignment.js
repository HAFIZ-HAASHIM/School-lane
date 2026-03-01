const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    attachmentUrl: String,
    grade: String,
    feedback: String,
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    attachments: [String],
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    submissions: [submissionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);