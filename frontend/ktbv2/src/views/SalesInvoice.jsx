import React from 'react';

const SalesInvoice = () => {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="text-center pb-3">
        <h1 className="text-xl font-bold">PROFORMA INVOICE</h1>
      </div>

      {/* First Div with 2 Columns */}
      <div className="grid grid-cols-2 gap-0">
        {/* Col 1 with 3 Rows */}
        <div className="flex flex-col  content-startjustify-between border-l border-t border-r  border-black">
          <div className="border-b border-black px-2 py-3">
            <p className='font-bold'>KISMAT PETROLEUM TRADING PTE LTD</p>
            <p>
            50 RAFFLES PLACE,
            SINGAPORE LAND TOWER, LEVEL # 19-00, SINGAPORE 048623
            </p>
            <p>
            Cmp Regn No. : <span className='font-bold'>201726590K</span>
            </p>
          </div>
          <div className="border-b border-black px-2 py-3">
            <p className=' pb-2'>Buyer</p>
            <p>NAME</p>
            <p>ADDRESS</p>
            <p>REGISTRATION NO.</p>
          </div>
          <div className="px-2 py-3">
            <p className=' pb-2'>OUR BANK DETAILS</p>
            <p>XXXXX</p>
            <p>XXXXX</p>
            <p>XXXXX</p>
          </div>
        </div>

        {/* Col 2 with 2 Nested Columns (Col 3 and Col 4) */}
        <div className="grid grid-cols-2 gap-0 border-t border-r border-black">
          {/* Col 3 with 6 Rows */}
          <div className="flex flex-col justify-between border-r border-black">
            <div className="border-b border-black p-2 ">
              <p className='font-bold'>TRADE REFERANCE NO.</p>
              <p>XXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>Country of Origin</p>
              <p>XXXXXXXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>INCOTERM</p>
              <p>XXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>Packing</p>
              <p>XXXXXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>CONTAINER SIZE</p>
              <p>XXXXXXX</p>
            </div>
            <div className="p-2">
              <p className='font-bold'>
              ESTIMATED TIME OF DEPARTURE
              </p>
              <p>XXXXXXXXXXXX</p>
            </div>
          </div>

          {/* Col 4 with 5 Rows */}
          <div className="flex flex-col justify-between">
            <div className="border-b border-black p-2">
              <p className='font-bold'>Dated</p>
              <p>XX-XXX-XXXX</p>
              
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>Terms of Payment</p>
              <p>XXXXXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>ADVANCE DUE DATE /</p>
              <p>XXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>LC DUE DATE</p>
              <p>XXXXXX</p>
            </div>
            <div className="border-b border-black p-2">
              <p className='font-bold'>Port of Loading</p>
              <p>XXXXXXXX</p>
            </div>
            <div className="p-2">
              <p className='font-bold'>Port of Discharge</p>
              <p>XXXXX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="">
        <table className="table-auto w-full border-collapse border border-black">
          <thead>
            <tr>
              <th className="border border-black p-2">SN</th>
              <th className="border border-black p-2">Description of Goods</th>
              <th className="border border-black p-2">HS CODE</th>
              <th className="border border-black p-2">Trade Quantity</th>
              <th className="border border-black p-2">UNIT</th>
              <th className="border border-black p-2">Rate</th>
              <th className="border border-black p-2">CURRENCY</th>
              <th className="border border-black p-2">TOLERANE</th>
              <th className="border border-black p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
          <tr>
              <td className="border-l border-r border-black p-2">1</td>
              <td className="border-l border-r border-black p-2 font-bold">Base Oil</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2">XXXXXX</td>
              <td className="border-l border-r border-black p-2 text-right">XXXXXX</td>
            </tr>
            {/* Additional rows can be added here */}
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
              <td className="border-l border-r border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2">Total</td>
              <td className="border border-black p-2">XXXXX</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2 text-right">XXXXX</td>
            </tr>
            <tr>
              <td colSpan={3} className="border-b border-black p-2 text-right">ADVANCE AMOUNT</td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2 text-right">XXXXX</td>
            </tr>
            <tr>
              <td colSpan={3} className="border-b border-black p-2 text-right">BALANCE DUES</td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2"></td>
              <td className="border-b border-black p-2 text-right">XXXXX</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Final Div with 2 Rows */}
      <div className="flex flex-col gap-4 border-l border-r border-b border-black">
        {/* Row 1 */}
        <div className=" p-2">
          <p>Amount Chargeable (in words)</p>
          <p className='font-bold'>CURRENCY XXXXXXXXXX Only</p>
          <p>DOCUMENTS PROVIDED AGAINST SHIPMENT</p>
          <p>1.</p>
          <p>2.</p>
          <p>3.</p>
          <p>4.</p>

          <p className='mt-4 underline'>Declaration</p>
          <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
        </div>
        {/* Row 2 with 2 Columns */}
        <div className="grid grid-cols-2">
          <div className=" p-2">
            <p className='mb-8 font-bold'>Acknowledged By</p>
            <p className='font-bold'>Authorized Signatory with Seal</p>
          </div>
          <div className="border-t border-l border-black p-2">
            <p className='mb-8 font-bold'>for KISMAT PETROLEUM TRADING PTE LTD</p>
            <p className='text-right'>Authorised Signatory</p>
          </div>
        </div>
      </div>
      <div className="text-center pb-2 mt-1">
        <h1 className="text-sm font-md">This is a Computer Generated Invoice</h1>
      </div>
    </div>
  );
};

export default SalesInvoice;
