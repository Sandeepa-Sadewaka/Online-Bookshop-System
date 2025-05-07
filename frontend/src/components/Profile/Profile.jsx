import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../styles/ProfileScreen.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const fetchedUser = response.data.user;

        setUser(fetchedUser);
        setFormData({
          name: fetchedUser.username,
          email: fetchedUser.email,
          phone: fetchedUser.phone || ''
        });
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const phoneRegex = /^\d{10,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile', // ✅ Corrected endpoint
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser({
        ...response.data.user,
        username: response.data.user.name // consistency
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLogged');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="header-content">
            <h1>User Profile</h1>
            <p>Manage your account information</p>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        {success && <div className="alert-success"><p>{success}</p></div>}
        {error && <div className="alert-error"><p>{error}</p></div>}

        <div className="profile-content">
          {!isEditing ? (
            <div className="profile-view">
              <div className="user-avatar">
                <div className="avatar-initial">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h2>{user.username}</h2>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-items">
                    <p><span>Name:</span> {user.username}</p>
                    <p><span>Email:</span> {user.email}</p>
                    <p><span>Phone:</span> {user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Details</h3>
                  <div className="detail-items">
                    <p><span>Member since:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><span>Last updated:</span> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button onClick={() => { setIsEditing(true); setError(''); setSuccess(''); }} className="edit-button">
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`save-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
