const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., Grade 8
    section: { type: String, required: true }, // e.g., A
    subjects: [String],
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile' }
  },
  { timestamps: true }
);

classSchema.index({ name: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
