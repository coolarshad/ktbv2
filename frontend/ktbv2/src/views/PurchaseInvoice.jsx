import React,{forwardRef} from 'react';

const PurchaseInvoice = () => {
  return (
    <div className="p-4 max-w-6xl mx-auto" >

    {/* Header Section */}
    <div className="text-center pb-3">
      <h1 className="text-xl font-bold">PURCHASE ORDER</h1>
    </div>

    {/* First Div with 2 Columns */}
    <div className="grid grid-cols-2 gap-0">
      {/* Col 1 with 3 Rows */}
      <div className="flex flex-col  border-l border-t border-r  border-black">
        <div className="border-b border-black px-2 py-2">
          <p className='font-light text-sm'>Invoice To</p>
          <p className='font-bold text-sm'>KISMAT PETROLEUM TRADING PTE LTD</p>
          <p className='text-sm'>
            50 RAFFLES PLACE,
            SINGAPORE LAND TOWER, LEVEL # 19-00, SINGAPORE 048623
          </p>
          <p className='mt-1'>
            Cmp Regn No. : <span className='font-bold'>201726590K</span>
          </p>
        </div>
        <div className=" border-black px-2 py-3">
          <p className=' pb-2'>Supplier</p>
          <p>NAME</p>
          <p>ADDRESS</p>
          <p>REGISTRATION NO.</p>
        </div>

      </div>

      {/* Col 2 with 2 Nested Columns (Col 3 and Col 4) */}
      <div className="grid grid-cols-2 gap-0 border-t border-r border-black">
        {/* Col 3 with 6 Rows */}
        <div className="flex flex-col justify-between border-r border-black">
          <div className="border-b border-black p-2 ">
            <p className='font-bold text-sm'>TRADE REFERANCE NO.</p>
            <p>XXXX</p>
          </div>
          <div className="border-b border-black p-2 ">
            <p className='font-bold text-sm'>Country of Origin</p>
            <p className='text-sm'>XXXXXXXXX</p>
          </div>
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>INCOTERM</p>
            <p className='text-sm'>XXX</p>
          </div>
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>Packing</p>
            <p className='text-sm'>XXXXXXX</p>
          </div>
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>CONTAINER SIZE</p>
            <p className='text-sm'>XXXXXXX</p>
          </div>
          <div className="p-2">
            <p className='font-bold text-sm'>
              ESTIMATED TIME OF DEPARTURE
            </p>
            <p className='text-sm'>XXXXXXXXXXXX</p>
          </div>
        </div>

        {/* Col 4 with 5 Rows */}
        <div className="flex flex-col ">
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>Dated</p>
            <p className='text-sm'>XX-XXX-XXXX</p>

          </div>
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>Terms of Payment</p>
            <p className='text-sm'>XXXXXXX</p>
          </div>
          <div className="border-b border-black p-2">
            <p className='font-bold text-sm'>Port of Loading</p>
            <p className='text-sm'>XXXXXXXX</p>
          </div>
          <div className="p-2">
            <p className='font-bold text-sm'>Port of Discharge</p>
            <p className='text-sm'>XXXXX</p>
          </div>

        </div>
      </div>
    </div>

    {/* Table Section */}
    <div className="">
      <table className="table-auto w-full border-collapse border border-black">
        <thead>
          <tr>
            <th className="border border-black p-2 text-sm">SN</th>
            <th className="border border-black p-2 text-sm">Description of Goods</th>
            <th className="border border-black p-2 text-sm">HS CODE</th>
            <th className="border border-black p-2 text-sm">Trade Quantity</th>
            <th className="border border-black p-2 text-sm">UNIT</th>
            <th className="border border-black p-2 text-sm">Rate</th>
            <th className="border border-black p-2 text-sm">CURRENCY</th>
            <th className="border border-black p-2 text-sm">TOLERANE</th>
            <th className="border border-black p-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-l border-r border-black p-2 text-sm">1</td>
            <td className="border-l border-r border-black p-2 font-bold text-sm">Base Oil</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-sm">XXXXXX</td>
            <td className="border-l border-r border-black p-2 text-right text-sm">XXXXXX</td>
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
            <td className="border border-black p-2 text-sm">Total</td>
            <td className="border border-black p-2 text-sm">XXXXX</td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2"></td>
            <td className="border border-black p-2 text-right text-sm">XXXXX</td>
          </tr>

        </tbody>
      </table>
    </div>

    {/* Final Div with 2 Rows */}
    <div className="flex flex-col gap-4 border-l border-r border-b border-black">
      {/* Row 1 */}
      <div className=" p-2">
        <p className='text-sm'>Amount Chargeable (in words)</p>
        <p className='font-bold mb-2 text-sm'>CURRENCY XXXXXXXXXX Only</p>
        <p className='text-sm'>DOUMENTS PROVIDED AGAINST SHIPMENT</p>
        <p className='text-sm'>1.</p>
        <p className='text-sm'>2.</p>
        <p className='text-sm'>3.</p>
        <p className='text-sm'>4.</p>
      </div>
      {/* Row 2 with 2 Columns */}
      <div className="grid grid-cols-2">
        <div className=" p-2">
          <p className='mb-8 font-bold text-sm'>Acknowledged By</p>
          <p className='font-bold text-sm'>Authorized Signatory with Seal</p>
        </div>
        <div className="border-t border-l border-black p-2">
          <p className='mb-8 font-bold text-sm'>for KISMAT PETROLEUM TRADING PTE LTD</p>
          <p className='text-right text-sm'>Authorised Signatory</p>
        </div>
      </div>
    </div>
    <div className="text-center pb-2 mt-1">
      <h1 className="text-sm font-md text-sm">This is a Computer Generated Invoice</h1>
    </div>
  </div>
  );
};

export default PurchaseInvoice;
