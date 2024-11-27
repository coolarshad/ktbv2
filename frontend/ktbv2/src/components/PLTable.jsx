// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PLTable = ({ data,onDelete,onView }) => {
  const navigate = useNavigate();
  const handleEdit = (id) => {
    navigate(`/pl-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sales TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Purchase TRN</th>
      
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.salesPF.sp.trn.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.purchasePF.sp.trn.trn}</td>
            
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>
              
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                 
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => onView(item.id)}>View</button>
                  <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
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

export default PLTable;
