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
  const [allPermissions, setAllPermissions] = useState([]);

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

    const fetchPermissions = async () => {
      try {
        const res = await axios.get('/accounts/permissions/');
        setAllPermissions(res.data);
      } catch (err) {
        console.error('Failed to fetch permissions');
      }
    };

    fetchUsers();
    fetchPermissions();
  }, []);

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const parts = perm.code.split('_');
    const module = parts.slice(1).join('_');
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

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
        <Modal isOpen={isModalOpen} onClose={closeModal} maxWidth="max-w-5xl">
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-2xl font-semibold">User Details</h2>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'email', 'phone', 'designation', 'role'].map(field => (
                <div key={field}>
                  <label className="block mb-1 font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    name={field}
                    value={selectedUser[field] || ''}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Permissions Section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex justify-between items-center">
                Permissions
              </h3>

              {Object.entries(groupedPermissions).map(([module, perms]) => {
                const userPermIds = (selectedUser.permissions || []).map(p => typeof p === 'object' ? p.id : p);
                return (
                  <div key={module} className="mb-6 p-4 border rounded bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold capitalize">{module.replace('_', ' ')}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {perms.map(perm => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 border rounded bg-white cursor-not-allowed opacity-80">
                          <input
                            type="checkbox"
                            checked={userPermIds.includes(perm.id)}
                            readOnly
                            disabled
                            className="cursor-not-allowed"
                          />
                          {perm.name}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;