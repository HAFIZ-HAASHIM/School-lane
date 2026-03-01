/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB } = require('../lib/db');
const User = require('../models/User');
const TeacherProfile = require('../models/TeacherProfile');
const StudentProfile = require('../models/StudentProfile');
const ClassModel = require('../models/Class');
const Announcement = require('../models/Announcement');

dotenv.config();

(async function run() {
  try {
    await connectDB();

    // Clear
    await Promise.all([
      Announcement.deleteMany({}),
      StudentProfile.deleteMany({}),
      TeacherProfile.deleteMany({}),
      ClassModel.deleteMany({}),
      User.deleteMany({})
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@schoollane.dev',
      password: 'Admin123!',
      role: 'admin'
    });

    const teacherUser = await User.create({
      name: 'John Teacher',
      email: 'teacher@schoollane.dev',
      password: 'Teacher123!',
      role: 'teacher'
    });

    const studentUser = await User.create({
      name: 'Alice Student',
      email: 'student@schoollane.dev',
      password: 'Student123!',
      role: 'student'
    });

    const classA = await ClassModel.create({
      name: 'Grade 8',
      section: 'A',
      subjects: ['Math', 'Science', 'English']
    });

    const teacher = await TeacherProfile.create({
      userId: teacherUser._id,
      contact: { phone: '555-555', email: 'teacher@schoollane.dev' },
      qualifications: ['B.Ed', 'M.Sc'],
      subjects: ['Science'],
      classesAssigned: [classA._id],
      availability: [{ day: 'Monday', startTime: '09:00', endTime: '15:00' }],
      substitutionPreferences: ['Science'],
      homeroomDuties: 'Grade 8-A'
    });

    await ClassModel.findByIdAndUpdate(classA._id, { homeroomTeacher: teacher._id });

    const student = await StudentProfile.create({
      userId: studentUser._id,
      name: 'Alice Student',
      classId: classA._id,
      rollNumber: '8A-01',
      contact: { phone: '555-010', email: 'parent@schoollane.dev', address: '123 Street' },
      guardians: [{ name: 'Parent One', relationship: 'Mother', phone: '555-100' }]
    });

    await Announcement.create({
      title: 'Welcome Back!',
      content: 'Classes resume next Monday.',
      targetAudience: 'all',
      createdBy: admin._id
    });

    console.log('Seed completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})()
