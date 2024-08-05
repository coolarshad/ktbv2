// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrePaymentTable = ({ data, onDelete }) => {
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/pre-payment-form/${id}`);  // Navigate to TradeForm with tradeId
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Due Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Due Amount</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Received/Paid Amount</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Received Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Paid Date</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.lc_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.lc_opening_bank}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.advance_received}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date_of_receipt}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.advance_paid}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date_of_payment}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.lc_expiry_date}</td>
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.latest_shipment_date_in_lc}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                 
                <button className="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
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

export default PrePaymentTable;
