import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DonorSignup.css';

const DonorSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    donor_id: '',
    blood_group: '',
    location: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });
  const [healthReport, setHealthReport] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setHealthReport(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!healthReport) {
      setError('Please upload your health report');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('age', formData.age);
    data.append('donor_id', formData.donor_id);
    data.append('blood_group', formData.blood_group);
    data.append('location', formData.location);
    data.append('contact', formData.contact);
    data.append('password', formData.password);
    data.append('healthReport', healthReport);

    try {
      const response = await axios.post('http://localhost:5000/api/donor/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'donor');
        localStorage.setItem('donor', JSON.stringify(response.data.donor));
        navigate('/donor/dashboard');
      }
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.error || 'An error occurred during signup');
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Donor Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Donor ID</label>
          <input
            type="text"
            name="donor_id"
            value={formData.donor_id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Blood Group</label>
          <select
            name="blood_group"
            value={formData.blood_group}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contact</label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Health Report</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
      <p className="login-link">
        Already have an account? <span onClick={() => navigate('/donor/login')}>Login</span>
      </p>
    </div>
  );
};

export default DonorSignup; 