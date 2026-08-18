import React, { useState } from 'react';
import { Users, Check, X, Plus, AlertCircle, Link2, ShieldCheck } from 'lucide-react';

export default function InternalCoAuthorsCard({
  coAuthors = [],
  onToggleConfirm,
  onAddFaculty,
  onRemoveFaculty,
  allFaculty = [],
  auth,
  duplicatePub = null,
  onLinkExisting = null
}) {
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const handleAddSelected = () => {
    if (!selectedStaffId) return;
    const fac = allFaculty.find(f => (f.staff_id || '').toLowerCase() === selectedStaffId.toLowerCase());
    if (fac) {
      onAddFaculty({
        originalAuthor: fac.staff_name || fac.name,
        isSrecFaculty: true,
        staffId: fac.staff_id,
        staffName: fac.staff_name || fac.name,
        department: fac.Department || fac.department || 'Engineering',
        designation: fac.Designation || fac.designation || 'Faculty',
        matchConfidence: 100,
        matchType: 'manual_selection',
        isCurrentUser: (fac.staff_id || '').toLowerCase() === (auth?.staffId || '').toLowerCase(),
        isConfirmed: true,
        needsConfirmation: false
      });
      setSelectedStaffId('');
    }
  };

  return (
    <div style={{
      gridColumn: 'span 2',
      background: '#f8fafc',
      border: '1.5px solid #cbd5e1',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '10px'
    }}>
      {/* Duplicate Publication DOI Detection Banner */}
      {duplicatePub && duplicatePub.isDuplicate && duplicatePub.existingRecord && (
        <div style={{
          background: '#fef3c7',
          border: '1.5px solid #f59e0b',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={22} color="#b45309" />
            <div>
              <h5 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', color: '#92400e', fontWeight: 800 }}>
                Existing Publication Found in SREC FIS
              </h5>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#78350f' }}>
                {duplicatePub.message || 'This publication was previously registered by an internal SREC co-author.'}
              </p>
            </div>
          </div>
          {onLinkExisting && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onLinkExisting(duplicatePub.existingRecord.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                borderColor: '#0284c7',
                fontWeight: 700,
                fontSize: '0.84rem'
              }}
            >
              <Link2 size={16} />
              <span>Link to My Profile</span>
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#0284c7" />
          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a', fontWeight: 800 }}>
            Internal SREC Co-Authors Mapping
          </h4>
          <span style={{
            background: '#e0f2fe',
            color: '#0369a1',
            fontSize: '0.74rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Multi-Signal Matcher
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
          Link co-authors so this publication appears in their profiles and CVs automatically.
        </p>
      </div>

      {/* Co-Authors List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {coAuthors && coAuthors.length > 0 ? (
          coAuthors.map((author, idx) => {
            const isSrec = author.isSrecFaculty;
            const isConfirmed = author.isConfirmed;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: `1px solid ${isSrec ? (isConfirmed ? '#86efac' : '#fde047') : '#e2e8f0'}`,
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isSrec ? (isConfirmed ? '#dcfce7' : '#fef9c3') : '#f1f5f9',
                    color: isSrec ? (isConfirmed ? '#16a34a' : '#ca8a04') : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      {author.staffName || author.originalAuthor}
                      {author.staffId && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>
                          [{author.staffId}]
                        </span>
                      )}
                      {author.isCurrentUser && (
                        <span style={{
                          marginLeft: '6px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '8px'
                        }}>
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {isSrec ? (
                        <span>
                          {author.department || 'Engineering'} • {author.designation || 'Faculty'}
                          {author.matchConfidence > 0 && ` (${author.matchConfidence}% Match)`}
                        </span>
                      ) : (
                        <span>External Author / Co-Author</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSrec && author.needsConfirmation && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onToggleConfirm && onToggleConfirm(author.staffId, true)}
                        style={{
                          background: isConfirmed ? '#16a34a' : '#f0fdf4',
                          color: isConfirmed ? '#ffffff' : '#16a34a',
                          border: '1px solid #16a34a',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={12} /> Confirm SREC Faculty
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleConfirm && onToggleConfirm(author.staffId, false)}
                        style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Not SREC
                      </button>
                    </div>
                  )}

                  {isSrec && !author.needsConfirmation && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '10px'
                    }}>
                      <ShieldCheck size={13} /> SREC Faculty Linked
                    </span>
                  )}

                  {onRemoveFaculty && (
                    <button
                      type="button"
                      onClick={() => onRemoveFaculty(author.staffId || author.originalAuthor)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove author from mapping"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.82rem', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            No internal co-authors detected yet. Enter author names or search below.
          </div>
        )}
      </div>

      {/* Search and Add another SREC Faculty */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          className="form-control"
          value={selectedStaffId}
          onChange={(e) => setSelectedStaffId(e.target.value)}
          style={{ flex: 1, fontSize: '0.84rem', background: '#ffffff' }}
        >
          <option value="">-- Add another SREC Faculty as Co-Author --</option>
          {allFaculty
            .filter(f => !coAuthors.some(ca => (ca.staffId || '').toLowerCase() === (f.staff_id || '').toLowerCase()))
            .map(fac => (
              <option key={fac.staff_id} value={fac.staff_id}>
                {fac.staff_name || fac.name} [{fac.staff_id}] - {fac.Department || 'Dept'}
              </option>
            ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAddSelected}
          disabled={!selectedStaffId}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          <Plus size={14} /> Add Co-Author
        </button>
      </div>
    </div>
  );
}
