const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get real-time stats for Admin Dashboard
router.get('/stats', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        let totalUsers = 0;
        let activeTeachers = 0;
        let activeStudents = 0;

        usersSnapshot.forEach(doc => {
            totalUsers++;
            const data = doc.data();
            if (data.role === 'teacher') activeTeachers++;
            if (data.role === 'student') activeStudents++;
        });

        // Get logs (mocked backend generating for now until hookups exist)
        const logsSnapshot = await db.collection('systemLogs').orderBy('timestamp', 'desc').limit(5).get();
        const systemLogs = [];
        logsSnapshot.forEach(doc => {
            systemLogs.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            data: {
                totalUsers,
                activeTeachers,
                activeStudents,
                systemHealth: '99.9%', // Static for now
                systemLogs
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// Create a log entry
router.post('/logs', async (req, res) => {
    try {
        const { msg, type } = req.body;
        const newLog = {
            msg,
            type, // info, success, warning, danger
            timestamp: new Date().toISOString()
        };
        await db.collection('systemLogs').add(newLog);
        res.status(201).json({ message: 'Log created successfully' });
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

module.exports = router;
