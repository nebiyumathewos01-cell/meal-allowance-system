// ============================================================
// routes/dashboard.js
// Returns summary statistics for the admin dashboard
// GET /dashboard
// ============================================================

const express = require('express');
const router  = express.Router();
const { readData } = require('../helpers/fileHelper');

router.get('/', (req, res) => {
    const students     = readData('students');
    const applications = readData('applications');
    const payments     = readData('payments');

    const totalStudents     = students.length;
    const totalApplications = applications.length;
    const approved          = applications.filter(a => a.status === 'Approved').length;
    const rejected          = applications.filter(a => a.status === 'Rejected').length;
    const pending           = applications.filter(a => a.status === 'Pending').length;
    const totalPayments     = payments.length;
    const totalBudget       = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
        totalStudents,
        totalApplications,
        approved,
        rejected,
        pending,
        totalPayments,
        totalBudget
    });
});

module.exports = router;
