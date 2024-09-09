import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const FinalProductForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        packing_size: '',
        bottles_per_pack: '',
        liters_per_pack: '',
        total_qty: '',
        total_qty_unit: '',
        qty_in_liters: '',
        per_liter_cost: '',
        cost_per_case: '',
        dk_cost: '',
        price_per_bottle: '',
        price_per_label: '',
        price_per_bottle_cap: '',
        bottle_per_case: '',
        label_per_case: '',
        bottle_cap_per_case: '',
        price_per_carton: '',
        dk_exprice: '',
        ks_cost: '',
        total_factory_price: '',
        freight_logistic: '',
        total_cif_price: '',
        remarks: '',
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/costmgt/final-products/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        date: data.date,
                        name: data.name,
                        packing_size: data.packing_size,
                        bottles_per_pack: data.bottles_per_pack,
                        liters_per_pack: data.liters_per_pack,
                        total_qty: data.total_qty,
                        total_qty_unit: data.total_qty_unit,
                        qty_in_liters: data.qty_in_liters,
                        per_liter_cost: data.per_liter_cost,
                        cost_per_case: data.cost_per_case,
                        dk_cost: data.dk_cost,
                        price_per_bottle: data.price_per_bottle,
                        price_per_label: data.price_per_label,
                        price_per_bottle_cap: data.price_per_bottle_cap,
                        bottle_per_case: data.bottle_per_case,
                        label_per_case: data.label_per_case,
                        bottle_cap_per_case: data.bottle_cap_per_case,
                        price_per_carton: data.price_per_carton,
                        dk_exprice: data.dk_exprice,
                        ks_cost: data.ks_cost,
                        total_factory_price: data.total_factory_price,
                        freight_logistic: data.freight_logistic,
                        total_cif_price: data.total_cif_price,
                        remarks: data.remarks,
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the final product data!', error);
                });
        }
    }, [mode, id]);

    const [nameOptions, setNameOptions] = useState([]);
    const [packingSizeOptions, setPackingSizeOptions] = useState([]);
    const [bottleOptions, setBottleOptions] = useState([]);
    const [labelOptions, setLabelOptions] = useState([]);
    const [bottleCapOptions, setBottleCapOptions] = useState([]);
    const [cartonOptions, setCartonOptions] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params }); // Pass params to axios.get
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/trademgt/unit', { }, setUnitOptions); 
        fetchData('/costmgt/consumption', { }, setNameOptions); 
        fetchData('/costmgt/packings', { }, setPackingSizeOptions); 
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(formData);
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
        // console.log(formDataToSend)
        if (mode === 'add') {
            axios.post('/costmgt/final-products/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Final Product added successfully!', response.data);
                navigate(`/final-products`);
            })
            .catch(error => {
                console.error('There was an error adding the final product!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/costmgt/final-products/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Final Products updated successfully!', response.data);
                navigate(`/final-products`);
            })
            .catch(error => {
                console.error('There was an error updating the final product!', error);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                    <select
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select product</option>
                        {nameOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div >
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
                <div>
                    <label htmlFor="packing_size" className="block text-sm font-medium text-gray-700">Packing Size</label>
                    <select
                        id="packing_size"
                        name="packing_size"
                        value={formData.packing_size}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select packing size</option>
                        {packingSizeOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="bottles_per_pack" className="block text-sm font-medium text-gray-700">Bottles Per Pack</label>
                    <input
                        id="bottles_per_pack"
                        name="bottles_per_pack"
                        type="text"
                        value={formData.bottles_per_pack}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="liters_per_pack" className="block text-sm font-medium text-gray-700">Liters Per Pack</label>
                    <input
                        id="liters_per_pack"
                        name="liters_per_pack"
                        type="text"
                        value={formData.liters_per_pack}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total_qty" className="block text-sm font-medium text-gray-700">Total Qty</label>
                    <input
                        id="total_qty"
                        name="total_qty"
                        type="text"
                        value={formData.total_qty}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total_qty_unit" className="block text-sm font-medium text-gray-700">Total Qty Unit</label>
                    <select
                        id="total_qty_unit"
                        name="total_qty_unit"
                        value={formData.total_qty_unit}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select unit</option>
                        {unitOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="qty_in_liters" className="block text-sm font-medium text-gray-700">Qty in Litres</label>
                    <input
                        id="qty_in_liters"
                        name="qty_in_liters"
                        type="text"
                        value={formData.qty_in_liters}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="per_liter_cost" className="block text-sm font-medium text-gray-700">Per Litre Cost</label>
                    <input
                        id="per_liter_cost"
                        name="per_liter_cost"
                        type="text"
                        value={formData.per_liter_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="cost_per_case" className="block text-sm font-medium text-gray-700">Cost Per Case</label>
                    <input
                        id="cost_per_case"
                        name="cost_per_case"
                        type="text"
                        value={formData.cost_per_case}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="dk_cost" className="block text-sm font-medium text-gray-700">DK Cost</label>
                    <input
                        id="dk_cost"
                        name="dk_cost"
                        type="text"
                        value={formData.dk_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="price_per_bottle" className="block text-sm font-medium text-gray-700">Price Per Bottle</label>
                    <select
                        id="price_per_bottle"
                        name="price_per_bottle"
                        value={formData.price_per_bottle}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select Option</option>
                        {bottleOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="price_per_label" className="block text-sm font-medium text-gray-700">Price Per Label</label>
                    <select
                        id="price_per_label"
                        name="price_per_label"
                        value={formData.price_per_label}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select Option</option>
                        {labelOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="price_per_bottle_cap" className="block text-sm font-medium text-gray-700">Price Per Bottle Cap</label>
                    <select
                        id="price_per_bottle_cap"
                        name="price_per_bottle_cap"
                        value={formData.price_per_bottle_cap}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select Option</option>
                        {bottleCapOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="bottle_per_case" className="block text-sm font-medium text-gray-700">Bottle Per Case</label>
                    <input
                        id="bottle_per_case"
                        name="bottle_per_case"
                        type="text"
                        value={formData.bottle_per_case}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="label_per_case" className="block text-sm font-medium text-gray-700">Label Per Case</label>
                    <input
                        id="label_per_case"
                        name="label_per_case"
                        type="text"
                        value={formData.label_per_case}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="bottle_cap_per_case" className="block text-sm font-medium text-gray-700">Bottle Cap Per Case</label>
                    <input
                        id="bottle_cap_per_case"
                        name="bottle_cap_per_case"
                        type="text"
                        value={formData.bottle_cap_per_case}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="price_per_carton" className="block text-sm font-medium text-gray-700">Price Per Carton</label>
                    <select
                        id="price_per_carton"
                        name="price_per_carton"
                        value={formData.price_per_carton}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        {/* Provide options for the dropdown here */}
                        <option value="">Select Option</option>
                        {cartonOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="dk_exprice" className="block text-sm font-medium text-gray-700">DK Ex Price</label>
                    <input
                        id="dk_exprice"
                        name="dk_exprice"
                        type="text"
                        value={formData.dk_exprice}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="ks_cost" className="block text-sm font-medium text-gray-700">KS Cost</label>
                    <input
                        id="ks_cost"
                        name="ks_cost"
                        type="text"
                        value={formData.ks_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total_factory_price" className="block text-sm font-medium text-gray-700">Total Factory Price</label>
                    <input
                        id="total_factory_price"
                        name="total_factory_price"
                        type="text"
                        value={formData.total_factory_price}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="freight_logistic" className="block text-sm font-medium text-gray-700">Freight & Logistic</label>
                    <input
                        id="freight_logistic"
                        name="freight_logistic"
                        type="text"
                        value={formData.freight_logistic}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total_cif_price" className="block text-sm font-medium text-gray-700">Total CIF Price</label>
                    <input
                        id="total_cif_price"
                        name="total_cif_price"
                        type="text"
                        value={formData.total_cif_price}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        id="remarks"
                        name="remarks"
                        type="text"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
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

export default FinalProductForm;