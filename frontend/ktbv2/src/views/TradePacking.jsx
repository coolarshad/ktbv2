import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const TradePacking = ({ mode = 'add', id = null }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [packings, setPackings] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentId, setCurrentId] = useState(id);

  useEffect(() => {
    if (currentMode === 'update' && currentId) {
      axios.get(`/trademgt/packings/${currentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the packings data!', error);
        });
    }

    axios.get('/trademgt/packings/')
      .then(response => {
        const names = response.data;
        if (Array.isArray(names)) {
            setPackings(names);
        } else {
          console.error('Expected an array but got:', names);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the packing !', error);
      });
  }, [currentMode, currentId]);

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
      axios.post('/trademgt/packings/', formData)
        .then(response => {
          setPackings(prevData => [...prevData, response.data]);
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the packing!', error);
        });
    } else if (currentMode === 'update' && currentId) {
      axios.put(`/trademgt/packings/${currentId}/`, formData)
        .then(response => {
          setPackings(prevData => prevData.map(data => data.id === response.data.id ? response.data : data));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentId(null);  // Reset currentDocumentId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the packings!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/packings/${id}`)
      .then(() => {
        setPackings(prevData => prevData.filter(data => data.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the packings!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentId(id);
    setFormData(packings.find(curr => curr.id === id) || { name: '' });
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
            placeholder="Packing Name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Packing' : 'Update Packing'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Packing</h2>
        <ul className="space-y-4">
          {packings.map(curr => (
            <li key={curr.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{curr.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(curr.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(curr.id)}
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

export default TradePacking;
