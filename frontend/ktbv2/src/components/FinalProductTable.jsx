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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Size</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Bottles Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Liters Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Qty</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Litres</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Per Litre Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Cost Per Case</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">DK Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Price Per Bottle</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Price Per Label</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Price Per Bottle Cap</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Bottle Per Case</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Label Per Case</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Bottle Cap Per Case</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Price Per Carton</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">DK Ex Price</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">KS Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Factory Price</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Freight & Logistic</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total CIF Price</th>
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
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>
              
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.packing_size}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bottles_per_pack}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.liters_per_pack}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_qty} {item.total_qty_unit}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.qty_in_liters}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.per_liter_cost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.cost_per_case}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.dk_cost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.price_per_bottle}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.price_per_label}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.price_per_bottle_cap}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bottle_per_case}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.label_per_case}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bottle_cap_per_case}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.price_per_carton}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.dk_exprice}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.ks_cost}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_factory_price}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.freight_logistic}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_cif_price}</td>
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
