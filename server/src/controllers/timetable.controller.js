// server/src/controllers/timetable.controller.js

const Timetable = require('../models/Timetable');

exports.getTimetableEntries = async (req, res) => {
  try {
    const entries = await Timetable.find({})
      .populate({ path: 'classId', select: 'name section' })
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name' } });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable entries.' });
  }
};

exports.createTimetableEntry = async (req, res) => {
  try {
    const newEntry = await Timetable.create(req.body);
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: 'Error creating timetable entry. It may already exist.' });
  }
};

exports.deleteTimetableEntry = async (req, res) => {
  try {
    const deletedEntry = await Timetable.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ message: 'Entry not found.' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timetable entry.' });
  }
};