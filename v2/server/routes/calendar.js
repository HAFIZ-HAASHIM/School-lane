const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all calendar events
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('calendar_events').get();
        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

// Add a new event
router.post('/', async (req, res) => {
    try {
        const { title, description, date, type, endDate, audience } = req.body;
        const newEvent = {
            title,
            description: description || '',
            date,
            endDate: endDate || date,
            type: type || 'Event',
            audience: audience || 'all',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('calendar_events').add(newEvent);
        res.status(201).json({ data: { id: docRef.id, ...newEvent } });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// Delete an event
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('calendar_events').doc(id).delete();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
