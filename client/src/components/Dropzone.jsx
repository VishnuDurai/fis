import React, { useState } from 'react';
import { Upload, File, CheckCircle2, AlertTriangle } from 'lucide-react';
import { showError } from '../context/AlertContext.jsx';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE_MB = 5;

export default function Dropzone({ 
  onFileSelect, 
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx', 
  label = 'Drag and drop file here, or click to browse',
  maxSizeMB = MAX_FILE_SIZE_MB
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validateAndProcessFile = (file) => {
    setFileError(null);
    if (!file) return;

    if (file.size > maxBytes) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errMsg = `File exceeds maximum allowed size of ${maxSizeMB}MB (Selected file is ${actualSizeMB} MB). Please choose a smaller file.`;
      setFileError(errMsg);
      setSelectedFile(null);
      showError(errMsg);
      return false;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="form-group"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      style={{
        border: fileError 
          ? '2px dashed hsl(var(--danger))' 
          : (dragActive ? '2px dashed hsl(var(--primary))' : '2px dashed hsl(var(--border))'),
        borderRadius: 'var(--radius)',
        padding: '22px 20px',
        textAlign: 'center',
        background: fileError 
          ? 'hsla(var(--danger), 0.05)' 
          : (dragActive ? 'hsla(var(--primary), 0.05)' : 'hsla(var(--bg-popover), 0.2)'),
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        position: 'relative'
      }}
    >
      <input 
        type="file" 
        accept={accept} 
        onChange={handleChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer'
        }}
      />

      {fileError ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={36} style={{ color: 'hsl(var(--danger))' }} />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(var(--danger))' }}>File Too Large</span>
          <span style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', maxWidth: '380px' }}>
            {fileError}
          </span>
          <span style={{ display: 'inline-block', background: 'hsla(var(--danger), 0.12)', color: 'hsl(var(--danger))', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800 }}>
            Maximum allowed limit: {maxSizeMB}MB
          </span>
        </div>
      ) : selectedFile ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={36} style={{ color: 'hsl(var(--success))' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'hsl(var(--text-main))' }}>{selectedFile.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB / {maxSizeMB}MB
            </span>
            <span style={{ fontSize: '0.74rem', background: 'hsla(var(--success), 0.12)', color: 'hsl(var(--success))', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
              ✓ Valid Size
            </span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Upload size={32} style={{ color: 'hsl(var(--primary))', marginBottom: '2px' }} />
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(var(--text-main))' }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))' }}>
              Accepted: PDF, Images, Word
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'hsla(var(--primary), 0.12)', 
              color: 'hsl(var(--primary))', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: '6px',
              border: '1px solid hsla(var(--primary), 0.2)'
            }}>
              Max size: {maxSizeMB}MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
