import React from 'react';

const PrintModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
      <div className="bg-white p-5 rounded shadow-lg relative z-10 max-w-lg w-full">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 font-bold text-lg"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default PrintModal;