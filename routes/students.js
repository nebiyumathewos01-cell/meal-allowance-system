// ============================================================
// routes/students.js
// Handles all Student CRUD operations
// GET    /students         — get all students
// POST   /students         — register new student
// PUT    /students/:id     — update student info
// DELETE /students/:id     — remove student
// ============================================================

const express = require('express');
const router  = express.Router();
const { readData, writeData } = require('../helpers/fileHelper');

// ---- GET ALL STUDENTS ----
// Returns the full list of registered students
router.get('/', (req, res) => {
    const students = readData('students');
    res.json(students);
});

// ---- GET ONE STUDENT BY ID ----
router.get('/:id', (req, res) => {
    const students = readData('students');
    const student  = students.find(s => s.studentId === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
});

// ---- REGISTER NEW STUDENT ----
// Validates required fields, checks for duplicate student ID
router.post('/', (req, res) => {
    const { studentId, fullName, gender, department, yearOfStudy, email, phone, address } = req.body;

    // Validation: check all required fields exist
    if (!studentId || !fullName || !gender || !department || !yearOfStudy || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate phone: must be 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Phone must be 10 digits.' });
    }

    const students = readData('students');

    // Check for duplicate student ID
    if (students.find(s => s.studentId === studentId)) {
        return res.status(400).json({ error: 'Student ID already registered.' });
    }

    // Create the new student object
    const newStudent = {
        studentId,
        fullName,
        gender,
        department,
        yearOfStudy,
        email,
        phone,
        address: address || '',
        registeredAt: new Date().toISOString()
    };

    students.push(newStudent);
    writeData('students', students);

    res.status(201).json({ message: 'Student registered successfully!', student: newStudent });
});

// ---- UPDATE STUDENT ----
router.put('/:id', (req, res) => {
    const students = readData('students');
    const index    = students.findIndex(s => s.studentId === req.params.id);

    if (index === -1) return res.status(404).json({ error: 'Student not found.' });

    // Merge existing data with updated fields
    students[index] = { ...students[index], ...req.body };
    writeData('students', students);

    res.json({ message: 'Student updated successfully!', student: students[index] });
});

// ---- DELETE STUDENT ----
router.delete('/:id', (req, res) => {
    let students = readData('students');
    const exists = students.find(s => s.studentId === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Student not found.' });

    students = students.filter(s => s.studentId !== req.params.id);
    writeData('students', students);

    res.json({ message: 'Student deleted successfully!' });
});

module.exports = router;
