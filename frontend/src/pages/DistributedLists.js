import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const DistributedLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/upload/lists', { headers: { 'x-auth-token': token } });
      setLists(res.data || []);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to load distributed lists');
      enqueueSnackbar('Failed to load distributed lists', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
        <div>Loading lists...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8, fontWeight: 'bold', color: 'var(--primary-main)' }}>Distributed Lists</h1>
      <p style={{ marginTop: 0, marginBottom: 18, color: '#666' }}>View and manage your distributed contact lists</p>

      {error && (<div className="alert">{error}</div>)}

      {lists.length === 0 ? (
        <div className="paper" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>📋</div>
          <h3>No Lists Available</h3>
          <p style={{ color: '#666' }}>No lists have been distributed yet. Please upload a CSV or Excel file first.</p>
        </div>
      ) : (
        <div className="grid">
          {lists.map((list) => (
            <div className="grid-item md-4" key={list.agentId}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--primary-main)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{list.agentName?.charAt(0) || 'A'}</div>
                  <div style={{ fontWeight: 700 }}>{list.agentName || 'Unknown Agent'}</div>
                  <div style={{ marginLeft: 'auto' }} className="chip">{(list.itemCount || 0) + ' items'}</div>
                </div>

                <div style={{ paddingBottom: 8 }}>
                  <div style={{ color: '#666' }}>{list.agentEmail || 'No email available'}</div>
                </div>

                <hr />

                <div style={{ padding: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Assigned Items</div>
                  <table className="table">
                    <thead>
                      <tr><th>Name</th><th>Phone</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                      {list.items && list.items.length > 0 ? (
                        list.items.map((item, idx) => (
                          <tr key={idx}><td>{item.firstName || 'N/A'}</td><td>{item.phone || 'N/A'}</td><td>{item.notes || '-'}</td></tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} style={{ textAlign: 'center' }}>No items available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistributedLists;






