import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const ShipmentSize = ({ mode = 'add', id = null }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [sizes, setSizes] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentId, setCurrentId] = useState(id);

  useEffect(() => {
    if (currentMode === 'update' && currentId) {
      axios.get(`/trademgt/shipment-sizes/${currentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the shipment size data!', error);
        });
    }

    axios.get('/trademgt/shipment-sizes/')
      .then(response => {
        const names = response.data;
        if (Array.isArray(names)) {
            setSizes(names);
        } else {
          console.error('Expected an array but got:', names);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the shipment size!', error);
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
      axios.post('/trademgt/shipment-sizes/', formData)
        .then(response => {
          setSizes(prevDocs => [...prevDocs, response.data]);
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the shipment size!', error);
        });
    } else if (currentMode === 'update' && currentId) {
      axios.put(`/trademgt/shipment-sizes/${currentId}/`, formData)
        .then(response => {
          setSizes(prevData => prevData.map(data => data.id === response.data.id ? response.data : data));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentId(null);  // Reset currentDocumentId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the shipment size!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/shipment-sizes/${id}`)
      .then(() => {
        setSizes(prevData => prevData.filter(data => data.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the shipment size!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentId(id);
    setFormData(sizes.find(size => size.id === id) || { name: '' });
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
            placeholder="Container Shipment Size"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Shipment Size' : 'Update Shipment Size'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Shipment Size</h2>
        <ul className="space-y-4">
          {sizes.map(size => (
            <li key={size.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{size.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(size.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(size.id)}
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

export default ShipmentSize;
