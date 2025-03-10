import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const roleFromStorage = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (roleFromStorage && token) {
      setRole(roleFromStorage);
      fetchProfile(roleFromStorage, token);
    }
  }, []);

  const fetchProfile = async (role, token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/${role}/profile`, {
        headers: { "x-auth-token": `${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };
  
  // Function to navigate back to dashboard
  const goBackToDashboard = () => {
    navigate('/dashboard'); // Navigate to the dashboard route
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '50px' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Profile</h1>
      {profile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ color: '#666' }}><strong>Name:</strong> {profile.name}</p>
          <p style={{ color: '#666' }}><strong>Email:</strong> {profile.email}</p>
          <p style={{ color: '#666' }}><strong>Phone:</strong> {profile.phone}</p>
          <p style={{ color: '#666' }}><strong>Address:</strong> {profile.address}</p>
          <p style={{ color: '#666' }}><strong>Country:</strong> {profile.country}</p>
          {role === 'manufacturer' && profile.website && (
            <p style={{ color: '#666' }}><strong>Website:</strong> {profile.website}</p>
          )}
          {/* Back to Dashboard Button */}
          <button
            onClick={goBackToDashboard}
            style={{
              padding: '10px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: 'fit-content',
              marginTop: '20px',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading profile...</p>
      )}
    </div>
  );
}

export default ProfilePage;