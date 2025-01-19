import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { capitalizeKey } from '../utils';

const PreSalePurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

    const addDaysToDate = (days, doc_date) => {
        // Use doc_date if provided; otherwise, use today's date in 'en-CA' format.
        const baseDate = doc_date 
            ? new Date(doc_date) 
            : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });
            
        const resultDate = new Date(baseDate);
        resultDate.setDate(resultDate.getDate() + parseInt(days, 10));
    
        const year = resultDate.getFullYear();
        const month = String(resultDate.getMonth() + 1).padStart(2, '0');
        const day = String(resultDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState({
        trn: '',
        date: today,
        doc_issuance_date: today,
        remarks: '',
        documentRequired: [{ name: '' }], // Ensure all sections are initialized as arrays
        acknowledgedPI: [{ ackn_pi: null, ackn_pi_name: '' }],
        acknowledgedPO: [{ ackn_po: null, ackn_po_name: '' }]
    });
    const [data, setData] = useState(null);
    const [trnOptions, setTrnOptions] = useState([]);
    const [docOptions, setDocOptions] = useState([]);

    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params });
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/trademgt/trades', { approved: true,reviewed: true }, setTrnOptions);
        fetchData('/trademgt/documents', {}, setDocOptions);
    }, []);

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/trademgt/pre-sales-purchases/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        trn: data.trn,
                        date: data.date,
                        doc_issuance_date: data.doc_issuance_date,
                        remarks: data.remarks,
                        documentRequired: data.documentRequired || [{ name: '' }],
                        acknowledgedPI: data.acknowledgedPI || [{ ackn_pi: null, ackn_pi_name: '' }],
                        acknowledgedPO: data.acknowledgedPO || [{ ackn_po: null, ackn_po_name: '' }]
                    }));
                    return axios.get(`/trademgt/print/${data.trn}`);
                })
                .then(response => {
                    setData(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

    const handleChange = async (e, index = null, section = null) => {
        const { name, value, type, files } = e.target;
      
        if (type === 'file' && section) {
          setFormData((prevState) => {
            const updatedSection = prevState[section] ? [...prevState[section]] : []; // Handle undefined case
            updatedSection[index][name] = files[0];
            return { ...prevState, [section]: updatedSection };
          });
        } else if (section) {
          setFormData((prevState) => {
            const updatedSection = prevState[section] ? [...prevState[section]] : []; // Handle undefined case
            updatedSection[index][name] = value;
            return { ...prevState, [section]: updatedSection };
          });
        } else {
          // Handle updates for the top-level keys in formData
          setFormData((prevState) => ({
            ...prevState,
            [name]: value,
          }));
      
          // Trigger API call when a specific field changes (e.g., "trn")
          if (name === 'trn') {
            try {
              const response = await axios.get(`/trademgt/print/${value}/`);
              setData(response.data);
              console.log(value, response.data);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
        }
      };
      

    const handleAddRow = (section) => {
        let newRow;
        if (section === 'acknowledgedPI') {
            newRow = { ackn_pi: null, ackn_pi_name: '' };
        } else if (section === 'acknowledgedPO') {
            newRow = { ackn_po: null, ackn_po_name: '' };
        } else if (section === 'documentRequired') {
            newRow = { name: '' };
        }

        setFormData((prevState) => ({
            ...prevState,
            [section]: prevState[section] ? [...prevState[section], newRow] : [newRow], // Ensure section is an array
        }));
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            [section]: updatedSection,
        });
    };

    // Dynamically apply red border to invalid fields
    const getFieldErrorClass = (fieldName) => {
        return validationErrors[fieldName] ? 'border-red-500' : '';
    };

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }
        
        setIsSubmitting(true);
        let errors = {};

        // Define fields to skip validation for
        const skipValidation = [];

        // Check each regular field for empty value (except files and those in skipValidation)
        for (const [key, value] of Object.entries(formData)) {
            if (!skipValidation.includes(key) && value === '') {
                errors[key] = `${capitalizeKey(key)} cannot be empty!`;
            }
        }

         // Validate tradeExtraCosts array fields (validate all or selectively skip some)
         formData.documentRequired.forEach((doc, index) => {
            for (const [key, value] of Object.entries(doc)) {
                if (!skipValidation.includes(key) && value === '') {
                    errors[`documentRequired[${index}].${key}`] = `${capitalizeKey(key)} cannot be empty!`;
                }
            }
        });

        setValidationErrors(errors);
    
        if (Object.keys(errors).length > 0) {
            console.log(errors);
            setIsSubmitting(false);
            return;
        } else {
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
            axios.post('/trademgt/pre-sales-purchases/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Pre sale/purchase added successfully!', response.data);
                navigate(`/pre-sale-purchase`);
            })
            .catch(error => {
                console.error('There was an error adding the trade!', error);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/pre-sales-purchases/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Pre sale/purchase updated successfully!', response.data);
                navigate(`/pre-sale-purchase`);
            })
            .catch(error => {
                console.error('There was an error updating the trade!', error);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
        }
    }, [formData, mode, id, isSubmitting, navigate]); // Add all dependencies

    const tradeData = data
    ? [
        { label: 'Trade Type', text: data.trade_type || '' },
        { label: 'Company', text: data.company?.name || '' },
        { label: 'Country of Origin', text: data.country_of_origin || '' },
        { label: 'Customer Company Name', text: data.customer_company_name?.name || '' },
        { label: 'Address', text: data.address || '' },
        { label: 'Payment Term', text: data.paymentTerm.name || '' },
        { label: 'Advance/LC Due Date', text: data.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(data.paymentTerm.advance_within,formData.doc_issuance_date) || '' },
        // { label: 'LC Due Date', text: data.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(data.paymentTerm.advance_within,formData.doc_issuance_date) || '' },
        { label: 'Bank Name Address', text: data.bank_name_address?.name || '' },
        { label: 'Account Number', text: data.bank_name_address?.account_number || '' },
        { label: 'SWIFT Code', text: data.bank_name_address?.swift_code || '' },
        { label: 'Incoterm', text: data.incoterm || '' },
        { label: 'POD', text: data.pod || '' },
        { label: 'POL', text: data.pol || '' },
        { label: 'ETA', text: data.eta || '' },
        { label: 'ETD', text: data.etd || '' },
        { label: 'Trader Name', text: data.trader_name || '' },
        { label: 'Insurance Policy Number', text: data.insurance_policy_number || '' },
        // { label: 'Container Shipment Size', text: data.shipmentSize.name || '' },
        { label: 'Remarks', text: data.remarks || '' },
      ]
    : [];

    

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <h2 className="text-2xl mb-2 text-center">Pre Sales/Purchase Document</h2>
            {data && (
                <>
            <div className="grid grid-cols-4 gap-1 p-2">
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
                   {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name for Client</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LOI</th> */}
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th>
                 
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Selected Currency Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Container Shipment Size</th>
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
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.shipmentSize.name}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
            </>
          )}
          <hr />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">TRN</label>
                    <select
                        id="trn"
                        name="trn"
                        value={formData.trn}
                        onChange={(e) => handleChange(e)}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('trn')}`}
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
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('date')}`}
                    />
                    {validationErrors.date && <p className="text-red-500">{validationErrors.date}</p>}
                </div>
                <div>
                    <label htmlFor="doc_issuance_date" className="block text-sm font-medium text-gray-700">Document Issuance Date</label>
                    <input
                        id="doc_issuance_date"
                        name="doc_issuance_date"
                        type="date"
                        value={formData.doc_issuance_date}
                        onChange={e => setFormData({ ...formData, doc_issuance_date: e.target.value })}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('doc_issuance_date')}`}
                    />
                    {validationErrors.doc_issuance_date && <p className="text-red-500">{validationErrors.doc_issuance_date}</p>}
                </div>
               
            
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('remarks')}`}
                    />
                    {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
                </div>
            </div>
            <div className="mt-0 p-4">
                <h3 className="text-lg font-medium text-gray-900">Documents Required</h3>
                {formData.documentRequired.map((doc, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">

                        <div>
                            <label htmlFor={`doc_name_${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                            <select
                                id={`doc_name_${index}`}
                                name="name"
                                value={doc.name}
                                onChange={(e) => handleChange(e, index, 'documentRequired')}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            >
                                <option value="">Select Document</option>
                                {docOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            {validationErrors[`documentRequired[${index}].name`] && (
                                    <p className="text-red-500">
                                        {validationErrors[`documentRequired[${index}].name`]}
                                    </p>
                                )}
                        </div>
                        
                        <div className="flex items-end">

                            <button
                                    type="button"
                                    onClick={() => handleRemoveRow('documentRequired', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                           
                        </div>
                    </div>
                ))}
                <div className="text-right">
                    <button
                        type="button"
                        onClick={() => handleAddRow('documentRequired')}
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md"
                    >
                        Add Document
                    </button>
                </div>
            </div>
            {/* Acknowledged PI Section */}
            <div className="mt-0 p-4">
                <h3 className="text-lg font-medium text-gray-900">Acknowledged PI</h3>
                {formData.acknowledgedPI.map((ackPi, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 ">
                        <div>
                            <label htmlFor={`ackn_pi_${index}`} className="block text-sm font-medium text-gray-700">Acknowledged PI</label>
                            <input
                                id={`ackn_pi_${index}`}
                                name="ackn_pi"
                                type="file"
                                onChange={e => handleChange(e, index, 'acknowledgedPI')}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                            {/* {ackPi.ackn_pi && (
                                <span className="block mt-2 text-gray-600">
                                    {ackPi.ackn_pi} 
                                </span>
                            )} */}
                        </div>
                        <div>
                            <label htmlFor={`ackn_pi_name_${index}`} className="block text-sm font-medium text-gray-700">PI Name</label>
                            <input
                                id={`ackn_pi_name_${index}`}
                                name="ackn_pi_name"
                                type="text"
                                value={ackPi.ackn_pi_name || ''}
                                onChange={e => handleChange(e, index, 'acknowledgedPI')}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPI', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                           
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button
                    type="button"
                    onClick={() => handleAddRow('acknowledgedPI')}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md"
                >
                    Add PI
                </button>
                </div>
                
            </div>
            {/* Acknowledged PO Section */}
            <div className="mt-0 p-4">
                <h3 className="text-lg font-medium text-gray-900">Acknowledged PO</h3>
                {formData.acknowledgedPO.map((ackPo, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <label htmlFor={`ackn_po_${index}`} className="block text-sm font-medium text-gray-700">Acknowledged PO</label>
                            <input
                                id={`ackn_po_${index}`}
                                name="ackn_po"
                                type="file"
                                onChange={e => handleChange(e, index, 'acknowledgedPO')}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                            {/* {ackPo.ackn_po && <span className="block mt-2 text-gray-600">{ackPo.ackn_po}</span>} */}
                        </div>
                        <div>
                            <label htmlFor={`ackn_po_name_${index}`} className="block text-sm font-medium text-gray-700">PO Name</label>
                            <input
                                id={`ackn_po_name_${index}`}
                                name="ackn_po_name"
                                type="text"
                                value={ackPo.ackn_po_name || ''}
                                onChange={e => handleChange(e, index, 'acknowledgedPO')}
                                className="border border-gray-300 p-2 rounded w-full col-span-1"
                            />
                        </div>
                        <div className="flex items-end">
                            
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPO', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                            
                        </div>
                    </div>
                ))}
                <div className="text-right">
                <button
                    type="button"
                    onClick={() => handleAddRow('acknowledgedPO')}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md"
                >
                    Add PO
                </button>
                </div>
                
            </div>
            <div className='grid grid-cols-3 gap-4 mb-4'>
            <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                    isSubmitting ? 'bg-gray-400' : 'bg-blue-500'
                } text-white p-2 rounded col-span-3`}
            >
                {isSubmitting 
                    ? 'Processing...' 
                    : `${mode === 'add' ? 'Add' : 'Update'} PreSalePurchase`
                }
            </button>
            </div>
           
        </form>
    );
};

export default PreSalePurchaseForm;
