// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateRemainingContractValue } from '../dateUtils';

const PFTable = ({ data, onDelete, onView }) => {
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S&P ID</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Mode</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status Of Payment</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Shipment Status</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Payment</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Payment Made</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Net Due</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.sp.trn.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.sp.id}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.sp.trn.trade_type}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.payment_mode}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.status_of_payment}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.shipment_status}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{calculateRemainingContractValue(item.sp)}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_payment_made}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.net_due_in_this_trade}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.reviewed} onChange={() => {}} />
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

export default PFTable;
