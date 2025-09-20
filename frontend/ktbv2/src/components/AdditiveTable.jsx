import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdditiveTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/additive-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">CFR Price/KG in USD</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Add Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total cost EX DK in Kgs</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Density @ 15 Degree Celsius</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Cost Price in Liters</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.crfPrice}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.addCost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.totalCost.toFixed(4)}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.density}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.costPriceInLiter.toFixed(4)}</td>
          
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

export default AdditiveTable;
