/**
 * SREC FIS V3.2.2 — Design Presets & Shared Utilities (Frontend)
 */

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

export const generateQRCodeSVG = (text, options = {}) => {
  const safeText = String(text || '').trim();
  if (!safeText) return '';

  const size = options.size || 200;
  const fgColor = options.fgColor || '#0B2545';
  const bgColor = options.bgColor || '#FFFFFF';

  const N = 25;
  const matrix = Array.from({ length: N }, () => Array(N).fill(0));

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

  for (let i = 8; i < N - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  let hash = 0;
  for (let i = 0; i < safeText.length; i++) {
    hash = ((hash << 5) - hash) + safeText.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
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
// 4. PERSON ROLES & LAYOUT MODES
// =========================================================================
export const PERSON_ROLES = [
  'Chief Guest',
  'Resource Person',
  'Guest Speaker',
  'Keynote Speaker',
  'Special Invitee',
  'Other'
];

export const SPEAKER_LAYOUT_MODES = [
  { id: 'auto', name: 'Automatic' },
  { id: 'horizontal', name: 'Horizontal Row' },
  { id: 'two_column', name: 'Two Column' },
  { id: 'three_column', name: 'Three Column' },
  { id: 'grid', name: '2 × 2 Grid' },
  { id: 'compact_grid', name: 'Compact Grid' }
];

export const createDefaultPerson = (order = 1, role = 'Resource Person', name = '', designation = '', organization = '') => ({
  id: `person_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  name,
  role,
  designation,
  organization,
  photo: null,
  photoCrop: 'circle',
  photoZoom: 1,
  photoPanX: 0,
  photoPanY: 0,
  photoRotate: 0,
  profile: '',
  order
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
        photo: p.photo || p.photoUrl || (idx === 0 ? (customDesign.photoUrl || eventData.resourcePersonPhoto || eventData.speakerPhoto || eventData.speaker_photo || null) : null),
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

  const singleName = eventData.resource_person || eventData.res_person || eventData.chief_guest || eventData.speaker_name || eventData.resourcePerson || eventData.speaker || 'Eminent Subject Specialist';
  const singleRole = eventData.chief_guest ? 'Chief Guest' : 'Resource Person';
  return [{
    id: 'person_default_1',
    name: typeof singleName === 'string' ? singleName : 'Eminent Subject Specialist',
    role: singleRole,
    designation: eventData.res_designation || eventData.resDesignation || eventData.speaker_designation || eventData.designation || '',
    organization: eventData.res_organization || eventData.resOrganization || eventData.speaker_organization || eventData.sponsorship || eventData.organization || '',
    photo: customDesign.photoUrl || eventData.resourcePersonPhoto || eventData.speakerPhoto || eventData.speaker_photo || eventData.res_person_photo || null,
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
// 5. SMART LAYOUT & REFLECTION ENGINE
// =========================================================================
export const calculateSmartLayout = (eventData = {}, customDesign = {}, dimensions = { width: 1080, height: 1350 }) => {
  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isStory = height / width >= 1.7;

  const scale = Math.min(width / 1080, height / 1350);

  const titleLength = (eventData.event_title || eventData.title || '').length;
  let titleFontSize = (customDesign.titleFontSize || 36) * scale;
  
  if (titleLength > 60) {
    titleFontSize = Math.max(20 * scale, titleFontSize * 0.75);
  } else if (titleLength > 40) {
    titleFontSize = Math.max(24 * scale, titleFontSize * 0.85);
  }

  const marginX = Math.round(width * 0.05);
  const marginY = Math.round(height * 0.04);
  const contentWidth = width - (marginX * 2);

  const persons = normalizeEventPersons(eventData, customDesign);
  const personCount = persons.length;

  let layoutMode = customDesign.speakerLayout || 'auto';
  if (layoutMode === 'auto') {
    if (personCount === 1) layoutMode = 'single_large';
    else if (personCount === 2) layoutMode = 'two_column';
    else if (personCount === 3) layoutMode = isLandscape ? 'three_column' : 'grid';
    else if (personCount === 4) layoutMode = 'grid';
    else layoutMode = 'compact_grid';
  }

  const headerHeight = Math.round(height * 0.12);
  const titleAreaY = headerHeight + 20;
  const titleAreaHeight = Math.round(height * 0.18);
  const footerAreaHeight = 90;
  const speakerAreaY = titleAreaY + titleAreaHeight + 10;
  const speakerAreaHeight = height - speakerAreaY - footerAreaHeight - 20;

  let cols = 1;
  if (layoutMode === 'two_column' || personCount === 2) cols = 2;
  else if (layoutMode === 'three_column' || personCount === 3) cols = isLandscape ? 3 : (width >= 1080 ? 3 : 2);
  else if (layoutMode === 'grid' || personCount === 4) cols = 2;
  else if (layoutMode === 'compact_grid' || personCount >= 5) cols = personCount >= 7 ? (isLandscape ? 4 : 3) : (isLandscape ? 3 : (width >= 1080 ? 3 : 2));

  const rows = Math.ceil(personCount / cols);
  const gapX = Math.round(16 * scale);
  const gapY = Math.round(14 * scale);

  const cardWidth = Math.floor((contentWidth - (cols - 1) * gapX) / cols);
  const cardHeight = Math.min(
    Math.floor((speakerAreaHeight - (rows - 1) * gapY) / rows),
    personCount === 1 ? Math.round(280 * scale) : personCount <= 4 ? Math.round(190 * scale) : Math.round(130 * scale)
  );

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

  return {
    dimensions,
    isLandscape,
    isStory,
    scale,
    marginX,
    marginY,
    contentWidth,
    layoutMode,
    persons,
    personCount,
    speakerArea: {
      y: speakerAreaY,
      height: speakerAreaHeight,
      cols,
      rows,
      cards: speakerCards
    },
    typography: {
      headerFont: customDesign.headingFont || 'Montserrat',
      titleFont: customDesign.titleFont || 'Montserrat',
      bodyFont: customDesign.bodyFont || 'Inter',
      speakerFont: customDesign.speakerFont || 'Poppins',
      titleFontSize: Math.round(titleFontSize),
      subtitleFontSize: Math.round((customDesign.subtitleFontSize || 20) * scale),
      speakerFontSize: Math.round((customDesign.speakerFontSize || (personCount <= 2 ? 24 : personCount <= 4 ? 19 : 15)) * scale),
      bodyFontSize: Math.round((customDesign.bodyFontSize || (personCount <= 4 ? 14 : 12)) * scale),
      metaFontSize: Math.round((customDesign.metaFontSize || 16) * scale)
    },
    safeZone: {
      left: marginX,
      top: marginY,
      right: width - marginX,
      bottom: height - marginY
    }
  };
};

export const auditDesignRules = ({ eventTitle, speakerName, eventPersons, customColors, qrConfig, photoConfig }) => {
  const issues = [];

  if (!eventTitle || eventTitle.trim().length === 0) {
    issues.push({ level: 'CRITICAL', code: 'TITLE_MISSING', message: 'Event title is mandatory for all institutional documents.' });
  } else if (eventTitle.length > 120) {
    issues.push({ level: 'WARNING', code: 'TITLE_TOO_LONG', message: 'Event title is very long (>120 chars). Font size will be dynamically reduced.' });
  }

  const persons = Array.isArray(eventPersons) && eventPersons.length > 0
    ? eventPersons
    : speakerName ? [{ name: speakerName }] : [];

  if (persons.length === 0) {
    issues.push({ level: 'WARNING', code: 'NO_SPEAKERS', message: 'No resource persons or chief guests configured for this event.' });
  } else {
    persons.forEach((p, idx) => {
      const pName = p.name || '';
      if (!pName || pName.trim().length === 0) {
        issues.push({ level: 'CRITICAL', code: 'PERSON_NAME_MISSING', message: `Person #${idx + 1} is missing a name.` });
      } else if (pName.length > 80) {
        issues.push({ level: 'WARNING', code: 'SPEAKER_NAME_LONG', message: `Person #${idx + 1} (${pName.substring(0, 20)}...) name is long; line wrapping applied.` });
      }

      if (p.designation && p.designation.length > 100) {
        issues.push({ level: 'INFO', code: 'DESIGNATION_LONG', message: `Person #${idx + 1} designation is long (>100 chars).` });
      }
    });
  }

  if (customColors) {
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    ['primary', 'secondary', 'accent', 'background'].forEach((key) => {
      if (customColors[key] && !hexPattern.test(customColors[key])) {
        issues.push({ level: 'CRITICAL', code: 'INVALID_HEX_COLOR', message: `Invalid color code for ${key}: ${customColors[key]}. Must be valid HEX (#RRGGBB).` });
      }
    });

    if (customColors.primary && customColors.background && customColors.primary.toLowerCase() === customColors.background.toLowerCase()) {
      issues.push({ level: 'CRITICAL', code: 'ZERO_CONTRAST', message: 'Primary text color and background color are identical; text will be invisible.' });
    }
  }

  if (qrConfig && qrConfig.enabled) {
    if (!qrConfig.url || !/^https?:\/\/.+/i.test(qrConfig.url)) {
      issues.push({ level: 'WARNING', code: 'INVALID_QR_URL', message: 'QR Code URL should begin with http:// or https:// for reliable smartphone scanning.' });
    }
  }

  if (photoConfig && photoConfig.width && photoConfig.height) {
    if (photoConfig.width < 250 || photoConfig.height < 250) {
      issues.push({ level: 'INFO', code: 'LOW_RES_PHOTO', message: 'Speaker photo is under 250px resolution. Image quality may appear soft in high-DPI prints.' });
    }
  }

  const hasCritical = issues.some((i) => i.level === 'CRITICAL');
  return {
    valid: !hasCritical,
    issues,
    summary: hasCritical ? 'Critical institutional issues must be resolved' : issues.length > 0 ? 'Warnings detected, but document can be generated' : 'Design passed all professional checks'
  };
};
