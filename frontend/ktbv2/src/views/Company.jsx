import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Company = ({ mode = 'add', companyId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    initial: '',
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentCompanyId, setCurrentCompanyId] = useState(companyId);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/trademgt/company');
        if (Array.isArray(response.data)) {
          setCompanies(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('There was an error fetching the companies!', error);
        setError('Failed to fetch companies.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    if (currentMode === 'update' && currentCompanyId) {
      const fetchCompanyData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/trademgt/company/${currentCompanyId}`);
          setFormData(response.data);
        } catch (error) {
          console.error('There was an error fetching the company data!', error);
          setError('Failed to fetch company data.');
        } finally {
          setLoading(false);
        }
      };

      fetchCompanyData();
    }
  }, [currentMode, currentCompanyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (currentMode === 'add') {
        const response = await axios.post('/trademgt/company/', formData);
        setCompanies(prevData => [...prevData, response.data]);
        setFormData({ name: '', initial: '' }); // Reset form after add
      } else if (currentMode === 'update' && currentCompanyId) {
        const response = await axios.put(`/trademgt/company/${currentCompanyId}/`, formData);
        setCompanies(prevData => prevData.map(company => company.id === response.data.id ? response.data : company));
        setCurrentMode('add');  // Reset to 'add' mode after update
        setCurrentCompanyId(null);  // Reset currentCompanyId
        setFormData({ name: '', initial: '' }); // Reset form after update
      } else {
        console.error('Update mode is enabled but companyId is missing.');
        setError('Company ID is missing for update.');
      }
    } catch (error) {
      console.error('There was an error with the form submission!', error);
      setError('Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/trademgt/company/${id}/`);
      setCompanies(prevData => prevData.filter(company => company.id !== id));
    } catch (error) {
      console.error('There was an error deleting the company!', error);
      setError('Failed to delete company.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentCompanyId(id);
    setFormData(companies.find(company => company.id === id) || { name: '', initial: '' });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="initial"
            value={formData.initial}
            onChange={handleChange}
            placeholder="Initial"
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {currentMode === 'add' ? 'Add Company' : 'Update Company'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Companies */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Companies</h2>
        <ul className="space-y-4">
          {companies.map(company => (
            <li key={company.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{company.name}</h3>
                <p>Initials: {company.initial}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(company.id)}
                  className="bg-green-500 text-white p-2 rounded"
                  disabled={loading}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="bg-red-500 text-white p-2 rounded"
                  disabled={loading}
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

export default Company;
