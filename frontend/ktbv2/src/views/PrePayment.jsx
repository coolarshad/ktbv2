import NavBar from "../components/NavBar"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import PrePaymentTable from "../components/PrePaymentTable"


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
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  

  const handleAddPreSPClick = () => {
    navigate('/pre-payment-form');
  };
  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre-Payments/ LC's Details</p>
        <button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div className=" rounded p-2">
        <PrePaymentTable data={prePaymentData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default PrePayment