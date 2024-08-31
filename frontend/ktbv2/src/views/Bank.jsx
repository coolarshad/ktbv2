import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Bank = ({ mode = 'add', bankId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    swift_code: '',
  });

  const [banks, setBanks] = useState([]);

  useEffect(() => {
    if (mode === 'update' && bankId) {
      // Fetch the existing payment term data from the API
      axios.get(`/trademgt/bank/${bankId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the bank data!', error);
        });
    }

    // Fetch all payment terms
    axios.get('/trademgt/bank')
      .then(response => {
        const terms = response.data;
        if (Array.isArray(terms)) {
          setBanks(terms);
        } else {
          console.error('Expected an array but got:', terms);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the banks!', error);
      });
  }, [mode, bankId]);

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
      axios.post('/trademgt/bank/', formData)
        .then(response => {
          console.log('Bank added successfully!', response.data);
          setBanks(prevData => [...prevData, response.data]);
        })
        .catch(error => {
          console.error('There was an error adding the bank!', error);
        });
    } else if (mode === 'update') {
      // Put updated payment term data to API
      axios.put(`/trademgt/bank/${bankId}`, formData)
        .then(response => {
          console.log('Bank updated successfully!', response.data);
          setBanks(prevData => prevData.map(bank => bank.id === response.data.id ? response.data : bank));
        })
        .catch(error => {
          console.error('There was an error updating the bank!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/bank/${id}`)
      .then(() => {
        console.log('Bank deleted successfully!');
        setBanks(prevTerms => prevTerms.filter(term => term.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the banks!', error);
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
            type="text"
            name="account_number"
            value={formData.account_number}
            onChange={handleChange}
            placeholder="account number"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="text"
            name="swift_code"
            value={formData.swift_code}
            onChange={handleChange}
            placeholder="swift code"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {mode === 'add' ? 'Add Bank' : 'Update Bank'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Payment Terms */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Banks</h2>
        <ul className="space-y-4">
          {banks.map(bank => (
            <li key={bank.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{bank.name}</h3>
                <p>Account Number: {bank.account_number}</p>
                <p>Swift Code: {bank.swift_code} Days</p>
              </div>
              <button
                onClick={() => handleDelete(bank.id)}
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

export default Bank;
