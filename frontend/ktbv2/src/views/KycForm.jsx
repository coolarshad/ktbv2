import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const KycForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

    const [formData, setFormData] = useState({
        date: today,
        name: '',
        companyRegNo: '',
        regAddress: '',
        mailingAddress: '',
        telephone: '',
        fax: '',
        person1: '',
        designation1: '',
        mobile1: '',
        email1: '',
        person2: '',
        designation2: '',
        mobile2: '',
        email2: '',
        // banker: '',
        // address: '',
        // swiftCode: '',
        // accountNumber: '',
        bank_details: [
            { banker: '', address: '', swiftCode: '', accountNumber: '' }
        ]
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/kyc/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData({
                        date: data.date || '',
                        name: data.name || '',
                        companyRegNo: data.companyRegNo || '',
                        regAddress: data.regAddress || '',
                        mailingAddress: data.mailingAddress || '',
                        telephone: data.telephone || '',
                        fax: data.fax || '',
                        person1: data.person1 || '',
                        designation1: data.designation1 || '',
                        mobile1: data.mobile1 || '',
                        email1: data.email1 || '',
                        person2: data.person2 || '',
                        designation2: data.designation2 || '',
                        mobile2: data.mobile2 || '',
                        email2: data.email2 || '',
                        bank_details: Array.isArray(data.bank_details) && data.bank_details.length > 0
                            ? data.bank_details
                            : [{ banker: '', address: '', swiftCode: '', accountNumber: '' }]
                    });
                })
                .catch(error => {
                    console.error('Error fetching KYC data', error);
                });
        }
    }, [mode, id]);


    // const handleChange = (e, section, index) => {
    //     const { name, value, files } = e.target;
    //     if (section) {
    //         const updatedSection = formData[section].map((item, i) =>
    //             i === index ? { ...item, [name]: files ? files[0] : value } : item
    //         );
    //         setFormData({ ...formData, [section]: updatedSection });
    //     } else {
    //         setFormData({ ...formData, [name]: value });
    //     }
    // };
    const handleChange = (e, section, index) => {
    const { name, value } = e.target;

    if (section && index !== undefined) {
        const updatedSection = [...formData[section]];
        updatedSection[index][name] = value;
        setFormData({ ...formData, [section]: updatedSection });
    } else {
        setFormData({ ...formData, [name]: value });
    }
};

    const validateForm = () => {
    const newErrors = {};

    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            if (!value.trim()) {
                newErrors[key] = 'This field is required';
            }
        } else if (Array.isArray(value) && key === 'bank_details') {
            value.forEach((bank, index) => {
                if (!bank.banker?.trim()) {
                    newErrors[`bank_details.${index}.banker`] = 'Banker is required';
                }
                if (!bank.accountNumber?.trim()) {
                    newErrors[`bank_details.${index}.accountNumber`] = 'Account Number is required';
                }
                // Add more nested validations if needed
            });
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleAddBankDetail = () => {
        setFormData({
            ...formData,
            bank_details: [...formData.bank_details, { banker: '', address: '', swiftCode: '', accountNumber: '' }]
        });
    };

    const handleRemoveBankDetail = (index) => {
        const updated = formData.bank_details.filter((_, i) => i !== index);
        setFormData({ ...formData, bank_details: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
          }
       
      
        if (mode === 'add') {
            axios.post('/trademgt/kyc/', formData)
                .then(res => {
                    console.log('KYC added!', res.data);
                    navigate('/kyc');
                })
                .catch(err => console.error(err));
        } else {
            axios.put(`/trademgt/kyc/${id}/`, formData)
                .then(res => {
                    console.log('KYC updated!', res.data);
                    navigate('/kyc');
                })
                .catch(err => console.error(err));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <div >
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                        readOnly
                    />
                </div>
                <div>
                    <label htmlFor="lc_number" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_opening_bank" className="block text-sm font-medium text-gray-700">Company Reg No</label>
                    <input
                        id="companyRegNo"
                        name="companyRegNo"
                        type="text"
                        value={formData.companyRegNo}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_received" className="block text-sm font-medium text-gray-700">Reg. Address</label>
                    <input
                        id="regAddress"
                        name="regAddress"
                        type="text"
                        value={formData.regAddress}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_receipt" className="block text-sm font-medium text-gray-700">Mailing Address</label>
                    <input
                        id="mailingAddress"
                        name="mailingAddress"
                        type="text"
                        value={formData.mailingAddress}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700">Telephone</label>
                    <input
                        id="telephone"
                        name="telephone"
                        type="text"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="date_of_payment" className="block text-sm font-medium text-gray-700">Fax</label>
                    <input
                        id="fax"
                        name="fax"
                        type="text"
                        value={formData.fax}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="lc_expiry_date" className="block text-sm font-medium text-gray-700">Person 1</label>
                    <input
                        id="person1"
                        name="person1"
                        type="text"
                        value={formData.person1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="latest_shipment_date_in_lc" className="block text-sm font-medium text-gray-700">Designation 1</label>
                    <input
                        id="designation1"
                        name="designation1"
                        type="text"
                        value={formData.designation1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
               
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Mobile 1</label>
                    <input
                        id="mobile1"
                        name="mobile1"
                        type="text"
                        value={formData.mobile1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Email 1</label>
                    <input
                        id="email1"
                        name="email1"
                        type="text"
                        value={formData.email1}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Person 2</label>
                    <input
                        id="person2"
                        name="person2"
                        type="text"
                        value={formData.person2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Designation 2</label>
                    <input
                        id="designation2"
                        name="designation2"
                        type="text"
                        value={formData.designation2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Mobile 2</label>
                    <input
                        id="mobile2"
                        name="mobile2"
                        type="text"
                        value={formData.mobile2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Email 2</label>
                    <input
                        id="email2"
                        name="email2"
                        type="text"
                        value={formData.email2}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                {/* <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Banker</label>
                    <input
                        id="banker"
                        name="banker"
                        type="text"
                        value={formData.banker}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>

                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Swift Code</label>
                    <input
                        id="swiftCode"
                        name="swiftCode"
                        type="text"
                        value={formData.swiftCode}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div >
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div> */}
            </div>
            <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
                {formData.bank_details.map((bank, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border p-4 rounded">
                        <input
                            type="text"
                            name="banker"
                            placeholder="Banker"
                            value={bank.banker}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={bank.address}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="swiftCode"
                            placeholder="Swift Code"
                            value={bank.swiftCode}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Account Number"
                            value={bank.accountNumber}
                            onChange={(e) => handleChange(e, 'bank_details', index)}
                            className="border p-2 rounded"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveBankDetail(index)}
                            className="text-red-600 text-sm mt-2"
                        >
                            Remove
                        </button>
                        {errors[`bank_details.${index}.banker`] && (
                            <p className="text-red-500 text-sm">{errors[`bank_details.${index}.banker`]}</p>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddBankDetail}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Add Bank
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-3">
                    Submit
                </button>
            </div>
        </form>
    );
};

export default KycForm;