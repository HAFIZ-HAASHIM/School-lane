const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.get('/', async (req, res) => {
    try {
        const { email } = req.query; // Optional: fetch stats specifically for a teacher

        // Aggregate data
        const studentsSnap = await db.collection('students').get();
        const totalStudents = studentsSnap.size;

        const classesSnap = await db.collection('classes').get();
        const totalClasses = classesSnap.size;

        // Fetch today's attendance to calculate percentage
        const today = new Date().toISOString().split('T')[0];
        const attendanceSnap = await db.collection('attendance').where('date', '==', today).get();

        let presentCount = 0;
        let totalRecords = 0;
        attendanceSnap.forEach(doc => {
            totalRecords++;
            if (doc.data().status === 'Present') presentCount++;
        });

        const attendancePercentage = totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 100)
            : 0;

        // Pending Assignments (real)
        let assignmentsQuery = db.collection('assignments');
        if (email) assignmentsQuery = assignmentsQuery.where('teacherEmail', '==', email);
        const assignmentsSnap = await assignmentsQuery.get();
        const pendingAssignments = assignmentsSnap.size; // Or logic for actually pending

        // Upcoming Exams (real)
        let examsQuery = db.collection('exams');
        if (email) examsQuery = examsQuery.where('teacherEmail', '==', email);
        const examsSnap = await examsQuery.get();
        const upcomingExams = examsSnap.size;

        // Fetch recent submissions (mocking mapping for now from assignments)
        const recentSubmissions = [];
        let subsQuery = db.collection('assignments');
        if (email) subsQuery = subsQuery.where('teacherEmail', '==', email);
        const subsSnap = await subsQuery.limit(5).get();
        subsSnap.forEach(doc => {
            recentSubmissions.push({ id: doc.id, student: 'Unknown Student', assignment: doc.data().title, time: 'Recently', status: 'Pending' });
        });

        // Fetch timetable
        const todayTimetable = [];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayStr = days[new Date().getDay()];

        let ttQuery = db.collection('timetables').where('day', '==', currentDayStr);
        if (email) {
            const userSnap = await db.collection('users').where('email', '==', email).limit(1).get();
            if (!userSnap.empty) {
                ttQuery = ttQuery.where('teacherId', '==', userSnap.docs[0].id);
            }
        }

        const ttSnap = await ttQuery.get();

        // Sorting periods mapped by periodId roughly 
        const periods = [];
        ttSnap.forEach(doc => periods.push(doc.data()));
        periods.sort((a, b) => a.periodId - b.periodId);

        periods.slice(0, 3).forEach((p, idx) => {
            // simplified time map
            const timeMap = { 1: '08:30', 2: '09:30', 3: '10:45', 4: '11:45', 5: '01:30', 6: '02:30' };
            todayTimetable.push({
                id: p.id || idx,
                time: timeMap[p.periodId] || '00:00',
                period: `${p.periodId}th`,
                subject: p.subject,
                class: p.className || 'Class',
                active: idx === 0
            });
        });

        res.json({
            message: 'Dashboard stats fetched',
            data: {
                totalStudents,
                totalClasses,
                attendanceToday: attendancePercentage,
                pendingAssignments,
                upcomingExams,
                recentSubmissions,
                todayTimetable
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Student Dashboard Stats
router.get('/student', async (req, res) => {
    try {
        const { email } = req.query;

        // Find the student document
        const studentSnap = await db.collection('students').where('email', '==', email).limit(1).get();
        let attendancePercentage = 100; // Default if no records

        if (!studentSnap.empty) {
            const studentId = studentSnap.docs[0].id;
            // Fetch all attendance records for this student
            const attendanceSnap = await db.collection('attendance').where('studentId', '==', studentId).get();

            let presentCount = 0;
            let totalRecords = 0;
            attendanceSnap.forEach(doc => {
                totalRecords++;
                if (doc.data().status === 'Present' || doc.data().status === 'Late') presentCount++;
            });

            if (totalRecords > 0) {
                attendancePercentage = Math.round((presentCount / totalRecords) * 100);
            }
        }

        let pendingAssignments = 0;
        let upcomingExams = 0;

        const assignmentsSnap = await db.collection('assignments').limit(5).get();
        pendingAssignments = assignmentsSnap.size; // Mocking that all recent ones are pending for student

        const examsSnap = await db.collection('exams').limit(2).get();
        upcomingExams = examsSnap.size;

        // Fetch real schedule for today based on student classId
        const schedule = [];
        if (!studentSnap.empty) {
            const studentData = studentSnap.docs[0].data();
            const classId = studentData.classId;
            if (classId) {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const currentDayStr = days[new Date().getDay()];

                const ttSnap = await db.collection('timetables')
                    .where('classId', '==', classId)
                    .where('day', '==', currentDayStr)
                    .get();

                const periods = [];
                ttSnap.forEach(doc => periods.push(doc.data()));
                periods.sort((a, b) => a.periodId - b.periodId);

                const timeMap = { 1: '08:30', 2: '09:30', 3: '10:45', 4: '11:45', 5: '01:30', 6: '02:30' };

                periods.forEach((p, idx) => {
                    schedule.push({
                        time: timeMap[p.periodId] || '00:00',
                        subject: p.subject,
                        type: p.color || 'primary',
                        active: idx === 0 // just mock first as active
                    });
                });
            }
        }

        res.json({
            data: {
                attendance: attendancePercentage,
                pendingAssignments,
                upcomingExams,
                schedule: schedule,
                announcements: [
                    { title: "Science Fair Registration", desc: "Registrations close next Friday." }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Parent Dashboard Stats
router.get('/parent', async (req, res) => {
    try {
        const { email } = req.query; // Usually the parent's email, but for now we might pass student email or use it to find the linked student

        let attendancePercentage = 100;
        let attendanceWeekly = [
            { name: 'Mon', value: 100 }, { name: 'Tue', value: 100 }, { name: 'Wed', value: 0 }, { name: 'Thu', value: 100 }, { name: 'Fri', value: 100 }
        ];

        // Currently, assuming the email passed is the student's email for simplicity in the prototype
        const studentSnap = await db.collection('students').where('parentEmail', '==', email).limit(1).get();

        if (!studentSnap.empty) {
            const studentId = studentSnap.docs[0].id;
            const attendanceSnap = await db.collection('attendance').where('studentId', '==', studentId).get();

            let presentCount = 0;
            let totalRecords = 0;
            attendanceSnap.forEach(doc => {
                totalRecords++;
                if (doc.data().status === 'Present' || doc.data().status === 'Late') presentCount++;
            });

            if (totalRecords > 0) {
                attendancePercentage = Math.round((presentCount / totalRecords) * 100);
            }
        }

        res.json({
            data: {
                attendance: `${attendancePercentage}%`,
                averageScore: "85.7",
                pendingHomework: 2,
                upcomingExams: 1,
                attendanceWeekly: attendanceWeekly,
                performance: [
                    { subject: 'Math', score: 92 }, { subject: 'Science', score: 88 }, { subject: 'English', score: 78 }
                ],
                notices: [
                    { id: 1, title: 'Term 1 Fees Due', desc: 'Please clear the term 1 fees by end of the month.', date: 'Oct 10', type: 'info' }
                ]
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
