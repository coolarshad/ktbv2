import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import PurchaseTraceTable from '../components/PurchaseTraceTable';
import ProductRefTable from '../components/ProductRefTable';

const ProductRef = () => {
    const { user } = useAuth();


    const navigate = useNavigate();
    const [refData, setRefData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/product-ref/'); 
          setRefData(response.data);
        } catch (error) {
          setError('Failed to fetch product ref data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to clear this product reference?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/product-ref/${id}/`);
          setRefData(refData.filter(data => data.id !== id));
          alert('Product ref deleted successfully.');
        } catch (error) {
          console.error('Error deleting product ref:', error);
          alert('Failed to delete product ref.');
        }
      }
    };



    const handleFilter = (filters) => {
      setRefData(filters)
        setCurrentPage(1);
    };
    
    const fieldOptions = [
      { value: 'product_code', label: 'Prouct Code' },
      { value: 'trade_type', label: 'Trade Type' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = refData?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Product Ref</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/product-ref/'} downloadUrl="/excel/export/product-ref/" fileName="Product_Ref_export" fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <ProductRefTable data={currentItems} onDelete={handleDelete} />
        <Pagination itemsPerPage={50} totalItems={refData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>
     
        </>
    );
};

export default ProductRef;
