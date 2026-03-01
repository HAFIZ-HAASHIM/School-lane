const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('announcements').get();
        const announcements = [];
        snapshot.forEach(doc => {
            announcements.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Create new announcement
router.post('/', async (req, res) => {
    try {
        const { title, message, targetAudience, senderName, senderRole, priority } = req.body;
        const newAnnouncement = {
            title,
            message,
            targetAudience: targetAudience || 'all', // all, students, teachers, parents
            senderName,
            senderRole,
            priority: priority || 'normal',
            date: new Date().toISOString()
        };

        const docRef = await db.collection('announcements').add(newAnnouncement);
        res.status(201).json({ data: { id: docRef.id, ...newAnnouncement }, message: 'Announcement posted' });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Delete an announcement
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('announcements').doc(id).delete();
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

module.exports = router;
