import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminControls from '../components/AdminControls';
import ProfileSummary from '../components/ProfileSummary';

const Dashboard = () => {
  const { currentUser, userRole, userProfile, ROLES, logout, isAdmin, isSubscriber } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <div className="role-badge">
            {userRole === ROLES.ADMIN && <span className="badge admin">Admin</span>}
            {userRole === ROLES.SUBSCRIBER && <span className="badge subscriber">Subscriber</span>}
            {userRole === ROLES.FREE && <span className="badge free">Free User</span>}
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <ProfileSummary />
        </div>

        {/* Content for all users */}
        <div className="dashboard-section">
          <h3>Features Available to All Users</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>Basic Profile</h4>
              <p>Manage your basic account information</p>
            </div>
          </div>
        </div>

        {/* Content only for subscribers and admins */}
        {isSubscriber() && (
          <div className="dashboard-section premium">
            <h3>Premium Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>Advanced Analytics</h4>
                <p>Access detailed analytics and insights</p>
              </div>
              <div className="feature-card">
                <h4>Priority Support</h4>
                <p>Get faster responses from our support team</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin-only section */}
        {isAdmin() && (
          <div className="dashboard-section admin">
            <h3>Administration</h3>
            <div className="features-grid">
              <div className="feature-card">
                <h4>User Management</h4>
                <p>Manage users and their roles</p>
                <button className="feature-button">Manage Users</button>
              </div>
              <div className="feature-card">
                <h4>System Settings</h4>
                <p>Configure application settings</p>
                <button className="feature-button">Settings</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Call to action for free users */}
        {userRole === ROLES.FREE && (
          <div className="upgrade-section">
            <h3>Upgrade Your Experience</h3>
            <p>Get access to premium features by becoming a subscriber</p>
            <button onClick={() => navigate('/payment')} className="action-button">
              Upgrade to Premium
            </button>
          </div>
        )}
        
        {/* For subscribers - manage subscription section */}
        {userRole === ROLES.SUBSCRIBER && (
          <div className="subscription-section">
            <h3>Manage Your Subscription</h3>
            <button onClick={() => navigate('/payment')} className="secondary-button">
              Manage Subscription
            </button>
          </div>
        )}
        
        {/* Admin controls for testing - would be removed in production */}
        <div className="testing-controls">
          <AdminControls />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
