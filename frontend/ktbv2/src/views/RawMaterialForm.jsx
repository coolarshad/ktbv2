import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

const RawMaterialForm = ({ mode = 'add' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
       
        name: '',
        cost_per_liter: '',
        buy_price_pmt: '',
        add_cost: '',
        total: '',
        ml_to_kl: '',
        density: '',
        remarks: '',
    });

    useEffect(() => {
        if (mode === 'update' && id) {
            axios.get(`/costmgt/raw-materials/${id}`)
                .then(response => {
                    const data = response.data;
                    setFormData(prevState => ({
                        ...prevState,
                        name: data.name,
                        cost_per_liter:data.cost_per_liter,
                        buy_price_pmt: data.buy_price_pmt,
                        add_cost: data.add_cost,
                        total: data.total,
                        ml_to_kl: data.ml_to_kl,
                        density: data.density,
                        remarks: data.remarks,
                    }));
                })
                .catch(error => {
                    console.error('There was an error fetching the raw material data!', error);
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
            axios.post('/costmgt/raw-materials/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Raw Material added successfully!', response.data);
                navigate(`/raw-materials`);
            })
            .catch(error => {
                console.error('There was an error adding the Raw Material!', error);
            });
        } else if (mode === 'update') {
            axios.put(`/costmgt/raw-materials/${id}/`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('Raw Material updated successfully!', response.data);
                navigate(`/raw-materials`);
            })
            .catch(error => {
                console.error('There was an error updating the Raw Material!', error);
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
                <div>
                    <label htmlFor="cost_per_liter" className="block text-sm font-medium text-gray-700">Cost Per Litre</label>
                    <input
                        id="cost_per_liter"
                        name="cost_per_liter"
                        type="text"
                        value={formData.cost_per_liter}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="buy_price_pmt" className="block text-sm font-medium text-gray-700">Buy Price</label>
                    <input
                        id="buy_price_pmt"
                        name="buy_price_pmt"
                        type="text"
                        value={formData.buy_price_pmt}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="add_cost" className="block text-sm font-medium text-gray-700">Add. Cost</label>
                    <input
                        id="add_cost"
                        name="add_cost"
                        type="text"
                        value={formData.add_cost}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                        id="total"
                        name="total"
                        type="text"
                        value={formData.total}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="ml_to_kl" className="block text-sm font-medium text-gray-700">Ml to KG</label>
                    <input
                        id="ml_to_kl"
                        name="ml_to_kl"
                        type="text"
                        value={formData.ml_to_kl}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full col-span-1"
                    />
                </div>
                <div>
                    <label htmlFor="density" className="block text-sm font-medium text-gray-700">Density</label>
                    <input
                        id="density"
                        name="density"
                        type="text"
                        value={formData.density}
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

export default RawMaterialForm;