import React, { useState, useEffect,useCallback } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaTrash } from 'react-icons/fa';
import { capitalizeKey } from '../utils';
import debounce from 'lodash.debounce';

const SalesPurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const [trnOptions, setTrnOptions] = useState([]); 
    const [validationErrors, setValidationErrors] = useState({});
    const [data, setData] = useState(null); 
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        trn: '',
        invoice_date: '',
        invoice_number: '',
        invoice_amount: '',
        // commission_value: '',
        bl_number: '',
        purchase_bl_number: '',
        // bl_qty: '',
        bl_fees: '',
        bl_collection_cost: '',
        bl_date: '',
        // total_packing_cost: '',
        // packaging_supplier: '',
        // logistic_supplier: '',
        
        logistic_cost: '',
        logistic_cost_due_date: '',
        liner: '',
        pod: '',
        pol: '',
        etd: '',
        eta: '',
        shipment_status: '',
        remarks: '',
        salesPurchaseProducts: [
            {
                product_code: '',
                product_name: '',
                hs_code: '',
                tolerance: '',
                batch_number: '',
                production_date: '',
                pending_qty: '',
                bl_qty: '',
                trade_qty_unit: '',
                bl_value: '',
                product_code: '',
                selected_currency_rate: '',
                rate_in_usd: '',
            }
        ],
        extraCharges: [{ name: '', charge: '' }],
        packingLists: [{ name: '', packing_list: null }],
        // blCopies: [{ name: '', bl_copy: null }],
        // invoices: [{ name: '', invoice: null }],
        // coas: [{ name: '', coa: null }],
    });

   

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/sales-purchases/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn.id,
                        invoice_date: data.invoice_date,
                        invoice_number: data.invoice_number,
                        invoice_amount: data.invoice_amount,
                        // commission_value: data.commission_value,
                        bl_number: data.bl_number,
                        // bl_qty: data.bl_qty,
                        bl_fees: data.bl_fees,
                        bl_collection_cost: data.bl_collection_cost,
                        bl_date: data.bl_date,
                        // total_packing_cost: data.total_packing_cost,
                        // packaging_supplier: data.packaging_supplier,
                        // logistic_supplier: data.logistic_supplier,
                        logistic_cost: data.logistic_cost,
                        logistic_cost_due_date: data.logistic_cost_due_date,
                        liner: data.liner,
                        pod: data.pod,
                        pol: data.pol,
                        etd: data.etd,
                        eta: data.eta,
                        shipment_status: data.shipment_status,
                        remarks: data.remarks,
                        salesPurchaseProducts: data.salesPurchaseProducts || [
                            {
                                product_code: '',
                                product_name: '',
                                hs_code: '',
                                tolerance: '',
                                batch_number: '',
                                production_date: '',
                                pending_qty: '',
                                bl_qty: '',
                                trade_qty_unit: '',
                                bl_value: '',
                                product_code: '',
                                selected_currency_rate: '',
                                rate_in_usd: '',
                            }
                        ],
                        extraCharges: data.extraCharges || [{ name: '', charge: '' }],
                        packingLists: data.packingLists || [{ name: '', packing_list: null }],
                        
                    }));
                // Call the second API after the first one is complete
              return axios.get(`/trademgt/sp/${data.trn.id}`);
            })
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
              console.error('There was an error fetching the data!', error);
            });
        }
      }, [mode, id]);

    const [unitOptions, setUnitOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [purchaseBLOptions, setPurchaseBLOptions] = useState([]);
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
        fetchData('/trademgt/unit',{}, setUnitOptions);
        fetchData('/trademgt/product-names',{}, setProductOptions);
        fetchData('/trademgt/sp-purchase-bl',{}, setPurchaseBLOptions);
    }, []);

    function calculateTotalWithTolerance(qty, tolerance) {
        const toleranceValue = (tolerance / 100) * qty;
        // console.log(qty + toleranceValue)
        return qty + toleranceValue;
      }

    // const handleChange = async (e, arrayName = null, index = null) => {
    //     const { name, value, type, files } = e.target;

    //     setFormData((prev) => {

    //         if (type === 'file' && arrayName !== null && index !== null) {
    //             if (Array.isArray(prev[arrayName])) {
    //                 const updatedArray = [...prev[arrayName]];
    //                 updatedArray[index][name] = files[0];
    //                 return { ...prev, [arrayName]: updatedArray };
    //             } else {
    //                 console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
    //             }
    //         }

    //         else if (arrayName !== null && index !== null) {
    //             if (Array.isArray(prev[arrayName])) {
    //                 const updatedArray = [...prev[arrayName]];
    //                 updatedArray[index][name] = value;
    //                 return { ...prev, [arrayName]: updatedArray };
    //             } else {
    //                 console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
    //             }
    //         }

    //         else {
    //             return { ...prev, [name]: value };
    //         }

    //         return prev;
    //     });

    //     if (name === 'trn') {
    //         try {
    //             const response = await axios.get(`/trademgt/sp/${value}`);
    //             response.data.prepayment ? setData(response.data) : alert('No Prepayment Found !');

    //             setFormData((prev) => ({
    //                 ...prev,
    //                 salesPurchaseProducts: response.data.trade_products || []
    //             }));
    //         } catch (error) {
    //             console.error('Error fetching TRN data:', error);
    //         }
    //     }
    // };
    
    // Function to debounce API calls
   // Debounced API call function
   const debouncedApiCall = useCallback(
    debounce(async (trn, product_code, product_name, hs_code, index, arrayName) => {
        try {
            const response = await axios.get('/trademgt/pending-balance', {
                params: {
                    trn,
                    product_code,
                    product_name,
                    hs_code,
                },
            });
            const result = response.data;
            // if (pending_balance !== undefined) {
                setFormData((prev) => {
                    const updatedArray = [...prev[arrayName]];
                    updatedArray[index].pending_qty = result.pending_balance.balance_qty; 
                    updatedArray[index].selected_currency_rate = result.pending_balance.selected_currency_rate;
                    updatedArray[index].rate_in_usd = result.pending_balance.rate_in_usd;
                    updatedArray[index].trade_qty_unit = result.pending_balance.balance_qty_unit;
                    updatedArray[index].tolerance = result.pending_balance.tolerance;
                    return { ...prev, [arrayName]: updatedArray };
                });
            // }
        } catch (error) {
            console.error('Error fetching pending balance:', error);
        }
    }, 1500), [] // Adjust the debounce delay as needed
);


const handleChange = async (e, arrayName = null, index = null) => {
    const { name, value, type, files } = e.target;

    setFormData((prev) => {
        let updatedFormData;

        // Handle file input
        if (type === 'file' && arrayName !== null && index !== null) {
            if (Array.isArray(prev[arrayName])) {
                const updatedArray = [...prev[arrayName]];
                updatedArray[index][name] = files[0];
                updatedFormData = { ...prev, [arrayName]: updatedArray };
            } else {
                console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
                return prev;
            }
        }
        // Handle array input
        else if (arrayName !== null && index !== null) {
            if (Array.isArray(prev[arrayName])) {
                const updatedArray = [...prev[arrayName]];

                // Update the specific field
                updatedArray[index][name] = value;

                // Automatically calculate `bl_value` if `bl_qty` is updated
                if (name === 'product_code' || name === 'product_name' || name === 'hs_code') {
                    // Trigger the debounced API call
                    debouncedApiCall(formData.trn, updatedArray[index].product_code, updatedArray[index].product_name, updatedArray[index].hs_code, index, arrayName);
                }
                
                if (name === 'bl_qty') {
                    const blQty = parseFloat(updatedArray[index].bl_qty) || 0;
                    const rateInUsd = parseFloat(updatedArray[index].rate_in_usd) || 0;
                    updatedArray[index].bl_value = (blQty * rateInUsd).toFixed(2); // Calculate and format to 2 decimals

                    // if (value>calculateTotalWithTolerance(updatedArray[index].pending_qty,updatedArray[index].tolerance)){
                    //     alert(`BL Qty exceeding at Product ${index+1} `)
                        
                    // }
                }

                updatedFormData = { ...prev, [arrayName]: updatedArray };
            } else {
                console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
                return prev;
            }
        }
        // Handle non-array input
        else {
            if (name === 'purchase_bl_number') {
                const bl=purchaseBLOptions.find((bl)=>bl.bl_number=value)
                console.log(bl)
                // If 'purchase_bl_number' is changed, update 'bl_number' in formData
                updatedFormData = { ...prev,purchase_bl_number:value, bl_number: value, bl_date:bl.bl_date, bl_collection_cost:bl.bl_collection_cost, bl_fees:bl.bl_fees };
            } else {
                updatedFormData = { ...prev, [name]: value };
            }
        }

        // Automatically sum `bl_value` fields and update `invoice_amount`
        if (arrayName === 'salesPurchaseProducts') {
            const totalBlValue = updatedFormData.salesPurchaseProducts.reduce(
                (sum, product) => sum + (parseFloat(product.bl_value) || 0),
                0
            );
            updatedFormData.invoice_amount = totalBlValue.toFixed(2); // Keep it as a string with 2 decimals
        }
        return updatedFormData;
    });
    // Fetch TRN data when 'trn' changes (existing logic)
    if (name === 'trn') {
        try {
            const response = await axios.get(`/trademgt/sp/${value}`);
            if (response.data.prepayment) {
                setData(response.data);

                // Update formData with TRN data
                setFormData((prev) => ({
                    ...prev,
                    logistic_cost: response.data.estimated_logistic_cost,
                    // salesPurchaseProducts: response.data.trade_products || [],
                    packingLists: response.data.prepayment.presp.documentRequired.map((doc) => ({
                        name: doc.doc.name || '',
                        packing_list: doc.packing_list || null,
                    })),
                }));
            } else {
                alert('No Prepayment Found!');
            }
        } catch (error) {
            console.error('Error fetching TRN data:', error);
        }
    }
};


    
    
      const handleAddProduct = () => {
        setFormData((prevState) => ({
          ...prevState,
          salesPurchaseProducts: [
            ...prevState.salesPurchaseProducts,
            {
                    product_code: '',
                    product_name: '',
                    hs_code: '',
                    tolerance: '',
                    batch_number: '',
                    production_date: '',
                    pending_qty: '',
                    bl_qty: '',
                    trade_qty_unit: '',
                    bl_value: '',
                    product_code: '',
                    selected_currency_rate: '',
                    rate_in_usd: '',

                },
            ],
        }));
      };
    
      // Handle removing a product from the salesPurchaseProducts array
      const handleRemoveProduct = (index) => {
        setFormData((prevState) => {
          const updatedProducts = prevState.salesPurchaseProducts.filter(
            (_, i) => i !== index
          );
          return { ...prevState, salesPurchaseProducts: updatedProducts };
        });
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
        
        let errors = {};

        // Define fields to skip validation for
        const skipValidation = ['purchase_bl_number'];

        // Check each regular field for empty value (except files and those in skipValidation)
        for (const [key, value] of Object.entries(formData)) {
            if (!skipValidation.includes(key) && value === '') {
                errors[key] = `${capitalizeKey(key)} cannot be empty!`;
            }
        }

         // Validate tradeProducts array fields but skip 'loi'
         formData.salesPurchaseProducts.forEach((product, index) => {
            for (const [key, value] of Object.entries(product)) {
                if (!skipValidation.includes(key) && value === '') {
                    errors[`salesPurchaseProducts[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
        
                // Validation specific to `bl_qty`
                if (key === 'bl_qty') {
                    
                        const maxAllowedQty = calculateTotalWithTolerance(product.pending_qty, product.tolerance);
                        if (value > maxAllowedQty && value<0) {
                            alert(`BL Quantity exceeds tolerance for ${product.product_code || 'this product'}`);
                            errors[`salesPurchaseProducts[${index}].${key}`] = `${capitalizeKey(key)} exceeds trade quantity!`;
                        }
                    
                }
            }
        });

         // Validate tradeProducts array fields but skip 'loi'
         formData.extraCharges.forEach((product, index) => {
            for (const [key, value] of Object.entries(product)) { 
                if (!skipValidation.includes(key) && value === '') {
                    errors[`extraCharges[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
            }
        });

        // Validate tradeProducts array fields but skip 'loi'
        formData.packingLists.forEach((product, index) => {
            for (const [key, value] of Object.entries(product)) { 
                if (!skipValidation.includes(key) && (value === '' || value==null)) {
                    errors[`packingLists[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
            }
        });

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
            axios.post('/trademgt/sales-purchases/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Sales/Purchase added successfully!', response.data);
                navigate(`/sales-purchases`);
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
                navigate(`/sales-purchases`);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            });
        }
    };

    const tradeData = data
    ? [
        { label: 'Trade Type', text: data.trade_type || '' },
        // { label: 'Markings', text: data.markings_in_packaging || '' },
        
        { label: 'Buyer/Seller Name', text: data.prepayment.kyc?.name || '' },
        { label: 'LC Details', text: data.prepayment.lc_number || '' },
        { label: 'Commission Agent', text: data.commission_agent || '' },
        { label: 'Commission Value', text: data.commission_value || 0 },
        // { label: 'Tolerance', text: data.commission_value || '' },
        { label: 'Logistic Provider', text: data.logistic_provider || '' },
        { label: 'Trader Name', text: data.trader_name || '' },
        { label: 'Insurance Policy Number', text: data.insurance_policy_number || '' },
        
        
      ]
    : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <h2 className="text-2xl mb-2 text-center">Sales / Purchase Document</h2>
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
                <table className="min-w-full bg-white">
               <thead>
                 <tr>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th>
                 
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Selected Currency Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">USD Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Marking</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Packing Cost</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packaging Supplier</th>
                 </tr>
               </thead>
               <tbody>
                 {data.trade_products.map(product => (
                   <tr key={product.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.productName.name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td>

                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.selected_currency_rate}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.rate_in_usd}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.markings_in_packaging}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_packing_cost}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.supplier.name}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
                </>
            )}
            {/* SalesPurchase Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ">
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
                    {validationErrors.trn && <p className="text-red-500">{validationErrors.trn}</p>}
                </div>
                <div>
                    <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700">Invoice Date</label>
                    <input
                        id="invoice_date"
                        name="invoice_date"
                        type="date"
                        value={formData.invoice_date}
                        onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                    {validationErrors.invoice_date && <p className="text-red-500">{validationErrors.invoice_date}</p>}
                </div>
                <div>
                    <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">Invoice Number</label>
                    <input
                        id="invoice_number"
                        name="invoice_number"
                        type="text"
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                    {validationErrors.invoice_number && <p className="text-red-500">{validationErrors.invoice_number}</p>}
                </div>
           
            <div>
                <label htmlFor="invoice_amount" className="block text-sm font-medium text-gray-700">Invoice Amount</label>
                <input
                    id="invoice_amount"
                    name="invoice_amount"
                    type="number"
                    value={formData.invoice_amount}
                    onChange={(e) => setFormData({ ...formData, invoice_amount: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.invoice_amount && <p className="text-red-500">{validationErrors.invoice_amount}</p>}
            </div>
            {/* <div>
                <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Value</label>
                <input
                    id="commission_value"
                    name="commission_value"
                    type="number"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div> */}
            <div>
                <label htmlFor="bl_number" className="block text-sm font-medium text-gray-700">BL Number</label>
                <input
                    id="bl_number"
                    name="bl_number"
                    type="text"
                    value={formData.bl_number}
                    onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.bl_number && <p className="text-red-500">{validationErrors.bl_number}</p>}
            </div>
            <div>
                <label htmlFor="purchase_bl_number" className="block text-sm font-medium text-gray-700">Purchase BL Number</label>
                <select
                        id="purchase_bl_number"
                        name="purchase_bl_number"
                        value={formData.purchase_bl_number}
                        onChange={(e) => handleChange(e)}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        disabled={data?.trade_type=='Purchase'?true:false}
                    >
                        <option value="">Select BL Number</option>
                        {purchaseBLOptions.map(option => (
                            <option key={option.id} value={option.bl_number}>
                                {option.bl_number}
                            </option>
                        ))}
                    </select>
                   
            </div>
            {/* <div>
                <label htmlFor="bl_qty" className="block text-sm font-medium text-gray-700">BL Quantity</label>
                <input
                    id="bl_qty"
                    name="bl_qty"
                    type="number"
                    value={formData.bl_qty}
                    onChange={(e) => setFormData({ ...formData, bl_qty: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                {validationErrors.bl_qty && <p className="text-red-500">{validationErrors.bl_qty}</p>}
            </div> */}
            <div>
                <label htmlFor="bl_fees" className="block text-sm font-medium text-gray-700">BL Fees</label>
                <input
                    id="bl_fees"
                    name="bl_fees"
                    type="number"
                    value={formData.bl_fees}
                    onChange={(e) => setFormData({ ...formData, bl_fees: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.bl_fees && <p className="text-red-500">{validationErrors.bl_fees}</p>}
            </div>
            <div>
                <label htmlFor="bl_collection_cost" className="block text-sm font-medium text-gray-700">BL Collection Cost</label>
                <input
                    id="bl_collection_cost"
                    name="bl_collection_cost"
                    type="number"
                    value={formData.bl_collection_cost}
                    onChange={(e) => setFormData({ ...formData, bl_collection_cost: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.bl_collection_cost && <p className="text-red-500">{validationErrors.bl_collection_cost}</p>}
            </div>
            <div>
                <label htmlFor="bl_date" className="block text-sm font-medium text-gray-700">BL Date</label>
                <input
                    id="bl_date"
                    name="bl_date"
                    type="date"
                    value={formData.bl_date}
                    onChange={(e) => setFormData({ ...formData, bl_date: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.bl_date && <p className="text-red-500">{validationErrors.bl_date}</p>}
            </div>
            {/* <div>
                <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                <input
                    id="total_packing_cost"
                    name="total_packing_cost"
                    type="number"
                    value={formData.total_packing_cost}
                    onChange={(e) => setFormData({ ...formData, total_packing_cost: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div> */}
            {/* <div>
                <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                <input
                    id="packaging_supplier"
                    name="packaging_supplier"
                    type="text"
                    value={formData.packaging_supplier}
                    onChange={(e) => setFormData({ ...formData, packaging_supplier: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div> */}
           
                {/* <div>
                    <label htmlFor="logistic_supplier" className="block text-sm font-medium text-gray-700">Logistic Provider</label>
                    <input
                        id="logistic_supplier"
                        name="logistic_supplier"
                        type="text"
                        value={formData.logistic_supplier}
                        onChange={(e) => setFormData({ ...formData, logistic_supplier: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div> */}
           
            <div>
                <label htmlFor="logistic_cost" className="block text-sm font-medium text-gray-700">Logistic Cost</label>
                <input
                    id="logistic_cost"
                    name="logistic_cost"
                    type="number"
                    value={formData.logistic_cost}
                    onChange={(e) => setFormData({ ...formData, logistic_cost: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.logistic_cost && <p className="text-red-500">{validationErrors.logistic_cost}</p>}
            </div>
            <div>
                <label htmlFor="logistic_cost_due_date" className="block text-sm font-medium text-gray-700">Logistic Cost Due Date</label>
                <input
                    id="logistic_cost_due_date"
                    name="logistic_cost_due_date"
                    type="text"
                    value={formData.logistic_cost_due_date}
                    onChange={(e) => setFormData({ ...formData, logistic_cost_due_date: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.logistic_cost_due_date && <p className="text-red-500">{validationErrors.logistic_cost_due_date}</p>}
            </div>
            <div>
                <label htmlFor="liner" className="block text-sm font-medium text-gray-700">Liner</label>
                <input
                    id="liner"
                    name="liner"
                    type="text"
                    value={formData.liner}
                    onChange={(e) => setFormData({ ...formData, liner: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.liner && <p className="text-red-500">{validationErrors.liner}</p>}
            </div>

            <div>
                <label htmlFor="pod" className="block text-sm font-medium text-gray-700">POD</label>
                <input
                    id="pod"
                    name="pod"
                    type="text"
                    value={formData.pod}
                    onChange={(e) => setFormData({ ...formData, pod: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.pod && <p className="text-red-500">{validationErrors.pod}</p>}
            </div>
            <div>
                <label htmlFor="pol" className="block text-sm font-medium text-gray-700">POL</label>
                <input
                    id="pol"
                    name="pol"
                    type="text"
                    value={formData.pol}
                    onChange={(e) => setFormData({ ...formData, pol: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.pol && <p className="text-red-500">{validationErrors.pol}</p>}
            </div>
            <div>
                <label htmlFor="etd" className="block text-sm font-medium text-gray-700">ETD</label>
                <input
                    id="etd"
                    name="etd"
                    type="date"
                    value={formData.etd}
                    onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.etd && <p className="text-red-500">{validationErrors.etd}</p>}
            </div>



            <div>
                <label htmlFor="eta" className="block text-sm font-medium text-gray-700">ETA</label>
                <input
                    id="eta"
                    name="eta"
                    type="date"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.eta && <p className="text-red-500">{validationErrors.eta}</p>}
            </div>
            <div>
                <label htmlFor="shipment_status" className="block text-sm font-medium text-gray-700">Shipment Status</label>
                <input
                    id="shipment_status"
                    name="shipment_status"
                    type="text"
                    value={formData.shipment_status}
                    onChange={(e) => setFormData({ ...formData, shipment_status: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                 {validationErrors.shipment_status && <p className="text-red-500">{validationErrors.shipment_status}</p>}
            </div>
            <div>
                <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                <input
                    id="remarks"
                    name="remarks"
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
                  {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
            </div>
            </div>

            {/* Add more SalesPurchase fields as needed */}

            <hr className="my-6" />
            <div>
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                {formData.salesPurchaseProducts.map((product, index) => (
                    <>
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-1 mb-4 justify-between items-end py-2">
                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="product_code" className="block text-sm font-medium text-gray-700">Product Code</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    value={product.product_code}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Product Code"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />

                                {validationErrors[`salesPurchaseProducts[${index}].product_code`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].product_code`]}
                                    </p>
                                )}
                            </div>
                           
                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <select
                                    id="product_name"
                                    name="product_name"
                                    value={product.product_name}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Product</option>
                                    {productOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`salesPurchaseProducts[${index}].product_name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].product_name`]}
                                    </p>
                                )}
                            </div>

                         
                            <div>
                                <label htmlFor="hs_code" className="block text-sm font-medium text-gray-700">HS Code</label>
                                <input
                                    type="text"
                                    name="hs_code"
                                    value={product.hs_code}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="HS Code"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].hs_code`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].hs_code`]}
                                    </p>
                                )}
                            </div>

                           
                            <div>
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-700">Tolerance</label>
                                <input
                                    type="number"
                                    name="tolerance"
                                    value={product.tolerance}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Tolerance"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].tolerance`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].tolerance`]}
                                    </p>
                                )}
                            </div>

                           
                            <div>
                                <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700">Batch Number</label>
                                <input
                                    type="text"
                                    name="batch_number"
                                    value={product.batch_number}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Batch Number"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].batch_number`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].batch_number`]}
                                    </p>
                                )}
                            </div>

                           
                            <div className="col-span-1 sm:col-span-1">
                                <label htmlFor="production_date" className="block text-sm font-medium text-gray-700">Production Date</label>
                                <input
                                    type="date"
                                    name="production_date"
                                    value={product.production_date}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].production_date`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].production_date`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="pending_qty" className="block text-sm font-medium text-gray-700">Pending Quantity</label>
                                <input
                                    type="text"
                                    name="pending_qty"
                                    value={product.pending_qty}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Pending Quantity"
                                    className="border border-gray-300 p-2 rounded w-full"
                                    readOnly={true}
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].pending_qty`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].pending_qty`]}
                                    </p>
                                )}
                            </div>
                           
                            <div>
                                <label htmlFor="bl_qty" className="block text-sm font-medium text-gray-700">BL Quantity</label>
                                <input
                                    type="number"
                                    name="bl_qty"
                                    value={product.bl_qty}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Trade Quantity"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].bl_qty`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].bl_qty`]}
                                    </p>
                                )}
                            </div>

                           
                            <div>
                                <label htmlFor="trade_qty_unit" className="block text-sm font-medium text-gray-700">Trade Qty Unit</label>
                                <select
                                    name="trade_qty_unit"
                                    value={product.trade_qty_unit}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                >
                                    <option value="">Select Trade Unit</option>
                                    {unitOptions?.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`salesPurchaseProducts[${index}].trade_qty_unit`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].trade_qty_unit`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="selected_currency_rate" className="block text-sm font-medium text-gray-700">Selected Currency Rate</label>
                                <input
                                    type="text"
                                    name="selected_currency_rate"
                                    value={product.selected_currency_rate}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="selected currency rate"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].selected_currency_rate`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].selected_currency_rate`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="rate_in_usd" className="block text-sm font-medium text-gray-700">Rate in USD</label>
                                <input
                                    type="text"
                                    name="rate_in_usd"
                                    value={product.rate_in_usd}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Rate in USD"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].rate_in_usd`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].rate_in_usd`]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="bl_value" className="block text-sm font-medium text-gray-700">Product Value</label>
                                <input
                                    type="number"
                                    name="bl_value"
                                    value={product.bl_value}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Product Value"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                                {validationErrors[`salesPurchaseProducts[${index}].bl_value`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`salesPurchaseProducts[${index}].bl_value`]}
                                    </p>
                                )}
                            </div>


                            <div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(index)}
                                    className="bg-red-500 text-white p-2 rounded"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>

                        <hr />
                    </>
                ))}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={handleAddProduct}
                        className="bg-green-500 text-white p-2 rounded mt-2"
                    >
                        Add Product
                    </button>
                </div>
            </div>
            <hr className="my-6" />
                        
            {/* SalesPurchaseExtraCharge Section */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">Other Charges</h3>
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
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                             {validationErrors[`extraCharges[${index}].name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`extraCharges[${index}].name`]}
                                    </p>
                                )}
                        </div>
                        <div>
                            <label htmlFor={`extra_charge_${index}`} className="block text-sm font-medium text-gray-700">Charge</label>
                            <input
                                id={`extra_charge_${index}`}
                                name="charge"
                                type="number"
                                value={extraCharge.charge}
                                onChange={(e) => handleChange(e, 'extraCharges', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                             {validationErrors[`extraCharges[${index}].charge`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`extraCharges[${index}].charge`]}
                                    </p>
                                )}
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('extraCharges', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('extraCharges')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Extra Charge
                </button>
                </div>
               
            </div>
            <hr className="my-6" />
            {/* PackingList Section */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">Add Addititional Documents</h3>
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
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                            {validationErrors[`packingLists[${index}].name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`packingLists[${index}].name`]}
                                    </p>
                                )}
                        </div>
                        <div>
                            <label htmlFor={`packing_list_file_${index}`} className="block text-sm font-medium text-gray-700">Document</label>
                            <input
                                id={`packing_list_file_${index}`}
                                name="packing_list"
                                type="file"
                                onChange={(e) => handleChange(e, 'packingLists', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                            {validationErrors[`packingLists[${index}].packing_list`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`packingLists[${index}].packing_list`]}
                                    </p>
                                )}
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('packingLists', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('packingLists')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Packing List
                </button>
                </div>
               
            </div>
            <hr className="my-6" />
            <div className='grid grid-cols-3 gap-4 mb-4'>
            <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded col-span-3"
                >
                    {mode === 'add' ? 'Add S&P' : 'Update S&P'}
                </button>
            </div>
        </form>
    );
};

export default SalesPurchaseForm;
