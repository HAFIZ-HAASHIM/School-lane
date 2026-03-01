const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all exams for a specific class or teacher
router.get('/', async (req, res) => {
    try {
        const { classId, teacherId, teacherEmail } = req.query;
        let query = db.collection('exams');

        if (classId) {
            query = query.where('classId', '==', classId);
        } else if (teacherId) {
            query = query.where('teacherId', '==', teacherId);
        } else if (teacherEmail) {
            query = query.where('teacherEmail', '==', teacherEmail);
        }

        const snapshot = await query.get();
        const exams = [];
        snapshot.forEach(doc => {
            exams.push({ id: doc.id, ...doc.data() });
        });

        res.json({ data: exams });
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// Create a new exam
router.post('/', async (req, res) => {
    try {
        const { title, type, subject, classId, teacherId, teacherEmail, date, totalMarks } = req.body;

        const newExam = {
            title,
            type: type || 'Unit Test',
            subject: subject || '',
            classId,
            teacherId: teacherId || '',
            teacherEmail: teacherEmail || '',
            date,
            totalMarks: Number(totalMarks) || 100,
            status: 'Scheduled',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('exams').add(newExam);
        res.status(201).json({ data: { id: docRef.id, ...newExam } });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

// Delete an exam
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('exams').doc(req.params.id).delete();
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get marks for a specific exam
router.get('/:examId/marks', async (req, res) => {
    try {
        const { examId } = req.params;
        const snapshot = await db.collection('marks').where('examId', '==', examId).get();
        const marks = [];
        snapshot.forEach(doc => marks.push({ id: doc.id, ...doc.data() }));
        res.json({ data: marks });
    } catch (error) {
        console.error('Error fetching exam marks:', error);
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
});

// Record marks for a specific exam
router.post('/:examId/marks', async (req, res) => {
    try {
        const { examId } = req.params;
        const { studentMarks } = req.body; // Array of { studentId, marks }

        const batch = db.batch();
        let totalScored = 0;
        let count = 0;
        const studentScores = [];

        // Save individual marks
        studentMarks.forEach(record => {
            const markRef = db.collection('marks').doc(`${examId}_${record.studentId}`);
            batch.set(markRef, {
                examId,
                studentId: record.studentId,
                marks: Number(record.marks),
                timestamp: new Date().toISOString()
            });
            totalScored += Number(record.marks);
            count++;
            studentScores.push({ id: record.studentId, marks: Number(record.marks) });
        });

        // Compute analytics
        const averageMarks = count > 0 ? (totalScored / count) : 0;

        // Sort to find top 3
        studentScores.sort((a, b) => b.marks - a.marks);
        const topPerformers = studentScores.slice(0, 3).map(s => s.id);

        // Update exam state
        const examRef = db.collection('exams').doc(examId);
        batch.update(examRef, {
            status: 'Graded',
            analytics: {
                averageMarks: averageMarks.toFixed(2),
                gradedCount: count,
                topPerformers
            }
        });

        await batch.commit();

        res.json({ message: 'Marks recorded and analytics generated successfully', analytics: { averageMarks, topPerformers } });
    } catch (error) {
        console.error('Error recording marks:', error);
        res.status(500).json({ error: 'Failed to record marks' });
    }
});

// Get all marks for a specific student
router.get('/student/:studentId/marks', async (req, res) => {
    try {
        const { studentId } = req.params;
        const snapshot = await db.collection('marks').where('studentId', '==', studentId).get();
        const marks = [];
        snapshot.forEach(doc => marks.push({ id: doc.id, ...doc.data() }));
        res.json({ data: marks });
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).json({ error: 'Failed to fetch student marks' });
    }
});

module.exports = router;
