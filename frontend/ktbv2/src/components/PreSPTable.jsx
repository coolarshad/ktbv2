// src/components/TradeTable.js
import React,{useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseInvoice from "../views/PurchaseInvoice"

const PreSPTable = ({ data, onDelete }) => {
  const navigate = useNavigate();  
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const hiddenInvoiceRef = useRef(null);

  const handlePrint = () => {
    if (!hiddenInvoiceRef.current) return;

    const printContent = hiddenInvoiceRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=600,height=600');

    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
  };
  const handleEdit = (id) => {
    navigate(`/pre-sale-purchase-form/${id}`);  // Navigate to TradeForm with tradeId
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">S.N</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Doc Issuance Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">TRN</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Payment Term</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">LC Due Date</th>
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Remarks</th>
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Trade Qty</th> */}
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Product Code</th> */}
            {/* <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Reviewed</th> */}
            <th className="py-2 px-4 border-b border-gray-200 text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((presp, index) => (
            <tr key={index} onClick={() => handleRowClick({ id: 1, item: 'Item1', quantity: 10, price: 100 })}>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.doc_issuance_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.trn}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.payment_term}</td>
             
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.lc_due_date}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{presp.remarks}</td>
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">{trade.productCode}</td> */}
              {/* <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" checked={trade.reviewed} onChange={() => {}} />
              </td> */}
              <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium">
              <div className="space-x-2">
                  <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handlePrint}>Generate</button>
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(presp.id)}>Edit</button>
                  <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(presp.id)}>Delete</button>
                </div>
                {selectedInvoice && (
                  <div className="hidden">
                    <div ref={hiddenInvoiceRef}>
                      <PurchaseInvoice invoiceData={selectedInvoice} />
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreSPTable;
