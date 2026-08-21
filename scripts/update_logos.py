import base64

with open('client/public/assets/srec_shield_trans.png', 'rb') as f:
    srec_b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

with open('client/public/assets/snr_trust_trans.png', 'rb') as f:
    snr_b64 = 'data:image/png;base64,' + base64.b64encode(f.read()).decode('utf-8')

code = f'''/**
 * SREC FIS V3.2 — Institutional Header Component & Brand Standards
 * Reusable, immutable institutional branding header across Posters, Invitations, and Certificates.
 * Dual Header: College Shield Logo on the Left, SNR Sons Trust Logo on the Right.
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

export const SREC_LOGO_DATA_URL = "{srec_b64}";
export const SNR_TRUST_LOGO_DATA_URL = "{snr_b64}";

export const SREC_CREST_SVG = `<img src="${{SREC_LOGO_DATA_URL}}" alt="SREC College Logo" style="height: 56px; width: auto; object-fit: contain;" />`;
export const SNR_TRUST_SVG = `<img src="${{SNR_TRUST_LOGO_DATA_URL}}" alt="SNR Sons Trust Logo" style="height: 56px; width: auto; object-fit: contain;" />`;

/**
 * Returns formatted HTML Institutional Header for live preview
 * Features SREC College Logo on Left and SNR Sons Trust Logo on Right
 */
export const renderInstitutionalHeaderHtml = (options = {{}}) => {{
  const {{ isDark = false, compact = false, showAddress = true }} = options;
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subTextColor = isDark ? '#cbd5e1' : '#475569';
  const goldColor = '#b45309';
  const logoHeight = compact ? '48px' : '58px';

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; border-bottom: ${{compact ? '1px' : '2px'}} solid ${{isDark ? '#334155' : '#cbd5e1'}}; padding-bottom: ${{compact ? '10px' : '14px'}}; margin-bottom: ${{compact ? '12px' : '18px'}}; font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box;">
      <!-- Left: College Logo -->
      <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 60px;">
        <img src="${{SREC_LOGO_DATA_URL}}" alt="SREC College Logo" style="height: ${{logoHeight}}; max-width: 90px; object-fit: contain; filter: ${{isDark ? 'drop-shadow(0 2px 6px rgba(255,255,255,0.15))' : 'none'}};" />
      </div>

      <!-- Center: Academic Title & Affiliations -->
      <div style="text-align: center; flex: 1; padding: 0 4px;">
        <div style="color: ${{textColor}}; font-weight: 900; font-size: ${{compact ? '1.05rem' : '1.25rem'}}; letter-spacing: 0.5px; line-height: 1.25; margin-bottom: 2px;">
          ${{INSTITUTIONAL_INFO.collegeName}}
        </div>
        <div style="color: ${{goldColor}}; font-weight: 800; font-size: ${{compact ? '0.70rem' : '0.78rem'}}; line-height: 1.3; margin-bottom: 2px;">
          ${{INSTITUTIONAL_INFO.collegeType}}
        </div>
        <div style="color: ${{subTextColor}}; font-size: ${{compact ? '0.64rem' : '0.70rem'}}; font-weight: 600; line-height: 1.3;">
          ${{INSTITUTIONAL_INFO.affiliations}}
        </div>
        ${{showAddress ? `
        <div style="color: ${{subTextColor}}; font-size: 0.64rem; font-weight: 400; margin-top: 2px; opacity: 0.9;">
          ${{INSTITUTIONAL_INFO.address}}
        </div>
        ` : ''}}
      </div>

      <!-- Right: SNR Sons Trust Logo -->
      <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; min-width: 60px;">
        <img src="${{SNR_TRUST_LOGO_DATA_URL}}" alt="SNR Sons Trust Logo" style="height: ${{logoHeight}}; max-width: 90px; object-fit: contain; filter: ${{isDark ? 'drop-shadow(0 2px 6px rgba(255,255,255,0.15))' : 'none'}};" />
      </div>
    </div>
  `;
}};
'''

with open('client/src/utils/eventDesign/institutionalHeader.js', 'w') as f:
    f.write(code)

print('Written institutionalHeader.js successfully')
