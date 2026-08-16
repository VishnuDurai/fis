import React, { useState } from 'react';
import { Award, GraduationCap, Calendar, Building, BookOpen, Check, X } from 'lucide-react';

export default function PhdCompletionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  facultyName, 
  defaultMonthYear = '', 
  defaultUniversity = 'Anna University',
  defaultSpecialization = '' 
}) {
  const [monthYear, setMonthYear] = useState(defaultMonthYear || new Date().toISOString().slice(0, 7));
  const [university, setUniversity] = useState(defaultUniversity || 'Anna University');
  const [specialization, setSpecialization] = useState(defaultSpecialization || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!monthYear) {
      setError('Please select the Ph.D completion month and year.');
      return;
    }
    setError('');
    onConfirm({
      phd_completion_month_year: monthYear,
      phd_university: university || 'Anna University',
      phd_specialization: specialization || ''
    });
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
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '2px solid #86efac',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={28} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Doctorate / Ph.D Degree Details
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#bbf7d0' }}>
                Salutation changed to <strong style={{ color: '#ffffff' }}>Dr.</strong> for {facultyName || 'Faculty Member'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '0.84rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Award size={20} style={{ minWidth: '20px' }} />
            <span>
              Updating salutation to <strong>Dr.</strong> marks research status as <strong>Completed / Degree Awarded</strong> and automatically qualifies the faculty for <strong>Research Supervisorship</strong>.
            </span>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#16a34a" /> Ph.D Completion Month & Year <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="month" 
                className="form-control" 
                value={monthYear} 
                onChange={(e) => setMonthYear(e.target.value)} 
                required 
                style={{ fontWeight: 600, fontSize: '0.92rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                Select the Month & Year when the Ph.D degree viva-voce was completed / degree awarded.
              </span>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={15} color="#16a34a" /> Awarding University / Institution <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Anna University / Bharathiar University / NIT / IIT" 
                value={university} 
                onChange={(e) => setUniversity(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} color="#16a34a" /> Area of Specialization / Thesis Domain
              </label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Information and Communication Engineering / Deep Learning" 
                value={specialization} 
                onChange={(e) => setSpecialization(e.target.value)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose} 
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{
                background: '#15803d',
                borderColor: '#15803d',
                color: '#ffffff',
                fontWeight: 700,
                padding: '8px 22px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} /> Save Ph.D & Update Salutation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
