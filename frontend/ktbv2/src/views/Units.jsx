import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Units = ({ mode = 'add', unitId = null }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [units, setUnits] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentUnitId, setCurrentUnitId] = useState(unitId);

  useEffect(() => {
    if (currentMode === 'update' && currentUnitId) {
      axios.get(`/trademgt/unit/${currentUnitId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the unit data!', error);
        });
    }

    axios.get('/trademgt/unit')
      .then(response => {
        const units = response.data;
        if (Array.isArray(units)) {
          setUnits(units);
        } else {
          console.error('Expected an array but got:', units);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the units!', error);
      });
  }, [currentMode, currentUnitId]);

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
      axios.post('/trademgt/unit/', formData)
        .then(response => {
          setUnits(prevData => [...prevData, response.data]);
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the unit!', error);
        });
    } else if (currentMode === 'update' && currentUnitId) {
      axios.put(`/trademgt/unit/${currentUnitId}/`, formData)
        .then(response => {
          setUnits(prevData => prevData.map(unit => unit.id === response.data.id ? response.data : unit));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentUnitId(null);  // Reset currentUnitId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the unit!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/unit/${id}`)
      .then(() => {
        setUnits(prevData => prevData.filter(unit => unit.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the unit!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentUnitId(id);
    setFormData(units.find(unit => unit.id === id) || { name: '' });
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
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Unit' : 'Update Unit'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Units */}
      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Units</h2>
        <ul className="space-y-4">
          {units.map(unit => (
            <li key={unit.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{unit.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(unit.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
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

export default Units;
