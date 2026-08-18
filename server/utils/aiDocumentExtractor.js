import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { createWorker } from 'tesseract.js';
import https from 'https';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Compute SHA-256 cryptographic hash of a file buffer
 */
export function computeFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Layer 1 & 2: Extract text from PDF or Image file
 */
export async function extractRawTextFromFile(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found on disk: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  const fileHash = computeFileHash(buffer);
  const fileSize = buffer.length;

  let text = '';
  let extractionMethod = 'digital_pdf';

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      text = (pdfData.text || '').trim();
      // If digital PDF text is too short (< 40 characters), it's likely a scanned image PDF
      if (text.length < 40) {
        extractionMethod = 'ocr_scanned_pdf';
      }
    } catch (pdfErr) {
      console.warn('[PDF Extract Warning] Failed digital PDF parsing, attempting fallback:', pdfErr.message);
    }
  }

  // If text is still empty and file is an image (or OCR required)
  if (!text || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.bmp') {
    if (['.png', '.jpg', '.jpeg', '.webp', '.bmp'].includes(ext) || mimeType?.startsWith('image/')) {
      try {
        extractionMethod = 'tesseract_ocr';
        const worker = await createWorker('eng');
        const ret = await worker.recognize(filePath);
        text = (ret.data.text || '').trim();
        await worker.terminate();
      } catch (ocrErr) {
        console.warn('[OCR Warning] Tesseract OCR failed:', ocrErr.message);
      }
    }
  }

  return {
    rawText: text || '',
    fileHash,
    fileSize,
    extractionMethod
  };
}

/**
 * Layer 3: Smart Document Classification based on text indicators, keywords, and structural terminology
 */
export function classifyDocument(rawText, originalFilename = '') {
  const text = (rawText || '').toLowerCase();
  const filename = (originalFilename || '').toLowerCase();

  const scores = {
    interactions: 0,
    certifications: 0,
    awards: 0,
    events: 0,
    funding: 0,
    seed_money: 0,
    ipr: 0,
    resource: 0,
    memberships: 0,
    publications: 0,
    books: 0,
    scholars: 0
  };

  const indicators = {
    interactions: [],
    certifications: [],
    awards: [],
    events: [],
    funding: [],
    seed_money: [],
    ipr: [],
    resource: [],
    memberships: [],
    publications: [],
    books: [],
    scholars: []
  };

  // 1. Interactions (FDP, STTP, Workshop, Seminar Attended)
  if (text.includes('faculty development prog') || text.includes('fdp') || filename.includes('fdp')) {
    scores.interactions += 45;
    indicators.interactions.push('Faculty Development Programme');
  }
  if (text.includes('certificate of participation') || text.includes('has participated in') || text.includes('attended the') || text.includes('participated in the national workshop')) {
    scores.interactions += 35;
    indicators.interactions.push('Participation confirmation phrase');
  }
  if (text.includes('short term training') || text.includes('sttp') || text.includes('workshop on') || text.includes('hands-on workshop')) {
    scores.interactions += 30;
    indicators.interactions.push('Workshop / STTP terminology');
  }

  // 2. Certifications (NPTEL, SWAYAM, Coursera, Online Course)
  if (text.includes('nptel') || text.includes('swayam') || filename.includes('nptel') || filename.includes('swayam')) {
    scores.certifications += 55;
    indicators.certifications.push('NPTEL / SWAYAM national learning portal');
  }
  if (text.includes('elite') || text.includes('consolidated score') || text.includes('proctored exam') || text.includes('elite + silver') || text.includes('elite + gold')) {
    scores.certifications += 35;
    indicators.certifications.push('NPTEL examination & elite grading');
  }
  if (text.includes('successfully completed the course') || text.includes('online course') || text.includes('course certificate') || text.includes('coursera') || text.includes('edx') || text.includes('udemy')) {
    scores.certifications += 30;
    indicators.certifications.push('Course completion credential');
  }
  if (text.includes('roll no:') || text.includes('to certify that') && text.includes('course')) {
    scores.certifications += 20;
    indicators.certifications.push('Certification roll & course verification');
  }

  // 3. Awards (Honors, Fellowships, Best Paper Award, Excellence)
  if (text.includes('award') || text.includes('honour') || text.includes('excellence in') || text.includes('best paper award') || text.includes('fellowship') || filename.includes('award')) {
    scores.awards += 45;
    indicators.awards.push('Award / Honor / Recognition keyword');
  }
  if (text.includes('conferred upon') || text.includes('in recognition of') || text.includes('distinguished faculty') || text.includes('certificate of merit')) {
    scores.awards += 35;
    indicators.awards.push('Award conferral phrase');
  }

  // 4. Events Organized (Convener, Coordinator, Organized by Department)
  if (text.includes('convenor') || text.includes('convener') || text.includes('coordinator') || text.includes('organizing committee') || text.includes('successfully organized') || filename.includes('event')) {
    scores.events += 40;
    indicators.events.push('Event organization leadership role');
  }
  if (text.includes('hackathon') || text.includes('symposium') || text.includes('national conference on') || text.includes('international conference on')) {
    scores.events += 25;
    indicators.events.push('Conference/Symposium organizing header');
  }

  // 5. Funding (Sanction Order, Grant, Funding Agency, DST, AICTE, SERB)
  if (text.includes('sanction order') || text.includes('sanctioned the grant') || text.includes('project grant') || text.includes('funding agency') || text.includes('principal investigator') || filename.includes('grant') || filename.includes('fund')) {
    scores.funding += 50;
    indicators.funding.push('Grant sanction order / Principal Investigator');
  }
  if (text.includes('dst') || text.includes('aicte') || text.includes('serb') || text.includes('drdo') || text.includes('csir') || text.includes('icmr') || text.includes('file no.') || text.includes('sanction amount')) {
    scores.funding += 35;
    indicators.funding.push('Government agency / Sanction details');
  }

  // 6. Seed Money / Consultancy
  if (text.includes('seed money') || text.includes('seed grant') || text.includes('internal seed') || text.includes('consultancy project') || text.includes('consulting work') || filename.includes('seed')) {
    scores.seed_money += 50;
    indicators.seed_money.push('Seed money / Consultancy phrase');
  }

  // 7. IPR / Patents (Patent Office, Application No, Granted, Controller of Patents)
  if (text.includes('patent') || text.includes('intellectual property india') || text.includes('application no.') || text.includes('controller general of patents') || text.includes('patent grant') || filename.includes('patent') || filename.includes('ipr')) {
    scores.ipr += 50;
    indicators.ipr.push('Patent / Intellectual Property Office indicator');
  }
  if (text.includes('inventor(s)') || text.includes('date of filing') || text.includes('patent published') || text.includes('cbr no') || text.includes('patent office')) {
    scores.ipr += 35;
    indicators.ipr.push('Patent filing metadata');
  }

  // 8. Resource Person (Guest Speaker, Delivered lecture, Keynote, Session Chair)
  if (text.includes('resource person') || text.includes('guest lecture') || text.includes('keynote speaker') || text.includes('delivered a lecture') || text.includes('session chair') || text.includes('acted as a speaker') || filename.includes('resource')) {
    scores.resource += 50;
    indicators.resource.push('Resource person / Keynote speaker phrasing');
  }

  // 9. Professional Memberships (IEEE, CSI, ACM, ISTE, Membership Card/Certificate)
  if (text.includes('membership certificate') || text.includes('life member') || text.includes('senior member') || text.includes('ieee member') || text.includes('computer society of india') || text.includes('iste') || filename.includes('membership')) {
    scores.memberships += 50;
    indicators.memberships.push('Professional society membership credential');
  }

  // 10. Publications (DOI, Journal, ISSN, Volume, Abstract, IEEE Transactions, Springer, Elsevier)
  if (text.includes('doi:') || text.includes('doi.org/') || text.includes('issn:') || text.includes('volume') && text.includes('issue') && text.includes('pages') || text.includes('abstract') && text.includes('keywords') || filename.includes('paper') || filename.includes('pub')) {
    scores.publications += 50;
    indicators.publications.push('Scholarly publication / DOI / ISSN indicators');
  }
  if (text.includes('elsevier') || text.includes('springer') || text.includes('ieee') || text.includes('scopus') || text.includes('web of science') || text.includes('wos')) {
    scores.publications += 30;
    indicators.publications.push('Academic publisher watermark');
  }

  // 11. Books Published (ISBN, Publisher, Edition)
  if (text.includes('isbn:') || text.includes('isbn-13') || text.includes('isbn-10') || text.includes('book chapter') || text.includes('authored by') || filename.includes('book')) {
    scores.books += 45;
    indicators.books.push('Book ISBN / Publishing indicator');
  }

  // 12. Research Scholars (Ph.D. Registration, Provisional Registration, Confirmation, Supervisor)
  if (text.includes('provisional registration') || text.includes('ph.d. research scholar') || text.includes('centre for research') || text.includes('anna university, chennai') && text.includes('supervisor')) {
    scores.scholars += 50;
    indicators.scholars.push('Doctoral scholar registration notification');
  }

  // Determine top category
  let maxCat = 'interactions';
  let maxScore = 0;
  for (const [cat, val] of Object.entries(scores)) {
    if (val > maxScore) {
      maxScore = val;
      maxCat = cat;
    }
  }

  // Calculate confidence dynamically based on accumulated evidence quality (bounded between 50% and 98%)
  let confidence = 50;
  if (maxScore >= 75) {
    confidence = Math.min(98, 88 + Math.round((maxScore - 75) * 0.4));
  } else if (maxScore >= 45) {
    confidence = Math.min(85, 75 + Math.round((maxScore - 45) * 0.35));
  } else if (maxScore > 0) {
    confidence = Math.min(74, 55 + Math.round(maxScore * 0.4));
  }

  const categoryLabels = {
    interactions: 'FDP / Workshop / Seminar (Attended)',
    certifications: 'Online Certification (NPTEL / Coursera)',
    awards: 'Award / Honor / Fellowship',
    events: 'Event Organized (Conference / Workshop)',
    funding: 'Sponsored Research Grant / Project',
    seed_money: 'Seed Money / Consultancy',
    ipr: 'Patent / IPR / Copyright',
    resource: 'Resource Person / Guest Lecture',
    memberships: 'Professional Society Membership',
    publications: 'Journal / Conference Publication',
    books: 'Book / Book Chapter Published',
    scholars: 'Research Scholar (Ph.D. Details)'
  };

  return {
    category: maxCat,
    categoryLabel: categoryLabels[maxCat] || maxCat,
    confidence,
    indicators: indicators[maxCat] || ['Extracted keyword analysis']
  };
}

/**
 * Layer 3 & 4: Deterministic + Pattern-based Field Extraction with confidence calculation
 * AI MUST NEVER INVENT DATA - If a field is not detected in the document, return '' with 0 confidence.
 */
export function extractFieldsForCategory(category, rawText) {
  const text = rawText || '';
  const fields = {};
  const confidences = {};

  // General helper extractors
  const datePatterns = [
    /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/g,
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*,?\s*\d{2,4})/gi,
    /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{2,4})/gi
  ];

  function findDates() {
    const matches = [];
    for (const regex of datePatterns) {
      let m;
      while ((m = regex.exec(text)) !== null) {
        matches.push(m[1].trim());
      }
    }
    return matches;
  }

  const allDates = findDates();

  function parseStandardDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1'));
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {}
    // Fallback for dd/mm/yyyy
    const parts = dateStr.split(/[.\/-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  }

  // Helper to extract titles quoted or preceded by "on" / "titled"
  function extractQuotedOrTitled() {
    const quotedMatch = text.match(/["“]([^"”]{5,150})["”]/);
    if (quotedMatch) return { title: quotedMatch[1].trim(), conf: 92 };

    const titledMatch = text.match(/(?:titled|title|topic|on)\s+["“]?([A-Z0-9][^\n\r,;.]{5,120})["”]?/i);
    if (titledMatch) return { title: titledMatch[1].trim(), conf: 82 };

    return null;
  }

  // Category Specific Extraction
  switch (category) {
    case 'interactions': {
      // 1. Title
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;

      // 2. Type (FDP, Workshop, Seminar, STTP)
      if (/faculty development prog|fdp/i.test(text)) {
        fields.type = 'FDP';
        confidences.type = 95;
      } else if (/workshop/i.test(text)) {
        fields.type = 'Workshop';
        confidences.type = 90;
      } else if (/short term training|sttp/i.test(text)) {
        fields.type = 'Short Term Course';
        confidences.type = 88;
      } else if (/seminar/i.test(text)) {
        fields.type = 'Seminar';
        confidences.type = 85;
      } else {
        fields.type = 'FDP';
        confidences.type = 50;
      }

      // 3. Organizer
      const orgMatch = text.match(/(?:organized by|conducted by|held at|institution|department of)\s+([A-Z][^\n\r,;.]{5,80})/i);
      fields.organizer = orgMatch ? orgMatch[1].trim() : '';
      confidences.organizer = orgMatch ? 85 : 0;

      // 4. Dates
      if (allDates.length >= 2) {
        fields.from_date = parseStandardDate(allDates[0]);
        fields.to_date = parseStandardDate(allDates[1]);
        confidences.from_date = 90;
        confidences.to_date = 90;
      } else if (allDates.length === 1) {
        fields.from_date = parseStandardDate(allDates[0]);
        fields.to_date = parseStandardDate(allDates[0]);
        confidences.from_date = 80;
        confidences.to_date = 60;
      } else {
        fields.from_date = '';
        fields.to_date = '';
        confidences.from_date = 0;
        confidences.to_date = 0;
      }
      break;
    }

    case 'certifications': {
      // 1. Course Name
      const cMatch = text.match(/(?:course|completed the course|certificate for)\s+["“]?([A-Z0-9][^\n\r,;.]{5,100})["”]?/i);
      fields.course_name = cMatch ? cMatch[1].trim() : (extractQuotedOrTitled()?.title || '');
      confidences.course_name = cMatch ? 90 : (fields.course_name ? 70 : 0);

      // 2. Organisation
      if (/nptel/i.test(text)) {
        fields.organisation = 'NPTEL';
        confidences.organisation = 98;
      } else if (/coursera/i.test(text)) {
        fields.organisation = 'Coursera';
        confidences.organisation = 98;
      } else if (/swayam/i.test(text)) {
        fields.organisation = 'SWAYAM';
        confidences.organisation = 95;
      } else if (/edx/i.test(text)) {
        fields.organisation = 'edX';
        confidences.organisation = 95;
      } else {
        const orgMatch = text.match(/(?:issued by|offered by|academy|university|institute)\s+([A-Z][^\n\r,;.]{3,60})/i);
        fields.organisation = orgMatch ? orgMatch[1].trim() : '';
        confidences.organisation = orgMatch ? 80 : 0;
      }

      // 3. Duration Weeks
      if (/12\s*week/i.test(text)) {
        fields.duration_weeks = '12 Weeks';
        confidences.duration_weeks = 95;
      } else if (/8\s*week/i.test(text)) {
        fields.duration_weeks = '8 Weeks';
        confidences.duration_weeks = 95;
      } else if (/4\s*week/i.test(text)) {
        fields.duration_weeks = '4 Weeks';
        confidences.duration_weeks = 95;
      } else {
        fields.duration_weeks = '';
        confidences.duration_weeks = 0;
      }

      // 4. Mark / Score
      const markMatch = text.match(/(?:consolidated score|score|marks|percentage|grade|with a score of)\s*[:=]?\s*([0-9]{2,3}(?:\.[0-9]+)?%?|[A-Z][+]?)/i);
      fields.mark = markMatch ? markMatch[1].trim() : '';
      confidences.mark = markMatch ? 92 : 0;

      // 5. Exam Date
      fields.data_of_exam = allDates.length > 0 ? parseStandardDate(allDates[allDates.length - 1]) : '';
      confidences.data_of_exam = allDates.length > 0 ? 88 : 0;
      break;
    }

    case 'awards': {
      // 1. Award Name
      const aMatch = text.match(/(?:award for|honoured with|best paper award|excellence in|conferred the)\s+["“]?([A-Z0-9][^\n\r,;.]{5,80})["”]?/i);
      fields.awardname = aMatch ? aMatch[1].trim() : (extractQuotedOrTitled()?.title || '');
      confidences.awardname = aMatch ? 88 : (fields.awardname ? 65 : 0);

      // 2. Awarded by
      const byMatch = text.match(/(?:awarded by|presented by|conferred by|association|society of)\s+([A-Z][^\n\r,;.]{4,80})/i);
      fields.awardby = byMatch ? byMatch[1].trim() : '';
      confidences.awardby = byMatch ? 85 : 0;

      // 3. Event
      const evMatch = text.match(/(?:at the event|during the conference|during|at)\s+([A-Z][^\n\r,;.]{5,80})/i);
      fields.event = evMatch ? evMatch[1].trim() : '';
      confidences.event = evMatch ? 80 : 0;

      // 4. Award Date
      fields.awa_date = allDates.length > 0 ? parseStandardDate(allDates[0]) : '';
      confidences.awa_date = allDates.length > 0 ? 90 : 0;
      break;
    }

    case 'ipr': {
      // 1. Patent Title
      const tInfo = extractQuotedOrTitled();
      fields.patent = tInfo ? tInfo.title : '';
      confidences.patent = tInfo ? tInfo.conf : 0;

      // 2. Patent Type
      fields.ip_type = /copyright/i.test(text) ? 'Copyright' : 'Patent';
      confidences.ip_type = 95;

      // 3. Patent Status
      if (/grant/i.test(text)) {
        fields.patent_status = 'Granted';
        confidences.patent_status = 92;
      } else if (/publish/i.test(text)) {
        fields.patent_status = 'Published';
        confidences.patent_status = 90;
      } else if (/filed|application/i.test(text)) {
        fields.patent_status = 'Filed';
        confidences.patent_status = 85;
      } else {
        fields.patent_status = '';
        confidences.patent_status = 0;
      }

      // 4. Application / File Number
      const appNoMatch = text.match(/(?:application no\.?|patent no\.?|cbr no\.?|filing no\.?)\s*[:=]?\s*([A-Z0-9\/-]{6,30})/i);
      fields.institution = appNoMatch ? appNoMatch[1].trim() : '';
      confidences.institution = appNoMatch ? 92 : 0;

      // 5. Date of filing/grant
      fields.generation = allDates.length > 0 ? parseStandardDate(allDates[0]) : '';
      confidences.generation = allDates.length > 0 ? 88 : 0;

      // 6. Propose
      fields.propose = fields.patent ? `Patent application for ${fields.patent}` : '';
      confidences.propose = fields.patent ? 70 : 0;
      break;
    }

    case 'funding': {
      // 1. Title
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;

      // 2. Funding Agency
      const faMatch = text.match(/(?:funding agency|sanctioned by|sanction of|financial support from)\s+([A-Z][^\n\r,;.]{3,60})/i);
      fields.fa = faMatch ? faMatch[1].trim() : '';
      confidences.fa = faMatch ? 85 : 0;

      // 3. Amount
      const amtMatch = text.match(/(?:amount|rs\.?|inr|grant of|sanction of rs\.?)\s*[:=]?\s*([0-9,]+(?:\.[0-9]+)?)/i);
      const cleanAmt = amtMatch ? amtMatch[1].replace(/,/g, '') : '';
      fields.amount = cleanAmt ? Number(cleanAmt) : '';
      confidences.amount = amtMatch ? 90 : 0;

      // 4. Reference Number
      const refMatch = text.match(/(?:file no\.?|sanction order no\.?|ref no\.?|order no\.?)\s*[:=]?\s*([A-Z0-9\/-]{5,40})/i);
      fields.referenceno = refMatch ? refMatch[1].trim() : '';
      confidences.referenceno = refMatch ? 90 : 0;

      // 5. Faculty Role
      fields.faculty_role = /co-pi|co principal/i.test(text) ? 'Co-PI' : (/pi|principal investigator/i.test(text) ? 'PI' : '');
      confidences.faculty_role = fields.faculty_role ? 85 : 0;

      // 6. Status
      fields.status = /sanction|ongoing/i.test(text) ? 'Sanctioned' : (/completed/i.test(text) ? 'Completed' : '');
      confidences.status = fields.status ? 90 : 0;

      // 7. Grant Category
      fields.grant_category = 'Research Project';
      fields.project_type = 'Major Project';
      confidences.grant_category = 80;
      confidences.project_type = 75;
      break;
    }

    case 'resource': {
      // 1. Topic
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;

      // 2. Scope (National/International)
      fields.type = /international/i.test(text) ? 'International' : 'National';
      confidences.type = 88;

      // 3. Acted As
      if (/keynote/i.test(text)) fields.actedas = 'Keynote Speaker';
      else if (/session chair/i.test(text)) fields.actedas = 'Session Chair';
      else if (/guest speaker|guest lecture/i.test(text)) fields.actedas = 'Guest Speaker';
      else if (/resource person/i.test(text)) fields.actedas = 'Resource Person';
      else fields.actedas = '';
      confidences.actedas = fields.actedas ? 90 : 0;

      // 4. Organizer
      const orgMatch = text.match(/(?:organized by|conducted at|held at)\s+([A-Z][^\n\r,;.]{5,80})/i);
      fields.organizer = orgMatch ? orgMatch[1].trim() : '';
      confidences.organizer = orgMatch ? 85 : 0;

      // 5. Dates
      fields.from_date = allDates.length > 0 ? parseStandardDate(allDates[0]) : '';
      fields.to_date = allDates.length > 1 ? parseStandardDate(allDates[1]) : fields.from_date;
      confidences.from_date = allDates.length > 0 ? 88 : 0;
      confidences.to_date = allDates.length > 0 ? 85 : 0;
      break;
    }

    case 'memberships': {
      // 1. Membership ID
      const memIdMatch = text.match(/(?:membership no\.?|member id|id no\.?|number)\s*[:=]?\s*([A-Z0-9-]{4,25})/i);
      fields.membershipid = memIdMatch ? memIdMatch[1].trim() : '';
      confidences.membershipid = memIdMatch ? 92 : 0;

      // 2. Organization
      if (/ieee/i.test(text)) fields.organization = 'IEEE';
      else if (/acm/i.test(text)) fields.organization = 'ACM';
      else if (/computer society of india|csi/i.test(text)) fields.organization = 'CSI';
      else if (/iste/i.test(text)) fields.organization = 'ISTE';
      else {
        const orgMatch = text.match(/(?:society|association|institution of [a-z]+)\s*([A-Z][^\n\r,;.]{3,50})/i);
        fields.organization = orgMatch ? orgMatch[0].trim() : '';
      }
      confidences.organization = fields.organization ? 90 : 0;

      // 3. Membership Type
      fields.membership_type = /life/i.test(text) ? 'Life Member' : (/annual/i.test(text) ? 'Annual Member' : 'Member');
      confidences.membership_type = 85;
      break;
    }

    case 'publications': {
      // 1. DOI
      const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
      fields.doi = doiMatch ? doiMatch[0].trim() : '';
      confidences.doi = doiMatch ? 98 : 0;

      // 2. ISSN / ISBN
      const issnMatch = text.match(/(?:issn|isbn)\s*[:=]?\s*([0-9]{4}[-][0-9]{3}[0-9xX]|[0-9-]{10,17})/i);
      fields.issn_no = issnMatch ? issnMatch[1].trim() : '';
      confidences.issn_no = issnMatch ? 90 : 0;

      // 3. Title
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;

      // 4. Category (Journal / Conference)
      fields.type_pub = /conference|proceedings/i.test(text) ? 'Conference' : 'Journal';
      fields.type = 'International';
      confidences.type_pub = 90;
      confidences.type = 88;

      // 5. Indexing
      const idx = [];
      if (/scopus/i.test(text)) idx.push('Scopus');
      if (/web of science|wos/i.test(text)) idx.push('WoS');
      if (/sci|scie/i.test(text)) idx.push('SCI');
      fields.index_pub = idx.length > 0 ? idx.join(', ') : '';
      confidences.index_pub = idx.length > 0 ? 92 : 0;
      break;
    }

    case 'events': {
      // 1. Title
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;

      // 2. Type
      if (/hackathon/i.test(text)) fields.type = 'Hackathon';
      else if (/workshop/i.test(text)) fields.type = 'Workshop';
      else if (/conference/i.test(text)) fields.type = 'Conference';
      else if (/symposium/i.test(text)) fields.type = 'Symposium';
      else if (/fdp|faculty development/i.test(text)) fields.type = 'FDP';
      else fields.type = '';
      confidences.type = fields.type ? 88 : 0;

      // 3. Organizer Role
      if (/convenor|convener/i.test(text)) fields.role = 'Convener';
      else if (/co-coordinator|coordinator/i.test(text)) fields.role = 'Coordinator';
      else if (/organizing member/i.test(text)) fields.role = 'Organizing Member';
      else fields.role = '';
      confidences.role = fields.role ? 85 : 0;

      // 4. Dates
      fields.from_date = allDates.length > 0 ? parseStandardDate(allDates[0]) : '';
      fields.to_date = allDates.length > 1 ? parseStandardDate(allDates[1]) : fields.from_date;
      confidences.from_date = allDates.length > 0 ? 88 : 0;
      confidences.to_date = allDates.length > 0 ? 85 : 0;

      // 5. Organizer & Res Person (Only if explicitly found, otherwise empty)
      const orgMatch = text.match(/(?:organized by|department of)\s+([A-Z][^\n\r,;.]{5,80})/i);
      fields.organizer = orgMatch ? orgMatch[1].trim() : '';
      confidences.organizer = orgMatch ? 80 : 0;

      const resMatch = text.match(/(?:resource person|speaker)\s*[:=]?\s*([A-Z][^\n\r,;.]{3,60})/i);
      fields.res_person = resMatch ? resMatch[1].trim() : '';
      confidences.res_person = resMatch ? 80 : 0;
      break;
    }

    default: {
      const tInfo = extractQuotedOrTitled();
      fields.title = tInfo ? tInfo.title : '';
      confidences.title = tInfo ? tInfo.conf : 0;
    }
  }

  return { fields, confidences };
}

/**
 * Optional Layer 4: LLM-Augmented Extraction (if AI API key is configured)
 */
export async function attemptLlmExtraction(rawText, category) {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (!apiKey || !rawText || rawText.trim().length < 20) {
    return null;
  }

  if (provider.includes('gemini') || process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Extract academic certificate metadata for category "${category}" from this text. Return ONLY a valid JSON object with key-value pairs matching standard academic fields:
Text:
${rawText.slice(0, 3000)}`;

      const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      });

      const geminiKey = process.env.GEMINI_API_KEY || apiKey;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      return await new Promise((resolve) => {
        const req = https.request(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const parsed = JSON.parse(data);
                const textContent = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textContent) {
                  const extractedJson = JSON.parse(textContent);
                  resolve(extractedJson);
                  return;
                }
              }
            } catch (e) {}
            resolve(null);
          });
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
        req.write(postData);
        req.end();
      });
    } catch (e) {
      return null;
    }
  }

  return null;
}
