import React from 'react';
import { useNavigate } from 'react-router-dom';

const SalesPendingTable = ({ data , onDelete, onView }) => { // Default value for data

  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
      <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRD</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Term</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Unit</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Qty</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Unit</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Selected Currency Rate</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate in USD</th>
          
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trade.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trd}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trade.companyName.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trade.paymentTerm.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.product_code}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.productName.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.hs_code}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.contract_qty}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.contract_qty_unit}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_qty}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_qty_unit}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.tolerance}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.selected_currency_rate}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.rate_in_usd}</td>
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                 
                 
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

export default SalesPendingTable;
