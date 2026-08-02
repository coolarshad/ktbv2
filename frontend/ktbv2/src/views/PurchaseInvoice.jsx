import React, { forwardRef } from 'react';
import { useAuth } from '../context/AuthContext';

const PurchaseInvoice = () => {
  const { user } = useAuth();
  return (
    <div className="p-4 max-w-6xl mx-auto print-page-a4">

      {/* Header Section */}
      <div className="text-center pb-2">
        <h1 className="text-xl font-bold">PURCHASE ORDER</h1>
      </div>

      {/* First Div with 2 Columns */}
      <div className="grid grid-cols-2 gap-0">
        {/* Col 1 with 3 Rows */}
        <div className="flex flex-col justify-between border-l border-t border-r border-black">
          <div className="border-b border-black px-2 py-1.5">
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
          <div className=" border-black px-2 py-1.5">
            <p className=' pb-1'>Supplier</p>
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
        <table className="table-fixed w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black px-1 py-1.5 w-[4%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">SN</th>
              <th className="border border-black px-1.5 py-1.5 w-[26%] text-left text-xs font-bold break-words [overflow-wrap:anywhere]">Description of Goods</th>
              <th className="border border-black px-1 py-1.5 w-[9%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">HS CODE</th>
              <th className="border border-black px-1 py-1.5 w-[10%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">Trade Quantity</th>
              <th className="border border-black px-1 py-1.5 w-[6%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">UNIT</th>
              <th className="border border-black px-1 py-1.5 w-[9%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">Rate</th>
              <th className="border border-black px-1 py-1.5 w-[11%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">Packing</th>
              <th className="border border-black px-1 py-1.5 w-[10%] text-center text-xs font-bold break-words [overflow-wrap:anywhere]">TOLERANCE</th>
              <th className="border border-black px-1.5 py-1.5 w-[15%] text-right text-xs font-bold break-words [overflow-wrap:anywhere]">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">1</td>
              <td className="border-l border-r border-black px-1.5 py-1 font-bold text-xs break-words [overflow-wrap:anywhere]">Base Oil</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1 py-1 text-xs text-center break-words [overflow-wrap:anywhere]">XXXXXX</td>
              <td className="border-l border-r border-black px-1.5 py-1 text-xs text-right break-words [overflow-wrap:anywhere]">XXXXXX</td>
            </tr>
            {/* Additional rows can be added here */}
            {Array.from({ length: 3 }, (_, index) => (
              <tr key={index}>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1.5 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1 py-1">&nbsp;</td>
                <td className="border-l border-r border-black px-1.5 py-1">&nbsp;</td>
              </tr>
            ))}
            <tr className="font-bold border-t border-black">
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1.5 py-1"></td>
              <td className="border border-black px-1 py-1 text-xs text-center font-bold">Total</td>
              <td className="border border-black px-1 py-1 text-xs text-center font-bold">XXXXX</td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1.5 py-1 text-right text-xs font-bold">XXXXX</td>
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
          <p className='text-sm'>DOCUMENTS PROVIDED AGAINST SHIPMENT</p>
          <p className='text-sm'>1.</p>
          <p className='text-sm'>2.</p>
          <p className='text-sm'>3.</p>
          <p className='text-sm'>4.</p>
        </div>
        {/* Row 2 with 2 Columns */}
        <div className="grid grid-cols-2">
          <div className=" p-2">
            <p className='mb-3 font-bold text-sm'>Acknowledged By</p>
            <p className='font-bold text-sm'>Authorized Signatory with Seal</p>
          </div>
          <div className="border-t border-l border-black p-2">
            <p className='mb-3 font-bold text-sm'>for KISMAT PETROLEUM TRADING PTE LTD</p>
            <p className='text-right text-sm'>Authorised Signatory</p>
          </div>
        </div>
      </div>
      <div className="text-center pb-1 mt-1">
        <h1 className="text-xs font-medium text-gray-700">This is a Computer Generated Invoice</h1>
      </div>
    </div>
  );
};

export default PurchaseInvoice;
