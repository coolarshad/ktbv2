import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaBell, FaUser, FaEnvelope, FaCaretDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest('.menu-toggle')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // For mobile support

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      <div className="flex items-center justify-between p-2 bg-red-700 text-white">
        <div className="flex items-center space-x-4">
          <div className="cursor-pointer" onClick={toggleMenu}>
            <FaBars size={24} />
          </div>
          <span className="text-lg font-bold">KTB V2</span>
        </div>
        <div className="flex items-center space-x-8">
          <FaBell size={24} className="cursor-pointer" />
          <FaEnvelope size={24} className="cursor-pointer" />
          <div className="relative">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <FaUser size={24} />
              <span>Username</span>
              <FaCaretDown size={16} />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-red-700 text-white border border-gray-700 rounded-lg shadow-lg">
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Profile</Link>
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Logout</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div ref={menuRef} className={`fixed top-0 left-0 h-full bg-red-700 text-white p-4 transition-transform duration-300 ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} w-1/7 z-50 overflow-y-auto`}>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <FaTimes size={24} className="cursor-pointer" onClick={toggleMenu} />
          </div>

          {/* Section 1: Dashboard & Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Dashboard & Overview</h3>
            <Link to="/" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
            
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Profiles</h3>
            <Link to="/kyc" className="block px-4 py-2 hover:bg-gray-700">KYC</Link>
            <Link to="/company" className="block px-4 py-2 hover:bg-gray-700">Company</Link>
            <Link to="/payment-term-form" className="block px-4 py-2 hover:bg-gray-700">Payment Term Form</Link>
            <Link to="/bank" className="block px-4 py-2 hover:bg-gray-700">Bank</Link>
            <Link to="/units" className="block px-4 py-2 hover:bg-gray-700">Units</Link>
            <Link to="/documents-required-form" className="block px-4 py-2 hover:bg-gray-700">Documents Required Form</Link>
            <Link to="/products-name" className="block px-4 py-2 hover:bg-gray-700">Product Name</Link>
            <Link to="/shipments-size" className="block px-4 py-2 hover:bg-gray-700">Shipment Size</Link>
            <Link to="/currency" className="block px-4 py-2 hover:bg-gray-700">Currency</Link>
            <Link to="/trade-packings" className="block px-4 py-2 hover:bg-gray-700">Packings</Link>
          </div>

          {/* Section 2: Trade Management */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Trade Management</h3>
            <Link to="/trade-approval" className="block px-4 py-2 hover:bg-gray-700">Trade Approval</Link>
            <Link to="/trade-approved" className="block px-4 py-2 hover:bg-gray-700">Trade Approved</Link>
            <Link to="/pre-sale-purchase" className="block px-4 py-2 hover:bg-gray-700">Pre-Sale Purchase</Link>
            <Link to="/pre-payment" className="block px-4 py-2 hover:bg-gray-700">Pre Payment</Link>
            <Link to="/sales-purchases" className="block px-4 py-2 hover:bg-gray-700">Sales Purchases</Link>
            <Link to="/payment-finance" className="block px-4 py-2 hover:bg-gray-700">Payment Finance</Link>
            <Link to="/pl" className="block px-4 py-2 hover:bg-gray-700">PL</Link>
          </div>

          {/* Section 6: Miscellaneous */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Trade Report</h3>
            <Link to="/trade-report" className="block px-4 py-2 hover:bg-gray-700">Report</Link>
            <Link to="/inventory" className="block px-4 py-2 hover:bg-gray-700">Inventory</Link>
            <Link to="/sales-pending" className="block px-4 py-2 hover:bg-gray-700">Sales Pending</Link>
            <Link to="/purchase-pending" className="block px-4 py-2 hover:bg-gray-700">Purchase Pending</Link>
            <Link to="/sales-product-trace" className="block px-4 py-2 hover:bg-gray-700">Sales Product Trace</Link>
            <Link to="/purchase-product-trace" className="block px-4 py-2 hover:bg-gray-700">Purchase Product Trace</Link>
            <Link to="/product-ref" className="block px-4 py-2 hover:bg-gray-700">Product Reference</Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Cost Management</h3>
            
            <Link to="/packings" className="block px-4 py-2 hover:bg-gray-700">Packings</Link>
            <Link to="/raw-materials" className="block px-4 py-2 hover:bg-gray-700">Raw Materials</Link>
            <Link to="/additives" className="block px-4 py-2 hover:bg-gray-700">Additives</Link>
            <Link to="/consumptions" className="block px-4 py-2 hover:bg-gray-700">Consumption</Link>
            <Link to="/final-products" className="block px-4 py-2 hover:bg-gray-700">Final Product Cost</Link>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
