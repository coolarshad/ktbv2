import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const Users = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/accounts/users/');
        setUserData(res.data);
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/accounts/users/${id}/`);
      setUserData(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleView = async (id) => {
    try {
      const res = await axios.get(`/accounts/users/${id}/`);
      setSelectedUser(res.data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => navigate('/user-form')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left">#</th>
                <th className="px-4 py-2 border-b text-left">Name</th>
                <th className="px-4 py-2 border-b text-left">Email</th>
                <th className="px-4 py-2 border-b text-left">Role</th>
                <th className="px-4 py-2 border-b text-left">Designation</th>
                <th className="px-4 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{index + 1}</td>
                  <td className="px-4 py-2 border-b">{user.name}</td>
                  <td className="px-4 py-2 border-b">{user.email}</td>
                  <td className="px-4 py-2 border-b">{user.role || 'N/A'}</td>
                  <td className="px-4 py-2 border-b">{user.designation || 'N/A'}</td>
                  <td className="px-4 py-2 border-b flex justify-center gap-2">
                    <button
                      onClick={() => handleView(user.id)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/user-form/${user.id}`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for detailed view */}
      {isModalOpen && selectedUser && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 bg-white rounded shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
              <button
                onClick={closeModal}
                className="text-red-500 font-bold hover:text-red-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex">
                <span className="w-40 font-medium">Email:</span>
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Phone:</span>
                <span>{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Role:</span>
                <span>{selectedUser.role || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-40 font-medium">Designation:</span>
                <span>{selectedUser.designation || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="w-40 font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                    selectedUser.permissions.map(p => (
                      <span
                        key={p.id}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {p.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;