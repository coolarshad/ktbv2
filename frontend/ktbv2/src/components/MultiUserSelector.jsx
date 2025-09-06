import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import Select from 'react-select';

const MultiUserSelector = ({ selectedUsers = [], onChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/accounts/users');
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Prepare options for react-select
  const options = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  // selectedUsers is array of IDs, so find the matching options:
  const selectedOptions = options.filter(option => selectedUsers.includes(option.value));

  const handleChange = (selectedOptions) => {
    // selectedOptions is an array of {value, label} or null
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange(values);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Notify Users</label>

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <Select
          isMulti
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          placeholder="Select users..."
          className="w-full"
          classNamePrefix="react-select"
          isClearable
          isSearchable
        />
      )}
    </div>
  );
};

export default MultiUserSelector;
