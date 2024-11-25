import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState, useRef } from 'react';
import PrePaymentTable from "../components/PrePaymentTable"
import FilterComponent from "../components/FilterComponent";
import Modal from '../components/Modal';
import { addDaysToDate } from "../dateUtils";
import { BASE_URL } from '../utils';
import ReactToPrint from 'react-to-print';

function PrePayment() {
  const navigate = useNavigate();
  const componentRef = useRef();

  const [prePaymentData, setPrePaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrePayment, setSelectedPrePayment] = useState(null);

  const BACKEND_URL = BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/trademgt/pre-payments'); // Replace with your API endpoint
        setPrePaymentData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewClick = async (id) => {
    try {
      const response = await axios.get(`/trademgt/pre-payments/${id}/`);
      setSelectedPrePayment(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrePayment(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this Pre Sale/Purchase?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/pre-payments/${id}/`);
        setPrePaymentData(prePaymentData.filter(data => data.id !== id));
        alert('Prepayment deleted successfully.');
      } catch (error) {
        console.error('Error deleting Prepayment:', error);
        alert('Failed to delete Prepayment.');
      }
    }
  };

  const handleAddPreSPClick = () => {
    navigate('/pre-payment-form');
  };

  const handleFilter = (filters) => {
    setPrePaymentData(filters)
  };

  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'lc_number', label: 'LC Number' },
    { value: 'lc_opening_bank', label: 'LC Opening Bank' },
    { value: 'advance_received', label: 'Advance Received' },
    { value: 'date_of_receipt', label: 'Date Of Receipt' },
    { value: 'advance_paid', label: 'Advance Paid' },
    { value: 'date_of_payment', label: 'Date Of Payment' },
    { value: 'lc_expiry_date', label: 'LC Expiry Date' },
    { value: 'latest_shipment_date_in_lc', label: 'Latest Shipment Date In LC' },
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre-Payments/ LC's Details</p>
        <button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/pre-payments'} 
        fieldOptions={fieldOptions}
        />
        </div>
        <div className=" rounded p-2">
        <PrePaymentTable data={prePaymentData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedPrePayment && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />
             <div className="p-4 max-w-7xl mx-auto" ref={componentRef}>

             <h2 className="text-2xl mb-2 text-center">Pre-Payments/ LC's Details</h2>
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
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">PO Date/PI Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.presp.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.trade_type}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Payment Term </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.paymentTerm.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buyer/Seller Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.kyc.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Value of Contract </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.contract_value}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance to Receive </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.trade_type=='Sales'?selectedPrePayment.trn.advance_value_to_receive:'NA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance to Pay </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.trade_type=='Purchase'?selectedPrePayment.trn.advance_value_to_receive:'NA'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Due Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.presp.trade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPrePayment.presp.doc_issuance_date,selectedPrePayment.presp.trade.paymentTerm.advance_within)}</td>
                  </tr>
                  {/* <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">As Per PI Cash/TT/Advance </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.as_per_pi_advance}</td>
                  </tr> */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Number </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.lc_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Opening Bank </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.lc_opening_bank}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Received </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.advance_received}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date of Receipt </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.date_of_receipt}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Paid </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.advance_paid}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date of Payment </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.date_of_payment}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Expiry Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.lc_expiry_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Latest Shipment Date in LC </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.latest_shipment_date_in_lc}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.trader_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurrance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.insurance_policy_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.remarks}</td>
                  </tr>
                  
                </tbody>
                </table>
                <p className='my-2 underline'>LC Copy</p>
                {selectedPrePayment.lcCopies && (
                  selectedPrePayment.lcCopies.map((item, index) => (
                    <div key={index}>
                      <p className='text-sm'>{index + 1}. <a href={`${BACKEND_URL}${item.lc_copy}`}>{item.name}</a></p>

                    </div>
                  )))}
                <p className='my-2 underline'>LC Ammendment</p>
                {selectedPrePayment.lcAmmendments && (
                  selectedPrePayment.lcAmmendments.map((item, index) => (
                    <div key={index}>
                      <p className='text-sm'>{index + 1}. <a href={`${BACKEND_URL}${item.lc_ammendment}`}>{item.name}</a></p>

                    </div>
                  )))}
                <p className='my-2 underline'>Advance TT Copy</p>
                  {selectedPrePayment.advanceTTCopies &&
                    selectedPrePayment.advanceTTCopies.map((item, index) =>
                      item.name !== '' ? (
                        <div key={index}>
                          <p className="text-sm">
                            {index + 1}. <a href={`${BACKEND_URL}${item.advance_tt_copy}`}>{item.name}</a>
                          </p>
                        </div>
                      ) : null
                    )}

              </div>
             
     
           </div>
     
            
            
           </div>
         </div>
        )}
      </Modal>
    </>

  )
}

export default PrePayment