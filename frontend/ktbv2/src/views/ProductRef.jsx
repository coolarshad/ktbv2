import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import PurchaseTraceTable from '../components/PurchaseTraceTable';
import ProductRefTable from '../components/ProductRefTable';

const ProductRef = () => {


    const navigate = useNavigate();
    const [refData, setRefData] = useState([]);
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
    };
    
    const fieldOptions = [
      { value: 'product_code', label: 'Prouct Code' },
      { value: 'trade_type', label: 'Trade Type' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Product Ref</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/product-ref'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <ProductRefTable data={refData} onDelete={handleDelete} />
        </div>
      </div>
     
        </>
    );
};

export default ProductRef;
