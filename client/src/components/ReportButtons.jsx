import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Calendar, Filter, X, SlidersHorizontal, CheckSquare, Square, Archive } from 'lucide-react';
import { downloadExcelReport, downloadPdfReport } from '../utils/reportGenerator';

// Robust date parser for various institutional date formats
const parseAnyDate = (dateStr) => {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  // DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    const dateObj = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  }
  // Academic Year YYYY-YYYY or YYYY-YY (e.g. 2025-2026)
  const acadMatch = str.match(/^(\d{4})[-/]/);
  if (acadMatch) {
    const year = acadMatch[1];
    const dateObj = new Date(`${year}-06-01`);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  }
  // Single Year (e.g. 2025)
  if (/^\d{4}$/.test(str)) {
    const dateObj = new Date(`${str}-01-01`);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  }
  
  const parsed = Date.parse(str);
  return isNaN(parsed) ? null : new Date(parsed);
};

export default function ReportButtons({ pageTitle, departmentName, headers, rows, filename, disabled, auth, orientation, records }) {
  const [downloading, setDownloading] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Field selection state
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState(() => (headers || []).map((_, i) => i));

  useEffect(() => {
    if (headers && headers.length > 0) {
      setSelectedIndices(headers.map((_, i) => i));
    }
  }, [headers]);

  // Identify date-related column indices in headers
  const dateColIndices = [];
  (headers || []).forEach((h, idx) => {
    const hClean = String(h || '').toLowerCase();
    if (
      hClean.includes('doj') ||
      hClean.includes('date') ||
      hClean.includes('year') ||
      hClean.includes('sanction') ||
      hClean.includes('filing') ||
      hClean.includes('issue') ||
      hClean.includes('joining') ||
      hClean.includes('passing') ||
      hClean.includes('period') ||
      hClean.includes('duration')
    ) {
      dateColIndices.push(idx);
    }
  });

  // Fallback: Check sample row data for date/year strings if header didn't match
  if (dateColIndices.length === 0 && rows && rows.length > 0) {
    const sampleRow = rows[0];
    if (Array.isArray(sampleRow)) {
      sampleRow.forEach((cellVal, idx) => {
        if (cellVal && parseAnyDate(cellVal)) {
          dateColIndices.push(idx);
        }
      });
    }
  }

  // Filter rows by date range if dates are selected
  const getFilteredRows = () => {
    if ((!fromDate && !toDate) || !rows) {
      return rows || [];
    }

    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return rows.filter(row => {
      if (!Array.isArray(row)) return true;
      const targetIndices = dateColIndices.length > 0 ? dateColIndices : row.map((_, i) => i);
      return targetIndices.some(idx => {
        const cellVal = row[idx];
        const parsed = parseAnyDate(cellVal);
        if (!parsed) return false;
        if (start && parsed < start) return false;
        if (end && parsed > end) return false;
        return true;
      });
    });
  };

  const filteredRows = getFilteredRows();
  const hasActiveDateFilter = Boolean(fromDate || toDate);

  // Compute active headers & rows based on field selection
  const activeIndices = selectedIndices.length > 0 ? selectedIndices : (headers || []).map((_, i) => i);
  const effectiveHeaders = activeIndices.map(i => headers[i]);
  const effectiveRows = filteredRows.map(row => activeIndices.map(i => row[i]));

  const hasFieldCustomization = headers && headers.length > 0 && selectedIndices.length < headers.length;

  // Compute title with date range if active
  const getEffectivePageTitle = () => {
    if (!hasActiveDateFilter) return pageTitle;
    let rangeText = '';
    if (fromDate && toDate) {
      const fFormatted = new Date(fromDate).toLocaleDateString('en-GB');
      const tFormatted = new Date(toDate).toLocaleDateString('en-GB');
      rangeText = ` (${fFormatted} - ${tFormatted})`;
    } else if (fromDate) {
      const fFormatted = new Date(fromDate).toLocaleDateString('en-GB');
      rangeText = ` (From ${fFormatted})`;
    } else if (toDate) {
      const tFormatted = new Date(toDate).toLocaleDateString('en-GB');
      rangeText = ` (Until ${tFormatted})`;
    }
    return `${pageTitle}${rangeText}`;
  };

  const getEffectiveDepartmentName = () => {
    if (departmentName !== undefined && departmentName !== null) {
      return departmentName;
    }
    if (auth && (auth.role === 'dept_admin' || auth.role === 'faculty')) {
      return auth.dept || auth.department || '';
    }
    return '';
  };

  const handleExcelExport = () => {
    if (disabled || !effectiveRows || effectiveRows.length === 0) return;
    try {
      downloadExcelReport({
        filename: filename || pageTitle,
        pageTitle: getEffectivePageTitle(),
        departmentName: getEffectiveDepartmentName(),
        headers: effectiveHeaders,
        rows: effectiveRows
      });
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('Failed to generate Excel report.');
    }
  };

  const handlePdfExport = async () => {
    if (disabled || !effectiveRows || effectiveRows.length === 0) return;
    setDownloading(true);
    try {
      await downloadPdfReport({
        filename: filename || pageTitle,
        pageTitle: getEffectivePageTitle(),
        departmentName: getEffectiveDepartmentName(),
        headers: effectiveHeaders,
        rows: effectiveRows,
        orientation: orientation,
        auth: auth || {}
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  // Extract document file paths or URLs from records and filtered rows
  const extractFilePaths = () => {
    const fileList = [];

    // Check explicit raw records array if passed
    if (records && Array.isArray(records)) {
      records.forEach(item => {
        if (!item || typeof item !== 'object') return;
        Object.values(item).forEach(val => {
          if (typeof val === 'string' && val.trim()) {
            const clean = val.trim().split('?')[0];
            if (
              clean.includes('/uploads/') ||
              clean.includes('/SREC/') ||
              /\.(pdf|jpg|jpeg|png|docx?|xlsx?|txt)$/i.test(clean)
            ) {
              fileList.push(clean);
            }
          }
        });
      });
    }

    // Also check filtered rows cells for document URLs or filenames
    if (filteredRows && Array.isArray(filteredRows)) {
      filteredRows.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(cell => {
            if (typeof cell === 'string' && cell.trim()) {
              const clean = cell.trim().split('?')[0];
              if (
                clean.includes('/uploads/') ||
                clean.includes('/SREC/') ||
                /\.(pdf|jpg|jpeg|png|docx?|xlsx?|txt)$/i.test(clean)
              ) {
                fileList.push(clean);
              }
            }
          });
        }
      });
    }

    return [...new Set(fileList)].filter(f => f && f !== 'null' && f !== 'undefined' && f !== 'N/A' && f !== 'None');
  };

  const availableFiles = extractFilePaths();

  const handleZipExport = async () => {
    if (availableFiles.length === 0) {
      alert('No document attachments found in the current page records to download.');
      return;
    }

    setZipping(true);
    try {
      const token = auth?.token || localStorage.getItem('srec_token');
      const response = await fetch(`${API_BASE_URL}/api/utils/download-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          files: availableFiles,
          zipName: filename || pageTitle
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to download ZIP archive.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${(filename || pageTitle).toLowerCase().replace(/[^a-z0-9]/gi, '_')}_documents.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Zip Export Error:', err);
      alert(err.message || 'Failed to download documents ZIP.');
    } finally {
      setZipping(false);
    }
  };

  const isBtnDisabled = disabled || !filteredRows || filteredRows.length === 0;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Select Fields Toggle Button */}
        {headers && headers.length > 0 && (
          <button
            type="button"
            className="btn"
            onClick={() => setShowFieldSelector(!showFieldSelector)}
            style={{
              background: hasFieldCustomization ? '#7c3aed' : '#f8fafc',
              color: hasFieldCustomization ? '#ffffff' : '#334155',
              borderColor: hasFieldCustomization ? '#7c3aed' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
            title="Select specific fields to include in PDF & Excel reports"
          >
            <SlidersHorizontal size={16} />
            {hasFieldCustomization ? `Fields Selected (${selectedIndices.length}/${headers.length})` : 'Select Fields'}
          </button>
        )}

        {/* Date Filter Toggle Button */}
        <button
          type="button"
          className="btn"
          onClick={() => setShowDateFilter(!showDateFilter)}
          style={{
            background: hasActiveDateFilter ? '#0284c7' : '#f8fafc',
            color: hasActiveDateFilter ? '#ffffff' : '#334155',
            borderColor: hasActiveDateFilter ? '#0284c7' : '#cbd5e1',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease'
          }}
          title="Filter report records by date range"
        >
          <Calendar size={16} />
          {hasActiveDateFilter ? 'Date Filter Active' : 'Date Range Report'}
          {hasActiveDateFilter && (
            <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {filteredRows.length}/{rows?.length || 0}
            </span>
          )}
        </button>

        {/* Excel Download Button */}
        <button
          type="button"
          className="btn"
          onClick={handleExcelExport}
          disabled={isBtnDisabled}
          style={{
            background: isBtnDisabled ? '#e2e8f0' : '#16a34a',
            color: isBtnDisabled ? '#94a3b8' : '#ffffff',
            borderColor: isBtnDisabled ? '#cbd5e1' : '#16a34a',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            boxShadow: isBtnDisabled ? 'none' : '0 2px 6px rgba(22, 163, 74, 0.25)',
            transition: 'all 0.2s ease'
          }}
          title="Download Excel (.xlsx) Report"
        >
          <FileSpreadsheet size={16} />
          Excel Report
        </button>

        {/* PDF Download Button */}
        <button
          type="button"
          className="btn"
          onClick={handlePdfExport}
          disabled={isBtnDisabled || downloading}
          style={{
            background: isBtnDisabled ? '#e2e8f0' : '#dc2626',
            color: isBtnDisabled ? '#94a3b8' : '#ffffff',
            borderColor: isBtnDisabled ? '#cbd5e1' : '#dc2626',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isBtnDisabled || downloading ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            boxShadow: isBtnDisabled ? 'none' : '0 2px 6px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.2s ease'
          }}
          title="Download PDF (.pdf) Report"
        >
          <FileText size={16} />
          {downloading ? 'Generating PDF...' : 'PDF Report'}
        </button>

        {/* ZIP Attachments Download Button */}
        <button
          type="button"
          className="btn"
          onClick={handleZipExport}
          disabled={disabled || zipping || availableFiles.length === 0}
          style={{
            background: (disabled || zipping || availableFiles.length === 0) ? '#e2e8f0' : '#0284c7',
            color: (disabled || zipping || availableFiles.length === 0) ? '#94a3b8' : '#ffffff',
            borderColor: (disabled || zipping || availableFiles.length === 0) ? '#cbd5e1' : '#0284c7',
            fontWeight: 700,
            fontSize: '0.85rem',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: (disabled || zipping || availableFiles.length === 0) ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            boxShadow: (disabled || zipping || availableFiles.length === 0) ? 'none' : '0 2px 6px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s ease'
          }}
          title={availableFiles.length > 0 ? `Download all ${availableFiles.length} document attachment(s) from this page as a single ZIP file` : 'No document attachments found in current records'}
        >
          <Archive size={16} />
          {zipping ? 'Zipping Files...' : 'Download ZIP'}
          {availableFiles.length > 0 && (
            <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
              {availableFiles.length}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Date Range Control Bar */}
      {showDateFilter && (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>From:</span>
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>To:</span>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}
            />
          </div>

          {hasActiveDateFilter && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={13} /> Reset Filter
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDateFilter(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Modal Field Selector Dialog */}
      {showFieldSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Select Fields for Report ({pageTitle})
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Choose which specific fields/columns will be included in PDF and Excel reports.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFieldSelector(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Select All / Deselect All Action Bar */}
            <div style={{
              padding: '10px 24px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                {selectedIndices.length} of {headers?.length || 0} fields selected
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#fff', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0284c7' }}
                  onClick={() => setSelectedIndices((headers || []).map((_, i) => i))}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#fff', border: '1px solid #cbd5e1', fontWeight: 600, color: '#dc2626' }}
                  onClick={() => setSelectedIndices([])}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Checkbox Items Grid */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px'
            }}>
              {(headers || []).map((header, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid hsl(var(--primary))' : '1.5px solid #e2e8f0',
                      background: isSelected ? 'hsla(var(--primary), 0.05)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: '#0f172a',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIndices(prev => [...prev, idx].sort((a, b) => a - b));
                        } else {
                          setSelectedIndices(prev => prev.filter(i => i !== idx));
                        }
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--primary))' }}
                    />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{header}</span>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {selectedIndices.length === 0 ? '⚠️ Please select at least one field.' : ''}
              </span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedIndices.length === 0}
                style={{ fontWeight: 700, padding: '8px 22px' }}
                onClick={() => setShowFieldSelector(false)}
              >
                Apply ({selectedIndices.length} Fields)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
