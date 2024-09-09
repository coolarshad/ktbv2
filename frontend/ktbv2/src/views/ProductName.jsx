import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const ProductName = ({ mode = 'add', id = null }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [products, setProducts] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentId, setCurrentId] = useState(id);

  useEffect(() => {
    if (currentMode === 'update' && currentId) {
      axios.get(`/trademgt/product-names/${currentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the product name data!', error);
        });
    }

    axios.get('/trademgt/product-names/')
      .then(response => {
        const names = response.data;
        if (Array.isArray(names)) {
            setProducts(names);
        } else {
          console.error('Expected an array but got:', names);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the product names!', error);
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
      axios.post('/trademgt/product-names/', formData)
        .then(response => {
          setProducts(prevDocs => [...prevDocs, response.data]);
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the product name!', error);
        });
    } else if (currentMode === 'update' && currentId) {
      axios.put(`/trademgt/product-names/${currentId}/`, formData)
        .then(response => {
          setProducts(prevProds => prevProds.map(prod => prod.id === response.data.id ? response.data : prod));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentId(null);  // Reset currentDocumentId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the product name!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/product-names/${id}`)
      .then(() => {
        setProducts(prevProds => prevProds.filter(prod => prod.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the product name!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentId(id);
    setFormData(products.find(prod => prod.id === id) || { name: '' });
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
            placeholder="Product Name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Product Name' : 'Update Product Name'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Products Name</h2>
        <ul className="space-y-4">
          {products.map(prod => (
            <li key={prod.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{prod.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(prod.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
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

export default ProductName;
