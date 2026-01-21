import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConsumptionFormulaTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/consumption-formula-form/${id}`);  
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Ref</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Grade</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">SAE</th>
            
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.ref}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.grade}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.sae}</td>
             
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td> */}
            
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approved} onChange={() => {}} />
              </td>
             
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                 
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={(e) => { e.stopPropagation(); onView(item.id); }}
                  >
                    View
                  </button>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsumptionFormulaTable;
