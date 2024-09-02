import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import PurchaseTraceTable from '../components/PurchaseTraceTable';

const PurchaseProductTrace = () => {


    const navigate = useNavigate();
    const [pendingData, setPendingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/purchase-product-trace/'); 
          setPendingData(response.data);
        } catch (error) {
          setError('Failed to fetch purchase pending data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to clear this purchase product trace?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/purchase-product-trace/${id}/`);
          setPendingData(pendingData.filter(data => data.id !== id));
          alert('Purchase product trace deleted successfully.');
        } catch (error) {
          console.error('Error deleting purchase product trace:', error);
          alert('Failed to delete purchase product trace.');
        }
      }
    };



    const handleFilter = (filters) => {
      setPendingData(filters)
    };
    
    const fieldOptions = [
      { value: 'product_code', label: 'Prouct Code' },
      { value: 'first_trn', label: 'Starting TRN' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Purchase Product Tracing</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/purchase-product-trace'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <PurchaseTraceTable data={pendingData} onDelete={handleDelete} />
        </div>
      </div>
     
        </>
    );
};

export default PurchaseProductTrace;
