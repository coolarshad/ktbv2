import NavBar from "../components/NavBar"
import SPTable from "../components/SPTable"
function SalesPurchases() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      invoiceDate: '2024-07-29',
      invoiceNumber: '0025',
      buyerSellerName: 'Seller A',
      reviewed: true,  // updated field
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      invoiceDate: '2024-07-29',
      invoiceNumber: '0028',
      buyerSellerName: 'Seller B',
      reviewed: false,  // updated field
      status: 'Pending',
    },
    // Add more trade objects here
  ];
  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Sales and Purchase Details</p>
        <div className=" rounded p-2">
        <SPTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default SalesPurchases