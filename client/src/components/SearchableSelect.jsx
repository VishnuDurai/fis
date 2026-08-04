import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export default function SearchableSelect({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Select option...', 
  searchPlaceholder = 'Search...',
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Normalize options to [{ value, label, raw }]
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      const val = opt.value !== undefined 
        ? opt.value 
        : (opt.acronym !== undefined 
          ? opt.acronym 
          : (opt.name !== undefined 
            ? opt.name 
            : (opt.title !== undefined 
              ? opt.title 
              : (opt.staff_id !== undefined ? opt.staff_id : opt.id))));

      let lbl = opt.label;
      if (!lbl) {
        if (opt.name) {
          lbl = `${opt.name}${opt.acronym && opt.acronym.trim().toLowerCase() !== opt.name.trim().toLowerCase() ? ` (${opt.acronym})` : ''}`;
        } else if (opt.title) {
          lbl = opt.title;
        } else {
          lbl = (val || '').toString();
        }
      }
      return { value: val, label: lbl, raw: opt };
    }
    return { value: opt, label: (opt || '').toString(), raw: opt };
  });

  const selectedOption = normalizedOptions.find(opt => {
    if (opt.value === value) return true;
    if (value !== null && value !== undefined && opt.value !== null && opt.value !== undefined) {
      if (opt.value.toString().trim().toLowerCase() === value.toString().trim().toLowerCase()) return true;
    }
    if (opt.raw && typeof opt.raw === 'object') {
      const r = opt.raw;
      const v = (value || '').toString().trim().toLowerCase();
      if (r.name && r.name.trim().toLowerCase() === v) return true;
      if (r.acronym && r.acronym.trim().toLowerCase() === v) return true;
      if (r.title && r.title.trim().toLowerCase() === v) return true;
      if (r.id !== undefined && r.id.toString().trim().toLowerCase() === v) return true;
    }
    return false;
  });

  const filteredOptions = normalizedOptions.filter(opt =>
    (opt.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.value || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayLabel = selectedOption 
    ? selectedOption.label 
    : (value !== null && value !== undefined && value.toString().trim() !== '' ? value.toString() : placeholder);

  const hasValue = Boolean(selectedOption || (value !== null && value !== undefined && value.toString().trim() !== ''));

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Hidden native input for HTML5 form validation */}
      {required && (
        <input 
          type="text" 
          value={value || ''} 
          onChange={() => {}} 
          required 
          style={{ opacity: 0, position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        />
      )}

      {/* Main trigger box */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="form-control"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: 'pointer', 
          background: '#ffffff',
          color: hasValue ? '#0f172a' : '#94a3b8',
          fontWeight: hasValue ? 600 : 400,
          userSelect: 'none',
          borderColor: isOpen ? 'hsl(var(--primary))' : undefined,
          boxShadow: isOpen ? '0 0 0 3px hsla(var(--primary), 0.15)' : undefined
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </span>
        <ChevronDown size={18} style={{ color: '#64748b', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          overflow: 'hidden'
        }}>
          {/* Search Bar */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.88rem',
                color: '#0f172a',
                fontWeight: 500
              }}
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                No matching options found.
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '0.88rem',
                      color: isSelected ? 'hsl(var(--primary))' : '#1e293b',
                      fontWeight: isSelected ? 700 : 500,
                      background: isSelected ? 'hsla(var(--primary), 0.08)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={16} style={{ color: 'hsl(var(--primary))' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
