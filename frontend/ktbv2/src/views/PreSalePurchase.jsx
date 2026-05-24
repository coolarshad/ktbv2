import NavBar from "../components/NavBar"
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import PreSPTable from "../components/PreSPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from "../components/FilterComponent";
import { dateFormatter } from "../dateUtils";


function PreSalePurchase() {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const [preSPData, setPreSPData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
 

  useEffect(() => {
    const fetchPreSPData = async () => {
      try {
        const response = await axios.get('/trademgt/pre-sales-purchases/'); // Replace with your API endpoint
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

  const handleFilter = (filters) => {
    setPreSPData(filters)
        setCurrentPage(1);
  };

  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'doc_issuance_date', label: 'Document Issuance Date' },
   
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = preSPData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

  
  return (
    <>
    
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre Sales/Purchase</p>
        {hasPermission(user, 'create_pre_sale_purchase') && (
<button
          onClick={handleAddPreSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
)}
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/pre-sales-purchases'} 
        fieldOptions={fieldOptions} downloadUrl="/excel/export/presp/" 
        />
        </div>
        <div className=" rounded p-2">

        <PreSPTable data={currentItems} onDelete={handleDelete} basePerm="pre_sale_purchase" />
        <Pagination itemsPerPage={50} totalItems={preSPData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>

    </>

  )
}

export default PreSalePurchase