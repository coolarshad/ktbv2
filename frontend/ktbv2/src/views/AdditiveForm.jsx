import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const AdditiveForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: '',
        name: '',
        crfPrice: '',
        addCost: '',
        costPriceInLiter: '',
        density:'',
        totalCost:'',
        remarks:'',
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/costmgt/additives/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        date: data.date,
                        name: data.name,
                        crfPrice: data.crfPrice,
                        addCost: data.addCost,
                        costPriceInLiter: data.costPriceInLiter,
                        density: data.density,
                        totalCost: data.totalCost,
                        remarks: data.remarks,
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the additive data!', error);
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

    const handleSubmit = (e) => {
        e.preventDefault();
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
            axios.post('/costmgt/additives/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Additives added successfully!', response.data);
                navigate(`/additives`);
            })
            .catch(error => {
                console.error('There was an error adding the additive!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/costmgt/additives/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Additives updated successfully!', response.data);
                navigate(`/additives`);
            })
            .catch(error => {
                console.error('There was an error updating the Additive!', error);
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                
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
                <div >
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="crfPrice" className="block text-sm font-medium text-gray-700">CFR Price/KG in USD</label>
                    <input
                        id="crfPrice"
                        name="crfPrice"
                        type="number"
                        value={formData.crfPrice}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="addCost" className="block text-sm font-medium text-gray-700">Add Cost</label>
                    <input
                        id="addCost"
                        name="addCost"
                        type="number"
                        value={formData.addCost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="costPriceInLiter" className="block text-sm font-medium text-gray-700">Total cost EX DK in Kgs</label>
                    <input
                        id="costPriceInLiter"
                        name="costPriceInLiter"
                        type="number"
                        value={formData.costPriceInLiter}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="density" className="block text-sm font-medium text-gray-700">Density @ 15 Degree Celsius</label>
                    <input
                        id="density"
                        name="density"
                        type="number"
                        value={formData.density}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">Cost Price in Liters</label>
                    <input
                        id="totalCost"
                        name="totalCost"
                        type="number"
                        value={formData.totalCost}
                        onChange={handleChange}
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

export default AdditiveForm;