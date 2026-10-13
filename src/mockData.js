// Comprehensive Mock Data adhering strictly to the PDF specification

export const mockSummaryCards = {
  totalCompanies: 12,
  totalTravelers: 148,
  totalStaffs: 8,
  totalLeads: 42
};

export const LEAD_STAGES = [
  { id: 'lead', name: 'Stage 1: Lead', shortName: 'Lead', description: 'Inbound inquiries from Website, Social & Direct' },
  { id: 'qualified', name: 'Stage 2: Qualified', shortName: 'Qualified', description: 'Profile, travel dates & budget verified' },
  { id: 'proposal', name: 'Stage 3: Proposal', shortName: 'Proposal', description: 'Proposal & quotation drafted / sent' },
  { id: 'negotiation', name: 'Stage 4: Negotiation', shortName: 'Negotiation', description: 'Terms, discounts & itinerary finalization' },
  { id: 'converted', name: 'Converted', shortName: 'Converted', description: 'Deal won & converted into Cases' }
];

export const LEAD_SOURCES = ['Website Form', 'Direct entry', 'FB / Instagram'];
export const LEAD_TYPES = ['Visa', 'Holiday'];

export const mockRecentLeads = [
  {
    id: 'LD-1001',
    leadName: 'Rahul Sharma',
    companyName: 'Apex Tours & Tech',
    email: 'rahul.s@apextours.com',
    phone: '+91 98765 43210',
    leadType: 'Visa',
    source: 'Website Form',
    stage: 'lead',
    status: 'New Inquiry',
    createdDate: '2026-10-08',
    targetCountry: 'United States',
    serviceRequired: 'B1/B2 Business Visa',
    estimatedValue: 28000,
    assignedStaff: 'Amit Verma',
    remarks: 'Inquiring for urgent executive visa processing for US conference in November.',
    checklist: [
      { id: 'c1', label: 'Initial contact made with applicant', completed: true, mandatory: true },
      { id: 'c2', label: 'Understand travel purpose and dates', completed: false, mandatory: true },
      { id: 'c3', label: 'Log applicant details & KYC into CRM', completed: false, mandatory: false }
    ],
    proposalData: null,
    caseId: null
  },
  {
    id: 'LD-1008',
    leadName: 'Sneha Kulkarni',
    companyName: 'Individual',
    email: 'sneha.k@gmail.com',
    phone: '+91 98222 34567',
    leadType: 'Holiday',
    source: 'FB / Instagram',
    stage: 'lead',
    status: 'Inbound Lead',
    createdDate: '2026-10-08',
    targetCountry: 'Bali (Indonesia)',
    serviceRequired: '6D/5N Luxury Villa Package',
    estimatedValue: 75000,
    assignedStaff: 'Priya Singh',
    remarks: 'Customer saw Instagram campaign for Bali romantic getaway. Looking for beachfront villa options.',
    checklist: [
      { id: 'c1', label: 'Initial contact made with applicant', completed: true, mandatory: true },
      { id: 'c2', label: 'Understand travel purpose and dates', completed: true, mandatory: true },
      { id: 'c3', label: 'Log applicant details & KYC into CRM', completed: false, mandatory: false }
    ],
    proposalData: null,
    caseId: null
  },
  {
    id: 'LD-1002',
    leadName: 'Ananya Roy',
    companyName: 'Individual',
    email: 'ananya.roy@gmail.com',
    phone: '+91 98123 45678',
    leadType: 'Holiday',
    source: 'Direct entry',
    stage: 'qualified',
    status: 'Profile Verified',
    createdDate: '2026-10-07',
    targetCountry: 'Switzerland',
    serviceRequired: '7 Days Alps Grand Tour',
    estimatedValue: 145000,
    assignedStaff: 'Priya Singh',
    remarks: 'Family of 3 planning December winter trip. Passports valid, budget verified.',
    checklist: [
      { id: 'c1', label: 'Passport validity verified (> 6 Months)', completed: true, mandatory: true },
      { id: 'c2', label: 'Travel dates & group size confirmed', completed: true, mandatory: true },
      { id: 'c3', label: 'Budget & eligibility confirmed', completed: true, mandatory: true }
    ],
    proposalData: null,
    caseId: null
  },
  {
    id: 'LD-1007',
    leadName: 'Meera Nair',
    companyName: 'Individual',
    email: 'meera.nair@hotmail.com',
    phone: '+91 97777 66655',
    leadType: 'Visa',
    source: 'FB / Instagram',
    stage: 'qualified',
    status: 'Docs Assessed',
    createdDate: '2026-10-02',
    targetCountry: 'Schengen (France)',
    serviceRequired: 'Short-stay Tourist C Visa',
    estimatedValue: 18500,
    assignedStaff: 'Amit Verma',
    remarks: 'Attending Paris fashion week. Bank balance and previous travel history verified.',
    checklist: [
      { id: 'c1', label: 'Passport validity verified (> 6 Months)', completed: true, mandatory: true },
      { id: 'c2', label: 'Travel dates & group size confirmed', completed: true, mandatory: true },
      { id: 'c3', label: 'Budget & eligibility confirmed', completed: false, mandatory: true }
    ],
    proposalData: null,
    caseId: null
  },
  {
    id: 'LD-1006',
    leadName: 'Siddharth Rao',
    companyName: 'TechCorp Pvt Ltd',
    email: 's.rao@techcorp.com',
    phone: '+91 98888 77766',
    leadType: 'Visa',
    source: 'Website Form',
    stage: 'proposal',
    status: 'Proposal Sent',
    createdDate: '2026-10-03',
    targetCountry: 'United States',
    serviceRequired: 'Express B1 Business Visa Processing',
    estimatedValue: 35000,
    assignedStaff: 'Amit Verma',
    remarks: 'Quotation sent including embassy appointment expedited booking and document legalisation.',
    checklist: [
      { id: 'c1', label: 'Detailed proposal & itinerary prepared', completed: true, mandatory: true },
      { id: 'c2', label: 'Quotation generated with itemized cost', completed: true, mandatory: true },
      { id: 'c3', label: 'Proposal sent to client with validity', completed: true, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-301',
      totalAmount: 35000,
      taxPercent: 18,
      discount: 2500,
      validUntil: '2026-10-22',
      status: 'Sent to Client',
      items: [
        { desc: 'US B1 Visa Official Embassy Processing Fee', qty: 1, rate: 16500 },
        { desc: 'Priority Slot Booking & Document Legalisation', qty: 1, rate: 12000 },
        { desc: 'Dedicated Case Officer Concierge Assistance', qty: 1, rate: 6500 }
      ]
    },
    caseId: null
  },
  {
    id: 'LD-1010',
    leadName: 'Dr. Manish & Neha Goel',
    companyName: 'Individual',
    email: 'm.goel@apollohospitals.org',
    phone: '+91 97111 88990',
    leadType: 'Holiday',
    source: 'Direct entry',
    stage: 'proposal',
    status: 'Quotation Drafted',
    createdDate: '2026-10-04',
    targetCountry: 'Japan',
    serviceRequired: '10 Days Cherry Blossom Cultural Tour',
    estimatedValue: 240000,
    assignedStaff: 'Priya Singh',
    remarks: 'Customized luxury itinerary: Tokyo, Kyoto, Osaka bullet train passes with English guide.',
    checklist: [
      { id: 'c1', label: 'Detailed proposal & itinerary prepared', completed: true, mandatory: true },
      { id: 'c2', label: 'Quotation generated with itemized cost', completed: true, mandatory: true },
      { id: 'c3', label: 'Proposal sent to client with validity', completed: false, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-302',
      totalAmount: 240000,
      taxPercent: 5,
      discount: 10000,
      validUntil: '2026-10-25',
      status: 'Draft Ready',
      items: [
        { desc: '4-Star Hotels with Breakfast (9 Nights)', qty: 2, rate: 80000 },
        { desc: 'JR 7-Day Unlimited Shinkansen Bullet Pass', qty: 2, rate: 22000 },
        { desc: 'Private Kyoto Temple Guided Excursion', qty: 1, rate: 26000 }
      ]
    },
    caseId: null
  },
  {
    id: 'LD-1004',
    leadName: 'Priya Patel',
    companyName: 'Individual',
    email: 'priya.patel@yahoo.com',
    phone: '+91 97654 32109',
    leadType: 'Holiday',
    source: 'FB / Instagram',
    stage: 'negotiation',
    status: 'In Price Negotiation',
    createdDate: '2026-10-05',
    targetCountry: 'Dubai (UAE)',
    serviceRequired: '5 Days Dubai Desert & Marina Experience',
    estimatedValue: 92000,
    assignedStaff: 'Priya Singh',
    remarks: 'Client requested 10% discount on 5-star hotel upgrade and complimentary desert safari buggy.',
    checklist: [
      { id: 'c1', label: 'Client queries & pricing feedback addressed', completed: true, mandatory: true },
      { id: 'c2', label: 'Special corporate/group discounts reviewed', completed: true, mandatory: true },
      { id: 'c3', label: 'Commercial terms & payment schedule approved', completed: false, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-298',
      totalAmount: 92000,
      taxPercent: 5,
      discount: 8000,
      validUntil: '2026-10-18',
      status: 'Under Review',
      items: [
        { desc: 'Atlantis The Palm Deluxe Room (4 Nights)', qty: 1, rate: 68000 },
        { desc: 'VIP Desert Safari with Quad Biking', qty: 2, rate: 12000 },
        { desc: 'Burj Khalifa At the Top & Sky Views', qty: 2, rate: 12000 }
      ]
    },
    caseId: null
  },
  {
    id: 'LD-1011',
    leadName: 'Rajiv Singhania',
    companyName: 'Zenith Logistics',
    email: 'r.singhania@zenithlog.com',
    phone: '+91 99000 44556',
    leadType: 'Visa',
    source: 'Direct entry',
    stage: 'negotiation',
    status: 'Reviewing Terms',
    createdDate: '2026-10-06',
    targetCountry: 'United Kingdom',
    serviceRequired: '2-Year Long Term Business Visa',
    estimatedValue: 55000,
    assignedStaff: 'Amit Verma',
    remarks: 'Negotiating expedited biometrics fees and corporate credit terms (post-paid invoicing).',
    checklist: [
      { id: 'c1', label: 'Client queries & pricing feedback addressed', completed: true, mandatory: true },
      { id: 'c2', label: 'Special corporate/group discounts reviewed', completed: true, mandatory: true },
      { id: 'c3', label: 'Commercial terms & payment schedule approved', completed: true, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-295',
      totalAmount: 55000,
      taxPercent: 18,
      discount: 3000,
      validUntil: '2026-10-20',
      status: 'Terms Agreed',
      items: [
        { desc: 'UKVI 2-Year Multiple Entry Visa Fee', qty: 1, rate: 42000 },
        { desc: 'Priority Lounge & Mobile Biometrics Service', qty: 1, rate: 13000 }
      ]
    },
    caseId: null
  },
  {
    id: 'LD-1003',
    leadName: 'David Miller',
    companyName: 'Global Horizons Inc',
    email: 'dmiller@ghorizons.com',
    phone: '+1 415 555 0192',
    leadType: 'Visa',
    source: 'Website Form',
    stage: 'converted',
    status: 'Converted to Case',
    createdDate: '2026-10-06',
    targetCountry: 'Schengen (Germany)',
    serviceRequired: 'Multiple Entry Business Visa',
    estimatedValue: 42000,
    assignedStaff: 'Amit Verma',
    remarks: 'Deal closed! Transferred to Cases. Assigned to Amit Verma (Senior Case Officer - Visa Operations).',
    checklist: [
      { id: 'c1', label: 'Client confirmation signed & received', completed: true, mandatory: true },
      { id: 'c2', label: 'Order & payment structure selected (Prepaid)', completed: true, mandatory: true },
      { id: 'c3', label: 'Case created and assigned to Case Officer', completed: true, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-280',
      totalAmount: 42000,
      taxPercent: 18,
      discount: 2000,
      validUntil: '2026-10-15',
      status: 'Accepted',
      items: [
        { desc: 'German Consulate Multiple Entry Business Visa', qty: 1, rate: 28000 },
        { desc: 'Expedited Appointment & Biometrics Support', qty: 1, rate: 14000 }
      ]
    },
    caseId: 'CASE-3049'
  },
  {
    id: 'LD-1012',
    leadName: 'Ritu Varma',
    companyName: 'Individual',
    email: 'ritu.v@gmail.com',
    phone: '+91 99888 12345',
    leadType: 'Holiday',
    source: 'FB / Instagram',
    stage: 'converted',
    status: 'Converted to Case',
    createdDate: '2026-10-04',
    targetCountry: 'Maldives',
    serviceRequired: 'All-Inclusive Overwater Villa 5D/4N',
    estimatedValue: 195000,
    assignedStaff: 'Priya Singh',
    remarks: 'Prepaid 50% deposit received. Converted to Case and assigned to Tour Operations.',
    checklist: [
      { id: 'c1', label: 'Client confirmation signed & received', completed: true, mandatory: true },
      { id: 'c2', label: 'Order & payment structure selected (Prepaid)', completed: true, mandatory: true },
      { id: 'c3', label: 'Case created and assigned to Case Officer', completed: true, mandatory: true }
    ],
    proposalData: {
      quotationNo: 'QUO-2026-274',
      totalAmount: 195000,
      taxPercent: 5,
      discount: 15000,
      validUntil: '2026-10-12',
      status: 'Accepted',
      items: [
        { desc: 'Centara Grand Island Overwater Suite (4N)', qty: 1, rate: 165000 },
        { desc: 'Roundtrip Seaplane Transfers', qty: 2, rate: 15000 }
      ]
    },
    caseId: 'CASE-3050'
  }
];

export const mockRejectedApplications = [
  { id: 'APP-9081', applicantName: 'Karan Mehra', applicationType: 'Visa (Tourist)', country: 'United Kingdom', rejectionDate: '2026-10-05', rejectionReason: 'Incomplete Bank Statements', status: 'Rejected' },
  { id: 'APP-9042', applicantName: 'Suresh Menon', applicationType: 'Visa (Business)', country: 'Schengen (Germany)', rejectionDate: '2026-09-28', rejectionReason: 'Invalid Invitation Letter', status: 'Rejected' },
  { id: 'APP-8990', applicantName: 'Neha Gupta', applicationType: 'Holiday Tour', country: 'Japan', rejectionDate: '2026-09-20', rejectionReason: 'Passport Validity < 6 Months', status: 'Rejected' }
];

export const mockLeadsFull = [
  ...mockRecentLeads
];

export const mockCompanies = [
  { id: 'CMP-01', companyName: 'RH Global Enterprises', registrationDetails: 'REG-2021-99482', contactPerson: 'Rajesh Kumar', email: 'contact@rhglobal.com', phone: '+91 11 4000 5500', address: '102 Tech Park, Cyber City, Gurgaon', country: 'India', status: 'Active', totalCustomers: 34, totalApplications: 62 },
  { id: 'CMP-02', companyName: 'Apex Tours & Tech', registrationDetails: 'REG-2019-44120', contactPerson: 'Sunil Mehta', email: 'info@apextours.com', phone: '+91 22 2800 1122', address: '45 BKC Complex, Mumbai', country: 'India', status: 'Active', totalCustomers: 18, totalApplications: 29 },
  { id: 'CMP-03', companyName: 'Zenith Consultancy', registrationDetails: 'REG-2023-11002', contactPerson: 'Alok Verma', email: 'admin@zenith.in', phone: '+91 80 6711 9900', address: '12 MG Road, Bangalore', country: 'India', status: 'Inactive', totalCustomers: 5, totalApplications: 8 },
  { id: 'CMP-04', companyName: 'Nexus Global Logistics', registrationDetails: 'REG-2022-77341', contactPerson: 'Pooja Reddy', email: 'corporate@nexuslogistics.com', phone: '+91 40 4455 6677', address: 'Plot 48, Hitec City, Hyderabad', country: 'India', status: 'Active', totalCustomers: 22, totalApplications: 41 },
  { id: 'CMP-05', companyName: 'Tata Horizon Solutions', registrationDetails: 'REG-2018-12908', contactPerson: 'Karan Sharma', email: 'travel.desk@tatahorizon.com', phone: '+91 20 6600 8899', address: 'Quadron Business Park, Hinjewadi, Pune', country: 'India', status: 'Active', totalCustomers: 45, totalApplications: 88 },
  { id: 'CMP-06', companyName: 'Skyline Ventures Corp', registrationDetails: 'REG-2024-33109', contactPerson: 'Divya Malhotra', email: 'operations@skylinecorp.io', phone: '+91 11 2345 6789', address: 'Barakhamba Road, Connaught Place, New Delhi', country: 'India', status: 'Active', totalCustomers: 12, totalApplications: 19 },
  { id: 'CMP-07', companyName: 'BlueStar Overseas Education', registrationDetails: 'REG-2020-55412', contactPerson: 'Senthil Nathan', email: 'admissions@bluestaroverseas.com', phone: '+91 44 2822 3344', address: 'Mount Road, Anna Salai, Chennai', country: 'India', status: 'Active', totalCustomers: 29, totalApplications: 53 },
  { id: 'CMP-08', companyName: 'Pinnacle Infotech Systems', registrationDetails: 'REG-2021-66230', contactPerson: 'Anirban Mukherjee', email: 'hr.travel@pinnacleinfo.in', phone: '+91 33 2288 9911', address: 'Sector V, Salt Lake, Kolkata', country: 'India', status: 'Inactive', totalCustomers: 8, totalApplications: 14 },
  { id: 'CMP-09', companyName: 'Vanguard Holidays & Relocations', registrationDetails: 'REG-2023-88901', contactPerson: 'Bhavin Patel', email: 'desk@vanguardmobility.com', phone: '+91 79 4001 2233', address: 'SG Highway, Bodakdev, Ahmedabad', country: 'India', status: 'Active', totalCustomers: 15, totalApplications: 26 },
  { id: 'CMP-10', companyName: 'Paramount Consulting Group', registrationDetails: 'REG-2019-99124', contactPerson: 'Harpreet Singh', email: 'admin@paramountgroup.org', phone: '+91 172 2600 445', address: 'IT Park, Phase 8, Mohali, Chandigarh', country: 'India', status: 'Active', totalCustomers: 31, totalApplications: 47 }
];

export const mockCompanyApplications = [
  { id: 'APP-5001', applicantName: 'Rohan Joshi', applicationType: 'Visa', country: 'United States', service: 'Business Visa (B1)', assignedEmployee: 'Amit Verma (CO-101)', status: 'In Progress', applicationDate: '2026-10-01' },
  { id: 'APP-5002', applicantName: 'Deepak Chopra', applicationType: 'Holiday', country: 'France & Switzerland', service: 'Grand Europe 10D', assignedEmployee: 'Priya Singh (CO-102)', status: 'Approved', applicationDate: '2026-09-25' },
  { id: 'APP-5003', applicantName: 'Kavita Sundaram', applicationType: 'Visa', country: 'Canada', service: 'Visitor Visa', assignedEmployee: 'Amit Verma (CO-101)', status: 'Under Review', applicationDate: '2026-10-04' }
];

export const mockCompanyEmployees = [
  { employeeId: 'EMP-101', name: 'Rohan Joshi', email: 'rohan.j@rhglobal.com', phone: '+91 98200 11111', department: 'Executive', designation: 'Senior Manager', status: 'Active', numApplications: 3 },
  { employeeId: 'EMP-102', name: 'Deepak Chopra', email: 'deepak.c@rhglobal.com', phone: '+91 98200 22222', department: 'Sales', designation: 'Sales Director', status: 'Active', numApplications: 2 },
  { employeeId: 'EMP-103', name: 'Kavita Sundaram', email: 'kavita.s@rhglobal.com', phone: '+91 98200 33333', department: 'HR', designation: 'HR Lead', status: 'Active', numApplications: 1 }
];

export const mockTravelers = [
  { travelerId: 'TRV-8801', applicantName: 'Vikramaditya Roy', mobileNumber: '+91 99112 23344', email: 'vikram.roy@gmail.com', country: 'India', registrationDate: '2026-08-14', status: 'Active', passport: 'Z9847291 (Exp: 2031-05-12)', visaApplications: 4, bookingHistory: 2, paymentHistory: 'Paid: ₹1,20,000 | Pending: ₹0' },
  { travelerId: 'TRV-8802', applicantName: 'Sanya Malhotra', mobileNumber: '+91 98111 55443', email: 'sanya.m@gmail.com', country: 'India', registrationDate: '2026-09-01', status: 'Active', passport: 'L4438102 (Exp: 2029-11-20)', visaApplications: 2, bookingHistory: 1, paymentHistory: 'Paid: ₹45,000 | Pending: ₹15,000' },
  { travelerId: 'TRV-8803', applicantName: 'Tariq Ahmed', mobileNumber: '+91 97110 00112', email: 'tariq.ahmed@yahoo.com', country: 'India', registrationDate: '2026-09-18', status: 'Blocked', passport: 'K1029384 (Exp: 2028-02-14)', visaApplications: 1, bookingHistory: 0, paymentHistory: 'Paid: ₹0 | Pending: ₹5,000' }
];

export const mockVisaServices = [
  { id: 'VISA-301', applicantName: 'Vikramaditya Roy', email: 'vikram.roy@gmail.com', phone: '+91 97115 22345', passport: 'Z9847291 (Exp: 2031-05-12)', country: 'Schengen (France)', visaType: 'Tourist C', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', applicationDate: '2026-10-02', stage: 'docs-verified', status: 'Docs Verified', paymentType: 'Prepaid', totalAmount: 18500, paidAmount: 18500, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-10-02', paymentRef: 'TXN-998120', documentStatus: 'Docs Verified' },
  { id: 'VISA-302', applicantName: 'Sanya Malhotra', email: 'sanya.m@gmail.com', phone: '+91 98111 55443', passport: 'M1234567 (Exp: 2029-08-20)', country: 'United Kingdom', visaType: 'Standard Visitor', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', applicationDate: '2026-10-05', stage: 'under-review', status: 'Under Review', paymentType: 'Postpaid', totalAmount: 24000, paidAmount: 10000, pendingAmount: 14000, paymentStatus: 'Partially Paid', paymentDate: '2026-10-05', paymentRef: 'TXN-998144', documentStatus: 'Pending Verification' },
  { id: 'VISA-303', applicantName: 'Rohan Joshi', email: 'rohan.j@rhglobal.com', phone: '+91 98200 11122', passport: 'P9988771 (Exp: 2030-03-15)', country: 'United States', visaType: 'B1/B2 Business', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', applicationDate: '2026-09-20', stage: 'approved', status: 'Approved', paymentType: 'Prepaid', totalAmount: 21000, paidAmount: 21000, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-09-20', paymentRef: 'TXN-997500', documentStatus: 'Visa Uploaded' },
  { id: 'VISA-304', applicantName: 'Priya Patel', email: 'priya.patel@outlook.com', phone: '+91 99881 44332', passport: 'K4455667 (Exp: 2028-11-10)', country: 'United States', visaType: 'B1/B2 Business', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', applicationDate: '2026-10-08', stage: 'submitted', status: 'Submitted to Embassy', paymentType: 'Prepaid', totalAmount: 21000, paidAmount: 21000, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-10-08', paymentRef: 'TXN-998200', documentStatus: 'Submitted' },
  { id: 'VISA-305', applicantName: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '+91 96321 77890', passport: 'N7788990 (Exp: 2032-07-25)', country: 'Schengen (France)', visaType: 'Tourist C', caseOfficerName: 'Rohan Das', caseOfficerId: 'CO-103', applicationDate: '2026-10-10', stage: 'under-review', status: 'Under Review', paymentType: 'Postpaid', totalAmount: 18500, paidAmount: 0, pendingAmount: 18500, paymentStatus: 'Pending', paymentDate: '', paymentRef: 'TXN-998250', documentStatus: 'Pending Verification' },
  { id: 'VISA-306', applicantName: 'Meera Kapoor', email: 'meera.k@yahoo.com', phone: '+91 97766 22110', passport: 'Q1122334 (Exp: 2030-12-05)', country: 'United Kingdom', visaType: 'Standard Visitor', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', applicationDate: '2026-09-28', stage: 'processing', status: 'Processing', paymentType: 'Prepaid', totalAmount: 24000, paidAmount: 24000, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-09-28', paymentRef: 'TXN-997800', documentStatus: 'Docs Verified' },
  { id: 'VISA-307', applicantName: 'Deepak Nair', email: 'deepak.nair@company.com', phone: '+91 98500 33441', passport: 'R5544332 (Exp: 2027-06-18)', country: 'United States', visaType: 'B1/B2 Business', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', applicationDate: '2026-09-15', stage: 'rejected', status: 'Rejected', paymentType: 'Prepaid', totalAmount: 21000, paidAmount: 21000, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-09-15', paymentRef: 'TXN-997200', documentStatus: 'Rejected by Embassy' }
];

export const mockBookingServices = [
  { packageId: 'PKG-701', packageName: 'Bali Island Beach Getaway', destination: 'Bali, Indonesia', duration: '6 Days / 5 Nights', days: 6, nights: 5, bookingDate: '2026-10-01', totalPrice: 85000, status: 'Vouchers & Confirm', stage: 'stage-3', departureDate: '2026-11-15', customerName: 'Sanya Malhotra', contactDetails: '+91 98111 55443', email: 'sanya.m@gmail.com', paymentType: 'Prepaid', paidAmount: 85000, pendingAmount: 0, paymentStatus: 'Paid', invoiceNo: 'INV-2026-0881', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', completedChecklist: ['stage-1_0', 'stage-1_1', 'stage-2_0', 'stage-2_1', 'stage-2_2'] },
  { packageId: 'PKG-702', packageName: 'Swiss Alps & Paris Highlights', destination: 'France & Switzerland', duration: '8 Days / 7 Nights', days: 8, nights: 7, bookingDate: '2026-09-28', totalPrice: 210000, status: 'Booking Created', stage: 'stage-1', departureDate: '2026-12-01', customerName: 'Deepak Chopra', contactDetails: '+91 98200 22222', email: 'deepak.c@rhglobal.com', paymentType: 'Postpaid', paidAmount: 50000, pendingAmount: 160000, paymentStatus: 'Partial', invoiceNo: 'INV-2026-0865', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', completedChecklist: ['stage-1_0'] },
  { packageId: 'PKG-703', packageName: 'Dubai Luxury Marina & Desert Safari', destination: 'Dubai, UAE', duration: '5 Days / 4 Nights', days: 5, nights: 4, bookingDate: '2026-10-04', totalPrice: 95000, status: 'Docs & Itinerary', stage: 'stage-2', departureDate: '2026-11-20', customerName: 'Ananya Iyer', contactDetails: '+91 98333 44551', email: 'ananya.iyer@gmail.com', paymentType: 'Prepaid', paidAmount: 95000, pendingAmount: 0, paymentStatus: 'Paid', invoiceNo: 'INV-2026-0890', caseOfficerName: 'Rohan Das', caseOfficerId: 'CO-103', completedChecklist: ['stage-1_0', 'stage-1_1', 'stage-2_0', 'stage-2_1'] },
  { packageId: 'PKG-704', packageName: 'Maldives Overwater Villa Honeymoon', destination: 'Male, Maldives', duration: '5 Days / 4 Nights', days: 5, nights: 4, bookingDate: '2026-09-20', totalPrice: 175000, status: 'Tour In-Progress', stage: 'stage-4', departureDate: '2026-10-12', customerName: 'Rohit Sharma', contactDetails: '+91 98444 88990', email: 'rohit.s@outlook.com', paymentType: 'Prepaid', paidAmount: 175000, pendingAmount: 0, paymentStatus: 'Paid', invoiceNo: 'INV-2026-0850', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', completedChecklist: ['stage-1_0', 'stage-1_1', 'stage-2_0', 'stage-2_1', 'stage-2_2', 'stage-3_0', 'stage-3_1', 'stage-3_2'] },
  { packageId: 'PKG-705', packageName: 'Phuket & Krabi Island Explorer', destination: 'Phuket, Thailand', duration: '7 Days / 6 Nights', days: 7, nights: 6, bookingDate: '2026-09-10', totalPrice: 72000, status: 'Completed', stage: 'completed', departureDate: '2026-09-25', customerName: 'Meera Patel', contactDetails: '+91 98555 12345', email: 'meera.p@yahoo.com', paymentType: 'Prepaid', paidAmount: 72000, pendingAmount: 0, paymentStatus: 'Paid', invoiceNo: 'INV-2026-0832', caseOfficerName: 'Rohan Das', caseOfficerId: 'CO-103', completedChecklist: ['stage-1_0', 'stage-1_1', 'stage-2_0', 'stage-2_1', 'stage-2_2', 'stage-3_0', 'stage-3_1', 'stage-3_2', 'stage-4_0', 'stage-4_1', 'completed_0', 'completed_1'] },
  { packageId: 'PKG-706', packageName: 'Tokyo & Kyoto Autumn Tour', destination: 'Japan', duration: '9 Days / 8 Nights', days: 9, nights: 8, bookingDate: '2026-10-06', totalPrice: 245000, status: 'Docs & Itinerary', stage: 'stage-2', departureDate: '2026-12-10', customerName: 'Rajesh Kapoor', contactDetails: '+91 98666 77889', email: 'rajesh.k@kapoors.in', paymentType: 'Postpaid', paidAmount: 75000, pendingAmount: 170000, paymentStatus: 'Partial', invoiceNo: 'INV-2026-0895', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', completedChecklist: ['stage-1_0', 'stage-1_1'] },
  { packageId: 'PKG-707', packageName: 'Singapore Sentosa & Universal Studios', destination: 'Singapore', duration: '4 Days / 3 Nights', days: 4, nights: 3, bookingDate: '2026-09-15', totalPrice: 68000, status: 'Cancelled', stage: 'cancelled', departureDate: '2026-10-05', customerName: 'Arjun Nair', contactDetails: '+91 98777 99001', email: 'arjun.n@techcorp.com', paymentType: 'Postpaid', paidAmount: 20000, pendingAmount: 48000, paymentStatus: 'Partial', invoiceNo: 'INV-2026-0840', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', completedChecklist: [] }
];


export const mockTransactions = [
  { id: 'TXN-998120', applicationName: 'VISA-301 (France Tourist)', customerName: 'Vikramaditya Roy', transactionType: 'Visa Fee', amount: 18500, extendedBookingAmount: 0, paymentType: 'Prepaid', paymentStatus: 'Paid', transactionDate: '2026-10-02', invoice: 'INV-998120', serviceType: 'Visa' },
  { id: 'TXN-998144', applicationName: 'VISA-302 (UK Visitor)', customerName: 'Sanya Malhotra', transactionType: 'Visa Deposit', amount: 10000, extendedBookingAmount: 0, paymentType: 'Postpaid', paymentStatus: 'Partially Paid', transactionDate: '2026-10-05', invoice: 'INV-998144', serviceType: 'Visa' },
  { id: 'TXN-998200', applicationName: 'PKG-701 (Bali Package)', customerName: 'Sanya Malhotra', transactionType: 'Holiday Tour', amount: 85000, extendedBookingAmount: 15000, paymentType: 'Prepaid', paymentStatus: 'Paid', transactionDate: '2026-10-01', invoice: 'INV-2026-0881', serviceType: 'Holiday' }
];

export const mockReportsMetrics = {
  approvalRate: '94.2%',
  avgApplicationCycle: '4.5 Days',
  customerConversionRate: '28.6%',
  totalRevenue: '₹1,48,50,000',
  visaApplications: 86,
  holidayApplications: 42,
  totalLeads: 156,
  convertedLeads: 44,
  rejectedApplications: 6,
  pendingApplications: 18,
  completedApplications: 104
};

export const mockStaffMembers = [
  { employeeId: 'CO-101', name: 'Amit Verma', email: 'amit.v@rhglobal.com', role: 'Senior Case Officer', department: 'Visa Operations', status: 'Active', assignedApps: 8, assignedLeads: 14, currentWorkload: 'High (8 Active)' },
  { employeeId: 'CO-102', name: 'Priya Singh', email: 'priya.s@rhglobal.com', role: 'Holiday Specialist', department: 'Tour Operations', status: 'Active', assignedApps: 6, assignedLeads: 10, currentWorkload: 'Moderate (6 Active)' },
  { employeeId: 'CO-103', name: 'Rohan Das', email: 'rohan.d@rhglobal.com', role: 'Sub-Admin Staff', department: 'Customer Support', status: 'Active', assignedApps: 4, assignedLeads: 8, currentWorkload: 'Normal (4 Active)' }
];

export const mockReviews = [
  { id: 'REV-01', customerName: 'Vikramaditya Roy', bookingId: 'PKG-701', packageName: 'Bali Island Beach Getaway', destination: 'Bali', rating: 5, review: 'Exceptional visa processing speed and hotel bookings were seamless!', date: '2026-10-04', status: 'Published', webStatus: 'Visible' },
  { id: 'REV-02', customerName: 'Sanya Malhotra', bookingId: 'VISA-302', packageName: 'UK Tourist Visa', destination: 'United Kingdom', rating: 4, review: 'Staff Priya helped step-by-step with document uploads.', date: '2026-10-06', status: 'Pending Review', webStatus: 'Hidden' }
];

export const mockCountries = [
  { countryName: 'United States', countryCode: 'US', status: 'Active' },
  { countryName: 'United Kingdom', countryCode: 'GB', status: 'Active' },
  { countryName: 'Schengen (France/Germany/Swiss)', countryCode: 'EU', status: 'Active' },
  { countryName: 'Japan', countryCode: 'JP', status: 'Active' },
  { countryName: 'Australia', countryCode: 'AU', status: 'Inactive' }
];

export const mockVisaDocumentsMatrix = [
  { country: 'United States', visaType: 'B1/B2 Tourist/Business', requiredDocument: 'DS-160 Confirmation Page', mandatory: 'Mandatory', status: 'Active' },
  { country: 'United States', visaType: 'B1/B2 Tourist/Business', requiredDocument: 'Bank Statements (6 Months)', mandatory: 'Mandatory', status: 'Active' },
  { country: 'Schengen (France)', visaType: 'Tourist Visa C', requiredDocument: 'Flight Cover & Hotel Reservation', mandatory: 'Mandatory', status: 'Active' },
  { country: 'United Kingdom', visaType: 'Standard Visitor', requiredDocument: 'Employment NOC Letter', mandatory: 'Mandatory', status: 'Active' }
];

export const mockHolidayPackages = [
  { packageId: 'PKG-701', packageName: 'Bali Island Beach Getaway', country: 'Indonesia', destination: 'Bali', duration: '6 Days / 5 Nights', days: 6, nights: 5, price: 85000, description: 'Luxury beachfront villa stay with private tours and airport transfers.', status: 'Active', inclusions: 'Hotels, Breakfast, Sightseeing, Airport Transfers', exclusions: 'Personal Expenses, Visa Fee', requiredDocs: ['Passport (Valid 6+ Months)', '2 Passport Photographs', 'Travel Insurance'] },
  { packageId: 'PKG-702', packageName: 'Swiss Alps & Paris Highlights', country: 'France & Switzerland', destination: 'Paris & Zurich', duration: '8 Days / 7 Nights', days: 8, nights: 7, price: 210000, description: 'Eiffel Tower tour, Lucerne lake cruise, and Mount Titlis cable car ride.', status: 'Active', inclusions: '4-Star Hotels, Rail Pass, Excursions', exclusions: 'International Airfare, Lunch & Dinner', requiredDocs: ['Passport', 'Schengen Visa', 'Bank Statement', 'Travel Insurance'] }
];

export const mockVisaPackages = [
  { id: 'VP-101', country: 'United States', visaType: 'B1/B2 Tourist/Business', processingType: 'Standard', estimatedTime: '15-20 Working Days', price: 21000, status: 'Active', requiredDocs: ['Passport', 'DS-160 Form', 'Photograph', 'Bank Statement', 'Employment Proof'] },
  { id: 'VP-102', country: 'Schengen (France)', visaType: 'Tourist Visa C', processingType: 'Express', estimatedTime: '7-10 Working Days', price: 18500, status: 'Active', requiredDocs: ['Passport', 'Flight & Hotel Cover', 'Travel Insurance', '6 Month Bank Statement'] },
  { id: 'VP-103', country: 'United Kingdom', visaType: 'Standard Visitor', processingType: 'Standard', estimatedTime: '12-15 Working Days', price: 24000, status: 'Active', requiredDocs: ['Passport', 'Employment NOC', 'Income Tax Returns', 'Property Documents'] }
];


