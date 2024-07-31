import React, { useState } from 'react';

const PaymentFinanceForm = () => {
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
        remarks: ''
    });

    const [ttCopies, setTTCopies] = useState([{ name: '', tt_copy: null }]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTTCopyChange = (index, e) => {
        const { name, value, type, files } = e.target;
        const newTTCopies = [...ttCopies];
        if (type === 'file') {
            newTTCopies[index][name] = files[0];
        } else {
            newTTCopies[index][name] = value;
        }
        setTTCopies(newTTCopies);
    };

    const addTTCopy = () => {
        setTTCopies([...ttCopies, { name: '', tt_copy: null }]);
    };

    const removeTTCopy = (index) => {
        const newTTCopies = ttCopies.filter((_, i) => i !== index);
        setTTCopies(newTTCopies);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form Data:', formData);
        console.log('TTCopies:', ttCopies);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* PaymentFinance Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <input
                        id="trn"
                        name="trn"
                        type="text"
                        value={formData.trn}
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="balance_payment_received" className="block text-sm font-medium text-gray-700">Balance Payment Received</label>
                    <input
                        id="balance_payment_received"
                        name="balance_payment_received"
                        type="number"
                        value={formData.balance_payment_received}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="balance_paymnet_made" className="block text-sm font-medium text-gray-700">Balance Payment Made</label>
                    <input
                        id="balance_paymnet_made"
                        name="balance_paymnet_made"
                        type="number"
                        value={formData.balance_paymnet_made}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="payment_mode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <input
                        id="payment_mode"
                        name="payment_mode"
                        type="text"
                        value={formData.payment_mode}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="status_of_payment" className="block text-sm font-medium text-gray-700">Status of Payment</label>
                    <input
                        id="status_of_payment"
                        name="status_of_payment"
                        type="text"
                        value={formData.status_of_payment}
                        onChange={handleChange}
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
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="commission_agent_value" className="block text-sm font-medium text-gray-700">Commission Agent Value</label>
                    <input
                        id="commission_agent_value"
                        name="commission_agent_value"
                        type="number"
                        value={formData.commission_agent_value}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="bl_fee" className="block text-sm font-medium text-gray-700">BL Fee</label>
                    <input
                        id="bl_fee"
                        name="bl_fee"
                        type="number"
                        value={formData.bl_fee}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="release_docs" className="block text-sm font-medium text-gray-700">Release Docs</label>
                    <input
                        id="release_docs"
                        name="release_docs"
                        type="text"
                        value={formData.release_docs}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="release_docs_date" className="block text-sm font-medium text-gray-700">Release Docs Date</label>
                    <input
                        id="release_docs_date"
                        name="release_docs_date"
                        type="text"
                        value={formData.release_docs_date}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="md:col-span-3">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        id="remarks"
                        name="remarks"
                        type="text"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Horizontal Separator */}
            <hr className="my-6 border-gray-300" />

            {/* TTCopy Fields */}
            <div>
                <h3 className="text-lg font-medium text-gray-900">TTCopy</h3>
                {ttCopies.map((ttCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`ttcopy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`ttcopy_name_${index}`}
                                name="name"
                                type="text"
                                value={ttCopy.name}
                                onChange={(e) => handleTTCopyChange(index, e)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor={`ttcopy_tt_copy_${index}`} className="block text-sm font-medium text-gray-700">TT Copy</label>
                            <input
                                id={`ttcopy_tt_copy_${index}`}
                                name="tt_copy"
                                type="file"
                                onChange={(e) => handleTTCopyChange(index, e)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => removeTTCopy(index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addTTCopy}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add TTCopy
                </button>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Submit
            </button>
        </form>
    );
};

export default PaymentFinanceForm;
