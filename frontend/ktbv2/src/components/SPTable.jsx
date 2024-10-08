// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SPTable = ({ data,onDelete,onView }) => {
  const navigate = useNavigate(); 

  const handleEdit = (id) => {
    navigate(`/sales-purchase-form/${id}`);  // Navigate to TradeForm with tradeId
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packaging Supplier</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Logistic Provider</th>
          
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
      
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trn.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.invoice_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.invoice_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bl_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bl_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.packaging_supplier}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.logistic_supplier}</td>
            
              
             
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

export default SPTable;
