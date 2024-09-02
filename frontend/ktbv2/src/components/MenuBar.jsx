// src/components/MenuBar.js
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
      <div className="flex items-center justify-between p-2 bg-red-700	 text-white">
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
      <div ref={menuRef} className={`fixed top-0 left-0 h-full bg-red-700 text-white p-4 transition-transform duration-300 ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} w-1/7 z-50`}>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <FaTimes size={24} className="cursor-pointer" onClick={toggleMenu} />
          </div>
          <Link to="/" className="hover:text-gray-400">Dashboard</Link>
          <Link to="/kyc" className="hover:text-gray-400">KYC</Link>
          <Link to="/trade-approval" className="hover:text-gray-400">Trade Approval</Link>
          <Link to="/trade-approved" className="hover:text-gray-400">Trade Approved</Link>
          <Link to="/pre-sale-purchase" className="hover:text-gray-400">Pre-Sale Purchase</Link>
          <Link to="/pre-payment" className="hover:text-gray-400">Pre Payment</Link>
          <Link to="/sales-purchases" className="hover:text-gray-400">Sales Purchases</Link>
          <Link to="/payment-finance" className="hover:text-gray-400">Payment Finance</Link>
          <Link to="/pl" className="hover:text-gray-400">PL</Link>
         
          <Link to="/payment-term-form" className="hover:text-gray-400">Payment Term Form</Link>
          <Link to="/documents-required-form" className="hover:text-gray-400">Documents Required Form</Link>
          <Link to="/company" className="hover:text-gray-400">Company</Link>
          <Link to="/bank" className="hover:text-gray-400">Bank</Link>
          <Link to="/units" className="hover:text-gray-400">Units</Link>
          <Link to="/sales-pending" className="hover:text-gray-400">Sales Pending</Link>
          <Link to="/purchase-pending" className="hover:text-gray-400">Purchase Pending</Link>
          <Link to="/sales-product-trace" className="hover:text-gray-400">Sales Product Trace</Link>
          <Link to="/purchase-product-trace" className="hover:text-gray-400">Purchase Product Trace</Link>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
