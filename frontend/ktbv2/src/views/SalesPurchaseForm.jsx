import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

const SalesPurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        trn: '',
        invoice_date: '',
        invoice_number: '',
        invoice_amount: '',
        commission_value: '',
        bl_number: '',
        bl_qty: '',
        bl_fees: '',
        bl_collection_cost: '',
        bl_date: '',
        total_packing_cost: '',
        packaging_supplier: '',
        logistic_supplier: '',
        batch_number: '',
        production_date: '',
        logistic_cost: '',
        logistic_cost_due_date: '',
        liner: '',
        pod: '',
        pol: '',
        etd: '',
        eta: '',
        shipment_status: '',
        remarks: '',
        extraCharges: [{ name: '', charge: '' }],
        packingLists: [{ name: '', packing_list: null }],
        blCopies: [{ name: '', bl_copy: null }],
        invoices: [{ name: '', invoice: null }],
        coas: [{ name: '', coa: null }],
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/sales-purchases/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        invoice_date: data.invoice_date,
                        invoice_number: data.invoice_number,
                        invoice_amount: data.invoice_amount,
                        commission_value: data.commission_value,
                        bl_number: data.bl_number,
                        bl_qty: data.bl_qty,
                        bl_fees: data.bl_fees,
                        bl_collection_cost: data.bl_collection_cost,
                        bl_date: data.bl_date,
                        total_packing_cost: data.total_packing_cost,
                        packaging_supplier: data.packaging_supplier,
                        logistic_supplier: data.logistic_supplier,
                        batch_number: data.batch_number,
                        production_date: data.production_date,
                        logistic_cost: data.logistic_cost,
                        logistic_cost_due_date: data.logistic_cost_due_date,
                        liner: data.liner,
                        pod: data.pod,
                        pol: data.pol,
                        etd: data.etd,
                        eta: data.eta,
                        shipment_status: data.shipment_status,
                        remarks: data.remarks,
                        extraCharges: data.extraCharges || [{ name: '', charge: '' }],
                        packingLists: data.packingLists || [{ name: '', packing_list: null }],
                        blCopies: data.blCopies || [{ name: '', bl_copy: null }],
                        invoices: data.invoices || [{ name: '', invoice: null }],
                        coas: data.coas || [{ name: '', coa: null }]
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the trade data!', error);
                });
        }
    }, [mode, id]);



    const handleChange = (e, arrayName, index) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => {
                const updatedArray = [...prev[arrayName]];
                updatedArray[index][name] = files[0];
                return { ...prev, [arrayName]: updatedArray };
            });
        } else {
            setFormData(prev => {
                const updatedArray = [...prev[arrayName]];
                updatedArray[index][name] = value;
                return { ...prev, [arrayName]: updatedArray };
            });
        }
    };

    const handleAddRow = (arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], { name: '', charge: '' }]
        }));
    };

    const handleRemoveRow = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);

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
        console.log(formDataToSend)
        if (mode === 'add') {
            axios.post('/trademgt/sales-purchases/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Sales/Purchase added successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error adding the trade!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/sales-purchases/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Sales/Purchase updated successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* SalesPurchase Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <input
                        id="trn"
                        name="trn"
                        type="text"
                        value={formData.trn}
                        onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700">Invoice Date</label>
                    <input
                        id="invoice_date"
                        name="invoice_date"
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">Invoice Number</label>
                    <input
                        id="invoice_number"
                        name="invoice_number"
                        type="text"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="invoice_amount" className="block text-sm font-medium text-gray-700">Invoice Amount</label>
                    <input
                        id="invoice_amount"
                        name="invoice_amount"
                        type="number"
                        value={formData.invoice_amount}
                        onChange={(e) => setFormData({ ...formData, invoice_amount: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Value</label>
                    <input
                        id="commission_value"
                        name="commission_value"
                        type="number"
                        value={formData.commission_value}
                        onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="bl_number" className="block text-sm font-medium text-gray-700">BL Number</label>
                    <input
                        id="bl_number"
                        name="bl_number"
                        type="text"
                        value={formData.bl_number}
                        onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="bl_qty" className="block text-sm font-medium text-gray-700">BL Quantity</label>
                    <input
                        id="bl_qty"
                        name="bl_qty"
                        type="number"
                        value={formData.bl_qty}
                        onChange={(e) => setFormData({ ...formData, bl_qty: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="bl_fees" className="block text-sm font-medium text-gray-700">BL Fees</label>
                    <input
                        id="bl_fees"
                        name="bl_fees"
                        type="number"
                        value={formData.bl_fees}
                        onChange={(e) => setFormData({ ...formData, bl_fees: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="bl_collection_cost" className="block text-sm font-medium text-gray-700">BL Collection Cost</label>
                    <input
                        id="bl_collection_cost"
                        name="bl_collection_cost"
                        type="number"
                        value={formData.bl_collection_cost}
                        onChange={(e) => setFormData({ ...formData, bl_collection_cost: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="bl_date" className="block text-sm font-medium text-gray-700">BL Date</label>
                    <input
                        id="bl_date"
                        name="bl_date"
                        type="date"
                        value={formData.bl_date}
                        onChange={(e) => setFormData({ ...formData, bl_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                    <input
                        id="total_packing_cost"
                        name="total_packing_cost"
                        type="number"
                        value={formData.total_packing_cost}
                        onChange={(e) => setFormData({ ...formData, total_packing_cost: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                    <input
                        id="packaging_supplier"
                        name="packaging_supplier"
                        type="text"
                        value={formData.packaging_supplier}
                        onChange={(e) => setFormData({ ...formData, packaging_supplier: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="logistic_supplier" className="block text-sm font-medium text-gray-700">Logistic Supplier</label>
                    <input
                        id="logistic_supplier"
                        name="logistic_supplier"
                        type="text"
                        value={formData.logistic_supplier}
                        onChange={(e) => setFormData({ ...formData, logistic_supplier: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                        id="batch_number"
                        name="batch_number"
                        type="text"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="production_date" className="block text-sm font-medium text-gray-700">Production Date</label>
                    <input
                        id="production_date"
                        name="production_date"
                        type="date"
                        value={formData.production_date}
                        onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="logistic_cost" className="block text-sm font-medium text-gray-700">Logistic Cost</label>
                    <input
                        id="logistic_cost"
                        name="logistic_cost"
                        type="number"
                        value={formData.logistic_cost}
                        onChange={(e) => setFormData({ ...formData, logistic_cost: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="logistic_cost_due_date" className="block text-sm font-medium text-gray-700">Logistic Cost Due Date</label>
                    <input
                        id="logistic_cost_due_date"
                        name="logistic_cost_due_date"
                        type="text"
                        value={formData.logistic_cost_due_date}
                        onChange={(e) => setFormData({ ...formData, logistic_cost_due_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="liner" className="block text-sm font-medium text-gray-700">Liner</label>
                    <input
                        id="liner"
                        name="liner"
                        type="text"
                        value={formData.liner}
                        onChange={(e) => setFormData({ ...formData, liner: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="pod" className="block text-sm font-medium text-gray-700">POD</label>
                    <input
                        id="pod"
                        name="pod"
                        type="text"
                        value={formData.pod}
                        onChange={(e) => setFormData({ ...formData, pod: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="pol" className="block text-sm font-medium text-gray-700">POL</label>
                    <input
                        id="pol"
                        name="pol"
                        type="text"
                        value={formData.pol}
                        onChange={(e) => setFormData({ ...formData, pol: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="etd" className="block text-sm font-medium text-gray-700">ETD</label>
                    <input
                        id="etd"
                        name="etd"
                        type="date"
                        value={formData.etd}
                        onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="eta" className="block text-sm font-medium text-gray-700">ETA</label>
                    <input
                        id="eta"
                        name="eta"
                        type="date"
                        value={formData.eta}
                        onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="shipment_status" className="block text-sm font-medium text-gray-700">Shipment Status</label>
                    <input
                        id="shipment_status"
                        name="shipment_status"
                        type="text"
                        value={formData.shipment_status}
                        onChange={(e) => setFormData({ ...formData, shipment_status: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        id="remarks"
                        name="remarks"
                        type="text"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Add more SalesPurchase fields as needed */}

            <hr className="my-6" />

            {/* SalesPurchaseExtraCharge Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Extra Charges</h3>
                {formData.extraCharges.map((extraCharge, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`extra_charge_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`extra_charge_name_${index}`}
                                name="name"
                                type="text"
                                value={extraCharge.name}
                                onChange={(e) => handleChange(e, 'extraCharges', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`extra_charge_${index}`} className="block text-sm font-medium text-gray-700">Charge</label>
                            <input
                                id={`extra_charge_${index}`}
                                name="charge"
                                type="number"
                                value={extraCharge.charge}
                                onChange={(e) => handleChange(e, 'extraCharges', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('extraCharges', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow('extraCharges')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Extra Charge
                </button>
            </div>

            {/* PackingList Section */}
            <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium text-gray-900">Packing Lists</h3>
                {formData.packingLists.map((packingList, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`packing_list_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`packing_list_name_${index}`}
                                name="name"
                                type="text"
                                value={packingList.name}
                                onChange={(e) => handleChange(e, 'packingLists', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`packing_list_file_${index}`} className="block text-sm font-medium text-gray-700">Packing List</label>
                            <input
                                id={`packing_list_file_${index}`}
                                name="packing_list"
                                type="file"
                                onChange={(e) => handleChange(e, 'packingLists', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('packingLists', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow('packingLists')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Packing List
                </button>
            </div>

            {/* BL_Copy Section */}
            <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium text-gray-900">BL Copies</h3>
                {formData.blCopies.map((blCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`bl_copy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`bl_copy_name_${index}`}
                                name="name"
                                type="text"
                                value={blCopy.name}
                                onChange={(e) => handleChange(e, 'blCopies', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`bl_copy_file_${index}`} className="block text-sm font-medium text-gray-700">BL Copy</label>
                            <input
                                id={`bl_copy_file_${index}`}
                                name="bl_copy"
                                type="file"
                                onChange={(e) => handleChange(e, 'blCopies', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('blCopies', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow('blCopies')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add BL Copy
                </button>
            </div>

            {/* Invoice Section */}
            <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                {formData.invoices.map((invoice, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`invoice_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`invoice_name_${index}`}
                                name="name"
                                type="text"
                                value={invoice.name}
                                onChange={(e) => handleChange(e, 'invoices', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`invoice_file_${index}`} className="block text-sm font-medium text-gray-700">Invoice</label>
                            <input
                                id={`invoice_file_${index}`}
                                name="invoice"
                                type="file"
                                onChange={(e) => handleChange(e, 'invoices', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('invoices', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow('invoices')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Invoice
                </button>
            </div>

            {/* COA Section */}
            <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium text-gray-900">COAs</h3>
                {formData.coas.map((coa, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`coa_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`coa_name_${index}`}
                                name="name"
                                type="text"
                                value={coa.name}
                                onChange={(e) => handleChange(e, 'coas', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`coa_file_${index}`} className="block text-sm font-medium text-gray-700">COA</label>
                            <input
                                id={`coa_file_${index}`}
                                name="coa"
                                type="file"
                                onChange={(e) => handleChange(e, 'coas', index)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('coas', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow('coas')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add COA
                </button>
            </div>

            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Submit
            </button>
        </form>
    );
};

export default SalesPurchaseForm;
