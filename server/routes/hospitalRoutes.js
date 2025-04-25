const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, id, location, contact, password } = req.body;
    const db = req.app.locals.db;

    // Check if hospital already exists
    db.query('SELECT * FROM hospitals WHERE hospital_id = ?', [id], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Hospital already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new hospital
      const query = `
        INSERT INTO hospitals (name, hospital_id, location, contact, password)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [name, id, location, contact, hashedPassword],
        async (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
          }

          // Create JWT token
          const token = jwt.sign(
            { id: result.insertId, userType: 'hospital' },
            'your-secret-key',
            { expiresIn: '1h' }
          );

          res.json({
            token,
            hospital: {
              id: result.insertId,
              name,
              hospital_id: id
            }
          });
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    const db = req.app.locals.db;

    // Check if hospital exists
    db.query('SELECT * FROM hospitals WHERE hospital_id = ?', [id], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const hospital = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, hospital.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: hospital.id, userType: 'hospital' },
        'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        token,
        hospital: {
          id: hospital.id,
          name: hospital.name,
          hospital_id: hospital.hospital_id
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 