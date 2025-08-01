import NavBar from "../components/NavBar"
import SPTable from "../components/SPTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import React, { useEffect, useState, useRef } from 'react';
import FilterComponent from "../components/FilterComponent";
import Modal from '../components/Modal';
import ReactToPrint from 'react-to-print';
import { BASE_URL } from '../utils'; 
import { dateFormatter, calculatePFCommissionValue } from "../dateUtils";

function SalesPurchases() {
  const componentRef = useRef();
  const navigate = useNavigate();
  const [spData, setSPData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSP, setSP] = useState(null);

  const BACKEND_URL = BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/trademgt/sales-purchases'); // Replace with your API endpoint
        setSPData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this Sale/Purchase?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/sales-purchases/${id}/`);
        setSPData(spData.filter(data => data.id !== id));
        alert('Sales/Purchase deleted successfully.');
      } catch (error) {
        console.error('Error deleting Sales/Purchase:', error);
        alert('Failed to delete Sales/Purchase.');
      }
    }
  };

  const handleAddSPClick = () => {
    navigate('/sales-purchase-form');
  };

  const handleFilter = (filters) => {
    setSPData(filters)
  };

  const handleViewClick = async (tradeId) => {
    try {
      const response = await axios.get(`/trademgt/sales-purchases/${tradeId}/`);
      setSP(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSP(null);
  };

  const getSPData = (data, product_code, product_name) => {
    return data.find(
        item => item.product_name === product_name && item.product_code === product_code
    ) || '';
};

  const approveSP = async () => {
    try {
      await axios.get(`/trademgt/sales-purchases-approve/${selectedSP.id}/`);
      setIsModalOpen(false);
      setSP(null);
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving Sales/Purchase:', error);
      // Optionally, handle the error (e.g., show a user-friendly error message)
    }
  };

  const fieldOptions = [
    { value: 'trn__trn', label: 'TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'trn__company', label: 'Company' },
    { value: 'trn__trade_type', label: 'Trade Type' },
    { value: 'invoice_number', label: 'Invoice Number' },
    { value: 'bl_number', label: 'BL Number' },
    { value: 'bl_date', label: 'BL Date' },
    { value: 'invoice_date', label: 'Invoice Date' },
    { value: 'packaging_supplier', label: 'Packaging Supplier' },
    { value: 'logistic_provider', label: 'Logistic Supplier' },
    { value: 'batch_number', label: 'Batch Number' },
    { value: 'production_date', label: 'Production Date' },
    { value: 'remarks', label: 'Remarks' },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;






  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales and Purchase Details</p>
        <button
          onClick={handleAddSPClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
          <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/sales-purchases'}
            fieldOptions={fieldOptions} downloadUrl="/excel/export/sp/" 
          />
        </div>
        <div className=" rounded p-2">
          <SPTable data={spData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedSP && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
            <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />
              <div className="p-3 max-w-8xl mx-auto" ref={componentRef}>

              <h2 className="text-2xl mb-2 text-center">Sales/Purchase Details</h2>
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
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">TRN </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.trn}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">ID </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.id}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.trade_type}</td>
                    </tr>

                    {/* <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Markings </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.markings_in_packaging}</td>
                    </tr> */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Buyer/Seller </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.prepayment.kyc.name}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Date </td>
                      <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedSP.invoice_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Number </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_number}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Invoice Amount </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.invoice_amount}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Details </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.prepayment.lc_number}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Agent </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.commission_agent}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Value</td>
                      <td className="py-2 px-4 text-gray-800">{calculatePFCommissionValue(selectedSP)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Number </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.bl_number}</td>
                    </tr>
                    {/* <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Quantity </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.bl_qty}</td>
                    </tr> */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Fees</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.bl_fees}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Collection Cost</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.bl_collection_cost}</td>
                    </tr>

                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Date</td>
                      <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedSP.bl_date)}</td>
                    </tr>
                    {/* <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Total Packing Cost </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.total_packing_cost}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Packaging Supplier</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.packaging_supplier}</td>
                    </tr> */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Provider</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.logistic_provider}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.logistic_cost}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost Due Date</td>
                      <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedSP.logistic_cost_due_date)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Liner </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.liner}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">POD</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.pod}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">POL </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.pol}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETD</td>
                      <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedSP.etd)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETA</td>
                      <td className="py-2 px-4 text-gray-800">{dateFormatter(selectedSP.eta)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.trader_name}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurrance Policy Number</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.trn.insurance_policy_number}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Status of Shipment</td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.shipment_status}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks </td>
                      <td className="py-2 px-4 text-gray-800">{selectedSP.remarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>


              <h3 className="text-lg mt-4 text-center">Products</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
                    {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th> */}
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Qty</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">BL Qty Unit</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Batch Number</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Production Date</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Value</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Marking</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Packing Cost</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packaging Supplier</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Logistic</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {selectedSP.sp_product.map(product => (
                    <tr key={product.id}>
                       <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.productName.name}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                      {/* <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td> */}
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.bl_qty}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.batch_number}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.production_date}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.bl_value.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{getSPData(selectedSP.trn.trade_products,product.product_code,product.product_name).markings_in_packaging}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{getSPData(selectedSP.trn.trade_products,product.product_code,product.product_name).total_packing_cost}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{getSPData(selectedSP.trn.trade_products,product.product_code,product.product_name).supplier.name}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.logistic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg mt-4 text-center">Other Charges</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Name</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSP.extraCharges.map((cost, index) =>
                    cost.name &&  ( // Check if both fields exist
                      <tr key={index}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{cost.name}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm">{cost.charge}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {/* Packing Lists Table */}
              <h3 className="text-lg mt-4 text-center">Documents List</h3>
              {selectedSP.packingLists &&
                    selectedSP.packingLists.map((item, index) =>
                      item.name !== '' ? (
                        <div key={index}>
                          <p className="text-sm">
                            {index + 1}. <a className="text-blue-800 border px-2 hover:underline" href={`${BACKEND_URL}${item.packing_list}`} target="_blank"
                              rel="noopener noreferrer">{item.name}</a>
                          </p>
                        </div>
                      ) : null
                    )}

              {selectedSP.reviewed ? '' :
                    <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
                      <button onClick={approveSP} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
                    </div>
                  }
            </div>
          </div>
          </div>
        )}
      </Modal>
    </>

  )
}

export default SalesPurchases