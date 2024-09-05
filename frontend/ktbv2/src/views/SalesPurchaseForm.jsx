import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { FaTrash } from 'react-icons/fa';

const SalesPurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const [trnOptions, setTrnOptions] = useState([]); 
    
    const [data, setData] = useState(null); 
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        trn: '',
        invoice_date: '',
        invoice_number: '',
        invoice_amount: '',
        commission_value: '',
        bl_number: '',
        bl_qty: '',
        bl_fees: '',
        bl_collection_cost: '',
        bl_date: '',
        total_packing_cost: '',
        packaging_supplier: '',
        logistic_supplier: '',
        
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
                product_name: '',
                hs_code: '',
                tolerance: '',
                batch_number: '',
                production_date: '',
                trade_qty: '',
                trade_qty_unit: '',
            }
        ],
        extraCharges: [{ name: '', charge: '' }],
        packingLists: [{ name: '', packing_list: null }],
        blCopies: [{ name: '', bl_copy: null }],
        invoices: [{ name: '', invoice: null }],
        coas: [{ name: '', coa: null }],
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
                        commission_value: data.commission_value,
                        bl_number: data.bl_number,
                        bl_qty: data.bl_qty,
                        bl_fees: data.bl_fees,
                        bl_collection_cost: data.bl_collection_cost,
                        bl_date: data.bl_date,
                        total_packing_cost: data.total_packing_cost,
                        packaging_supplier: data.packaging_supplier,
                        logistic_supplier: data.logistic_supplier,
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
                                product_name: '',
                                hs_code: '',
                                tolerance: '',
                                batch_number: '',
                                production_date: '',
                                trade_qty: '',
                                trade_qty_unit: '',
                            }
                        ],
                        extraCharges: data.extraCharges || [{ name: '', charge: '' }],
                        packingLists: data.packingLists || [{ name: '', packing_list: null }],
                        blCopies: data.blCopies || [{ name: '', bl_copy: null }],
                        invoices: data.invoices || [{ name: '', invoice: null }],
                        coas: data.coas || [{ name: '', coa: null }]
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
    }, []);

      const handleChange = async (e, arrayName = null, index = null) => {
        const { name, value, type, files } = e.target;
      
        setFormData((prev) => {
          // Handle file input
          if (type === 'file' && arrayName !== null && index !== null) {
            if (Array.isArray(prev[arrayName])) {
              const updatedArray = [...prev[arrayName]]; // Clone the array safely
              updatedArray[index][name] = files[0]; // Update the specific index
              return { ...prev, [arrayName]: updatedArray }; // Return the updated state
            } else {
              console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
            }
          }
          // Handle array input
          else if (arrayName !== null && index !== null) {
            if (Array.isArray(prev[arrayName])) {
              const updatedArray = [...prev[arrayName]]; // Clone the array safely
              updatedArray[index][name] = value; // Update the specific index
              return { ...prev, [arrayName]: updatedArray }; // Return the updated state
            } else {
              console.error(`Expected an array for ${arrayName}, but got`, prev[arrayName]);
            }
          }
          // Handle non-array input
          else {
            return { ...prev, [name]: value }; // Return updated state for regular input
          }
      
          return prev; // Fallback if conditions are not met
        });
      
        // Fetch TRN data when 'trn' changes
        if (name === 'trn') {
          try {
            const response = await axios.get(`/trademgt/sp/${value}`);
            setData(response.data);
          } catch (error) {
            console.error('Error fetching TRN data:', error);
          }
        }
      };
    
      // Handle adding a new product to the salesPurchaseProducts array
      const handleAddProduct = () => {
        setFormData((prevState) => ({
          ...prevState,
          salesPurchaseProducts: [
            ...prevState.salesPurchaseProducts,
            {
              product_name: '',
              hs_code: '',
              tolerance: '',
              batch_number: '',
              production_date: '',
              trade_qty: '',
              trade_qty_unit: '',
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
        console.log(formData);

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
        { label: 'Markings', text: data.markings_in_packaging || '' },
        
        { label: 'Customer Company Name', text: data.prepayment.kyc?.name || '' },
        { label: 'LC Details', text: data.prepayment.lc_number || '' },
        { label: 'Commission Agent', text: data.commission_agent || '' },
      
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
            </div>
            <div>
                <label htmlFor="commission_value" className="block text-sm font-medium text-gray-700">Commission Value</label>
                <input
                    id="commission_value"
                    name="commission_value"
                    type="number"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div>
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
            </div>
            <div>
                <label htmlFor="bl_qty" className="block text-sm font-medium text-gray-700">BL Quantity</label>
                <input
                    id="bl_qty"
                    name="bl_qty"
                    type="number"
                    value={formData.bl_qty}
                    onChange={(e) => setFormData({ ...formData, bl_qty: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div>
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
            </div>
            <div>
                <label htmlFor="total_packing_cost" className="block text-sm font-medium text-gray-700">Total Packing Cost</label>
                <input
                    id="total_packing_cost"
                    name="total_packing_cost"
                    type="number"
                    value={formData.total_packing_cost}
                    onChange={(e) => setFormData({ ...formData, total_packing_cost: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div>
            <div>
                <label htmlFor="packaging_supplier" className="block text-sm font-medium text-gray-700">Packaging Supplier</label>
                <input
                    id="packaging_supplier"
                    name="packaging_supplier"
                    type="text"
                    value={formData.packaging_supplier}
                    onChange={(e) => setFormData({ ...formData, packaging_supplier: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
            </div>
           
                <div>
                    <label htmlFor="logistic_supplier" className="block text-sm font-medium text-gray-700">Logistic Provider</label>
                    <input
                        id="logistic_supplier"
                        name="logistic_supplier"
                        type="text"
                        value={formData.logistic_supplier}
                        onChange={(e) => setFormData({ ...formData, logistic_supplier: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, logistic_cost: e.target.value })}
                    className="border border-gray-300 p-2 rounded w-full col-span-1"
                />
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
            </div>
            </div>

            {/* Add more SalesPurchase fields as needed */}

            <hr className="my-6" />
            <div>
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
                {formData.salesPurchaseProducts.map((product, index) => (
                    <>
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-1 mb-4 justify-between items-end px-4 py-2">
                            {/* Product Name */}
                            <div className="col-span-1 sm:col-span-2">
                                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    name="product_name"
                                    value={product.product_name}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Product Name"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                            </div>

                            {/* HS Code */}
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
                            </div>

                            {/* Tolerance */}
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
                            </div>

                            {/* Batch Number */}
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
                            </div>

                            {/* Production Date */}
                            <div className="col-span-1 sm:col-span-2">
                                <label htmlFor="production_date" className="block text-sm font-medium text-gray-700">Production Date</label>
                                <input
                                    type="date"
                                    name="production_date"
                                    value={product.production_date}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                            </div>

                            {/* Trade Quantity */}
                            <div>
                                <label htmlFor="trade_qty" className="block text-sm font-medium text-gray-700">Trade Quantity</label>
                                <input
                                    type="number"
                                    name="trade_qty"
                                    value={product.trade_qty}
                                    onChange={(e) => handleChange(e, 'salesPurchaseProducts', index)}
                                    placeholder="Trade Quantity"
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                            </div>

                            {/* Trade Qty Unit */}
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
                <h3 className="text-lg font-medium text-gray-900">Packing Lists</h3>
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
                        </div>
                        <div>
                            <label htmlFor={`packing_list_file_${index}`} className="block text-sm font-medium text-gray-700">Packing List</label>
                            <input
                                id={`packing_list_file_${index}`}
                                name="packing_list"
                                type="file"
                                onChange={(e) => handleChange(e, 'packingLists', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
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
            {/* BL_Copy Section */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">BL Copies</h3>
                {formData.blCopies.map((blCopy, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`bl_copy_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`bl_copy_name_${index}`}
                                name="name"
                                type="text"
                                value={blCopy.name}
                                onChange={(e) => handleChange(e, 'blCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`bl_copy_file_${index}`} className="block text-sm font-medium text-gray-700">BL Copy</label>
                            <input
                                id={`bl_copy_file_${index}`}
                                name="bl_copy"
                                type="file"
                                onChange={(e) => handleChange(e, 'blCopies', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('blCopies', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('blCopies')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add BL Copy
                </button>
                </div>
                
            </div>
            <hr className="my-6" />
            {/* Invoice Section */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
                {formData.invoices.map((invoice, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`invoice_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`invoice_name_${index}`}
                                name="name"
                                type="text"
                                value={invoice.name}
                                onChange={(e) => handleChange(e, 'invoices', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`invoice_file_${index}`} className="block text-sm font-medium text-gray-700">Invoice</label>
                            <input
                                id={`invoice_file_${index}`}
                                name="invoice"
                                type="file"
                                onChange={(e) => handleChange(e, 'invoices', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('invoices', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('invoices')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add Invoice
                </button>
                </div>
                
            </div>
            <hr className="my-6" />
            {/* COA Section */}
            <div className="space-y-4 px-4">
                <h3 className="text-lg font-medium text-gray-900">COAs</h3>
                {formData.coas.map((coa, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={`coa_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                id={`coa_name_${index}`}
                                name="name"
                                type="text"
                                value={coa.name}
                                onChange={(e) => handleChange(e, 'coas', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div>
                            <label htmlFor={`coa_file_${index}`} className="block text-sm font-medium text-gray-700">COA</label>
                            <input
                                id={`coa_file_${index}`}
                                name="coa"
                                type="file"
                                onChange={(e) => handleChange(e, 'coas', index)}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="button" onClick={() => handleRemoveRow('coas', index)} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button type="button" onClick={() => handleAddRow('coas')} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Add COA
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
