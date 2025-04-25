import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to Bloona</h1>
        <p>Your trusted platform for blood donation management</p>
        
        <div className="user-types">
          <div className="user-type hospital">
            <h2>For Hospitals</h2>
            <div className="button-group">
              <button onClick={() => navigate('/hospital/signup')}>Sign Up</button>
              <button onClick={() => navigate('/hospital/login')}>Login</button>
            </div>
          </div>
          
          <div className="user-type donor">
            <h2>For Donors</h2>
            <div className="button-group">
              <button onClick={() => navigate('/donor/signup')}>Sign Up</button>
              <button onClick={() => navigate('/donor/login')}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 