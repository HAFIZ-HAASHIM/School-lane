const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebase');

// Pre-register a new user (Teacher by Admin, or Student by Teacher)
router.post('/pre-register', async (req, res) => {
    try {
        const { email, name, role, classId } = req.body;

        if (!email || !name || !role) {
            return res.status(400).json({ error: 'Email, name, and role are required' });
        }

        const preRegisterDoc = {
            email: email.toLowerCase(),
            name,
            role,
            classId: classId || null,
            createdAt: new Date().toISOString(),
            status: 'pending' // pending until they actually register
        };

        // We use the email as the document ID for quick lookup during registration
        await db.collection('preRegisteredUsers').doc(email.toLowerCase()).set(preRegisterDoc);

        res.status(201).json({
            message: 'User pre-registered successfully',
            data: preRegisterDoc
        });
    } catch (error) {
        console.error('Error pre-registering user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if a user is pre-registered (used during sign up)
router.get('/check-pre-registered/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const docRef = await db.collection('preRegisteredUsers').doc(email.toLowerCase()).get();

        if (!docRef.exists) {
            return res.json({ preRegistered: false });
        }

        res.json({
            preRegistered: true,
            data: docRef.data()
        });
    } catch (error) {
        console.error('Error checking pre-registration:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
