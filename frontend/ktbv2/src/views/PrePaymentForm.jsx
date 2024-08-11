import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

const PrePaymentForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    // Sample options for TRN dropdown
    const trnOptions = [
        { value: 'trn1', label: 'TRN 1' },
        { value: 'trn2', label: 'TRN 2' },
        { value: 'trn3', label: 'TRN 3' }
    ];

    const [formData, setFormData] = useState({
        trn: '',
        lc_number: '',
        lc_opening_bank: '',
        advance_received: '',
        date_of_receipt: '',
        advance_paid: '',
        date_of_payment: '',
        lc_expiry_date: '',
        latest_shipment_date_in_lc: '',
        remarks: '',
        lcCopies: [{ name: '', lc_copy: null }],
        lcAmmendments: [{ name: '', lc_ammendment: null }],
        advanceTTCopies: [{ name: '', advance_tt_copy: null }]
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/pre-payments/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        lc_number: data.lc_number,
                        lc_opening_bank: data.lc_opening_bank,
                        advance_received: data.advance_received,
                        date_of_receipt: data.date_of_receipt,
                        advance_paid: data.advance_paid,
                        date_of_payment: data.date_of_payment,
                        lc_expiry_date: data.lc_expiry_date,
                        latest_shipment_date_in_lc: data.latest_shipment_date_in_lc,
                        remarks: data.remarks,
                        lcCopies: data.lcCopies || [{ name: '', lc_copy: null }],
                        lcAmmendments: data.lcAmmendments  || [{ name: '', lc_ammendment: null }],
                        advanceTTCopies: data.advanceTTCopies  || [{ name: '', advance_tt_copy: null }]
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the trade data!', error);
                });
        }
    }, [mode, id]);

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
        const newRow = { name: '', [section === 'lcCopies' ? 'lc_copy' : section === 'lcAmmendments' ? 'lc_ammendment' : 'advance_tt_copy']: null };
        setFormData({ ...formData, [section]: [...formData[section], newRow] });
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
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
            axios.post('/trademgt/pre-payments/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Prepayment added successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error adding the trade!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/pre-payments/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Prepayment updated successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <select
                        id="trn"
                        name="trn"
                        value={formData.trn}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select TRN</option>
                        {trnOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="lc_number" className="block text-sm font-medium text-gray-700">LC Number</label>
                    <input
                        id="lc_number"
                        name="lc_number"
                        type="text"
                        value={formData.lc_number}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_opening_bank" className="block text-sm font-medium text-gray-700">LC Opening Bank</label>
                    <input
                        id="lc_opening_bank"
                        name="lc_opening_bank"
                        type="text"
                        value={formData.lc_opening_bank}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_received" className="block text-sm font-medium text-gray-700">Advance Received</label>
                    <input
                        id="advance_received"
                        name="advance_received"
                        type="number"
                        value={formData.advance_received}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_receipt" className="block text-sm font-medium text-gray-700">Date of Receipt</label>
                    <input
                        id="date_of_receipt"
                        name="date_of_receipt"
                        type="text"
                        value={formData.date_of_receipt}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700">Advance Paid</label>
                    <input
                        id="advance_paid"
                        name="advance_paid"
                        type="number"
                        value={formData.advance_paid}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_payment" className="block text-sm font-medium text-gray-700">Date of Payment</label>
                    <input
                        id="date_of_payment"
                        name="date_of_payment"
                        type="text"
                        value={formData.date_of_payment}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_expiry_date" className="block text-sm font-medium text-gray-700">LC Expiry Date</label>
                    <input
                        id="lc_expiry_date"
                        name="lc_expiry_date"
                        type="text"
                        value={formData.lc_expiry_date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="latest_shipment_date_in_lc" className="block text-sm font-medium text-gray-700">Latest Shipment Date in LC</label>
                    <input
                        id="latest_shipment_date_in_lc"
                        name="latest_shipment_date_in_lc"
                        type="text"
                        value={formData.latest_shipment_date_in_lc}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                {/* Remarks field spanning across all columns */}
                <div className="md:col-span-3">
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

            {/* Horizontal Separator */}
            <hr className="my-6 border-t-2 border-gray-300" />

            {/* LcCopy Section */}
            <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium text-gray-900">LC Copies</h3>
                {formData.lcCopies.map((lcCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`lc_copy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`lc_copy_name_${index}`}
                                name="name"
                                type="text"
                                value={lcCopy.name}
                                onChange={(e) => handleChange(e, 'lcCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`lc_copy_${index}`} className="block text-sm font-medium text-gray-700">LC Copy</label>
                            <input
                                id={`lc_copy_${index}`}
                                name="lc_copy"
                                type="file"
                                onChange={(e) => handleChange(e, 'lcCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('lcCopies', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('lcCopies')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add LC Copy
                </button>
                </div>
                
            </div>

            {/* LcAmmendment Section */}
            <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium text-gray-900">LC Ammendments</h3>
                {formData.lcAmmendments.map((lcAmmendment, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`lc_ammendment_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`lc_ammendment_name_${index}`}
                                name="name"
                                type="text"
                                value={lcAmmendment.name}
                                onChange={(e) => handleChange(e, 'lcAmmendments', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`lc_ammendment_${index}`} className="block text-sm font-medium text-gray-700">LC Ammendment</label>
                            <input
                                id={`lc_ammendment_${index}`}
                                name="lc_ammendment"
                                type="file"
                                onChange={(e) => handleChange(e, 'lcAmmendments', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('lcAmmendments', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                 <div className="text-right">
                 <button type="button" onClick={() => handleAddRow('lcAmmendments')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add LC Ammendment
                </button>
                 </div>
                
            </div>

            {/* AdvanceTTCopy Section */}
            <div className="space-y-4 p-4">
                <h3 className="text-lg font-medium text-gray-900">Advance TT Copies</h3>
                {formData.advanceTTCopies.map((advanceTTCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`advance_tt_copy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`advance_tt_copy_name_${index}`}
                                name="name"
                                type="text"
                                value={advanceTTCopy.name}
                                onChange={(e) => handleChange(e, 'advanceTTCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`advance_tt_copy_${index}`} className="block text-sm font-medium text-gray-700">Advance TT Copy</label>
                            <input
                                id={`advance_tt_copy_${index}`}
                                name="advance_tt_copy"
                                type="file"
                                onChange={(e) => handleChange(e, 'advanceTTCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('advanceTTCopies', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                 <div className="text-right">
                 <button type="button" onClick={() => handleAddRow('advanceTTCopies')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Advance TT Copy
                </button>
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

export default PrePaymentForm;
