import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const AdditiveForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    crfPrice: '',
    addCost: '',
    costPriceInLiter: '',
    density: '',
    totalCost: '',
    remarks: '',
    category: '', // category id
  });

  // Fetch categories
  useEffect(() => {
    axios
      .get('/costmgt/additive-categories/')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch existing additive in update mode
  useEffect(() => {
    if (mode === 'update' && id) {
      axios
        .get(`/costmgt/additives/${id}/`)
        .then((res) => {
          const data = res.data;
          setFormData({
            date: data.date || '',
            name: data.name || '',
            crfPrice: data.crfPrice || '',
            addCost: data.addCost || '',
            costPriceInLiter: data.costPriceInLiter || '',
            density: data.density || '',
            totalCost: data.totalCost || '',
            remarks: data.remarks || '',
            category: data.category || '',
          });
        })
        .catch((err) => console.error('Error fetching additive:', err));
    }
  }, [mode, id]);

  // Auto-set selected category when categories or formData.category change
  useEffect(() => {
    if (formData.category && categories.length) {
      const cat = categories.find((c) => c.id === formData.category);
      if (cat) {
        setSelectedCategory(cat);
        setSearchTerm(cat.name);
      }
    }
  }, [categories, formData.category]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category: category.id });
    setSearchTerm(category.name);
    setIsDropdownOpen(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setFormData({ ...formData, category: '' });
    setSearchTerm('');
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      alert('Name and Category are required!');
      return;
    }

    const payload = { ...formData };

    if (mode === 'add') {
      axios
        .post('/costmgt/additives/', payload)
        .then((res) => navigate('/additives'))
        .catch((err) => console.error(err));
    } else {
      axios
        .put(`/costmgt/additives/${id}/`, payload)
        .then((res) => navigate('/additives'))
        .catch((err) => console.error(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <input
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={() => setIsDropdownOpen(true)}
                className="p-2 w-full outline-none"
              />
              {selectedCategory && (
                <button
                  type="button"
                  onClick={handleClearCategory}
                  className="px-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-2 text-gray-500 hover:text-gray-700"
              >
                {isDropdownOpen ? '▲' : '▼'}
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-200">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-2 cursor-pointer ${
                        selectedCategory?.id === cat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectCategory(cat)}
                    >
                      {cat.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Remaining fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">CFR Price/KG</label>
          <input
            name="crfPrice"
            type="number"
            value={formData.crfPrice}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Add Cost</label>
          <input
            name="addCost"
            type="number"
            value={formData.addCost}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total Cost EX DK</label>
          <input
            name="costPriceInLiter"
            type="number"
            value={formData.costPriceInLiter}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Density</label>
          <input
            name="density"
            type="number"
            value={formData.density}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price in Liters</label>
          <input
            name="totalCost"
            type="number"
            value={formData.totalCost}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <input
            name="remarks"
            type="text"
            value={formData.remarks}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-3">
          Submit
        </button>
      </div>
    </form>
  );
};

export default AdditiveForm;
