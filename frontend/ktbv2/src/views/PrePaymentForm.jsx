import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { today, addDaysToDate,advanceToPay,advanceToReceive } from '../dateUtils';
import { capitalizeKey } from '../utils';

const PrePaymentForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate=useNavigate()

    const [validationErrors, setValidationErrors] = useState({});
    // Sample options for TRN dropdown
    const [trnOptions, setTrnOptions] = useState([]); 
    const [data, setData] = useState(null); 

    const [formData, setFormData] = useState({
        trn: '',
        adv_due_date:'',
        // as_per_pi_advance: '',
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
                        trn: data.trn.id,
                        adv_due_date: data.adv_due_date,
                        // as_per_pi_advance: data.as_per_pi_advance,
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
                // Call the second API after the first one is complete
              return axios.get(`/trademgt/prepay/${data.trn.id}`);
            })
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
              console.error('There was an error fetching the data!', error);
            });
        }
      }, [mode, id]);
    
      useEffect(() => {
        if (data) {
            const calculatedAdvance = data.trade_type === 'Sales'
                ? advanceToReceive(data)
                : advanceToPay(data);
    
            setFormData(prevState => ({
                ...prevState,
                // as_per_pi_advance: calculatedAdvance || '',
                adv_due_date: data.presp.trade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(data.presp.doc_issuance_date,data.presp.trade.paymentTerm.advance_within)
            }));
        }
    }, [data]);

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

        if (name === "trn") {
            try {
                const response = await axios.get(`/trademgt/prepay/${value}`);
                response.data.presp? setData(response.data):alert('No Pre Sale/Purchase Found !');
                
            } catch (error) {
                console.error("Error fetching TRN data:", error);
            }
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

        let errors = {};

        // Define fields to skip validation for
        const skipValidation = [];

        // Check each regular field for empty value (except files and those in skipValidation)
        for (const [key, value] of Object.entries(formData)) {
            if (!skipValidation.includes(key) && value === '') {
                errors[key] = `${capitalizeKey(key)} cannot be empty!`;
            }
        }

        setValidationErrors(errors);
    
        if (Object.keys(errors).length > 0) {
            console.log(errors)
            return; // Don't proceed if there are validation errors
        }else{
             setValidationErrors({});  
        }

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
                navigate(`/pre-payment`);
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
                navigate(`/pre-payment`);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            });
        }
    };

    const tradeData = data
    ? [
        { label: 'PO Date/PI Date', text: data.presp.date || '' },
        { label: 'Trade Type', text: data.trade_type || '' },
        { label: 'Payment Term', text: data.presp.trade.paymentTerm.name || '' },
        { label: 'Buyer/Seller Name', text: data.presp.trade.customer.name || '' },
        { label: 'Value of Contract', text: data.presp.trade.contract_value || '' },
        { label: 'Advance to Pay', text: advanceToPay(data) || '' },
        { label: 'Advance to Receive', text: advanceToReceive(data) || '' },
        { label: 'Advance Due Date', text: data.presp.trade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(data.presp.doc_issuance_date,data.presp.trade.paymentTerm.advance_within)},
        { label: 'Trader Name', text: data.trader_name || '' },
        { label: 'Insurance Policy Number', text: data.insurance_policy_number || '' },
    
        // { label: 'Remarks', text: data.remarks || '' },
      ]
    : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <h2 className="text-2xl mb-2 text-center">Prepayment Document</h2>
            {data && (

                <div className="grid grid-cols-4 gap-1 p-2">
                    {tradeData.map((item, index) => (
                        <div key={index} className="p-2 border rounded shadow-sm">
                            <div className="font-semibold">{item.label}</div>
                            <div>{item.text}</div>
                        </div>
                    ))}
                </div>
            )}
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
                            <option key={option.id} value={option.id}>
                                {option.trn}
                            </option>
                        ))}
                    </select>
                    {validationErrors.trn && <p className="text-red-500">{validationErrors.trn}</p>}
                </div>
                {/* <div>
                    <label htmlFor='adv_due_date' className="block text-sm font-medium text-gray-700">Advance Due Date</label>
                    <input
                        id="adv_due_date"
                        name="adv_due_date"
                        type="text"
                        value={formData.adv_due_date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                    {validationErrors.adv_due_date && <p className="text-red-500">{validationErrors.adv_due_date}</p>}
                </div> */}
                {/* <div>
                    <label htmlFor='as_per_pi_advance' className="block text-sm font-medium text-gray-700">As Per PI Cash/TT/Advance</label>
                    <input
                        id="as_per_pi_advance"
                        name="as_per_pi_advance"
                        type="text"
                        value={formData.as_per_pi_advance}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                    {validationErrors.as_per_pi_advance && <p className="text-red-500">{validationErrors.as_per_pi_advance}</p>}
                </div> */}
                
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
                    {validationErrors.lc_number && <p className="text-red-500">{validationErrors.lc_number}</p>}
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
                    {validationErrors.lc_opening_bank && <p className="text-red-500">{validationErrors.lc_opening_bank}</p>}
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
                    {validationErrors.advance_received && <p className="text-red-500">{validationErrors.advance_received}</p>}
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
                    {validationErrors.date_of_receipt && <p className="text-red-500">{validationErrors.date_of_receipt}</p>}
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
                    {validationErrors.advance_paid && <p className="text-red-500">{validationErrors.advance_paid}</p>}
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
                    {validationErrors.date_of_payment && <p className="text-red-500">{validationErrors.date_of_payment}</p>}
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
                     {validationErrors.lc_expiry_date && <p className="text-red-500">{validationErrors.lc_expiry_date}</p>}
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
                     {validationErrors.latest_shipment_date_in_lc && <p className="text-red-500">{validationErrors.latest_shipment_date_in_lc}</p>}
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
                     {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
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
            <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded col-span-3"
                >
                    {mode === 'add' ? 'Add PrePayment' : 'Update PrePayment'}
                </button>
            </div>
        </form>
    );
};

export default PrePaymentForm;
