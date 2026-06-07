// ============================================================
// fileHelper.js — Read and Write JSON Files
// Instead of a database, we store data in JSON files.
// This file has two functions: readData() and writeData()
// ============================================================

const fs   = require('fs');
const path = require('path');

// readData(filename)
// Reads a JSON file and returns the array of records
// Example: readData('students') reads data/students.json
function readData(filename) {
    const filePath = path.join(__dirname, '../data', filename + '.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

// writeData(filename, data)
// Writes an array of records back to a JSON file
// Example: writeData('students', updatedArray)
function writeData(filename, data) {
    const filePath = path.join(__dirname, '../data', filename + '.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };
