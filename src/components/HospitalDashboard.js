import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HospitalDashboard.css';

const HospitalDashboard = () => {
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/hospital/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/hospital/details', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setHospitalDetails(response.data.hospital);
        }
      } catch (error) {
        setError('Error fetching hospital details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/hospital/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="hospital-dashboard">
      <div className="dashboard-header">
        <h1>Hospital Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {hospitalDetails && (
        <div className="hospital-details">
          <h2>Hospital Information</h2>
          <div className="detail-item">
            <span className="label">Name:</span>
            <span className="value">{hospitalDetails.name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Hospital ID:</span>
            <span className="value">{hospitalDetails.id}</span>
          </div>
          <div className="detail-item">
            <span className="label">Location:</span>
            <span className="value">{hospitalDetails.location}</span>
          </div>
          <div className="detail-item">
            <span className="label">Contact:</span>
            <span className="value">{hospitalDetails.contact}</span>
          </div>
          <div className="detail-item">
            <span className="label">Joined Date:</span>
            <span className="value">{new Date(hospitalDetails.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard; 