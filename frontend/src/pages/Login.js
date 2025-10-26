import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ login: loginUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      loginUser(response.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      // background: 'linear-gradient(to right, #e2e2e2, #c9d6ff)',
      background: '#1b1919ff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: 360 }}>
        <div className="paper">
          <div style={{
            width: 56,
            height: 56,
            background: 'var(--primary-main)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }}>
            <i className="fa fa-lock"></i>
          </div>

          <h2 style={{ textAlign: 'center', margin: '0 0 12px'}}>Admin Login</h2>

          {error && <div className="alert">{error}</div>}

          <form onSubmit={onSubmit}>
            <input className="input" id="email" name="email" placeholder="Email Address" autoComplete="email" autoFocus value={email} onChange={onChange} required />
            <input className="input" style={{ marginTop: 10 }} name="password" placeholder="Password" type="password" id="password" autoComplete="current-password" value={password} onChange={onChange} required />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: 16 }} disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;