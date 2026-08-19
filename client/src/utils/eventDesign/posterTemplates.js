/**
 * SREC FIS V3.2 — Poster Templates (P01 — P05)
 * Professional academic poster designs with accredited typography, logo positioning,
 * deliberate template-aware speaker/chief-guest photo integration, and print-safe layouts.
 */

import { renderInstitutionalHeaderHtml } from './institutionalHeader.js';

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

export const renderPosterHtml = (templateId, eventData) => {
  const {
    title = 'National Seminar on Advanced Computing',
    theme = '',
    department = 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    coOrganizedBy = '',
    inAssociationWith = '',
    resourcePerson = 'Dr. A. Scientist',
    resDesignation = 'Senior Research Scientist',
    resOrganization = 'National Research Labs',
    fromDate = '2026-09-15',
    toDate = '',
    time = '10:00 AM - 01:00 PM',
    venue = 'Auditorium / Seminar Hall 1, SREC Campus',
    organizerLogo = '',
    associationLogo = '',
    eventLogo = '',
    resourcePersonPhoto = '',
    speakerPhoto = '',
    description = ''
  } = eventData || {};

  const photo = resourcePersonPhoto || speakerPhoto || '';
  const cleanDateStr = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;
  const isDark = templateId === 'P02';

  // Render header
  const headerHtml = renderInstitutionalHeaderHtml({ isDark, compact: false, showAddress: true });

  // Logos Row
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
      <div style="background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%); color: #f8fafc; padding: 32px 28px; border-radius: 12px; border: 2px solid #312e81; font-family: 'Inter', sans-serif; box-sizing: border-box; min-height: 600px; position: relative;">
        ${headerHtml}
        
        <div style="text-align: center; margin-top: 10px; margin-bottom: 14px;">
          <div style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-weight: 800; font-size: 0.8rem; padding: 4px 14px; border-radius: 20px; border: 1px solid #4f46e5; text-transform: uppercase; letter-spacing: 1px;">
            Organized by Department of ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: #94a3b8; font-size: 0.75rem; margin-top: 4px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: #38bdf8; font-size: 0.75rem; margin-top: 2px; font-weight: 600;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 24px 0;">
          <h1 style="font-size: 1.7rem; font-weight: 900; color: #ffffff; line-height: 1.25; margin: 0 0 8px 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            ${title}
          </h1>
          ${theme ? `<div style="color: #a5b4fc; font-size: 1rem; font-weight: 600; font-style: italic;">"${theme}"</div>` : ''}
          ${description ? `<p style="color: #cbd5e1; font-size: 0.82rem; max-width: 85%; margin: 10px auto 0 auto; line-height: 1.4;">${description}</p>` : ''}
        </div>

        <!-- Speaker Box -->
        <div style="background: rgba(30, 41, 59, 0.75); border: 1.5px solid #4338ca; border-radius: 12px; padding: 18px; margin: 20px 0; display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
          ${photo ? `
            <div style="flex-shrink: 0;">
              <img src="${photo}" alt="Speaker Photo" style="width: 105px; height: 105px; border-radius: 12px; object-fit: cover; border: 2.5px solid #10b981; box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);" />
            </div>
          ` : ''}
          <div style="text-align: ${photo ? 'left' : 'center'}; max-width: 420px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: #818cf8; font-weight: 800; margin-bottom: 4px;">Chief Guest / Resource Person</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; line-height: 1.2;">${resourcePerson}</div>
            ${resDesignation ? `<div style="font-size: 0.88rem; color: #cbd5e1; margin-top: 3px; font-weight: 500;">${resDesignation}</div>` : ''}
            ${resOrganization ? `<div style="font-size: 0.82rem; color: #94a3b8; margin-top: 2px;">${resOrganization}</div>` : ''}
          </div>
        </div>

        <!-- Schedule / Venue Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 20px; background: rgba(15, 23, 42, 0.8); padding: 14px; border-radius: 8px; border: 1px solid #334155; text-align: center;">
          <div>
            <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">📅 Date</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #38bdf8; margin-top: 2px;">${cleanDateStr}</div>
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
  // TEMPLATE P03: Seminar / Keynote Focus (PROMINENT Speaker Photo)
  // -------------------------------------------------------------------------
  if (templateId === 'P03') {
    return `
      <div style="background: #f8fafc; color: #0f172a; padding: 32px 28px; border-radius: 12px; border: 2.5px solid #0369a1; font-family: 'Inter', sans-serif; box-sizing: border-box; min-height: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
        ${headerHtml}

        <div style="text-align: center; margin: 12px 0;">
          <div style="color: #0369a1; font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.8px;">
            DEPARTMENT OF ${department}
          </div>
          ${coOrganizedBy ? `<div style="color: #64748b; font-size: 0.8rem; font-weight: 600; margin-top: 3px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
          ${inAssociationWith ? `<div style="color: #0284c7; font-size: 0.8rem; font-weight: 700; margin-top: 2px;">In Association with ${inAssociationWith}</div>` : ''}
        </div>

        ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

        <div style="text-align: center; margin: 16px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 14px 0;">
          <div style="font-size: 0.76rem; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 4px;">Expert Seminar / Keynote Lecture on</div>
          <h1 style="font-size: 1.65rem; font-weight: 900; color: #0f172a; line-height: 1.25; margin: 4px 0;">
            ${title}
          </h1>
          ${theme ? `<div style="color: #0369a1; font-size: 0.92rem; font-weight: 700; font-style: italic; margin-top: 3px;">"${theme}"</div>` : ''}
        </div>

        <!-- Prominent Keynote Speaker Spotlight -->
        <div style="background: #ffffff; border: 2px solid #bae6fd; border-radius: 14px; padding: 20px; margin: 18px 0; text-align: center; box-shadow: 0 4px 14px rgba(3, 105, 161, 0.08);">
          <div style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 3px 12px; border-radius: 12px; margin-bottom: 12px;">
            ★ KEYNOTE SPEAKER & RESOURCE PERSON ★
          </div>
          ${photo ? `
            <div style="margin-bottom: 12px;">
              <img src="${photo}" alt="Keynote Speaker" style="width: 135px; height: 135px; border-radius: 50%; object-fit: cover; border: 4px solid #0369a1; box-shadow: 0 8px 20px rgba(3, 105, 161, 0.25); display: inline-block;" />
            </div>
          ` : ''}
          <div style="font-size: 1.35rem; font-weight: 900; color: #0f172a; line-height: 1.25;">${resourcePerson}</div>
          ${resDesignation ? `<div style="font-size: 0.92rem; color: #0369a1; font-weight: 700; margin-top: 3px;">${resDesignation}</div>` : ''}
          ${resOrganization ? `<div style="font-size: 0.85rem; color: #475569; margin-top: 2px;">${resOrganization}</div>` : ''}
        </div>

        <!-- Schedule / Venue Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px; background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
          <div>
            <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">📅 Date</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${cleanDateStr}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">⏰ Time</div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${time}</div>
          </div>
          <div>
            <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">📍 Venue</div>
            <div style="font-size: 0.82rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${venue}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 22px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 0.8rem;">
          <div style="text-align: left;">
            <div style="font-weight: 800; color: #0f172a;">Faculty Coordinator</div>
            <div style="color: #64748b; font-size: 0.74rem;">Department of ${department}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 800; color: #0f172a;">Head of the Department</div>
            <div style="color: #64748b; font-size: 0.74rem;">Department of ${department}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; color: #0f172a;">Principal</div>
            <div style="color: #64748b; font-size: 0.74rem;">Sri Ramakrishna Engineering College</div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // TEMPLATES P01 (Classic), P04 (Hands-On), P05 (Minimal Academic)
  // -------------------------------------------------------------------------
  const primaryColor = templateId === 'P01' ? '#831843' : templateId === 'P04' ? '#0f766e' : '#1e293b';
  const lightBgColor = templateId === 'P01' ? '#fdf2f8' : templateId === 'P04' ? '#f0fdfa' : '#ffffff';
  const boxBorderColor = templateId === 'P01' ? '#fbcfe8' : templateId === 'P04' ? '#99f6e4' : '#cbd5e1';

  return `
    <div style="background: ${lightBgColor}; color: #0f172a; padding: 32px 28px; border-radius: 12px; border: 2.5px solid ${primaryColor}; font-family: 'Inter', sans-serif; box-sizing: border-box; min-height: 600px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
      ${headerHtml}

      <div style="text-align: center; margin: 12px 0;">
        <div style="color: ${primaryColor}; font-weight: 800; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.8px;">
          DEPARTMENT OF ${department}
        </div>
        ${coOrganizedBy ? `<div style="color: #64748b; font-size: 0.8rem; font-weight: 600; margin-top: 3px;">In Collaboration with ${coOrganizedBy}</div>` : ''}
        ${inAssociationWith ? `<div style="color: #0284c7; font-size: 0.8rem; font-weight: 700; margin-top: 2px;">In Association with ${inAssociationWith}</div>` : ''}
      </div>

      ${(organizerLogo || eventLogo || associationLogo) ? logosHtml : ''}

      <div style="text-align: center; margin: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 18px 0;">
        <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 4px;">Cordially Invites You to the</div>
        <h1 style="font-size: 1.65rem; font-weight: 900; color: #0f172a; line-height: 1.25; margin: 6px 0;">
          ${title}
        </h1>
        ${theme ? `<div style="color: ${primaryColor}; font-size: 0.95rem; font-weight: 700; font-style: italic; margin-top: 4px;">Theme: "${theme}"</div>` : ''}
        ${description ? `<p style="color: #475569; font-size: 0.82rem; max-width: 85%; margin: 8px auto 0 auto; line-height: 1.4;">${description}</p>` : ''}
      </div>

      <!-- Chief Guest Box -->
      <div style="background: #ffffff; border: 1.5px solid ${boxBorderColor}; border-radius: 10px; padding: 16px; margin: 18px 0; display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap;">
        ${photo ? `
          <div style="flex-shrink: 0;">
            <img src="${photo}" alt="Resource Person" style="width: 100px; height: 100px; border-radius: ${templateId === 'P04' ? '10px' : '50%'}; object-fit: cover; border: 3px solid ${primaryColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
          </div>
        ` : ''}
        <div style="text-align: ${photo ? 'left' : 'center'}; max-width: 420px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.5px; color: ${primaryColor}; font-weight: 800; margin-bottom: 4px;">Resource Person / Chief Guest</div>
          <div style="font-size: 1.22rem; font-weight: 900; color: #0f172a; line-height: 1.2;">${resourcePerson}</div>
          ${resDesignation ? `<div style="font-size: 0.88rem; color: #334155; font-weight: 600; margin-top: 2px;">${resDesignation}</div>` : ''}
          ${resOrganization ? `<div style="font-size: 0.82rem; color: #64748b; margin-top: 1px;">${resOrganization}</div>` : ''}
        </div>
      </div>

      <!-- Event Details Badges -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 18px; background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
        <div>
          <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">📅 Date</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${cleanDateStr}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">⏰ Time</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${time}</div>
        </div>
        <div>
          <div style="font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase;">📍 Venue</div>
          <div style="font-size: 0.82rem; font-weight: 800; color: #0f172a; margin-top: 2px;">${venue}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 0.8rem;">
        <div style="text-align: left;">
          <div style="font-weight: 800; color: #0f172a;">Faculty Coordinator</div>
          <div style="color: #64748b; font-size: 0.74rem;">Department of ${department}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: #0f172a;">Principal</div>
          <div style="color: #64748b; font-size: 0.74rem;">Sri Ramakrishna Engineering College</div>
        </div>
      </div>
    </div>
  `;
};
