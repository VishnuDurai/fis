import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '16px 20px' }}>
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>Developed and Maintained by Team FIS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
        <span>© 2026 FIS Team - Sri Ramakrishna Engineering College, Coimbatore</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>SREC FIS</span>
        <span className="version-badge-anim" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>V3.0</span>
      </div>
    </footer>
  );
}
