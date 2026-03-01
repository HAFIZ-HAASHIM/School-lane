const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get timetable (filtered by classId or teacherId)
router.get('/', async (req, res) => {
    try {
        const { classId, teacherId } = req.query;
        let timetableQuery = db.collection('timetables');

        if (classId) {
            timetableQuery = timetableQuery.where('classId', '==', classId);
        } else if (teacherId) {
            timetableQuery = timetableQuery.where('teacherId', '==', teacherId);
        }

        const snapshot = await timetableQuery.get();
        const timetable = [];

        snapshot.forEach(doc => {
            timetable.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            message: 'Timetable fetched',
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save or update timetable entries (batch)
router.post('/', async (req, res) => {
    try {
        const { entries } = req.body;
        // 'entries' should be an array of objects: { classId, className, teacherId, subject, day, periodId, room, color }

        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({ error: 'entries array is required' });
        }

        const batch = db.batch();

        for (const entry of entries) {
            if (entry.id) {
                // Update existing
                const docRef = db.collection('timetables').doc(entry.id);
                batch.update(docRef, {
                    ...entry,
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Create new
                const docRef = db.collection('timetables').doc();
                batch.set(docRef, {
                    ...entry,
                    createdAt: new Date().toISOString()
                });
            }
        }

        await batch.commit();

        res.json({ message: 'Timetable saved successfully' });
    } catch (error) {
        console.error('Error saving timetable:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete timetable entry
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('timetables').doc(req.params.id).delete();
        res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
