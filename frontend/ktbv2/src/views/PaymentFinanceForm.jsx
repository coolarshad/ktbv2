import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';

const PaymentFinanceForm = ({ mode = 'add' }) => {
    const { id } = useParams();

    const [formData, setFormData] = useState({
        trn: '',
        batch_number: '',
        production_date: '',
        balance_payment: '',
        balance_payment_received: '',
        balance_paymnet_made: '',
        net_due_in_this_trade: '',
        payment_mode: '',
        status_of_payment: '',
        logistic_cost: '',
        commission_agent_value: '',
        bl_fee: '',
        bl_collection_cost: '',
        shipment_status: '',
        release_docs: '',
        release_docs_date: '',
        remarks: '',
        ttCopies: [{ name: '', tt_copy: null }],
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/payment-finances/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        batch_number: data.batch_number,
                        production_date: data.production_date,
                        balance_payment: data.balance_payment,
                        balance_payment_received: data.balance_payment_received,
                        balance_paymnet_made: data.balance_paymnet_made,
                        net_due_in_this_trade: data.net_due_in_this_trade,
                        payment_mode: data.payment_mode,
                        status_of_payment: data.status_of_payment,
                        logistic_cost: data.logistic_cost,
                        commission_agent_value: data.commission_agent_value,
                        bl_fee: data.bl_fee,
                        bl_collection_cost: data.bl_collection_cost,
                        shipment_status: data.shipment_status,
                        release_docs: data.release_docs,
                        release_docs_date: data.release_docs_date,
                        remarks: data.remarks,
                        ttCopies: data.ttCopies || [{ name: '', tt_copy: null }]
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the finance data!', error);
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
        const newRow = { name: '', tt_copy: null };
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

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
        };

        if (mode === 'add') {
            axios.post('/trademgt/payment-finances/', formDataToSend, config)
                .then(response => {
                    console.log('Payment/Finance added successfully!', response.data);
                })
                .catch(error => {
                    console.error('There was an error adding the Payment/Finance!', error);
                });
        } else if (mode === 'update') {
            axios.put(`/trademgt/payment-finances/${id}/`, formDataToSend, config)
                .then(response => {
                    console.log('Payment/Finance updated successfully!', response.data);
                })
                .catch(error => {
                    console.error('There was an error updating the Payment/Finance!', error);
                });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <input
                        id="trn"
                        name="trn"
                        type="text"
                        value={formData.trn}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                        id="batch_number"
                        name="batch_number"
                        type="text"
                        value={formData.batch_number}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="production_date" className="block text-sm font-medium text-gray-700">Production Date</label>
                    <input
                        id="production_date"
                        name="production_date"
                        type="date"
                        value={formData.production_date}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="balance_payment" className="block text-sm font-medium text-gray-700">Balance Payment</label>
                    <input
                        id="balance_payment"
                        name="balance_payment"
                        type="number"
                        value={formData.balance_payment}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="balance_payment_received" className="block text-sm font-medium text-gray-700">Balance Payment Received</label>
                    <input
                        id="balance_payment_received"
                        name="balance_payment_received"
                        type="number"
                        value={formData.balance_payment_received}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="balance_paymnet_made" className="block text-sm font-medium text-gray-700">Balance Payment Made</label>
                    <input
                        id="balance_paymnet_made"
                        name="balance_paymnet_made"
                        type="number"
                        value={formData.balance_paymnet_made}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="net_due_in_this_trade" className="block text-sm font-medium text-gray-700">Net Due in This Trade</label>
                    <input
                        id="net_due_in_this_trade"
                        name="net_due_in_this_trade"
                        type="number"
                        value={formData.net_due_in_this_trade}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <input
                        id="payment_mode"
                        name="payment_mode"
                        type="text"
                        value={formData.payment_mode}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="status_of_payment" className="block text-sm font-medium text-gray-700">Status of Payment</label>
                    <input
                        id="status_of_payment"
                        name="status_of_payment"
                        type="text"
                        value={formData.status_of_payment}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
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
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="commission_agent_value" className="block text-sm font-medium text-gray-700">Commission Agent Value</label>
                    <input
                        id="commission_agent_value"
                        name="commission_agent_value"
                        type="number"
                        value={formData.commission_agent_value}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="bl_fee" className="block text-sm font-medium text-gray-700">BL Fee</label>
                    <input
                        id="bl_fee"
                        name="bl_fee"
                        type="number"
                        value={formData.bl_fee}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="bl_collection_cost" className="block text-sm font-medium text-gray-700">BL Collection Cost</label>
                    <input
                        id="bl_collection_cost"
                        name="bl_collection_cost"
                        type="number"
                        value={formData.bl_collection_cost}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="shipment_status" className="block text-sm font-medium text-gray-700">Shipment Status</label>
                    <input
                        id="shipment_status"
                        name="shipment_status"
                        type="text"
                        value={formData.shipment_status}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="release_docs" className="block text-sm font-medium text-gray-700">Release Docs</label>
                    <input
                        id="release_docs"
                        name="release_docs"
                        type="text"
                        value={formData.release_docs}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="release_docs_date" className="block text-sm font-medium text-gray-700">Release Docs Date</label>
                    <input
                        id="release_docs_date"
                        name="release_docs_date"
                        type="date"
                        value={formData.release_docs_date}
                        onChange={(e) => handleChange(e)}
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
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            </div>
            <hr className="my-6" />
            <div className=''>
                <h3 className="text-lg font-medium text-gray-900 mb-2">TTCopy</h3>
                {formData.ttCopies.map((ttCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`ttcopy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`ttcopy_name_${index}`}
                                name="name"
                                type="text"
                                value={ttCopy.name}
                                onChange={(e) => handleChange(e, 'ttCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`ttcopy_tt_copy_${index}`} className="block text-sm font-medium text-gray-700">TT Copy</label>
                            <input
                                id={`ttcopy_tt_copy_${index}`}
                                name="tt_copy"
                                type="file"
                                onChange={(e) => handleChange(e, 'ttCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('ttCopies', index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button
                    type="button"
                    onClick={() => handleAddRow('ttCopies')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add TTCopy
                </button>
                </div>
                
            </div>
            <hr className="my-6" />
            <div className='grid grid-cols-3 gap-4 mb-4'>
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

export default PaymentFinanceForm;
