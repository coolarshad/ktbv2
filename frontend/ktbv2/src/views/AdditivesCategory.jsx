import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

import Modal from '../components/Modal';
import MultiUserSelector from "../components/MultiUserSelector";

const AdditivesCategory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notifiedUsers, setNotifiedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/costmgt/additive-categories/');
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
    navigate('/additive-category-form');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (confirmed) {
      try {
        await axios.delete(`/costmgt/additive-categories/${id}/`);
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
      const response = await axios.get(`/costmgt/additive-categories/${id}/`);
      setSelectedCategory(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setNotifiedUsers([]);
    setNotificationMessage('');
  };

  const handleFilter = (filters) => {
    setCategoryData(filters);
    setCurrentPage(1);
  };

  const handleEdit = (id) => {
    navigate(`/additive-category-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  const approveAdditive = async () => {
    if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before approving.");
      return;
    }
    try {
      const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append("notifiedUsers[]", id));
      if (notificationMessage) {
        params.append("notification_message", notificationMessage);
      }
      await axios.get(`/costmgt/additive-category-approve/${selectedCategory.id}/?${params.toString()}`);
      setNotifiedUsers([]);
      setNotificationMessage('');
      setIsModalOpen(false);
      setSelectedCategory(null);
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving additive category:', error);
      // Optionally, handle the error (e.g., show a user-friendly error message)
    }
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

  const indexOfLastItem = currentPage * 50;
  const indexOfFirstItem = indexOfLastItem - 50;
  const currentItems = categoryData?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const paginate = (pageNumber) => setCurrentPage(pageNumber);



  return (
    <>
      <div className="w-full h-full rounded bg-slate-200 p-3">
        <p className="text-xl">Additives Categories</p>
        {hasPermission(user, 'create_additives_pricing_category') && (
          <button
            onClick={handleAddCategoryClick}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            +
          </button>
        )}
        <div>
          <CostMgtFilterComponent
            checkBtn={false}
            flag={2}
            onFilter={handleFilter}
            apiEndpoint={'/costmgt/additive-categories/'}
            fieldOptions={fieldOptions}
            downloadUrl="/excel/export/additive-category/"
            fileName="Additive_Category_export"
          />
        </div>
        <div className="rounded p-2 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>

                <th className="py-2 px-4 text-left text-gray-700 font-semibold sticky left-0 z-30 bg-gray-100 min-w-[250px] max-w-[250px] w-[250px]">Parent</th>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold sticky left-[250px] z-30 bg-gray-100 min-w-[250px] border-r border-gray-300">Name</th>
                {/* <th className="py-2 px-4 text-left text-gray-700 font-semibold">Children</th> */}
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Approved</th>
                <th className="py-2 px-4 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems?.map((category) => (
                <tr key={category.id} className="border-b border-gray-200">

                  <td className="py-2 px-4 text-gray-800 sticky left-0 z-10 bg-white min-w-[250px] max-w-[250px] w-[250px]">
                    {category.parent_name ? category.parent_name : ""}
                  </td>
                  <td className="py-2 px-4 text-gray-800 sticky left-[250px] z-10 bg-white min-w-[250px] border-r border-gray-300">{category.name}</td>
                  {/* <td className="py-2 px-4 text-gray-800">
                    {getAllSubcategoryNames(category).length > 0
                      ? getAllSubcategoryNames(category).join(", ")
                      : "—"}
                  </td> */}
                  <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                    <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={category.approved} onChange={() => { }} />
                  </td>

                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleViewClick(category.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                    >
                      View
                    </button>
                    {hasPermission(user, 'update_additives_pricing_category') && (
                      <button
                        onClick={() => handleEdit(category.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission(user, 'delete_additives_pricing_category') && (
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
          <Pagination itemsPerPage={50} totalItems={categoryData?.length || 0} paginate={paginate} currentPage={currentPage} />
        </div>
      </div>

      {/* Modal for Category Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedCategory && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-1/2 p-4 rounded-lg shadow-lg overflow-auto">
              <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <h2 className="text-2xl mb-2 text-center">Additives Category Details</h2>
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
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                    <td className="py-2 px-4 text-gray-800">{selectedCategory.approved ? "Yes" : "No"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Notified Users Section */}
              <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
                <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
                {selectedCategory?.notified_users_emails?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedCategory.notified_users_emails.map((email, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{email}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No users have been notified for this record.</p>
                )}
              </div>

              {!selectedCategory.approved && (
                <div className="mt-6 border-t pt-4">
                  <MultiUserSelector
                    selectedUsers={notifiedUsers}
                    onChange={setNotifiedUsers}
                    message={notificationMessage}
                    onMessageChange={setNotificationMessage}
                  />
                </div>
              )}


              {selectedCategory.approved ? '' :
                <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                  {hasPermission(user, 'approve_additives_pricing_category') && (
                    <button onClick={approveAdditive} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
                  )}
                </div>
              }
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdditivesCategory;
