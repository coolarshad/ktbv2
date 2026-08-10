import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, canUserDeleteApproved } from '../utils';

const ConsumptionFormulaTable = ({ data, onDelete, onView, basePerm }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/consumption-formula-edit/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Formulation Code</th>

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Formulation Name</th>

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Standard Batch Size</th>

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Unit</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Blended Density</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.consumption_formula_code}</td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  {item.standard_batch_size !== undefined && item.standard_batch_size !== null && item.standard_batch_size !== '' && !isNaN(Number(item.standard_batch_size))
                    ? Number(item.standard_batch_size).toFixed(4)
                    : item.standard_batch_size}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.unit}</td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.blended_density}</td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  {item.total_cost !== undefined && item.total_cost !== null && item.total_cost !== '' && !isNaN(Number(item.total_cost))
                    ? Number(item.total_cost).toFixed(2)
                    : item.total_cost}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </span>

                </td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <div className="space-x-2">

                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={(e) => { e.stopPropagation(); onView(item.id); }}
                    >
                      View
                    </button>
                    {!item.approved && hasPermission(user, `update_${basePerm}`) && (
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
                    )}
                    {(!item.approved ? hasPermission(user, `delete_${basePerm}`) : canUserDeleteApproved(user, `delete_${basePerm}`)) && (
                      <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(item.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConsumptionFormulaTable;
