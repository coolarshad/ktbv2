import React from 'react';
import { useNavigate } from 'react-router-dom';

const SalesTraceTable = ({ data , onDelete, onView }) => { // Default value for data

  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Balance Qty</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reference Balance Qty</th> */}
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Starting TRN</th> */}
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.product_code}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_contract_qty}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trade_qty}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.contract_balance_qty}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.ref_balance_qty}</td> */}
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.first_trn}</td> */}
             
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

export default SalesTraceTable;
