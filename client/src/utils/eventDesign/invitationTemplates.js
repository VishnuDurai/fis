/**
 * SREC FIS V3.2 — Invitation Templates (I01 — I05)
 * Formal academic invitations with structured dignitary honorifics, agenda schedules,
 * template-aware chief guest / speaker photo placement, and institutional seals.
 */

import { renderInstitutionalHeaderHtml } from './institutionalHeader.js';

export const INVITATION_TEMPLATES = [
  {
    id: 'I01',
    name: 'Formal Institutional',
    type: 'INVITATION',
    description: 'Classic gold-bordered formal invite card with royal blue header and traditional academic invitation phrasing.',
    accentColor: '#1e3a8a',
    previewBadge: 'Formal Classic'
  },
  {
    id: 'I02',
    name: 'Chief Guest Focus',
    type: 'INVITATION',
    description: 'Prominent large chief guest portrait, distinguished honorifics, and keynote highlights for esteemed dignitaries.',
    accentColor: '#831843',
    previewBadge: 'Dignitary Focus'
  },
  {
    id: 'I03',
    name: 'Seminar / Workshop',
    type: 'INVITATION',
    description: 'Modern academic card with structured session breakdown, speaker card, date, time, and venue highlights.',
    accentColor: '#0284c7',
    previewBadge: 'Academic Card'
  },
  {
    id: 'I04',
    name: 'Conference / Symposium',
    type: 'INVITATION',
    description: 'Sophisticated dual-column schedule, patron list, and formal invitation text for multi-session conferences.',
    accentColor: '#4338ca',
    previewBadge: 'Conference'
  },
  {
    id: 'I05',
    name: 'Minimal Professional',
    type: 'INVITATION',
    description: 'Clean executive invitation card with elegant typography and distinguished formal sign-offs.',
    accentColor: '#0f172a',
    previewBadge: 'Executive'
  }
];

export const renderInvitationHtml = (templateId, eventData) => {
  const {
    title = 'Inaugural Function & Expert Lecture',
    theme = '',
    department = 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    coOrganizedBy = '',
    inAssociationWith = '',
    resourcePerson = 'Dr. K. Sundar',
    resDesignation = 'Director of Advanced Technology',
    resOrganization = 'Apex Research Institute',
    fromDate = '2026-09-20',
    toDate = '',
    time = '10:30 AM',
    venue = 'Auditorium, SREC Campus',
    organizerLogo = '',
    associationLogo = '',
    eventLogo = '',
    resourcePersonPhoto = '',
    speakerPhoto = '',
    presidedBy = 'Dr. N. R. Alamelu, Principal',
    description = ''
  } = eventData || {};

  const photo = resourcePersonPhoto || speakerPhoto || '';
  const cleanDateStr = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;
  const headerHtml = renderInstitutionalHeaderHtml({ compact: true, showAddress: true });

  const logosHtml = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin: 10px 0;">
      ${organizerLogo ? `<img src="${organizerLogo}" alt="Organizer" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
      ${eventLogo ? `<img src="${eventLogo}" alt="Event" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
      ${associationLogo ? `<img src="${associationLogo}" alt="Association" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
    </div>
  `;

  // -------------------------------------------------------------------------
  // TEMPLATE I02: Chief Guest Focus (PROMINENT Chief Guest Photo)
  // -------------------------------------------------------------------------
  if (templateId === 'I02') {
    return `
      <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border-radius: 12px; border: 3px double #831843; font-family: 'Inter', serif; box-sizing: border-box; min-height: 580px; box-shadow: 0 10px 25px -5px rgba(131,24,67,0.08);">
        ${headerHtml}

        <div style="text-align: center; margin: 8px 0 12px 0;">
          <div style="font-weight: 800; font-size: 0.9rem; color: #831843; text-transform: uppercase; letter-spacing: 1px;">
            DEPARTMENT OF ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: #64748b; font-size: 0.76rem; font-weight: 600;">Jointly with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: #0284c7; font-size: 0.76rem; font-weight: 700;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 12px 0;">
          <div style="font-style: italic; font-size: 0.84rem; color: #475569; margin-bottom: 4px;">
            Cordially invites you to the formal inaugural session of
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1.3; margin: 4px 0; font-family: 'Inter', sans-serif;">
            ${title}
          </h2>
          ${theme ? `<div style="color: #831843; font-size: 0.9rem; font-weight: 700; font-style: italic; margin-top: 2px;">"${theme}"</div>` : ''}
        </div>

        <!-- Prominent Chief Guest Spotlight Card -->
        <div style="border: 2px solid #fbcfe8; background: #fdf2f8; border-radius: 12px; padding: 18px; margin: 16px 0; text-align: center; box-shadow: 0 4px 14px rgba(131,24,67,0.06);">
          <div style="display: inline-block; background: #831843; color: #ffffff; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 14px; border-radius: 12px; margin-bottom: 10px;">
            CHIEF GUEST & KEYNOTE SPEAKER
          </div>
          ${photo ? `
            <div style="margin-bottom: 10px;">
              <img src="${photo}" alt="Chief Guest" style="width: 125px; height: 125px; border-radius: 50%; object-fit: cover; border: 3.5px solid #831843; box-shadow: 0 6px 18px rgba(131,24,67,0.22); display: inline-block;" />
            </div>
          ` : ''}
          <div style="font-size: 1.3rem; font-weight: 900; color: #0f172a;">${resourcePerson}</div>
          ${resDesignation ? `<div style="font-size: 0.88rem; color: #831843; font-weight: 700; margin-top: 2px;">${resDesignation}</div>` : ''}
          ${resOrganization ? `<div style="font-size: 0.82rem; color: #475569; margin-top: 1px;">${resOrganization}</div>` : ''}
          <div style="font-size: 0.76rem; color: #475569; font-style: italic; margin-top: 6px;">has kindly consented to grace the occasion as Chief Guest and deliver the keynote address</div>
        </div>

        <!-- Presidential Address -->
        <div style="text-align: center; margin: 10px 0;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Presided Over By</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">${presidedBy}</div>
        </div>

        <!-- Date & Venue -->
        <div style="display: flex; justify-content: space-around; background: #ffffff; border: 1px solid #fbcfe8; border-radius: 6px; padding: 10px; margin: 14px 0; text-align: center; font-size: 0.8rem;">
          <div>
            <span style="font-weight: 800; color: #0f172a;">📅 Date:</span> ${cleanDateStr}
          </div>
          <div>
            <span style="font-weight: 800; color: #0f172a;">⏰ Time:</span> ${time}
          </div>
          <div>
            <span style="font-weight: 800; color: #0f172a;">📍 Venue:</span> ${venue}
          </div>
        </div>

        <!-- Signatures Footer -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 18px; padding-top: 10px; border-top: 1px solid #fbcfe8; font-size: 0.78rem;">
          <div style="text-align: left;">
            <div style="font-weight: 800; color: #0f172a;">Faculty Coordinator</div>
            <div style="color: #64748b; font-size: 0.72rem;">Department of ${department}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 800; color: #0f172a;">Head of the Department</div>
            <div style="color: #64748b; font-size: 0.72rem;">Department of ${department}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: #0f172a;">Principal</div>
            <div style="color: #64748b; font-size: 0.72rem;">SREC, Coimbatore</div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // TEMPLATES I01, I03, I04, I05 Formal Invitation Cards
  // -------------------------------------------------------------------------
  const borderColor = templateId === 'I04' ? '#4338ca' : templateId === 'I03' ? '#0284c7' : templateId === 'I05' ? '#0f172a' : '#b45309';

  return `
    <div style="background: #ffffff; color: #0f172a; padding: 28px 24px; border-radius: 12px; border: 3px double ${borderColor}; font-family: 'Inter', serif; box-sizing: border-box; min-height: 580px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
      ${headerHtml}

      <div style="text-align: center; margin: 8px 0 14px 0;">
        <div style="font-weight: 800; font-size: 0.88rem; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px;">
          DEPARTMENT OF ${department}
        </div>
        ${coOrganizedBy ? `<div style="color: #64748b; font-size: 0.76rem; font-weight: 600;">Jointly with ${coOrganizedBy}</div>` : ''}
        ${inAssociationWith ? `<div style="color: #0284c7; font-size: 0.76rem; font-weight: 700;">In Association with ${inAssociationWith}</div>` : ''}
      </div>

      ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

      <div style="text-align: center; margin: 14px 0;">
        <div style="font-style: italic; font-size: 0.82rem; color: #475569; margin-bottom: 6px;">
          Cordially invites you to the formal inaugural session of
        </div>
        <h2 style="font-size: 1.45rem; font-weight: 900; color: #0f172a; line-height: 1.3; margin: 6px 0; font-family: 'Inter', sans-serif;">
          ${title}
        </h2>
        ${theme ? `<div style="color: #b45309; font-size: 0.88rem; font-weight: 700; font-style: italic; margin-top: 3px;">"${theme}"</div>` : ''}
      </div>

      <!-- Chief Guest Citation -->
      <div style="border: 1px solid #e2e8f0; background: #fafafa; border-radius: 10px; padding: 14px; margin: 14px 0; display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;">
        ${photo ? `
          <div style="flex-shrink: 0;">
            <img src="${photo}" alt="Chief Guest" style="width: 90px; height: 90px; border-radius: ${templateId === 'I04' ? '10px' : '50%'}; object-fit: cover; border: 2.5px solid ${borderColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
          </div>
        ` : ''}
        <div style="text-align: ${photo ? 'left' : 'center'}; max-width: 420px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.2px; color: ${borderColor}; font-weight: 800;">Chief Guest & Keynote Speaker</div>
          <div style="font-size: 1.18rem; font-weight: 900; color: #0f172a; margin-top: 2px;">${resourcePerson}</div>
          ${resDesignation ? `<div style="font-size: 0.82rem; color: #334155; font-weight: 600;">${resDesignation}</div>` : ''}
          ${resOrganization ? `<div style="font-size: 0.78rem; color: #64748b;">${resOrganization}</div>` : ''}
          <div style="font-size: 0.74rem; color: #475569; font-style: italic; margin-top: 3px;">has kindly consented to be the Chief Guest and deliver the keynote address</div>
        </div>
      </div>

      <!-- Presidential Address -->
      <div style="text-align: center; margin: 12px 0;">
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Presided Over By</div>
        <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">${presidedBy}</div>
      </div>

      <!-- Date & Venue -->
      <div style="display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin: 14px 0; text-align: center; font-size: 0.8rem;">
        <div>
          <span style="font-weight: 800; color: #0f172a;">📅 Date:</span> ${cleanDateStr}
        </div>
        <div>
          <span style="font-weight: 800; color: #0f172a;">⏰ Time:</span> ${time}
        </div>
        <div>
          <span style="font-weight: 800; color: #0f172a;">📍 Venue:</span> ${venue}
        </div>
      </div>

      <!-- Signatures Footer -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 0.78rem;">
        <div style="text-align: left;">
          <div style="font-weight: 800; color: #0f172a;">Faculty Coordinator</div>
          <div style="color: #64748b; font-size: 0.72rem;">Department of ${department}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: 800; color: #0f172a;">Head of the Department</div>
          <div style="color: #64748b; font-size: 0.72rem;">Dept of ${department}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: #0f172a;">Principal</div>
          <div style="color: #64748b; font-size: 0.72rem;">SREC, Coimbatore</div>
        </div>
      </div>
    </div>
  `;
};
