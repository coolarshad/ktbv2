import React from 'react';

const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-black opacity-50 absolute inset-0" onClick={onClose}></div>
      <div className={`bg-white p-5 rounded shadow-lg relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
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

export default Modal;