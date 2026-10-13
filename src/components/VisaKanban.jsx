import React, { useState } from 'react';

// ─── Visa Pipeline Stages ─────────────────────────────────────────────────────
export const VISA_STAGES = [
  { id: 'under-review',  name: 'Stage 1: Under Review',      shortName: 'Under Review',      description: 'Documents collection & initial assessment',       color: '#f59e0b' },
  { id: 'docs-verified', name: 'Stage 2: Docs Verified',      shortName: 'Docs Verified',     description: 'All documents checked & verified',               color: '#3b82f6' },
  { id: 'submitted',     name: 'Stage 3: Submitted',          shortName: 'Submitted',         description: 'Application submitted to embassy',               color: '#8b5cf6' },
  { id: 'processing',   name: 'Stage 4: Processing',         shortName: 'Processing',        description: 'Embassy processing / Interview / Biometrics',    color: '#f97316' },
  { id: 'approved',     name: 'Approved',                    shortName: 'Approved',          description: 'Visa approved & ready for collection',           color: '#22c55e' },
  { id: 'rejected',     name: 'Rejected',                    shortName: 'Rejected',          description: 'Application rejected by embassy',                color: '#ef4444' },
];

const STAGE_ORDER = VISA_STAGES.map(s => s.id);

// ─── Visa Stage Checklists (Cases Pipeline) ──────────────────────────────────
export const VISA_STAGE_CHECKLISTS = {
  'under-review': [
    { key: 'visa-s1_0', label: 'Passport valid for at least 6 months checked', mandatory: true },
    { key: 'visa-s1_1', label: 'Application form & personal details reviewed', mandatory: true },
    { key: 'visa-s1_2', label: 'Initial service intake fee verified', mandatory: true },
    { key: 'visa-s1_3', label: 'Special travel purpose notes recorded', mandatory: false },
  ],
  'docs-verified': [
    { key: 'visa-s2_0', label: 'Bank statements (6 months) verified', mandatory: true },
    { key: 'visa-s2_1', label: 'Employment NOC / business registration verified', mandatory: true },
    { key: 'visa-s2_2', label: 'Flight itinerary & hotel voucher verified', mandatory: true },
    { key: 'visa-s2_3', label: 'Travel insurance copy verified', mandatory: false },
  ],
  'submitted': [
    { key: 'visa-s3_0', label: 'VFS / Embassy appointment scheduled', mandatory: true },
    { key: 'visa-s3_1', label: 'Original passport & dossier submitted', mandatory: true },
    { key: 'visa-s3_2', label: 'Consulate tracking reference generated', mandatory: true },
  ],
  'processing': [
    { key: 'visa-s4_0', label: 'Biometrics enrolled by applicant', mandatory: true },
    { key: 'visa-s4_1', label: 'Consular interview attended (if required)', mandatory: false },
    { key: 'visa-s4_2', label: 'Active status tracking monitored daily', mandatory: true },
  ],
  'approved': [
    { key: 'visa-s5_0', label: 'Visa sticker / eVisa accuracy verified', mandatory: true },
    { key: 'visa-s5_1', label: 'Passport & visa dispatched/handed to applicant', mandatory: true },
  ],
  'rejected': [
    { key: 'visa-rej_0', label: 'Embassy rejection letter archived', mandatory: true },
    { key: 'visa-rej_1', label: 'Appeal or re-application options discussed', mandatory: false },
  ]
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStageForVisa(visa) {
  if (visa.stage) return visa.stage;
  const s = (visa.status || '').toLowerCase();
  if (s.includes('approved'))  return 'approved';
  if (s.includes('reject'))    return 'rejected';
  if (s.includes('submit'))    return 'submitted';
  if (s.includes('process'))   return 'processing';
  if (s.includes('doc') && s.includes('verif')) return 'docs-verified';
  return 'under-review';
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisaKanban({
  visaList = [],
  onUpdateVisa,
  onAddVisa,
  onViewDetails,
  staffMembers = [],
  title = 'Visa Services & Applications — Processing Pipeline',
}) {
  // View mode
  const [viewMode, setViewMode] = useState('kanban');

  // Filters
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchOption, setSearchOption]     = useState('all');
  const [countryFilter, setCountryFilter]   = useState('All');
  const [officerFilter, setOfficerFilter]   = useState('All');
  const [typeFilter, setTypeFilter]         = useState('All');

  // Drag & drop
  const [draggedId, setDraggedId]           = useState(null);
  const [dragOverStage, setDragOverStage]   = useState(null);

  // Side sheet
  const [activeSheet, setActiveSheet]       = useState(null);
  const [checklistWarning, setChecklistWarning] = useState('');

  // ── Derived ────────────────────────────────────────────────────────────────
  const normalised = visaList.map(v => ({
    ...v,
    _stage: getStageForVisa(v),
    completedChecklist: v.completedChecklist || ['visa-s1_0', 'visa-s1_1', 'visa-s1_2'],
  }));

  const filtered = normalised.filter(v => {
    if (countryFilter !== 'All' && v.country !== countryFilter) return false;
    if (officerFilter !== 'All' && v.caseOfficerName !== officerFilter) return false;
    if (typeFilter !== 'All' && v.visaType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = {
        all: [v.applicantName, v.id, v.country, v.visaType, v.caseOfficerName, v.caseOfficerId, v.email, v.phone, v.passport, v.paymentRef, v.status],
        applicantName: [v.applicantName],
        id: [v.id],
        country: [v.country],
        visaType: [v.visaType],
        caseOfficer: [v.caseOfficerName, v.caseOfficerId],
        phone: [v.phone],
        email: [v.email],
        passport: [v.passport],
        paymentRef: [v.paymentRef],
      };
      const toCheck = fields[searchOption] || fields.all;
      if (!toCheck.some(f => (f || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const getByStage = (stageId) => filtered.filter(v => v._stage === stageId);
  const totalValue = visaList.reduce((s, v) => s + (Number(v.totalAmount) || 0), 0);

  // ── Checklist validation ───────────────────────────────────────────────────
  const checkMandatoryComplete = (visa, stageId) => {
    const requiredItems = VISA_STAGE_CHECKLISTS[stageId] || [];
    const completed = visa.completedChecklist || [];
    const missing = requiredItems.filter(item => item.mandatory && !completed.includes(item.key));
    return {
      isComplete: missing.length === 0,
      missing,
    };
  };

  const toggleChecklistItem = (visa, itemKey) => {
    const prevList = visa.completedChecklist || [];
    const isDone = prevList.includes(itemKey);
    const updatedList = isDone ? prevList.filter(k => k !== itemKey) : [...prevList, itemKey];

    const updated = { ...visa, completedChecklist: updatedList };
    onUpdateVisa && onUpdateVisa(updated);
    if (activeSheet && activeSheet.id === visa.id) {
      setActiveSheet({ ...activeSheet, completedChecklist: updatedList });
    }
    setChecklistWarning('');
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e, stageId) => { e.preventDefault(); setDragOverStage(stageId); };
  const handleDragLeave = () => setDragOverStage(null);
  const handleDrop      = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedId) return;
    const visa = visaList.find(v => v.id === draggedId);
    if (!visa) return;

    const currentStage = getStageForVisa(visa);
    if (currentStage === stageId) {
      setDraggedId(null);
      return;
    }

    const currentIdx = STAGE_ORDER.indexOf(currentStage);
    const targetIdx  = STAGE_ORDER.indexOf(stageId);

    if (targetIdx > currentIdx && stageId !== 'rejected') {
      const validation = checkMandatoryComplete(visa, currentStage);
      if (!validation.isComplete) {
        alert(
          `⚠️ Mandatory Checklist Incomplete for "${visa.id} - ${visa.applicantName}"!\n\n` +
          `Before advancing from ${VISA_STAGES.find(s => s.id === currentStage)?.shortName} to ${VISA_STAGES.find(s => s.id === stageId)?.shortName}, ` +
          `the following mandatory checklist items must be completed:\n` +
          validation.missing.map(m => ` • ${m.label}`).join('\n') +
          `\n\nPlease open the Side Sheet and complete the checklist items first.`
        );
        setDraggedId(null);
        return;
      }
    }

    const stageObj = VISA_STAGES.find(s => s.id === stageId);
    onUpdateVisa && onUpdateVisa({ ...visa, stage: stageId, status: stageObj?.shortName || stageId });
    setDraggedId(null);
  };

  // ── Stage advance ──────────────────────────────────────────────────────────
  const advanceStage = (visa, targetStageId) => {
    const currentStage = getStageForVisa(visa);
    if (targetStageId !== 'rejected') {
      const validation = checkMandatoryComplete(visa, currentStage);
      if (!validation.isComplete) {
        setChecklistWarning(
          `Cannot advance stage: ${validation.missing.length} mandatory checklist item(s) pending. Please check them off in the checklist below.`
        );
        return false;
      }
    }

    setChecklistWarning('');
    const stageObj = VISA_STAGES.find(s => s.id === targetStageId);
    const updated = { ...visa, stage: targetStageId, status: stageObj?.shortName || targetStageId };
    onUpdateVisa && onUpdateVisa(updated);
    if (activeSheet && activeSheet.id === visa.id) {
      setActiveSheet({ ...activeSheet, ...updated, _stage: targetStageId });
    }
    return true;
  };

  const getNextStage = (currentStageId) => {
    const idx = STAGE_ORDER.indexOf(currentStageId);
    if (idx < 0 || idx >= STAGE_ORDER.length - 2) return null; // don't auto-advance to rejected
    return STAGE_ORDER[idx + 1];
  };

  // ── Placeholder search hint ────────────────────────────────────────────────
  const searchPlaceholder = {
    applicantName: 'Search applicant name...',
    id: 'Search by VISA-301, VISA-302...',
    country: 'Search country e.g. France, US...',
    visaType: 'Search visa type e.g. Tourist C...',
    caseOfficer: 'Search officer name or CO-101...',
    phone: 'Search phone number...',
    email: 'Search email address...',
    passport: 'Search passport number...',
    paymentRef: 'Search TXN-998120...',
  }[searchOption] || 'Name, ID, country, officer, TXN#...';

  const uniqueCountries = [...new Set(visaList.map(v => v.country).filter(Boolean))];
  const uniqueOfficers  = [...new Set(visaList.map(v => v.caseOfficerName).filter(Boolean))];
  const uniqueTypes     = [...new Set(visaList.map(v => v.visaType).filter(Boolean))];
  const hasFilters      = searchQuery || searchOption !== 'all' || countryFilter !== 'All' || officerFilter !== 'All' || typeFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery(''); setSearchOption('all');
    setCountryFilter('All'); setOfficerFilter('All'); setTypeFilter('All');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="kanban-wrapper">

      {/* ── Header ── */}
      <div className="section-box" style={{ marginBottom: '16px' }}>
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{title}</span>
              <span className="nav-badge" style={{ fontSize: '11px', textTransform: 'none' }}>
                {filtered.length} of {visaList.length} Applications
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Flow: <strong>Under Review</strong> → <strong>Docs Verified</strong> → <strong>Submitted</strong> → <strong>Processing</strong> → <strong>Approved</strong> | <strong>Rejected</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ border: '1px solid #000', display: 'flex' }}>
              <button
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0 }}
                onClick={() => setViewMode('kanban')}
              >☷ Kanban Board</button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000' }}
                onClick={() => setViewMode('table')}
              >☰ Table View</button>
            </div>
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="toolbar" style={{ marginBottom: 0, justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label>Country:</label>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                <option value="All">All Countries</option>
                {uniqueCountries.map(c => <option key={c} value={c}>{c} ({visaList.filter(v => v.country === c).length})</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Visa Type:</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Case Officer:</label>
              <select value={officerFilter} onChange={e => setOfficerFilter(e.target.value)}>
                <option value="All">All Officers</option>
                {uniqueOfficers.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Search By:</label>
              <select value={searchOption} onChange={e => setSearchOption(e.target.value)}>
                <option value="all">All Fields</option>
                <option value="applicantName">Applicant Name</option>
                <option value="id">Application ID</option>
                <option value="country">Country</option>
                <option value="visaType">Visa Type</option>
                <option value="caseOfficer">Case Officer</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="passport">Passport No</option>
                <option value="paymentRef">Payment TXN#</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '220px' }}
              />
              {hasFilters && (
                <button className="btn btn-sm" onClick={clearFilters} title="Clear all filters">✕ Clear</button>
              )}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#555' }}>
            Total Pipeline Value: <strong>₹{totalValue.toLocaleString('en-IN')}</strong>
            &nbsp;&bull;&nbsp;
            Approved: <strong>{visaList.filter(v => getStageForVisa(v) === 'approved').length}</strong>
            &nbsp;&bull;&nbsp;
            Rejected: <strong>{visaList.filter(v => getStageForVisa(v) === 'rejected').length}</strong>
          </div>
        </div>
      </div>

      {/* ── Pipeline Metrics Strip ── */}
      <div className="pipeline-metrics-bar" style={{ marginBottom: '16px' }}>
        {VISA_STAGES.map((st, idx) => {
          const count = visaList.filter(v => getStageForVisa(v) === st.id).length;
          const val   = visaList.filter(v => getStageForVisa(v) === st.id).reduce((s, v) => s + (Number(v.totalAmount) || 0), 0);
          return (
            <React.Fragment key={st.id}>
              <div className={`pipeline-metric-step ${st.id === 'approved' ? 'converted-step' : ''}`}
                style={{ borderTop: `3px solid ${st.color}` }}>
                <div className="step-badge-number" style={{ background: st.color }}>{idx + 1}</div>
                <div className="step-info">
                  <div className="step-title">{st.shortName}</div>
                  <div className="step-stats"><strong>{count}</strong> &bull; ₹{(val / 1000).toFixed(0)}k</div>
                </div>
              </div>
              {idx < VISA_STAGES.length - 1 && <div className="pipeline-arrow">&rarr;</div>}
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══════════════ KANBAN BOARD ═══════════════ */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board-container">
          <div className="kanban-columns-grid" style={{ gridTemplateColumns: `repeat(${VISA_STAGES.length}, minmax(230px, 1fr))` }}>
            {VISA_STAGES.map(stage => {
              const stageVisas = getByStage(stage.id);
              const isDropTarget = dragOverStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`kanban-column ${isDropTarget ? 'kanban-column-drop-active' : ''} ${stage.id === 'approved' ? 'kanban-column-converted' : ''}`}
                  onDragOver={e => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className="kanban-column-header" style={{ borderTop: `3px solid ${stage.color}` }}>
                    <div>
                      <div className="kanban-column-title">
                        {stage.name}
                        <span className="kanban-count-pill">{stageVisas.length}</span>
                      </div>
                      <div className="kanban-column-desc">{stage.description}</div>
                    </div>
                  </div>

                  {/* Stage banner for Approved */}
                  {stage.id === 'approved' && (
                    <div className="stage-banner-callout" style={{ background: '#f0fdf4', color: '#166534' }}>
                      <span>✅ Visa Approved — Ready for Collection</span>
                    </div>
                  )}
                  {stage.id === 'rejected' && (
                    <div className="stage-banner-callout" style={{ background: '#fff1f2', color: '#991b1b' }}>
                      <span>❌ Rejected by Embassy</span>
                    </div>
                  )}

                  {/* Cards */}
                  <div className="kanban-cards-list">
                    {stageVisas.length === 0 ? (
                      <div className="kanban-empty-column">
                        <div style={{ color: '#888', fontSize: '12px' }}>No applications here</div>
                        <div style={{ color: '#aaa', fontSize: '10px', marginTop: '4px' }}>Drag cards here to advance</div>
                      </div>
                    ) : (
                      stageVisas.map(visa => {
                        const nextStageId = getNextStage(visa._stage);
                        const nextStage   = VISA_STAGES.find(s => s.id === nextStageId);
                        const isDragging  = draggedId === visa.id;
                        const payPct = visa.totalAmount > 0 ? Math.round((visa.paidAmount / visa.totalAmount) * 100) : 0;

                        return (
                          <div
                            key={visa.id}
                            className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
                            draggable
                            onDragStart={e => handleDragStart(e, visa.id)}
                          >
                            {/* Card header */}
                            <div className="kanban-card-header">
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <span className="kanban-type-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>{visa.visaType}</span>
                                <span className="kanban-source-badge" style={{ fontSize: '9px' }}>
                                  {visa.paymentType === 'Prepaid' ? '💳 Prepaid' : '⏳ Postpaid'}
                                </span>
                              </div>
                              <span className="kanban-lead-id" style={{ fontSize: '9px' }}>{visa.id}</span>
                            </div>

                            {/* Card body — clickable to open side sheet */}
                            <div className="kanban-card-body" onClick={() => setActiveSheet(visa)} style={{ cursor: 'pointer' }}>
                              <div className="kanban-lead-name">{visa.applicantName}</div>
                              <div className="kanban-company-text">📍 {visa.country}</div>

                              {/* Payment indicator */}
                              <div style={{ margin: '6px 0 4px', fontSize: '11px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span>₹{(visa.totalAmount || 0).toLocaleString('en-IN')}</span>
                                  <span style={{ color: payPct >= 100 ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>
                                    {payPct}% paid
                                  </span>
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: '2px', height: '4px' }}>
                                  <div style={{ width: `${payPct}%`, background: payPct >= 100 ? '#22c55e' : '#f59e0b', height: '4px', borderRadius: '2px', transition: 'width .3s' }} />
                                </div>
                              </div>

                              {/* Officer */}
                              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                                👤 {visa.caseOfficerName}
                              </div>

                              {/* Doc status */}
                              <div style={{ marginTop: '4px' }}>
                                <span className="status-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                  📄 {visa.documentStatus || 'Docs Pending'}
                                </span>
                              </div>

                              {/* Application date */}
                              <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                                Applied: {visa.applicationDate}
                              </div>
                            </div>

                            {/* Card footer actions */}
                            <div style={{ display: 'flex', gap: '4px', padding: '6px 0 0', borderTop: '1px solid #f0f0f0', marginTop: '4px', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-sm"
                                style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                onClick={() => setActiveSheet(visa)}
                              >
                                Details
                              </button>
                              {onViewDetails && (
                                <button
                                  className="btn btn-sm"
                                  style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                  onClick={() => onViewDetails(visa)}
                                  title="View full application details"
                                >
                                  Profile &rarr;
                                </button>
                              )}
                              {nextStage && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                  onClick={() => advanceStage(visa, nextStageId)}
                                  title={`Move to ${nextStage.shortName}`}
                                >
                                  → {nextStage.shortName}
                                </button>
                              )}
                              {visa._stage === 'submitted' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                  onClick={() => advanceStage(visa, 'rejected')}
                                >Reject</button>
                              )}
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
        /* ═══════════════ TABLE VIEW ═══════════════ */
        <div className="section-box">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>Country</th>
                  <th>Visa Type</th>
                  <th>Stage</th>
                  <th>Case Officer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                      No applications match your filters.{' '}
                      <button className="btn btn-sm" onClick={clearFilters}>Clear Filters</button>
                    </td>
                  </tr>
                ) : (
                  filtered.map(visa => {
                    const stageObj = VISA_STAGES.find(s => s.id === visa._stage);
                    return (
                      <tr key={visa.id}>
                        <td className="font-mono"><strong>{visa.id}</strong></td>
                        <td>
                          <div><strong>{visa.applicantName}</strong></div>
                          {visa.phone && <div style={{ fontSize: '11px', color: '#666' }}>📞 {visa.phone}</div>}
                          {visa.email && <div style={{ fontSize: '11px', color: '#666' }}>✉️ {visa.email}</div>}
                        </td>
                        <td>{visa.country}</td>
                        <td>{visa.visaType}</td>
                        <td>
                          <span className="status-badge" style={{ borderLeft: `3px solid ${stageObj?.color || '#ccc'}`, fontSize: '11px' }}>
                            {stageObj?.shortName || visa.status}
                          </span>
                        </td>
                        <td>{visa.caseOfficerName}<br /><span className="font-mono" style={{ fontSize: '10px', color: '#888' }}>{visa.caseOfficerId}</span></td>
                        <td className="font-mono">₹{(visa.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className="status-badge" style={{ fontSize: '10px' }}>{visa.paymentStatus}</span>
                          {visa.paymentRef && <div style={{ fontSize: '9px', color: '#888', fontFamily: 'monospace' }}>{visa.paymentRef}</div>}
                        </td>
                        <td>{visa.applicationDate}</td>
                        <td className="action-cell" style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn-sm" onClick={() => setActiveSheet(visa)}>Quick View</button>
                          {onViewDetails && (
                            <button className="btn btn-sm btn-primary" style={{ marginLeft: '4px' }} onClick={() => onViewDetails(visa)}>View Profile &rarr;</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════ SIDE SHEET ═══════════════ */}
      {activeSheet && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            display: 'flex', justifyContent: 'flex-end',
          }}
          onClick={() => setActiveSheet(null)}
        >
          <div
            style={{
              width: '520px', height: '100%', background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
              overflowY: 'auto', borderLeft: '4px solid #000'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div style={{ background: '#111', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>{activeSheet.applicantName}</div>
                <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' }}>{activeSheet.id}</div>
              </div>
              <button style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' }}
                onClick={() => setActiveSheet(null)}>✕ Close</button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {/* Stage indicator */}
              {(() => {
                const stageObj = VISA_STAGES.find(s => s.id === getStageForVisa(activeSheet));
                return (
                  <div style={{ background: stageObj?.color + '15', border: `1px solid ${stageObj?.color}`, padding: '8px 12px', marginBottom: '16px', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: stageObj?.color, fontSize: '13px' }}>{stageObj?.name}</span>
                    <span style={{ fontSize: '11px', color: '#555' }}>{stageObj?.description}</span>
                  </div>
                );
              })()}

              {/* ── MANDATORY CHECKLIST SECTION (FROM CRM DIAGRAM) ── */}
              <div style={{ marginBottom: '20px', border: '2px solid #000', padding: '14px', background: '#fafafa', borderRadius: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📋 Stage Checklist ({VISA_STAGES.find(s => s.id === getStageForVisa(activeSheet))?.shortName})
                  </div>
                  <span style={{ fontSize: '10px', background: '#000', color: '#fff', padding: '2px 6px', fontWeight: '600' }}>
                    Side Sheet Rule: Mandatory
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>
                  <em>"Without completing mandatory items, cannot move stages."</em>
                </div>

                {checklistWarning && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '8px 10px', borderRadius: '3px', fontSize: '11px', marginBottom: '12px' }}>
                    ⚠️ {checklistWarning}
                  </div>
                )}

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(VISA_STAGE_CHECKLISTS[getStageForVisa(activeSheet)] || []).map((item) => {
                    const isChecked = (activeSheet.completedChecklist || []).includes(item.key);
                    return (
                      <label
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          background: isChecked ? '#f0fdf4' : '#fff',
                          border: `1px solid ${isChecked ? '#86efac' : '#e5e7eb'}`,
                          padding: '8px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecklistItem(activeSheet, item.key)}
                          style={{ marginTop: '2px', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1, fontSize: '12px' }}>
                          <span style={{ fontWeight: isChecked ? '600' : '400', textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? '#15803d' : '#111' }}>
                            {item.label}
                          </span>
                        </div>
                        {item.mandatory ? (
                          <span style={{ fontSize: '9px', background: isChecked ? '#dcfce7' : '#fee2e2', color: isChecked ? '#166534' : '#991b1b', border: `1px solid ${isChecked ? '#86efac' : '#fca5a5'}`, padding: '1px 5px', fontWeight: '600', textTransform: 'uppercase' }}>
                            Mandatory
                          </span>
                        ) : (
                          <span style={{ fontSize: '9px', background: '#f3f4f6', color: '#6b7280', padding: '1px 5px' }}>
                            Optional
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Applicant Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Applicant Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>APPLICANT NAME</div><div style={{ fontWeight: '600' }}>{activeSheet.applicantName}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>APPLICATION ID</div><div style={{ fontFamily: 'monospace', fontWeight: '600' }}>{activeSheet.id}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>PHONE</div><div>{activeSheet.phone || '—'}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>EMAIL</div><div>{activeSheet.email || '—'}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>PASSPORT</div><div style={{ fontFamily: 'monospace', fontSize: '11px' }}>{activeSheet.passport || '—'}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>APPLICATION DATE</div><div>{activeSheet.applicationDate}</div></div>
                </div>
              </div>

              {/* Visa Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Visa Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>TARGET COUNTRY</div><div style={{ fontWeight: '600' }}>{activeSheet.country}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>VISA TYPE</div><div>{activeSheet.visaType}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>CASE OFFICER</div><div>{activeSheet.caseOfficerName}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>OFFICER ID</div><div style={{ fontFamily: 'monospace' }}>{activeSheet.caseOfficerId}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>DOCUMENT STATUS</div><div><span className="status-badge" style={{ fontSize: '10px' }}>{activeSheet.documentStatus}</span></div></div>
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Payment Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { label: 'TOTAL FEE',    value: `₹${(activeSheet.totalAmount || 0).toLocaleString('en-IN')}`, color: '#111' },
                    { label: 'PAID',         value: `₹${(activeSheet.paidAmount || 0).toLocaleString('en-IN')}`,  color: '#22c55e' },
                    { label: 'PENDING',      value: `₹${(activeSheet.pendingAmount || 0).toLocaleString('en-IN')}`, color: activeSheet.pendingAmount > 0 ? '#ef4444' : '#22c55e' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'center', background: '#fafafa' }}>
                      <div style={{ fontSize: '9px', color: '#888', letterSpacing: '0.5px' }}>{label}</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '11px', display: 'flex', gap: '12px', color: '#555' }}>
                  <span>Type: <strong>{activeSheet.paymentType}</strong></span>
                  <span>Status: <strong>{activeSheet.paymentStatus}</strong></span>
                  {activeSheet.paymentRef && <span>Ref: <span style={{ fontFamily: 'monospace' }}>{activeSheet.paymentRef}</span></span>}
                </div>
              </div>

              {/* Stage Advance actions */}
              {(() => {
                const nextStageId = getNextStage(getStageForVisa(activeSheet));
                const nextStage   = VISA_STAGES.find(s => s.id === nextStageId);
                return nextStage ? (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                      Advance Stage
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => { advanceStage(activeSheet, nextStageId); setActiveSheet(v => ({ ...v, stage: nextStageId, status: nextStage.shortName, _stage: nextStageId })); }}
                      >
                        → Move to {nextStage.shortName}
                      </button>
                      {getStageForVisa(activeSheet) !== 'approved' && getStageForVisa(activeSheet) !== 'rejected' && (
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                          onClick={() => { advanceStage(activeSheet, 'rejected'); setActiveSheet(v => ({ ...v, stage: 'rejected', status: 'Rejected', _stage: 'rejected' })); }}
                        >
                          ✕ Mark as Rejected
                        </button>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* View full details link */}
              {onViewDetails && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e0e0e0' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => { setActiveSheet(null); onViewDetails(activeSheet); }}
                  >
                    View Full Application Details →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
