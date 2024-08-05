import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import PFTable from "../components/PFTable"

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
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      balancePayment: 10000,
      paymentDueDate: '2024-07-29',
      paymentReceivedSent: 5000,
      paymentDate: '2024-07-29',
      balanceDue: 5000,
      buyerSellerName: 'Seller A',
      reviewed: true,  // updated field
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      paymentDueDate: '2024-07-29',
      paymentReceivedSent: 10000,
      paymentDate: '2024-07-29',
      balanceDue: 0,
      buyerSellerName: 'Seller B',
      reviewed: false,  // updated field
      status: 'Pending',
    },
    // Add more trade objects here
  ];

  const handleAddPreSPClick = () => {
    navigate('/payment-finance-form');
  };

  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Payment and Finance Details</p>
        <button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div className=" rounded p-2">
        <PFTable data={pfData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default PaymentFinance