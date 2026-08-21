import base64

with open('client/public/assets/srec_full_trans.png', 'rb') as f:
    srec_full_b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

with open('client/public/assets/snr_trust_clean.png', 'rb') as f:
    snr_b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

code = f'''/**
 * SREC FIS V3.2 — Institutional Header Component & Brand Standards
 * Clean Dual-Logo Header:
 * - Left: Full College Logo (Shield Emblem + "SRI RAMAKRISHNA ENGINEERING COLLEGE")
 * - Right: SNR Sons Trust Logo
 * - Textual content in header removed per institutional design request.
 */

export const INSTITUTIONAL_INFO = {{
  collegeName: 'SRI RAMAKRISHNA ENGINEERING COLLEGE',
  collegeNameShort: 'SREC',
  collegeType: "[An Autonomous Institution | Reaccredited by NAAC with 'A+' Grade]",
  affiliations: 'Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai',
  address: 'Vattamalaipalayam, N.G.G.O Colony Post, Coimbatore - 641 022, Tamil Nadu, India',
  website: 'www.srec.ac.in',
  phone: '+91 422 2460088 / 2461588',
  trust: 'Managed by SNR Sons Charitable Trust'
}};

export const SREC_LOGO_DATA_URL = "{srec_full_b64}";
export const SNR_TRUST_LOGO_DATA_URL = "{snr_b64}";

export const SREC_CREST_SVG = `<img src="${{SREC_LOGO_DATA_URL}}" alt="Sri Ramakrishna Engineering College" style="height: 58px; width: auto; object-fit: contain;" />`;
export const SNR_TRUST_SVG = `<img src="${{SNR_TRUST_LOGO_DATA_URL}}" alt="SNR Sons Trust" style="height: 58px; width: auto; object-fit: contain;" />`;

/**
 * Returns clean formatted HTML Institutional Header for live preview:
 * - Full College Logo on Left
 * - SNR Sons Trust Logo on Right
 * - No redundant text in between
 */
export const renderInstitutionalHeaderHtml = (options = {{}}) => {{
  const {{ isDark = false, compact = false }} = options;
  const logoHeight = compact ? '50px' : '62px';

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; width: 100%; border-bottom: ${{compact ? '1px' : '2px'}} solid ${{isDark ? '#334155' : '#cbd5e1'}}; padding-bottom: ${{compact ? '8px' : '14px'}}; margin-bottom: ${{compact ? '12px' : '18px'}}; box-sizing: border-box;">
      <!-- Left: Full College Logo with Name -->
      <div style="flex-shrink: 0; display: flex; align-items: center;">
        <img src="${{SREC_LOGO_DATA_URL}}" alt="Sri Ramakrishna Engineering College" style="height: ${{logoHeight}}; max-width: 320px; object-fit: contain; filter: ${{isDark ? 'drop-shadow(0 2px 8px rgba(255,255,255,0.18))' : 'none'}};" />
      </div>

      <!-- Right: SNR Sons Trust Logo -->
      <div style="flex-shrink: 0; display: flex; align-items: center;">
        <img src="${{SNR_TRUST_LOGO_DATA_URL}}" alt="SNR Sons Trust" style="height: ${{logoHeight}}; max-width: 80px; object-fit: contain; filter: ${{isDark ? 'drop-shadow(0 2px 8px rgba(255,255,255,0.18))' : 'none'}};" />
      </div>
    </div>
  `;
}};
'''

with open('client/src/utils/eventDesign/institutionalHeader.js', 'w') as f:
    f.write(code)

print('Updated institutionalHeader.js with clean dual logos (full college logo left, trust logo right)')
