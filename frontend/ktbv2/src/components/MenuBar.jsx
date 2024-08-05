// src/components/MenuBar.js
import React, { useState } from 'react';
import { FaBars, FaTimes, FaBell, FaUser, FaEnvelope, FaCaretDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div>
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <div className="cursor-pointer" onClick={toggleMenu}>
            <FaBars size={24} />
          </div>
          <span className="text-lg font-bold">MyApp</span>
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
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white border border-gray-700 rounded-lg shadow-lg">
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Profile</Link>
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
                <Link to="#" className="block px-4 py-2 hover:bg-gray-700">Logout</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-4 transition-transform duration-300 ${isOpen ? 'transform translate-x-0' : 'transform -translate-x-full'} w-1/5 z-50`}>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-end">
            <FaTimes size={24} className="cursor-pointer" onClick={toggleMenu} />
          </div>
          <Link to="/" className="hover:text-gray-400">Home</Link>
          <Link to="/trade-approval" className="hover:text-gray-400">Trade Approval</Link>
          <Link to="/trade-approved" className="hover:text-gray-400">Trade Approved</Link>
          <Link to="/pre-sale-purchase" className="hover:text-gray-400">Pre-Sale Purchase</Link>
          <Link to="/pre-payment" className="hover:text-gray-400">Pre Payment</Link>
          <Link to="/sales-purchases" className="hover:text-gray-400">Sales Purchases</Link>
          <Link to="/payment-finance" className="hover:text-gray-400">Payment Finance</Link>
          <Link to="/pl" className="hover:text-gray-400">PL</Link>
         
          <Link to="/payment-term-form" className="hover:text-gray-400">Payment Term Form</Link>
          <Link to="/documents-required-form" className="hover:text-gray-400">Documents Required Form</Link>
        
          
        
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
