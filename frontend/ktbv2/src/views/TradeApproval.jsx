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

  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        const response = await axios.get('/trademgt/trades'); // Replace with your API endpoint
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

  const handleFilter = (filters) => {
    console.log(filters)
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
        <FilterComponent onFilter={handleFilter} />
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
             <h2 className="text-2xl mb-4">Trade Details</h2>
             <div className="grid grid-cols-3 gap-4">
               <div><strong>Company:</strong> {selectedTrade.company}</div>
               <div><strong>TRN:</strong> {selectedTrade.trn}</div>
               <div><strong>Trade Type:</strong> {selectedTrade.trade_type}</div>
               <div><strong>Trade Category:</strong> {selectedTrade.trade_category}</div>
               <div><strong>Country of Origin:</strong> {selectedTrade.country_of_origin}</div>
               <div><strong>Customer Company Name:</strong> {selectedTrade.customer_company_name}</div>
               <div><strong>Address:</strong> {selectedTrade.address}</div>
               <div><strong>Packing:</strong> {selectedTrade.packing}</div>
               <div><strong>Cost of Packing per Each:</strong> {selectedTrade.cost_of_packing_per_each}</div>
               <div><strong>Total Packing Cost:</strong> {selectedTrade.total_packing_cost}</div>
               <div><strong>Packaging Supplier:</strong> {selectedTrade.packaging_supplier}</div>
               <div><strong>Selected Currency Rate:</strong> {selectedTrade.selected_currency_rate}</div>
               <div><strong>Currency Selection:</strong> {selectedTrade.currency_selection}</div>
               <div><strong>Exchange Rate:</strong> {selectedTrade.exchange_rate}</div>
               <div><strong>Rate in USD:</strong> {selectedTrade.rate_in_usd}</div>
               <div><strong>Commission:</strong> {selectedTrade.commission}</div>
               <div><strong>Contract Value:</strong> {selectedTrade.contract_value}</div>
               <div><strong>Payment Term:</strong> {selectedTrade.payment_term}</div>
               <div><strong>Advance Value to Receive:</strong> {selectedTrade.advance_value_to_receive}</div>
               <div><strong>Commission Rate:</strong> {selectedTrade.commission_rate}</div>
               <div><strong>Logistic Provider:</strong> {selectedTrade.logistic_provider}</div>
               <div><strong>Estimated Logistic Cost:</strong> {selectedTrade.estimated_logistic_cost}</div>
               <div><strong>Logistic Cost Tolerance:</strong> {selectedTrade.logistic_cost_tolerance}</div>
               <div><strong>Logistic Cost Remarks:</strong> {selectedTrade.logistic_cost_remarks}</div>
               <div><strong>Bank Name Address:</strong> {selectedTrade.bank_name_address}</div>
               <div><strong>Account Number:</strong> {selectedTrade.account_number}</div>
               <div><strong>SWIFT Code:</strong> {selectedTrade.swift_code}</div>
               <div><strong>Incoterm:</strong> {selectedTrade.incoterm}</div>
               <div><strong>POD:</strong> {selectedTrade.pod}</div>
               <div><strong>POL:</strong> {selectedTrade.pol}</div>
               <div><strong>ETA:</strong> {selectedTrade.eta}</div>
               <div><strong>ETD:</strong> {selectedTrade.etd}</div>
               <div><strong>Remarks:</strong> {selectedTrade.remarks}</div>
               <div><strong>Trader Name:</strong> {selectedTrade.trader_name}</div>
               <div><strong>Insurance Policy Number:</strong> {selectedTrade.insurance_policy_number}</div>
               <div><strong>BL Declaration:</strong> {selectedTrade.bl_declaration}</div>
               <div><strong>Shipper in BL:</strong> {selectedTrade.shipper_in_bl}</div>
               <div><strong>Consignee in BL:</strong> {selectedTrade.consignee_in_bl}</div>
               <div><strong>Notify Party in BL:</strong> {selectedTrade.notify_party_in_bl}</div>
               <div><strong>Markings in Packaging:</strong> {selectedTrade.markings_in_packaging}</div>
               <div><strong>Container Shipment Size:</strong> {selectedTrade.container_shipment_size}</div>
               <div><strong>BL Fee:</strong> {selectedTrade.bl_fee}</div>
               <div><strong>BL Fee Remarks:</strong> {selectedTrade.bl_fee_remarks}</div>
               <div><strong>Approved:</strong> {selectedTrade.approved ? 'Yes' : 'No'}</div>
             </div>
     
             <h3 className="text-xl mt-4">Trade Products</h3>
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
                 </tr>
               </thead>
               <tbody>
                 {selectedTrade.trade_products.map(product => (
                   <tr key={product.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_name_for_client}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm"><a href={product.loi} target="_blank" rel="noopener noreferrer">View LOI</a></td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
     
             <h3 className="text-xl mt-4">Trade Extra Costs</h3>
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
           </div>
         </div>
        )}
      </Modal>
    </>

  )
}

export default TradeApproval