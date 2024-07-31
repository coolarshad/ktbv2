import NavBar from "../components/NavBar"
import PrePaymentTable from "../components/PrePaymentTable"
function PrePayment() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      dueDate: '2024-07-29',
      dueAmount: 12000,
      receivedPaidAmount: 2000,
      buyerSellerName: 'Buyer A',
      receivedDate: '2024-07-29',
      paidDate: 'NA',
      
      
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      dueDate: '2024-07-29',
      dueAmount: 15000,
      receivedPaidAmount: 5000,
      buyerSellerName: 'Buyer B',
      receivedDate: 'None',
      paidDate: 'NA',
      
      
      status: 'Pending',
    },
    // Add more trade objects here
  ];
  return (
    <>
      <NavBar />
      <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">Pre-Payments/ LC's Details</p>
        <div className=" rounded p-2">
        <PrePaymentTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default PrePayment