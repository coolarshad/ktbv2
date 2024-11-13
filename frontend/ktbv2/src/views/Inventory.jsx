import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import InventoryTable from '../components/InventoryTable';

const Inventory = () => {


    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/inventory/'); 
          setData(response.data);
        } catch (error) {
          setError('Failed to fetch inventory data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

  

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to clear this inventory record?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/inventory/${id}/`);
          setData(data.filter(item => item.id !== id));
          alert('Inventory record deleted successfully.');
        } catch (error) {
          console.error('Error deleting inventory record:', error);
          alert('Failed to delete inventory record.');
        }
      }
    };



    const handleFilter = (filters) => {
      setData(filters)
    };
    
    const fieldOptions = [
      { value: 'product_name', label: 'Prouct Name' },
      { value: 'batch_number', label: 'Batch Number' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Inventory</p>
       
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/inventory'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <InventoryTable data={data} onDelete={handleDelete} />
        </div>
      </div>
     
        </>
    );
};

export default Inventory;
