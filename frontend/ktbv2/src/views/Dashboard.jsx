import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import {
  FaChartLine,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaFileInvoiceDollar,
  FaMoneyCheckAlt,
  FaClipboardList,
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
          <div
            onClick={() => navigate('/trade-approved?insurance_pending=true')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-amber-100 font-medium text-sm">Insurance Pending</span>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <FaClipboardList size={22} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight mt-1">{financialSummary.insurance_pending || 0} <span className="text-lg font-medium text-amber-100">Trades</span></h3>
              <p className="text-xs text-amber-100 mt-1">Trades with &apos;NA&apos; or missing insurance policy</p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-400/30 flex items-center justify-between">
              <span className="text-xs text-amber-100 font-medium underline group-hover:text-white transition-colors">View Trades &rarr;</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadExcel('/excel/export/insurance-pending/', 'Insurance_Pending_Summary.xlsx');
                }}
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

        {/* Trade KPI Cards: 3 Cards (Pending, Approved, Unapproved) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending"
            data={tradeMetrics.pending ?? 0}
            icon={<FaClock className="text-amber-500" size={24} />}
            color="bg-amber-50"
            to="/trade-approved?pending_sp=true"
            subtitle="Approved trades without sales/purchase entry"
          />
          <StatCard
            title="Approved"
            data={tradeMetrics.approved ?? (tradeMetrics.trades?.approved ?? 0)}
            icon={<FaCheckCircle className="text-emerald-500" size={24} />}
            color="bg-emerald-50"
            to="/trade-approved"
            subtitle="Total approved trades"
          />
          <StatCard
            title="Unapproved"
            data={tradeMetrics.unapproved ?? (tradeMetrics.trades?.pending ?? 0)}
            icon={<FaHourglassHalf className="text-blue-500" size={24} />}
            color="bg-blue-50"
            to="/trade-approval"
            subtitle="Trades awaiting approval"
          />
        </div>

        {/* Inventory Stock Export Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Inventory Stock Summary</h3>
            <p className="text-sm text-gray-500 mt-0.5">Export and download the full inventory stock summary report in Excel format</p>
          </div>
          <button
            onClick={downloadInventoryExcel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all duration-200"
          >
            <FaDownload size={12} />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, data, icon, color, to, toApproved, toPending, subtitle }) {
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
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2 font-normal">{subtitle}</p>
        )}
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