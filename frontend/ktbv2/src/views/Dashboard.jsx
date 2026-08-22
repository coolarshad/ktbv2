import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import {
  FaChartLine,
  FaBoxOpen,
  FaFlask,
  FaVial,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaClipboardList,
  FaBox,
  FaCreditCard,
  FaDownload
} from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/accounts/dashboard/')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const downloadExcel = async (endpoint, defaultFilename) => {
    try {
      const response = await axios.get(endpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', defaultFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading file from ${endpoint}:`, error);
    }
  };

  const downloadInventoryExcel = async () => {
    downloadExcel('/excel/export/dashboard-inventory/', 'Dashboard_Inventory_Summary.xlsx');
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-10"></div>

          <div className="h-8 bg-gray-200 rounded w-1/6 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-12">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const tradeMetrics = data?.trade_management?.metrics || {};
  const financialSummary = data?.trade_management?.financial_summary || {};
  const tradeRecent = data?.trade_management?.recent_trades || [];
  const presaleRecent = data?.trade_management?.recent_presales || [];
  const inventoryRecent = data?.trade_management?.recent_inventory || [];

  const costMetrics = data?.cost_management?.metrics || {};
  const productRecent = data?.cost_management?.recent_products || [];
  const consumptionRecent = data?.cost_management?.recent_consumptions || [];

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">KTB 2 Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
            <FaBell className="text-red-500 mr-2" />
            <span className="font-semibold mr-1">{data?.general?.unread_notifications || 0}</span> Unread Alerts
          </div>
        </div>
      </div>

      {/* SECTION: FINANCIAL & COMPLIANCE SUMMARY */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></div>
          <h3 className="text-lg font-bold text-gray-700">Financial & Compliance Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Receivables Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-100 font-medium text-sm">Account Receivables (AR)</span>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FaFileInvoiceDollar size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">{formatCurrency(financialSummary.account_receivables)}</h3>
              <p className="text-xs text-green-100 mt-1">Total pending balance to receive from sales</p>
            </div>
            <div className="mt-4 pt-3 border-t border-green-400/30 flex justify-end">
              <button
                onClick={() => downloadExcel('/excel/export/account-receivables/', 'Account_Receivables_Summary.xlsx')}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition backdrop-blur-sm"
              >
                <FaDownload size={12} /> Export Excel
              </button>
            </div>
          </div>

          {/* Account Payables Card */}
          <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-rose-100 font-medium text-sm">Account Payables (AP)</span>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FaCreditCard size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">{formatCurrency(financialSummary.account_payables)}</h3>
              <p className="text-xs text-rose-100 mt-1">Total balance due for purchases & logistics</p>
            </div>
            <div className="mt-4 pt-3 border-t border-rose-400/30 flex justify-end">
              <button
                onClick={() => downloadExcel('/excel/export/account-payables/', 'Account_Payables_Summary.xlsx')}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition backdrop-blur-sm"
              >
                <FaDownload size={12} /> Export Excel
              </button>
            </div>
          </div>

          {/* Insurance Pending Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-amber-100 font-medium text-sm">Insurance Pending</span>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FaClipboardList size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">{financialSummary.insurance_pending || 0} <span className="text-lg font-medium text-amber-100">Trades</span></h3>
              <p className="text-xs text-amber-100 mt-1">Trades with pending policy details or 'NA'</p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-400/30 flex justify-end">
              <button
                onClick={() => downloadExcel('/excel/export/insurance-pending/', 'Insurance_Pending_Summary.xlsx')}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition backdrop-blur-sm"
              >
                <FaDownload size={12} /> Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TRADE MANAGEMENT */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800">Trade Management</h2>
        </div>

        {/* Trade KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Trades"
            data={tradeMetrics.trades || 0}
            icon={<FaChartLine className="text-blue-500" size={24} />}
            color="bg-blue-50"
            to="/trade-approved"
            toApproved="/trade-approved"
            toPending="/trade-approval"
          />
          <StatCard
            title="Pre-Sales"
            data={tradeMetrics.presales || 0}
            icon={<FaClipboardList className="text-indigo-500" size={24} />}
            color="bg-indigo-50"
            to="/pre-sale-purchase"
            toApproved="/pre-sale-purchase?approved=true"
            toPending="/pre-sale-purchase?approved=false"
          />
          <StatCard
            title="Pre Payment"
            data={tradeMetrics.pre_payment || 0}
            icon={<FaCreditCard className="text-cyan-500" size={24} />}
            color="bg-cyan-50"
            to="/pre-payment"
            toApproved="/pre-payment?reviewed=true"
            toPending="/pre-payment?reviewed=false"
          />
          <StatCard
            title="Sales Purchases"
            data={tradeMetrics.sales_purchases || 0}
            icon={<FaFileInvoiceDollar className="text-teal-500" size={24} />}
            color="bg-teal-50"
            to="/sales-purchases"
            toApproved="/sales-purchases?reviewed=true"
            toPending="/sales-purchases?reviewed=false"
          />
          <StatCard
            title="Payment Finance"
            data={tradeMetrics.payment_finance || 0}
            icon={<FaMoneyCheckAlt className="text-emerald-500" size={24} />}
            color="bg-emerald-50"
            to="/payment-finance"
            toApproved="/payment-finance?reviewed=true"
            toPending="/payment-finance?reviewed=false"
          />
        </div>



        {/* Recent Inventory Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-800">Inventory Stock Summary</h3>
            <button
              onClick={downloadInventoryExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200"
            >
              <FaDownload size={11} />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Product Name</th>
                  <th className="p-4 font-medium">Stock (Quantity)</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRecent.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-cyan-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">{item.product_name || '-'}</td>
                    <td className="p-4 text-gray-800 font-semibold">{item.total_stock} {item.unit || ''}</td>
                  </tr>
                ))}
                {inventoryRecent.length === 0 && (
                  <tr>
                    <td colSpan="2" className="p-8 text-center text-gray-400">No inventory records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-12" />

      {/* SECTION 2: COST MANAGEMENT */}
      <div>
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800">Cost Management</h2>
        </div>

        {/* Cost KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Final Products"
            data={costMetrics.products || 0}
            icon={<FaBoxOpen className="text-purple-500" size={24} />}
            color="bg-purple-50"
            to="/final-products"
            toApproved="/final-products?approved=true"
            toPending="/final-products?approved=false"
          />
          <StatCard
            title="Consumptions"
            data={costMetrics.consumptions || 0}
            icon={<FaBox className="text-pink-500" size={24} />}
            color="bg-pink-50"
            to="/consumption-formula"
            toApproved="/consumption-formula?approved=true"
            toPending="/consumption-formula?approved=false"
          />
          <StatCard
            title="Additives"
            data={costMetrics.additives || 0}
            icon={<FaFlask className="text-green-500" size={24} />}
            color="bg-green-50"
            to="/additives"
            toApproved="/additives?approved=true"
            toPending="/additives?approved=false"
          />
          <StatCard
            title="Raw Materials"
            data={costMetrics.raw_materials || 0}
            icon={<FaVial className="text-amber-500" size={24} />}
            color="bg-amber-50"
            to="/raw-materials"
            toApproved="/raw-materials?approved=true"
            toPending="/raw-materials?approved=false"
          />
          <StatCard
            title="Packings"
            data={costMetrics.packings || 0}
            icon={<FaBox className="text-orange-500" size={24} />}
            color="bg-orange-50"
            to="/packings"
            toApproved="/packings?approved=true"
            toPending="/packings?approved=false"
          />
        </div>


      </div>

    </div>
  );
}

function StatCard({ title, data, icon, color, to, toApproved, toPending }) {
  const navigate = useNavigate();
  const value = typeof data === 'object' ? data.total : data;
  const approved = typeof data === 'object' ? data.approved : null;
  const pending = typeof data === 'object' ? data.pending : null;

  const handleCardClick = () => {
    if (to) {
      navigate(to);
    }
  };

  const handleApprClick = (e) => {
    e.stopPropagation();
    if (toApproved) {
      navigate(toApproved);
    }
  };

  const handlePendingClick = (e) => {
    e.stopPropagation();
    if (toPending) {
      navigate(toPending);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full ${to ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {approved !== null && (
          <div className="flex items-center space-x-2 mt-3 text-xs font-medium">
            <span
              onClick={handleApprClick}
              title="View Approved / Reviewed"
              className={`text-green-700 bg-green-50 hover:bg-green-100 border border-green-200/60 px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1.5 select-none ${toApproved ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-xs' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {approved} Appr
            </span>
            <span
              onClick={handlePendingClick}
              title="View Unapproved / Unreviewed"
              className={`text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 px-2.5 py-1 rounded-full transition-all duration-200 flex items-center gap-1.5 select-none ${toPending ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-xs' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              {pending} Unappr
            </span>
          </div>
        )}
      </div>
    </div>
  );
}