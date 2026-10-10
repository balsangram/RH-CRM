import React, { useState } from 'react';
import LoginPages from './components/LoginPages';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import UserDashboard from './components/UserDashboard';
import './index.css';

export default function App() {
  // Application State
  // authState: { isLoggedIn: boolean, role: 'superadmin' | 'staff' | 'user', userType: 'company' | 'individual' }
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    role: 'superadmin',
    userType: 'company'
  });

  // Track active login page when logged out
  const [currentLoginRole, setLoginRole] = useState('superadmin'); // 'superadmin', 'staff', 'user'

  const handleLoginSuccess = (role, userType = 'company') => {
    setAuthState({
      isLoggedIn: true,
      role: role,
      userType: userType
    });
  };

  const handleLogout = () => {
    setAuthState({
      isLoggedIn: false,
      role: currentLoginRole,
      userType: 'company'
    });
  };

  const handleQuickRoleSwitch = (targetRole, targetUserType = 'company') => {
    setLoginRole(targetRole);
    setAuthState({
      isLoggedIn: true,
      role: targetRole,
      userType: targetUserType
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Prototype Role-Switcher Banner at the top for instant testing */}
      {/* <header className="role-switcher-bar">
        <div className="role-switcher-title">
          <span>RH GLOBAL CRM WIREFRAME PROTOTYPE</span>
          <span style={{ fontSize: '10px', background: '#333', padding: '2px 6px', color: '#fff' }}>B&W Black & White Spec</span>
        </div>
        <div className="role-buttons">
          <span style={{ marginRight: '4px', color: '#aaa', fontSize: '11px' }}>Switch View:</span>
          
          <button
            className={`role-btn ${!authState.isLoggedIn && currentLoginRole === 'superadmin' ? 'active' : ''}`}
            onClick={() => { setAuthState({ isLoggedIn: false, role: 'superadmin', userType: 'company' }); setLoginRole('superadmin'); }}
          >
            SuperAdmin Login
          </button>
          
          <button
            className={`role-btn ${!authState.isLoggedIn && currentLoginRole === 'staff' ? 'active' : ''}`}
            onClick={() => { setAuthState({ isLoggedIn: false, role: 'staff', userType: 'company' }); setLoginRole('staff'); }}
          >
            Staff Login
          </button>
          
          <button
            className={`role-btn ${!authState.isLoggedIn && currentLoginRole === 'user' ? 'active' : ''}`}
            onClick={() => { setAuthState({ isLoggedIn: false, role: 'user', userType: 'company' }); setLoginRole('user'); }}
          >
            User Login
          </button>
          
          <span style={{ color: '#555', margin: '0 4px' }}>|</span>

          <button
            className={`role-btn ${authState.isLoggedIn && authState.role === 'superadmin' ? 'active' : ''}`}
            onClick={() => handleQuickRoleSwitch('superadmin')}
          >
            SuperAdmin Dash
          </button>
          
          <button
            className={`role-btn ${authState.isLoggedIn && authState.role === 'staff' ? 'active' : ''}`}
            onClick={() => handleQuickRoleSwitch('staff')}
          >
            Staff Dash
          </button>
          
          <button
            className={`role-btn ${authState.isLoggedIn && authState.role === 'user' && authState.userType === 'company' ? 'active' : ''}`}
            onClick={() => handleQuickRoleSwitch('user', 'company')}
          >
            Company User Dash
          </button>

          <button
            className={`role-btn ${authState.isLoggedIn && authState.role === 'user' && authState.userType === 'individual' ? 'active' : ''}`}
            onClick={() => handleQuickRoleSwitch('user', 'individual')}
          >
            Individual User Dash
          </button>

          {authState.isLoggedIn && (
            <button className="role-btn" style={{ background: '#d9534f', color: '#fff', borderColor: '#d9534f' }} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header> */}

      {/* Main View Router */}
      {!authState.isLoggedIn ? (
        <LoginPages
          currentLoginRole={currentLoginRole}
          setLoginRole={setLoginRole}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <>
          {authState.role === 'superadmin' && <SuperAdminDashboard onLogout={handleLogout} />}
          {authState.role === 'staff' && <StaffDashboard onLogout={handleLogout} />}
          {authState.role === 'user' && (
            <UserDashboard customerType={authState.userType} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}
