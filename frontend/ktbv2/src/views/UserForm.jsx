import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from '../axiosConfig';
import { toast } from "react-toastify";

const UserForm = ({ mode }) => {
  const { id: userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: '',
    reports_to: '',
  });

  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // 🔹 Fetch all permissions and users
  useEffect(() => {
    axios.get("/accounts/permissions/")
      .then(res => setAllPermissions(res.data))
      .catch(err => console.error(err));
      
    axios.get("/accounts/users/")
      .then(res => setAllUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔹 Fetch user in edit mode
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    axios.get(`/accounts/users/${userId}/`)
      .then(res => {
        const data = res.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || '',
          role: data.role || '',
          reports_to: data.reports_to || '',
        });

        // Extract permission IDs from data.permissions
        const perms = (data.permissions || []).map(p => typeof p === 'object' ? p.id : p);
        setSelectedPermissions(perms);
      })
      .catch(() => toast.error('Failed to load user data'))
      .finally(() => setLoading(false));
  }, [userId]);

  // 🔹 Input change
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Toggle single permission
  const handlePermissionChange = id => {
    setSelectedPermissions(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  // 🔹 Toggle all in module
  const toggleAllInModule = (perms, selectAll) => {
    const ids = perms.map(p => p.id);
    setSelectedPermissions(prev => selectAll ? Array.from(new Set([...prev, ...ids])) : prev.filter(p => !ids.includes(p)));
  };

  // 🔹 Toggle all permissions globally
  const toggleAllPermissions = selectAll => {
    setSelectedPermissions(selectAll ? allPermissions.map(p => p.id) : []);
  };

  // 🔹 Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const parts = perm.code.split('_');
    const module = parts.slice(1).join('_');
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {});

  // 🔹 Submit
  const handleSubmit = e => {
    e.preventDefault();

    // 🔹 Send permission_ids instead of permissions
    const payload = {
      ...formData,
      permission_ids: selectedPermissions
    };

    const request = userId
      ? axios.put(`/accounts/users/${userId}/`, payload)
      : axios.post(`/accounts/users/`, payload);

    request
      .then(res => {
        toast.success(res.data?.message || "User saved successfully");
        navigate(-1);
      })
      .catch(err => {
        const errorMsg = err.response?.data
          ? JSON.stringify(err.response.data)
          : "Something went wrong";
        toast.error(errorMsg);
        console.error(err);
      });
  };

  // 🔹 Reset Password Handler
  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setResettingPassword(true);
    try {
      await axios.post(`/accounts/users/${userId}/reset-password/`, { new_password: newPassword });
      toast.success('Password successfully reset.');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading user data...</p>;

  const allSelectedGlobally = allPermissions.length > 0 && allPermissions.every(p => selectedPermissions.includes(p.id));

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-semibold border-b pb-2">
        {userId ? 'Update User' : 'Create User'}
      </h2>

      {/* Basic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['name', 'email', 'phone', 'designation'].map(field => (
          <div key={field}>
            <label className="block mb-1 font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required={field === 'name' || field === 'email'}
            />
          </div>
        ))}
        
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">Select Role</option>
            <option value="Manager2">Manager2</option>
            <option value="Manager1">Manager1</option>
            <option value="Accountant">Accountant</option>
            <option value="Operator">Operator</option>
            <option value="Admin">Admin</option>
            <option value="Chemist">Chemist</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Reports To (Manager)</label>
          <select
            name="reports_to"
            value={formData.reports_to || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">None (Top Level)</option>
            {allUsers.map(u => (
              u.id.toString() !== userId?.toString() && (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              )
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex justify-between items-center">
          Permissions
          <button
            type="button"
            onClick={() => toggleAllPermissions(!allSelectedGlobally)}
            className="text-sm text-blue-600 hover:underline"
          >
            {allSelectedGlobally ? 'Deselect All' : 'Select All'}
          </button>
        </h3>

        {Object.entries(groupedPermissions).map(([module, perms]) => {
          const allSelected = perms.every(p => selectedPermissions.includes(p.id));
          return (
            <div key={module} className="mb-6 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold capitalize">{module.replace('_', ' ').toUpperCase()?.replace('_', ' ')?.replace('_', ' ')}</h4>
                <button
                  type="button"
                  onClick={() => toggleAllInModule(perms, !allSelected)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {perms.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                    />
                    {perm.name}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
        {userId ? 'Update User' : 'Create User'}
      </button>

      {/* Admin Password Reset Section */}
      {userId && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Danger Zone</h3>
          <div className="bg-red-50 p-4 rounded border border-red-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block mb-1 font-medium text-red-800">Password Reset</label>
              <input
                type="password"
                placeholder="Enter new password (min 8 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                minLength={8}
              />
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resettingPassword}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition disabled:opacity-50 h-[42px]"
            >
              {resettingPassword ? 'Resetting...' : 'Force Reset Password'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default UserForm;