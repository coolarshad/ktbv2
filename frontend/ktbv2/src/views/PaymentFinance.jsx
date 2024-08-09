import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import PFTable from "../components/PFTable"
import FilterComponent from "../components/FilterComponent";

function PaymentFinance() {
  const navigate = useNavigate();
  const [pfData, setPFData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <PFTable data={pfData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default PaymentFinance