import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Company = ({ mode = 'add', companyId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    initial: '',
  });

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (mode === 'update' && companyId) {
      // Fetch the existing payment term data from the API
      axios.get(`/trademgt/company/${companyId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the company data!', error);
        });
    }

    // Fetch all payment terms
    axios.get('/trademgt/company')
      .then(response => {
        const companies = response.data;
        if (Array.isArray(companies)) {
            setCompanies(companies);
        } else {
          console.error('Expected an array but got:', companies);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the companies!', error);
      });
  }, [mode, companyId]);

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
      axios.post('/trademgt/company/', formData)
        .then(response => {
          console.log('Company added successfully!', response.data);
          setCompanies(prevData => [...prevData, response.data]);
        })
        .catch(error => {
          console.error('There was an error adding the company!', error);
        });
    } else if (mode === 'update') {
      // Put updated payment term data to API
      axios.put(`/trademgt/company/${companyId}`, formData)
        .then(response => {
          console.log('Company updated successfully!', response.data);
          setCompanies(prevData => prevData.map(company => company.id === response.data.id ? response.data : company));
        })
        .catch(error => {
          console.error('There was an error updating the company!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/company/${id}`)
      .then(() => {
        console.log('Company deleted successfully!');
        setCompanies(prevData => prevData.filter(company => company.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the Company!', error);
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
            name="initial"
            value={formData.initial}
            onChange={handleChange}
            placeholder="Initial"
            className="border border-gray-300 p-2 rounded w-full"
          />
          
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {mode === 'add' ? 'Add Company' : 'Update Company'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Payment Terms */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Company</h2>
        <ul className="space-y-4">
          {companies.map(company => (
            <li key={company.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{company.name}</h3>
                <p>Initials: {company.initial}</p>
              </div>
              <button
                onClick={() => handleDelete(company.id)}
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

export default Company;
