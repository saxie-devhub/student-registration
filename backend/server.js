require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// REAL DATABASE CONNECTION
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL Database!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

// CREATE
app.post('/api/students', async (req, res) => {
  try {
    const { full_name, email, phone, course, gender, dob } = req.body;
    const [result] = await pool.query(
      `INSERT INTO students (full_name, email, phone, course, gender, dob)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone || null, course, gender, dob]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// READ ALL
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});
// UPDATE (New!)
app.put('/api/students/:id', async (req, res) => {
  try {
    const { full_name, email, phone, course, gender, dob } = req.body;
    const { id } = req.params;
    
    await pool.query(
      `UPDATE students 
       SET full_name = ?, email = ?, phone = ?, course = ?, gender = ?, dob = ?
       WHERE id = ?`,
      [full_name, email, phone || null, course, gender, dob, id]
    );
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE
app.delete('/api/students/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});