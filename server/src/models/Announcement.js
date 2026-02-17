const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetAudience: { type: String, enum: ['all', 'teachers', 'students', 'parents', 'class'], default: 'all' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);