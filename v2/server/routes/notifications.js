const express = require('express');
const router = express.Router();

// Mock function for sending Email
const sendEmailAlert = async (to, subject, text) => {
    console.log(`[EMAIL SEND MOCK] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL BODY]: ${text}`);
    // In production, integrate SendGrid, NodeMailer, or Firebase Extensions here
    return true;
};

// Mock function for sending SMS
const sendSmsAlert = async (phone, message) => {
    console.log(`[SMS SEND MOCK] Phone: ${phone}`);
    console.log(`[SMS MESSAGE]: ${message}`);
    // In production, integrate Twilio or similar SMS gateway here
    return true;
};

// Route to manually trigger a notification (e.g., from Admin or Teacher)
router.post('/send', async (req, res) => {
    try {
        const { type, recipient, subject, message } = req.body;

        if (!recipient || !message) {
            return res.status(400).json({ error: 'Recipient and message are required' });
        }

        if (type === 'email') {
            await sendEmailAlert(recipient, subject || 'School Notification', message);
        } else if (type === 'sms') {
            await sendSmsAlert(recipient, message);
        } else {
            // Default to email if type is not specified or recognized
            await sendEmailAlert(recipient, subject || 'School Notification', message);
        }

        res.json({ success: true, message: 'Notification scheduled/sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
