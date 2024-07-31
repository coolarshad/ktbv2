import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentsRequiredForm = ({ mode = 'add', documentId = null }) => {
  const [formData, setFormData] = useState({
    name: ''
  });

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (mode === 'update' && documentId) {
      // Fetch the existing document data from the API
      axios.get(`/api/documents-required/${documentId}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the document data!', error);
        });
    }

    // Fetch all documents
    axios.get('/api/documents-required')
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
  }, [mode, documentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add') {
      // Post new document data to API
      axios.post('/api/documents-required', formData)
        .then(response => {
          console.log('Document added successfully!', response.data);
          setDocuments(prevDocs => [...prevDocs, response.data]);
        })
        .catch(error => {
          console.error('There was an error adding the document!', error);
        });
    } else if (mode === 'update') {
      // Put updated document data to API
      axios.put(`/api/documents-required/${documentId}`, formData)
        .then(response => {
          console.log('Document updated successfully!', response.data);
          setDocuments(prevDocs => prevDocs.map(doc => doc.id === response.data.id ? response.data : doc));
        })
        .catch(error => {
          console.error('There was an error updating the document!', error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/api/documents-required/${id}`)
      .then(() => {
        console.log('Document deleted successfully!');
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the document!', error);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            {mode === 'add' ? 'Add Document' : 'Update Document'}
          </button>
        </div>
      </form>

      <hr className="my-6" />

      {/* List of Existing Documents */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Documents</h2>
        <ul className="space-y-4">
          {documents.map(doc => (
            <li key={doc.id} className="border border-gray-300 p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{doc.name}</h3>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentsRequiredForm;
