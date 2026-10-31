import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { capitalizeKey } from '../utils';

const PLForm = ({ mode = 'add' }) => {
  const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({
        sales_trn: '',
        purchase_trn: '',
        remarks: '',
    });
    const [salesData, setSalesData] = useState(null);
    const [purchaseData, setPurchaseData] = useState(null);
    const [salesTrnOptions, setSalesTrnOptions] = useState([]);
    const [purchaseTrnOptions, setPurchaseTrnOptions] = useState([]);
    const [autoLinkStatus, setAutoLinkStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params });
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    const [existingPlList, setExistingPlList] = useState([]);

    useEffect(() => {
        fetchData('/trademgt/sales-purchases/', { reviewed: true, pf_approved: 'true', trn__trade_type: 'Sales' }, setSalesTrnOptions);
        fetchData('/trademgt/sales-purchases/', { reviewed: true, pf_approved: 'true', trn__trade_type: 'Purchase' }, setPurchaseTrnOptions);

        axios.get('/trademgt/profitloss/')
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setExistingPlList(list);
            })
            .catch(err => console.error('Error fetching existing PL list:', err));
    }, []);

    const filteredSalesOptions = useMemo(() => {
        const usedSalesIds = new Set(
            existingPlList
                .filter(pl => mode !== 'update' || String(pl.id) !== String(id))
                .map(pl => Number(typeof pl.sales_trn === 'object' ? pl.sales_trn?.id : pl.sales_trn))
                .filter(Boolean)
        );
        return salesTrnOptions.filter(option => !usedSalesIds.has(Number(option.id)));
    }, [salesTrnOptions, existingPlList, mode, id]);

    const filteredPurchaseOptions = useMemo(() => {
        const usedPurchaseIds = new Set(
            existingPlList
                .filter(pl => mode !== 'update' || String(pl.id) !== String(id))
                .map(pl => Number(typeof pl.purchase_trn === 'object' ? pl.purchase_trn?.id : pl.purchase_trn))
                .filter(Boolean)
        );
        return purchaseTrnOptions.filter(option => !usedPurchaseIds.has(Number(option.id)));
    }, [purchaseTrnOptions, existingPlList, mode, id]);

    const formatOptionLabel = (option) => {
        if (!option) return '';
        const trnCode = option.trn?.trn || option.trn || 'Unknown TRN';
        const blText = option.bl_number ? `BL: ${option.bl_number}` : 'No BL';
        return `${trnCode} (${option.id}) - ${blText}`;
    };

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/trademgt/profitloss/${id}`)
                .then(response => {
                    const data = response.data;
                    const salesId = typeof data.sales_trn === 'object' ? data.sales_trn?.id : data.sales_trn;
                    const purchaseId = typeof data.purchase_trn === 'object' ? data.purchase_trn?.id : data.purchase_trn;
                    setFormData(prevState => ({
                        ...prevState,
                        sales_trn: salesId || '',
                        purchase_trn: purchaseId || '',
                        remarks: data.remarks || '',
                    }));
                    if (salesId) {
                        axios.get(`/trademgt/pl/${salesId}/`)
                            .then(res => setSalesData(res.data))
                            .catch(err => console.error('Error fetching sales data:', err));
                    }
                    if (purchaseId) {
                        axios.get(`/trademgt/pl/${purchaseId}/`)
                            .then(res => setPurchaseData(res.data))
                            .catch(err => console.error('Error fetching purchase data:', err));
                    }
                })
                .catch(error => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

    const handleSalesChange = (selectedOption) => {
        const salesId = selectedOption ? selectedOption.value : '';

        if (!salesId) {
            setFormData(prev => ({
                ...prev,
                sales_trn: '',
                purchase_trn: '',
            }));
            setSalesData(null);
            setPurchaseData(null);
            setAutoLinkStatus(null);
            return;
        }

        const selectedSales = salesTrnOptions.find(opt => String(opt.id) === String(salesId));
        const salesBl = selectedSales?.bl_number ? String(selectedSales.bl_number).trim() : '';

        let matchedPurchase = null;
        let usedPurchase = null;

        if (salesBl) {
            matchedPurchase = filteredPurchaseOptions.find(
                opt => opt.bl_number && String(opt.bl_number).trim().toLowerCase() === salesBl.toLowerCase()
            );
            if (!matchedPurchase) {
                usedPurchase = purchaseTrnOptions.find(
                    opt => opt.bl_number && String(opt.bl_number).trim().toLowerCase() === salesBl.toLowerCase()
                );
            }
        }

        setFormData(prev => ({
            ...prev,
            sales_trn: salesId,
            purchase_trn: matchedPurchase ? matchedPurchase.id : '',
        }));

        setValidationErrors(prev => {
            const next = { ...prev };
            delete next.sales_trn;
            if (matchedPurchase) delete next.purchase_trn;
            return next;
        });

        if (matchedPurchase) {
            setAutoLinkStatus({
                type: 'success',
                message: `Automatically linked Purchase (TRN: ${matchedPurchase.trn?.trn || matchedPurchase.id}) via BL: ${salesBl}`
            });
            axios.get(`/trademgt/pl/${matchedPurchase.id}/`)
                .then(res => setPurchaseData(res.data))
                .catch(err => console.error('Error fetching purchase data:', err));
        } else if (usedPurchase) {
            setAutoLinkStatus({
                type: 'warning',
                message: `Purchase with BL "${salesBl}" (TRN: ${usedPurchase.trn?.trn || usedPurchase.id}) is already linked in another P&L. Please select manually.`
            });
            setPurchaseData(null);
        } else if (salesBl) {
            setAutoLinkStatus({
                type: 'info',
                message: `No available purchase found matching BL "${salesBl}". Please select manually.`
            });
            setPurchaseData(null);
        } else {
            setAutoLinkStatus(null);
            setPurchaseData(null);
        }

        axios.get(`/trademgt/pl/${salesId}/`)
            .then(res => setSalesData(res.data))
            .catch(err => console.error('Error fetching sales data:', err));
    };

    const handlePurchaseChange = (selectedOption) => {
        const purchaseId = selectedOption ? selectedOption.value : '';

        setFormData(prev => ({
            ...prev,
            purchase_trn: purchaseId,
        }));

        setValidationErrors(prev => {
            const next = { ...prev };
            delete next.purchase_trn;
            return next;
        });

        if (purchaseId) {
            axios.get(`/trademgt/pl/${purchaseId}/`)
                .then(res => setPurchaseData(res.data))
                .catch(err => console.error('Error fetching purchase data:', err));

            const selectedSales = salesTrnOptions.find(opt => String(opt.id) === String(formData.sales_trn));
            const selectedPurch = purchaseTrnOptions.find(opt => String(opt.id) === String(purchaseId));

            const salesBl = selectedSales?.bl_number ? String(selectedSales.bl_number).trim().toLowerCase() : null;
            const purchBl = selectedPurch?.bl_number ? String(selectedPurch.bl_number).trim().toLowerCase() : null;

            if (salesBl && purchBl && salesBl === purchBl) {
                setAutoLinkStatus({
                    type: 'success',
                    message: `Linked via BL: ${selectedPurch.bl_number}`
                });
            } else if (formData.sales_trn) {
                setAutoLinkStatus({
                    type: 'manual',
                    message: `Manually selected Purchase (BL: ${selectedPurch?.bl_number || 'No BL'})`
                });
            }
        } else {
            setPurchaseData(null);
            setAutoLinkStatus(null);
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;
    
        // Update formData
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    
        // Call API if `sales_trn` or `purchase_trn` changes
        if (name === "sales_trn" || name === "purchase_trn") {
            try {
                const response = await axios.get(`/trademgt/pl/${value}/`)
                .then((result)=>{
                    if(name === "sales_trn"){setSalesData(result.data)}
                    else {setPurchaseData(result.data)}
                })
                .catch((error)=>console.error(`Error fetching data for ${name}:`, error));
            } catch (error) {
                console.error(`Error fetching data for ${name}:`, error);
            }
        }
    };
    

    // Dynamically apply red border to invalid fields
    const getFieldErrorClass = (fieldName) => {
        return validationErrors[fieldName] ? 'border-red-500' : '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isSubmitting) return;
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

        setValidationErrors(errors);
    
        if (Object.keys(errors).length > 0) {
            console.log(errors);
            setIsSubmitting(false); // Re-enable submit if validation fails
            return;
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
            axios.post('/trademgt/profitloss/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Profit & Loss added successfully!', response.data);
                navigate(`/pl`);
            })
            .catch(error => {
                console.error('There was an error adding the profit & loss!', error);
                setIsSubmitting(false); // Re-enable submit on error
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/profitloss/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Profit & Loss updated successfully!', response.data);
                navigate(`/pl`);
            })
            .catch(error => {
                console.error('There was an error updating the profit & loss!', error);
                setIsSubmitting(false); // Re-enable submit on error
            });
        }

    }

    return (
        <>
           <form onSubmit={handleSubmit} className="space-y-2 w-full">
            <h2 className="text-2xl mb-2 text-center">P&L Document</h2>
            
          <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                    <label htmlFor="sales_trn" className="block text-sm font-medium text-gray-700 mb-1">Sales TRN & ID</label>
                    <Select
                        id="sales_trn"
                        name="sales_trn"
                        options={filteredSalesOptions.map(option => ({
                            value: option.id,
                            label: formatOptionLabel(option)
                        }))}
                        value={
                            formData.sales_trn
                                ? {
                                    value: formData.sales_trn,
                                    label: (() => {
                                        const opt = salesTrnOptions.find(o => String(o.id) === String(formData.sales_trn));
                                        return opt ? formatOptionLabel(opt) : String(formData.sales_trn);
                                    })()
                                }
                                : null
                        }
                        onChange={handleSalesChange}
                        placeholder="Select Sales TRN"
                        isSearchable
                        isClearable
                        className={`w-full col-span-1 ${getFieldErrorClass('sales_trn')}`}
                    />
                    {validationErrors.sales_trn && <p className="text-red-500 text-xs mt-1">{validationErrors.sales_trn}</p>}
                </div>

                <div>
                    <label htmlFor="purchase_trn" className="block text-sm font-medium text-gray-700 mb-1">Purchase TRN & ID</label>
                    <Select
                        id="purchase_trn"
                        name="purchase_trn"
                        options={filteredPurchaseOptions.map(option => ({
                            value: option.id,
                            label: formatOptionLabel(option)
                        }))}
                        value={
                            formData.purchase_trn
                                ? {
                                    value: formData.purchase_trn,
                                    label: (() => {
                                        const opt = purchaseTrnOptions.find(o => String(o.id) === String(formData.purchase_trn));
                                        return opt ? formatOptionLabel(opt) : String(formData.purchase_trn);
                                    })()
                                }
                                : null
                        }
                        onChange={handlePurchaseChange}
                        placeholder="Select Purchase TRN"
                        isSearchable
                        isClearable
                        className={`w-full col-span-1 ${getFieldErrorClass('purchase_trn')}`}
                    />
                    {validationErrors.purchase_trn && <p className="text-red-500 text-xs mt-1">{validationErrors.purchase_trn}</p>}
                    {autoLinkStatus && (
                        <div className={`mt-2 rounded px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                            autoLinkStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            autoLinkStatus.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            autoLinkStatus.type === 'manual' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                            {autoLinkStatus.type === 'success' && <span>✓</span>}
                            {autoLinkStatus.type === 'warning' && <span>⚠</span>}
                            {autoLinkStatus.type === 'info' && <span>ℹ</span>}
                            {autoLinkStatus.type === 'manual' && <span>✎</span>}
                            <span>{autoLinkStatus.message}</span>
                        </div>
                    )}
                </div>
            
               
            
                <div className='col-span-2'>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                        className={`border border-gray-300 p-2 rounded w-full col-span-2 ${getFieldErrorClass('remarks')}`}
                    />
                    {validationErrors.remarks && <p className="text-red-500">{validationErrors.remarks}</p>}
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
                {isSubmitting ? 'Processing...' : `${mode === 'add' ? 'Add' : 'Update'} P&L`}
            </button>
            </div>
           
        </form>
        </>
    );

}

export default PLForm;