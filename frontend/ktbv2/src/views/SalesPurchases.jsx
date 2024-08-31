import NavBar from "../components/NavBar"
import SPTable from "../components/SPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import FilterComponent from "../components/FilterComponent";
import Modal from '../components/Modal';

function SalesPurchases() {

  const navigate = useNavigate();
  const [spData, setSPData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSP, setSP] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/trademgt/sales-purchases'); // Replace with your API endpoint
        setSPData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this Sale/Purchase?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/sales-purchases/${id}/`);
        setSPData(prePaymentData.filter(data => data.id !== id));
        alert('Sales/Purchase deleted successfully.');
      } catch (error) {
        console.error('Error deleting Sales/Purchase:', error);
        alert('Failed to delete Sales/Purchase.');
      }
    }
  };

  const handleAddSPClick = () => {
    navigate('/sales-purchase-form');
  };

  const handleFilter = (filters) => {
    setSPData(filters)
  };

  const handleViewClick = async (tradeId) => {
    try {
      const response = await axios.get(`/trademgt/sales-purchases/${tradeId}/`);
      setSP(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrePayment(null);
  };


  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'invoice_number', label: 'Invoice Number' },
    { value: 'bl_number', label: 'BL Number' },
    { value: 'bl_date', label: 'BL Date' },
    { value: 'invoice_date', label: 'Invoice Date' },
    { value: 'packaging_supplier', label: 'Packaging Supplier' },
    { value: 'logistic_supplier', label: 'Logistic Supplier' },
    { value: 'batch_number', label: 'Batch Number' },
    { value: 'production_date', label: 'Production Date' },
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  

  


  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales and Purchase Details</p>
        <button
          onClick={handleAddSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/sales-purchases'} 
        fieldOptions={fieldOptions}
        />
        </div>
        <div className=" rounded p-2">
        <SPTable data={spData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedSP && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Trade Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">TRN </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Product Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">HS Code </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Markings </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buyer/Seller </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Amount </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_amount}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Details </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_amount}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Agent </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_amount}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Value</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.commission_value}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Quantity </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_qty}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Fees</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_fees}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Collection Cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_collection_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Tolerence</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_collection_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.bl_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total Packing Cost </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.total_packing_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Packaging Supplier</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.packaging_supplier}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Provider</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.logistic_supplier}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Batch Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.batch_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Production Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.production_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.logistic_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost Due Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.logistic_cost_due_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Liner </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.liner}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">POD</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.pod}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">POL </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.pol}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETD</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.etd}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETA</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.eta}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETA</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.eta}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.eta}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurrance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.eta}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Status of Shipment</td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks </td>
                    <td className="py-2 px-4 text-gray-800">{selectedSP.remarks}</td>
                  </tr>
                </tbody>
                </table>
             </div>
             
     
           
     
            
            
           </div>
         </div>
        )}
      </Modal>
    </>

  )
}

export default SalesPurchases