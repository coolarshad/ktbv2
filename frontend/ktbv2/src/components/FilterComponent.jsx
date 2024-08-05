import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa'; // Importing a download icon
import axios from '../axiosConfig';

const FilterComponent = ({ onFilter }) => {
  const [field, setField] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [salesChecked, setSalesChecked] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [cancelChecked, setCancelChecked] = useState(false);

 

  const handleSearch = async () => {
    try {
      const response = await axios.get('/trademgt/trades', {
        params: {
          [`${field}`]: searchText,
          date_from: dateFrom,
          date_to: dateTo,
          sales: salesChecked,
          purchase: purchaseChecked,
          cancel: cancelChecked,
        },
      });
      console.log("------",response.data)
      onFilter(response.data); // Pass the filtered data to the parent component
    } catch (error) {
      console.error('Error fetching filtered trades:', error);
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
              <option value="trn">TRN</option>
              <option value="field2">Field 2</option>
              {/* Add more options as needed */}
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
          </div>
          <button
            onClick={() => {/* Add download functionality here */}}
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
