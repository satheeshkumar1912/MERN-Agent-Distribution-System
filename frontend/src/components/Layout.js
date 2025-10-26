import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: 'fa-tachometer-alt', path: '/dashboard' },
  { text: 'Agents', icon: 'fa-users', path: '/agents' },
  { text: 'Add Agent', icon: 'fa-user-plus', path: '/add-agent' },
  { text: 'Upload List', icon: 'fa-cloud-upload-alt', path: '/upload-list' },
  { text: 'Distributed Lists', icon: 'fa-list', path: '/distributed-lists' },
];

function Layout({ children, logout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const drawer = (
    <div>
      <div className="drawer-header">List Manager</div>
      <ul className="drawer-list">
        {menuItems.map((item) => (
          <li key={item.text} className={`drawer-list-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
            <i className={`fa ${item.icon}`}></i>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="app-root">
      <header className="app-appbar">
        <div className="app-toolbar">
          <button className="btn" onClick={handleDrawerToggle} aria-label="menu"><i className="fa fa-bars"></i></button>
          <div className="app-title">{menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}</div>
          <div className="app-avatar" onClick={handleProfileMenuOpen}>A</div>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="app-drawer" style={{display: mobileOpen ? 'block' : ''}}>
        {drawer}
      </nav>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;