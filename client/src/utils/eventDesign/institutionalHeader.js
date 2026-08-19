/**
 * SREC FIS V3.2 — Institutional Header Component & Brand Standards
 * Reusable, immutable institutional branding header across Posters, Invitations, and Certificates.
 */

export const INSTITUTIONAL_INFO = {
  collegeName: 'SRI RAMAKRISHNA ENGINEERING COLLEGE',
  collegeNameShort: 'SREC',
  collegeType: '[An Autonomous Institution | Reaccredited by NAAC with \'A+\' Grade]',
  affiliations: 'Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai',
  address: 'Vattamalaipalayam, N.G.G.O Colony Post, Coimbatore - 641 022, Tamil Nadu, India',
  website: 'www.srec.ac.in',
  phone: '+91 422 2460088 / 2461588',
  trust: 'Managed by SNR Sons Charitable Trust'
};

export const SREC_CREST_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="70" height="84">
  <defs>
    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="crestNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="crestGreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
  </defs>
  <!-- Shield Outer -->
  <path d="M 10,15 L 90,15 C 90,65 75,95 50,115 C 25,95 10,65 10,15 Z" fill="url(#crestNavy)" stroke="url(#crestGold)" stroke-width="4"/>
  <!-- Inner Shield -->
  <path d="M 18,22 L 82,22 C 82,60 70,88 50,105 C 30,88 18,60 18,22 Z" fill="#ffffff" stroke="url(#crestGold)" stroke-width="1.5"/>
  <!-- Sun / Ray Emblem -->
  <circle cx="50" cy="42" r="14" fill="url(#crestGold)"/>
  <path d="M 50,25 L 50,30 M 50,54 L 50,59 M 33,42 L 38,42 M 62,42 L 67,42 M 38,30 L 42,34 M 58,50 L 62,54 M 38,54 L 42,50 M 58,34 L 62,30" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
  <!-- Book / Lamp Base -->
  <path d="M 32,70 Q 50,65 68,70 L 68,82 Q 50,77 32,82 Z" fill="url(#crestGreen)" stroke="url(#crestGold)" stroke-width="1.5"/>
  <path d="M 50,66 L 50,80" stroke="#fbbf24" stroke-width="1.5"/>
  <!-- SREC Ribbon -->
  <rect x="22" y="88" width="56" height="14" rx="3" fill="url(#crestGold)" stroke="#78350f" stroke-width="1"/>
  <text x="50" y="99" font-family="'Inter', 'Arial', sans-serif" font-weight="900" font-size="9" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">SREC</text>
</svg>
`;

/**
 * Returns formatted HTML Institutional Header for live preview
 */
export const renderInstitutionalHeaderHtml = (options = {}) => {
  const { isDark = false, compact = false, showAddress = true } = options;
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#cbd5e1' : '#475569';
  const goldColor = '#b45309';

  return `
    <div style="display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%; border-bottom: ${compact ? '1px' : '2px'} solid ${isDark ? '#334155' : '#cbd5e1'}; padding-bottom: ${compact ? '10px' : '16px'}; margin-bottom: ${compact ? '12px' : '20px'}; font-family: 'Inter', -apple-system, sans-serif;">
      <div style="flex-shrink: 0;">
        ${SREC_CREST_SVG}
      </div>
      <div style="text-align: center; flex: 1;">
        <div style="color: ${textColor}; font-weight: 900; font-size: ${compact ? '1.15rem' : '1.35rem'}; letter-spacing: 0.5px; line-height: 1.25; margin-bottom: 3px;">
          ${INSTITUTIONAL_INFO.collegeName}
        </div>
        <div style="color: ${goldColor}; font-weight: 700; font-size: ${compact ? '0.72rem' : '0.8rem'}; line-height: 1.3; margin-bottom: 2px;">
          ${INSTITUTIONAL_INFO.collegeType}
        </div>
        <div style="color: ${subTextColor}; font-size: ${compact ? '0.68rem' : '0.74rem'}; font-weight: 500; line-height: 1.3;">
          ${INSTITUTIONAL_INFO.affiliations}
        </div>
        ${showAddress ? `
        <div style="color: ${subTextColor}; font-size: 0.68rem; font-weight: 400; margin-top: 2px; opacity: 0.9;">
          ${INSTITUTIONAL_INFO.address}
        </div>
        ` : ''}
      </div>
    </div>
  `;
};
