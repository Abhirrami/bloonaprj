const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blood_donation'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    return;
  }
  console.log('MySQL Connected');
  
  // Create tables if they don't exist
  const createDonorsTable = `
    CREATE TABLE IF NOT EXISTS donors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      donor_id VARCHAR(255) NOT NULL UNIQUE,
      blood_group VARCHAR(10) NOT NULL,
      location VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      health_report VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createHospitalsTable = `
    CREATE TABLE IF NOT EXISTS hospitals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      hospital_id VARCHAR(255) NOT NULL UNIQUE,
      location VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createDonorsTable, (err) => {
    if (err) console.error('Error creating donors table:', err);
  });

  db.query(createHospitalsTable, (err) => {
    if (err) console.error('Error creating hospitals table:', err);
  });
});

// Make db accessible to routes
app.locals.db = db;

// Routes
app.use('/api/donor', require('./routes/donorRoutes'));
app.use('/api/hospital', require('./routes/hospitalRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 