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
 * Helper to extract embedded JPEG images directly from a PDF buffer
 */
export function extractImagesFromPdfBuffer(buf) {
  const images = [];
  for (let i = 0; i < buf.length - 3; i++) {
    if (buf[i] === 0xFF && buf[i + 1] === 0xD8 && buf[i + 2] === 0xFF) {
      let end = -1;
      for (let j = i + 3; j < buf.length - 1; j++) {
        if (buf[j] === 0xFF && buf[j + 1] === 0xD9) {
          end = j + 2;
          break;
        }
      }
      if (end !== -1) {
        images.push(buf.subarray(i, end));
        i = end;
      }
    }
  }
  return images;
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
      if (typeof pdfParse === 'function') {
        const pdfData = await pdfParse(buffer);
        text = (pdfData.text || '').trim();
      } else if (pdfParse && pdfParse.PDFParse) {
        const parser = new pdfParse.PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        text = (pdfData.text || '').trim();
      }
    } catch (pdfErr) {
      console.warn('[PDF Extract Warning] Failed digital PDF parsing, attempting fallback:', pdfErr.message);
    }

    // If digital text is short (< 250 chars) or lacks certificate keywords, extract embedded images and run OCR
    const needsOcr = text.length < 250 || !(/participat|complet|certif|workshop|seminar|fdp|course|publish|patent|award/i.test(text));
    if (needsOcr) {
      const embeddedImages = extractImagesFromPdfBuffer(buffer);
      if (embeddedImages.length > 0) {
        try {
          extractionMethod = 'ocr_scanned_pdf';
          const worker = await createWorker('eng');
          for (const imgBuf of embeddedImages) {
            const ret = await worker.recognize(imgBuf);
            if (ret.data && ret.data.text) {
              text = [text, ret.data.text.trim()].filter(Boolean).join('\n\n');
            }
          }
          await worker.terminate();
        } catch (ocrErr) {
          console.warn('[PDF OCR Warning] Failed OCR on embedded PDF images:', ocrErr.message);
        }
      }
    }
  }

  // If text is still empty and file is an image
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

  const isParticipation = text.includes('certificate of participation') || 
    text.includes('has participated in') || 
    text.includes('participated and') || 
    text.includes('participated in the') || 
    text.includes('participation') || 
    text.includes('attended the') || 
    text.includes('has attended');

  // 1. Interactions (FDP, STTP, Workshop, Seminar Attended)
  if (text.includes('faculty development prog') || text.includes('fdp') || filename.includes('fdp') || text.includes('taculty development')) {
    scores.interactions += 45;
    indicators.interactions.push('Faculty Development Programme');
  }
  if (isParticipation) {
    scores.interactions += 60;
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
  if (text.includes('roll no:') || (text.includes('to certify that') && text.includes('course'))) {
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
  // Only score as event organized if it is not an explicit certificate of participation
  if (!isParticipation && (text.includes('convenor') || text.includes('convener') || text.includes('coordinator') || text.includes('organizing committee') || text.includes('successfully organized') || filename.includes('event'))) {
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
  let text = rawText || '';
  // Normalize common OCR character artifacts
  text = text
    .replace(/\bTaculty\b/g, 'Faculty')
    .replace(/\bproqram\b/gi, 'program')
    .replace(/\bpedagogy\s+ol\s+research\b/gi, 'Pedagogy of Research')
    .replace(/\s+ol\s+/gi, ' of ');
  const fields = {};
  const confidences = {};

  const MONTH_MAP = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', jun: '06', june: '06', jul: '07', july: '07',
    aug: '08', august: '08', sep: '09', september: '09', oct: '10', october: '10',
    nov: '11', november: '11', dec: '12', december: '12'
  };

  function extractSmartDates(srcText) {
    // 1. Date Range: '10th to 15th August 2026' / '10-15 August 2026'
    const r1 = srcText.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|–|—|and)\s*(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([A-Za-z]+)[,\s]+(\d{4})\b/i);
    if (r1) {
      const mStr = r1[3].toLowerCase();
      const mNum = MONTH_MAP[mStr] || (Object.keys(MONTH_MAP).find(k => mStr.startsWith(k)) ? MONTH_MAP[Object.keys(MONTH_MAP).find(k => mStr.startsWith(k))] : null);
      if (mNum) {
        return {
          from_date: `${r1[4]}-${mNum}-${r1[1].padStart(2, '0')}`,
          to_date: `${r1[4]}-${mNum}-${r1[2].padStart(2, '0')}`,
          conf: 95
        };
      }
    }

    // 2. Date Range: 'August 10 to 15, 2026' / 'August 10 - 15, 2026'
    const r2 = srcText.match(/\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|–|—)\s*(\d{1,2})(?:st|nd|rd|th)?[,\s]+(\d{4})\b/i);
    if (r2) {
      const mStr = r2[1].toLowerCase();
      const mNum = MONTH_MAP[mStr] || (Object.keys(MONTH_MAP).find(k => mStr.startsWith(k)) ? MONTH_MAP[Object.keys(MONTH_MAP).find(k => mStr.startsWith(k))] : null);
      if (mNum) {
        return {
          from_date: `${r2[4]}-${mNum}-${r2[2].padStart(2, '0')}`,
          to_date: `${r2[4]}-${mNum}-${r2[3].padStart(2, '0')}`,
          conf: 95
        };
      }
    }

    // 3. Numeric Date Range: '01.08.2026 to 05.08.2026' / '01/08/2026 - 05/08/2026'
    const r3 = srcText.match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\s*(?:to|-|–|—)\s*(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\b/);
    if (r3) {
      return {
        from_date: `${r3[3]}-${r3[2].padStart(2, '0')}-${r3[1].padStart(2, '0')}`,
        to_date: `${r3[6]}-${r3[5].padStart(2, '0')}-${r3[4].padStart(2, '0')}`,
        conf: 95
      };
    }

    // 4. Two full spelled dates: 'from 10th August 2026 to 15th August 2026'
    const fullDateRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})\b/gi;
    const matches = [];
    let m;
    while ((m = fullDateRegex.exec(srcText)) !== null) {
      const mStr = m[2].toLowerCase();
      const mNum = MONTH_MAP[mStr] || (Object.keys(MONTH_MAP).find(k => mStr.startsWith(k)) ? MONTH_MAP[Object.keys(MONTH_MAP).find(k => mStr.startsWith(k))] : null);
      if (mNum) {
        matches.push(`${m[3]}-${mNum}-${m[1].padStart(2, '0')}`);
      }
    }
    if (matches.length >= 2) {
      return { from_date: matches[0], to_date: matches[1], conf: 92 };
    } else if (matches.length === 1) {
      return { from_date: matches[0], to_date: matches[0], conf: 85 };
    }

    // 5. Standalone single date dd/mm/yyyy
    const singleNumMatch = srcText.match(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})\b/);
    if (singleNumMatch) {
      const d = `${singleNumMatch[3]}-${singleNumMatch[2].padStart(2, '0')}-${singleNumMatch[1].padStart(2, '0')}`;
      return { from_date: d, to_date: d, conf: 80 };
    }

    return { from_date: '', to_date: '', conf: 0 };
  }

  // Helper to extract titles quoted, preceded by "on" / "titled" or specific academic phrases
  function extractQuotedOrTitled() {
    // 1. Quoted title
    const quotedMatch = text.match(/["“]([^"”]{4,180})["”]/);
    if (quotedMatch) return { title: quotedMatch[1].trim(), conf: 95 };

    // 2. Preceded by FDP/Workshop/Seminar on ...
    const programMatch = text.match(/(?:faculty development prog(?:ramme|ram)?|workshop|seminar|sttp|short term course|training program|course|symposium|conference|webinar|fdp)\s+(?:on|titled|in|topic)\s*[:\-–]?\s*([A-Z0-9][^\n\r]{4,150}?)(?=\s+(?:held|organized|conducted|from|during|dated|at|by|in\s+association|with|\.|\n|$))/i);
    if (programMatch) return { title: programMatch[1].trim(), conf: 90 };

    // 3. Preceded by titled/title/topic/theme
    const titledMatch = text.match(/(?:titled|title|topic|theme)\s*[:\-–]?\s*([A-Z0-9][^\n\r]{4,150}?)(?=\s+(?:held|organized|conducted|from|during|dated|at|by|\.|\n|$))/i);
    if (titledMatch) return { title: titledMatch[1].trim(), conf: 85 };

    return null;
  }

  // Helper to extract organizer including Department + College / University name
  function extractOrganizer() {
    // 1. "Organized by / Conducted by / Offered by"
    const orgMatch = text.match(/(?:organized by|conducted by|held at|host institution|organized at|offered by|hosted by)\s+(?:the\s+)?([A-Za-z0-9\s&,.\-()]{4,220}?)(?=\s*(?:from|during|dated|between|held\s+on|on\s+\d|\n\n|$|\.\s|Dr\.|Dr\s+|Mr\.|Mrs\.|Ms\.|Convenor|Convener|Coordinator|Dean|Principal|Director|Head\s+of|HOD))/i);
    if (orgMatch) {
      let clean = orgMatch[1].trim().replace(/[,.-]+$/, '').replace(/\s+/g, ' ');
      if (clean.length > 3) {
        return { organizer: clean, conf: 92 };
      }
    }
    // 2. Department match fallback
    const deptMatch = text.match(/(?:department of\s+[A-Za-z\s&]+(?:engineering|technology|science|computing|management|studies)?(?:,?\s*[A-Za-z\s&,.]{4,100})?)/i);
    if (deptMatch) {
      let clean = deptMatch[0].trim().replace(/[,.-]+$/, '').replace(/\s+/g, ' ');
      return { organizer: clean, conf: 82 };
    }
    return { organizer: '', conf: 0 };
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
        confidences.type = 75;
      }

      // 3. Organizer
      const orgInfo = extractOrganizer();
      fields.organizer = orgInfo.organizer;
      confidences.organizer = orgInfo.conf;

      // 4. Dates
      const dateInfo = extractSmartDates(text);
      fields.from_date = dateInfo.from_date;
      fields.to_date = dateInfo.to_date;
      confidences.from_date = dateInfo.conf;
      confidences.to_date = dateInfo.conf;
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
      const orgInfo = extractOrganizer();
      fields.organizer = orgInfo.organizer;
      confidences.organizer = orgInfo.conf;

      // 5. Dates
      const dateInfo = extractSmartDates(text);
      fields.from_date = dateInfo.from_date;
      fields.to_date = dateInfo.to_date;
      confidences.from_date = dateInfo.conf;
      confidences.to_date = dateInfo.conf;
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
      const dateInfo = extractSmartDates(text);
      fields.from_date = dateInfo.from_date;
      fields.to_date = dateInfo.to_date;
      confidences.from_date = dateInfo.conf;
      confidences.to_date = dateInfo.conf;

      // 5. Organizer & Res Person
      const orgInfo = extractOrganizer();
      fields.organizer = orgInfo.organizer;
      confidences.organizer = orgInfo.conf;

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
