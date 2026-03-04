import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinalProductTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/final-product-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Formula Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Consumption Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Size</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Bottles Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Liters Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Qty</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Litres</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Per Litre Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Oil Consumed</th>
          
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total CFR Pricing</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.formula_detail?.formula_name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.formula_detail?.consumption?.formula.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.batch_detail?.batch}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.packing_size_detail?.label}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bottles_per_pack}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.litres_per_pack}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_qty}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.qty_in_litres}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.per_litre_cost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_oil_consumed}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.dk_cost}</td> */}
            
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_cfr_pricing}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>
          
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approved} onChange={() => {}} />
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

export default FinalProductTable;
