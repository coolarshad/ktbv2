import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, canUserDeleteApproved, canUserUpdateApproved } from '../utils';

const FinalProductTable = ({ data, onDelete, onView, basePerm }) => { // Default value for data
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEdit = (id) => {
    navigate(`/final-product-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-30 bg-gray-100 min-w-[50px] max-w-[50px] w-[50px]">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[50px] z-30 bg-gray-100 min-w-[110px] max-w-[110px] w-[110px]">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-30 bg-gray-100 min-w-[550px] max-w-[550px] w-[550px]">Formula Name</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[710px] z-30 bg-gray-100 min-w-[250px] border-r border-gray-300">Consumption Name</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Size</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Bottles Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Liters Per Pack</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Qty</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Litres</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Per Litre Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Oil Consumed</th>

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total CFR Pricing</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Cost Per Pail/Crtn</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th> */}

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-10 bg-white min-w-[50px] max-w-[50px] w-[50px]">{item.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[50px] z-10 bg-white min-w-[110px] max-w-[110px] w-[110px]">{item.date}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-10 bg-white min-w-[550px] max-w-[550px] w-[550px]">{item?.formula_detail?.formula_name}</td>
                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[710px] z-10 bg-white min-w-[250px] border-r border-gray-300">{item?.formula_detail?.consumption?.formula?.name}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.batch_detail?.batch}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.packing_size_detail?.label}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bottles_per_pack}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.litres_per_pack}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.total_qty}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.qty_in_litres}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.per_litre_cost}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.final_product_code}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.final_product_name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.consumption_name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.formula_name}</td>

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.packing_type_name}</td>


                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  {item.total_cost_ltr !== undefined && item.total_cost_ltr !== null && item.total_cost_ltr !== '' && !isNaN(Number(item.total_cost_ltr))
                    ? Number(item.total_cost_ltr).toFixed(2)
                    : item.total_cost_ltr}
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </span>

                </td>


                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <div className="space-x-2">

                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={(e) => { e.stopPropagation(); onView(item.id); }}
                    >
                      View
                    </button>
                    {(!item.approved ? hasPermission(user, `update_${basePerm}`) : canUserUpdateApproved(user, `update_${basePerm}`)) && (
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
                    )}
                    {(!item.approved ? hasPermission(user, `delete_${basePerm}`) : canUserDeleteApproved(user, `delete_${basePerm}`)) && (
                      <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(item.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="16" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FinalProductTable;
