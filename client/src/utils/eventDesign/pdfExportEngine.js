/**
 * SREC FIS V3.2 — PDF & Image Export Engine
 * Vector PDF generation using jsPDF for Posters, Invitations, and Bulk Participation Certificates.
 */

import { jsPDF } from 'jspdf';
import * as jspdfModule from 'jspdf';
import { INSTITUTIONAL_INFO } from './institutionalHeader.js';
import { normalizeEventPersons } from './designPresets.js';

/**
 * Universal jsPDF Constructor Resolver for Vite and Node.js
 */
const createJsPdf = (options) => {
  const Constructor = typeof jsPDF === 'function' ? jsPDF : (jspdfModule.jsPDF || jspdfModule.default);
  return new Constructor(options);
};

/**
 * Helper to wrap text cleanly within a bounding width in jsPDF
 */
const splitText = (doc, text, maxWidth) => {
  return doc.splitTextToSize(String(text || ''), maxWidth);
};

// =========================================================================
// 1. POSTER PDF GENERATOR (A4 Portrait - 210 x 297 mm)
// =========================================================================
export const generatePosterPdf = (templateId, eventData) => {
  const doc = createJsPdf({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

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
  const cleanDate = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;

  // Background / Border styling
  if (templateId === 'P02') {
    // Dark Slate Background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(99, 102, 241); // #6366f1
    doc.setLineWidth(1.2);
    doc.roundedRect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 4, 4, 'S');
    doc.setTextColor(248, 250, 252);
  } else {
    // Light Academic Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(templateId === 'P01' ? 131 : templateId === 'P04' ? 15 : 30, templateId === 'P01' ? 24 : templateId === 'P04' ? 118 : 58, templateId === 'P01' ? 67 : templateId === 'P04' ? 110 : 138); // Maroon, Teal, or Navy
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');
    doc.setTextColor(15, 23, 42);
  }

  let y = margin + 12;

  // Institutional Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  if (templateId === 'P02') doc.setTextColor(255, 255, 255);
  else doc.setTextColor(30, 58, 138);
  doc.text(INSTITUTIONAL_INFO.collegeName, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // Gold
  doc.text(INSTITUTIONAL_INFO.collegeType, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(templateId === 'P02' ? 203 : 100, templateId === 'P02' ? 213 : 116, templateId === 'P02' ? 225 : 139);
  doc.text(INSTITUTIONAL_INFO.affiliations, pageWidth / 2, y, { align: 'center' });

  y += 3.5;
  doc.setFontSize(7);
  doc.text(INSTITUTIONAL_INFO.address, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  // Department banner
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  if (templateId === 'P02') doc.setTextColor(129, 140, 248);
  else doc.setTextColor(templateId === 'P01' ? 131 : 3, templateId === 'P01' ? 24 : 105, templateId === 'P01' ? 67 : 161);
  doc.text(`DEPARTMENT OF ${department.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });

  if (coOrganizedBy) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`In Collaboration with ${coOrganizedBy}`, pageWidth / 2, y, { align: 'center' });
  }

  if (inAssociationWith) {
    y += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(2, 132, 199);
    doc.text(`In Association with ${inAssociationWith}`, pageWidth / 2, y, { align: 'center' });
  }

  // Invitation subtitle
  y += 9;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(templateId === 'P02' ? 203 : 71, templateId === 'P02' ? 213 : 85, templateId === 'P02' ? 225 : 105);
  doc.text(templateId === 'P03' ? 'Expert Seminar / Keynote Lecture on' : 'Cordially invites you to the', pageWidth / 2, y, { align: 'center' });

  // Event Title Box
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(templateId === 'P02' ? 255 : 15, templateId === 'P02' ? 255 : 23, templateId === 'P02' ? 255 : 42);
  const titleLines = splitText(doc, title, pageWidth - margin * 2 - 20);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 7.5;

  if (theme) {
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(9.5);
    doc.setTextColor(templateId === 'P02' ? 165 : 180, templateId === 'P02' ? 180 : 83, templateId === 'P02' ? 252 : 9);
    doc.text(`Theme: "${theme}"`, pageWidth / 2, y, { align: 'center' });
    y += 6.5;
  }

  if (description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(templateId === 'P02' ? 203 : 71, templateId === 'P02' ? 213 : 85, templateId === 'P02' ? 225 : 105);
    const descLines = splitText(doc, description, pageWidth - margin * 2 - 30);
    doc.text(descLines, pageWidth / 2, y, { align: 'center' });
    y += descLines.length * 4.2;
  }

  // Chief Guest / Dignitaries / Speaker Section
  y += 5;
  const persons = normalizeEventPersons(eventData);
  const pCount = persons.length;
  const totalBoxWidth = pageWidth - margin * 2 - 20;
  const startX = margin + 10;

  if (pCount === 1) {
    const p = persons[0];
    const pPhoto = p.photo || '';
    const boxHeight = pPhoto && templateId === 'P03' ? 52 : pPhoto ? 38 : 34;

    doc.setFillColor(templateId === 'P02' ? 30 : 248, templateId === 'P02' ? 41 : 250, templateId === 'P02' ? 59 : 252);
    doc.setDrawColor(templateId === 'P02' ? 67 : 203, templateId === 'P02' ? 56 : 213, templateId === 'P02' ? 202 : 225);
    doc.setLineWidth(0.8);
    doc.roundedRect(startX, y, totalBoxWidth, boxHeight, 3, 3, 'FD');

    if (pPhoto && templateId === 'P03') {
      const photoSize = 24;
      try { doc.addImage(pPhoto, 'JPEG', pageWidth / 2 - photoSize / 2, y + 4, photoSize, photoSize); } catch (e) {}
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text('★ KEYNOTE SPEAKER & RESOURCE PERSON ★', pageWidth / 2, y + 33, { align: 'center' });
      doc.setFontSize(12.5);
      doc.setTextColor(templateId === 'P02' ? 255 : 15, templateId === 'P02' ? 255 : 23, templateId === 'P02' ? 255 : 42);
      doc.text(p.name, pageWidth / 2, y + 40, { align: 'center' });
      if (p.designation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(templateId === 'P02' ? 203 : 3, templateId === 'P02' ? 213 : 105, templateId === 'P02' ? 225 : 161);
        doc.text(p.designation, pageWidth / 2, y + 45, { align: 'center' });
      }
      if (p.organization) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(p.organization, pageWidth / 2, y + 49, { align: 'center' });
      }
    } else if (pPhoto) {
      const photoSize = 24;
      try { doc.addImage(pPhoto, 'JPEG', startX + 8, y + (boxHeight - photoSize) / 2, photoSize, photoSize); } catch (e) {}
      const textCenterX = startX + photoSize + (totalBoxWidth - photoSize - 8) / 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      doc.text((p.role || 'RESOURCE PERSON / CHIEF GUEST').toUpperCase(), textCenterX, y + 8, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(templateId === 'P02' ? 255 : 15, templateId === 'P02' ? 255 : 23, templateId === 'P02' ? 255 : 42);
      doc.text(p.name, textCenterX, y + 16, { align: 'center' });
      if (p.designation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(templateId === 'P02' ? 203 : 51, templateId === 'P02' ? 213 : 65, templateId === 'P02' ? 225 : 85);
        doc.text(p.designation, textCenterX, y + 23, { align: 'center' });
      }
      if (p.organization) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(templateId === 'P02' ? 148 : 100, templateId === 'P02' ? 163 : 116, templateId === 'P02' ? 184 : 139);
        doc.text(p.organization, textCenterX, y + 29, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text((p.role || 'RESOURCE PERSON / CHIEF GUEST').toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });
      doc.setFontSize(12.5);
      doc.setTextColor(templateId === 'P02' ? 255 : 15, templateId === 'P02' ? 255 : 23, templateId === 'P02' ? 255 : 42);
      doc.text(p.name, pageWidth / 2, y + 16, { align: 'center' });
      if (p.designation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(templateId === 'P02' ? 203 : 51, templateId === 'P02' ? 213 : 65, templateId === 'P02' ? 225 : 85);
        doc.text(p.designation, pageWidth / 2, y + 23, { align: 'center' });
      }
      if (p.organization) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(templateId === 'P02' ? 148 : 100, templateId === 'P02' ? 163 : 116, templateId === 'P02' ? 184 : 139);
        doc.text(p.organization, pageWidth / 2, y + 29, { align: 'center' });
      }
    }
    y += boxHeight + 8;
  } else {
    // Multi-Speaker Grid Layout
    const cols = pCount === 2 ? 2 : pCount === 3 ? 3 : pCount === 4 ? 2 : 3;
    const cardGap = 4;
    const cardW = (totalBoxWidth - (cols - 1) * cardGap) / cols;
    const cardH = pCount <= 4 ? 32 : 26;
    const rows = Math.ceil(pCount / cols);

    for (let i = 0; i < pCount; i++) {
      const p = persons[i];
      const colIdx = i % cols;
      const rowIdx = Math.floor(i / cols);
      const cX = startX + colIdx * (cardW + cardGap);
      const cY = y + rowIdx * (cardH + cardGap);

      doc.setFillColor(templateId === 'P02' ? 30 : 248, templateId === 'P02' ? 41 : 250, templateId === 'P02' ? 59 : 252);
      doc.setDrawColor(templateId === 'P02' ? 67 : 203, templateId === 'P02' ? 56 : 213, templateId === 'P02' ? 202 : 225);
      doc.setLineWidth(0.6);
      doc.roundedRect(cX, cY, cardW, cardH, 2, 2, 'FD');

      const pPhoto = p.photo || '';
      let textOffset = cX + cardW / 2;
      if (pPhoto) {
        const pSize = Math.min(18, cardH - 6);
        try { doc.addImage(pPhoto, 'JPEG', cX + 3, cY + 3, pSize, pSize); } catch (e) {}
        textOffset = cX + pSize + (cardW - pSize - 3) / 2;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(180, 83, 9);
      doc.text((p.role || 'RESOURCE PERSON').toUpperCase(), textOffset, cY + 6, { align: 'center' });

      doc.setFontSize(pCount <= 3 ? 9.5 : 8.5);
      doc.setTextColor(templateId === 'P02' ? 255 : 15, templateId === 'P02' ? 255 : 23, templateId === 'P02' ? 255 : 42);
      doc.text(p.name || 'Dignitary', textOffset, cY + 12, { align: 'center' });

      if (p.designation) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(templateId === 'P02' ? 203 : 51, templateId === 'P02' ? 213 : 65, templateId === 'P02' ? 225 : 85);
        doc.text(splitText(doc, p.designation, cardW - 8)[0] || '', textOffset, cY + 17, { align: 'center' });
      }

      if (p.organization) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(templateId === 'P02' ? 148 : 100, templateId === 'P02' ? 163 : 116, templateId === 'P02' ? 184 : 139);
        doc.text(splitText(doc, p.organization, cardW - 8)[0] || '', textOffset, cY + 21, { align: 'center' });
      }
    }
    y += rows * (cardH + cardGap) + 6;
  }

  // Date, Time, Venue Badges
  const badgeWidth = (pageWidth - margin * 2 - 28) / 3;
  const b1X = margin + 10;
  const b2X = b1X + badgeWidth + 4;
  const b3X = b2X + badgeWidth + 4;
  const badgeH = 22;

  // Badge 1: Date
  doc.setFillColor(templateId === 'P02' ? 15 : 241, templateId === 'P02' ? 23 : 245, templateId === 'P02' ? 42 : 249);
  doc.roundedRect(b1X, y, badgeWidth, badgeH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DATE', b1X + badgeWidth / 2, y + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(templateId === 'P02' ? 56 : 15, templateId === 'P02' ? 189 : 23, templateId === 'P02' ? 248 : 42);
  doc.text(cleanDate, b1X + badgeWidth / 2, y + 15, { align: 'center' });

  // Badge 2: Time
  doc.setFillColor(templateId === 'P02' ? 15 : 241, templateId === 'P02' ? 23 : 245, templateId === 'P02' ? 42 : 249);
  doc.roundedRect(b2X, y, badgeWidth, badgeH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TIME', b2X + badgeWidth / 2, y + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(templateId === 'P02' ? 251 : 15, templateId === 'P02' ? 191 : 23, templateId === 'P02' ? 36 : 42);
  doc.text(time, b2X + badgeWidth / 2, y + 15, { align: 'center' });

  // Badge 3: Venue
  doc.setFillColor(templateId === 'P02' ? 15 : 241, templateId === 'P02' ? 23 : 245, templateId === 'P02' ? 42 : 249);
  doc.roundedRect(b3X, y, badgeWidth, badgeH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VENUE', b3X + badgeWidth / 2, y + 6, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(templateId === 'P02' ? 74 : 15, templateId === 'P02' ? 222 : 23, templateId === 'P02' ? 128 : 42);
  const venueLines = splitText(doc, venue, badgeWidth - 4);
  doc.text(venueLines, b3X + badgeWidth / 2, y + 13, { align: 'center' });

  return doc;
};

// =========================================================================
// 2. INVITATION PDF GENERATOR (A4 Portrait)
// =========================================================================
export const generateInvitationPdf = (templateId, eventData) => {
  const doc = createJsPdf({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const {
    title = 'Inaugural Function & Expert Lecture',
    theme = '',
    department = 'DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    coOrganizedBy = '',
    inAssociationWith = '',
    resourcePerson = 'Dr. K. Sundar',
    resDesignation = 'Director of Technology',
    resOrganization = 'Tech Innovations Ltd',
    fromDate = '2026-09-20',
    toDate = '',
    time = '10:30 AM',
    venue = 'Auditorium, SREC Campus',
    presidedBy = 'Dr. N. R. Alamelu, Principal',
    resourcePersonPhoto = '',
    speakerPhoto = ''
  } = eventData || {};

  const photo = resourcePersonPhoto || speakerPhoto || '';
  const cleanDate = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate;

  // Double Border
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setDrawColor(180, 83, 9); // Gold
  doc.setLineWidth(1.8);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');
  doc.setLineWidth(0.6);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - margin * 2 - 5, pageHeight - margin * 2 - 5, 'S');

  let y = margin + 14;

  // Institutional Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text(INSTITUTIONAL_INFO.collegeName, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text(INSTITUTIONAL_INFO.collegeType, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(INSTITUTIONAL_INFO.affiliations, pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, y, pageWidth - margin - 10, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`DEPARTMENT OF ${department.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });

  if (coOrganizedBy) {
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Jointly with ${coOrganizedBy}`, pageWidth / 2, y, { align: 'center' });
  }

  if (inAssociationWith) {
    y += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(2, 132, 199);
    doc.text(`In Association with ${inAssociationWith}`, pageWidth / 2, y, { align: 'center' });
  }

  y += 11;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Cordially invites you to the formal inaugural session of', pageWidth / 2, y, { align: 'center' });

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.setTextColor(15, 23, 42);
  const titleLines = splitText(doc, title, pageWidth - margin * 2 - 24);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 7.5;

    const persons = normalizeEventPersons(eventData);
    const pCount = persons.length;
    const totalBoxWidth = pageWidth - margin * 2 - 20;
    const startX = margin + 10;

    if (pCount === 1) {
      const p = persons[0];
      const pPhoto = p.photo || '';
      const citationH = pPhoto && templateId === 'I02' ? 50 : pPhoto ? 38 : 35;

      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.8);
      doc.roundedRect(startX, y, totalBoxWidth, citationH, 2, 2, 'FD');

      if (pPhoto && templateId === 'I02') {
        const photoSize = 23;
        try { doc.addImage(pPhoto, 'JPEG', pageWidth / 2 - photoSize / 2, y + 3, photoSize, photoSize); } catch (e) {}
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(131, 24, 67);
        doc.text('CHIEF GUEST & KEYNOTE SPEAKER', pageWidth / 2, y + 31, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(p.name, pageWidth / 2, y + 38, { align: 'center' });
        if (p.designation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(p.designation, pageWidth / 2, y + 43, { align: 'center' });
        }
        if (p.organization) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(p.organization, pageWidth / 2, y + 47, { align: 'center' });
        }
      } else if (pPhoto) {
        const photoSize = 22;
        try { doc.addImage(pPhoto, 'JPEG', startX + 8, y + (citationH - photoSize) / 2, photoSize, photoSize); } catch (e) {}
        const textCenterX = startX + photoSize + (totalBoxWidth - photoSize - 8) / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9);
        doc.text((p.role || 'CHIEF GUEST & KEYNOTE SPEAKER').toUpperCase(), textCenterX, y + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(p.name, textCenterX, y + 16, { align: 'center' });
        if (p.designation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(p.designation, textCenterX, y + 22, { align: 'center' });
        }
        if (p.organization) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(p.organization, textCenterX, y + 27, { align: 'center' });
        }
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text((p.role || 'CHIEF GUEST & KEYNOTE SPEAKER').toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(p.name, pageWidth / 2, y + 16, { align: 'center' });
        if (p.designation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(p.designation, pageWidth / 2, y + 22, { align: 'center' });
        }
        if (p.organization) {
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(p.organization, pageWidth / 2, y + 27, { align: 'center' });
        }
      }
      y += citationH + 7;
    } else {
      // Multi-dignitary layout in Invitation PDF
      const cols = pCount === 2 ? 2 : pCount === 3 ? 3 : pCount === 4 ? 2 : 3;
      const cardGap = 4;
      const cardW = (totalBoxWidth - (cols - 1) * cardGap) / cols;
      const cardH = pCount <= 4 ? 30 : 25;
      const rows = Math.ceil(pCount / cols);

      for (let i = 0; i < pCount; i++) {
        const p = persons[i];
        const colIdx = i % cols;
        const rowIdx = Math.floor(i / cols);
        const cX = startX + colIdx * (cardW + cardGap);
        const cY = y + rowIdx * (cardH + cardGap);

        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.6);
        doc.roundedRect(cX, cY, cardW, cardH, 2, 2, 'FD');

        const pPhoto = p.photo || '';
        let textOffset = cX + cardW / 2;
        if (pPhoto) {
          const pSize = Math.min(16, cardH - 6);
          try { doc.addImage(pPhoto, 'JPEG', cX + 3, cY + 3, pSize, pSize); } catch (e) {}
          textOffset = cX + pSize + (cardW - pSize - 3) / 2;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(180, 83, 9);
        doc.text((p.role || 'RESOURCE PERSON').toUpperCase(), textOffset, cY + 6, { align: 'center' });

        doc.setFontSize(pCount <= 3 ? 9 : 8);
        doc.setTextColor(15, 23, 42);
        doc.text(p.name || 'Dignitary', textOffset, cY + 12, { align: 'center' });

        if (p.designation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(51, 65, 85);
          doc.text(splitText(doc, p.designation, cardW - 8)[0] || '', textOffset, cY + 17, { align: 'center' });
        }

        if (p.organization) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(splitText(doc, p.organization, cardW - 8)[0] || '', textOffset, cY + 21, { align: 'center' });
        }
      }
      y += rows * (cardH + cardGap) + 6;
    }

  // Presided Over By
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PRESIDED OVER BY', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(presidedBy, pageWidth / 2, y, { align: 'center' });

  y += 11;

  // Date, Time, Venue
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(startX, y, totalBoxWidth, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Date: ${cleanDate}   |   Time: ${time}   |   Venue: ${venue}`, pageWidth / 2, y + 9, { align: 'center' });

  return doc;
};

// =========================================================================
// 3. SINGLE CERTIFICATE PDF (A4 Landscape - 297 x 210 mm)
// =========================================================================
export const renderSingleCertificatePage = (doc, templateId, certData, isNewPage = false) => {
  if (isNewPage) {
    doc.addPage('a4', 'landscape');
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

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
  } = certData || {};

  // Resolve the 3 Institutional Signatories
  const facCoordName = signatories.facultyCoordinator?.name || certData?.facultyCoordinatorName || certData?.facultyName || 'Dr. Faculty Coordinator';
  const facCoordDesg = signatories.facultyCoordinator?.designation || certData?.facultyCoordinatorDesignation || 'Faculty Coordinator';

  const hodName = signatories.hod?.name || certData?.hodName || 'Head of the Department';
  const hodDesg = signatories.hod?.designation || certData?.hodDesignation || 'Professor & Head';

  const principalName = signatories.principal?.name || certData?.principalName || 'Dr. N. R. Alamelu';
  const principalDesg = signatories.principal?.designation || certData?.principalDesignation || 'Principal';

  const cleanDateStr = toDate && toDate !== fromDate ? `from ${fromDate} to ${toDate}` : `on ${fromDate}`;

  // Certificate Outer & Inner Borders
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setDrawColor(180, 83, 9); // Gold
  doc.setLineWidth(2.2);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2, 'S');

  doc.setDrawColor(30, 58, 138); // Navy
  doc.setLineWidth(0.8);
  doc.rect(margin + 2.5, margin + 2.5, pageWidth - margin * 2 - 5, pageHeight - margin * 2 - 5, 'S');

  let y = margin + 14;

  // Institutional Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text(INSTITUTIONAL_INFO.collegeName, pageWidth / 2, y, { align: 'center' });

  y += 5.5;
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text(INSTITUTIONAL_INFO.collegeType, pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(INSTITUTIONAL_INFO.affiliations, pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`DEPARTMENT OF ${department.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });

  // Certificate Title
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(180, 83, 9);
  doc.text('CERTIFICATE OF PARTICIPATION', pageWidth / 2, y, { align: 'center' });

  y += 12;
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text('This is to certify that', pageWidth / 2, y, { align: 'center' });

  // Participant Name (Highlighted & Underlined)
  y += 10;
  doc.setFont('times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42);
  doc.text(participantName, pageWidth / 2, y, { align: 'center' });
  const nameWidth = doc.getTextWidth(participantName);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - nameWidth / 2 - 2, y + 1.5, pageWidth / 2 + nameWidth / 2 + 2, y + 1.5);

  // Participant Body Paragraph
  y += 10;
  doc.setFont('times', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(51, 65, 85);

  const certBody = `${designation ? designation + ', ' : ''}${organization ? organization + ', ' : ''}has actively participated in the ${eventType || 'Event'} on "${eventTitle}" organized by the Department of ${department}, Sri Ramakrishna Engineering College, Coimbatore ${cleanDateStr}.`;
  const bodyLines = splitText(doc, certBody, pageWidth - margin * 2 - 36);
  doc.text(bodyLines, pageWidth / 2, y, { align: 'center' });

  // Signatures Footer (3 Institutional Signatories)
  const footerY = pageHeight - margin - 22;
  const sigColW = (pageWidth - margin * 2 - 30) / 3;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);

  // Position 1: Faculty Coordinator
  const s1CenterX = margin + 15 + (sigColW - 10) / 2;
  doc.line(margin + 15, footerY, margin + 15 + sigColW - 10, footerY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Faculty Coordinator', s1CenterX, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(facCoordName, s1CenterX, footerY + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(facCoordDesg, s1CenterX, footerY + 12.5, { align: 'center' });

  // Position 2: HOD
  const s2X = margin + 15 + sigColW + 5;
  const s2CenterX = s2X + (sigColW - 10) / 2;
  doc.line(s2X, footerY, s2X + sigColW - 10, footerY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('HOD', s2CenterX, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(hodName, s2CenterX, footerY + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(hodDesg, s2CenterX, footerY + 12.5, { align: 'center' });

  // Position 3: Principal
  const s3X = margin + 15 + sigColW * 2 + 10;
  const s3CenterX = s3X + (sigColW - 10) / 2;
  doc.line(s3X, footerY, s3X + sigColW - 10, footerY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Principal', s3CenterX, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(principalName, s3CenterX, footerY + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(principalDesg, s3CenterX, footerY + 12.5, { align: 'center' });

  // Certificate Verification Code
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate No: ${certificateNumber}`, margin + 6, pageHeight - margin - 4);
};

export const generateSingleCertificatePdf = (templateId, certificateData) => {
  const doc = createJsPdf({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  renderSingleCertificatePage(doc, templateId, certificateData, false);
  return doc;
};

// =========================================================================
// 4. COMBINED MULTI-PAGE CERTIFICATES PDF
// =========================================================================
export const generateCombinedCertificatesPdf = (templateId, participants, eventData) => {
  const doc = createJsPdf({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  participants.forEach((p, idx) => {
    const certNumber = p.certificateNumber || `SREC/${(eventData.departmentCode || 'GEN')}/${new Date().getFullYear()}/EVT/${String(idx + 1).padStart(3, '0')}`;
    const certPayload = {
      participantName: p.name,
      designation: p.designation,
      organization: p.organization,
      eventTitle: eventData.title,
      eventType: eventData.type,
      department: eventData.department,
      fromDate: eventData.fromDate,
      toDate: eventData.toDate,
      certificateNumber: certNumber,
      signatories: eventData.signatories || {}
    };

    renderSingleCertificatePage(doc, templateId, certPayload, idx > 0);
  });

  return doc;
};

// =========================================================================
// 5. EVENT PACKAGE SUMMARY PDF GENERATOR (A4 Portrait)
// =========================================================================
export const generateEventSummaryPdf = (summaryData = {}) => {
  const doc = createJsPdf({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const {
    title = 'National Event',
    type = 'Workshop',
    department = 'Department of Computer Science and Engineering',
    coOrganizedBy = '',
    inAssociationWith = '',
    fromDate = '',
    toDate = '',
    time = '',
    venue = '',
    resourcePerson = '',
    resDesignation = '',
    resOrganization = '',
    posterTemplate = 'P01',
    invitationTemplate = 'I01',
    certificateTemplate = 'C01',
    participantCount = 0,
    certRangeStart = '',
    certRangeEnd = '',
    generatedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    facultyCoordinator = '',
    hod = '',
    principal = ''
  } = summaryData;

  const dateStr = toDate && toDate !== fromDate ? `${fromDate} to ${toDate}` : fromDate || 'N/A';

  // Page Border
  doc.setDrawColor(30, 58, 138); // Navy
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 3, 3, 'S');

  // Institutional Header
  let y = margin + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text(INSTITUTIONAL_INFO.collegeName, pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Gold
  doc.text(INSTITUTIONAL_INFO.collegeType, pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${INSTITUTIONAL_INFO.affiliations} | ${INSTITUTIONAL_INFO.address}`, pageWidth / 2, y, { align: 'center' });

  // Divider Line
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  // Document Title Banner
  y += 8;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + 6, y - 4, contentWidth - 12, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('COMPLETE EVENT DESIGN & EXECUTION PACKAGE SUMMARY', pageWidth / 2, y + 2.5, { align: 'center' });

  // Section 1: Event Information Card
  y += 12;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 6, y, contentWidth - 12, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('1. EVENT OVERVIEW & LOGISTICS', margin + 10, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Event Title:', margin + 10, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(String(title), contentWidth - 45);
  doc.text(titleLines, margin + 35, y + 13);

  const offsetY = Math.max(14, titleLines.length * 4 + 2);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Category / Type:', margin + 10, y + offsetY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(type || 'Event'), margin + 38, y + offsetY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Organizing Dept:', margin + 10, y + offsetY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(department), margin + 38, y + offsetY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date & Time:', margin + 10, y + offsetY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${dateStr} | ${time || 'Scheduled Hours'}`, margin + 38, y + offsetY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Venue:', margin + 10, y + offsetY + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(venue || 'SREC Campus'), margin + 38, y + offsetY + 24);

  // Section 2: Resource Person / Chief Guest
  y += offsetY + 32;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 6, y, contentWidth - 12, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('2. RESOURCE PERSON / CHIEF GUEST DETAILS', margin + 10, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Resource Person:', margin + 10, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(resourcePerson || 'Invited Domain Expert'), margin + 40, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Designation:', margin + 10, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(resDesignation || 'Resource Person'), margin + 40, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Organization:', margin + 10, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(resOrganization || 'Institutional / Industry Affiliate'), margin + 40, y + 23);

  // Section 3: Design Package Specifications & Templates
  y += 34;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 6, y, contentWidth - 12, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('3. DESIGN PACKAGE SPECIFICATIONS & CERTIFICATE AUDIT', margin + 10, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Poster Template:', margin + 10, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${posterTemplate} (A4 Print Portrait)`, margin + 45, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Invitation Template:', margin + 10, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${invitationTemplate} (Formal Card Portrait)`, margin + 45, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Certificate Template:', margin + 10, y + 23);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${certificateTemplate} (A4 Landscape)`, margin + 45, y + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Participants Certified:', margin + 10, y + 28);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${participantCount} Candidates`, margin + 45, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Certificate Serial Range:', margin + 10, y + 33);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const rangeStr = certRangeStart && certRangeEnd ? `${certRangeStart} — ${certRangeEnd}` : (certRangeStart || 'Generated on-demand');
  doc.text(rangeStr, margin + 45, y + 33);

  // Section 4: Package Contents Checklist
  y += 44;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 6, y, contentWidth - 12, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('4. PACKAGE ARTIFACTS INCLUDED IN BUNDLE', margin + 10, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('[✓] 01_Poster.pdf                      - High-Resolution Vector Print Poster', margin + 10, y + 12);
  doc.text('[✓] 02_Invitation.pdf                  - Formal Dignitary Invitation Card', margin + 10, y + 16);
  doc.text(`[✓] 03_Certificates/                   - Directory of ${participantCount} Individual Participant Certificates`, margin + 10, y + 20);
  doc.text('[✓] 04_Combined_Certificates.pdf      - Multi-Page Merged Print-Ready Document', margin + 10, y + 24);
  doc.text('[✓] 05_Event_Summary.pdf              - Formal Institutional Documentation Sheet', margin + 10, y + 28);

  // Footer / Institutional Signatories
  y = pageHeight - margin - 22;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 6, y, pageWidth - margin - 6, y);

  y += 8;
  const colWidth = (contentWidth - 12) / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  // Signatory 1: Faculty Coordinator
  doc.text('Faculty Coordinator', margin + 10, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(facultyCoordinator || 'Organizing Faculty', margin + 10, y + 4);

  // Signatory 2: HOD
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Head of the Department', margin + 10 + colWidth, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(hod || 'Department Head', margin + 10 + colWidth, y + 4);

  // Signatory 3: Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Principal', margin + 10 + colWidth * 2, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(principal || 'SREC Coimbatore', margin + 10 + colWidth * 2, y + 4);

  // Timestamp & Verification Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${generatedDate} | SREC FIS Event Design & Certificate Suite V3.2.1`, pageWidth / 2, pageHeight - margin - 2, { align: 'center' });

  return doc;
};
