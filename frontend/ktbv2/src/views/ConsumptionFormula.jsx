import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import Modal from '../components/Modal';
import ConsumptionTable from '../components/ConsumptionTable';
import ConsumptionFormulaTable from '../components/ConsumptionFormulaTable';

const ConsumptionFormula = () => {
    const navigate = useNavigate();
    const [consumptionData, setConsumptionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsumption, setSelectedConsumption] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/costmgt/consumption-formula/'); 
          setConsumptionData(response.data);
        } catch (error) {
          setError('Failed to fetch consumption formula data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddConsumptionClick = () => {
      navigate('/consumption-formula-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this consumption?');
      if (confirmed) {
        try {
          await axios.delete(`/costmgt/consumption-formula/${id}/`);
          setConsumptionData(consumptionData.filter(data => data.id !== id));
          alert('Consumption formula deleted successfully.');
        } catch (error) {
          console.error('Error deleting consumption formula:', error);
          alert('Failed to delete consumption formula.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/costmgt/consumption-formula/${id}/`);
        setSelectedConsumption(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching consumption formula details:', error);
      }
    };

    const approveConsumptionFormula = async () => {
      try {
        await axios.get(`/costmgt/consumption-formula-approve/${selectedConsumption.id}/`);
        setIsModalOpen(false);
        setConsumptionData(null);
        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error approving Consumption Formula:', error);
        // Optionally, handle the error (e.g., show a user-friendly error message)
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedConsumption(null);
    };
  

    const handleFilter = (filters) => {
        setConsumptionData(filters)
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
   
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl"> Blending Formulae</p>
        <button
          onClick={handleAddConsumptionClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/consumption-formula'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <ConsumptionFormulaTable data={consumptionData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedConsumption && (
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
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">grade</td>
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.grade}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">sae</td>
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.sae}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.remarks}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                    <td className="py-2 px-4 text-gray-800">{selectedConsumption.approve? "Yes":"No"}</td>
                  </tr>
                 
                </tbody>
                </table>
              
                <h3 className="text-lg mt-4 text-center">Additives</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Percent</th>
                  
                  </tr>
                </thead>
                <tbody>
                  {selectedConsumption.consumptionFormulaAdditive.map((item, index) =>
                    item.name && ( // Check if both fields exist
                      <tr key={index}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.additive?.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_percent}</td>
                     
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
                        <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty in Percent</th>
                       
                      </tr>
                </thead>
                <tbody>
                  {selectedConsumption.consumptionFormulaBaseOil.map((item, index) =>
                    item.name && ( // Check if both fields exist
                      <tr key={index}>
                         <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.raw?.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty_in_percent}</td>
                     
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              {selectedConsumption.approved ? '' :
                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                      <button onClick={approveConsumptionFormula} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
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

export default ConsumptionFormula;
