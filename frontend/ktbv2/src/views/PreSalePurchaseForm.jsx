import React, { useState } from 'react';

const PreSalePurchaseForm = () => {
    // Sample options for dropdowns
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

    const handleChange = (section, index, e) => {
        const { name, value, type, files } = e.target;
        const newSection = [...formData[section]];
        newSection[index] = {
            ...newSection[index],
            [name]: type === 'file' ? files[0] : value
        };
        setFormData({
            ...formData,
            [section]: newSection
        });
    };

    const handleAddRow = (section) => {
        setFormData({
            ...formData,
            [section]: [...formData[section], { ackn_po: null, ackn_po_name: '' }]
        });
    };

    const handleRemoveRow = (section, index) => {
        const newSection = formData[section].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            [section]: newSection
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        // You can send `formData` to your backend API here
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
                {/* Remarks field spanning across all columns */}
                <div className="md:col-span-3">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        id="remarks"
                        name="remarks"
                        type="text"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Horizontal Separator */}
            <hr className="my-6 border-gray-300" />

            {/* AcknowledgedPI Section */}
            {formData.acknowledgedPI.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor={`ackn_pi_${index}`} className="block text-sm font-medium text-gray-700">Acknowledgment PI</label>
                        <input
                            id={`ackn_pi_${index}`}
                            name="ackn_pi"
                            type="file"
                            onChange={(e) => handleChange('acknowledgedPI', index, e)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor={`ackn_pi_name_${index}`} className="block text-sm font-medium text-gray-700">Acknowledgment PI Name</label>
                        <input
                            id={`ackn_pi_name_${index}`}
                            name="ackn_pi_name"
                            type="text"
                            value={item.ackn_pi_name}
                            onChange={(e) => handleChange('acknowledgedPI', index, e)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => handleRemoveRow('acknowledgedPI', index)}
                            className="text-red-600 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => handleAddRow('acknowledgedPI')}
                className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                Add More PI
            </button>

            {/* Horizontal Separator */}
            <hr className="my-6 border-gray-300" />

            {/* AcknowledgedPO Section */}
            {formData.acknowledgedPO.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label htmlFor={`ackn_po_${index}`} className="block text-sm font-medium text-gray-700">Acknowledgment PO</label>
                    <input
                        id={`ackn_po_${index}`}
                        name="ackn_po"
                        type="file"
                        onChange={(e) => handleChange('acknowledgedPO', index, e)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor={`ackn_po_name_${index}`} className="block text-sm font-medium text-gray-700">Acknowledgment PO Name</label>
                    <input
                        id={`ackn_po_name_${index}`}
                        name="ackn_po_name"
                        type="text"
                        value={item.ackn_po_name}
                        onChange={(e) => handleChange('acknowledgedPO', index, e)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={() => handleRemoveRow('acknowledgedPO', index)}
                        className="text-red-600 hover:text-red-700"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ))}
        <button
            type="button"
            onClick={() => handleAddRow('acknowledgedPO')}
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
            Add More PO
        </button>

        <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            Submit
        </button>
    </form>
 );
};

export default PreSalePurchaseForm;