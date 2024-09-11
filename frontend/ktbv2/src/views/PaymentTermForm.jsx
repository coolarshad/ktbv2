import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const PaymentTermForm = ({ mode = 'add', paymentTermId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    advance_in_percentage: '',
    advance_within: '',
    advance_from: '',
    payment_within: '',
    payment_from: '',
  });

  const [paymentTerms, setPaymentTerms] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentPaymentTermId, setCurrentPaymentTermId] = useState(paymentTermId);

  useEffect(() => {
    if (currentMode === 'update' && currentPaymentTermId) {
      axios.get(`/trademgt/payment-terms/${currentPaymentTermId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the payment term data!', error);
        });
    }

    axios.get('/trademgt/payment-terms')
      .then(response => {
        const terms = response.data;
        if (Array.isArray(terms)) {
          setPaymentTerms(terms);
        } else {
          console.error('Expected an array but got:', terms);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the payment terms!', error);
      });
  }, [currentMode, currentPaymentTermId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'add') {
      axios.post('/trademgt/payment-terms/', formData)
        .then(response => {
          setPaymentTerms(prevTerms => [...prevTerms, response.data]);
          setFormData({
            name: '',
            advance_in_percentage: '',
            advance_within: '',
            advance_from: '',
            payment_within: '',
            payment_from: '',
          }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the payment term!', error);
        });
    } else if (currentMode === 'update' && currentPaymentTermId) {
      axios.put(`/trademgt/payment-terms/${currentPaymentTermId}/`, formData)
        .then(response => {
          setPaymentTerms(prevTerms => prevTerms.map(term => term.id === response.data.id ? response.data : term));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentPaymentTermId(null);  // Reset currentPaymentTermId
          setFormData({
            name: '',
            advance_in_percentage: '',
            advance_within: '',
            advance_from: '',
            payment_within: '',
            payment_from: '',
          }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the payment term!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/payment-terms/${id}`)
      .then(() => {
        setPaymentTerms(prevTerms => prevTerms.filter(term => term.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the payment term!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentPaymentTermId(id);
    setFormData(paymentTerms.find(term => term.id === id) || {
      name: '',
      advance_in_percentage: '',
      advance_within: '',
      advance_from: '',
      payment_within: '',
      payment_from: '',
    });
  };

  const advanceWithinOptions = [
    { value: 'PERFORMA INVOICE DATE' },
    { value: 'PURCHASE ORDER DATE' },

  ];
  const paymentWithinOptions = [
    { value: 'BL DATE' },
    { value: 'SALES BILL DATE' },
    { value: 'PURCHASE BILL DATE' },
  ];
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
        <div className="grid grid-cols-1 gap-2  p-4">
          <div>
            <label htmlFor="advance_within" className="block text-sm font-medium text-gray-700">
              Payment Term Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="advance_within" className="block text-sm font-medium text-gray-700">
              Advance (%)
            </label>
            <input
              type="number"
              name="advance_in_percentage"
              value={formData.advance_in_percentage}
              onChange={handleChange}
              placeholder="Advance in Percentage"
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="advance_within" className="block text-sm font-medium text-gray-700">
              Advance Within (days)
            </label>
            <input
              type="number"
              name="advance_within"
              value={formData.advance_within}
              onChange={handleChange}
              placeholder="Advance Within (Days)"
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="advance_from" className="block text-sm font-medium text-gray-700">
              Advance From
            </label>
            <select
              name="advance_from"
              value={formData.advance_from}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            >
              <option value="" disabled>Select ---</option>
              {advanceWithinOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="advance_within" className="block text-sm font-medium text-gray-700">
              Payment Within (days)
            </label>
            <input
              type="number"
              name="payment_within"
              value={formData.payment_within}
              onChange={handleChange}
              placeholder="Payment Within (Days)"
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="payment_from" className="block text-sm font-medium text-gray-700">
              Payment From
            </label>
            <select
              name="payment_from"
              value={formData.payment_from}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            >
              <option value="" disabled>Select ---</option>
              {paymentWithinOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value}
                </option>
              ))}
            </select>
          </div>


          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Payment Term' : 'Update Payment Term'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Payment Terms */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Payment Terms</h2>
        <ul className="space-y-4">
          {paymentTerms.map(term => (
            <li key={term.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{term.name}</h3>
                <p>Advance in Percentage: {term.advance_in_percentage}%</p>
                <div className="grid grid-cols-2">
                  <p>Advance Within: {term.advance_within} Days</p>
                  <p className='ml-10'>Advance From: {term.advance_from}</p>
                  <p>Payment Within: {term.payment_within} Days</p>
                  <p className='ml-10'>Payment From: {term.payment_from}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(term.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(term.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentTermForm;
