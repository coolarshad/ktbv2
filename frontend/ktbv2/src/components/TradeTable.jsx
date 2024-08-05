// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TradeTable = ({ data, onDelete }) => {
  const navigate = useNavigate();  

  const handleEdit = (tradeId) => {
    navigate(`/trade-form/${tradeId}`);  // Navigate to TradeForm with tradeId
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Ref Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Value</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((trade, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trade_type}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.company}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.customer_company_name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trd}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.contract_value}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.productCode}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={trade.reviewed} onChange={() => {}} />
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                  <button className="bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(trade.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(trade.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeTable;
