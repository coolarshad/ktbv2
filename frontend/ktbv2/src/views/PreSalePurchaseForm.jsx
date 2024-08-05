import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

const PreSalePurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        trn: '',
        date: '',
        doc_issuance_date: '',
        payment_term: '',
        advance_due_date: '',
        lc_due_date: '',
        remarks: '',
        acknowledgedPI: [{ ackn_pi: null, ackn_pi_name: '' }],
        acknowledgedPO: [{ ackn_po: null, ackn_po_name: '' }]
    });

    const trnOptions = [
        { value: 'trn1', label: 'TRN 1' },
        { value: 'trn2', label: 'TRN 2' },
        { value: 'trn3', label: 'TRN 3' }
    ];

    const paymentTermOptions = [
        { value: 'term1', label: 'Payment Term 1' },
        { value: 'term2', label: 'Payment Term 2' },
        { value: 'term3', label: 'Payment Term 3' }
    ];

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/pre-sales-purchases/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        date: data.date,
                        doc_issuance_date: data.doc_issuance_date,
                        payment_term: data.payment_term,
                        advance_due_date: data.advance_due_date,
                        lc_due_date: data.lc_due_date,
                        remarks: data.remarks,
                        acknowledgedPI: data.acknowledgedPI || [{ ackn_pi: null, ackn_pi_name: '' }],
                        acknowledgedPO: data.acknowledgedPO || [{ ackn_po: null, ackn_po_name: '' }]
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the trade data!', error);
                });
        }
    }, [mode, id]);

    const handleChange = (e, index, section) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prevState => {
                const updatedSection = [...prevState[section]];
                updatedSection[index][name] = files[0];
                return { ...prevState, [section]: updatedSection };
            });
        } else {
            setFormData(prevState => {
                const updatedSection = [...prevState[section]];
                updatedSection[index][name] = value;
                return { ...prevState, [section]: updatedSection };
            });
        }
    };

    const handleAddRow = (section) => {
        const newRow = section === 'acknowledgedPI' ? { ackn_pi: null, ackn_pi_name: '' } : { ackn_po: null, ackn_po_name: '' };
        setFormData(prevState => ({
            ...prevState,
            [section]: [...prevState[section], newRow]
        }));
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            [section]: updatedSection
        });
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
            axios.post('/trademgt/pre-sales-purchases/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Pre sale/purchase added successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error adding the trade!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/pre-sales-purchases/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Pre sale/purchase updated successfully!', response.data);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* PreSalePurchase Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <select
                        id="trn"
                        name="trn"
                        value={formData.trn}
                        onChange={e => setFormData({ ...formData, trn: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="doc_issuance_date" className="block text-sm font-medium text-gray-700">Document Issuance Date</label>
                    <input
                        id="doc_issuance_date"
                        name="doc_issuance_date"
                        type="date"
                        value={formData.doc_issuance_date}
                        onChange={e => setFormData({ ...formData, doc_issuance_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="payment_term" className="block text-sm font-medium text-gray-700">Payment Term</label>
                    <select
                        id="payment_term"
                        name="payment_term"
                        value={formData.payment_term}
                        onChange={e => setFormData({ ...formData, payment_term: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">Select Payment Term</option>
                        {paymentTermOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="advance_due_date" className="block text-sm font-medium text-gray-700">Advance Due Date</label>
                    <input
                        id="advance_due_date"
                        name="advance_due_date"
                        type="date"
                        value={formData.advance_due_date}
                        onChange={e => setFormData({ ...formData, advance_due_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="lc_due_date" className="block text-sm font-medium text-gray-700">LC Due Date</label>
                    <input
                        id="lc_due_date"
                        name="lc_due_date"
                        type="date"
                        value={formData.lc_due_date}
                        onChange={e => setFormData({ ...formData, lc_due_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            {/* Acknowledged PI Section */}
            <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Acknowledged PI</h3>
                {formData.acknowledgedPI.map((ackPi, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label htmlFor={`ackn_pi_${index}`} className="block text-sm font-medium text-gray-700">Acknowledged PI</label>
                            <input
                                id={`ackn_pi_${index}`}
                                name="ackn_pi"
                                type="file"
                                onChange={e => handleChange(e, index, 'acknowledgedPI')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {ackPi.ackn_pi && (
                                <span className="block mt-2 text-gray-600">
                                    {ackPi.ackn_pi} 
                                </span>
                            )}
                        </div>
                        <div>
                            <label htmlFor={`ackn_pi_name_${index}`} className="block text-sm font-medium text-gray-700">PI Name</label>
                            <input
                                id={`ackn_pi_name_${index}`}
                                name="ackn_pi_name"
                                type="text"
                                value={ackPi.ackn_pi_name || ''}
                                onChange={e => handleChange(e, index, 'acknowledgedPI')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPI', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => handleAddRow('acknowledgedPI')}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md"
                >
                    Add PI
                </button>
            </div>
            {/* Acknowledged PO Section */}
            <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">Acknowledged PO</h3>
                {formData.acknowledgedPO.map((ackPo, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label htmlFor={`ackn_po_${index}`} className="block text-sm font-medium text-gray-700">Acknowledged PO</label>
                            <input
                                id={`ackn_po_${index}`}
                                name="ackn_po"
                                type="file"
                                onChange={e => handleChange(e, index, 'acknowledgedPO')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                            {/* {ackPo.ackn_po && <span className="block mt-2 text-gray-600">{ackPo.ackn_po}</span>} */}
                        </div>
                        <div>
                            <label htmlFor={`ackn_po_name_${index}`} className="block text-sm font-medium text-gray-700">PO Name</label>
                            <input
                                id={`ackn_po_name_${index}`}
                                name="ackn_po_name"
                                type="text"
                                value={ackPo.ackn_po_name || ''}
                                onChange={e => handleChange(e, index, 'acknowledgedPO')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPO', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => handleAddRow('acknowledgedPO')}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-md"
                >
                    Add PO
                </button>
            </div>
            <button
                type="submit"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
                {mode === 'add' ? 'Add' : 'Update'} PreSalePurchase
            </button>
        </form>
    );
};

export default PreSalePurchaseForm;
