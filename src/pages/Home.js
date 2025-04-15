import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to Base App</h1>
        <p>Your foundation for building amazing applications</p>
      </div>
      <div className="home-content">
        <div className="features-section">
          <h2>Features</h2>
          <ul>
            <li>User Authentication (Login/Signup)</li>
            <li>Firebase Integration</li>
            <li>Stripe Payment Processing</li>
            <li>Responsive Design</li>
          </ul>
        </div>
        <div className="cta-section">
          {currentUser ? (
            <Link to="/dashboard" className="cta-button">
              Go to Dashboard
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">
                Login
              </Link>
              <Link to="/signup" className="auth-link signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
