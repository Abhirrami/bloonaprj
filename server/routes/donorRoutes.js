const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/health-reports');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Signup route
router.post('/signup', upload.single('healthReport'), async (req, res) => {
  try {
    const { name, age, donor_id, blood_group, location, contact, password } = req.body;
    const db = req.app.locals.db;

    // Check if donor already exists
    db.query('SELECT * FROM donors WHERE donor_id = ?', [donor_id], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Donor already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new donor
      const query = `
        INSERT INTO donors (name, age, donor_id, blood_group, location, contact, password, health_report)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [name, age, donor_id, blood_group, location, contact, hashedPassword, req.file.path],
        async (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error' });
          }

          // Create JWT token
          const token = jwt.sign(
            { id: result.insertId, userType: 'donor' },
            'your-secret-key',
            { expiresIn: '1h' }
          );

          res.json({
            token,
            donor: {
              id: result.insertId,
              name,
              donor_id,
              blood_group
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
    const { donor_id, password } = req.body;
    const db = req.app.locals.db;

    // Check if donor exists
    db.query('SELECT * FROM donors WHERE donor_id = ?', [donor_id], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const donor = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, donor.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: donor.id, userType: 'donor' },
        'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        token,
        donor: {
          id: donor.id,
          name: donor.name,
          donor_id: donor.donor_id,
          blood_group: donor.blood_group
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 