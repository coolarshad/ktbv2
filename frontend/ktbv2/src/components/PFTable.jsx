// src/components/TradeTable.js
import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateRemainingContractValue, dateFormatter } from '../dateUtils';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';

const PFTable = ({ data, onDelete, onView, basePerm }) => {
  const navigate = useNavigate(); 
  const { user } = useAuth();

  const handleEdit = (id) => {
    navigate(`/payment-finance-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  const sortedData = useMemo(() => {
           return [...(data || [])].sort((a, b) => b.id - a.id);
         }, [data]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-30 bg-gray-100 min-w-[60px] max-w-[60px] w-[60px] whitespace-nowrap">ID</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[60px] z-30 bg-gray-100 min-w-[160px] max-w-[160px] w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[220px] z-30 bg-gray-100 min-w-[100px] max-w-[100px] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">S&P ID</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[320px] z-30 bg-gray-100 min-w-[160px] max-w-[160px] w-[160px] border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Mode</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status Of Payment</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Shipment Status</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Payment</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Balance Payment Made</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Net Due</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-10 bg-white min-w-[60px] max-w-[60px] w-[60px] whitespace-nowrap">{item.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[60px] z-10 bg-white min-w-[160px] max-w-[160px] w-[160px] whitespace-nowrap overflow-hidden text-ellipsis" title={item.sp?.trn?.trn}>{item.sp?.trn?.trn}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[220px] z-10 bg-white min-w-[100px] max-w-[100px] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">{item.sp?.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[320px] z-10 bg-white min-w-[160px] max-w-[160px] w-[160px] border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis" title={item.sp?.trn?.trade_type}>{item.sp?.trn?.trade_type}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.sp.trn.paymentTerm.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.status_of_payment}</td>
                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.shipment_status}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{calculateRemainingContractValue(item.sp)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.balance_payment_made}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.net_due_in_this_trade}</td>
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
                    {hasPermission(user, `update_${basePerm}`) && (
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
              <td colSpan="11" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PFTable;
