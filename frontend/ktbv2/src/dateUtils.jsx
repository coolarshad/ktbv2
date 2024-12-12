// dateUtils.js
export const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });

export const addDaysToDate = (date, days) => {
  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() + parseInt(days, 10));

  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const advanceToPay = (trade) => {
  return trade.presp.trade.trade_type === 'Purchase'
    ? trade.presp.trade.contract_value*(trade.presp.trade.paymentTerm.advance_in_percentage/100)
    : 'NA';
};

export const advanceToReceive = (trade) => {
  return trade.presp.trade.trade_type === 'Sales'
    ? trade.presp.trade.contract_value*(trade.presp.trade.paymentTerm.advance_in_percentage/100)
    : 'NA';
};

export const paymentDueDate = (data) => {
  const payment_within = data.trn.paymentTerm.payment_within;
  const payment_from = data.trn.paymentTerm.payment_from;

  if (payment_from === 'BL DATE') {
    return addDaysToDate(data.bl_date, payment_within);
  } else if (payment_from === 'CLEAN SHIPPING DOCUMENTS AS PER CONTRACT / PURCHASE ORDER') {
    return addDaysToDate(data.prepayment.presp.doc_issuance_date, payment_within);
  } else if (payment_from === 'PURCHASE BILL DATE') {
    return addDaysToDate(data.invoice_date, payment_within);
  } else if (payment_from === 'SALES BILL DATE') {
    return addDaysToDate(data.invoice_date, payment_within);
  } else {
    return 'NA';
  }
};


export const calculateRemainingContractValue = (data) => {
  const contractValue = parseFloat(data.trn.contract_value);
  let advance=0;
  if(data.trn.trade_type=='Sales'){
     advance = parseFloat(data.prepayment.advance_received);
  }
  if(data.trn.trade_type=='Purchase'){
      advance = parseFloat(data.prepayment.advance_paid);
  }

  if (isNaN(contractValue) || isNaN(advance)) {
    throw new Error('Invalid input: contract_value and invoice_amount must be valid numbers');
  }

  return contractValue - advance;
};

export const calculatePFCommissionValue = (data) => {
  const trade_products = data.sp?data.sp.trn.trade_products:data.trn.trade_products;
  const sp_product = data.sp?data.sp.sp_product:data.sp_product;
  let commissionValue = 0;

  sp_product.forEach(item => {
    const matchedProduct = trade_products.find(product => product.product_code === item.product_code);
    if (matchedProduct) { // Ensure a matching product is found
      commissionValue += item.bl_qty * matchedProduct.commission_rate;
    }
  });

  return commissionValue;
};