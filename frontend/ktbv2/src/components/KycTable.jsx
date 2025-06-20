import React,{useMemo} from 'react';
import { useNavigate } from 'react-router-dom';

const KycTable = ({ data , onDelete, onView }) => { // Default value for data
  const navigate = useNavigate();  
  
  const handleEdit = (id) => {
    navigate(`/kyc-form/${id}`);  // Navigate to TradeForm with tradeId
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
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company Reg No</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reg. Address</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Mailing Address</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Telephone</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Fax</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Person 1</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Designation 1</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Mobile 1</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Email 1</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Person 2</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Designation 2</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Mobile 2</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Email 2</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Banker</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Address</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Swift Code</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Account Number</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve 1</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approve 2</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
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
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approve1} onChange={() => {}} />
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={item.approve2} onChange={() => {}} />
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

export default KycTable;
