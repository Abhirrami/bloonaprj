import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to Bloona</h1>
      <p>Your trusted blood donation platform</p>
      <div className="button-container">
        <button 
          className="hospital-btn"
          onClick={() => navigate('/hospital')}
        >
          Hospital
        </button>
        <button 
          className="donor-btn"
          onClick={() => navigate('/donor')}
        >
          Donor
        </button>
      </div>
    </div>
  );
};

export default WelcomePage; 