import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import { capitalizeKey } from "../utils";
import Select from 'react-select'

const PackingForm = ({ mode = "add" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    date: "",
    name: "",
    per_each: "",
    // category: "", // now references Category model
    packing_type: "",
    remarks: "",
    extras: [],
  });

  // Fetch categories for dropdown
  useEffect(() => {
    axios
      .get("/costmgt/categories/")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    axios
      .get("/costmgt/packing-type/")
      .then((response) => {
        setPackingTypes(response.data);
      })
      .catch((error) => console.error("Error fetching packing type list:", error));
  }, []);

  // Fetch existing data in update mode
  useEffect(() => {
    if (mode === "update" && id) {
      axios
        .get(`/costmgt/packings/${id}/`)
        .then((response) => {
          const data = response.data;
          setFormData({
            date: data.date || "",
            name: data.name || "",
            per_each: data.per_each || "",
            // category: data.category || "",
            packing_type: data.packing_type ? Number(data.packing_type) : "",
            remarks: data.remarks || "",
            extras: data.extras || [],  // <-- default to empty array
          });
        })
        .catch((error) => console.error("Error fetching packing data:", error));
    }
  }, [mode, id, categories]);

  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const cat = categories.find((c) => c.id === formData.category);
      if (cat) {
        setSelectedCategory(cat);
        setSearchTerm(cat.name); // also show category name in input
      }
    }
  }, [formData.category, categories]);

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
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    console.log(formData)
    // Validate main fields
    const skipValidation = [];
    for (const [key, value] of Object.entries(formData)) {
      if (!skipValidation.includes(key) && value === "" && key !== "extras") {
        errors[key] = `${capitalizeKey(key)} cannot be empty!`;
      }
    }

    // Validate extras
    formData.extras.forEach((extra, index) => {
      if (!extra.name.trim() || extra.rate === "") {
        errors[`extras_${index}`] = "Both name and rate are required!";
      }
    });

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      ...formData,
      extras: formData.extras.filter(
        (extra) => extra.name.trim() !== "" && extra.rate !== ""
      ),
    };

    if (mode === "add") {
      axios
        .post("/costmgt/packings/", payload)
        .then(() => navigate("/packings"))
        .catch((error) => console.error("Error adding packing:", error));
    } else {
      axios
        .put(`/costmgt/packings/${id}/`, payload)
        .then(() => navigate("/packings"))
        .catch((error) => console.error("Error updating packing:", error));
    }
  };

  // Handle selecting a category
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category: category.id });
    setSearchTerm(category.name);
    setIsDropdownOpen(false);
  };

  // Handle clearing the selected category
  const handleClearCategory = () => {
    setSelectedCategory(null);
    setFormData({ ...formData, category: "" });
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

  const packingOptionsMapped = packingTypes.map(opt => ({
    value: Number(opt.id),
    label: opt.name
  }));

  const selectedPackingType = packingOptionsMapped.find(
    opt => opt.value === formData.packing_type
  ) || null;

  const handlePackingTypeChange = (selectedOption) => {
    setFormData({
      ...formData,
      packing_type: selectedOption ? selectedOption.value : ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <p className="text-xl text-center">Packing Price Form</p>
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
          {validationErrors.date && (
            <p className="text-red-500">{validationErrors.date}</p>
          )}
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
          {validationErrors.name && (
            <p className="text-red-500">{validationErrors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Per Each
          </label>
          <input
            type="text"
            name="per_each"
            value={formData.per_each}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
          {validationErrors.per_each && (
            <p className="text-red-500">{validationErrors.per_each}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700"> Packing Type</label>

          <Select
            options={packingOptionsMapped}
            value={selectedPackingType}
            onChange={handlePackingTypeChange}
            placeholder="Select Packing Type"
            isSearchable
            isClearable
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <input
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
          {validationErrors.remarks && (
            <p className="text-red-500">{validationErrors.remarks}</p>
          )}
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
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded col-span-3"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PackingForm;
