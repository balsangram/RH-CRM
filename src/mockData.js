// Comprehensive Mock Data adhering strictly to the PDF specification

export const mockSummaryCards = {
  totalCompanies: 12,
  totalTravelers: 148,
  totalStaffs: 8,
  totalLeads: 42
};

export const mockRecentLeads = [
  { id: 'LD-1001', leadName: 'Rahul Sharma', companyName: 'Apex Tours & Tech', email: 'rahul.s@apextours.com', phone: '+91 98765 43210', leadType: 'Visa', source: 'Website', status: 'Pending', createdDate: '2026-10-08', actions: ['View', 'Edit', 'Delete'] },
  { id: 'LD-1002', leadName: 'Ananya Roy', companyName: 'Individual', email: 'ananya.roy@gmail.com', phone: '+91 98123 45678', leadType: 'Holiday', source: 'Referral', status: 'In Progress', createdDate: '2026-10-07', actions: ['View', 'Edit', 'Delete'] },
  { id: 'LD-1003', leadName: 'David Miller', companyName: 'Global Horizons Inc', email: 'dmiller@ghorizons.com', phone: '+1 415 555 0192', leadType: 'Visa', source: 'Website', status: 'Converted', createdDate: '2026-10-06', actions: ['View', 'Edit', 'Delete'] },
  { id: 'LD-1004', leadName: 'Priya Patel', companyName: 'Individual', email: 'priya.patel@yahoo.com', phone: '+91 97654 32109', leadType: 'Holiday', source: 'Other', status: 'No Response', createdDate: '2026-10-05', actions: ['View', 'Edit', 'Delete'] },
  { id: 'LD-1005', leadName: 'Vikram Seth', companyName: 'Zenith Consultancy', email: 'v.seth@zenith.in', phone: '+91 99000 11223', leadType: 'Visa', source: 'Website', status: 'Rejected/Closed', createdDate: '2026-10-04', actions: ['View', 'Edit', 'Delete'] }
];

export const mockRejectedApplications = [
  { id: 'APP-9081', applicantName: 'Karan Mehra', applicationType: 'Visa (Tourist)', country: 'United Kingdom', rejectionDate: '2026-10-05', rejectionReason: 'Incomplete Bank Statements', status: 'Rejected' },
  { id: 'APP-9042', applicantName: 'Suresh Menon', applicationType: 'Visa (Business)', country: 'Schengen (Germany)', rejectionDate: '2026-09-28', rejectionReason: 'Invalid Invitation Letter', status: 'Rejected' },
  { id: 'APP-8990', applicantName: 'Neha Gupta', applicationType: 'Holiday Tour', country: 'Japan', rejectionDate: '2026-09-20', rejectionReason: 'Passport Validity < 6 Months', status: 'Rejected' }
];

export const mockLeadsFull = [
  ...mockRecentLeads,
  { id: 'LD-1006', leadName: 'Siddharth Rao', companyName: 'TechCorp Pvt Ltd', email: 's.rao@techcorp.com', phone: '+91 98888 77766', leadType: 'Visa', source: 'Website', status: 'In Progress', createdDate: '2026-10-03', targetCountry: 'United States', serviceRequired: 'B1/B2 Visa', remarks: 'Requires urgent processing for conference.', assignedStaff: 'Officer Amit Verma', updatedDate: '2026-10-08' },
  { id: 'LD-1007', leadName: 'Meera Nair', companyName: 'Individual', email: 'meera.nair@hotmail.com', phone: '+91 97777 66655', leadType: 'Holiday', source: 'Referral', status: 'Pending', createdDate: '2026-10-02', targetCountry: 'Switzerland', serviceRequired: '7 Days Alps Package', remarks: 'Honeymoon trip request.', assignedStaff: 'Staff Priya Singh', updatedDate: '2026-10-05' }
];

export const mockCompanies = [
  { id: 'CMP-01', companyName: 'RH Global Enterprises', registrationDetails: 'REG-2021-99482', contactPerson: 'Rajesh Kumar', email: 'contact@rhglobal.com', phone: '+91 11 4000 5500', address: '102 Tech Park, Cyber City, Gurgaon', country: 'India', status: 'Active', totalCustomers: 34, totalApplications: 62 },
  { id: 'CMP-02', companyName: 'Apex Tours & Tech', registrationDetails: 'REG-2019-44120', contactPerson: 'Sunil Mehta', email: 'info@apextours.com', phone: '+91 22 2800 1122', address: '45 BKC Complex, Mumbai', country: 'India', status: 'Active', totalCustomers: 18, totalApplications: 29 },
  { id: 'CMP-03', companyName: 'Zenith Consultancy', registrationDetails: 'REG-2023-11002', contactPerson: 'Alok Verma', email: 'admin@zenith.in', phone: '+91 80 6711 9900', address: '12 MG Road, Bangalore', country: 'India', status: 'Inactive', totalCustomers: 5, totalApplications: 8 }
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
  { id: 'VISA-301', applicantName: 'Vikramaditya Roy', country: 'Schengen (France)', visaType: 'Tourist C', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', applicationDate: '2026-10-02', status: 'Under Review', paymentType: 'Prepaid', totalAmount: 18500, paidAmount: 18500, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-10-02', paymentRef: 'TXN-998120', documentStatus: 'Docs Verified' },
  { id: 'VISA-302', applicantName: 'Sanya Malhotra', country: 'United Kingdom', visaType: 'Standard Visitor', caseOfficerName: 'Priya Singh', caseOfficerId: 'CO-102', applicationDate: '2026-10-05', status: 'Pending', paymentType: 'Postpaid', totalAmount: 24000, paidAmount: 10000, pendingAmount: 14000, paymentStatus: 'Partially Paid', paymentDate: '2026-10-05', paymentRef: 'TXN-998144', documentStatus: 'Pending Verification' },
  { id: 'VISA-303', applicantName: 'Rohan Joshi', country: 'United States', visaType: 'B1/B2 Business', caseOfficerName: 'Amit Verma', caseOfficerId: 'CO-101', applicationDate: '2026-09-20', status: 'Approved', paymentType: 'Prepaid', totalAmount: 21000, paidAmount: 21000, pendingAmount: 0, paymentStatus: 'Completed', paymentDate: '2026-09-20', paymentRef: 'TXN-997500', documentStatus: 'Visa Uploaded' }
];

export const mockBookingServices = [
  { packageId: 'PKG-701', packageName: 'Bali Island Beach Getaway', destination: 'Bali, Indonesia', duration: '6 Days / 5 Nights', days: 6, nights: 5, bookingDate: '2026-10-01', totalPrice: 85000, status: 'Active', departureDate: '2026-11-15', customerName: 'Sanya Malhotra', contactDetails: '+91 98111 55443', email: 'sanya.m@gmail.com', paymentType: 'Prepaid', paidAmount: 85000, pendingAmount: 0, paymentStatus: 'Paid', invoiceNo: 'INV-2026-0881' },
  { packageId: 'PKG-702', packageName: 'Swiss Alps & Paris Highlights', destination: 'France & Switzerland', duration: '8 Days / 7 Nights', days: 8, nights: 7, bookingDate: '2026-09-28', totalPrice: 210000, status: 'Pending', departureDate: '2026-12-01', customerName: 'Deepak Chopra', contactDetails: '+91 98200 22222', email: 'deepak.c@rhglobal.com', paymentType: 'Postpaid', paidAmount: 50000, pendingAmount: 160000, paymentStatus: 'Partial', invoiceNo: 'INV-2026-0865' }
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


