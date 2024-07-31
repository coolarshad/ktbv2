// src/components/TradeTable.js
import React from 'react';

const PFTable = ({ data }) => {
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
          {data.map((trade, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.tradeType}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.company}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.balancePayment}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.paymentDueDate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.paymentReceivedSent}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.paymentDate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.balanceDue}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.buyerSellerName}</td>
              
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                 
                  <button className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
                  <button className="bg-green-500 text-white px-2 py-1 rounded">Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
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
