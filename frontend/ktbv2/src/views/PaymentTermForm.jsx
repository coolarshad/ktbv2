import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const PaymentTermForm = ({ mode = 'add', paymentTermId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    advance_in_percentage: '',
    advance_within: '',
    payment_within: ''
  });

  const [paymentTerms, setPaymentTerms] = useState([]);

  useEffect(() => {
    if (mode === 'update' && paymentTermId) {
      // Fetch the existing payment term data from the API
      axios.get(`/trademgt/payment-terms/${paymentTermId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the payment term data!', error);
        });
    }

    // Fetch all payment terms
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
  }, [mode, paymentTermId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add') {
      // Post new payment term data to API
      axios.post('/trademgt/payment-terms/', formData)
        .then(response => {
          console.log('Payment term added successfully!', response.data);
          setPaymentTerms(prevTerms => [...prevTerms, response.data]);
        })
        .catch(error => {
          console.error('There was an error adding the payment term!', error);
        });
    } else if (mode === 'update') {
      // Put updated payment term data to API
      axios.put(`/trademgt/payment-terms/${paymentTermId}`, formData)
        .then(response => {
          console.log('Payment term updated successfully!', response.data);
          setPaymentTerms(prevTerms => prevTerms.map(term => term.id === response.data.id ? response.data : term));
        })
        .catch(error => {
          console.error('There was an error updating the payment term!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/payment-terms/${id}`)
      .then(() => {
        console.log('Payment term deleted successfully!');
        setPaymentTerms(prevTerms => prevTerms.filter(term => term.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the payment term!', error);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="number"
            name="advance_in_percentage"
            value={formData.advance_in_percentage}
            onChange={handleChange}
            placeholder="Advance in Percentage"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="number"
            name="advance_within"
            value={formData.advance_within}
            onChange={handleChange}
            placeholder="Advance Within (Days)"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="number"
            name="payment_within"
            value={formData.payment_within}
            onChange={handleChange}
            placeholder="Payment Within (Days)"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {mode === 'add' ? 'Add Payment Term' : 'Update Payment Term'}
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
                <p>Advance Within: {term.advance_within} Days</p>
                <p>Payment Within: {term.payment_within} Days</p>
              </div>
              <button
                onClick={() => handleDelete(term.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentTermForm;
