import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import { hasPermission } from '../utils';

const PackingTypeList = ({ mode = 'add', id = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '' });
  const [packing, setPacking] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentId, setCurrentId] = useState(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPacking, setFilteredPacking] = useState([]);

  useEffect(() => {
    if (currentMode === 'update' && currentId) {
      axios.get(`/costmgt/packing-type/${currentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the packing type list data!', error);
        });
    }

    axios.get('/costmgt/packing-type/')
      .then(response => {
        const names = response.data;
        if (Array.isArray(names)) {
          setPacking(names);
          setFilteredPacking(names);
        } else {
          console.error('Expected an array but got:', names);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the packing type list !', error);
      });
  }, [currentMode, currentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSearch = () => {
    const filtered = packing.filter((item) =>
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPacking(filtered);
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPacking(packing);
    }
  }, [searchTerm, packing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'add') {
      axios.post('/costmgt/packing-type/', formData)
        .then(response => {
          setPacking(prevData => {
            const newData = [...prevData, response.data];
            setFilteredPacking(newData);
            return newData;
          });
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the packing type list!', error);
        });
    } else if (currentMode === 'update' && currentId) {
      axios.put(`/costmgt/packing-type/${currentId}/`, formData)
        .then(response => {
          setPacking(prevData => {
            const newData = prevData.map(data => data.id === response.data.id ? response.data : data);
            setFilteredPacking(newData);
            return newData;
          });
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentId(null);  // Reset currentDocumentId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the packing type list!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/costmgt/packing-type/${id}`)
      .then(() => {
        setPacking(prevData => {
          const newData = prevData.filter(data => data.id !== id);
          setFilteredPacking(newData);
          return newData;
        });
      })
      .catch(error => {
        console.error('There was an error deleting the packing type list!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentId(id);
    setFormData(packing.find(curr => curr.id === id) || { name: '' });
  };

  const sortedPacking = useMemo(() => {
    return [...filteredPacking].sort((a, b) => b.id - a.id);
  }, [filteredPacking]);

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4 p-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Packing Type Name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          {hasPermission(user, currentMode === 'add' ? 'create_packing_type' : 'update_packing_type') && (
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              {currentMode === 'add' ? 'Add Packing Type' : 'Update Packing Type'}
            </button>
          )}
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div className="space-y-4 w-full">
        <h2 className="text-xl font-semibold mb-4">Existing Packing Type</h2>
        <div className="flex space-x-2 mb-4 w-full">
          <input
            type="text"
            placeholder="Search Packing Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Search
          </button>
        </div>
        <ul className="space-y-4">
          {sortedPacking.map(curr => (
            <li key={curr.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{curr.name}</h3>
              </div>
              <div className="flex space-x-2">
                {hasPermission(user, 'update_packing_type') && (
                  <button
                    onClick={() => handleUpdate(curr.id)}
                    className="bg-green-500 text-white p-2 rounded"
                  >
                    Update
                  </button>
                )}
                {hasPermission(user, 'delete_packing_type') && (
                  <button
                    onClick={() => handleDelete(curr.id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PackingTypeList;
