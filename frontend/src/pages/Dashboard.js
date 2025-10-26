import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const Dashboard = () => {
  const [stats, setStats] = useState({
    agentCount: 0,
    listItemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const agentsRes = await axios.get('/api/agents', { headers: { 'x-auth-token': token } });
        const agents = agentsRes.data;
        const listsRes = await axios.get('/api/upload/lists', { headers: { 'x-auth-token': token } });
        const lists = listsRes.data;

        const totalItems = (lists || []).reduce((total, list) => total + (list.itemCount || 0), 0);

        setStats({
          agentCount: agents.length,
          listItemCount: totalItems
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8, fontWeight: 'bold', color: 'var(--primary-main)' }}>Dashboard</h1>
      <p style={{ marginTop: 0, marginBottom: 18, color: '#666' }}>Overview of your agents and distributed lists</p>

      {error && (<div className="alert">{error}</div>)}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }} className="card">
          <div style={{ marginBottom: 12 }}><strong>Total Agents</strong></div>
          <div style={{ fontSize: 36, color: 'var(--primary-main)', fontWeight: 700 }}>{stats.agentCount}</div>
          <div style={{ marginTop: 12 }}><Link to="/agents" className="btn" style={{ background: 'transparent', color: 'var(--primary-main)', border: '1px solid var(--primary-main)' }}>View Agents</Link></div>
        </div>

        <div style={{ flex: 1, minWidth: 260 }} className="card">
          <div style={{ marginBottom: 12 }}><strong>Total List Items</strong></div>
          <div style={{ fontSize: 36, color: 'var(--primary-main)', fontWeight: 700 }}>{stats.listItemCount}</div>
          <div style={{ marginTop: 12 }}><Link to="/distributed-lists" className="btn" style={{ background: 'transparent', color: 'var(--primary-main)', border: '1px solid var(--primary-main)' }}>View Lists</Link></div>
        </div>
      </div>

      <hr style={{ margin: '24px 0' }} />

      <h3>Quick Actions</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link to="/add-agent" className="btn">Add New Agent</Link>
        <Link to="/upload-list" className="btn">Upload List</Link>
      </div>
    </div>
  );
};

export default Dashboard;