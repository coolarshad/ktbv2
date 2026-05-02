import React, { useState } from 'react';
import { FaUser, FaCaretDown, FaBars } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

export default function Topbar({ onToggleSidebar }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm flex-shrink-0">
      <div className="flex items-center">
        {/* Optional hamburger menu for mobile if we implement it later */}
        <button className="lg:hidden mr-4 text-gray-500 hover:text-gray-700" onClick={onToggleSidebar}>
          <FaBars size={20} />
        </button>
        {/* Placeholder for Breadcrumbs or Page Title */}
        <span className="text-gray-500 font-medium text-sm hidden md:block">Welcome to KTB V2 Enterprise Dashboard</span>
      </div>

      <div className="flex items-center space-x-6">
        <NotificationBell />
        
        <div className="relative">
          <button 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <FaUser size={14} />
            </div>
            <span className="text-gray-700 font-medium text-sm">Admin User</span>
            <FaCaretDown size={14} className="text-gray-400" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">Settings</a>
              <div className="border-t border-gray-100 my-1"></div>
              <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
