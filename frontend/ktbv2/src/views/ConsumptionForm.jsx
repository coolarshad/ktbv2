import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaTrash } from 'react-icons/fa';

const ConsumptionForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Sample options for TRN dropdown
    
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        grade: '',
        sae: '',
        net_blending_qty: '',
        gross_vol_crosscheck: '',
        cross_check: '',
        total_value: '',
        per_litre_cost: '',
        remarks: '',
        consumptionAdditive: [{ name: '', qty_in_percent: null, qty_in_litre: null, value: null }],
        consumptionBaseOil: [{ name: '', qty_in_percent: null, qty_in_litre: null, value: null }],
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/costmgt/consumption/${id}`)
                .then((response) => {
                    const data = response.data;
                    setFormData((prevState) => ({
                        ...prevState,
                        ...data,
                        consumptionAdditive: data.consumptionAdditive || [{ name: '', qty_in_percent: null, qty_in_litre: null, value: null }],
                        consumptionBaseOil: data.consumptionBaseOil || [{ name: '', qty_in_percent: null, qty_in_litre: null, value: null }],
                    }));
                })
                .catch((error) => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

    const [additiveOptions, setAdditiveOptions] = useState([]);
    const [baseOilOptions, setBaseOilOptions] = useState([]);
    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params }); // Pass params to axios.get
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/costmgt/additives', { }, setAdditiveOptions); 
        fetchData('/costmgt/raw-materials', { }, setBaseOilOptions); 
    }, []);

    const handleChange = (e, section, index) => {
        const { name, value, files } = e.target;
        if (section) {
            const updatedSection = formData[section].map((item, i) =>
                i === index ? { ...item, [name]: files ? files[0] : value } : item
            );
            setFormData({ ...formData, [section]: updatedSection });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    

    const handleAddRow = (section) => {
        const newRow = { name: '', qty_in_percent: null, qty_in_litre: null, value: null };
        setFormData({ ...formData, [section]: [...formData[section], newRow] });
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();

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
        const url = mode === 'add' ? '/costmgt/consumption/' : `/costmgt/consumption/${id}/`;

        apiCall(url, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                console.log(`${mode === 'add' ? 'Consumption added' : 'Consumption updated'} successfully!`, response.data);
                navigate(`/consumptions`);
            })
            .catch((error) => {
                console.error(`There was an error ${mode === 'add' ? 'adding' : 'updating'} the consumption!`, error);
            });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Date Input */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Grade Input */}
                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                    <input
                        id="grade"
                        name="grade"
                        type="text"
                        value={formData.grade}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* SAE Input */}
                <div>
                    <label htmlFor="sae" className="block text-sm font-medium text-gray-700">SAE</label>
                    <input
                        id="sae"
                        name="sae"
                        type="text"
                        value={formData.sae}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Net Blending Quantity Input */}
                <div>
                    <label htmlFor="net_blending_qty" className="block text-sm font-medium text-gray-700">Net Blending Quantity</label>
                    <input
                        id="net_blending_qty"
                        name="net_blending_qty"
                        type="number"
                        value={formData.net_blending_qty}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Gross Vol Crosscheck Input */}
                <div>
                    <label htmlFor="gross_vol_crosscheck" className="block text-sm font-medium text-gray-700">Gross Volume Crosscheck</label>
                    <input
                        id="gross_vol_crosscheck"
                        name="gross_vol_crosscheck"
                        type="number"
                        value={formData.gross_vol_crosscheck}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Cross Check Input */}
                <div>
                    <label htmlFor="cross_check" className="block text-sm font-medium text-gray-700">Cross Check</label>
                    <input
                        id="cross_check"
                        name="cross_check"
                        type="text"
                        value={formData.cross_check}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Total Value Input */}
                <div>
                    <label htmlFor="total_value" className="block text-sm font-medium text-gray-700">Total Value</label>
                    <input
                        id="total_value"
                        name="total_value"
                        type="number"
                        value={formData.total_value}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Per Litre Cost Input */}
                <div>
                    <label htmlFor="per_litre_cost" className="block text-sm font-medium text-gray-700">Per Litre Cost</label>
                    <input
                        id="per_litre_cost"
                        name="per_litre_cost"
                        type="number"
                        value={formData.per_litre_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Remarks Input */}
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    ></textarea>
                </div>
            </div>

            {/* Section for Consumption Additive */}
            <div className="p-4 ">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Consumption Additive</h3>
                {formData.consumptionAdditive.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
                        {/* Additive Name - Spanning 2 Columns */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Additive Name</label>
                            <select
                                name="name"
                                value={item.name}
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Select Option</option>
                                {additiveOptions.map((option) => (
                                    <option key={option} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Qty in Percent */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="qty_in_percent" className="block text-sm font-medium text-gray-700">Qty in Percent</label>
                            <input
                                type="number"
                                name="qty_in_percent"
                                placeholder="Quantity in Percent"
                                value={item.qty_in_percent}
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Qty in Litre */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="qty_in_litre" className="block text-sm font-medium text-gray-700">Qty in Litre</label>
                            <input
                                type="number"
                                name="qty_in_litre"
                                placeholder="Quantity in Litre"
                                value={item.qty_in_litre}
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Value */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="Value"
                                value={item.value}
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Remove Button - Centered */}
                        <div className="col-span-1 md:col-span-1 flex items-end justify-center">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('consumptionAdditive', index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={() => handleAddRow('consumptionAdditive')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Additive
                    </button>
                </div>
            </div>

            {/* Section for Consumption Base Oil */}
            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Consumption Base Oil</h3>
                {formData.consumptionBaseOil.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
                        {/* Base Oil Name */}
                        <div className="col-span-1 md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Base Oil Name</label>
                            <select
                                name="name"
                                value={item.name}
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Select Option</option>
                                {baseOilOptions.map((option) => (
                                    <option key={option} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity in Percent */}
                        <div className="col-span-1">
                            <label htmlFor="qty_in_percent" className="block text-sm font-medium text-gray-700">Qty in Percent</label>
                            <input
                                type="number"
                                name="qty_in_percent"
                                placeholder="Quantity in Percent"
                                value={item.qty_in_percent}
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Quantity in Litre */}
                        <div className="col-span-1">
                            <label htmlFor="qty_in_litre" className="block text-sm font-medium text-gray-700">Qty in Litre</label>
                            <input
                                type="number"
                                name="qty_in_litre"
                                placeholder="Quantity in Litre"
                                value={item.qty_in_litre}
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Value */}
                        <div className="col-span-1">
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="Value"
                                value={item.value}
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            />
                        </div>

                        {/* Remove Button - Centered */}
                        <div className="col-span-1 flex items-end justify-center">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('consumptionBaseOil', index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Button */}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={() => handleAddRow('consumptionBaseOil')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Base Oil
                    </button>
                </div>
            </div>
            <hr className="my-6" />

            {/* Submit Button */}
            <div className='grid grid-cols-3 gap-4 mb-4'>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded col-span-3"
                >
                    {mode === 'add' ? 'Add Consumption' : 'Update Consumption'}
                </button>
            </div>
        </form>
    );
};

export default ConsumptionForm;
