import React, { useState, useEffect, useCallback,useRef } from 'react';
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import {capitalizeKey} from '../utils';
import DateInputWithIcon from '../components/DateInputWithIcon';

const TradeForm = ({ mode = 'add' }) => {

    const { id } = useParams();
    const navigate = useNavigate();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

    const [isContractBalanceQtyReadOnly, setIsContractBalanceQtyReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    

    const initialFormData={
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
        
        // container_shipment_size: '',
        bl_fee: '',
        bl_fee_remarks: '',
        tradeProducts: [
            {
                // product_code_ref: 'NA',
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
                ref_product_code: '',
                ref_trn: '',
                ref_balance: '',
                container_shipment_size: '',
                logistic: '',
            }
        ],
        tradeExtraCosts: [
            {
                extra_cost: '',
                extra_cost_remarks: ''
            }
        ],
        // relatedTrades: []
    };
    const [formData, setFormData] = useState(initialFormData);

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
    const [salesTrace, setSalesTrace] = useState([]);
    const [purchaseTrace, setPurchaseTrace] = useState([]);
    const [refProductOptions,setRefProductOptions] = useState([]);
    
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
        fetchData('/trademgt/kyc/?approve1=true&approve2=true', setCustomerOptions);
        fetchData('/trademgt/company', setCompanyOptions);
        fetchData('/trademgt/payment-terms', setPaymentTermOptions);
        fetchData('/trademgt/bank', setBankNameOptions);
        fetchData('/trademgt/unit', setUnitOptions);
        fetchData('/trademgt/packings', setPackingOptions);
        fetchData('/trademgt/product-names', setProductNameOptions);
        fetchData('/trademgt/currencies', setCurrencyOptions);
        fetchData('/trademgt/shipment-sizes', setShipmentSizeOptions);
        // fetchData('/trademgt/purchase-product-trace', setPurchaseTrace);
        // fetchData('/trademgt/sales-product-trace', setSalesTrace);
        // fetchData('/trademgt/refproductcode', setRefProductOptions);
    }, []);

    useEffect(() => {
        if (mode === 'add') {  // Only pre-fill for new forms
            const savedDraft = localStorage.getItem('tradeDraft');
            if (savedDraft) {
                setFormData(JSON.parse(savedDraft));
            }
        }
    }, [mode]);

    const [tradeOptions, setTradeOptions] = useState([]);
    useEffect(() => {
        // Fetch all trades to populate the relatedTrades options
        axios.get('/trademgt/trades?approved=true&reviewed=true')
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
    if (!formData.trade_type || formData.trade_type=='') return;

    axios.get('/trademgt/refproductcode', {
        params: {
            trade_type: formData.trade_type
        }
    })
    .then(response => {
        setRefProductOptions(response.data);  // Assuming product_codes is a list
    })
    .catch(error => {
        console.error('Error fetching product codes', error);
    });
}, [formData.trade_type]);

    useEffect(() => {
        if (mode === 'update' && id) {
            // Fetch existing trade data for update
            axios.get(`/trademgt/trades/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevData => ({
                        ...prevData,
                        ...data,
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the trade data!', error);
                });
        }
    }, [mode, id]);

    useEffect(() => {
        // Calculate contract value and product value whenever exchange_rate changes
        if (formData.exchange_rate) {
            const updatedTradeProducts = formData.tradeProducts.map(product => ({
                ...product,
                product_value: product.trade_qty*product.rate_in_usd
            }));
            const selectedTerm = paymentTermOptions?.find((term) => term.id == formData.payment_term);
            const updatedContractValue = updatedTradeProducts.reduce((acc, product) => acc + (parseFloat(product.product_value) || 0), 0);
            const commissionValue = updatedTradeProducts.reduce((acc, product) => acc + (parseFloat(product.total_commission) || 0), 0);
            setFormData(prevState => ({
                ...prevState,
                contract_value: updatedContractValue,
                commission_value: commissionValue,
                tradeProducts: updatedTradeProducts,
                advance_value_to_receive: ((selectedTerm?.advance_in_percentage / 100) * updatedContractValue).toFixed(2) || 0
            }));
        }
    }, [formData.exchange_rate]);

    // Debounced function to call the API
    const fetchProductDetails = useCallback(
        
        // debounce(async (index,product_code_ref, productCode) => {
        debounce(async (index, productCode) => {
            // console.log('========',product_code_ref,productCode)
          try {
            let response;
      
          
            //   response = await axios.get(`/trademgt/sales-product-trace/?product_code=${productCode}&first_trn=${product_code_ref}`);
              response = await axios.get(`/trademgt/product-trace/?product_code=${productCode}&trade_type=${formData.trade_type}`);
           
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

    const calculateAdvanceValue = (contractValue, selectedTerm) => {
        if (!contractValue || !selectedTerm?.advance_in_percentage) return 0;
        return ((selectedTerm.advance_in_percentage / 100) * contractValue).toFixed(2);
    };

    useEffect(() => {
        const selectedTerm = paymentTermOptions.find((term) => term.id == formData.payment_term);
        if (formData.contract_value && selectedTerm) {
            setFormData((prevState) => ({
                ...prevState,
                advance_value_to_receive: calculateAdvanceValue(prevState.contract_value, selectedTerm)
            }));
        }
    }, [formData.contract_value]);

    const handleChange = async (e, index, section) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData((prevState) => {
                const updatedProducts = [...prevState.tradeProducts];
                updatedProducts[index][name] = files[0];
                return { ...prevState, tradeProducts: updatedProducts };
            });
        } else {
            // Get the product's product_code and product_name based on the index
            const product = formData.tradeProducts[index];
            const prod_code = product?.product_code;
            const trade_type = formData.trade_type;
            const ref_product_code = product?.ref_product_code;

            if (name === 'ref_trn' && value !== 'NA') {
                // console.log('here:', prod_code, prod_name, value)
                try {
                    // Call the API with ref_trn, product_code, and product_name as query params
                    const response = await axios.get(`/trademgt/product-balance`, {
                        params: {
                            trn: value,
                            // product_code:prod_code,
                            trade_type:trade_type,
                            ref_product_code:ref_product_code,
                        }
                    });

                    // Check if the response is successful
                    if (response.status === 200) {
                        const { ref_balance } = response.data; // Assume API returns { ref_balance: value }
                        console.log(ref_balance)
                        // Update the ref_balance in the corresponding product
                        setFormData((prevState) => {
                            const updatedProducts = [...prevState.tradeProducts];
                            updatedProducts[index].ref_balance = ref_balance;
                            return { ...prevState, tradeProducts: updatedProducts };
                        });
                    } else {
                        console.error('Error fetching ref balance:', response.statusText);
                    }
                    
                } catch (error) {
                    console.error('API Error:', error.message);
                }
            }

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
                    address: selectedCustomer?.regAddress || '',
                }));
            } else if (name === 'payment_term') {
                const selectedTerm = paymentTermOptions.find((term) => term.id == value);

                setFormData((prevState) => ({
                    ...prevState,
                    [name]: value,
                    advance_value_to_receive: ((selectedTerm?.advance_in_percentage / 100) * prevState?.contract_value).toFixed(2) || 0

                }));

            } else if (name === 'logistic_provider') {
                if(value.toLowerCase()=='na'){
                    setFormData((prevState) => ({
                        ...prevState,
                        [name]: value,
                        estimated_logistic_cost:0,
                        logistic_cost_tolerence:0,
                        logistic_cost_remarks:'NA',
                        bl_fee:0,
                        bl_fee_remarks:'NA'
                    }));
                }
                else{
                    setFormData((prevState) => ({
                    ...prevState,
                    [name]: value
                }));
            }

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
                    // updatedProducts[index][name] = value;
                    updatedProducts[index] = {
                        ...updatedProducts[index],
                        [name]: files ? files[0] : value // Store file if it's a file input
                    };


                    if (name === 'product_code' && value) {
                        setIsContractBalanceQtyReadOnly(false);
                        // fetchProductDetails(index,updatedProducts[index].product_code_ref, value); // Fetch product details
                        fetchProductDetails(index, value);
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
                    if (name === 'qty_of_packing' || name === 'rate_of_each_packing') {

                        const rate = parseFloat(updatedProducts[index].rate_of_each_packing) || 0;
                        const qty = parseFloat(updatedProducts[index].qty_of_packing) || 0;

                        // Calculate total packing cost
                        updatedProducts[index].total_packing_cost = (rate * qty).toFixed(2);
                    }
                    if (name === 'trade_qty' || name === 'selected_currency_rate') {
                        const trade_qty = parseFloat(updatedProducts[index].trade_qty) || 0;
                        const selected_currency_rate = parseFloat(updatedProducts[index].selected_currency_rate) || 0;

                        updatedProducts[index].rate_in_usd = parseFloat(selected_currency_rate * parseFloat(prevState.exchange_rate)).toFixed(4);
                        updatedProducts[index].product_value = (updatedProducts[index].rate_in_usd * trade_qty).toFixed(2);
                    }

                    const totalContractValue = updatedProducts.reduce((acc, product) => acc + (parseFloat(product.product_value) || 0), 0);
                    const commissionValue = updatedProducts.reduce((acc, product) => acc + (parseFloat(product.total_commission) || 0), 0);
                    const logisticValue = updatedProducts.reduce((acc, product) => acc + (parseFloat(product.logistic) || 0), 0);

                    return { ...prevState, tradeProducts: updatedProducts, contract_value: totalContractValue.toFixed(2), commission_value: commissionValue.toFixed(2), estimated_logistic_cost: logisticValue.toFixed(2) };
                });
            } else if (name === 'exchange_rate') {
                // When exchange_rate changes, update rate_in_usd for all products
                setFormData((prevState) => {
                    const exchange_rate = parseFloat(value) || 1;
                    const updatedProducts = prevState.tradeProducts.map((product) => {
                        const selected_currency_rate = parseFloat(product.selected_currency_rate) || 0;
                        return {
                            ...product,
                            rate_in_usd: (selected_currency_rate * exchange_rate).toFixed(4),
                        };
                    });

                    return {
                        ...prevState,
                        exchange_rate: value, // Update exchange rate
                        tradeProducts: updatedProducts
                    };
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
                    ref_product_code: '',
                    ref_trn: '',
                    container_shipment_size: '',
                    logistic: '',
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

    // const debouncedSubmit = useCallback(
    //     debounce((formDataToSend, config) => {
    //         if (mode === 'add') {
    //             axios.post('/trademgt/trades/', formDataToSend, config)
    //                 .then(response => {
    //                     console.log('Trade added successfully!', response.data);
    //                     localStorage.removeItem('tradeDraft');
    //                     navigate(-1);
    //                 })
    //                 .catch(error => {
    //                     console.error('There was an error adding the trade!', error);
    //                 });
    //         } else if (mode === 'update') {
    //             axios.put(`/trademgt/trades/${id}/`, formDataToSend, config)
    //                 .then(response => {
    //                     console.log('Trade updated successfully!', response.data);
    //                     navigate(-1);
    //                 })
    //                 .catch(error => {
    //                     console.error('There was an error updating the trade!', error);
    //                 });
    //         }
    //     }, 1000, { leading: true, trailing: false }), // 1 second delay, only execute first call
    //     [mode, id, navigate]
    // );
    const debouncedSubmit = useRef(
        debounce(async (formDataToSend, config) => {
            try {
                if (mode === 'add') {
                    await axios.post('/trademgt/trades/', formDataToSend, config);
                    localStorage.removeItem('tradeDraft');
                    navigate(-1);
                } else if (mode === 'update') {
                    await axios.put(`/trademgt/trades/${id}/`, formDataToSend, config);
                    navigate(-1);
                }
            } catch (error) {
                console.error('Error saving trade:', error);
            } finally {
                submittingRef.current = false; // unlock
            }
        }, 1000, { leading: true, trailing: false })
    ).current;

    const submittingRef = useRef(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submittingRef.current) return;
        let errors = {};

        // Define fields to skip validation for
        const skipValidation = ['loi', 'relatedTrades', 'approved_by', 'ref_balance'];

        // Trade category validation rules
        const validCategories = {
            Sales: ['Sales', 'Sales Cancel'],
            Purchase: ['Purchase', 'Purchase Cancel'],
        };

        // Check each regular field for empty value (except files and those in skipValidation)
        for (const [key, value] of Object.entries(formData)) {
            if (!skipValidation.includes(key) && value === '') {
                errors[key] = `${capitalizeKey(key)} cannot be empty!`;
            }
           
        }

        // Validate trade_type and trade_category
        const { trade_type, trade_category } = formData;
        if (trade_type && trade_category) {
            const allowedCategories = validCategories[trade_type];
            if (!allowedCategories.includes(trade_category)) {
                errors.trade_category = `Invalid category for ${trade_type}.`;
            }
        }

        // Validate tradeProducts array fields but skip 'loi'
        formData.tradeProducts.forEach((product, index) => {
            for (const [key, value] of Object.entries(product)) {
                // Validate 'loi' only if 'product_name_for_client' is not 'NA' or 'na'
                if (key === 'product_name_for_client' && value.toLowerCase() !== 'na') {
                    if (!product.loi) {
                        errors[`tradeProducts[${index}].loi`] = 'LOI is required';
                    }
                }
                if (!skipValidation.includes(key) && value === '') {
                    errors[`tradeProducts[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
            }
        });

        // Validate tradeExtraCosts array fields (validate all or selectively skip some)
        formData.tradeExtraCosts.forEach((extraCost, index) => {
            for (const [key, value] of Object.entries(extraCost)) {
                if (!skipValidation.includes(key) && value === '') {
                    errors[`tradeExtraCosts[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
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

        // Check if formData.tradeProducts is defined and is an array
        if (!Array.isArray(formData.tradeProducts) || formData.tradeProducts.length === 0) {
            alert('Trade Products data is missing or invalid!');
            return; // Stop form submission
        }

        // Validate Trade Quantity against Contract Balance Quantity
        const invalidProduct = formData.tradeProducts.find(product => {
            return Number(product.trade_qty) > Number(product.contract_balance_qty); // Ensure values are compared as numbers
        });

        if (invalidProduct) {
            alert(`Trade Quantity cannot be greater than Contract Balance Quantity for product index: ${formData.tradeProducts.indexOf(invalidProduct) + 1}`);
            return; // Stop form submission
        }

        // Validate Trade Quantity against Ref Balance
        const invalidRefBalanceProduct = formData.tradeProducts.find(product => {
            if (product.ref_balance === '' || product.ref_balance === 'NA') {
                return false; // Continue to the next product
            }
            // Otherwise, check if ref_balance is less than trade_qty
            return Number(product.ref_balance) < Number(product.trade_qty);
        });
        
        if (invalidRefBalanceProduct) {
            alert(`Trade Quantity cannot exceed Ref Balance for product index: ${formData.tradeProducts.indexOf(invalidRefBalanceProduct) + 1}`);
            return; // Stop form submission
        }

        submittingRef.current = true;
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

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
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

    // Dynamically apply red border to invalid fields
    const getFieldErrorClass = (fieldName) => {
        return validationErrors[fieldName] ? 'border-red-500' : '';
    };



    const handleSelectChange = (selectedOptions) => {
        setFormData({
            ...formData,
            // relatedTrades: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    const handleClearForm = () => {
        setFormData(initialFormData);
        localStorage.removeItem('tradeDraft');  // Remove draft from localStorage when cleared
    };
    const handleSaveDraft = () => {
        localStorage.setItem('tradeDraft', JSON.stringify(formData));
        alert('Draft saved successfully!');
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
                        className={`border border-gray-300 p-2 rounded w-full col-span-2 ${getFieldErrorClass('trade_type')}`}
                    >
                        <option value="">Select Trade Type</option>
                        {tradeTypeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {validationErrors.trade_type && <p className="text-red-500">{validationErrors.trade_type}</p>}
                </div>
                
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-3 ${getFieldErrorClass('company')}`}
                    >
                        <option value="">Select Company</option>
                        {companyOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.company && <p className="text-red-500">{validationErrors.company}</p>}
                </div>
                
                <div>
                    <label htmlFor="trd" className="block text-sm font-medium text-gray-700">Trade Reference Date</label>
                    <input
                        type="date"
                        name="trd"
                        value={formData.trd}
                        onChange={handleChange}
                        placeholder="Trade Date"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('trd')}`}
                        readOnly
                    />
                    {validationErrors.trd && <p className="text-red-500">{validationErrors.trd}</p>}
                </div>
                <div>
                    <label htmlFor="trd" className="block text-sm font-medium text-gray-700">Transaction Reference Number</label>
                    <input
                        type="text"
                        name="trn"
                        value={formData.trn}
                        onChange={handleChange}
                        placeholder="Transaction Reference Number"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('trn')}`}
                        readOnly={true}
                    />
                    {validationErrors.trn && <p className="text-red-500">{validationErrors.trn}</p>}
                </div>

                {/* Add other fields similarly */}
                
                <div>
                    <label htmlFor="trade_category" className="block text-sm font-medium text-gray-700">Select Trade Category</label>
                    <select
                        name="trade_category"
                        value={formData.trade_category}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('trade_category')}`}
                    >
                        <option value="">Select Trade Category</option>
                        {tradeCategoryOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {validationErrors.trade_category && <p className="text-red-500">{validationErrors.trade_category}</p>}
                </div>
                <div>
                    <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700">Country of Origin</label>
                    <input
                        type="text"
                        name="country_of_origin"
                        value={formData.country_of_origin}
                        onChange={handleChange}
                        placeholder="Country of Origin"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('country_of_origin')}`}
                    />
                    {validationErrors.country_of_origin && <p className="text-red-500">{validationErrors.country_of_origin}</p>}
                </div>
                <div>
                    <label htmlFor="customer_company_name" className="block text-sm font-medium text-gray-700">Select Customer Company</label>
                    <select
                        name="customer_company_name"
                        value={formData.customer_company_name}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('customer_company_name')}`}
                    >
                        <option value="">Select Customer Company</option>
                        {customerOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.customer_company_name && <p className="text-red-500">{validationErrors.customer_company_name}</p>}
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('address')}`}
                    />
                    {validationErrors.address && <p className="text-red-500">{validationErrors.address}</p>}
                </div>
                
              
               
                <div>
                    <label htmlFor="currency_selection" className="block text-sm font-medium text-gray-700">Currency Selection</label>
                    <select
                        name="currency_selection"
                        value={formData.currency_selection}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('currency_selection')}`}
                    >
                        <option value="">Select Currency</option>
                        {currencyOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.currency_selection && <p className="text-red-500">{validationErrors.currency_selection}</p>}
                </div>
                <div>
                    <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700">Exchange Rate</label>
                    <input
                        type="number"
                        name="exchange_rate"
                        value={formData.exchange_rate}
                        onChange={handleChange}
                        placeholder="Exchange Rate"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('exchange_rate')}`}
                    />
                    {validationErrors.exchange_rate && <p className="text-red-500">{validationErrors.exchange_rate}</p>}
                </div>
                
                <div>
                    <label htmlFor="bank_name_address" className="block text-sm font-medium text-gray-700">Select Bank Name & Address</label>
                    <select
                        name="bank_name_address"
                        value={formData.bank_name_address}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('bank_name_address')}`}
                    >
                        <option value="">Select Bank Name & Address</option>
                        {bankNameOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.bank_name_address && <p className="text-red-500">{validationErrors.bank_name_address}</p>}
                </div>
                <div>
                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        type="text"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleChange}
                        placeholder="Account Number"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('account_number')}`}
                        readOnly={true}
                    />
                    {validationErrors.account_number && <p className="text-red-500">{validationErrors.account_number}</p>}
                </div>
                <div>
                    <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700">SWIFT Code</label>
                    <input
                        type="text"
                        name="swift_code"
                        value={formData.swift_code}
                        onChange={handleChange}
                        placeholder="SWIFT Code"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('swift_code')}`}
                        readOnly={true}
                    />
                    {validationErrors.swift_code && <p className="text-red-500">{validationErrors.swift_code}</p>}
                </div>
                <div>
                    <label htmlFor="incoterm" className="block text-sm font-medium text-gray-700">Incoterm</label>
                    <input
                        type="text"
                        name="incoterm"
                        value={formData.incoterm}
                        onChange={handleChange}
                        placeholder="Incoterm"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('incoterm')}`}
                    />
                    {validationErrors.incoterm && <p className="text-red-500">{validationErrors.incoterm}</p>}
                </div>
               
                <div>
                    <label htmlFor="pol" className="block text-sm font-medium text-gray-700">POL</label>
                    <input
                        type="text"
                        name="pol"
                        value={formData.pol}
                        onChange={handleChange}
                        placeholder="POL"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('pol')}`}
                    />
                    {validationErrors.pol && <p className="text-red-500">{validationErrors.pol}</p>}
                </div>
                <div>
                    <label htmlFor="pod" className="block text-sm font-medium text-gray-700">POD</label>
                    <input
                        type="text"
                        name="pod"
                        value={formData.pod}
                        onChange={handleChange}
                        placeholder="POD"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('pod')}`}
                    />
                    {validationErrors.pod && <p className="text-red-500">{validationErrors.pod}</p>}
                </div>
               
               
                 <DateInputWithIcon
                    formData={formData}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    fieldName="etd"
                    label="ETD"
                    
                />
               
                 <DateInputWithIcon
                    formData={formData}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    fieldName="eta"
                    label="ETA"
                    
                />
                
                <div>
                    <label htmlFor="trader_name" className="block text-sm font-medium text-gray-700">Trader Name</label>
                    <input
                        type="text"
                        name="trader_name"
                        value={formData.trader_name}
                        onChange={handleChange}
                        placeholder="Trader Name"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('trader_name')}`}
                    />
                    {validationErrors.trader_name && <p className="text-red-500">{validationErrors.trader_name}</p>}
                </div>
                <div>
                    <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-700">Insurance Policy Number</label>
                    <input
                        type="text"
                        name="insurance_policy_number"
                        value={formData.insurance_policy_number}
                        onChange={handleChange}
                        placeholder="Insurance Policy Number"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('insurance_policy_number')}`}
                    />
                    {validationErrors.insurance_policy_number && <p className="text-red-500">{validationErrors.insurance_policy_number}</p>}
                </div>
                
                <div>
                    <label htmlFor="shipper_in_bl" className="block text-sm font-medium text-gray-700">Shipper in BL</label>
                    <input
                        type="text"
                        name="shipper_in_bl"
                        value={formData.shipper_in_bl}
                        onChange={handleChange}
                        placeholder="Shipper in BL"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('shipper_in_bl')}`}
                    />
                    {validationErrors.shipper_in_bl && <p className="text-red-500">{validationErrors.shipper_in_bl}</p>}
                </div>
                <div>
                    <label htmlFor="consignee_in_bl" className="block text-sm font-medium text-gray-700">Consignee in BL</label>
                    <input
                        type="text"
                        name="consignee_in_bl"
                        value={formData.consignee_in_bl}
                        onChange={handleChange}
                        placeholder="Consignee in BL"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('consignee_in_bl')}`}
                    />
                    {validationErrors.consignee_in_bl && <p className="text-red-500">{validationErrors.consignee_in_bl}</p>}
                </div>
                <div>
                    <label htmlFor="notify_party_in_bl" className="block text-sm font-medium text-gray-700">Notify Party in BL</label>
                    <input
                        type="text"
                        name="notify_party_in_bl"
                        value={formData.notify_party_in_bl}
                        onChange={handleChange}
                        placeholder="Notify Party in BL"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('notify_party_in_bl')}`}
                    />
                    {validationErrors.notify_party_in_bl && <p className="text-red-500">{validationErrors.notify_party_in_bl}</p>}
                </div>
               
             
                
            </div>

            <hr className="my-6" />

            {/* Trade Products Section */}
            <p className='text-center text-2xl gap-4 mb-4'>Products</p>
            <hr className="my-6" />
            <div >
                {formData.tradeProducts.map((product, index) => (
                    <>
                        <div key={index} className="grid grid-cols-3 gap-2 mb-4 justify-between items-end px-4 py-2">
                            <div>
                                <label htmlFor="product_code" className="block text-sm font-medium text-gray-700">Product Code</label>
                                <input
                                    type="text"
                                    name="product_code"
                                    value={product.product_code}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Code"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].product_code`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].product_code`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].product_code`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <select
                                    name="product_name"
                                    value={product.product_name}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].product_name`)}`}
                                >
                                    <option value="">Select Product Name</option>
                                    {productNameOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].product_name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].product_name`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="product_name_for_client" className="block text-sm font-medium text-gray-700">Product Name for Client</label>
                                <input
                                    type="text"
                                    name="product_name_for_client"
                                    value={product.product_name_for_client}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Name for Client"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].product_name_for_client`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].product_name_for_client`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].product_name_for_client`]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="file" className="block text-sm font-medium text-gray-700">LOI</label>
                                <input
                                    type="file"
                                    name="loi"
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className="border border-gray-300 p-2 rounded w-full"
                                    disabled={product.product_name_for_client.toLowerCase() == 'na'}
                                />
                                {validationErrors[`tradeProducts[${index}].loi`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].loi`]}
                                    </p>
                                )}
                                {/* {product.loi && <span className="block mt-2 text-gray-600">{product.loi}</span>} */}
                            </div>
                            <div>
                                <label htmlFor="ref_product_code" className="block text-sm font-medium text-gray-700">Reference Product Code</label>
                                <select
                                    name="ref_product_code"
                                    value={product.ref_product_code}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].ref_product_code`)}`}
                                >
                                    {/* <option value="">Select Type</option> */}
                                    <option value="">---</option>
                                    <option value="NA">NA</option>
                                     {refProductOptions?.map((option) => (
                                        <option key={option.id} value={option.product_code}>
                                            {option.product_code}
                                        </option>
                                    ))}
                                   
                                </select>
                                {validationErrors[`tradeProducts[${index}].ref_product_code`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].ref_product_code`]}
                                    </p>
                                )}
                            </div>
                           
                            <div>
                                <label htmlFor="ref_trn" className="block text-sm font-medium text-gray-700">
                                Reference TRN
                                </label>
                                <select
                                    name="ref_trn"
                                    value={product.ref_trn}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].ref_trn`)}`}
                                >
                                    {/* <option value="">Select TRN</option> */}
                                    <option value="">---</option>
                                    <option value="NA">NA</option>
                                    {tradeOptions.map((option) => (
                                        <option key={option.value} value={option.label}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].ref_trn`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].ref_trn`]}
                                    </p>
                                )}
                                {product.ref_balance && product.ref_trn !== 'NA' ? (
                                    <p className={`text-sm font-medium ${product.ref_balance === 'NA' ? 'text-red-500' : 'text-green-500'}`}>
                                        Reference Balance: {product.ref_balance || 'NA'}
                                    </p>
                                ) : ''}
                            </div>
                            <div>
                                <label htmlFor="hs_code" className="block text-sm font-medium text-gray-700">HS Code</label>
                                <input
                                    type="text"
                                    name="hs_code"
                                    value={product.hs_code}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="HS Code"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].hs_code`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].hs_code`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].hs_code`]}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="total_contract_qty" className="block text-sm font-medium text-gray-700">Total Contract Qty</label>
                                <input
                                    type="number"
                                    name="total_contract_qty"
                                    value={product.total_contract_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Contract Qty"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].total_contract_qty`)}`}
                                    readOnly={isContractBalanceQtyReadOnly}
                                />
                                {validationErrors[`tradeProducts[${index}].total_contract_qty`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].total_contract_qty`]}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="total_contract_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Total Contract Qty Unit
                                </label>
                                <select
                                    name="total_contract_qty_unit"
                                    value={product.total_contract_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].total_contract_qty_unit`)}`}
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].total_contract_qty_unit`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].total_contract_qty_unit`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-700">Tolerance</label>
                                <input
                                    type="number"
                                    name="tolerance"
                                    value={product.tolerance}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Tolerance"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].tolerance`)}`}
                                />
                                 {validationErrors[`tradeProducts[${index}].tolerance`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].tolerance`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-700">Contract Balance Qty</label>
                                <input
                                    type="number"
                                    name="contract_balance_qty"
                                    value={product.contract_balance_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Contract Balance Qty"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].contract_balance_qty`)}`}
                                    readOnly={isContractBalanceQtyReadOnly}
                                />
                                {validationErrors[`tradeProducts[${index}].contract_balance_qty`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].contract_balance_qty`]}
                                    </p>
                                )}
                            </div>
                           
                            <div>
                                <label htmlFor="contract_balance_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Contract Balance Qty Unit
                                </label>
                                <select
                                    name="contract_balance_qty_unit"
                                    value={product.contract_balance_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].contract_balance_qty_unit`)}`}
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].contract_balance_qty_unit`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].contract_balance_qty_unit`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="trade_qty" className="block text-sm font-medium text-gray-700">Trade Qty</label>
                                <input
                                    type="number"
                                    name="trade_qty"
                                    value={product.trade_qty}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Trade Qty"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].trade_qty`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].trade_qty`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].trade_qty`]}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="trade_qty_unit" className="block text-sm font-medium text-gray-700">
                                    Trade Qty Unit
                                </label>
                                <select
                                    name="trade_qty_unit"
                                    value={product.trade_qty_unit}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].trade_qty_unit`)}`}
                                >
                                    <option value="">Select Unit</option>
                                    {unitOptions.map((option) => (
                                        <option key={option.id} value={option.name}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].trade_qty_unit`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].trade_qty_unit`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="selected_currency_rate" className="block text-sm font-medium text-gray-700">Rate in Selected Currency</label>
                                <input
                                    type="number"
                                    name="selected_currency_rate"
                                    value={product.selected_currency_rate}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].selected_currency_rate`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].selected_currency_rate`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].selected_currency_rate`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="rate_in_usd" className="block text-sm font-medium text-gray-700">Rate in USD</label>
                                <input
                                    type="number"
                                    name="rate_in_usd"
                                    value={product.rate_in_usd}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate in USD"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].rate_in_usd`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].rate_in_usd`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].rate_in_usd`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="product_value" className="block text-sm font-medium text-gray-700">Product Value</label>
                                <input
                                    type="number"
                                    name="product_value"
                                    value={product.product_value}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Product Value"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].product_value`)}`}
                                />
                                 {validationErrors[`tradeProducts[${index}].product_value`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].product_value`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="mode_of_packing" className="block text-sm font-medium text-gray-700">Mode of Packing</label>
                                <select
                                    name="mode_of_packing"
                                    value={product.mode_of_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].mode_of_packing`)}`}
                                >
                                    <option value="">Select Packing</option>
                                    {packingOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].mode_of_packing`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].mode_of_packing`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="rate_of_each_packing" className="block text-sm font-medium text-gray-700">Rate of Each packing</label>
                                <input
                                    type="number"
                                    name="rate_of_each_packing"
                                    value={product.rate_of_each_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Rate of Each packing"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].rate_of_each_packing`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].rate_of_each_packing`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].rate_of_each_packing`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="qty_of_packing" className="block text-sm font-medium text-gray-700">Qty of packing</label>
                                <input
                                    type="number"
                                    name="qty_of_packing"
                                    value={product.qty_of_packing}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Qty of packing"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].qty_of_packing`)}`}
                                />
                                 {validationErrors[`tradeProducts[${index}].qty_of_packing`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].qty_of_packing`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                                <input
                                    type="number"
                                    name="total_packing_cost"
                                    value={product.total_packing_cost}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Packing Cost"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].total_packing_cost`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].total_packing_cost`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].total_packing_cost`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                                <select
                                    name="packaging_supplier"
                                    value={product.packaging_supplier}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].packaging_supplier`)}`}
                                >
                                    <option value="">Select Supplier</option>
                                    {customerOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].packaging_supplier`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].packaging_supplier`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="markings_in_packaging" className="block text-sm font-medium text-gray-700">Markings in Packaging</label>
                                <input
                                    type="text"
                                    name="markings_in_packaging"
                                    value={product.markings_in_packaging}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Markings in Packaging"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].markings_in_packaging`)}`}
                                />
                               {validationErrors[`tradeProducts[${index}].markings_in_packaging`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].markings_in_packaging`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">Commission Rate</label>
                                <input
                                    type="number"
                                    name="commission_rate"
                                    value={product.commission_rate}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Commission Rate"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].commission_rate`)}`}
                                />
                                {validationErrors[`tradeProducts[${index}].commission_rate`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].commission_rate`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="total_commission" className="block text-sm font-medium text-gray-700">Total Commission</label>
                                <input
                                    type="number"
                                    name="total_commission"
                                    value={product.total_commission}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Total Commission"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].total_commission`)}`}
                                />
                                 {validationErrors[`tradeProducts[${index}].total_commission`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].total_commission`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="container_shipment_size" className="block text-sm font-medium text-gray-700">Container Shipment Size</label>
                                <select
                                    name="container_shipment_size"
                                    value={product.container_shipment_size}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 `}
                                >
                                    <option value="">Select Size</option>
                                    {shipmentSizeOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors[`tradeProducts[${index}].container_shipment_size`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].container_shipment_size`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="logistic" className="block text-sm font-medium text-gray-700">Logistic Cost</label>
                                <input
                                    type="number"
                                    name="logistic"
                                    value={product.logistic}
                                    onChange={(e) => handleChange(e, index, 'products')}
                                    placeholder="Logistic Cost"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeProducts[${index}].logistic`)}`}
                                />
                                 {validationErrors[`tradeProducts[${index}].logistic`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeProducts[${index}].logistic`]}
                                    </p>
                                )}
                            </div>


                            <div className="col-span-3 flex justify-end">
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
            <div className="grid grid-cols-3 gap-4 p-4 ">
            <div>
                    <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission Agent</label>
                    <input
                        type="text"
                        name="commission_agent"
                        value={formData.commission_agent}
                        onChange={handleChange}
                        placeholder="Commission Agent"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('commission_agent')}`}
                    />
                    {validationErrors.commission_agent && <p className="text-red-500">{validationErrors.commission_agent}</p>}
                </div>
                
                <div>
                    <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Value</label>
                    <input
                        type="number"
                        name="commission_value"
                        value={formData.commission_value}
                        onChange={handleChange}
                        placeholder="Commission Value"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('commission_value')}`}
                        readOnly={true}
                    />
                    {validationErrors.commission_value && <p className="text-red-500">{validationErrors.commission_value}</p>}
                </div>
                <div>
                    <label htmlFor="contract_value" className="block text-sm font-medium text-gray-700">Contract Value</label>
                    <input
                        type="number"
                        name="contract_value"
                        value={formData.contract_value}
                        onChange={handleChange}
                        placeholder="Contract Value"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('contract_value')}`}
                        readOnly={true}
                    />
                     {validationErrors.contract_value && <p className="text-red-500">{validationErrors.contract_value}</p>}
                </div>
                <div>
                    <label htmlFor="payment_term" className="block text-sm font-medium text-gray-700">Select Payment Term</label>
                    <select
                        name="payment_term"
                        value={formData.payment_term}
                        onChange={handleChange}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('payment_term')}`}
                    >
                        <option value="">Select Payment Term</option>
                        {paymentTermOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    {validationErrors.payment_term && <p className="text-red-500">{validationErrors.payment_term}</p>}
                </div>
                <div>
                    <label htmlFor="advance_value_to_receive" className="block text-sm font-medium text-gray-700">Advance Value to Receive</label>
                    <input
                        type="number"
                        name="advance_value_to_receive"
                        value={formData.advance_value_to_receive}
                        onChange={handleChange}
                        placeholder="Advance Value to Receive"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('advance_value_to_receive')}`}
                        readOnly={true}
                    />
                    {validationErrors.advance_value_to_receive && <p className="text-red-500">{validationErrors.advance_value_to_receive}</p>}
                </div>
                <div>
                    <label htmlFor="logistic_provider" className="block text-sm font-medium text-gray-700">Logistic Provider</label>
                    <input
                        type="text"
                        name="logistic_provider"
                        value={formData.logistic_provider}
                        onChange={handleChange}
                        placeholder="Logistic Provider"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('logistic_provider')}`}
                    />
                    {validationErrors.logistic_provider && <p className="text-red-500">{validationErrors.logistic_provider}</p>}
                </div>
                <div>
                    <label htmlFor="logistic_provider" className="block text-sm font-medium text-gray-700">Estimated Logistic Cost</label>
                    <input
                        type="number"
                        name="estimated_logistic_cost"
                        value={formData.estimated_logistic_cost}
                        onChange={handleChange}
                        placeholder="Estimated Logistic Cost"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('estimated_logistic_cost')}`}
                        readOnly={formData.logistic_provider.toLocaleLowerCase()=='na'?true:false}
                    />
                    {validationErrors.estimated_logistic_cost && <p className="text-red-500">{validationErrors.estimated_logistic_cost}</p>}
                </div>
                <div>
                    <label htmlFor="logistic_cost_tolerence" className="block text-sm font-medium text-gray-700">Logistic Cost Tolerance(%)</label>
                    <input
                        type="number"
                        name="logistic_cost_tolerence"
                        value={formData.logistic_cost_tolerence}
                        onChange={handleChange}
                        placeholder="Logistic Cost Tolerance"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('logistic_cost_tolerence')}`}
                        readOnly={formData.logistic_provider.toLocaleLowerCase()=='na'?true:false}
                    />
                     {validationErrors.logistic_cost_tolerence && <p className="text-red-500">{validationErrors.logistic_cost_tolerence}</p>}
                </div>
                <div>
                    <label htmlFor="logistic_cost_remarks" className="block text-sm font-medium text-gray-700">Logistic Cost Remarks</label>
                    <input
                        type="text"
                        name="logistic_cost_remarks"
                        value={formData.logistic_cost_remarks}
                        onChange={handleChange}
                        placeholder="Logistic Cost Remarks"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('logistic_cost_remarks')}`}
                        readOnly={formData.logistic_provider.toLocaleLowerCase()=='na'?true:false}
                    />
                    {validationErrors.logistic_cost_remarks && <p className="text-red-500">{validationErrors.logistic_cost_remarks}</p>}
                </div>
                <div>
                    <label htmlFor="bl_fee" className="block text-sm font-medium text-gray-700">BL Fee</label>
                    <input
                        type="number"
                        name="bl_fee"
                        value={formData.bl_fee}
                        onChange={handleChange}
                        placeholder="BL Fee"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('bl_fee')}`}
                        readOnly={formData.logistic_provider.toLocaleLowerCase()=='na'?true:false}
                    />
                    {validationErrors.bl_fee && <p className="text-red-500">{validationErrors.bl_fee}</p>}
                </div>
                <div>
                    <label htmlFor="bl_fee_remarks" className="block text-sm font-medium text-gray-700">BL Fee Remarks</label>
                    <input
                        type="text"
                        name="bl_fee_remarks"
                        value={formData.bl_fee_remarks}
                        onChange={handleChange}
                        placeholder="BL Fee Remarks"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('bl_fee_remarks')}`}
                        readOnly={formData.logistic_provider.toLocaleLowerCase()=='na'?true:false}
                    />
                    {validationErrors.bl_fee_remarks && <p className="text-red-500">{validationErrors.bl_fee_remarks}</p>}
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <input
                        type="text"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        placeholder="Remarks"
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('remarks')}`}
                    />
                    {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
                </div>

            </div>
            <div className="grid grid-cols-3 gap-4 p-4 ">
                
            </div>
            <p className='text-center text-2xl gap-4 mb-4'>Extra Costs</p>
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
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeExtraCosts[${index}].extra_cost`)}`}
                                />
                                {validationErrors[`tradeExtraCosts[${index}].extra_cost`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeExtraCosts[${index}].extra_cost`]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="extra_cost_remarks" className="block text-sm font-medium text-gray-700">Extra Cost Remarks</label>
                                <input
                                    type="text"
                                    name="extra_cost_remarks"
                                    value={extraCost.extra_cost_remarks}
                                    onChange={(e) => handleChange(e, index, 'extraCosts')}
                                    placeholder="Extra Cost Remarks"
                                    className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass(`tradeExtraCosts[${index}].extra_cost_remarks`)}`}
                                />
                                {validationErrors[`tradeExtraCosts[${index}].extra_cost_remarks`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`tradeExtraCosts[${index}].extra_cost_remarks`]}
                                    </p>
                                )}
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
                {mode === 'add' ? (
                    <>
                        <button
                            type="button"
                            onClick={handleClearForm}
                            className="btn-clear bg-gray-500 text-white p-2 rounded col-span-1"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="btn-draft bg-green-500 text-white p-2 rounded col-span-1"
                        >
                            Save as Draft
                        </button>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded col-span-1" disabled={submittingRef.current}
                        >
                            Add Trade
                        </button>
                    </>
                ) : (
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded col-span-3" disabled={submittingRef.current}
                    >
                        Update Trade
                    </button>
                )}
            </div>

        </form>
    );
};

export default TradeForm;
