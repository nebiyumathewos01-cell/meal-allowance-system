// ============================================================
// routes/payments.js
// Handles monthly meal allowance payments (3000 Birr/month)
// GET  /payments      — get all payments
// POST /payments      — record a new payment
// ============================================================

const express = require('express');
const router  = express.Router();
const { readData, writeData } = require('../helpers/fileHelper');

const MONTHLY_ALLOWANCE = 3000; // Fixed at 3000 Birr per month

// ---- GET ALL PAYMENTS ----
router.get('/', (req, res) => {
    const payments = readData('payments');

    // Optional filter by studentId
    const { studentId } = req.query;
    if (studentId) {
        return res.json(payments.filter(p => p.studentId === studentId));
    }

    res.json(payments);
});

// ---- RECORD A NEW PAYMENT ----
// Only approved students can receive payment
router.post('/', (req, res) => {
    const { studentId, month, year } = req.body;

    if (!studentId || !month || !year) {
        return res.status(400).json({ error: 'studentId, month, and year are required.' });
    }

    // Check student exists
    const students = readData('students');
    if (!students.find(s => s.studentId === studentId)) {
        return res.status(404).json({ error: 'Student not found.' });
    }

    // Check student has an approved application
    const applications = readData('applications');
    const approved     = applications.find(
        a => a.studentId === studentId && a.status === 'Approved'
    );
    if (!approved) {
        return res.status(400).json({ error: 'Student does not have an approved application.' });
    }

    const payments = readData('payments');

    // Prevent double payment for the same month
    const alreadyPaid = payments.find(
        p => p.studentId === studentId && p.month === month && p.year === year
    );
    if (alreadyPaid) {
        return res.status(400).json({ error: 'Payment already made for this month.' });
    }

    const newPayment = {
        paymentId: 'PAY' + Date.now(),
        studentId,
        month,
        year,
        amount:    MONTHLY_ALLOWANCE,
        status:    'Paid',
        paidAt:    new Date().toISOString()
    };

    payments.push(newPayment);
    writeData('payments', payments);

    res.status(201).json({ message: 'Payment recorded!', payment: newPayment });
});

module.exports = router;
