import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import PrePaymentTable from "../components/PrePaymentTable"
import FilterComponent from "../components/FilterComponent";


function PrePayment() {
  const navigate = useNavigate();
  const [prePaymentData, setPrePaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <PrePaymentTable data={prePaymentData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default PrePayment