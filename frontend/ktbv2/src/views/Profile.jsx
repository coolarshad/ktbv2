import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: '',
  });
  
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/accounts/profile/');
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setProfileError('Failed to load profile data.');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    try {
      const response = await axios.put('/accounts/profile/', profile);
      setProfile(response.data);
      setProfileMessage('Profile updated successfully.');
    } catch (error) {
      setProfileError('Failed to update profile.');
      console.error(error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await axios.post('/accounts/change-password/', { new_password: newPassword });
      setPasswordMessage('Password changed successfully.');
      setNewPassword('');
    } catch (error) {
      setPasswordError('Failed to change password.');
      console.error(error);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Profile Information</h2>
          
          {profileMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{profileMessage}</div>}
          {profileError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{profileError}</div>}
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email (Read Only)</label>
              <input
                type="email"
                name="email"
                value={profile.email || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded text-gray-500 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone || ''}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={profile.designation || ''}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Role (Read Only)</label>
              <input
                type="text"
                name="role"
                value={profile.role || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded text-gray-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Change Password</h2>
          
          {passwordMessage && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">{passwordMessage}</div>}
          {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{passwordError}</div>}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              Reset Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
