import React, { useState } from 'react';
import { LEAD_STAGES, LEAD_SOURCES, LEAD_TYPES } from '../mockData';

export default function LeadsKanban({
  leads = [],
  onUpdateLead,
  onAddLead,
  onDeleteLead,
  staffMembers = [],
  onNavigateToTab
}) {
  // View mode: 'kanban' or 'table'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [searchOption, setSearchOption] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers state
  const [activeSideSheetLead, setActiveSideSheetLead] = useState(null);
  const [proposalModalLead, setProposalModalLead] = useState(null);
  const [convertModalLead, setConvertModalLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [checklistWarning, setChecklistWarning] = useState(null);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Proposal Creator Form State
  const [proposalForm, setProposalForm] = useState({
    quotationNo: '',
    validUntil: '',
    taxPercent: 18,
    discount: 0,
    status: 'Sent to Client',
    notes: 'Payment term: 50% advance upon contract signing. Visa fees non-refundable by embassy.',
    items: [
      { desc: 'Consultation & Application Processing Fee', qty: 1, rate: 15000 },
      { desc: 'Expedited Appointment & Biometrics Support', qty: 1, rate: 8000 }
    ]
  });
  const [proposalPreviewMode, setProposalPreviewMode] = useState(false);

  // Convert to Case Form State
  const [convertForm, setConvertForm] = useState({
    caseId: '',
    assignedStaff: 'Amit Verma',
    staffSpecialty: 'Visa Specialist',
    caseType: 'Visa Application',
    orderType: 'Prepaid Order', // 'Prepaid Order' | 'Postpaid Order'
    paymentOption: 'Full Payment (100%)', // 'Full Payment' | 'Partial Payment (50%)'
    totalAmount: 35000,
    notes: 'Lead successfully qualified and converted. Priority onboarding required.'
  });

  // Add Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    leadName: '',
    companyName: '',
    email: '',
    phone: '',
    leadType: 'Visa',
    source: 'Website Form',
    stage: 'lead',
    targetCountry: '',
    serviceRequired: '',
    estimatedValue: 25000,
    assignedStaff: 'Unassigned',
    remarks: ''
  });

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    if (typeFilter !== 'All' && lead.leadType !== typeFilter) return false;
    if (sourceFilter !== 'All' && lead.source !== sourceFilter) return false;
    if (staffFilter !== 'All' && lead.assignedStaff !== staffFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (lead.leadName || '').toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const phone = (lead.phone || '').toLowerCase();
      const company = (lead.companyName || '').toLowerCase();
      const country = (lead.targetCountry || '').toLowerCase();
      const id = (lead.id || '').toLowerCase();
      const staff = (lead.assignedStaff || '').toLowerCase();
      const service = (lead.serviceRequired || '').toLowerCase();
      const quotation = (lead.proposalData?.quotationNo || '').toLowerCase();
      const caseId = (lead.caseId || '').toLowerCase();
      const remarks = (lead.remarks || '').toLowerCase();

      if (searchOption === 'all') {
        const matched = name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          company.includes(q) ||
          country.includes(q) ||
          id.includes(q) ||
          staff.includes(q) ||
          service.includes(q) ||
          quotation.includes(q) ||
          caseId.includes(q) ||
          remarks.includes(q);
        if (!matched) return false;
      } else if (searchOption === 'leadName') {
        if (!name.includes(q)) return false;
      } else if (searchOption === 'phone') {
        if (!phone.includes(q)) return false;
      } else if (searchOption === 'email') {
        if (!email.includes(q)) return false;
      } else if (searchOption === 'assignedStaff') {
        if (!staff.includes(q)) return false;
      } else if (searchOption === 'companyName') {
        if (!company.includes(q)) return false;
      } else if (searchOption === 'targetCountry') {
        if (!country.includes(q)) return false;
      } else if (searchOption === 'serviceRequired') {
        if (!service.includes(q)) return false;
      } else if (searchOption === 'quotationNo') {
        if (!quotation.includes(q) && !caseId.includes(q)) return false;
      }
    }
    return true;
  });

  // Helpers to get leads by stage
  const getLeadsByStage = (stageId) => {
    return filteredLeads.filter(l => (l.stage || 'lead') === stageId);
  };

  // Helper stage indices
  const getStageIndex = (stageId) => {
    return LEAD_STAGES.findIndex(s => s.id === stageId);
  };

  // Check if mandatory items are completed in current stage
  const areMandatoryItemsCompleted = (lead) => {
    if (!lead || !lead.checklist || lead.checklist.length === 0) return true;
    const incompleteMandatory = lead.checklist.filter(item => item.mandatory && !item.completed);
    return incompleteMandatory.length === 0;
  };

  // Advance Stage
  const handleAdvanceStage = (lead, targetStageId = null, bypassChecklist = false) => {
    const currentIndex = getStageIndex(lead.stage || 'lead');
    let nextStageId = targetStageId;
    if (!nextStageId) {
      if (currentIndex < LEAD_STAGES.length - 1) {
        nextStageId = LEAD_STAGES[currentIndex + 1].id;
      } else {
        return;
      }
    }

    // Verify checklist if moving forward
    const nextIndex = getStageIndex(nextStageId);
    if (nextIndex > currentIndex && !bypassChecklist && !areMandatoryItemsCompleted(lead)) {
      setChecklistWarning({
        lead,
        targetStageId: nextStageId,
        missingCount: lead.checklist.filter(i => i.mandatory && !i.completed).length
      });
      return;
    }

    // If moving to converted, prompt convert to case modal
    let updatedLead = {
      ...lead,
      stage: nextStageId,
      status: nextStageId === 'converted' ? 'Converted to Case' : `${LEAD_STAGES[nextIndex].shortName} in Progress`
    };

    // If new stage has default checklist for that stage, refresh checklist template
    if (nextStageId !== lead.stage) {
      updatedLead = applyStageChecklist(updatedLead, nextStageId);
    }

    onUpdateLead(updatedLead);
    if (activeSideSheetLead && activeSideSheetLead.id === lead.id) {
      setActiveSideSheetLead(updatedLead);
    }
    setChecklistWarning(null);

    // If converted, offer case conversion
    if (nextStageId === 'converted' && !lead.caseId) {
      openConvertModal(updatedLead);
    }
  };

  // Move to Previous Stage
  const handlePreviousStage = (lead) => {
    const currentIndex = getStageIndex(lead.stage || 'lead');
    if (currentIndex > 0) {
      const prevStageId = LEAD_STAGES[currentIndex - 1].id;
      let updatedLead = {
        ...lead,
        stage: prevStageId,
        status: `${LEAD_STAGES[currentIndex - 1].shortName} in Progress`
      };
      updatedLead = applyStageChecklist(updatedLead, prevStageId);
      onUpdateLead(updatedLead);
      if (activeSideSheetLead && activeSideSheetLead.id === lead.id) {
        setActiveSideSheetLead(updatedLead);
      }
    }
  };

  // Apply default checklist for stage if needed
  const applyStageChecklist = (lead, stageId) => {
    const stageChecklists = {
      lead: [
        { id: 'c1', label: 'Initial contact made with applicant', completed: true, mandatory: true },
        { id: 'c2', label: 'Understand travel purpose, country & dates', completed: true, mandatory: true },
        { id: 'c3', label: 'Log applicant KYC and source details', completed: true, mandatory: false }
      ],
      qualified: [
        { id: 'c1', label: 'Passport validity checked (> 6 months)', completed: true, mandatory: true },
        { id: 'c2', label: 'Travel dates & passenger count confirmed', completed: true, mandatory: true },
        { id: 'c3', label: 'Budget & eligibility criteria met', completed: false, mandatory: true }
      ],
      proposal: [
        { id: 'c1', label: 'Draft detailed itinerary & inclusions', completed: true, mandatory: true },
        { id: 'c2', label: 'Generate quotation with pricing breakdown', completed: Boolean(lead.proposalData), mandatory: true },
        { id: 'c3', label: 'Send proposal document to client', completed: Boolean(lead.proposalData), mandatory: true }
      ],
      negotiation: [
        { id: 'c1', label: 'Address client revisions & queries', completed: true, mandatory: true },
        { id: 'c2', label: 'Review special discounts or custom terms', completed: true, mandatory: true },
        { id: 'c3', label: 'Finalize payment milestone schedule', completed: false, mandatory: true }
      ],
      converted: [
        { id: 'c1', label: 'Client confirmation & agreement received', completed: true, mandatory: true },
        { id: 'c2', label: 'Select order type (Prepaid / Postpaid)', completed: true, mandatory: true },
        { id: 'c3', label: 'Create Case and assign Case Officer', completed: Boolean(lead.caseId), mandatory: true }
      ]
    };

    return {
      ...lead,
      checklist: stageChecklists[stageId] || lead.checklist || []
    };
  };

  // Toggle checklist item
  const handleToggleChecklist = (lead, itemId) => {
    const currentList = lead.checklist || [];
    const updatedList = currentList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const updatedLead = { ...lead, checklist: updatedList };
    onUpdateLead(updatedLead);
    if (activeSideSheetLead && activeSideSheetLead.id === lead.id) {
      setActiveSideSheetLead(updatedLead);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = draggedLeadId || e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stage === targetStageId) return;

    handleAdvanceStage(lead, targetStageId);
    setDraggedLeadId(null);
  };

  // Open Proposal Creator Modal
  const openProposalModal = (lead) => {
    const currentProp = lead.proposalData;
    const baseItems = lead.leadType === 'Visa'
      ? [
          { desc: `${lead.targetCountry || 'International'} ${lead.serviceRequired || 'Visa'} Embassy Fee`, qty: 1, rate: 16500 },
          { desc: 'Priority Appointment & Document Verification Service', qty: 1, rate: 12000 },
          { desc: 'Dedicated Case Officer Concierge', qty: 1, rate: 6500 }
        ]
      : [
          { desc: `${lead.targetCountry || 'Holiday'} Accommodation (Luxury Stay)`, qty: 1, rate: 85000 },
          { desc: 'Airport Transfers & Local Sightseeing Tours', qty: 2, rate: 18000 },
          { desc: 'Complimentary Travel Insurance & Activity Passes', qty: 2, rate: 7000 }
        ];

    setProposalForm({
      quotationNo: currentProp?.quotationNo || `QUO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      validUntil: currentProp?.validUntil || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      taxPercent: currentProp?.taxPercent ?? (lead.leadType === 'Visa' ? 18 : 5),
      discount: currentProp?.discount ?? (lead.estimatedValue ? Math.round(lead.estimatedValue * 0.05) : 2000),
      status: currentProp?.status || 'Sent to Client',
      notes: 'Payment term: 50% advance upon contract signing. Remaining due 7 days prior to service date.',
      items: currentProp?.items || baseItems
    });
    setProposalPreviewMode(false);
    setProposalModalLead(lead);
  };

  // Calculate Quotation Totals
  const calculateProposalTotals = () => {
    const subtotal = proposalForm.items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.rate) || 0), 0);
    const discount = Number(proposalForm.discount) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(taxable * ((Number(proposalForm.taxPercent) || 0) / 100));
    const total = taxable + taxAmount;
    return { subtotal, discount, taxable, taxAmount, total };
  };

  // Save Proposal to Lead
  const handleSaveProposal = () => {
    if (!proposalModalLead) return;
    const { total } = calculateProposalTotals();
    const updatedProposalData = {
      ...proposalForm,
      totalAmount: total
    };

    let updatedLead = {
      ...proposalModalLead,
      proposalData: updatedProposalData,
      estimatedValue: total,
      // If still in stage 1 or 2, automatically move to Stage 3: Proposal as per the flow!
      stage: (getStageIndex(proposalModalLead.stage) < getStageIndex('proposal')) ? 'proposal' : proposalModalLead.stage,
      status: 'Proposal Sent'
    };

    // Update checklist item in stage 3
    if (updatedLead.checklist) {
      updatedLead.checklist = updatedLead.checklist.map(item => {
        if (item.label.toLowerCase().includes('quotation') || item.label.toLowerCase().includes('proposal')) {
          return { ...item, completed: true };
        }
        return item;
      });
    }

    onUpdateLead(updatedLead);
    if (activeSideSheetLead && activeSideSheetLead.id === updatedLead.id) {
      setActiveSideSheetLead(updatedLead);
    }
    setProposalModalLead(null);
    alert(`Proposal & Quotation #${updatedProposalData.quotationNo} successfully created and attached to lead "${updatedLead.leadName}"!`);
  };

  // Open Convert to Case Modal
  const openConvertModal = (lead) => {
    const nextCaseId = lead.caseId || `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    setConvertForm({
      caseId: nextCaseId,
      assignedStaff: lead.assignedStaff && lead.assignedStaff !== 'Unassigned' ? lead.assignedStaff : (staffMembers[0]?.name || 'Amit Verma'),
      staffSpecialty: lead.leadType === 'Visa' ? 'Visa Operations' : 'Tour Operations',
      caseType: lead.leadType === 'Visa' ? 'Visa Application' : 'Holiday Package Booking',
      orderType: 'Prepaid Order',
      paymentOption: 'Full Payment (100%)',
      totalAmount: lead.proposalData?.totalAmount || lead.estimatedValue || 35000,
      notes: `Converted from Lead ${lead.id} (${lead.leadName}). Handed off to operations team.`
    });
    setConvertModalLead(lead);
  };

  // Confirm Convert to Case
  const handleConfirmConvert = () => {
    if (!convertModalLead) return;
    const updatedLead = {
      ...convertModalLead,
      stage: 'converted',
      status: 'Converted to Case',
      caseId: convertForm.caseId,
      assignedStaff: convertForm.assignedStaff,
      orderType: convertForm.orderType,
      paymentOption: convertForm.paymentOption,
      checklist: (convertModalLead.checklist || []).map(item => ({ ...item, completed: true }))
    };

    onUpdateLead(updatedLead);
    if (activeSideSheetLead && activeSideSheetLead.id === updatedLead.id) {
      setActiveSideSheetLead(updatedLead);
    }
    setConvertModalLead(null);
    alert(`🎉 Success! Lead "${updatedLead.leadName}" has been successfully converted into active Case #${convertForm.caseId} and assigned to ${convertForm.assignedStaff}!`);
  };

  // Handle Add Lead
  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.leadName || !newLeadForm.email) {
      alert('Please enter at least Lead Name and Email.');
      return;
    }

    const newId = `LD-${Math.floor(1020 + Math.random() * 8900)}`;
    const createdLead = {
      id: newId,
      ...newLeadForm,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'New Inquiry',
      checklist: [
        { id: 'c1', label: 'Initial contact made with applicant', completed: true, mandatory: true },
        { id: 'c2', label: 'Understand travel purpose and dates', completed: false, mandatory: true },
        { id: 'c3', label: 'Log applicant KYC and source details', completed: false, mandatory: false }
      ],
      proposalData: null,
      caseId: null
    };

    onAddLead(createdLead);
    setShowAddLeadModal(false);
    setNewLeadForm({
      leadName: '',
      companyName: '',
      email: '',
      phone: '',
      leadType: 'Visa',
      source: 'Website Form',
      stage: 'lead',
      targetCountry: '',
      serviceRequired: '',
      estimatedValue: 25000,
      assignedStaff: 'Unassigned',
      remarks: ''
    });
    alert(`Lead ${newId} (${createdLead.leadName}) added successfully!`);
  };

  // Stage Metrics Calculation
  const totalLeadsCount = leads.length;
  const stageCounts = LEAD_STAGES.reduce((acc, st) => {
    acc[st.id] = leads.filter(l => (l.stage || 'lead') === st.id).length;
    return acc;
  }, {});
  const convertedCount = stageCounts['converted'] || 0;
  const conversionRate = totalLeadsCount > 0 ? ((convertedCount / totalLeadsCount) * 100).toFixed(1) : 0;
  const totalPipelineValue = leads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);

  return (
    <div className="kanban-wrapper">
      {/* 1. Header Toolbar */}
      <div className="section-box" style={{ marginBottom: '16px' }}>
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Leads Management &mdash; Stage Pipeline</span>
              <span className="nav-badge" style={{ fontSize: '11px', textTransform: 'none' }}>
                {filteredLeads.length} of {totalLeadsCount} Leads
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Flow: <strong>Website / Social / Direct</strong> &rarr; <strong>Stage 1: Lead</strong> &rarr; <strong>Stage 2: Qualified</strong> &rarr; <strong>Stage 3: Proposal</strong> (with Quotation Creator) &rarr; <strong>Stage 4: Negotiation</strong> &rarr; <strong>Converted</strong> &rarr; <strong>Cases</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ border: '1px solid #000', display: 'flex' }}>
              <button
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0 }}
                onClick={() => setViewMode('kanban')}
                title="Switch to Interactive Kanban Board"
              >
                ☷ Kanban Board
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000' }}
                onClick={() => setViewMode('table')}
                title="Switch to Compact Table View"
              >
                ☰ Table View
              </button>
            </div>

            <button className="btn btn-primary" onClick={() => setShowAddLeadModal(true)}>
              + Add Lead
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="toolbar" style={{ marginBottom: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label>Lead Type:</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="All">All Types ({leads.length})</option>
                <option value="Visa">Visa ({leads.filter(l => l.leadType === 'Visa').length})</option>
                <option value="Holiday">Holiday ({leads.filter(l => l.leadType === 'Holiday').length})</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Source:</label>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                <option value="All">All Sources</option>
                {LEAD_SOURCES.map(src => (
                  <option key={src} value={src}>
                    {src} ({leads.filter(l => l.source === src).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Staff:</label>
              <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
                <option value="All">All Staff</option>
                {Array.from(new Set(leads.map(l => l.assignedStaff).filter(Boolean))).map(stf => (
                  <option key={stf} value={stf}>{stf}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search Option:</label>
              <select value={searchOption} onChange={e => setSearchOption(e.target.value)}>
                <option value="all">All Fields</option>
                <option value="leadName">Name</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="assignedStaff">Assigned Staff</option>
                <option value="companyName">Company</option>
                <option value="targetCountry">Country</option>
                <option value="serviceRequired">Service / Package</option>
                <option value="quotationNo">Quotation / Case ID</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder={
                  searchOption === 'phone' ? 'Search phone number...' :
                  searchOption === 'assignedStaff' ? 'Search staff (Amit, Priya)...' :
                  searchOption === 'serviceRequired' ? 'Search service / package...' :
                  searchOption === 'quotationNo' ? 'Search QUO# or CASE#...' :
                  searchOption === 'companyName' ? 'Search company name...' :
                  searchOption === 'targetCountry' ? 'Search country / destination...' :
                  'Name, phone, staff, package, QUO#...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '230px' }}
              />
              {(searchQuery || typeFilter !== 'All' || sourceFilter !== 'All' || staffFilter !== 'All' || searchOption !== 'all') && (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('All');
                    setSourceFilter('All');
                    setStaffFilter('All');
                    setSearchOption('all');
                  }}
                  title="Clear all filters"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#555' }}>
            Est. Pipeline Value: <strong>₹{totalPipelineValue.toLocaleString('en-IN')}</strong> &bull; Conversion Rate: <strong>{conversionRate}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Top Pipeline Visual Stepper & Metrics Strip */}
      <div className="pipeline-metrics-bar">
        {LEAD_STAGES.map((st, idx) => {
          const count = stageCounts[st.id] || 0;
          const stageTotal = leads
            .filter(l => (l.stage || 'lead') === st.id)
            .reduce((sum, l) => sum + (Number(l.estimatedValue) || 0), 0);

          return (
            <React.Fragment key={st.id}>
              <div className={`pipeline-metric-step ${st.id === 'converted' ? 'converted-step' : ''}`}>
                <div className="step-badge-number">{idx + 1}</div>
                <div className="step-info">
                  <div className="step-title">{st.shortName}</div>
                  <div className="step-stats">
                    <strong>{count} Leads</strong> &bull; ₹{(stageTotal / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
              {idx < LEAD_STAGES.length - 1 && (
                <div className="pipeline-arrow">&rarr;</div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Checklist Warning Banner if blocked from advancing without completing mandatory items */}
      {checklistWarning && (
        <div className="checklist-warning-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>
              <strong>Mandatory Checklist Incomplete:</strong> Lead "<strong>{checklistWarning.lead.leadName}</strong>" has{' '}
              <strong>{checklistWarning.missingCount} mandatory checklist items pending</strong> in its current stage.
              <span style={{ display: 'block', fontSize: '11px', color: '#555', marginTop: '2px' }}>
                As discussed in the workflow, mandatory items must be completed before advancing stages.
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setActiveSideSheetLead(checklistWarning.lead)}
            >
              Open Side Sheet & Complete Items
            </button>
            <button
              className="btn btn-sm"
              onClick={() => handleAdvanceStage(checklistWarning.lead, checklistWarning.targetStageId, true)}
            >
              Override & Force Advance
            </button>
            <button className="btn btn-sm" onClick={() => setChecklistWarning(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* 3. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board-container">
          <div className="kanban-columns-grid">
            {LEAD_STAGES.map((stage, colIdx) => {
              const stageLeads = getLeadsByStage(stage.id);
              const isDropTarget = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`kanban-column ${isDropTarget ? 'kanban-column-drop-active' : ''} ${stage.id === 'converted' ? 'kanban-column-converted' : ''}`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className="kanban-column-header">
                    <div>
                      <div className="kanban-column-title">
                        {stage.name}
                        <span className="kanban-count-pill">{stageLeads.length}</span>
                      </div>
                      <div className="kanban-column-desc">{stage.description}</div>
                    </div>
                  </div>

                  {/* Stage-specific Quick Banner */}
                  {stage.id === 'proposal' && (
                    <div className="stage-banner-callout">
                      <span>⚡ Stage 3: Proposal Creator with Quotation enabled</span>
                    </div>
                  )}
                  {stage.id === 'converted' && (
                    <div className="stage-banner-callout" style={{ backgroundColor: '#f4f4f4' }}>
                      <span>🚀 Ready for Cases & Staff Assignment</span>
                    </div>
                  )}

                  {/* Cards List */}
                  <div className="kanban-cards-list">
                    {stageLeads.length === 0 ? (
                      <div className="kanban-empty-column">
                        <div style={{ color: '#888', fontSize: '12px' }}>No leads in this stage</div>
                        <div style={{ color: '#aaa', fontSize: '10px', marginTop: '4px' }}>Drag cards here to advance</div>
                      </div>
                    ) : (
                      stageLeads.map(lead => {
                        const isBeingDragged = draggedLeadId === lead.id;
                        const mandatoryDone = areMandatoryItemsCompleted(lead);
                        const hasProposal = Boolean(lead.proposalData);
                        const hasCase = Boolean(lead.caseId);

                        return (
                          <div
                            key={lead.id}
                            className={`kanban-card ${isBeingDragged ? 'kanban-card-dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                          >
                            {/* Card Top Meta */}
                            <div className="kanban-card-header">
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span className="kanban-type-badge">
                                  {lead.leadType}
                                </span>
                                <span className="kanban-source-badge" title={`Source: ${lead.source}`}>
                                  {lead.source === 'Website Form' ? '🌐 Web' : lead.source === 'FB / Instagram' ? '📱 Social' : '✍️ Direct'}
                                </span>
                              </div>
                              <span className="kanban-lead-id">{lead.id}</span>
                            </div>

                            {/* Card Title & Company */}
                            <div className="kanban-card-body" onClick={() => setActiveSideSheetLead(lead)}>
                              <div className="kanban-lead-name">{lead.leadName}</div>
                              <div className="kanban-company-text">
                                {lead.companyName && lead.companyName !== 'Individual' ? `🏢 ${lead.companyName}` : '👤 Individual Traveler'}
                              </div>

                              {/* Destination & Service */}
                              <div className="kanban-service-row">
                                <span style={{ fontWeight: '600' }}>📍 {lead.targetCountry || 'Global'}</span>
                                {lead.serviceRequired && (
                                  <span className="kanban-service-tag">&bull; {lead.serviceRequired}</span>
                                )}
                              </div>

                              {/* Value & Staff */}
                              <div className="kanban-value-row">
                                <span className="kanban-val">
                                  ₹{(Number(lead.estimatedValue) || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="kanban-assigned" title="Assigned Case Officer">
                                  {lead.assignedStaff ? `👤 ${lead.assignedStaff}` : 'Unassigned'}
                                </span>
                              </div>

                              {/* Stage 3 Special Indicator: Proposal & Quotation */}
                              {hasProposal && (
                                <div className="kanban-quotation-chip">
                                  <span>📄 Quotation #{lead.proposalData.quotationNo}</span>
                                  <strong>₹{Number(lead.proposalData.totalAmount).toLocaleString('en-IN')}</strong>
                                </div>
                              )}

                              {/* Stage 5 Special Indicator: Converted to Case */}
                              {hasCase && (
                                <div className="kanban-case-chip">
                                  <span>📁 Case Active: <strong>{lead.caseId}</strong></span>
                                </div>
                              )}

                              {/* Checklist indicator */}
                              <div className="kanban-checklist-indicator">
                                <span style={{ color: mandatoryDone ? '#000' : '#d9534f' }}>
                                  {mandatoryDone ? '✓ Mandatory checks ready' : '⚠️ Checklist pending'}
                                </span>
                                <span style={{ fontSize: '10px', color: '#666' }}>
                                  {(lead.checklist || []).filter(i => i.completed).length}/{(lead.checklist || []).length}
                                </span>
                              </div>
                            </div>

                            {/* Stage-specific Actions */}
                            <div className="kanban-special-actions">
                              {stage.id === 'proposal' && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ width: '100%', fontSize: '11px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openProposalModal(lead);
                                  }}
                                >
                                  {hasProposal ? '📝 Edit Quotation' : '📄 Proposal Creator with Quotation'}
                                </button>
                              )}

                              {stage.id === 'converted' && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ width: '100%', fontSize: '11px', background: hasCase ? '#444' : '#000' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openConvertModal(lead);
                                  }}
                                >
                                  {hasCase ? '📁 View / Reassign Case' : '🚀 Convert to Case'}
                                </button>
                              )}
                            </div>

                            {/* Card Stage Stepper Controls */}
                            <div className="kanban-card-footer">
                              <button
                                className="btn btn-sm"
                                disabled={colIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviousStage(lead);
                                }}
                                title="Move to Previous Stage"
                              >
                                &larr;
                              </button>

                              <button
                                className="btn btn-sm"
                                style={{ flex: 1, fontSize: '10px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSideSheetLead(lead);
                                }}
                              >
                                Side Sheet & Details
                              </button>

                              <button
                                className="btn btn-sm btn-primary"
                                disabled={colIdx === LEAD_STAGES.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStage(lead);
                                }}
                                title="Advance to Next Stage"
                              >
                                &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 4. TABLE VIEW (Alternate View) */
        <div className="section-box">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lead Name & ID</th>
                  <th>Company</th>
                  <th>Contact Info</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Target Country</th>
                  <th>Current Stage</th>
                  <th>Est. Value</th>
                  <th>Proposal / Case</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const stageObj = LEAD_STAGES.find(s => s.id === (lead.stage || 'lead'));
                  return (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.leadName}</strong>
                        <div style={{ fontSize: '10px', color: '#666' }}>{lead.id}</div>
                      </td>
                      <td>{lead.companyName || 'Individual'}</td>
                      <td>
                        <div>{lead.email}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{lead.phone}</div>
                      </td>
                      <td><span className="status-badge">{lead.leadType}</span></td>
                      <td>
                        <span style={{ fontSize: '11px', border: '1px solid #ccc', padding: '2px 6px' }}>
                          {lead.source}
                        </span>
                      </td>
                      <td>{lead.targetCountry || 'N/A'}</td>
                      <td>
                        <span className="status-badge" style={{ fontWeight: 'bold' }}>
                          {stageObj?.shortName || lead.stage}
                        </span>
                      </td>
                      <td><strong>₹{(Number(lead.estimatedValue) || 0).toLocaleString('en-IN')}</strong></td>
                      <td>
                        {lead.caseId ? (
                          <span style={{ fontSize: '11px', border: '1px solid #000', padding: '2px 4px', background: '#000', color: '#fff' }}>
                            {lead.caseId}
                          </span>
                        ) : lead.proposalData ? (
                          <span style={{ fontSize: '11px', border: '1px solid #000', padding: '2px 4px' }}>
                            #{lead.proposalData.quotationNo}
                          </span>
                        ) : (
                          <span style={{ color: '#888', fontSize: '11px' }}>-</span>
                        )}
                      </td>
                      <td>{lead.createdDate}</td>
                      <td className="action-cell">
                        <button className="btn btn-sm" onClick={() => setActiveSideSheetLead(lead)}>
                          Side Sheet
                        </button>
                        {lead.stage === 'proposal' && (
                          <button className="btn btn-sm btn-primary" onClick={() => openProposalModal(lead)}>
                            Quotation
                          </button>
                        )}
                        {lead.stage === 'converted' && (
                          <button className="btn btn-sm btn-primary" onClick={() => openConvertModal(lead)}>
                            Case
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          disabled={getStageIndex(lead.stage) >= LEAD_STAGES.length - 1}
                          onClick={() => handleAdvanceStage(lead)}
                          title="Advance Stage"
                        >
                          &rarr; Next
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (window.confirm(`Delete lead "${lead.leadName}" (${lead.id})?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                        >
                          Del
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

      {/* 5. SIDE SHEET DRAWER (As explicitly specified in the diagram) */}
      {activeSideSheetLead && (
        <div className="side-sheet-backdrop" onClick={() => setActiveSideSheetLead(null)}>
          <div className="side-sheet-panel" onClick={e => e.stopPropagation()}>
            {/* Side Sheet Header */}
            <div className="side-sheet-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="kanban-type-badge">{activeSideSheetLead.leadType}</span>
                  <span className="kanban-source-badge">{activeSideSheetLead.source}</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>{activeSideSheetLead.id}</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>
                  {activeSideSheetLead.leadName}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {activeSideSheetLead.companyName || 'Individual Traveler'} &bull; {activeSideSheetLead.email}
                </div>
              </div>
              <button className="close-btn" onClick={() => setActiveSideSheetLead(null)}>X</button>
            </div>

            {/* Side Sheet Content */}
            <div className="side-sheet-body">
              {/* Visual Stage Progress Stepper */}
              <div className="side-sheet-section">
                <div className="side-sheet-section-title">Stage Progression Pipeline</div>
                <div className="side-sheet-stepper">
                  {LEAD_STAGES.map((st, i) => {
                    const currentIdx = getStageIndex(activeSideSheetLead.stage || 'lead');
                    const isDone = i < currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div
                        key={st.id}
                        className={`side-stepper-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                        onClick={() => handleAdvanceStage(activeSideSheetLead, st.id)}
                        title={`Click to set stage to ${st.name}`}
                      >
                        <div className="step-circle">{isDone ? '✓' : i + 1}</div>
                        <div className="step-label">{st.shortName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MANDATORY STAGE CHECKLIST (Directly matching discussion note in diagram) */}
              <div className="side-sheet-section">
                <div className="side-sheet-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Stage Checklist ({LEAD_STAGES.find(s => s.id === activeSideSheetLead.stage)?.shortName || 'Current Stage'})
                  </span>
                  <span style={{ fontSize: '11px', color: '#555', fontWeight: 'normal' }}>
                    Mandatory items required to move stage
                  </span>
                </div>

                <div className="side-checklist-box">
                  {(activeSideSheetLead.checklist || []).map(item => (
                    <label key={item.id} className="checklist-row">
                      <input
                        type="checkbox"
                        checked={Boolean(item.completed)}
                        onChange={() => handleToggleChecklist(activeSideSheetLead, item.id)}
                      />
                      <span className={item.completed ? 'checklist-done' : ''}>
                        {item.label}
                      </span>
                      {item.mandatory && (
                        <span className="mandatory-tag" title="Mandatory for advancing stage">Required</span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Stage Progression Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="btn btn-sm"
                    disabled={getStageIndex(activeSideSheetLead.stage) === 0}
                    onClick={() => handlePreviousStage(activeSideSheetLead)}
                  >
                    &larr; Back to {LEAD_STAGES[Math.max(0, getStageIndex(activeSideSheetLead.stage) - 1)].shortName}
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    disabled={getStageIndex(activeSideSheetLead.stage) === LEAD_STAGES.length - 1}
                    onClick={() => handleAdvanceStage(activeSideSheetLead)}
                  >
                    Advance to Next Stage &rarr;
                  </button>
                </div>
              </div>

              {/* Proposal & Quotation Section (Stage 3 Integration) */}
              <div className="side-sheet-section">
                <div className="side-sheet-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Proposal & Quotation Details</span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openProposalModal(activeSideSheetLead)}
                  >
                    {activeSideSheetLead.proposalData ? 'Edit Quotation' : 'Open Proposal Creator'}
                  </button>
                </div>

                {activeSideSheetLead.proposalData ? (
                  <div className="quotation-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '6px' }}>
                      <strong>Quotation #{activeSideSheetLead.proposalData.quotationNo}</strong>
                      <span className="status-badge">{activeSideSideSheetStatus(activeSideSheetLead.proposalData.status)}</span>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                      <div>Valid Until: <strong>{activeSideSheetLead.proposalData.validUntil}</strong></div>
                      <div>Total Quoted: <strong>₹{Number(activeSideSheetLead.proposalData.totalAmount).toLocaleString('en-IN')}</strong></div>
                    </div>
                    <div style={{ marginTop: '8px', borderTop: '1px solid #e0e0e0', paddingTop: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>Items Included:</div>
                      {(activeSideSheetLead.proposalData.items || []).map((itm, i) => (
                        <div key={i} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>&bull; {itm.desc} (x{itm.qty})</span>
                          <span>₹{(Number(itm.qty) * Number(itm.rate)).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#666', padding: '12px', border: '1px dashed #ccc' }}>
                    No proposal quotation has been generated yet for this lead. Click "Open Proposal Creator" to draft an itemized quotation.
                  </div>
                )}
              </div>

              {/* Case Conversion Info (Converted Stage Integration) */}
              <div className="side-sheet-section">
                <div className="side-sheet-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Operations Case Conversion</span>
                  {activeSideSheetLead.stage === 'converted' && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openConvertModal(activeSideSheetLead)}
                    >
                      {activeSideSheetLead.caseId ? 'Manage Case Assignment' : 'Convert to Case'}
                    </button>
                  )}
                </div>

                {activeSideSheetLead.caseId ? (
                  <div className="case-active-banner">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Active Case ID: {activeSideSheetLead.caseId}</strong>
                        <div style={{ fontSize: '12px', marginTop: '2px' }}>
                          Assigned Staff: <strong>{activeSideSheetLead.assignedStaff || 'Senior Case Officer'}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#555' }}>
                          Order Type: {activeSideSheetLead.orderType || 'Prepaid Order'} &bull; Payment: {activeSideSheetLead.paymentOption || 'Full Payment'}
                        </div>
                      </div>
                      <span className="status-badge" style={{ background: '#000', color: '#fff' }}>ACTIVE CASE</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#666', padding: '12px', border: '1px dashed #ccc' }}>
                    Lead has not been converted to an active Case yet. Once marked "Converted", it can be assigned to Visa or Holiday specialists.
                  </div>
                )}
              </div>

              {/* Key Lead Metadata */}
              <div className="side-sheet-section">
                <div className="side-sheet-section-title">Lead Profile & Inquiry</div>
                <div className="form-grid" style={{ fontSize: '12px' }}>
                  <div><strong>Phone:</strong> {activeSideSheetLead.phone}</div>
                  <div><strong>Email:</strong> {activeSideSheetLead.email}</div>
                  <div><strong>Target Country:</strong> {activeSideSheetLead.targetCountry || 'N/A'}</div>
                  <div><strong>Service Required:</strong> {activeSideSheetLead.serviceRequired || 'N/A'}</div>
                  <div><strong>Estimated Value:</strong> ₹{(Number(activeSideSheetLead.estimatedValue) || 0).toLocaleString('en-IN')}</div>
                  <div><strong>Created Date:</strong> {activeSideSheetLead.createdDate}</div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Internal Notes / Remarks:</label>
                  <textarea
                    rows="3"
                    style={{ width: '100%', marginTop: '4px' }}
                    value={activeSideSheetLead.remarks || ''}
                    onChange={(e) => {
                      const updated = { ...activeSideSheetLead, remarks: e.target.value };
                      setActiveSideSheetLead(updated);
                      onUpdateLead(updated);
                    }}
                    placeholder="Add internal notes or customer inquiry context..."
                  />
                </div>
              </div>
            </div>

            {/* Side Sheet Footer */}
            <div className="side-sheet-footer">
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm(`Delete lead ${activeSideSheetLead.leadName}?`)) {
                    onDeleteLead(activeSideSheetLead.id);
                    setActiveSideSheetLead(null);
                  }
                }}
              >
                Delete Lead
              </button>
              <button className="btn btn-sm" onClick={() => setActiveSideSheetLead(null)}>
                Close Side Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PROPOSAL CREATOR WITH QUOTATION MODAL */}
      {proposalModalLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Proposal Creator with Quotation</div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Client: <strong>{proposalModalLead.leadName}</strong> &bull; Lead ID: {proposalModalLead.id} &bull; Destination: {proposalModalLead.targetCountry || 'Global'}
                </div>
              </div>
              <button className="close-btn" onClick={() => setProposalModalLead(null)}>X</button>
            </div>

            {!proposalPreviewMode ? (
              /* Quotation Editor Mode */
              <div>
                <div className="form-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Quotation Number:</label>
                    <input
                      type="text"
                      value={proposalForm.quotationNo}
                      onChange={e => setProposalForm({ ...proposalForm, quotationNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Valid Until Date:</label>
                    <input
                      type="date"
                      value={proposalForm.validUntil}
                      onChange={e => setProposalForm({ ...proposalForm, validUntil: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax Rate (GST %):</label>
                    <select
                      value={proposalForm.taxPercent}
                      onChange={e => setProposalForm({ ...proposalForm, taxPercent: Number(e.target.value) })}
                    >
                      <option value={0}>0% (Tax Exempt / Nil)</option>
                      <option value={5}>5% (Tour Package GST)</option>
                      <option value={18}>18% (Standard Visa & Consulting GST)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Special Discount (₹):</label>
                    <input
                      type="number"
                      value={proposalForm.discount}
                      onChange={e => setProposalForm({ ...proposalForm, discount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>Quotation Line Items & Service Breakdown</strong>
                    <button
                      className="btn btn-sm"
                      onClick={() => setProposalForm({
                        ...proposalForm,
                        items: [...proposalForm.items, { desc: 'Additional Service / Facility', qty: 1, rate: 5000 }]
                      })}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th style={{ width: '80px' }}>Qty</th>
                          <th style={{ width: '130px' }}>Unit Rate (₹)</th>
                          <th style={{ width: '130px' }}>Total (₹)</th>
                          <th style={{ width: '50px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalForm.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                value={item.desc}
                                onChange={e => {
                                  const updated = [...proposalForm.items];
                                  updated[idx].desc = e.target.value;
                                  setProposalForm({ ...proposalForm, items: updated });
                                }}
                                style={{ width: '100%' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={e => {
                                  const updated = [...proposalForm.items];
                                  updated[idx].qty = Number(e.target.value);
                                  setProposalForm({ ...proposalForm, items: updated });
                                }}
                                style={{ width: '100%' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.rate}
                                onChange={e => {
                                  const updated = [...proposalForm.items];
                                  updated[idx].rate = Number(e.target.value);
                                  setProposalForm({ ...proposalForm, items: updated });
                                }}
                                style={{ width: '100%' }}
                              />
                            </td>
                            <td>
                              <strong>₹{(Number(item.qty) * Number(item.rate)).toLocaleString('en-IN')}</strong>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  const updated = proposalForm.items.filter((_, i) => i !== idx);
                                  setProposalForm({ ...proposalForm, items: updated });
                                }}
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Calculation Summary */}
                {(() => {
                  const { subtotal, discount, taxable, taxAmount, total } = calculateProposalTotals();
                  return (
                    <div className="quotation-summary-box">
                      <div className="quotation-calc-row"><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                      {discount > 0 && (
                        <div className="quotation-calc-row" style={{ color: '#555' }}>
                          <span>Discount Applied:</span><span>- ₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="quotation-calc-row"><span>Taxable Value:</span><span>₹{taxable.toLocaleString('en-IN')}</span></div>
                      <div className="quotation-calc-row">
                        <span>GST ({proposalForm.taxPercent}%):</span><span>+ ₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="quotation-calc-total">
                        <span>Grand Total Quoted:</span><span>₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Proposal Notes / Terms */}
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Quotation Terms & Conditions / Inclusions:</label>
                  <textarea
                    rows="2"
                    value={proposalForm.notes}
                    onChange={e => setProposalForm({ ...proposalForm, notes: e.target.value })}
                  />
                </div>

                <div className="form-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn" onClick={() => setProposalPreviewMode(true)}>
                    👁️ Preview Official Quotation
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => setProposalModalLead(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSaveProposal}>
                      Save & Attach Quotation to Lead
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Quotation Paper Preview Mode */
              <div>
                <div className="official-quotation-paper">
                  <div className="quotation-paper-header">
                    <div>
                      <h2>RH GLOBAL CRM &bull; TRAVEL SOLUTIONS</h2>
                      <p>International Visa Operations & Luxury Holiday Packages</p>
                      <p style={{ fontSize: '11px', color: '#666' }}>102 Tech Park, Cyber City, Gurgaon &bull; support@rhglobal.com</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>OFFICIAL PROPOSAL & QUOTATION</div>
                      <div style={{ fontSize: '12px' }}>Ref: <strong>{proposalForm.quotationNo}</strong></div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Valid Until: {proposalForm.validUntil}</div>
                    </div>
                  </div>

                  <div className="quotation-paper-client">
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>Prepared For:</div>
                      <strong>{proposalModalLead.leadName}</strong>
                      <div>{proposalModalLead.companyName || 'Individual Customer'}</div>
                      <div>{proposalModalLead.email} &bull; {proposalModalLead.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>Service Details:</div>
                      <div>Destination: <strong>{proposalModalLead.targetCountry || 'International'}</strong></div>
                      <div>Type: <strong>{proposalModalLead.leadType}</strong> ({proposalModalLead.serviceRequired || 'Package'})</div>
                    </div>
                  </div>

                  <table className="quotation-paper-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Rate (₹)</th>
                        <th>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposalForm.items.map((it, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{it.desc}</td>
                          <td>{it.qty}</td>
                          <td>₹{Number(it.rate).toLocaleString('en-IN')}</td>
                          <td>₹{(Number(it.qty) * Number(it.rate)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {(() => {
                    const { subtotal, discount, taxAmount, total } = calculateProposalTotals();
                    return (
                      <div className="quotation-paper-totals">
                        <div>Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong></div>
                        {discount > 0 && <div>Discount: <strong>- ₹{discount.toLocaleString('en-IN')}</strong></div>}
                        <div>GST ({proposalForm.taxPercent}%): <strong>+ ₹{taxAmount.toLocaleString('en-IN')}</strong></div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '4px' }}>
                          Total Amount: ₹{total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ marginTop: '20px', fontSize: '11px', borderTop: '1px solid #000', paddingTop: '10px' }}>
                    <strong>Terms & Instructions:</strong>
                    <p>{proposalForm.notes}</p>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn" onClick={() => setProposalPreviewMode(false)}>
                    &larr; Back to Editor
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={() => window.print()}>
                      🖨️ Print / Save PDF
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveProposal}>
                      Confirm & Attach to Lead
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CONVERT TO CASE MODAL (Matching discussion flow in diagram) */}
      {convertModalLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Convert Lead to Active Operations Case</div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Lead: <strong>{convertModalLead.leadName}</strong> &bull; Destination: {convertModalLead.targetCountry}
                </div>
              </div>
              <button className="close-btn" onClick={() => setConvertModalLead(null)}>X</button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Assigned Case ID:</label>
                <input
                  type="text"
                  value={convertForm.caseId}
                  onChange={e => setConvertForm({ ...convertForm, caseId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Case Type:</label>
                <select
                  value={convertForm.caseType}
                  onChange={e => setConvertForm({ ...convertForm, caseType: e.target.value })}
                >
                  <option value="Visa Application">Visa Application</option>
                  <option value="Holiday Package Booking">Holiday Package Booking</option>
                  <option value="Combined Visa + Holiday Tour">Combined Visa + Holiday Tour</option>
                </select>
              </div>

              {/* Staff Assignment as in diagram: "Staff Visa or Holidays or both; Staff will see only their kanban, admin sees all" */}
              <div className="form-group">
                <label>Staff Role Specialty Filter:</label>
                <select
                  value={convertForm.staffSpecialty}
                  onChange={e => setConvertForm({ ...convertForm, staffSpecialty: e.target.value })}
                >
                  <option value="All">All Staff Members</option>
                  <option value="Visa Operations">Visa Operations (Specialist)</option>
                  <option value="Tour Operations">Tour Operations (Holiday Specialist)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign to Staff Officer:</label>
                <select
                  value={convertForm.assignedStaff}
                  onChange={e => setConvertForm({ ...convertForm, assignedStaff: e.target.value })}
                >
                  {staffMembers
                    .filter(s => convertForm.staffSpecialty === 'All' || s.department === convertForm.staffSpecialty)
                    .map(s => (
                      <option key={s.employeeId} value={s.name}>
                        {s.name} ({s.role} &bull; {s.department})
                      </option>
                    ))}
                </select>
              </div>

              {/* Finance & Order Section from diagram: "Finance -> Prepaid Orders / Post paid orders -> Full / Partial Payments" */}
              <div className="form-group">
                <label>Finance / Order Structure:</label>
                <select
                  value={convertForm.orderType}
                  onChange={e => setConvertForm({ ...convertForm, orderType: e.target.value })}
                >
                  <option value="Prepaid Order">Prepaid Order (Advance Payment)</option>
                  <option value="Postpaid Order">Postpaid Order (Invoice on Completion)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Schedule:</label>
                <select
                  value={convertForm.paymentOption}
                  onChange={e => setConvertForm({ ...convertForm, paymentOption: e.target.value })}
                >
                  <option value="Full Payment (100%)">Full Payment (100% Upfront)</option>
                  <option value="Partial Payment (50% Advance)">Partial Payment (50% Advance)</option>
                  <option value="Milestone / Corporate Credit">Milestone / Corporate 30-Day Credit</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Case Value (₹):</label>
                <input
                  type="number"
                  value={convertForm.totalAmount}
                  onChange={e => setConvertForm({ ...convertForm, totalAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Operations Handoff Notes:</label>
              <textarea
                rows="2"
                value={convertForm.notes}
                onChange={e => setConvertForm({ ...convertForm, notes: e.target.value })}
              />
            </div>

            <div style={{ fontSize: '11px', color: '#555', marginTop: '12px', border: '1px solid #ccc', padding: '8px', background: '#fafafa' }}>
              ℹ️ <strong>Workflow Handoff:</strong> When converted, this Lead will be marked as "Converted to Case" and linked to <strong>{convertForm.caseId}</strong>. The assigned staff officer will see this in their dedicated Operations queue.
            </div>

            <div className="form-actions" style={{ marginTop: '16px' }}>
              <button className="btn" onClick={() => setConvertModalLead(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmConvert}>
                Confirm & Create Active Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. ADD NEW LEAD MODAL */}
      {showAddLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title">Add New Lead to Pipeline</div>
              <button className="close-btn" onClick={() => setShowAddLeadModal(false)}>X</button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Lead Full Name *:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={newLeadForm.leadName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, leadName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Company / Organization:</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Tech Ltd (or leave blank for Individual)"
                    value={newLeadForm.companyName}
                    onChange={e => setNewLeadForm({ ...newLeadForm, companyName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *:</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@example.com"
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lead Type *:</label>
                  <select
                    value={newLeadForm.leadType}
                    onChange={e => setNewLeadForm({ ...newLeadForm, leadType: e.target.value })}
                  >
                    <option value="Visa">Visa Application</option>
                    <option value="Holiday">Holiday Package</option>
                  </select>
                </div>

                {/* Entry Sources from diagram: Website Form, Direct entry, FB / Instagram */}
                <div className="form-group">
                  <label>Acquisition Source *:</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                  >
                    {LEAD_SOURCES.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Initial Pipeline Stage:</label>
                  <select
                    value={newLeadForm.stage}
                    onChange={e => setNewLeadForm({ ...newLeadForm, stage: e.target.value })}
                  >
                    {LEAD_STAGES.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Destination / Country:</label>
                  <input
                    type="text"
                    placeholder="e.g. United States, Switzerland, Japan"
                    value={newLeadForm.targetCountry}
                    onChange={e => setNewLeadForm({ ...newLeadForm, targetCountry: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Value (₹):</label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedValue}
                    onChange={e => setNewLeadForm({ ...newLeadForm, estimatedValue: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Assign to Officer:</label>
                  <select
                    value={newLeadForm.assignedStaff}
                    onChange={e => setNewLeadForm({ ...newLeadForm, assignedStaff: e.target.value })}
                  >
                    <option value="Unassigned">Unassigned</option>
                    {staffMembers.map(s => (
                      <option key={s.employeeId} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Customer Inquiry & Notes:</label>
                <textarea
                  rows="2"
                  placeholder="Notes from inquiry form, travel dates, passenger count..."
                  value={newLeadForm.remarks}
                  onChange={e => setNewLeadForm({ ...newLeadForm, remarks: e.target.value })}
                />
              </div>

              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowAddLeadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">+ Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper for proposal status badge display
function activeSideSideSheetStatus(status) {
  return status || 'Draft';
}
