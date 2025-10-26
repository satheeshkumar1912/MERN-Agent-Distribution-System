import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const UploadList = () => {
  const [file, setFile] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAgents, setFetchingAgents] = useState(true);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setFetchingAgents(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/agents', { headers: { 'x-auth-token': token } });
      setAgents(res.data || []);
    } catch (err) {
      setError('Failed to load agents');
      enqueueSnackbar('Failed to load agents', { variant: 'error' });
    } finally {
      setFetchingAgents(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      enqueueSnackbar('Please select a file', { variant: 'warning' });
      return;
    }

    if (agents.length === 0) {
      setError('No agents available for distribution. Please add agents first.');
      enqueueSnackbar('No agents available for distribution', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/upload', formData, { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } });
      enqueueSnackbar('File uploaded and processed successfully!', { variant: 'success' });
      setFile(null);
      // Reset the file input
      const inp = document.getElementById('file-upload'); if (inp) inp.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to upload file';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12, color: 'var(--primary-main)' }}>Upload List</h1>

      {error && (<div className="alert">{error}</div>)}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="paper">
            <form onSubmit={handleSubmit}>
              <h3>Upload CSV or Excel File</h3>
              <p style={{ color: '#666' }}>Upload your contact list to distribute among agents. The system will automatically distribute the records equally.</p>

              <div style={{ border: '2px dashed var(--primary-light)', borderRadius: 8, padding: 18, textAlign: 'center', backgroundColor: 'rgba(81,45,168,0.04)' }}>
                <label htmlFor="file-upload" className="btn">
                  Select File
                  <input type="file" id="file-upload" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                <div style={{ marginTop: 12 }}>
                  {file ? (
                    <div>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)</div>
                  ) : (
                    <div style={{ color: '#666' }}>Supported formats: CSV, Excel (.xlsx, .xls)</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn" style={{ width: '100%', marginTop: 12 }} disabled={loading || agents.length === 0 || !file}>{loading ? 'Processing...' : 'Upload and Distribute'}</button>
            </form>
          </div>
        </div>

        <div style={{ width: 320 }}>
          <div className="card">
            <h4>Agent Status</h4>
            <hr />
            {fetchingAgents ? (
              <div style={{ padding: 12 }}>Loading...</div>
            ) : agents.length === 0 ? (
              <div className="alert">No agents available. Please add agents before uploading lists.</div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <i className="fa fa-check-circle" style={{ color: 'green' }}></i>
                  <div>{agents.length} agents available for distribution</div>
                </div>
                <p style={{ color: '#666' }}>The system will distribute records equally among all available agents.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {agents.map(agent => (
                    <div key={agent._id} className="chip">{agent.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadList;