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
import Loading from "../components/Loading";


function PreSalePurchase() {
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const [preSPData, setPreSPData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPreSPData = async () => {
    try {
      const response = await axios.get(`/trademgt/pre-sales-purchases/?page=${currentPage}`);
      if (response.data && response.data.results) {
        setPreSPData(response.data.results);
        setTotalItems(response.data.count);
      } else {
        setPreSPData(response.data || []);
        setTotalItems(response.data ? response.data.length : 0);
      }
    } catch (error) {
      setError('Failed to fetch trade data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreSPData();
  }, [currentPage]);

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

  const handleFilter = (filters, isPageChange = false) => {
    if (filters && filters.results) {
      setPreSPData(filters.results);
      setTotalItems(filters.count);
    } else {
      setPreSPData(filters || []);
      setTotalItems(filters ? filters.length : 0);
    }
    if (!isPageChange) {
      setCurrentPage(1);
    }
  };

  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'doc_issuance_date', label: 'Document Issuance Date' },
   
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  const currentItems = preSPData || [];
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
        fieldOptions={fieldOptions} downloadUrl="/excel/export/presp/" showPendingFilter={true} currentPage={currentPage}
        />
        </div>
        <div className=" rounded p-2">

        <PreSPTable data={currentItems} onDelete={handleDelete} basePerm="pre_sale_purchase" />
        <Pagination itemsPerPage={15} totalItems={totalItems} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>

    </>

  )
}

export default PreSalePurchase