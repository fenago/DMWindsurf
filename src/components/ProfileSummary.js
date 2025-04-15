import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileSummary = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const navigate = useNavigate();
  
  // Format interests for display
  const displayInterests = () => {
    if (!userProfile?.profile?.interests || userProfile.profile.interests.length === 0) {
      return null;
    }
    
    return (
      <div className="profile-interests">
        {userProfile.profile.interests.map((interest, index) => (
          <span key={index} className="interest-tag">{interest}</span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="profile-card">
      <div className="profile-summary">
        <div className="profile-avatar">
          {userProfile?.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt="User avatar" />
          ) : (
            <span>{currentUser?.displayName?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{currentUser?.displayName || 'User'}</h2>
          <p className="profile-email">{currentUser?.email}</p>
          <p className="profile-role">Account type: <span className="role-text">{userRole?.toUpperCase()}</span></p>
        </div>
      </div>
      
      {userProfile?.profile && (
        <div className="profile-details">
          {userProfile.profile.occupation && (
            <p className="profile-occupation">{userProfile.profile.occupation}</p>
          )}
          
          {userProfile.profile.location && (
            <p className="profile-location">
              <i className="location-icon">📍</i> {userProfile.profile.location}
            </p>
          )}
          
          {userProfile.profile.bio && (
            <p className="profile-bio">{userProfile.profile.bio}</p>
          )}
          
          {userProfile.profile.website && (
            <p className="profile-website">
              <a href={userProfile.profile.website} target="_blank" rel="noopener noreferrer">
                {userProfile.profile.website.replace(/(https?:\/\/)?(www\.)?/, '')}
              </a>
            </p>
          )}
          
          {displayInterests()}
        </div>
      )}
      
      <div className="profile-actions">
        <button onClick={() => navigate('/profile')} className="profile-edit-button">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSummary;
