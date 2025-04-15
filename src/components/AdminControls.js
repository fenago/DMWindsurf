import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { promoteToAdmin } from '../utils/adminUtils';

/**
 * Development tool to easily test different user roles
 * This would not be included in a production application
 */
const AdminControls = () => {
  const { currentUser, userRole, ROLES, updateUserRole } = useAuth();

  const setUserRole = async (role) => {
    try {
      if (role === ROLES.ADMIN) {
        await promoteToAdmin(currentUser.uid);
      } else {
        await updateUserRole(currentUser.uid, role);
      }
      alert(`Role successfully changed to ${role.toUpperCase()}`);
      window.location.reload(); // Reload to see changes immediately
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change role. See console for details.');
    }
  };

  return (
    <div className="admin-controls-panel">
      <h3>Role Testing Controls</h3>
      <p>Current role: <strong>{userRole?.toUpperCase()}</strong></p>
      <div className="role-buttons">
        <button 
          onClick={() => setUserRole(ROLES.FREE)}
          className={`role-button ${userRole === ROLES.FREE ? 'active' : ''}`}
          disabled={userRole === ROLES.FREE}
        >
          Set as FREE
        </button>
        <button 
          onClick={() => setUserRole(ROLES.SUBSCRIBER)}
          className={`role-button ${userRole === ROLES.SUBSCRIBER ? 'active' : ''}`}
          disabled={userRole === ROLES.SUBSCRIBER}
        >
          Set as SUBSCRIBER
        </button>
        <button 
          onClick={() => setUserRole(ROLES.ADMIN)}
          className={`role-button ${userRole === ROLES.ADMIN ? 'active' : ''}`}
          disabled={userRole === ROLES.ADMIN}
        >
          Set as ADMIN
        </button>
      </div>
    </div>
  );
};

export default AdminControls;
