import React, { useState } from 'react';
import { Upload, File, CheckCircle2 } from 'lucide-react';

export default function Dropzone({ onFileSelect, accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx', label = 'Drag and drop file here, or click to browse' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
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
        border: dragActive ? '2px dashed hsl(var(--primary))' : '2px dashed hsl(var(--border))',
        borderRadius: 'var(--radius)',
        padding: '24px',
        textAlign: 'center',
        background: dragActive ? 'hsla(var(--primary), 0.05)' : 'hsla(var(--bg-popover), 0.2)',
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
      {selectedFile ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={36} style={{ color: 'hsl(var(--success))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedFile.name}</span>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Upload size={36} style={{ color: 'hsl(var(--text-muted))', marginBottom: '4px' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
            Accepted files: PDF, Word, Images up to 10MB
          </span>
        </div>
      )}
    </div>
  );
}
