import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AddAgent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/agents', formData, { headers: { 'x-auth-token': token } });
      setLoading(false);
      enqueueSnackbar('Agent added successfully!', { variant: 'success' });
      navigate('/agents');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add agent';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12, color: 'var(--primary-main)' }}>Add New Agent</h1>

      {error && <div className="alert">{error}</div>}

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="paper">
          <form onSubmit={handleSubmit}>
            <h3>Agent Information</h3>
            <input className="input" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input className="input" name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} required style={{ marginTop: 10 }} />
            <input className="input" name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} required style={{ marginTop: 10 }} />
            <input className="input" name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required style={{ marginTop: 10 }} />

            <button type="submit" className="btn" style={{ width: '100%', marginTop: 16 }} disabled={loading}>{loading ? 'Adding...' : 'Add Agent'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAgent;