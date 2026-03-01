const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all books
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('library').get();
        const books = [];
        snapshot.forEach(doc => {
            books.push({ id: doc.id, ...doc.data() });
        });
        res.json({ data: books });
    } catch (error) {
        console.error('Error fetching library books:', error);
        res.status(500).json({ error: 'Failed to fetch library inventory' });
    }
});

// Add a new book
router.post('/', async (req, res) => {
    try {
        const { title, author, isbn, section, totalCopies, availableCopies } = req.body;
        const newBook = {
            title,
            author,
            isbn,
            section,
            totalCopies: Number(totalCopies) || 1,
            availableCopies: Number(availableCopies) || Number(totalCopies) || 1,
            addedAt: new Date().toISOString()
        };

        const docRef = await db.collection('library').add(newBook);
        res.status(201).json({ data: { id: docRef.id, ...newBook } });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});

// Update Book (e.g. issuing or returning a copy)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection('library').doc(id).update(updates);
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Delete a book
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('library').doc(id).delete();
        res.json({ message: 'Book removed' });
    } catch (error) {
        console.error('Error removing book:', error);
        res.status(500).json({ error: 'Failed to remove book' });
    }
});

// Get all active loans (issued books)
router.get('/loans', async (req, res) => {
    try {
        const snapshot = await db.collection('library_loans').where('status', '==', 'Issued').get();
        const loans = [];
        snapshot.forEach(doc => loans.push({ id: doc.id, ...doc.data() }));
        res.json({ data: loans });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

// Issue a book to a user
router.post('/loans', async (req, res) => {
    try {
        const { bookId, bookTitle, userId, userRole, userName, dueDate } = req.body;
        const loan = {
            bookId,
            bookTitle,
            userId,
            userRole,
            userName,
            dueDate,
            issueDate: new Date().toISOString(),
            status: 'Issued'
        };
        const docRef = await db.collection('library_loans').add(loan);

        // Decrease available copies
        const bookRef = db.collection('library').doc(bookId);
        const bookDoc = await bookRef.get();
        if (bookDoc.exists) {
            const current = bookDoc.data().availableCopies;
            if (current > 0) {
                await bookRef.update({ availableCopies: current - 1 });
            }
        }

        res.status(201).json({ data: { id: docRef.id, ...loan } });
    } catch (error) {
        console.error('Error issuing book:', error);
        res.status(500).json({ error: 'Failed to issue book' });
    }
});

// Return a book
router.post('/loans/:id/return', async (req, res) => {
    try {
        const { id } = req.params;
        const loanRef = db.collection('library_loans').doc(id);
        const loanDoc = await loanRef.get();

        if (loanDoc.exists) {
            await loanRef.update({ status: 'Returned', returnDate: new Date().toISOString() });

            // Increase available copies
            const bookId = loanDoc.data().bookId;
            const bookRef = db.collection('library').doc(bookId);
            const bookDoc = await bookRef.get();
            if (bookDoc.exists) {
                const current = bookDoc.data().availableCopies;
                await bookRef.update({ availableCopies: current + 1 });
            }
            res.json({ message: 'Book returned successfully' });
        } else {
            res.status(404).json({ error: 'Loan not found' });
        }
    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({ error: 'Failed to process return' });
    }
});

module.exports = router;
