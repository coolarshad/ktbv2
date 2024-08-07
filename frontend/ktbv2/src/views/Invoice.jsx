import React from 'react';

const Invoice = () => {
  return (
    <div className="p-8 max-w-3xl mx-auto border border-black">
      {/* Header Section */}
      <div className="border-b border-black pb-4">
        <h1 className="text-xl font-bold text-center">PROFORMA INVOICE</h1>
        <div className="flex justify-between mt-4">
          <div>
            <p><span className="font-semibold">Cmp Regn No.:</span> 201726590K</p>
            <p className="font-bold mt-2">KISMAT PETROLEUM TRADING PTE LTD</p>
            <p>50 RAFFLES PLACE,</p>
            <p>SINGAPORE LAND TOWER, LEVEL #19-00,</p>
            <p>SINGAPORE 048623</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Dated:</span> XX-XXX-XXXX</p>
            <p><span className="font-semibold">Country of Origin:</span> XXXXXXXXX</p>
            <p><span className="font-semibold">Terms of Payment:</span> XXXXXXX</p>
          </div>
        </div>
      </div>

      {/* Buyer & Amount Section */}
      <div className="border-b border-black py-4">
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Buyer</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Amount: Chargeable (in words)</p>
            <p className="font-bold">CURRENCY: XXXXXXXXXX Only</p>
          </div>
        </div>
      </div>

      {/* Declaration Section */}
      <div className="border-b border-black py-4">
        <p className="font-semibold underline">Declaration</p>
        <p className="mt-2">
          We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
        </p>
        <p className="mt-2">for KISMAT PETROLEUM TRADING PTE LTD</p>
        <p className="mt-2">Authorised Signatory</p>
        <p className="italic mt-2">This is a Computer Generated Invoice</p>
      </div>

      {/* Info Grid Section */}
      <div className="grid grid-cols-2 border-b border-black py-4">
        <div className="border-r border-black pr-4">
          <p><span className="font-semibold">NAME:</span></p>
          <p><span className="font-semibold">ADDRESS:</span></p>
          <p><span className="font-semibold">REGISTRATION NO.:</span></p>
          <p><span className="font-semibold">TRADE REFERENCE NO.:</span> XXXX</p>
        </div>
        <div className="pl-4">
          <p><span className="font-semibold">INCOTERM:</span> XXX</p>
          <p><span className="font-semibold">Port of Loading:</span> XXXXXXXX</p>
          <p><span className="font-semibold">Packing:</span> XXXXXX</p>
          <p><span className="font-semibold">Port of Discharge:</span> XXXXX</p>
          <p><span className="font-semibold">CONTAINER SIZE:</span> XXXXXXX</p>
        </div>
      </div>

      {/* Payment Section */}
      <div className="grid grid-cols-2 border-b border-black py-4">
        <div className="border-r border-black pr-4">
          <p><span className="font-semibold">ADVANCE AMOUNT:</span> XXXXX</p>
          <p><span className="font-semibold">BALANCE DUES:</span> XXXXXX</p>
          <p><span className="font-semibold">DOCUMENTS PROVIDED AGAINST SHIPMENT:</span></p>
          <ul className="list-disc list-inside">
            <li>1.</li>
            <li>2.</li>
            <li>3.</li>
            <li>4.</li>
          </ul>
        </div>
        <div className="pl-4">
          <p className="font-semibold">OUR BANK DETAILS</p>
          <ul className="list-disc list-inside">
            <li>XXXXX</li>
            <li>XXXX</li>
            <li>XXXX</li>
            <li>XXXX</li>
          </ul>
        </div>
      </div>

      {/* Table Section */}
      <div className="border-b border-black py-4">
        <table className="table-auto w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2">Description of Goods</th>
              <th className="border border-black p-2">Amount</th>
              <th className="border border-black p-2">HS CODE</th>
              <th className="border border-black p-2">CURRENCY</th>
              <th className="border border-black p-2">TOLERANCE</th>
              <th className="border border-black p-2">Trade Quantity</th>
              <th className="border border-black p-2">UNIT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">BASE OIL SN150</td>
              <td className="border border-black p-2">XXXXXX</td>
              <td className="border border-black p-2">XXXXX</td>
              <td className="border border-black p-2">XXXXX</td>
              <td className="border border-black p-2">XXXXX</td>
              <td className="border border-black p-2">XXXXX</td>
              <td className="border border-black p-2">XXXXX</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>

      {/* Due Dates Section */}
      <div className="grid grid-cols-2 border-b border-black py-4">
        <div className="border-r border-black pr-4">
          <p className="font-semibold">ADVANCE DUE DATE:</p>
          <p>XXXX</p>
        </div>
        <div className="pl-4">
          <p className="font-semibold">LC DUE DATE:</p>
          <p>XXXXXX</p>
          <p className="font-semibold mt-2">ESTIMATED TIME OF DEPARTURE:</p>
          <p>XXXXXXXXXXXX</p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 text-right">
        <p>Acknowledged By</p>
        <p>Authorized Signatory with Seal</p>
      </div>
    </div>
  );
};

export default Invoice;
