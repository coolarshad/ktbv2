// src/components/TradeTable.js
import React from 'react';

const PLTable = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sales TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Purchase TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sales Invoice Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Seller Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Gross Profit</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Profit PMT/Drum</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((trade, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.tradeType}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.company}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.salesTrn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.purchaseTrn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.salesInvoiceDate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.sellerName}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.buyerName}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.grossProfit}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.profitPMT}</td>
              
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

export default PLTable;
