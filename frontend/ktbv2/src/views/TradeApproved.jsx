import NavBar from "../components/NavBar"
import TradeTable from "../components/TradeTable"
function TradeApproved() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      buyerSellerName: 'Buyer A',
      tradeRefDate: '2024-07-29',
      tradeQty: 100,
      productCode: 'P001',
      reviewed: true,  // updated field
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      buyerSellerName: 'Seller B',
      tradeRefDate: '2024-07-30',
      tradeQty: 200,
      productCode: 'P002',
      reviewed: false,  // updated field
      status: 'Pending',
    },
    // Add more trade objects here
  ];
  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Trade Approved</p>
        <div className=" rounded p-2">
        <TradeTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default TradeApproved