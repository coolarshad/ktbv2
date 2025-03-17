import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import PurchasePendingTable from '../components/PurchasePendingTable';


const PurchasePending = () => {


    const [pendingData, setPendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/trade-pending/?trade_type=Purchase'); 
          setPendingData(response.data);
        } catch (error) {
          setError('Failed to fetch sales pending data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to clear this purchase pending?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/trade-pending/${id}/`);
          setPendingData(pendingData.filter(data => data.id !== id));
          alert('Sales Pending deleted successfully.');
        } catch (error) {
          console.error('Error deleting Purchase Pending:', error);
          alert('Failed to delete Purchase Pending.');
        }
      }
    };



    const handleFilter = (filters) => {
      setPendingData(filters)
    };
    
    const fieldOptions = [
      { value: 'product_name', label: 'Prouct Name' }, 
      { value: 'product_code', label: 'Prouct Code' },
      { value: 'trn', label: 'TRN' },
      { value: 'trd', label: 'TRD' },
      { value: 'company', label: 'Company' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Purchase Pending</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/purchase-pending'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <PurchasePendingTable data={pendingData} onDelete={handleDelete} />
        </div>
      </div>
     
        </>
    );
};

export default PurchasePending;
