import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductFormulaTable = ({ data, onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/product-formula-form/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-30 bg-gray-100 min-w-[50px] max-w-[50px] w-[50px]">S.N</th>

            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[50px] z-30 bg-gray-100 min-w-[200px] max-w-[200px] w-[200px]">Formula Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[250px] z-30 bg-gray-100 min-w-[220px] max-w-[220px] w-[220px] border-r border-gray-300">Consumption Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>

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

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[50px] z-10 bg-white min-w-[200px] max-w-[200px] w-[200px]">{item.formula_name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[250px] z-10 bg-white min-w-[220px] max-w-[220px] w-[220px] border-r border-gray-300">{item?.consumption?.formula?.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.packing?.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>

                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td> */}

                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approved} onChange={() => { }} />
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
            ))
          ) : (
            <tr>
              <td colSpan="7" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductFormulaTable;
