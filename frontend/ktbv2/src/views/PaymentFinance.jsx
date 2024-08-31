import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import PFTable from "../components/PFTable"
import FilterComponent from "../components/FilterComponent";
import Modal from '../components/Modal';

function PaymentFinance() {
  const navigate = useNavigate();
  const [pfData, setPFData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPF, setPF] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/trademgt/payment-finances'); // Replace with your API endpoint
        setPFData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this Payment/Finance?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/payment-finances/${id}/`);
        setPrePaymentData(prePaymentData.filter(data => data.id !== id));
        alert('Payment/Finance deleted successfully.');
      } catch (error) {
        console.error('Error deleting Payment/Finance:', error);
        alert('Failed to delete Payment/Finance.');
      }
    }
  };

  const handleAddPreSPClick = () => {
    navigate('/payment-finance-form');
  };


  const handleFilter = (filters) => {
    setPFData(filters)
  };


  const handleViewClick = async (tradeId) => {
    try {
      const response = await axios.get(`/trademgt/payment-finances/${tradeId}/`);
      setPF(response.data);
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
    { value: 'batch_number', label: 'Batch Number' },
    { value: 'payment_mode', label: 'Payment Mode' },
    { value: 'status_of_payment', label: 'Status Of Payment' },
    { value: 'shipment_status', label: 'Shipment Status' },
    { value: 'production_date', label: 'Production Date' },
    { value: 'remarks', label: 'Remarks' },
  ];


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;




  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Payment and Finance Details</p>
        <button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/payment-finances/'} 
        fieldOptions={fieldOptions}
        />
        </div>
        <div className=" rounded p-2">
        <PFTable data={pfData} onDelete={handleDelete} onView={handleViewClick}/>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedPF && (
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
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buyer/Seller Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Amount </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Quantity </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Batch Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.batch_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Production Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.production_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Recived/Paid</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.production_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Recived/Paid Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.production_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Balance Payment </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.balance_payment}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Balance Payment Due Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.balance_payment}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Balance Payment Received </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.balance_payment_received}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Balance Payment Made </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.balance_paymnet_made}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Balance Payment Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.balance_paymnet_made}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Net Due In This Trade </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.net_due_in_this_trade}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Payment Mode </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.payment_mode}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Status of Payments/Maturity/Documents</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.status_of_payment}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.logistic_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Provider</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.logistic_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost Due Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.logistic_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Agent</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.logistic_cost}</td>
                  </tr>
                
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Agent Value </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.commission_agent_value}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Fees</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.bl_fee}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Collection Cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.bl_collection_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Other Charges</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Charges P&F</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Status of Shipment</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks From Sales/Purchase</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurrance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.shipment_status}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Documents To Release </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.release_docs}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Documents To Release Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.release_docs_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPF.remarks}</td>
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

export default PaymentFinance