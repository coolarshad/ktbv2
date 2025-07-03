import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Company = ({ mode = 'add', companyId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    initial: '',
    registration_number: '',
    address:'',
    seal_image: null,
    signature_image: null,
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
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formDataObj.append(key, value);
      }
    });

    try {
      setLoading(true);
      if (currentMode === 'add') {
        const response = await axios.post('/trademgt/company/', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCompanies((prevData) => [...prevData, response.data]);
        setFormData({
          name: '',
          initial: '',
          registration_number: '',
          address:'',
          seal_image: null,
          signature_image: null,
        }); // Reset form after add
      } else if (currentMode === 'update' && currentCompanyId) {
        const response = await axios.put(`/trademgt/company/${currentCompanyId}/`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCompanies((prevData) =>
          prevData.map((company) =>
            company.id === response.data.id ? response.data : company
          )
        );
        setCurrentMode('add'); // Reset to 'add' mode after update
        setCurrentCompanyId(null); // Reset currentCompanyId
        setFormData({
          name: '',
          initial: '',
          registration_number: '',
          address:'',
          seal_image: null,
          signature_image: null,
        }); // Reset form after update
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
      setCompanies((prevData) => prevData.filter((company) => company.id !== id));
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
    const company = companies.find((company) => company.id === id);
    setFormData({
      ...company,
     
      seal_image: null,
      signature_image: null,
    });
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
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
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
          <input
            type="text"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            placeholder="Registration Number"
            className="border border-gray-300 p-2 rounded w-full"
          />
          
          {/* <input
            type="file"
            name="seal_image"
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          /> */}
          {/* <input
            type="file"
            name="signature_image"
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          /> */}
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

      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
  <h2 className="text-xl font-semibold mb-4">Existing Companies</h2>
  <ul className="space-y-4">
    {companies.map((company) => (
      <li
        key={company.id}
        className="border border-gray-300 p-4 rounded flex justify-between items-center"
      >
        <div className="flex space-x-4">
        
          

          {/* Display Seal Image */}
          {/* <div>
            {company.seal_image ? (
              <a href={company.seal_image} target="_blank" rel="noopener noreferrer">
                <img
                  src={company.seal_image}
                  alt={`${company.name} seal`}
                  className="w-16 h-16 object-cover border rounded cursor-pointer"
                />
              </a>
            ) : (
              <div className="w-16 h-16 bg-gray-300 flex items-center justify-center text-white rounded">
                No Seal
              </div>
            )}
          </div> */}

          {/* Display Signature Image */}
          {/* <div>
            {company.signature_image ? (
              <a href={company.signature_image} target="_blank" rel="noopener noreferrer">
                <img
                  src={company.signature_image}
                  alt={`${company.name} signature`}
                  className="w-16 h-16 object-cover border rounded cursor-pointer"
                />
              </a>
            ) : (
              <div className="w-16 h-16 bg-gray-300 flex items-center justify-center text-white rounded">
                No Signature
              </div>
            )}
          </div> */}

          {/* Display Text Information */}
          <div>
            <h3 className="text-lg font-medium">{company.name}</h3>
            <p>Address: {company.address}</p>
            <p>Initials: {company.initial}</p>
            <p>Registration Number: {company.registration_number}</p>
          </div>
        </div>

        {/* Action Buttons */}
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
