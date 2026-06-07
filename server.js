// ============================================================
// server.js — Main Entry Point
// This is where the Express server starts.
// It connects all routes and serves the frontend files.
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Import route files (each file handles one feature)
const studentRoutes     = require('./routes/students');
const applicationRoutes = require('./routes/applications');
const paymentRoutes     = require('./routes/payments');
const dashboardRoutes   = require('./routes/dashboard');
const authRoutes        = require('./routes/auth');

const app  = express();
const PORT = 4000;

// ---- MIDDLEWARE ----
// Middleware runs before every request
// cors() allows the frontend to talk to the backend
// express.json() lets us read JSON data sent from the frontend
app.use(cors());
app.use(express.json());

// Serve the frontend HTML/CSS/JS files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ---- ROUTES ----
// Each route group handles a different part of the system
app.use('/students',     studentRoutes);
app.use('/applications', applicationRoutes);
app.use('/payments',     paymentRoutes);
app.use('/dashboard',    dashboardRoutes);
app.use('/auth',         authRoutes);

// ---- START SERVER ----
app.listen(PORT, () => {
    console.log('====================================');
    console.log(' Meal Allowance System is running!');
    console.log(' Open: http://localhost:' + PORT);
    console.log('====================================');
});
