/**
 * SREC FIS V3.2.2 — High-Resolution PNG & Multi-Format Social Media Export Engine
 * Generates crisp 300 DPI PNGs and social media preset graphics directly from vector layouts.
 */

import JSZip from 'jszip';
import { SOCIAL_PRESETS, THEMES, APPROVED_FONTS, calculateSmartLayout, generateQRCodeSVG } from './designPresets.js';

/**
 * Downloads a binary Blob as a file in the browser
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/**
 * Renders an SVG string to a high-resolution Canvas and returns a PNG Blob
 */
export const svgToPngBlob = (svgString, width, height) => {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          return reject(new Error('Canvas 2D context unavailable'));
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(blobUrl);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            resolve(pngBlob);
          } else {
            reject(new Error('Failed to create PNG blob from canvas'));
          }
        }, 'image/png', 0.95);
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to load SVG into Image for PNG conversion'));
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Export high-resolution PNG for Poster / Invitation / Certificate
 */
export const exportHighResPng = async (svgString, filename = 'SREC_Design.png', width = 1080, height = 1350) => {
  const blob = await svgToPngBlob(svgString, width, height);
  downloadBlob(blob, filename);
  return blob;
};

/**
 * Export Social Media Pack (ZIP containing all 8 standard social sizes)
 */
export const exportSocialMediaPackZip = async (eventData, templateId = 'P01', themeId = 'institutional_default', customDesign = {}) => {
  const zip = new JSZip();
  const safeTitle = (eventData.event_title || 'SREC_Event').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);

  const manifest = {
    institution: 'Sri Ramakrishna Engineering College',
    eventTitle: eventData.event_title,
    department: eventData.department,
    generatedAt: new Date().toISOString(),
    files: []
  };

  for (const [key, preset] of Object.entries(SOCIAL_PRESETS)) {
    // Generate vector SVG for this preset
    const theme = {
      ...(THEMES[themeId] || THEMES.institutional_default),
      ...(customDesign.colors || {})
    };
    const layout = calculateSmartLayout(eventData, customDesign, { width: preset.width, height: preset.height });

    // SVG string
    const eventTitle = (eventData.event_title || 'Institutional Event').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const speakerName = (eventData.resource_person || eventData.chief_guest || 'Eminent Speaker').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const deptName = (eventData.department || 'SRI RAMAKRISHNA ENGINEERING COLLEGE').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const dateVenue = `${eventData.date || 'TBA'} | ${eventData.venue || 'Auditorium'}`.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

    let qrBlock = '';
    if (customDesign.qr && customDesign.qr.enabled && customDesign.qr.url) {
      const qrSvg = generateQRCodeSVG(customDesign.qr.url, { size: 120, fgColor: theme.primary, bgColor: '#FFFFFF' });
      const qrX = preset.width - layout.marginX - 130;
      const qrY = preset.height - layout.marginY - 160;
      const qrCaption = (customDesign.qr.caption || 'Scan to Register').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
      qrBlock = `
        <g transform="translate(${qrX}, ${qrY})">
          <rect width="130" height="155" rx="8" fill="#FFFFFF"/>
          <g transform="translate(5, 5)">${qrSvg}</g>
          <text x="65" y="142" font-family="${layout.typography.bodyFont}, sans-serif" font-size="10" font-weight="bold" fill="${theme.primary}" text-anchor="middle">${qrCaption}</text>
        </g>
      `;
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${preset.width} ${preset.height}" width="${preset.width}" height="${preset.height}">
  <rect width="${preset.width}" height="${preset.height}" fill="${theme.background}"/>
  <rect width="${preset.width}" height="${Math.round(preset.height * 0.12)}" fill="${theme.primary}"/>
  <rect y="${Math.round(preset.height * 0.12)}" width="${preset.width}" height="4" fill="${theme.accent}"/>
  <text x="${Math.round(preset.width / 2)}" y="${Math.round(preset.height * 0.05)}" font-family="${layout.typography.headerFont}, sans-serif" font-size="${Math.round(18 * layout.scale)}" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SRI RAMAKRISHNA ENGINEERING COLLEGE</text>
  <text x="${Math.round(preset.width / 2)}" y="${Math.round(preset.height * 0.08)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.round(13 * layout.scale)}" fill="${theme.accent}" text-anchor="middle">[Autonomous Institution | Accredited by NAAC with 'A+' Grade]</text>
  <text x="${Math.round(preset.width / 2)}" y="${Math.round(preset.height * 0.105)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.round(12 * layout.scale)}" fill="#E2E8F0" text-anchor="middle">DEPARTMENT OF ${deptName}</text>

  <g transform="translate(${layout.marginX}, ${Math.round(preset.height * 0.18)})">
    <rect width="${Math.round(200 * layout.scale)}" height="${Math.round(28 * layout.scale)}" rx="4" fill="${theme.accent}" opacity="0.15"/>
    <text x="${Math.round(100 * layout.scale)}" y="${Math.round(18 * layout.scale)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.subtitleFontSize}" font-weight="bold" fill="${theme.primary}" text-anchor="middle">PROFESSIONAL WORKSHOP</text>
    <text x="0" y="${Math.round(65 * layout.scale)}" font-family="${layout.typography.titleFont}, sans-serif" font-size="${layout.typography.titleFontSize}" font-weight="bold" fill="${theme.primary}">
      ${eventTitle}
    </text>
  </g>

  <g transform="translate(${Math.round(preset.width / 2)}, ${Math.round(preset.height * 0.58)})">
    <text x="0" y="0" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.bodyFontSize}" font-weight="600" fill="${theme.textMuted}" text-anchor="middle">RESOURCE PERSON</text>
    <text x="0" y="${Math.round(30 * layout.scale)}" font-family="${layout.typography.speakerFont}, sans-serif" font-size="${layout.typography.speakerFontSize}" font-weight="bold" fill="${theme.secondary}" text-anchor="middle">${speakerName}</text>
  </g>

  <g transform="translate(${layout.marginX}, ${preset.height - layout.marginY - 80})">
    <rect width="${layout.contentWidth - (qrBlock ? 150 : 0)}" height="60" rx="8" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1.5"/>
    <text x="20" y="36" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.metaFontSize}" font-weight="bold" fill="${theme.primary}">${dateVenue}</text>
  </g>

  ${qrBlock}

  <rect y="${preset.height - 28}" width="${preset.width}" height="28" fill="${theme.primary}"/>
  <text x="${Math.round(preset.width / 2)}" y="${preset.height - 10}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="11" fill="#FFFFFF" text-anchor="middle">Vattamalaipalayam, N.G.G.O Colony Post, Coimbatore - 641022 | www.srec.ac.in</text>
</svg>`;

    try {
      if (typeof window !== 'undefined' && window.document) {
        const pngBlob = await svgToPngBlob(svg, preset.width, preset.height);
        zip.file(preset.filename, pngBlob);
      } else {
        zip.file(preset.filename.replace('.png', '.svg'), svg);
      }
    } catch (_) {
      zip.file(preset.filename.replace('.png', '.svg'), svg);
    }

    manifest.files.push(preset.filename);
  }

  zip.file('Manifest.json', JSON.stringify(manifest, null, 2));
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `${safeTitle}_Social_Media_Pack.zip`;
  downloadBlob(zipBlob, zipFilename);
  return zipBlob;
};
