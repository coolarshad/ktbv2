import NavBar from "../components/NavBar"
import PreSPTable from "../components/PreSPTable"
function PreSalePurchase() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      buyerSellerName: 'Buyer A',
      orderNumber: 'KP000040',
      orderDate: '2024-07-29',
      
      
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      buyerSellerName: 'Seller B',
      orderNumber: 'KP000041',
      orderDate: '2024-07-30',
      
      
      status: 'Pending',
    },
    // Add more trade objects here
  ];
  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre Sales/Purchase</p>
        <div className=" rounded p-2">
        <PreSPTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default PreSalePurchase