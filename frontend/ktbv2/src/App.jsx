
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TradeApproval from './views/TradeApproval'
import TradeApproved from './views/TradeApproved'
import PreSalePurchase from './views/PreSalePurchase'
import PrePayment from './views/PrePayment'
import SalesPurchases from './views/SalesPurchases'
import PaymentFinance from './views/PaymentFinance'
import PL from './views/PL'
import TradeForm from './views/TradeForm'
import PaymentTermForm from './views/PaymentTermForm'
import DocumentsRequiredForm from './views/DocumentRequiredForm'
import PreSalePurchaseForm from './views/PreSalePurchaseForm'
import PrePaymentForm from './views/PrePaymentForm'
import SalesPurchaseForm from './views/SalesPurchaseForm'
import PaymentFinanceForm from './views/PaymentFinanceForm'
import MenuBar from './components/MenuBar'
function App() {
 
  return (
    <Router>
      <MenuBar />
      <div className="p-4">
        <Routes>
          <Route path="/trade-approval" element={<TradeApproval />} />
          <Route path="/trade-approved" element={<TradeApproved />} />
          <Route path="/pre-sale-purchase" element={<PreSalePurchase />} />
          <Route path="/pre-payment" element={<PrePayment />} />
          <Route path="/sales-purchases" element={<SalesPurchases />} />
          <Route path="/payment-finance" element={<PaymentFinance />} />
          <Route path="/pl" element={<PL />} />
          <Route path="/trade-form" element={<TradeForm />} />
          <Route path="/payment-term-form" element={<PaymentTermForm />} />
          <Route path="/documents-required-form" element={<DocumentsRequiredForm />} />
          <Route path="/pre-sale-purchase-form" element={<PreSalePurchaseForm />} />
          <Route path="/pre-payment-form" element={<PrePaymentForm />} />
          <Route path="/sales-purchase-form" element={<SalesPurchaseForm />} />
          <Route path="/payment-finance-form" element={<PaymentFinanceForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
