// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PFTable = ({ data, onDelete }) => {
  const navigate = useNavigate(); 

  const handleEdit = (id) => {
    navigate(`/payment-finance-form/${id}`);  // Navigate to TradeForm with tradeId
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Payment</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Due Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Received Sent</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">balance Due</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller Name</th>
          

            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.tradeType}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.company}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_payment}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.production_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_paymnet_made}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.paymentDate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.net_due_in_this_trade}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.buyerSellerName}</td>
              
             
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

export default PFTable;
