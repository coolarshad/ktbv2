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
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sales TRN & ID</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Purchase TRN & ID</th>
      
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
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
