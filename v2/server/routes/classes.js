const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get classes
router.get('/', async (req, res) => {
    try {
        const { teacherId } = req.query;
        let classesQuery = db.collection('classes');

        if (teacherId) {
            classesQuery = classesQuery.where('teacherId', '==', teacherId);
        }

        const snapshot = await classesQuery.get();
        const classes = [];
        snapshot.forEach(doc => classes.push({ id: doc.id, ...doc.data() }));

        res.json({
            message: 'Classes fetched',
            data: classes
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
