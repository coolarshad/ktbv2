import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const RawMaterialForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    cost_per_liter: '',
    buy_price_pmt: '',
    add_cost: '',
    total: '',
    ml_to_kl: '',
    density: '',
    remarks: '',
    category: '', // ✅ correct field
  });

  // Fetch categories for dropdown
  useEffect(() => {
    axios
      .get('/costmgt/raw-categories/')
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  // Fetch existing data in update mode
  useEffect(() => {
    if (mode === 'update' && id) {
      axios
        .get(`/costmgt/raw-materials/${id}/`)
        .then((response) => {
          const data = response.data;
          setFormData({
            name: data.name || '',
            cost_per_liter: data.cost_per_liter || '',
            buy_price_pmt: data.buy_price_pmt || '',
            add_cost: data.add_cost || '',
            total: data.total || '',
            ml_to_kl: data.ml_to_kl || '',
            density: data.density || '',
            remarks: data.remarks || '',
            category: data.category || '', // ✅ use category not parent
          });
        })
        .catch((error) => {
          console.error('There was an error fetching the raw material data!', error);
        });
    }
  }, [mode, id]);

  // Set selected category when categories and formData.category are available
  useEffect(() => {
    if (categories.length > 0 && formData.category) {
      const cat = categories.find((c) => c.id === formData.category);
      if (cat) {
        setSelectedCategory(cat);
        setSearchTerm(cat.name);
      }
    }
  }, [categories, formData.category]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Auto-calculations
  useEffect(() => {
    const buy = parseFloat(formData.buy_price_pmt) || 0;
    const add = parseFloat(formData.add_cost) || 0;
    const density = parseFloat(formData.density) || 0;

    // Formula
    const total = buy + add;
    const mlToKl = total * density;
    const costPerLiter = parseFloat(mlToKl) / 1000;

    setFormData((prev) => ({
      ...prev,
      total: total ? total.toFixed(4) : "",
      ml_to_kl: mlToKl ? mlToKl.toFixed(4) : "",
      cost_per_liter: costPerLiter ? costPerLiter.toFixed(4) : "",
    }));
  }, [formData.buy_price_pmt, formData.add_cost, formData.density]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      setValidationErrors({ name: 'Name is required' });
      return;
    }
    if (!formData.category) {
      setValidationErrors({ category: 'Category is required' });
      return;
    }

    const payload = { ...formData };

    if (mode === 'add') {
      axios
        .post('/costmgt/raw-materials/', payload)
        .then((response) => {
          console.log('Raw Material added successfully!', response.data);
          navigate(`/raw-materials`);
        })
        .catch((error) => {
          console.error('There was an error adding the Raw Material!', error);
        });
    } else if (mode === 'update') {
      axios
        .put(`/costmgt/raw-materials/${id}/`, payload)
        .then((response) => {
          console.log('Raw Material updated successfully!', response.data);
          navigate(`/raw-materials`);
        })
        .catch((error) => {
          console.error('There was an error updating the Raw Material!', error);
        });
    }
  };

  // Handle selecting a category
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category: category.id }); // ✅ correct field
    setSearchTerm(category.name);
    setIsDropdownOpen(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setFormData({ ...formData, category: '' });
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsDropdownOpen(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
          {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
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
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-2 cursor-pointer ${
                        selectedCategory?.id === category.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectCategory(category)}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>
          {validationErrors.category && <p className="text-red-500">{validationErrors.category}</p>}
        </div>

        {/* Other fields */}
       

        <div>
          <label className="block text-sm font-medium text-gray-700">Buy Price</label>
          <input
            name="buy_price_pmt"
            type="text"
            value={formData.buy_price_pmt}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Add. Cost</label>
          <input
            name="add_cost"
            type="text"
            value={formData.add_cost}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total</label>
          <input
            name="total"
            type="text"
            value={formData.total}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

         <div>
          <label className="block text-sm font-medium text-gray-700">Density</label>
          <input
            name="density"
            type="text"
            value={formData.density}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ml to KG</label>
          <input
            name="ml_to_kl"
            type="text"
            value={formData.ml_to_kl}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
          
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Per Litre</label>
          <input
            name="cost_per_liter"
            type="text"
            value={formData.cost_per_liter}
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

export default RawMaterialForm;
