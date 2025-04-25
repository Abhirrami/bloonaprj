const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bloona',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');

    // Create hospitals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hospital_id VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        contact VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create donors table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS donors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        donor_id VARCHAR(50) UNIQUE NOT NULL,
        blood_group VARCHAR(5) NOT NULL,
        location VARCHAR(255) NOT NULL,
        health_report VARCHAR(255),
        contact VARCHAR(20) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified/created');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

initializeDatabase();

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Hospital Signup
app.post('/api/hospital/signup', async (req, res) => {
  let connection;
  try {
    const { name, id, location, contact, password } = req.body;
    
    if (!name || !id || !location || !contact || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    connection = await pool.getConnection();

    // Check if hospital ID exists
    const [existing] = await connection.execute(
      'SELECT * FROM hospitals WHERE hospital_id = ?',
      [id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Hospital ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new hospital
    const [result] = await connection.execute(
      'INSERT INTO hospitals (name, hospital_id, location, contact, password) VALUES (?, ?, ?, ?, ?)',
      [name, id, location, contact, hashedPassword]
    );

    const token = jwt.sign(
      { id: id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      token,
      hospital: { name, id, location, contact }
    });
  } catch (error) {
    console.error('Hospital signup error:', error);
    res.status(500).json({ error: 'Error creating hospital account' });
  } finally {
    if (connection) connection.release();
  }
});

// Hospital Login
app.post('/api/hospital/login', async (req, res) => {
  let connection;
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: 'Hospital ID and password are required' });
    }

    connection = await pool.getConnection();

    const [hospitals] = await connection.execute(
      'SELECT * FROM hospitals WHERE hospital_id = ?',
      [id]
    );

    if (hospitals.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const hospital = hospitals[0];
    const validPassword = await bcrypt.compare(password, hospital.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: hospital.hospital_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      hospital: {
        name: hospital.name,
        id: hospital.hospital_id,
        location: hospital.location,
        contact: hospital.contact
      }
    });
  } catch (error) {
    console.error('Hospital login error:', error);
    res.status(500).json({ error: 'Error during login' });
  } finally {
    if (connection) connection.release();
  }
});

// Get Hospital Details
app.get('/api/hospital/details', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [hospitals] = await connection.execute(
      'SELECT name, hospital_id, location, contact, created_at FROM hospitals WHERE hospital_id = ?',
      [req.user.id]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const hospital = hospitals[0];
    res.json({
      success: true,
      hospital: {
        name: hospital.name,
        id: hospital.hospital_id,
        location: hospital.location,
        contact: hospital.contact,
        joinedDate: hospital.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching hospital details:', error);
    res.status(500).json({ error: 'Error fetching hospital details' });
  } finally {
    if (connection) connection.release();
  }
});

// Donor Signup
app.post('/api/donor/signup', upload.single('healthReport'), async (req, res) => {
  try {
    const { name, age, donor_id, blood_group, location, contact, password } = req.body;
    const healthReport = req.file ? req.file.path : null;

    // Validate required fields
    if (!name || !age || !donor_id || !blood_group || !location || !contact || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if donor ID already exists
    const [existingDonors] = await pool.execute(
      'SELECT * FROM donors WHERE donor_id = ?',
      [donor_id]
    );

    if (existingDonors.length > 0) {
      return res.status(400).json({ error: 'Donor ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new donor
    const [result] = await pool.execute(
      'INSERT INTO donors (name, age, donor_id, blood_group, location, health_report, contact, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, age, donor_id, blood_group, location, healthReport, contact, hashedPassword]
    );

    res.status(201).json({ 
      message: 'Donor account created successfully',
      donor: { name, donor_id }
    });
  } catch (error) {
    console.error('Donor signup error:', error);
    res.status(500).json({ error: 'Error creating donor account' });
  }
});

// Donor Login
app.post('/api/donor/login', async (req, res) => {
  try {
    const { donor_id, password } = req.body;

    // Validate required fields
    if (!donor_id || !password) {
      return res.status(400).json({ error: 'Donor ID and password are required' });
    }

    // Find donor
    const [donors] = await pool.execute(
      'SELECT * FROM donors WHERE donor_id = ?',
      [donor_id]
    );

    if (donors.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const donor = donors[0];
    const validPassword = await bcrypt.compare(password, donor.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: donor.donor_id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      donor: {
        name: donor.name,
        id: donor.donor_id
      }
    });
  } catch (error) {
    console.error('Donor login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 