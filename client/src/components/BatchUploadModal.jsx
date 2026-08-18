import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, X, Sparkles, RefreshCw, Layers, Check, Edit2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { showError, showSuccess } from '../context/AlertContext';

export default function BatchUploadModal({ isOpen, onClose, onApplyItem, currentCategory = 'interactions', auth }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [batchStep, setBatchStep] = useState('select'); // 'select' | 'uploading' | 'review'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchResults, setBatchResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState(null);

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
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const valid = [];
    let sizeError = false;
    let mimeError = false;

    newFiles.forEach(f => {
      if (!validMimes.includes(f.type)) {
        mimeError = true;
      } else if (f.size > 5 * 1024 * 1024) {
        sizeError = true;
      } else {
        valid.push(f);
      }
    });

    if (mimeError) showError('Some files were ignored: Only PDF, JPG, PNG, WEBP are supported.');
    if (sizeError) showError('Some files exceeded the 5 MB per-file limit.');

    const combined = [...selectedFiles, ...valid].slice(0, 10);
    if (selectedFiles.length + valid.length > 10) {
      showError('Maximum 10 files allowed per batch.');
    }
    setSelectedFiles(combined);
  };

  const removeFile = (idx) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
  };

  const handleProcessBatch = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select at least 1 file to upload.');
      return;
    }

    setBatchStep('uploading');
    setUploadProgress(10);

    try {
      const formData = new FormData();
      selectedFiles.forEach(f => {
        formData.append('files', f);
      });

      const timer = setInterval(() => {
        setUploadProgress(p => (p < 90 ? p + 15 : p));
      }, 400);

      const res = await fetch(`${API_BASE_URL}/api/activities/documents/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: formData
      });

      clearInterval(timer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch extraction failed.');
      }

      setBatchResults(data.items || []);
      setBatchStep('review');
      showSuccess(`Batch processed: ${data.processed} succeeded, ${data.failed} failed.`);
    } catch (err) {
      console.error('Batch Upload error:', err);
      setBatchStep('select');
      showError(err.message || 'Batch upload failed.');
    }
  };

  const handleReviewAndApply = (item) => {
    onApplyItem(item);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#e0f2fe',
              color: '#0284c7',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                AI Batch Document Upload
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Upload up to 10 certificates at once with concurrent OCR & smart field pre-fill
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

        {/* Modal Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {batchStep === 'select' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '2px dashed #0284c7' : '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: dragActive ? '#f0f9ff' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
                onClick={() => document.getElementById('batch-file-input').click()}
              >
                <input
                  id="batch-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
                <Upload size={40} style={{ color: '#0284c7', marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#1e293b' }}>
                  Drag & Drop up to 10 academic documents here
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Supported formats: PDF, JPEG, PNG, WEBP (Max 5 MB per file, Max 20 MB total)
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ background: '#ffffff', borderColor: '#cbd5e1', color: '#334155' }}
                >
                  Browse Files
                </button>
              </div>

              {/* Selected Files Queue */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                      Selected Files ({selectedFiles.length} / 10)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <FileText size={18} color="#0284c7" />
                          <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {batchStep === 'uploading' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Sparkles size={48} style={{ color: '#0284c7', animation: 'spin 2s linear infinite', marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a' }}>
                Extracting & Pre-filling Documents...
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                Running OCR, duplicate detection, and smart classification with 2 concurrent workers
              </p>
              <div style={{ width: '100%', maxWidth: '400px', height: '10px', background: '#e2e8f0', borderRadius: '5px', margin: '0 auto', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0284c7', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {batchStep === 'review' && (
            <div>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <span style={{ fontSize: '0.88rem', color: '#166534', fontWeight: 600 }}>
                  Batch extraction complete! Please review and confirm each document individually before saving.
                </span>
              </div>

              {/* Batch Review Matrix Table */}
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Document</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Detected Category</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Confidence</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Duplicate Status</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map((item, idx) => {
                      const isSuccess = item.success;
                      const isDup = item.documentDuplicate?.isDuplicate || item.recordDuplicate?.isDuplicate;
                      const conf = item.classification?.confidence || 0;

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={16} color={isSuccess ? '#0284c7' : '#ef4444'} />
                              <span style={{ maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {item.originalFilename}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}>
                              {item.classification?.categoryLabel || item.classification?.category || 'Unknown'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isSuccess ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 700, color: conf >= 70 ? '#16a34a' : '#d97706' }}>
                                  {conf}%
                                </span>
                              </div>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isDup ? (
                              <span style={{ color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={14} /> Duplicate Found
                              </span>
                            ) : (
                              <span style={{ color: '#16a34a', fontWeight: 600 }}>Unique</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              background: isSuccess ? (isDup ? '#fee2e2' : '#dcfce7') : '#fee2e2',
                              color: isSuccess ? (isDup ? '#991b1b' : '#166534') : '#991b1b',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              {item.status || (isSuccess ? 'Ready for Review' : 'Failed')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            {isSuccess ? (
                              <button
                                type="button"
                                onClick={() => handleReviewAndApply(item)}
                                className="btn btn-primary"
                                style={{
                                  padding: '4px 12px',
                                  fontSize: '0.8rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Edit2 size={14} /> Review & Pre-fill
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setBatchStep('select'); }}
                                className="btn btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              >
                                <RefreshCw size={14} /> Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            🔒 SREC FIS V3.1: Zero records are auto-saved without explicit review.
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
            >
              Close
            </button>
            {batchStep === 'select' && (
              <button
                type="button"
                onClick={handleProcessBatch}
                disabled={selectedFiles.length === 0}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: selectedFiles.length === 0 ? 0.5 : 1
                }}
              >
                <Sparkles size={16} /> Process Batch ({selectedFiles.length} files)
              </button>
            )}
            {batchStep === 'review' && (
              <button
                type="button"
                onClick={() => { setBatchStep('select'); setSelectedFiles([]); }}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={16} /> Upload Another Batch
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
