import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';

const KycTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  const { user } = useAuth();
  
  const handleEdit = (id) => {
    navigate(`/kyc-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => b.id - a.id);
  }, [data]);



  return (
    <div className="overflow-auto max-h-[calc(100vh-270px)] min-h-[350px] bg-white rounded-lg border border-gray-200 shadow-sm relative">
      <table className="min-w-full bg-white border-collapse">
        <thead className="sticky top-0 z-30 bg-gray-100 shadow-sm">
          <tr>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 left-0 z-40 bg-gray-200 min-w-[60px] max-w-[60px] w-[60px] whitespace-nowrap border-r border-gray-300">S.N</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Date</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Name</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Company Reg No</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Reg. Address</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Mailing Address</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Telephone</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Fax</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Person 1</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Designation 1</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Mobile 1</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Email 1</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Person 2</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Designation 2</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Mobile 2</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Email 2</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Approve 1</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Approve 2</th>
            <th className="py-2.5 px-4 border-b border-gray-300 text-sm font-semibold sticky top-0 z-30 bg-gray-100 whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium sticky left-0 z-10 bg-white min-w-[60px] max-w-[60px] w-[60px] whitespace-nowrap border-r border-gray-300">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.date}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.companyRegNo}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.regAddress}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.mailingAddress}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.telephone}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.fax}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.person1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.designation1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.mobile1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.email1}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.person2}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.designation2}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.mobile2}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.email2}</td>
                {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.banker}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.address}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.swiftCode}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{item.accountNumber}</td> */}
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium text-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 cursor-default" checked={Boolean(item.approve1)} readOnly />
                </td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium text-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 cursor-default" checked={Boolean(item.approve2)} readOnly />
                </td>
               
               
                <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                  <div className="space-x-2 flex items-center">
                   
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                      onClick={(e) => { e.stopPropagation(); onView(item.id); }}
                    >
                      View
                    </button>
                    {hasPermission(user, 'update_kyc') && (
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded" onClick={() => handleEdit(item.id)}>Edit</button>
                    )}
                    {hasPermission(user, 'delete_kyc') && (
                      <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" onClick={() => onDelete(item.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="19" className="py-4 text-center text-gray-500 font-medium">
                Match Not Found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default KycTable;
