import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import KycTable from '../components/KycTable';
import Modal from '../components/Modal';

const Kyc = () => {


    const navigate = useNavigate();
    const [kycData, setKycData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKyc, setSelectedKyc] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('/trademgt/kyc/'); 
          setKycData(response.data);
        } catch (error) {
          setError('Failed to fetch trade data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);

    const handleAddKycClick = () => {
      navigate('/kyc-form');
    };

    const handleDelete = async (id) => {
      const confirmed = window.confirm('Are you sure you want to delete this kyc?');
      if (confirmed) {
        try {
          await axios.delete(`/trademgt/kyc/${id}/`);
          setKycData(kycData.filter(kyc => kyc.id !== id));
          alert('KYC deleted successfully.');
        } catch (error) {
          console.error('Error deleting KYC:', error);
          alert('Failed to delete KYC.');
        }
      }
    };

    const handleViewClick = async (id) => {
      try {
        const response = await axios.get(`/trademgt/kyc/${id}/`);
        setSelectedKyc(response.data);
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching kyc details:', error);
      }
    };

    const closeModal = () => {
      setIsModalOpen(false);
      setKycData(null);
    };
  

    const handleFilter = (filters) => {
      setKycData(filters)
    };
    
    const fieldOptions = [
      { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
      { value: 'companyRegNo', label: 'Company Reg No' },
      { value: 'person1', label: 'Person 1' },
      { value: 'person2', label: 'Person 2' },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
        <div className="w-full h-full rounded bg-slate-200  p-3	">
        <p className="text-xl">KYC</p>
        <button
          onClick={handleAddKycClick}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          +
        </button>
        <div>
        <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/kyc'} fieldOptions={fieldOptions} />
        </div>
        <div className=" rounded p-2">
        <KycTable data={kycData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedKyc && (
           <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
           <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
             <button onClick={closeModal} className="float-right text-red-500">Close</button>
             <h2 className="text-2xl mb-2 text-center">Trade Details</h2>
             <hr className='mb-2' />
             <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm ">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                  <th className="py-2 px-4 text-left text-gray-700 font-semibold">Field</th>
                  <th className="py-2 px-4 text-left text-gray-700 font-semibold">Value</th>
                  </tr>
                </thead>
             
                <tbody>
                  
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Date </td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.date}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Name</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Company Reg.No</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.companyRegNo}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Reg Address</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.regAddress}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Mailing Address</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.mailingAddress}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Telephone</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.telephone}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Fax</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.fax}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Person 1</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.person1}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Designation 1</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.designation1}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Mobile 1</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.mobile1}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Email 1</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.email1}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Person 2</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.person2}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Designation 2</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.designation2}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Mobile 2</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.mobile2}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Email 2</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.email2}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Banker</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.banker}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Address</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.address}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Swift Code</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.swiftCode}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Account Number</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.accountNumber}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve 1</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.approve1? "Yes":"No"}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve 2</td>
                    <td className="py-2 px-4 text-gray-800">{selectedKyc.approve2? "Yes":"No"}</td>
                  </tr>
                 
                </tbody>
                </table>
             </div>
            
           </div>
         </div>
        )}
      </Modal>
        </>
    );
};

export default Kyc;
