import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const PaymentFinanceForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trnOptions, setTrnOptions] = useState([]); 
    const [data, setData] = useState(null); 

    const [formData, setFormData] = useState({
        trn: '',
        balance_payment: '',
        balance_payment_received: '',
        balance_payment_made: '',
        balance_payment_date: '',
        net_due_in_this_trade: '',
        payment_mode: '',
        status_of_payment: '',
        logistic_cost: '',
        commission_value: '',
        bl_fee: '',
        bl_collection_cost: '',
        shipment_status: '',
        release_docs: '',
        release_docs_date: '',
        remarks: '',
        ttCopies: [{ name: '', tt_copy: null }],
        pfCharges: [{ name: '', charge: null }],
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            // First API call
            axios.get(`/trademgt/payment-finances/${id}`)
                .then(response => {
                    const data = response.data;
                    // Update formData with data from the first API call
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        balance_payment: data.balance_payment,
                        balance_payment_received: data.balance_payment_received,
                        balance_payment_made: data.balance_payment_made,
                        balance_payment_date: data.balance_payment_date,
                        net_due_in_this_trade: data.net_due_in_this_trade,
                        payment_mode: data.payment_mode,
                        status_of_payment: data.status_of_payment,
                        logistic_cost: data.logistic_cost,
                        commission_value: data.commission_value,
                        bl_fee: data.bl_fee,
                        bl_collection_cost: data.bl_collection_cost,
                        shipment_status: data.shipment_status,
                        release_docs: data.release_docs,
                        release_docs_date: data.release_docs_date,
                        remarks: data.remarks,
                        ttCopies: data.ttCopies || [{ name: '', tt_copy: null }],
                        pfCharges: data.pfCharges || [{ name: '', charge: null }]
                    }));
                    // Return a promise for the second API call
                    return axios.get(`/trademgt/pf/${data.trn}`);  // Replace with your actual endpoint
                })
                .then(response => {
                    setData(response.data)
                })
                .catch(error => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);
    


    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params });  // Pass params to axios.get
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    // Combined useEffect for all API calls
    useEffect(() => {
        fetchData('/trademgt/trades', { approved: true }, setTrnOptions);  // Example with params
    }, []);

    const handleChange = async (e, section, index) => {
        const { name, value, files } = e.target;
        if (section) {
            const updatedSection = formData[section].map((item, i) =>
                i === index ? { ...item, [name]: files ? files[0] : value } : item
            );
            setFormData({ ...formData, [section]: updatedSection });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        if (name === 'trn') {
            try {
              const response = await axios.get(`/trademgt/pf/${value}`);
              setData(response.data);
            } catch (error) {
              console.error('Error fetching TRN data:', error);
            }
          }
    };
    
    const handleAddRow = (section) => {
        const newRow = section === 'pfCharges' ? { name: '', charge: '' } : { name: '', tt_copy: null };
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
                    navigate(`/payment-finance`);
                })
                .catch(error => {
                    console.error('There was an error adding the Payment/Finance!', error);
                });
        } else if (mode === 'update') {
            axios.put(`/trademgt/payment-finances/${id}/`, formDataToSend, config)
                .then(response => {
                    console.log('Payment/Finance updated successfully!', response.data);
                    navigate(`/payment-finance`);
                })
                .catch(error => {
                    console.error('There was an error updating the Payment/Finance!', error);
                });
        }
    };


    const tradeData = data
    ? [
        { label: 'Trade Type', text: data.trade_type || '' },
        { label: 'Buyer/Seller Name', text: data.sp.prepayment.kyc.name || '' },
        { label: 'Invoice Amount', text: data.sp.invoice_amount || '' },
        { label: 'Invoice Number', text: data.sp.invoice_number || '' },
        { label: 'Invoice Date', text: data.sp.invoice_date || '' },
        { label: 'BL Number', text: data.sp.bl_number || '' },
        { label: 'BL Quantity', text: data.sp.bl_qty || '' },
        { label: 'Advance Received', text: data.sp.prepayment.advance_received || '' },
        { label: 'Advance Paid', text: data.sp.prepayment.advance_paid || '' },
        { label: 'Advance Received/Paid Date', text: data.sp.prepayment.date_of_receipt || '' },
        { label: 'Balance Payment Due Date', text: data.sp.prepayment.adv_due_date || '' },
        { label: 'Logistic Cost', text: data.estimated_logistic_cost || '' },
        { label: 'Logistic Provider', text: data.logistic_provider || '' },
        { label: 'Logistic Cost Due Date', text: data.sp.logistic_cost_due_date || '' },
        { label: 'Commission Agent', text: data.commission_agent || '' },
        { label: 'Commission Value', text: data.sp.commission_value || '' },
        { label: 'Other Charges', text: data.commission_agent || '' },
        { label: 'Remarks from S&P', text: data.sp.remarks || '' },
        { label: 'Trader Name', text: data.trader_name || '' },
        { label: 'Insurance Policy Number', text: data.insurance_policy_number || '' },
        
        
      ]
    : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            {data && (

                <div className="grid grid-cols-4 gap-1 py-2">
                    {tradeData.map((item, index) => (
                        <div key={index} className="p-2 border rounded shadow-sm">
                            <div className="font-semibold">{item.label}</div>
                            <div>{item.text}</div>
                        </div>
                    ))}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <select
                        id="trn"
                        name="trn"
                        value={formData.trn}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select TRN</option>
                        {trnOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.trn}
                            </option>
                        ))}
                    </select>
                </div>
                
            
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
                    <label htmlFor="balance_payment_date" className="block text-sm font-medium text-gray-700">Balance Payment Due Date</label>
                    <input
                        id="balance_payment_date"
                        name="balance_payment_date"
                        type="date"
                        value={formData.balance_payment_date}
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
                    <label htmlFor="balance_payment_made" className="block text-sm font-medium text-gray-700">Balance Payment Made</label>
                    <input
                        id="balance_payment_made"
                        name="balance_payment_made"
                        type="number"
                        value={formData.balance_payment_made}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
            
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
                    <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Agent Value</label>
                    <input
                        id="commission_value"
                        name="commission_value"
                        type="number"
                        value={formData.commission_value}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Charges P&F</h3>
                {formData.pfCharges.map((charge, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor={`ttcopy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`pfcharge_name_${index}`}
                                name="name"
                                type="text"
                                value={charge.name}
                                onChange={(e) => handleChange(e, 'pfCharges', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`ttcopy_tt_copy_${index}`} className="block text-sm font-medium text-gray-700">Charge</label>
                            <input
                                id={`pfcharge_name_${index}`}
                                name="charge"
                                type="number"
                                value={charge.charge}
                                onChange={(e) => handleChange(e, 'pfCharges', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow('pfCharges', index)}
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
                    onClick={() => handleAddRow('pfCharges')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add Charge
                </button>
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
                    {mode === 'add' ? 'Add P&F' : 'Update P&F'}
                </button>
            </div>
            
        </form>
    );
};

export default PaymentFinanceForm;
