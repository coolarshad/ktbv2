import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
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
      { name: 'Users', path: '/users', perm: 'view_users' },
      { name: 'Logs', path: '/logs', perm: 'view_logs' },
      { name: 'Audit Log', path: '/audit-log', perm: 'view_audit_log' }
    ]
  },
  {
    title: 'Profiles',
    icon: <FaIdCard />,
    links: [
      { name: 'KYC', path: '/kyc', perm: 'view_kyc' },
      { name: 'Company', path: '/company', perm: 'view_company' },
      { name: 'Payment Term Form', path: '/payment-term-form', perm: 'view_payment_term_form' },
      { name: 'Bank', path: '/bank', perm: 'view_bank' },
      { name: 'Units', path: '/units', perm: 'view_units' },
      { name: 'Documents Required', path: '/documents-required-form', perm: 'view_documents_required_form' },
      { name: 'Product Name', path: '/products-name', perm: 'view_product_name' },
      { name: 'Shipment Size', path: '/shipments-size', perm: 'view_shipment_size' },
      { name: 'Currency', path: '/currency', perm: 'view_currency' },
      { name: 'Packings', path: '/trade-packings', perm: 'view_packings' },
    ]
  },
  {
    title: 'Trade Management',
    icon: <FaChartLine />,
    links: [
      { name: 'Trade Approval', path: '/trade-approval', perm: 'view_trade_approval' },
      { name: 'Trade Approved', path: '/trade-approved', perm: 'view_trade_approved' },
      { name: 'Pre-Sale Purchase', path: '/pre-sale-purchase', perm: 'view_pre_sale_purchase' },
      { name: 'Pre Payment', path: '/pre-payment', perm: 'view_pre_payment' },
      { name: 'Sales Purchases', path: '/sales-purchases', perm: 'view_sales_purchases' },
      { name: 'Payment Finance', path: '/payment-finance', perm: 'view_payment_finance' },
      { name: 'PL', path: '/pl', perm: 'view_pl' },
    ]
  },
  {
    title: 'Trade Report',
    icon: <FaFileInvoiceDollar />,
    links: [
      { name: 'Report', path: '/trade-report', perm: 'view_report' },
      { name: 'Inventory', path: '/inventory', perm: 'view_inventory' },
      { name: 'Sales Pending', path: '/sales-pending', perm: 'view_sales_pending' },
      { name: 'Purchase Pending', path: '/purchase-pending', perm: 'view_purchase_pending' },
      { name: 'Sales Product Trace', path: '/sales-product-trace', perm: 'view_sales_product_trace' },
      { name: 'Purchase Product Trace', path: '/purchase-product-trace', perm: 'view_purchase_product_trace' },
      { name: 'Product Reference', path: '/product-ref', perm: 'view_product_reference' },
    ]
  },
  {
    title: 'Cost Management',
    icon: <FaCalculator />,
    links: [
      { name: 'Packing Size', path: '/packing-size', perm: 'view_packing_size' },
      { name: 'Packing Type List', path: '/packingtype', perm: 'view_packing_type_list' },
      { name: 'Packing Price', path: '/packings', perm: 'view_packing_price' },
      { name: 'Raw Material Category', path: '/raw-categories', perm: 'view_raw_material_category' },
      { name: 'Raw Material Pricing', path: '/raw-materials', perm: 'view_raw_material_pricing' },
      { name: 'Additives Category', path: '/additive-categories', perm: 'view_additives_pricing_category' },
      { name: 'Additive Pricing', path: '/additives', perm: 'view_additive_pricing' },
      { name: 'Blending Formulation', path: '/consumption-formula', perm: 'view_blending_formulation' },
      { name: 'Consumption', path: '/consumptions', perm: 'view_consumption' },
      { name: 'Packing Formulation', path: '/product-formula', perm: 'view_packing_formulation' },
      { name: 'Final Product Cost', path: '/final-products', perm: 'view_final_product_cost' },
      { name: 'Packing Cons Report', path: '/packing-consumptions', perm: 'view_packing_consumption_report' },
      { name: 'Additive Cons Report', path: '/additive-consumptions', perm: 'view_additive_consumption_report' },
      { name: 'Raw Material Cons Report', path: '/raw-consumptions', perm: 'view_raw_material_consumption_report' },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
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
          {NAV_ITEMS.filter(section => section.links.some(link => !link.perm || hasPermission(user, link.perm))).map((section) => (
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
                  {section.links.filter(link => !link.perm || hasPermission(user, link.perm)).map(link => {
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
