import React, { useState, useEffect } from "react";
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const ProductFormulaForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        formula_name: "",
        consumption_name: "",
        packing_type: "",
        remarks: "",
        attributes: [
            { label: "", value: "" }
        ]
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/costmgt/product-formula/${id}`)
                .then((response) => {
                    const data = response.data;
                    setFormData((prevState) => ({
                        ...prevState,
                        ...data,
                        attributes: data.items || [{ label: '', value: 0 }],
                    }));
                })
                .catch((error) => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

    const [consumptionOptions, setCOnsumptionOptions] = useState([]);
    const [packingOptions, setPackingOptions] = useState([]);
    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params }); // Pass params to axios.get
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/costmgt/consumption', {}, setCOnsumptionOptions);
        fetchData('/costmgt/packings', {}, setPackingOptions);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAttributeChange = (e, index) => {
        const { name, value } = e.target;
        const updated = [...formData.attributes];
        updated[index][name] = value;
        setFormData({ ...formData, attributes: updated });
    };

    const addAttribute = () => {
        setFormData({
            ...formData,
            attributes: [...formData.attributes, { label: "", value: "" }]
        });
    };

    const removeAttribute = (index) => {
        const filtered = formData.attributes.filter((_, i) => i !== index);
        setFormData({ ...formData, attributes: filtered });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        console.log("FORM SUBMITTED:", formData);
        for (const [key, value] of Object.entries(formData)) {
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    for (const [subKey, subValue] of Object.entries(item)) {
                        formDataToSend.append(`${key}[${index}].${subKey}`, subValue);
                    }
                });
            } else {
                formDataToSend.append(key, value);
            }
        }

        const apiCall = mode === 'add' ? axios.post : axios.put;
        const url = mode === 'add' ? '/costmgt/product-formula/' : `/costmgt/product-formula/${id}/`;

        apiCall(url, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                console.log(`${mode === 'add' ? 'Product formula added' : 'Product formula updated'} successfully!`, response.data);
                navigate(`/product-formula`);
            })
            .catch((error) => {
                console.error(`There was an error ${mode === 'add' ? 'adding' : 'updating'} the Product formula!`, error);
            });

    };


    const consumptionOptionsMapped = consumptionOptions.map(opt => ({
        value: opt.id,
        label: opt.alias
    }));

    const packingOptionsMapped = packingOptions.map(opt => ({
        value: opt.id,
        label: opt.name
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full lg:w-2/3 mx-auto">
            <p className="text-xl text-center">Packing Formation Form</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-0 pt-4">

                <div>
                    <label className="text-sm font-medium">Formula Name</label>
                    <input
                        type="text"
                        name="formula_name"
                        value={formData.formula_name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    />
                </div>

                {/* <div className="mb-4">
                    <label className="block mb-1 font-semibold">Consumption Name</label>
                    <select
                        name="consumption_name"
                        value={formData.consumption_name}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    >
    
                         <option value="">----</option>

                        {consumptionOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.alias}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Packing Type</label>
                    <select
                        name="packing_type"
                        value={formData.packing_type}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    >
                        <option value="">----</option>

                        {packingOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div> */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Consumption Name</label>
                    <Select
                        options={consumptionOptionsMapped}
                        value={consumptionOptionsMapped.find(opt => opt.value === formData.consumption_name) || null}
                        onChange={(selectedOption) =>
                            handleChange({ target: { name: 'consumption_name', value: selectedOption?.value || '' } })
                        }
                        placeholder="Select Consumption"
                        isSearchable={true}
                    />
                </div>

                {/* Packing Type */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Packing Type</label>
                    <Select
                        options={packingOptionsMapped}
                        value={packingOptionsMapped.find(opt => opt.value === formData.packing_type) || null}
                        onChange={(selectedOption) =>
                            handleChange({ target: { name: 'packing_type', value: selectedOption?.value || '' } })
                        }
                        placeholder="Select Packing Type"
                        isSearchable={true}
                    />
                </div>


            </div>

            <div>
                <label className="text-sm font-medium">Remarks</label>
                <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full"
                />
            </div>


            {/* Dynamic attributes section */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Attributes (Label + Value)</h3>

                {formData.attributes.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded mb-3">

                        <input
                            type="text"
                            name="label"
                            placeholder="Label"
                            value={item.label}
                            onChange={(e) => handleAttributeChange(e, index)}
                            className="border p-2 rounded"
                        />

                        <input
                            type="text"
                            name="value"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => handleAttributeChange(e, index)}
                            className="border p-2 rounded"
                        />

                        <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="text-red-600 text-sm mt-2"
                        >
                            Delete
                        </button>
                    </div>
                ))}

                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={addAttribute}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Add More
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className="bg-blue-500 text-white px-5 py-2 rounded"
            >
                Submit
            </button>

        </form>
    );
};

export default ProductFormulaForm;
