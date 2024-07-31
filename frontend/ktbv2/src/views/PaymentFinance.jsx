import NavBar from "../components/NavBar"
import PFTable from "../components/PFTable"
function PaymentFinance() {

  const tradeData = [
    {
      tradeType: 'Buy',
      company: 'Company A',
      trn: 'TRN001',
      balancePayment: 10000,
      paymentDueDate: '2024-07-29',
      paymentReceivedSent: 5000,
      paymentDate: '2024-07-29',
      balanceDue: 5000,
      buyerSellerName: 'Seller A',
      reviewed: true,  // updated field
      status: 'Approved',
    },
    {
      tradeType: 'Sell',
      company: 'Company B',
      trn: 'TRN002',
      paymentDueDate: '2024-07-29',
      paymentReceivedSent: 10000,
      paymentDate: '2024-07-29',
      balanceDue: 0,
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
        <p className="text-xl">Payment and Finance Details</p>
        <div className=" rounded p-2">
        <PFTable data={tradeData} />
        </div>
      </div>

    </>

  )
}

export default PaymentFinance