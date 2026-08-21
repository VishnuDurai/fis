import { renderInstitutionalHeaderHtml } from './institutionalHeader.js';
import { normalizeEventPersons } from './designPresets.js';

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

const renderInvitationDignitariesHtml = (persons = [], { accentColor = '#831843', borderColor = '#e2e8f0', cardBg = '', nameColor = '', desigColor = '', orgColor = '', showPhoto = true, showProfile = false, speakerLayout = 'auto', templateId = '' } = {}) => {
  const count = persons.length;
  if (count === 0) return '';

  let gridCols = '1fr';
  if (speakerLayout === 'two_column' || (speakerLayout === 'auto' && count === 2)) gridCols = '1fr 1fr';
  else if (speakerLayout === 'three_column' || (speakerLayout === 'auto' && count === 3)) gridCols = '1fr 1fr 1fr';
  else if (speakerLayout === 'grid' || (speakerLayout === 'auto' && count === 4)) gridCols = '1fr 1fr';
  else if (speakerLayout === 'compact_grid' || (speakerLayout === 'auto' && count >= 5)) gridCols = count >= 6 ? '1fr 1fr 1fr' : '1fr 1fr';

  const resolvedCardBg = cardBg || '#fafafa';
  const resolvedNameColor = nameColor || '#0f172a';
  const resolvedDesigColor = desigColor || '#334155';
  const resolvedOrgColor = orgColor || '#64748b';

  return `
    <div style="display: grid; grid-template-columns: ${gridCols}; gap: 12px; margin: 14px 0;">
      ${persons.map((p, idx) => {
        const photo = p.photo || p.photoUrl || '';
        const role = templateId === 'I02' && count === 1 && (!p.role || p.role === 'Resource Person') ? 'CHIEF GUEST' : (p.role || (idx === 0 ? 'Chief Guest' : 'Resource Person'));
        const crop = p.photoCrop || 'circle';
        const borderRadius = crop === 'circle' ? '50%' : crop === 'rounded_rectangle' ? '10px' : '0px';
        const photoDim = count === 1 ? '90px' : count <= 3 ? '75px' : '55px';

        return `
          <div style="background: ${resolvedCardBg}; border: 1.5px solid ${borderColor}; border-radius: 10px; padding: 12px; display: flex; flex-direction: ${count >= 3 ? 'column' : 'row'}; align-items: center; justify-content: center; gap: 10px; text-align: ${count >= 3 ? 'center' : (photo ? 'left' : 'center')}; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            ${showPhoto && photo ? `
              <div style="flex-shrink: 0;">
                <img src="${photo}" alt="${p.name}" style="width: ${photoDim}; height: ${photoDim}; border-radius: ${borderRadius}; object-fit: cover; border: 2.5px solid ${accentColor}; box-shadow: 0 3px 8px rgba(0,0,0,0.12);" />
              </div>
            ` : ''}
            <div style="max-width: 100%;">
              <div style="display: inline-block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px; color: ${accentColor}; font-weight: 800; background: rgba(0,0,0,0.04); padding: 2px 6px; border-radius: 4px; margin-bottom: 3px;">
                ${String(role).toUpperCase()}
              </div>
              <div style="font-size: ${count <= 2 ? '1.1rem' : '0.95rem'}; font-weight: 800; color: ${resolvedNameColor}; line-height: 1.2;">${p.name || 'Dignitary'}</div>
              ${p.designation ? `<div style="font-size: 0.8rem; color: ${resolvedDesigColor}; font-weight: 600; margin-top: 1px;">${p.designation}</div>` : ''}
              ${p.organization ? `<div style="font-size: 0.75rem; color: ${resolvedOrgColor}; margin-top: 1px;">${p.organization}</div>` : ''}
              ${showProfile && p.profile && count === 1 ? `<div style="font-size: 0.72rem; color: ${resolvedOrgColor}; margin-top: 4px; font-style: italic;">"${p.profile.slice(0, 100)}..."</div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

export const renderInvitationHtml = (templateId, eventData, customDesign = {}) => {
  const {
    title = 'Inaugural Function & Expert Lecture',
    theme = '',
    department = 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    coOrganizedBy = '',
    inAssociationWith = '',
    fromDate = '2026-09-20',
    toDate = '',
    time = '10:30 AM',
    venue = 'Auditorium, SREC Campus',
    organizerLogo = '',
    associationLogo = '',
    eventLogo = '',
    presidedBy = 'Dr. N. R. Alamelu, Principal'
  } = eventData || {};

  const persons = normalizeEventPersons(eventData, customDesign);
  const cleanDateStr = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;
  const headerHtml = renderInstitutionalHeaderHtml({ compact: true, showAddress: true });

  // Dynamic Theme Colors
  const customColors = customDesign.customColors || {};
  const primaryColor = customColors.primary || (templateId === 'I02' ? '#831843' : templateId === 'I04' ? '#4338ca' : templateId === 'I03' ? '#0284c7' : templateId === 'I05' ? '#0f172a' : '#1e3a8a');
  const accentColor = customColors.accent || (templateId === 'I02' ? '#f43f5e' : templateId === 'I04' ? '#818cf8' : '#b45309');
  const bgColor = customColors.background || '#ffffff';
  const cardBg = customColors.cardBg || '#f8fafc';
  const boxBorderColor = customColors.border || (templateId === 'I02' ? '#fbcfe8' : '#cbd5e1');
  const textColor = customColors.text || '#0f172a';
  const textMuted = customColors.textMuted || '#475569';

  const titleFont = customDesign.typography?.titleFont ? `'${customDesign.typography.titleFont}', sans-serif` : "'Inter', sans-serif";
  const bodyFont = customDesign.typography?.bodyFont ? `'${customDesign.typography.bodyFont}', sans-serif` : "'Inter', sans-serif";

  const logosHtml = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 16px; margin: 10px 0;">
      ${organizerLogo ? `<img src="${organizerLogo}" alt="Organizer" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
      ${eventLogo ? `<img src="${eventLogo}" alt="Event" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
      ${associationLogo ? `<img src="${associationLogo}" alt="Association" style="max-height: 44px; max-width: 90px; object-fit: contain;" />` : ''}
    </div>
  `;

  // -------------------------------------------------------------------------
  // TEMPLATE I02: Chief Guest Focus
  // -------------------------------------------------------------------------
  if (templateId === 'I02') {
    return `
      <div style="background: ${bgColor}; color: ${textColor}; padding: 28px 24px; border-radius: 12px; border: 3px double ${primaryColor}; font-family: ${bodyFont}; box-sizing: border-box; min-height: 580px; box-shadow: 0 10px 25px -5px rgba(131,24,67,0.08);">
        ${headerHtml}

        <div style="text-align: center; margin: 8px 0 12px 0;">
          <div style="font-weight: 800; font-size: 0.9rem; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px;">
            DEPARTMENT OF ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: ${textMuted}; font-size: 0.76rem; font-weight: 600;">Jointly with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: ${accentColor}; font-size: 0.76rem; font-weight: 700;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 12px 0;">
          <div style="font-style: italic; font-size: 0.84rem; color: ${textMuted}; margin-bottom: 4px;">
            Cordially invites you to the formal inaugural session of
          </div>
          <h2 style="font-family: ${titleFont}; font-size: 1.5rem; font-weight: 900; color: ${textColor}; line-height: 1.3; margin: 4px 0;">
            ${title}
          </h2>
          ${theme ? `<div style="color: ${primaryColor}; font-size: 0.9rem; font-weight: 700; font-style: italic; margin-top: 2px;">"${theme}"</div>` : ''}
        </div>

        <!-- Dignitaries / Chief Guests Container -->
        ${renderInvitationDignitariesHtml(persons, { accentColor: primaryColor, borderColor: boxBorderColor, cardBg, showPhoto: customDesign.showPhoto !== false, showProfile: customDesign.showProfile, speakerLayout: customDesign.speakerLayout, templateId: 'I02' })}

        <!-- Presidential Address -->
        <div style="text-align: center; margin: 10px 0;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: ${textMuted}; font-weight: 700;">Presided Over By</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: ${textColor};">${presidedBy}</div>
        </div>

        <!-- Date & Venue -->
        <div style="display: flex; justify-content: space-around; background: ${cardBg}; border: 1px solid ${boxBorderColor}; border-radius: 6px; padding: 10px; margin: 14px 0; text-align: center; font-size: 0.8rem;">
          <div>
            <span style="font-weight: 800; color: ${textColor};">📅 Date:</span> ${cleanDateStr}
          </div>
          <div>
            <span style="font-weight: 800; color: ${textColor};">⏰ Time:</span> ${time}
          </div>
          <div>
            <span style="font-weight: 800; color: ${textColor};">📍 Venue:</span> ${venue}
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // TEMPLATES I01, I03, I04, I05 Formal Invitation Cards
  // -------------------------------------------------------------------------
  return `
    <div style="background: ${bgColor}; color: ${textColor}; padding: 28px 24px; border-radius: 12px; border: 3px double ${primaryColor}; font-family: ${bodyFont}; box-sizing: border-box; min-height: 580px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
      ${headerHtml}

      <div style="text-align: center; margin: 8px 0 14px 0;">
        <div style="font-weight: 800; font-size: 0.88rem; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px;">
          DEPARTMENT OF ${department}
        </div>
        ${coOrganizedBy ? `<div style="color: ${textMuted}; font-size: 0.76rem; font-weight: 600;">Jointly with ${coOrganizedBy}</div>` : ''}
        ${inAssociationWith ? `<div style="color: ${accentColor}; font-size: 0.76rem; font-weight: 700;">In Association with ${inAssociationWith}</div>` : ''}
      </div>

      ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

      <div style="text-align: center; margin: 14px 0;">
        <div style="font-style: italic; font-size: 0.82rem; color: ${textMuted}; margin-bottom: 6px;">
          Cordially invites you to the formal inaugural session of
        </div>
        <h2 style="font-family: ${titleFont}; font-size: 1.45rem; font-weight: 900; color: ${textColor}; line-height: 1.3; margin: 6px 0;">
          ${title}
        </h2>
        ${theme ? `<div style="color: ${accentColor}; font-size: 0.88rem; font-weight: 700; font-style: italic; margin-top: 3px;">"${theme}"</div>` : ''}
      </div>

      <!-- Dignitaries Container -->
      ${renderInvitationDignitariesHtml(persons, { accentColor: primaryColor, borderColor: boxBorderColor, cardBg, showPhoto: customDesign.showPhoto !== false, showProfile: customDesign.showProfile, speakerLayout: customDesign.speakerLayout })}

      <!-- Presidential Address -->
      <div style="text-align: center; margin: 12px 0;">
        <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: ${textMuted}; font-weight: 700;">Presided Over By</div>
        <div style="font-size: 0.95rem; font-weight: 800; color: ${textColor};">${presidedBy}</div>
      </div>

      <!-- Date & Venue -->
      <div style="display: flex; justify-content: space-around; background: ${cardBg}; border: 1px solid ${boxBorderColor}; border-radius: 6px; padding: 10px; margin: 14px 0; text-align: center; font-size: 0.8rem;">
        <div>
          <span style="font-weight: 800; color: ${textColor};">📅 Date:</span> ${cleanDateStr}
        </div>
        <div>
          <span style="font-weight: 800; color: ${textColor};">⏰ Time:</span> ${time}
        </div>
        <div>
          <span style="font-weight: 800; color: ${textColor};">📍 Venue:</span> ${venue}
        </div>
      </div>
    </div>
  `;
};

