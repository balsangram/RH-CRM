import React, { useState } from 'react';
import VisaKanban from './VisaKanban';
import HolidayKanban from './HolidayKanban';
import {
  mockVisaServices,
  mockBookingServices,
  mockCountries,
  mockVisaDocumentsMatrix,
  mockHolidayPackages,
  mockStaffMembers
} from '../mockData';

export default function StaffDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appSubTab, setAppSubTab] = useState('visa'); // 'visa' (default) or 'holiday'
  const [packagesSubTab, setPackagesSubTab] = useState('visa'); // 'visa' or 'holiday'
  const [visaPackagesViewMode, setVisaPackagesViewMode] = useState('card'); // 'card' or 'table'
  const [holidayPackagesViewMode, setHolidayPackagesViewMode] = useState('card'); // 'card' or 'table'
  const [viewingCountryVisaDetails, setViewingCountryVisaDetails] = useState(null);
  const [viewingHolidayPackageDetails, setViewingHolidayPackageDetails] = useState(null);
  const [selectedVisaApp, setSelectedVisaApp] = useState(null);
  const [selectedHolidayApp, setSelectedHolidayApp] = useState(null);
  const [hasPaymentPermission, setHasPaymentPermission] = useState(true);
  const [hasExtensionPermission, setHasExtensionPermission] = useState(false); // Demonstrating approval requirement
  const [extensionForm, setExtensionForm] = useState({ days: 2, nights: 1, charges: 12000, remarks: 'Client requested extension in Paris.' });

  // Document Management State
  const [visaDocsList, setVisaDocsList] = useState([
    { id: 'DOC-301-1', name: 'Passport Front Page', mandatory: 'MANDATORY', status: 'VERIFIED' },
    { id: 'DOC-301-2', name: 'Bank Statement (6 Months)', mandatory: 'MANDATORY', status: 'PENDING VERIFICATION' },
    { id: 'DOC-301-3', name: 'Employment NOC Letter', mandatory: 'OPTIONAL', status: 'VERIFIED' }
  ]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocRequirement, setNewDocRequirement] = useState('MANDATORY');

  // Payment Management State
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('Credit Card / Online');
  const [newPaymentRef, setNewPaymentRef] = useState('');
  const [paymentsList, setPaymentsList] = useState([
    { id: 'PMT-001', date: '2026-10-02', mode: 'Credit Card / Online', amount: 10000, refNo: 'PAY-887123', status: 'Confirmed' }
  ]);
  const [holidayPaymentsList, setHolidayPaymentsList] = useState([
    { id: 'PAY-701', type: 'PREPAID', mode: 'Bank Transfer', amount: 35000, date: '2026-10-01', ref: 'TXN-998200' },
    { id: 'PAY-702', type: 'INSTALLMENT', mode: 'Credit Card / Online', amount: 50000, date: '2026-10-05', ref: 'TXN-998540' }
  ]);

  // Mock Countries & Packages List (Matching Super Admin datasets)
  const [countriesList] = useState([
    {
      id: 'CNTY-US',
      countryName: 'United States',
      countryCode: 'US',
      flag: '🇺🇸',
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&auto=format&fit=crop&q=60',
      visaTypesCount: 3,
      processingTime: '15-20 Days',
      startingPrice: 21000,
      status: 'Active',
      visaTypes: [
        { name: 'B1/B2 Tourist & Business Visa', validity: '10 Years Multiple Entry', processingFee: 21000, stayDuration: 'up to 180 Days' },
        { name: 'F1 Student Visa', validity: 'Duration of Study Course', processingFee: 28000, stayDuration: 'Course Duration + OPT' },
        { name: 'H1B / L1 Work Permit', validity: '3 Years Extendable', processingFee: 45000, stayDuration: 'Authorized Stay Period' }
      ],
      requiredDocs: [
        { name: 'DS-160 Confirmation Page', type: 'Mandatory', guidance: 'Must have barcoded confirmation printed in high resolution.' },
        { name: 'Passport (Valid 6+ Months)', type: 'Mandatory', guidance: 'Passport must have at least 2 blank pages remaining.' },
        { name: 'Bank Statement (6 Months)', type: 'Mandatory', guidance: 'Minimum closing balance ₹500,000 required with bank seal.' }
      ],
      guidance: 'Ensure DS-160 application details match passport exactly. Book interview slot at US Embassy/VAC after fee payment. Bring original financial proofs to interview.'
    },
    {
      id: 'CNTY-UK',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      flag: '🇬🇧',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=60',
      visaTypesCount: 2,
      processingTime: '10-15 Days',
      startingPrice: 24000,
      status: 'Active',
      visaTypes: [
        { name: 'Standard Visitor Visa (6 Months)', validity: '6 Months Multiple Entry', processingFee: 24000, stayDuration: 'up to 180 Days' },
        { name: 'Long Term Visitor Visa (2/5 Years)', validity: '2 to 5 Years Multiple Entry', processingFee: 55000, stayDuration: '180 Days per Visit' }
      ],
      requiredDocs: [
        { name: 'Valid Passport & Old Passports', type: 'Mandatory', guidance: 'Include all previous travel history passports.' },
        { name: 'Employment NOC Letter', type: 'Mandatory', guidance: 'Must state approved leave dates and monthly salary.' },
        { name: 'Income Tax Returns (3 Years)', type: 'Mandatory', guidance: 'ITR-V acknowledgments or Form 16.' }
      ],
      guidance: 'Biometric submission required at VFS Global center. UKVI online application must be submitted 3 months prior to travel.'
    },
    {
      id: 'CNTY-FR',
      countryName: 'Schengen (France / Europe)',
      countryCode: 'EU',
      flag: '🇪🇺',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60',
      visaTypesCount: 2,
      processingTime: '7-10 Days',
      startingPrice: 18500,
      status: 'Active',
      visaTypes: [
        { name: 'Tourist Visa C (Short Stay)', validity: 'up to 90 Days Schengen Zone', processingFee: 18500, stayDuration: '90 Days in 180 Days' },
        { name: 'Business Visa C', validity: 'up to 90 Days Multiple', processingFee: 22000, stayDuration: '90 Days' }
      ],
      requiredDocs: [
        { name: 'Flight & Hotel Cover Booking', type: 'Mandatory', guidance: 'Confirmed return flight itinerary and hotel vouchers.' },
        { name: 'Travel Medical Insurance (€30,000 Cover)', type: 'Mandatory', guidance: 'Must cover all Schengen states.' },
        { name: '6 Month Bank Statement', type: 'Mandatory', guidance: 'Recent bank statement stamped by bank.' }
      ],
      guidance: 'Apply at the Schengen embassy of country where main stay is scheduled. Minimum 3 weeks processing buffer required.'
    },
    {
      id: 'CNTY-JP',
      countryName: 'Japan',
      countryCode: 'JP',
      flag: '🇯🇵',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=60',
      visaTypesCount: 1,
      processingTime: '5-7 Days',
      startingPrice: 12500,
      status: 'Active',
      visaTypes: [
        { name: 'Temporary Visitor Visa (Tourist)', validity: '90 Days Single/Double Entry', processingFee: 12500, stayDuration: 'up to 30 Days' }
      ],
      requiredDocs: [
        { name: 'Visa Application Form with Photo', type: 'Mandatory', guidance: '2x2 inch photo with white background.' },
        { name: 'Daily Schedule / Itinerary (Form 2)', type: 'Mandatory', guidance: 'Detailed day-to-day plan with hotel contact.' }
      ],
      guidance: 'Applications submitted via VFS Japan center. Fast processing duration of 5 working days.'
    }
  ]);

  const [holidayPackagesList] = useState([
    {
      packageId: 'PKG-701',
      packageName: 'Bali Island Beach Getaway',
      country: 'Indonesia',
      destination: 'Bali, Indonesia',
      duration: '6 Days / 5 Nights',
      days: 6,
      nights: 5,
      price: 85000,
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=60',
      description: 'Experience pristine tropical beaches, luxury private pool villa stay, Kintamani volcano tour, and Nusa Penida island cruise.',
      inclusions: '5-Star Beach Resort, Daily Breakfast, Private Airport Transfers, Water Sports, Kintamani Sightseeing Tour, English Tour Guide',
      exclusions: 'International Flights, Personal Expenses, Lunch/Dinner, Visa on Arrival Fee ($35)',
      itinerary: [
        { day: 'Day 1', title: 'Arrival in Bali & Villa Check-in', detail: 'Welcome at Denpasar Airport, transfer to Seminyak luxury beach villa. Leisure evening.' },
        { day: 'Day 2', title: 'Kintamani Volcano & Ubud Cultural Tour', detail: 'Visit Tegenungan Waterfall, Sacred Monkey Forest, and scenic Mount Batur volcano view.' },
        { day: 'Day 3', title: 'Nusa Penida Island Speedboat Day Trip', detail: 'Explore Kelingking T-Rex Beach, Broken Beach, and Angel Billabong with snorkeling.' },
        { day: 'Day 4', title: 'Water Sports at Tanjung Benoa & Uluwatu Sunset', detail: 'Banana boat, Parasailing + Sunset kecak dance performance at Uluwatu Cliff Temple.' },
        { day: 'Day 5', title: 'Tanah Lot Temple & Balinese Spa Session', detail: 'Relaxing 2-hour traditional Balinese massage and Tanah Lot ocean temple sunset.' },
        { day: 'Day 6', title: 'Souvenir Shopping & Departure Transfer', detail: 'Breakfast, Krisna Balinese souvenir market visit, airport drop-off for flight home.' }
      ]
    },
    {
      packageId: 'PKG-702',
      packageName: 'Swiss Alps & Paris Highlights',
      country: 'France & Switzerland',
      destination: 'Paris & Zurich',
      duration: '8 Days / 7 Nights',
      days: 8,
      nights: 7,
      price: 210000,
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=60',
      description: 'Romantic Paris Eiffel Tower priority tour, TGV Bullet Train to Zurich, Lake Lucerne cruise, and Mount Titlis snow cable car adventure.',
      inclusions: '4-Star Central Hotels, Swiss Pass 4 Days, TGV High-Speed Rail, Eiffel Tower 2nd Floor Ticket, Mount Titlis Excursion, Daily Breakfast',
      exclusions: 'Airfare, Schengen Visa Fees, Personal Shopping, City Tourist Taxes',
      itinerary: [
        { day: 'Day 1', title: 'Arrival in Paris & Seine River Dinner Cruise', detail: 'Airport transfer to Paris hotel. Evening illuminated Eiffel Tower & Seine Cruise.' },
        { day: 'Day 2', title: 'Paris Guided City Tour & Louvre Museum', detail: 'Visit Arc de Triomphe, Champs-Élysées, Notre-Dame, and Louvre Museum photo stop.' },
        { day: 'Day 3', title: 'TGV Bullet Train to Zurich & Lake Promenade', detail: 'High-speed rail to Zurich. Evening stroll along Bahnhofstrasse and Lake Zurich.' },
        { day: 'Day 4', title: 'Lucerne & Mount Titlis Snow Adventure', detail: 'Rotair revolving cable car ride to Mount Titlis, Ice Flyer & Chapel Bridge Lucerne.' },
        { day: 'Day 5', title: 'Interlaken & Jungfraujoch Top of Europe', detail: 'Scenic train ride to Jungfraujoch snow peak elevation 3,454m.' },
        { day: 'Day 6', title: 'Rhine Falls Excursion & Swiss Chocolate Tasting', detail: 'Visit Europe largest waterfall at Rhine Falls Schaffhausen & Lindt Chocolate Home.' },
        { day: 'Day 7', title: 'Free Day in Zurich for Swiss Watch Shopping', detail: 'Leisure day to explore Old Town Zurich, cafes, and luxury Swiss watch shopping.' },
        { day: 'Day 8', title: 'Zurich Departure Transfer', detail: 'Check out and private transfer to Zurich Airport for return flight.' }
      ]
    },
    {
      packageId: 'PKG-703',
      packageName: 'Dubai Luxury Desert & Skyscraper Safari',
      country: 'UAE (Dubai)',
      destination: 'Dubai & Abu Dhabi',
      duration: '5 Days / 4 Nights',
      days: 5,
      nights: 4,
      price: 65000,
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=60',
      description: 'Burj Khalifa 124th floor observation deck, 4x4 Dune Bashing Desert Safari with BBQ dinner, Marina Dhow Cruise, and Abu Dhabi Sheikh Zayed Mosque.',
      inclusions: '4-Star Dubai Marina Hotel, 4x4 Desert Safari, Burj Khalifa At The Top Ticket, Abu Dhabi Day Tour, Dhow Cruise Dinner, Airport Transfers',
      exclusions: 'Flight Tickets, Tourism Dirham Fee ($5/night), UAE Visa Fee',
      itinerary: [
        { day: 'Day 1', title: 'Arrival in Dubai & Marina Dhow Cruise', detail: 'Airport transfer to hotel. Evening 2-hour Marina Dhow Cruise with buffet dinner & live Tanoura dance.' },
        { day: 'Day 2', title: 'Dubai City Tour & Burj Khalifa 124th Floor', detail: 'Visit Dubai Frame, Jumeirah Beach, Atlantis Palm, and evening Dubai Fountain show at Burj Khalifa.' },
        { day: 'Day 3', title: 'Desert Safari with 4x4 Dune Bashing & BBQ', detail: 'Afternoon 4x4 Land Cruiser dune bashing, camel riding, henna painting, belly dance & BBQ buffet.' },
        { day: 'Day 4', title: 'Abu Dhabi Grand Mosque & Ferrari World Visit', detail: 'Full day excursion to Abu Dhabi Sheikh Zayed Grand Mosque and Louvre Museum Abu Dhabi.' },
        { day: 'Day 5', title: 'Gold Souk Shopping & Airport Drop-off', detail: 'Visit Deira Gold & Spice Souk markets. Transfer to Dubai International Airport for departure.' }
      ]
    }
  ]);

  // Filter assigned items for staff member Amit Verma (CO-101)
  const [assignedVisaAppsState, setAssignedVisaAppsState] = useState(
    mockVisaServices.filter(v => v.caseOfficerId === 'CO-101')
  );
  const assignedVisaApps = assignedVisaAppsState;

  const [assignedHolidayAppsState, setAssignedHolidayAppsState] = useState(mockBookingServices);
  const assignedHolidayApps = assignedHolidayAppsState;

  const handleUpdateVisa = (updatedVisa) => {
    setAssignedVisaAppsState(prev =>
      prev.map(v => (v.id === updatedVisa.id ? { ...v, ...updatedVisa } : v))
    );
    if (selectedVisaApp && selectedVisaApp.id === updatedVisa.id) {
      setSelectedVisaApp(prev => ({ ...prev, ...updatedVisa }));
    }
  };

  const handleUpdateHoliday = (updatedBooking) => {
    setAssignedHolidayAppsState(prev =>
      prev.map(b => (b.packageId === updatedBooking.packageId ? { ...b, ...updatedBooking } : b))
    );
    if (selectedHolidayApp && selectedHolidayApp.packageId === updatedBooking.packageId) {
      setSelectedHolidayApp(prev => ({ ...prev, ...updatedBooking }));
    }
  };

  // Merged Applications List (Visa + Holiday)
  const allAssignedApps = [
    ...assignedVisaApps.map(v => ({
      id: v.id,
      applicantName: v.applicantName,
      type: 'Visa',
      details: v.visaType,
      destination: v.country,
      date: v.applicationDate,
      status: v.status,
      category: 'visa',
      raw: v
    })),
    ...assignedHolidayApps.map(h => ({
      id: h.packageId,
      applicantName: h.customerName,
      type: 'Holiday',
      details: h.packageName,
      destination: h.destination,
      date: h.bookingDate || '2026-10-01',
      status: h.status,
      category: 'holiday',
      raw: h
    }))
  ];

  const filteredApps = allAssignedApps.filter(app => {
    if (appSubTab === 'visa') return app.category === 'visa';
    if (appSubTab === 'holiday') return app.category === 'holiday';
    return true; // 'all'
  });

  const staffSummary = {
    totalAssigned: allAssignedApps.length,
    active: 6,
    pending: 5,
    completed: 3
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Staff Portal</div>
          <div className="sidebar-subtitle">Role: Sub-Admin / Staff</div>
        </div>
        <ul className="sidebar-nav">
          <li>
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => {
                setActiveTab('overview');
                setSelectedVisaApp(null);
                setSelectedHolidayApp(null);
              }}
            >
              <span>Home</span>
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'visa' ? 'active' : ''}
              onClick={() => {
                setActiveTab('visa');
                setSelectedVisaApp(null);
                setSelectedHolidayApp(null);
              }}
            >
              <span>Visa</span>   </button>
          </li>
          <li>
            <button
              className={activeTab === 'holiday' ? 'active' : ''}
              onClick={() => {
                setActiveTab('holiday');
                setSelectedVisaApp(null);
                setSelectedHolidayApp(null);
              }}
            >
              <span>Holiday</span>      </button>
          </li>
          <li>
            <button
              className={activeTab === 'visa-packages' ? 'active' : ''}
              onClick={() => {
                setActiveTab('visa-packages');
                setSelectedVisaApp(null);
                setSelectedHolidayApp(null);
                setViewingCountryVisaDetails(null);
                setViewingHolidayPackageDetails(null);
              }}
            >
              <span>Visa Packages</span>
            </button>
          </li>
          <li>
            <button
              className={activeTab === 'holiday-packages' ? 'active' : ''}
              onClick={() => {
                setActiveTab('holiday-packages');
                setSelectedVisaApp(null);
                setSelectedHolidayApp(null);
                setViewingCountryVisaDetails(null);
                setViewingHolidayPackageDetails(null);
              }}
            >
              <span>Holiday Packages</span>
            </button>
          </li>
        </ul>

      </aside>

      {/* Main Layout */}
      <div className="main-layout">
        <header className="top-header">
          <div className="top-header-left">
            <h1>
              {selectedVisaApp
                ? `Visa Application Details: ${selectedVisaApp.id}`
                : selectedHolidayApp
                  ? `Holiday Booking Details: ${selectedHolidayApp.packageId}`
                  : activeTab === 'overview'
                    ? 'Staff Dashboard Overview'
                    : activeTab === 'visa'
                      ? 'Assigned Visa Applications'
                      : activeTab === 'holiday'
                        ? 'Assigned Holiday Applications'
                        : activeTab === 'visa-packages'
                          ? 'Visa Packages & Countries'
                          : activeTab === 'holiday-packages'
                            ? 'Holiday / Tour Packages'
                            : 'Staff Dashboard'}
            </h1>
            <p>Officer: Amit Verma (Senior Case Officer - Visa Operations)</p>
          </div>
          <div className="user-profile-badge">
            <span>Staff Account &bull; <strong>Active</strong></span>
            <button className="btn btn-sm" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="content-body">
          {selectedVisaApp ? (
            /* DEDICATED FULL-PAGE VISA APPLICATION DETAILS VIEW (MATCHING IMAGE 2 EXACTLY) */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setSelectedVisaApp(null)}>
                  &larr; Back to Applications / Profile
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>
              </div>

              {/* 1. Header Box: Visa Application Details */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Visa Application Details: {selectedVisaApp.id}</div>
                  <span className="status-badge">{selectedVisaApp.status}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px' }}>
                  <div><strong>Applicant Name:</strong> {selectedVisaApp.applicantName}</div>
                  <div><strong>Email ID:</strong> vikram.roy@gmail.com</div>
                  <div><strong>Mobile Number:</strong> +91 99112 23344</div>
                  <div><strong>Target Country:</strong> {selectedVisaApp.country}</div>
                  <div><strong>Visa Type:</strong> {selectedVisaApp.visaType}</div>
                  <div><strong>Passport Details:</strong> Z9847291 (Exp: 2031-05-12)</div>
                  <div><strong>Case Officer:</strong> {selectedVisaApp.caseOfficerName || 'Amit Verma'} ({selectedVisaApp.caseOfficerId || 'CO-101'})</div>
                  <div><strong>Application Date:</strong> {selectedVisaApp.applicationDate}</div>
                </div>
              </div>

              {/* 2. Application Status Progression & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Application Status Progression & Update</div>
                </div>



                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc' }}>
                  <div className="filter-group">
                    <label>Change Application Status to:</label>
                    <select
                      value={selectedVisaApp.status}
                      onChange={e => {
                        const updatedStatus = e.target.value;
                        const updatedApp = { ...selectedVisaApp, status: updatedStatus };
                        setSelectedVisaApp(updatedApp);
                        setAssignedVisaAppsState(assignedVisaAppsState.map(v => v.id === selectedVisaApp.id ? updatedApp : v));
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Proceed">Proceed</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => alert(`Status updated to "${selectedVisaApp.status}"!`)}
                  >
                    Save Status Update
                  </button>
                </div>
              </div>

              {/* 3. Document Management & Verification Status (Matches Image 2 exactly) */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Document Management & Verification Status</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddDocModal(true)}>
                    + Add Document Name
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>DOCUMENT NAME</th>
                        <th>DOCUMENT REQUIREMENT</th>
                        <th>VERIFICATION STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visaDocsList.map(doc => (
                        <tr key={doc.id}>
                          <td><strong>{doc.name}</strong></td>
                          <td><span className="status-badge">{doc.mandatory}</span></td>
                          <td>
                            <span className="status-badge" style={{
                              backgroundColor: doc.status === 'Verified' || doc.status === 'VERIFIED' ? '#e6ffe6' : doc.status === 'Rejected' || doc.status === 'REJECTED' ? '#ffe6e6' : '#fff'
                            }}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button className="btn btn-sm" onClick={() => {
                              setVisaDocsList(visaDocsList.map(d => d.id === doc.id ? { ...d, status: 'VERIFIED' } : d));
                            }}>Verify</button>
                            <button className="btn btn-sm" onClick={() => {
                              setVisaDocsList(visaDocsList.map(d => d.id === doc.id ? { ...d, status: 'REJECTED' } : d));
                            }}>Reject</button>
                            <button className="btn btn-sm btn-danger" onClick={() => {
                              setVisaDocsList(visaDocsList.filter(d => d.id !== doc.id));
                            }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Payment Management (Multiple Payment Entries) */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Payment Management (Multiple Payment Entries)</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>
                {hasPaymentPermission ? (
                  <div>
                    <div className="form-grid mt-4">
                      <div><strong>Payment Type:</strong> {selectedVisaApp.paymentType || 'Installment (2 Parts)'}</div>
                      <div><strong>Total Amount:</strong> ₹{(selectedVisaApp.totalAmount || 18500).toLocaleString()}</div>
                      <div><strong>Paid Amount:</strong> ₹{(paymentsList.reduce((acc, p) => acc + Number(p.amount), 0)).toLocaleString()}</div>
                      <div><strong>Pending Amount:</strong> ₹{Math.max(0, (selectedVisaApp.totalAmount || 18500) - paymentsList.reduce((acc, p) => acc + Number(p.amount), 0)).toLocaleString()}</div>
                      <div><strong>Payment Status:</strong> {selectedVisaApp.paymentStatus || 'Partially Paid'}</div>
                    </div>
                    <div className="table-container mt-4">
                      <table>
                        <thead>
                          <tr>
                            <th>Payment ID</th>
                            <th>Date</th>
                            <th>Payment Mode</th>
                            <th>Ref / Transaction ID</th>
                            <th>Amount (₹)</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentsList.map(pmt => (
                            <tr key={pmt.id}>
                              <td className="font-mono"><strong>{pmt.id}</strong></td>
                              <td>{pmt.date}</td>
                              <td>{pmt.mode}</td>
                              <td className="font-mono">{pmt.refNo}</td>
                              <td className="font-mono">₹{Number(pmt.amount).toLocaleString()}</td>
                              <td><span className="status-badge">{pmt.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="action-cell mt-4">
                      <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>+ Add Payment Entry</button>
                      <button className="btn btn-sm" onClick={() => alert('Downloading Payment Invoice PDF')}>Download Invoice</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#777', marginTop: '8px' }}>
                    <em>Payment management is not permitted for your current role level. Contact Super Admin to enable payment permissions.</em>
                  </p>
                )}
              </div>

              {/* 5. Visa Upload */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Visa Document Upload & Final Issuance</div>
                </div>
                <p style={{ fontSize: '12px', margin: '8px 0' }}>Upload final approved visa document to attach to application:</p>
                <div className="action-cell">
                  <button className="btn btn-sm btn-primary" onClick={() => alert('Final Visa File Uploaded')}>Upload Visa</button>
                  <button className="btn btn-sm" onClick={() => alert('Viewing Final Visa')}>View Visa</button>
                  <button className="btn btn-sm" onClick={() => alert('Downloading Final Visa')}>Download Visa</button>
                </div>
              </div>
            </div>
          ) : selectedHolidayApp ? (
            /* DEDICATED FULL-PAGE HOLIDAY APPLICATION DETAILS VIEW (MATCHING SUPER ADMIN RICH DETAILS) */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setSelectedHolidayApp(null)}>
                  &larr; Back to Applications / Profile
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>
              </div>

              {/* 1. Header Box: Holiday Application Details */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Holiday Application Details: {selectedHolidayApp.packageId || 'PKG-701'}</div>
                  <span className="status-badge">{selectedHolidayApp.status || 'ACTIVE'}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px' }}>
                  <div><strong>Customer Name:</strong> {selectedHolidayApp.customerName || 'Sanya Malhotra'}</div>
                  <div><strong>Email ID:</strong> {selectedHolidayApp.email || 'sanya.m@gmail.com'}</div>
                  <div><strong>Mobile Number:</strong> {selectedHolidayApp.contactDetails || '+91 98111 55443'}</div>
                  <div><strong>Package Name:</strong> {selectedHolidayApp.packageName || 'Bali Island Beach Getaway'}</div>
                  <div><strong>Destination:</strong> {selectedHolidayApp.destination || 'Bali, Indonesia'}</div>
                  <div><strong>Duration:</strong> {selectedHolidayApp.duration || '6 Days / 5 Nights'}</div>
                  <div><strong>Departure Date:</strong> {selectedHolidayApp.departureDate || '2026-11-15'}</div>
                  <div><strong>Total Price:</strong> ₹{(selectedHolidayApp.totalPrice || selectedHolidayApp.price || 85000).toLocaleString()}</div>
                </div>
              </div>

              {/* 2. Booking Application Status Progression & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Booking Application Status Progression & Update</div>
                </div>
                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc' }}>
                  <div className="filter-group">
                    <label>Change Application / Booking Status to:</label>
                    <select
                      value={selectedHolidayApp.status || 'ACTIVE'}
                      onChange={e => {
                        const updatedStatus = e.target.value;
                        setSelectedHolidayApp({ ...selectedHolidayApp, status: updatedStatus });
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => alert(`Booking status updated to "${selectedHolidayApp.status || 'ACTIVE'}"!`)}>
                    Save Status Update
                  </button>
                </div>
              </div>

              {/* 3. Payment Management (Multiple Payment Entries) - Matches Screenshot 2 */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Payment Management (Multiple Payment Entries)</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
                  <div className="card">
                    <div className="card-title">TOTAL PACKAGE PRICE</div>
                    <div className="card-value">₹{(selectedHolidayApp.totalPrice || selectedHolidayApp.price || 85000).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">TOTAL PAID AMOUNT</div>
                    <div className="card-value">
                      ₹{holidayPaymentsList.reduce((acc, p) => acc + Number(p.amount), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">REMAINING BALANCE</div>
                    <div className="card-value">
                      ₹{Math.max(0, (selectedHolidayApp.totalPrice || selectedHolidayApp.price || 85000) - holidayPaymentsList.reduce((acc, p) => acc + Number(p.amount), 0)).toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">PAYMENT STATUS</div>
                    <div className="card-value" style={{ fontSize: '16px' }}>
                      {holidayPaymentsList.reduce((acc, p) => acc + Number(p.amount), 0) >= (selectedHolidayApp.totalPrice || selectedHolidayApp.price || 85000) ? 'PAID IN FULL' : 'PARTIALLY PAID'}
                    </div>
                  </div>
                </div>

                {/* Payments Table */}
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
                      {holidayPaymentsList.map(pay => (
                        <tr key={pay.id}>
                          <td className="font-mono"><strong>{pay.id}</strong></td>
                          <td><span className="status-badge">{pay.type}</span></td>
                          <td>{pay.mode}</td>
                          <td className="font-mono">₹{Number(pay.amount).toLocaleString()}</td>
                          <td>{pay.date}</td>
                          <td className="font-mono">{pay.ref}</td>
                          <td className="action-cell">
                            <button className="btn btn-sm" onClick={() => alert(`Downloading receipt for ${pay.id}`)}>Download</button>
                            <button className="btn btn-sm" onClick={() => alert(`Editing payment ${pay.id}`)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => setHolidayPaymentsList(holidayPaymentsList.filter(p => p.id !== pay.id))}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Extend Booking Duration & Special Requests (Preserving existing staff flow) */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Extend Booking Duration & Special Requests</div>
                </div>
                {hasExtensionPermission ? (
                  <div>
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>Staff has permission to extend directly:</p>
                    <div className="form-grid">
                      <div className="form-group"><label>Add Days:</label><input type="number" defaultValue="2" /></div>
                      <div className="form-group"><label>Add Nights:</label><input type="number" defaultValue="1" /></div>
                      <div className="form-group"><label>Add Charges (₹):</label><input type="number" defaultValue="12000" /></div>
                    </div>
                    <button className="btn btn-primary btn-sm mt-4" onClick={() => alert('Booking extended & total recalculated!')}>Update Booking</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '12px', color: '#333', marginBottom: '8px' }}>
                      Extending this booking requires management approval. Submit an <strong>Extension Request</strong> to Super Admin:
                    </p>
                    <div className="form-group">
                      <label>Extension Details & Remarks:</label>
                      <textarea value={extensionForm.remarks} onChange={e => setExtensionForm({ ...extensionForm, remarks: e.target.value })} rows="2"></textarea>
                    </div>
                    <button className="btn btn-primary btn-sm mt-4" onClick={() => alert('Extension Request submitted to Super Admin for approval!')}>
                      Submit Extension Request to Super Admin &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 1. OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div className="grid-cards">
                    <div className="card">
                      <div className="card-title">Total Assigned Applications</div>
                      <div className="card-value">{staffSummary.totalAssigned}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Assigned to logged-in staff</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button className="card-action" style={{ flex: 1, padding: 0 }} onClick={() => { setActiveTab('visa'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>Visa ({assignedVisaApps.length}) &rarr;</button>
                        <button className="card-action" style={{ flex: 1, padding: 0 }} onClick={() => { setActiveTab('holiday'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>Holiday ({assignedHolidayApps.length}) &rarr;</button>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-title">Active Applications</div>
                      <div className="card-value">{staffSummary.active}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Currently being processed</p>
                      <button className="card-action" onClick={() => { setActiveTab('visa'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>View Visa Pipeline &rarr;</button>
                    </div>
                    <div className="card">
                      <div className="card-title">Pending Applications</div>
                      <div className="card-value">{staffSummary.pending}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Waiting for review/action</p>
                      <button className="card-action" onClick={() => { setActiveTab('holiday'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>View Holiday Pipeline &rarr;</button>
                    </div>
                    <div className="card">
                      <div className="card-title">Completed Applications</div>
                      <div className="card-value">{staffSummary.completed}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Successfully completed</p>
                      <button className="card-action" onClick={() => { setActiveTab('visa'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>View Completed &rarr;</button>
                    </div>
                  </div>

                  {/* SINGLE MERGED TABLE ON OVERVIEW */}
                  <div className="section-box">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="section-title">Assigned Applications ({allAssignedApps.length})</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => { setActiveTab('visa'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>
                          Visa Applications ({assignedVisaApps.length}) &rarr;
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => { setActiveTab('holiday'); setSelectedVisaApp(null); setSelectedHolidayApp(null); }}>
                          Holiday Applications ({assignedHolidayApps.length}) &rarr;
                        </button>
                      </div>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Application ID</th>
                            <th>Applicant / Customer Name</th>
                            <th>Application Type</th>
                            <th>Country / Destination</th>
                            <th>Application Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAssignedApps.map((app, index) => (
                            <tr key={index}>
                              <td className="font-mono"><strong>{app.id}</strong></td>
                              <td>{app.applicantName}</td>
                              <td><span className="status-badge">{app.type}</span> ({app.details})</td>
                              <td>{app.destination}</td>
                              <td>{app.date}</td>
                              <td><span className="status-badge">{app.status}</span></td>
                              <td className="action-cell">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => {
                                    if (app.category === 'visa') {
                                      setSelectedVisaApp(app.raw);
                                    } else {
                                      setSelectedHolidayApp(app.raw);
                                    }
                                  }}
                                >
                                  View &rarr;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ASSIGNED VISA APPLICATIONS PAGE WITH KANBAN PIPELINE */}
              {(activeTab === 'visa' || (activeTab === 'all' && appSubTab === 'visa')) && (
                <div>
                  <VisaKanban
                    title="Assigned Visa Applications — Kanban Pipeline"
                    visaList={assignedVisaApps}
                    onUpdateVisa={handleUpdateVisa}
                    staffMembers={mockStaffMembers}
                    onViewDetails={(visa) => {
                      setSelectedVisaApp(visa);
                    }}
                  />
                </div>
              )}

              {/* 3. ASSIGNED HOLIDAY APPLICATIONS PAGE WITH KANBAN PIPELINE */}
              {(activeTab === 'holiday' || (activeTab === 'all' && appSubTab === 'holiday')) && (
                <div>
                  <HolidayKanban
                    title="Assigned Holiday Applications — Kanban Pipeline"
                    bookingList={assignedHolidayApps}
                    onUpdateBooking={handleUpdateHoliday}
                    staffMembers={mockStaffMembers}
                    onViewDetails={(bk) => {
                      setSelectedHolidayApp(bk);
                    }}
                  />
                </div>
              )}

              {/* 3. VISA PACKAGES (DEDICATED PAGE) */}
              {(activeTab === 'visa-packages' || activeTab === 'packages') && (
                <div>
                  {viewingCountryVisaDetails ? (
                    /* DEDICATED FULL-PAGE COUNTRY VISA DETAILS VIEW (STAFF READ-ONLY) */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setViewingCountryVisaDetails(null)}>
                          &larr; Back to Visa Packages
                        </button>
                      </div>

                      {/* Country Header Box */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '28px' }}>{viewingCountryVisaDetails.flag || '🌐'}</span>
                            <span>Visa Details: {viewingCountryVisaDetails.countryName} ({viewingCountryVisaDetails.countryCode})</span>
                          </div>
                          <span className="status-badge">{viewingCountryVisaDetails.status || 'Active'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginTop: '12px' }}>
                          <div style={{ border: '1px solid #ccc', padding: '4px', background: '#fff' }}>
                            <img
                              src={viewingCountryVisaDetails.imageUrl}
                              alt={viewingCountryVisaDetails.countryName}
                              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="form-grid" style={{ fontSize: '13px', alignContent: 'center' }}>
                            <div><strong>Country Name:</strong> {viewingCountryVisaDetails.countryName}</div>
                            <div><strong>Country Code:</strong> {viewingCountryVisaDetails.countryCode}</div>
                            <div><strong>Visa Types Provided:</strong> {(viewingCountryVisaDetails.visaTypes ? viewingCountryVisaDetails.visaTypes.length : 0)} Visa Types</div>
                            <div><strong>Standard Processing Time:</strong> {viewingCountryVisaDetails.processingTime || '10-15 Days'}</div>
                            <div><strong>Starting Visa Fee:</strong> ₹{(viewingCountryVisaDetails.startingPrice || 18500).toLocaleString()}</div>
                            <div><strong>Embassy Status:</strong> Active Visa Issuance</div>
                          </div>
                        </div>
                      </div>

                      {/* Visa Types Provided */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">1. Visa Types Provided for {viewingCountryVisaDetails.countryName}</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Visa Type Name</th>
                                <th>Validity Period</th>
                                <th>Permitted Stay Duration</th>
                                <th>Processing Fee (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(viewingCountryVisaDetails.visaTypes && viewingCountryVisaDetails.visaTypes.length > 0) ? (
                                viewingCountryVisaDetails.visaTypes.map((vt, i) => (
                                  <tr key={i}>
                                    <td><strong>{vt.name}</strong></td>
                                    <td>{vt.validity}</td>
                                    <td>{vt.stayDuration}</td>
                                    <td className="font-mono">₹{(vt.processingFee || 0).toLocaleString()}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                                    No visa types added yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Document Requirements Matrix */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">2. Document Requirements & Matrix</div>
                        </div>
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Document Name</th>
                                <th>Requirement Type</th>
                                <th>Guidelines & Format Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(viewingCountryVisaDetails.requiredDocs && viewingCountryVisaDetails.requiredDocs.length > 0) ? (
                                viewingCountryVisaDetails.requiredDocs.map((doc, i) => (
                                  <tr key={i}>
                                    <td><strong>{doc.name}</strong></td>
                                    <td><span className="status-badge">{doc.type}</span></td>
                                    <td>{doc.guidance}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                                    No document requirements added yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Embassy Step-by-Step Guidance */}
                      <div className="section-box">
                        <div className="section-header">
                          <div className="section-title">3. Official Embassy Guidance & Application Instructions</div>
                        </div>
                        {viewingCountryVisaDetails.guidance && viewingCountryVisaDetails.guidance.trim() !== '' ? (
                          <div style={{ fontSize: '13px', lineHeight: '1.6', background: '#f9f9f9', padding: '16px', border: '1px solid #ccc', marginTop: '12px' }}>
                            <p><strong>Step-by-Step Guidance:</strong></p>
                            <p>{viewingCountryVisaDetails.guidance}</p>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fafafa', border: '1px dashed #ccc', marginTop: '12px' }}>
                            <p style={{ color: '#666' }}>No official embassy guidance available.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* VISA PACKAGES CATALOG (CARDS & TABLE) */
                    <div className="section-box">
                      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div className="section-title">Visa Packages &amp; Countries Offered ({countriesList.length} Countries)</div>
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>Browse visa-eligible countries, processing times, fees, and required documents</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#666' }}>Format:</span>
                          <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <button
                              className={`btn btn-sm ${visaPackagesViewMode === 'table' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setVisaPackagesViewMode('table')}
                            >☰ Table</button>
                            <button
                              className={`btn btn-sm ${visaPackagesViewMode === 'card' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setVisaPackagesViewMode('card')}
                            >▦ Cards</button>
                          </div>
                        </div>
                      </div>

                      {/* 1. CARD VIEW (Matching Holiday Master Card Design) */}
                      {visaPackagesViewMode === 'card' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
                          {countriesList.map(c => (
                            <div key={c.id || c.countryCode} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #ccc' }}>
                              <div style={{ position: 'relative', width: '100%', height: '160px' }}>
                                <img
                                  src={c.imageUrl || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600'}
                                  alt={c.countryName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.92)', padding: '2px 8px', borderRadius: '3px', fontSize: '18px', border: '1px solid #ddd' }}>
                                  {c.flag || '🌐'}
                                </div>
                              </div>
                              <div style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                  <div>
                                    <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{c.id || c.countryCode} &bull; {c.countryCode}</span>
                                    <h3 style={{ fontSize: '14px', margin: '4px 0 2px 0' }}>{c.countryName}</h3>
                                  </div>
                                  <span className="status-badge">{c.status}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#555', margin: '4px 0' }}>
                                  📄 {c.visaTypesCount || (c.visaTypes ? c.visaTypes.length : 2)} Visa Types &bull; ⏱️ {c.processingTime || '10-15 Days'}
                                </p>
                                <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '8px 0' }}>
                                  ₹{(c.startingPrice || 18500).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>starting fee</span>
                                </p>
                                <p style={{ fontSize: '11px', color: '#666', background: '#f5f5f5', padding: '6px', border: '1px solid #eee', margin: '6px 0 12px 0' }}>
                                  <strong>Required Docs:</strong> {c.requiredDocs && c.requiredDocs.length > 0 ? c.requiredDocs.map(d => d.name).join(', ') : 'Valid Passport, Photographs, Financial Proofs'}
                                </p>
                                <div className="action-cell" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                                  <button className="btn btn-sm btn-primary" onClick={() => setViewingCountryVisaDetails(c)}>View Details &rarr;</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 2. TABLE VIEW */}
                      {visaPackagesViewMode === 'table' && (
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Country / Image</th>
                                <th>Country Name</th>
                                <th>Code</th>
                                <th>Visa Types Offered</th>
                                <th>Processing Time</th>
                                <th>Starting Fee (₹)</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {countriesList.map(c => (
                                <tr key={c.id || c.countryCode}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <img
                                        src={c.imageUrl || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=100'}
                                        alt={c.countryName}
                                        style={{ width: '45px', height: '32px', objectFit: 'cover', border: '1px solid #ccc' }}
                                      />
                                      <span style={{ fontSize: '18px' }}>{c.flag || '🌐'}</span>
                                    </div>
                                  </td>
                                  <td><strong>{c.countryName}</strong></td>
                                  <td className="font-mono">{c.countryCode}</td>
                                  <td><span className="status-badge">{c.visaTypesCount || (c.visaTypes ? c.visaTypes.length : 2)} Types</span></td>
                                  <td>{c.processingTime || '10-15 Days'}</td>
                                  <td className="font-mono">₹{(c.startingPrice || 18500).toLocaleString()}</td>
                                  <td><span className="status-badge">{c.status}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm btn-primary" onClick={() => setViewingCountryVisaDetails(c)}>View Details &rarr;</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. HOLIDAY PACKAGES (DEDICATED PAGE) */}
              {activeTab === 'holiday-packages' && (
                <div>
                  {viewingHolidayPackageDetails ? (
                    /* DEDICATED FULL-PAGE HOLIDAY PACKAGE DETAILS VIEW (STAFF READ-ONLY) */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setViewingHolidayPackageDetails(null)}>
                          &larr; Back to Holiday Packages
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
                              src={viewingHolidayPackageDetails.imageUrl}
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
                            <div><strong>Package Price:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>₹{(viewingHolidayPackageDetails.price || 85000).toLocaleString()}</span> per person</div>
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
                          {(viewingHolidayPackageDetails.itinerary && viewingHolidayPackageDetails.itinerary.length > 0) ? (
                            viewingHolidayPackageDetails.itinerary.map((itin, idx) => (
                              <div key={idx} style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px' }}>
                                  <span>{itin.day}: {itin.title}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>{itin.detail}</p>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fafafa', border: '1px dashed #ccc' }}>
                              <p style={{ color: '#666' }}>No itinerary details available.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* HOLIDAY PACKAGES CATALOG (CARDS & TABLE) */
                    <div className="section-box">
                      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div className="section-title">Holiday / Tour Packages ({holidayPackagesList.length} Packages)</div>
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>Browse holiday tour packages, destinations, pricing, inclusions, and itineraries</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#666' }}>Format:</span>
                          <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <button
                              className={`btn btn-sm ${holidayPackagesViewMode === 'table' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setHolidayPackagesViewMode('table')}
                            >☰ Table</button>
                            <button
                              className={`btn btn-sm ${holidayPackagesViewMode === 'card' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setHolidayPackagesViewMode('card')}
                            >▦ Cards</button>
                          </div>
                        </div>
                      </div>

                      {/* 1. CARD VIEW (Matching Holiday Master Card Design) */}
                      {holidayPackagesViewMode === 'card' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
                          {holidayPackagesList.map(pkg => (
                            <div key={pkg.packageId} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #ccc' }}>
                              <img
                                src={pkg.imageUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600'}
                                alt={pkg.packageName}
                                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                              />
                              <div style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                  <div>
                                    <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{pkg.packageId} &bull; {pkg.country}</span>
                                    <h3 style={{ fontSize: '14px', margin: '4px 0 2px 0' }}>{pkg.packageName}</h3>
                                  </div>
                                  <span className="status-badge">{pkg.status}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#555', margin: '4px 0' }}>📍 {pkg.destination} &bull; ⏱️ {pkg.duration}</p>
                                <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '8px 0' }}>₹{pkg.price.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#666' }}>per person</span></p>
                                <p style={{ fontSize: '11px', color: '#666', background: '#f5f5f5', padding: '6px', border: '1px solid #eee', margin: '6px 0 12px 0' }}>
                                  <strong>Inclusions:</strong> {pkg.inclusions}
                                </p>
                                <div className="action-cell" style={{ justifyContent: 'flex-start' }}>
                                  <button className="btn btn-sm btn-primary" onClick={() => setViewingHolidayPackageDetails(pkg)}>View Details &rarr;</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 2. TABLE VIEW */}
                      {holidayPackagesViewMode === 'table' && (
                        <div className="table-container mt-4">
                          <table>
                            <thead>
                              <tr>
                                <th>Package Image</th>
                                <th>Package ID</th>
                                <th>Package Name</th>
                                <th>Country & Destination</th>
                                <th>Duration</th>
                                <th>Price per Person</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {holidayPackagesList.map(pkg => (
                                <tr key={pkg.packageId}>
                                  <td>
                                    <img
                                      src={pkg.imageUrl || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100'}
                                      alt={pkg.packageName}
                                      style={{ width: '45px', height: '32px', objectFit: 'cover', border: '1px solid #ccc' }}
                                    />
                                  </td>
                                  <td className="font-mono">{pkg.packageId}</td>
                                  <td><strong>{pkg.packageName}</strong></td>
                                  <td>{pkg.country} - {pkg.destination}</td>
                                  <td>{pkg.duration}</td>
                                  <td className="font-mono">₹{pkg.price.toLocaleString()}</td>
                                  <td><span className="status-badge">{pkg.status}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm btn-primary" onClick={() => setViewingHolidayPackageDetails(pkg)}>View Details &rarr;</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 5. STAFF PROFILE */}
              {activeTab === 'profile' && (
                <div className="section-box" style={{ maxWidth: '600px' }}>
                  <div className="section-header">
                    <div className="section-title">Staff Profile Information</div>
                  </div>
                  <div className="form-grid">
                    <div><strong>Employee ID:</strong> CO-101</div>
                    <div><strong>Name:</strong> Amit Verma</div>
                    <div><strong>Email:</strong> amit.v@rhglobal.com</div>
                    <div><strong>Mobile Number:</strong> +91 98888 77766</div>
                    <div><strong>Department:</strong> Visa Operations (Read-Only)</div>
                    <div><strong>Role:</strong> Senior Case Officer (Read-Only)</div>
                    <div><strong>Account Status:</strong> <span className="status-badge">Active</span></div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '14px' }}>
                    * Note: Staff members cannot modify their department, role, or system permissions directly. Changes must be made by Super Admin.
                  </p>
                  <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                    <button className="btn btn-primary" onClick={() => alert('Profile update saved')}>Edit Profile</button>
                    <button className="btn" onClick={() => alert('Change Password flow triggered')}>Change Password</button>
                    <button className="btn btn-danger" onClick={onLogout}>Logout</button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* --- ADD DOCUMENT MODAL --- */}
      {showAddDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div className="modal-title">Add Document Requirement</div>
              <button className="close-btn" onClick={() => setShowAddDocModal(false)}>X</button>
            </div>
            <div className="form-group mt-4">
              <label>Document Name:</label>
              <input
                type="text"
                placeholder="e.g. Income Tax Returns (3 Years)"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
              />
            </div>
            <div className="form-group mt-4">
              <label>Requirement Type:</label>
              <select value={newDocRequirement} onChange={e => setNewDocRequirement(e.target.value)}>
                <option value="MANDATORY">MANDATORY</option>
                <option value="OPTIONAL">OPTIONAL</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (!newDocName.trim()) return alert('Please enter document name');
                  const newDoc = {
                    id: `DOC-${Date.now()}`,
                    name: newDocName.trim(),
                    mandatory: newDocRequirement,
                    status: 'PENDING VERIFICATION'
                  };
                  setVisaDocsList([...visaDocsList, newDoc]);
                  setNewDocName('');
                  setShowAddDocModal(false);
                }}
              >
                Add Document
              </button>
              <button className="btn btn-sm" onClick={() => setShowAddDocModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD PAYMENT ENTRY MODAL --- */}
      {showAddPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div className="modal-title">Add Payment Entry</div>
              <button className="close-btn" onClick={() => setShowAddPaymentModal(false)}>X</button>
            </div>
            <div className="form-group mt-4">
              <label>Payment Amount (₹):</label>
              <input
                type="number"
                placeholder="e.g. 8500"
                value={newPaymentAmount}
                onChange={e => setNewPaymentAmount(e.target.value)}
              />
            </div>
            <div className="form-group mt-4">
              <label>Payment Mode:</label>
              <select value={newPaymentMode} onChange={e => setNewPaymentMode(e.target.value)}>
                <option value="Credit Card / Online">Credit Card / Online</option>
                <option value="UPI / NetBanking">UPI / NetBanking</option>
                <option value="Cash Deposit">Cash Deposit</option>
                <option value="Bank Wire Transfer">Bank Wire Transfer</option>
              </select>
            </div>
            <div className="form-group mt-4">
              <label>Transaction / Reference ID:</label>
              <input
                type="text"
                placeholder="e.g. TXN-994811"
                value={newPaymentRef}
                onChange={e => setNewPaymentRef(e.target.value)}
              />
            </div>
            <div className="form-actions mt-4">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (!newPaymentAmount || Number(newPaymentAmount) <= 0) return alert('Please enter a valid payment amount');
                  const newEntry = {
                    id: `PMT-00${paymentsList.length + 1}`,
                    date: new Date().toISOString().split('T')[0],
                    mode: newPaymentMode,
                    amount: Number(newPaymentAmount),
                    refNo: newPaymentRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                    status: 'Confirmed'
                  };
                  setPaymentsList([...paymentsList, newEntry]);
                  setNewPaymentAmount('');
                  setNewPaymentRef('');
                  setShowAddPaymentModal(false);
                }}
              >
                Save Payment Entry
              </button>
              <button className="btn btn-sm" onClick={() => setShowAddPaymentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
