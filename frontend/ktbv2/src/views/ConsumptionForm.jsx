import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaTrash } from 'react-icons/fa';
import SearchableSelect from '../components/SearchableSelect';


const ConsumptionForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const debounceTimerRef = useRef(null);
    // Initialize with proper default values to prevent undefined
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        alias: '',
        grade: '',
        sae: '',
        net_blending_qty: '',
        gross_vol_crosscheck: '',
        cross_check: '',
        total_value: '',
        per_litre_cost: '',
        remarks: '',
        consumptionAdditive: [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
        consumptionBaseOil: [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
    });

    const [nameOptions, setNameOptions] = useState([]);
    const [additiveOptions, setAdditiveOptions] = useState([]);
    const [baseOilOptions, setBaseOilOptions] = useState([]);

    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params });
            setStateFunction(response.data || []); // Ensure it's never undefined
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
            setStateFunction([]); // Set to empty array on error
        }
    };

    useEffect(() => {
        fetchData('/costmgt/consumption-formula', {}, setNameOptions);
        fetchData('/costmgt/additives', {}, setAdditiveOptions);
        fetchData('/costmgt/raw-materials', {}, setBaseOilOptions);
    }, []);

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/costmgt/consumption/${id}`)
                .then((response) => {
                    const data = response.data;
                    setFormData((prevState) => ({
                        ...prevState,
                        // Ensure all fields have default values
                        date: data.date || '',
                        name: data.name || '',
                        alias: data.alias || '',
                        grade: data.grade || '',
                        sae: data.sae || '',
                        net_blending_qty: data.net_blending_qty || '',
                        gross_vol_crosscheck: data.gross_vol_crosscheck || '',
                        cross_check: data.cross_check || '',
                        total_value: data.total_value || '',
                        per_litre_cost: data.per_litre_cost || '',
                        remarks: data.remarks || '',
                        consumptionAdditive: data.consumptionAdditive && data.consumptionAdditive.length > 0
                            ? data.consumptionAdditive.map(item => ({
                                name: item.name || '',
                                rate: item.rate || '',
                                qty_in_percent: item.qty_in_percent || '',
                                qty_in_litre: item.qty_in_litre || '',
                                value: item.value || ''
                            }))
                            : [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
                        consumptionBaseOil: data.consumptionBaseOil && data.consumptionBaseOil.length > 0
                            ? data.consumptionBaseOil.map(item => ({
                                name: item.name || '',
                                rate: item.rate || '',
                                qty_in_percent: item.qty_in_percent || '',
                                qty_in_litre: item.qty_in_litre || '',
                                value: item.value || ''
                            }))
                            : [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
                    }));
                })
                .catch((error) => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

    useEffect(() => {
        if (mode === 'update' && formData.net_blending_qty) {
            const fetchRatesAndRecalculate = async () => {
                try {
                    const additivePromises = formData.consumptionAdditive.map(async (item) => {
                        if (!item.name) return { ...item };
                        try {
                            const res = await axios.get(`/costmgt/additives/${item.name}/`);
                            const rate = res.data.costPriceInLiter || 0;
                            const qtyInLitre = (parseFloat(item.qty_in_percent || 0) / 100) * parseFloat(formData.net_blending_qty || 0);
                            const value = qtyInLitre * rate;
                            return { ...item, rate, qty_in_litre: qtyInLitre.toFixed(2), value: value.toFixed(2) };
                        } catch (err) {
                            console.error(`Error fetching additive ${item.name}:`, err);
                            return { ...item };
                        }
                    });

                    const baseOilPromises = formData.consumptionBaseOil.map(async (item) => {
                        if (!item.name) return { ...item };
                        try {
                            const res = await axios.get(`/costmgt/raw-materials/${item.name}/`);
                            const rate = res.data.cost_per_liter || 0;
                            const qtyInLitre = (parseFloat(item.qty_in_percent || 0) / 100) * parseFloat(formData.net_blending_qty || 0);
                            const value = qtyInLitre * rate;
                            return { ...item, rate, qty_in_litre: qtyInLitre.toFixed(2), value: value.toFixed(2) };
                        } catch (err) {
                            console.error(`Error fetching base oil ${item.name}:`, err);
                            return { ...item };
                        }
                    });

                    const [updatedAdditives, updatedBaseOils] = await Promise.all([
                        Promise.all(additivePromises),
                        Promise.all(baseOilPromises),
                    ]);

                    // Compute totals again
                    const allItems = [...updatedAdditives, ...updatedBaseOils];
                    const totalQtyPercent = allItems.reduce((sum, item) => sum + parseFloat(item.qty_in_percent || 0), 0);
                    const totalQtyLitre = allItems.reduce((sum, item) => sum + parseFloat(item.qty_in_litre || 0), 0);
                    const totalValue = allItems.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
                    const perLitreCost = formData.net_blending_qty > 0 ? totalValue / formData.net_blending_qty : 0;

                    setFormData((prev) => ({
                        ...prev,
                        consumptionAdditive: updatedAdditives,
                        consumptionBaseOil: updatedBaseOils,
                        cross_check: totalQtyPercent.toFixed(2),
                        gross_vol_crosscheck: totalQtyLitre.toFixed(2),
                        total_value: totalValue.toFixed(2),
                        per_litre_cost: perLitreCost.toFixed(2),
                    }));
                } catch (err) {
                    console.error("Error auto-filling rates on update:", err);
                }
            };

            fetchRatesAndRecalculate();
        }
    }, [mode, formData.net_blending_qty]);

    const [hasFilledRates, setHasFilledRates] = useState(false);

    useEffect(() => {
        if (mode === 'update' && formData.net_blending_qty && !hasFilledRates) {
            setHasFilledRates(true);
            // call fetchRatesAndRecalculate() here
        }
    }, [mode, formData.net_blending_qty]);



    const handleChange = (e, section, index) => {
        const { name, value, files } = e.target;
        const actualValue = files ? files[0] : (value || '');

        // Handle net_blending_qty logic
        if (name === 'net_blending_qty') {
            const newQty = parseFloat(value);
            if (!isNaN(newQty)) {
                setFormData((prev) => ({ ...prev, net_blending_qty: newQty }));

                // Debounce updateConsumptionData
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = setTimeout(() => {
                    updateConsumptionData(formData, newQty);
                }, 2000);
            }
        }

        if (section) {
            setFormData((prev) => {
                const updatedSection = [...prev[section]];
                const updatedItem = { ...updatedSection[index], [name]: actualValue };

                // 🔹 Auto-update rate if additive name is selected
                if (section === 'consumptionAdditive' && name === 'name') {
                    const selectedAdditive = additiveOptions.find(
                        (opt) => opt.id === parseInt(value)
                    );
                    updatedItem.rate = selectedAdditive ? selectedAdditive.costPriceInLiter : '';
                }
                // 🔹 Auto-update rate if raw material name is selected
                if (section === 'consumptionBaseOil' && name === 'name') {
                    const selectedBaseOil = baseOilOptions.find(
                        (opt) => opt.id === parseInt(value)
                    );
                    updatedItem.rate = selectedBaseOil ? selectedBaseOil.cost_per_liter : '';
                }

                updatedSection[index] = updatedItem;
                return { ...prev, [section]: updatedSection };
            });
        } else {
            setFormData((prev) => ({ ...prev, [name]: actualValue }));
        }
    };


    const handleNameChange = async (e) => {
        const selectedName = e.target.value || '';

        if (!selectedName) {
            // Reset form when no selection
            setFormData(prev => ({
                ...prev,
                name: '',
                sae: '',
                grade: '',
                consumptionAdditive: [{ name: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
                consumptionBaseOil: [{ name: '', qty_in_percent: '', qty_in_litre: '', value: '' }]
            }));
            return;
        }

        try {
            const res = await axios.get(`/costmgt/consumption-formula/${selectedName}/`);
            const data = res.data;

            const additives = (data.consumptionFormulaAdditive || []).map((item) => ({
                id: item.id || '',
                name: item.name || '',
                rate: item.rate || '',
                qty_in_percent: item.qty_in_percent || '',
                qty_in_litre: '',
                value: ''
            }));

            const baseOils = (data.consumptionFormulaBaseOil || []).map((item) => ({
                id: item.id || '',
                name: item.name || '',
                rate: item.rate || '',
                qty_in_percent: item.qty_in_percent || '',
                qty_in_litre: '',
                value: ''
            }));

            setFormData((prev) => ({
                ...prev,
                name: data.id || '',
                sae: data.sae || '',
                grade: data.grade || '',
                consumptionAdditive: additives.length > 0 ? additives : [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }],
                consumptionBaseOil: baseOils.length > 0 ? baseOils : [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }]
            }));


        } catch (err) {
            console.error("Failed to fetch formula data", err);
        }
    };



    const updateConsumptionData = async (currentFormData, netBlendingQty) => {
        try {
            const additivePromises = currentFormData.consumptionAdditive.map(async (item) => {
                if (!item.name || !item.qty_in_percent) return { ...item };

                try {
                    const res = await axios.get(`/costmgt/additives/${item.name}/`);
                    const rate = res.data.costPriceInLiter || 0;

                    const qtyInLitre = (item.qty_in_percent / 100) * netBlendingQty;
                    const value = qtyInLitre * rate;

                    return {
                        ...item,
                        rate: rate,
                        qty_in_litre: qtyInLitre.toFixed(2),
                        value: value.toFixed(2),
                    };
                } catch (err) {
                    console.error(`Error fetching additive ${item.name}:`, err);
                    return { ...item };
                }
            });

            const baseOilPromises = currentFormData.consumptionBaseOil.map(async (item) => {
                if (!item.name || !item.qty_in_percent) return { ...item };

                try {
                    const res = await axios.get(`/costmgt/raw-materials/${item.name}/`);
                    const rate = res.data.cost_per_liter || 0;

                    const qtyInLitre = (item.qty_in_percent / 100) * netBlendingQty;
                    const value = qtyInLitre * rate;

                    return {
                        ...item,
                        rate: rate,
                        qty_in_litre: qtyInLitre.toFixed(2),
                        value: value.toFixed(2),
                    };
                } catch (err) {
                    console.error(`Error fetching base oil ${item.name}:`, err);
                    return { ...item };
                }
            });

            const [updatedAdditives, updatedBaseOils] = await Promise.all([
                Promise.all(additivePromises),
                Promise.all(baseOilPromises),
            ]);

            // Convert strings back to numbers for summing
            const allItems = [...updatedAdditives, ...updatedBaseOils];
            const totalQtyPercent = allItems.reduce((sum, item) => sum + parseFloat(item.qty_in_percent || 0), 0);
            const totalQtyLitre = allItems.reduce((sum, item) => sum + parseFloat(item.qty_in_litre || 0), 0);
            const totalValue = allItems.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
            const perLitreCost = netBlendingQty > 0 ? totalValue / netBlendingQty : 0;

            setFormData((prev) => ({
                ...prev,
                consumptionAdditive: updatedAdditives,
                consumptionBaseOil: updatedBaseOils,
                cross_check: totalQtyPercent.toFixed(2),
                gross_vol_crosscheck: totalQtyLitre.toFixed(2),
                total_value: totalValue.toFixed(2),
                per_litre_cost: perLitreCost.toFixed(2),
            }));
        } catch (err) {
            console.error("Error updating consumption data:", err);
        }
    };







    const handleAddRow = (section) => {
        const newRow = { name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' };
        setFormData({ ...formData, [section]: [...formData[section], newRow] });
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        // Ensure at least one row remains
        const finalSection = updatedSection.length > 0 ? updatedSection : [{ name: '', rate: '', qty_in_percent: '', qty_in_litre: '', value: '' }];
        setFormData({ ...formData, [section]: finalSection });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        for (const [key, value] of Object.entries(formData)) {
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    for (const [subKey, subValue] of Object.entries(item)) {
                        formDataToSend.append(`${key}[${index}].${subKey}`, subValue || '');
                    }
                });
            } else {
                formDataToSend.append(key, value || '');
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
            <p className="text-xl text-center">Consumption & Blending Form</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Date Input */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="alias"
                        name="alias"
                        type="text"
                        value={formData.alias || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Formula</label>
                    <select
                        id="name"
                        name="name"
                        value={formData.name || ''} // Ensure never undefined
                        onChange={handleNameChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Option</option>
                        {nameOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div> */}
                <SearchableSelect
                    label="Formula"
                    options={nameOptions}     // [{id, name}]
                    value={formData.name}
                    onChange={(val) =>
                        setFormData(prev => ({ ...prev, name: val }))
                    }
                    placeholder="Select Formula"
                />

                {/* Grade Input */}
                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                    <input
                        id="grade"
                        name="grade"
                        type="text"
                        value={formData.grade || ''} // Ensure never undefined
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
                        value={formData.sae || ''} // Ensure never undefined
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
                        value={formData.net_blending_qty || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        step={0.0001}
                    />
                </div>

                {/* Gross Vol Crosscheck Input */}
                <div>
                    <label htmlFor="gross_vol_crosscheck" className="block text-sm font-medium text-gray-700">Gross Volume Crosscheck</label>
                    <input
                        id="gross_vol_crosscheck"
                        name="gross_vol_crosscheck"
                        type="number"
                        value={formData.gross_vol_crosscheck || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        step={0.0001}
                    />
                </div>

                {/* Cross Check Input */}
                <div>
                    <label htmlFor="cross_check" className="block text-sm font-medium text-gray-700">Cross Check</label>
                    <input
                        id="cross_check"
                        name="cross_check"
                        type="text"
                        value={formData.cross_check || ''} // Ensure never undefined
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
                        value={formData.total_value || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        step={0.01}
                    />
                </div>

                {/* Per Litre Cost Input */}
                <div>
                    <label htmlFor="per_litre_cost" className="block text-sm font-medium text-gray-700">Per Litre Cost</label>
                    <input
                        id="per_litre_cost"
                        name="per_litre_cost"
                        type="number"
                        value={formData.per_litre_cost || ''} // Ensure never undefined
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        step={0.01}
                    />
                </div>

                {/* Remarks Input */}
                <div className="col-span-3">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks || ''}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full"
                    ></textarea>
                </div>
            </div>

            {/* Section for Consumption Additive */}
            <div className="p-4 ">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Consumption Additive</h3>
                {formData.consumptionAdditive.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                        {/* Additive Name - Spanning 2 Columns */}
                        {/* <div className="col-span-1 md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Additive Name</label>
                            <select
                                name="name"
                                value={item.name || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Select Option</option>
                                {additiveOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div> */}
                        <div className="col-span-1 md:col-span-2">
                            <SearchableSelect
                                label="Additive Name"
                                options={additiveOptions}     // [{id, name}]
                                value={item.name || ''}
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                placeholder="Select Option"
                            />
                        </div>
                        {/* Rate */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate</label>
                            <input
                                type="number"
                                name="rate"
                                placeholder="Rate"
                                value={item.rate || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                readOnly={true}
                                step={0.01}
                            />
                        </div>

                        {/* Qty in Percent */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="qty_in_percent" className="block text-sm font-medium text-gray-700">Qty in Percent</label>
                            <input
                                type="number"
                                name="qty_in_percent"
                                placeholder="Quantity in Percent"
                                value={item.qty_in_percent || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.0001}
                            />
                        </div>

                        {/* Qty in Litre */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="qty_in_litre" className="block text-sm font-medium text-gray-700">Qty in Litre</label>
                            <input
                                type="number"
                                name="qty_in_litre"
                                placeholder="Quantity in Litre"
                                value={item.qty_in_litre || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.0001}
                            />
                        </div>

                        {/* Value */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="Value"
                                value={item.value || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.01}
                            />
                        </div>

                        {/* Remove Button - Centered */}
                        {/* <div className="col-span-1 md:col-span-1 flex items-end justify-center">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('consumptionAdditive', index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                <FaTrash />
                            </button>
                        </div> */}
                    </div>
                ))}

                {/* Add Button */}
                {/* <div className="text-right">
                    <button
                        type="button"
                        onClick={() => handleAddRow('consumptionAdditive')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Additive
                    </button>
                </div> */}
            </div>

            {/* Section for Consumption Base Oil */}
            <div className="p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Consumption Base Oil</h3>
                {formData.consumptionBaseOil.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                        {/* Base Oil Name */}
                        {/* <div className="col-span-1 md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Base Oil Name</label>
                            <select
                                name="name"
                                value={item.name || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                            >
                                <option value="">Select Option</option>
                                {baseOilOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div> */}
                        <div className="col-span-1 md:col-span-2">
                            <SearchableSelect
                                label="Base Oil Name"
                                options={baseOilOptions}     // [{id, name}]
                                value={item.name || ''}
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                placeholder="Select Option"
                            />
                        </div>

                        {/* Rate */}
                        <div className="col-span-1 md:col-span-1">
                            <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate</label>
                            <input
                                type="number"
                                name="rate"
                                placeholder="Rate"
                                value={item.rate || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionAdditive', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                readOnly={true}
                                step={0.01}
                            />
                        </div>

                        {/* Quantity in Percent */}
                        <div className="col-span-1">
                            <label htmlFor="qty_in_percent" className="block text-sm font-medium text-gray-700">Qty in Percent</label>
                            <input
                                type="number"
                                name="qty_in_percent"
                                placeholder="Quantity in Percent"
                                value={item.qty_in_percent || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.0001}
                            />
                        </div>

                        {/* Quantity in Litre */}
                        <div className="col-span-1">
                            <label htmlFor="qty_in_litre" className="block text-sm font-medium text-gray-700">Qty in Litre</label>
                            <input
                                type="number"
                                name="qty_in_litre"
                                placeholder="Quantity in Litre"
                                value={item.qty_in_litre || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.0001}
                            />
                        </div>

                        {/* Value */}
                        <div className="col-span-1">
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Value</label>
                            <input
                                type="number"
                                name="value"
                                placeholder="Value"
                                value={item.value || ''} // Ensure never undefined
                                onChange={(e) => handleChange(e, 'consumptionBaseOil', index)}
                                className="border border-gray-300 p-2 rounded w-full"
                                step={0.01}
                            />
                        </div>

                        {/* Remove Button - Centered */}
                        {/* <div className="col-span-1 flex items-end justify-center">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('consumptionBaseOil', index)}
                                className="bg-red-500 text-white p-2 rounded"
                            >
                                <FaTrash />
                            </button>
                        </div> */}
                    </div>
                ))}

                {/* Add Button */}
                {/* <div className="text-right">
                    <button
                        type="button"
                        onClick={() => handleAddRow('consumptionBaseOil')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Base Oil
                    </button>
                </div> */}
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