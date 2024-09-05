import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

const DocumentsRequiredForm = ({ mode = 'add', documentId = null }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [documents, setDocuments] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentDocumentId, setCurrentDocumentId] = useState(documentId);

  useEffect(() => {
    if (currentMode === 'update' && currentDocumentId) {
      axios.get(`/trademgt/documents/${currentDocumentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the document data!', error);
        });
    }

    axios.get('/trademgt/documents/')
      .then(response => {
        const docs = response.data;
        if (Array.isArray(docs)) {
          setDocuments(docs);
        } else {
          console.error('Expected an array but got:', docs);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the documents!', error);
      });
  }, [currentMode, currentDocumentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMode === 'add') {
      axios.post('/trademgt/documents/', formData)
        .then(response => {
          setDocuments(prevDocs => [...prevDocs, response.data]);
          setFormData({ name: '' }); // Reset form after add
        })
        .catch(error => {
          console.error('There was an error adding the document!', error);
        });
    } else if (currentMode === 'update' && currentDocumentId) {
      axios.put(`/trademgt/documents/${currentDocumentId}/`, formData)
        .then(response => {
          setDocuments(prevDocs => prevDocs.map(doc => doc.id === response.data.id ? response.data : doc));
          setCurrentMode('add');  // Reset to 'add' mode after update
          setCurrentDocumentId(null);  // Reset currentDocumentId
          setFormData({ name: '' }); // Reset form after update
        })
        .catch(error => {
          console.error('There was an error updating the document!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/trademgt/documents/${id}`)
      .then(() => {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the document!', error);
      });
  };

  const handleUpdate = (id) => {
    setCurrentMode('update');
    setCurrentDocumentId(id);
    setFormData(documents.find(doc => doc.id === id) || { name: '' });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
        <div className="grid grid-cols-1 gap-4 p-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {currentMode === 'add' ? 'Add Document' : 'Update Document'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div className="space-y-4 w-full lg:w-2/3 mx-auto">
        <h2 className="text-xl font-semibold mb-4">Existing Documents</h2>
        <ul className="space-y-4">
          {documents.map(doc => (
            <li key={doc.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{doc.name}</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(doc.id)}
                  className="bg-green-500 text-white p-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentsRequiredForm;
