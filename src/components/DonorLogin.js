import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DonorLogin.css';

const DonorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    donor_id: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/donor/login', {
        donor_id: formData.donor_id,
        password: formData.password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'donor');
        localStorage.setItem('donor', JSON.stringify(response.data.donor));
        navigate('/donor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Donor Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
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
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Login</button>
      </form>
      <p className="signup-link">
        Don't have an account? <span onClick={() => navigate('/donor/signup')}>Sign Up</span>
      </p>
    </div>
  );
};

export default DonorLogin; 