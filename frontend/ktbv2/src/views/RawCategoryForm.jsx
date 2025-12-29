import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import { capitalizeKey } from "../utils";

const RawCategoryForm = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    parent: "",
  });

  // Fetch all categories
  useEffect(() => {
    axios
      .get("/costmgt/raw-categories/")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch existing category in update mode
  useEffect(() => {
    if (mode === "update" && id) {
      axios
        .get(`/costmgt/raw-categories/${id}/`)
        .then((response) => {
          const data = response.data;
          setFormData({
            name: data.name || "",
            parent: data.parent || "",
          });
        })
        .catch((error) => console.error("Error fetching category:", error));
    }
  }, [mode, id]);

  // ✅ Separate effect: when categories OR formData.parent change, set selectedParent
  useEffect(() => {
    if (formData.parent && categories.length > 0) {
      const parentCat = categories.find((c) => c.id === formData.parent);
      if (parentCat) {
        setSelectedParent(parentCat);
        setSearchTerm(parentCat.name); // so input shows the name
      }
    }
  }, [formData.parent, categories]);


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

    if (!formData.name) {
      errors.name = "Category name cannot be empty!";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = { ...formData };

    if (mode === "add") {
      axios
        .post("/costmgt/raw-categories/", payload)
        .then(() => navigate("/raw-categories"))
        .catch((error) => console.error("Error adding category:", error));
    } else {
      axios
        .put(`/costmgt/raw-categories/${id}/`, payload)
        .then(() => navigate("/raw-categories"))
        .catch((error) => console.error("Error updating category:", error));
    }
  };

  // Handle selecting parent category
  const handleSelectParent = (category) => {
    setSelectedParent(category);
    setFormData({ ...formData, parent: category.id });
    setSearchTerm(category.name);
    setIsDropdownOpen(false);
  };

  // Handle clearing parent category
  const handleClearParent = () => {
    setSelectedParent(null);
    setFormData({ ...formData, parent: "" });
    setSearchTerm("");
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsDropdownOpen(true);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <p className="text-xl text-center">Raw Material Category Form</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Raw Category Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
          {validationErrors.name && (
            <p className="text-red-500">{validationErrors.name}</p>
          )}
        </div>

        {/* Parent Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <input
                  type="text"
                  placeholder="Search parent category..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={() => setIsDropdownOpen(true)}
                  className="p-2 w-full outline-none"
                />
                {selectedParent && (
                  <button
                    type="button"
                    onClick={handleClearParent}
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
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-2 cursor-pointer ${selectedParent?.id === category.id
                            ? "bg-blue-100"
                            : "hover:bg-gray-100"
                          }`}
                        onClick={() => handleSelectParent(category)}
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded col-span-2"
        >
          {mode === "add" ? "Add Category" : "Update Category"}
        </button>
      </div>
    </form>
  );
};

export default RawCategoryForm;
