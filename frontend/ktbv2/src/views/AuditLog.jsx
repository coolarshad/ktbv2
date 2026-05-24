import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHistory, FaFilter } from 'react-icons/fa';
import axios from '../axiosConfig';

const PAGE_OPTIONS = [
  { name: 'Dashboard', keyword: '/' },
  { name: 'Users', keyword: '/users' },
  { name: 'Logs', keyword: '/logs' },
  { name: 'Audit Log', keyword: '/audit-log' },
  { name: 'KYC', keyword: '/kyc' },
  { name: 'Company', keyword: '/company' },
  { name: 'Payment Term Form', keyword: '/payment-term-form' },
  { name: 'Bank', keyword: '/bank' },
  { name: 'Units', keyword: '/units' },
  { name: 'Documents Required', keyword: '/documents-required-form' },
  { name: 'Product Name', keyword: '/products-name' },
  { name: 'Shipment Size', keyword: '/shipments-size' },
  { name: 'Currency', keyword: '/currency' },
  { name: 'Packings', keyword: '/trade-packings' },
  { name: 'Trade Approval', keyword: '/trades' },
  { name: 'Trade Approved', keyword: '/tradeapprove' },
  { name: 'Pre-Sale Purchase', keyword: '/pre-sales-purchases' },
  { name: 'Pre Payment', keyword: '/pre-payment' },
  { name: 'Sales Purchases', keyword: '/sales-purchases' },
  { name: 'Payment Finance', keyword: '/payment-finance' },
  { name: 'PL', keyword: '/pl' },
  { name: 'Report', keyword: '/trade-report' },
  { name: 'Inventory', keyword: '/inventory' },
  { name: 'Sales Pending', keyword: '/sales-pending' },
  { name: 'Purchase Pending', keyword: '/purchase-pending' },
  { name: 'Sales Product Trace', keyword: '/sales-product-trace' },
  { name: 'Purchase Product Trace', keyword: '/purchase-product-trace' },
  { name: 'Product Reference', keyword: '/product-ref' },
  { name: 'Packing Size', keyword: '/packing-size' },
  { name: 'Packing Type List', keyword: '/packingtype' },
  { name: 'Packing Price', keyword: '/packings' },
  { name: 'Raw Material Category', keyword: '/raw-categories' },
  { name: 'Raw Material Pricing', keyword: '/raw-materials' },
  { name: 'Additives Category', keyword: '/additive-categories' },
  { name: 'Additive Pricing', keyword: '/additives' },
  { name: 'Blending Formulation', keyword: '/consumption-formula' },
  { name: 'Consumption', keyword: '/consumptions' },
  { name: 'Packing Formulation', keyword: '/product-formula' },
  { name: 'Final Product Cost', keyword: '/final-products' },
  { name: 'Packing Cons Report', keyword: '/packing-consumptions' },
  { name: 'Additive Cons Report', keyword: '/additive-consumptions' },
  { name: 'Raw Material Cons Report', keyword: '/raw-consumptions' }
];

export default function AuditLog() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [selectedPage]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/accounts/logs/';
      if (selectedPage) {
        const pageObj = PAGE_OPTIONS.find(p => p.name === selectedPage);
        if (pageObj && pageObj.keyword) {
          let searchKeyword = pageObj.keyword.startsWith('/') ? pageObj.keyword.substring(1) : pageObj.keyword;
          if (searchKeyword === '') {
             searchKeyword = 'dashboard';
          }
          url = `/accounts/logs/?search=${encodeURIComponent(searchKeyword)}`;
        }
      }

      const response = await axios.get(url);
      setLogs(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const renderData = (data) => {
    if (!data) return <span className="text-gray-400 italic">None</span>;
    return (
      <pre className="text-[10px] bg-gray-50 p-2 rounded max-h-32 overflow-y-auto whitespace-pre-wrap break-all text-gray-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
          <FaHistory className="text-blue-500" />
          <span>Audit Log</span>
        </h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center space-x-4">
        <div className="flex items-center text-gray-600">
          <FaFilter className="mr-2" />
          <span className="font-medium text-sm whitespace-nowrap">Filter by Page:</span>
        </div>
        <div className="w-full max-w-md relative">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700 appearance-none"
          >
            <option value="">-- Select a Page --</option>
            {[...PAGE_OPTIONS].sort((a, b) => a.name.localeCompare(b.name)).map((page) => (
              <option key={page.name} value={page.name}>
                {page.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">DateTime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                    {selectedPage ? `No audit logs found for ${selectedPage}.` : 'No audit logs found.'}
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.actor_name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm align-top w-1/4">
                      {renderData(log.details?.old_data)}
                    </td>
                    <td className="px-6 py-4 text-sm align-top w-1/4">
                      {renderData(log.details?.new_data)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
