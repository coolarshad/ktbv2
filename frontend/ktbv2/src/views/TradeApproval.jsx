import NavBar from "../components/NavBar"
import React, { useEffect, useState } from 'react';
import TradeTable from "../components/TradeTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function TradeApproval() {
  const navigate = useNavigate();
  const [tradeData, setTradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        const response = await axios.get('/trademgt/trades'); // Replace with your API endpoint
        setTradeData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchTradeData();
  }, []);

  const handleDelete = async (tradeId) => {
    const confirmed = window.confirm('Are you sure you want to delete this trade?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/trades/${tradeId}/`);
        setTradeData(tradeData.filter(trade => trade.id !== tradeId));
        alert('Trade deleted successfully.');
      } catch (error) {
        console.error('Error deleting trade:', error);
        alert('Failed to delete trade.');
      }
    }
  };

  const handleAddTradeClick = () => {
    navigate('/trade-form');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Trade Approvals</p>
        <button
          onClick={handleAddTradeClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div className=" rounded py-2">
        <TradeTable data={tradeData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default TradeApproval