import React from 'react';
import { useNavigate } from 'react-router-dom';

const RawMaterialTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/raw-material-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Cost Per Liter</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buy Price</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Add. Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">ML To KG</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Density</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
           
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.cost_per_liter}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.buy_price_pmt}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.add_cost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.ml_to_kl}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.density}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>
          
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

export default RawMaterialTable;
