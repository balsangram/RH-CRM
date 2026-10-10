import React, { useState } from 'react';
import {
  mockCompanyApplications,
  mockCompanyEmployees,
  mockTransactions,
  mockHolidayPackages,
  mockVisaPackages,
  mockVisaServices,
  mockBookingServices
} from '../mockData';

export default function UserDashboard({ customerType = 'company', onLogout }) {
  const [userType, setUserType] = useState(customerType); // 'company' or 'individual'
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedBookingApp, setSelectedBookingApp] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedVisaPkg, setSelectedVisaPkg] = useState(null);
  const [viewingHolidayPackageDetails, setViewingHolidayPackageDetails] = useState(null);
  const [viewingVisaPackageDetails, setViewingVisaPackageDetails] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDownloadPdfModal, setShowDownloadPdfModal] = useState(false);

  const handleViewApp = (app) => {
    if (app.applicationType === 'HOLIDAY' || (app.service && (app.service.includes('Europe') || app.service.includes('Bali') || app.service.includes('Holiday')))) {
      setSelectedBookingApp({
        packageId: app.id || 'PKG-701',
        packageName: app.service || 'Grand Europe 10D Highlights',
        destination: app.country || 'France & Switzerland',
        duration: '8 Days / 7 Nights',
        bookingDate: app.applicationDate || '2026-09-25',
        departureDate: '2026-11-15',
        totalPrice: 210000,
        price: 210000,
        status: app.status || 'APPROVED',
        applicantName: app.applicantName || 'Deepak Chopra'
      });
      setSelectedApp(null);
    } else {
      setSelectedApp(app);
      setSelectedBookingApp(null);
    }
  };

  // Summary counts
  const companySummary = {
    current: 4,
    pending: 2,
    completed: 8,
    totalEmployees: mockCompanyEmployees.length
  };

  const individualSummary = {
    current: 2,
    pending: 1,
    completed: 3,
    totalApps: 6
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">{userType === 'company' ? 'Company Customer Portal' : 'Individual Customer Portal'}</div>
          <div className="sidebar-subtitle">{userType === 'company' ? 'RH Global Corporate B2B Account' : 'RH Global Personal Travel Account'}</div>
        </div>

        <ul className="sidebar-nav">
          <li>
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setSelectedApp(null); setSelectedBookingApp(null); }}>
              <span>1. Dashboard Overview</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'current-apps' ? 'active' : ''} onClick={() => { setActiveTab('current-apps'); setSelectedApp(null); setSelectedBookingApp(null); }}>
              <span>2. Current Applications</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'all-apps' ? 'active' : ''} onClick={() => { setActiveTab('all-apps'); setSelectedApp(null); setSelectedBookingApp(null); }}>
              <span>3. All Applications</span>
            </button>
          </li>

          {userType === 'company' && (
            <li>
              <button className={activeTab === 'employees' ? 'active' : ''} onClick={() => { setActiveTab('employees'); setSelectedApp(null); setSelectedBookingApp(null); }}>
                <span>5. Company Employees / Travelers</span>
                {/* <span className="nav-badge">{mockCompanyEmployees.length}</span> */}
              </button>
            </li>
          )}
          <li>
            <button className={activeTab === 'holiday-pkgs' ? 'active' : ''} onClick={() => { setActiveTab('holiday-pkgs'); setSelectedApp(null); setSelectedBookingApp(null); setViewingHolidayPackageDetails(null); }}>
              <span>{userType === 'company' ? '6. Holiday Packages' : '5. Holiday Packages'}</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'visa-pkgs' ? 'active' : ''} onClick={() => { setActiveTab('visa-pkgs'); setSelectedApp(null); setSelectedBookingApp(null); setViewingVisaPackageDetails(null); }}>
              <span>{userType === 'company' ? '7. Visa Packages' : '6. Visa Packages'}</span>
            </button>
          </li>
        </ul>

      </aside>

      {/* Main Layout */}
      <div className="main-layout">
        <header className="top-header">
          <div className="top-header-left">
            <h1>{userType === 'company' ? 'Company Customer Dashboard' : 'Individual Customer Dashboard'}</h1>
            <p>{userType === 'company' ? 'RH Global Enterprises &bull; Managing Company Applications & Employees' : 'Personal Customer Dashboard &bull; Managing My Applications'}</p>
          </div>
          <div className="user-profile-badge">
            <span>Type: <strong>{userType === 'company' ? 'Company User' : 'Individual User'}</strong></span>
            <button className="btn btn-sm" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="content-body">
          {selectedApp ? (
            /* DEDICATED FULL-PAGE APPLICATION DETAILS VIEW (CUSTOMER READ-ONLY) */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setSelectedApp(null)}>
                  &larr; Back to Applications
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowDownloadPdfModal(true)}>
                  Download Status PDF &rarr;
                </button>
              </div>

              {/* Header Box */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Visa Application Details: {selectedApp.id}</div>
                  <span className="status-badge">{selectedApp.status || 'Under Review'}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px', marginTop: '12px' }}>
                  <div><strong>Applicant Name:</strong> {selectedApp.applicantName}</div>
                  <div><strong>Registered Email:</strong> {userType === 'company' ? 'rohan.j@rhglobal.com' : 'vikram.roy@gmail.com'}</div>
                  <div><strong>Mobile Number:</strong> +91 99112 23344</div>
                  <div><strong>Target Country:</strong> {selectedApp.country}</div>
                  <div><strong>Visa Type:</strong> {selectedApp.service || 'B1/B2 Tourist Visa'}</div>
                  <div><strong>Passport Details:</strong> Z9847291 (Exp: 2031-05-12)</div>
                  <div><strong>Case Officer:</strong> {selectedApp.assignedEmployee || 'Amit Verma (CO-101)'}</div>
                  <div><strong>Application Date:</strong> {selectedApp.applicationDate}</div>
                </div>
              </div>

              {/* Application Status Progression & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Application Status Progression & Update</div>
                </div>
                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 'bold' }}>Current Application Status:</label>
                    <span className="status-badge" style={{ padding: '4px 12px', fontSize: '13px', textTransform: 'uppercase' }}>
                      {selectedApp.status || 'Under Review'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Document Management & Verification Status (Read-Only Table) */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Document Management & Verification Status</div>
                </div>
                <div className="table-container mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Document Requirement</th>
                        <th>Verification Status</th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Passport Front & Back Page</strong></td>
                        <td><span className="status-badge">Mandatory</span></td>
                        <td><span className="status-badge">VERIFIED</span></td>

                      </tr>
                      <tr>
                        <td><strong>Bank Statement (6 Months)</strong></td>
                        <td><span className="status-badge">Mandatory</span></td>
                        <td><span className="status-badge">PENDING VERIFICATION</span></td>

                      </tr>
                      <tr>
                        <td><strong>Employment NOC Letter</strong></td>
                        <td><span className="status-badge">Optional</span></td>
                        <td><span className="status-badge">VERIFIED</span></td>

                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial & Payment Summary (Read-Only) */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Visa Payment & Fee Details</div>
                </div>
                <div className="grid-cards mt-4">
                  <div className="card">
                    <div className="card-title">Total Visa Fee</div>
                    <div className="card-value">₹21,000</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Total Paid Amount</div>
                    <div className="card-value">₹21,000</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Pending Balance</div>
                    <div className="card-value">₹0</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Payment Status</div>
                    <div className="card-value" style={{ fontSize: '16px' }}>PAID IN FULL</div>
                  </div>
                </div>

                {/* Multiple Payment Entries Table */}
                <div className="table-container mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>Payment ID</th>
                        <th>Payment Type</th>
                        <th>Payment Mode</th>
                        <th>Amount (₹)</th>
                        <th>Payment Date</th>
                        <th>Reference / TXN ID</th>

                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono"><strong>PAY-1001</strong></td>
                        <td><span className="status-badge">Advance Deposit</span></td>
                        <td>Online UPI / Netbanking</td>
                        <td className="font-mono">₹10,000</td>
                        <td>2026-10-02</td>
                        <td className="font-mono">TXN-998120</td>

                      </tr>
                      <tr>
                        <td className="font-mono"><strong>PAY-1002</strong></td>
                        <td><span className="status-badge">Final Balance</span></td>
                        <td>Credit Card / Gateway</td>
                        <td className="font-mono">₹11,000</td>
                        <td>2026-10-05</td>
                        <td className="font-mono">TXN-998144</td>

                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="action-cell mt-4">
                  <button className="btn btn-sm btn-primary" onClick={() => alert(`Downloading Invoice for ${selectedApp.id}`)}>Download Complete Invoice PDF &rarr;</button>
                </div>
              </div>

              {/* Visa Document Upload & Download */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Approved Visa Document</div>
                </div>
                <p style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>
                  {selectedApp.status === 'Approved' || selectedApp.status === 'Completed'
                    ? 'Your official approved visa has been uploaded by your Case Officer. You can view or download it below:'
                    : 'Visa document will be available here once approved by embassy and uploaded by your Case Officer.'}
                </p>
                <div className="action-cell mt-4">
                  <button className="btn btn-sm btn-primary" onClick={() => alert('Viewing Final Visa Document')}>View Visa Document</button>
                  <button className="btn btn-sm" onClick={() => alert('Downloading Final Visa Document')}>Download Visa Document</button>
                </div>
              </div>
            </div>
          ) : selectedBookingApp ? (
            /* DEDICATED FULL-PAGE HOLIDAY / TOUR BOOKING DETAILS VIEW (CUSTOMER READ-ONLY) */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setSelectedBookingApp(null)}>
                  &larr; Back to Traveler Profile / Bookings
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => alert(`Downloading Booking Confirmation & Invoice PDF for ${selectedBookingApp.packageId || 'PKG-701'}`)}>
                  Download Confirmation & Invoice PDF &rarr;
                </button>
              </div>

              {/* Header Box: Booking Information */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Holiday / Tour Booking Details: {selectedBookingApp.packageId || 'PKG-701'}</div>
                  <span className="status-badge">{selectedBookingApp.status || 'ACTIVE'}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px', marginTop: '12px' }}>
                  <div><strong>Package Name:</strong> {selectedBookingApp.packageName || 'Bali Island Beach Getaway'}</div>
                  <div><strong>Destination:</strong> {selectedBookingApp.destination || 'Bali, Indonesia'}</div>
                  <div><strong>Duration:</strong> {selectedBookingApp.duration || '6 Days / 5 Nights'}</div>
                  <div><strong>Booking Date:</strong> {selectedBookingApp.bookingDate || '2026-10-01'}</div>
                  <div><strong>Departure Date:</strong> {selectedBookingApp.departureDate || '2026-11-15'}</div>
                  <div><strong>Total Package Price:</strong> ₹{(selectedBookingApp.totalPrice || selectedBookingApp.price || 85000).toLocaleString()}</div>
                  <div><strong>Customer Name:</strong> {selectedEmployee ? selectedEmployee.name : (userType === 'company' ? 'Rohan Joshi' : 'Vikram Roy')}</div>
                  <div><strong>Contact Phone:</strong> {selectedEmployee ? selectedEmployee.phone : '+91 99112 23344'}</div>
                </div>
              </div>

              {/* Booking Application Status Progression & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Booking Application Status Progression & Update</div>
                </div>
                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 'bold' }}>Current Application / Booking Status:</label>
                    <span className="status-badge" style={{ padding: '4px 12px', fontSize: '13px', textTransform: 'uppercase' }}>
                      {selectedBookingApp.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Management (Multiple Payment Entries) */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Payment Management (Multiple Payment Entries)</div>
                </div>

                {/* Summary Cards */}
                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px', marginTop: '12px' }}>
                  <div className="card">
                    <div className="card-title">TOTAL PACKAGE PRICE</div>
                    <div className="card-value">₹{(selectedBookingApp.totalPrice || selectedBookingApp.price || 85000).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">TOTAL PAID AMOUNT</div>
                    <div className="card-value">₹{(selectedBookingApp.totalPrice || selectedBookingApp.price || 85000).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">REMAINING BALANCE</div>
                    <div className="card-value">₹0</div>
                  </div>
                  <div className="card">
                    <div className="card-title">PAYMENT STATUS</div>
                    <div className="card-value" style={{ fontSize: '18px', color: '#155724', fontWeight: 'bold' }}>PAID IN FULL</div>
                  </div>
                </div>

                {/* Multiple Payments Table */}
                <div className="table-container mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>PAYMENT ID</th>
                        <th>PAYMENT TYPE</th>
                        <th>PAYMENT MODE</th>
                        <th>AMOUNT (₹)</th>
                        <th>PAYMENT DATE</th>
                        <th>REFERENCE / TXN ID</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono"><strong>PAY-701</strong></td>
                        <td><span className="status-badge">PREPAID</span></td>
                        <td>Bank Transfer</td>
                        <td className="font-mono">₹35,000</td>
                        <td>2026-10-01</td>
                        <td className="font-mono">TXN-998200</td>
                        <td className="action-cell">
                          <button className="btn btn-sm" onClick={() => alert('Downloading Receipt PAY-701')}>Download</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-mono"><strong>PAY-702</strong></td>
                        <td><span className="status-badge">BALANCE</span></td>
                        <td>Online UPI / Netbanking</td>
                        <td className="font-mono">₹50,000</td>
                        <td>2026-10-03</td>
                        <td className="font-mono">TXN-998288</td>
                        <td className="action-cell">
                          <button className="btn btn-sm" onClick={() => alert('Downloading Receipt PAY-702')}>Download</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* REGULAR DASHBOARD TABS RENDER */
            <>
              {/* 1. DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div className="grid-cards">
                    <div className="card">
                      <div className="card-title">Current Applications</div>
                      <div className="card-value">{userType === 'company' ? companySummary.current : individualSummary.current}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Active / in-progress applications</p>
                    </div>
                    <div className="card">
                      <div className="card-title">Pending Applications</div>
                      <div className="card-value">{userType === 'company' ? companySummary.pending : individualSummary.pending}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Waiting for action</p>
                    </div>
                    <div className="card">
                      <div className="card-title">Completed Applications</div>
                      <div className="card-value">{userType === 'company' ? companySummary.completed : individualSummary.completed}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Finished applications</p>
                    </div>
                    {userType === 'company' ? (
                      <div className="card">
                        <div className="card-title">Total Employees / Travelers</div>
                        <div className="card-value">{companySummary.totalEmployees}</div>
                        <p style={{ fontSize: '11px', color: '#555' }}>Registered under company</p>
                      </div>
                    ) : (
                      <div className="card">
                        <div className="card-title">Total Applications</div>
                        <div className="card-value">{individualSummary.totalApps}</div>
                        <p style={{ fontSize: '11px', color: '#555' }}>Total submitted by user</p>
                      </div>
                    )}
                  </div>

                  <div className="section-box">
                    <div className="section-header">
                      <div className="section-title">Recent Applications</div>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Application ID</th>
                            {userType === 'company' && <th>Applicant Name</th>}
                            <th>Application Type</th>
                            <th>Country / Destination</th>
                            <th>Application Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockCompanyApplications.map(app => (
                            <tr key={app.id}>
                              <td className="font-mono"><strong>{app.id}</strong></td>
                              {userType === 'company' && <td>{app.applicantName}</td>}
                              <td>{app.applicationType}</td>
                              <td>{app.country}</td>
                              <td>{app.applicationDate}</td>
                              <td><span className="status-badge">{app.status}</span></td>
                              <td className="action-cell">
                                <button className="btn btn-sm" onClick={() => handleViewApp(app)}>View Progress</button>
                                <button className="btn btn-sm" onClick={() => setShowDownloadPdfModal(true)}>Download</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CURRENT APPLICATIONS */}
              {activeTab === 'current-apps' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Current Active Applications</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          {userType === 'company' && <th>Applicant Name</th>}
                          <th>Application Type</th>
                          <th>Country / Destination</th>
                          <th>Visa Type / Package</th>
                          <th>Application Date</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockCompanyApplications.map(app => (
                          <tr key={app.id}>
                            <td className="font-mono"><strong>{app.id}</strong></td>
                            {userType === 'company' && <td>{app.applicantName}</td>}
                            <td>{app.applicationType}</td>
                            <td>{app.country}</td>
                            <td>{app.service}</td>
                            <td>{app.applicationDate}</td>
                            <td><span className="status-badge">{app.status}</span></td>
                            <td>2026-10-08</td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => handleViewApp(app)}>View Status</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. ALL APPLICATIONS */}
              {activeTab === 'all-apps' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">All Applications (Complete History)</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          {userType === 'company' && <th>Applicant Name</th>}
                          <th>Application Type</th>
                          <th>Country</th>
                          <th>Visa Type / Package</th>
                          <th>Application Date</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockCompanyApplications.map(app => (
                          <tr key={app.id}>
                            <td className="font-mono"><strong>{app.id}</strong></td>
                            {userType === 'company' && <td>{app.applicantName}</td>}
                            <td>{app.applicationType}</td>
                            <td>{app.country}</td>
                            <td>{app.service}</td>
                            <td>{app.applicationDate}</td>
                            <td><span className="status-badge">{app.status}</span></td>
                            <td>2026-10-08</td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => handleViewApp(app)}>View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. INVOICE & PAYMENT STATUS */}
              {activeTab === 'invoices' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Invoice & Payment Status</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          <th>Payment Type</th>
                          <th>Total Amount</th>
                          <th>Total Paid Amount</th>
                          <th>Pending Amount</th>
                          <th>Payment Status</th>
                          <th>Payment Date</th>
                          <th>Transaction ID</th>
                          <th>Invoice Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTransactions.map(t => (
                          <tr key={t.id}>
                            <td className="font-mono"><strong>{t.applicationName.split(' ')[0]}</strong></td>
                            <td><span className="status-badge">{t.paymentType}</span></td>
                            <td className="font-mono">₹{t.amount.toLocaleString()}</td>
                            <td className="font-mono">₹{t.amount.toLocaleString()}</td>
                            <td className="font-mono">₹0</td>
                            <td><span className="status-badge">{t.paymentStatus}</span></td>
                            <td>{t.transactionDate}</td>
                            <td className="font-mono">{t.id}</td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => alert(`Viewing Invoice ${t.invoice}`)}>View Invoice</button>
                              <button className="btn btn-sm" onClick={() => alert(`Downloading Invoice ${t.invoice}`)}>Download Invoice</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. COMPANY EMPLOYEES (COMPANY USER ONLY) */}
              {userType === 'company' && activeTab === 'employees' && (
                <div>
                  {selectedEmployee ? (
                    /* DEDICATED FULL-PAGE EMPLOYEE / TRAVELER PROFILE VIEW */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setSelectedEmployee(null)}>
                          &larr; Back to Employees Listing
                        </button>
                      </div>

                      {/* Traveler Full Profile Header Card */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="section-title">Traveler Full Profile: {selectedEmployee.name} ({selectedEmployee.employeeId})</div>
                          <span className="status-badge">{selectedEmployee.status || 'Active'}</span>
                        </div>
                        <div className="form-grid mt-4" style={{ fontSize: '13px' }}>
                          <div><strong>Unique Traveler ID:</strong> {selectedEmployee.employeeId}</div>
                          <div><strong>Applicant Name:</strong> {selectedEmployee.name}</div>
                          <div><strong>Mobile Number:</strong> {selectedEmployee.phone || '+91 98200 11111'}</div>
                          <div><strong>Email ID:</strong> {selectedEmployee.email}</div>
                          <div><strong>Country:</strong> India</div>
                          <div><strong>Passport Information:</strong> P1092834 (Exp: 2031-05-12)</div>
                          <div><strong>Registration Date:</strong> 2026-08-14</div>
                          <div><strong>Account Status:</strong> Active</div>
                        </div>
                      </div>

                      {/* Visa Applications History */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">Visa Applications History ({mockCompanyApplications.length} Total)</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Application ID</th>
                                <th>Target Country</th>
                                <th>Visa Type</th>
                                <th>Application Date</th>
                                <th>Case Officer</th>
                                <th>Payment Type</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockCompanyApplications.map(app => (
                                <tr key={app.id}>
                                  <td className="font-mono"><strong>{app.id}</strong></td>
                                  <td>{app.country}</td>
                                  <td>{app.service}</td>
                                  <td>{app.applicationDate}</td>
                                  <td>Amit Verma (CO-101)</td>
                                  <td><span className="status-badge">PREPAID</span></td>
                                  <td><span className="status-badge">{app.status}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm btn-primary" onClick={() => setSelectedApp(app)}>View Details &rarr;</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Holiday / Tour Booking History */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">Holiday / Tour Booking History ({mockHolidayPackages.length} Total)</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Package ID</th>
                                <th>Package Name</th>
                                <th>Destination</th>
                                <th>Duration</th>
                                <th>Booking Date</th>
                                <th>Departure Date</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockHolidayPackages.map(pkg => (
                                <tr key={pkg.packageId}>
                                  <td className="font-mono"><strong>{pkg.packageId}</strong></td>
                                  <td>{pkg.packageName}</td>
                                  <td>{pkg.destination}</td>
                                  <td>{pkg.duration}</td>
                                  <td>2026-10-01</td>
                                  <td>2026-11-15</td>
                                  <td className="font-mono">₹{pkg.price.toLocaleString()}</td>
                                  <td><span className="status-badge">{pkg.status}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm btn-primary" onClick={() => setSelectedBookingApp(pkg)}>View Details &rarr;</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* EMPLOYEES TABLE LIST */
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Company Employees / Travelers Listing</div>
                      </div>
                      <div className="table-container mt-4">
                        <table>
                          <thead>
                            <tr>
                              <th>Employee ID</th>
                              <th>Employee Name</th>
                              <th>Email</th>
                              <th>Mobile Number</th>
                              <th>Country</th>
                              <th>No. of Applications</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockCompanyEmployees.map(emp => (
                              <tr key={emp.employeeId}>
                                <td className="font-mono"><strong>{emp.employeeId}</strong></td>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.phone}</td>
                                <td>India</td>
                                <td className="font-mono text-center">{emp.numApplications}</td>
                                <td><span className="status-badge">{emp.status}</span></td>
                                <td className="action-cell">
                                  <button className="btn btn-sm btn-primary" onClick={() => setSelectedEmployee(emp)}>View Details &rarr;</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* HOLIDAY PACKAGES */}
              {activeTab === 'holiday-pkgs' && (
                <div>
                  {viewingHolidayPackageDetails ? (
                    /* DEDICATED FULL-PAGE HOLIDAY PACKAGE DETAILS VIEW */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setViewingHolidayPackageDetails(null)}>
                          &larr; Back to Holiday Packages
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => alert(`Booking request initiated for ${viewingHolidayPackageDetails.packageName}`)}>
                          Request Booking / Inquire &rarr;
                        </button>
                      </div>

                      {/* Header Banner */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="section-title">Holiday Package: {viewingHolidayPackageDetails.packageName} ({viewingHolidayPackageDetails.packageId})</div>
                          <span className="status-badge">{viewingHolidayPackageDetails.status || 'Active'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', marginTop: '12px' }}>
                          <div style={{ border: '1px solid #ccc', padding: '4px', background: '#fff' }}>
                            <img
                              src={viewingHolidayPackageDetails.packageId === 'PKG-701' ? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' : 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600'}
                              alt={viewingHolidayPackageDetails.packageName}
                              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="form-grid" style={{ fontSize: '13px', alignContent: 'center' }}>
                            <div><strong>Package ID:</strong> {viewingHolidayPackageDetails.packageId}</div>
                            <div><strong>Package Name:</strong> {viewingHolidayPackageDetails.packageName}</div>
                            <div><strong>Country / Region:</strong> {viewingHolidayPackageDetails.country}</div>
                            <div><strong>Destination:</strong> {viewingHolidayPackageDetails.destination}</div>
                            <div><strong>Duration:</strong> {viewingHolidayPackageDetails.duration}</div>
                            <div><strong>Package Price:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{viewingHolidayPackageDetails.price.toLocaleString()}</span> per person</div>
                          </div>
                        </div>
                      </div>

                      {/* Description & Overview */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">Tour Overview & Description</div>
                        </div>
                        <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.description}</p>
                      </div>

                      {/* Inclusions & Exclusions */}
                      <div className="form-grid">
                        <div className="section-box">
                          <div className="section-header">
                            <div className="section-title">Package Inclusions</div>
                          </div>
                          <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.inclusions}</p>
                        </div>
                        <div className="section-box">
                          <div className="section-header">
                            <div className="section-title">Package Exclusions</div>
                          </div>
                          <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.exclusions}</p>
                        </div>
                      </div>

                      {/* Day-by-Day Itinerary */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">Day-by-Day Tour Itinerary</div>
                        </div>
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {viewingHolidayPackageDetails.packageId === 'PKG-701' ? (
                            <>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 1: Arrival in Bali & Villa Check-in</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Welcome at Denpasar Airport, transfer to Seminyak luxury beach villa. Leisure evening at private pool.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 2: Kintamani Volcano & Ubud Cultural Tour</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Visit Tegenungan Waterfall, Sacred Monkey Forest, and scenic Mount Batur volcano view with buffet lunch.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 3: Nusa Penida Island Speedboat Day Trip</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Explore Kelingking T-Rex Beach, Broken Beach, Angel Billabong, and snorkeling session.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 4: Tanjung Benoa Water Sports & Uluwatu Sunset</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Banana boat ride, parasailing, and sunset Kecak dance performance at cliffside Uluwatu Temple.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 5: Traditional Balinese Massage & Tanah Lot</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>2-Hour spa session followed by Tanah Lot ocean temple sunset photography.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 6: Souvenir Shopping & Departure Transfer</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Breakfast, Krisna handicraft market shopping, and private airport transfer for return flight.</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 1: Arrival in Paris & Seine River Cruise</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Airport pickup to Paris central hotel. Evening illuminated Eiffel Tower & Seine River dinner cruise.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 2: Guided Paris City Tour & Louvre Museum</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Visit Arc de Triomphe, Champs-Élysées, Notre-Dame Cathedral, and priority Louvre access.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 3: TGV Bullet Train to Zurich & Lake Promenade</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>High-speed train to Zurich. Evening stroll along Bahnhofstrasse and Lake Zurich.</p>
                              </div>
                              <div style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>Day 4: Mount Titlis Cable Car & Lucerne Day Trip</div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>Rotair revolving cable car to Mount Titlis snow park, Ice Flyer, and Chapel Bridge in Lucerne.</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Required Documents */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">Required Documents Checklist</div>
                        </div>
                        <ul style={{ paddingLeft: '20px', fontSize: '13px', marginTop: '10px', lineHeight: '1.8' }}>
                          {viewingHolidayPackageDetails.requiredDocs.map((d, i) => (
                            <li key={i}><strong>{d}</strong></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Available Holiday Packages</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
                        {mockHolidayPackages.map(pkg => (
                          <div key={pkg.packageId} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #ccc' }}>
                            <img
                              src={pkg.packageId === 'PKG-701' ? 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' : 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600'}
                              alt={pkg.packageName}
                              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div>
                                  <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{pkg.packageId} &bull; {pkg.country}</span>
                                  <h3 style={{ fontSize: '15px', margin: '4px 0 2px 0' }}>{pkg.packageName}</h3>
                                </div>
                                <span className="status-badge">{pkg.status}</span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#555', margin: '4px 0' }}>📍 {pkg.destination} &bull; ⏱️ {pkg.duration}</p>
                              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0' }}>₹{pkg.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>per person</span></p>
                              <p style={{ fontSize: '12px', color: '#555', background: '#f8f8f8', padding: '8px', border: '1px solid #eee', margin: '8px 0 14px 0' }}>
                                {pkg.description}
                              </p>
                              <div className="action-cell" style={{ justifyContent: 'flex-start' }}>
                                <button className="btn btn-sm btn-primary" onClick={() => setViewingHolidayPackageDetails(pkg)}>
                                  View Details &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISA PACKAGES */}
              {activeTab === 'visa-pkgs' && (
                <div>
                  {viewingVisaPackageDetails ? (
                    /* DEDICATED FULL-PAGE VISA PACKAGE DETAILS VIEW */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setViewingVisaPackageDetails(null)}>
                          &larr; Back to Visa Packages
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => alert(`Visa application initiated for ${viewingVisaPackageDetails.country}`)}>
                          Apply for Visa &rarr;
                        </button>
                      </div>

                      {/* Header Banner */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="section-title">Visa Package: {viewingVisaPackageDetails.country} ({viewingVisaPackageDetails.id})</div>
                          <span className="status-badge">{viewingVisaPackageDetails.status || 'Active'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginTop: '12px' }}>
                          <div style={{ border: '1px solid #ccc', padding: '4px', background: '#fff' }}>
                            <img
                              src={
                                viewingVisaPackageDetails.country.includes('States')
                                  ? 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600'
                                  : viewingVisaPackageDetails.country.includes('Kingdom')
                                    ? 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600'
                                    : 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600'
                              }
                              alt={viewingVisaPackageDetails.country}
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="form-grid" style={{ fontSize: '13px', alignContent: 'center' }}>
                            <div><strong>Visa Package ID:</strong> {viewingVisaPackageDetails.id}</div>
                            <div><strong>Target Country:</strong> {viewingVisaPackageDetails.country}</div>
                            <div><strong>Visa Type:</strong> {viewingVisaPackageDetails.visaType}</div>
                            <div><strong>Processing Speed:</strong> {viewingVisaPackageDetails.processingType}</div>
                            <div><strong>Estimated Duration:</strong> {viewingVisaPackageDetails.estimatedTime}</div>
                            <div><strong>Visa Service Fee:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{viewingVisaPackageDetails.price.toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* 1. Visa Types Provided */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">1. Available Visa Categories</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Category Name</th>
                                <th>Validity Period</th>
                                <th>Stay Duration</th>
                                <th>Processing Fee</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><strong>{viewingVisaPackageDetails.visaType}</strong></td>
                                <td>Up to 180 Days / Multiple Entry</td>
                                <td>90 Days per visit</td>
                                <td className="font-mono">₹{viewingVisaPackageDetails.price.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. Document Requirements Matrix */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">2. Document Requirements Checklist</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Document Name</th>
                                <th>Requirement Type</th>
                                <th>Guidelines & Specifications</th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewingVisaPackageDetails.requiredDocs.map((docName, idx) => (
                                <tr key={idx}>
                                  <td><strong>{docName}</strong></td>
                                  <td><span className="status-badge">Mandatory</span></td>
                                  <td>Must be submitted as clear scanned PDF or original document during appointment.</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. Official Embassy Guidance */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">3. Official Embassy Guidance & Application Instructions</div>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: '1.6', background: '#f9f9f9', padding: '16px', border: '1px solid #ccc', marginTop: '12px' }}>
                          <p><strong>Application Process:</strong></p>
                          <p>1. Complete the online visa application form for {viewingVisaPackageDetails.country}.</p>
                          <p>2. Upload all required documents as specified in the checklist above.</p>
                          <p>3. Pay the visa processing fee of ₹{viewingVisaPackageDetails.price.toLocaleString()}.</p>
                          <p>4. Schedule biometrics/interview appointment at VFS / Embassy application center.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Available Visa Packages & Services</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                        {mockVisaPackages.map(vp => (
                          <div key={vp.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #ccc' }}>
                            <img
                              src={
                                vp.country.includes('States')
                                  ? 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600'
                                  : vp.country.includes('Kingdom')
                                    ? 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600'
                                    : 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600'
                              }
                              alt={vp.country}
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div>
                                  <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{vp.id} &bull; {vp.processingType}</span>
                                  <h3 style={{ fontSize: '15px', margin: '4px 0 2px 0' }}>{vp.country}</h3>
                                </div>
                                <span className="status-badge">{vp.status}</span>
                              </div>
                              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', margin: '4px 0' }}>{vp.visaType}</p>
                              <p style={{ fontSize: '12px', color: '#555', margin: '4px 0' }}>⏱️ Processing: {vp.estimatedTime}</p>
                              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '8px 0 14px 0' }}>
                                ₹{vp.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>service fee</span>
                              </p>
                              <div className="action-cell" style={{ justifyContent: 'flex-start' }}>
                                <button className="btn btn-sm btn-primary" onClick={() => setViewingVisaPackageDetails(vp)}>
                                  View Details &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div className="section-box" style={{ maxWidth: '650px' }}>
                  <div className="section-header">
                    <div className="section-title">{userType === 'company' ? 'Company Profile Details' : 'Individual Profile Details'}</div>
                  </div>
                  {userType === 'company' ? (
                    <div className="form-grid">
                      <div><strong>Company Name:</strong> RH Global Enterprises</div>
                      <div><strong>Registration Info:</strong> REG-2021-99482</div>
                      <div><strong>Contact Person:</strong> Rajesh Kumar</div>
                      <div><strong>Email:</strong> contact@rhglobal.com</div>
                      <div><strong>Phone Number:</strong> +91 11 4000 5500</div>
                      <div><strong>Address:</strong> 102 Tech Park, Cyber City, Gurgaon</div>
                      <div><strong>Country:</strong> India</div>
                    </div>
                  ) : (
                    <div className="form-grid">
                      <div><strong>Full Name:</strong> Vikramaditya Roy</div>
                      <div><strong>Email:</strong> vikram.roy@gmail.com</div>
                      <div><strong>Mobile Number:</strong> +91 99112 23344</div>
                      <div><strong>Country:</strong> India</div>
                      <div><strong>Passport:</strong> Z9847291 (Exp: 2031-05-12)</div>
                    </div>
                  )}
                  <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="btn btn-primary" onClick={() => alert('Profile update saved')}>Edit Profile</button>
                    <button className="btn btn-danger" onClick={onLogout}>Logout</button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* 6. Download Application Status Options Modal */}
      {showDownloadPdfModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Download Application Status</div>
              <button className="close-btn" onClick={() => setShowDownloadPdfModal(false)}>X</button>
            </div>
            <p style={{ fontSize: '12px', marginBottom: '16px' }}>Select document format to generate:</p>
            <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <button className="btn" onClick={() => { alert('Downloaded Application Summary'); setShowDownloadPdfModal(false); }}>Download Application Summary</button>
              <button className="btn" onClick={() => { alert('Downloaded Application Status Timeline'); setShowDownloadPdfModal(false); }}>Download Application Status Timeline</button>
              <button className="btn btn-primary" onClick={() => { alert('Downloaded PDF Report'); setShowDownloadPdfModal(false); }}>Download Complete PDF Report</button>
            </div>
            <div className="section-box mt-4" style={{ background: '#f8f8f8' }}>
              <div className="section-title">PDF Preview Content:</div>
              <ul style={{ paddingLeft: '20px', fontSize: '12px', marginTop: '6px' }}>
                <li>Application ID & Applicant Name</li>
                <li>Application Type & Country</li>
                <li>Application Date & Current Status</li>
                <li>Detailed Status History Timeline</li>
              </ul>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowDownloadPdfModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
