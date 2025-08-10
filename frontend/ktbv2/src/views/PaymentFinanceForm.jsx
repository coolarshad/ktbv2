import React, { useState, useEffect, useCallback } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { paymentDueDate,calculatePFCommissionValue } from '../dateUtils';
import { capitalizeKey } from '../utils';
import debounce from 'lodash/debounce';
import DateInputWithIcon from '../components/DateInputWithIcon';

const PaymentFinanceForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });
    const [validationErrors, setValidationErrors] = useState({});

    const [trnOptions, setTrnOptions] = useState([]); 
    const [data, setData] = useState(null); 

    const [formData, setFormData] = useState({
        sp: '',
        // balance_payment: '',
        date: today,
        balance_payment_received: '',
        balance_payment_made: '',
        balance_payment_date: '',
        advance_adjusted: '',
        net_due_in_this_trade: '',
        // payment_mode: '',
        status_of_payment: '',
        // logistic_cost: '',
        // commission_value: '',
        // bl_fee: '',
        // bl_collection_cost: '',
        // shipment_status: '',
        release_docs: '',
        release_docs_date: '',
        remarks: '',
        ttCopies: [{ name: '', tt_copy: null }],
        pfCharges: [{ name: '', charge: '' }],
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
                        sp: data.sp.id,
                        date: data.date,
                        // balance_payment: data.balance_payment,
                        balance_payment_received: data.balance_payment_received,
                        balance_payment_made: data.balance_payment_made,
                        balance_payment_date: data.balance_payment_date,
                        advance_adjusted: data.advance_adjusted,
                        net_due_in_this_trade: data.net_due_in_this_trade,
                        // payment_mode: data.payment_mode,
                        status_of_payment: data.status_of_payment,
                        // logistic_cost: data.logistic_cost,
                        // commission_value: data.commission_value,
                        // bl_fee: data.bl_fee,
                        // bl_collection_cost: data.bl_collection_cost,
                        // shipment_status: data.shipment_status,
                        release_docs: data.release_docs,
                        release_docs_date: data.release_docs_date,
                        remarks: data.remarks,
                        ttCopies: data.ttCopies || [{ name: '', tt_copy: null }],
                        pfCharges: data.pfCharges || [{ name: '', charge: null }]
                    }));
                    // Return a promise for the second API call
                    return axios.get(`/trademgt/sales-purchases/${data.sp.id}`);  // Replace with your actual endpoint
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
    // useEffect(() => {
    //     fetchData('/trademgt/trades', { approved: true }, setTrnOptions);  // Example with params
    // }, []);
    useEffect(() => {
        fetchData('/trademgt/sales-purchases/', { reviewed: true }, setTrnOptions);  // Example with params
    }, []);

    useEffect(() => {
        if (data) {
           
    
            setFormData(prevState => ({
                ...prevState,
                ...(data.trn.trade_type === 'Purchase'
                    ? {
                        balance_payment_received:'0',
                        release_docs: 'NA',
                        release_docs_date: 'NA'
                    }
                    : {
                        balance_payment_made:'0'
                    })
            }));
        }
    }, [data]);

    // Create debounced function for advance amount check
    const debouncedAdvanceCheck = useCallback(
        debounce(async (spId, value, updateFormData) => {
            try {
                const response = await axios.get(`/trademgt/advance-amount/`, {
                    params: { sp: spId }
                });
                
                const advanceAmount = parseFloat(response.data.advance_amount);
                const enteredAmount = parseFloat(value);

                if (enteredAmount > advanceAmount) {
                    alert(`Warning: Advance adjusted amount (${enteredAmount}) cannot be greater than available advance amount (${advanceAmount})`);
                    updateFormData(''); // Reset the value
                }
                
                console.log('Advance amount response:', response.data);
            } catch (error) {
                console.error('Error fetching advance amount:', error);
            }
        }, 1000), // 500ms delay
        [] // Empty dependency array since we don't need any dependencies
    );

    const handleChange = async (e, section, index) => {
        const { name, value, files } = e.target;
      
        if (section) {
            // Update the specific section
            const updatedSection = formData[section].map((item, i) =>
                i === index ? { ...item, [name]: files ? files[0] : value } : item
            );
      
            setFormData({ ...formData, [section]: updatedSection });
        } else {
            // Update the main form fields
            const updatedFormData = { ...formData, [name]: files ? files[0] : value };

            if (
                name === 'release_docs' &&
                ['na', 'do not release document'].includes(value.toLowerCase())
            ) {
                updatedFormData.release_docs_date = 'NA';
            }

      
            // Handle balance_payment_made or balance_payment_received
            // if (name === 'balance_payment_made' || name === 'balance_payment_received' || name === 'advance_adjusted') {
            //     const remainingValue = parseFloat(calculateRemainingContractValue(data)) - parseFloat(value || 0);
            //     updatedFormData.net_due_in_this_trade = remainingValue.toFixed(2);
            // }
            if (
                name === 'balance_payment_made' || 
                name === 'balance_payment_received' || 
                name === 'advance_adjusted'
              ) {
                const advanceAdjusted = parseFloat(updatedFormData.advance_adjusted) || 0;
                const balancePaymentMade = parseFloat(updatedFormData.balance_payment_made) || 0;
                const balancePaymentReceived = parseFloat(updatedFormData.balance_payment_received) || 0;
                const currentValue = parseFloat(value || 0);
              
                // const remainingValue = parseFloat(calculateRemainingContractValue(data)) - advanceAdjusted - balancePaymentMade - balancePaymentReceived ;
                const remainingValue = parseFloat(data?.invoice_amount) - advanceAdjusted - balancePaymentMade - balancePaymentReceived ;
              
                updatedFormData.net_due_in_this_trade = remainingValue.toFixed(2);
                if(balancePaymentMade===0 || balancePaymentReceived===0){
                    updatedFormData.balance_payment_date = 'NA';
                }
              }

            // Handle advance_adjusted change with debouncing
            if (name === 'advance_adjusted' && formData.sp) {
                debouncedAdvanceCheck(
                    formData.sp, 
                    value, 
                    (newValue) => setFormData(prev => ({ ...prev, advance_adjusted: newValue }))
                );
            }
      
            setFormData(updatedFormData);
        }
      
        // Handle TRN field change
        if (name === 'sp') {
            setData(null);
            try {
                const response = await axios.get(`/trademgt/sales-purchases/${value}`);
                if (response.data && response.data.reviewed) {
                    setData(response.data);
                } else {
                    alert('S&P Not Found or Not Reviewed!');
                }
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
    

    // Create a debounced submit handler
    const debouncedSubmit = useCallback(
        debounce((formDataToSend, config) => {
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
        }, 1000, { leading: true, trailing: false }), // 1 second delay, only execute first call
        [mode, id, navigate]
    );

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

         // Validate tradeProducts array fields but skip 'loi'
         formData.pfCharges.forEach((product, index) => {
            for (const [key, value] of Object.entries(product)) { 
                if (!skipValidation.includes(key) && (value === '' || value==null)) {
                    errors[`pfCharges[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
            }
        });

        //  // Validate tradeProducts array fields but skip 'loi'
        //  formData.ttCopies.forEach((product, index) => {
        //     for (const [key, value] of Object.entries(product)) { 
        //         if (!skipValidation.includes(key) && (value === '' || value==null)) {
        //             errors[`ttCopies[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
        //         }
        //     }
        // });
        if (data?.prepayment.lc_number.toLowerCase() === "na") {
            console.log("====",shouldRequireTTCopy)
            if (shouldRequireTTCopy) {
                if (formData.ttCopies.length === 0) {
                    alert('TT Copy cannot be empty!');
                    return;
                } else {
                    formData.ttCopies.forEach((item, index) => {
                        for (const [key, value] of Object.entries(item)) {
                            if (!skipValidation.includes(key) && (value === '' || value == null)) {
                                errors[`ttCopies[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                            }
                        }
                    });
                }
            }
        }

        setValidationErrors(errors);
    
        if (Object.keys(errors).length > 0) {
            console.log(errors)
            return; // Don't proceed if there are validation errors
        }else{
             setValidationErrors({});  
        }

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

        // Call the debounced submit function instead of direct axios calls
        debouncedSubmit(formDataToSend, config);
    };

    // Clean up the debounced function when component unmounts
    useEffect(() => {
        return () => {
            debouncedSubmit.cancel();
        };
    }, [debouncedSubmit]);

    const calculateRemainingContractValue = (data) => {
        // const contractValue = parseFloat(data.trn.contract_value);
        const contractValue = parseFloat(data?.invoice_amount)
        let advance=0;
        if(data.trn.trade_type=='Sales'){
           advance = parseFloat(data.prepayment.advance_received);
        }
        if(data.trn.trade_type=='Purchase'){
            advance = parseFloat(data.prepayment.advance_paid);
        }
      
        if (isNaN(contractValue) || isNaN(advance)) {
          throw new Error('Invalid input: contract_value and invoice_amount must be valid numbers');
        }
      
        return contractValue - advance;
        
      };

    const shouldRequireTTCopy = (() => {
        if (!data || !data.trn || !data.trn.paymentTerm) return false;
        if (data.trn.paymentTerm.payment_within === 'NA') return false;

        const dueDate = paymentDueDate(data);  // Assuming this returns a Date object or a parseable string
        const today = new Date();
       
        try {
            return today >= new Date(dueDate);
        } catch (err) {
            console.error("Invalid due date:", dueDate);
            return false;
        }
    })();

    const tradeData = data
    ? [
        { label: 'Trade Type', text: data.trn.trade_type || '' },
        { label: 'Buyer/Seller Name', text: data.prepayment.kyc.name || '' },
        { label: 'Invoice Amount', text: data.invoice_amount || '' },
        { label: 'Invoice Number', text: data.invoice_number || '' },
        { label: 'Invoice Date', text: data.invoice_date || '' },
        { label: 'BL Number', text: data.bl_number || '' },
        
        { label: 'Advance Received', text: data.prepayment.advance_received || '0' },
        { label: 'Advance Paid', text: data.prepayment.advance_paid || '0' },
        { label: 'Advance For Adjustment', text: data.prepayment.advance_amount || '0' },
        { label: 'Advance Received Date', text: data.prepayment.date_of_receipt || '' },
        { label: 'Advance Paid Date', text: data.prepayment.date_of_payment || '' },
        { 
            label: 'Balance Payment', 
            text: calculateRemainingContractValue(data)
        },
        { label: 'Balance Payment Due Date',text: data.trn.paymentTerm.payment_within=='NA'?'NA':paymentDueDate(data)},

        { label: 'Logistic Cost', text: data.trn.estimated_logistic_cost || '0' },
        { label: 'Logistic Provider', text: data.trn.logistic_provider || '' },
        { label: 'Logistic Cost Due Date', text: data.logistic_cost_due_date || '' },
        { label: 'Commission Agent', text: data.trn.commission_agent },
        { label: 'BL Fees', text: data.bl_fee || '0' },
        { label: 'BL Collection Cost', text: data.bl_collection_cost || '0' },
        { label: 'Shipment Status', text: data.shipment_status || '' },
        { label: 'Commission Value', text: calculatePFCommissionValue(data) || '0' },
        { label: 'Remarks from S&P', text: data.remarks || '' },
        { label: 'Trader Name', text: data.trn.trader_name || '' },
        { label: 'Insurance Policy Number', text: data.trn.insurance_policy_number || '' },
        
        { label: 'Payment Mode', text: data.trn.paymentTerm.name || '' },
      ]
    : [];

    // Cleanup debounced function on component unmount
    useEffect(() => {
        return () => {
            debouncedAdvanceCheck.cancel();
        };
    }, [debouncedAdvanceCheck]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <h2 className="text-2xl mb-2 text-center">Payment / Finance Document</h2>
            {data && (
                <>
                    <div className="grid grid-cols-4 gap-1 py-2">
                        {tradeData.map((item, index) => (
                            <div key={index} className="p-2 border rounded shadow-sm">
                                <div className="font-semibold">{item.label}</div>
                                <div>{item.text}</div>
                            </div>
                        ))}
                    </div>

                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                             
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Quantity</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Unit</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch number</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Production Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.sp_product?.map(product => (
                                <tr key={product.id}>
                        
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.productName.name}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.bl_qty}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.batch_number}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.production_date}</td>
                                    
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Charge Name</th>
                                <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Charge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.sp_extra_charges?.map(product => (
                                <tr key={product.id}>
                        
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.name}</td>
                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.charge}</td>            
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
                
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label htmlFor="sp" className="block text-sm font-medium text-gray-700">TRN (S&P)</label>
                    <select
                        id="sp"
                        name="sp"
                        value={formData.sp}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select S&P</option>
                        {trnOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.trn.trn} ({option.id})
                            </option>
                        ))}
                    </select>
                    {validationErrors.trn && <p className="text-red-500">{validationErrors.trn}</p>}
                </div>
                
            
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                    {validationErrors.date && <p className="text-red-500">{validationErrors.date}</p>}
                </div>

                  <div>
                    <label htmlFor="advance_adjusted" className="block text-sm font-medium text-gray-700">Advance Adjusted</label>
                    <input
                        id="advance_adjusted"
                        name="advance_adjusted"
                        type="text"
                        value={formData.advance_adjusted}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                     {validationErrors.advance_adjusted && <p className="text-red-500">{validationErrors.advance_adjusted}</p>}
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
                        readOnly={data?.trn.trade_type === 'Purchase'}
                    />
                    {validationErrors.balance_payment_received && <p className="text-red-500">{validationErrors.balance_payment_received}</p>}
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
                        readOnly={data?.trn.trade_type === 'Sales'}
                    />
                    {validationErrors.balance_payment_made && <p className="text-red-500">{validationErrors.balance_payment_made}</p>}
                </div>
                {/* <div>
                    <label htmlFor="balance_payment_date" className="block text-sm font-medium text-gray-700">Balance Payment Date</label>
                    <input
                        id="balance_payment_date"
                        name="balance_payment_date"
                        type="date"
                        value={formData.balance_payment_date}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                     {validationErrors.balance_payment_date && <p className="text-red-500">{validationErrors.balance_payment_date}</p>}
                </div> */}
                <DateInputWithIcon
                    formData={formData}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    fieldName="balance_payment_date"
                    label="Balance Payment Date"
                    block={formData.balance_payment_received == '0' && formData.balance_payment_made == '0'}
                />
               
                <div>
                    <label htmlFor="net_due_in_this_trade" className="block text-sm font-medium text-gray-700">Net Due in This Trade</label>
                    <input
                        id="net_due_in_this_trade"
                        name="net_due_in_this_trade"
                        type="number"
                        value={formData.net_due_in_this_trade}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly={true}
                    />
                     {validationErrors.net_due_in_this_trade && <p className="text-red-500">{validationErrors.net_due_in_this_trade}</p>}
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
                     {validationErrors.status_of_payment && <p className="text-red-500">{validationErrors.status_of_payment}</p>}
                </div>
            
                <div>
                    <label htmlFor="release_docs" className="block text-sm font-medium text-gray-700">Release Docs</label>
                    {/* <input
                        id="release_docs"
                        name="release_docs"
                        type="text"
                        value={data?.trn.trade_type === "Purchase" ? "NA" : formData.release_docs}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly={data?.trn.trade_type === "Purchase"}
                    /> */}
                    <select
                        id="release_docs"
                        name="release_docs"
                        value={formData.release_docs}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        disabled={data?.trn.trade_type === "Purchase"}
                    >
                        <option value="">Select ---</option>
                        
                        <option value="Release Document">Release Document</option>
                        <option value="Do Not Release Document">Do Not Release Document</option>
                        <option value="NA">NA</option>
                    </select>
                      {validationErrors.release_docs && <p className="text-red-500">{validationErrors.release_docs}</p>}
                </div>
           
                {/* <div>
                    <label htmlFor="release_docs_date" className="block text-sm font-medium text-gray-700">Release Docs Date</label>
                    <input
                        id="release_docs_date"
                        name="release_docs_date"
                        type="date"
                        value={data?.trn.trade_type === "Purchase" ? "NA" : formData.release_docs_date}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly={data?.trn.trade_type === "Purchase"}
                    />
                      {validationErrors.release_docs_date && <p className="text-red-500">{validationErrors.release_docs_date}</p>}
                </div> */}
                <DateInputWithIcon
                    formData={formData}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    fieldName="release_docs_date"
                    label="Release Docs Date"
                    // block={data?.trn.trade_type === "Purchase"} 
                    block={formData?.release_docs!='Release Document' || data?.trn.trade_type === "Purchase"} 
                />
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
                      {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
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
                              {validationErrors[`pfCharges[${index}].name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`pfCharges[${index}].name`]}
                                    </p>
                                )}
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
                             {validationErrors[`pfCharges[${index}].charge`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`pfCharges[${index}].charge`]}
                                    </p>
                                )}
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
            {data?.prepayment.lc_number.toLowerCase() === "na" && shouldRequireTTCopy && (
                parseFloat(formData.balance_payment_received) > 0 ||
                parseFloat(formData.balance_payment_made) > 0
            ) && (
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
                                    disabled={data?.prepayment.lc_number.toLowerCase() !== "na"}
                                />
                                {validationErrors[`ttCopies[${index}].name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`ttCopies[${index}].name`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor={`ttcopy_tt_copy_${index}`} className="block text-sm font-medium text-gray-700">TT Copy</label>
                                <input
                                    id={`ttcopy_tt_copy_${index}`}
                                    name="tt_copy"
                                    type="file"
                                    onChange={(e) => handleChange(e, 'ttCopies', index)}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                    disabled={data?.prepayment.lc_number.toLowerCase() !== "na"}
                                />
                                {validationErrors[`ttCopies[${index}].tt_copy`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`ttCopies[${index}].tt_copy`]}
                                    </p>
                                )}
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
                </div>
            )}



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
