import NavBar from "../components/NavBar"
import PLTable from "../components/PLTable.jsx"
function PL() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      salesTrn: 'TRN001',
      purchaseTrn: 'TRN002',
      salesInvoiceDate: '2024-07-29',
      sellerName:'Seller A',
      buyerName: 'Seller B',
      grossProfit: 2000,
      profitPMT: 2,
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      salesTrn: 'TRN003',
      purchaseTrn: 'TRN004',
      salesInvoiceDate: '2024-07-29',
      sellerName:'Seller A',
      buyerName: 'Seller B',
      grossProfit: 3000,
      profitPMT: 2.5,
    },
    // Add more trade objects here
  ];
  return (
    <>
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">P&L Account Details</p>
        <div className=" rounded p-2">
        <PLTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default PL