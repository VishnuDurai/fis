import React, { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

export default function EditableField({ label, value, onSave, type = 'text', options = [] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState(value || '');

  useEffect(() => {
    setCurrentVal(value || '');
  }, [value]);

  const handleSave = () => {
    onSave(currentVal);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentVal(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
        {type === 'select' ? (
          <select
            className="form-control"
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          >
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            className="form-control"
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            style={{ flex: 1, minHeight: '80px', padding: '8px' }}
          />
        ) : (
          <input
            type={type}
            className="form-control"
            value={currentVal}
            onChange={(e) => setCurrentVal(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
        )}
        <button type="button" className="btn btn-primary" onClick={handleSave} style={{ padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
          <Check size={16} /> Save
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{ padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
          <X size={16} /> Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'hsla(var(--bg-popover), 0.3)', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}>
      <div>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block' }}>{label}</span>
        <span style={{ fontWeight: '500' }}>{value || <em style={{ color: 'hsl(var(--text-muted))' }}>Not set</em>}</span>
      </div>
      <button 
        type="button"
        className="btn btn-secondary" 
        onClick={() => setIsEditing(true)}
        style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: 'transparent' }}
      >
        <Pencil size={14} className="text-muted" />
      </button>
    </div>
  );
}
