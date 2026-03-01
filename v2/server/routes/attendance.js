const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get admin summary for a specific date
router.get('/summary', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'date is required' });

        // Get all classes
        const classesSnap = await db.collection('classes').get();
        const classes = {};
        classesSnap.forEach(doc => {
            classes[doc.id] = { id: doc.id, name: doc.data().name, teacherName: doc.data().teacherName, studentCount: 0, presentCount: 0 };
        });

        // Get all students to calculate totals per class
        const studentsSnap = await db.collection('students').get();
        const students = [];
        studentsSnap.forEach(doc => {
            const data = doc.data();
            students.push({ id: doc.id, ...data });
            if (data.classId && classes[data.classId]) {
                classes[data.classId].studentCount++;
            }
        });

        // Get all attendance records for the date
        const attendanceSnap = await db.collection('attendance').where('date', '==', date).get();
        const attendanceRecords = [];
        attendanceSnap.forEach(doc => {
            const data = doc.data();
            attendanceRecords.push({ id: doc.id, ...data });
            if (data.classId && classes[data.classId] && data.status === 'Present') {
                classes[data.classId].presentCount++;
            }
        });

        const classList = Object.values(classes).map(c => ({
            ...c,
            attendancePercentage: c.studentCount > 0 ? Math.round((c.presentCount / c.studentCount) * 100) : 0
        }));

        const totalStudents = students.length;
        const totalPresent = attendanceRecords.filter(r => r.status === 'Present').length;
        const totalAbsent = attendanceRecords.filter(r => r.status === 'Absent').length;
        const totalLate = attendanceRecords.filter(r => r.status === 'Late').length;

        res.json({
            data: {
                totalStudents,
                totalPresent,
                totalAbsent,
                totalLate,
                classes: classList
            }
        });

    } catch (error) {
        console.error('Error fetching admin attendance summary:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get attendance for a class on a specific date
router.get('/', async (req, res) => {
    try {
        const { classId, date } = req.query;
        if (!classId || !date) {
            return res.status(400).json({ error: 'classId and date are required' });
        }

        // 1. Get all students in this class
        const studentsSnapshot = await db.collection('students').where('classId', '==', classId).get();
        const students = [];
        studentsSnapshot.forEach(doc => students.push({ id: doc.id, ...doc.data() }));

        // 2. Get existing attendance records for this date
        const attendanceSnapshot = await db.collection('attendance')
            .where('classId', '==', classId)
            .where('date', '==', date)
            .get();

        const attendanceMap = {};
        attendanceSnapshot.forEach(doc => {
            const data = doc.data();
            attendanceMap[data.studentId] = { id: doc.id, status: data.status, remarks: data.remarks };
        });

        // 3. Merge students with their attendance (if exists) or default to empty
        const mergedData = students.map(student => ({
            studentId: student.id,
            name: student.name,
            rollNo: student.rollNo,
            avatar: student.avatar,
            recordId: attendanceMap[student.id]?.id || null,
            status: attendanceMap[student.id]?.status || null,
            remarks: attendanceMap[student.id]?.remarks || ''
        }));

        // Sort by roll number
        mergedData.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

        res.json({
            message: 'Attendance data fetched successfully',
            data: mergedData
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update attendance
router.post('/', async (req, res) => {
    try {
        const { classId, date, records } = req.body;

        if (!classId || !date || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const batch = db.batch();

        records.forEach(record => {
            if (record.recordId) {
                // Update existing
                const docRef = db.collection('attendance').doc(record.recordId);
                batch.update(docRef, {
                    status: record.status,
                    remarks: record.remarks,
                    updatedAt: new Date().toISOString()
                });
            } else if (record.status) {
                // Create new only if status is provided
                const docRef = db.collection('attendance').doc();
                batch.set(docRef, {
                    classId,
                    date,
                    studentId: record.studentId,
                    status: record.status,
                    remarks: record.remarks,
                    createdAt: new Date().toISOString()
                });
            }
        });

        await batch.commit();

        res.json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
