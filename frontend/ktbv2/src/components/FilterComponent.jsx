import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaDownload, FaUndo, FaSearch } from 'react-icons/fa';
import axios from '../axiosConfig';
import { getExportFileName } from '../utils/exportHelper';

const FilterComponent = ({
  flag,
  onFilter,
  apiEndpoint,
  fieldOptions = [],
  extraParams = {},
  checkBtn = true,
  downloadUrl = '/excel/export/trade/',
  showPendingFilter = false,
  currentPage,
  fileName,
  exportFileName,
}) => {
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [salesChecked, setSalesChecked] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);
  const [cancelChecked, setCancelChecked] = useState(false);
  const [pendingSpChecked, setPendingSpChecked] = useState(false);

  const isFirstRender = useRef(true);
  const isResetting = useRef(false);
  const prevPageRef = useRef(currentPage);

  // Debounced search trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPageRef.current = currentPage;
      return;
    }
    if (isResetting.current) {
      return;
    }

    const isPageChange = prevPageRef.current !== currentPage;
    prevPageRef.current = currentPage;

    const delayDebounceFn = setTimeout(() => {
      performSearch(isPageChange);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, dateFrom, dateTo, salesChecked, purchaseChecked, cancelChecked, pendingSpChecked, currentPage]);

  const performSearch = async (isPageChange = false) => {
    try {
      const params = {
        ...extraParams,
      };

      if (currentPage) {
        params.page = currentPage;
      }

      if (search) {
        params.q = search;
      }

      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const tradeTypes = [];
      if (salesChecked) tradeTypes.push('sales');
      if (purchaseChecked) tradeTypes.push('purchase');
      if (cancelChecked) tradeTypes.push('cancel');

      if (flag) {
        if (tradeTypes.length > 0) {
          params.trade_type__icontains = tradeTypes.join('|');
        }
      } else {
        if (tradeTypes.length > 0) {
          params.trn__trade_type__icontains = tradeTypes.join('|');
        }
      }

      if (showPendingFilter && pendingSpChecked) {
        params.pending_sp = true;
      }

      const response = await axios.get(apiEndpoint, { params });
      onFilter(response.data, isPageChange);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const handleReset = async () => {
    isResetting.current = true;
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSalesChecked(false);
    setPurchaseChecked(false);
    setCancelChecked(false);
    setPendingSpChecked(false);

    try {
      const params = { ...extraParams };
      if (currentPage) {
        params.page = 1;
      }
      const response = await axios.get(apiEndpoint, { params });
      onFilter(response.data);
    } catch (error) {
      console.error('Error resetting filters:', error);
    } finally {
      setTimeout(() => {
        isResetting.current = false;
      }, 500);
    }
  };

  const downloadExcel = async () => {
    try {
      const queryParams = new URLSearchParams({ ...extraParams });
      if (search) queryParams.append('q', search);
      if (dateFrom) queryParams.append('date_from', dateFrom);
      if (dateTo) queryParams.append('date_to', dateTo);

      const tradeTypes = [];
      if (salesChecked) tradeTypes.push('sales');
      if (purchaseChecked) tradeTypes.push('purchase');
      if (cancelChecked) tradeTypes.push('cancel');

      if (flag) {
        if (tradeTypes.length > 0) {
          queryParams.append('trade_type__icontains', tradeTypes.join('|'));
        }
      } else {
        if (tradeTypes.length > 0) {
          queryParams.append('trn__trade_type__icontains', tradeTypes.join('|'));
        }
      }

      if (showPendingFilter && pendingSpChecked) {
        queryParams.append('pending_sp', 'true');
      }

      const separator = downloadUrl.includes('?') ? '&' : '?';
      const fullDownloadUrl = `${downloadUrl}${separator}${queryParams.toString()}`;

      const response = await axios.get(fullDownloadUrl, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
  
      const finalFileName = getExportFileName(exportFileName || fileName, downloadUrl, response, extraParams);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 mb-4 mt-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Inputs Row */}
        <div className="flex flex-col sm:flex-row flex-grow items-stretch sm:items-center gap-3">
          
          {/* Quick Search */}
          <div className="flex-grow min-w-[200px]">
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaSearch size={14} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="block w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Checkboxes if checkBtn or showPendingFilter is enabled */}
          {(checkBtn || showPendingFilter) && (
            <div className="flex items-center gap-3 px-2 border-l border-gray-200">
              {checkBtn && (
                <>
                  <label className="inline-flex items-center text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={salesChecked}
                      onChange={() => setSalesChecked(!salesChecked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 mr-1.5"
                    />
                    Sales
                  </label>
                  <label className="inline-flex items-center text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={purchaseChecked}
                      onChange={() => setPurchaseChecked(!purchaseChecked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 mr-1.5"
                    />
                    Purchase
                  </label>
                  <label className="inline-flex items-center text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cancelChecked}
                      onChange={() => setCancelChecked(!cancelChecked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 mr-1.5"
                    />
                    Cancel
                  </label>
                </>
              )}
              {showPendingFilter && (
                <label className="inline-flex items-center text-sm font-medium text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pendingSpChecked}
                    onChange={() => setPendingSpChecked(!pendingSpChecked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 mr-1.5"
                  />
                  Pending
                </label>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          <button
            onClick={handleReset}
            title="Reset Filters"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 bg-white rounded-lg hover:bg-gray-50 focus:outline-none transition-all duration-200"
          >
            <FaUndo size={11} />
            Reset
          </button>

          <button
            onClick={downloadExcel}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
          >
            <FaDownload size={11} />
            Export
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterComponent;
