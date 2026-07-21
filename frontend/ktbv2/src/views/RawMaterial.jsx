import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';
import ReactToPrint from 'react-to-print';

import Modal from '../components/Modal';
import MultiUserSelector from "../components/MultiUserSelector";
import RawMaterialTable from '../components/RawMaterialTable';

const RawMaterial = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const componentRef = useRef();
    const [materialData, setMaterialData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [notifiedUsers, setNotifiedUsers] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/costmgt/raw-materials/'); 
          setMaterialData(response.data);
        } catch (error) {
          setError('Failed to fetch raw material data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddMaterialClick = () => {
      navigate('/raw-material-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this raw material?');
      if (confirmed) {
        try {
          await axios.delete(`/costmgt/raw-materials/${id}/`);
          setMaterialData(materialData.filter(data => data.id !== id));
          alert('Raw Material deleted successfully.');
        } catch (error) {
          console.error('Error deleting Raw Material:', error);
          alert('Failed to delete Raw Material.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/costmgt/raw-materials/${id}/`);
        setSelectedMaterial(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching raw material details:', error);
      }
    };

    const approveRawMaterial = async () => {
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
        await axios.get(`/costmgt/raw-materials-approve/${selectedMaterial.id}/?${params.toString()}`);
        setNotifiedUsers([]);
        setNotificationMessage('');
        setIsModalOpen(false);
        setSelectedMaterial(null);
        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error approving packing:', error);
        // Optionally, handle the error (e.g., show a user-friendly error message)
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedMaterial(null);
      setNotifiedUsers([]);
      setNotificationMessage('');
    };
  

    const handleFilter = (filters) => {
        setMaterialData(filters)
        setCurrentPage(1);
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
    
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = materialData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Raw Material Pricing</p>
        {hasPermission(user, 'create_raw_material_pricing') && (
<button
          onClick={handleAddMaterialClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
        <CostMgtFilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/raw-materials/'} fieldOptions={fieldOptions} downloadUrl="/excel/export/raw-material/" fileName="Raw_Material_export" />
        </div>
        <div className=" rounded p-2">
        <RawMaterialTable data={currentItems} onDelete={handleDelete} onView={handleViewClick} basePerm="raw_material_pricing" />
        <Pagination itemsPerPage={50} totalItems={materialData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedMaterial && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <ReactToPrint
               trigger={() => <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded float-left">Print</button>}
               content={() => componentRef.current}
             />
             <div className="clear-both mt-4" ref={componentRef}>
               <h2 className="text-2xl mb-2 text-center">Raw Material Details</h2>
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
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.date}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Name</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.category_name}</td>
                    </tr>
                     <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Sub Name</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.subname_name}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Cost Per Liter</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.cost_per_liter}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buy Price PMT</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.buy_price_pmt}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Add Cost</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.add_cost}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.total}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">MT to KG</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.ml_to_kl}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Density</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.density}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.remarks}</td>
                    </tr>
                   
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                      <td className="py-2 px-4 text-gray-800">{selectedMaterial.approved? "Yes":"No"}</td>
                    </tr>
                   
                  </tbody>
                  </table>
                </div>
             </div>
             {!selectedMaterial.approved && (
              <div className="mt-6 border-t pt-4">
                <MultiUserSelector 
                  selectedUsers={notifiedUsers} 
                  onChange={setNotifiedUsers} 
                  message={notificationMessage}
                  onMessageChange={setNotificationMessage}
                />
              </div>
            )}


              {selectedMaterial.approved ? '' :
                  <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                    {hasPermission(user, 'approve_raw_material_pricing') && (
                      <button onClick={approveRawMaterial} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
                    )}
                  </div>
              }
              {/* Notified Users Section */}
              <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
                <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
                {selectedMaterial?.notified_users_emails?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedMaterial.notified_users_emails.map((email, idx) => (
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

export default RawMaterial;
