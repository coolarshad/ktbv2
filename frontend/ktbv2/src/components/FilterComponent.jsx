import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa'; // Importing a download icon
import axios from '../axiosConfig';

const FilterComponent = ({flag, onFilter,apiEndpoint,fieldOptions,extraParams, checkBtn=true,downloadUrl = '/excel/export/trade/', }) => {
  const [field, setField] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [salesChecked, setSalesChecked] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [cancelChecked, setCancelChecked] = useState(false);

  const downloadExcel = async () => {
    try {
      // Send a GET request with 'responseType' set to 'blob' to handle binary data
      const response = await axios.get(downloadUrl, {
        responseType: 'blob', // This is necessary for handling binary data correctly
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
  
      // Create a URL from the received blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_export.xlsx'); // File name for download
      document.body.appendChild(link);
      link.click();
      link.remove(); // Remove the link element after clicking
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const params = {
        ...extraParams,
        [`${field}__icontains`]: searchText,
      };
      // console.log(params)
      // Add date fields only if they are provided
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
  
      // Create an array for trade_category using icontains
      const tradeTypes = [];
      if (salesChecked) tradeTypes.push('sales');
      if (purchaseChecked) tradeTypes.push('purchase');
      if (cancelChecked) tradeTypes.push('cancel');
  
      // Add trade_category to params if there are selected values
      if(flag){
        if (tradeTypes.length > 0) {
          params.trade_type__icontains = tradeTypes.join('|'); // Using regex OR for multiple values
        }
      }
      else{
        if (tradeTypes.length > 0) {
          params.trn__trade_type__icontains = tradeTypes.join('|'); // Using regex OR for multiple values
        }
      }
      
      const finalParams = { ...params };
      const response = await axios.get(`${apiEndpoint}`, { params });
      onFilter(response.data); // Pass the filtered data to the parent component
    } catch (error) {
      console.error('Error fetching filtered trades:', error);
      alert('There was an error fetching the filtered trades. Please try again.');
    }
  };
  
  return (
    <div className="px-3 py-1 bg-white shadow-md rounded-md">
      <div className="flex flex-col gap-2">
        {/* First Row */}
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1">Field</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="border p-1 rounded-md"
            >
              <option value="">Select Field</option>
              {fieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search text"
              className="border p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border p-1 rounded-md"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[150px]">
            <label className="text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border p-1 rounded-md"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md self-end text-sm"
          >
            Search
          </button>
        </div>

        {/* Second Row */}
       
        <div className="flex items-center justify-between">
       
          <div className="flex gap-4">
          {checkBtn && 
          <>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={salesChecked}
                onChange={() => setSalesChecked(!salesChecked)}
                className="mr-2"
              />
              Sales
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={purchaseChecked}
                onChange={() => setPurchaseChecked(!purchaseChecked)}
                className="mr-2"
              />
              Purchase
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={cancelChecked}
                onChange={() => setCancelChecked(!cancelChecked)}
                className="mr-2"
              />
              Cancel
            </label>
            </>
             }
          </div>
       
          <button
            onClick={downloadExcel}
            className="flex items-center bg-green-500 text-white px-2 py-1 text-xs rounded-md gap-2"
          >
            <FaDownload />
            Download
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default FilterComponent;
