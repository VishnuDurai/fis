import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X, FileText, ExternalLink, CheckCircle } from 'lucide-react';

export default function PdfPreviewModal({ 
  isOpen, 
  onClose, 
  pdfBlobUrl, 
  filename, 
  title, 
  onDownload, 
  onPrint 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pdfBlobUrl) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      const iframe = document.getElementById('pdf-preview-iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          return;
        } catch (e) {
          console.log('Iframe print error, opening new window', e);
        }
      }
      window.open(pdfBlobUrl, '_blank')?.print();
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: 'min(94vw, 1200px)',
        height: 'min(92vh, 950px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #0f331f 0%, #15583b 100%)',
          color: '#ffffff',
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={22} color="#86efac" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {title || 'PDF Document Preview'}
                </h3>
                <span style={{
                  background: 'rgba(134, 239, 172, 0.2)',
                  color: '#86efac',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(134, 239, 172, 0.3)'
                }}>
                  Live Preview
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', opacity: 0.85, color: '#cbd5e1' }}>
                {filename || 'document.pdf'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Print Document"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#0f331f',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease'
              }}
              title="Save / Download PDF"
            >
              <Download size={16} color="#15583b" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '4px',
                transition: 'background 0.15s ease'
              }}
              title="Close Preview (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL PDF VIEWER BODY */}
        <div style={{ flex: 1, position: 'relative', background: '#525659' }}>
          <iframe
            id="pdf-preview-iframe"
            src={`${pdfBlobUrl}#toolbar=1&view=FitH`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={title || 'PDF Preview'}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
