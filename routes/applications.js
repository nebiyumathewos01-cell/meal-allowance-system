// ============================================================
// routes/applications.js
// Handles Meal Allowance Applications
// GET    /applications           — get all applications
// POST   /applications           — submit new application
// PUT    /applications/:id       — update application
// DELETE /applications/:id       — delete application
// PUT    /applications/:id/approve — approve application
// PUT    /applications/:id/reject  — reject application
// ============================================================

const express = require('express');
const router  = express.Router();
const { readData, writeData } = require('../helpers/fileHelper');

// ---- GET ALL APPLICATIONS ----
router.get('/', (req, res) => {
    const applications = readData('applications');

    // Optional: filter by status using query param ?status=Pending
    const { status, studentId, name } = req.query;
    let result = applications;

    if (status)    result = result.filter(a => a.status === status);
    if (studentId) result = result.filter(a => a.studentId.toLowerCase().includes(studentId.toLowerCase()));
    if (name) {
        const students = readData('students');
        const matched  = students.filter(s => s.fullName.toLowerCase().includes(name.toLowerCase()));
        const ids      = matched.map(s => s.studentId);
        result         = result.filter(a => ids.includes(a.studentId));
    }

    res.json(result);
});

// ---- GET ONE APPLICATION ----
router.get('/:id', (req, res) => {
    const applications = readData('applications');
    const app          = applications.find(a => a.applicationId === req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    res.json(app);
});

// ---- SUBMIT NEW APPLICATION ----
router.post('/', (req, res) => {
    const { studentId, reason } = req.body;

    if (!studentId || !reason) {
        return res.status(400).json({ error: 'Student ID and reason are required.' });
    }

    // Check student exists
    const students = readData('students');
    if (!students.find(s => s.studentId === studentId)) {
        return res.status(404).json({ error: 'Student not found. Register first.' });
    }

    const applications = readData('applications');

    // One active application per student rule
    const activeApp = applications.find(
        a => a.studentId === studentId && a.status === 'Pending'
    );
    if (activeApp) {
        return res.status(400).json({ error: 'Student already has a pending application.' });
    }

    // Generate a simple application ID
    const applicationId = 'APP' + Date.now();

    const newApp = {
        applicationId,
        studentId,
        reason,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
    };

    applications.push(newApp);
    writeData('applications', applications);

    res.status(201).json({ message: 'Application submitted!', application: newApp });
});

// ---- UPDATE APPLICATION ----
router.put('/:id', (req, res) => {
    const applications = readData('applications');
    const index        = applications.findIndex(a => a.applicationId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Application not found.' });

    applications[index] = { ...applications[index], ...req.body };
    writeData('applications', applications);

    res.json({ message: 'Application updated!', application: applications[index] });
});

// ---- DELETE APPLICATION ----
router.delete('/:id', (req, res) => {
    let applications = readData('applications');
    const exists     = applications.find(a => a.applicationId === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Application not found.' });

    applications = applications.filter(a => a.applicationId !== req.params.id);
    writeData('applications', applications);

    res.json({ message: 'Application deleted!' });
});

// ---- APPROVE APPLICATION ----
router.put('/:id/approve', (req, res) => {
    const applications = readData('applications');
    const index        = applications.findIndex(a => a.applicationId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Application not found.' });

    applications[index].status     = 'Approved';
    applications[index].reviewedAt = new Date().toISOString();
    writeData('applications', applications);

    res.json({ message: 'Application approved!', application: applications[index] });
});

// ---- REJECT APPLICATION ----
router.put('/:id/reject', (req, res) => {
    const applications = readData('applications');
    const index        = applications.findIndex(a => a.applicationId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Application not found.' });

    applications[index].status     = 'Rejected';
    applications[index].reviewedAt = new Date().toISOString();
    writeData('applications', applications);

    res.json({ message: 'Application rejected!', application: applications[index] });
});

module.exports = router;
