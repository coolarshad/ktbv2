
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
import SalesInvoice from './views/SalesInvoice';
import PurchaseInvoice from './views/PurchaseInvoice';
import Dashboard from './views/Dashboard';
import Kyc from './views/Kyc';
import KycForm from './views/KycForm';
import Company from './views/Company';
import Bank from './views/Bank';
import Units from './views/Units';
import SalesPending from './views/SalesPending';
import PurchasePending from './views/PurchasePending';
import SalesProductTrace from './views/SalesProductTrace';
import PurchaseProductTrace from './views/PurchaseProductTrace';
import Packing from './views/Packing';
import PackingForm from './views/PackingForm';
import RawMaterial from './views/RawMaterial';
import RawMaterialForm from './views/RawMaterialForm';
import Additive from './views/Additive';
import AdditiveForm from './views/AdditiveForm';
import Consumption from './views/Consumption';
import ConsumptionForm from './views/ConsumptionForm';
import FinalProduct from './views/FinalProduct';
import FinalProductForm from './views/FinalProductForm';
import ProductName from './views/ProductName';
import ShipmentSize from './views/ShipmentSize';
import Currency from './views/Currency';
import TradePacking from './views/TradePacking';

function App() {
 
  return (
    <Router>
      <MenuBar />
      <div className="p-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trade-approval" element={<TradeApproval />} />
          <Route path="/trade-approved" element={<TradeApproved />} />
          <Route path="/pre-sale-purchase" element={<PreSalePurchase />} />
          <Route path="/pre-payment" element={<PrePayment />} />
          <Route path="/sales-purchases" element={<SalesPurchases />} />
          <Route path="/payment-finance" element={<PaymentFinance />} />
          <Route path="/pl" element={<PL />} />
          <Route path="/trade-form" element={<TradeForm />} />
          <Route path="/trade-form/:id" element={<TradeForm mode="update" />} />
          <Route path="/payment-term-form" element={<PaymentTermForm />} />
          <Route path="/documents-required-form" element={<DocumentsRequiredForm />} />
          <Route path="/pre-sale-purchase-form" element={<PreSalePurchaseForm />} />
          <Route path="/pre-sale-purchase-form/:id" element={<PreSalePurchaseForm mode="update" />} />
          <Route path="/pre-payment-form" element={<PrePaymentForm />} />
          <Route path="/pre-payment-form/:id" element={<PrePaymentForm mode="update" />} />
          <Route path="/sales-purchase-form" element={<SalesPurchaseForm />} />
          <Route path="/sales-purchase-form/:id" element={<SalesPurchaseForm mode="update" />} />
          <Route path="/payment-finance-form" element={<PaymentFinanceForm />} />
          <Route path="/payment-finance-form/:id" element={<PaymentFinanceForm mode="update" />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/kyc-form" element={<KycForm />} />
          <Route path="/kyc-form/:id" element={<KycForm mode="update" />} />
          <Route path="/company" element={<Company />} />
          <Route path="/bank" element={<Bank />} />
          <Route path="/units" element={<Units />} />
          <Route path="/sales-pending" element={<SalesPending />} />
          <Route path="/purchase-pending" element={<PurchasePending />} />
          <Route path="/sales-product-trace" element={<SalesProductTrace />} />
          <Route path="/purchase-product-trace" element={<PurchaseProductTrace />} />

          <Route path="/packings" element={<Packing />} />
          <Route path="/packing-form" element={<PackingForm />} />
          <Route path="/packing-form/:id" element={<PackingForm mode="update" />} />

          <Route path="/raw-materials" element={<RawMaterial />} />
          <Route path="/raw-material-form" element={<RawMaterialForm />} />
          <Route path="/raw-material-form/:id" element={<RawMaterialForm mode="update" />} />

          <Route path="/additives" element={<Additive />} />
          <Route path="/additive-form" element={<AdditiveForm />} />
          <Route path="/additive-form/:id" element={<AdditiveForm mode="update" />} />

          <Route path="/consumptions" element={<Consumption />} />
          <Route path="/consumption-form" element={<ConsumptionForm />} />
          <Route path="/consumption-form/:id" element={<ConsumptionForm mode="update" />} />

          <Route path="/final-products" element={<FinalProduct />} />
          <Route path="/final-product-form" element={<FinalProductForm />} />
          <Route path="/final-product-form/:id" element={<FinalProductForm mode="update" />} />

          <Route path="/products-name" element={<ProductName />} />
          <Route path="/shipments-size" element={<ShipmentSize />} />
          <Route path="/currency" element={<Currency />} />
          <Route path="/trade-packings" element={<TradePacking />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
