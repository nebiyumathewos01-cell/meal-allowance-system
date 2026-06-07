// ============================================================
// routes/auth.js
// Handles Admin Login and Logout
// POST /auth/login  — check username and password
// POST /auth/logout — clear session
// ============================================================

const express = require('express');
const router  = express.Router();
const { readData } = require('../helpers/fileHelper');

// ---- ADMIN LOGIN ----
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admins = readData('admins');
    const admin  = admins.find(a => a.username === username && a.password === password);

    if (!admin) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({
        message: 'Login successful!',
        admin: { username: admin.username, fullName: admin.fullName }
    });
});

module.exports = router;
