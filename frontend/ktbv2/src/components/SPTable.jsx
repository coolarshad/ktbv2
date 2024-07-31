// src/components/TradeTable.js
import React from 'react';

const SPTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>

            
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
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.invoiceDate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.invoiceNumber}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.buyerSellerName}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={trade.reviewed} onChange={() => {}} />
              </td>
             
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

export default SPTable;
