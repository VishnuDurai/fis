/**
 * SREC FIS V3.2 — Participation Certificate Templates (C01 — C05)
 * Professional academic participation and achievement certificates with accredited institutional branding
 * and strictly server-mapped Institutional Signatories:
 * 1. Faculty Coordinator
 * 2. HOD
 * 3. Principal
 */

import { INSTITUTIONAL_INFO, renderInstitutionalHeaderHtml } from './institutionalHeader.js';

export const CERTIFICATE_TEMPLATES = [
  {
    id: 'C01',
    name: 'Classic Guilloche Institutional',
    type: 'CERTIFICATE',
    description: 'Traditional ornate guilloche gold border, gold foil seal, formal serif typography, and formal academic phrasing.',
    accentColor: '#b45309',
    previewBadge: 'Traditional Seal'
  },
  {
    id: 'C02',
    name: 'Modern Academic Geometric',
    type: 'CERTIFICATE',
    description: 'Sleek geometric borders with dual sapphire & emerald ribbon accents and contemporary layout.',
    accentColor: '#0284c7',
    previewBadge: 'Modern'
  },
  {
    id: 'C03',
    name: 'Research / Conference Citation',
    type: 'CERTIFICATE',
    description: 'Prestigious citation format tailored for international conferences, technical symposiums, and research paper presentations.',
    accentColor: '#4338ca',
    previewBadge: 'Research Citation'
  },
  {
    id: 'C04',
    name: 'Workshop / FDP Competency',
    type: 'CERTIFICATE',
    description: 'Dedicated skill development certificate format featuring course duration, training hours, and technical competencies.',
    accentColor: '#059669',
    previewBadge: 'FDP / Training'
  },
  {
    id: 'C05',
    name: 'Minimal Clean Executive',
    type: 'CERTIFICATE',
    description: 'Crisp, clean corporate-academic layout with clean lines, 3 institutional signature blocks, and official verification numbering.',
    accentColor: '#1e293b',
    previewBadge: 'Minimalist'
  }
];

export const renderCertificateHtml = (templateId, certificateData) => {
  const {
    participantName = 'Dr. S. Karthik',
    designation = 'Associate Professor',
    organization = 'Sri Ramakrishna Engineering College',
    eventTitle = 'Faculty Development Programme on Generative AI & Deep Learning',
    eventType = 'Workshop',
    department = 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    fromDate = '2026-09-15',
    toDate = '2026-09-19',
    certificateNumber = 'SREC/AD/2026/EVT001/001',
    signatories = {}
  } = certificateData || {};

  // Resolve the 3 Institutional Signatories (Faculty Coordinator, HOD, Principal)
  const facCoordName = signatories?.facultyCoordinator?.name || certificateData?.facultyCoordinatorName || certificateData?.facultyName || 'Dr. Faculty Coordinator';
  const facCoordDesg = signatories?.facultyCoordinator?.designation || certificateData?.facultyCoordinatorDesignation || 'Faculty Coordinator';

  const hodName = signatories?.hod?.name || certificateData?.hodName || 'Head of the Department';
  const hodDesg = signatories?.hod?.designation || certificateData?.hodDesignation || 'Professor & Head';

  const principalName = signatories?.principal?.name || certificateData?.principalName || 'Dr. N. R. Alamelu';
  const principalDesg = signatories?.principal?.designation || certificateData?.principalDesignation || 'Principal';

  const cleanDateStr = toDate && toDate !== fromDate ? `from ${fromDate} to ${toDate}` : `on ${fromDate}`;

  // Standard 3-Signatory Footer Component for Templates
  const renderSignatoryFooter = (borderTopColor = '#64748b', titleColor = '#0f172a', subtitleColor = '#64748b') => `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding: 0 16px; font-family: 'Inter', sans-serif; gap: 20px;">
      
      <!-- 1. Faculty Coordinator -->
      <div style="text-align: center; flex: 1; min-width: 140px;">
        <div style="font-size: 0.72rem; font-weight: 800; color: ${subtitleColor}; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.5px;">
          Faculty Coordinator
        </div>
        <div style="border-top: 1.5px solid ${borderTopColor}; padding-top: 5px;">
          <div style="font-weight: 800; color: ${titleColor}; font-size: 0.85rem;">${facCoordName}</div>
          <div style="font-size: 0.72rem; color: ${subtitleColor};">${facCoordDesg}</div>
        </div>
      </div>

      <!-- 2. HOD -->
      <div style="text-align: center; flex: 1; min-width: 140px;">
        <div style="font-size: 0.72rem; font-weight: 800; color: ${subtitleColor}; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.5px;">
          HOD
        </div>
        <div style="border-top: 1.5px solid ${borderTopColor}; padding-top: 5px;">
          <div style="font-weight: 800; color: ${titleColor}; font-size: 0.85rem;">${hodName}</div>
          <div style="font-size: 0.72rem; color: ${subtitleColor};">${hodDesg}</div>
        </div>
      </div>

      <!-- 3. Principal -->
      <div style="text-align: center; flex: 1; min-width: 140px;">
        <div style="font-size: 0.72rem; font-weight: 800; color: ${subtitleColor}; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.5px;">
          Principal
        </div>
        <div style="border-top: 1.5px solid ${borderTopColor}; padding-top: 5px;">
          <div style="font-weight: 800; color: ${titleColor}; font-size: 0.85rem;">${principalName}</div>
          <div style="font-size: 0.72rem; color: ${subtitleColor};">${principalDesg}</div>
        </div>
      </div>

    </div>
  `;

  const headerHtml = renderInstitutionalHeaderHtml({ compact: true, showAddress: false });

  // C01: Classic Guilloche Gold Border
  if (templateId === 'C01' || !templateId) {
    return `
      <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border: 8px double #b45309; border-radius: 8px; font-family: 'Times New Roman', Times, serif; box-sizing: border-box; min-height: 520px; position: relative; box-shadow: inset 0 0 20px rgba(180, 83, 9, 0.08);">
        ${headerHtml}

        <div style="text-align: center; font-family: 'Inter', sans-serif; font-weight: 800; font-size: 0.82rem; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">
          DEPARTMENT OF ${department}
        </div>

        <div style="text-align: center; margin: 10px 0 12px 0;">
          <div style="font-family: 'Inter', sans-serif; font-size: 1.4rem; font-weight: 900; color: #b45309; letter-spacing: 2px; text-transform: uppercase;">
            Certificate of Participation
          </div>
        </div>

        <div style="text-align: center; font-size: 0.92rem; line-height: 1.8; color: #334155; margin: 14px auto; max-width: 92%;">
          This is to certify that 
          <span style="font-weight: 900; color: #0f172a; font-size: 1.12rem; text-decoration: underline; text-underline-offset: 4px; padding: 0 4px;">
            ${participantName}
          </span>, 
          <span style="font-weight: 700; color: #1e293b;">${designation}</span>, 
          <span>${organization}</span>, has actively participated in the 
          <span style="font-weight: 800; color: #1e3a8a;">${eventType || 'Event'}</span> on 
          <strong style="color: #0f172a; font-family: 'Inter', sans-serif;">"${eventTitle}"</strong> 
          organized by the Department of ${department}, Sri Ramakrishna Engineering College, Coimbatore ${cleanDateStr}.
        </div>

        ${renderSignatoryFooter('#b45309', '#0f172a', '#64748b')}

        <div style="position: absolute; bottom: 8px; left: 16px; font-family: 'Inter', monospace; font-size: 0.65rem; color: #64748b; font-weight: 600;">
          Certificate No: <span style="color: #0f172a; font-weight: 800;">${certificateNumber}</span>
        </div>
      </div>
    `;
  }

  // C02: Modern Academic Geometric
  if (templateId === 'C02') {
    return `
      <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border: 4px solid #0284c7; border-radius: 12px; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; min-height: 520px; position: relative; box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.1);">
        <div style="height: 6px; background: linear-gradient(90deg, #0284c7, #10b981); position: absolute; top: 0; left: 0; right: 0; border-radius: 8px 8px 0 0;"></div>

        ${headerHtml}

        <div style="text-align: center; font-weight: 800; font-size: 0.85rem; color: #0f172a; text-transform: uppercase; margin-bottom: 6px;">
          DEPARTMENT OF ${department}
        </div>

        <div style="text-align: center; margin: 10px 0 14px 0;">
          <div style="font-size: 1.45rem; font-weight: 900; color: #0369a1; letter-spacing: 1.5px; text-transform: uppercase;">
            Certificate of Participation
          </div>
        </div>

        <div style="text-align: center; font-size: 0.92rem; line-height: 1.8; color: #334155; margin: 14px auto; max-width: 92%;">
          This is presented to 
          <span style="font-weight: 900; color: #0f172a; font-size: 1.15rem; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">
            ${participantName}
          </span>, 
          <span style="font-weight: 700; color: #1e293b;">${designation}</span>, 
          <span>${organization}</span>, in recognition of active participation in the 
          <span style="font-weight: 800; color: #0284c7;">${eventType || 'Event'}</span> on 
          <strong style="color: #0f172a;">"${eventTitle}"</strong> 
          conducted by the Department of ${department}, Sri Ramakrishna Engineering College ${cleanDateStr}.
        </div>

        ${renderSignatoryFooter('#0284c7', '#0f172a', '#64748b')}

        <div style="position: absolute; bottom: 8px; left: 16px; font-family: monospace; font-size: 0.65rem; color: #64748b; font-weight: 600;">
          Certificate No: <span style="color: #0369a1; font-weight: 800;">${certificateNumber}</span>
        </div>
      </div>
    `;
  }

  // C03: Research / Conference Citation
  if (templateId === 'C03') {
    return `
      <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border: 4px solid #4338ca; border-radius: 6px; font-family: 'Times New Roman', Times, serif; box-sizing: border-box; min-height: 520px; position: relative;">
        ${headerHtml}

        <div style="text-align: center; font-family: 'Inter', sans-serif; font-weight: 800; font-size: 0.85rem; color: #0f172a; text-transform: uppercase;">
          DEPARTMENT OF ${department}
        </div>

        <div style="text-align: center; margin: 12px 0;">
          <div style="font-family: 'Inter', sans-serif; font-size: 1.45rem; font-weight: 900; color: #4338ca; letter-spacing: 2px; text-transform: uppercase;">
            Certificate of Research Participation
          </div>
        </div>

        <div style="text-align: center; font-size: 0.95rem; line-height: 1.8; color: #334155; margin: 14px auto; max-width: 92%;">
          This citation is proudly conferred upon 
          <span style="font-weight: 900; color: #0f172a; font-size: 1.15rem; border-bottom: 2px solid #4338ca; padding: 0 4px;">
            ${participantName}
          </span>, 
          <span style="font-weight: 700; color: #1e293b;">${designation}</span>, 
          <span>${organization}</span>, for scholarly participation in the 
          <span style="font-weight: 800; color: #4338ca;">${eventType || 'Conference'}</span> on 
          <strong style="color: #0f172a; font-family: 'Inter', sans-serif;">"${eventTitle}"</strong> 
          hosted by the Department of ${department}, Sri Ramakrishna Engineering College, Coimbatore ${cleanDateStr}.
        </div>

        ${renderSignatoryFooter('#4338ca', '#0f172a', '#64748b')}

        <div style="position: absolute; bottom: 8px; left: 16px; font-family: 'Inter', monospace; font-size: 0.65rem; color: #64748b; font-weight: 600;">
          Certificate No: <span style="color: #4338ca; font-weight: 800;">${certificateNumber}</span>
        </div>
      </div>
    `;
  }

  // C04: Workshop / FDP Competency
  if (templateId === 'C04') {
    return `
      <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border: 4px solid #059669; border-radius: 10px; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; min-height: 520px; position: relative;">
        ${headerHtml}

        <div style="text-align: center; font-weight: 800; font-size: 0.85rem; color: #0f172a; text-transform: uppercase;">
          DEPARTMENT OF ${department}
        </div>

        <div style="text-align: center; margin: 10px 0 12px 0;">
          <div style="font-size: 1.4rem; font-weight: 900; color: #059669; letter-spacing: 1.5px; text-transform: uppercase;">
            Certificate of Completion & Participation
          </div>
        </div>

        <div style="text-align: center; font-size: 0.92rem; line-height: 1.8; color: #334155; margin: 14px auto; max-width: 92%;">
          This certifies that 
          <span style="font-weight: 900; color: #0f172a; font-size: 1.15rem; background: #ecfdf5; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">
            ${participantName}
          </span>, 
          <span style="font-weight: 700; color: #1e293b;">${designation}</span>, 
          <span>${organization}</span>, has successfully completed all coursework and practical sessions in the 
          <span style="font-weight: 800; color: #059669;">${eventType || 'Workshop'}</span> on 
          <strong style="color: #0f172a;">"${eventTitle}"</strong> 
          conducted by the Department of ${department}, Sri Ramakrishna Engineering College ${cleanDateStr}.
        </div>

        ${renderSignatoryFooter('#059669', '#0f172a', '#64748b')}

        <div style="position: absolute; bottom: 8px; left: 16px; font-family: monospace; font-size: 0.65rem; color: #64748b; font-weight: 600;">
          Certificate No: <span style="color: #059669; font-weight: 800;">${certificateNumber}</span>
        </div>
      </div>
    `;
  }

  // C05: Minimal Clean Executive
  return `
    <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border: 3px solid #1e293b; border-radius: 4px; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; min-height: 520px; position: relative;">
      ${headerHtml}

      <div style="text-align: center; font-weight: 800; font-size: 0.85rem; color: #0f172a; text-transform: uppercase;">
        DEPARTMENT OF ${department}
      </div>

      <div style="text-align: center; margin: 12px 0 14px 0;">
        <div style="font-size: 1.45rem; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-transform: uppercase;">
          Certificate of Participation
        </div>
      </div>

      <div style="text-align: center; font-size: 0.92rem; line-height: 1.8; color: #334155; margin: 14px auto; max-width: 92%;">
        This is to certify that 
        <span style="font-weight: 900; color: #0f172a; font-size: 1.15rem; padding: 0 4px; border-bottom: 2px solid #0f172a;">
          ${participantName}
        </span>, 
        <span style="font-weight: 700; color: #1e293b;">${designation}</span>, 
        <span>${organization}</span>, participated in the 
        <span style="font-weight: 800; color: #0f172a;">${eventType || 'Event'}</span> on 
        <strong style="color: #0f172a;">"${eventTitle}"</strong> 
        organized by the Department of ${department}, Sri Ramakrishna Engineering College, Coimbatore ${cleanDateStr}.
      </div>

      ${renderSignatoryFooter('#1e293b', '#0f172a', '#475569')}

      <div style="position: absolute; bottom: 8px; left: 16px; font-family: monospace; font-size: 0.65rem; color: #64748b; font-weight: 600;">
        Certificate No: <span style="color: #0f172a; font-weight: 800;">${certificateNumber}</span>
      </div>
    </div>
  `;
};
