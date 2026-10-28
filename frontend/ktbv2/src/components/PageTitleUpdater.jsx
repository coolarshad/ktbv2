import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/login': 'Login',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/users': 'Users',
  '/user-form': 'New User',
  '/logs': 'Activity Logs',
  '/audit-log': 'Audit Log',

  // Profiles & Master Data
  '/kyc': 'KYC',
  '/kyc-form': 'New KYC',
  '/company': 'Company',
  '/payment-term-form': 'Payment Term Form',
  '/bank': 'Bank',
  '/units': 'Units',
  '/documents-required-form': 'Documents Required',
  '/products-name': 'Product Name',
  '/shipments-size': 'Shipment Size',
  '/currency': 'Currency',
  '/trade-packings': 'Packings',

  // Trade Management
  '/trade-approval': 'Trade Approval',
  '/trade-approved': 'Trade Approved',
  '/trade-form': 'New Trade',
  '/pre-sale-purchase': 'Pre-Sale Purchase',
  '/pre-sale-purchase-form': 'New Pre-Sale Purchase',
  '/pre-payment': 'Pre Payment',
  '/pre-payment-form': 'New Pre Payment',
  '/sales-purchases': 'Sales & Purchases',
  '/sales-purchase-form': 'New Sales & Purchase',
  '/payment-finance': 'Payment Finance',
  '/payment-finance-form': 'New Payment Finance',
  '/pl': 'Profit & Loss',
  '/pl-form': 'New Profit & Loss',

  // Trade Reports
  '/trade-report': 'Trade Report',
  '/inventory': 'Inventory',
  '/sales-pending': 'Sales Pending',
  '/purchase-pending': 'Purchase Pending',
  '/sales-product-trace': 'Sales Product Trace',
  '/purchase-product-trace': 'Purchase Product Trace',
  '/product-ref': 'Product Reference',

  // Invoices
  '/sales-invoice': 'Sales Invoice',
  '/purchase-invoice': 'Purchase Invoice',

  // Cost Management
  '/categories': 'Categories',
  '/category-form': 'New Category',
  '/packing-size': 'Packing Size',
  '/packingtype': 'Packing Type List',
  '/packings': 'Packing Price',
  '/packing-form': 'New Packing',
  '/raw-categories': 'Raw Material Category',
  '/raw-category-form': 'New Raw Category',
  '/raw-materials': 'Raw Material Pricing',
  '/raw-material-form': 'New Raw Material',
  '/additive-categories': 'Additives Category',
  '/additive-category-form': 'New Additive Category',
  '/additives': 'Additive Pricing',
  '/additive-form': 'New Additive',
  '/consumption-formula': 'Blending Formulation',
  '/consumption-formula-form': 'New Blending Formulation',
  '/consumptions': 'Consumption',
  '/consumption-form': 'New Consumption',
  '/product-formula': 'Packing Formulation',
  '/product-formula-form': 'New Packing Formulation',
  '/final-products': 'Final Product Cost',
  '/final-product-form': 'New Final Product',
  '/packing-consumptions': 'Packing Consumption Report',
  '/additive-consumptions': 'Additive Consumption Report',
  '/raw-consumptions': 'Raw Material Consumption Report',
};

export function getTitleForPath(pathname) {
  if (!pathname) return 'Dashboard';

  // 1. Exact match
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  // 2. Check dynamic / edit routes (e.g., /trade-form/184 -> "Edit Trade")
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length > 1) {
    const basePath = `/${pathParts[0]}`;
    const baseTitle = ROUTE_TITLES[basePath];
    if (baseTitle) {
      if (baseTitle.startsWith('New ')) {
        return baseTitle.replace('New ', 'Edit ');
      }
      return `Edit ${baseTitle}`;
    }
  }

  // 3. Fallback: format path segment to readable Title Case
  if (pathParts.length > 0) {
    const cleanSegment = pathParts[0].replace(/-/g, ' ');
    const formatted = cleanSegment.replace(/\b\w/g, (char) => char.toUpperCase());
    return pathParts.length > 1 ? `Edit ${formatted}` : formatted;
  }

  return 'Dashboard';
}

export default function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = getTitleForPath(location.pathname);
    document.title = pageTitle ? `${pageTitle} | KTB` : 'KTB';
  }, [location.pathname]);

  return null;
}
