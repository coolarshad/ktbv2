import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import { capitalizeKey } from '../utils';

const PackingForm = ({ mode = "add" }) => {
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
        date: "",
        name: "",
        per_each: "",
        parent: "",
        remarks: "",
    });

    // Fetch categories for dropdown
    useEffect(() => {
        axios.get("/costmgt/packings/")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => console.error("Error fetching categories:", error));
    }, []);

    // Fetch existing data in update mode
    useEffect(() => {
        if (mode === "update" && id) {
            axios.get(`/costmgt/packings/${id}/`)
                .then((response) => {
                    const data = response.data;
                    setFormData({
                        date: data.date,
                        name: data.name,
                        per_each: data.per_each,
                        parent: data.parent || "",
                        remarks: data.remarks,
                    });
                    
                    // Set selected category name for display
                    if (data.parent) {
                        const parentCategory = categories.find(cat => cat.id === data.parent);
                        if (parentCategory) setSelectedCategory(parentCategory);
                    }
                })
                .catch((error) => console.error("Error fetching packing data:", error));
        }
    }, [mode, id, categories]);

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

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        let errors = {};
        
        // Define fields to skip validation for
        const skipValidation = [];
        // Check each regular field for empty value (except files and those in skipValidation)
        for (const [key, value] of Object.entries(formData)) {
            if (!skipValidation.includes(key) && value === '') {
                errors[key] = `${capitalizeKey(key)} cannot be empty!`;
            }
        }

        setValidationErrors(errors);
    
        if (Object.keys(errors).length > 0) {
            console.log(errors)
            return; // Don't proceed if there are validation errors
        }else{
             setValidationErrors({});  
        }
        const payload = { ...formData };
        if (mode === "add") {
            axios.post("/costmgt/packings/", payload)
                .then(() => navigate("/packings"))
                .catch((error) => console.error("Error adding packing:", error));
        } else {
            axios.put(`/costmgt/packings/${id}/`, payload)
                .then(() => navigate("/packings"))
                .catch((error) => console.error("Error updating packing:", error));
        }
    };

    // Handle adding a new category
    const handleAddCategory = () => {
        if (newCategory.trim() === "") return;

        axios.post("/costmgt/packings/", { name: newCategory })
            .then((response) => {
                const updatedCategories = [...categories, response.data];
                setCategories(updatedCategories);
                setSelectedCategory(response.data);
                setFormData({ ...formData, parent: response.data.id });
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
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.date && <p className="text-red-500">{validationErrors.date}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.name && <p className="text-red-500">{validationErrors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Per Each</label>
                    <input
                        type="text"
                        name="per_each"
                        value={formData.per_each}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                    {validationErrors.per_each && <p className="text-red-500">{validationErrors.per_each}</p>}
                </div>

                {/* Enhanced Searchable Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Parent Category</label>
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
                                                No Parent (Top-Level)
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
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        type="text"
                        name="remarks"
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

export default PackingForm;