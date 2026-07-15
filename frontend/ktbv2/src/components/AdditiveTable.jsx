import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';

const AdditiveTable = ({ data, onDelete, onView, basePerm }) => { // Default value for data
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEdit = (id) => {
    navigate(`/additive-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-30 bg-gray-100 min-w-[50px] max-w-[50px] w-[50px]">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[50px] z-30 bg-gray-100 min-w-[110px] max-w-[110px] w-[110px]">Date</th>

            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-30 bg-gray-100 min-w-[350px] max-w-[350px] w-[350px]">Name</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-30 bg-gray-100 min-w-[350px] max-w-[350px] w-[350px]">Sub Name</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">CFR Price/KG in USD</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Add Cost</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total cost EX DK in Kgs</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Density @ 15 Degree Celsius</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[510px] z-30 bg-gray-100 min-w-[150px] max-w-[150px] w-[150px] border-r border-gray-300">Cost Price in Liters</th>
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
                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-10 bg-white min-w-[350px] max-w-[350px] w-[350px]">{item.category_name}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[160px] z-10 bg-white min-w-[350px] max-w-[350px] w-[350px]">{item.subname_name}</td>
                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.crfPrice}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.addCost}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.totalCost.toFixed(4)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.density}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[510px] z-10 bg-white min-w-[150px] max-w-[150px] w-[150px] border-r border-gray-300">{item.costPriceInLiter ? Number(item.costPriceInLiter).toFixed(4) : "—"}</td>

                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approved} disabled={item.approved} onChange={() => { }} />
                </td>


                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <div className="space-x-2">

                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={(e) => { e.stopPropagation(); onView(item.id); }}
                    >
                      View
                    </button>
                    {!item.approved && hasPermission(user, `update_${basePerm}`) && (
                      <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
                    )}
                    {hasPermission(user, `delete_${basePerm}`) && (
                      <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(item.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdditiveTable;
