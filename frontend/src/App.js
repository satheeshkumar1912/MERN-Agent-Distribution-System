import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/style.css';
import { SnackbarProvider } from 'notistack';
import './App.css';
// Add Font Awesome for icons
import '@fortawesome/fontawesome-free/css/all.css';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AddAgent from './pages/AddAgent';
import UploadList from './pages/UploadList';
import DistributedLists from './pages/DistributedLists';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Router>
          {isAuthenticated ? (
            <Layout isAuthenticated={isAuthenticated} logout={logout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/add-agent" element={<AddAgent />} />
                <Route path="/upload-list" element={<UploadList />} />
                <Route path="/distributed-lists" element={<DistributedLists />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/" element={<Login login={login} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </Router>
      </SnackbarProvider>
    );
}

export default App;