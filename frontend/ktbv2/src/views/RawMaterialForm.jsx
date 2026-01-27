import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const RawMaterialForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const nameDropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [subNames, setSubNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubName, setSelectedSubName] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    cost_per_liter: '',
    buy_price_pmt: '',
    add_cost: '',
    total: '',
    ml_to_kl: '',
    density: '',
    remarks: '',
    category: '', // ✅ correct field
    extras: [],
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

  useEffect(() => {
    axios
      .get('/costmgt/raw-categories?leaf=1')
      .then((response) => {
        setSubNames(response.data);
      })
      .catch((error) => console.error('Error fetching sub names:', error));
  }, []);

  // Fetch existing data in update mode
  useEffect(() => {
    if (mode === 'update' && id) {
      axios
        .get(`/costmgt/raw-materials/${id}/`)
        .then((response) => {
          const data = response.data;
          setFormData({
            date: data.date || '',
            name: data.name || '',
            cost_per_liter: data.cost_per_liter || '',
            buy_price_pmt: data.buy_price_pmt || '',
            add_cost: data.add_cost || '',
            total: data.total || '',
            ml_to_kl: data.ml_to_kl || '',
            density: data.density || '',
            remarks: data.remarks || '',
            category: data.category || '', // ✅ use category not parent
            extras: data.extras || [],
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

  useEffect(() => {
    if (subNames.length > 0 && formData.name) {
      const sub = subNames.find((s) => s.id === formData.name);
      if (sub) {
        setSelectedSubName(sub);
        setSearchNameTerm(sub.name);
      }
    }
  }, [subNames, formData.name]);

  useEffect(() => {
    if (mode === 'add') {
      setSelectedSubName(null);
      setFormData((prev) => ({ ...prev, name: '' }));
      setSearchNameTerm('');
    }
  }, [selectedCategory, mode]);

  useEffect(() => {
    if (mode === 'add') {
      setSelectedSubName(null);
      setFormData((prev) => ({ ...prev, name: '' }));
      setSearchNameTerm('');
    }
  }, [selectedCategory, mode]);


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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(event.target)) {
        setIsNameDropdownOpen(false);
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

  const handleExtraChange = (index, field, value) => {
    const updated = [...formData.extras];
    updated[index][field] = value;
    setFormData({ ...formData, extras: updated });
  };

  const addExtraRow = () => {
    setFormData({
      ...formData,
      extras: [...formData.extras, { name: "", rate: "" }],
    });
  };

  const removeExtraRow = (index) => {
    const updated = formData.extras.filter((_, i) => i !== index);
    setFormData({ ...formData, extras: updated });
  };


  const errors = {};
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
    // Validate extras
    formData.extras.forEach((extra, index) => {
      if (!extra.name.trim() || extra.rate === "") {
        errors[`extras_${index}`] = "Both name and rate are required!";
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      extras: formData.extras.filter(
        (extra) => extra.name.trim() !== "" && extra.rate !== ""
      ),
    };

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

  const handleNameSelectCategory = (sub) => {
    setSelectedSubName(sub);
    setFormData({ ...formData, name: sub.id });
    setSearchNameTerm(sub.name);
    setIsNameDropdownOpen(false);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setFormData({ ...formData, category: '' });
    setSearchTerm('');
  };

  const handleClearSubName = () => {
    setSelectedSubName(null);
    setFormData({ ...formData, name: '' });
    setSearchNameTerm('');
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsDropdownOpen(true);
  };

  const handleNameSearchChange = (e) => {
    const term = e.target.value;
    setSearchNameTerm(term);
    setIsNameDropdownOpen(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNames = subNames.filter((sub) =>
    sub.name.toLowerCase().includes(searchNameTerm.toLowerCase()) &&
    (!selectedCategory || sub.parent === selectedCategory.id)
  );


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <p className="text-xl text-center">Raw Material Pricing Form</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

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
          <label className="block text-sm font-medium text-gray-700">Name</label>
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
                      className={`p-2 cursor-pointer ${selectedCategory?.id === category.id ? 'bg-blue-100' : 'hover:bg-gray-100'
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

        {/* Name */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700">Sub-Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
          {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700">Sub Name</label>
          <div className="relative" ref={nameDropdownRef}>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <input
                type="text"
                placeholder="Search Sub Name..."
                value={searchNameTerm}
                onChange={handleNameSearchChange}
                onClick={() => setIsNameDropdownOpen(true)}
                className="p-2 w-full outline-none"
              />
              {selectedSubName && (
                <button
                  type="button"
                  onClick={handleClearSubName}
                  className="px-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
                className="px-2 text-gray-500 hover:text-gray-700"
              >
                {isNameDropdownOpen ? '▲' : '▼'}
              </button>
            </div>

            {isNameDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-200">
                {filteredNames.length > 0 ? (
                  filteredNames.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-2 cursor-pointer ${selectedSubName?.id === sub.id
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-100'
                        }`}
                      onClick={() => handleNameSelectCategory(sub)}
                    >
                      {sub.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matches found</div>
                )}

              </div>
            )}
          </div>
          {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
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
      {/* <div className="p-4 border rounded bg-gray-50 relative">
        <p className="font-semibold text-gray-700 mb-2">Sub Names</p>

        {formData.extras.map((row, index) => (
          <div key={index} className="grid grid-cols-5 gap-3 items-center mb-2">
            <input
              type="text"
              placeholder="Name"
              value={row.name}
              onChange={(e) =>
                handleExtraChange(index, "name", e.target.value)
              }
              className="border p-2 rounded col-span-2"
            />
            <input
              type="text"
              placeholder="Rate"
              value={row.rate}
              onChange={(e) =>
                handleExtraChange(index, "rate", e.target.value)
              }
              className="border p-2 rounded col-span-2"
            />
            <button
              type="button"
              onClick={() => removeExtraRow(index)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              ✖
            </button>
          </div>
        ))}

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={addExtraRow}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            + Add More
          </button>
        </div>
      </div> */}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-3">
          Submit
        </button>
      </div>
    </form>
  );
};

export default RawMaterialForm;
