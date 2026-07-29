// src/components/TradeTable.js
import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { dateFormatter } from '../dateUtils';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';

const PrePaymentTable = ({ data, onDelete, onView, basePerm }) => {
  const navigate = useNavigate();  
  const { user } = useAuth();
  
  const handleEdit = (id) => {
    navigate(`/pre-payment-form/${id}`);  // Navigate to TradeForm with tradeId
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[220px] z-30 bg-gray-100 min-w-[160px] max-w-[160px] w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[380px] z-30 bg-gray-100 min-w-[180px] max-w-[180px] w-[180px] border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">LC Number</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Opening Bank</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Advance Received</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date Of Receipt</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Advance Paid</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date Of Payment</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Expiry Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Shipment Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-10 bg-white min-w-[60px] max-w-[60px] w-[60px] whitespace-nowrap">{item.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[60px] z-10 bg-white min-w-[160px] max-w-[160px] w-[160px] whitespace-nowrap overflow-hidden text-ellipsis" title={item.trn?.trn}>{item.trn?.trn}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[220px] z-10 bg-white min-w-[160px] max-w-[160px] w-[160px] whitespace-nowrap overflow-hidden text-ellipsis" title={item.trn?.trade_type}>{item.trn?.trade_type}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-[380px] z-10 bg-white min-w-[180px] max-w-[180px] w-[180px] border-r border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis" title={item.lc_number}>{item.lc_number}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.lc_opening_bank}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.advance_received}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.date_of_receipt)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.advance_paid}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.date_of_payment)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.lc_expiry_date)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{dateFormatter(item.latest_shipment_date_in_lc)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.remarks}</td>
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
              <td colSpan="14" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrePaymentTable;
