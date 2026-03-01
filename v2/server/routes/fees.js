const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all fee records
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('fees').get();
        const fees = [];
        snapshot.forEach(doc => {
            fees.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: fees });
    } catch (error) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ error: 'Failed to fetch fee records' });
    }
});

// Create a new fee invoice
router.post('/', async (req, res) => {
    try {
        const { title, description, amount, dueDate, targetClass, targetStudent } = req.body;

        const newFee = {
            title,
            description: description || '',
            amount: Number(amount),
            dueDate,
            targetClass: targetClass || 'All',
            targetStudent: targetStudent || 'All',
            status: 'Pending', // Pending, Partially Paid, Paid, Overdue
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('fees').add(newFee);
        res.status(201).json({ data: { id: docRef.id, ...newFee } });
    } catch (error) {
        console.error('Error creating fee:', error);
        res.status(500).json({ error: 'Failed to create fee invoice' });
    }
});

// Update fee status (e.g. mark as paid)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection('fees').doc(id).update(updates);
        res.json({ message: 'Fee updated successfully' });
    } catch (error) {
        console.error('Error updating fee:', error);
        res.status(500).json({ error: 'Failed to update fee' });
    }
});

// Delete a fee
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('fees').doc(id).delete();
        res.json({ message: 'Fee deleted successfully' });
    } catch (error) {
        console.error('Error deleting fee:', error);
        res.status(500).json({ error: 'Failed to delete fee' });
    }
});

module.exports = router;
