import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import Modal from '../components/Modal';
import FinalProductTable from '../components/FinalProductTable';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

const FinalProduct = () => {
    const navigate = useNavigate();
    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/costmgt/final-product/');
                setProductData(response.data);
            } catch (error) {
                setError('Failed to fetch final products data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddProductClick = () => {
        navigate('/final-product-form');
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this final-products?');
        if (confirmed) {
            try {
                await axios.delete(`/costmgt/final-product/${id}/`);
                setProductData(productData.filter(data => data.id !== id));
                alert('Final Products deleted successfully.');
            } catch (error) {
                console.error('Error deleting Final Products:', error);
                alert('Failed to delete Final Products.');
            }
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await axios.get(`/costmgt/final-product/${id}/`);
            setSelectedProduct(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching final products details:', error);
        }
    };

    const approveFinalProduct = async (id) => {
        try {
            await axios.get(`/costmgt/final-product-approve/${selectedProduct.id}/`);
            setIsModalOpen(false);
            setProductData(null);
            // Reload the page
            window.location.reload();
        } catch (error) {
            console.error('Error approving final product cost:', error);
            // Optionally, handle the error (e.g., show a user-friendly error message)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setProductData(null);
    };


    const handleFilter = (filters) => {
        setProductData(filters)
    };

    const fieldOptions = [
        { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter

    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <div className="w-full h-full rounded bg-slate-200  p-3	">
                <p className="text-xl">Final Product Cost</p>
                <button
                    onClick={handleAddProductClick}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    +
                </button>
                <div>
                    {/* <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/final-product'} fieldOptions={fieldOptions} /> */}
                    <CostMgtFilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/costmgt/final-product'} fieldOptions={fieldOptions} />

                </div>
                <div className=" rounded p-2">
                    <FinalProductTable data={productData} onDelete={handleDelete} onView={handleViewClick} />
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedProduct && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                        <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
                            <button onClick={closeModal} className="float-right text-red-500">Close</button>
                            <h2 className="text-2xl mb-2 text-center">Final Product Cost Details</h2>
                            <hr className='mb-2' />
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
                                    <thead className="bg-gray-100 border-b border-gray-200">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-gray-700 font-semibold">Field</th>
                                            <th className="py-2 px-4 text-left text-gray-700 font-semibold">Value</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.date}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Formula Name</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct?.formula_detail.formula_name}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Consumption Name</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct?.formula_detail?.consumption?.formula?.name}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Consumption Qty</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.consumption_qty}</td>
                                        </tr>

                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Batch Number</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct?.batch_detail?.batch}</td>
                                        </tr>

                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Packing Size</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.packing_size_detail?.label}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Bottles Per Pack</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.bottles_per_pack}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Liters Per Pack</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.litres_per_pack}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total Qty</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.total_qty}</td>
                                        </tr>

                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Qty in Litres</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.qty_in_litres}</td>
                                        </tr>

                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Per Litre Cost</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.per_litre_cost}</td>
                                        </tr>

                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total CFR Pricing</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.total_cfr_pricing}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.remarks}</td>
                                        </tr>


                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve</td>
                                            <td className="py-2 px-4 text-gray-800">{selectedProduct.approved ? "Yes" : "No"}</td>
                                        </tr>

                                    </tbody>
                                </table>

                                <h3 className="text-lg mt-4 text-center">Packing Items</h3>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Type</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing Selection</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProduct.packing_items?.map((item, index) =>
                                            item && ( // Check if both fields exist
                                                <tr key={index}>

                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.packing_type}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.packing}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.selected_packing}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.qty}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.rate}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.value}</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>


                                <h3 className="text-lg mt-4 text-center">Additional Cost</h3>
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate</th>
                                            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProduct.additional_costs?.map((item, index) =>
                                            item && ( // Check if both fields exist
                                                <tr key={index}>

                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item?.name}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.rate}</td>
                                                    <td className="py-2 px-4 border-b border-gray-200 text-sm">{item.value}</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>


                                {selectedProduct.approved ? '' :
                                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                                        <button onClick={approveFinalProduct} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
                                    </div>
                                }
                            </div>

                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default FinalProduct;
