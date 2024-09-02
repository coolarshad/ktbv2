// src/components/TradeTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrePaymentTable = ({ data, onDelete, onView }) => {
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Opening Bank</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Advance Received</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date Of Receipt</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Advance Paid</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date Of Payment</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Expiry Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Shipment Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trn.trn}</td>
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

export default PrePaymentTable;
