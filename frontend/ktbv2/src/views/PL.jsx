import NavBar from "../components/NavBar"
import React, { useEffect, useState, useRef } from 'react';
import PLTable from "../components/PLTable.jsx"
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from "../components/FilterComponent";
import { BASE_URL } from '../utils';
import ReactToPrint from 'react-to-print';
import Modal from '../components/Modal';

function PL() {
  const navigate = useNavigate();
  const componentRef = useRef();

  const [plData, setPLData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPL, setSelectedPL] = useState(null);
  

  useEffect(() => {
    const fetchPLData = async () => {
      try {
        const response = await axios.get('/trademgt/profitloss/'); // Replace with your API endpoint
        setPLData(response.data);
      } catch (error) {
        setError('Failed to fetch PL data');
      } finally {
        setLoading(false);
      }
    };

    fetchPLData();
  }, []);

  const handleAddPLClick = () => {
    navigate('/pl-form');
  };



  const handleViewClick = async (id) => {
    try {
      const response = await axios.get(`/trademgt/profitloss/${id}/`);
      setSelectedPL(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching P&L details:', error);
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this P&L?');
    if (confirmed) {
      try {
        await axios.delete(`/trademgt/profitloss/${id}/`);
        setPLData(plData.filter(data => data.id !== id));
        alert('P&L deleted successfully.');
      } catch (error) {
        console.error('Error deleting P&L:', error);
        alert('Failed to delete P&L.');
      }
    }
  };

  const handleFilter = (filters) => {
    setPLData(filters)
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPL(null);
  };

  
  const sumPackingCost = (sp) => {
    return sp.trn.trade_products.reduce((acc, item) => acc + item.total_packing_cost, 0);
  };
  const sumOtherCharges = (sp) => {
    return sp.sp_extra_charges.reduce((acc, item) => acc + item.charge, 0);
  };
  const sumPFCharges = (pf) => {
    return pf?.pf_charges.reduce((acc, item) => acc + item.charge, 0);
  };
  const sumBLQty = (sp) => {
    return sp.sp_product.reduce((acc, item) => acc + item.bl_qty, 0);
  };
  
  // const sumTotal=(packing_cost,invoice_amount,commission_value,bl_value,bl_fees,bl_collection_cost,other_charges,logistic_cost,pf_charges)=>{
  //   return 0;
  // }
  const sumTotal = (...args) => {
    return args.reduce((acc, value) => acc + (value || 0), 0);
  };


  const salesData = [
    { field: 'Product Code', value: 'P12345' },
    { field: 'Product Name', value: 'Widget A' },
    { field: 'Trade Qty', value: '1000' },
    { field: 'Trade Unit', value: 'Pieces' },
    { field: 'Rate in USD', value: '5.00' },
    { field: 'Commission Rate', value: '10%' },
    { field: 'Packaging Supplier', value: 'Supplier X' },
    // { field: 'BL Quantity', value: '950' },
  ];
  
  const purchaseData = [
    { field: 'Product Code', value: 'P67890' },
    { field: 'Product Name', value: 'Widget B' },
    { field: 'Trade Qty', value: '500' },
    { field: 'Trade Unit', value: 'Pieces' },
    { field: 'Rate in USD', value: '4.50' },
    { field: 'Commission Rate', value: '8%' },
    { field: 'Packaging Supplier', value: 'Supplier Y' },
    // { field: 'BL Quantity', value: '480' },
  ];

  const findTrade=(sp,row)=>{
   return sp.trn.trade_products.find((trade)=>trade.product_code==row.product_code && trade.product_name==row.product_name && trade.hs_code==row.hs_code)
  }
  
  const MiniTable = ({ data }) => (
   <>
      {data.sp.sp_product.map((row, index) => (
        <div className="flex flex-col p-2">
        <div key={index}  className="border border-gray-300 rounded-md p-4 shadow-sm grid grid-cols-3 gap-4">
          <span className="text-sm border-gray-200">Product Code: {row.product_code}</span>
          <span className="text-sm border-gray-200">Product Name: {row.productName.name}</span>
          <span className="text-sm border-gray-200">BL Qty: {row.bl_qty}</span>
          <span className="text-sm border-gray-200">Trade Unit: {row.trade_qty_unit}</span>
          <span className="text-sm border-gray-200">Rate in USD: {row.rate_in_usd}</span>
          <span className="text-sm border-gray-200">Commission Rate: {findTrade(data.sp,row).commission_rate}</span>
          <span className="text-sm border-gray-200">Packaging Supplier: {findTrade(data.sp,row).supplier.name}</span>
          {/* <span>Product Code: {row.product_code}</span> */}
        </div>
        </div>
      ))}
    </>
  );

  const MiniGross = ({ sales_data, purchase_data }) => {
    // Helper function to calculate totals
    const calculateSalesTotal = (bl_qty, rate_in_usd) => bl_qty * rate_in_usd;
    const calculateExpenseTotal = (commission_rate, bl_qty) => commission_rate * bl_qty;
    const calculatePurchaseTotal = (bl_qty, rate_in_usd) => bl_qty * rate_in_usd;
    const calculateGross = (salesTotal, purchaseTotal, expenseTotal) => salesTotal - purchaseTotal - expenseTotal;
    const calculatePerUnit = (gross, sales_bl_qty) => gross / sales_bl_qty;
  
    return (
      <>
        {/* Mapping over sales and purchase data with index to pair them */}
        {sales_data?.sp?.sp_product.map((salesRow, index) => {
          // Find corresponding purchase row by index
          const purchaseRow = purchase_data?.sp?.sp_product[index];
  
          // If there's no corresponding purchase row, we skip this pair
          if (!purchaseRow) return null;
  
          // Calculating salesTotal, expenseTotal, purchaseTotal, gross, perUnit for this pair
          const salesTotal = calculateSalesTotal(salesRow.bl_qty, salesRow.rate_in_usd);
          const expenseTotal = calculateExpenseTotal(findTrade(sales_data.sp, salesRow).commission_rate, salesRow.bl_qty)+calculateExpenseTotal(findTrade(purchase_data.sp, purchaseRow).commission_rate, purchaseRow.bl_qty);
          const purchaseTotal = calculatePurchaseTotal(purchaseRow.bl_qty, purchaseRow.rate_in_usd);
          const gross = calculateGross(salesTotal, purchaseTotal, expenseTotal);
          const perUnit = calculatePerUnit(gross, salesRow.bl_qty);
  
          return (
            <div className="flex flex-col my-16 p-2" key={index}>
            <div className="border border-gray-300 rounded-md p-4 shadow-sm flex flex-wrap gap-4">
              {/* Calculated Profit Information */}
              <div className="text-sm border-gray-200 flex-1 min-w-[200px]">
                {/* <span>Sales Total: {salesTotal.toFixed(2)}</span><br />
                <span>Expense Total: {expenseTotal.toFixed(2)}</span><br />
                <span>Purchase Total: {purchaseTotal.toFixed(2)}</span><br /> */}
                <span>Profit per product: {gross.toFixed(2)}</span><br />
                <span>Profit per Unit: {perUnit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          );
        })}
      </>
    );
  };
  
  
  


  const fieldOptions = [
    { value: 'sales_trn__trn__trn', label: 'Sales TRN' },  // Trade TRN field in PreSalePurchase filter
    { value: 'purchase_trn__trn__trn', label: 'Purchase TRN' },
    { value: 'remarks', label: 'Remarks' },
  ];

  const calculateTotalCommission = (items, sp, findTrade) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      const qty = parseFloat(item.bl_qty) || 0;
      const trade = findTrade(sp, item);
      const rate = parseFloat(trade?.commission_rate) || 0;
      return total + (qty * rate);
    }, 0);
  };

  const calculateSPTotal = (pf) => {
    if (!pf) return 0; // Handle undefined or null SP
    return parseFloat(
      sumPackingCost(pf.sp) +
      // pf.sp.trn.commission_value +
      calculateTotalCommission(pf.sp.sp_product, pf.sp, findTrade),
      pf.sp.bl_fees +
      pf.sp.bl_collection_cost +
      sumOtherCharges(pf.sp) +
      pf.sp.logistic_cost +
      sumPFCharges(pf)
    );
  };
  
  // Calculate gross profit
  const calculateGrossProfit = (salesPF, purchasePF) => {
    if (!salesPF || !purchasePF) return 0; // Handle undefined salesPF or purchasePF
    const salesTotal = parseFloat(salesPF.sp.invoice_amount);
    const purchaseTotal =  parseFloat(purchasePF.sp.invoice_amount);
    const totalExpense = calculateSPTotal(purchasePF) + calculateSPTotal(salesPF);
    return salesTotal - purchaseTotal - totalExpense;
  };
  
  const calculateProfitPerMT = (salesPF, purchasePF) => {
    const grossProfit = calculateGrossProfit(salesPF, purchasePF) || 0; // Default to 0 if undefined or NaN
    const totalBLQty = sumBLQty(salesPF?.sp) || 1; // Default to 1 to avoid division by zero
    const profitPerMT = parseFloat(grossProfit) / parseFloat(totalBLQty); // Ensure valid division
    return isNaN(profitPerMT) ? "0.00" : profitPerMT.toFixed(2); // Handle NaN gracefully
  };
  

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;


  return (

      <>
    
    <div className="w-full h-full rounded bg-slate-200  p-3	">
      <p className="text-xl">P&L Account Details</p>
      <button
        onClick={handleAddPLClick}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        +
      </button>
      <div>
      <FilterComponent onFilter={handleFilter} apiEndpoint={'/trademgt/profitloss'} 
      fieldOptions={fieldOptions}
      />
      </div>
      <div className=" rounded p-2">

      <PLTable data={plData} onDelete={handleDelete}  onView={handleViewClick}/>
      </div>
    </div>


      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedPL && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
              <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <ReactToPrint trigger={() => <button>Print</button>} content={() => componentRef.current} />
              <div className="p-2 max-w-8xl mx-auto" ref={componentRef}>

                <h2 className="text-2xl mb-2 text-center">P&L Details</h2>
                <hr className='mb-2' />

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead className="border-b border-gray-200">
                      <tr className="bg-gray-300">
                        <th className="py-2 px-4 text-left text-white-700 font-semibold border" colSpan="2">Sales</th>
                        <th className="py-2 px-4 text-left text-gray-700 font-semibold border" colSpan="2">Purchase</th>
                      </tr>
                      <tr>
                        <th className="py-2 px-4 text-left text-gray-700 font-semibold">Field</th>
                        <th className="py-2 px-4 text-left text-gray-700 font-semibold">Value</th>
                        <th className="py-2 px-4 text-left text-gray-700 font-semibold">Field</th>
                        <th className="py-2 px-4 text-left text-gray-700 font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Example Row */}
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Company</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.companyName.name}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Company</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.companyName.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trade Reference Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.trd}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trade Reference Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.trd}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trade Reference Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.trn}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trade Reference Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.trn}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trader Name </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.trader_name}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Trader Name </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.trader_name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Insurrance policy number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.insurance_policy_number}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Insurrance policy number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.insurance_policy_number}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Customer Company Name in Full Detail </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.customer.name}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Customer Company Name in Full Detail </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.customer.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Commission Agent</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.commission_agent}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Commission Agent</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.commission_agent}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Logistic Provider</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.logistic_provider}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Logistic Provider</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.trn.logistic_provider}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Total Packing cost(Sum)</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumPackingCost(selectedPL.salesPF.sp)}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Total Packing cost(Sum)</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumPackingCost(selectedPL.purchasePF.sp)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.invoice_date}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.invoice_date}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.invoice_number}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.invoice_number}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Amount</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.invoice_amount}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Invoice Amount</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.invoice_amount}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">COMMISSION VALUE</td>
                        {/* <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.trn.commission_value}</td> */}
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{calculateTotalCommission(selectedPL.salesPF.sp.sp_product, selectedPL.salesPF.sp, findTrade)}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">COMMISSION VALUE</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{calculateTotalCommission(selectedPL.purchasePF.sp.sp_product, selectedPL.purchasePF.sp, findTrade)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.bl_number}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL Number</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.bl_number}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL FEES</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.bl_fees}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL FEES</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.bl_fees}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL COLLECTION COST</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.bl_collection_cost}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL COLLECTION COST</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.bl_collection_cost}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">OTHER CHARGES</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumOtherCharges(selectedPL.salesPF.sp)}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">OTHER CHARGES</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumOtherCharges(selectedPL.purchasePF.sp)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.bl_date}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">BL Date</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.bl_date}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Logitics Cost</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.logistic_cost}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Logitics Cost</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.purchasePF.sp.logistic_cost}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">CHARGES P & F </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumPFCharges(selectedPL.salesPF)}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">CHARGES P & F </td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumPFCharges(selectedPL.purchasePF)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Total Income</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{selectedPL.salesPF.sp.invoice_amount}</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">Total Expense</td>
                        <td className="py-2 px-4 border-t text-sm border-gray-200">{sumTotal(sumPackingCost(selectedPL.purchasePF.sp),sumPackingCost(selectedPL.salesPF.sp),selectedPL.purchasePF.sp.invoice_amount,calculateTotalCommission(selectedPL.purchasePF.sp.sp_product, selectedPL.purchasePF.sp, findTrade),calculateTotalCommission(selectedPL.salesPF.sp.sp_product, selectedPL.salesPF.sp, findTrade),0,selectedPL.purchasePF.sp.bl_fees,selectedPL.salesPF.sp.bl_fees,selectedPL.purchasePF.sp.bl_collection_cost,selectedPL.salesPF.sp.bl_collection_cost,sumOtherCharges(selectedPL.purchasePF.sp),sumOtherCharges(selectedPL.salesPF.sp),selectedPL.purchasePF.sp.logistic_cost,selectedPL.salesPF.sp.logistic_cost,sumPFCharges(selectedPL.purchasePF),sumPFCharges(selectedPL.salesPF))}</td>
                      </tr>
                    </tbody>
                    
                  </table>
                  
                  <div className="flex justify-around p-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Sales Products</h3>
                      <MiniTable data={selectedPL.salesPF} />

                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Purchase Products</h3>
                      <MiniTable data={selectedPL.purchasePF} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Profit/Loss</h3>
                      <MiniGross sales_data={selectedPL.salesPF} purchase_data={selectedPL.purchasePF} />
                    </div>
                   
                  </div>
                  
                  <div className="p-4 text-center mb-4">
                    <p>GROSS PROFIT: {calculateGrossProfit(selectedPL.salesPF, selectedPL.purchasePF).toFixed(2)}</p>
                    <p>PROFIT PMT: {calculateProfitPerMT(selectedPL.salesPF, selectedPL.purchasePF)}</p>

                    {/* <p>GROSS PROFIT: {parseFloat(sumTotal(sumPackingCost(selectedPL.salesPF.sp), selectedPL.salesPF.sp.invoice_amount, selectedPL.salesPF.sp.trn.commission_value, 0, selectedPL.salesPF.sp.bl_fees, selectedPL.salesPF.sp.bl_collection_cost, sumOtherCharges(selectedPL.salesPF.sp), selectedPL.salesPF.sp.logistic_cost, sumPFCharges(selectedPL.salesPF))) - parseFloat(sumTotal(sumPackingCost(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.invoice_amount, selectedPL.purchasePF.sp.trn.commission_value, 0, selectedPL.purchasePF.sp.bl_fees, selectedPL.purchasePF.sp.bl_collection_cost, sumOtherCharges(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.logistic_cost, sumPFCharges(selectedPL.purchasePF)))}</p>
                    <p>PROFIT PMT: {
                    (parseFloat(sumTotal(sumPackingCost(selectedPL.salesPF.sp), selectedPL.salesPF.sp.invoice_amount, selectedPL.salesPF.sp.trn.commission_value, 0, selectedPL.salesPF.sp.bl_fees, selectedPL.salesPF.sp.bl_collection_cost, sumOtherCharges(selectedPL.salesPF.sp), selectedPL.salesPF.sp.logistic_cost, sumPFCharges(selectedPL.salesPF))) - parseFloat(sumTotal(sumPackingCost(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.invoice_amount, selectedPL.purchasePF.sp.trn.commission_value, 0, selectedPL.purchasePF.sp.bl_fees, selectedPL.purchasePF.sp.bl_collection_cost, sumOtherCharges(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.logistic_cost, sumPFCharges(selectedPL.purchasePF)))) > 0 ? ((parseFloat(sumTotal(sumPackingCost(selectedPL.salesPF.sp), selectedPL.salesPF.sp.invoice_amount, selectedPL.salesPF.sp.trn.commission_value, 0, selectedPL.salesPF.sp.bl_fees, selectedPL.salesPF.sp.bl_collection_cost, sumOtherCharges(selectedPL.salesPF.sp), selectedPL.salesPF.sp.logistic_cost, sumPFCharges(selectedPL.salesPF))) - parseFloat(sumTotal(sumPackingCost(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.invoice_amount, selectedPL.purchasePF.sp.trn.commission_value, 0, selectedPL.purchasePF.sp.bl_fees, selectedPL.purchasePF.sp.bl_collection_cost, sumOtherCharges(selectedPL.purchasePF.sp), selectedPL.purchasePF.sp.logistic_cost, sumPFCharges(selectedPL.purchasePF)))) / sumBLQty(selectedPL.salesPF.sp)).toFixed(2) : 0
                    }</p> */}
                  </div>
                </div>


              </div>
            </div>
          </div>
        )}
      </Modal>

    </>

  )
}

export default PL