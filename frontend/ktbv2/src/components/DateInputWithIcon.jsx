import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from 'react-icons/fa';

const DateInputWithIcon = ({ formData, handleChange, validationErrors, fieldName, label, block = false, inner='', index='' }) => {
  const [isCalendarVisible, setCalendarVisible] = useState(false); // State to track visibility of the calendar
  const calendarRef = useRef(null); // Ref to detect outside click

  const handleDateChange = (date) => {
    // Format the selected date as dd/mm/yyyy
    const formattedDate = date
      ? `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
      : "";
    handleChange({ target: { name: fieldName, value: formattedDate } });
    setCalendarVisible(false); // Hide calendar after selecting a date
  };

  // Close the calendar if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarVisible(false); // Close calendar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center">
        <input
          id={fieldName}
          name={fieldName}
          type="text"
          value={formData[fieldName]}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full pr-10" // Added padding-right for space for the calendar icon
          readOnly={block} // Make input read-only if block is true
        />
        
        {/* Calendar Icon */}
        {!block && (
          <div
            className="absolute right-2 cursor-pointer text-red-500" // Red icon color
            onClick={() => setCalendarVisible(!isCalendarVisible)} // Toggle calendar visibility
          >
            <FaCalendarAlt className="w-6 h-6" />  {/* FontAwesome calendar icon */}
          </div>
        )}
      </div>
      
      {/* Show calendar if visible */}
       {isCalendarVisible && !block && (
        <div
          ref={calendarRef} // Attach ref to the calendar container
          className="absolute z-10 mt-2"
        >
          <DatePicker
           
            onChange={handleDateChange}
            className="border border-gray-300 p-2 rounded"
            inline
          />
        </div>
      )}

      {inner === ''
        ? validationErrors?.[fieldName] && (
          <p className="text-red-500">{validationErrors[fieldName]}</p>
        )
        : validationErrors?.[`${inner}[${index}].${fieldName}`] && (
          <p className="text-red-500">
            {validationErrors[`${inner}[${index}].${fieldName}`]}
          </p>
        )}
      
    </div>
  );
};

export default DateInputWithIcon;
