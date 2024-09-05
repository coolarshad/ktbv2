import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Bank = ({ mode = 'add', bankId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    swift_code: '',
  });

  const [banks, setBanks] = useState([]);
  const [isUpdateMode, setIsUpdateMode] = useState(mode === 'update');
  const [selectedBankId, setSelectedBankId] = useState(bankId);

  useEffect(() => {
    if (isUpdateMode && selectedBankId) {
      // Fetch the specific bank data when updating
      axios.get(`/trademgt/bank/${selectedBankId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the bank data!', error);
        });
    }

    // Fetch all banks
    fetchBanks();
  }, [isUpdateMode, selectedBankId]);

  const fetchBanks = () => {
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isUpdateMode) {
      // Post new bank data to API
      axios.post('/trademgt/bank/', formData)
        .then(response => {
          console.log('Bank added successfully!', response.data);
          setBanks(prevData => [...prevData, response.data]);
          setFormData({ name: '', account_number: '', swift_code: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the bank!', error);
        });
    } else {
      // Put updated bank data to API
      axios.put(`/trademgt/bank/${selectedBankId}/`, formData)
        .then(response => {
          console.log('Bank updated successfully!', response.data);
          setBanks(prevData => prevData.map(bank => bank.id === response.data.id ? response.data : bank));
          setIsUpdateMode(false);
          setFormData({ name: '', account_number: '', swift_code: '' }); // Reset form after update
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
        setBanks(prevBanks => prevBanks.filter(bank => bank.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the bank!', error);
      });
  };

  const handleUpdate = (id) => {
    setSelectedBankId(id);
    setIsUpdateMode(true);
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
            placeholder="Account Number"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <input
            type="text"
            name="swift_code"
            value={formData.swift_code}
            onChange={handleChange}
            placeholder="Swift Code"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isUpdateMode ? 'Update Bank' : 'Add Bank'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Banks */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Banks</h2>
        <ul className="space-y-4">
          {banks.map(bank => (
            <li key={bank.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{bank.name}</h3>
                <p>Account Number: {bank.account_number}</p>
                <p>Swift Code: {bank.swift_code}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(bank.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(bank.id)}
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

export default Bank;
