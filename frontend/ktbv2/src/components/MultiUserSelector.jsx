import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import Select from 'react-select';

const MultiUserSelector = ({ selectedUsers = [], onChange, message = '', onMessageChange, isDisabled = false, isMessageRequired = false }) => {
  const { user } = useAuth();
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
    <div className="mb-4 mx-2">
      <label className="block text-sm font-medium mb-1">Notify Users</label>

      {loading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : (
        <>
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
            isDisabled={isDisabled}
          />
          {selectedUsers.length > 0 && onMessageChange && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Email/Notification Message {isMessageRequired ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder={isMessageRequired
                  ? "Write a custom message that will go in the notification and email..."
                  : "Write an optional custom message that will go in the notification and email..."
                }
                className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={3}
                disabled={isDisabled}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultiUserSelector;
