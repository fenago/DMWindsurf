import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { 
    currentUser, 
    userProfile, 
    uploadAvatar, 
    updateUserProfile, 
    fetchUserProfile,
    profileLoading 
  } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // Form fields
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [website, setWebsite] = useState('');
  const [interests, setInterests] = useState('');

  useEffect(() => {
    // Load user profile data
    if (userProfile) {
      setAvatarPreview(userProfile.avatarUrl || '');
      const profile = userProfile.profile || {};
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setOccupation(profile.occupation || '');
      setWebsite(profile.website || '');
      setInterests(profile.interests?.join(', ') || '');
    }
  }, [userProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Process interests from comma-separated string to array
      const interestsArray = interests
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      // Update profile data
      const profileData = {
        bio,
        location,
        occupation, 
        website,
        interests: interestsArray
      };

      // Update profile in Firebase
      await updateUserProfile(currentUser.uid, profileData);
      
      // Upload avatar if a new one is selected
      if (avatarFile) {
        await uploadAvatar(avatarFile, currentUser.uid);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Edit Profile</h1>
        <button onClick={() => navigate('/dashboard')} className="back-button-sm">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profile updated successfully!</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="avatar-section">
          <div className="avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" />
            ) : (
              <div className="avatar-placeholder">
                {currentUser?.displayName?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="avatar-upload">
            <label htmlFor="avatar" className="avatar-label">
              Change Profile Picture
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
            />
            <p className="avatar-help-text">Recommended: Square image, max 1MB</p>
          </div>
        </div>

        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>

          <div className="form-group">
            <label htmlFor="occupation">Occupation</label>
            <input
              type="text"
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Your profession"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">Interests (comma-separated)</label>
            <input
              type="text"
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Technology, Travel, Music"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button" 
            disabled={loading || profileLoading}
          >
            {loading || profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
