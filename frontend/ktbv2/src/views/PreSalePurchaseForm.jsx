import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';

const PreSalePurchaseForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

    const [formData, setFormData] = useState({
        trn: '',
        date: getCurrentDate(),
        doc_issuance_date: '',
        payment_term: '',
        advance_due_date: '',
        lc_due_date: '',
        remarks: '',
        acknowledgedPI: [{ ackn_pi: null, ackn_pi_name: '' }],
        acknowledgedPO: [{ ackn_po: null, ackn_po_name: '' }]
    });
    const [data, setData] = useState(null); 
    const [trnOptions, setTrnOptions] = useState([]); 
    const [paymentTermOptions, setPaymentTermOptions] = useState([]);
    
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
        fetchData('/trademgt/payment-terms', {}, setPaymentTermOptions);  // Example without params
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
                payment_term: data.payment_term,
                advance_due_date: data.advance_due_date,
                lc_due_date: data.lc_due_date,
                remarks: data.remarks,
                acknowledgedPI: data.acknowledgedPI || [{ ackn_pi: null, ackn_pi_name: '' }],
                acknowledgedPO: data.acknowledgedPO || [{ ackn_po: null, ackn_po_name: '' }]
              }));
      
              // Call the second API after the first one is complete
              return axios.get(`/trademgt/print/${data.trn}`);
            })
            .then(response => {
                setData(response.data)
            })
            .catch(error => {
              console.error('There was an error fetching the data!', error);
            });
        }
      }, [mode, id]);

    const handleChange = async (e, index, section) => {
        const { name, value, type, files } = e.target;
        
        if (type === 'file') {
          setFormData(prevState => {
            const updatedSection = [...prevState[section]];
            updatedSection[index][name] = files[0];
            return { ...prevState, [section]: updatedSection };
          });
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
         
          // Trigger API call when a specific field changes (e.g., "trn")
          if (name === 'trn') {
            try {
                const response = await axios.get(`/trademgt/print/${value}/`);
                setData(response.data)
                
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          }
        }
      };

    

    const handleAddRow = (section) => {
        const newRow = section === 'acknowledgedPI' ? { ackn_pi: null, ackn_pi_name: '' } : { ackn_po: null, ackn_po_name: '' };
        setFormData(prevState => ({
            ...prevState,
            [section]: [...prevState[section], newRow]
        }));
    };

    const handleRemoveRow = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({
            ...formData,
            [section]: updatedSection
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
            });
        }
    };
    const tradeData = data
    ? [
        { label: 'Trade Type', text: data.trade_type || '' },
        { label: 'Company', text: data.company?.name || '' },
        { label: 'Country of Origin', text: data.country_of_origin || '' },
        { label: 'Customer Company Name', text: data.customer_company_name?.name || '' },
        { label: 'Address', text: data.address || '' },
        { label: 'Packing', text: data.packing || '' },
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
        { label: 'Container Shipment Size', text: data.container_shipment_size || '' },
        { label: 'Remarks', text: data.remarks || '' },
      ]
    : [];

    

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
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
                 </tr>
               </thead>
               <tbody>
                 {data.trade_products.map(product => (
                   <tr key={product.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_name}</td>
                    
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td>
                     
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.selected_currency_rate}</td>
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
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="doc_issuance_date" className="block text-sm font-medium text-gray-700">Document Issuance Date</label>
                    <input
                        id="doc_issuance_date"
                        name="doc_issuance_date"
                        type="date"
                        value={formData.doc_issuance_date}
                        onChange={e => setFormData({ ...formData, doc_issuance_date: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="payment_term" className="block text-sm font-medium text-gray-700">Payment Term</label>
                    <select
                        id="payment_term"
                        name="payment_term"
                        value={formData.payment_term}
                        onChange={e => setFormData({ ...formData, payment_term: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    >
                        <option value="">Select Payment Term</option>
                        {paymentTermOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="advance_due_date" className="block text-sm font-medium text-gray-700">Advance Due Date</label>
                    <input
                        id="advance_due_date"
                        name="advance_due_date"
                        type="date"
                        value={formData.advance_due_date}
                        onChange={e => setFormData({ ...formData, advance_due_date: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_due_date" className="block text-sm font-medium text-gray-700">LC Due Date</label>
                    <input
                        id="lc_due_date"
                        name="lc_due_date"
                        type="date"
                        value={formData.lc_due_date}
                        onChange={e => setFormData({ ...formData, lc_due_date: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
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
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPI', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                            )}
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
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow('acknowledgedPO', index)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                                >
                                    Remove
                                </button>
                            )}
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
                className="bg-blue-500 text-white p-2 rounded col-span-3"
            >
                {mode === 'add' ? 'Add' : 'Update'} PreSalePurchase
            </button>
            </div>
           
        </form>
    );
};

export default PreSalePurchaseForm;
