import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import FilterComponent from '../components/FilterComponent';
import KycTable from '../components/KycTable';
import Modal from '../components/Modal';
import MultiUserSelector from '../components/MultiUserSelector';
import { hasPermission, BASE_URL } from '../utils';
import Loading from '../components/Loading';
import { toast } from 'react-toastify';

const Kyc = () => {
  const { user } = useAuth();
  const BACKEND_URL = BASE_URL || "http://localhost:8000";

  const navigate = useNavigate();
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [notifiedUsers, setNotifiedUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
    setSelectedKyc(null);
    setNotifiedUsers([]);
    setNotificationMessage("");
  };

  const handleModalFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedKyc) return;

    const formDataToSend = new FormData();
    files.forEach((file, idx) => {
      formDataToSend.append(`documents[${idx}].file`, file);
      formDataToSend.append(`documents[${idx}].name`, file.name.replace(/\.[^/.]+$/, ''));
    });

    try {
      setIsUploading(true);
      const res = await axios.post(`/trademgt/kyc/${selectedKyc.id}/upload-documents/`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedKyc(res.data);
      alert('Documents uploaded and backed up to Google Drive successfully!');
    } catch (err) {
      console.error('Failed to upload documents', err);
      alert('Failed to upload documents.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };


  const handleFilter = (filters) => {
    setKycData(filters)
  };

  const approveKycOne = async () => {
    if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before approving.");
      return;
    }
    try {
      const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append('notifiedUsers[]', id));
      if (notificationMessage) {
        params.append('notification_message', notificationMessage);
      }
      await axios.get(`/trademgt/kyc-approve-one/${selectedKyc.id}/?${params.toString()}`);
      setIsModalOpen(false);
      setSelectedKyc(null);
      setNotifiedUsers([]);
      setNotificationMessage("");
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving Kyc Level 1:', error);
      const msg = error.response?.data?.detail || 'Error approving KYC Level 1';
      toast.error(msg);
      alert(msg);
    }
  };

  const approveKycTwo = async () => {
    if (!notifiedUsers || notifiedUsers.length === 0) {
      alert("Please select at least one user to notify before approving.");
      return;
    }
    try {
      const params = new URLSearchParams();
      notifiedUsers.forEach(id => params.append('notifiedUsers[]', id));
      if (notificationMessage) {
        params.append('notification_message', notificationMessage);
      }
      await axios.get(`/trademgt/kyc-approve-two/${selectedKyc.id}/?${params.toString()}`);
      setIsModalOpen(false);
      setSelectedKyc(null);
      setNotifiedUsers([]);
      setNotificationMessage("");
      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving Kyc Level 2:', error);
      const msg = error.response?.data?.detail || 'Error approving KYC Level 2';
      toast.error(msg);
      alert(msg);
    }
  };

  const fieldOptions = [
    { value: 'name', label: 'Name' },  // Trade TRN field in PreSalePurchase filter
    { value: 'companyRegNo', label: 'Company Reg No' },
    { value: 'person1', label: 'Person 1' },
    { value: 'person2', label: 'Person 2' },
  ];

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="w-full h-full rounded bg-slate-200 p-3 flex flex-col">
        <div className="sticky top-0 z-20 bg-slate-200 pt-1 pb-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">KYC</h1>
              {hasPermission(user, 'create_kyc') && (
                <button
                  onClick={handleAddKycClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 rounded-md font-bold flex items-center justify-center transition shadow-sm text-base leading-none"
                  title="Create New KYC"
                >
                  +
                </button>
              )}
            </div>
          </div>
          <div>
            <FilterComponent checkBtn={false} flag={2} onFilter={handleFilter} apiEndpoint={'/trademgt/kyc'} fieldOptions={fieldOptions} downloadUrl="/excel/export/kyc/" fileName="KYC_export" />
          </div>
        </div>
        <div className="rounded py-1 flex-1">
          <KycTable data={kycData} onDelete={handleDelete} onView={handleViewClick} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedKyc && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-3/4 h-3/4 p-4 overflow-auto">
              <button onClick={closeModal} className="float-right text-red-500">Close</button>
              <h2 className="text-2xl mb-2 text-center">KYC Details</h2>
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
                    {/* <tr className="border-b border-gray-200">
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
                  </tr> */}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve 1</td>
                      <td className="py-2 px-4 text-gray-800">
                        {selectedKyc.approve1 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-600 font-medium capitalize">Approve 2</td>
                      <td className="py-2 px-4 text-gray-800">
                        {selectedKyc.approve2 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr className="bg-gray-200 font-semibold">
                      <td className="py-2 px-4" colSpan={2}>Bank Details</td>
                    </tr>
                    {selectedKyc.bank_details && selectedKyc.bank_details.length > 0 ? (
                      selectedKyc.bank_details.map((bank, index) => (
                        <React.Fragment key={index}>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="py-2 px-4 font-medium capitalize">Banker #{index + 1}</td>
                            <td className="py-2 px-4">{bank.banker}</td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="py-2 px-4 font-medium capitalize">Address #{index + 1}</td>
                            <td className="py-2 px-4">{bank.address}</td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="py-2 px-4 font-medium capitalize">Swift Code #{index + 1}</td>
                            <td className="py-2 px-4">{bank.swiftCode}</td>
                          </tr>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td className="py-2 px-4 font-medium capitalize">Account Number #{index + 1}</td>
                            <td className="py-2 px-4">{bank.accountNumber}</td>
                          </tr>
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 px-4 text-gray-600" colSpan={2}>No bank details available</td>
                      </tr>
                    )}

                    <tr className="bg-gray-200 font-semibold">
                      <td className="py-2 px-4" colSpan={2}>
                        <div className="flex justify-between items-center">
                          <span>KYC Documents</span>
                          <label className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-normal px-2.5 py-1 rounded cursor-pointer shadow inline-flex items-center gap-1">
                            <span>{isUploading ? 'Uploading...' : '+ Upload Document'}</span>
                            <input
                              type="file"
                              multiple
                              disabled={isUploading}
                              onChange={handleModalFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                    {selectedKyc.documents && selectedKyc.documents.length > 0 ? (
                      selectedKyc.documents.map((doc, index) => (
                        <tr key={doc.id || index} className="border-b border-gray-200 bg-gray-50">
                          <td className="py-2 px-4 font-medium capitalize">
                            {doc.name || `Document #${index + 1}`}
                          </td>
                          <td className="py-2 px-4">
                            <a
                              href={doc.file?.startsWith('http') ? doc.file : `${BACKEND_URL}${doc.file?.startsWith('/') ? '' : '/'}${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              View / Download
                            </a>
                            {doc.uploaded_at && (
                              <span className="text-xs text-gray-400 ml-2">
                                ({new Date(doc.uploaded_at).toLocaleDateString()})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2 px-4 text-gray-600" colSpan={2}>No documents uploaded yet</td>
                      </tr>
                    )}

                  </tbody>
                </table>

                {/* Notified Users Section */}
                <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
                  <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
                  {selectedKyc?.notified_users_emails?.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {selectedKyc.notified_users_emails.map((email, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{email}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No users have been notified for this record.</p>
                  )}
                </div>

                {((!selectedKyc.approve1 && hasPermission(user, ['approve1_kyc', 'approve_kyc_1'])) ||
                  (!selectedKyc.approve2 && hasPermission(user, ['approve2_kyc', 'approve_kyc_2']))) && (
                  <div className="mt-6 border-t pt-4">
                    <MultiUserSelector
                      selectedUsers={notifiedUsers}
                      onChange={setNotifiedUsers}
                      message={notificationMessage}
                      onMessageChange={setNotificationMessage}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-4 mb-4">
                  {hasPermission(user, ['approve1_kyc', 'approve_kyc_1']) && !selectedKyc.approve1 && (
                    <button
                      onClick={approveKycOne}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded font-semibold transition shadow flex items-center gap-2"
                    >
                      ✓ Approve KYC 1
                    </button>
                  )}
                  {hasPermission(user, ['approve2_kyc', 'approve_kyc_2']) && !selectedKyc.approve2 && (
                    <button
                      onClick={approveKycTwo}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded font-semibold transition shadow flex items-center gap-2"
                    >
                      ✓ Approve KYC 2
                    </button>
                  )}
                </div>

                {selectedKyc.approve1 && selectedKyc.approve2 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-center font-medium">
                    ✓ Fully Approved (KYC 1 & KYC 2 Approved)
                  </div>
                )}



              </div>

            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Kyc;
