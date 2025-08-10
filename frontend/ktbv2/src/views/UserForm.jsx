import { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from '../axiosConfig';
import { toast } from "react-toastify";

const UserForm = ({mode}) => {
  const { userId } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios.get(`/accounts/users/${userId}/`)
        .then(res => setFormData(res.data))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

     const handleSubmit = e => {
    e.preventDefault();

    const request = userId
      ? axios.put(`/accounts/users/${userId}/`, formData, {
          headers: { "Content-Type": "application/json" }
        })
      : axios.post(`/accounts/users/`, formData, {
          headers: { "Content-Type": "application/json" }
        });

    request
      .then(res => {
        toast.success(res.data?.message || "User saved successfully");
        setFormData({ name: "", email: "", phone: "", designation: "", role: "" });
        navigate(-1);
      })
      .catch(err => {
        const errorMsg = err.response?.data
          ? JSON.stringify(err.response.data)
          : "Something went wrong";
        toast.error(errorMsg);
        console.error(err);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-4 border rounded shadow">
      <h2 className="text-xl font-semibold">{userId ? 'Update User' : 'Create User'}</h2>

      {['name', 'email', 'phone', 'designation', 'role'].map(field => (
        <div key={field}>
          <label className="block capitalize mb-1">{field}</label>
          <input
            name={field}
            value={formData[field] || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required={field === 'name' || field === 'email'}
          />
        </div>
      ))}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {userId ? 'Update' : 'Create'}
      </button>
    </form>
  );
};

export default UserForm;
