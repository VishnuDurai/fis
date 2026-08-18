import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, X, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { showError, showSuccess } from '../context/AlertContext';

const categoryOptions = [
  { value: 'interactions', label: 'FDP / Workshop / Seminar (Attended)' },
  { value: 'certifications', label: 'Online Certification (NPTEL / Coursera / edX)' },
  { value: 'awards', label: 'Award / Honor / Fellowship' },
  { value: 'events', label: 'Event Organized (Conference / Workshop / Symposium)' },
  { value: 'funding', label: 'Sponsored Research Grant / Project' },
  { value: 'seed_money', label: 'Seed Money / Consultancy Project' },
  { value: 'ipr', label: 'Patent / IPR / Copyright' },
  { value: 'resource', label: 'Resource Person / Guest Lecture' },
  { value: 'memberships', label: 'Professional Society Membership' },
  { value: 'publications', label: 'Journal / Conference Publication' },
  { value: 'books', label: 'Book / Book Chapter Published' },
  { value: 'scholars', label: 'Research Scholar (Ph.D. Details)' }
];

export default function AiDocumentModal({ isOpen, onClose, onApply, currentCategory = 'interactions', auth }) {
  const [file, setFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState('idle'); // 'idle' | 'uploading' | 'ocr' | 'extracting' | 'done' | 'error'
  const [extractResult, setExtractResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setLoadingStep('uploading');

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      setLoadingStep('ocr');

      const res = await fetch(`${API_BASE_URL}/api/activities/ai-extract-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData
      });

      setLoadingStep('extracting');

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract information from document.');
      }

      setExtractResult(data);
      setSelectedCategory(data.classification?.category || currentCategory);
      setLoadingStep('done');
      showSuccess(`Document scanned! Detected as: ${data.classification?.categoryLabel || 'Activity'}`);
    } catch (err) {
      console.error(err);
      setLoadingStep('error');
      showError(err.message || 'Could not automatically process document. Please enter details manually.');
    }
  };

  const handleConfirmAndPreFill = () => {
    if (!extractResult) return;
    onApply({
      ...extractResult,
      targetCategory: selectedCategory,
      uploadedFileObj: file
    });
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setLoadingStep('idle');
    setExtractResult(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                AI Document Auto-Fill & Classification
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Upload certificate or proof to automatically pre-fill your activity form.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px' }}>
          {loadingStep === 'idle' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? '#16a34a' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: dragActive ? '#f0fdf4' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => document.getElementById('ai-file-input').click()}
              >
                <input
                  id="ai-file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Upload size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                  Click to upload or drag & drop certificate
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                  Supports FDPs, Workshops, Certifications, Awards, Patents, Grants, and Publications (PDF, PNG, JPG)
                </p>
                <div style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  <span>✓ 100% Secure</span>
                  <span>•</span>
                  <span>Direct Pre-fill</span>
                  <span>•</span>
                  <span>Verify Before Saving</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', background: '#eff6ff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.5' }}>
                  💡 <strong>How it works:</strong> The system extracts relevant dates, titles, certificate numbers, and organizations to pre-fill the existing form. You will be able to review, edit, and confirm all fields before saving.
                </p>
              </div>
            </div>
          )}

          {['uploading', 'ocr', 'extracting'].includes(loadingStep) && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '4px solid #dcfce7',
                borderTopColor: '#16a34a',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px auto'
              }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>
                {loadingStep === 'uploading' && '1. Uploading Document to Faculty Vault...'}
                {loadingStep === 'ocr' && '2. Scanning Document & Extracting Text (OCR)...'}
                {loadingStep === 'extracting' && '3. Smart Classification & Extracting Metadata...'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                Analyzing document headers, dates, organizations, and verifying duplicate records...
              </p>
            </div>
          )}

          {loadingStep === 'error' && (
            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <AlertTriangle size={28} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                Could Not Automatically Extract Information
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.86rem', color: '#64748b', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                The document text could not be clearly resolved. You can still enter the details manually using the regular form.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={16} /> Try Another File
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  Enter Manually
                </button>
              </div>
            </div>
          )}

          {loadingStep === 'done' && extractResult && (
            <div>
              {/* Document Duplicate Alert (if detected) */}
              {extractResult.documentDuplicate?.isDuplicate && (
                <div style={{
                  background: '#fef3c7',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', color: '#92400e', fontWeight: 800, fontSize: '0.92rem' }}>
                      ⚠️ Possible Duplicate Document Detected
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f', lineHeight: '1.4' }}>
                      {extractResult.documentDuplicate.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Classification Banner */}
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Smart Classification Result
                    </span>
                    <span style={{
                      background: '#bbf7d0',
                      color: '#14532d',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {extractResult.classification?.confidence || 90}% Confidence
                    </span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {extractResult.classification?.categoryLabel || selectedCategory}
                  </div>
                </div>

                <div style={{ minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Confirm or Switch Activity Category:
                  </label>
                  <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ fontSize: '0.85rem', fontWeight: 600, padding: '6px 10px', background: '#ffffff' }}
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extracted Fields Table Preview */}
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>
                  Extracted Metadata & Confidence:
                </h5>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Field Name</th>
                        <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Extracted Value</th>
                        <th style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 700, color: '#475569', width: '120px' }}>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(extractResult.fields || {}).map(([key, val]) => {
                        if (!val) return null;
                        const conf = extractResult.confidences?.[key] || 80;
                        const isHigh = conf >= 75;
                        return (
                          <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 14px', fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td style={{ padding: '8px 14px', color: '#0f172a' }}>
                              {String(val)}
                            </td>
                            <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isHigh ? '#dcfce7' : '#fef3c7',
                                color: isHigh ? '#15803d' : '#b45309'
                              }}>
                                {conf}% {isHigh ? '✓' : '⚠ Verify'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={15} /> Upload Different File
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmAndPreFill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#16a34a',
                      borderColor: '#16a34a',
                      fontWeight: 800
                    }}
                  >
                    <span>⚡ Populate Form & Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
