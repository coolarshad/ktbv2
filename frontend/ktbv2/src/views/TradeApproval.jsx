import NavBar from "../components/NavBar"
import React, { useEffect, useState } from 'react';
import TradeTable from "../components/TradeTable"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Modal from '../components/Modal';
import FilterComponent from "../components/FilterComponent";

function TradeApproval() {
  const navigate = useNavigate();
  const [tradeData, setTradeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";


  useEffect(() => {
    const params = {
      [`approved`]: false,
    };
    const fetchTradeData = async () => {
      try {
        const response = await axios.get('/trademgt/trades',{params}); 
        setTradeData(response.data);
      } catch (error) {
        setError('Failed to fetch trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchTradeData();
  }, []);

  const handleDelete = async (tradeId) => {
    const confirmed = window.confirm('Are you sure you want to delete this trade?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/trades/${tradeId}/`);
        setTradeData(tradeData.filter(trade => trade.id !== tradeId));
        alert('Trade deleted successfully.');
      } catch (error) {
        console.error('Error deleting trade:', error);
        alert('Failed to delete trade.');
      }
    }
  };

  const handleAddTradeClick = () => {
    navigate('/trade-form');
  };

  const handleViewClick = async (tradeId) => {
    try {
      const response = await axios.get(`/trademgt/trades/${tradeId}/`);
      setSelectedTrade(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };

  const handleRowClick = async (tradeId) => {
    // try {
    //   const response = await axios.get(`/trademgt/trades/${tradeId}/`);
    //   setSelectedTrade(response.data);
    //   setIsModalOpen(true);
    // } catch (error) {
    //   console.error('Error fetching trade details:', error);
    // }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrade(null);
  };

  const approveTrade = async () => {
    try {
      const response = await axios.get(`/trademgt/tradeapprove/${selectedTrade.id}/`);
     
      setIsModalOpen(false);
      setSelectedTrade(null);

    } catch (error) {
      console.error('Error approving trade:', error);
      // Optionally, handle the error (e.g., show a user-friendly error message)
    }
  };

  const handleFilter = (filters) => {
    setTradeData(filters)
  };
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Trade Approvals</p>
        <button
          onClick={handleAddTradeClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent flag={1} onFilter={handleFilter} apiEndpoint={'/trademgt/trades/'} fieldOptions={[
        { value: 'trn', label: 'TRN' },
        { value: 'company', label: 'Company' },
      ]} extraParams={{approved:false}}/>
        </div>
        <div className=" rounded py-2">
        <TradeTable data={tradeData} onDelete={handleDelete} onView={handleViewClick} onRowClick={handleRowClick} />
        </div>
      </div>
      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} trade={selectedTrade} /> */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedTrade && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Trade Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Company </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.companyName.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">TRN </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trn}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trade_type}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Category </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trade_category}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Country of Origin </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.country_of_origin}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Customer Company Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.customer.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Address </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.address}</td>
                  </tr>
                  
                
                 
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Currency Selection </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.currency.name}</td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Exchange Rate </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.exchange_rate}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Agent</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.commission_agent}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Contract Value</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.contract_value}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Payment Term</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.paymentTerm.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance Value to Receive</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.advance_value_to_receive}</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Commission Value</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.commission_value}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Provider</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.logistic_provider}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Estimated Logistic Cost</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.estimated_logistic_cost}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost Tolerance</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.logistic_cost_tolerence}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Logistic Cost Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.logistic_cost_remarks}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Bank Name Address</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.bank.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Account Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.account_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">SWIFT Code</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.swift_code}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Incoterm</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.incoterm}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">POD</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.pod}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">POL</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.pol}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETA</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.eta}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETD</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.etd}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.remarks}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trader_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.insurance_policy_number}</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Shipper in BL</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.shipper_in_bl}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Consignee in BL</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.consignee_in_bl}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Notify Party in BL</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.notify_party_in_bl}</td>
                  </tr>
                 
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Container Shipment Size</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.shipmentSize.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Fee</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.bl_fee}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">BL Fee Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.bl_fee_remarks}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approved</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.approved ? 'Yes' : 'No'}</td>
                  </tr>
                </tbody>
                </table>
             </div>
             
     
             <h3 className="text-lg mt-4 text-center">Trade Products</h3>
             <table className="min-w-full bg-white">
               <thead>
                 <tr>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name for Client</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LOI</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Balance Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Balance Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Selected Currency Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate in USD</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Value</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Mode of Packing</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Rate of Each packing</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Qty of packing</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Packing Cost</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packaging Supplier</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Markings in Packaging</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Commission Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Commission</th>
                 </tr>
               </thead>
               <tbody>
                 {selectedTrade.trade_products.map(product => (
                   <tr key={product.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.productName.name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_name_for_client}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm"><a href={`${BACKEND_URL}${product.loi}`} target="_blank" rel="noopener noreferrer">View</a></td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.selected_currency_rate}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.rate_in_usd}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_value}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.packing.name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.rate_of_each_packing}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.qty_of_packing}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_packing_cost}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.supplier.name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.markings_in_packaging}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.commission_rate}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_commission}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
     
             <h3 className="text-lg mt-4 text-center">Trade Extra Costs</h3>
             <table className="min-w-full bg-white">
               <thead>
                 <tr>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Extra Cost</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Extra Cost Remarks</th>
                 </tr>
               </thead>
               <tbody>
                 {selectedTrade.trade_extra_costs.map(cost => (
                   <tr key={cost.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{cost.extra_cost}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{cost.extra_cost_remarks}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {selectedTrade.approved ? '' : 
             <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
             <button onClick={approveTrade} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
             </div>
             }
           </div>
         </div>
        )}
      </Modal>
    </>

  )
}

export default TradeApproval