import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { BASE_URL } from '../utils';

const TradeReport = () => {
    const [formData, setFormData] = useState({ trn: '' });
    const [trnOptions, setTrnOptions] = useState([]);
    const [reportData, setReportData] = useState(null);

      const BACKEND_URL = BASE_URL || "http://localhost:8000";

    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params }); // Pass params to axios.get
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/trademgt/trades', {}, setTrnOptions); // Example with params
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target; // Destructure name and value from the event target
        setFormData(prevState => ({
            ...prevState,
            [name]: value, // Use name as the key to update the correct field in formData
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Send form data as query parameters in the GET request
        axios.get('/trademgt/trade-report/', {
            params: formData, // Pass formData as query parameters
        })
        .then(response => {
            console.log('Response:', response.data); // Log response for debugging
            setReportData(response.data);
            // Reset form data or handle success as needed
            setFormData({ trn: '' });
        })
        .catch(error => {
            console.error('There was an error fetching the trade report!', error);
        });
    };

 

    return (
        <div className='h-full overflow-y-scroll'>
            <form onSubmit={handleSubmit} className="space-y-2 w-full lg:w-2/3 mx-auto">
                <h2 className="text-xl font-semibold text-center">Trade Report</h2>
                <div className="grid grid-cols-1 gap-2 p-2">
                    <select
                        id="trn"
                        name="trn"
                        value={formData.trn}
                        onChange={handleChange} // Directly pass the function
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select TRN</option>
                        {trnOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.trn}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        Search
                    </button>
                </div>
            </form>

            <hr className="my-6" />
        
            {/* List of Existing Documents */}
            <div className="space-y-4 w-full lg:w-2/3 mx-auto">
                <p>Trade</p>
                {reportData && reportData.trade ? (
                    <>
                        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Field Name</th>
                                    <th className="px-4 py-2 border-b text-left">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b">Company</td>
                                    <td className="px-4 py-2 border-b">{reportData?.trade?.companyName?.name || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">Date</td>
                                    <td className="px-4 py-2 border-b">{reportData?.trade?.trd || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">Trade Reference Date</td>
                                    <td className="px-4 py-2 border-b">{reportData?.trade?.approval_date || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">Trade Reference Number</td>
                                    <td className="px-4 py-2 border-b">{reportData?.trade?.trn || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">Trader Name</td>
                                    <td className="px-4 py-2 border-b">{reportData?.trade?.trader_name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Insurance Policy Number</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.insurance_policy_number}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Container Shipment Size</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.shipmentSize.name}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Customer Company Name</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.customer.name}</td> {/* Accessing customer name */}
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Commission Agent</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.commission_agent}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Value of Contract</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.contract_value}</td>
                            </tr>
                            {/* Add other fields in the same manner */}
                            <tr>
                                <td className="px-4 py-2 border-b">Logistic Provider</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.logistic_provider}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Payment Term</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade?.paymentTerm?.name}</td> {/* Accessing payment term */}
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Advance Value to Receive/Pay</td>
                                <td className="px-4 py-2 border-b">{reportData?.trade.advance_value_to_receive}</td>
                            </tr>
                        </tbody>
                        </table>
                        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Product Code</th>
                                    <th className="px-4 py-2 border-b text-left">Product Name</th>
                                    <th className="px-4 py-2 border-b text-left">Product Name in BL</th>
                                    <th className="px-4 py-2 border-b text-left">LOI</th>
                                    <th className="px-4 py-2 border-b text-left">HS Code</th>
                                    <th className="px-4 py-2 border-b text-left">Markings</th>
                                    <th className="px-4 py-2 border-b text-left">Total Contract Qty</th>
                                    <th className="px-4 py-2 border-b text-left">Contract Qty Unit</th>
                                    <th className="px-4 py-2 border-b text-left">Trade Qty</th>
                                    <th className="px-4 py-2 border-b text-left">Rate in USD</th>
                                    <th className="px-4 py-2 border-b text-left">Commission Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData?.trade?.trade_products?.length > 0 ? (
                                    reportData.trade.trade_products.map((product, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border-b">{product.product_code || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.productName.name || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.product_name_for_client || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{<p className='text-sm'><a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${product.loi}`} target="_blank"
                                                rel="noopener noreferrer">LOI</a></p> || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.hs_code || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.markings_in_packaging || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.total_contract_qty || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.total_contract_qty_unit || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.trade_qty || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.rate_in_usd || 'N/A'}</td>
                                            <td className="px-4 py-2 border-b">{product.commission_rate || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-2 border-b text-center" colSpan={11}>
                                            No trade products available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <p>Pre Sales / Purchase</p>
                        {reportData && reportData.presp ? (
                            <>
                            <div>

                                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 border-b text-left">Field Name</th>
                                            <th className="px-4 py-2 border-b text-left">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-2 border-b">PO / PI ISSUANCE DATE</td>
                                            <td className="px-4 py-2 border-b">{reportData?.presp?.doc_issuance_date || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 border-b">Advance/LC due date</td>
                                            <td className="px-4 py-2 border-b">{reportData?.presp?.doc_issuance_date || 'N/A'}</td>
                                        </tr>

                                    </tbody>
                                </table>
                                </div>
                                <div className='p-2'>
                                    <p className='my-2 underline'>Documents Required</p>
                                    {reportData.presp &&
                                        reportData.presp.documentRequired.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                       {item.doc.name}
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                    <p className='my-2 underline'>Acknowledged PI</p>
                                    {reportData.presp.acknowledgedPI &&
                                        reportData.presp.acknowledgedPI.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.ackn_pi}`} target="_blank"
                                                            rel="noopener noreferrer">{item.ackn_pi_name}</a>
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                    <p className='my-2 underline'>Acknowledged PO</p>
                                    {reportData.presp.acknowledgedPO &&
                                        reportData.presp.acknowledgedPO.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.ackn_po}`} target="_blank"
                                                            rel="noopener noreferrer">{item.ackn_po_name}</a>
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                </div>
                            </>
                        ) : (

                            <p>No Pre Sales/Purchase data available.</p>
                        )}


                        <p>Prepayment</p>
                        {reportData && reportData.pp ? (
                          <>
                            <div>
                              
                              <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left">Field Name</th>
                                    <th className="px-4 py-2 border-b text-left">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-2 border-b">ADVANCE RECEIVED</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.advance_received }</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">DATE OF RECEIPT</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.date_of_receipt || ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">ADVANCE PAID</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.advance_paid }</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">DATE OF PAYMENT</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.date_of_payment || ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">LC NUMBER</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.lc_number || ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">LC OPENING BANK</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.lc_opening_bank || ''}</td>
                                </tr>
                               
                                <tr>
                                    <td className="px-4 py-2 border-b">LC Expiry Date</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.lc_expiry_date || ''}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 border-b">Latest Shipment Date in LC</td>
                                    <td className="px-4 py-2 border-b">{reportData?.pp?.latest_shipment_date_in_lc || ''}</td>
                                </tr>
                               
                               
                            </tbody>
                        </table>
                            </div>
                            <div className='p-2'>
                                    <p className='my-2 underline'>Lc Copy</p>
                                    {reportData.pp.lcCopy &&
                                        reportData.pp.lcCopy.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.lc_copy}`} target="_blank"
                                                            rel="noopener noreferrer">{item.name}</a>
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                    <p className='my-2 underline'>LC Ammendments</p>
                                    {reportData.pp.lcAmmendment &&
                                        reportData.pp.lcAmmendment.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.lc_ammendment}`} target="_blank"
                                                            rel="noopener noreferrer">{item.name}</a>
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                    <p className='my-2 underline'>Advance TT Copy</p>
                                    {reportData.pp.advanceTTCopy &&
                                        reportData.pp.advanceTTCopy.map((item, index) =>
                                            item.name !== '' ? (
                                                <div key={index}>
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.advance_tt_copy}`} target="_blank"
                                                            rel="noopener noreferrer">{item.name}</a>
                                                    </p>
                                                </div>
                                            ) : null
                                        )}
                                </div>
                            </>
                        ) : (
                           
                            <p>No Prepayment data available.</p>
                        )}


                        <p>S&P</p>
                        {reportData?.sp?.length > 0 ? (
                            reportData.sp.map((salespurchase, index) => (
                                <div key={index} className="mb-6">
                                    {/* Table for Sales Purchase Details */}
                                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg mb-4">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 border-b text-left">Field Name</th>
                                                <th className="px-4 py-2 border-b text-left">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="px-4 py-2 border-b">S&P ID</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.id || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">Invoice Date</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.invoice_date || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">Invoice Number</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.invoice_number || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">Invoice Amount</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.invoice_amount || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">COMMISSION VALUE</td>
                                                <td className="px-4 py-2 border-b"></td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">BL Number</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.bl_number }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">BL FEES</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.bl_fees }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">BL COLLECTION COST</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.bl_collection_cost }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">BL Date</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.bl_date }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">Logitics Cost</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.logistic_cost }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">LOGISTIC COST DUE DATE</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.logistic_cost_due_date }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">Liner</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.liner }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">POD</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.pod }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">POL</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.pol }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">ETD</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.etd }</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 border-b">ETA</td>
                                                <td className="px-4 py-2 border-b">{salespurchase.eta }</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Table for Trade Products */}
                                    <h3 className="font-bold mb-2">S&P Products</h3>
                                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg mb-4">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 border-b text-left">Product Code</th>
                                                <th className="px-4 py-2 border-b text-left">Product Name</th>
                                                <th className="px-4 py-2 border-b text-left">BL Qty</th>
                                                <th className="px-4 py-2 border-b text-left">Batch Number</th>
                                                <th className="px-4 py-2 border-b text-left">Production Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salespurchase.sp_product?.length > 0 ? (
                                                salespurchase.sp_product.map((product, productIndex) => (
                                                    <tr key={productIndex}>
                                                        <td className="px-4 py-2 border-b">{product.product_code || 'N/A'}</td>
                                                        <td className="px-4 py-2 border-b">{product.productName?.name || 'N/A'}</td>
                                                        <td className="px-4 py-2 border-b">{product.bl_qty}</td>
                                                        <td className="px-4 py-2 border-b">{product.batch_number}</td>
                                                        <td className="px-4 py-2 border-b">{product.production_date}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-2 border-b text-center" colSpan={5}>
                                                        No trade products available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Table for Extra Costs */}
                                    <h3 className="font-bold mb-2">Extra Costs</h3>
                                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 border-b text-left">Name</th>
                                                <th className="px-4 py-2 border-b text-left">Charge</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salespurchase.sp_extra_charges?.length > 0 ? (
                                                salespurchase.sp_extra_charges.map((cost, costIndex) => (
                                                    <tr key={costIndex}>
                                                        <td className="px-4 py-2 border-b">{cost.name || 'N/A'}</td>
                                                        <td className="px-4 py-2 border-b">{cost.charge || 'N/A'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-2 border-b text-center" colSpan={2}>
                                                        No extra costs available.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <div className='p-2'>
                                    <p className='my-2 underline'>Documents List</p>
                                    {salespurchase.packingList?.length > 0 ? (
                                                salespurchase.packingList.map((item, index) => (
                                                    <p className="text-sm">
                                                        {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.packing_list}`} target="_blank"
                                                            rel="noopener noreferrer">{item.name}</a>
                                                    </p>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-2 border-b text-center" colSpan={2}>
                                                        No documents available.
                                                    </td>
                                                </tr>
                                            )}
                                   
                                </div>
                                    <p>Payment & Finance</p>

                                    

                                    {salespurchase?.pf?.length > 0 ? (
                                        salespurchase.pf.map((pnf, costIndex) => (
                                            <div key={costIndex} className="mb-4">
                                                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg mb-4">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 border-b text-left">Field Name</th>
                                                            <th className="px-4 py-2 border-b text-left">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Balance Payment</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.balance_payment || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Bal Payment Due Date</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.balance_payment_due_date || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Balance Payment Received</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.balance_payment_received || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Balance Payment Made</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.balance_payment_made || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Balance Payment Date</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.balance_payment_date || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">NET DUE IN THIS TRADE</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.net_due_in_this_trade || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Document Released Date</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.release_docs_date || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-2 border-b">Document Released by</td>
                                                            <td className="px-4 py-2 border-b">
                                                                {pnf.released_by || 'N/A'}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <div className='p-2'>
                                                    <p className='my-2 underline'>Documents List</p>
                                                    {pnf.pf_ttcopy?.length > 0 ? (
                                                        pnf.pf_ttcopy.map((item, index) => (
                                                            <p className="text-sm">
                                                                {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.tt_copy}`} target="_blank"
                                                                    rel="noopener noreferrer">{item.name}</a>
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="px-4 py-2 border-b text-center" colSpan={2}>
                                                                No documents available.
                                                            </td>
                                                        </tr>
                                                    )}

                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No Payment & Finance data available.</p>
                                    )}

                                </div>
                            ))
                        ) : (
                            <p>No S&P data available.</p>
                        )}

                    </>


                ) : (
                    <p className="text-center text-gray-500">No report data available.</p>
                )}

            </div>








        </div>
    );
};

export default TradeReport;

