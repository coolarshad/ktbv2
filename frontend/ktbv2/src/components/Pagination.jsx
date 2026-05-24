import React from 'react';
import { useAuth } from '../context/AuthContext';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const { user } = useAuth();
  const pageNumbers = [];
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Limit visible page buttons
  const getVisiblePages = () => {
    if (totalPages <= 7) return pageNumbers;
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    let pages = [];
    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4 mb-4">
      <nav>
        <ul className="flex list-none border border-gray-300 rounded-md bg-white">
          <li>
             <button 
               onClick={() => currentPage > 1 && paginate(currentPage - 1)}
               disabled={currentPage === 1}
               className={`px-3 py-1 border-r border-gray-300 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-gray-100'}`}
             >
               Previous
             </button>
          </li>
          {getVisiblePages().map((number, index) => (
            <li key={index}>
              {number === '...' ? (
                 <span className="px-3 py-1 border-r border-gray-300 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 border-r border-gray-300 ${currentPage === number ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'}`}
                >
                  {number}
                </button>
              )}
            </li>
          ))}
          <li>
             <button 
               onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
               disabled={currentPage === totalPages}
               className={`px-3 py-1 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-gray-100'}`}
             >
               Next
             </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
