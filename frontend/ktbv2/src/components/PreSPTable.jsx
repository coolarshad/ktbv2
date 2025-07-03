// src/components/TradeTable.js
import React,{useState,useRef,useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseInvoice from "../views/PurchaseInvoice";
import ReactToPrint from 'react-to-print';
import { useReactToPrint } from 'react-to-print';
import Modal from './Modal';
import PrintModal from './PrintModal';
import axios from '../axiosConfig';
import { toWords } from 'number-to-words';
import { today, addDaysToDate } from '../dateUtils';
import { BASE_URL } from '../utils';

const PreSPTable = ({ data, onDelete }) => {
  const navigate = useNavigate();  
  const componentRef = useRef();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [selectedPresp, setSelectedPresp] = useState(null);
  const [totalTradeQuantity, setTotalTradeQuantity] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  // const [textAmount, setTextAmount] = useState(0);

  const BACKEND_URL = BASE_URL || "http://localhost:8000";


  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrade(null);
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedTrade(null);
  };

  const handlePrintClick = async (presp) => {
    setSelectedPresp(presp)
    try {
      const response = await axios.get(`/trademgt/print/${presp.trn}/`);
      
      // Set the fetched trade data to state
      setSelectedTrade(response.data);
  
      // Calculate sums directly from the fetched data
      const totalQuantity = response.data.tradeProducts?.reduce((sum, product) => sum + Number(product.trade_qty), 0);
      const totalAmountSum = response.data.tradeProducts?.reduce((sum, product) => sum + Number(parseFloat(product.selected_currency_rate*product.trade_qty).toFixed(2)), 0);
  
      // Update state with the calculated sums
      setTotalTradeQuantity(totalQuantity);
      setTotalAmount(totalAmountSum?totalAmountSum:1000);
  
      // Open the modal after everything is set
      setIsPrintModalOpen(true);
    } catch (error) {
      console.error('Error fetching trade details:', error);
    }
  };

  const reviewTrade = async () => {
    try {
      await axios.get(`/trademgt/pre-sales-purchases-approve/${selectedPresp.id}/`);
     
      setIsModalOpen(false);
      setSelectedPresp(null);
      window.location.reload();
    } catch (error) {
      console.error('Error approving pre sales/purchase:', error);
      // Optionally, handle the error (e.g., show a user-friendly error message)
    }
  };

  const handleViewClick = async (presp) => {
    setSelectedPresp(presp)
    try {
      const response = await axios.get(`/trademgt/print/${presp.trn}/`);
      
      // Set the fetched trade data to state
      setSelectedTrade(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching Pre Sale/Purchase details:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/pre-sale-purchase-form/${id}`);  // Navigate to TradeForm with tradeId
  };

 const sortedData = useMemo(() => {
     return [...(data || [])].sort((a, b) => b.id - a.id);
   }, [data]);

  return (
    <>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Doc Issuance Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Type</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Buyer/Seller</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Term</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Due Date</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th> */}
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Approved</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((presp, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.doc_issuance_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.trade.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.trade.trade_type}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.trade.customer.name}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.trade.paymentTerm.name}</td>
             
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.lc_due_date}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.remarks}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.productCode}</td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={presp.approved} onChange={() => {}} />
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
              <div className="space-x-2">
                {presp.approved && (
                    <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={()=>handlePrintClick(presp)}>Print</button>
                )}
                 
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={()=>handleViewClick(presp)}>View</button>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(presp.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(presp.id)}>Delete</button>
                </div>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>

      <PrintModal isOpen={isPrintModalOpen} onClose={closePrintModal}>
        {selectedTrade && (
          <div>
            {selectedTrade.trade_type === 'Purchase' ? (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white w-3/4 h-5/6 p-4 overflow-auto">
                  <button onClick={closePrintModal} className="float-right text-red-500">Close</button>
                  <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />

                  <div className="p-4 max-w-6xl mx-auto" ref={componentRef}>

                    {/* Header Section */}
                    <div className="text-center pb-3">
                      <h1 className="text-xl font-bold">PURCHASE ORDER</h1>
                    </div>

                    {/* First Div with 2 Columns */}
                    <div className="grid grid-cols-2 gap-0">
                      {/* Col 1 with 3 Rows */}
                      <div className="flex flex-col  border-l border-t border-r  border-black">
                        <div className="border-b border-black px-2 py-2">
                          <p className='font-light text-sm'>Invoice To</p>
                          <p className='font-bold text-sm uppercase'>{selectedTrade.company.name}</p>
                          <p className='text-sm uppercase'>
                            {selectedTrade.company.address}
                          </p>
                          <p className='mt-1'>
                            Cmp Regn No. : <span className='font-bold'>{selectedTrade.company.registration_number}</span>
                          </p>
                        </div>
                        <div className=" border-black px-2 py-3">
                          <p className=' pb-2'>Supplier</p>
                          <p className='uppercase'>{selectedTrade.customer_company_name.name}</p>
                          <p className='uppercase'>{selectedTrade.customer_company_name.regAddress}</p>
                          <p className='uppercase'>{selectedTrade.customer_company_name.companyRegNo}</p>
                        </div>

                      </div>

                      {/* Col 2 with 2 Nested Columns (Col 3 and Col 4) */}
                      <div className="grid grid-cols-2 gap-0 border-t border-r border-black">
                        {/* Col 3 with 6 Rows */}
                        <div className="flex flex-col justify-between border-r border-black">
                          <div className="border-b border-black p-2 ">
                            <p className='font-bold text-sm '>TRADE REFERENCE NO.</p>
                            <p className='uppercase'>{selectedTrade.trn}</p>
                          </div>
                          <div className="border-b border-black p-2 ">
                            <p className='font-bold text-sm'>Country of Origin</p>
                            <p className='text-sm uppercase'>{selectedTrade.country_of_origin}</p>
                          </div>
                          <div className="border-b border-black p-2">
                            <p className='font-bold text-sm'>INCOTERM</p>
                            <p className='text-sm uppercase'>{selectedTrade.incoterm}</p>
                          </div>
                         
                          {/* <div className="border-b border-black p-2">
                            <p className='font-bold text-sm'>CONTAINER SIZE</p>
                            <p className='text-sm uppercase'>{selectedTrade.shipmentSize.name}</p>
                          </div> */}
                          <div className="p-2">
                            <p className='font-bold text-sm'>
                              ESTIMATED TIME OF DEPARTURE
                            </p>
                            <p className='text-sm uppercase'>{selectedTrade.etd}</p>
                          </div>
                        </div>

                        {/* Col 4 with 5 Rows */}
                        <div className="flex flex-col ">
                          <div className="border-b border-black p-2">
                            <p className='font-bold text-sm'>Dated</p>
                            <p className='text-sm uppercase'>{selectedTrade.approval_date}</p>

                          </div>
                          <div className="border-b border-black p-2">
                            <p className='font-bold text-sm'>Terms of Payment</p>
                            <p className='text-sm uppercase'>{selectedTrade.paymentTerm.name}</p>
                          </div>
                          <div className="border-b border-black p-2">
                              <p className='font-bold text-sm'>ADVANCE/LC DUE DATE</p>
                              <p className='uppercase'>{selectedTrade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPresp.doc_issuance_date,selectedTrade.paymentTerm.advance_within)}</p>
                            </div>
                          <div className="border-b border-black p-2">
                            <p className='font-bold text-sm'>Port of Loading</p>
                            <p className='text-sm uppercase'>{selectedTrade.pol}</p>
                          </div>
                          <div className="p-2">
                            <p className='font-bold text-sm'>Port of Discharge</p>
                            <p className='text-sm uppercase'>{selectedTrade.pod}</p>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="">
                      <table className="table-auto w-full border-collapse border border-black">
                        <thead>
                          <tr>
                            <th className="border border-black p-2 text-sm">SN</th>
                            <th className="border border-black p-2 text-sm">Description of Goods</th>
                            <th className="border border-black p-2 text-sm">HS Code</th>
                            <th className="border border-black p-2 text-sm">Trade Quantity</th>
                            <th className="border border-black p-2 text-sm">Unit</th>
                            <th className="border border-black p-2 text-sm">Rate</th>
                            <th className="border border-black p-2 text-sm">Currency</th>
                            <th className="border border-black p-2 text-sm">Tolerance</th>
                            <th className="border border-black p-2 text-sm">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTrade.tradeProducts.map((product, index) => (
                            <tr key={index}>
                               <td className="border-l border-r border-black p-1 text-sm">{index + 1}</td>
                                <td className="border-l border-r border-black p-1 font-bold text-sm">
                                  {product.product_name_for_client && product.product_name_for_client.toLowerCase() !== "na" ? product.product_name_for_client : product.productName.name}
                                </td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.hs_code}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.trade_qty}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center ">{product.trade_qty_unit}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.selected_currency_rate.toFixed(2)}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{selectedTrade.currency.name}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.tolerance}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-right">{parseFloat(product.selected_currency_rate*product.trade_qty).toFixed(2)}</td>
                            </tr>
                          ))}
                          {Array.from({ length: 12 - selectedTrade.tradeProducts.length }, (_, index) => (
                            <tr key={index}>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                              <td className="border-l border-r border-black p-2"></td>
                            </tr>
                          ))}
                          <tr>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2 text-sm text-center">Total</td>
                            <td className="border border-black p-2 text-sm text-center">{totalTradeQuantity}</td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2"></td>
                            <td className="border border-black p-2 text-right text-sm">{totalAmount.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Final Div with 2 Rows */}
                    <div className="flex flex-col gap-4 border-l border-r border-b border-black">
                      {/* Row 1 */}
                      <div className=" p-2">
                        <p className='text-sm'>Amount Chargeable (in words)</p>
                        <p className='font-bold mb-1 text-sm uppercase'>{selectedTrade.currency.name} {toWords(totalAmount)} Only</p>
                        <p className='text-sm'>DOCUMENTS REQUIRED AGAINST SHIPMENT</p>
                        {selectedPresp.documentRequired && selectedPresp.documentRequired.length > 0 ? (
                          selectedPresp.documentRequired.map((product, index) => (
                            <div key={index}>
                              <p className='text-sm'>{index + 1}. {product.doc.name}</p> {/* Replace 'someField1' with the actual field name */}

                            </div>
                          ))
                        ) : (
                          <p>No Document data available.</p>
                        )}
                        <p className='mt-1 underline text-sm'>Declaration</p>
                        <p className="text-sm font-md">We declare that this purchase order shows the actual price of the goods described and that all particulars are true and correct.The tolerance quantity to be provided shall be on buyer's option.</p>
                      </div>
                      { }
                      {/* <div className="grid grid-cols-2">
                        <div className=" p-2">
                          <p className='mb-8 font-bold text-sm'>Acknowledged By</p>
                          <p className='font-bold text-sm'>Authorized Signatory with Seal</p>
                        </div>
                        <div className="border-t border-l border-black p-2">
                          <p className='mb-8 font-bold text-sm'>for KISMAT PETROLEUM TRADING PTE LTD</p>
                          <p className='text-right text-sm'>Authorised Signatory</p>
                        </div>
                      </div> */}
                      <div className="grid grid-cols-2">
                        <div className="p-2">
                          <p className='mb-8 font-bold text-sm'>Acknowledged By</p>
                          {/* <img src={`${BACKEND_URL}${selectedTrade.company.seal_image}`} alt="Seal" className="w-16 h-16 mx-auto" /> */}
                          <div className="w-16 h-16 mx-auto"></div>
                          <p className='font-bold text-sm'>Authorized Signatory with Seal</p>
                        </div>
                        <div className="border-t border-l border-black p-2">
                          <p className='mb-8 font-bold text-sm'>for {selectedTrade.company.name}</p>
                          <div className="w-16 h-16 mx-auto"></div>
                          {/* <img src={`${BACKEND_URL}${selectedTrade.company.signature_image}`} alt="Signature" className="w-16 h-16 mx-auto" /> */}
                          <p className='text-right text-sm'>Authorized Signatory</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center pb-2 mt-1">
                      <h1 className="text-sm font-md text-sm">This is a computer generated invoice</h1>
                    </div>
                  </div>
                </div>
              </div>
      ):(
              <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white w-3/4 h-5/6 p-4 overflow-auto">
                  <button onClick={closePrintModal} className="float-right text-red-500">Close</button>
                  <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />

                    <div className="py-3 px-4 max-w-6xl mx-auto" ref={componentRef}>

                      {/* Header Section */}
                      <div className="text-center pb-2">
                        <h1 className="text-xl font-bold">PROFORMA INVOICE</h1>
                      </div>

                      {/* First Div with 2 Columns */}
                      <div className="grid grid-cols-2 gap-0">
                        {/* Col 1 with 3 Rows */}
                        <div className="flex flex-col  content-startjustify-between border-l border-t border-r  border-black">
                          <div className="border-b border-black px-2 py-3">
                            <p className='font-bold uppercase'>{selectedTrade.company.name}</p>
                            <p className='uppercase'>
                            {selectedTrade.company.address}
                            </p>
                            <p>
                              Cmp Regn No. : <span className='font-bold uppercase'>201726590K</span>
                            </p>
                          </div>
                          <div className="border-b border-black px-2 py-3">
                            <p className=' pb-2'>Buyer</p>
                            <p className='uppercase'>{selectedTrade.customer_company_name.name}</p>
                            <p className='uppercase'>{selectedTrade.customer_company_name.regAddress}</p>
                            <p className='uppercase'>{selectedTrade.customer_company_name.companyRegNo}</p>
                          </div>
                          <div className="px-2 py-2">
                            <p className=' pb-2'>OUR BANK DETAILS</p>
                            <p className='uppercase'>{selectedTrade.bank_name_address.name}</p>
                            <p className='uppercase'>{selectedTrade.bank_name_address.account_number}</p>
                            <p className='uppercase'>{selectedTrade.bank_name_address.swift_code}</p>
                          </div>
                        </div>

                        {/* Col 2 with 2 Nested Columns (Col 3 and Col 4) */}
                        <div className="grid grid-cols-2 gap-0 border-t border-r border-black">
                          {/* Col 3 with 6 Rows */}
                          <div className="flex flex-col justify-between border-r border-black">
                            <div className="border-b border-black p-2 ">
                              <p className='font-bold'>TRADE REFERENCE NO.</p>
                              <p className='uppercase'>{selectedTrade.trn}</p>
                            </div>
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>Country of Origin</p>
                              <p className='uppercase'>{selectedTrade.country_of_origin}</p>
                            </div>
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>INCOTERM</p>
                              <p className='uppercase'>{selectedTrade.incoterm}</p>
                            </div>
                            
                            {/* <div className="border-b border-black p-2">
                              <p className='font-bold'>CONTAINER SIZE</p>
                              <p className='uppercase'>{selectedTrade.shipmentSize.name}</p>
                            </div> */}
                            <div className="p-2">
                              <p className='font-bold'>
                                ESTIMATED TIME OF DEPARTURE
                              </p>
                              <p className='uppercase'>{selectedTrade.etd}</p>
                            </div>
                          </div>

                          {/* Col 4 with 5 Rows */}
                          <div className="flex flex-col justify-between">
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>Dated</p>
                              <p className='uppercase'>{selectedTrade.approval_date}</p>

                            </div>
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>Terms of Payment</p>
                              <p className='uppercase'>{selectedTrade.paymentTerm.name}</p>
                            </div>
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>ADVANCE/LC DUE DATE</p>
                              <p className='uppercase'>{selectedTrade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPresp.doc_issuance_date,selectedTrade.paymentTerm.advance_within)}</p>
                            </div>
                            {/* <div className="border-b border-black p-2">
                              <p className='font-bold'>LC DUE DATE</p>
                              <p className='uppercase'>{selectedTrade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPresp.doc_issuance_date,selectedTrade.paymentTerm.advance_within)}</p>
                            </div> */}
                            <div className="border-b border-black p-2">
                              <p className='font-bold'>Port of Loading</p>
                              <p className='uppercase'>{selectedTrade.pol}</p>
                            </div>
                            <div className="p-2">
                              <p className='font-bold'>Port of Discharge</p>
                              <p className='uppercase'>{selectedTrade.pod}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Table Section */}
                      <div className="">
                        <table className="table-auto w-full border-collapse border border-black">
                          <thead>
                            <tr>
                              <th className="border border-black p-1">SN</th>
                              <th className="border border-black p-1">Description of Goods</th>
                              <th className="border border-black p-1">HS Code</th>
                              <th className="border border-black p-1">Trade Quantity</th>
                              <th className="border border-black p-1">Unit</th>
                              <th className="border border-black p-1">Rate</th>
                              <th className="border border-black p-1">Currency</th>
                              <th className="border border-black p-1">Tolerance</th>
                              <th className="border border-black p-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTrade.tradeProducts.map((product, index) => (
                              <tr key={index}>
                                <td className="border-l border-r border-black p-1 text-sm">{index + 1}</td>
                                <td className="border-l border-r border-black p-1 font-bold text-sm">
                                  {product.product_name_for_client && product.product_name_for_client.toLowerCase() !== "na" ? product.product_name_for_client : product.productName.name}
                                </td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.hs_code}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.trade_qty}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.trade_qty_unit}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.selected_currency_rate.toFixed(2)}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{selectedTrade.currency.name}</td>
                                <td className="border-l border-r border-black p-1 text-sm text-center">{product.tolerance}</td>
                                <td className="border-l border-r border-black p-1 text-right text-sm">
                                  {parseFloat(product.selected_currency_rate*product.trade_qty).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                            {Array.from({ length: 7 - selectedTrade.tradeProducts.length }, (_, index) => (
                              <tr key={index}>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                                <td className="border-l border-r border-black p-2"></td>
                              </tr>
                            ))}
                            <tr>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2 text-sm text-center">Total</td>
                              <td className="border border-black p-2 text-sm text-center">{totalTradeQuantity}</td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2"></td>
                              <td className="border border-black p-2 text-right text-sm">{totalAmount.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Final Div with 2 Rows */}
                      <div className="flex flex-col gap-4 border-l border-r border-b border-black">
                        {/* Row 1 */}
                        <div className=" px-2 py-1">
                          <p>Amount Chargeable (in words)</p>
                          <p className='font-bold uppercase'>{selectedTrade.currency.name} {toWords(totalAmount)} Only</p>
                          <p>DOCUMENTS PROVIDED AGAINST SHIPMENT</p>
                          {selectedPresp.documentRequired && selectedPresp.documentRequired.length > 0 ? (
                          selectedPresp.documentRequired.map((product, index) => (
                            <div key={index}>
                              <p className='text-sm'>{index + 1}. {product.doc.name}</p> {/* Replace 'someField1' with the actual field name */}

                            </div>
                          ))
                        ) : (
                          <p>No Document data available.</p>
                        )}
                          <p className='mt-2 underline'>Declaration</p>
                          <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.The tolerance quantity to be provided shall be on seller's option.</p>
                        </div>
                        {/* Row 2 with 2 Columns */}
                        <div className="grid grid-cols-2">
                          <div className="p-2">
                            <p className='mb-8 font-bold text-sm'>Acknowledged By</p>
                            <div className="w-16 h-16 mx-auto"></div>
                            {/* <img src={`${BACKEND_URL}${selectedTrade.company.seal_image}`} alt="Seal" className="w-16 h-16 mx-auto" /> */}
                            <p className='font-bold text-sm'>Authorized Signatory with Seal</p>
                          </div>
                          <div className="border-t border-l border-black p-2">
                            <p className='mb-8 font-bold text-sm'>for {selectedTrade.company.name}</p>
                            <div className="w-16 h-16 mx-auto"></div>
                            {/* <img src={`${BACKEND_URL}${selectedTrade.company.signature_image}`} alt="Signature" className="w-16 h-16 mx-auto" /> */}
                            <p className='text-right text-sm'>Authorized Signatory</p>
                          </div>
                      </div>
                      </div>
                      <div className="text-center pb-0 mt-1">
                        <h1 className="text-sm font-md">This is a computer generated invoice</h1>
                      </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </PrintModal>


      <Modal isOpen={isModalOpen} onClose={closeModal}>
      {selectedTrade && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Pre Sales/Purchase Details</h2>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trade Type </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trade_type}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPresp.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Company </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.company.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Document Issuance Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedPresp.doc_issuance_date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">TRN </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trn}</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Country of Origin </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.country_of_origin}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Customer Company Name </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.customer_company_name.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Address </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.address}</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Payment Term</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.paymentTerm.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Advance/LC Due Date</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPresp.doc_issuance_date,selectedTrade.paymentTerm.advance_within)}</td>
                  </tr>
                 
                  
                  {/* <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">LC Due Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.paymentTerm.advance_within=='NA'?'NA':addDaysToDate(selectedPresp.doc_issuance_date,selectedTrade.paymentTerm.advance_within)}</td>
                  </tr> */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Bank Name Address</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.bank_name_address.name}</td>
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
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Trader Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.trader_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Insurance Policy Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.insurance_policy_number}</td>
                  </tr>
                  {/* <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Container Shipment Size</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.shipmentSize.name}</td>
                  </tr> */}
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Remarks</td>
                    <td className="py-2 px-4 text-gray-800">{selectedTrade.remarks}</td>
                  </tr>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approved</td>
                    <td className="py-2 px-4 text-gray-800">{selectedPresp.approved ? 'Yes' : 'No'}</td>
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
                   {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Name for Client</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LOI</th> */}
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">HS Code</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Total Contract Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Tolerance</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Balance Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Contract Balance Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty Unit</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Selected Currency Rate</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Packing</th>
                   <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Container Shipment Size</th>
                 </tr>
               </thead>
               <tbody>
                 {selectedTrade.tradeProducts.map(product => (
                   <tr key={product.id}>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.productName.name}</td>
                     {/* <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.product_name_for_client}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm"><a href={product.loi} target="_blank" rel="noopener noreferrer">View LOI</a></td> */}
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.hs_code}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.total_contract_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.tolerance}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.contract_balance_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.trade_qty_unit}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.selected_currency_rate}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.packing.name}</td>
                     <td className="py-2 px-4 border-b border-gray-200 text-sm">{product.shipmentSize.name}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <p className='my-2 underline'>Documents Required</p>
              {selectedPresp.documentRequired && (
                selectedPresp.documentRequired.map((product, index) => (
                  <div key={index}>
                    <p className='text-sm'>{index + 1}. {product.doc.name}</p>

                  </div>
                )))}
              <p className='my-2 underline'>Acknowledged PI</p>
              {selectedPresp.acknowledgedPI && (
                selectedPresp.acknowledgedPI.map((product, index) => (
                  <div key={index}>
                    <p className='text-sm underline'>{index + 1}. <a href={`${BACKEND_URL}${product.ackn_pi}`} target="_blank"
                              rel="noopener noreferrer">{product.ackn_pi_name}</a></p>

                  </div>
                )))}

              <p className='my-2 underline'>Acknowledged PO</p>
              {selectedPresp.acknowledgedPO && (
                selectedPresp.acknowledgedPO.map((product, index) => (
                  <div key={index}>
                    <p className='text-sm underline'>{index + 1}. <a href={`${BACKEND_URL}${product.ackn_po}`} target="_blank"
                              rel="noopener noreferrer">{product.ackn_po_name}</a></p>

                  </div>
                )))}
                
                {selectedPresp.approved ? '' : 
             <div className='grid grid-cols-3 gap-4 mt-4 mb-4'>
             <button onClick={reviewTrade} className="bg-blue-500 text-white p-2 rounded col-span-3">Approve</button>
             </div>
             }
           </div>
         </div>
        )}
      </Modal>


    </>
  );
};

export default PreSPTable;
