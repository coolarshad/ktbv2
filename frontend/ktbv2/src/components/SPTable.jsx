// src/components/TradeTable.js
import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { dateFormatter } from '../dateUtils';

const SPTable = ({ data,onDelete,onView }) => {
  const navigate = useNavigate(); 

  const handleEdit = (id) => {
    navigate(`/sales-purchase-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  const sortedData = useMemo(() => {
         return [...(data || [])].sort((a, b) => b.id - a.id);
       }, [data]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">ID</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Amount</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Date</th>
          
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.id}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trn.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.trn.trade_type}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.invoice_date)}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.invoice_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.invoice_amount}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.bl_number}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.bl_date)}</td> 
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

export default SPTable;
