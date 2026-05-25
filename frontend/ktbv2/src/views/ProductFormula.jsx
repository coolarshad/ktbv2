import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';
import Modal from '../components/Modal';
import MultiUserSelector from "../components/MultiUserSelector";
import ProductFormulaTable from '../components/ProductFormulaTable';
 
const ProductFormula = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formulaData, setFormulaData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFormula, setSelectedFormula] = useState(null);
    const [notifiedUsers, setNotifiedUsers] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/costmgt/product-formula/'); 
          setFormulaData(response.data);
        } catch (error) {
          setError('Failed to fetch product formula data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddFormulaClick = () => {
      navigate('/product-formula-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this product formula?');
      if (confirmed) {
        try {
          await axios.delete(`/costmgt/product-formula/${id}/`);
          setFormulaData(formulaData.filter(data => data.id !== id));
          alert('Product formula deleted successfully.');
        } catch (error) {
          console.error('Error deleting product formula:', error);
          alert('Failed to delete product formula.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/costmgt/product-formula/${id}/`);
        setSelectedFormula(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching product formula details:', error);
      }
    };

    const approveProductFormula = async () => {
      if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before approving.");
      return;
    }
    try {
        const params = new URLSearchParams();
        notifiedUsers.forEach(id => params.append("notifiedUsers[]", id));
        await axios.get(`/costmgt/product-formula-approve/${selectedFormula.id}/?${params.toString()}`);
        setIsModalOpen(false);
        setSelectedFormula(null);
        // Reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error approving Product Formula:', error);
        // Optionally, handle the error (e.g., show a user-friendly error message)
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedFormula(null);
      setNotifiedUsers([]);
    };
  

    const handleFilter = (filters) => {
        setFormulaData(filters)
        setCurrentPage(1);
    };
    
    const fieldOptions = [
      { value: 'formula_name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
   
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = formulaData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Packing Formulation</p>
        {hasPermission(user, 'create_packing_formulation') && (
<button
          onClick={handleAddFormulaClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
        <CostMgtFilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/product-formula'} fieldOptions={fieldOptions} downloadUrl="/excel/export/product-formula/" />
        </div>
        <div className=" rounded p-2">
        <ProductFormulaTable data={currentItems} onDelete={handleDelete} onView={handleViewClick} />
        <Pagination itemsPerPage={50} totalItems={formulaData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedFormula && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Product Formula Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Formula Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula.formula_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Consumption Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula?.consumption?.formula?.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Consumption Qty </td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula?.consumption_qty}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Packing Type</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula?.packing?.name}</td>
                  </tr>
                  {/* <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Bottles Per Pack</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula?.bottle_per_pack}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Litres Per Pack</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula?.litre_per_pack}</td>
                  </tr> */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula.remarks}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approved</td>
                    <td className="py-2 px-4 text-gray-800">{selectedFormula.approved?'Yes':'No'}</td>
                  </tr>
                </tbody>
                </table>
              
                <h3 className="text-lg mt-4 text-center">Items</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Type</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty</th>
                  
                  </tr>
                </thead>
                <tbody>
                  {selectedFormula.items.map((item, index) =>
                    item.packing_label && ( // Check if both fields exist
                      <tr key={index}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.packings_type?.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.packings?.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.qty}</td>
                     
                      </tr>
                    ) 
                  )}
                </tbody>
              </table>              {!selectedFormula.approved && (
                <div className="mt-6 border-t pt-4">
                  <MultiUserSelector 
                    selectedUsers={notifiedUsers} 
                    onChange={setNotifiedUsers} 
                  />
                </div>
              )}



            
              {selectedFormula.approved ? '' :
                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                      {hasPermission(user, 'approve_packing_formulation') && (
<button onClick={approveProductFormula} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
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

export default ProductFormula;
