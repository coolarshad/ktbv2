import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import InventoryTable from '../components/InventoryTable';

const Inventory = () => {


    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null); // State to store data for the modal
  const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/inventory/'); 
          setData(response.data);
        } catch (error) {
          setError('Failed to fetch inventory data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to clear this inventory record?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/inventory/${id}/`);
          setData(data.filter(item => item.id !== id));
          alert('Inventory record deleted successfully.');
        } catch (error) {
          console.error('Error deleting inventory record:', error);
          alert('Failed to delete inventory record.');
        }
      }
    };



    const handleFilter = (filters) => {
      setData(filters)
    };
    
    const fieldOptions = [
      { value: 'product_name', label: 'Prouct Name' },
      { value: 'batch_number', label: 'Batch Number' },
    ];

    const handleView = async (id) => {
      try {
        // Send a GET request with the `id` as a query parameter
        const response = await axios.get(`/trademgt/inventory-detail/`, {
          params: { id }, // Query parameter
        });
        console.log(response.data)
        // Set the retrieved data into modalData state
        setModalData(response.data);

    
        // Display the modal
        setModalVisible(true);
      } catch (error) {
        console.error('Error fetching inventory details:', error?.response?.data || error.message);
    
        // Optionally, you could show a user-friendly error message:
        alert('Failed to fetch inventory details. Please try again.');
      }
    };
  
    const closeModal = () => {
      setModalVisible(false); // Close modal
      setModalData(null); // Clear modal data
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Inventory</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/inventory'} fieldOptions={fieldOptions} downloadUrl="/excel/export/sp/"/>
        </div>
        <div className=" rounded p-2">
        <InventoryTable data={data} onDelete={handleDelete} onView={handleView}/>
        </div>
          {/* Modal */}
          {modalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg w-4/5">
                <div className="flex justify-end">
                  <button className="text-red-500 text-lg" onClick={closeModal}>
                    Close
                  </button>
                </div>
                <h2 className="text-xl font-bold">Inventory Details</h2>
                <table className="min-w-full mt-4 bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S&P ID</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Date</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Invoice Number</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch Number</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Production Date</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Quantity</th>
                      <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Unit</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    {modalData && modalData.length > 0 ? (
                      modalData.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp.trn.trn}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp.id}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp.trn.customer.name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp.invoice_date}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp.invoice_number}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.productName.name}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.batch_number}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.production_date}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.sp?.trn?.trade_type === 'Sales' ? -item.bl_qty : item.bl_qty}</td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.trade_qty_unit}</td>
                         
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-sm text-gray-500">
                          No inventory details available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
     
        </>
    );
};

export default Inventory;
