import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';
import Modal from '../components/Modal';
import MultiUserSelector from "../components/MultiUserSelector";
import ConsumptionTable from '../components/ConsumptionTable';
import ReactToPrint from 'react-to-print';

const Consumption = () => {
    const { user } = useAuth();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [consumptionData, setConsumptionData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsumption, setSelectedConsumption] = useState(null);
  const [notifiedUsers, setNotifiedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/costmgt/consumption/');
        setConsumptionData(response.data);
      } catch (error) {
        setError('Failed to fetch consumptions data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddConsumptionClick = () => {
    navigate('/consumption-form');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this consumption?');
    if (confirmed) {
      try {
        await axios.delete(`/costmgt/consumption/${id}/`);
        setConsumptionData(consumptionData.filter(data => data.id !== id));
        alert('Consumption deleted successfully.');
      } catch (error) {
        console.error('Error deleting consumption:', error);
        alert('Failed to delete consumption.');
      }
    }
  };

  const handleViewClick = async (id) => {
    try {
      const response = await axios.get(`/costmgt/consumption/${id}/`);
      setSelectedConsumption(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching consumption details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConsumption(null);
    setNotifiedUsers([]);
    setNotificationMessage('');
  };

  const approveConsumption = async () => {
        if (!notifiedUsers || notifiedUsers.length === 0) {
            alert("Please select at least one user to notify before approving.");
            return;
        }
        try {
            const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append("notifiedUsers[]", id));
      if (notificationMessage) {
        params.append("notification_message", notificationMessage);
      }
      await axios.get(`/costmgt/consumption-approve/${selectedConsumption.id}/?${params.toString()}`);
      setNotifiedUsers([]);
      setNotificationMessage('');
            setIsModalOpen(false);
            setConsumptionData(null);
            // Reload the page
            window.location.reload();
        } catch (error) {
            console.error('Error approving consumption and blending:', error);
            // Optionally, handle the error (e.g., show a user-friendly error message)
        }
    }

  const handleFilter = (filters) => {
    setConsumptionData(filters)
        setCurrentPage(1);
  };

  const fieldOptions = [
    { value: 'alias', label: 'Name' },  // Trade TRN field in PreSalePurchase filter

  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = consumptionData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl"> Blending & Consumptions</p>
        {hasPermission(user, 'create_consumption') && (
<button
          onClick={handleAddConsumptionClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
          <CostMgtFilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/consumption'} fieldOptions={fieldOptions} downloadUrl="/excel/export/consumption/" />
        </div>
        <div className=" rounded p-2">
          <ConsumptionTable data={currentItems} onDelete={handleDelete} onView={handleViewClick} basePerm="consumption" />
        <Pagination itemsPerPage={50} totalItems={consumptionData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedConsumption && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
              <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <ReactToPrint
                trigger={() => <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded float-left">Print</button>}
                content={() => componentRef.current}
              />
              <div className="clear-both mt-4" ref={componentRef}>
              <h2 className="text-2xl mb-2 text-center">Consumption & Blending Details</h2>
              <hr className='mb-2' />
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-4 text-left text-gray-700 font-semibold">Field</th>
                      <th className="py-2 px-4 text-left text-gray-700 font-semibold">Value</th>
                    </tr>
                  </thead>

                  <tbody>

                     <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Formula Ref</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption?.formula?.ref}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Name</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption?.formula?.name}</td>
                    </tr>
                     <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Batch Number </td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.batch}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.date}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Grade</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.grade}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">SAE</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.sae}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Net Blending Qty</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.net_blending_qty}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Gross Vol. Crosscheck</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.gross_vol_crosscheck}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Cross Check %</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.cross_check}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total Value</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.total_value}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Per Litre Cost</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.per_litre_cost}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.remarks}</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                      <td className="py-2 px-4 text-gray-800">{selectedConsumption.approved ? "Yes" : "No"}</td>
                    </tr>

                  </tbody>
                </table>

                <h3 className="text-lg mt-4 text-center">Additives</h3>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sub Name</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Percent</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Litre</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedConsumption.consumptionAdditive.map((item, index) =>
                      item.name && ( // Check if both fields exist
                        <tr key={index}>
                          
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.additive?.name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.additive_subname?.subname_name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.rate}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_percent}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_litre}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.value}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {/* COAs Table */}
                <h3 className="text-lg mt-4 text-center">Base Oils</h3>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Sub Name</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Percent</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Litre</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedConsumption.consumptionBaseOil.map((item, index) =>
                      item.name && ( // Check if both fields exist
                        <tr key={index}>
    
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.raw?.name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.raw_subname?.subname_name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.rate}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_percent}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_litre}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.value}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
             </div>
             {!selectedConsumption.approved && (
                <div className="mt-6 border-t pt-4">
                  <MultiUserSelector 
                    selectedUsers={notifiedUsers} 
                    onChange={setNotifiedUsers} 
                    message={notificationMessage}
                    onMessageChange={setNotificationMessage}
                  />
                </div>
              )}


                {selectedConsumption.approved ? '' :
                  <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                    {hasPermission(user, 'approve_consumption') && (
<button onClick={approveConsumption} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
)}
                  </div>
                }
              {/* Notified Users Section */}
              <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
                <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
                {selectedConsumption?.notified_users_emails?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedConsumption.notified_users_emails.map((email, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{email}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No users have been notified for this record.</p>
                )}
              </div>
            
            </div>
          </div>
        )}
      
      </Modal>
    </>
  );
};

export default Consumption;
