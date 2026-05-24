import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

import Modal from '../components/Modal';
import MultiUserSelector from "../components/MultiUserSelector";
import AdditiveTable from '../components/AdditiveTable';

const Additive = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [additiveData, setAdditiveData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdditive, setSelectedAdditive] = useState(null);
    const [notifiedUsers, setNotifiedUsers] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/costmgt/additives/'); 
          setAdditiveData(response.data);
        } catch (error) {
          setError('Failed to fetch additive data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddAdditiveClick = () => {
      navigate('/additive-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this additive?');
      if (confirmed) {
        try {
          await axios.delete(`/costmgt/additives/${id}/`);
          setAdditiveData(additiveData.filter(data => data.id !== id));
          alert('Additive deleted successfully.');
        } catch (error) {
          console.error('Error deleting Additive:', error);
          alert('Failed to delete Additive.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/costmgt/additives/${id}/`);
        setSelectedAdditive(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching additive details:', error);
      }
    };

    
    const approveAdditive = async () => {
      if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before approving.");
      return;
    }
    try {
        const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append("notifiedUsers[]", id));
      await axios.get(`/costmgt/additives-approve/\$\{selectedAdditive\.id\}/?${params.toString()}`);
      setNotifiedUsers([]);
        setIsModalOpen(false);
        setSelectedAdditive(null);
        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error approving additive:', error);
        // Optionally, handle the error (e.g., show a user-friendly error message)
      }
    };


    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedAdditive(null);
      setNotifiedUsers([]);
    };
  

    const handleFilter = (filters) => {
        setAdditiveData(filters)
        setCurrentPage(1);
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
   
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = additiveData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Additive Pricing</p>
        {hasPermission(user, 'create_additive_pricing') && (
<button
          onClick={handleAddAdditiveClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
        <CostMgtFilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/additives'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <AdditiveTable data={currentItems} onDelete={handleDelete} onView={handleViewClick} basePerm="additive_pricing" />
        <Pagination itemsPerPage={50} totalItems={additiveData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedAdditive && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Additives Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.category_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Sub Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.subname_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">CFR Price/KG in USD</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.crfPrice}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Add Cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.addCost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total cost EX DK in Kgs</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.totalCost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Density @ 15 Degree Celsius</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.density}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Cost Price in Liters</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.costPriceInLiter}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.remarks}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                    <td className="py-2 px-4 text-gray-800">{selectedAdditive.approved? "Yes":"No"}</td>
                  </tr>
                 
                </tbody>
                </table>              {!selectedAdditive.approved && (
                <div className="mt-6 border-t pt-4">
                  <MultiUserSelector 
                    selectedUsers={notifiedUsers} 
                    onChange={setNotifiedUsers} 
                  />
                </div>
              )}


                {selectedAdditive.approved ? '' :
                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                      {hasPermission(user, 'approve_additive_pricing') && (
<button onClick={approveAdditive} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
)}
                    </div>
                  }
             </div>
            
           </div>
         </div>
        )}
      </Modal>
        </>
    );
};

export default Additive;
