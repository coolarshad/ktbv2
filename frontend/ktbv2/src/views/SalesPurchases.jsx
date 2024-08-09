import NavBar from "../components/NavBar"
import SPTable from "../components/SPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState } from 'react';
import FilterComponent from "../components/FilterComponent";

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

  const handleAddSPClick = () => {
    navigate('/sales-purchase-form');
  };

  const handleFilter = (filters) => {
    setSPData(filters)
  };

  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'invoice_number', label: 'Invoice Number' },
    { value: 'bl_number', label: 'BL Number' },
    { value: 'bl_date', label: 'BL Date' },
    { value: 'invoice_date', label: 'Invoice Date' },
    { value: 'packaging_supplier', label: 'Packaging Supplier' },
    { value: 'logistic_supplier', label: 'Logistic Supplier' },
    { value: 'batch_number', label: 'Batch Number' },
    { value: 'production_date', label: 'Production Date' },
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  

  


  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales and Purchase Details</p>
        <button
          onClick={handleAddSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/sales-purchases'} 
        fieldOptions={fieldOptions}
        />
        </div>
        <div className=" rounded p-2">
        <SPTable data={spData} onDelete={handleDelete} />
        </div>
      </div>

    </>

  )
}

export default SalesPurchases