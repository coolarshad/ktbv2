// src/components/TradeTable.js
import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';

const PLTable = ({ data, onDelete, onView, basePerm }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleEdit = (id) => {
    navigate(`/pl-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  const sortedData = useMemo(() => {
             return [...(data || [])].sort((a, b) => b.id - a.id);
           }, [data]);

  return (
    <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[350px] bg-white rounded-lg border border-gray-200 shadow-sm relative">
      <table className="min-w-full bg-white">
        <thead className="sticky top-0 z-30 bg-gray-100 shadow-sm">
          <tr>
            <th className="sticky top-0 z-30 bg-gray-100 py-2 px-4 border-b border-gray-300 text-sm font-medium whitespace-nowrap">ID</th>
            <th className="sticky top-0 z-30 bg-gray-100 py-2 px-4 border-b border-gray-300 text-sm font-medium whitespace-nowrap">Sales TRN & ID</th>
            <th className="sticky top-0 z-30 bg-gray-100 py-2 px-4 border-b border-gray-300 text-sm font-medium whitespace-nowrap">Purchase TRN & ID</th>
      
            <th className="sticky top-0 z-30 bg-gray-100 py-2 px-4 border-b border-gray-300 text-sm font-medium whitespace-nowrap">Remarks</th>
            
            <th className="sticky top-0 z-30 bg-gray-100 py-2 px-4 border-b border-gray-300 text-sm font-medium whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.salesPF?.sp?.trn?.trn} ({item?.salesPF?.sp?.id})</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.purchasePF?.sp?.trn?.trn} ({item?.purchasePF?.sp?.id})</td>
              
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item?.remarks}</td>
                
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <div className="space-x-2">
                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => onView(item.id)}>View</button>
                    {hasPermission(user, `update_${basePerm}`) && (
                      <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
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
              <td colSpan="5" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PLTable;
