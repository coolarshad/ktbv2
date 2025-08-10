import React from 'react';

const UserTable = ({ data, onDelete, onView }) => {
  return (
    <div className="overflow-x-auto shadow border rounded">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 border">S.N</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{index + 1}</td>
              <td className="px-4 py-2 border">{user.name}</td>
              <td className="px-4 py-2 border">{user.email}</td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={() => onView(user.id)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
