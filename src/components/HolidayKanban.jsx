import React, { useState } from 'react';

// ─── Holiday Pipeline Stages (Cases Pipeline) ─────────────────────────────────
export const HOLIDAY_STAGES = [
  { id: 'stage-1',   name: 'Stage 1: Booking Created',   shortName: 'Booking Created',   description: 'Lead converted / Travel dates & PAX confirmed',       color: '#f59e0b' },
  { id: 'stage-2',   name: 'Stage 2: Docs & Itinerary',   shortName: 'Docs & Itinerary',  description: 'Passports verified & custom itinerary approved',     color: '#3b82f6' },
  { id: 'stage-3',   name: 'Stage 3: Vouchers & Confirm', shortName: 'Vouchers & Confirm',description: 'Flights, hotels booked & travel vouchers issued',    color: '#8b5cf6' },
  { id: 'stage-4',   name: 'Stage 4: Tour In-Progress',   shortName: 'Tour In-Progress',  description: 'Travelers on trip / 24/7 on-ground assistance',       color: '#f97316' },
  { id: 'completed', name: 'Completed',                   shortName: 'Completed',         description: 'Tour finished / Customer review collected',           color: '#22c55e' },
  { id: 'cancelled', name: 'Cancelled',                   shortName: 'Cancelled',         description: 'Tour cancelled / Refund or credit processed',         color: '#ef4444' },
];

export const HOLIDAY_STAGE_ORDER = HOLIDAY_STAGES.map(s => s.id);

// ─── Default Checklists per Stage ─────────────────────────────────────────────
export const HOLIDAY_STAGE_CHECKLISTS = {
  'stage-1': [
    { key: 'stage-1_0', label: 'Travel dates & PAX count verified', mandatory: true },
    { key: 'stage-1_1', label: 'Primary contact & emergency details confirmed', mandatory: true },
    { key: 'stage-1_2', label: 'Room category & dietary preferences noted', mandatory: false },
  ],
  'stage-2': [
    { key: 'stage-2_0', label: 'Passport copies valid 6+ months collected', mandatory: true },
    { key: 'stage-2_1', label: 'Final itinerary & quote approved by client', mandatory: true },
    { key: 'stage-2_2', label: 'Advance booking deposit received', mandatory: true },
  ],
  'stage-3': [
    { key: 'stage-3_0', label: 'Flight tickets confirmed & e-tickets generated', mandatory: true },
    { key: 'stage-3_1', label: 'Hotel booking vouchers confirmed', mandatory: true },
    { key: 'stage-3_2', label: 'Travel insurance policy issued', mandatory: true },
    { key: 'stage-3_3', label: 'Voucher pack delivered to traveler', mandatory: false },
  ],
  'stage-4': [
    { key: 'stage-4_0', label: 'Traveler arrival & airport transfer confirmed', mandatory: true },
    { key: 'stage-4_1', label: '24/7 on-ground emergency POC assigned', mandatory: true },
    { key: 'stage-4_2', label: 'Mid-trip feedback check conducted', mandatory: false },
  ],
  'completed': [
    { key: 'completed_0', label: 'Safe return travel confirmed', mandatory: true },
    { key: 'completed_1', label: 'Final billing & settlement reconciled', mandatory: true },
    { key: 'completed_2', label: 'Customer review & testimonial collected', mandatory: false },
  ],
  'cancelled': [
    { key: 'cancelled_0', label: 'Cancellation reason documented', mandatory: true },
    { key: 'cancelled_1', label: 'Cancellation fee & refund reconciled', mandatory: true },
  ]
};

// ─── Helper: Determine Stage ──────────────────────────────────────────────────
function getStageForBooking(booking) {
  if (booking.stage) return booking.stage;
  const s = (booking.status || '').toLowerCase();
  if (s.includes('complete')) return 'completed';
  if (s.includes('cancel'))   return 'cancelled';
  if (s.includes('progress') || s.includes('active')) return 'stage-4';
  if (s.includes('voucher') || s.includes('confirm')) return 'stage-3';
  if (s.includes('itinerary') || s.includes('doc'))   return 'stage-2';
  return 'stage-1';
}

export default function HolidayKanban({
  bookingList = [],
  onUpdateBooking,
  onAddBooking,
  onViewDetails,
  onExtendBooking,
  staffMembers = [],
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Search & Filters
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchOption, setSearchOption]       = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('All');
  const [officerFilter, setOfficerFilter]     = useState('All');
  const [paymentFilter, setPaymentFilter]     = useState('All');

  // Drag & Drop
  const [draggedId, setDraggedId]             = useState(null);
  const [dragOverStage, setDragOverStage]     = useState(null);

  // Side sheet
  const [activeSheet, setActiveSheet]         = useState(null);
  const [checklistWarning, setChecklistWarning] = useState('');

  // ── Derived data ────────────────────────────────────────────────────────────
  const normalised = bookingList.map(b => ({
    ...b,
    _stage: getStageForBooking(b),
    completedChecklist: b.completedChecklist || [],
  }));

  const filtered = normalised.filter(b => {
    if (destinationFilter !== 'All' && b.destination !== destinationFilter) return false;
    if (officerFilter !== 'All' && b.caseOfficerName !== officerFilter) return false;
    if (paymentFilter !== 'All' && b.paymentType !== paymentFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fields = {
        all: [b.customerName, b.packageId, b.packageName, b.destination, b.caseOfficerName, b.caseOfficerId, b.email, b.contactDetails, b.invoiceNo],
        customerName: [b.customerName],
        packageId: [b.packageId],
        packageName: [b.packageName],
        destination: [b.destination],
        caseOfficer: [b.caseOfficerName, b.caseOfficerId],
        contact: [b.contactDetails, b.email],
        invoiceNo: [b.invoiceNo],
      };
      const toCheck = fields[searchOption] || fields.all;
      if (!toCheck.some(f => (f || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const getByStage = (stageId) => filtered.filter(b => b._stage === stageId);
  const totalPipelineValue = bookingList.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0);

  // ── Checklist validation ────────────────────────────────────────────────────
  const checkMandatoryComplete = (booking, stageId) => {
    const requiredItems = HOLIDAY_STAGE_CHECKLISTS[stageId] || [];
    const completed = booking.completedChecklist || [];
    const missing = requiredItems.filter(item => item.mandatory && !completed.includes(item.key));
    return {
      isComplete: missing.length === 0,
      missing,
    };
  };

  // ── Drag & Drop Handlers ────────────────────────────────────────────────────
  const handleDragStart = (e, packageId) => {
    setDraggedId(packageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!draggedId) return;

    const booking = bookingList.find(b => b.packageId === draggedId);
    if (!booking) return;

    const currentStage = getStageForBooking(booking);
    if (currentStage === stageId) {
      setDraggedId(null);
      return;
    }

    // Check mandatory checklist if advancing forward
    const currentIdx = HOLIDAY_STAGE_ORDER.indexOf(currentStage);
    const targetIdx = HOLIDAY_STAGE_ORDER.indexOf(stageId);

    if (targetIdx > currentIdx && stageId !== 'cancelled') {
      const validation = checkMandatoryComplete(booking, currentStage);
      if (!validation.isComplete) {
        alert(
          `⚠️ Mandatory Checklist Incomplete for "${booking.packageId} - ${booking.customerName}"!\n\n` +
          `Before moving from ${HOLIDAY_STAGES.find(s => s.id === currentStage)?.shortName} to ${HOLIDAY_STAGES.find(s => s.id === stageId)?.shortName}, ` +
          `the following mandatory items must be completed:\n` +
          validation.missing.map(m => ` • ${m.label}`).join('\n') +
          `\n\nPlease open the Side Sheet and complete the checklist items first.`
        );
        setDraggedId(null);
        return;
      }
    }

    const stageObj = HOLIDAY_STAGES.find(s => s.id === stageId);
    onUpdateBooking && onUpdateBooking({
      ...booking,
      stage: stageId,
      status: stageObj?.shortName || stageId,
    });
    setDraggedId(null);
  };

  // ── Advance Stage Helper ────────────────────────────────────────────────────
  const advanceStage = (booking, targetStageId) => {
    const currentStage = getStageForBooking(booking);
    if (targetStageId !== 'cancelled') {
      const validation = checkMandatoryComplete(booking, currentStage);
      if (!validation.isComplete) {
        setChecklistWarning(
          `Cannot advance stage: ${validation.missing.length} mandatory checklist item(s) pending. Please check them off below.`
        );
        return false;
      }
    }

    setChecklistWarning('');
    const stageObj = HOLIDAY_STAGES.find(s => s.id === targetStageId);
    const updated = {
      ...booking,
      stage: targetStageId,
      status: stageObj?.shortName || targetStageId,
    };
    onUpdateBooking && onUpdateBooking(updated);
    if (activeSheet && activeSheet.packageId === booking.packageId) {
      setActiveSheet({ ...activeSheet, ...updated, _stage: targetStageId });
    }
    return true;
  };

  const getNextStage = (currentStageId) => {
    const idx = HOLIDAY_STAGE_ORDER.indexOf(currentStageId);
    if (idx < 0 || idx >= HOLIDAY_STAGE_ORDER.length - 2) return null;
    return HOLIDAY_STAGE_ORDER[idx + 1];
  };

  // ── Checklist Toggle ────────────────────────────────────────────────────────
  const toggleChecklistItem = (booking, itemKey) => {
    const prevList = booking.completedChecklist || [];
    const isDone = prevList.includes(itemKey);
    const updatedList = isDone ? prevList.filter(k => k !== itemKey) : [...prevList, itemKey];

    const updated = { ...booking, completedChecklist: updatedList };
    onUpdateBooking && onUpdateBooking(updated);
    if (activeSheet && activeSheet.packageId === booking.packageId) {
      setActiveSheet({ ...activeSheet, completedChecklist: updatedList });
    }
    setChecklistWarning('');
  };

  // ── Filter values ───────────────────────────────────────────────────────────
  const uniqueDestinations = [...new Set(bookingList.map(b => b.destination).filter(Boolean))];
  const uniqueOfficers     = [...new Set(bookingList.map(b => b.caseOfficerName).filter(Boolean))];
  const hasFilters         = searchQuery || searchOption !== 'all' || destinationFilter !== 'All' || officerFilter !== 'All' || paymentFilter !== 'All';

  const clearFilters = () => {
    setSearchQuery('');
    setSearchOption('all');
    setDestinationFilter('All');
    setOfficerFilter('All');
    setPaymentFilter('All');
  };

  const searchPlaceholder = {
    customerName: 'Search customer name...',
    packageId: 'Search PKG-701, PKG-702...',
    packageName: 'Search Bali, Swiss, Dubai...',
    destination: 'Search destination...',
    caseOfficer: 'Search officer name or CO-102...',
    contact: 'Search phone or email...',
    invoiceNo: 'Search invoice INV-...',
  }[searchOption] || 'Customer, PKG#, Destination, Officer...';

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="kanban-wrapper">
      {/* ── Top Header Box ── */}
      <div className="section-box" style={{ marginBottom: '16px' }}>
        <div className="section-header" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Holiday &amp; Tour Booking Cases — Processing Pipeline</span>
              <span className="nav-badge" style={{ fontSize: '11px', textTransform: 'none' }}>
                {filtered.length} of {bookingList.length} Bookings
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Pipeline Flow: <strong>Stage 1 (Created)</strong> &rarr; <strong>Stage 2 (Docs &amp; Itinerary)</strong> &rarr; <strong>Stage 3 (Vouchers)</strong> &rarr; <strong>Stage 4 (In-Progress)</strong> &rarr; <strong>Completed</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ border: '1px solid #000', display: 'flex' }}>
              <button
                className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0 }}
                onClick={() => setViewMode('kanban')}
              >
                ☷ Kanban Board
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : ''}`}
                style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid #000' }}
                onClick={() => setViewMode('table')}
              >
                ☰ Table View
              </button>
            </div>
            {onAddBooking && (
              <button className="btn btn-sm btn-primary" onClick={onAddBooking}>
                + Add Booking
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Toolbar ── */}
        <div className="toolbar" style={{ marginBottom: 0, justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label>Destination:</label>
              <select value={destinationFilter} onChange={e => setDestinationFilter(e.target.value)}>
                <option value="All">All Destinations</option>
                {uniqueDestinations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Case Officer:</label>
              <select value={officerFilter} onChange={e => setOfficerFilter(e.target.value)}>
                <option value="All">All Officers</option>
                {uniqueOfficers.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Payment:</label>
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                <option value="All">All Payments</option>
                <option value="Prepaid">Prepaid</option>
                <option value="Postpaid">Postpaid</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search By:</label>
              <select value={searchOption} onChange={e => setSearchOption(e.target.value)}>
                <option value="all">All Fields</option>
                <option value="customerName">Customer Name</option>
                <option value="packageId">Package ID</option>
                <option value="packageName">Package Name</option>
                <option value="destination">Destination</option>
                <option value="caseOfficer">Case Officer</option>
                <option value="contact">Contact Details</option>
                <option value="invoiceNo">Invoice No</option>
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
                <button className="btn btn-sm" onClick={clearFilters} title="Clear all filters">
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#555' }}>
            Total Pipeline: <strong>₹{totalPipelineValue.toLocaleString('en-IN')}</strong>
            &nbsp;&bull;&nbsp;
            Completed: <strong>{bookingList.filter(b => getStageForBooking(b) === 'completed').length}</strong>
            &nbsp;&bull;&nbsp;
            In-Progress: <strong>{bookingList.filter(b => getStageForBooking(b) === 'stage-4').length}</strong>
          </div>
        </div>
      </div>

      {/* ── Pipeline Metrics Strip ── */}
      <div className="pipeline-metrics-bar" style={{ marginBottom: '16px' }}>
        {HOLIDAY_STAGES.map((st, idx) => {
          const count = bookingList.filter(b => getStageForBooking(b) === st.id).length;
          const val   = bookingList.filter(b => getStageForBooking(b) === st.id).reduce((s, b) => s + (Number(b.totalPrice) || 0), 0);
          return (
            <React.Fragment key={st.id}>
              <div
                className={`pipeline-metric-step ${st.id === 'completed' ? 'converted-step' : ''}`}
                style={{ borderTop: `3px solid ${st.color}` }}
              >
                <div className="step-badge-number" style={{ background: st.color }}>{idx + 1}</div>
                <div className="step-info">
                  <div className="step-title">{st.shortName}</div>
                  <div className="step-stats">
                    <strong>{count}</strong> &bull; ₹{(val / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
              {idx < HOLIDAY_STAGES.length - 1 && <div className="pipeline-arrow">&rarr;</div>}
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══════════════ KANBAN BOARD ═══════════════ */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board-container">
          <div
            className="kanban-columns-grid"
            style={{ gridTemplateColumns: `repeat(${HOLIDAY_STAGES.length}, minmax(240px, 1fr))` }}
          >
            {HOLIDAY_STAGES.map(stage => {
              const stageBookings = getByStage(stage.id);
              const isDropTarget = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`kanban-column ${isDropTarget ? 'kanban-column-drop-active' : ''} ${stage.id === 'completed' ? 'kanban-column-converted' : ''}`}
                  onDragOver={e => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className="kanban-column-header" style={{ borderTop: `3px solid ${stage.color}` }}>
                    <div>
                      <div className="kanban-column-title">
                        {stage.name}
                        <span className="kanban-count-pill">{stageBookings.length}</span>
                      </div>
                      <div className="kanban-column-desc">{stage.description}</div>
                    </div>
                  </div>

                  {/* Stage callouts */}
                  {stage.id === 'completed' && (
                    <div className="stage-banner-callout" style={{ background: '#f0fdf4', color: '#166534' }}>
                      <span>🎉 Tour Completed Successfully</span>
                    </div>
                  )}
                  {stage.id === 'cancelled' && (
                    <div className="stage-banner-callout" style={{ background: '#fff1f2', color: '#991b1b' }}>
                      <span>❌ Tour Cancelled</span>
                    </div>
                  )}

                  {/* Cards List */}
                  <div className="kanban-cards-list">
                    {stageBookings.length === 0 ? (
                      <div className="kanban-empty-column">
                        <div style={{ color: '#888', fontSize: '12px' }}>No bookings in this stage</div>
                        <div style={{ color: '#aaa', fontSize: '10px', marginTop: '4px' }}>Drag cards here to advance</div>
                      </div>
                    ) : (
                      stageBookings.map(bk => {
                        const nextStageId = getNextStage(bk._stage);
                        const nextStage   = HOLIDAY_STAGES.find(s => s.id === nextStageId);
                        const isDragging  = draggedId === bk.packageId;
                        const payPct      = bk.totalPrice > 0 ? Math.round(((bk.paidAmount || 0) / bk.totalPrice) * 100) : 0;

                        // Checklist status
                        const stageItems = HOLIDAY_STAGE_CHECKLISTS[bk._stage] || [];
                        const mandatoryItems = stageItems.filter(i => i.mandatory);
                        const completedMandatory = mandatoryItems.filter(i => (bk.completedChecklist || []).includes(i.key));
                        const isChecklistComplete = mandatoryItems.length > 0 && completedMandatory.length === mandatoryItems.length;

                        return (
                          <div
                            key={bk.packageId}
                            className={`kanban-card ${isDragging ? 'kanban-card-dragging' : ''}`}
                            draggable
                            onDragStart={e => handleDragStart(e, bk.packageId)}
                          >
                            {/* Card Header */}
                            <div className="kanban-card-header">
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                <span className="kanban-type-badge" style={{ fontSize: '9px', padding: '1px 5px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                                  🌴 Holiday Case
                                </span>
                                <span className="kanban-source-badge" style={{ fontSize: '9px' }}>
                                  {bk.paymentType === 'Prepaid' ? '💳 Prepaid' : '⏳ Postpaid'}
                                </span>
                              </div>
                              <span className="kanban-lead-id" style={{ fontSize: '9px' }}>{bk.packageId}</span>
                            </div>

                            {/* Card Body */}
                            <div className="kanban-card-body" onClick={() => setActiveSheet(bk)} style={{ cursor: 'pointer' }}>
                              <div className="kanban-lead-name">{bk.packageName}</div>
                              <div style={{ fontSize: '11px', color: '#222', marginTop: '2px', fontWeight: '500' }}>
                                👤 {bk.customerName}
                              </div>
                              <div className="kanban-company-text" style={{ marginTop: '2px' }}>
                                📍 {bk.destination} &bull; <span style={{ fontFamily: 'monospace' }}>{bk.duration}</span>
                              </div>

                              {/* Checklist badge indicator */}
                              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                                <span style={{
                                  padding: '1px 6px',
                                  borderRadius: '2px',
                                  fontWeight: '600',
                                  background: isChecklistComplete ? '#dcfce7' : '#fef3c7',
                                  color: isChecklistComplete ? '#15803d' : '#b45309',
                                  border: `1px solid ${isChecklistComplete ? '#86efac' : '#fde68a'}`
                                }}>
                                  {isChecklistComplete ? '✓ Checklist Done' : `📋 Checklist: ${completedMandatory.length}/${mandatoryItems.length}`}
                                </span>
                                <span style={{ color: '#888', fontSize: '10px' }}>
                                  Dep: {bk.departureDate}
                                </span>
                              </div>

                              {/* Payment Progress */}
                              <div style={{ margin: '8px 0 4px', fontSize: '11px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span>₹{(bk.totalPrice || 0).toLocaleString('en-IN')}</span>
                                  <span style={{ color: payPct >= 100 ? '#22c55e' : '#f59e0b', fontWeight: '600' }}>
                                    {payPct}% paid
                                  </span>
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: '2px', height: '4px' }}>
                                  <div
                                    style={{
                                      width: `${payPct}%`,
                                      background: payPct >= 100 ? '#22c55e' : '#f59e0b',
                                      height: '4px',
                                      borderRadius: '2px',
                                      transition: 'width .3s'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Officer */}
                              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                                👔 {bk.caseOfficerName || 'Priya Singh'}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div style={{ display: 'flex', gap: '4px', padding: '6px 0 0', borderTop: '1px solid #f0f0f0', marginTop: '4px', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-sm"
                                style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                onClick={() => setActiveSheet(bk)}
                              >
                                Side Sheet
                              </button>
                              {nextStage && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                  onClick={() => advanceStage(bk, nextStageId)}
                                  title={`Move to ${nextStage.shortName}`}
                                >
                                  &rarr; {nextStage.shortName}
                                </button>
                              )}
                              {bk._stage === 'stage-3' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ flex: 1, fontSize: '10px', padding: '3px 6px' }}
                                  onClick={() => advanceStage(bk, 'cancelled')}
                                >
                                  Cancel
                                </button>
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
                  <th>Package ID</th>
                  <th>Customer</th>
                  <th>Package Name</th>
                  <th>Destination</th>
                  <th>Stage</th>
                  <th>Duration</th>
                  <th>Total Price</th>
                  <th>Payment</th>
                  <th>Departure Date</th>
                  <th>Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                      No bookings match your filter criteria.{' '}
                      <button className="btn btn-sm" onClick={clearFilters}>Clear Filters</button>
                    </td>
                  </tr>
                ) : (
                  filtered.map(bk => {
                    const stageObj = HOLIDAY_STAGES.find(s => s.id === bk._stage);
                    return (
                      <tr key={bk.packageId}>
                        <td className="font-mono"><strong>{bk.packageId}</strong></td>
                        <td>
                          <div><strong>{bk.customerName}</strong></div>
                          {bk.contactDetails && <div style={{ fontSize: '11px', color: '#666' }}>📞 {bk.contactDetails}</div>}
                          {bk.email && <div style={{ fontSize: '11px', color: '#666' }}>✉️ {bk.email}</div>}
                        </td>
                        <td>{bk.packageName}</td>
                        <td>{bk.destination}</td>
                        <td>
                          <span className="status-badge" style={{ borderLeft: `3px solid ${stageObj?.color || '#ccc'}`, fontSize: '11px' }}>
                            {stageObj?.shortName || bk.status}
                          </span>
                        </td>
                        <td>{bk.duration}</td>
                        <td className="font-mono">₹{(bk.totalPrice || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className="status-badge" style={{ fontSize: '10px' }}>{bk.paymentStatus || 'Paid'}</span>
                          <div style={{ fontSize: '9px', color: '#666' }}>{bk.paymentType}</div>
                        </td>
                        <td>{bk.departureDate}</td>
                        <td>{bk.caseOfficerName}</td>
                        <td className="action-cell">
                          <button className="btn btn-sm btn-primary" onClick={() => setActiveSheet(bk)}>
                            Side Sheet &rarr;
                          </button>
                          {onViewDetails && (
                            <button className="btn btn-sm" onClick={() => onViewDetails(bk)}>
                              Details
                            </button>
                          )}
                          {onExtendBooking && (
                            <button className="btn btn-sm" onClick={() => onExtendBooking(bk)}>
                              Extend
                            </button>
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

      {/* ═══════════════ SIDE SHEET WITH STAGE CHECKLIST ═══════════════ */}
      {activeSheet && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
          onClick={() => { setActiveSheet(null); setChecklistWarning(''); }}
        >
          <div
            style={{
              width: '540px',
              height: '100%',
              background: '#fff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              borderLeft: '4px solid #000'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div style={{ background: '#111', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px' }}>{activeSheet.packageName}</div>
                <div style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace', marginTop: '2px' }}>
                  {activeSheet.packageId} &bull; Customer: {activeSheet.customerName}
                </div>
              </div>
              <button
                style={{ background: 'none', border: '1px solid #555', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: '13px' }}
                onClick={() => { setActiveSheet(null); setChecklistWarning(''); }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {/* Stage indicator */}
              {(() => {
                const stageObj = HOLIDAY_STAGES.find(s => s.id === getStageForBooking(activeSheet));
                return (
                  <div style={{ background: stageObj?.color + '15', border: `1px solid ${stageObj?.color}`, padding: '10px 14px', marginBottom: '16px', borderRadius: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: stageObj?.color, fontSize: '13px' }}>{stageObj?.name}</div>
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{stageObj?.description}</div>
                    </div>
                  </div>
                );
              })()}

              {/* ── MANDATORY CHECKLIST SECTION (FROM CRM DIAGRAM) ── */}
              <div style={{ marginBottom: '20px', border: '2px solid #000', padding: '14px', background: '#fafafa', borderRadius: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
                  <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📋 Stage Checklist ({HOLIDAY_STAGES.find(s => s.id === getStageForBooking(activeSheet))?.shortName})
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
                  {(HOLIDAY_STAGE_CHECKLISTS[getStageForBooking(activeSheet)] || []).map((item) => {
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

              {/* Booking & Package Information */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Booking &amp; Package Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>PACKAGE ID</div><div style={{ fontFamily: 'monospace', fontWeight: '600' }}>{activeSheet.packageId}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>DESTINATION</div><div style={{ fontWeight: '600' }}>{activeSheet.destination}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>DURATION</div><div>{activeSheet.duration} ({activeSheet.days}D / {activeSheet.nights}N)</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>DEPARTURE DATE</div><div>{activeSheet.departureDate}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>BOOKING DATE</div><div>{activeSheet.bookingDate}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>CASE OFFICER</div><div>{activeSheet.caseOfficerName} ({activeSheet.caseOfficerId})</div></div>
                </div>
              </div>

              {/* Customer Information */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Customer Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>CUSTOMER NAME</div><div style={{ fontWeight: '600' }}>{activeSheet.customerName}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>CONTACT PHONE</div><div>{activeSheet.contactDetails || '—'}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>EMAIL</div><div>{activeSheet.email || '—'}</div></div>
                  <div><div style={{ color: '#666', fontSize: '10px' }}>INVOICE REF</div><div style={{ fontFamily: 'monospace' }}>{activeSheet.invoiceNo || 'INV-PENDING'}</div></div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                  Payment Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { label: 'TOTAL PRICE',  value: `₹${(activeSheet.totalPrice || 0).toLocaleString('en-IN')}`, color: '#111' },
                    { label: 'PAID AMOUNT',  value: `₹${(activeSheet.paidAmount || 0).toLocaleString('en-IN')}`,  color: '#22c55e' },
                    { label: 'PENDING',      value: `₹${(activeSheet.pendingAmount || 0).toLocaleString('en-IN')}`, color: activeSheet.pendingAmount > 0 ? '#ef4444' : '#22c55e' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ border: '1px solid #e0e0e0', padding: '8px', textAlign: 'center', background: '#fafafa' }}>
                      <div style={{ fontSize: '9px', color: '#888', letterSpacing: '0.5px' }}>{label}</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '11px', display: 'flex', gap: '12px', color: '#555' }}>
                  <span>Order Type: <strong>{activeSheet.paymentType}</strong></span>
                  <span>Payment Status: <strong>{activeSheet.paymentStatus}</strong></span>
                </div>
              </div>

              {/* Stage Advance Actions */}
              {(() => {
                const currentStageId = getStageForBooking(activeSheet);
                const nextStageId    = getNextStage(currentStageId);
                const nextStage      = HOLIDAY_STAGES.find(s => s.id === nextStageId);

                return (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '10px' }}>
                      Pipeline Progression Controls
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {nextStage && (
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => advanceStage(activeSheet, nextStageId)}
                        >
                          &rarr; Advance to {nextStage.shortName}
                        </button>
                      )}
                      {currentStageId !== 'completed' && currentStageId !== 'cancelled' && (
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                          onClick={() => advanceStage(activeSheet, 'cancelled')}
                        >
                          ✕ Mark as Cancelled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* View Full Details & Extend Booking buttons */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px' }}>
                {onViewDetails && (
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const bk = activeSheet;
                      setActiveSheet(null);
                      onViewDetails(bk);
                    }}
                  >
                    View Full Booking Details &rarr;
                  </button>
                )}
                {onExtendBooking && (
                  <button
                    className="btn btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const bk = activeSheet;
                      setActiveSheet(null);
                      onExtendBooking(bk);
                    }}
                  >
                    Extend Duration
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
