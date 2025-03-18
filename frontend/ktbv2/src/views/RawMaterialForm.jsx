import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const RawMaterialForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    const [categories, setCategories] = useState([]);  
    const [searchTerm, setSearchTerm] = useState(""); 
    const [newCategory, setNewCategory] = useState("");  
    const [addingCategory, setAddingCategory] = useState(false);
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
        parent: '',
    });

    // Fetch categories for dropdown
    useEffect(() => {
        axios.get("/costmgt/raw-material-categories/")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => console.error("Error fetching categories:", error));
    }, []);

    // Fetch existing data in update mode
    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/costmgt/raw-materials/${id}/`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        name: data.name,
                        cost_per_liter: data.cost_per_liter,
                        buy_price_pmt: data.buy_price_pmt,
                        add_cost: data.add_cost,
                        total: data.total,
                        ml_to_kl: data.ml_to_kl,
                        density: data.density,
                        remarks: data.remarks,
                        parent: data.parent || "",
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the raw material data!', error);
                });
        }
    }, [mode, id]);

    // Set selected category when categories and formData.parent are available
    useEffect(() => {
        if (categories.length > 0 && formData.parent) {
            const parentCategory = categories.find(cat => cat.id === formData.parent);
            if (parentCategory) {
                setSelectedCategory(parentCategory);
                setSearchTerm(parentCategory.name);
            }
        }
    }, [categories, formData.parent]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        for (const [key, value] of Object.entries(formData)) {
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    for (const [subKey, subValue] of Object.entries(item)) {
                        if (subValue instanceof File) {
                            formDataToSend.append(`${key}[${index}].${subKey}`, subValue);
                        } else {
                            formDataToSend.append(`${key}[${index}].${subKey}`, subValue);
                        }
                    }
                });
            } else {
                formDataToSend.append(key, value);
            }
        }

        if (mode === 'add') {
            axios.post('/costmgt/raw-materials/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Raw Material added successfully!', response.data);
                navigate(`/raw-materials`);
            })
            .catch(error => {
                console.error('There was an error adding the Raw Material!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/costmgt/raw-materials/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Raw Material updated successfully!', response.data);
                navigate(`/raw-materials`);
            })
            .catch(error => {
                console.error('There was an error updating the Raw Material!', error);
            });
        }
    };

    // Handle adding a new category
    const handleAddCategory = () => {
        if (newCategory.trim() === "") return;

        axios.post("/costmgt/raw-material-categories/", { name: newCategory })
            .then((response) => {
                const updatedCategories = [...categories, response.data];
                setCategories(updatedCategories);
                setSelectedCategory(response.data);
                setFormData({ ...formData, parent: response.data.id });
                setSearchTerm(response.data.name);
                setAddingCategory(false);
                setNewCategory("");
            })
            .catch((error) => console.error("Error adding category:", error));
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setIsDropdownOpen(true);
    };

    // Handle selecting a category
    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setFormData({ ...formData, parent: category.id });
        setSearchTerm(category.name);
        setIsDropdownOpen(false);
    };

    // Handle clearing the selected category
    const handleClearCategory = () => {
        setSelectedCategory(null);
        setFormData({ ...formData, parent: "" });
        setSearchTerm("");
    };

    // Filter categories based on search term
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
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
                        {!addingCategory ? (
                            <>
                                <div className="relative">
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
                                            {isDropdownOpen ? "▲" : "▼"}
                                        </button>
                                    </div>
                                    
                                    {isDropdownOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-200">
                                            <div 
                                                className="p-2 cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    handleClearCategory();
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                No Category
                                            </div>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map((category) => (
                                                    <div
                                                        key={category.id}
                                                        className={`p-2 cursor-pointer ${
                                                            selectedCategory?.id === category.id
                                                                ? "bg-blue-100"
                                                                : "hover:bg-gray-100"
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

                                {/* Add Category Button */}
                                <button
                                    type="button"
                                    onClick={() => setAddingCategory(true)}
                                    className="bg-green-500 text-white px-3 py-2 rounded mt-2 w-full"
                                >
                                    + Add New Category
                                </button>
                            </>
                        ) : (
                            <>
                                {/* New Category Input */}
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New category name"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                <div className="flex justify-between mt-2">
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="bg-blue-500 text-white px-3 py-2 rounded w-1/2 mr-2"
                                    >
                                        ✔ Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddingCategory(false)}
                                        className="bg-red-500 text-white px-3 py-2 rounded w-1/2"
                                    >
                                        ✖ Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="cost_per_liter" className="block text-sm font-medium text-gray-700">Cost Per Litre</label>
                    <input
                        id="cost_per_liter"
                        name="cost_per_liter"
                        type="text"
                        value={formData.cost_per_liter}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.cost_per_liter && <p className="text-red-500">{validationErrors.cost_per_liter}</p>}
                </div>
                <div>
                    <label htmlFor="buy_price_pmt" className="block text-sm font-medium text-gray-700">Buy Price</label>
                    <input
                        id="buy_price_pmt"
                        name="buy_price_pmt"
                        type="text"
                        value={formData.buy_price_pmt}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.buy_price_pmt && <p className="text-red-500">{validationErrors.buy_price_pmt}</p>}
                </div>
                <div>
                    <label htmlFor="add_cost" className="block text-sm font-medium text-gray-700">Add. Cost</label>
                    <input
                        id="add_cost"
                        name="add_cost"
                        type="text"
                        value={formData.add_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.add_cost && <p className="text-red-500">{validationErrors.add_cost}</p>}
                </div>
                <div>
                    <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                        id="total"
                        name="total"
                        type="text"
                        value={formData.total}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.total && <p className="text-red-500">{validationErrors.total}</p>}
                </div>
                <div>
                    <label htmlFor="ml_to_kl" className="block text-sm font-medium text-gray-700">Ml to KG</label>
                    <input
                        id="ml_to_kl"
                        name="ml_to_kl"
                        type="text"
                        value={formData.ml_to_kl}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.ml_to_kl && <p className="text-red-500">{validationErrors.ml_to_kl}</p>}
                </div>
                <div>
                    <label htmlFor="density" className="block text-sm font-medium text-gray-700">Density</label>
                    <input
                        id="density"
                        name="density"
                        type="text"
                        value={formData.density}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.density && <p className="text-red-500">{validationErrors.density}</p>}
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        id="remarks"
                        name="remarks"
                        type="text"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
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