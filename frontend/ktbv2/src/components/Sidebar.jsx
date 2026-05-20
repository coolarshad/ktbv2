import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUserFriends, 
  FaIdCard, 
  FaChartLine, 
  FaFileInvoiceDollar, 
  FaCalculator, 
  FaChevronDown, 
  FaChevronRight,
  FaCubes,
  FaShieldAlt,
  FaBoxes
} from 'react-icons/fa';

const NAV_ITEMS = [
  {
    title: 'Dashboard & Overview',
    icon: <FaTachometerAlt />,
    links: [
      { name: 'Dashboard', path: '/' },
      { name: 'Users', path: '/users' },
      { name: 'Logs', path: '/logs' },
      { name: 'Audit Log', path: '/audit-log' }
    ]
  },
  {
    title: 'Profiles',
    icon: <FaIdCard />,
    links: [
      { name: 'KYC', path: '/kyc' },
      { name: 'Company', path: '/company' },
      { name: 'Payment Term Form', path: '/payment-term-form' },
      { name: 'Bank', path: '/bank' },
      { name: 'Units', path: '/units' },
      { name: 'Documents Required', path: '/documents-required-form' },
      { name: 'Product Name', path: '/products-name' },
      { name: 'Shipment Size', path: '/shipments-size' },
      { name: 'Currency', path: '/currency' },
      { name: 'Packings', path: '/trade-packings' },
    ]
  },
  {
    title: 'Trade Management',
    icon: <FaChartLine />,
    links: [
      { name: 'Trade Approval', path: '/trade-approval' },
      { name: 'Trade Approved', path: '/trade-approved' },
      { name: 'Pre-Sale Purchase', path: '/pre-sale-purchase' },
      { name: 'Pre Payment', path: '/pre-payment' },
      { name: 'Sales Purchases', path: '/sales-purchases' },
      { name: 'Payment Finance', path: '/payment-finance' },
      { name: 'PL', path: '/pl' },
    ]
  },
  {
    title: 'Trade Report',
    icon: <FaFileInvoiceDollar />,
    links: [
      { name: 'Report', path: '/trade-report' },
      { name: 'Inventory', path: '/inventory' },
      { name: 'Sales Pending', path: '/sales-pending' },
      { name: 'Purchase Pending', path: '/purchase-pending' },
      { name: 'Sales Product Trace', path: '/sales-product-trace' },
      { name: 'Purchase Product Trace', path: '/purchase-product-trace' },
      { name: 'Product Reference', path: '/product-ref' },
    ]
  },
  {
    title: 'Cost Management',
    icon: <FaCalculator />,
    links: [
      { name: 'Packing Size', path: '/packing-size' },
      { name: 'Packing Type List', path: '/packingtype' },
      { name: 'Packing Price', path: '/packings' },
      { name: 'Raw Material Category', path: '/raw-categories' },
      { name: 'Raw Material Pricing', path: '/raw-materials' },
      { name: 'Additives Category', path: '/additive-categories' },
      { name: 'Additive Pricing', path: '/additives' },
      { name: 'Blending Formulation', path: '/consumption-formula' },
      { name: 'Consumption', path: '/consumptions' },
      { name: 'Packing Formulation', path: '/product-formula' },
      { name: 'Final Product Cost', path: '/final-products' },
      { name: 'Packing Cons Report', path: '/packing-consumptions' },
      { name: 'Additive Cons Report', path: '/additive-consumptions' },
      { name: 'Raw Material Cons Report', path: '/raw-consumptions' },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    'Dashboard & Overview': true, // Keep first open by default
  });

  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col shadow-xl flex-shrink-0 z-20">
      <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
        <FaShieldAlt className="text-blue-500 mr-3" size={24} />
        <span className="text-xl font-bold text-white tracking-wider">KTB V2</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="px-4 space-y-2">
          {NAV_ITEMS.map((section) => (
            <div key={section.title} className="mb-2">
              <button 
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className={`${openSections[section.title] ? 'text-blue-400' : 'text-slate-400'} group-hover:text-blue-400 transition-colors`}>
                    {section.icon}
                  </span>
                  <span className={`font-semibold text-sm ${openSections[section.title] ? 'text-white' : 'text-slate-300'} group-hover:text-white transition-colors`}>
                    {section.title}
                  </span>
                </div>
                {openSections[section.title] ? 
                  <FaChevronDown size={12} className="text-slate-500" /> : 
                  <FaChevronRight size={12} className="text-slate-500" />
                }
              </button>

              {openSections[section.title] && (
                <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                  {section.links.map(link => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link 
                        key={link.path} 
                        to={link.path}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive 
                            ? 'bg-blue-600/20 text-blue-400 font-medium' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
