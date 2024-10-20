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