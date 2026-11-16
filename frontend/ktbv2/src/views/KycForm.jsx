import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import MultiUserSelector from '../components/MultiUserSelector';
import { BASE_URL } from '../utils';

const KycForm = ({ mode = 'add' }) => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const BACKEND_URL = BASE_URL || "http://localhost:8000";

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

    const [formData, setFormData] = useState({
        date: today,
        name: '',
        companyRegNo: '',
        regAddress: '',
        mailingAddress: '',
        telephone: '',
        fax: '',
        person1: '',
        designation1: '',
        mobile1: '',
        email1: '',
        person2: '',
        designation2: '',
        mobile2: '',
        email2: '',
        bank_details: [
            { banker: '', address: '', swiftCode: '', accountNumber: '' }
        ],
        notifiedUsers: [],
        notification_message: ''
    });
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [newDocuments, setNewDocuments] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/kyc/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData({
                        date: data.date || '',
                        name: data.name || '',
                        companyRegNo: data.companyRegNo || '',
                        regAddress: data.regAddress || '',
                        mailingAddress: data.mailingAddress || '',
                        telephone: data.telephone || '',
                        fax: data.fax || '',
                        person1: data.person1 || '',
                        designation1: data.designation1 || '',
                        mobile1: data.mobile1 || '',
                        email1: data.email1 || '',
                        person2: data.person2 || '',
                        designation2: data.designation2 || '',
                        mobile2: data.mobile2 || '',
                        email2: data.email2 || '',
                        bank_details: Array.isArray(data.bank_details) && data.bank_details.length > 0
                            ? data.bank_details
                            : [{ banker: '', address: '', swiftCode: '', accountNumber: '' }],
                        notifiedUsers: Array.isArray(data.notified_users) ? data.notified_users : [],
                        notification_message: ''
                    });
                    setExistingDocuments(Array.isArray(data.documents) ? data.documents : []);
                })
                .catch(error => {
                    console.error('Error fetching KYC data', error);
                });
        }
    }, [mode, id]);


    // const handleChange = (e, section, index) => {
    //     const { name, value, files } = e.target;
    //     if (section) {
    //         const updatedSection = formData[section].map((item, i) =>
    //             i === index ? { ...item, [name]: files ? files[0] : value } : item
    //         );
    //         setFormData({ ...formData, [section]: updatedSection });
    //     } else {
    //         setFormData({ ...formData, [name]: value });
    //     }
    // };
    const handleChange = (e, section, index) => {
    const { name, value } = e.target;

    if (section && index !== undefined) {
        const updatedSection = [...formData[section]];
        updatedSection[index][name] = value;
        setFormData({ ...formData, [section]: updatedSection });
    } else {
        setFormData({ ...formData, [name]: value });
    }
};

    const validateForm = () => {
    const newErrors = {};

    for (const [key, value] of Object.entries(formData)) {
        if (key === 'notification_message') continue;
        if (typeof value === 'string') {
            if (!value.trim()) {
                newErrors[key] = 'This field is required';
            }
        } else if (Array.isArray(value) && key === 'bank_details') {
            value.forEach((bank, index) => {
                if (!bank.banker?.trim()) {
                    newErrors[`bank_details.${index}.banker`] = 'Banker is required';
                }
                if (!bank.accountNumber?.trim()) {
                    newErrors[`bank_details.${index}.accountNumber`] = 'Account Number is required';
                }
                // Add more nested validations if needed
            });
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleAddBankDetail = () => {
        setFormData({
            ...formData,
            bank_details: [...formData.bank_details, { banker: '', address: '', swiftCode: '', accountNumber: '' }]
        });
    };

    const handleRemoveBankDetail = (index) => {
        const updated = formData.bank_details.filter((_, i) => i !== index);
        setFormData({ ...formData, bank_details: updated });
    };

    const handleAddNewDocumentRow = () => {
        setNewDocuments(prev => [...prev, { name: '', file: null }]);
    };

    const handleRemoveNewDocumentRow = (index) => {
        setNewDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleNewDocumentChange = (index, field, value) => {
        setNewDocuments(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleBulkFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const rows = files.map(file => ({
                name: file.name.replace(/\.[^/.]+$/, ''),
                file: file
            }));
            setNewDocuments(prev => [...prev, ...rows]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteExistingDocument = async (docId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await axios.delete(`/trademgt/kyc-documents/${docId}/`);
                setExistingDocuments(prev => prev.filter(doc => doc.id !== docId));
            } catch (err) {
                console.error('Failed to delete document', err);
                alert('Failed to delete document. Please try again.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formDataToSend = new FormData();

        for (const [key, value] of Object.entries(formData)) {
            if (key === 'bank_details') {
                formDataToSend.append('bank_details', JSON.stringify(value));
            } else if (key === 'notifiedUsers') {
                value.forEach(uid => formDataToSend.append('notifiedUsers[]', uid));
            } else {
                formDataToSend.append(key, value ?? '');
            }
        }

        // Append new documents
        let docIndex = 0;
        newDocuments.forEach((doc) => {
            if (doc.file) {
                formDataToSend.append(`documents[${docIndex}].file`, doc.file);
                formDataToSend.append(`documents[${docIndex}].name`, (doc.name || doc.file.name).trim());
                docIndex++;
            }
        });

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };

        if (mode === 'add') {
            axios.post('/trademgt/kyc/', formDataToSend, config)
                .then(res => {
                    console.log('KYC added!', res.data);
                    navigate('/kyc');
                })
                .catch(err => {
                    console.error('Error adding KYC:', err);
                    alert('Error creating KYC. Please check your inputs.');
                });
        } else {
            axios.put(`/trademgt/kyc/${id}/`, formDataToSend, config)
                .then(res => {
                    console.log('KYC updated!', res.data);
                    navigate('/kyc');
                })
                .catch(err => {
                    console.error('Error updating KYC:', err);
                    alert('Error updating KYC. Please check your inputs.');
                });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div >
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="lc_number" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_opening_bank" className="block text-sm font-medium text-gray-700">Company Reg No</label>
                    <input
                        id="companyRegNo"
                        name="companyRegNo"
                        type="text"
                        value={formData.companyRegNo}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_received" className="block text-sm font-medium text-gray-700">Reg. Address</label>
                    <input
                        id="regAddress"
                        name="regAddress"
                        type="text"
                        value={formData.regAddress}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_receipt" className="block text-sm font-medium text-gray-700">Mailing Address</label>
                    <input
                        id="mailingAddress"
                        name="mailingAddress"
                        type="text"
                        value={formData.mailingAddress}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700">Telephone</label>
                    <input
                        id="telephone"
                        name="telephone"
                        type="text"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_payment" className="block text-sm font-medium text-gray-700">Fax</label>
                    <input
                        id="fax"
                        name="fax"
                        type="text"
                        value={formData.fax}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_expiry_date" className="block text-sm font-medium text-gray-700">Person 1</label>
                    <input
                        id="person1"
                        name="person1"
                        type="text"
                        value={formData.person1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="latest_shipment_date_in_lc" className="block text-sm font-medium text-gray-700">Designation 1</label>
                    <input
                        id="designation1"
                        name="designation1"
                        type="text"
                        value={formData.designation1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
               
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Mobile 1</label>
                    <input
                        id="mobile1"
                        name="mobile1"
                        type="text"
                        value={formData.mobile1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Email 1</label>
                    <input
                        id="email1"
                        name="email1"
                        type="text"
                        value={formData.email1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Person 2</label>
                    <input
                        id="person2"
                        name="person2"
                        type="text"
                        value={formData.person2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Designation 2</label>
                    <input
                        id="designation2"
                        name="designation2"
                        type="text"
                        value={formData.designation2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Mobile 2</label>
                    <input
                        id="mobile2"
                        name="mobile2"
                        type="text"
                        value={formData.mobile2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Email 2</label>
                    <input
                        id="email2"
                        name="email2"
                        type="text"
                        value={formData.email2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                {/* <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Banker</label>
                    <input
                        id="banker"
                        name="banker"
                        type="text"
                        value={formData.banker}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Swift Code</label>
                    <input
                        id="swiftCode"
                        name="swiftCode"
                        type="text"
                        value={formData.swiftCode}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div> */}
            </div>
            <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
                {formData.bank_details.map((bank, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border p-4 rounded">
                        <input
                            type="text"
                            name="banker"
                            placeholder="Banker"
                            value={bank.banker}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={bank.address}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="swiftCode"
                            placeholder="Swift Code"
                            value={bank.swiftCode}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Account Number"
                            value={bank.accountNumber}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveBankDetail(index)}
                            className="text-red-600 text-sm mt-2"
                        >
                            Remove
                        </button>
                        {errors[`bank_details.${index}.banker`] && (
                            <p className="text-red-500 text-sm">{errors[`bank_details.${index}.banker`]}</p>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddBankDetail}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Bank
                </button>
            </div>

            {/* KYC Documents Section */}
            <div className="col-span-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm mb-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">KYC Documents</h3>
                        <p className="text-xs text-gray-500">
                            Upload trade licenses, incorporation certificates, or other verification files. Backed up automatically to Google Drive.
                        </p>
                    </div>
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-2 rounded cursor-pointer shadow">
                        <span>+ Select Multiple Files</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleBulkFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Existing Documents (Update mode) */}
                {existingDocuments && existingDocuments.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 rounded border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Saved Documents ({existingDocuments.length})
                        </h4>
                        <div className="divide-y divide-gray-200">
                            {existingDocuments.map((doc, idx) => (
                                <div key={doc.id || idx} className="py-2 flex justify-between items-center text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-700">{doc.name || `Document #${idx + 1}`}</span>
                                        {doc.uploaded_at && (
                                            <span className="text-xs text-gray-400">
                                                ({new Date(doc.uploaded_at).toLocaleDateString()})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <a
                                            href={doc.file?.startsWith('http') ? doc.file : `${BACKEND_URL}${doc.file?.startsWith('/') ? '' : '/'}${doc.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-xs font-semibold"
                                        >
                                            View File
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExistingDocument(doc.id)}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Documents Queue */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        {existingDocuments.length > 0 ? "Add More Documents" : "Upload Documents"}
                    </h4>
                    {newDocuments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic mb-2">
                            No new documents selected. Click "+ Select Multiple Files" above or "+ Add Document Row" below.
                        </p>
                    ) : (
                        <div className="space-y-3 mb-3">
                            {newDocuments.map((doc, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 border rounded items-center">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Document Title / Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Trade License, Tax ID, Passport"
                                            value={doc.name}
                                            onChange={(e) => handleNewDocumentChange(index, 'name', e.target.value)}
                                            className="border p-2 rounded w-full text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Choose File</label>
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                handleNewDocumentChange(index, 'file', file);
                                                if (file && !doc.name) {
                                                    handleNewDocumentChange(index, 'name', file.name.replace(/\.[^/.]+$/, ''));
                                                }
                                            }}
                                            className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {doc.file && (
                                            <span className="text-xs text-gray-500 block mt-1 truncate">
                                                Selected: {doc.file.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="md:col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewDocumentRow(index)}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddNewDocumentRow}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium px-3 py-2 rounded"
                    >
                        + Add Document Row
                    </button>
                </div>
            </div>

            <div className="col-span-3 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Notify Users</h3>
                <MultiUserSelector
                    selectedUsers={formData.notifiedUsers}
                    onChange={(users) => setFormData(prev => ({ ...prev, notifiedUsers: users }))}
                    message={formData.notification_message}
                    onMessageChange={(val) => setFormData(prev => ({ ...prev, notification_message: val }))}
                />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-3">
                    Submit
                </button>
            </div>
        </form>
    );
};

export default KycForm;