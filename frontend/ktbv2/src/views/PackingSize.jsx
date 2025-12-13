import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const PackingSize = ({ mode = 'add', id = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    bottles_per_pack: '',
    litres_per_pack: '',
  });

  const [packingSize, setPackingSize] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [pid, setId] = useState(id);

  useEffect(() => {
    const fetchPackingSize = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/costmgt/packing-size');
        if (Array.isArray(response.data)) {
          setPackingSize(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('There was an error fetching the PackingSize!', error);
        setError('Failed to fetch PackingSize.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackingSize();

    if (currentMode === 'update' && pid) {
      const fetchPackingSizeData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`costmgt/packing-size/${pid}`);
          setFormData(response.data);
        } catch (error) {
          console.error('There was an error fetching the PackingSize data!', error);
          setError('Failed to fetch PackingSize data.');
        } finally {
          setLoading(false);
        }
      };

      fetchPackingSizeData();
    }
  }, [currentMode, pid]);

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
        const response = await axios.post('/costmgt/packing-size/', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPackingSize((prevData) => [...prevData, response.data]);
        setFormData({
            name: '',
            bottles_per_pack: '',
            litres_per_pack: '',
        }); // Reset form after add
      } else if (currentMode === 'update' && pid) {
        const response = await axios.put(`/costmgt/packing-size/${pid}/`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPackingSize((prevData) =>
          prevData.map((packingSize) =>
            packingSize.id === response.data.id ? response.data : packingSize
          )
        );
        setCurrentMode('add'); // Reset to 'add' mode after update
        setId(null); // Reset currentCompanyId
        setFormData({
            name: '',
            bottles_per_pack: '',
            litres_per_pack: '',
        }); // Reset form after update
      } else {
        console.error('Update mode is enabled but companyId is missing.');
        setError('Packing Size ID is missing for update.');
      }
    } catch (error) {
      console.error('There was an error with the form submission!', error);
      setError('Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pid) => {
    try {
      setLoading(true);
      await axios.delete(`/costmgt/packing-size/${pid}/`);
      setPackingSize((prevData) => prevData.filter((packing) => packing.id !== pid));
    } catch (error) {
      console.error('There was an error deleting the packing size!', error);
      setError('Failed to delete packing size.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (pid) => {
    setCurrentMode('update');
    setId(pid);
    const packingSize = packingSize.find((item) => item.id === pid);
    setFormData({
      ...packingSize,
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
            placeholder="Packing Size Name"
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="bottles_per_pack"
            value={formData.bottles_per_pack}
            onChange={handleChange}
            placeholder="Bottles Per Pack"
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <input
            type="text"
            name="litres_per_pack"
            value={formData.litres_per_pack}
            onChange={handleChange}
            placeholder="Litres Per Pack"
            className="border border-gray-300 p-2 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {currentMode === 'add' ? 'Add Packing Size' : 'Update Packing Size'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
  <h2 className="text-xl font-semibold mb-4">Existing Packing Size</h2>
  <ul className="space-y-4">
    {packingSize.map((packing) => (
      <li
        key={packing.id}
        className="border border-gray-300 p-4 rounded flex justify-between items-center"
      >
        <div className="flex space-x-4">
    
          {/* Display Text Information */}
          <div>
            <h3 className="text-lg font-medium">{packing.name}</h3>
            <p>Bottles Per Pack: {packing.bottles_per_pack}</p>
            <p>Litres Per Pack: {packing.litres_per_pack}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdate(packing.id)}
            className="bg-green-500 text-white p-2 rounded"
            disabled={loading}
          >
            Update
          </button>
          <button
            onClick={() => handleDelete(packing.id)}
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

export default PackingSize;
