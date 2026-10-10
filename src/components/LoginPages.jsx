import React, { useState } from 'react';

export default function LoginPages({ currentLoginRole, setLoginRole, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (currentLoginRole === 'company') {
      onLoginSuccess('user', 'company');
    } else if (currentLoginRole === 'individual') {
      onLoginSuccess('user', 'individual');
    } else {
      onLoginSuccess(currentLoginRole, 'company');
    }
  };

  const handleSendOtp = () => {
    if (!email) {
      alert('Please enter registered email ID first');
      return;
    }
    setOtpSent(true);
    setOtp('582910'); // Sample generated OTP
  };

  return (
    <div className="login-wrapper">
      {/* Visual wireframe card */}
      <div className="login-card">
        {currentLoginRole === 'superadmin' && (
          <div>
            <h2>Super Admin Login</h2>
            <div className="login-subtitle">RH Global CRM &bull; Administrative Portal</div>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email ID / Username</label>
                <input
                  type="email"
                  placeholder="admin@rhglobal.com"
                  value={email || 'admin@rhglobal.com'}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password / OTP</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password || 'superadmin123'}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
                Login to Super Admin Dashboard &rarr;
              </button>
            </form>
          </div>
        )}

        {currentLoginRole === 'staff' && (
          <div>
            <h2>Staff Login</h2>
            <div className="login-subtitle">Sub-Admin & Case Officer Access (RH Global CRM)</div>
            <p style={{ fontSize: '11px', color: '#666', marginBottom: '16px' }}>
              Note: Staff accounts are created by Super Admin (No self-registration).
            </p>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Registered Email ID</label>
                <input
                  type="email"
                  placeholder="staff.officer@rhglobal.com"
                  value={email || 'amit.v@rhglobal.com'}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password / OTP</label>
                <input
                  type="password"
                  placeholder="Enter Password / OTP"
                  value={password || 'staffpass123'}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
                Login to Staff Dashboard &rarr;
              </button>
            </form>
          </div>
        )}

        {currentLoginRole === 'company' && (
          <div>
            <h2>Company Customer Login</h2>
            <div className="login-subtitle">Corporate & Enterprise B2B Customer Portal</div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Registered Company Email ID</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={email || 'contact@rhglobal.com'}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-sm" onClick={handleSendOtp}>Send OTP</button>
                </div>
              </div>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp || '582910'}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>

              {otpSent && (
                <p style={{ fontSize: '11px', color: '#008800', marginBottom: '8px' }}>
                  OTP sent to email! (Resend OTP available in 30s)
                </p>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
                Login to Company Customer Dashboard &rarr;
              </button>
            </form>
          </div>
        )}

        {currentLoginRole === 'individual' && (
          <div>
            <h2>Individual Customer Login</h2>
            <div className="login-subtitle">Personal Travel & Visa Customer Portal</div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Registered Personal Email ID</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    value={email || 'vikram.roy@gmail.com'}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-sm" onClick={handleSendOtp}>Send OTP</button>
                </div>
              </div>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp || '582910'}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>

              {otpSent && (
                <p style={{ fontSize: '11px', color: '#008800', marginBottom: '8px' }}>
                  OTP sent to email! (Resend OTP available in 30s)
                </p>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
                Login to Individual Customer Dashboard &rarr;
              </button>
            </form>
          </div>
        )}

        {/* Quick Footer selector between the 4 Dedicated Login Screens */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #ddd', fontSize: '11px', textAlign: 'center' }}>
          <div>Select Role Login Screen:</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${currentLoginRole === 'superadmin' ? 'btn-primary' : ''}`}
              onClick={() => { setLoginRole('superadmin'); setEmail(''); setOtp(''); }}
            >
              Super Admin Login
            </button>
            <button
              className={`btn btn-sm ${currentLoginRole === 'staff' ? 'btn-primary' : ''}`}
              onClick={() => { setLoginRole('staff'); setEmail(''); setOtp(''); }}
            >
              Staff Login
            </button>
            <button
              className={`btn btn-sm ${currentLoginRole === 'company' ? 'btn-primary' : ''}`}
              onClick={() => { setLoginRole('company'); setEmail(''); setOtp(''); }}
            >
              Company Customer Login
            </button>
            <button
              className={`btn btn-sm ${currentLoginRole === 'individual' ? 'btn-primary' : ''}`}
              onClick={() => { setLoginRole('individual'); setEmail(''); setOtp(''); }}
            >
              Individual Customer Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

