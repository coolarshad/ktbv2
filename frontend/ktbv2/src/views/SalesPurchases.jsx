import NavBar from "../components/NavBar"
import SPTable from "../components/SPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';

function SalesPurchases() {


  const navigate = useNavigate();
  const [spData, setSPData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // const tradeData = [
  //   {
  //     tradeType: 'Buy',
  //     company: 'Company A',
  //     trn: 'TRN001',
  //     invoiceDate: '2024-07-29',
  //     invoiceNumber: '0025',
  //     buyerSellerName: 'Seller A',
  //     reviewed: true,  // updated field
  //     status: 'Approved',
  //   },
  //   {
  //     tradeType: 'Sell',
  //     company: 'Company B',
  //     trn: 'TRN002',
  //     invoiceDate: '2024-07-29',
  //     invoiceNumber: '0028',
  //     buyerSellerName: 'Seller B',
  //     reviewed: false,  // updated field
  //     status: 'Pending',
  //   },
  //   // Add more trade objects here
  // ];

  const handleAddSPClick = () => {
    navigate('/sales-purchase-form');
  };


  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales and Purchase Details</p>
        <button
          onClick={handleAddSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div className=" rounded p-2">
        <SPTable data={spData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default SalesPurchases