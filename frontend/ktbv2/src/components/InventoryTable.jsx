import React from 'react';
import { useNavigate } from 'react-router-dom';

const InventoryTable = ({ data , onDelete, onView }) => { // Default value for data

  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Production Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Quantity</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Unit</th>
           
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => (
            <tr key={index}  className="hover:bg-gray-100 cursor-pointer" onClick={() => onView(item.id)}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.productName.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.batch_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.production_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.quantity}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.unit}</td>
           
             
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

export default InventoryTable;
