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
  return trade.trade_type === 'Purchase'
    ? trade.presp.trade.contract_value*(trade.presp.trade.paymentTerm.advance_in_percentage/100) || ''
    : 'NA';
};

export const advanceToReceive = (trade) => {
  return trade.trade_type === 'Sales'
    ? trade.presp.trade.contract_value*(trade.presp.trade.paymentTerm.advance_in_percentage/100) || ''
    : 'NA';
};

export const paymentDueDate = (data) => {
  const payment_within=data.sp.trn.paymentTerm.payment_within;
  const payment_from=data.sp.trn.paymentTerm.payment_from;
  // print(data.sp.bl_date,payment_from)
  
  return addDaysToDate(data.sp.bl_date,payment_within)
};