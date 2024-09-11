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
        banker: '',
        address: '',
        swiftCode: '',
        accountNumber: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/trademgt/kyc/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        date: data.date,
                        name: data.name,
                        companyRegNo: data.companyRegNo,
                        regAddress: data.regAddress,
                        mailingAddress: data.mailingAddress,
                        telephone: data.telephone,
                        fax: data.fax,
                        person1: data.person1,
                        designation1: data.designation1,
                        mobile1: data.mobile1,
                        email1: data.email1,
                        person2: data.person2,
                        designation2: data.designation2,
                        mobile2: data.mobile2,
                        email2: data.email2,
                        banker: data.banker,
                        address: data.address,
                        swiftCode: data.swiftCode,
                        accountNumber: data.accountNumber,
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the kyc data!', error);
                });
        }
    }, [mode, id]);

    const handleChange = (e, section, index) => {
        const { name, value, files } = e.target;
        if (section) {
            const updatedSection = formData[section].map((item, i) =>
                i === index ? { ...item, [name]: files ? files[0] : value } : item
            );
            setFormData({ ...formData, [section]: updatedSection });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const [key, value] of Object.entries(formData)) {
          if (!value.trim()) {
            newErrors[key] = 'This field is required';
          }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
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
            axios.post('/trademgt/kyc/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('KYC added successfully!', response.data);
                navigate(`/kyc`);
            })
            .catch(error => {
                console.error('There was an error adding the kyc!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/trademgt/kyc/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('KYC updated successfully!', response.data);
                navigate(`/kyc`);
            })
            .catch(error => {
                console.error('There was an error updating the KYC!', error);
            });
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
                <div >
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
                </div>
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