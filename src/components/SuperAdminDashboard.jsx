import React, { useState, useMemo } from 'react';
import LeadGraphs from './LeadGraphs';
import LeadsKanban from './LeadsKanban';
import VisaKanban from './VisaKanban';
import HolidayKanban from './HolidayKanban';
import {
  mockSummaryCards,
  mockRecentLeads,
  mockRejectedApplications,
  mockLeadsFull,
  mockCompanies,
  mockCompanyApplications,
  mockCompanyEmployees,
  mockTravelers,
  mockVisaServices,
  mockBookingServices,
  mockTransactions,
  mockReportsMetrics,
  mockStaffMembers,
  mockReviews
} from '../mockData';

const STANDARD_VISA_DOCUMENTS = [
  'Passport (Front & Back Copy)',
  'Passport Size Photographs (35x45mm)',
  'Bank Account Statements (Past 6 Months)',
  'Employment NOC & Leave Sanction Letter',
  'Salary Slips (Last 3 Months)',
  'Income Tax Returns (ITR / Form 16 - 3 Years)',
  'Roundtrip Flight Reservation / Itinerary',
  'Confirmed Hotel Booking / Accommodation Proof',
  'Travel Medical Insurance Policy (€30,000+)',
  'Embassy Cover Letter & Travel Purpose',
  'DS-160 Barcoded Confirmation Page',
  'Sponsorship Letter & Financial Proof',
  'National Identity Card / Aadhaar Card / PAN',
  'Business Invitation Letter / Conference Pass',
  'Company Registration & GST Certificate',
  'Marriage Certificate / Family Ties Proof',
  'Daily Travel Schedule / Detailed Itinerary'
];

export default function SuperAdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [leadsList, setLeadsList] = useState(mockLeadsFull);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companySubTab, setCompanySubTab] = useState('applications');
  const [companyAppFilterType, setCompanyAppFilterType] = useState('All');
  const [companyAppViewMode, setCompanyAppViewMode] = useState('kanban'); // 'table' | 'card' | 'kanban'
  const [companyApplicationsList, setCompanyApplicationsList] = useState(mockCompanyApplications);
  const [draggedCompAppId, setDraggedCompAppId] = useState(null);
  const [dragOverCompAppCol, setDragOverCompAppCol] = useState(null);

  // Travelers management states
  const [travelersList, setTravelersList] = useState(mockTravelers);
  const [travelerViewMode, setTravelerViewMode] = useState('card'); // 'table' | 'card'

  // Traveler Profile History view modes
  const [travelerVisaViewMode, setTravelerVisaViewMode] = useState('table'); // 'table' | 'card' | 'kanban'
  const [draggedTrvVisaId, setDraggedTrvVisaId] = useState(null);
  const [dragOverTrvVisaCol, setDragOverTrvVisaCol] = useState(null);
  const [travelerHolidayViewMode, setTravelerHolidayViewMode] = useState('kanban'); // 'table' | 'card' | 'kanban'
  const [draggedTrvBookingId, setDraggedTrvBookingId] = useState(null);
  const [dragOverTrvBookingCol, setDragOverTrvBookingCol] = useState(null);

  // Company management states (table & card formats, search, filters & pagination)
  const [companiesList, setCompaniesList] = useState(mockCompanies);
  const [companyViewMode, setCompanyViewMode] = useState('card'); // 'table' | 'card'
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companySearchOption, setCompanySearchOption] = useState('all');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('All');
  const [companySortBy, setCompanySortBy] = useState('name-asc');
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);
  const [companyItemsPerPage, setCompanyItemsPerPage] = useState(5);
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: '',
    registrationDetails: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'India',
    address: ''
  });

  const handleToggleCompanyStatus = (companyId) => {
    setCompaniesList(prev => prev.map(c => {
      if (c.id === companyId) {
        const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany(prevSel => ({ ...prevSel, status: nextStatus }));
        }
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDeleteCompany = (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to delete company "${companyName}"? This action cannot be undone.`)) {
      setCompaniesList(prev => prev.filter(c => c.id !== companyId));
      if (selectedCompany && selectedCompany.id === companyId) {
        setSelectedCompany(null);
      }
    }
  };

  const handleSaveAddCompany = (e) => {
    if (e) e.preventDefault();
    if (!newCompanyForm.companyName.trim()) {
      alert('Please enter a company name.');
      return;
    }
    const newId = `CMP-${String(companiesList.length + 1).padStart(2, '0')}`;
    const created = {
      id: newId,
      companyName: newCompanyForm.companyName.trim(),
      registrationDetails: newCompanyForm.registrationDetails.trim() || `REG-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      contactPerson: newCompanyForm.contactPerson.trim() || 'General Admin',
      email: newCompanyForm.email.trim() || `info@${newCompanyForm.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: newCompanyForm.phone.trim() || '+91 11 0000 0000',
      address: newCompanyForm.address.trim() || 'Corporate Towers, Business Bay',
      country: newCompanyForm.country.trim() || 'India',
      status: 'Active',
      totalCustomers: 0,
      totalApplications: 0
    };
    setCompaniesList(prev => [created, ...prev]);
    setShowAddCompanyModal(false);
    setNewCompanyForm({
      companyName: '',
      registrationDetails: '',
      contactPerson: '',
      email: '',
      phone: '',
      country: 'India',
      address: ''
    });
    alert(`Company "${created.companyName}" (${newId}) added successfully!`);
  };

  const handleSaveEditCompany = () => {
    if (!editingCompany) return;
    setCompaniesList(prev => prev.map(c => c.id === editingCompany.id ? { ...editingCompany } : c));
    if (selectedCompany && selectedCompany.id === editingCompany.id) {
      setSelectedCompany({ ...editingCompany });
    }
    alert(`Company "${editingCompany.companyName}" updated successfully!`);
    setEditingCompany(null);
  };

  // Filtered & Sorted Companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(comp => {
      if (companyStatusFilter !== 'All' && comp.status !== companyStatusFilter) return false;
      if (!companySearchQuery.trim()) return true;

      const q = companySearchQuery.toLowerCase().trim();
      const name = (comp.companyName || '').toLowerCase();
      const person = (comp.contactPerson || '').toLowerCase();
      const email = (comp.email || '').toLowerCase();
      const phone = (comp.phone || '').toLowerCase();
      const reg = (comp.registrationDetails || '').toLowerCase();
      const country = (comp.country || '').toLowerCase();
      const address = (comp.address || '').toLowerCase();

      if (companySearchOption === 'companyName') return name.includes(q);
      if (companySearchOption === 'contactPerson') return person.includes(q);
      if (companySearchOption === 'email') return email.includes(q);
      if (companySearchOption === 'phone') return phone.includes(q);
      if (companySearchOption === 'registrationDetails') return reg.includes(q);
      if (companySearchOption === 'country') return country.includes(q);

      return name.includes(q) ||
        person.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        reg.includes(q) ||
        country.includes(q) ||
        address.includes(q);
    }).sort((a, b) => {
      if (companySortBy === 'name-asc') return (a.companyName || '').localeCompare(b.companyName || '');
      if (companySortBy === 'name-desc') return (b.companyName || '').localeCompare(a.companyName || '');
      if (companySortBy === 'apps-desc') return (Number(b.totalApplications) || 0) - (Number(a.totalApplications) || 0);
      if (companySortBy === 'travelers-desc') return (Number(b.totalCustomers) || 0) - (Number(a.totalCustomers) || 0);
      if (companySortBy === 'id-asc') return (a.id || '').localeCompare(b.id || '');
      return 0;
    });
  }, [companiesList, companyStatusFilter, companySearchQuery, companySearchOption, companySortBy]);

  const totalCompanyPages = Math.max(1, Math.ceil(filteredCompanies.length / companyItemsPerPage));
  const safeCompanyPage = Math.min(companyCurrentPage, totalCompanyPages);
  const paginatedCompanies = filteredCompanies.slice(
    (safeCompanyPage - 1) * companyItemsPerPage,
    safeCompanyPage * companyItemsPerPage
  );

  // Leads pipeline state handlers
  const handleUpdateLead = (updatedLead) => {
    setLeadsList(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const handleAddLead = (newLead) => {
    setLeadsList(prev => [newLead, ...prev]);
  };

  const handleDeleteLead = (leadId) => {
    setLeadsList(prev => prev.filter(l => l.id !== leadId));
  };

  const handleUpdateVisa = (updatedVisa) => {
    setVisaList(prev => prev.map(v => v.id === updatedVisa.id ? updatedVisa : v));
  };
  const [companyAppFilterStatus, setCompanyAppFilterStatus] = useState('All');
  const [companyAppSearch, setCompanyAppSearch] = useState('');
  const [companyEmpFilterStatus, setCompanyEmpFilterStatus] = useState('All');
  const [companyEmpSearch, setCompanyEmpSearch] = useState('');
  const [viewingTraveler, setViewingTraveler] = useState(null);
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [selectedVisaApp, setSelectedVisaApp] = useState(null);
  const [viewingVisaDetails, setViewingVisaDetails] = useState(null);
  const [viewingBookingDetails, setViewingBookingDetails] = useState(null);
  const [packagesSubTab, setPackagesSubTab] = useState('visa');
  const [viewingCountryVisaDetails, setViewingCountryVisaDetails] = useState(null);
  const [viewingHolidayPackageDetails, setViewingHolidayPackageDetails] = useState(null);
  const [editingCountryVisa, setEditingCountryVisa] = useState(null);
  const [showAddCountryVisaModal, setShowAddCountryVisaModal] = useState(false);
  const [editingHolidayPackage, setEditingHolidayPackage] = useState(null);
  const [showAddHolidayPackageModal, setShowAddHolidayPackageModal] = useState(false);

  // Sub-section edit states for Country Visa Details
  const [editingVisaType, setEditingVisaType] = useState(null);
  const [showAddVisaTypeModal, setShowAddVisaTypeModal] = useState(false);
  const [newVisaTypeForm, setNewVisaTypeForm] = useState({ name: '', validity: '', stayDuration: '', processingFee: 15000 });

  const [editingCountryDoc, setEditingCountryDoc] = useState(null);
  const [showAddCountryDocModal, setShowAddCountryDocModal] = useState(false);
  const [newCountryDocForm, setNewCountryDocForm] = useState({ name: '', type: 'Mandatory', guidance: '' });

  const [editingGuidanceText, setEditingGuidanceText] = useState(null);

  // Sub-section edit states for Holiday Package Details
  const [editingItineraryDay, setEditingItineraryDay] = useState(null);
  const [showAddItineraryDayModal, setShowAddItineraryDayModal] = useState(false);
  const [newItineraryDayForm, setNewItineraryDayForm] = useState({ day: '', title: '', detail: '' });

  const [countriesList, setCountriesList] = useState([
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

  const [holidayPackagesList, setHolidayPackagesList] = useState([
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
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [financeSubTab, setFinanceSubTab] = useState('payments'); // 'payments' | 'prepaid' | 'postpaid' | 'transactions'
  const [financeServiceFilter, setFinanceServiceFilter] = useState('All');
  const [financeModeFilter, setFinanceModeFilter] = useState('All');
  const [financeSearchQuery, setFinanceSearchQuery] = useState('');
  const [newPaymentForm, setNewPaymentForm] = useState({
    serviceCategory: 'visa',
    selectedCaseId: 'VISA-301',
    amount: 5000,
    type: 'Prepaid',
    mode: 'Bank Transfer',
    date: '2026-10-09',
    ref: 'TXN-998900',
    status: 'Completed'
  });
  const [visaPaymentsList, setVisaPaymentsList] = useState([
    { id: 'PAY-101', caseId: 'VISA-301', clientName: 'Vikramaditya Roy', serviceType: 'Visa', type: 'Prepaid', mode: 'UPI / NetBanking', amount: 10000, date: '2026-10-02', ref: 'TXN-998120', status: 'Completed' },
    { id: 'PAY-102', caseId: 'VISA-302', clientName: 'Sanya Malhotra', serviceType: 'Visa', type: 'Postpaid', mode: 'Bank Transfer', amount: 8500, date: '2026-10-06', ref: 'TXN-998144', status: 'Completed' },
    { id: 'PAY-103', caseId: 'VISA-303', clientName: 'Ananya Iyer', serviceType: 'Visa', type: 'Prepaid', mode: 'Credit / Debit Card', amount: 16000, date: '2026-10-08', ref: 'TXN-998170', status: 'Completed' },
    { id: 'PAY-104', caseId: 'VISA-304', clientName: 'Rahul Mehta', serviceType: 'Visa', type: 'Postpaid', mode: 'Bank Transfer', amount: 12000, date: '2026-10-09', ref: 'TXN-998188', status: 'Completed' }
  ]);
  const [bookingPaymentsList, setBookingPaymentsList] = useState([
    { id: 'PAY-701', caseId: 'PKG-701', clientName: 'Sanya Malhotra', serviceType: 'Holiday', type: 'Prepaid', mode: 'Bank Transfer', amount: 35000, date: '2026-10-01', ref: 'TXN-998200', status: 'Completed' },
    { id: 'PAY-702', caseId: 'PKG-701', clientName: 'Sanya Malhotra', serviceType: 'Holiday', type: 'Prepaid', mode: 'UPI / NetBanking', amount: 50000, date: '2026-10-05', ref: 'TXN-998205', status: 'Completed' },
    { id: 'PAY-703', caseId: 'PKG-702', clientName: 'Deepak Chopra', serviceType: 'Holiday', type: 'Postpaid', mode: 'Bank Transfer', amount: 50000, date: '2026-09-29', ref: 'TXN-998220', status: 'Completed' },
    { id: 'PAY-704', caseId: 'PKG-703', clientName: 'Ananya Iyer', serviceType: 'Holiday', type: 'Prepaid', mode: 'Credit / Debit Card', amount: 95000, date: '2026-10-04', ref: 'TXN-998235', status: 'Completed' },
    { id: 'PAY-705', caseId: 'PKG-704', clientName: 'Rohit Sharma', serviceType: 'Holiday', type: 'Prepaid', mode: 'Bank Transfer', amount: 175000, date: '2026-09-22', ref: 'TXN-998250', status: 'Completed' }
  ]);
  const [visaDocsList, setVisaDocsList] = useState([
    { id: 1, name: 'Passport Front Page', mandatory: 'Mandatory', status: 'Verified' },
    { id: 2, name: 'Bank Statement (6 Months)', mandatory: 'Mandatory', status: 'Pending Verification' },
    { id: 3, name: 'Employment NOC Letter', mandatory: 'Optional', status: 'Verified' }
  ]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocRequirement, setNewDocRequirement] = useState('Mandatory');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [staffList, setStaffList] = useState(mockStaffMembers);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    role: 'Visa Specialist',
    department: 'Visa Operations',
    status: 'ACTIVE'
  });
  const [visaList, setVisaList] = useState(mockVisaServices);
  const [showAddVisaModal, setShowAddVisaModal] = useState(false);
  const [newVisaForm, setNewVisaForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    passport: '',
    country: 'Schengen (France)',
    visaType: 'Tourist C',
    caseOfficerName: 'Amit Verma',
    caseOfficerId: 'CO-101',
    applicationDate: '2026-10-10',
    status: 'Under Review',
    paymentType: 'Prepaid',
    totalAmount: 18500,
    documents: [
      { name: 'Passport (Front & Back Copy)', mandatory: 'Mandatory' },
      { name: 'Flight & Hotel Cover Booking', mandatory: 'Mandatory' },
      { name: 'Travel Medical Insurance (€30,000 Cover)', mandatory: 'Mandatory' }
    ]
  });
  const [docNameToAdd, setDocNameToAdd] = useState('Passport (Front & Back Copy)');
  const [customDocNameInput, setCustomDocNameInput] = useState('');
  const [docRequirementToAdd, setDocRequirementToAdd] = useState('Mandatory');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddTravelerModal, setShowAddTravelerModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showExtendBookingModal, setShowExtendBookingModal] = useState(false);
  const [bookingList, setBookingList] = useState(mockBookingServices);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    packageSelectionType: 'existing',
    selectedPackageId: 'PKG-701',
    packageName: 'Bali Island Beach Getaway',
    destination: 'Bali, Indonesia',
    duration: '6 Days / 5 Nights',
    days: 6,
    nights: 5,
    customerName: '',
    contactDetails: '',
    email: '',
    bookingDate: '2026-10-10',
    departureDate: '2026-11-20',
    totalPrice: 85000,
    paidAmount: 85000,
    status: 'Active',
    paymentType: 'Prepaid',
    paymentStatus: 'Paid',
    caseOfficerName: 'Priya Singh',
    caseOfficerId: 'CO-102',
    notes: ''
  });
  const [graphFilter, setGraphFilter] = useState('This Month');
  const [leadFilterType, setLeadFilterType] = useState('All');
  const [leadFilterStatus, setLeadFilterStatus] = useState('All');

  // Form states
  const [extendForm, setExtendForm] = useState({ days: 2, nights: 1, charges: 15000, remarks: 'Client requested extra stay in Zurich' });
  const [assignForm, setAssignForm] = useState({
    appId: 'VISA-302',
    staffId: 'CO-101',
    // task: 'Document Verification & Case Review',
    taskNotes: ''
  });

  // Delete helpers for Country Visa Details
  const handleDeleteVisaType = (index) => {
    if (!viewingCountryVisaDetails) return;
    const currentTypes = viewingCountryVisaDetails.visaTypes || [];
    const updatedTypes = currentTypes.filter((_, i) => i !== index);
    const updatedCountry = {
      ...viewingCountryVisaDetails,
      visaTypes: updatedTypes,
      visaTypesCount: updatedTypes.length
    };
    setViewingCountryVisaDetails(updatedCountry);
    setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
  };

  const handleDeleteCountryDoc = (index) => {
    if (!viewingCountryVisaDetails) return;
    const currentDocs = viewingCountryVisaDetails.requiredDocs || [];
    const updatedDocs = currentDocs.filter((_, i) => i !== index);
    const updatedCountry = {
      ...viewingCountryVisaDetails,
      requiredDocs: updatedDocs
    };
    setViewingCountryVisaDetails(updatedCountry);
    setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
  };

  const handleDeleteItineraryDay = (index) => {
    if (!viewingHolidayPackageDetails) return;
    const currentItin = viewingHolidayPackageDetails.itinerary || [];
    const updatedItin = currentItin.filter((_, i) => i !== index);
    const updatedPkg = {
      ...viewingHolidayPackageDetails,
      itinerary: updatedItin,
      days: updatedItin.length
    };
    setViewingHolidayPackageDetails(updatedPkg);
    setHolidayPackagesList(holidayPackagesList.map(p => p.packageId === updatedPkg.packageId ? updatedPkg : p));
  };

  // Visa Search & Filter States
  const [visaSearchQuery, setVisaSearchQuery] = useState('');
  const [visaSearchOption, setVisaSearchOption] = useState('all');
  const [visaStatusFilter, setVisaStatusFilter] = useState('All');
  const [visaCountryFilter, setVisaCountryFilter] = useState('All');
  const [visaOfficerFilter, setVisaOfficerFilter] = useState('All');

  // Filtered Visa Applications
  const filteredVisaList = visaList.filter(visa => {
    if (visaStatusFilter !== 'All' && visa.status !== visaStatusFilter) return false;
    if (visaCountryFilter !== 'All' && visa.country !== visaCountryFilter) return false;
    if (visaOfficerFilter !== 'All' && visa.caseOfficerName !== visaOfficerFilter) return false;

    if (visaSearchQuery.trim()) {
      const q = visaSearchQuery.toLowerCase().trim();
      const applicantName = (visa.applicantName || '').toLowerCase();
      const id = (visa.id || '').toLowerCase();
      const country = (visa.country || '').toLowerCase();
      const visaType = (visa.visaType || '').toLowerCase();
      const officer = (visa.caseOfficerName || '').toLowerCase();
      const officerId = (visa.caseOfficerId || '').toLowerCase();
      const email = (visa.email || '').toLowerCase();
      const phone = (visa.phone || '').toLowerCase();
      const passport = (visa.passport || '').toLowerCase();
      const paymentRef = (visa.paymentRef || '').toLowerCase();
      const paymentType = (visa.paymentType || '').toLowerCase();
      const paymentStatus = (visa.paymentStatus || '').toLowerCase();
      const status = (visa.status || '').toLowerCase();
      const docStatus = (visa.documentStatus || '').toLowerCase();

      if (visaSearchOption === 'all') {
        const matches = applicantName.includes(q) ||
          id.includes(q) ||
          country.includes(q) ||
          visaType.includes(q) ||
          officer.includes(q) ||
          officerId.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          passport.includes(q) ||
          paymentRef.includes(q) ||
          paymentType.includes(q) ||
          paymentStatus.includes(q) ||
          status.includes(q) ||
          docStatus.includes(q);
        if (!matches) return false;
      } else if (visaSearchOption === 'applicantName') {
        if (!applicantName.includes(q)) return false;
      } else if (visaSearchOption === 'id') {
        if (!id.includes(q)) return false;
      } else if (visaSearchOption === 'country') {
        if (!country.includes(q)) return false;
      } else if (visaSearchOption === 'visaType') {
        if (!visaType.includes(q)) return false;
      } else if (visaSearchOption === 'caseOfficer') {
        if (!officer.includes(q) && !officerId.includes(q)) return false;
      } else if (visaSearchOption === 'phone') {
        if (!phone.includes(q)) return false;
      } else if (visaSearchOption === 'email') {
        if (!email.includes(q)) return false;
      } else if (visaSearchOption === 'passport') {
        if (!passport.includes(q)) return false;
      } else if (visaSearchOption === 'paymentRef') {
        if (!paymentRef.includes(q)) return false;
      }
    }
    return true;
  });

  // Filtered Leads
  const filteredLeads = mockLeadsFull.filter(lead => {
    if (leadFilterType !== 'All' && lead.leadType !== leadFilterType) return false;
    if (leadFilterStatus !== 'All' && lead.status !== leadFilterStatus) return false;
    return true;
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">RH Global CRM</div>
          <div className="sidebar-subtitle">Role: Super Admin</div>
        </div>
        <ul className="sidebar-nav">
          <li>
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <span>Home</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'leads' ? 'active' : ''} onClick={() => setActiveTab('leads')}>
              <span>Leads</span>

            </button>
          </li>
          <li>
            <button className={activeTab === 'visa' ? 'active' : ''} onClick={() => setActiveTab('visa')}>
              <span>Visa</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'booking' ? 'active' : ''} onClick={() => setActiveTab('booking')}>
              <span>Holidays</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'companies' ? 'active' : ''} onClick={() => setActiveTab('companies')}>
              <span>Companies</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'travelers' ? 'active' : ''} onClick={() => setActiveTab('travelers')}>
              <span>Travelers</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'visa-master' ? 'active' : ''} onClick={() => setActiveTab('visa-master')}>
              <span>Visa Master</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'holiday-master' ? 'active' : ''} onClick={() => setActiveTab('holiday-master')}>
              <span>Holiday Master</span>
            </button>
          </li>

          <li>
            <button className={activeTab === 'revenue' ? 'active' : ''} onClick={() => setActiveTab('revenue')}>
              <span>Finance</span>
            </button>
          </li>


          <li>
            <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
              <span>Reports</span>
            </button>
          </li>
          <li>
            <button className={activeTab === 'roles' ? 'active' : ''} onClick={() => setActiveTab('roles')}>
              <span>Staff & Roles</span>

            </button>
          </li>
          <li>
            <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
              <span>Reviews & Ratings</span>

            </button>
          </li>

        </ul>

      </aside>

      {/* Main Content */}
      <div className="main-layout">
        <header className="top-header">
          <div className="top-header-left">
            <h1>Super Admin Dashboard</h1>
            <p>RH Global CRM System &bull; Full Administrative Privileges</p>
          </div>
          <div className="user-profile-badge">
            <span>Role: <strong>Super Admin</strong></span>
            <button className="btn btn-sm" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="content-body">
          {viewingVisaDetails ? (
            /* DEDICATED FULL-PAGE VISA APPLICATION DETAILS VIEW */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setViewingVisaDetails(null)}>
                  &larr; Back to Applications / Profile
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>
              </div>

              {/* Header Box: Applicant Information */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
                  <div className="section-title">Visa Application Details: {viewingVisaDetails.id}</div>
                  <span className="status-badge">{viewingVisaDetails.status}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px' }}>
                  <div><strong>Applicant Name:</strong> {viewingVisaDetails.applicantName}</div>
                  <div><strong>Email ID:</strong> vikram.roy@gmail.com</div>
                  <div><strong>Mobile Number:</strong> +91 99112 23344</div>
                  <div><strong>Target Country:</strong> {viewingVisaDetails.country}</div>
                  <div><strong>Visa Type:</strong> {viewingVisaDetails.visaType}</div>
                  <div><strong>Passport Details:</strong> Z9847291 (Exp: 2031-05-12)</div>
                  <div><strong>Case Officer:</strong> {viewingVisaDetails.caseOfficerName} ({viewingVisaDetails.caseOfficerId})</div>
                  <div><strong>Application Date:</strong> {viewingVisaDetails.applicationDate}</div>
                </div>
              </div>

              {/* Application Status Lifecycle & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Application Status Progression & Update</div>
                </div>


                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc' }}>
                  <div className="filter-group">
                    <label>Change Application Status to:</label>
                    <select
                      value={viewingVisaDetails.status}
                      onChange={e => setViewingVisaDetails({ ...viewingVisaDetails, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Proceed">Proceed</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => {
                    setVisaList(visaList.map(v => v.id === viewingVisaDetails.id ? { ...v, status: viewingVisaDetails.status } : v));
                    alert(`Status updated to "${viewingVisaDetails.status}"!`);
                  }}>
                    Save Status Update
                  </button>
                </div>
              </div>

              {/* Document Management & Verification Status */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Document Management & Verification Status</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddDocModal(true)}>
                    + Add Document Name
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Document Requirement</th>
                        <th>Verification Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visaDocsList.map(doc => (
                        <tr key={doc.id}>
                          <td><strong>{doc.name}</strong></td>
                          <td><span className="status-badge">{doc.mandatory}</span></td>
                          <td>
                            <span className="status-badge" style={{
                              backgroundColor: doc.status === 'Verified' ? '#e6ffe6' : doc.status === 'Rejected' ? '#ffe6e6' : '#fff'
                            }}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="action-cell">
                            <button className="btn btn-sm" onClick={() => {
                              setVisaDocsList(visaDocsList.map(d => d.id === doc.id ? { ...d, status: 'Verified' } : d));
                            }}>Verify</button>
                            <button className="btn btn-sm" onClick={() => {
                              setVisaDocsList(visaDocsList.map(d => d.id === doc.id ? { ...d, status: 'Rejected' } : d));
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

              {/* Payment Summary (Full Payment Management in Finance Section) */}
              <div className="section-box">
                <div className="section-header">
                  <div>
                    <div className="section-title">Payment Overview</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      Detailed multiple payment entries and receipts are managed in the Finance section.
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setViewingVisaDetails(null);
                      setActiveTab('revenue');
                    }}
                  >
                    Manage in Finance Section &rarr;
                  </button>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid-cards">
                  <div className="card">
                    <div className="card-title">Total Visa Fee</div>
                    <div className="card-value">₹{(viewingVisaDetails.totalAmount || 24000).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Total Paid Amount</div>
                    <div className="card-value">₹{visaPaymentsList.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Pending Balance</div>
                    <div className="card-value">₹{Math.max(0, (viewingVisaDetails.totalAmount || 24000) - visaPaymentsList.reduce((acc, p) => acc + p.amount, 0)).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Payment Status</div>
                    <div className="card-value" style={{ fontSize: '18px' }}>
                      {visaPaymentsList.reduce((acc, p) => acc + p.amount, 0) >= (viewingVisaDetails.totalAmount || 24000) ? 'PAID IN FULL' : 'PARTIALLY PAID'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visa Document Upload & Download */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Visa File Upload & Download</div>
                </div>
                <div className="action-cell">
                  <button className="btn btn-sm btn-primary" onClick={() => alert('Uploaded Final Approved Visa PDF')}>Upload Visa</button>
                  <button className="btn btn-sm" onClick={() => alert('Viewing Final Visa Document')}>View Visa</button>
                  <button className="btn btn-sm" onClick={() => alert('Downloading Final Visa Document')}>Download Visa</button>
                </div>
              </div>
            </div>
          ) : viewingBookingDetails ? (
            /* DEDICATED FULL-PAGE HOLIDAY / TOUR BOOKING DETAILS VIEW */
            <div>
              <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="btn" onClick={() => setViewingBookingDetails(null)}>
                  &larr; Back to Bookings / Traveler Profile
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddPaymentModal(true)}>
                    + Add Payment Entry
                  </button>
                </div>
              </div>

              {/* Header Box: Booking Information */}
              <div className="section-box" style={{ background: '#fafafa' }}>
                <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
                  <div className="section-title">Holiday / Tour Booking Details: {viewingBookingDetails.packageId || 'PKG-701'}</div>
                  <span className="status-badge">{viewingBookingDetails.status || 'ACTIVE'}</span>
                </div>
                <div className="form-grid" style={{ fontSize: '13px' }}>
                  <div><strong>Package Name:</strong> {viewingBookingDetails.packageName || 'Bali Island Beach Getaway'}</div>
                  <div><strong>Destination:</strong> {viewingBookingDetails.destination || 'Bali, Indonesia'}</div>
                  <div><strong>Duration:</strong> {viewingBookingDetails.duration || '6 Days / 5 Nights'}</div>
                  <div><strong>Booking Date:</strong> {viewingBookingDetails.bookingDate || '2026-10-01'}</div>
                  <div><strong>Departure Date:</strong> {viewingBookingDetails.departureDate || '2026-11-15'}</div>
                  <div><strong>Total Package Price:</strong> ₹{(viewingBookingDetails.totalPrice || viewingBookingDetails.price || 85000).toLocaleString()}</div>
                  <div><strong>Customer Name:</strong> {viewingBookingDetails.customerName || 'Vikram Roy'}</div>
                  <div><strong>Contact Phone:</strong> {viewingBookingDetails.contactDetails || '+91 99112 23344'}</div>
                  {viewingBookingDetails.email && <div><strong>Email:</strong> {viewingBookingDetails.email}</div>}
                  {viewingBookingDetails.caseOfficerName && <div><strong>Tour Specialist:</strong> {viewingBookingDetails.caseOfficerName}</div>}
                  {viewingBookingDetails.paymentType && <div><strong>Payment Type:</strong> {viewingBookingDetails.paymentType}</div>}
                  {viewingBookingDetails.invoiceNo && <div><strong>Invoice Ref:</strong> {viewingBookingDetails.invoiceNo}</div>}
                </div>
              </div>

              {/* Booking Status Progression & Update */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Booking Application Status Progression & Update</div>
                </div>
                <div className="toolbar mt-4" style={{ backgroundColor: '#f9f9f9', padding: '12px', border: '1px solid #ccc' }}>
                  <div className="filter-group">
                    <label>Change Application / Booking Status to:</label>
                    <select
                      value={viewingBookingDetails.status || 'ACTIVE'}
                      onChange={e => setViewingBookingDetails({ ...viewingBookingDetails, status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => {
                    alert(`Booking status updated to "${viewingBookingDetails.status}"!`);
                    setBookingList(bookingList.map(b => b.packageId === viewingBookingDetails.packageId ? { ...b, status: viewingBookingDetails.status } : b));
                  }}>
                    Save Status Update
                  </button>
                </div>
              </div>

              {/* Payment Summary (Full Payment Management in Finance Section) */}
              <div className="section-box">
                <div className="section-header">
                  <div>
                    <div className="section-title">Payment Overview</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                      Detailed multiple payment entries, installments, and receipts are managed in the Finance section.
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setViewingBookingDetails(null);
                      setActiveTab('revenue');
                    }}
                  >
                    Manage in Finance Section &rarr;
                  </button>
                </div>

                {/* Summary Box */}
                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
                  <div className="card">
                    <div className="card-title">Total Package Price</div>
                    <div className="card-value">₹{(viewingBookingDetails.totalPrice || viewingBookingDetails.price || 85000).toLocaleString()}</div>
                  </div>
                  <div className="card">
                    <div className="card-title">Total Paid Amount</div>
                    <div className="card-value">
                      ₹{bookingPaymentsList.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">Remaining Balance</div>
                    <div className="card-value">
                      ₹{Math.max(0, (viewingBookingDetails.totalPrice || viewingBookingDetails.price || 85000) - bookingPaymentsList.reduce((acc, p) => acc + p.amount, 0)).toLocaleString()}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">Payment Status</div>
                    <div className="card-value" style={{ fontSize: '18px' }}>
                      {bookingPaymentsList.reduce((acc, p) => acc + p.amount, 0) >= (viewingBookingDetails.totalPrice || viewingBookingDetails.price || 85000) ? 'PAID IN FULL' : 'PARTIALLY PAID'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extend Duration / Amendments */}
              <div className="section-box">
                <div className="section-header">
                  <div className="section-title">Extend Duration / Booking Amendments</div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Additional Days:</label>
                    <input
                      type="number"
                      value={extendForm.days}
                      onChange={e => setExtendForm({ ...extendForm, days: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Additional Nights:</label>
                    <input
                      type="number"
                      value={extendForm.nights}
                      onChange={e => setExtendForm({ ...extendForm, nights: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Additional Charges (₹):</label>
                    <input
                      type="number"
                      value={extendForm.charges}
                      onChange={e => setExtendForm({ ...extendForm, charges: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amendment Remarks:</label>
                    <input
                      type="text"
                      value={extendForm.remarks}
                      onChange={e => setExtendForm({ ...extendForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <button className="btn btn-primary mt-4" onClick={() => alert(`Extended booking by ${extendForm.days}D / ${extendForm.nights}N with charges ₹${extendForm.charges.toLocaleString()}!`)}>
                  Save Booking Extension
                </button>
              </div>
            </div>
          ) : viewingCountryVisaDetails ? (
            /* DEDICATED FULL-PAGE COUNTRY VISA DETAILS VIEW */
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-badge">{viewingCountryVisaDetails.status || 'Active'}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingCountryVisa({ ...viewingCountryVisaDetails })}>
                      Edit Details
                    </button>
                  </div>
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
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">1. Visa Types Provided for {viewingCountryVisaDetails.countryName}</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddVisaTypeModal(true)}>
                    + Add Visa Type
                  </button>
                </div>
                <div className="table-container mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>Visa Type Name</th>
                        <th>Validity Period</th>
                        <th>Permitted Stay Duration</th>
                        <th>Processing Fee (₹)</th>
                        <th>Actions</th>
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
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => setEditingVisaType({ index: i, ...vt })}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteVisaType(i)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                            No visa types added yet. Click "+ Add Visa Type" to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Requirements Matrix */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">2. Document Requirements & Matrix</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setShowAddCountryDocModal(true)}>
                    + Add Document Requirement
                  </button>
                </div>
                <div className="table-container mt-4">
                  <table>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Requirement Type</th>
                        <th>Guidelines & Format Instructions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingCountryVisaDetails.requiredDocs && viewingCountryVisaDetails.requiredDocs.length > 0) ? (
                        viewingCountryVisaDetails.requiredDocs.map((doc, i) => (
                          <tr key={i}>
                            <td><strong>{doc.name}</strong></td>
                            <td><span className="status-badge">{doc.type}</span></td>
                            <td>{doc.guidance}</td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => setEditingCountryDoc({ index: i, ...doc })}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCountryDoc(i)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#666' }}>
                            No document requirements added yet. Click "+ Add Document Requirement" to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Embassy Step-by-Step Guidance */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">3. Official Embassy Guidance & Application Instructions</div>
                  <button className="btn btn-sm btn-primary" onClick={() => setEditingGuidanceText(viewingCountryVisaDetails.guidance || '')}>
                    {viewingCountryVisaDetails.guidance && viewingCountryVisaDetails.guidance.trim() !== '' ? 'Edit Guidance' : '+ Add Guidance'}
                  </button>
                </div>
                {viewingCountryVisaDetails.guidance && viewingCountryVisaDetails.guidance.trim() !== '' ? (
                  <div style={{ fontSize: '13px', lineHeight: '1.6', background: '#f9f9f9', padding: '16px', border: '1px solid #ccc', marginTop: '12px' }}>
                    <p><strong>Step-by-Step Guidance:</strong></p>
                    <p>{viewingCountryVisaDetails.guidance}</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fafafa', border: '1px dashed #ccc', marginTop: '12px' }}>
                    <p style={{ color: '#666', marginBottom: '8px' }}>No official embassy guidance added yet for {viewingCountryVisaDetails.countryName}.</p>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingGuidanceText('')}>
                      + Add Guidance Information
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : viewingHolidayPackageDetails ? (
            /* DEDICATED FULL-PAGE HOLIDAY PACKAGE DETAILS VIEW */
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-badge">{viewingHolidayPackageDetails.status || 'Active'}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => setEditingHolidayPackage({ ...viewingHolidayPackageDetails })}>
                      Edit Details
                    </button>
                  </div>
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
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Tour Overview & Description</div>
                  {/* <button className="btn btn-sm" onClick={() => setEditingHolidayPackage({ ...viewingHolidayPackageDetails })}>Edit Overview</button> */}
                </div>
                <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.description}</p>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="form-grid">
                <div className="section-box">
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="section-title">Package Inclusions</div>
                    {/* <button className="btn btn-sm" onClick={() => setEditingHolidayPackage({ ...viewingHolidayPackageDetails })}>Edit Inclusions</button> */}
                  </div>
                  <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.inclusions}</p>
                </div>
                <div className="section-box">
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="section-title">Package Exclusions</div>
                    {/* <button className="btn btn-sm" onClick={() => setEditingHolidayPackage({ ...viewingHolidayPackageDetails })}>Edit Exclusions</button> */}
                  </div>
                  <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.6' }}>{viewingHolidayPackageDetails.exclusions}</p>
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="section-box">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="section-title">Day-by-Day Tour Itinerary</div>
                  <button className="btn btn-sm btn-primary" onClick={() => {
                    const currentCount = viewingHolidayPackageDetails.itinerary ? viewingHolidayPackageDetails.itinerary.length : 0;
                    setNewItineraryDayForm({ day: `Day ${currentCount + 1}`, title: '', detail: '' });
                    setShowAddItineraryDayModal(true);
                  }}>
                    + Add Itinerary Day
                  </button>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(viewingHolidayPackageDetails.itinerary && viewingHolidayPackageDetails.itinerary.length > 0) ? (
                    viewingHolidayPackageDetails.itinerary.map((itin, idx) => (
                      <div key={idx} style={{ border: '1px solid #ccc', padding: '12px', background: '#fcfcfc' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{itin.day}: {itin.title}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-sm" onClick={() => setEditingItineraryDay({ index: idx, ...itin })}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteItineraryDay(idx)}>Delete</button>
                          </div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.5' }}>{itin.detail}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '13px', textAlign: 'center', padding: '24px', background: '#fafafa', border: '1px dashed #ccc' }}>
                      <p style={{ color: '#666', marginBottom: '8px' }}>No itinerary days added yet for this package.</p>
                      <button className="btn btn-sm btn-primary" onClick={() => {
                        setNewItineraryDayForm({ day: 'Day 1', title: '', detail: '' });
                        setShowAddItineraryDayModal(true);
                      }}>
                        + Add Itinerary Day
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* 1. DASHBOARD OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div className="grid-cards">
                    <div className="card">
                      <div className="card-title">Total Companies</div>
                      <div className="card-value">{companiesList.length}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Total registered companies</p>
                      <button className="card-action" onClick={() => setActiveTab('companies')}>View All &rarr;</button>
                    </div>
                    <div className="card">
                      <div className="card-title">Total Travelers</div>
                      <div className="card-value">{mockSummaryCards.totalTravelers}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Total travelers/customers registered</p>
                      <button className="card-action" onClick={() => setActiveTab('travelers')}>View All &rarr;</button>
                    </div>
                    <div className="card">
                      <div className="card-title">Total Staffs</div>
                      <div className="card-value">{mockSummaryCards.totalStaffs}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Total staff/admin members</p>
                      <button className="card-action" onClick={() => setActiveTab('roles')}>View All &rarr;</button>
                    </div>
                    <div className="card">
                      <div className="card-title">Total Leads</div>
                      <div className="card-value">{leadsList.length}</div>
                      <p style={{ fontSize: '11px', color: '#555' }}>Total pipeline leads</p>
                      <button className="card-action" onClick={() => setActiveTab('leads')}>View All &rarr;</button>
                    </div>
                  </div>

                  {/* Lead Graphs Analytics Component */}
                  <LeadGraphs initialFilter={graphFilter} />

                  {/* Recent Leads Table */}
                  <div className="section-box">
                    <div className="section-header">
                      <div className="section-title">Recent Leads (Top 5 Most Recent)</div>
                      <button className="btn btn-sm" onClick={() => setActiveTab('leads')}>View All Leads</button>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Lead Name</th>
                            <th>Company Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Lead Type</th>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leadsList.slice(0, 5).map(lead => (
                            <tr key={lead.id}>
                              <td><strong>{lead.leadName}</strong></td>
                              <td>{lead.companyName}</td>
                              <td>{lead.email}</td>
                              <td>{lead.phone}</td>
                              <td><span className="status-badge">{lead.leadType}</span></td>
                              <td>{lead.source}</td>
                              <td><span className="status-badge">{lead.status}</span></td>
                              <td className="action-cell">
                                <button className="btn btn-sm" onClick={() => setSelectedLead(lead)}>View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Rejected Applications */}
                  <div className="section-box">
                    <div className="section-header">
                      <div className="section-title">Recent Rejected Applications</div>
                    </div>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Application ID</th>
                            <th>Applicant Name</th>
                            <th>Application Type</th>
                            <th>Country</th>
                            <th>Rejection Date</th>
                            <th>Rejection Reason</th>
                            <th>Status</th>
                            <th>View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockRejectedApplications.map(app => (
                            <tr key={app.id}>
                              <td className="font-mono"><strong>{app.id}</strong></td>
                              <td>{app.applicantName}</td>
                              <td>{app.applicationType}</td>
                              <td>{app.country}</td>
                              <td>{app.rejectionDate}</td>
                              <td><em>{app.rejectionReason}</em></td>
                              <td><span className="status-badge">{app.status}</span></td>
                              <td><button className="btn btn-sm" onClick={() => alert(`Viewing rejected app ${app.id}`)}>View</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LEADS MANAGEMENT - Stage-by-Stage Kanban Pipeline */}
              {activeTab === 'leads' && (
                <LeadsKanban
                  leads={leadsList}
                  onUpdateLead={handleUpdateLead}
                  onAddLead={handleAddLead}
                  onDeleteLead={handleDeleteLead}
                  staffMembers={mockStaffMembers}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {/* 3. COMPANIES / CLIENTS */}
              {activeTab === 'companies' && (
                <div>
                  {!selectedCompany ? (
                    <div>
                      {/* Companies Header Toolbar */}
                      <div className="toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h2>Companies / Clients Management</h2>
                          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                            Manage corporate client accounts, company travelers, and corporate visa/tour processing
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Format Toggle (Table View / Card View) */}
                          <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <button
                              className={`btn btn-sm ${companyViewMode === 'table' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, padding: '5px 12px' }}
                              onClick={() => setCompanyViewMode('table')}
                              title="Switch to Compact Table View"
                            >
                              ☰ Table View
                            </button>
                            <button
                              className={`btn btn-sm ${companyViewMode === 'card' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '5px 12px' }}
                              onClick={() => setCompanyViewMode('card')}
                              title="Switch to Grid Card View"
                            >
                              ▦ Card View
                            </button>
                          </div>
                          <button className="btn btn-primary" onClick={() => setShowAddCompanyModal(true)}>+ Add Company</button>
                        </div>
                      </div>

                      {/* Search & Filters Toolbar */}
                      <div className="toolbar" style={{ backgroundColor: '#f8f9fa', padding: '12px', border: '1px solid #000000', marginBottom: '16px', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div className="filter-group">
                            <label>Search By:</label>
                            <select
                              value={companySearchOption}
                              onChange={e => { setCompanySearchOption(e.target.value); setCompanyCurrentPage(1); }}
                            >
                              <option value="all">All Fields</option>
                              <option value="companyName">Company Name</option>
                              <option value="contactPerson">Contact Person</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="registrationDetails">Registration Details</option>
                              <option value="country">Country</option>
                            </select>
                          </div>
                          <div className="filter-group">
                            <label>Search:</label>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder={
                                  companySearchOption === 'companyName' ? 'Search company name...' :
                                    companySearchOption === 'contactPerson' ? 'Search contact person...' :
                                      companySearchOption === 'email' ? 'Search email...' :
                                        companySearchOption === 'phone' ? 'Search phone number...' :
                                          companySearchOption === 'registrationDetails' ? 'Search registration...' :
                                            companySearchOption === 'country' ? 'Search country...' :
                                              'Search companies, persons, emails...'
                                }
                                value={companySearchQuery}
                                onChange={e => { setCompanySearchQuery(e.target.value); setCompanyCurrentPage(1); }}
                                style={{ width: '230px', paddingRight: companySearchQuery ? '24px' : '8px' }}
                              />
                              {companySearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => { setCompanySearchQuery(''); setCompanyCurrentPage(1); }}
                                  style={{
                                    position: 'absolute',
                                    right: '6px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#555'
                                  }}
                                  title="Clear search"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="filter-group">
                            <label>Status:</label>
                            <select
                              value={companyStatusFilter}
                              onChange={e => { setCompanyStatusFilter(e.target.value); setCompanyCurrentPage(1); }}
                            >
                              <option value="All">All Statuses ({companiesList.length})</option>
                              <option value="Active">Active ({companiesList.filter(c => c.status === 'Active').length})</option>
                              <option value="Inactive">Inactive ({companiesList.filter(c => c.status === 'Inactive').length})</option>
                            </select>
                          </div>
                          <div className="filter-group">
                            <label>Sort By:</label>
                            <select
                              value={companySortBy}
                              onChange={e => setCompanySortBy(e.target.value)}
                            >
                              <option value="name-asc">Name (A &rarr; Z)</option>
                              <option value="name-desc">Name (Z &rarr; A)</option>
                              <option value="apps-desc">Most Applications</option>
                              <option value="travelers-desc">Most Travelers</option>
                              <option value="id-asc">Company ID</option>
                            </select>
                          </div>
                          {(companySearchQuery || companyStatusFilter !== 'All') && (
                            <button
                              className="btn btn-sm"
                              onClick={() => {
                                setCompanySearchQuery('');
                                setCompanyStatusFilter('All');
                                setCompanyCurrentPage(1);
                              }}
                              title="Reset all filters"
                            >
                              ✕ Reset Filters
                            </button>
                          )}
                        </div>

                        {/* Summary / Result Stats */}
                        <div style={{ fontSize: '12px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Showing <strong>{filteredCompanies.length === 0 ? 0 : (safeCompanyPage - 1) * companyItemsPerPage + 1}–{Math.min(safeCompanyPage * companyItemsPerPage, filteredCompanies.length)}</strong> of <strong>{filteredCompanies.length}</strong> companies</span>
                          {filteredCompanies.length !== companiesList.length && (
                            <span style={{ color: '#777', fontSize: '11px' }}>({companiesList.length - filteredCompanies.length} filtered out)</span>
                          )}
                        </div>
                      </div>

                      {/* Company Listing Display (Table or Card format) */}
                      <div className="section-box">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div className="section-title">
                            Company Listing — {companyViewMode === 'table' ? 'Table Format' : 'Card Format'} ({filteredCompanies.length} Companies)
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#666' }}>Format:</span>
                            <div style={{ display: 'flex', border: '1px solid #000' }}>
                              <button
                                className={`btn btn-sm ${companyViewMode === 'table' ? 'btn-primary' : ''}`}
                                style={{ border: 'none', borderRadius: 0, padding: '3px 8px', fontSize: '11px' }}
                                onClick={() => setCompanyViewMode('table')}
                              >☰ Table</button>
                              <button
                                className={`btn btn-sm ${companyViewMode === 'card' ? 'btn-primary' : ''}`}
                                style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '3px 8px', fontSize: '11px' }}
                                onClick={() => setCompanyViewMode('card')}
                              >▦ Cards</button>
                            </div>
                          </div>
                        </div>

                        {/* EMPTY STATE */}
                        {filteredCompanies.length === 0 ? (
                          <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed #000', margin: '16px 0', backgroundColor: '#fafafa' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>No Companies Found</h3>
                            <p style={{ margin: '0 0 14px 0', color: '#666', fontSize: '13px' }}>
                              No corporate clients match your search criteria ({companySearchQuery ? `"${companySearchQuery}"` : 'selected filters'}).
                            </p>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setCompanySearchQuery('');
                                setCompanyStatusFilter('All');
                                setCompanyCurrentPage(1);
                              }}
                            >
                              Reset All Filters
                            </button>
                          </div>
                        ) : companyViewMode === 'table' ? (
                          /* TABLE VIEW FORMAT */
                          <div className="table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Company ID &amp; Name</th>
                                  <th>Contact Person</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Address / Country</th>
                                  <th className="text-center">Total Travelers</th>
                                  <th className="text-center">Total Applications</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedCompanies.map(comp => (
                                  <tr key={comp.id}>
                                    <td>
                                      <div><strong>{comp.companyName}</strong></div>
                                      <div style={{ fontSize: '11px', color: '#666' }} className="font-mono">
                                        {comp.id} &bull; {comp.registrationDetails}
                                      </div>
                                    </td>
                                    <td>{comp.contactPerson}</td>
                                    <td><a href={`mailto:${comp.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{comp.email}</a></td>
                                    <td><a href={`tel:${comp.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{comp.phone}</a></td>
                                    <td style={{ fontSize: '12px' }}>{comp.address || comp.country}</td>
                                    <td className="text-center font-mono" style={{ fontWeight: 'bold' }}>{comp.totalCustomers}</td>
                                    <td className="text-center font-mono" style={{ fontWeight: 'bold' }}>{comp.totalApplications}</td>
                                    <td><span className="status-badge">{comp.status}</span></td>
                                    <td className="action-cell">
                                      <button className="btn btn-sm btn-primary" onClick={() => { setSelectedCompany(comp); setCompanySubTab('applications'); }}>View</button>
                                      <button className="btn btn-sm" onClick={() => setEditingCompany({ ...comp })}>Edit</button>
                                      <button
                                        className="btn btn-sm"
                                        onClick={() => handleToggleCompanyStatus(comp.id)}
                                        title={`Switch status to ${comp.status === 'Active' ? 'Inactive' : 'Active'}`}
                                      >
                                        {comp.status === 'Active' ? 'Deactivate' : 'Activate'}
                                      </button>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteCompany(comp.id, comp.companyName)}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* CARD VIEW FORMAT */
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '14px' }}>
                            {paginatedCompanies.map(comp => {
                              const initials = comp.companyName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                              return (
                                <div key={comp.id} className="company-card">
                                  <div>
                                    {/* Card Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div className="company-card-avatar">
                                          {initials}
                                        </div>
                                        <div>
                                          <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold', lineHeight: 1.2 }}>{comp.companyName}</h3>
                                          <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{comp.id}</span>
                                        </div>
                                      </div>
                                      <span className="status-badge">{comp.status}</span>
                                    </div>

                                    {/* Registration Details Strip */}
                                    <div style={{
                                      fontSize: '11px',
                                      backgroundColor: '#f5f5f5',
                                      border: '1px solid #e0e0e0',
                                      padding: '5px 8px',
                                      marginBottom: '12px',
                                      display: 'flex',
                                      justifyContent: 'space-between'
                                    }}>
                                      <span><strong>Reg Details:</strong> {comp.registrationDetails}</span>
                                      <span><strong>Country:</strong> {comp.country}</span>
                                    </div>

                                    {/* Contact & Address Details */}
                                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#666', width: '20px' }}>👤</span>
                                        <span><strong>Contact:</strong> {comp.contactPerson}</span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#666', width: '20px' }}>✉️</span>
                                        <a href={`mailto:${comp.email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{comp.email}</a>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#666', width: '20px' }}>📞</span>
                                        <a href={`tel:${comp.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{comp.phone}</a>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                        <span style={{ color: '#666', width: '20px' }}>📍</span>
                                        <span style={{ color: '#444' }}>{comp.address}</span>
                                      </div>
                                    </div>

                                    {/* Metrics Strip */}
                                    <div className="company-stats-strip">
                                      <div>
                                        <div className="company-stat-lbl">Travelers</div>
                                        <div className="company-stat-val">{comp.totalCustomers}</div>
                                      </div>
                                      <div style={{ borderLeft: '1px solid #e0e0e0' }}>
                                        <div className="company-stat-lbl">Applications</div>
                                        <div className="company-stat-val">{comp.totalApplications}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card Actions */}
                                  <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #eee', paddingTop: '10px', flexWrap: 'wrap' }}>
                                    <button
                                      className="btn btn-sm btn-primary"
                                      style={{ flex: 1 }}
                                      onClick={() => { setSelectedCompany(comp); setCompanySubTab('applications'); }}
                                    >
                                      👁️ View Details
                                    </button>
                                    <button
                                      className="btn btn-sm"
                                      onClick={() => setEditingCompany({ ...comp })}
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      className="btn btn-sm"
                                      onClick={() => handleToggleCompanyStatus(comp.id)}
                                      title={comp.status === 'Active' ? 'Deactivate Company' : 'Activate Company'}
                                    >
                                      {comp.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDeleteCompany(comp.id, comp.companyName)}
                                      title="Delete Company"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* PAGINATION CONTROLS BAR */}
                        {filteredCompanies.length > 0 && (
                          <div className="pagination-bar">
                            {/* Rows per page selector & Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ color: '#555' }}>Rows per page:</label>
                                <select
                                  value={companyItemsPerPage}
                                  onChange={e => {
                                    setCompanyItemsPerPage(Number(e.target.value));
                                    setCompanyCurrentPage(1);
                                  }}
                                  style={{ padding: '3px 6px', fontSize: '12px' }}
                                >
                                  <option value={3}>3</option>
                                  <option value={5}>5</option>
                                  <option value={10}>10</option>
                                  <option value={20}>20</option>
                                </select>
                              </div>
                              <span style={{ color: '#555' }}>
                                Showing <strong>{(safeCompanyPage - 1) * companyItemsPerPage + 1}</strong> to <strong>{Math.min(safeCompanyPage * companyItemsPerPage, filteredCompanies.length)}</strong> of <strong>{filteredCompanies.length}</strong> items
                              </span>
                            </div>

                            {/* Page navigation controls */}
                            <div className="pagination-controls">
                              <button
                                className="pagination-btn"
                                disabled={safeCompanyPage <= 1}
                                onClick={() => setCompanyCurrentPage(1)}
                                title="First Page"
                              >
                                &laquo; First
                              </button>
                              <button
                                className="pagination-btn"
                                disabled={safeCompanyPage <= 1}
                                onClick={() => setCompanyCurrentPage(p => Math.max(1, p - 1))}
                                title="Previous Page"
                              >
                                &lsaquo; Prev
                              </button>

                              {/* Numbered Page Buttons */}
                              <div style={{ display: 'flex', gap: '3px', margin: '0 4px' }}>
                                {Array.from({ length: totalCompanyPages }, (_, i) => i + 1)
                                  .filter(p => {
                                    if (p === 1 || p === totalCompanyPages) return true;
                                    if (Math.abs(p - safeCompanyPage) <= 1) return true;
                                    return false;
                                  })
                                  .map((p, idx, arr) => {
                                    const prevP = arr[idx - 1];
                                    const showEllipsis = prevP && p - prevP > 1;
                                    return (
                                      <React.Fragment key={p}>
                                        {showEllipsis && <span style={{ padding: '0 4px', alignSelf: 'center', color: '#888' }}>...</span>}
                                        <button
                                          className={`pagination-btn ${safeCompanyPage === p ? 'active' : ''}`}
                                          onClick={() => setCompanyCurrentPage(p)}
                                          style={{ minWidth: '30px' }}
                                        >
                                          {p}
                                        </button>
                                      </React.Fragment>
                                    );
                                  })}
                              </div>

                              <button
                                className="pagination-btn"
                                disabled={safeCompanyPage >= totalCompanyPages}
                                onClick={() => setCompanyCurrentPage(p => Math.min(totalCompanyPages, p + 1))}
                                title="Next Page"
                              >
                                Next &rsaquo;
                              </button>
                              <button
                                className="pagination-btn"
                                disabled={safeCompanyPage >= totalCompanyPages}
                                onClick={() => setCompanyCurrentPage(totalCompanyPages)}
                                title="Last Page"
                              >
                                Last &raquo;
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* DEDICATED COMPANY DETAILS PAGE VIEW */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setSelectedCompany(null)}>
                          &larr; Back to Company Listing
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-sm" onClick={() => setEditingCompany({ ...selectedCompany })}>Edit Company Details</button>
                        </div>
                      </div>

                      {/* Company Header Box */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
                          <div className="section-title">Company Details: {selectedCompany.companyName}</div>
                          <span className="status-badge">{selectedCompany.status}</span>
                        </div>
                        <div className="form-grid" style={{ fontSize: '13px' }}>
                          <div><strong>Registration Details:</strong> {selectedCompany.registrationDetails}</div>
                          <div><strong>Contact Person:</strong> {selectedCompany.contactPerson}</div>
                          <div><strong>Email ID:</strong> {selectedCompany.email}</div>
                          <div><strong>Phone Number:</strong> {selectedCompany.phone}</div>
                          <div><strong>Address:</strong> {selectedCompany.address}</div>
                          <div><strong>Country:</strong> {selectedCompany.country}</div>
                          <div><strong>Total Registered Travelers:</strong> {selectedCompany.totalCustomers}</div>
                          <div><strong>Total Applications Submitted:</strong> {selectedCompany.totalApplications}</div>
                        </div>
                      </div>

                      {/* 3 Major Tabs as per PDF Spec Section 5 */}
                      <div className="tabs-header">
                        <button
                          className={`tab-btn ${companySubTab === 'applications' ? 'active' : ''}`}
                          onClick={() => setCompanySubTab('applications')}
                        >
                          5.1 Applications ({mockCompanyApplications.length})
                        </button>
                        <button
                          className={`tab-btn ${companySubTab === 'employees' ? 'active' : ''}`}
                          onClick={() => setCompanySubTab('employees')}
                        >
                          5.2 Employees ({mockCompanyEmployees.length})
                        </button>
                        <button
                          className={`tab-btn ${companySubTab === 'financial' ? 'active' : ''}`}
                          onClick={() => setCompanySubTab('financial')}
                        >
                          5.3 Issuing / Booking / Financial Information
                        </button>
                      </div>

                      {/* TAB 5.1 APPLICATIONS WITH FILTERS */}
                      {companySubTab === 'applications' && (() => {
                        const filteredCompApps = companyApplicationsList.filter(app => {
                          if (companyAppFilterType !== 'All' && app.applicationType !== companyAppFilterType) return false;
                          if (companyAppFilterStatus !== 'All' && app.status !== companyAppFilterStatus) return false;
                          if (companyAppSearch && !app.applicantName.toLowerCase().includes(companyAppSearch.toLowerCase()) && !app.id.toLowerCase().includes(companyAppSearch.toLowerCase())) return false;
                          return true;
                        });

                        const handleOpenCompanyApp = (app) => {
                          if (app.applicationType === 'HOLIDAY' || (app.service && (app.service.includes('Europe') || app.service.includes('Bali')))) {
                            setViewingBookingDetails({
                              packageId: app.id || 'PKG-701',
                              packageName: app.service || 'Grand Europe 10D',
                              destination: app.country || 'France & Switzerland',
                              duration: '8 Days / 7 Nights',
                              bookingDate: app.applicationDate || '2026-09-25',
                              departureDate: '2026-11-15',
                              totalPrice: 210000,
                              price: 210000,
                              status: app.status || 'APPROVED',
                              customerName: app.applicantName || 'Deepak Chopra'
                            });
                            setViewingVisaDetails(null);
                            setSelectedCompany(null);
                          } else {
                            setViewingVisaDetails({
                              id: app.id || 'VISA-301',
                              applicantName: app.applicantName || 'Rohan Joshi',
                              email: 'contact@rhglobal.com',
                              phone: '+91 98200 11111',
                              country: app.country || 'United States',
                              service: app.service || 'Business Visa (B1)',
                              passport: 'P1092834 (Exp: 2031-05-12)',
                              assignedEmployee: app.assignedEmployee || 'Amit Verma (CO-101)',
                              applicationDate: app.applicationDate || '2026-10-01',
                              status: app.status || 'IN PROGRESS'
                            });
                            setViewingBookingDetails(null);
                            setSelectedCompany(null);
                          }
                        };

                        const compAppStages = [
                          { id: 'Under Review', name: 'Under Review', color: '#f59e0b', desc: 'Initial review & docs verification' },
                          { id: 'In Progress', name: 'In Progress', color: '#3b82f6', desc: 'Dossier active in processing' },
                          { id: 'Approved', name: 'Approved', color: '#22c55e', desc: 'Visa/Booking confirmed' },
                          { id: 'Pending', name: 'Pending Action', color: '#8b5cf6', desc: 'Awaiting client documents' },
                          { id: 'Completed', name: 'Completed', color: '#10b981', desc: 'Travel successfully completed' },
                          { id: 'Rejected', name: 'Rejected', color: '#ef4444', desc: 'Declined by embassy / cancelled' }
                        ];

                        return (
                          <div className="section-box">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div className="section-title">
                                Company Applications — {companyAppViewMode === 'table' ? 'Table Format' : companyAppViewMode === 'card' ? 'Card Format' : 'Kanban Pipeline'} ({filteredCompApps.length})
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#666' }}>Format:</span>
                                <div style={{ display: 'flex', border: '1px solid #000' }}>
                                  <button
                                    className={`btn btn-sm ${companyAppViewMode === 'table' ? 'btn-primary' : ''}`}
                                    style={{ border: 'none', borderRadius: 0, padding: '3px 8px', fontSize: '11px' }}
                                    onClick={() => setCompanyAppViewMode('table')}
                                  >☰ Table</button>
                                  <button
                                    className={`btn btn-sm ${companyAppViewMode === 'kanban' ? 'btn-primary' : ''}`}
                                    style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '3px 8px', fontSize: '11px' }}
                                    onClick={() => setCompanyAppViewMode('kanban')}
                                  >☷ Kanban</button>
                                </div>
                              </div>
                            </div>

                            {/* FILTER TOOLBAR */}
                            <div className="toolbar" style={{ backgroundColor: '#f5f5f5', padding: '10px', border: '1px solid #ccc', marginBottom: '16px' }}>
                              <div className="filter-group">
                                <label>Search Applicant / ID:</label>
                                <input
                                  type="text"
                                  placeholder="Type to filter..."
                                  value={companyAppSearch}
                                  onChange={e => setCompanyAppSearch(e.target.value)}
                                  style={{ width: '180px' }}
                                />
                              </div>
                              <div className="filter-group">
                                <label>Application Type:</label>
                                <select value={companyAppFilterType} onChange={e => setCompanyAppFilterType(e.target.value)}>
                                  <option value="All">All Types</option>
                                  <option value="Visa">Visa</option>
                                  <option value="Holiday">Holiday</option>
                                </select>
                              </div>
                              <div className="filter-group">
                                <label>Status:</label>
                                <select value={companyAppFilterStatus} onChange={e => setCompanyAppFilterStatus(e.target.value)}>
                                  <option value="All">All Statuses</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                              {(companyAppSearch || companyAppFilterType !== 'All' || companyAppFilterStatus !== 'All') && (
                                <button
                                  className="btn btn-sm"
                                  onClick={() => { setCompanyAppSearch(''); setCompanyAppFilterType('All'); setCompanyAppFilterStatus('All'); }}
                                >
                                  Reset Filters
                                </button>
                              )}
                            </div>

                            {/* 1. TABLE VIEW */}
                            {companyAppViewMode === 'table' && (
                              <div className="table-container">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Application ID</th>
                                      <th>Applicant Name</th>
                                      <th>Application Type</th>
                                      <th>Country</th>
                                      <th>Service Required</th>
                                      <th>Assigned Employee / Case Officer</th>
                                      <th>Status</th>
                                      <th>Application Date</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredCompApps.map(app => (
                                      <tr key={app.id}>
                                        <td className="font-mono"><strong>{app.id}</strong></td>
                                        <td>{app.applicantName}</td>
                                        <td><span className="status-badge">{app.applicationType}</span></td>
                                        <td>{app.country}</td>
                                        <td>{app.service}</td>
                                        <td>{app.assignedEmployee}</td>
                                        <td><span className="status-badge">{app.status}</span></td>
                                        <td>{app.applicationDate}</td>
                                        <td className="action-cell">
                                          <button className="btn btn-sm btn-primary" onClick={() => handleOpenCompanyApp(app)}>View</button>
                                          <button className="btn btn-sm" onClick={() => alert(`Editing application ${app.id}`)}>Edit</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* 2. CARD VIEW */}
                            {companyAppViewMode === 'card' && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginTop: '12px' }}>
                                {filteredCompApps.map(app => (
                                  <div key={app.id} className="company-card" style={{ padding: '14px', border: '1px solid #000', backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                      <span className="font-mono" style={{ fontSize: '13px' }}><strong>{app.id}</strong></span>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <span className="status-badge" style={{ fontSize: '10px' }}>{app.applicationType}</span>
                                        <span className="status-badge" style={{ fontSize: '10px' }}>{app.status}</span>
                                      </div>
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold' }}>{app.applicantName}</h3>
                                    <div style={{ fontSize: '12px', color: '#444', marginBottom: '4px' }}>
                                      <strong>Service:</strong> {app.service} ({app.country})
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                      <strong>Case Officer:</strong> {app.assignedEmployee}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
                                      Applied: {app.applicationDate}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                      <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => handleOpenCompanyApp(app)}>
                                        View Details &rarr;
                                      </button>
                                      <button className="btn btn-sm" onClick={() => alert(`Editing application ${app.id}`)}>Edit</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 3. KANBAN VIEW */}
                            {companyAppViewMode === 'kanban' && (
                              <div className="kanban-board-container" style={{ marginTop: '12px', overflowX: 'auto' }}>
                                <div className="kanban-columns-grid" style={{ gridTemplateColumns: `repeat(${compAppStages.length}, minmax(240px, 1fr))` }}>
                                  {compAppStages.map(st => {
                                    const stageApps = filteredCompApps.filter(a => a.status.toLowerCase() === st.id.toLowerCase() || (st.id === 'In Progress' && a.status.toLowerCase().includes('progress')));
                                    const isOver = dragOverCompAppCol === st.id;
                                    return (
                                      <div
                                        key={st.id}
                                        className={`kanban-column ${isOver ? 'kanban-column-drop-active' : ''}`}
                                        onDragOver={e => { e.preventDefault(); setDragOverCompAppCol(st.id); }}
                                        onDragLeave={() => setDragOverCompAppCol(null)}
                                        onDrop={e => {
                                          e.preventDefault();
                                          setDragOverCompAppCol(null);
                                          if (draggedCompAppId) {
                                            setCompanyApplicationsList(prev => prev.map(a => a.id === draggedCompAppId ? { ...a, status: st.id } : a));
                                            setDraggedCompAppId(null);
                                          }
                                        }}
                                      >
                                        <div className="kanban-column-header" style={{ borderTop: `3px solid ${st.color}` }}>
                                          <div className="kanban-column-title">
                                            <span>{st.name}</span>
                                            <span className="kanban-count-pill">{stageApps.length}</span>
                                          </div>
                                          <div className="kanban-column-desc">{st.desc}</div>
                                        </div>
                                        <div className="kanban-cards-list">
                                          {stageApps.length === 0 ? (
                                            <div className="kanban-empty-column">No applications in {st.name}</div>
                                          ) : (
                                            stageApps.map(app => (
                                              <div
                                                key={app.id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={e => {
                                                  setDraggedCompAppId(app.id);
                                                  e.dataTransfer.effectAllowed = 'move';
                                                }}
                                              >
                                                <div className="kanban-card-header">
                                                  <span className="kanban-lead-id">{app.id}</span>
                                                  <span className="status-badge" style={{ fontSize: '9px' }}>{app.applicationType}</span>
                                                </div>
                                                <div className="kanban-card-body" onClick={() => handleOpenCompanyApp(app)} style={{ cursor: 'pointer' }}>
                                                  <div className="kanban-lead-name">{app.applicantName}</div>
                                                  <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                                    {app.service}
                                                  </div>
                                                  <div style={{ fontSize: '11px', color: '#777', marginTop: '1px' }}>
                                                    📍 {app.country}
                                                  </div>
                                                  <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                                                    👤 {app.assignedEmployee}
                                                  </div>
                                                  <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                                                    📅 {app.applicationDate}
                                                  </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px', borderTop: '1px solid #f0f0f0', paddingTop: '6px', marginTop: '6px' }}>
                                                  <button
                                                    className="btn btn-sm btn-primary"
                                                    style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                                    onClick={() => handleOpenCompanyApp(app)}
                                                  >
                                                    View Details &rarr;
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* TAB 5.2 EMPLOYEES WITH FILTERS */}
                      {companySubTab === 'employees' && (
                        <div className="section-box">
                          <div className="section-header">
                            <div className="section-title">Company Employees / Staff Members</div>
                            <button className="btn btn-sm btn-primary" onClick={() => alert('Add Employee modal triggered')}>+ Add Employee</button>
                          </div>

                          {/* FILTER TOOLBAR */}
                          <div className="toolbar" style={{ backgroundColor: '#f5f5f5', padding: '10px', border: '1px solid #ccc', marginBottom: '16px' }}>
                            <div className="filter-group">
                              <label>Search Employee Name / ID:</label>
                              <input
                                type="text"
                                placeholder="Type to filter..."
                                value={companyEmpSearch}
                                onChange={e => setCompanyEmpSearch(e.target.value)}
                                style={{ width: '200px' }}
                              />
                            </div>
                            <div className="filter-group">
                              <label>Status:</label>
                              <select value={companyEmpFilterStatus} onChange={e => setCompanyEmpFilterStatus(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </div>
                            {(companyEmpSearch || companyEmpFilterStatus !== 'All') && (
                              <button
                                className="btn btn-sm"
                                onClick={() => { setCompanyEmpSearch(''); setCompanyEmpFilterStatus('All'); }}
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>

                          <div className="table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Employee ID</th>
                                  <th>Name</th>
                                  <th>Email</th>
                                  <th>Phone Number</th>
                                  <th>Department</th>
                                  <th>Designation</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mockCompanyEmployees
                                  .filter(emp => {
                                    if (companyEmpFilterStatus !== 'All' && emp.status !== companyEmpFilterStatus) return false;
                                    if (companyEmpSearch && !emp.name.toLowerCase().includes(companyEmpSearch.toLowerCase()) && !emp.employeeId.toLowerCase().includes(companyEmpSearch.toLowerCase())) return false;
                                    return true;
                                  })
                                  .map(emp => (
                                    <tr key={emp.employeeId}>
                                      <td className="font-mono"><strong>{emp.employeeId}</strong></td>
                                      <td>{emp.name}</td>
                                      <td>{emp.email}</td>
                                      <td>{emp.phone}</td>
                                      <td>{emp.department}</td>
                                      <td>{emp.designation}</td>
                                      <td><span className="status-badge">{emp.status}</span></td>
                                      <td className="action-cell">
                                        <button className="btn btn-sm" onClick={() => alert(`Editing employee ${emp.employeeId}`)}>Edit</button>
                                        <button className="btn btn-sm" onClick={() => alert(`Toggled activation for ${emp.name}`)}>Activate/Deactivate</button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* TAB 5.3 ISSUING / BOOKING / FINANCIAL INFORMATION */}
                      {companySubTab === 'financial' && (
                        <div className="section-box">
                          <div className="section-header">
                            <div className="section-title">Issuing, Booking & Financial Information</div>
                          </div>

                          <div className="grid-cards">
                            <div className="card">
                              <div className="card-title">Total Company Applications</div>
                              <div className="card-value">{selectedCompany.totalApplications}</div>
                            </div>
                            <div className="card">
                              <div className="card-title">Total Invoiced Amount</div>
                              <div className="card-value">₹8,40,000</div>
                            </div>
                            <div className="card">
                              <div className="card-title">Paid Amount</div>
                              <div className="card-value">₹8,40,000</div>
                            </div>
                            <div className="card">
                              <div className="card-title">Payment Status</div>
                              <div className="card-value" style={{ fontSize: '18px' }}>SETTLED</div>
                            </div>
                          </div>

                          <div className="table-container mt-4">
                            <table>
                              <thead>
                                <tr>
                                  <th>Application ID</th>
                                  <th>Service Type</th>
                                  <th>Booking Status</th>
                                  <th>Payment Status</th>
                                  <th>Invoice Information</th>
                                  <th>Download</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="font-mono">APP-5001</td>
                                  <td>Business Visa (B1)</td>
                                  <td><span className="status-badge">Confirmed</span></td>
                                  <td><span className="status-badge">Paid</span></td>
                                  <td>INV-2026-0911 (₹21,000)</td>
                                  <td><button className="btn btn-sm" onClick={() => alert('Downloading Invoice PDF')}>Invoice Download</button></td>
                                </tr>
                                <tr>
                                  <td className="font-mono">APP-5002</td>
                                  <td>Grand Europe 10D Package</td>
                                  <td><span className="status-badge">Confirmed</span></td>
                                  <td><span className="status-badge">Paid</span></td>
                                  <td>INV-2026-0865 (₹2,10,000)</td>
                                  <td><button className="btn btn-sm" onClick={() => alert('Downloading Invoice PDF')}>Invoice Download</button></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. TRAVELERS / CUSTOMERS */}
              {activeTab === 'travelers' && (
                <div>
                  {!viewingTraveler ? (
                    <div className="section-box">
                      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div className="section-title">
                          Travelers / Customers Listing — {travelerViewMode === 'table' ? 'Table Format' : 'Card Format'} ({travelersList.length})
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#666' }}>Format:</span>
                          <div style={{ display: 'flex', border: '1px solid #000' }}>
                            <button
                              className={`btn btn-sm ${travelerViewMode === 'table' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setTravelerViewMode('table')}
                            >☰ Table</button>
                            <button
                              className={`btn btn-sm ${travelerViewMode === 'card' ? 'btn-primary' : ''}`}
                              style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000', padding: '3px 8px', fontSize: '11px' }}
                              onClick={() => setTravelerViewMode('card')}
                            >▦ Cards</button>
                          </div>
                          <button className="btn btn-primary" onClick={() => setShowAddTravelerModal(true)}>+ Add Traveler</button>
                        </div>
                      </div>

                      {/* 1. TABLE VIEW */}
                      {travelerViewMode === 'table' && (
                        <div className="table-container">
                          <table>
                            <thead>
                              <tr>
                                <th>Unique Traveler ID</th>
                                <th>Applicant Name</th>
                                <th>Mobile Number</th>
                                <th>Email</th>
                                <th>Country</th>
                                <th>Registration Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {travelersList.map(trv => (
                                <tr key={trv.travelerId}>
                                  <td className="font-mono"><strong>{trv.travelerId}</strong></td>
                                  <td>{trv.applicantName}</td>
                                  <td>{trv.mobileNumber}</td>
                                  <td>{trv.email}</td>
                                  <td>{trv.country}</td>
                                  <td>{trv.registrationDate}</td>
                                  <td><span className="status-badge">{trv.status}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm btn-primary" onClick={() => setViewingTraveler(trv)}>View</button>
                                    <button className="btn btn-sm" onClick={() => setEditingTraveler({ ...trv })}>Edit</button>
                                    <button className="btn btn-sm" onClick={() => {
                                      setTravelersList(prev => prev.map(t => t.travelerId === trv.travelerId ? { ...t, status: t.status === 'Active' ? 'Blocked' : 'Active' } : t));
                                    }}>
                                      {trv.status === 'Active' ? 'Block' : 'Unblock'}
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => {
                                      if (window.confirm(`Delete traveler ${trv.applicantName}?`)) {
                                        setTravelersList(prev => prev.filter(t => t.travelerId !== trv.travelerId));
                                      }
                                    }}>Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 2. CARD VIEW */}
                      {travelerViewMode === 'card' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '14px' }}>
                          {travelersList.map(trv => {
                            const initials = trv.applicantName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                            return (
                              <div key={trv.travelerId} className="company-card" style={{ padding: '16px', border: '1px solid #000', backgroundColor: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div className="company-card-avatar" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                                      {initials}
                                    </div>
                                    <div>
                                      <h3 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>{trv.applicantName}</h3>
                                      <span className="font-mono" style={{ fontSize: '11px', color: '#666' }}>{trv.travelerId}</span>
                                    </div>
                                  </div>
                                  <span className="status-badge" style={{ fontSize: '10px' }}>{trv.status}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#444', display: 'grid', gap: '4px', marginBottom: '10px' }}>
                                  <div>📞 {trv.mobileNumber}</div>
                                  <div>✉️ {trv.email}</div>
                                  <div>📍 {trv.country} &bull; 🛂 {trv.passport || 'Valid Passport'}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '11px' }}>
                                  <div style={{ flex: 1 }}><strong>Visa Apps:</strong> {trv.visaApplications || 0}</div>
                                  <div style={{ flex: 1 }}><strong>Bookings:</strong> {trv.bookingHistory || 0}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                  <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => setViewingTraveler(trv)}>
                                    View Profile &rarr;
                                  </button>
                                  <button className="btn btn-sm" onClick={() => setEditingTraveler({ ...trv })}>Edit</button>
                                  <button className="btn btn-sm" onClick={() => {
                                    setTravelersList(prev => prev.map(t => t.travelerId === trv.travelerId ? { ...t, status: t.status === 'Active' ? 'Blocked' : 'Active' } : t));
                                  }}>
                                    {trv.status === 'Active' ? 'Block' : 'Unblock'}
                                  </button>
                                  <button className="btn btn-sm btn-danger" onClick={() => {
                                    if (window.confirm(`Delete traveler ${trv.applicantName}?`)) {
                                      setTravelersList(prev => prev.filter(t => t.travelerId !== trv.travelerId));
                                    }
                                  }}>🗑️</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DEDICATED FULL-PAGE TRAVELER DETAILS VIEW */
                    <div>
                      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                        <button className="btn" onClick={() => setViewingTraveler(null)}>
                          &larr; Back to Traveler Listing
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => setEditingTraveler({ ...viewingTraveler })}>
                          Edit Traveler Details
                        </button>
                      </div>

                      {/* Section 6 PDF Requirements: Personal Details, Contact Details, Passport/Travel Info */}
                      <div className="section-box" style={{ background: '#fafafa' }}>
                        <div className="section-header">
                          <div className="section-title">Traveler Full Profile: {viewingTraveler.applicantName} ({viewingTraveler.travelerId})</div>
                          <span className="status-badge">{viewingTraveler.status}</span>
                        </div>
                        <div className="form-grid" style={{ fontSize: '13px' }}>
                          <div><strong>Unique Traveler ID:</strong> <span className="font-mono">{viewingTraveler.travelerId}</span></div>
                          <div><strong>Applicant Name:</strong> {viewingTraveler.applicantName}</div>
                          <div><strong>Mobile Number:</strong> {viewingTraveler.mobileNumber}</div>
                          <div><strong>Email ID:</strong> {viewingTraveler.email}</div>
                          <div><strong>Country:</strong> {viewingTraveler.country}</div>
                          <div><strong>Passport Information:</strong> {viewingTraveler.passport || 'Z9847291 (Exp: 2031-05-12)'}</div>
                          <div><strong>Registration Date:</strong> {viewingTraveler.registrationDate}</div>
                          <div><strong>Account Status:</strong> {viewingTraveler.status}</div>
                        </div>
                      </div>

                      {/* PDF Section 6: Visa Applications History */}
                      {(() => {
                        const trvVisas = visaList.filter(v => v.applicantName.toLowerCase() === viewingTraveler.applicantName.toLowerCase()).length > 0
                          ? visaList.filter(v => v.applicantName.toLowerCase() === viewingTraveler.applicantName.toLowerCase())
                          : visaList.slice(0, 4);

                        const visaStages = [
                          { id: 'under-review', name: 'Under Review', color: '#f59e0b', desc: 'Initial review of documents & eligibility' },
                          { id: 'docs-verified', name: 'Docs Verified', color: '#3b82f6', desc: 'Documents authenticated and verified' },
                          { id: 'processing', name: 'Processing', color: '#8b5cf6', desc: 'Application in embassy / processing pipeline' },
                          { id: 'approved', name: 'Approved', color: '#10b981', desc: 'Visa issued and granted' },
                          { id: 'rejected', name: 'Rejected', color: '#ef4444', desc: 'Application declined by consulate' }
                        ];

                        return (
                          <div className="section-box">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div className="section-title">Visa Applications History ({trvVisas.length} Total)</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Format:</span>
                                <button
                                  className={`btn btn-sm ${travelerVisaViewMode === 'table' ? 'btn-primary' : ''}`}
                                  onClick={() => setTravelerVisaViewMode('table')}
                                >
                                  ☰ Table
                                </button>
                                <button
                                  className={`btn btn-sm ${travelerVisaViewMode === 'card' ? 'btn-primary' : ''}`}
                                  onClick={() => setTravelerVisaViewMode('card')}
                                >
                                  ▦ Cards
                                </button>
                                <button
                                  className={`btn btn-sm ${travelerVisaViewMode === 'kanban' ? 'btn-primary' : ''}`}
                                  onClick={() => setTravelerVisaViewMode('kanban')}
                                >
                                  ☷ Kanban
                                </button>
                              </div>
                            </div>

                            {/* 1. TABLE VIEW */}
                            {travelerVisaViewMode === 'table' && (
                              <div className="table-container">
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
                                    {trvVisas.map(visa => (
                                      <tr key={visa.id}>
                                        <td className="font-mono"><strong>{visa.id}</strong></td>
                                        <td>{visa.country}</td>
                                        <td>{visa.visaType}</td>
                                        <td>{visa.applicationDate}</td>
                                        <td>{visa.caseOfficerName} ({visa.caseOfficerId})</td>
                                        <td><span className="status-badge">{visa.paymentType}</span></td>
                                        <td><span className="status-badge">{visa.status}</span></td>
                                        <td>
                                          <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                              setViewingVisaDetails(visa);
                                              if (visa.documents?.length) setVisaDocsList(visa.documents);
                                            }}
                                          >
                                            View Details &rarr;
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* 2. CARD VIEW */}
                            {travelerVisaViewMode === 'card' && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '12px' }}>
                                {trvVisas.map(visa => (
                                  <div key={visa.id} className="company-card" style={{ padding: '14px', border: '1px solid #000', backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                      <div>
                                        <span className="font-mono" style={{ fontWeight: 'bold', fontSize: '13px' }}>{visa.id}</span>
                                        <div style={{ fontSize: '11px', color: '#666' }}>{visa.visaType}</div>
                                      </div>
                                      <span className="status-badge" style={{ fontSize: '10px' }}>{visa.status}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#333', display: 'grid', gap: '4px', marginBottom: '10px' }}>
                                      <div><strong>Destination:</strong> {visa.country}</div>
                                      <div><strong>Case Officer:</strong> {visa.caseOfficerName} ({visa.caseOfficerId})</div>
                                      <div><strong>Applied Date:</strong> {visa.applicationDate}</div>
                                      <div><strong>Payment:</strong> <span className="status-badge" style={{ fontSize: '10px' }}>{visa.paymentType}</span> {visa.totalAmount ? `(₹${visa.totalAmount.toLocaleString()})` : ''}</div>
                                    </div>
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => {
                                          setViewingVisaDetails(visa);
                                          if (visa.documents?.length) setVisaDocsList(visa.documents);
                                        }}
                                      >
                                        View Details &rarr;
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 3. KANBAN VIEW */}
                            {travelerVisaViewMode === 'kanban' && (
                              <div className="kanban-board-container" style={{ marginTop: '12px', overflowX: 'auto' }}>
                                <div className="kanban-columns-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))' }}>
                                  {visaStages.map(col => {
                                    const colVisas = trvVisas.filter(v => {
                                      const st = (v.stage || v.status || '').toLowerCase().replace(/\s+/g, '-');
                                      if (col.id === 'under-review') return st.includes('review');
                                      if (col.id === 'docs-verified') return st.includes('verified') || st.includes('docs');
                                      if (col.id === 'processing') return st.includes('process') || st.includes('submit');
                                      if (col.id === 'approved') return st.includes('approv');
                                      if (col.id === 'rejected') return st.includes('reject');
                                      return false;
                                    });
                                    const isOver = dragOverTrvVisaCol === col.id;
                                    return (
                                      <div
                                        key={col.id}
                                        className={`kanban-column ${isOver ? 'kanban-column-drop-active' : ''}`}
                                        onDragOver={e => { e.preventDefault(); setDragOverTrvVisaCol(col.id); }}
                                        onDragLeave={() => setDragOverTrvVisaCol(null)}
                                        onDrop={e => {
                                          e.preventDefault();
                                          setDragOverTrvVisaCol(null);
                                          if (draggedTrvVisaId) {
                                            setVisaList(prev => prev.map(v => v.id === draggedTrvVisaId ? {
                                              ...v,
                                              stage: col.id,
                                              status: col.name
                                            } : v));
                                            setDraggedTrvVisaId(null);
                                          }
                                        }}
                                      >
                                        <div className="kanban-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                                          <div className="kanban-column-title">
                                            <span>{col.name}</span>
                                            <span className="kanban-count-pill">{colVisas.length}</span>
                                          </div>
                                          <div className="kanban-column-desc">{col.desc}</div>
                                        </div>
                                        <div className="kanban-cards-list">
                                          {colVisas.length === 0 ? (
                                            <div className="kanban-empty-column">No applications</div>
                                          ) : (
                                            colVisas.map(visa => (
                                              <div
                                                key={visa.id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={e => {
                                                  setDraggedTrvVisaId(visa.id);
                                                  e.dataTransfer.effectAllowed = 'move';
                                                }}
                                              >
                                                <div className="kanban-card-header">
                                                  <span className="kanban-lead-id">{visa.id}</span>
                                                  <span className="status-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>{visa.country}</span>
                                                </div>
                                                <div className="kanban-card-body" onClick={() => { setViewingVisaDetails(visa); if (visa.documents?.length) setVisaDocsList(visa.documents); }} style={{ cursor: 'pointer' }}>
                                                  <div className="kanban-lead-name">{visa.visaType}</div>
                                                  <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                                    👤 {visa.caseOfficerName}
                                                  </div>
                                                  <div style={{ fontSize: '10px', color: '#777', marginTop: '2px' }}>
                                                    📅 {visa.applicationDate}
                                                  </div>
                                                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                                    <span className="nav-badge" style={{ fontSize: '9px' }}>{visa.paymentType}</span>
                                                    {visa.totalAmount && (
                                                      <span className="nav-badge" style={{ fontSize: '9px' }}>₹{visa.totalAmount.toLocaleString()}</span>
                                                    )}
                                                  </div>
                                                </div>
                                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '6px', marginTop: '6px' }}>
                                                  <button
                                                    className="btn btn-sm btn-primary"
                                                    style={{ width: '100%', fontSize: '10px', padding: '3px 6px' }}
                                                    onClick={() => {
                                                      setViewingVisaDetails(visa);
                                                      if (visa.documents?.length) setVisaDocsList(visa.documents);
                                                    }}
                                                  >
                                                    View Details &rarr;
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* PDF Section 6: Booking History */}
                      {(() => {
                        const trvBookings = bookingList.filter(b => b.customerName && b.customerName.toLowerCase() === viewingTraveler.applicantName.toLowerCase()).length > 0
                          ? bookingList.filter(b => b.customerName && b.customerName.toLowerCase() === viewingTraveler.applicantName.toLowerCase())
                          : bookingList;

                        const holidayStages = [
                          { id: 'stage-1', name: 'Booking Created', color: '#f59e0b', desc: 'Reservation entered, awaiting itinerary' },
                          { id: 'stage-2', name: 'Docs & Itinerary', color: '#3b82f6', desc: 'Itinerary and flights arranged' },
                          { id: 'stage-3', name: 'Vouchers & Confirm', color: '#8b5cf6', desc: 'Confirmed booking & hotel vouchers' },
                          { id: 'stage-4', name: 'Tour In-Progress', color: '#06b6d4', desc: 'Traveler currently on tour' },
                          { id: 'completed', name: 'Completed', color: '#10b981', desc: 'Tour successfully concluded' },
                          { id: 'cancelled', name: 'Cancelled', color: '#ef4444', desc: 'Cancelled or refunded booking' }
                        ];

                        const openAddBookingModal = () => {
                          const firstPkg = holidayPackagesList[0] || {
                            packageId: 'PKG-701',
                            packageName: 'Bali Island Beach Getaway',
                            destination: 'Bali, Indonesia',
                            duration: '6 Days / 5 Nights',
                            days: 6,
                            nights: 5,
                            price: 85000
                          };
                          setNewBookingForm({
                            packageSelectionType: 'existing',
                            selectedPackageId: firstPkg.packageId,
                            packageId: `PKG-${701 + bookingList.length}`,
                            packageName: firstPkg.packageName,
                            destination: firstPkg.destination || firstPkg.country || 'Bali, Indonesia',
                            duration: firstPkg.duration || `${firstPkg.days} Days / ${firstPkg.nights} Nights`,
                            days: firstPkg.days || 6,
                            nights: firstPkg.nights || 5,
                            customerName: viewingTraveler.applicantName,
                            contactDetails: viewingTraveler.mobileNumber || '',
                            email: viewingTraveler.email || '',
                            bookingDate: '2026-10-10',
                            departureDate: '2026-11-20',
                            totalPrice: firstPkg.price || 85000,
                            paidAmount: firstPkg.price || 85000,
                            status: 'Active',
                            paymentType: 'Prepaid',
                            paymentStatus: 'Paid',
                            caseOfficerName: staffList.find(s => s.role.toLowerCase().includes('holiday'))?.name || staffList[0]?.name || 'Priya Singh',
                            caseOfficerId: staffList.find(s => s.role.toLowerCase().includes('holiday'))?.employeeId || staffList[0]?.employeeId || 'CO-102',
                            notes: ''
                          });
                          setShowAddBookingModal(true);
                        };

                        return (
                          <div className="section-box">
                            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div className="section-title">Holiday / Tour Booking History ({trvBookings.length} Total)</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Format:</span>
                                <button
                                  className={`btn btn-sm ${travelerHolidayViewMode === 'table' ? 'btn-primary' : ''}`}
                                  onClick={() => setTravelerHolidayViewMode('table')}
                                >
                                  ☰ Table
                                </button>

                                <button
                                  className={`btn btn-sm ${travelerHolidayViewMode === 'kanban' ? 'btn-primary' : ''}`}
                                  onClick={() => setTravelerHolidayViewMode('kanban')}
                                >
                                  ☷ Kanban
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={openAddBookingModal}>
                                  + Add Booking
                                </button>
                              </div>
                            </div>

                            {/* 1. TABLE VIEW */}
                            {travelerHolidayViewMode === 'table' && (
                              <div className="table-container">
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
                                    {trvBookings.map(bk => (
                                      <tr key={bk.packageId}>
                                        <td className="font-mono"><strong>{bk.packageId}</strong></td>
                                        <td>{bk.packageName}</td>
                                        <td>{bk.destination}</td>
                                        <td>{bk.duration}</td>
                                        <td>{bk.bookingDate}</td>
                                        <td>{bk.departureDate}</td>
                                        <td className="font-mono">₹{bk.totalPrice?.toLocaleString()}</td>
                                        <td><span className="status-badge">{bk.status}</span></td>
                                        <td className="action-cell">
                                          <button className="btn btn-sm btn-primary" onClick={() => setViewingBookingDetails(bk)}>View Details &rarr;</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* 2. CARD VIEW */}
                            {travelerHolidayViewMode === 'card' && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '12px' }}>
                                {trvBookings.map(bk => (
                                  <div key={bk.packageId} className="company-card" style={{ padding: '14px', border: '1px solid #000', backgroundColor: '#fff' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                      <div>
                                        <span className="font-mono" style={{ fontWeight: 'bold', fontSize: '13px' }}>{bk.packageId}</span>
                                        <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{bk.packageName}</div>
                                      </div>
                                      <span className="status-badge" style={{ fontSize: '10px' }}>{bk.status}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#333', display: 'grid', gap: '4px', marginBottom: '10px' }}>
                                      <div><strong>Destination:</strong> {bk.destination}</div>
                                      <div><strong>Duration:</strong> {bk.duration}</div>
                                      <div><strong>Departure:</strong> {bk.departureDate} (Booked: {bk.bookingDate})</div>
                                      <div><strong>Total Price:</strong> <span className="font-mono" style={{ fontWeight: 'bold' }}>₹{bk.totalPrice?.toLocaleString()}</span></div>
                                    </div>
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => setViewingBookingDetails(bk)}
                                      >
                                        View Details &rarr;
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 3. KANBAN VIEW */}
                            {travelerHolidayViewMode === 'kanban' && (
                              <div className="kanban-board-container" style={{ marginTop: '12px', overflowX: 'auto' }}>
                                <div className="kanban-columns-grid" style={{ gridTemplateColumns: 'repeat(6, minmax(220px, 1fr))' }}>
                                  {holidayStages.map(col => {
                                    const colBookings = trvBookings.filter(b => {
                                      const st = (b.stage || b.status || '').toLowerCase().replace(/\s+/g, '-');
                                      if (col.id === 'stage-1') return st.includes('created') || st.includes('stage-1');
                                      if (col.id === 'stage-2') return st.includes('itinerary') || st.includes('stage-2');
                                      if (col.id === 'stage-3') return st.includes('voucher') || st.includes('confirm') || st.includes('stage-3');
                                      if (col.id === 'stage-4') return st.includes('progress') || st.includes('stage-4');
                                      if (col.id === 'completed') return st.includes('complete');
                                      if (col.id === 'cancelled') return st.includes('cancel');
                                      return false;
                                    });
                                    const isOver = dragOverTrvBookingCol === col.id;
                                    return (
                                      <div
                                        key={col.id}
                                        className={`kanban-column ${isOver ? 'kanban-column-drop-active' : ''}`}
                                        onDragOver={e => { e.preventDefault(); setDragOverTrvBookingCol(col.id); }}
                                        onDragLeave={() => setDragOverTrvBookingCol(null)}
                                        onDrop={e => {
                                          e.preventDefault();
                                          setDragOverTrvBookingCol(null);
                                          if (draggedTrvBookingId) {
                                            setBookingList(prev => prev.map(b => b.packageId === draggedTrvBookingId ? {
                                              ...b,
                                              stage: col.id,
                                              status: col.name
                                            } : b));
                                            setDraggedTrvBookingId(null);
                                          }
                                        }}
                                      >
                                        <div className="kanban-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                                          <div className="kanban-column-title">
                                            <span>{col.name}</span>
                                            <span className="kanban-count-pill">{colBookings.length}</span>
                                          </div>
                                          <div className="kanban-column-desc">{col.desc}</div>
                                        </div>
                                        <div className="kanban-cards-list">
                                          {colBookings.length === 0 ? (
                                            <div className="kanban-empty-column">No bookings</div>
                                          ) : (
                                            colBookings.map(bk => (
                                              <div
                                                key={bk.packageId}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={e => {
                                                  setDraggedTrvBookingId(bk.packageId);
                                                  e.dataTransfer.effectAllowed = 'move';
                                                }}
                                              >
                                                <div className="kanban-card-header">
                                                  <span className="kanban-lead-id">{bk.packageId}</span>
                                                  <span className="status-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>{bk.destination}</span>
                                                </div>
                                                <div className="kanban-card-body" onClick={() => setViewingBookingDetails(bk)} style={{ cursor: 'pointer' }}>
                                                  <div className="kanban-lead-name">{bk.packageName}</div>
                                                  <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                                                    ⏳ {bk.duration}
                                                  </div>
                                                  <div style={{ fontSize: '10px', color: '#777', marginTop: '2px' }}>
                                                    🛫 Dept: {bk.departureDate}
                                                  </div>
                                                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                                    <span className="nav-badge" style={{ fontSize: '9px' }}>₹{bk.totalPrice?.toLocaleString()}</span>
                                                    <span className="nav-badge" style={{ fontSize: '9px' }}>{bk.status}</span>
                                                  </div>
                                                </div>
                                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '6px', marginTop: '6px' }}>
                                                  <button
                                                    className="btn btn-sm btn-primary"
                                                    style={{ width: '100%', fontSize: '10px', padding: '3px 6px' }}
                                                    onClick={() => setViewingBookingDetails(bk)}
                                                  >
                                                    View Details &rarr;
                                                  </button>
                                                </div>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* 5. VISA SERVICES — KANBAN PIPELINE */}
              {activeTab === 'visa' && (
                <VisaKanban
                  visaList={visaList}
                  onUpdateVisa={handleUpdateVisa}
                  staffMembers={mockStaffMembers}
                  onViewDetails={(visa) => {
                    setViewingVisaDetails(visa);
                    if (visa.documents?.length) setVisaDocsList(visa.documents);
                  }}
                />
              )}

              {/* 6. BOOKING SERVICES / HOLIDAY KANBAN */}
              {activeTab === 'booking' && (
                <HolidayKanban
                  bookingList={bookingList}
                  onUpdateBooking={(updated) => setBookingList(bookingList.map(b => b.packageId === updated.packageId ? updated : b))}
                  onAddBooking={() => {
                    const firstPkg = holidayPackagesList[0] || {
                      packageId: 'PKG-701',
                      packageName: 'Bali Island Beach Getaway',
                      destination: 'Bali, Indonesia',
                      duration: '6 Days / 5 Nights',
                      days: 6,
                      nights: 5,
                      price: 85000
                    };
                    setNewBookingForm({
                      packageSelectionType: 'existing',
                      selectedPackageId: firstPkg.packageId,
                      packageId: `PKG-${701 + bookingList.length}`,
                      packageName: firstPkg.packageName,
                      destination: firstPkg.destination || firstPkg.country || 'Bali, Indonesia',
                      duration: firstPkg.duration || `${firstPkg.days} Days / ${firstPkg.nights} Nights`,
                      days: firstPkg.days || 6,
                      nights: firstPkg.nights || 5,
                      customerName: '',
                      contactDetails: '',
                      email: '',
                      bookingDate: '2026-10-10',
                      departureDate: '2026-11-20',
                      totalPrice: firstPkg.price || 85000,
                      paidAmount: firstPkg.price || 85000,
                      status: 'Booking Created',
                      paymentType: 'Prepaid',
                      paymentStatus: 'Paid',
                      caseOfficerName: staffList.find(s => s.role.toLowerCase().includes('holiday'))?.name || staffList[0]?.name || 'Priya Singh',
                      caseOfficerId: staffList.find(s => s.role.toLowerCase().includes('holiday'))?.employeeId || staffList[0]?.employeeId || 'CO-102',
                      notes: ''
                    });
                    setShowAddBookingModal(true);
                  }}
                  onViewDetails={(bk) => setViewingBookingDetails(bk)}
                  onExtendBooking={(bk) => { setSelectedBooking(bk); setShowExtendBookingModal(true); }}
                  staffMembers={staffList}
                />
              )}

              {/* 7. FINANCE & MULTIPLE PAYMENT MANAGEMENT */}
              {activeTab === 'revenue' && (
                <div>
                  {/* Finance Header & KPI Strip */}
                  <div className="section-box" style={{ marginBottom: '16px' }}>
                    <div className="section-header" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>Finance &amp; Payment Management</span>
                          <span className="nav-badge" style={{ fontSize: '11px', textTransform: 'none' }}>
                            {visaPaymentsList.length + bookingPaymentsList.length} Payment Entries
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                          Manage multiple payment entries, prepaid &amp; postpaid orders, and installment collections.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setNewPaymentForm({
                              serviceCategory: 'visa',
                              selectedCaseId: visaList[0]?.id || 'VISA-301',
                              amount: 10000,
                              type: 'Prepaid',
                              mode: 'Bank Transfer',
                              date: new Date().toISOString().split('T')[0],
                              ref: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                              status: 'Completed'
                            });
                            setShowAddPaymentModal(true);
                          }}
                        >
                          + Add Payment Entry
                        </button>
                        <button className="btn btn-sm" onClick={() => alert('Exporting Financial Report to Excel...')}>Export Excel</button>
                        <button className="btn btn-sm" onClick={() => alert('Exporting Financial Invoices to PDF...')}>Export PDF</button>
                      </div>
                    </div>

                    {/* Financial Summary Cards */}
                    <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
                      <div className="card">
                        <div className="card-title">Total Collected (Paid)</div>
                        <div className="card-value" style={{ color: '#16a34a' }}>
                          ₹{(visaPaymentsList.reduce((s, p) => s + (Number(p.amount) || 0), 0) + bookingPaymentsList.reduce((s, p) => s + (Number(p.amount) || 0), 0)).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          Across {visaPaymentsList.length + bookingPaymentsList.length} recorded payments
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-title">Pending Balance (Postpaid)</div>
                        <div className="card-value" style={{ color: '#dc2626' }}>
                          ₹{(
                            visaList.reduce((s, v) => s + Math.max(0, (v.totalAmount || 0) - (v.paidAmount || 0)), 0) +
                            bookingList.reduce((s, b) => s + Math.max(0, (b.totalPrice || 0) - (b.paidAmount || 0)), 0)
                          ).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          Awaiting installment clearances
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-title">Total Invoiced Order Value</div>
                        <div className="card-value">
                          ₹{(
                            visaList.reduce((s, v) => s + (v.totalAmount || 0), 0) +
                            bookingList.reduce((s, b) => s + (b.totalPrice || 0), 0)
                          ).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          {visaList.length} Visa cases + {bookingList.length} Holiday bookings
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-title">Order Category Split</div>
                        <div className="card-value" style={{ fontSize: '18px' }}>
                          {visaList.filter(v => v.paymentType === 'Prepaid').length + bookingList.filter(b => b.paymentType === 'Prepaid').length} Prepaid / {visaList.filter(v => v.paymentType === 'Postpaid').length + bookingList.filter(b => b.paymentType === 'Postpaid').length} Postpaid
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          Prepaid vs Postpaid payment schemes
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs Selector */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #000', paddingBottom: '0px' }}>
                      <button
                        className={`btn btn-sm ${financeSubTab === 'payments' ? 'btn-primary' : ''}`}
                        style={{ borderRadius: '0', borderBottom: 'none' }}
                        onClick={() => setFinanceSubTab('payments')}
                      >
                        💳 Multiple Payment Entries ({visaPaymentsList.length + bookingPaymentsList.length})
                      </button>
                      <button
                        className={`btn btn-sm ${financeSubTab === 'prepaid' ? 'btn-primary' : ''}`}
                        style={{ borderRadius: '0', borderBottom: 'none' }}
                        onClick={() => setFinanceSubTab('prepaid')}
                      >
                        📥 Prepaid Orders ({visaList.filter(v => v.paymentType === 'Prepaid').length + bookingList.filter(b => b.paymentType === 'Prepaid').length})
                      </button>
                      <button
                        className={`btn btn-sm ${financeSubTab === 'postpaid' ? 'btn-primary' : ''}`}
                        style={{ borderRadius: '0', borderBottom: 'none' }}
                        onClick={() => setFinanceSubTab('postpaid')}
                      >
                        ⏳ Postpaid Orders &amp; Balances ({visaList.filter(v => v.paymentType === 'Postpaid').length + bookingList.filter(b => b.paymentType === 'Postpaid').length})
                      </button>
                      <button
                        className={`btn btn-sm ${financeSubTab === 'transactions' ? 'btn-primary' : ''}`}
                        style={{ borderRadius: '0', borderBottom: 'none' }}
                        onClick={() => setFinanceSubTab('transactions')}
                      >
                        📄 Invoices &amp; Transaction Log ({mockTransactions.length})
                      </button>
                    </div>
                  </div>

                  {/* ── SUB-TAB 1: MULTIPLE PAYMENT ENTRIES ── */}
                  {financeSubTab === 'payments' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">All Multiple Payment Entries (Receipts Ledger)</div>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setNewPaymentForm({
                              serviceCategory: 'visa',
                              selectedCaseId: visaList[0]?.id || 'VISA-301',
                              amount: 5000,
                              type: 'Prepaid',
                              mode: 'Bank Transfer',
                              date: new Date().toISOString().split('T')[0],
                              ref: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                              status: 'Completed'
                            });
                            setShowAddPaymentModal(true);
                          }}
                        >
                          + Add Payment Entry
                        </button>
                      </div>

                      {/* Filters Toolbar */}
                      <div className="toolbar" style={{ flexWrap: 'wrap', gap: '10px' }}>
                        <div className="filter-group">
                          <label>Service Type:</label>
                          <select value={financeServiceFilter} onChange={e => setFinanceServiceFilter(e.target.value)}>
                            <option value="All">All Services</option>
                            <option value="Visa">Visa Services</option>
                            <option value="Holiday">Holiday Bookings</option>
                          </select>
                        </div>
                        <div className="filter-group">
                          <label>Payment Mode:</label>
                          <select value={financeModeFilter} onChange={e => setFinanceModeFilter(e.target.value)}>
                            <option value="All">All Modes</option>
                            <option value="UPI / NetBanking">UPI / NetBanking</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Credit / Debit Card">Credit / Debit Card</option>
                            <option value="Cash">Cash</option>
                          </select>
                        </div>
                        <div className="filter-group">
                          <label>Search:</label>
                          <input
                            type="text"
                            placeholder="Search payment ID, case#, client, TXN..."
                            value={financeSearchQuery}
                            onChange={e => setFinanceSearchQuery(e.target.value)}
                            style={{ width: '260px' }}
                          />
                          {(financeServiceFilter !== 'All' || financeModeFilter !== 'All' || financeSearchQuery) && (
                            <button
                              className="btn btn-sm"
                              onClick={() => {
                                setFinanceServiceFilter('All');
                                setFinanceModeFilter('All');
                                setFinanceSearchQuery('');
                              }}
                            >
                              ✕ Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Payment Entries Table */}
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Payment ID</th>
                              <th>Case / Order Ref</th>
                              <th>Client Name</th>
                              <th>Service</th>
                              <th>Order Type</th>
                              <th>Payment Mode</th>
                              <th>Amount (₹)</th>
                              <th>Date</th>
                              <th>TXN Reference</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const combined = [
                                ...visaPaymentsList.map(p => ({ ...p, service: 'Visa' })),
                                ...bookingPaymentsList.map(p => ({ ...p, service: 'Holiday' }))
                              ];
                              const filtered = combined.filter(p => {
                                if (financeServiceFilter !== 'All' && p.service !== financeServiceFilter) return false;
                                if (financeModeFilter !== 'All' && p.mode !== financeModeFilter) return false;
                                if (financeSearchQuery.trim()) {
                                  const q = financeSearchQuery.toLowerCase();
                                  const fields = [p.id, p.caseId, p.clientName, p.ref, p.mode, p.type, p.service];
                                  if (!fields.some(f => (f || '').toLowerCase().includes(q))) return false;
                                }
                                return true;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                                      No payment entries found matching your filter criteria.
                                    </td>
                                  </tr>
                                );
                              }

                              return filtered.map(pay => (
                                <tr key={pay.id}>
                                  <td className="font-mono"><strong>{pay.id}</strong></td>
                                  <td className="font-mono">
                                    <span style={{ fontWeight: '600', color: pay.service === 'Visa' ? '#2563eb' : '#059669' }}>
                                      {pay.caseId || '—'}
                                    </span>
                                  </td>
                                  <td><strong>{pay.clientName || 'Direct Client'}</strong></td>
                                  <td>
                                    <span className="kanban-type-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                      {pay.service === 'Visa' ? '🛂 Visa' : '🌴 Holiday'}
                                    </span>
                                  </td>
                                  <td><span className="status-badge" style={{ fontSize: '9px' }}>{pay.type}</span></td>
                                  <td>{pay.mode}</td>
                                  <td className="font-mono" style={{ fontWeight: '700' }}>₹{Number(pay.amount).toLocaleString()}</td>
                                  <td>{pay.date}</td>
                                  <td className="font-mono" style={{ fontSize: '11px' }}>{pay.ref}</td>
                                  <td><span className="status-badge" style={{ fontSize: '10px' }}>{pay.status || 'Completed'}</span></td>
                                  <td className="action-cell">
                                    <button className="btn btn-sm" onClick={() => alert(`Downloading payment receipt for ${pay.id} (${pay.ref})`)}>Receipt</button>
                                    <button className="btn btn-sm" onClick={() => setEditingPayment({ ...pay })}>Edit</button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete payment entry ${pay.id}?`)) {
                                          if (pay.service === 'Visa') {
                                            setVisaPaymentsList(visaPaymentsList.filter(p => p.id !== pay.id));
                                          } else {
                                            setBookingPaymentsList(bookingPaymentsList.filter(p => p.id !== pay.id));
                                          }
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── SUB-TAB 2: PREPAID ORDERS ── */}
                  {financeSubTab === 'prepaid' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div>
                          <div className="section-title">Prepaid Orders (100% Upfront Advance)</div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            Orders where the client settled the entire billing amount upfront.
                          </div>
                        </div>
                      </div>

                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Case ID</th>
                              <th>Customer Name</th>
                              <th>Service Type</th>
                              <th>Package / Visa Category</th>
                              <th>Total Amount</th>
                              <th>Paid Amount</th>
                              <th>Payment Status</th>
                              <th>Payment Ref</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ...visaList.filter(v => v.paymentType === 'Prepaid').map(v => ({
                                caseId: v.id,
                                customer: v.applicantName,
                                service: 'Visa',
                                detail: `${v.country} - ${v.visaType}`,
                                total: v.totalAmount,
                                paid: v.paidAmount,
                                status: v.paymentStatus,
                                ref: v.paymentRef || 'TXN-PREPAID'
                              })),
                              ...bookingList.filter(b => b.paymentType === 'Prepaid').map(b => ({
                                caseId: b.packageId,
                                customer: b.customerName,
                                service: 'Holiday',
                                detail: `${b.packageName} (${b.destination})`,
                                total: b.totalPrice,
                                paid: b.paidAmount,
                                status: b.paymentStatus,
                                ref: b.invoiceNo || 'INV-PREPAID'
                              }))
                            ].map(item => (
                              <tr key={item.caseId}>
                                <td className="font-mono"><strong>{item.caseId}</strong></td>
                                <td><strong>{item.customer}</strong></td>
                                <td>
                                  <span className="kanban-type-badge" style={{ fontSize: '9px' }}>
                                    {item.service === 'Visa' ? '🛂 Visa' : '🌴 Holiday'}
                                  </span>
                                </td>
                                <td>{item.detail}</td>
                                <td className="font-mono">₹{Number(item.total).toLocaleString()}</td>
                                <td className="font-mono" style={{ color: '#16a34a', fontWeight: '700' }}>₹{Number(item.paid).toLocaleString()}</td>
                                <td><span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>Paid in Full</span></td>
                                <td className="font-mono" style={{ fontSize: '11px' }}>{item.ref}</td>
                                <td className="action-cell">
                                  <button className="btn btn-sm" onClick={() => alert(`Viewing Prepaid Invoice for ${item.caseId}`)}>View Invoice</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── SUB-TAB 3: POSTPAID ORDERS & BALANCES ── */}
                  {financeSubTab === 'postpaid' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div>
                          <div className="section-title">Postpaid Orders &amp; Installments (Pending Balances)</div>
                          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                            Orders operating on milestone partial payments. Click "Record Payment" to log an installment.
                          </div>
                        </div>
                      </div>

                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Case ID</th>
                              <th>Customer Name</th>
                              <th>Service</th>
                              <th>Total Amount</th>
                              <th>Paid So Far</th>
                              <th>Pending Balance</th>
                              <th>Collection Progress</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ...visaList.filter(v => v.paymentType === 'Postpaid').map(v => ({
                                caseId: v.id,
                                customer: v.applicantName,
                                service: 'Visa',
                                total: v.totalAmount,
                                paid: v.paidAmount,
                                pending: Math.max(0, (v.totalAmount || 0) - (v.paidAmount || 0)),
                                status: v.paymentStatus
                              })),
                              ...bookingList.filter(b => b.paymentType === 'Postpaid').map(b => ({
                                caseId: b.packageId,
                                customer: b.customerName,
                                service: 'Holiday',
                                total: b.totalPrice,
                                paid: b.paidAmount,
                                pending: Math.max(0, (b.totalPrice || 0) - (b.paidAmount || 0)),
                                status: b.paymentStatus
                              }))
                            ].map(item => {
                              const pct = item.total > 0 ? Math.round((item.paid / item.total) * 100) : 0;
                              return (
                                <tr key={item.caseId}>
                                  <td className="font-mono"><strong>{item.caseId}</strong></td>
                                  <td><strong>{item.customer}</strong></td>
                                  <td>
                                    <span className="kanban-type-badge" style={{ fontSize: '9px' }}>
                                      {item.service === 'Visa' ? '🛂 Visa' : '🌴 Holiday'}
                                    </span>
                                  </td>
                                  <td className="font-mono">₹{Number(item.total).toLocaleString()}</td>
                                  <td className="font-mono" style={{ color: '#16a34a', fontWeight: '600' }}>₹{Number(item.paid).toLocaleString()}</td>
                                  <td className="font-mono" style={{ color: '#dc2626', fontWeight: '700' }}>₹{Number(item.pending).toLocaleString()}</td>
                                  <td style={{ minWidth: '150px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                                      <span>{pct}%</span>
                                      <span style={{ color: item.pending > 0 ? '#dc2626' : '#16a34a' }}>
                                        {item.pending > 0 ? `₹${item.pending.toLocaleString()} due` : 'Cleared'}
                                      </span>
                                    </div>
                                    <div style={{ background: '#e5e7eb', height: '6px', borderRadius: '3px' }}>
                                      <div style={{ width: `${pct}%`, background: pct >= 100 ? '#16a34a' : '#f59e0b', height: '6px', borderRadius: '3px' }} />
                                    </div>
                                  </td>
                                  <td><span className="status-badge">{item.status || 'Partial'}</span></td>
                                  <td className="action-cell">
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() => {
                                        setNewPaymentForm({
                                          serviceCategory: item.service.toLowerCase(),
                                          selectedCaseId: item.caseId,
                                          amount: item.pending || 5000,
                                          type: 'Postpaid',
                                          mode: 'Bank Transfer',
                                          date: new Date().toISOString().split('T')[0],
                                          ref: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                                          status: 'Completed'
                                        });
                                        setShowAddPaymentModal(true);
                                      }}
                                    >
                                      + Record Installment
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── SUB-TAB 4: TRANSACTION LOG & INVOICES ── */}
                  {financeSubTab === 'transactions' && (
                    <div className="section-box">
                      <div className="section-header">
                        <div className="section-title">Revenue &amp; Invoice Transaction Log</div>
                        <div className="toolbar" style={{ margin: 0 }}>
                          <button className="btn btn-sm" onClick={() => alert('Exporting to Excel...')}>Export Excel</button>
                          <button className="btn btn-sm" onClick={() => alert('Exporting to PDF...')}>Export PDF</button>
                        </div>
                      </div>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Transaction ID</th>
                              <th>Application Name</th>
                              <th>Customer Name</th>
                              <th>Transaction Type</th>
                              <th>Amount</th>
                              <th>Payment Type</th>
                              <th>Transaction Date</th>
                              <th>Invoice</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockTransactions.map(txn => (
                              <tr key={txn.id}>
                                <td className="font-mono"><strong>{txn.id}</strong></td>
                                <td>{txn.applicationName}</td>
                                <td>{txn.customerName}</td>
                                <td>{txn.transactionType}</td>
                                <td className="font-mono">₹{txn.amount.toLocaleString()}</td>
                                <td>{txn.paymentType}</td>
                                <td>{txn.transactionDate}</td>
                                <td className="font-mono">{txn.invoice}</td>
                                <td className="action-cell">
                                  <button className="btn btn-sm" onClick={() => alert(`Downloading Invoice ${txn.invoice}`)}>Download</button>
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

              {/* 8. REPORTS & ANALYTICS */}
              {activeTab === 'reports' && (
                <div>
                  <div className="section-header">
                    <h2>Reports & Analytics (Business Insights)</h2>
                    <div className="filter-group">
                      <label>Filter:</label>
                      <select><option>Today</option><option>This Week</option><option defaultValue>This Month</option><option>This Year</option><option>Custom Date Range</option></select>
                    </div>
                  </div>
                  <div className="grid-cards">
                    <div className="card">
                      <div className="card-title">Approval Rate</div>
                      <div className="card-value">{mockReportsMetrics.approvalRate}</div>
                    </div>
                    <div className="card">
                      <div className="card-title">Avg Application Cycle</div>
                      <div className="card-value">{mockReportsMetrics.avgApplicationCycle}</div>
                    </div>
                    <div className="card">
                      <div className="card-title">Conversion Rate</div>
                      <div className="card-value">{mockReportsMetrics.customerConversionRate}</div>
                    </div>
                    <div className="card">
                      <div className="card-title">Total Revenue</div>
                      <div className="card-value">{mockReportsMetrics.totalRevenue}</div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="section-box">
                      <div className="section-title">Leads & Applications Summary</div>
                      <p style={{ fontSize: '13px', marginTop: '10px' }}>Visa Applications: <strong>{mockReportsMetrics.visaApplications}</strong></p>
                      <p style={{ fontSize: '13px' }}>Holiday Applications: <strong>{mockReportsMetrics.holidayApplications}</strong></p>
                      <p style={{ fontSize: '13px' }}>Total Leads Received: <strong>{mockReportsMetrics.totalLeads}</strong></p>
                      <p style={{ fontSize: '13px' }}>Converted Leads: <strong>{mockReportsMetrics.convertedLeads}</strong></p>
                    </div>
                    <div className="section-box">
                      <div className="section-title">Application Status Distribution</div>
                      <p style={{ fontSize: '13px', marginTop: '10px' }}>Completed Applications: <strong>{mockReportsMetrics.completedApplications}</strong></p>
                      <p style={{ fontSize: '13px' }}>Pending Applications: <strong>{mockReportsMetrics.pendingApplications}</strong></p>
                      <p style={{ fontSize: '13px' }}>Rejected Applications: <strong>{mockReportsMetrics.rejectedApplications}</strong></p>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. ROLES & PERMISSIONS */}
              {activeTab === 'roles' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Roles & Permissions (Staff Management)</div>
                    <div>
                      <button className="btn btn-sm mr-2" onClick={() => setShowAssignModal(true)}>Application Assignment Flow</button>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddMemberModal(true)}>+ Add Member</button>
                    </div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map(mem => (
                          <tr key={mem.employeeId}>
                            <td className="font-mono"><strong>{mem.employeeId}</strong></td>
                            <td>{mem.name}</td>
                            <td>{mem.email}</td>
                            <td>{mem.role}</td>
                            <td>{mem.department}</td>
                            <td><span className="status-badge">{mem.status}</span></td>
                            <td className="action-cell">
                              <button className="btn btn-sm btn-primary" onClick={() => setSelectedMember(mem)}>View Member</button>
                              <button className="btn btn-sm" onClick={() => setEditingMember({ ...mem })}>Edit</button>
                              <button className="btn btn-sm" onClick={() => {
                                setStaffList(staffList.map(s => s.employeeId === mem.employeeId ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s));
                              }}>
                                {mem.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 10. REVIEWS & RATINGS */}
              {activeTab === 'reviews' && (
                <div className="section-box">
                  <div className="section-header">
                    <div className="section-title">Reviews & Ratings Management</div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>Booking/App ID</th>
                          <th>Package Name</th>
                          <th>Destination</th>
                          <th>Rating</th>
                          <th>Review Text</th>
                          <th>Date</th>
                          <th>CRM Status</th>
                          <th>Website Sync</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockReviews.map(rev => (
                          <tr key={rev.id}>
                            <td><strong>{rev.customerName}</strong></td>
                            <td className="font-mono">{rev.bookingId}</td>
                            <td>{rev.packageName}</td>
                            <td>{rev.destination}</td>
                            <td>{'★'.repeat(rev.rating)} ({rev.rating}/5)</td>
                            <td>"{rev.review}"</td>
                            <td>{rev.date}</td>
                            <td><span className="status-badge">{rev.status}</span></td>
                            <td><span className="status-badge">{rev.webStatus}</span></td>
                            <td className="action-cell">
                              <button className="btn btn-sm" onClick={() => alert(`Publishing review ${rev.id} to website`)}>Publish to Website</button>
                              <button className="btn btn-sm btn-danger" onClick={() => alert(`Hiding review ${rev.id} from website`)}>Hide from Website</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 11. VISA MASTER - Visa Packages & Countries */}
              {activeTab === 'visa-master' && (
                <div>
                  <div className="section-box">
                    <div className="section-header">
                      <div>
                        <div className="section-title">Visa Packages &amp; Countries Offered ({countriesList.length} Countries)</div>
                        <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>Manage visa-eligible countries, processing times, fees, and required documents</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddCountryVisaModal(true)}>
                        + Add Visa Country
                      </button>
                    </div>

                    {/* Country Cards & Table */}
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
                                <button className="btn btn-sm" onClick={() => setEditingCountryVisa({ ...c })}>Edit</button>
                                <button className="btn btn-sm" onClick={() => {
                                  setCountriesList(countriesList.map(item => item.countryCode === c.countryCode ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item));
                                }}>
                                  {c.status === 'Active' ? 'Deactivate' : 'Activate'}
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

              {/* 12. HOLIDAY MASTER - Holiday & Tour Packages */}
              {activeTab === 'holiday-master' && (
                <div>
                  <div className="section-box">
                    <div className="section-header">
                      <div>
                        <div className="section-title">Holiday / Tour Packages ({holidayPackagesList.length} Packages)</div>
                        <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>Manage holiday tour packages, destinations, pricing, inclusions, and itineraries</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => setShowAddHolidayPackageModal(true)}>
                        + Add Holiday Package
                      </button>
                    </div>

                    {/* Holiday Package Cards Grid */}
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
                            <div className="action-cell" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                              <button className="btn btn-sm btn-primary" onClick={() => setViewingHolidayPackageDetails(pkg)}>View Details &rarr;</button>
                              <button className="btn btn-sm" onClick={() => setEditingHolidayPackage({ ...pkg })}>Edit</button>
                              <button className="btn btn-sm" onClick={() => {
                                setHolidayPackagesList(holidayPackagesList.map(p => p.packageId === pkg.packageId ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p));
                              }}>
                                {pkg.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS FOR SUPER ADMIN --- */}
      {/* Lead Details / Edit Modal */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">View / Edit Lead: {selectedLead.leadName}</div>
              <button className="close-btn" onClick={() => setSelectedLead(null)}>X</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Lead Name:</label>
                <input
                  type="text"
                  value={selectedLead.leadName || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, leadName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Company Name:</label>
                <input
                  type="text"
                  value={selectedLead.companyName || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, companyName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  value={selectedLead.email || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={selectedLead.phone || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Target Country:</label>
                <input
                  type="text"
                  value={selectedLead.targetCountry || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, targetCountry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Service Required:</label>
                <input
                  type="text"
                  value={selectedLead.serviceRequired || selectedLead.leadType || ''}
                  onChange={e => setSelectedLead({ ...selectedLead, serviceRequired: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Lead Source:</label>
                <select
                  value={selectedLead.source || 'Website'}
                  onChange={e => setSelectedLead({ ...selectedLead, source: e.target.value })}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Staff:</label>
                <select
                  value={selectedLead.assignedStaff || 'Unassigned'}
                  onChange={e => setSelectedLead({ ...selectedLead, assignedStaff: e.target.value })}
                >
                  <option value="Unassigned">Unassigned</option>
                  {mockStaffMembers.map(s => (
                    <option key={s.employeeId} value={s.name}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={selectedLead.status || 'Pending'}
                  onChange={e => setSelectedLead({ ...selectedLead, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="No Response">No Response</option>
                  <option value="Converted">Converted</option>
                  <option value="Rejected/Closed">Rejected/Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Created Date:</label>
                <input
                  type="text"
                  value={selectedLead.createdDate || ''}
                  readOnly
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <div className="form-group mt-2">
              <label>Remarks / Notes:</label>
              <textarea
                value={selectedLead.remarks || 'Client inquiring for family package options.'}
                onChange={e => setSelectedLead({ ...selectedLead, remarks: e.target.value })}
                rows="3"
              ></textarea>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setSelectedLead(null)}>Cancel / Close</button>
              <button className="btn btn-primary" onClick={() => { alert(`Lead "${selectedLead.leadName}" updated successfully!`); setSelectedLead(null); }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}



      {/* Visa Application Details Modal */}
      {selectedVisaApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div className="modal-title">7.1 Visa Application Details - {selectedVisaApp.id}</div>
              <button className="close-btn" onClick={() => setSelectedVisaApp(null)}>X</button>
            </div>

            <div className="section-box">
              <div className="section-title">Applicant Information</div>
              <div className="form-grid mt-4">
                <div><strong>Applicant Name:</strong> {selectedVisaApp.applicantName}</div>
                <div><strong>Country:</strong> {selectedVisaApp.country}</div>
                <div><strong>Visa Type:</strong> {selectedVisaApp.visaType}</div>
                <div><strong>Case Officer:</strong> {selectedVisaApp.caseOfficerName} ({selectedVisaApp.caseOfficerId})</div>
                <div><strong>Application Date:</strong> {selectedVisaApp.applicationDate}</div>
                <div><strong>Current Status:</strong> <span className="status-badge">{selectedVisaApp.status}</span></div>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Document Management</div>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>Uploaded Docs: Passport_Copy.pdf, Bank_Statement_6M.pdf</p>
              <div className="action-cell">
                <button className="btn btn-sm" onClick={() => alert('Viewing document...')}>View Documents</button>
                <button className="btn btn-sm" onClick={() => alert('Add Document option')}>Add Documents</button>
                <button className="btn btn-sm btn-danger" onClick={() => alert('Remove Document')}>Remove Documents</button>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Payment Management</div>
              <div className="form-grid mt-4">
                <div><strong>Payment Type:</strong> {selectedVisaApp.paymentType}</div>
                <div><strong>Total Amount:</strong> ₹{selectedVisaApp.totalAmount.toLocaleString()}</div>
                <div><strong>Paid Amount:</strong> ₹{selectedVisaApp.paidAmount.toLocaleString()}</div>
                <div><strong>Pending Amount:</strong> ₹{selectedVisaApp.pendingAmount.toLocaleString()}</div>
                <div><strong>Payment Status:</strong> {selectedVisaApp.paymentStatus}</div>
                <div><strong>Reference:</strong> {selectedVisaApp.paymentRef}</div>
              </div>
            </div>

            <div className="section-box">
              <div className="section-title">Visa Upload & Action</div>
              <div className="action-cell mt-4">
                <button className="btn btn-sm btn-primary" onClick={() => alert('Uploading Visa Document')}>Upload Visa</button>
                <button className="btn btn-sm" onClick={() => alert('Viewing Visa Document')}>View Visa</button>
                <button className="btn btn-sm" onClick={() => alert('Downloading Visa Document')}>Download Visa</button>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn" onClick={() => setSelectedVisaApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Booking Duration Modal */}
      {showExtendBookingModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">8.2 Extend Booking Duration - {selectedBooking.packageId}</div>
              <button className="close-btn" onClick={() => setShowExtendBookingModal(false)}>X</button>
            </div>
            <p style={{ fontSize: '12px', marginBottom: '12px' }}>
              Existing booking: <strong>{selectedBooking.duration}</strong> &bull; Current Price: <strong>₹{selectedBooking.totalPrice.toLocaleString()}</strong>
            </p>
            <div className="form-group">
              <label>Additional Days:</label>
              <input type="number" value={extendForm.days} onChange={e => setExtendForm({ ...extendForm, days: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Additional Nights:</label>
              <input type="number" value={extendForm.nights} onChange={e => setExtendForm({ ...extendForm, nights: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Additional Charges (₹):</label>
              <input type="number" value={extendForm.charges} onChange={e => setExtendForm({ ...extendForm, charges: Number(e.target.value) })} />
            </div>
            <div className="section-box" style={{ background: '#f5f5f5' }}>
              <div><strong>Updated Total Amount:</strong> ₹{(selectedBooking.totalPrice + extendForm.charges).toLocaleString()}</div>
            </div>
            <div className="form-group">
              <label>Remarks:</label>
              <textarea value={extendForm.remarks} onChange={e => setExtendForm({ ...extendForm, remarks: e.target.value })} rows="2"></textarea>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowExtendBookingModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (selectedBooking) {
                  const newDays = Number(selectedBooking.days || 0) + Number(extendForm.days || 0);
                  const newNights = Number(selectedBooking.nights || 0) + Number(extendForm.nights || 0);
                  const newTotal = Number(selectedBooking.totalPrice || 0) + Number(extendForm.charges || 0);
                  const updated = {
                    ...selectedBooking,
                    days: newDays,
                    nights: newNights,
                    duration: `${newDays} Days / ${newNights} Nights`,
                    totalPrice: newTotal
                  };
                  setBookingList(bookingList.map(b => b.packageId === selectedBooking.packageId ? updated : b));
                  if (viewingBookingDetails && viewingBookingDetails.packageId === selectedBooking.packageId) {
                    setViewingBookingDetails(updated);
                  }
                }
                alert('Booking duration extended and payment updated!');
                setShowExtendBookingModal(false);
              }}>Calculate & Save Extension</button>
            </div>
          </div>
        </div>
      )}

      {/* Application Assignment Flow Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div className="modal-title">Application Assignment Flow</div>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>X</button>
            </div>
            <p style={{ fontSize: '12px', marginBottom: '16px' }}>Flow: Select Application &rarr; Select Case Officer &rarr; Assign Task & Responsibilities</p>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>1. Select Case:</label>
              <select value={assignForm.appId} onChange={e => setAssignForm({ ...assignForm, appId: e.target.value })}>
                {visaList.map(v => <option key={v.id} value={v.id}>{v.id} - {v.applicantName} ({v.country} - {v.visaType})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>2. Select Staff Member / Case Officer:</label>
              <select value={assignForm.staffId} onChange={e => setAssignForm({ ...assignForm, staffId: e.target.value })}>
                {staffList.map(s => <option key={s.employeeId} value={s.employeeId}>{s.employeeId} - {s.name} ({s.department} / {s.role})</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>4. Specific Task Instructions / Responsibilities:</label>
              <textarea
                rows="2"
                placeholder="Enter specific work or task he will perform for this application..."
                value={assignForm.taskNotes}
                onChange={e => setAssignForm({ ...assignForm, taskNotes: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert(`Assigned Application ${assignForm.appId} to ${assignForm.staffId}!\nAssigned Task: "${assignForm.task}"`);
                setShowAssignModal(false);
              }}>Assign Application & Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Add New Lead</div>
              <button className="close-btn" onClick={() => setShowAddLeadModal(false)}>X</button>
            </div>
            <div className="form-group"><label>Lead Name:</label><input type="text" placeholder="e.g. Ramesh Sharma" /></div>
            <div className="form-group"><label>Company Name:</label><input type="text" placeholder="e.g. TechCorp (or Individual)" /></div>
            <div className="form-group"><label>Email ID:</label><input type="email" placeholder="ramesh@example.com" /></div>
            <div className="form-group"><label>Phone Number:</label><input type="text" placeholder="+91 98765 43210" /></div>
            <div className="form-group"><label>Target Country:</label><input type="text" placeholder="e.g. United States / France" /></div>
            <div className="form-group">
              <label>Lead Type:</label>
              <select><option>Visa</option><option>Holiday</option></select>
            </div>
            <div className="form-group">
              <label>Source:</label>
              <select><option>Website</option><option>Referral</option><option>Other</option></select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select><option>Pending</option><option>In Progress</option><option>No Response</option><option>Converted</option><option>Rejected/Closed</option></select>
            </div>
            <div className="form-group">
              <label>Remarks / Notes:</label>
              <textarea rows="2" placeholder="Customer inquiry notes..."></textarea>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowAddLeadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('New Lead Added Successfully!'); setShowAddLeadModal(false); }}>Save Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Edit Company Details: {editingCompany.companyName}</div>
              <button className="close-btn" onClick={() => setEditingCompany(null)}>X</button>
            </div>
            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                value={editingCompany.companyName || ''}
                onChange={e => setEditingCompany({ ...editingCompany, companyName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Registration Details:</label>
              <input
                type="text"
                value={editingCompany.registrationDetails || ''}
                onChange={e => setEditingCompany({ ...editingCompany, registrationDetails: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact Person:</label>
              <input
                type="text"
                value={editingCompany.contactPerson || ''}
                onChange={e => setEditingCompany({ ...editingCompany, contactPerson: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email ID:</label>
              <input
                type="email"
                value={editingCompany.email || ''}
                onChange={e => setEditingCompany({ ...editingCompany, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                value={editingCompany.phone || ''}
                onChange={e => setEditingCompany({ ...editingCompany, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                value={editingCompany.address || ''}
                onChange={e => setEditingCompany({ ...editingCompany, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                value={editingCompany.country || ''}
                onChange={e => setEditingCompany({ ...editingCompany, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editingCompany.status || 'Active'}
                onChange={e => setEditingCompany({ ...editingCompany, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setEditingCompany(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEditCompany}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Company</div>
              <button className="close-btn" onClick={() => setShowAddCompanyModal(false)}>X</button>
            </div>
            <form onSubmit={handleSaveAddCompany}>
              <div className="form-group">
                <label>Company Name: *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Ltd"
                  value={newCompanyForm.companyName}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registration Details:</label>
                <input
                  type="text"
                  placeholder="REG-2026-XXXX"
                  value={newCompanyForm.registrationDetails}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, registrationDetails: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Person:</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newCompanyForm.contactPerson}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, contactPerson: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  placeholder="company@domain.com"
                  value={newCompanyForm.email}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={newCompanyForm.phone}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  placeholder="Commercial District / City"
                  value={newCompanyForm.address}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input
                  type="text"
                  value={newCompanyForm.country}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, country: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowAddCompanyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Traveler Modal */}
      {editingTraveler && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Traveler Details: {editingTraveler.applicantName} ({editingTraveler.travelerId})</div>
              <button className="close-btn" onClick={() => setEditingTraveler(null)}>X</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Unique Traveler ID:</label>
                <input type="text" value={editingTraveler.travelerId || ''} readOnly style={{ backgroundColor: '#f0f0f0' }} />
              </div>
              <div className="form-group">
                <label>Applicant Name:</label>
                <input
                  type="text"
                  value={editingTraveler.applicantName || ''}
                  onChange={e => setEditingTraveler({ ...editingTraveler, applicantName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  type="text"
                  value={editingTraveler.mobileNumber || ''}
                  onChange={e => setEditingTraveler({ ...editingTraveler, mobileNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  value={editingTraveler.email || ''}
                  onChange={e => setEditingTraveler({ ...editingTraveler, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Country:</label>
                <input
                  type="text"
                  value={editingTraveler.country || ''}
                  onChange={e => setEditingTraveler({ ...editingTraveler, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Passport / Travel Details:</label>
                <input
                  type="text"
                  value={editingTraveler.passport || ''}
                  onChange={e => setEditingTraveler({ ...editingTraveler, passport: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={editingTraveler.status || 'Active'}
                  onChange={e => setEditingTraveler({ ...editingTraveler, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Registration Date:</label>
                <input type="text" value={editingTraveler.registrationDate || ''} readOnly style={{ backgroundColor: '#f0f0f0' }} />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn" onClick={() => setEditingTraveler(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert(`Traveler "${editingTraveler.applicantName}" updated successfully!`); setEditingTraveler(null); }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Traveler Modal */}
      {showAddTravelerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Add New Traveler</div>
              <button className="close-btn" onClick={() => setShowAddTravelerModal(false)}>X</button>
            </div>
            <div className="form-group"><label>Applicant Name:</label><input type="text" placeholder="e.g. Vikramaditya Roy" /></div>
            <div className="form-group"><label>Mobile Number:</label><input type="text" placeholder="+91 99112 23344" /></div>
            <div className="form-group"><label>Email ID:</label><input type="email" placeholder="vikram@example.com" /></div>
            <div className="form-group"><label>Country:</label><input type="text" defaultValue="India" /></div>
            <div className="form-group"><label>Passport Details:</label><input type="text" placeholder="Passport No & Expiry" /></div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowAddTravelerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('New Traveler Added Successfully!'); setShowAddTravelerModal(false); }}>Save Traveler</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visa Application Modal */}
      {showAddVisaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div className="modal-title">+ Add New Visa Application</div>
              <button className="close-btn" onClick={() => setShowAddVisaModal(false)}>X</button>
            </div>

            <div className="form-group">
              <label>Applicant Full Name: *</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={newVisaForm.applicantName}
                onChange={e => setNewVisaForm({ ...newVisaForm, applicantName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  placeholder="e.g. rahul.sharma@example.com"
                  value={newVisaForm.email}
                  onChange={e => setNewVisaForm({ ...newVisaForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newVisaForm.phone}
                  onChange={e => setNewVisaForm({ ...newVisaForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Destination Country: *</label>
                <select
                  value={newVisaForm.country}
                  onChange={e => {
                    const country = e.target.value;
                    const matchedCountry = countriesList.find(c => c.countryName === country || country.includes(c.countryName));
                    const defaultVisaType = matchedCountry && matchedCountry.visaTypes && matchedCountry.visaTypes[0] ? matchedCountry.visaTypes[0].name : 'Tourist C';
                    const defaultFee = matchedCountry ? matchedCountry.startingPrice : 18500;
                    const defaultDocs = matchedCountry && matchedCountry.requiredDocs ? matchedCountry.requiredDocs.map(d => ({ name: d.name, mandatory: d.type || 'Mandatory' })) : [
                      { name: 'Passport (Front & Back Copy)', mandatory: 'Mandatory' },
                      { name: 'Bank Account Statements (Past 6 Months)', mandatory: 'Mandatory' }
                    ];
                    setNewVisaForm({
                      ...newVisaForm,
                      country,
                      visaType: defaultVisaType,
                      totalAmount: defaultFee,
                      documents: defaultDocs
                    });
                  }}
                >
                  <option value="Schengen (France)">Schengen (France)</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="UAE (Dubai)">UAE (Dubai)</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>

              <div className="form-group">
                <label>Visa Category / Type: *</label>
                <input
                  type="text"
                  placeholder="e.g. Tourist C, Standard Visitor, B1/B2"
                  value={newVisaForm.visaType}
                  onChange={e => setNewVisaForm({ ...newVisaForm, visaType: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Passport Number & Expiry:</label>
                <input
                  type="text"
                  placeholder="e.g. Z9847291 (Exp: 2031-05-12)"
                  value={newVisaForm.passport}
                  onChange={e => setNewVisaForm({ ...newVisaForm, passport: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Application Date:</label>
                <input
                  type="date"
                  value={newVisaForm.applicationDate}
                  onChange={e => setNewVisaForm({ ...newVisaForm, applicationDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Assign Case Officer:</label>
                <select
                  value={newVisaForm.caseOfficerId}
                  onChange={e => {
                    const officer = staffList.find(s => s.employeeId === e.target.value);
                    if (officer) {
                      setNewVisaForm({
                        ...newVisaForm,
                        caseOfficerId: officer.employeeId,
                        caseOfficerName: officer.name
                      });
                    }
                  }}
                >
                  {staffList.map(staff => (
                    <option key={staff.employeeId} value={staff.employeeId}>
                      {staff.name} ({staff.employeeId} - {staff.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Application Status:</label>
                <select
                  value={newVisaForm.status}
                  onChange={e => setNewVisaForm({ ...newVisaForm, status: e.target.value })}
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Pending">Pending</option>
                  <option value="Proceed">Proceed</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Payment Method / Type:</label>
                <select
                  value={newVisaForm.paymentType}
                  onChange={e => setNewVisaForm({ ...newVisaForm, paymentType: e.target.value })}
                >
                  <option value="Prepaid">Prepaid (Paid upfront)</option>
                  <option value="Postpaid">Postpaid (Pay later)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Processing Fee (₹):</label>
                <input
                  type="number"
                  value={newVisaForm.totalAmount}
                  onChange={e => setNewVisaForm({ ...newVisaForm, totalAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Required Documents Checklist / Selection */}
            <div style={{ marginTop: '14px', marginBottom: '14px', border: '1px solid #ccc', padding: '12px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
                  Required Documents Checklist ({newVisaForm.documents?.length || 0} Selected):
                </label>
                <span style={{ fontSize: '11px', color: '#555' }}>
                  Select document from dropdown and click "+ Add Document"
                </span>
              </div>

              {/* Document selection row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '8px', alignItems: 'flex-end', marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px' }}>Select Document Name: *</label>
                  <select
                    value={docNameToAdd}
                    onChange={e => setDocNameToAdd(e.target.value)}
                  >
                    <option value="">-- Choose Document Name --</option>
                    {STANDARD_VISA_DOCUMENTS.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                    <option value="CUSTOM">+ Type Other / Custom Document...</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px' }}>Requirement:</label>
                  <select
                    value={docRequirementToAdd}
                    onChange={e => setDocRequirementToAdd(e.target.value)}
                  >
                    <option value="Mandatory">Mandatory</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ height: '34px', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const finalDocName = docNameToAdd === 'CUSTOM' ? customDocNameInput.trim() : docNameToAdd;
                    if (!finalDocName) {
                      alert('Please select or type a document name.');
                      return;
                    }
                    if (newVisaForm.documents?.some(d => d.name.toLowerCase() === finalDocName.toLowerCase())) {
                      alert(`Document "${finalDocName}" is already in the list.`);
                      return;
                    }
                    setNewVisaForm({
                      ...newVisaForm,
                      documents: [...(newVisaForm.documents || []), { name: finalDocName, mandatory: docRequirementToAdd }]
                    });
                    if (docNameToAdd === 'CUSTOM') {
                      setCustomDocNameInput('');
                      setDocNameToAdd(STANDARD_VISA_DOCUMENTS[0]);
                    }
                  }}
                >
                  + Add Document
                </button>
              </div>

              {/* Custom Document Name input if 'CUSTOM' chosen */}
              {docNameToAdd === 'CUSTOM' && (
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px' }}>Enter Custom Document Name: *</label>
                  <input
                    type="text"
                    placeholder="e.g. Police Clearance Certificate, Sponsor Affidavit..."
                    value={customDocNameInput}
                    onChange={e => setCustomDocNameInput(e.target.value)}
                  />
                </div>
              )}

              {/* Documents List */}
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #ddd', background: '#fff' }}>
                {newVisaForm.documents && newVisaForm.documents.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px', width: '30px' }}>#</th>
                        <th style={{ padding: '6px 8px' }}>Document Name</th>
                        <th style={{ padding: '6px 8px', width: '90px' }}>Type</th>
                        <th style={{ padding: '6px 8px', width: '70px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newVisaForm.documents.map((d, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '5px 8px', color: '#666' }}>{idx + 1}.</td>
                          <td style={{ padding: '5px 8px', fontWeight: '500' }}>{d.name}</td>
                          <td style={{ padding: '5px 8px' }}>
                            <span className="status-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {d.mandatory}
                            </span>
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                              onClick={() => {
                                setNewVisaForm({
                                  ...newVisaForm,
                                  documents: newVisaForm.documents.filter((_, i) => i !== idx)
                                });
                              }}
                              title="Remove document"
                            >
                              ✕ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#777', fontSize: '12px' }}>
                    No documents selected yet. Choose a document name above and click <strong>+ Add Document</strong>.
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddVisaModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!newVisaForm.applicantName.trim()) {
                    alert('Please enter applicant name.');
                    return;
                  }
                  const newId = `VISA-${301 + visaList.length}`;
                  const docItems = (newVisaForm.documents && newVisaForm.documents.length > 0)
                    ? newVisaForm.documents.map((d, i) => ({
                      id: i + 1,
                      name: d.name,
                      mandatory: d.mandatory || 'Mandatory',
                      status: 'Pending Verification'
                    }))
                    : [
                      { id: 1, name: 'Passport (Front & Back Copy)', mandatory: 'Mandatory', status: 'Pending Verification' }
                    ];

                  const createdVisa = {
                    id: newId,
                    applicantName: newVisaForm.applicantName.trim(),
                    country: newVisaForm.country,
                    visaType: newVisaForm.visaType,
                    caseOfficerName: newVisaForm.caseOfficerName,
                    caseOfficerId: newVisaForm.caseOfficerId,
                    applicationDate: newVisaForm.applicationDate || '2026-10-10',
                    status: newVisaForm.status,
                    paymentType: newVisaForm.paymentType,
                    totalAmount: Number(newVisaForm.totalAmount) || 18500,
                    paidAmount: newVisaForm.paymentType === 'Prepaid' ? Number(newVisaForm.totalAmount) || 18500 : 0,
                    pendingAmount: newVisaForm.paymentType === 'Prepaid' ? 0 : Number(newVisaForm.totalAmount) || 18500,
                    paymentStatus: newVisaForm.paymentType === 'Prepaid' ? 'Completed' : 'Pending',
                    paymentDate: newVisaForm.applicationDate || '2026-10-10',
                    paymentRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                    documentStatus: `${docItems.length} Docs Required`,
                    documents: docItems
                  };
                  setVisaList([createdVisa, ...visaList]);
                  setShowAddVisaModal(false);
                  setNewVisaForm({
                    applicantName: '',
                    email: '',
                    phone: '',
                    passport: '',
                    country: 'Schengen (France)',
                    visaType: 'Tourist C',
                    caseOfficerName: staffList[0]?.name || 'Amit Verma',
                    caseOfficerId: staffList[0]?.employeeId || 'CO-101',
                    applicationDate: '2026-10-10',
                    status: 'Under Review',
                    paymentType: 'Prepaid',
                    totalAmount: 18500,
                    documents: [
                      { name: 'Passport (Front & Back Copy)', mandatory: 'Mandatory' },
                      { name: 'Flight & Hotel Cover Booking', mandatory: 'Mandatory' },
                      { name: 'Travel Medical Insurance (€30,000 Cover)', mandatory: 'Mandatory' }
                    ]
                  });
                  alert(`Visa Application "${newId}" created successfully for ${createdVisa.applicantName} with ${docItems.length} required documents!`);
                }}
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">+ Add New Holiday / Tour Booking</div>
              <button className="close-btn" onClick={() => setShowAddBookingModal(false)}>X</button>
            </div>

            {/* Package Choice */}
            <div className="form-group">
              <label>Holiday Package: *</label>
              <select
                value={newBookingForm.packageSelectionType === 'custom' ? 'custom' : newBookingForm.selectedPackageId}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setNewBookingForm({
                      ...newBookingForm,
                      packageSelectionType: 'custom',
                      selectedPackageId: 'custom',
                      packageName: '',
                      destination: '',
                      days: 5,
                      nights: 4,
                      duration: '5 Days / 4 Nights',
                      totalPrice: 50000,
                      paidAmount: newBookingForm.paymentType === 'Prepaid' ? 50000 : 0
                    });
                  } else {
                    const matched = holidayPackagesList.find(p => p.packageId === val);
                    if (matched) {
                      setNewBookingForm({
                        ...newBookingForm,
                        packageSelectionType: 'existing',
                        selectedPackageId: matched.packageId,
                        packageName: matched.packageName,
                        destination: matched.destination || matched.country || '',
                        days: matched.days || 6,
                        nights: matched.nights || 5,
                        duration: matched.duration || `${matched.days} Days / ${matched.nights} Nights`,
                        totalPrice: matched.price || 85000,
                        paidAmount: newBookingForm.paymentType === 'Prepaid' ? (matched.price || 85000) : 0
                      });
                    }
                  }
                }}
              >
                {holidayPackagesList.map(pkg => (
                  <option key={pkg.packageId} value={pkg.packageId}>
                    {pkg.packageName} ({pkg.packageId}) &bull; ₹{pkg.price?.toLocaleString()} &bull; {pkg.duration}
                  </option>
                ))}
                <option value="custom">+ Custom / Customized Tour Package</option>
              </select>
            </div>

            {newBookingForm.packageSelectionType === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Custom Tour / Package Name: *</label>
                  <input
                    type="text"
                    placeholder="e.g. Switzerland Scenic Rail Journey"
                    value={newBookingForm.packageName}
                    onChange={e => setNewBookingForm({ ...newBookingForm, packageName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Destination: *</label>
                  <input
                    type="text"
                    placeholder="e.g. Zurich & Lucerne, Switzerland"
                    value={newBookingForm.destination}
                    onChange={e => setNewBookingForm({ ...newBookingForm, destination: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Quick Traveler Select (Optional) */}
            <div className="form-group">
              <label>Select Registered Customer (Optional):</label>
              <select
                onChange={e => {
                  if (!e.target.value) return;
                  const trv = mockTravelers.find(t => t.travelerId === e.target.value);
                  if (trv) {
                    setNewBookingForm({
                      ...newBookingForm,
                      customerName: trv.applicantName,
                      contactDetails: trv.mobileNumber,
                      email: trv.email
                    });
                  }
                }}
                defaultValue=""
              >
                <option value="">-- Choose Existing Traveler or enter manually below --</option>
                {mockTravelers.map(trv => (
                  <option key={trv.travelerId} value={trv.travelerId}>
                    {trv.applicantName} ({trv.travelerId}) - {trv.mobileNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name, Phone, Email */}
            <div className="form-group">
              <label>Customer Full Name: *</label>
              <input
                type="text"
                placeholder="e.g. Vikramaditya Roy"
                value={newBookingForm.customerName}
                onChange={e => setNewBookingForm({ ...newBookingForm, customerName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Contact Mobile Number: *</label>
                <input
                  type="text"
                  placeholder="+91 99112 23344"
                  value={newBookingForm.contactDetails}
                  onChange={e => setNewBookingForm({ ...newBookingForm, contactDetails: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  placeholder="vikram.roy@example.com"
                  value={newBookingForm.email}
                  onChange={e => setNewBookingForm({ ...newBookingForm, email: e.target.value })}
                />
              </div>
            </div>

            {/* Dates & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Booking Date:</label>
                <input
                  type="date"
                  value={newBookingForm.bookingDate}
                  onChange={e => setNewBookingForm({ ...newBookingForm, bookingDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Departure Date: *</label>
                <input
                  type="date"
                  value={newBookingForm.departureDate}
                  onChange={e => setNewBookingForm({ ...newBookingForm, departureDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Days:</label>
                <input
                  type="number"
                  min="1"
                  value={newBookingForm.days}
                  onChange={e => {
                    const days = Number(e.target.value);
                    setNewBookingForm({
                      ...newBookingForm,
                      days,
                      duration: `${days} Days / ${newBookingForm.nights} Nights`
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Nights:</label>
                <input
                  type="number"
                  min="0"
                  value={newBookingForm.nights}
                  onChange={e => {
                    const nights = Number(e.target.value);
                    setNewBookingForm({
                      ...newBookingForm,
                      nights,
                      duration: `${newBookingForm.days} Days / ${nights} Nights`
                    });
                  }}
                />
              </div>
            </div>

            {/* Pricing & Payments */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Total Package Price (₹): *</label>
                <input
                  type="number"
                  value={newBookingForm.totalPrice}
                  onChange={e => {
                    const totalPrice = Number(e.target.value);
                    setNewBookingForm({
                      ...newBookingForm,
                      totalPrice,
                      paidAmount: newBookingForm.paymentType === 'Prepaid' ? totalPrice : newBookingForm.paidAmount
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={newBookingForm.paymentType}
                  onChange={e => {
                    const paymentType = e.target.value;
                    setNewBookingForm({
                      ...newBookingForm,
                      paymentType,
                      paidAmount: paymentType === 'Prepaid' ? newBookingForm.totalPrice : 0
                    });
                  }}
                >
                  <option value="Prepaid">Prepaid (Paid upfront)</option>
                  <option value="Postpaid">Postpaid (Pay later / Partial)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount Paid Now (₹):</label>
                <input
                  type="number"
                  value={newBookingForm.paidAmount}
                  onChange={e => setNewBookingForm({ ...newBookingForm, paidAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Remaining balance banner */}
            <div style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Paid:</strong> ₹{Number(newBookingForm.paidAmount || 0).toLocaleString()}</span>
              <span><strong>Balance Due:</strong> ₹{Math.max(0, Number(newBookingForm.totalPrice || 0) - Number(newBookingForm.paidAmount || 0)).toLocaleString()}</span>
              <span><strong>Payment Status:</strong> {Number(newBookingForm.paidAmount || 0) >= Number(newBookingForm.totalPrice || 0) ? 'PAID IN FULL' : (Number(newBookingForm.paidAmount || 0) > 0 ? 'PARTIAL' : 'PENDING')}</span>
            </div>

            {/* Staff Specialist & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Assign Tour Specialist / Officer:</label>
                <select
                  value={newBookingForm.caseOfficerId}
                  onChange={e => {
                    const officer = staffList.find(s => s.employeeId === e.target.value);
                    if (officer) {
                      setNewBookingForm({
                        ...newBookingForm,
                        caseOfficerId: officer.employeeId,
                        caseOfficerName: officer.name
                      });
                    }
                  }}
                >
                  {staffList.map(staff => (
                    <option key={staff.employeeId} value={staff.employeeId}>
                      {staff.name} ({staff.employeeId} - {staff.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Booking Status:</label>
                <select
                  value={newBookingForm.status}
                  onChange={e => setNewBookingForm({ ...newBookingForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label>Special Requests / Tour Notes (Optional):</label>
              <textarea
                placeholder="e.g. Vegetarian meals requested, airport transfer at Terminal 3, extra bed..."
                rows="2"
                value={newBookingForm.notes}
                onChange={e => setNewBookingForm({ ...newBookingForm, notes: e.target.value })}
              />
            </div>

            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddBookingModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!newBookingForm.customerName.trim()) {
                    alert('Please enter customer full name.');
                    return;
                  }
                  if (!newBookingForm.packageName.trim()) {
                    alert('Please specify holiday package name.');
                    return;
                  }
                  const nextId = `PKG-${701 + bookingList.length}`;
                  const createdBooking = {
                    packageId: nextId,
                    packageName: newBookingForm.packageName.trim(),
                    destination: newBookingForm.destination.trim() || 'Holiday Destination',
                    duration: `${newBookingForm.days} Days / ${newBookingForm.nights} Nights`,
                    days: Number(newBookingForm.days) || 1,
                    nights: Number(newBookingForm.nights) || 0,
                    bookingDate: newBookingForm.bookingDate || '2026-10-10',
                    departureDate: newBookingForm.departureDate || '2026-11-20',
                    totalPrice: Number(newBookingForm.totalPrice) || 85000,
                    paidAmount: Number(newBookingForm.paidAmount) || 0,
                    pendingAmount: Math.max(0, (Number(newBookingForm.totalPrice) || 0) - (Number(newBookingForm.paidAmount) || 0)),
                    status: newBookingForm.status,
                    customerName: newBookingForm.customerName.trim(),
                    contactDetails: newBookingForm.contactDetails.trim() || '+91 99112 23344',
                    email: newBookingForm.email.trim() || 'customer@example.com',
                    paymentType: newBookingForm.paymentType,
                    paymentStatus: Number(newBookingForm.paidAmount) >= Number(newBookingForm.totalPrice) ? 'Paid' : (Number(newBookingForm.paidAmount) > 0 ? 'Partial' : 'Pending'),
                    caseOfficerName: newBookingForm.caseOfficerName,
                    caseOfficerId: newBookingForm.caseOfficerId,
                    invoiceNo: `INV-2026-08${80 + bookingList.length + 1}`,
                    notes: newBookingForm.notes
                  };

                  setBookingList([createdBooking, ...bookingList]);

                  if (createdBooking.paidAmount > 0) {
                    setBookingPaymentsList([
                      {
                        id: `PAY-BKG-${701 + bookingPaymentsList.length}`,
                        type: createdBooking.paymentType,
                        mode: 'Bank Transfer',
                        amount: createdBooking.paidAmount,
                        date: createdBooking.bookingDate,
                        ref: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                        status: 'Completed'
                      },
                      ...bookingPaymentsList
                    ]);
                  }

                  setShowAddBookingModal(false);
                  alert(`Holiday Booking "${nextId}" created successfully for ${createdBooking.customerName}!`);
                }}
              >
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Entry Modal */}
      {showAddPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title">Add Multiple Payment Entry</div>
              <button className="close-btn" onClick={() => setShowAddPaymentModal(false)}>X</button>
            </div>

            <div className="form-group">
              <label>Service Category:</label>
              <select
                value={newPaymentForm.serviceCategory || 'visa'}
                onChange={e => {
                  const cat = e.target.value;
                  const firstCase = cat === 'visa' ? (visaList[0]?.id || 'VISA-301') : (bookingList[0]?.packageId || 'PKG-701');
                  setNewPaymentForm({
                    ...newPaymentForm,
                    serviceCategory: cat,
                    selectedCaseId: firstCase,
                  });
                }}
              >
                <option value="visa">🛂 Visa Application Case</option>
                <option value="holiday">🌴 Holiday / Tour Booking Case</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select Case / Booking:</label>
              <select
                value={newPaymentForm.selectedCaseId || ''}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, selectedCaseId: e.target.value })}
              >
                {(newPaymentForm.serviceCategory === 'holiday' ? bookingList : visaList).map(item => {
                  const id = item.packageId || item.id;
                  const name = item.customerName || item.applicantName;
                  const total = item.totalPrice || item.totalAmount || 0;
                  const paid = item.paidAmount || 0;
                  const pending = Math.max(0, total - paid);
                  return (
                    <option key={id} value={id}>
                      {id} — {name} (Due: ₹{pending.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Entry Amount (₹):</label>
              <input
                type="number"
                value={newPaymentForm.amount}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Payment Scheme:</label>
              <select
                value={newPaymentForm.type}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, type: e.target.value })}
              >
                <option value="Prepaid">Prepaid (Full Advance)</option>
                <option value="Postpaid">Postpaid Installment</option>
                <option value="Milestone">Milestone Settlement</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode:</label>
              <select
                value={newPaymentForm.mode}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, mode: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI / NetBanking">UPI / NetBanking</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Date:</label>
              <input
                type="date"
                value={newPaymentForm.date}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Reference / TXN ID:</label>
              <input
                type="text"
                value={newPaymentForm.ref}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, ref: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Payment Status:</label>
              <select
                value={newPaymentForm.status}
                onChange={e => setNewPaymentForm({ ...newPaymentForm, status: e.target.value })}
              >
                <option value="Completed">Completed (Verified)</option>
                <option value="Pending">Pending Clearance</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setShowAddPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const isHoliday = newPaymentForm.serviceCategory === 'holiday' || (viewingBookingDetails && !viewingVisaDetails);
                const targetId = newPaymentForm.selectedCaseId || (isHoliday ? (viewingBookingDetails?.packageId || bookingList[0]?.packageId) : (viewingVisaDetails?.id || visaList[0]?.id));
                const amt = Number(newPaymentForm.amount) || 0;

                if (isHoliday) {
                  const targetBooking = bookingList.find(b => b.packageId === targetId) || viewingBookingDetails;
                  const clientName = targetBooking?.customerName || 'Direct Client';
                  const entry = {
                    id: `PAY-BKG-${701 + bookingPaymentsList.length}`,
                    caseId: targetId,
                    clientName,
                    serviceType: 'Holiday',
                    type: newPaymentForm.type,
                    mode: newPaymentForm.mode,
                    amount: amt,
                    date: newPaymentForm.date,
                    ref: newPaymentForm.ref,
                    status: newPaymentForm.status
                  };
                  setBookingPaymentsList([entry, ...bookingPaymentsList]);

                  // Update booking paid amount & status
                  setBookingList(bookingList.map(b => {
                    if (b.packageId === targetId) {
                      const newPaid = (b.paidAmount || 0) + amt;
                      const newPending = Math.max(0, (b.totalPrice || 0) - newPaid);
                      return {
                        ...b,
                        paidAmount: newPaid,
                        pendingAmount: newPending,
                        paymentStatus: newPending === 0 ? 'Paid' : 'Partial'
                      };
                    }
                    return b;
                  }));

                  setShowAddPaymentModal(false);
                  alert(`Payment entry ${entry.id} of ₹${entry.amount.toLocaleString()} recorded for Booking ${targetId}!`);
                } else {
                  const targetVisa = visaList.find(v => v.id === targetId) || viewingVisaDetails;
                  const clientName = targetVisa?.applicantName || 'Direct Client';
                  const entry = {
                    id: `PAY-${101 + visaPaymentsList.length}`,
                    caseId: targetId,
                    clientName,
                    serviceType: 'Visa',
                    type: newPaymentForm.type,
                    mode: newPaymentForm.mode,
                    amount: amt,
                    date: newPaymentForm.date,
                    ref: newPaymentForm.ref,
                    status: newPaymentForm.status
                  };
                  setVisaPaymentsList([entry, ...visaPaymentsList]);

                  // Update visa paid amount & status
                  setVisaList(visaList.map(v => {
                    if (v.id === targetId) {
                      const newPaid = (v.paidAmount || 0) + amt;
                      const newPending = Math.max(0, (v.totalAmount || 0) - newPaid);
                      return {
                        ...v,
                        paidAmount: newPaid,
                        pendingAmount: newPending,
                        paymentStatus: newPending === 0 ? 'Paid' : 'Partially Paid'
                      };
                    }
                    return v;
                  }));

                  setShowAddPaymentModal(false);
                  alert(`Payment entry ${entry.id} of ₹${entry.amount.toLocaleString()} recorded for Visa Case ${targetId}!`);
                }
              }}>Save Payment Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Entry Modal */}
      {editingPayment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Payment Entry ({editingPayment.id})</div>
              <button className="close-btn" onClick={() => setEditingPayment(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Amount (₹):</label>
              <input
                type="number"
                value={editingPayment.amount}
                onChange={e => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Type:</label>
              <select
                value={editingPayment.type}
                onChange={e => setEditingPayment({ ...editingPayment, type: e.target.value })}
              >
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
                <option value="Partial Payment">Partial Payment</option>
                <option value="Full Payment">Full Payment</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Mode:</label>
              <select
                value={editingPayment.mode}
                onChange={e => setEditingPayment({ ...editingPayment, mode: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI / NetBanking">UPI / NetBanking</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Date:</label>
              <input
                type="date"
                value={editingPayment.date}
                onChange={e => setEditingPayment({ ...editingPayment, date: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Reference / TXN ID:</label>
              <input
                type="text"
                value={editingPayment.ref}
                onChange={e => setEditingPayment({ ...editingPayment, ref: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Payment Status:</label>
              <select
                value={editingPayment.status}
                onChange={e => setEditingPayment({ ...editingPayment, status: e.target.value })}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingPayment(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setVisaPaymentsList(visaPaymentsList.map(p => p.id === editingPayment.id ? editingPayment : p));
                setBookingPaymentsList(bookingPaymentsList.map(p => p.id === editingPayment.id ? editingPayment : p));
                setEditingPayment(null);
              }}>Update Payment Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Name Modal */}
      {showAddDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div className="modal-title">Add Document Name</div>
              <button className="close-btn" onClick={() => setShowAddDocModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Document Name:</label>
              <input
                type="text"
                placeholder="e.g. Passport Front Page, Bank Statement 6M, Salary Slip"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Document Requirement:</label>
              <select
                value={newDocRequirement}
                onChange={e => setNewDocRequirement(e.target.value)}
              >
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddDocModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newDocName.trim()) {
                  alert('Please enter a document name.');
                  return;
                }
                const newDoc = {
                  id: visaDocsList.length + 1,
                  name: newDocName.trim(),
                  mandatory: newDocRequirement,
                  status: 'Pending Verification'
                };
                setVisaDocsList([...visaDocsList, newDoc]);
                setNewDocName('');
                setShowAddDocModal(false);
              }}>Add Document</button>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Member Modal */}
      {selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div className="modal-title">Staff Member Details: {selectedMember.name}</div>
              <button className="close-btn" onClick={() => setSelectedMember(null)}>X</button>
            </div>
            <div className="section-box" style={{ background: '#fafafa', marginBottom: '16px' }}>
              <div className="form-grid" style={{ fontSize: '13px' }}>
                <div><strong>Employee ID:</strong> {selectedMember.employeeId}</div>
                <div><strong>Full Name:</strong> {selectedMember.name}</div>
                <div><strong>Email Address:</strong> {selectedMember.email}</div>
                <div><strong>Designation / Role:</strong> {selectedMember.role}</div>
                <div><strong>Department:</strong> {selectedMember.department}</div>
                <div><strong>System Status:</strong> <span className="status-badge">{selectedMember.status}</span></div>
              </div>
            </div>
            <div className="section-box">
              <div className="section-title">Assigned Applications Summary</div>
              <p style={{ fontSize: '12px', margin: '8px 0' }}>Currently managing 4 Active Visa Applications & 2 Holiday Bookings.</p>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setSelectedMember(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                setEditingMember({ ...selectedMember });
                setSelectedMember(null);
              }}>Edit Member Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Member Modal */}
      {editingMember && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Staff Member ({editingMember.employeeId})</div>
              <button className="close-btn" onClick={() => setEditingMember(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Employee Name:</label>
              <input
                type="text"
                value={editingMember.name || ''}
                onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Email Address:</label>
              <input
                type="email"
                value={editingMember.email || ''}
                onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Role / Designation:</label>
              <select
                value={editingMember.role || 'Senior Case Officer'}
                onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
              >
                <option value="Senior Case Officer">Senior Case Officer</option>
                <option value="Holiday Specialist">Holiday Specialist</option>
                <option value="Visa Specialist">Visa Specialist</option>
                <option value="Sub-Admin Staff">Sub-Admin Staff</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Department:</label>
              <select
                value={editingMember.department || 'Visa Operations'}
                onChange={e => setEditingMember({ ...editingMember, department: e.target.value })}
              >
                <option value="Visa Operations">Visa Operations</option>
                <option value="Tour Operations">Tour Operations</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Accounts & Billing">Accounts & Billing</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Status:</label>
              <select
                value={editingMember.status || 'ACTIVE'}
                onChange={e => setEditingMember({ ...editingMember, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingMember(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setStaffList(staffList.map(s => s.employeeId === editingMember.employeeId ? editingMember : s));
                setEditingMember(null);
                alert(`Staff Member "${editingMember.name}" updated successfully!`);
              }}>Save Member Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Staff Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Staff Member</div>
              <button className="close-btn" onClick={() => setShowAddMemberModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Full Name:</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={newMemberForm.name}
                onChange={e => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Email Address:</label>
              <input
                type="email"
                placeholder="rahul.s@rhglobal.com"
                value={newMemberForm.email}
                onChange={e => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Role / Designation:</label>
              <select
                value={newMemberForm.role}
                onChange={e => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
              >
                <option value="Senior Case Officer">Senior Case Officer</option>
                <option value="Holiday Specialist">Holiday Specialist</option>
                <option value="Visa Specialist">Visa Specialist</option>
                <option value="Sub-Admin Staff">Sub-Admin Staff</option>
                <option value="Customer Support">Customer Support</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Department:</label>
              <select
                value={newMemberForm.department}
                onChange={e => setNewMemberForm({ ...newMemberForm, department: e.target.value })}
              >
                <option value="Visa Operations">Visa Operations</option>
                <option value="Tour Operations">Tour Operations</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Accounts & Billing">Accounts & Billing</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Status:</label>
              <select
                value={newMemberForm.status}
                onChange={e => setNewMemberForm({ ...newMemberForm, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newMemberForm.name.trim()) {
                  alert('Please enter staff member name.');
                  return;
                }
                const newEmp = {
                  employeeId: `CO-${104 + staffList.length}`,
                  name: newMemberForm.name.trim(),
                  email: newMemberForm.email || `${newMemberForm.name.toLowerCase().replace(/\s+/g, '.')}@rhglobal.com`,
                  role: newMemberForm.role,
                  department: newMemberForm.department,
                  status: newMemberForm.status
                };
                setStaffList([...staffList, newEmp]);
                setNewMemberForm({ name: '', email: '', role: 'Visa Specialist', department: 'Visa Operations', status: 'ACTIVE' });
                setShowAddMemberModal(false);
                alert(`Added new staff member ${newEmp.name} (${newEmp.employeeId})!`);
              }}>Add Staff Member</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Country Visa Modal */}
      {editingCountryVisa && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Visa Country: {editingCountryVisa.countryName}</div>
              <button className="close-btn" onClick={() => setEditingCountryVisa(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Name:</label>
              <input
                type="text"
                value={editingCountryVisa.countryName || ''}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, countryName: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Code (ISO):</label>
              <input
                type="text"
                value={editingCountryVisa.countryCode || ''}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, countryCode: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Processing Duration:</label>
              <input
                type="text"
                value={editingCountryVisa.processingTime || ''}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, processingTime: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Starting Fee (₹):</label>
              <input
                type="number"
                value={editingCountryVisa.startingPrice || 0}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, startingPrice: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Image URL / Banner:</label>
              <input
                type="text"
                value={editingCountryVisa.imageUrl || ''}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, imageUrl: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Status:</label>
              <select
                value={editingCountryVisa.status || 'Active'}
                onChange={e => setEditingCountryVisa({ ...editingCountryVisa, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingCountryVisa(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setCountriesList(countriesList.map(c => c.countryCode === editingCountryVisa.countryCode ? editingCountryVisa : c));
                if (viewingCountryVisaDetails && (viewingCountryVisaDetails.countryCode === editingCountryVisa.countryCode || viewingCountryVisaDetails.id === editingCountryVisa.id)) {
                  setViewingCountryVisaDetails({ ...editingCountryVisa });
                }
                setEditingCountryVisa(null);
                alert(`Country Visa for "${editingCountryVisa.countryName}" updated successfully!`);
              }}>Save Country Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Country Visa Modal */}
      {showAddCountryVisaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Visa Country</div>
              <button className="close-btn" onClick={() => setShowAddCountryVisaModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Name:</label>
              <input type="text" placeholder="e.g. Canada, Australia, Germany" id="newCntyName" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Code (e.g. CA, AU):</label>
              <input type="text" placeholder="e.g. CA" id="newCntyCode" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Processing Duration:</label>
              <input type="text" placeholder="e.g. 10-15 Working Days" id="newCntyTime" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Starting Visa Fee (₹):</label>
              <input type="number" placeholder="15000" id="newCntyPrice" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Country Flag Emoji / Image URL:</label>
              <input type="text" placeholder="🇨🇦 or https://..." id="newCntyImg" />
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddCountryVisaModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const name = document.getElementById('newCntyName')?.value || 'New Country';
                const code = document.getElementById('newCntyCode')?.value || 'NC';
                const price = Number(document.getElementById('newCntyPrice')?.value) || 15000;
                const newC = {
                  id: `CNTY-${code}`,
                  countryName: name,
                  countryCode: code,
                  flag: '🌐',
                  imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600',
                  visaTypesCount: 2,
                  processingTime: '10-15 Days',
                  startingPrice: price,
                  status: 'Active',
                  visaTypes: [
                    { name: 'Standard Tourist Visa', validity: '6 Months', processingFee: price, stayDuration: '30 Days' }
                  ],
                  requiredDocs: [
                    { name: 'Passport (Valid 6+ Months)', type: 'Mandatory', guidance: 'At least 2 blank pages.' },
                    { name: 'Bank Statement (6 Months)', type: 'Mandatory', guidance: 'Official bank seal required.' }
                  ],
                  guidance: 'Standard visa application procedures apply.'
                };
                setCountriesList([...countriesList, newC]);
                setShowAddCountryVisaModal(false);
                alert(`Added new Visa Country "${name}"!`);
              }}>Save New Country</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Holiday Package Modal */}
      {editingHolidayPackage && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Holiday Package ({editingHolidayPackage.packageId})</div>
              <button className="close-btn" onClick={() => setEditingHolidayPackage(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Name:</label>
              <input
                type="text"
                value={editingHolidayPackage.packageName || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, packageName: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Destination / Location:</label>
              <input
                type="text"
                value={editingHolidayPackage.destination || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, destination: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Duration:</label>
              <input
                type="text"
                value={editingHolidayPackage.duration || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, duration: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Price per person (₹):</label>
              <input
                type="number"
                value={editingHolidayPackage.price || 0}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, price: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Banner Image URL:</label>
              <input
                type="text"
                value={editingHolidayPackage.imageUrl || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, imageUrl: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Tour Overview & Description:</label>
              <textarea
                rows="3"
                value={editingHolidayPackage.description || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Inclusions Summary:</label>
              <input
                type="text"
                value={editingHolidayPackage.inclusions || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, inclusions: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Exclusions Summary:</label>
              <input
                type="text"
                value={editingHolidayPackage.exclusions || ''}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, exclusions: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Status:</label>
              <select
                value={editingHolidayPackage.status || 'Active'}
                onChange={e => setEditingHolidayPackage({ ...editingHolidayPackage, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingHolidayPackage(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                setHolidayPackagesList(holidayPackagesList.map(p => p.packageId === editingHolidayPackage.packageId ? editingHolidayPackage : p));
                if (viewingHolidayPackageDetails && viewingHolidayPackageDetails.packageId === editingHolidayPackage.packageId) {
                  setViewingHolidayPackageDetails({ ...editingHolidayPackage });
                }
                setEditingHolidayPackage(null);
                alert(`Holiday Package "${editingHolidayPackage.packageName}" updated successfully!`);
              }}>Save Package Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Holiday Package Modal */}
      {showAddHolidayPackageModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Holiday Package</div>
              <button className="close-btn" onClick={() => setShowAddHolidayPackageModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Package Name:</label>
              <input type="text" placeholder="e.g. Japan Cherry Blossom & Culture Tour" id="newPkgName" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Destination / Country:</label>
              <input type="text" placeholder="Tokyo & Kyoto, Japan" id="newPkgDest" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Duration (e.g. 7 Days / 6 Nights):</label>
              <input type="text" placeholder="7 Days / 6 Nights" id="newPkgDuration" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Price per person (₹):</label>
              <input type="number" placeholder="135000" id="newPkgPrice" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Inclusions Summary:</label>
              <input type="text" placeholder="Hotels, Bullet Train Pass, Sightseeing, Transfers" id="newPkgInc" />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Banner Image URL:</label>
              <input type="text" placeholder="https://..." id="newPkgImg" />
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddHolidayPackageModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const name = document.getElementById('newPkgName')?.value || 'New Holiday Package';
                const dest = document.getElementById('newPkgDest')?.value || 'Tokyo, Japan';
                const dur = document.getElementById('newPkgDuration')?.value || '7 Days / 6 Nights';
                const price = Number(document.getElementById('newPkgPrice')?.value) || 120000;
                const inc = document.getElementById('newPkgInc')?.value || 'Hotels, Breakfast, Sightseeing, Transfers';
                const img = document.getElementById('newPkgImg')?.value || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600';

                const newPkg = {
                  packageId: `PKG-${704 + holidayPackagesList.length}`,
                  packageName: name,
                  country: dest,
                  destination: dest,
                  duration: dur,
                  days: 7,
                  nights: 6,
                  price: price,
                  status: 'Active',
                  imageUrl: img,
                  description: 'Comprehensive guided holiday tour with luxury accommodation and sightseeing.',
                  inclusions: inc,
                  exclusions: 'Flights, Personal Expenses, Visa Fee',
                  itinerary: [
                    { day: 'Day 1', title: 'Arrival & Hotel Check-in', detail: 'Welcome at airport, private hotel transfer.' },
                    { day: 'Day 2', title: 'Guided City Sightseeing Tour', detail: 'Explore major landmarks and historical attractions.' }
                  ]
                };
                setHolidayPackagesList([...holidayPackagesList, newPkg]);
                setShowAddHolidayPackageModal(false);
                alert(`Added new Holiday Package "${name}"!`);
              }}>Save Holiday Package</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Visa Type Modal */}
      {editingVisaType && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Visa Type</div>
              <button className="close-btn" onClick={() => setEditingVisaType(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Visa Type Name:</label>
              <input
                type="text"
                value={editingVisaType.name || ''}
                onChange={e => setEditingVisaType({ ...editingVisaType, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Validity Period:</label>
              <input
                type="text"
                value={editingVisaType.validity || ''}
                onChange={e => setEditingVisaType({ ...editingVisaType, validity: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Permitted Stay Duration:</label>
              <input
                type="text"
                value={editingVisaType.stayDuration || ''}
                onChange={e => setEditingVisaType({ ...editingVisaType, stayDuration: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Processing Fee (₹):</label>
              <input
                type="number"
                value={editingVisaType.processingFee || 0}
                onChange={e => setEditingVisaType({ ...editingVisaType, processingFee: Number(e.target.value) })}
              />
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingVisaType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const updatedTypes = (viewingCountryVisaDetails.visaTypes || []).map((vt, i) =>
                  i === editingVisaType.index ? {
                    name: editingVisaType.name,
                    validity: editingVisaType.validity,
                    stayDuration: editingVisaType.stayDuration,
                    processingFee: editingVisaType.processingFee
                  } : vt
                );
                const updatedCountry = { ...viewingCountryVisaDetails, visaTypes: updatedTypes, visaTypesCount: updatedTypes.length };
                setViewingCountryVisaDetails(updatedCountry);
                setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
                setEditingVisaType(null);
              }}>Save Visa Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Visa Type Modal */}
      {showAddVisaTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Visa Type</div>
              <button className="close-btn" onClick={() => setShowAddVisaTypeModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Visa Type Name:</label>
              <input
                type="text"
                placeholder="e.g. Tourist Visa, Business Visa"
                value={newVisaTypeForm.name}
                onChange={e => setNewVisaTypeForm({ ...newVisaTypeForm, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Validity Period:</label>
              <input
                type="text"
                placeholder="e.g. 6 Months Multiple Entry"
                value={newVisaTypeForm.validity}
                onChange={e => setNewVisaTypeForm({ ...newVisaTypeForm, validity: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Permitted Stay Duration:</label>
              <input
                type="text"
                placeholder="e.g. up to 90 Days"
                value={newVisaTypeForm.stayDuration}
                onChange={e => setNewVisaTypeForm({ ...newVisaTypeForm, stayDuration: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Processing Fee (₹):</label>
              <input
                type="number"
                placeholder="18500"
                value={newVisaTypeForm.processingFee}
                onChange={e => setNewVisaTypeForm({ ...newVisaTypeForm, processingFee: Number(e.target.value) })}
              />
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddVisaTypeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newVisaTypeForm.name) { alert('Please enter a visa type name'); return; }
                const updatedTypes = [...(viewingCountryVisaDetails.visaTypes || []), { ...newVisaTypeForm }];
                const updatedCountry = { ...viewingCountryVisaDetails, visaTypes: updatedTypes, visaTypesCount: updatedTypes.length };
                setViewingCountryVisaDetails(updatedCountry);
                setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
                setShowAddVisaTypeModal(false);
                setNewVisaTypeForm({ name: '', validity: '', stayDuration: '', processingFee: 15000 });
              }}>Add Visa Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Requirement Modal */}
      {editingCountryDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Document Requirement</div>
              <button className="close-btn" onClick={() => setEditingCountryDoc(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Document Name:</label>
              <input
                type="text"
                value={editingCountryDoc.name || ''}
                onChange={e => setEditingCountryDoc({ ...editingCountryDoc, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Requirement Type:</label>
              <select
                value={editingCountryDoc.type || 'Mandatory'}
                onChange={e => setEditingCountryDoc({ ...editingCountryDoc, type: e.target.value })}
              >
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
                <option value="Conditional">Conditional</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Guidelines & Format Instructions:</label>
              <textarea
                rows="3"
                value={editingCountryDoc.guidance || ''}
                onChange={e => setEditingCountryDoc({ ...editingCountryDoc, guidance: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingCountryDoc(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const updatedDocs = (viewingCountryVisaDetails.requiredDocs || []).map((doc, i) =>
                  i === editingCountryDoc.index ? {
                    name: editingCountryDoc.name,
                    type: editingCountryDoc.type,
                    guidance: editingCountryDoc.guidance
                  } : doc
                );
                const updatedCountry = { ...viewingCountryVisaDetails, requiredDocs: updatedDocs };
                setViewingCountryVisaDetails(updatedCountry);
                setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
                setEditingCountryDoc(null);
              }}>Save Document Requirement</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Requirement Modal */}
      {showAddCountryDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Add Document Requirement</div>
              <button className="close-btn" onClick={() => setShowAddCountryDocModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Document Name:</label>
              <input
                type="text"
                placeholder="e.g. Bank Statement (6 Months), ITR Returns"
                value={newCountryDocForm.name}
                onChange={e => setNewCountryDocForm({ ...newCountryDocForm, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Requirement Type:</label>
              <select
                value={newCountryDocForm.type}
                onChange={e => setNewCountryDocForm({ ...newCountryDocForm, type: e.target.value })}
              >
                <option value="Mandatory">Mandatory</option>
                <option value="Optional">Optional</option>
                <option value="Conditional">Conditional</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Guidelines & Format Instructions:</label>
              <textarea
                rows="3"
                placeholder="Enter guidelines or instructions for applicants..."
                value={newCountryDocForm.guidance}
                onChange={e => setNewCountryDocForm({ ...newCountryDocForm, guidance: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddCountryDocModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newCountryDocForm.name) { alert('Please enter a document name'); return; }
                const updatedDocs = [...(viewingCountryVisaDetails.requiredDocs || []), { ...newCountryDocForm }];
                const updatedCountry = { ...viewingCountryVisaDetails, requiredDocs: updatedDocs };
                setViewingCountryVisaDetails(updatedCountry);
                setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
                setShowAddCountryDocModal(false);
                setNewCountryDocForm({ name: '', type: 'Mandatory', guidance: '' });
              }}>Add Document Requirement</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guidance Modal */}
      {editingGuidanceText !== null && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <div className="modal-title">Official Embassy Guidance & Instructions</div>
              <button className="close-btn" onClick={() => setEditingGuidanceText(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Step-by-Step Application Instructions & Embassy Guidelines:</label>
              <textarea
                rows="5"
                placeholder="Enter embassy guidance, application process instructions, interview tips..."
                value={editingGuidanceText}
                onChange={e => setEditingGuidanceText(e.target.value)}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingGuidanceText(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const updatedCountry = { ...viewingCountryVisaDetails, guidance: editingGuidanceText };
                setViewingCountryVisaDetails(updatedCountry);
                setCountriesList(countriesList.map(c => c.countryCode === updatedCountry.countryCode || c.id === updatedCountry.id ? updatedCountry : c));
                setEditingGuidanceText(null);
              }}>Save Guidance</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Itinerary Day Modal */}
      {editingItineraryDay && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Edit Itinerary Day</div>
              <button className="close-btn" onClick={() => setEditingItineraryDay(null)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Label (e.g. Day 1, Day 2):</label>
              <input
                type="text"
                value={editingItineraryDay.day || ''}
                onChange={e => setEditingItineraryDay({ ...editingItineraryDay, day: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Title / Activity Name:</label>
              <input
                type="text"
                value={editingItineraryDay.title || ''}
                onChange={e => setEditingItineraryDay({ ...editingItineraryDay, title: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Activity Details & Description:</label>
              <textarea
                rows="4"
                value={editingItineraryDay.detail || ''}
                onChange={e => setEditingItineraryDay({ ...editingItineraryDay, detail: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setEditingItineraryDay(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                const updatedItin = (viewingHolidayPackageDetails.itinerary || []).map((itin, idx) =>
                  idx === editingItineraryDay.index ? {
                    day: editingItineraryDay.day,
                    title: editingItineraryDay.title,
                    detail: editingItineraryDay.detail
                  } : itin
                );
                const updatedPkg = { ...viewingHolidayPackageDetails, itinerary: updatedItin };
                setViewingHolidayPackageDetails(updatedPkg);
                setHolidayPackagesList(holidayPackagesList.map(p => p.packageId === updatedPkg.packageId ? updatedPkg : p));
                setEditingItineraryDay(null);
              }}>Save Itinerary Day</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Itinerary Day Modal */}
      {showAddItineraryDayModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Itinerary Day</div>
              <button className="close-btn" onClick={() => setShowAddItineraryDayModal(false)}>X</button>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Label (e.g. Day 1, Day 2):</label>
              <input
                type="text"
                placeholder="e.g. Day 7"
                value={newItineraryDayForm.day}
                onChange={e => setNewItineraryDayForm({ ...newItineraryDayForm, day: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Title / Activity Name:</label>
              <input
                type="text"
                placeholder="e.g. Shopping & Departure Transfer"
                value={newItineraryDayForm.title}
                onChange={e => setNewItineraryDayForm({ ...newItineraryDayForm, title: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Day Activity Details & Description:</label>
              <textarea
                rows="4"
                placeholder="Describe planned activities, sightseeing, meals, transfers..."
                value={newItineraryDayForm.detail}
                onChange={e => setNewItineraryDayForm({ ...newItineraryDayForm, detail: e.target.value })}
              ></textarea>
            </div>
            <div className="form-actions mt-4">
              <button className="btn" onClick={() => setShowAddItineraryDayModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                if (!newItineraryDayForm.title.trim()) { alert('Please enter a day title.'); return; }
                const updatedItin = [...(viewingHolidayPackageDetails.itinerary || []), { ...newItineraryDayForm }];
                const updatedPkg = { ...viewingHolidayPackageDetails, itinerary: updatedItin, days: updatedItin.length };
                setViewingHolidayPackageDetails(updatedPkg);
                setHolidayPackagesList(holidayPackagesList.map(p => p.packageId === updatedPkg.packageId ? updatedPkg : p));
                setShowAddItineraryDayModal(false);
                setNewItineraryDayForm({ day: '', title: '', detail: '' });
              }}>Add Itinerary Day</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
