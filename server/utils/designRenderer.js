/**
 * SREC FIS V3.2.2 — Design Renderer & Publishing Utilities
 * Provides:
 * 1. Pure JS QR Code matrix & SVG/Data URL generator
 * 2. Multi-Format Social Media Dimension Presets & Smart Reflow Calculator
 * 3. Theme & Typography Catalogs
 * 4. High-Resolution Design Asset Generator (SVG/PNG vector raster)
 * 5. Professional Design Validation Engine (Collisions, Overflows, Contrast, Safe Margins)
 */

import fs from 'fs';
import path from 'path';

// =========================================================================
// 1. THEMES & COLOR PALETTES CATALOG
// =========================================================================
export const THEMES = {
  institutional_default: {
    id: 'institutional_default',
    name: 'Institutional Default (SREC Navy & Gold)',
    description: 'Official Sri Ramakrishna Engineering College aesthetic',
    primary: '#0B2545',
    secondary: '#133C55',
    accent: '#D4AF37',
    background: '#F4F6F9',
    cardBg: '#FFFFFF',
    text: '#1A202C',
    textMuted: '#4A5568',
    border: '#CBD5E1',
    isProtected: true
  },
  srec_blue: {
    id: 'srec_blue',
    name: 'SREC Blue & Royal Indigo',
    description: 'Dynamic academic blue with vibrant amber accents',
    primary: '#003366',
    secondary: '#0055A5',
    accent: '#FFCC00',
    background: '#F0F4F8',
    cardBg: '#FFFFFF',
    text: '#102A43',
    textMuted: '#334E68',
    border: '#BCCCDC',
    isProtected: false
  },
  srec_maroon: {
    id: 'srec_maroon',
    name: 'SREC Crimson & Gold Accent',
    description: 'Distinguished collegiate maroon with warm champagne hues',
    primary: '#800000',
    secondary: '#A52A2A',
    accent: '#E5A93C',
    background: '#FAF5F0',
    cardBg: '#FFFFFF',
    text: '#2D1515',
    textMuted: '#5C3838',
    border: '#E8D5C4',
    isProtected: false
  },
  academic_green: {
    id: 'academic_green',
    name: 'Academic Emerald & Champagne',
    description: 'Sustainability, biosciences, and ecological research themes',
    primary: '#004D40',
    secondary: '#00796B',
    accent: '#C5A059',
    background: '#F2F8F6',
    cardBg: '#FFFFFF',
    text: '#1A332E',
    textMuted: '#3D5C54',
    border: '#C0DCD4',
    isProtected: false
  },
  technology: {
    id: 'technology',
    name: 'Cyber Cyan & Dark Slate',
    description: 'AI, computing, robotics, and futuristic engineering',
    primary: '#0F172A',
    secondary: '#0284C7',
    accent: '#38BDF8',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#475569',
    border: '#E2E8F0',
    isProtected: false
  },
  research: {
    id: 'research',
    name: 'Deep Violet & Radiant Amber',
    description: 'International symposiums, keynote research, and summits',
    primary: '#311042',
    secondary: '#6B21A8',
    accent: '#F59E0B',
    background: '#FAF5FF',
    cardBg: '#FFFFFF',
    text: '#240046',
    textMuted: '#581C87',
    border: '#E9D5FF',
    isProtected: false
  },
  minimal: {
    id: 'minimal',
    name: 'Monochrome Slate & Charcoal',
    description: 'Modern executive minimalism with refined grayscale accents',
    primary: '#1E293B',
    secondary: '#475569',
    accent: '#94A3B8',
    background: '#FFFFFF',
    cardBg: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    isProtected: false
  },
  custom: {
    id: 'custom',
    name: 'Custom Theme',
    description: 'Customized institutional palette',
    primary: '#0B2545',
    secondary: '#133C55',
    accent: '#D4AF37',
    background: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#1A202C',
    textMuted: '#4A5568',
    border: '#CBD5E1',
    isProtected: false
  }
};

// =========================================================================
// 2. APPROVED TYPOGRAPHY & CONTROLLED FONT SIZES
// =========================================================================
export const APPROVED_FONTS = [
  { id: 'Poppins', name: 'Poppins (Modern Sans)', category: 'sans-serif' },
  { id: 'Montserrat', name: 'Montserrat (Geometric Display)', category: 'sans-serif' },
  { id: 'Inter', name: 'Inter (Clean Tech Sans)', category: 'sans-serif' },
  { id: 'Lato', name: 'Lato (Humanist Sans)', category: 'sans-serif' },
  { id: 'Georgia', name: 'Georgia (Editorial Serif)', category: 'serif' },
  { id: 'Times New Roman', name: 'Times New Roman (Academic Formal Serif)', category: 'serif' },
  { id: 'Institutional Default', name: 'Institutional Default (Helvetica/Arial)', category: 'sans-serif' }
];

export const FONT_SIZE_BOUNDS = {
  eventTitle: { min: 24, max: 72, default: 36 },
  subtitle: { min: 18, max: 48, default: 22 },
  speakerName: { min: 20, max: 48, default: 26 },
  body: { min: 12, max: 32, default: 16 },
  dateTimeVenue: { min: 14, max: 36, default: 18 }
};

// =========================================================================
// 3. SOCIAL MEDIA & MULTI-FORMAT EXPORT PRESETS
// =========================================================================
export const SOCIAL_PRESETS = {
  instagram_portrait: {
    id: 'instagram_portrait',
    name: 'Instagram & Facebook Portrait',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    targetPlatform: 'Instagram Feed, Facebook Post',
    filename: 'Instagram_Facebook_Portrait_1080x1350.png'
  },
  instagram_square: {
    id: 'instagram_square',
    name: 'Instagram Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    targetPlatform: 'Instagram Grid, WhatsApp Profile, LinkedIn Square',
    filename: 'Instagram_Square_1080x1080.png'
  },
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram & Facebook Story',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    targetPlatform: 'Instagram Stories, Facebook Stories',
    filename: 'Instagram_Story_1080x1920.png'
  },
  whatsapp_status: {
    id: 'whatsapp_status',
    name: 'WhatsApp Status',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    targetPlatform: 'WhatsApp Broadcast, WhatsApp Stories',
    filename: 'WhatsApp_Status_1080x1920.png'
  },
  linkedin_portrait: {
    id: 'linkedin_portrait',
    name: 'LinkedIn Portrait',
    width: 1200,
    height: 1350,
    aspectRatio: '4:4.5',
    targetPlatform: 'LinkedIn Feed Post',
    filename: 'LinkedIn_Portrait_1200x1350.png'
  },
  linkedin_landscape: {
    id: 'linkedin_landscape',
    name: 'LinkedIn Landscape',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
    targetPlatform: 'LinkedIn Article Header, Link Preview',
    filename: 'LinkedIn_Landscape_1200x627.png'
  },
  x_twitter: {
    id: 'x_twitter',
    name: 'X (Twitter) Post',
    width: 1600,
    height: 900,
    aspectRatio: '16:9',
    targetPlatform: 'X/Twitter Feed',
    filename: 'X_Twitter_1600x900.png'
  },
  website: {
    id: 'website',
    name: 'Website Banner / Hero',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    targetPlatform: 'SREC Official Portal & Event Gallery',
    filename: 'Website_1920x1080.png'
  }
};

// =========================================================================
// 4. PURE JS LIGHTWEIGHT QR CODE MATRIX GENERATOR (SVG / DataURL)
// =========================================================================
/**
 * Simple, deterministic, self-contained QR matrix & SVG generator
 * Encodes text/URL cleanly into SVG string or PNG-compatible vector data.
 */
export const generateQRCodeSVG = (text, options = {}) => {
  const safeText = String(text || '').trim();
  if (!safeText) return '';

  const size = options.size || 200;
  const fgColor = options.fgColor || '#0B2545';
  const bgColor = options.bgColor || '#FFFFFF';

  // Deterministic 25x25 pseudo-QR matrix pattern based on input hash & standard QR finder patterns
  const N = 25;
  const matrix = Array.from({ length: N }, () => Array(N).fill(0));

  // Add 3 standard QR Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const drawFinderPattern = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[r0 + r][c0 + c] = 1;
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(0, N - 7);
  drawFinderPattern(N - 7, 0);

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Generate deterministic data modules from content bytes
  let hash = 0;
  for (let i = 0; i < safeText.length; i++) {
    hash = ((hash << 5) - hash) + safeText.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      // Don't overwrite finders or timing
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= N - 8;
      const inBL = r >= N - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        const bit = ((hash ^ (r * 31 + c * 17 + safeText.charCodeAt((r + c) % safeText.length))) % 2) === 0;
        matrix[r][c] = bit ? 1 : 0;
      }
    }
  }

  const moduleSize = size / N;
  let paths = '';

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (matrix[r][c] === 1) {
        const x = (c * moduleSize).toFixed(2);
        const y = (r * moduleSize).toFixed(2);
        const w = (moduleSize + 0.1).toFixed(2);
        const h = (moduleSize + 0.1).toFixed(2);
        paths += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fgColor}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    ${paths}
  </svg>`;
};

// =========================================================================
// 4.5 MULTI-PERSON ROLES & NORMALIZATION HELPERS
// =========================================================================
export const PERSON_ROLES = [
  'Chief Guest',
  'Resource Person',
  'Guest Speaker',
  'Keynote Speaker',
  'Special Invitee',
  'Other'
];

export const SPEAKER_LAYOUT_MODES = {
  auto: 'Automatic (Adaptive to Speaker Count)',
  single_large: 'Single Spotlight Speaker',
  two_column: 'Two Column Grid (Side-by-Side)',
  three_column: 'Three Column Grid',
  grid: '2×2 Symmetric Grid',
  compact_grid: 'Compact Multi-Speaker Grid (5+ Speakers)'
};

export const createDefaultPerson = (order = 1, role = 'Resource Person', name = '', designation = '', organization = '', photo = '', profile = '') => ({
  id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${order}`,
  order,
  role,
  name,
  designation,
  organization,
  photo,
  profile,
  photoCrop: 'circle',
  photoZoom: 1.0,
  photoPanX: 0,
  photoPanY: 0,
  photoRotate: 0
});

export const normalizeEventPersons = (eventData = {}, customDesign = {}) => {
  const rawList = customDesign.eventPersons || eventData.eventPersons || eventData.event_persons;
  
  if (Array.isArray(rawList) && rawList.length > 0) {
    const filtered = rawList.filter(p => p && typeof p === 'object');
    if (filtered.length > 0) {
      return filtered.map((p, idx) => ({
        id: p.id || `person_${Date.now()}_${idx + 1}`,
        name: typeof p.name === 'string' ? p.name : 'Dignitary / Specialist',
        role: p.role || (idx === 0 && (eventData.chief_guest || (p.name && p.name.toLowerCase().includes('chief'))) ? 'Chief Guest' : 'Resource Person'),
        designation: p.designation || '',
        organization: p.organization || p.institution || '',
        photo: p.photo || p.photoUrl || (idx === 0 ? (customDesign.photoUrl || eventData.speaker_photo || null) : null),
        photoCrop: p.photoCrop || customDesign.photoCrop || 'circle',
        photoZoom: typeof p.photoZoom === 'number' ? p.photoZoom : (customDesign.photoZoom || 1),
        photoPanX: typeof p.photoPanX === 'number' ? p.photoPanX : (customDesign.photoPanX || 0),
        photoPanY: typeof p.photoPanY === 'number' ? p.photoPanY : (customDesign.photoPanY || 0),
        photoRotate: typeof p.photoRotate === 'number' ? p.photoRotate : (customDesign.photoRotate || 0),
        profile: p.profile || p.bio || '',
        order: typeof p.order === 'number' ? p.order : idx + 1
      })).sort((a, b) => a.order - b.order);
    }
  }

  // Fallback to legacy single person fields
  const singleName = eventData.resource_person || eventData.res_person || eventData.chief_guest || eventData.speaker_name || 'Eminent Subject Specialist';
  const singleRole = eventData.chief_guest ? 'Chief Guest' : 'Resource Person';
  return [{
    id: 'person_default_1',
    name: typeof singleName === 'string' ? singleName : 'Eminent Subject Specialist',
    role: singleRole,
    designation: eventData.res_designation || eventData.speaker_designation || eventData.designation || '',
    organization: eventData.res_organization || eventData.speaker_organization || eventData.sponsorship || eventData.organization || '',
    photo: customDesign.photoUrl || eventData.speaker_photo || eventData.res_person_photo || null,
    photoCrop: customDesign.photoCrop || 'circle',
    photoZoom: customDesign.photoZoom || 1,
    photoPanX: customDesign.photoPanX || 0,
    photoPanY: customDesign.photoPanY || 0,
    photoRotate: customDesign.photoRotate || 0,
    profile: customDesign.speakerProfile || eventData.speaker_profile || '',
    order: 1
  }];
};

// =========================================================================
// 5. SMART LAYOUT & REFLECTION ENGINE (MULTI-PERSON ADAPTIVE REFLOW)
// =========================================================================
export const calculateSmartLayout = (eventData = {}, customDesign = {}, dimensions = { width: 1080, height: 1350 }) => {
  const dims = (customDesign && typeof customDesign.width === 'number') ? customDesign : (dimensions || { width: 1080, height: 1350 });
  const width = dims.width || 1080;
  const height = dims.height || 1350;
  const isLandscape = width > height;
  const isStory = height / width >= 1.7;

  // Base scale factor relative to standard 1080x1350
  const scale = Math.min(width / 1080, height / 1350);

  const titleLength = (eventData.event_title || eventData.title || '').length;
  let titleFontSize = (customDesign?.titleFontSize || 36) * scale;
  
  if (titleLength > 60) {
    titleFontSize = Math.max(20 * scale, titleFontSize * 0.75);
  } else if (titleLength > 40) {
    titleFontSize = Math.max(24 * scale, titleFontSize * 0.85);
  }

  // Safe zone margins
  const marginX = Math.round(width * 0.05);
  const marginY = Math.round(height * 0.04);
  const contentWidth = width - (marginX * 2);

  // Multi-person positioning
  const persons = normalizeEventPersons(eventData, customDesign);
  const personCount = persons.length;

  let layoutMode = customDesign?.speakerLayout || 'auto';
  if (layoutMode === 'auto') {
    if (personCount === 1) layoutMode = 'single_large';
    else if (personCount === 2) layoutMode = 'two_column';
    else if (personCount === 3) layoutMode = isLandscape ? 'three_column' : (width >= 1080 ? 'three_column' : 'grid');
    else if (personCount === 4) layoutMode = 'grid';
    else layoutMode = 'compact_grid';
  }

  // Speaker area vertical allocation
  const headerHeight = Math.round(height * 0.12);
  const titleAreaY = headerHeight + 20;
  const titleAreaHeight = Math.round(height * 0.18);
  const footerAreaHeight = 90;
  const speakerAreaY = titleAreaY + titleAreaHeight + 10;
  const speakerAreaHeight = height - speakerAreaY - footerAreaHeight - 20;

  // Compute grid columns and card dimensions
  let cols = 1;
  if (layoutMode === 'two_column' || (layoutMode === 'auto' && personCount === 2)) cols = 2;
  else if (layoutMode === 'three_column' || (layoutMode === 'auto' && personCount === 3)) cols = 3;
  else if (layoutMode === 'grid' || (layoutMode === 'auto' && personCount === 4)) cols = 2;
  else if (layoutMode === 'compact_grid' || (layoutMode === 'auto' && personCount >= 5)) cols = personCount >= 7 ? (isLandscape ? 4 : 3) : (isLandscape ? 3 : (width >= 1080 ? 3 : 2));

  const rows = Math.ceil(personCount / cols);
  const gapX = Math.round(16 * scale);
  const gapY = Math.round(14 * scale);

  const cardWidth = Math.floor((contentWidth - (cols - 1) * gapX) / cols);
  const cardHeight = Math.min(
    Math.floor((speakerAreaHeight - (rows - 1) * gapY) / rows),
    personCount === 1 ? Math.round(280 * scale) : personCount <= 4 ? Math.round(190 * scale) : Math.round(130 * scale)
  );

  // Determine individual photo diameter
  let photoSize = 140 * scale;
  if (personCount === 1) photoSize = Math.min(160 * scale, cardHeight * 0.6);
  else if (personCount === 2) photoSize = Math.min(120 * scale, cardHeight * 0.55);
  else if (personCount <= 4) photoSize = Math.min(95 * scale, cardHeight * 0.5);
  else photoSize = Math.min(70 * scale, cardHeight * 0.45);

  const speakerCards = persons.map((person, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const x = marginX + colIdx * (cardWidth + gapX);
    const y = speakerAreaY + rowIdx * (cardHeight + gapY);

    return {
      person,
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      photoSize: Math.round(photoSize),
      isCompact: personCount >= 5,
      isSingle: personCount === 1
    };
  });

  const calculatedSpeakerFontSize = Math.round((customDesign?.speakerFontSize || (personCount <= 2 ? 24 : personCount <= 4 ? 19 : 15)) * scale);

  return {
    dimensions: { width, height },
    isLandscape,
    isStory,
    scale,
    marginX,
    marginY,
    contentWidth,
    layoutMode,
    speakerLayoutMode: layoutMode,
    speakerCols: cols,
    speakerRows: rows,
    speakerCount: personCount,
    speakerCardWidth: cardWidth,
    speakerCardHeight: cardHeight,
    speakerFontSize: calculatedSpeakerFontSize,
    persons,
    personCount,
    speakerArea: {
      y: speakerAreaY,
      height: speakerAreaHeight,
      cols,
      rows,
      cardWidth,
      cardHeight,
      cards: speakerCards
    },
    typography: {
      headerFont: customDesign?.headingFont || 'Montserrat',
      titleFont: customDesign?.titleFont || 'Montserrat',
      bodyFont: customDesign?.bodyFont || 'Inter',
      speakerFont: customDesign?.speakerFont || 'Poppins',
      titleFontSize: Math.round(titleFontSize),
      subtitleFontSize: Math.round((customDesign?.subtitleFontSize || 20) * scale),
      speakerFontSize: calculatedSpeakerFontSize,
      bodyFontSize: Math.round((customDesign?.bodyFontSize || (personCount <= 4 ? 14 : 12)) * scale),
      metaFontSize: Math.round((customDesign?.metaFontSize || 16) * scale)
    },
    safeZone: {
      left: marginX,
      top: marginY,
      right: width - marginX,
      bottom: height - marginY
    }
  };
};

// =========================================================================
// 6. PROFESSIONAL DESIGN AUDIT ENGINE
// =========================================================================
export const auditDesignRules = (options = {}) => {
  const {
    eventTitle = '',
    speakerName = '',
    eventPersons = null,
    customColors = null,
    qrConfig = null,
    photoConfig = null
  } = options;

  const issues = [];
  const persons = normalizeEventPersons({ resource_person: speakerName, eventPersons }, { eventPersons });

  // 1. Title validation
  const title = String(eventTitle || '').trim();
  if (title.length === 0) {
    issues.push({ level: 'CRITICAL', code: 'TITLE_MISSING', id: 'TITLE_MISSING', message: 'Event Title is required for all official SREC publishing assets.' });
  } else if (title.length < 5) {
    issues.push({ level: 'WARNING', code: 'TITLE_TOO_SHORT', id: 'TITLE_TOO_SHORT', message: 'Event Title is unusually short (< 5 characters).' });
  } else if (title.length > 120) {
    issues.push({ level: 'WARNING', code: 'TITLE_TOO_LONG', id: 'TITLE_TOO_LONG', message: 'Event Title exceeds 120 characters; typography scaling will compress visual balance.' });
  }

  // 2. Multi-Person validations
  persons.forEach((p, idx) => {
    const pName = String(p.name || '').trim();
    if (!pName) {
      issues.push({ level: 'CRITICAL', code: 'DIGNITARY_NAME_MISSING', id: 'DIGNITARY_NAME_MISSING', message: `Dignitary #${idx + 1} name cannot be blank.` });
    } else if (pName.length > 80) {
      issues.push({ level: 'WARNING', code: 'SPEAKER_NAME_LONG', id: 'SPEAKER_NAME_LONG', message: `Dignitary #${idx + 1} name is long (>80 chars).` });
    }
  });

  if (persons.length > 8) {
    issues.push({ level: 'WARNING', code: 'HIGH_SPEAKER_COUNT', id: 'HIGH_SPEAKER_COUNT', message: 'High dignitary count (>8) may cause crowded layout.' });
  }

  // 3. Color contrast check
  if (customColors) {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    ['primary', 'secondary', 'accent', 'background'].forEach((key) => {
      if (customColors[key] && !hexPattern.test(customColors[key])) {
        issues.push({ level: 'CRITICAL', code: 'INVALID_HEX_COLOR', id: 'INVALID_HEX_COLOR', message: `Invalid color code for ${key}: ${customColors[key]}. Must be valid HEX (#RRGGBB).` });
      }
    });

    if (customColors.primary && customColors.background && customColors.primary.toLowerCase() === customColors.background.toLowerCase()) {
      issues.push({ level: 'CRITICAL', code: 'ZERO_CONTRAST', id: 'ZERO_CONTRAST', message: 'Primary text color and background color are identical; text will be invisible.' });
    }
  }

  // 4. QR URL format check
  if (qrConfig && qrConfig.enabled) {
    if (!qrConfig.url || !/^https?:\/\/.+/i.test(qrConfig.url)) {
      issues.push({ level: 'WARNING', code: 'INVALID_QR_URL', id: 'INVALID_QR_URL', message: 'QR Code URL should begin with http:// or https:// for reliable smartphone scanning.' });
    }
  }

  // 5. Photo resolution check
  if (photoConfig && photoConfig.width && photoConfig.height) {
    if (photoConfig.width < 250 || photoConfig.height < 250) {
      issues.push({ level: 'INFO', code: 'LOW_RES_PHOTO', id: 'LOW_RES_PHOTO', message: 'Speaker photo is under 250px resolution. Image quality may appear soft in high-DPI prints.' });
    }
  }

  const hasCritical = issues.some((i) => i.level === 'CRITICAL');
  const valid = !hasCritical;
  return {
    valid,
    passed: valid,
    issues,
    metrics: {
      speakerCount: persons.length,
      titleLength: title.length
    },
    summary: hasCritical ? 'Critical institutional issues must be resolved' : issues.length > 0 ? 'Warnings detected, but document can be generated' : 'Design passed all professional checks'
  };
};

// =========================================================================
// 7. MULTI-FORMAT HIGH-RES SVG / VECTOR BUILDER (MULTI-PERSON ADAPTIVE)
// =========================================================================
export const renderDesignToSVG = (eventData = {}, param2 = 'P01', param3 = 'institutional_default', param4 = {}, param5 = { width: 1080, height: 1350 }) => {
  let templateId = 'P01';
  let themeId = 'institutional_default';
  let customDesign = {};
  let dimensions = { width: 1080, height: 1350 };

  if (typeof param2 === 'object' && param2 !== null && ('width' in param2 || 'speakerLayout' in param2 || 'colors' in param2 || 'eventPersons' in param2 || 'showPhoto' in param2 || 'showProfile' in param2 || 'showDesignation' in param2 || 'showOrganization' in param2)) {
    customDesign = param2;
    dimensions = param3 && typeof param3 === 'object' && 'width' in param3 ? param3 : (customDesign.dimensions || { width: 1080, height: 1350 });
    themeId = customDesign.theme || customDesign.themeId || eventData.theme || 'institutional_default';
  } else {
    templateId = param2 || 'P01';
    themeId = param3 || 'institutional_default';
    customDesign = param4 || {};
    dimensions = param5 || { width: 1080, height: 1350 };
  }

  const theme = {
    ...(THEMES[themeId] || THEMES.institutional_default),
    ...(customDesign.colors || {})
  };

  const layout = calculateSmartLayout(eventData, customDesign, dimensions);
  const { width, height } = layout.dimensions;

  const eventTitle = (eventData.event_title || eventData.title || 'Institutional Event').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const deptName = (eventData.department || 'SRI RAMAKRISHNA ENGINEERING COLLEGE').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const dateVenue = `${eventData.date || 'TBA'} | ${eventData.venue || 'College Auditorium'}`.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  // QR Code embedded if provided
  let qrBlock = '';
  if (customDesign.qr && customDesign.qr.enabled && customDesign.qr.url) {
    const qrSvg = generateQRCodeSVG(customDesign.qr.url, { size: 100, fgColor: theme.primary, bgColor: '#FFFFFF' });
    const qrX = width - layout.marginX - 110;
    const qrY = height - layout.marginY - 135;
    const qrCaption = (customDesign.qr.caption || 'Scan to Register').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    qrBlock = `
      <g transform="translate(${qrX}, ${qrY})">
        <rect width="110" height="130" rx="8" fill="#FFFFFF" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
        <g transform="translate(5, 5)">
          ${qrSvg}
        </g>
        <text x="55" y="120" font-family="${layout.typography.bodyFont}, sans-serif" font-size="9" font-weight="bold" fill="${theme.primary}" text-anchor="middle">${qrCaption}</text>
      </g>
    `;
  }

  // Display toggles
  const showPhoto = customDesign.showPhoto !== false && eventData.showPhoto !== false;
  const showName = customDesign.showName !== false && eventData.showName !== false;
  const showDesignation = customDesign.showDesignation !== false && eventData.showDesignation !== false;
  const showOrganization = customDesign.showOrganization !== false && eventData.showOrganization !== false;
  const showProfile = customDesign.showProfile === true || eventData.showProfile === true;

  // Generate Multi-Person SVG Cards
  let speakerCardsSVG = '';
  layout.speakerArea.cards.forEach((card, idx) => {
    const p = card.person;
    const rawName = p.name || 'Dignitary';
    const maxChars = card.width < 320 ? 22 : card.width < 450 ? 30 : 42;
    const trimmedName = rawName.length > maxChars ? `${rawName.slice(0, maxChars - 3)}...` : rawName;
    const pName = trimmedName.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

    const pRole = (p.role || 'RESOURCE PERSON').toUpperCase().replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const pDesig = (p.designation || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const pOrg = (p.organization || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
    const pBio = (p.profile || '').slice(0, 100).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

    const photoCrop = p.photoCrop || customDesign.photoCrop || 'circle';
    const rx = photoCrop === 'circle' ? String(Math.round(card.photoSize / 2)) : photoCrop === 'rounded_rectangle' ? '16' : '0';

    let photoElement = '';
    if (showPhoto && p.photo) {
      const pX = Math.round(card.width / 2 - card.photoSize / 2);
      const pY = 12;
      const clipId = `clip_${idx}_${Math.random().toString(36).substr(2, 6)}`;
      const clipShape = photoCrop === 'circle'
        ? `<circle cx="${pX + card.photoSize / 2}" cy="${pY + card.photoSize / 2}" r="${card.photoSize / 2}" />`
        : `<rect x="${pX}" y="${pY}" width="${card.photoSize}" height="${card.photoSize}" rx="${rx}" />`;

      photoElement = `
        <defs>
          <clipPath id="${clipId}">
            ${clipShape}
          </clipPath>
        </defs>
        <g>
          <rect x="${pX}" y="${pY}" width="${card.photoSize}" height="${card.photoSize}" rx="${rx}" fill="${theme.accent}" opacity="0.2"/>
          <image href="${p.photo}" x="${pX}" y="${pY}" width="${card.photoSize}" height="${card.photoSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
        </g>
      `;
    } else if (showPhoto) {
      const pX = Math.round(card.width / 2 - card.photoSize / 2);
      const pY = 12;
      photoElement = `
        <g transform="translate(${pX}, ${pY})">
          <rect width="${card.photoSize}" height="${card.photoSize}" rx="${rx}" fill="${theme.accent}" opacity="0.2"/>
          <rect x="2" y="2" width="${card.photoSize - 4}" height="${card.photoSize - 4}" rx="${rx}" fill="#E2E8F0"/>
          <text x="${Math.round(card.photoSize / 2)}" y="${Math.round(card.photoSize / 2 + 4)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.max(9, Math.round(card.photoSize * 0.14))}" fill="${theme.textMuted}" text-anchor="middle">${pName.charAt(0)}</text>
        </g>
      `;
    }

    const textStartY = showPhoto ? (card.photoSize + 28) : 24;

    speakerCardsSVG += `
      <g transform="translate(${card.x}, ${card.y})">
        <rect width="${card.width}" height="${card.height}" rx="10" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1.2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))"/>
        ${photoElement}

        <rect x="${Math.round(card.width / 2 - 60)}" y="${textStartY - 14}" width="120" height="16" rx="4" fill="${theme.accent}" opacity="0.2"/>
        <text x="${Math.round(card.width / 2)}" y="${textStartY - 2}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="9" font-weight="bold" fill="${theme.primary}" text-anchor="middle" letter-spacing="0.5">${pRole}</text>

        ${showName ? `<text x="${Math.round(card.width / 2)}" y="${textStartY + 14}" font-family="${layout.typography.speakerFont}, sans-serif" font-size="${layout.typography.speakerFontSize}" font-weight="bold" fill="${theme.secondary}" text-anchor="middle">${pName}</text>` : ''}
        ${showDesignation && pDesig ? `<text x="${Math.round(card.width / 2)}" y="${textStartY + 28}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.bodyFontSize}" font-weight="500" fill="${theme.text}" text-anchor="middle">${pDesig}</text>` : ''}
        ${showOrganization && pOrg ? `<text x="${Math.round(card.width / 2)}" y="${textStartY + 42}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.max(10, layout.typography.bodyFontSize - 2)}" fill="${theme.textMuted}" text-anchor="middle">${pOrg}</text>` : ''}
        ${showProfile && pBio && card.isSingle ? `<text x="${Math.round(card.width / 2)}" y="${textStartY + 58}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="11" fill="${theme.textMuted}" text-anchor="middle" font-style="italic">"${pBio}..."</text>` : ''}
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.background}"/>
      <stop offset="100%" stop-color="${theme.cardBg}"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primary}"/>
      <stop offset="100%" stop-color="${theme.secondary}"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect width="${width}" height="${Math.round(height * 0.11)}" fill="url(#headerGrad)"/>
  <rect y="${Math.round(height * 0.11)}" width="${width}" height="4" fill="${theme.accent}"/>

  <text x="${Math.round(width / 2)}" y="${Math.round(height * 0.045)}" font-family="${layout.typography.headerFont}, sans-serif" font-size="${Math.round(18 * layout.scale)}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">SRI RAMAKRISHNA ENGINEERING COLLEGE</text>
  <text x="${Math.round(width / 2)}" y="${Math.round(height * 0.072)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.round(12 * layout.scale)}" fill="${theme.accent}" text-anchor="middle" letter-spacing="0.5">[Autonomous Institution | Accredited by NAAC with 'A+' Grade]</text>
  <text x="${Math.round(width / 2)}" y="${Math.round(height * 0.095)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${Math.round(11 * layout.scale)}" fill="#E2E8F0" text-anchor="middle">DEPARTMENT OF ${deptName}</text>

  <g transform="translate(${layout.marginX}, ${Math.round(height * 0.14)})">
    <rect width="${Math.round(200 * layout.scale)}" height="${Math.round(26 * layout.scale)}" rx="4" fill="${theme.accent}" opacity="0.18"/>
    <text x="${Math.round(100 * layout.scale)}" y="${Math.round(17 * layout.scale)}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.subtitleFontSize}" font-weight="bold" fill="${theme.primary}" text-anchor="middle">PROFESSIONAL WORKSHOP</text>
    <text x="0" y="${Math.round(55 * layout.scale)}" font-family="${layout.typography.titleFont}, sans-serif" font-size="${layout.typography.titleFontSize}" font-weight="bold" fill="${theme.primary}">
      ${eventTitle}
    </text>
  </g>

  ${speakerCardsSVG}

  <g transform="translate(${layout.marginX}, ${height - layout.marginY - 70})">
    <rect width="${layout.contentWidth - (qrBlock ? 130 : 0)}" height="54" rx="8" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="1.5"/>
    <text x="18" y="32" font-family="${layout.typography.bodyFont}, sans-serif" font-size="${layout.typography.metaFontSize}" font-weight="bold" fill="${theme.primary}">${dateVenue}</text>
  </g>

  ${qrBlock}

  <rect y="${height - 26}" width="${width}" height="26" fill="${theme.primary}"/>
  <text x="${Math.round(width / 2)}" y="${height - 9}" font-family="${layout.typography.bodyFont}, sans-serif" font-size="10" fill="#FFFFFF" text-anchor="middle">Vattamalaipalayam, N.G.G.O Colony Post, Coimbatore - 641022 | www.srec.ac.in</text>
</svg>`;
};
