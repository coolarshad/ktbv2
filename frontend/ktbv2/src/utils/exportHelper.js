export const getExportFileName = (fileNameProp, downloadUrl = '', response = null, extraParams = {}) => {
  if (fileNameProp && typeof fileNameProp === 'string' && fileNameProp.trim()) {
    let name = fileNameProp.trim();
    if (!name.toLowerCase().endsWith('.xlsx')) {
      name += '.xlsx';
    }
    return name;
  }

  // Check Content-Disposition header if available
  const contentDisposition = response?.headers?.['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    if (filenameMatch && filenameMatch[1]) {
      let fname = filenameMatch[1].trim();
      if (!fname.toLowerCase().endsWith('.xlsx')) {
        fname += '.xlsx';
      }
      return fname;
    }
  }

  // Fallback derivation from downloadUrl & extraParams
  const url = (downloadUrl || '').toLowerCase();
  if (url.includes('/excel/export/kyc/')) return 'KYC_export.xlsx';
  if (url.includes('/excel/export/trade-pending/')) {
    if (extraParams.trade_type === 'Sales') return 'Sales_Pending_export.xlsx';
    if (extraParams.trade_type === 'Purchase') return 'Purchase_Pending_export.xlsx';
    return 'Trade_Pending_export.xlsx';
  }
  if (url.includes('/excel/export/product-trace/')) {
    if (extraParams.trade_type === 'Sales') return 'Sales_Product_Trace_export.xlsx';
    if (extraParams.trade_type === 'Purchase') return 'Purchase_Product_Trace_export.xlsx';
    return 'Product_Trace_export.xlsx';
  }
  if (url.includes('/excel/export/trade/')) {
    if (extraParams.pending === true) return 'Trade_Approval_export.xlsx';
    if (extraParams.pending === false) return 'Trade_Approved_export.xlsx';
    return 'Trade_export.xlsx';
  }
  if (url.includes('/excel/export/presp/')) return 'Pre_Sale_Purchase_export.xlsx';
  if (url.includes('/excel/export/prepay/')) return 'Pre_Payment_export.xlsx';
  if (url.includes('/excel/export/sp/')) return 'Sales_Purchases_export.xlsx';
  if (url.includes('/excel/export/pf/')) return 'Payment_Finance_export.xlsx';
  if (url.includes('/excel/export/pl/')) return 'Profit_Loss_export.xlsx';
  if (url.includes('/excel/export/inventory/')) return 'Inventory_export.xlsx';
  if (url.includes('/excel/export/product-ref/')) return 'Product_Ref_export.xlsx';
  if (url.includes('/excel/export/consumption-formula/')) return 'Blending_Formulation_export.xlsx';
  if (url.includes('/excel/export/packing/')) return 'Packing_export.xlsx';
  if (url.includes('/excel/export/raw-material/')) return 'Raw_Material_export.xlsx';
  if (url.includes('/excel/export/additive/')) return 'Additive_export.xlsx';
  if (url.includes('/excel/export/final-product/')) return 'Final_Product_export.xlsx';
  if (url.includes('/excel/export/product-formula/')) return 'Packing_Formulation_export.xlsx';
  if (url.includes('/excel/export/consumption/')) return 'Consumption_export.xlsx';
  if (url.includes('/excel/export/raw-category/')) return 'Raw_Category_export.xlsx';
  if (url.includes('/excel/export/additive-category/')) return 'Additive_Category_export.xlsx';
  if (url.includes('/excel/export/category/')) return 'Category_export.xlsx';
  if (url.includes('/excel/export/report/packing-cons/')) return 'Packing_Consumption_export.xlsx';
  if (url.includes('/excel/export/report/additive-cons/')) return 'Additive_Consumption_export.xlsx';
  if (url.includes('/excel/export/report/raw-cons/')) return 'Raw_Consumption_export.xlsx';

  return 'data_export.xlsx';
};
