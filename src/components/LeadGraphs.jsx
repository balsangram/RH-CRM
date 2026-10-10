import React, { useState, useMemo } from 'react';

// Datasets for different time filters
const MOCK_GRAPH_DATA = {
  Today: [
    { label: '09:00 AM', holiday: 14, visa: 9 },
    { label: '12:00 PM', holiday: 28, visa: 18 },
    { label: '03:00 PM', holiday: 42, visa: 25 },
    { label: '06:00 PM', holiday: 35, visa: 22 },
    { label: '09:00 PM', holiday: 18, visa: 14 }
  ],
  'This Week': [
    { label: 'Mon', holiday: 45, visa: 30 },
    { label: 'Tue', holiday: 62, visa: 42 },
    { label: 'Wed', holiday: 38, visa: 55 },
    { label: 'Thu', holiday: 78, visa: 50 },
    { label: 'Fri', holiday: 54, visa: 48 },
    { label: 'Sat', holiday: 68, visa: 35 },
    { label: 'Sun', holiday: 40, visa: 22 }
  ],
  'This Month': [
    { label: 'Week 1', holiday: 185, visa: 140 },
    { label: 'Week 2', holiday: 240, visa: 195 },
    { label: 'Week 3', holiday: 310, visa: 220 },
    { label: 'Week 4', holiday: 275, visa: 210 }
  ],
  'This Year': [
    { label: 'Jan', holiday: 420, visa: 310 },
    { label: 'Feb', holiday: 510, visa: 380 },
    { label: 'Mar', holiday: 680, visa: 450 },
    { label: 'Apr', holiday: 740, visa: 520 },
    { label: 'May', holiday: 890, visa: 610 },
    { label: 'Jun', holiday: 950, visa: 700 },
    { label: 'Jul', holiday: 1120, visa: 830 },
    { label: 'Aug', holiday: 1050, visa: 790 },
    { label: 'Sep', holiday: 980, visa: 720 },
    { label: 'Oct', holiday: 1150, visa: 860 },
    { label: 'Nov', holiday: 1280, visa: 940 },
    { label: 'Dec', holiday: 1400, visa: 1050 }
  ]
};

export default function LeadGraphs({ initialFilter = 'This Month' }) {
  const [filter, setFilter] = useState(initialFilter);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'stacked'
  const [showHoliday, setShowHoliday] = useState(true);
  const [showVisa, setShowVisa] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Custom Date Range State
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-10');

  // Compute active dataset based on filter
  const currentData = useMemo(() => {
    if (filter === 'Custom Date Range') {
      return [
        { label: 'Oct 01', holiday: 32, visa: 24 },
        { label: 'Oct 03', holiday: 48, visa: 31 },
        { label: 'Oct 05', holiday: 60, visa: 45 },
        { label: 'Oct 07', holiday: 52, visa: 38 },
        { label: 'Oct 09', holiday: 70, visa: 55 },
        { label: 'Oct 10', holiday: 45, visa: 30 }
      ];
    }
    return MOCK_GRAPH_DATA[filter] || MOCK_GRAPH_DATA['This Month'];
  }, [filter]);

  // Calculations
  const totalHoliday = useMemo(
    () => currentData.reduce((acc, item) => acc + (showHoliday ? item.holiday : 0), 0),
    [currentData, showHoliday]
  );

  const totalVisa = useMemo(
    () => currentData.reduce((acc, item) => acc + (showVisa ? item.visa : 0), 0),
    [currentData, showVisa]
  );

  const totalCombined = totalHoliday + totalVisa;
  const holidayPct = totalCombined > 0 ? ((totalHoliday / totalCombined) * 100).toFixed(1) : 0;
  const visaPct = totalCombined > 0 ? ((totalVisa / totalCombined) * 100).toFixed(1) : 0;

  // Max value calculation for Y-Axis scaling
  const maxSingleVal = useMemo(() => {
    let max = 0;
    currentData.forEach(d => {
      if (chartType === 'stacked') {
        const sum = (showHoliday ? d.holiday : 0) + (showVisa ? d.visa : 0);
        if (sum > max) max = sum;
      } else {
        if (showHoliday && d.holiday > max) max = d.holiday;
        if (showVisa && d.visa > max) max = d.visa;
      }
    });
    return max > 0 ? Math.ceil(max * 1.15) : 100;
  }, [currentData, chartType, showHoliday, showVisa]);

  // Peak period identification
  const peakItem = useMemo(() => {
    let maxTotal = -1;
    let peakObj = null;
    currentData.forEach(d => {
      const total = d.holiday + d.visa;
      if (total > maxTotal) {
        maxTotal = total;
        peakObj = d;
      }
    });
    return peakObj;
  }, [currentData]);

  // Y-axis grid ticks
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map(ratio => Math.round(maxSingleVal * ratio));

  // Export CSV helper
  const handleExportCSV = () => {
    let csv = 'Period,Holiday Leads,Visa Leads,Total\n';
    currentData.forEach(item => {
      csv += `"${item.label}",${item.holiday},${item.visa},${item.holiday + item.visa}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead_analytics_${filter.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lead-graph-wrapper bw-wireframe">
      {/* Header Controls */}
      <div className="lead-graph-header">
        <div className="lead-graph-title-area">
          <div className="lead-graph-main-title">
            Lead Graphs (Holiday vs Visa Leads)
          </div>
          <span className="lead-graph-subtitle">
            Overview of lead volume received over time ({filter})
          </span>
        </div>

        <div className="lead-graph-actions">
          {/* Chart Type Switcher */}
          <div className="chart-type-toggle bw-toggle">
            <button
              className={`type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar
            </button>
            <button
              className={`type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Area/Line
            </button>
            <button
              className={`type-btn ${chartType === 'stacked' ? 'active' : ''}`}
              onClick={() => setChartType('stacked')}
            >
              Stacked
            </button>
          </div>

          {/* Time Filter Dropdown */}
          <div className="filter-dropdown-container">
            <label className="filter-label">Filter:</label>
            <select
              className="lead-filter-select bw-select"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom Date Range">Custom Date Range</option>
            </select>
          </div>

          {/* Export CSV */}
          <button className="export-csv-btn bw-btn" onClick={handleExportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker bar if selected */}
      {filter === 'Custom Date Range' && (
        <div className="custom-range-bar bw-box">
          <div className="date-input-group">
            <label>Start Date:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="date-input-group">
            <label>End Date:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn-apply-range bw-btn" onClick={() => setFilter('Custom Date Range')}>Apply</button>
        </div>
      )}

      {/* Metric Cards Summary Banner */}
      <div className="lead-summary-cards">
        {/* Holiday Card */}
        <div
          className={`summary-mini-card bw-card ${!showHoliday ? 'dimmed' : ''}`}
          onClick={() => setShowHoliday(!showHoliday)}
          title="Click to toggle Holiday Leads"
        >
          <div className="card-badge-dot holiday-dot-bw"></div>
          <div className="mini-card-content">
            <span className="mini-card-title">Holiday Leads</span>
            <div className="mini-card-num-row">
              <span className="mini-card-num">{totalHoliday.toLocaleString()}</span>
              <span className="trend-badge bw-badge">+14.2%</span>
            </div>
            <span className="mini-card-sub">{holidayPct}% of total</span>
          </div>
        </div>

        {/* Visa Card */}
        <div
          className={`summary-mini-card bw-card ${!showVisa ? 'dimmed' : ''}`}
          onClick={() => setShowVisa(!showVisa)}
          title="Click to toggle Visa Leads"
        >
          <div className="card-badge-dot visa-dot-bw"></div>
          <div className="mini-card-content">
            <span className="mini-card-title">Visa Leads</span>
            <div className="mini-card-num-row">
              <span className="mini-card-num">{totalVisa.toLocaleString()}</span>
              <span className="trend-badge bw-badge">+8.5%</span>
            </div>
            <span className="mini-card-sub">{visaPct}% of total</span>
          </div>
        </div>

        {/* Combined Card */}
        <div className="summary-mini-card bw-card">
          <div className="mini-card-content">
            <span className="mini-card-title">Total Leads Received</span>
            <div className="mini-card-num-row">
              <span className="mini-card-num">{totalCombined.toLocaleString()}</span>
              {peakItem && (
                <span className="peak-badge bw-peak">
                  Peak: {peakItem.label} ({peakItem.holiday + peakItem.visa})
                </span>
              )}
            </div>
            {/* Visual ratio progress bar */}
            <div className="lead-ratio-bar bw-ratio">
              <div
                className="ratio-fill holiday-fill-bw"
                style={{ width: `${holidayPct}%` }}
                title={`Holiday Leads: ${holidayPct}%`}
              ></div>
              <div
                className="ratio-fill visa-fill-bw"
                style={{ width: `${visaPct}%` }}
                title={`Visa Leads: ${visaPct}%`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Chart Area */}
      <div className="chart-canvas-container bw-canvas">
        {/* Y-Axis scale lines */}
        <div className="y-axis-container">
          {yTicks.map((tickVal, idx) => (
            <div className="y-axis-tick" key={idx}>
              <span className="tick-label">{tickVal}</span>
              <div className="grid-line bw-grid"></div>
            </div>
          ))}
        </div>

        {/* Chart Body Container */}
        <div className="chart-body">
          {/* BAR CHART VIEW */}
          {chartType === 'bar' && (
            <div className="bars-group-container">
              {currentData.map((item, idx) => {
                const hHeight = showHoliday ? (item.holiday / maxSingleVal) * 100 : 0;
                const vHeight = showVisa ? (item.visa / maxSingleVal) * 100 : 0;
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`bar-column-group ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="chart-tooltip bw-tooltip">
                        <div className="tooltip-header">{item.label}</div>
                        {showHoliday && (
                          <div className="tooltip-row">
                            <span className="tooltip-dot holiday-dot-bw"></span>
                            <span>Holiday: <strong>{item.holiday}</strong></span>
                          </div>
                        )}
                        {showVisa && (
                          <div className="tooltip-row">
                            <span className="tooltip-dot visa-dot-bw"></span>
                            <span>Visa: <strong>{item.visa}</strong></span>
                          </div>
                        )}
                        <div className="tooltip-total">
                          Total: {(showHoliday ? item.holiday : 0) + (showVisa ? item.visa : 0)}
                        </div>
                      </div>
                    )}

                    <div className="bars-pair">
                      {showHoliday && (
                        <div
                          className="bar-item holiday-bar-bw"
                          style={{ height: `${Math.max(hHeight, 2)}%` }}
                        >
                          <span className="bar-val-hover">{item.holiday}</span>
                        </div>
                      )}
                      {showVisa && (
                        <div
                          className="bar-item visa-bar-bw"
                          style={{ height: `${Math.max(vHeight, 2)}%` }}
                        >
                          <span className="bar-val-hover">{item.visa}</span>
                        </div>
                      )}
                    </div>
                    <span className="x-axis-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* STACKED BAR CHART VIEW */}
          {chartType === 'stacked' && (
            <div className="bars-group-container stacked">
              {currentData.map((item, idx) => {
                const total = (showHoliday ? item.holiday : 0) + (showVisa ? item.visa : 0);
                const totalHeight = (total / maxSingleVal) * 100;
                const hShare = total > 0 && showHoliday ? (item.holiday / total) * 100 : 0;
                const vShare = total > 0 && showVisa ? (item.visa / total) * 100 : 0;
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`bar-column-group ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {isHovered && (
                      <div className="chart-tooltip bw-tooltip">
                        <div className="tooltip-header">{item.label}</div>
                        {showHoliday && (
                          <div className="tooltip-row">
                            <span className="tooltip-dot holiday-dot-bw"></span>
                            <span>Holiday: <strong>{item.holiday}</strong> ({hShare.toFixed(0)}%)</span>
                          </div>
                        )}
                        {showVisa && (
                          <div className="tooltip-row">
                            <span className="tooltip-dot visa-dot-bw"></span>
                            <span>Visa: <strong>{item.visa}</strong> ({vShare.toFixed(0)}%)</span>
                          </div>
                        )}
                        <div className="tooltip-total">Total: {total}</div>
                      </div>
                    )}

                    <div className="stacked-bar-column bw-stacked-col" style={{ height: `${Math.max(totalHeight, 3)}%` }}>
                      {showHoliday && item.holiday > 0 && (
                        <div
                          className="stacked-segment holiday-segment-bw"
                          style={{ height: `${hShare}%` }}
                        >
                          {hShare > 15 && <span>{item.holiday}</span>}
                        </div>
                      )}
                      {showVisa && item.visa > 0 && (
                        <div
                          className="stacked-segment visa-segment-bw"
                          style={{ height: `${vShare}%` }}
                        >
                          {vShare > 15 && <span>{item.visa}</span>}
                        </div>
                      )}
                    </div>
                    <span className="x-axis-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* AREA / LINE SVG CHART VIEW */}
          {chartType === 'line' && (
            <div className="svg-area-container">
              <SvgLineChartBW
                data={currentData}
                maxVal={maxSingleVal}
                showHoliday={showHoliday}
                showVisa={showVisa}
                hoveredIdx={hoveredIdx}
                setHoveredIdx={setHoveredIdx}
              />
              <div className="x-labels-row">
                {currentData.map((item, idx) => (
                  <span
                    key={idx}
                    className={`x-axis-label ${hoveredIdx === idx ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend Footer */}
      <div className="lead-graph-footer">
        <div className="interactive-legend">
          <button
            className={`legend-chip bw-chip ${!showHoliday ? 'disabled' : ''}`}
            onClick={() => setShowHoliday(!showHoliday)}
          >
            <span className="legend-indicator holiday-dot-bw"></span>
            Holiday Leads ({totalHoliday})
          </button>
          <button
            className={`legend-chip bw-chip ${!showVisa ? 'disabled' : ''}`}
            onClick={() => setShowVisa(!showVisa)}
          >
            <span className="legend-indicator visa-dot-bw"></span>
            Visa Leads ({totalVisa})
          </button>
        </div>

        <div className="chart-info-note">
          <span>Click legend items to toggle series. Hover over bars/nodes to inspect details.</span>
        </div>
      </div>
    </div>
  );
}

// SVG Line / Area chart sub-component in Pure Black and White Wireframe
function SvgLineChartBW({ data, maxVal, showHoliday, showVisa, hoveredIdx, setHoveredIdx }) {
  const width = 800;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? innerW / (pointsCount - 1) : innerW;

  // Compute coordinates
  const hPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: paddingY + innerH - (d.holiday / maxVal) * innerH,
    val: d.holiday,
    label: d.label
  }));

  const vPoints = data.map((d, i) => ({
    x: paddingX + i * stepX,
    y: paddingY + innerH - (d.visa / maxVal) * innerH,
    val: d.visa,
    label: d.label
  }));

  // Build SVG Path strings
  const buildSmoothPath = points => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cp1x = current.x + (next.x - current.x) / 2;
      const cp1y = current.y;
      const cp2x = current.x + (next.x - current.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const hLinePath = buildSmoothPath(hPoints);
  const vLinePath = buildSmoothPath(vPoints);

  const hAreaPath = hPoints.length > 0
    ? `${hLinePath} L ${hPoints[hPoints.length - 1].x} ${height - paddingY} L ${hPoints[0].x} ${height - paddingY} Z`
    : '';

  const vAreaPath = vPoints.length > 0
    ? `${vLinePath} L ${vPoints[vPoints.length - 1].x} ${height - paddingY} L ${vPoints[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="svg-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="area-svg">
        <defs>
          <linearGradient id="holidayGradBW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="visaGradBW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#888888" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#888888" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Areas */}
        {showHoliday && <path d={hAreaPath} fill="url(#holidayGradBW)" />}
        {showVisa && <path d={vAreaPath} fill="url(#visaGradBW)" />}

        {/* Lines */}
        {showHoliday && (
          <path d={hLinePath} fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {showVisa && (
          <path d={vLinePath} fill="none" stroke="#888888" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
        )}

        {/* Data Node Dots & Hover vertical highlight */}
        {data.map((item, idx) => {
          const hp = hPoints[idx];
          const vp = vPoints[idx];
          const isHovered = hoveredIdx === idx;

          return (
            <g key={idx}>
              {/* Hover vertical guideline */}
              {isHovered && (
                <line
                  x1={hp.x}
                  y1={paddingY}
                  x2={hp.x}
                  y2={height - paddingY}
                  stroke="#000000"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Holiday Node Dot (Solid Black) */}
              {showHoliday && (
                <circle
                  cx={hp.x}
                  cy={hp.y}
                  r={isHovered ? 6 : 4}
                  fill="#000000"
                  stroke="#ffffff"
                  strokeWidth={2}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              )}

              {/* Visa Node Dot (Gray with Black outline) */}
              {showVisa && (
                <circle
                  cx={vp.x}
                  cy={vp.y}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth={2}
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip for Line Chart */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="chart-tooltip bw-tooltip line-tooltip"
          style={{
            left: `${(hPoints[hoveredIdx].x / width) * 100}%`,
            top: '10px'
          }}
        >
          <div className="tooltip-header">{data[hoveredIdx].label}</div>
          {showHoliday && (
            <div className="tooltip-row">
              <span className="tooltip-dot holiday-dot-bw"></span>
              <span>Holiday: <strong>{data[hoveredIdx].holiday}</strong></span>
            </div>
          )}
          {showVisa && (
            <div className="tooltip-row">
              <span className="tooltip-dot visa-dot-bw"></span>
              <span>Visa: <strong>{data[hoveredIdx].visa}</strong></span>
            </div>
          )}
          <div className="tooltip-total">
            Total: {(showHoliday ? data[hoveredIdx].holiday : 0) + (showVisa ? data[hoveredIdx].visa : 0)}
          </div>
        </div>
      )}
    </div>
  );
}
