const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all assignments (filter by classId or teacherEmail/teacherId)
router.get('/', async (req, res) => {
    try {
        const { classId, teacherId, teacherEmail } = req.query;
        let assignmentsRef = db.collection('assignments');
        let snapshot;

        if (classId) {
            snapshot = await assignmentsRef.where('classId', '==', classId).get();
        } else if (teacherId) {
            snapshot = await assignmentsRef.where('teacherId', '==', teacherId).get();
        } else if (teacherEmail) {
            snapshot = await assignmentsRef.where('teacherEmail', '==', teacherEmail).get();
        } else {
            snapshot = await assignmentsRef.get(); // Admin sees all
        }

        const assignments = [];
        snapshot.forEach(doc => {
            assignments.push({ id: doc.id, ...doc.data() });
        });

        // Also fetch submissions to count them
        for (let i = 0; i < assignments.length; i++) {
            const subsSnap = await db.collection('assignments').doc(assignments[i].id).collection('submissions').get();
            assignments[i].submittedCount = subsSnap.size;
        }

        res.json({
            message: 'Assignments fetched successfully',
            data: assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new assignment
router.post('/', async (req, res) => {
    try {
        const { title, description, classId, dueDate, type, points, teacherId, teacherEmail } = req.body;

        if (!title || !classId || !dueDate) {
            return res.status(400).json({ error: 'Title, classId, and dueDate are required' });
        }

        const newAssignment = {
            title,
            description: description || '',
            classId,
            dueDate,
            type: type || 'homework', // homework, project, quiz
            points: points || 100,
            teacherId: teacherId || '',
            teacherEmail: teacherEmail || '',
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        const docRef = await db.collection('assignments').add(newAssignment);

        res.status(201).json({
            message: 'Assignment created successfully',
            data: { id: docRef.id, ...newAssignment }
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('assignments').doc(req.params.id).delete();
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Submits an assignment
router.post('/:id/submit', async (req, res) => {
    try {
        const { studentId, studentName, fileName } = req.body;
        const assignmentId = req.params.id;

        if (!studentId || !fileName) return res.status(400).json({ error: 'Missing student details or file' });

        const submission = {
            studentId,
            studentName,
            fileName,
            status: 'Submitted',
            score: null,
            submittedAt: new Date().toISOString(),
            late: false // Could check against dueDate here
        };

        const docRef = await db.collection('assignments').doc(assignmentId).collection('submissions').doc(studentId).set(submission);

        res.status(201).json({ message: 'Submitted successfully', data: submission });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Teacher views submissions
router.get('/:id/submissions', async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const snap = await db.collection('assignments').doc(assignmentId).collection('submissions').get();
        const submissions = [];
        snap.forEach(doc => submissions.push({ id: doc.id, ...doc.data() }));

        res.json({ data: submissions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Teacher grades a submission
router.post('/:id/grade', async (req, res) => {
    try {
        const { studentId, score } = req.body;
        const assignmentId = req.params.id;

        await db.collection('assignments').doc(assignmentId).collection('submissions').doc(studentId).update({
            score: Number(score),
            status: 'Graded',
            gradedAt: new Date().toISOString()
        });

        res.json({ message: 'Grade saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
