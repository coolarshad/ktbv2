import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import Modal from '../components/Modal';

const Category = () => {
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/costmgt/categories/'); 
        setCategoryData(response.data);
      } catch (error) {
        setError('Failed to fetch category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddCategoryClick = () => {
    navigate('/category-form');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (confirmed) {
      try {
        await axios.delete(`/costmgt/categories/${id}/`);
        setCategoryData(categoryData.filter(data => data.id !== id));
        alert('Category deleted successfully.');
      } catch (error) {
        console.error('Error deleting Category:', error);
        alert('Failed to delete Category.');
      }
    }
  };

  const handleViewClick = async (id) => {
    try {
      const response = await axios.get(`/costmgt/categories/${id}/`);
      setSelectedCategory(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleFilter = (filters) => {
    setCategoryData(filters);
  };

  const handleEdit = (id) => {
    navigate(`/category-form/${id}`);  // Navigate to TradeForm with tradeId
  };


  // Helper function in React to flatten children recursively
const getAllSubcategoryNames = (category) => {
  let names = [];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      names.push(child.name);
      names = names.concat(getAllSubcategoryNames(child));
    });
  }
  return names;
};


  const fieldOptions = [
    { value: 'name', label: 'Name' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="w-full h-full rounded bg-slate-200 p-3">
        <p className="text-xl">Packing Categories</p>
        <button
          onClick={handleAddCategoryClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
          <FilterComponent 
            checkBtn={false} 
            flag={2} 
            onFilter={handleFilter} 
            apiEndpoint={'/costmgt/categories'} 
            fieldOptions={fieldOptions} 
          />
        </div>
        <div className="rounded p-2">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Name</th>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Parent</th>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Children</th>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) => (
                <tr key={category.id} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-800">{category.name}</td>
                  <td className="py-2 px-4 text-gray-800">
                    {category.parent_name ? category.parent_name : "Root"}
                  </td>
                  <td className="py-2 px-4 text-gray-800">
                    {getAllSubcategoryNames(category).length > 0
                      ? getAllSubcategoryNames(category).join(", ")
                      : "—"}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleViewClick(category.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Category Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedCategory && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-1/2 p-4 rounded-lg shadow-lg overflow-auto">
              <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <h2 className="text-2xl mb-2 text-center">Category Details</h2>
              <hr className='mb-2' />
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium">Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedCategory.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium">Parent</td>
                    <td className="py-2 px-4 text-gray-800">{selectedCategory.parent_name || "Root"}</td>
                  </tr>
                  {selectedCategory.children && selectedCategory.children.length > 0 && (
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium">Subcategories</td>
                      <td className="py-2 px-4 text-gray-800">
                        {selectedCategory.children.map((child) => child.name).join(", ")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Category;
