import { renderInstitutionalHeaderHtml } from './institutionalHeader.js';
import { normalizeEventPersons } from './designPresets.js';

export const POSTER_TEMPLATES = [
  {
    id: 'P01',
    name: 'Institutional Classic',
    type: 'POSTER',
    description: 'Formal academic grid with deep maroon & navy tones, gold accent lines, and balanced speaker placement.',
    accentColor: '#831843',
    bgColor: '#ffffff',
    previewBadge: 'Classic'
  },
  {
    id: 'P02',
    name: 'Research & Technical',
    type: 'POSTER',
    description: 'Modern dark slate and electric indigo tech gradient with high-contrast typography and circuit borders.',
    accentColor: '#6366f1',
    bgColor: '#0f172a',
    previewBadge: 'Modern Tech'
  },
  {
    id: 'P03',
    name: 'Seminar / Keynote Focus',
    type: 'POSTER',
    description: 'Prominent large speaker portrait spotlight, keynote badge, session schedule, and prominent venue highlights.',
    accentColor: '#0369a1',
    bgColor: '#f8fafc',
    previewBadge: 'Speaker Focus'
  },
  {
    id: 'P04',
    name: 'Workshop / Training',
    type: 'POSTER',
    description: 'Dynamic emerald & teal hands-on workshop layout with structured key takeaways, schedule, and registration details.',
    accentColor: '#0f766e',
    bgColor: '#f0fdfa',
    previewBadge: 'Hands-On'
  },
  {
    id: 'P05',
    name: 'Minimal Academic',
    type: 'POSTER',
    description: 'High-elegance clean typography poster with subtle gold borders, spacious margins, and sophisticated hierarchy.',
    accentColor: '#1e293b',
    bgColor: '#ffffff',
    previewBadge: 'Minimalist'
  }
];

const renderMultiSpeakerCardsHtml = (persons = [], { isDark = false, accentColor = '#831843', borderColor = '#e2e8f0', cardBg = '', nameColor = '', desigColor = '', orgColor = '', showPhoto = true, showProfile = false, speakerLayout = 'auto', templateId = '' } = {}) => {
  const count = persons.length;
  if (count === 0) return '';

  let gridCols = '1fr';
  if (speakerLayout === 'two_column' || (speakerLayout === 'auto' && count === 2)) gridCols = '1fr 1fr';
  else if (speakerLayout === 'three_column' || (speakerLayout === 'auto' && count === 3)) gridCols = '1fr 1fr 1fr';
  else if (speakerLayout === 'grid' || (speakerLayout === 'auto' && count === 4)) gridCols = '1fr 1fr';
  else if (speakerLayout === 'compact_grid' || (speakerLayout === 'auto' && count >= 5)) gridCols = count >= 6 ? '1fr 1fr 1fr' : '1fr 1fr';

  const resolvedCardBg = cardBg || (isDark ? 'rgba(30, 41, 59, 0.85)' : '#ffffff');
  const resolvedNameColor = nameColor || (isDark ? '#ffffff' : '#0f172a');
  const resolvedDesigColor = desigColor || (isDark ? '#cbd5e1' : '#334155');
  const resolvedOrgColor = orgColor || (isDark ? '#94a3b8' : '#64748b');

  return `
    <div style="display: grid; grid-template-columns: ${gridCols}; gap: 14px; margin: 18px 0;">
      ${persons.map((p, idx) => {
        const photo = p.photo || p.photoUrl || '';
        const role = templateId === 'P03' && count === 1 && (!p.role || p.role === 'Resource Person') ? 'KEYNOTE SPEAKER' : (p.role || (idx === 0 ? 'Chief Guest' : 'Resource Person'));
        const crop = p.photoCrop || 'circle';
        const borderRadius = crop === 'circle' ? '50%' : crop === 'rounded_rectangle' ? '12px' : '0px';
        const photoDim = count === 1 ? '105px' : count <= 3 ? '85px' : '65px';

        return `
          <div style="background: ${resolvedCardBg}; border: 1.5px solid ${borderColor}; border-radius: 12px; padding: 14px; display: flex; flex-direction: ${count >= 3 ? 'column' : 'row'}; align-items: center; justify-content: center; gap: 12px; text-align: ${count >= 3 ? 'center' : (photo ? 'left' : 'center')}; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
            ${showPhoto && photo ? `
              <div style="flex-shrink: 0;">
                <img src="${photo}" alt="${p.name}" style="width: ${photoDim}; height: ${photoDim}; border-radius: ${borderRadius}; object-fit: cover; border: 2.5px solid ${accentColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.15);" />
              </div>
            ` : ''}
            <div style="max-width: 100%;">
              <div style="display: inline-block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: ${accentColor}; font-weight: 800; background: ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.04)'}; padding: 2px 8px; border-radius: 6px; margin-bottom: 4px;">
                ${role}
              </div>
              <div style="font-size: ${count <= 2 ? '1.15rem' : '1.0rem'}; font-weight: 800; color: ${resolvedNameColor}; line-height: 1.2;">${p.name || 'Dignitary'}</div>
              ${p.designation ? `<div style="font-size: 0.82rem; color: ${resolvedDesigColor}; font-weight: 600; margin-top: 2px;">${p.designation}</div>` : ''}
              ${p.organization ? `<div style="font-size: 0.78rem; color: ${resolvedOrgColor}; margin-top: 1px;">${p.organization}</div>` : ''}
              ${showProfile && p.profile && count === 1 ? `<div style="font-size: 0.75rem; color: ${resolvedOrgColor}; margin-top: 6px; font-style: italic; line-height: 1.3;">"${p.profile.slice(0, 120)}..."</div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

export const renderPosterHtml = (templateId, eventData, customDesign = {}) => {
  const {
    title = 'National Seminar on Advanced Computing',
    theme = '',
    department = 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    coOrganizedBy = '',
    inAssociationWith = '',
    fromDate = '2026-09-15',
    toDate = '',
    time = '10:00 AM - 01:00 PM',
    venue = 'Auditorium / Seminar Hall 1, SREC Campus',
    organizerLogo = '',
    associationLogo = '',
    eventLogo = '',
    description = ''
  } = eventData || {};

  const persons = normalizeEventPersons(eventData, customDesign);
  const cleanDateStr = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;
  const isDark = templateId === 'P02';

  // Dynamic Theme Colors
  const customColors = customDesign.customColors || {};
  const primaryColor = customColors.primary || (templateId === 'P01' ? '#831843' : templateId === 'P02' ? '#6366f1' : templateId === 'P03' ? '#0369a1' : templateId === 'P04' ? '#0f766e' : '#1e293b');
  const accentColor = customColors.accent || (templateId === 'P02' ? '#38bdf8' : templateId === 'P03' ? '#0284c7' : primaryColor);
  const bgColor = customColors.background || (templateId === 'P02' ? '#0f172a' : templateId === 'P03' ? '#f8fafc' : templateId === 'P04' ? '#f0fdfa' : templateId === 'P01' ? '#fdf2f8' : '#ffffff');
  const cardBg = customColors.cardBg || (isDark ? 'rgba(30, 41, 59, 0.85)' : '#ffffff');
  const boxBorderColor = customColors.border || (templateId === 'P02' ? '#4338ca' : templateId === 'P03' ? '#bae6fd' : templateId === 'P04' ? '#99f6e4' : templateId === 'P01' ? '#fbcfe8' : '#cbd5e1');
  const textColor = customColors.text || (isDark ? '#ffffff' : '#0f172a');
  const textMuted = customColors.textMuted || (isDark ? '#cbd5e1' : '#475569');

  const titleFont = customDesign.typography?.titleFont ? `'${customDesign.typography.titleFont}', sans-serif` : "'Inter', sans-serif";
  const bodyFont = customDesign.typography?.bodyFont ? `'${customDesign.typography.bodyFont}', sans-serif` : "'Inter', sans-serif";

  const headerHtml = renderInstitutionalHeaderHtml({ isDark, compact: false, showAddress: true });

  const logosHtml = `
    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 12px 0;">
      ${organizerLogo ? `<img src="${organizerLogo}" alt="Organizer Logo" style="max-height: 52px; max-width: 100px; object-fit: contain; border-radius: 4px; padding: 2px; background: white;" />` : ''}
      ${eventLogo ? `<img src="${eventLogo}" alt="Event Logo" style="max-height: 52px; max-width: 100px; object-fit: contain; border-radius: 4px; padding: 2px; background: white;" />` : ''}
      ${associationLogo ? `<img src="${associationLogo}" alt="Association Logo" style="max-height: 52px; max-width: 100px; object-fit: contain; border-radius: 4px; padding: 2px; background: white;" />` : ''}
    </div>
  `;

  // -------------------------------------------------------------------------
  // TEMPLATE P02: Modern Dark Tech Poster
  // -------------------------------------------------------------------------
  if (templateId === 'P02') {
    return `
      <div style="background: ${customColors.background ? customColors.background : 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)'}; color: ${textColor}; padding: 32px 28px; border-radius: 12px; border: 2px solid ${primaryColor}; font-family: ${bodyFont}; box-sizing: border-box; min-height: 600px; position: relative;">
        ${headerHtml}
        
        <div style="text-align: center; margin-top: 10px; margin-bottom: 14px;">
          <div style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: ${accentColor}; font-weight: 800; font-size: 0.8rem; padding: 4px 14px; border-radius: 20px; border: 1px solid ${primaryColor}; text-transform: uppercase; letter-spacing: 1px;">
            Organized by Department of ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: ${textMuted}; font-size: 0.75rem; margin-top: 4px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: ${accentColor}; font-size: 0.75rem; margin-top: 2px; font-weight: 600;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 20px 0;">
          <h1 style="font-family: ${titleFont}; font-size: 1.65rem; font-weight: 900; color: ${textColor}; line-height: 1.25; margin: 0 0 8px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            ${title}
          </h1>
          ${theme ? `<div style="color: ${accentColor}; font-size: 0.95rem; font-weight: 600; font-style: italic;">"${theme}"</div>` : ''}
          ${description ? `<p style="color: ${textMuted}; font-size: 0.82rem; max-width: 85%; margin: 8px auto 0 auto; line-height: 1.4;">${description}</p>` : ''}
        </div>

        <!-- Multi-Speaker Container -->
        ${renderMultiSpeakerCardsHtml(persons, { isDark: true, accentColor, borderColor: boxBorderColor, cardBg, showPhoto: customDesign.showPhoto !== false, showProfile: customDesign.showProfile, speakerLayout: customDesign.speakerLayout })}

        <!-- Schedule / Venue Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 20px; background: rgba(15, 23, 42, 0.8); padding: 14px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
          <div>
            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">📅 Date</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: ${accentColor}; margin-top: 2px;">${cleanDateStr}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">⏰ Time</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #fbbf24; margin-top: 2px;">${time}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">📍 Venue</div>
            <div style="font-size: 0.82rem; font-weight: 800; color: #4ade80; margin-top: 2px;">${venue}</div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 0.75rem; color: #64748b; font-weight: 600;">
          All Faculty, Research Scholars & Students are Cordially Invited
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // TEMPLATE P03: Seminar / Keynote Focus
  // -------------------------------------------------------------------------
  if (templateId === 'P03') {
    return `
      <div style="background: ${bgColor}; color: ${textColor}; padding: 32px 28px; border-radius: 12px; border: 2.5px solid ${primaryColor}; font-family: ${bodyFont}; box-sizing: border-box; min-height: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
        ${headerHtml}

        <div style="text-align: center; margin: 12px 0;">
          <div style="color: ${primaryColor}; font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.8px;">
            DEPARTMENT OF ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: ${textMuted}; font-size: 0.8rem; font-weight: 600; margin-top: 3px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: ${accentColor}; font-size: 0.8rem; font-weight: 700; margin-top: 2px;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 16px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 14px 0;">
          <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${textMuted}; font-weight: 700; margin-bottom: 4px;">Expert Seminar / Keynote Lecture on</div>
          <h1 style="font-family: ${titleFont}; font-size: 1.65rem; font-weight: 900; color: ${textColor}; line-height: 1.25; margin: 4px 0;">
            ${title}
          </h1>
          ${theme ? `<div style="color: ${primaryColor}; font-size: 0.92rem; font-weight: 700; font-style: italic; margin-top: 3px;">"${theme}"</div>` : ''}
        </div>

        <!-- Multi-Speaker Container -->
        ${renderMultiSpeakerCardsHtml(persons, { isDark: false, accentColor: primaryColor, borderColor: boxBorderColor, cardBg, showPhoto: customDesign.showPhoto !== false, showProfile: customDesign.showProfile, speakerLayout: customDesign.speakerLayout, templateId: 'P03' })}

        <!-- Schedule / Venue Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px; background: ${cardBg}; padding: 14px; border-radius: 8px; border: 1px solid ${boxBorderColor}; text-align: center;">
          <div>
            <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">📅 Date</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${cleanDateStr}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">⏰ Time</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${time}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">📍 Venue</div>
            <div style="font-size: 0.82rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${venue}</div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // TEMPLATES P01 (Classic), P04 (Hands-On), P05 (Minimal Academic)
  // -------------------------------------------------------------------------
  return `
    <div style="background: ${bgColor}; color: ${textColor}; padding: 32px 28px; border-radius: 12px; border: 2.5px solid ${primaryColor}; font-family: ${bodyFont}; box-sizing: border-box; min-height: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
      ${headerHtml}

      <div style="text-align: center; margin: 12px 0;">
        <div style="color: ${primaryColor}; font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.8px;">
          DEPARTMENT OF ${department}
        </div>
        ${coOrganizedBy ? `<div style="color: ${textMuted}; font-size: 0.8rem; font-weight: 600; margin-top: 3px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
        ${inAssociationWith ? `<div style="color: ${accentColor}; font-size: 0.8rem; font-weight: 700; margin-top: 2px;">In Association with ${inAssociationWith}</div>` : ''}
      </div>

      ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

      <div style="text-align: center; margin: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 18px 0;">
        <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${textMuted}; font-weight: 700; margin-bottom: 4px;">Cordially Invites You to the</div>
        <h1 style="font-family: ${titleFont}; font-size: 1.65rem; font-weight: 900; color: ${textColor}; line-height: 1.25; margin: 6px 0;">
          ${title}
        </h1>
        ${theme ? `<div style="color: ${primaryColor}; font-size: 0.95rem; font-weight: 700; font-style: italic; margin-top: 4px;">Theme: "${theme}"</div>` : ''}
        ${description ? `<p style="color: ${textMuted}; font-size: 0.82rem; max-width: 85%; margin: 8px auto 0 auto; line-height: 1.4;">${description}</p>` : ''}
      </div>

      <!-- Multi-Speaker Container -->
      ${renderMultiSpeakerCardsHtml(persons, { isDark: false, accentColor: primaryColor, borderColor: boxBorderColor, cardBg, showPhoto: customDesign.showPhoto !== false, showProfile: customDesign.showProfile, speakerLayout: customDesign.speakerLayout })}

      <!-- Event Details Badges -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 18px; background: ${cardBg}; padding: 14px; border-radius: 8px; border: 1px solid ${boxBorderColor}; text-align: center;">
        <div>
          <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">📅 Date</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${cleanDateStr}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">⏰ Time</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${time}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: ${textMuted}; font-weight: 700; text-transform: uppercase;">📍 Venue</div>
          <div style="font-size: 0.82rem; font-weight: 800; color: ${textColor}; margin-top: 2px;">${venue}</div>
        </div>
      </div>
    </div>
  `;
};

