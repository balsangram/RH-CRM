import React, { useState } from 'react';
import {
  mockVisaServices,
  mockBookingServices,
  mockCountries,
  mockVisaDocumentsMatrix,
  mockHolidayPackages
} from '../mockData';

export default function StaffDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [appSubTab, setAppSubTab] = useState('visa'); // 'visa' (default) or 'holiday'
  const [packagesSubTab, setPackagesSubTab] = useState('visa'); // 'visa' or 'holiday'
  const [viewingCountryVisaDetails, setViewingCountryVisaDetails] = useState(null);
  const [viewingHolidayPackageDetails, setViewingHolidayPackageDetails] = useState(null);
  const [selectedVisaApp, setSelectedVisaApp] = useState(null);
  const [selectedHolidayApp, setSelectedHolidayApp] = useState(null);
  const [hasPaymentPermission, setHasPaymentPermission] = useState(true);
  const [hasExtensionPermission, setHasExtensionPermission] = useState(false); // Demonstrating approval requirement
  const [extensionForm, setExtensionForm] = useState({ days: 2, nights: 1, charges: 12000, remarks: 'Client requested extension in Paris.' });

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
  const assignedVisaApps = mockVisaServices.filter(v => v.caseOfficerId === 'CO-101');
  const assignedHolidayApps = mockBookingServices; // Mock assigned holiday bookings

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
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <span>1. Dashboard Overview</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>
              <span>2. Applications</span>
              <span className="nav-badge">{staffSummary.totalAssigned}</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'packages' ? 'active' : ''} onClick={() => setActiveTab('packages')}>
              <span>3. Packages</span>
            </button>
          </li>
       
        </ul>
        <div className="sidebar-footer">
          <div>Logged in: <strong>amit.v@rhglobal.com</strong></div>
          <p style={{ fontSize: '10px' }}>Employee ID: CO-101</p>
          <button className="btn btn-sm mt-4" style={{ width: '100%' }} onClick={onLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="main-layout">
        <header className="top-header">
          <div className="top-header-left">
            <h1>Staff Dashboard Overview</h1>
            <p>Officer: Amit Verma (Senior Case Officer - Visa Operations)</p>
          </div>
          <div className="user-profile-badge">
            <span>Staff Account &bull; <strong>Active</strong></span>
            <button className="btn btn-sm" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="content-body">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid-cards">
                <div className="card">
                  <div className="card-title">Total Assigned Applications</div>
                  <div className="card-value">{staffSummary.totalAssigned}</div>
                  <p style={{ fontSize: '11px', color: '#555' }}>Assigned to logged-in staff</p>
                  <button className="card-action" onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>View All &rarr;</button>
                </div>
                <div className="card">
                  <div className="card-title">Active Applications</div>
                  <div className="card-value">{staffSummary.active}</div>
                  <p style={{ fontSize: '11px', color: '#555' }}>Currently being processed</p>
                  <button className="card-action" onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>View Active &rarr;</button>
                </div>
                <div className="card">
                  <div className="card-title">Pending Applications</div>
                  <div className="card-value">{staffSummary.pending}</div>
                  <p style={{ fontSize: '11px', color: '#555' }}>Waiting for review/action</p>
                  <button className="card-action" onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>View Pending &rarr;</button>
                </div>
                <div className="card">
                  <div className="card-title">Completed Applications</div>
                  <div className="card-value">{staffSummary.completed}</div>
                  <p style={{ fontSize: '11px', color: '#555' }}>Successfully completed</p>
                  <button className="card-action" onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>View Completed &rarr;</button>
                </div>
              </div>

              {/* SINGLE MERGED TABLE ON OVERVIEW */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Assigned Applications ({allAssignedApps.length})</div>
                  <button className="btn btn-sm btn-primary" onClick={() => { setActiveTab('all'); setAppSubTab('visa'); }}>
                    Go to Applications Page &rarr;
                  </button>
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
                                setActiveTab('all');
                                if (app.category === 'visa') {
                                  setAppSubTab('visa');
                                } else {
                                  setAppSubTab('holiday');
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

          {/* 2. APPLICATIONS PAGE WITH 2 TOP BUTTONS (VISA / HOLIDAY) */}
          {activeTab === 'all' && (
            <div>
              {/* 2 TOP BUTTONS (VISA APPLICATIONS / HOLIDAY APPLICATIONS) */}
              <div className="tabs-header" style={{ marginBottom: '16px' }}>
                <button
                  className={`tab-btn ${appSubTab === 'visa' || appSubTab === 'all' ? 'active' : ''}`}
                  onClick={() => setAppSubTab('visa')}
                >
                  Visa Applications ({assignedVisaApps.length})
                </button>
                <button
                  className={`tab-btn ${appSubTab === 'holiday' ? 'active' : ''}`}
                  onClick={() => setAppSubTab('holiday')}
                >
                  Holiday Applications ({assignedHolidayApps.length})
                </button>
              </div>

              {/* DISPLAY ASSIGNED VISA APPLICATIONS (2) WHEN VISA BUTTON IS CLICKED */}
              {(appSubTab === 'visa' || appSubTab === 'all') && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Assigned Visa Applications ({assignedVisaApps.length})</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Application ID</th>
                          <th>Applicant Name</th>
                          <th>Country</th>
                          <th>Visa Type</th>
                          <th>Case Officer Name</th>
                          <th>Case Officer ID</th>
                          <th>Application Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedVisaApps.map(visa => (
                          <tr key={visa.id}>
                            <td className="font-mono"><strong>{visa.id}</strong></td>
                            <td>{visa.applicantName}</td>
                            <td>{visa.country}</td>
                            <td>{visa.visaType}</td>
                            <td>{visa.caseOfficerName}</td>
                            <td className="font-mono">{visa.caseOfficerId}</td>
                            <td>{visa.applicationDate}</td>
                            <td><span className="status-badge">{visa.status}</span></td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => setSelectedVisaApp(visa)}>View / Edit Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DISPLAY ASSIGNED HOLIDAY APPLICATIONS (2) WHEN HOLIDAY BUTTON IS CLICKED */}
              {appSubTab === 'holiday' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Assigned Holiday Applications ({assignedHolidayApps.length})</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>App / Booking ID</th>
                          <th>Package ID</th>
                          <th>Package Name</th>
                          <th>Customer Name</th>
                          <th>Destination</th>
                          <th>Duration</th>
                          <th>Total Price</th>
                          <th>Payment Status</th>
                          <th>Booking Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedHolidayApps.map(bk => (
                          <tr key={bk.packageId}>
                            <td className="font-mono"><strong>{bk.packageId}</strong></td>
                            <td className="font-mono">{bk.packageId}</td>
                            <td>{bk.packageName}</td>
                            <td>{bk.customerName}</td>
                            <td>{bk.destination}</td>
                            <td>{bk.duration}</td>
                            <td className="font-mono">₹{bk.totalPrice.toLocaleString()}</td>
                            <td><span className="status-badge">{bk.paymentStatus}</span></td>
                            <td><span className="status-badge">{bk.status}</span></td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => setSelectedHolidayApp(bk)}>View / Edit</button>
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

          {/* 3. PACKAGES */}
          {activeTab === 'packages' && (
            <div>
              {viewingCountryVisaDetails ? (
                /* DEDICATED FULL-PAGE COUNTRY VISA DETAILS VIEW (STAFF READ-ONLY) */
                <div>
                  <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button className="btn" onClick={() => setViewingCountryVisaDetails(null)}>
                      &larr; Back to Packages & Catalog
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
              ) : viewingHolidayPackageDetails ? (
                /* DEDICATED FULL-PAGE HOLIDAY PACKAGE DETAILS VIEW (STAFF READ-ONLY) */
                <div>
                  <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button className="btn" onClick={() => setViewingHolidayPackageDetails(null)}>
                      &larr; Back to Packages & Catalog
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
                /* MAIN PACKAGES CATALOG VIEW WITH 2 SUB-TABS (MATCHING SUPER ADMIN) */
                <div>
                  {/* 2 Sub-Tabs Header */}
                  <div className="tabs-header" style={{ marginBottom: '16px' }}>
                    <button
                      className={`tab-btn ${packagesSubTab === 'visa' ? 'active' : ''}`}
                      onClick={() => setPackagesSubTab('visa')}
                    >
                      Visa Packages / Countries ({countriesList.length})
                    </button>
                    <button
                      className={`tab-btn ${packagesSubTab === 'holiday' ? 'active' : ''}`}
                      onClick={() => setPackagesSubTab('holiday')}
                    >
                      Holiday / Tour Packages ({holidayPackagesList.length})
                    </button>
                  </div>

                  {/* SUB-TAB 1: VISA PACKAGES / COUNTRIES */}
                  {packagesSubTab === 'visa' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Visa Packages & Countries Offered ({countriesList.length} Countries)</div>
                      </div>

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
                    </div>
                  )}

                  {/* SUB-TAB 2: HOLIDAY PACKAGES */}
                  {packagesSubTab === 'holiday' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Holiday / Tour Packages ({holidayPackagesList.length} Packages)</div>
                      </div>

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
        </main>
      </div>

      {/* --- STAFF MODALS --- */}
      {/* Visa Application Details Modal */}
      {selectedVisaApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div className="modal-title">4.1 Staff Visa Application Details: {selectedVisaApp.id}</div>
              <button className="close-btn" onClick={() => setSelectedVisaApp(null)}>X</button>
            </div>

            <div className="section-box">
              <div className="section-title">Applicant Information</div>
              <div className="form-grid mt-4">
                <div><strong>Applicant Name:</strong> {selectedVisaApp.applicantName}</div>
                <div><strong>Email:</strong> vikram.roy@gmail.com</div>
                <div><strong>Mobile Number:</strong> +91 99112 23344</div>
                <div><strong>Country:</strong> {selectedVisaApp.country}</div>
                <div><strong>Passport Details:</strong> Z9847291 (Exp: 2031-05-12)</div>
                <div><strong>Visa Type:</strong> {selectedVisaApp.visaType}</div>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Document Management</div>
              <div className="table-container mt-4">
                <table>
                  <thead>
                    <tr><th>Document Name</th><th>Verification Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Passport_Front_Page.pdf</td>
                      <td><span className="status-badge">Verified</span></td>
                      <td><button className="btn btn-sm" onClick={() => alert('Changed verification status')}>Change Status</button></td>
                    </tr>
                    <tr>
                      <td>Bank_Statement_6Months.pdf</td>
                      <td><span className="status-badge">Pending</span></td>
                      <td><button className="btn btn-sm" onClick={() => alert('Changed verification status')}>Change Status</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="action-cell mt-4">
                <button className="btn btn-sm" onClick={() => alert('View Documents')}>View Documents</button>
                <button className="btn btn-sm" onClick={() => alert('Add required document')}>Add Required Doc</button>
                <button className="btn btn-sm btn-primary" onClick={() => alert('Uploading additional document')}>Upload Additional Doc</button>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Application Status Update Flow</div>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>Current Lifecycle Stage:</p>
              <div className="stepper-container">
                <div className={`stepper-item ${selectedVisaApp.status === 'Pending' ? 'active' : ''}`}>1. Pending</div>
                <div className="stepper-arrow">&darr;</div>
                <div className={`stepper-item ${selectedVisaApp.status === 'Under Review' ? 'active' : ''}`}>2. Under Review</div>
                <div className="stepper-arrow">&darr;</div>
                <div className={`stepper-item ${selectedVisaApp.status === 'Proceed' ? 'active' : ''}`}>3. Proceed</div>
                <div className="stepper-arrow">&darr;</div>
                <div className={`stepper-item ${selectedVisaApp.status === 'Approved' ? 'active' : ''}`}>4. Approved / Rejected</div>
                <div className="stepper-arrow">&darr;</div>
                <div className={`stepper-item ${selectedVisaApp.status === 'Completed' ? 'active' : ''}`}>5. Completed</div>
              </div>
              <div className="filter-group mt-4">
                <label>Update Status to:</label>
                <select defaultValue={selectedVisaApp.status}>
                  <option>Pending</option>
                  <option>Under Review</option>
                  <option>Proceed</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Completed</option>
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => alert('Status updated successfully!')}>Update Status</button>
              </div>
            </div>

            {/* 4.2 Visa Payment Information (Conditional based on Permission) */}
            <div className="section-box">
              <div className="section-title">4.2 Visa Payment Information</div>
              {hasPaymentPermission ? (
                <div>
                  <div className="form-grid mt-4">
                    <div><strong>Payment Type:</strong> {selectedVisaApp.paymentType}</div>
                    <div><strong>Total Amount:</strong> ₹{selectedVisaApp.totalAmount.toLocaleString()}</div>
                    <div><strong>Paid Amount:</strong> ₹{selectedVisaApp.paidAmount.toLocaleString()}</div>
                    <div><strong>Pending Amount:</strong> ₹{selectedVisaApp.pendingAmount.toLocaleString()}</div>
                    <div><strong>Payment Status:</strong> {selectedVisaApp.paymentStatus}</div>
                  </div>
                  <div className="action-cell mt-4">
                    <button className="btn btn-sm" onClick={() => alert('Create Payment')}>Create Payment</button>
                    <button className="btn btn-sm" onClick={() => alert('View Payment')}>View Payment</button>
                    <button className="btn btn-sm" onClick={() => alert('Update Payment')}>Update Payment</button>
                    <button className="btn btn-sm" onClick={() => alert('Download Invoice')}>Download Invoice</button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#777', marginTop: '8px' }}>
                  <em>Payment management is not permitted for your current role level. Contact Super Admin to enable payment permissions.</em>
                </p>
              )}
            </div>

            {/* 4.3 Visa Upload */}
            <div className="section-box">
              <div className="section-title">4.3 Visa Upload</div>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>Upload final approved visa document to attach to application:</p>
              <div className="action-cell">
                <button className="btn btn-sm btn-primary" onClick={() => alert('Final Visa File Uploaded')}>Upload Visa</button>
                <button className="btn btn-sm" onClick={() => alert('Viewing Final Visa')}>View Visa</button>
                <button className="btn btn-sm" onClick={() => alert('Downloading Final Visa')}>Download Visa</button>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn" onClick={() => setSelectedVisaApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Application Details Modal & Extend Duration */}
      {selectedHolidayApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div className="modal-title">5.1 Holiday Application Details: {selectedHolidayApp.packageId}</div>
              <button className="close-btn" onClick={() => setSelectedHolidayApp(null)}>X</button>
            </div>

            <div className="section-box">
              <div className="section-title">Customer Details</div>
              <div className="form-grid mt-4">
                <div><strong>Customer Name:</strong> {selectedHolidayApp.customerName}</div>
                <div><strong>Email:</strong> {selectedHolidayApp.email}</div>
                <div><strong>Mobile Number:</strong> {selectedHolidayApp.contactDetails}</div>
                <div><strong>Traveler Count:</strong> 2 Adults</div>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Package Details</div>
              <div className="form-grid mt-4">
                <div><strong>Package Name:</strong> {selectedHolidayApp.packageName}</div>
                <div><strong>Package ID:</strong> {selectedHolidayApp.packageId}</div>
                <div><strong>Destination:</strong> {selectedHolidayApp.destination}</div>
                <div><strong>Duration:</strong> {selectedHolidayApp.duration}</div>
                <div><strong>Departure Date:</strong> {selectedHolidayApp.departureDate}</div>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">5.2 Extend Booking Duration</div>
              {hasExtensionPermission ? (
                <div>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>Staff has permission to extend directly:</p>
                  <div className="form-grid">
                    <div className="form-group"><label>Add Days:</label><input type="number" defaultValue="2" /></div>
                    <div className="form-group"><label>Add Nights:</label><input type="number" defaultValue="1" /></div>
                    <div className="form-group"><label>Add Charges (₹):</label><input type="number" defaultValue="12000" /></div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Booking extended & total recalculated!')}>Update Booking</button>
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
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Extension Request submitted to Super Admin for approval!')}>
                    Submit Extension Request to Super Admin &rarr;
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn" onClick={() => setSelectedHolidayApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
