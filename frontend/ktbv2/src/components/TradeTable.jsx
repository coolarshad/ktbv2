// src/components/TradeTable.js
import React,{useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import PrintModal from './PrintModal';
import ReactToPrint from 'react-to-print';
import axios from '../axiosConfig';

const TradeTable = ({ data, onDelete, onView, onRowClick }) => {
  const navigate = useNavigate();  

  const componentRef = useRef();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const handleEdit = (tradeId) => {
    navigate(`/trade-form/${tradeId}`);  // Navigate to TradeForm with tradeId
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedTrade(null);
  };

  const handlePrintClick = async (tradeId) => {
    try {
      const response = await axios.get(`/trademgt/trades/${tradeId}/`);
      // Set the fetched trade data to state
      setSelectedTrade(response.data);
      // Open the modal after everything is set
      setIsPrintModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };


  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Company</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller Name</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Ref Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Value</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((trade, index) => (
            <tr key={index} onClick={() => onRowClick(trade.id)}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trade_type}</td>
              
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.companyName.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.customer.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.trd}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.contract_value}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.productCode}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={trade.approved} onChange={() => {}} />
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <div className="space-x-2">
                {trade.reviewed?<button className="bg-green-500 text-white px-2 py-1 rounded" onClick={()=>handlePrintClick(trade.id)}>Print</button>:''}
                <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={(e) => { e.stopPropagation(); onView(trade.id); }}
                  >
                    View
                  </button>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(trade.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(trade.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      <PrintModal isOpen={isPrintModalOpen} onClose={closePrintModal}>
        {selectedTrade && (

          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-3/4 h-5/6 p-4 overflow-auto">
              <button onClick={closePrintModal} className="float-right text-red-500">Close</button>
              <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />
              <div className="p-4 max-w-6xl mx-auto" ref={componentRef}>

               
              

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
                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">POL</td>
                            <td className="py-2 px-4 text-gray-800">{selectedTrade.pol}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">POD</td>
                            <td className="py-2 px-4 text-gray-800">{selectedTrade.pod}</td>
                          </tr>


                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETD</td>
                            <td className="py-2 px-4 text-gray-800">{selectedTrade.etd}</td>
                          </tr>
                          <tr className="border-b border-gray-200">
                            <td className="py-2 px-4 text-gray-600 font-medium capitalize">ETA</td>
                            <td className="py-2 px-4 text-gray-800">{selectedTrade.eta}</td>
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
                        <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approved 1</td>
                        <td className="py-2 px-4 text-gray-800">{selectedTrade.approved ? 'Yes' : 'No'}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approved 2</td>
                        <td className="py-2 px-4 text-gray-800">{selectedTrade.reviewed ? 'Yes' : 'No'}</td>
                      </tr>
                    </tbody>
                  </table>
                    </div>


                <h3 className="text-lg mt-4 text-center">Trade Products</h3>
                <div className="overflow-x-auto">
                  {selectedTrade.trade_products.map((product, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-4 p-4 border border-gray-200 rounded-md shadow-sm bg-white">
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Product Code Ref:</span>
                        <span>{product.product_code_ref}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Product Code:</span>
                        <span>{product.product_code}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Product Name:</span>
                        <span>{product.productName.name}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Product Name for Client:</span>
                        <span>{product.product_name_for_client || '-'}</span>
                      </div>
                      {/* <div className="flex flex-col">
                        <span className="font-medium">LOI:</span>
                        <span>{product.loi || '-'}</span>
                      </div> */}
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">HS Code:</span>
                        <span>{product.hs_code}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Total Contract Qty:</span>
                        <span>{product.total_contract_qty}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Total Contract Qty Unit:</span>
                        <span>{product.total_contract_qty_unit}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Tolerance(%):</span>
                        <span>{product.tolerance}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Contract Balance Qty:</span>
                        <span>{product.contract_balance_qty}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Contract Balance Qty Unit:</span>
                        <span>{product.contract_balance_qty_unit}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Trade Qty:</span>
                        <span>{product.trade_qty}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Trade Qty Unit:</span>
                        <span>{product.trade_qty_unit}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Selected Currency Rate:</span>
                        <span>{product.selected_currency_rate}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Rate in USD:</span>
                        <span>{product.rate_in_usd}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Product Value:</span>
                        <span>{product.product_value}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Mode of Packing:</span>
                        <span>{product.packing.name}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Rate of Each Packing:</span>
                        <span>{product.rate_of_each_packing}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Qty of Packing:</span>
                        <span>{product.qty_of_packing}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Total Packing Cost:</span>
                        <span>{product.total_packing_cost}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Packaging Supplier:</span>
                        <span>{product.supplier.name}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Markings in Packaging:</span>
                        <span>{product.markings_in_packaging}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Commission Rate:</span>
                        <span>{product.commission_rate}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Total Commission:</span>
                        <span>{product.total_commission}</span>
                      </div>
                      <div className="flex flex-col border-b border-gray-200">
                        <span className="font-medium">Reference Type:</span>
                        <span>{product.ref_type}</span>
                      </div>
                      <div className="flex flex-col ">
                        <span className="font-medium">Reference TRN:</span>
                        <span>{product.refTrn}</span>
                      </div>
                    </div>
                  ))}
                </div>


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
                   
                  


              </div>
            </div>
          </div>)}

      </PrintModal>
    </>
  );
};

export default TradeTable;
