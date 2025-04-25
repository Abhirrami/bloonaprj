import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import HospitalSignup from './components/HospitalSignup';
import HospitalLogin from './components/HospitalLogin';
import DonorSignup from './components/DonorSignup';
import DonorLogin from './components/DonorLogin';
import HospitalDashboard from './components/HospitalDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/hospital/signup" element={<HospitalSignup />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/donor/signup" element={<DonorSignup />} />
          <Route path="/donor/login" element={<DonorLogin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
