import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import Modal from '../components/Modal';
import RawMaterialTable from '../components/RawMaterialTable';

const RawMaterial = () => {
    const navigate = useNavigate();
    const [materialData, setMaterialData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

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
      try {
        await axios.get(`/costmgt/raw-materials-approve/${selectedMaterial.id}/`);
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
    };
  

    const handleFilter = (filters) => {
        setMaterialData(filters)
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
    
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Raw Materials</p>
        <button
          onClick={handleAddMaterialClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/raw-materials'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <RawMaterialTable data={materialData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedMaterial && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Product Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">cost_per_liter</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.cost_per_liter}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">buy_price_pmt</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.buy_price_pmt}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">add_cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.add_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">total</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.total}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ml_to_kl</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.ml_to_kl}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">density</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.density}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.remarks}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                    <td className="py-2 px-4 text-gray-800">{selectedMaterial.approve? "Yes":"No"}</td>
                  </tr>
                 
                </tbody>
                </table>
                {selectedMaterial.approved ? '' :
                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                      <button onClick={approveRawMaterial} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
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

export default RawMaterial;
