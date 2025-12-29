import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import axios from '../axiosConfig';

const CostMgtFilterComponent = ({
  apiEndpoint,
  fieldOptions = [],
  extraParams = {},
  onFilter,
  checkBtn = true,
  downloadUrl = '/excel/export/trade/',
}) => {
  const [field, setField] = useState('');
  const [searchText, setSearchText] = useState('');
  const [salesChecked, setSalesChecked] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [cancelChecked, setCancelChecked] = useState(false);

  // ---------- Download Excel ----------
  const downloadExcel = async () => {
    try {
      const response = await axios.get(downloadUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // ---------- Handle Search ----------
  const handleSearch = async () => {
    if (!field) {
      alert('Please select a field to filter.');
      return;
    }

    try {
      const params = { ...extraParams };

      // Find the selected field's type from fieldOptions
      const selectedField = fieldOptions.find(f => f.value === field);

      if (searchText) {
        // Use exact or icontains based on field type
        const lookup = selectedField?.type === 'exact' ? field : `${field}__icontains`;
        params[lookup] = searchText;
      }

      // Handle trade type checkboxes (if any)
      const tradeTypes = [];
      if (salesChecked) tradeTypes.push('sales');
      if (purchaseChecked) tradeTypes.push('purchase');
      if (cancelChecked) tradeTypes.push('cancel');

      if (tradeTypes.length > 0) {
        params.trade_type = tradeTypes.join(',');
      }

      // Call API with built params
      const response = await axios.get(apiEndpoint, { params });
      onFilter(response.data);

    } catch (error) {
      console.error('Error fetching filtered data:', error);
      alert('Error fetching filtered data. Please try again.');
    }
  };


  return (
    <div className="px-16 py-2 bg-white shadow-md rounded-md">
      <div className="flex flex-col gap-2">
        {/* Row 1: Field + Search + Buttons */}
        <div className="flex flex-wrap gap-2 items-end">
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
              placeholder="Search..."
              className="border p-1 rounded-md"
            />
          </div>

          {/* Buttons inline */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
            >
              Search
            </button>

            <button
              onClick={downloadExcel}
              className="flex items-center bg-green-500 text-white px-2 py-2 text-sm rounded-md gap-1"
            >
              <FaDownload />
              Download
            </button>
          </div>
        </div>

        {/* Row 2: Checkboxes */}
        {checkBtn && (
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
        )}
      </div>
    </div>
  );
};

export default CostMgtFilterComponent;
