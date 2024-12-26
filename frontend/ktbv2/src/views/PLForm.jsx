import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { capitalizeKey } from '../utils';

const PLForm = ({ mode = 'add' }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async (url, params = {}, setStateFunction) => {
        try {
            const response = await axios.get(url, { params });
            setStateFunction(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData('/trademgt/sales-purchases/', { reviewed: true }, setSalesTrnOptions);
        fetchData('/trademgt/sales-purchases/', { reviewed: true }, setPurchaseTrnOptions);

    }, []);

    useEffect(() => {
        if (mode === 'update' && id) {
            axios
                .get(`/trademgt/profitloss/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        sales_trn: data.sales_trn,
                        purchase_trn: data.purchase_trn,
                        remarks: data.remarks,
                    }));
                    return axios.get(`/trademgt/pl/${data.trn}`);
                })
                .then(response => {
                    setData(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the data!', error);
                });
        }
    }, [mode, id]);

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
                .catch((error)=>console.error(`Error fetching data for ${name}:`, error));// Adjust endpoint based on your API
               
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
           <form onSubmit={handleSubmit} className="space-y-2 w-full lg:w-2/3 mx-auto">
            <h2 className="text-2xl mb-2 text-center">P&L Document</h2>
            
          <hr />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                    <label htmlFor="trn" className="block text-sm font-medium text-gray-700">Sales TRN & ID</label>
                    <select
                        id="sales_trn"
                        name="sales_trn"
                        value={formData.sales_trn}
                        onChange={(e) => handleChange(e)}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('sales_trn')}`}
                    >
                        <option value="">Select TRN</option>
                        {salesTrnOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.trn.trn} ({option.id})
                            </option>
                        ))}
                    </select>
                    {validationErrors.sales_trn && <p className="text-red-500">{validationErrors.sales_trn}</p>}
                </div>

                <div>
                    <label htmlFor="purchase_trn" className="block text-sm font-medium text-gray-700">Purchase TRN & ID</label>
                    <select
                        id="purchase_trn"
                        name="purchase_trn"
                        value={formData.purchase_trn}
                        onChange={(e) => handleChange(e)}
                        className={`border border-gray-300 p-2 rounded w-full col-span-1 ${getFieldErrorClass('purchase_trn')}`}
                    >
                        <option value="">Select TRN</option>
                        {purchaseTrnOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.trn.trn} ({option.id})
                            </option>
                        ))}
                    </select>
                    {validationErrors.purchase_trn && <p className="text-red-500">{validationErrors.purchase_trn}</p>}
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