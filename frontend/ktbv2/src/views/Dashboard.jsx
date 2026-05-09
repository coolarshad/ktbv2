import React, { useState, useEffect } from 'react';
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
  FaBox
} from 'react-icons/fa';

export default function Dashboard() {
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

  if (loading) {
    return (
      <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-10"></div>

          <div className="h-8 bg-gray-200 rounded w-1/6 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
  const tradeRecent = data?.trade_management?.recent_trades || [];
  const presaleRecent = data?.trade_management?.recent_presales || [];

  const costMetrics = data?.cost_management?.metrics || {};
  const productRecent = data?.cost_management?.recent_products || [];
  const consumptionRecent = data?.cost_management?.recent_consumptions || [];

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">KTB 2 Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
            <FaBell className="text-red-500 mr-2" />
            <span className="font-semibold mr-1">{data?.general?.unread_notifications || 0}</span> Unread Alerts
          </div>
          {/* <div className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-full shadow-sm">
            Live Data Active
          </div> */}
        </div>
      </div>

      {/* SECTION 1: TRADE MANAGEMENT */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-gray-800">Trade Management</h2>
        </div>

        {/* Trade KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Trades"
            data={tradeMetrics.trades || 0}
            icon={<FaChartLine className="text-blue-500" size={24} />}
            color="bg-blue-50"
          />
          <StatCard
            title="Pre-Sales"
            data={tradeMetrics.presales || 0}
            icon={<FaClipboardList className="text-indigo-500" size={24} />}
            color="bg-indigo-50"
          />
          <StatCard
            title="Sales Purchases"
            data={tradeMetrics.sales_purchases || 0}
            icon={<FaFileInvoiceDollar className="text-teal-500" size={24} />}
            color="bg-teal-50"
          />
          <StatCard
            title="Payment Finance"
            data={tradeMetrics.payment_finance || 0}
            icon={<FaMoneyCheckAlt className="text-emerald-500" size={24} />}
            color="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Trades Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800">Recent Trades</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium">TRN</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Company</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeRecent.map((trade, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">{trade.trn}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${trade.trade_type === 'Sales' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {trade.trade_type}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{trade.company}</td>
                      <td className="p-4 text-gray-500 text-sm">{trade.trd}</td>
                      <td className="p-4">
                        {trade.approved ?
                          <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Approved</span> :
                          <span className="flex items-center text-orange-500 text-sm"><FaClock className="mr-1" /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {tradeRecent.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No recent trades found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent PreSales Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800">Recent Pre-Sales</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">TRN Reference</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {presaleRecent.map((presale, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-indigo-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">#{presale.id}</td>
                      <td className="p-4 text-gray-600">{presale.trn__trn}</td>
                      <td className="p-4 text-gray-500 text-sm">{presale.date}</td>
                      <td className="p-4">
                        {presale.approved ?
                          <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Approved</span> :
                          <span className="flex items-center text-orange-500 text-sm"><FaClock className="mr-1" /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {presaleRecent.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">No recent pre-sales found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
          />
          <StatCard
            title="Consumptions"
            data={costMetrics.consumptions || 0}
            icon={<FaBox className="text-pink-500" size={24} />}
            color="bg-pink-50"
          />
          <StatCard
            title="Additives"
            data={costMetrics.additives || 0}
            icon={<FaFlask className="text-green-500" size={24} />}
            color="bg-green-50"
          />
          <StatCard
            title="Raw Materials"
            data={costMetrics.raw_materials || 0}
            icon={<FaVial className="text-amber-500" size={24} />}
            color="bg-amber-50"
          />
          <StatCard
            title="Packings"
            data={costMetrics.packings || 0}
            icon={<FaBox className="text-orange-500" size={24} />}
            color="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Final Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800">Recent Final Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Total Qty</th>
                    <th className="p-4 font-medium">Total CFR</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productRecent.map((activity, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">#{activity.id}</td>
                      <td className="p-4 text-gray-500 text-sm">{activity.date}</td>
                      <td className="p-4 text-gray-600">{activity.total_qty}</td>
                      <td className="p-4 text-gray-800 font-medium">${activity.total_cfr_pricing}</td>
                      <td className="p-4">
                        {activity.approved ?
                          <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Approved</span> :
                          <span className="flex items-center text-orange-500 text-sm"><FaClock className="mr-1" /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {productRecent.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No recent final products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Consumptions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800">Recent Consumptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Reference</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionRecent.map((cons, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-pink-50 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">#{cons.id}</td>
                      <td className="p-4 text-gray-600">{cons.ref}</td>
                      <td className="p-4 text-gray-500 text-sm">{cons.date}</td>
                      <td className="p-4">
                        {cons.approved ?
                          <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Approved</span> :
                          <span className="flex items-center text-orange-500 text-sm"><FaClock className="mr-1" /> Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {consumptionRecent.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">No recent consumptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function StatCard({ title, data, icon, color }) {
  const value = typeof data === 'object' ? data.total : data;
  const approved = typeof data === 'object' ? data.approved : null;
  const pending = typeof data === 'object' ? data.pending : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        {approved !== null && (
          <div className="flex items-center space-x-3 mt-2 text-xs font-medium">
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{approved} Appr</span>
            <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{pending} Pend</span>
          </div>
        )}
      </div>
    </div>
  );
}