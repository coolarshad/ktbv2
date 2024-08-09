import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const TradeForm = ({ mode = 'add' }) => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company: '',
        trd: '',
        trn: '',
        trade_type: '',
        trade_category: '',
        country_of_origin: '',
        customer_company_name: '',
        address: '',
        packing: '',
        cost_of_packing_per_each: '',
        total_packing_cost: '',
        packaging_supplier: '',
        selected_currency_rate: '',
        currency_selection: '',
        exchange_rate: '',
        rate_in_usd: '',
        commission: '',
        contract_value: '',
        payment_term: '',
        advance_value_to_receive: '',
        commission_rate: '',
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
        bl_declaration: '',
        shipper_in_bl: '',
        consignee_in_bl: '',
        notify_party_in_bl: '',
        markings_in_packaging: '',
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
                trade_qty_unit: ''
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

    const handleChange = (e, index, section) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prevState => {
                const updatedProducts = [...prevState.tradeProducts];
                updatedProducts[index][name] = files[0];
                return { ...prevState, tradeProducts: updatedProducts };
            });
        } else {
            if (section === 'products') {
                setFormData(prevState => {
                    const updatedProducts = [...prevState.tradeProducts];
                    updatedProducts[index][name] = value;
                    return { ...prevState, tradeProducts: updatedProducts };
                });
            } else if (section === 'extraCosts') {
                setFormData(prevState => {
                    const updatedExtraCosts = [...prevState.tradeExtraCosts];
                    updatedExtraCosts[index][name] = value;
                    return { ...prevState, tradeExtraCosts: updatedExtraCosts };
                });
            } else {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
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
                    trade_qty_unit: ''
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
                })
                .catch(error => {
                    console.error('There was an error updating the trade!', error);
                });
        }
    };

    // Sample options for the dropdown fields
    const companyOptions = ['Company A', 'Company B', 'Company C'];
    const tradeTypeOptions = ['sales', 'purchase', 'cancel'];
    const tradeCategoryOptions = ['Category 1', 'Category 2', 'Category 3'];
    const customerCompanyOptions = ['Customer A', 'Customer B', 'Customer C'];
    const paymentTermOptions = ['Term 1', 'Term 2', 'Term 3'];
    const bankNameOptions = ['Bank A', 'Bank B', 'Bank C'];

    const handleSelectChange = (selectedOptions) => {
        setFormData({
            ...formData,
            relatedTrades: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-3 gap-4 p-4">
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
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Date</label>
                    <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Company</option>
                        {companyOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="trd" className="block text-sm font-medium text-gray-700">Trade Date</label>
                    <input
                        type="date"
                        name="trd"
                        value={formData.trd}
                        onChange={handleChange}
                        placeholder="Trade Date"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
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
                        {customerCompanyOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
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
                    <label htmlFor="packing" className="block text-sm font-medium text-gray-700">Packing</label>
                    <input
                        type="text"
                        name="packing"
                        value={formData.packing}
                        onChange={handleChange}
                        placeholder="Packing"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="cost_of_packing_per_each" className="block text-sm font-medium text-gray-700">Cost of Packing Per Each</label>
                    <input
                        type="number"
                        name="cost_of_packing_per_each"
                        value={formData.cost_of_packing_per_each}
                        onChange={handleChange}
                        placeholder="Cost of Packing Per Each"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                    <input
                        type="number"
                        name="total_packing_cost"
                        value={formData.total_packing_cost}
                        onChange={handleChange}
                        placeholder="Total Packing Cost"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                    <input
                        type="text"
                        name="packaging_supplier"
                        value={formData.packaging_supplier}
                        onChange={handleChange}
                        placeholder="Packaging Supplier"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="selected_currency_rate" className="block text-sm font-medium text-gray-700">Selected Currency Rate</label>
                    <input
                        type="number"
                        name="selected_currency_rate"
                        value={formData.selected_currency_rate}
                        onChange={handleChange}
                        placeholder="Selected Currency Rate"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="currency_selection" className="block text-sm font-medium text-gray-700">Currency Selection</label>
                    <input
                        type="text"
                        name="currency_selection"
                        value={formData.currency_selection}
                        onChange={handleChange}
                        placeholder="Currency Selection"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
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
                    <label htmlFor="rate_in_usd" className="block text-sm font-medium text-gray-700">Rate in USD</label>
                    <input
                        type="number"
                        name="rate_in_usd"
                        value={formData.rate_in_usd}
                        onChange={handleChange}
                        placeholder="Rate in USD"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission</label>
                    <input
                        type="number"
                        name="commission"
                        value={formData.commission}
                        onChange={handleChange}
                        placeholder="Commission"
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
                            <option key={option} value={option}>
                                {option}
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
                    <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">Commission Rate</label>
                    <input
                        type="number"
                        name="commission_rate"
                        value={formData.commission_rate}
                        onChange={handleChange}
                        placeholder="Commission Rate"
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
                            <option key={option} value={option}>
                                {option}
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
                    <label htmlFor="bl_declaration" className="block text-sm font-medium text-gray-700">BL Declaration</label>
                    <input
                        type="text"
                        name="bl_declaration"
                        value={formData.bl_declaration}
                        onChange={handleChange}
                        placeholder="BL Declaration"
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
                    <label htmlFor="markings_in_packaging" className="block text-sm font-medium text-gray-700">Markings in Packaging</label>
                    <input
                        type="text"
                        name="markings_in_packaging"
                        value={formData.markings_in_packaging}
                        onChange={handleChange}
                        placeholder="Markings in Packaging"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="container_shipment_size" className="block text-sm font-medium text-gray-700">Container Shipment Size</label>
                    <input
                        type="text"
                        name="container_shipment_size"
                        value={formData.container_shipment_size}
                        onChange={handleChange}
                        placeholder="Container Shipment Size"
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
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
            <div>
                {formData.tradeProducts.map((product, index) => (
                    <>
                    <div key={index} className="grid grid-cols-5 gap-4 mb-4 justify-between items-end px-5 py-2">
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
                            <input
                                type="text"
                                name="product_name"
                                value={product.product_name}
                                onChange={(e) => handleChange(e, index, 'products')}
                                placeholder="Product Name"
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
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
                            />
                        </div>
                        <div>
                            <label htmlFor="total_contract_qty_unit" className="block text-sm font-medium text-gray-700">Total Contract Qty Unit</label>
                            <input
                                type="text"
                                name="total_contract_qty_unit"
                                value={product.total_contract_qty_unit}
                                onChange={(e) => handleChange(e, index, 'products')}
                                placeholder="Total Contract Qty Unit"
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
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
                            />
                        </div>
                        <div>
                            <label htmlFor="contract_balance_qty_unit" className="block text-sm font-medium text-gray-700">Contract Balance Qty Unit</label>
                            <input
                                type="text"
                                name="contract_balance_qty_unit"
                                value={product.contract_balance_qty_unit}
                                onChange={(e) => handleChange(e, index, 'products')}
                                placeholder="Contract Balance Qty Unit"
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
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
                            <label htmlFor="trade_qty_unit" className="block text-sm font-medium text-gray-700">Trade Qty Unit</label>
                            <input
                                type="text"
                                name="trade_qty_unit"
                                value={product.trade_qty_unit}
                                onChange={(e) => handleChange(e, index, 'products')}
                                placeholder="Trade Qty Unit"
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => handleRemoveProduct(index)}
                                className=" bg-red-500 text-white p-2 rounded"
                            >
                                Remove
                            </button>
                        </div>

                    </div>
                    <hr />
                    </>
                ))}
                <button
                    type="button"
                    onClick={handleAddProduct}
                    className="bg-green-500 text-white p-2 rounded mt-2"
                >
                    +Add
                </button>
            </div>
            <hr className="my-6" />
            <div>
                {formData.tradeExtraCosts.map((extraCost, index) => (
                    <>
                    <div key={index} className="grid grid-cols-3 gap-4 mb-4 justify-between items-end">
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
                <button
                    type="button"
                    onClick={handleAddExtraCost}
                    className="bg-green-500 text-white p-2 rounded mt-2"
                >
                    Add Another Extra Cost
                </button>
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
