import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import Modal from '../components/Modal';
import PackingTable from '../components/PackingTable';

const Packing = () => {
    const navigate = useNavigate();
    const [packingData, setPackingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPacking, setSelectedPacking] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/costmgt/packings/'); 
          setPackingData(response.data);
        } catch (error) {
          setError('Failed to fetch packing data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddPackingClick = () => {
      navigate('/packing-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this packing?');
      if (confirmed) {
        try {
          await axios.delete(`/costmgt/packings/${id}/`);
          setPackingData(packingData.filter(data => data.id !== id));
          alert('Packing deleted successfully.');
        } catch (error) {
          console.error('Error deleting Packing:', error);
          alert('Failed to delete Packing.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/costmgt/packings/${id}/`);
        setSelectedPacking(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching packing details:', error);
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setPackingData(null);
    };
  

    const handleFilter = (filters) => {
        setPackingData(filters)
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
     
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Packings</p>
        <button
          onClick={handleAddPackingClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/packings'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <PackingTable data={packingData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedPacking && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Packing Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Per Each</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.per_each}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Category</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.category}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.remarks}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPacking.approve? "Yes":"No"}</td>
                  </tr>
                 
                </tbody>
                </table>
             </div>
            
           </div>
         </div>
        )}
      </Modal>
        </>
    );
};

export default Packing;
