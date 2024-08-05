import NavBar from "../components/NavBar"
import React, { useEffect, useState } from 'react';
import PreSPTable from "../components/PreSPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function PreSalePurchase() {
  const navigate = useNavigate();
 
  const [preSPData, setPreSPData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreSPData = async () => {
      try {
        const response = await axios.get('/trademgt/pre-sales-purchases'); // Replace with your API endpoint
        setPreSPData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchPreSPData();
  }, []);

  const handleAddPreSPClick = () => {
    navigate('/pre-sale-purchase-form');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this Pre Sale/Purchase?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/pre-sales-purchases/${id}/`);
        setPreSPData(preSPData.filter(data => data.id !== id));
        alert('Pre Sale/Purchase deleted successfully.');
      } catch (error) {
        console.error('Error deleting Pre Sale/Purchase:', error);
        alert('Failed to delete Pre Sale/Purchase.');
      }
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre Sales/Purchase</p>
        <button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div className=" rounded p-2">
        <PreSPTable data={preSPData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default PreSalePurchase