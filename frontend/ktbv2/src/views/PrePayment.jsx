import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import PrePaymentTable from "../components/PrePaymentTable"
import FilterComponent from "../components/FilterComponent";
import Modal from '../components/Modal';
import MultiUserSelector from '../components/MultiUserSelector';
import { today, addDaysToDate,advanceToPay,advanceToReceive,dateFormatter } from '../dateUtils';
import { BASE_URL } from '../utils';
import ReactToPrint from 'react-to-print';
import Loading from '../components/Loading';

function PrePayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const componentRef = useRef();

  const [prePaymentData, setPrePaymentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrePayment, setSelectedPrePayment] = useState(null);
  const [notifiedUsers, setNotifiedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");

  const BACKEND_URL = BASE_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const response = await axios.get(`/trademgt/pre-payments/?page=${currentPage}`);
      if (response.data && response.data.results) {
        setPrePaymentData(response.data.results);
        setTotalItems(response.data.count);
      } else {
        setPrePaymentData(response.data || []);
        setTotalItems(response.data ? response.data.length : 0);
      }
    } catch (error) {
      setError('Failed to fetch trade data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

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
    setNotifiedUsers([]);
    setNotificationMessage("");
  };

  const reviewTrade = async () => {
    if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before reviewing.");
      return;
    }
    try {
      const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append('notifiedUsers[]', id));
      if (notificationMessage) {
        params.append('notification_message', notificationMessage);
      }
      await axios.get(`/trademgt/pre-payments-review/${selectedPrePayment.id}/?${params.toString()}`);
     
      setIsModalOpen(false);
      setSelectedPrePayment(null);
      setNotifiedUsers([]);
      setNotificationMessage("");
      window.location.reload();
    } catch (error) {
      console.error('Error reviewing trade:', error);
      // Optionally, handle the error (e.g., show a user-friendly error message)
    }
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
    if (filters && filters.results) {
      setPrePaymentData(filters.results);
      setTotalItems(filters.count);
    } else {
      setPrePaymentData(filters || []);
      setTotalItems(filters ? filters.length : 0);
    }
    setCurrentPage(1);
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

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const currentItems = prePaymentData || [];
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    
  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre-Payments/ LC's Details</p>
        {hasPermission(user, 'create_pre_payment') && (
<button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/pre-payments'} 
        fieldOptions={fieldOptions} downloadUrl="/excel/export/prepay/" showPendingFilter={true} currentPage={currentPage}
        />
        </div>
        <div className=" rounded p-2">
        <PrePaymentTable data={currentItems} onDelete={handleDelete} onView={handleViewClick} basePerm="pre_payment" />
        <Pagination itemsPerPage={10} totalItems={totalItems} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedPrePayment && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             {hasPermission(user, 'print_pre_payment') && (
                <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />
              )}
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
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn?.trn || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.presp?.date ? dateFormatter(selectedPrePayment.presp.date) : '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn?.trade_type || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Payment Term </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn?.paymentTerm?.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buyer/Seller Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.kyc?.name || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Value of Contract </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn?.contract_value || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance to Receive </td>
                    <td className="py-2 px-4 text-gray-800">{advanceToReceive(selectedPrePayment)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance to Pay </td>
                    <td className="py-2 px-4 text-gray-800">{advanceToPay(selectedPrePayment)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Due Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.presp?.trade?.paymentTerm?.advance_within ? (selectedPrePayment.presp.trade.paymentTerm.advance_within === 'NA' ? 'NA' : dateFormatter(addDaysToDate(selectedPrePayment.presp.doc_issuance_date, selectedPrePayment.presp.trade.paymentTerm.advance_within))) : '-'}</td>
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
                    <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedPrePayment.date_of_receipt)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Paid </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.advance_paid}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date of Payment </td>
                    <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedPrePayment.date_of_payment)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Expiry Date</td>
                    <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedPrePayment.lc_expiry_date)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Latest Shipment Date in LC </td>
                    <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedPrePayment.latest_shipment_date_in_lc)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn?.trader_name || '-'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurrance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.trn.insurance_policy_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.remarks}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Reviwed</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPrePayment.reviewed ? 'Yes' : 'No'}</td>
                  </tr>
                  
                </tbody>
                </table>
                <p className='my-2 underline'>LC Copy</p>
                {selectedPrePayment.lcCopies && (
                  selectedPrePayment.lcCopies.map((item, index) => (
                    <div key={index}>
                      <p className='text-sm'>{index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.lc_copy}`} target="_blank"
                              rel="noopener noreferrer">{item.name}</a></p>

                    </div>
                  )))}
                <p className='my-2 underline'>LC Ammendment</p>
                {selectedPrePayment.lcAmmendments && (
                  selectedPrePayment.lcAmmendments.map((item, index) => (
                    <div key={index}>
                      <p className='text-sm'>{index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.lc_ammendment}`} target="_blank"
                              rel="noopener noreferrer">{item.name}</a></p>

                    </div>
                  )))}
                <p className='my-2 underline'>Advance TT Copy</p>
                  {selectedPrePayment.advanceTTCopies &&
                    selectedPrePayment.advanceTTCopies.map((item, index) =>
                      item.name !== '' ? (
                        <div key={index}>
                          <p className="text-sm">
                            {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.advance_tt_copy}`} target="_blank"
                              rel="noopener noreferrer">{item.name}</a>
                          </p>
                        </div>
                      ) : null
                    )}

              </div>
             
     
           </div>
     
           {!selectedPrePayment.reviewed && (
             <div className="mt-6 border-t pt-4">
               <MultiUserSelector 
                  selectedUsers={notifiedUsers} 
                  onChange={setNotifiedUsers} 
                  message={notificationMessage}
                  onMessageChange={setNotificationMessage}
                />
             </div>
           )}

           {selectedPrePayment.reviewed ? '' : 
             hasPermission(user, 'review_pre_payment') && (
             <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
             <button onClick={reviewTrade} className="bg-blue-500 text-white p-2 rounded col-span-3">Review</button>
             </div>
             )}
             
            {/* Notified Users Section */}
            <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
              <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
              {selectedPrePayment?.notified_users_emails?.length > 0 ? (
                <ul className="list-disc pl-5">
                  {selectedPrePayment.notified_users_emails.map((email, idx) => (
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

  )
}

export default PrePayment