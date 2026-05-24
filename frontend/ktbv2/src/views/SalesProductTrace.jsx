import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import SalesTraceTable from '../components/SalesTraceTable';

const SalesProductTrace = () => {
    const { user } = useAuth();


    const navigate = useNavigate();
    const [pendingData, setPendingData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/product-trace/?trade_type=Sales'); 
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
      const confirmed = window.confirm('Are you sure you want to clear this sales product trace?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/product-trace/${id}/`);
          setPendingData(pendingData.filter(data => data.id !== id));
          alert('Sales product trace deleted successfully.');
        } catch (error) {
          console.error('Error deleting sales product trace:', error);
          alert('Failed to delete sales product trace.');
        }
      }
    };



    const handleFilter = (filters) => {
      setPendingData(filters)
        setCurrentPage(1);
    };
    
    const fieldOptions = [
      { value: 'product_code', label: 'Prouct Code' },
      { value: 'first_trn', label: 'Starting TRN' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = pendingData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales Product Tracing</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/sales-product-trace'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <SalesTraceTable data={currentItems} onDelete={handleDelete} />
        <Pagination itemsPerPage={50} totalItems={pendingData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
     
        </>
    );
};

export default SalesProductTrace;
