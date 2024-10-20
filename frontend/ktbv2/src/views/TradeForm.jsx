import React, { useState, useEffect, useCallback } from 'react';
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import debounce from 'lodash.debounce';

const TradeForm = ({ mode = 'add' }) => {

    const { id } = useParams();
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

    const [isContractBalanceQtyReadOnly, setIsContractBalanceQtyReadOnly] = useState(false);

    const [formData, setFormData] = useState({
        company: '',
        trd: today,
        trn: '',
        trade_type: '',
        trade_category: '',
        country_of_origin: '',
        customer_company_name: '',
        address: '',
       
        currency_selection: '',
        exchange_rate: '',
      
        commission_agent: '',
        contract_value: '',
        payment_term: '',
        advance_value_to_receive: '',
        
        commission_value: '',
        logistic_provider: '',
        estimated_logistic_cost: '',
        logistic_cost_tolerence: '',
        logistic_cost_remarks: '',
        bank_name_address: '',
        account_number: '',
        swift_code: '',
        incoterm: '',
        pod: '',
        pol: '',
        eta: '',
        etd: '',
        remarks: '',
        trader_name: '',
        insurance_policy_number: '',
        
        shipper_in_bl: '',
        consignee_in_bl: '',
        notify_party_in_bl: '',
        
        container_shipment_size: '',
        bl_fee: '',
        bl_fee_remarks: '',
        tradeProducts: [
            {
                product_code: '',
                product_name: '',
                product_name_for_client: '',
                loi: null,
                hs_code: '',
                total_contract_qty: '',
                total_contract_qty_unit: '',
                tolerance: '',
                contract_balance_qty: '',
                contract_balance_qty_unit: '',
                trade_qty: '',
                trade_qty_unit: '',
                selected_currency_rate: '',
                rate_in_usd:'',
                product_value:'',
                markings_in_packaging:'',
                packaging_supplier:'',
                mode_of_packing:'',
                rate_of_each_packing:'',
                qty_of_packing:'',
                total_packing_cost:'',
                commission_rate: '',
                total_commission: '',
            }
        ],
        tradeExtraCosts: [
            {
                extra_cost: '',
                extra_cost_remarks: ''
            }
        ],
        relatedTrades: []
    });

    const tradeTypeOptions = ['Sales', 'Purchase'];
    const tradeCategoryOptions = ['Sales', 'Sales Cancel', 'Purchase', 'Purchase Cancel'];

    const [companyOptions, setCompanyOptions] = useState([]); 
    const [customerOptions, setCustomerOptions] = useState([]); 
    const [paymentTermOptions, setPaymentTermOptions] = useState([]); 
    const [bankNameOptions, setBankNameOptions] = useState([]); 
    const [unitOptions, setUnitOptions] = useState([]);
    const [productNameOptions, setProductNameOptions] = useState([]);
    const [packingOptions, setPackingOptions] = useState([]);
    const [shipmentSizeOptions, setShipmentSizeOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    
    // Function to fetch data
    const fetchData = async (url, setStateFunction) => {
        try {
            const response = await axios.get(url);
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    // Combined useEffect for all API calls
    useEffect(() => {
        fetchData('/trademgt/kyc', setCustomerOptions);
        fetchData('/trademgt/company', setCompanyOptions);
        fetchData('/trademgt/payment-terms', setPaymentTermOptions);
        fetchData('/trademgt/bank', setBankNameOptions);
        fetchData('/trademgt/unit', setUnitOptions);
        fetchData('/trademgt/packings', setPackingOptions);
        fetchData('/trademgt/product-names', setProductNameOptions);
        fetchData('/trademgt/currencies', setCurrencyOptions);
        fetchData('/trademgt/shipment-sizes', setShipmentSizeOptions);
    }, []);



    const [tradeOptions, setTradeOptions] = useState([]);
    useEffect(() => {
        // Fetch all trades to populate the relatedTrades options
        axios.get('/trademgt/trades/')
            .then(response => {
                const options = response.data.map(trade => ({
                    value: trade.id,
                    label: trade.trn, // Use trade.trn or any other field you want to display
                }));
                setTradeOptions(options);
            })
            .catch(error => {
                console.error('Error fetching trades', error);
            });
    }, []);

    useEffect(() => {
        if (mode === 'update' && id) {
            // Fetch existing trade data for update
            axios.get(`/trademgt/trades/${id}`)
                .then(response => {
                    const data = response.data;

                    // Ensure that formData has the necessary structure
                    setFormData(prevData => ({
                        ...prevData,
                        ...data,
                        // Example: Ensure relatedTrades is an array if it's expected
                        relatedTrades: Array.isArray(data.related_trades) ? data.related_trades : []
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the trade data!', error);
                });
        }
    }, [mode, id]);

    // Debounced function to call the API
    const fetchProductDetails = useCallback(
        debounce(async (index, productCode) => {
          try {
            let response;
      
            if (formData.trade_type === 'Sales') {
              response = await axios.get(`/trademgt/sales-product-trace/?product_code=${productCode}`);
            } else {
              response = await axios.get(`/trademgt/purchase-product-trace/?product_code=${productCode}`);
            }
            if (response.status === 200) {
              const { data } = response;
              if (Array.isArray(data) && data.length > 0) {
                setFormData((prevState) => {
                    const updatedProducts = [...prevState.tradeProducts];
                    updatedProducts[index].total_contract_qty = data[0]?.total_contract_qty; // Example field
                    updatedProducts[index].contract_balance_qty = data[0]?.contract_balance_qty; // Example field
                    setIsContractBalanceQtyReadOnly(true);
                    return { ...prevState, tradeProducts: updatedProducts };
                });
              }
            
            } else {
                setIsContractBalanceQtyReadOnly(false);
                console.error('Error fetching product details:', response.statusText);
            }
          } catch (error) {
            console.error('Error fetching product details:', error.message);
          }
        }, 500), // Debounce delay in milliseconds
        [formData.trade_type] // Dependency array
      );

    const handleChange = async (e, index, section) => {
        const { name, value, type, files } = e.target;
    
        if (type === 'file') {
            setFormData((prevState) => {
                const updatedProducts = [...prevState.tradeProducts];
                updatedProducts[index][name] = files[0];
                return { ...prevState, tradeProducts: updatedProducts };
            });
        } else {
            if (name === 'company') {
                // When a company is selected, fetch the next counter value
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
    
                try {
                    const selectedCompany = companyOptions.find((company) => company.id == value);
                    if (selectedCompany) {
                        try {
                            const response = await axios.get(`/trademgt/companies/${selectedCompany.id}/next-counter/`);
                            
                            // Check if the request was successful
                            if (response.status === 200) {
                                const data = response.data; // axios handles JSON parsing
                                setFormData((prevState) => ({
                                    ...prevState,
                                    trn: data.next_counter, // Auto-fill the TRN field with the next counter
                                }));
                            } else {
                                console.error('Error fetching the next counter:', response.statusText);
                            }
                        } catch (error) {
                            console.error('Error:', error.message);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching next counter:', error);
                }
            } else if (name === 'customer_company_name') {
                const selectedCustomer = customerOptions.find((customer) => customer.id == value);
    
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                    address: selectedCustomer?.address || '',
                }));
            } else if (name === 'payment_term'){
                const selectedTerm = paymentTermOptions.find((term) => term.id == value);
                
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                    advance_value_to_receive: ((selectedTerm?.advance_in_percentage / 100) * prevState?.contract_value).toFixed(2) || 0

                }));
                
            } else if (name === 'bank_name_address') {
                const selectedBank = bankNameOptions.find((bank) => bank.id == value);
    
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                    swift_code: selectedBank?.swift_code || '',
                    account_number: selectedBank?.account_number || '',
                }));
            } else if (section === 'products') {
                setFormData((prevState) => {
                    const updatedProducts = [...prevState.tradeProducts];
                    updatedProducts[index][name] = value;
                    if (name==='product_code' && value){
                        setIsContractBalanceQtyReadOnly(false);
                        fetchProductDetails(index, value); // Fetch product details
                    }
                    if (name === 'total_contract_qty') {
                        updatedProducts[index].contract_balance_qty = value;
                    }
                    if (name === 'contract_balance_qty') {
                        updatedProducts[index].total_contract_qty = value;
                    }
                    if (name === 'commission_rate') {
                        const trade_qty = parseFloat(updatedProducts[index].trade_qty) || 0;
                        updatedProducts[index].total_commission = (value * trade_qty).toFixed(2);
                    }
                    // Check if the changed field is one of the synchronized dropdowns
                    if (name === 'total_contract_qty_unit' || name === 'contract_balance_qty_unit' || name === 'trade_qty_unit') {
                        // Update both fields to the same value
                        updatedProducts[index].total_contract_qty_unit = value;
                        updatedProducts[index].contract_balance_qty_unit = value;
                        updatedProducts[index].trade_qty_unit = value;
                    }
                    if(name==='qty_of_packing' || name==='rate_of_each_packing'){
                        
                        const rate = parseFloat(updatedProducts[index].rate_of_each_packing) || 0;
                        const qty = parseFloat(updatedProducts[index].qty_of_packing) || 0;
                        
                        // Calculate total packing cost
                        updatedProducts[index].total_packing_cost = (rate * qty).toFixed(2);        
                    }
                    if(name==='trade_qty' || name==='selected_currency_rate'){
                        const trade_qty = parseFloat(updatedProducts[index].trade_qty) || 0;
                        const selected_currency_rate = parseFloat(updatedProducts[index].selected_currency_rate) || 0;
                        
                        updatedProducts[index].rate_in_usd =  selected_currency_rate * parseFloat(prevState.exchange_rate);
                        updatedProducts[index].product_value = (selected_currency_rate * trade_qty).toFixed(2);
                    }

                    const totalContractValue = updatedProducts.reduce((acc, product) => acc + (parseFloat(product.product_value) || 0), 0);
                    const commissionValue = updatedProducts.reduce((acc, product) => acc + (parseFloat(product.total_commission) || 0), 0);
    
                    return { ...prevState, tradeProducts: updatedProducts,contract_value: totalContractValue.toFixed(2),commission_value: commissionValue.toFixed(2) };
                });
            } else if (section === 'extraCosts') {
                setFormData((prevState) => {
                    const updatedExtraCosts = [...prevState.tradeExtraCosts];
                    updatedExtraCosts[index][name] = value;
                    return { ...prevState, tradeExtraCosts: updatedExtraCosts };
                });
            } else {
                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                }));
            }
        }
    };

    const handleAddProduct = () => {
        setFormData(prevState => ({
            ...prevState,
            tradeProducts: [
                ...prevState.tradeProducts,
                {
                    product_code: '',
                    product_name: '',
                    product_name_for_client: '',
                    loi: null,
                    hs_code: '',
                    total_contract_qty: '',
                    total_contract_qty_unit: '',
                    tolerance: '',
                    contract_balance_qty: '',
                    contract_balance_qty_unit: '',
                    trade_qty: '',
                    trade_qty_unit: '',
                    selected_currency_rate: '',
                    rate_in_usd:'',
                    product_value:'',
                    markings_in_packaging:'',
                    packaging_supplier:'',
                    mode_of_packing:'',
                    rate_of_each_packing:'',
                    qty_of_packing:'',
                    total_packing_cost:'',
                    commission_rate: '',
                    total_commission: '',
                }
            ]
        }));
    };

    const handleAddExtraCost = () => {
        setFormData(prevState => ({
            ...prevState,
            tradeExtraCosts: [
                ...prevState.tradeExtraCosts,
                {
                    extra_cost: '',
                    extra_cost_remarks: ''
                }
            ]
        }));
    };

    const handleRemoveProduct = (index) => {
        setFormData(prevState => ({
            ...prevState,
            tradeProducts: prevState.tradeProducts.filter((_, i) => i !== index)
        }));
    };

    const handleRemoveExtraCost = (index) => {
        setFormData(prevState => ({
            ...prevState,
            tradeExtraCosts: prevState.tradeExtraCosts.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Log formData to check its structure
    console.log('Form Data:', formData);

    // Check if formData.tradeProducts is defined and is an array
    if (!Array.isArray(formData.tradeProducts) || formData.tradeProducts.length === 0) {
        alert('Trade Products data is missing or invalid!');
        return; // Stop form submission
    }

    // Validate Trade Quantity against Contract Balance Quantity
    const invalidProduct = formData.tradeProducts.find(product => {
        console.log('Product:', product); // Debug: Log each product to ensure it's structured correctly
        return Number(product.trade_qty) > Number(product.contract_balance_qty); // Ensure values are compared as numbers
    });

    if (invalidProduct) {
        alert(`Trade Quantity cannot be greater than Contract Balance Quantity for product index: ${formData.tradeProducts.indexOf(invalidProduct) + 1}`);
        return; // Stop form submission
    }

        const formDataToSend = new FormData();

        // Append regular fields
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

        // Append related trades (array of IDs)
        if (Array.isArray(formData.relatedTrades)) {
            formData.relatedTrades.forEach((tradeId, index) => {
                formDataToSend.append(`relatedTrades[${index}]`, tradeId);
            });
        }

        // Post new trade data to API
        if (mode === 'add') {
            axios.post('/trademgt/trades/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    console.log('Trade added successfully!', response.data);
                    navigate(-1);
                               
                })
                .catch(error => {
                    console.error('There was an error adding the trade!', error);
                });
        } else if (mode === 'update') {
            axios.put(`/trademgt/trades/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    console.log('Trade updated successfully!', response.data);
                    navigate(-1);
                })
                .catch(error => {
                    console.error('There was an error updating the trade!', error);
                });
        }
    };

   
   

    const handleSelectChange = (selectedOptions) => {
        setFormData({
            ...formData,
            relatedTrades: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6  w-full lg:w-2/3 mx-auto">

            <div className="grid grid-cols-3 gap-4 p-4 ">
                <div>
                    <label htmlFor="trade_type" className="block text-sm font-medium text-gray-700">Select Trade Type</label>
                    <select
                        name="trade_type"
                        value={formData.trade_type}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Trade Type</option>
                        {tradeTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Company</option>
                        {companyOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Related Trades</label>
                    <Select
                        isMulti
                        name="relatedTrades"
                        options={tradeOptions}
                        value={tradeOptions.filter(option => formData.relatedTrades.includes(option.value))}
                        onChange={handleSelectChange}
                    />
                </div>
                <div>
                    <label htmlFor="trd" className="block text-sm font-medium text-gray-700">Trade Reference Date</label>
                    <input
                        type="date"
                        name="trd"
                        value={formData.trd}
                        onChange={handleChange}
                        placeholder="Trade Date"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="trd" className="block text-sm font-medium text-gray-700">Transaction Reference Number</label>
                    <input
                        type="text"
                        name="trn"
                        value={formData.trn}
                        onChange={handleChange}
                        placeholder="Transaction Reference Number"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* Add other fields similarly */}
                
                <div>
                    <label htmlFor="trade_category" className="block text-sm font-medium text-gray-700">Select Trade Category</label>
                    <select
                        name="trade_category"
                        value={formData.trade_category}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Trade Category</option>
                        {tradeCategoryOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700">Country of Origin</label>
                    <input
                        type="text"
                        name="country_of_origin"
                        value={formData.country_of_origin}
                        onChange={handleChange}
                        placeholder="Country of Origin"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="customer_company_name" className="block text-sm font-medium text-gray-700">Select Customer Company</label>
                    <select
                        name="customer_company_name"
                        value={formData.customer_company_name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Customer Company</option>
                        {customerOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
              
               
                <div>
                    <label htmlFor="currency_selection" className="block text-sm font-medium text-gray-700">Currency Selection</label>
                    <select
                        name="currency_selection"
                        value={formData.currency_selection}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Currency</option>
                        {currencyOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700">Exchange Rate</label>
                    <input
                        type="number"
                        name="exchange_rate"
                        value={formData.exchange_rate}
                        onChange={handleChange}
                        placeholder="Exchange Rate"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
                <div>
                    <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission Agent</label>
                    <input
                        type="text"
                        name="commission_agent"
                        value={formData.commission_agent}
                        onChange={handleChange}
                        placeholder="Commission Agent"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
                <div>
                    <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Value</label>
                    <input
                        type="number"
                        name="commission_value"
                        value={formData.commission_value}
                        onChange={handleChange}
                        placeholder="Commission Value"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="contract_value" className="block text-sm font-medium text-gray-700">Contract Value</label>
                    <input
                        type="number"
                        name="contract_value"
                        value={formData.contract_value}
                        onChange={handleChange}
                        placeholder="Contract Value"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="payment_term" className="block text-sm font-medium text-gray-700">Select Payment Term</label>
                    <select
                        name="payment_term"
                        value={formData.payment_term}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Payment Term</option>
                        {paymentTermOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="advance_value_to_receive" className="block text-sm font-medium text-gray-700">Advance Value to Receive</label>
                    <input
                        type="number"
                        name="advance_value_to_receive"
                        value={formData.advance_value_to_receive}
                        onChange={handleChange}
                        placeholder="Advance Value to Receive"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
               
                <div>
                    <label htmlFor="logistic_provider" className="block text-sm font-medium text-gray-700">Logistic Provider</label>
                    <input
                        type="text"
                        name="logistic_provider"
                        value={formData.logistic_provider}
                        onChange={handleChange}
                        placeholder="Logistic Provider"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="logistic_provider" className="block text-sm font-medium text-gray-700">Estimated Logistic Cost</label>
                    <input
                        type="number"
                        name="estimated_logistic_cost"
                        value={formData.estimated_logistic_cost}
                        onChange={handleChange}
                        placeholder="Estimated Logistic Cost"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="logistic_cost_tolerence" className="block text-sm font-medium text-gray-700">Logistic Cost Tolerance</label>
                    <input
                        type="number"
                        name="logistic_cost_tolerence"
                        value={formData.logistic_cost_tolerence}
                        onChange={handleChange}
                        placeholder="Logistic Cost Tolerance"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="logistic_cost_remarks" className="block text-sm font-medium text-gray-700">Logistic Cost Remarks</label>
                    <input
                        type="text"
                        name="logistic_cost_remarks"
                        value={formData.logistic_cost_remarks}
                        onChange={handleChange}
                        placeholder="Logistic Cost Remarks"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="bank_name_address" className="block text-sm font-medium text-gray-700">Select Bank Name & Address</label>
                    <select
                        name="bank_name_address"
                        value={formData.bank_name_address}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Bank Name & Address</option>
                        {bankNameOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        type="text"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleChange}
                        placeholder="Account Number"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700">SWIFT Code</label>
                    <input
                        type="text"
                        name="swift_code"
                        value={formData.swift_code}
                        onChange={handleChange}
                        placeholder="SWIFT Code"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="incoterm" className="block text-sm font-medium text-gray-700">Incoterm</label>
                    <input
                        type="text"
                        name="incoterm"
                        value={formData.incoterm}
                        onChange={handleChange}
                        placeholder="Incoterm"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="pod" className="block text-sm font-medium text-gray-700">POD</label>
                    <input
                        type="text"
                        name="pod"
                        value={formData.pod}
                        onChange={handleChange}
                        placeholder="POD"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="pol" className="block text-sm font-medium text-gray-700">POL</label>
                    <input
                        type="text"
                        name="pol"
                        value={formData.pol}
                        onChange={handleChange}
                        placeholder="POL"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="eta" className="block text-sm font-medium text-gray-700">ETA</label>
                    <input
                        type="text"
                        name="eta"
                        value={formData.eta}
                        onChange={handleChange}
                        placeholder="ETA"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="etd" className="block text-sm font-medium text-gray-700">ETD</label>
                    <input
                        type="text"
                        name="etd"
                        value={formData.etd}
                        onChange={handleChange}
                        placeholder="ETD"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Remarks"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="trader_name" className="block text-sm font-medium text-gray-700">Trader Name</label>
                    <input
                        type="text"
                        name="trader_name"
                        value={formData.trader_name}
                        onChange={handleChange}
                        placeholder="Trader Name"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-700">Insurance Policy Number</label>
                    <input
                        type="text"
                        name="insurance_policy_number"
                        value={formData.insurance_policy_number}
                        onChange={handleChange}
                        placeholder="Insurance Policy Number"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
                <div>
                    <label htmlFor="shipper_in_bl" className="block text-sm font-medium text-gray-700">Shipper in BL</label>
                    <input
                        type="text"
                        name="shipper_in_bl"
                        value={formData.shipper_in_bl}
                        onChange={handleChange}
                        placeholder="Shipper in BL"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="consignee_in_bl" className="block text-sm font-medium text-gray-700">Consignee in BL</label>
                    <input
                        type="text"
                        name="consignee_in_bl"
                        value={formData.consignee_in_bl}
                        onChange={handleChange}
                        placeholder="Consignee in BL"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="notify_party_in_bl" className="block text-sm font-medium text-gray-700">Notify Party in BL</label>
                    <input
                        type="text"
                        name="notify_party_in_bl"
                        value={formData.notify_party_in_bl}
                        onChange={handleChange}
                        placeholder="Notify Party in BL"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
               
                <div>
                    <label htmlFor="container_shipment_size" className="block text-sm font-medium text-gray-700">Container Shipment Size</label>
                    <select
                        name="container_shipment_size"
                        value={formData.container_shipment_size}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Size</option>
                        {shipmentSizeOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="bl_fee" className="block text-sm font-medium text-gray-700">BL Fee</label>
                    <input
                        type="number"
                        name="bl_fee"
                        value={formData.bl_fee}
                        onChange={handleChange}
                        placeholder="BL Fee"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="bl_fee_remarks" className="block text-sm font-medium text-gray-700">BL Fee Remarks</label>
                    <input
                        type="text"
                        name="bl_fee_remarks"
                        value={formData.bl_fee_remarks}
                        onChange={handleChange}
                        placeholder="BL Fee Remarks"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                {/* <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded col-span-3"
      >
        Submit
      </button> */}
            </div>

            <hr className="my-6" />

            {/* Trade Products Section */}
            <div >
                {formData.tradeProducts.map((product, index) => (
                    <>
                        <div key={index} className="grid grid-cols-5 gap-2 mb-4 justify-between items-end px-4 py-2">
                            <div>
                                <label htmlFor="product_code" className="block text-sm font-medium text-gray-700">Product Code</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    value={product.product_code}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Code"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <select
                                    name="product_name"
                                    value={product.product_name}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Product Name</option>
                                    {productNameOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="product_name_for_client" className="block text-sm font-medium text-gray-700">Product Name for Client</label>
                                <input
                                    type="text"
                                    name="product_name_for_client"
                                    value={product.product_name_for_client}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Name for Client"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>

                            <div className="col-span-1">
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">LOI</label>
                                <input
                                    type="file"
                                    name="loi"
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full"
                                    disabled={!product.product_name_for_client}
                                />
                                {/* {product.loi && <span className="block mt-2 text-gray-600">{product.loi}</span>} */}
                            </div>
                            <div>
                                <label htmlFor="hs_code" className="block text-sm font-medium text-gray-700">HS Code</label>
                                <input
                                    type="text"
                                    name="hs_code"
                                    value={product.hs_code}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="HS Code"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="total_contract_qty" className="block text-sm font-medium text-gray-700">Total Contract Qty</label>
                                <input
                                    type="number"
                                    name="total_contract_qty"
                                    value={product.total_contract_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Contract Qty"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                    readOnly={isContractBalanceQtyReadOnly}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="total_contract_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Total Contract Qty Unit
                                </label>
                                <select
                                    name="total_contract_qty_unit"
                                    value={product.total_contract_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-700">Tolerance</label>
                                <input
                                    type="number"
                                    name="tolerance"
                                    value={product.tolerance}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Tolerance"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-700">Contract Balance Qty</label>
                                <input
                                    type="number"
                                    name="contract_balance_qty"
                                    value={product.contract_balance_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Contract Balance Qty"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                    readOnly={isContractBalanceQtyReadOnly}
                                />
                            </div>
                           
                            <div>
                                <label htmlFor="contract_balance_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Contract Balance Qty Unit
                                </label>
                                <select
                                    name="contract_balance_qty_unit"
                                    value={product.contract_balance_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="trade_qty" className="block text-sm font-medium text-gray-700">Trade Qty</label>
                                <input
                                    type="number"
                                    name="trade_qty"
                                    value={product.trade_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Trade Qty"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="trade_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Trade Qty Unit
                                </label>
                                <select
                                    name="trade_qty_unit"
                                    value={product.trade_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="selected_currency_rate" className="block text-sm font-medium text-gray-700">Rate in Selected Currency</label>
                                <input
                                    type="number"
                                    name="selected_currency_rate"
                                    value={product.selected_currency_rate}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="rate_in_usd" className="block text-sm font-medium text-gray-700">Rate in USD</label>
                                <input
                                    type="number"
                                    name="rate_in_usd"
                                    value={product.rate_in_usd}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate in USD"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="product_value" className="block text-sm font-medium text-gray-700">Product Value</label>
                                <input
                                    type="number"
                                    name="product_value"
                                    value={product.product_value}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Value"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="mode_of_packing" className="block text-sm font-medium text-gray-700">Mode of Packing</label>
                                <select
                                    name="mode_of_packing"
                                    value={product.mode_of_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Packing</option>
                                    {packingOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="rate_of_each_packing" className="block text-sm font-medium text-gray-700">Rate of Each packing</label>
                                <input
                                    type="number"
                                    name="rate_of_each_packing"
                                    value={product.rate_of_each_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate of Each packing"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="qty_of_packing" className="block text-sm font-medium text-gray-700">Qty of packing</label>
                                <input
                                    type="number"
                                    name="qty_of_packing"
                                    value={product.qty_of_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Qty of packing"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                                <input
                                    type="number"
                                    name="total_packing_cost"
                                    value={product.total_packing_cost}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Packing Cost"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                                <select
                                    name="packaging_supplier"
                                    value={product.packaging_supplier}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                >
                                    <option value="">Select Supplier</option>
                                    {customerOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="markings_in_packaging" className="block text-sm font-medium text-gray-700">Markings in Packaging</label>
                                <input
                                    type="text"
                                    name="markings_in_packaging"
                                    value={product.markings_in_packaging}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Markings in Packaging"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">Commission Rate</label>
                                <input
                                    type="number"
                                    name="commission_rate"
                                    value={product.commission_rate}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Commission Rate"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="total_commission" className="block text-sm font-medium text-gray-700">Total Commission</label>
                                <input
                                    type="number"
                                    name="total_commission"
                                    value={product.total_commission}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Commission"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div className="col-span-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(index)}
                                    className=" bg-red-500 text-white p-2 rounded"
                                >
                                    Remove Product
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
            <div className=''>
                {formData.tradeExtraCosts.map((extraCost, index) => (
                    <>
                        <div key={index} className="grid grid-cols-3 gap-4 mb-4 justify-between items-end px-4">
                            <div>
                                <label htmlFor="extra_cost" className="block text-sm font-medium text-gray-700">Extra Cost</label>
                                <input
                                    type="number"
                                    name="extra_cost"
                                    value={extraCost.extra_cost}
                                    onChange={(e) => handleChange(e, index, 'extraCosts')}
                                    placeholder="Extra Cost"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <label htmlFor="extra_cost_remarks" className="block text-sm font-medium text-gray-700">Extra Cost Remarks</label>
                                <input
                                    type="text"
                                    name="extra_cost_remarks"
                                    value={extraCost.extra_cost_remarks}
                                    onChange={(e) => handleChange(e, index, 'extraCosts')}
                                    placeholder="Extra Cost Remarks"
                                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExtraCost(index)}
                                    className=" bg-red-500 text-white p-2 rounded "
                                >
                                    Remove
                                </button>
                            </div>

                        </div>
                        <hr />
                    </>
                ))}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={handleAddExtraCost}
                        className="bg-green-500 text-white p-2 rounded mt-2"
                    >
                        Add Another Extra Cost
                    </button>
                </div>
            </div>
            <div className='grid grid-cols-3 gap-4 mb-4'>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded col-span-3"
                >
                    {mode === 'add' ? 'Add Trade' : 'Update Trade'}
                </button>
            </div>
        </form>
    );
};

export default TradeForm;
