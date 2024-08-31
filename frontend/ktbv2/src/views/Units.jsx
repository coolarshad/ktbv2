import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const Units = ({ mode = 'add', unitId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
  });

  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (mode === 'update' && unitId) {
      // Fetch the existing payment term data from the API
      axios.get(`/trademgt/unit/${unitId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the units data!', error);
        });
    }

    // Fetch all payment terms
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
  }, [mode, unitId]);

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
      axios.post('/trademgt/unit/', formData)
        .then(response => {
          console.log('Unit added successfully!', response.data);
          setUnits(prevData => [...prevData, response.data]);
        })
        .catch(error => {
          console.error('There was an error adding the unit!', error);
        });
    } else if (mode === 'update') {
      // Put updated payment term data to API
      axios.put(`/trademgt/unit/${unitId}`, formData)
        .then(response => {
          console.log('Unit updated successfully!', response.data);
          setUnits(prevData => prevData.map(unit => unit.id === response.data.id ? response.data : unit));
        })
        .catch(error => {
          console.error('There was an error updating the unit!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/unit/${id}`)
      .then(() => {
        console.log('Unit deleted successfully!');
        setUnits(prevData => prevData.filter(unit => unit.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the Unit!', error);
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
          
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {mode === 'add' ? 'Add Unit' : 'Update Unit'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Payment Terms */}
      <div className='space-y-4 w-full lg:w-2/3 mx-auto'>
        <h2 className="text-xl font-semibold mb-4">Existing Units</h2>
        <ul className="space-y-4">
          {units.map(unit => (
            <li key={unit.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{unit.name}</h3>
                
              </div>
              <button
                onClick={() => handleDelete(unit.id)}
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

export default Units;
