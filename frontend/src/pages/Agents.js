import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/agents', { headers: { 'x-auth-token': token } });
      setAgents(res.data || []);
    } catch (err) {
      setError('Failed to load agents');
      enqueueSnackbar('Failed to load agents', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agent) => {
    if (!window.confirm(`Delete agent ${agent.name}? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/agents/${agent._id}`, { headers: { 'x-auth-token': token } });
      setAgents(prev => prev.filter(a => a._id !== agent._id));
      enqueueSnackbar('Agent deleted successfully', { variant: 'success' });
    } catch (err) {
      setError('Failed to delete agent');
      enqueueSnackbar('Failed to delete agent', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
        <div>Loading agents...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8, fontWeight: 'bold', color: 'var(--primary-main)' }}>Agents</h1>
      <p style={{ marginTop: 0, marginBottom: 18, color: '#666' }}>Manage your agents and their information</p>

      {error && (
        <div className="alert" style={{ marginBottom: 18 }}>{error}</div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Link to="/add-agent" className="btn">Add New Agent</Link>
      </div>

      {agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 18 }}>No agents found. Please add some agents.</div>
        </div>
      ) : (
        <div className="grid">
          {agents.map(agent => (
            <div className="grid-item md-4" key={agent._id}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <i className="fa fa-user" style={{ marginRight: 8, color: 'var(--primary-main)' }}></i>
                  <div style={{ fontWeight: 600 }}>{agent.name}</div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '8px 0 16px' }} />
                <div style={{ marginBottom: 8 }}><i className="fa fa-envelope" style={{ marginRight: 8 }}></i>{agent.email}</div>
                <div style={{ marginBottom: 12 }}><i className="fa fa-phone" style={{ marginRight: 8 }}></i>{agent.mobile}</div>
                <div>
                  <button className="btn delete" onClick={() => handleDelete(agent)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;