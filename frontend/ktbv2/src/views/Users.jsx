import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import axios from '../axiosConfig';
import { BASE_URL } from '../utils';
import Modal from '../components/Modal';

const Users = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const BACKEND_URL = BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/accounts/users');
        setUserData(response.data);
      } catch (error) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      try {
        await axios.delete(`/accounts/users/${id}/`);
        setUserData((prevData) => prevData.filter((user) => user.id !== id));
        alert('User deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  const handleAddUserClick = () => {
    navigate('/user-form');
  };

  const handleViewClick = async (id) => {
    try {
      const response = await axios.get(`/accounts/users/${id}/`);
      console.log("User data fetched:", response.data);
      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <button
        onClick={handleAddUserClick}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        +
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <UserTable data={userData} onDelete={handleDelete} onView={handleViewClick} />
      )}
      {isModalOpen && selectedUser && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">User Details</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex">
              <span className="w-32 font-medium text-gray-900">Name:</span>
              <span>{selectedUser.name}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-medium text-gray-900">Email:</span>
              <span>{selectedUser.email}</span>
            </div>
            {/* Add other fields with same styling */}
            <div className="flex">
              <span className="w-32 font-medium text-gray-900">Phone:</span>
              <span>{selectedUser.phone || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-medium text-gray-900">Designation:</span>
              <span>{selectedUser.designation || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-medium text-gray-900">Role:</span>
              <span>{selectedUser.role || 'N/A'}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;
