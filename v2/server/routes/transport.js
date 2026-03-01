const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all transport routes
router.get('/routes', async (req, res) => {
    try {
        const snapshot = await db.collection('transport_routes').get();
        const routes = [];
        snapshot.forEach(doc => {
            routes.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: routes });
    } catch (error) {
        console.error('Error fetching transport routes:', error);
        res.status(500).json({ error: 'Failed to fetch transport routes' });
    }
});

// Add a new route
router.post('/routes', async (req, res) => {
    try {
        const { routeName, vehicleNumber, driverName, driverPhone, capacity, stops } = req.body;
        const newRoute = {
            routeName,
            vehicleNumber,
            driverName,
            driverPhone,
            capacity: Number(capacity) || 0,
            stops: stops || [], // Array of { stopName, time, fee }
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('transport_routes').add(newRoute);
        res.status(201).json({ data: { id: docRef.id, ...newRoute } });
    } catch (error) {
        console.error('Error adding route:', error);
        res.status(500).json({ error: 'Failed to add route' });
    }
});

// Update a route
router.put('/routes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection('transport_routes').doc(id).update(updates);
        res.json({ message: 'Route updated successfully' });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ error: 'Failed to update route' });
    }
});

// Delete a route
router.delete('/routes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('transport_routes').doc(id).delete();
        res.json({ message: 'Route deleted successfully' });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ error: 'Failed to delete route' });
    }
});

module.exports = router;
