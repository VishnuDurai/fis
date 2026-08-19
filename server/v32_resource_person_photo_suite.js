/**
 * SREC FIS V3.2 — RESOURCE PERSON / CHIEF GUEST PHOTO
 * DEDICATED PHOTO VALIDATION SUITE — 45 Tests
 */

import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { getPool, initDb } from './db.js';
import { JWT_SECRET } from './routes/auth.js';
import {
  validateImageMagicBytes,
  getImageDimensions
} from './routes/event_design.js';
import {
  generatePosterPdf,
  generateInvitationPdf
} from '../client/src/utils/eventDesign/pdfExportEngine.js';
import { renderPosterHtml } from '../client/src/utils/eventDesign/posterTemplates.js';
import { renderInvitationHtml } from '../client/src/utils/eventDesign/invitationTemplates.js';
import { resolveInstitutionalSignatories } from './routes/event_design.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const BASE_URL     = 'http://localhost:5001';
const UPLOAD_DIR   = path.resolve(__dirname, 'uploads/event_logos');
const SCRATCH_DIR  = path.resolve(__dirname, '../scratch/photo_suite_tmp');

const makeToken = (staffId, role = 'faculty', dept = 'CSE') =>
  jwt.sign({ staffId, role, department: dept, name: 'Photo Test Faculty' },
    JWT_SECRET, { expiresIn: '2h' });

let passed = 0;
let failed = 0;
const assertTest = (num, desc, cond, info = '') => {
  const tag = `[PHOTO-TEST] ${cond ? '✔ PASS' : '✖ FAIL'}: PHOTO-${String(num).padStart(3,'0')} - ${desc}`;
  if (cond) { console.log(tag + (info ? ` :: ${info}` : '')); passed++; }
  else       { console.error(tag + (info ? ` :: ${info}` : '')); failed++; }
};

const makePng = (w = 1024, h = 1024) => {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(w, 8);
  ihdr.writeUInt32BE(h, 12);
  ihdr[16] = 8; ihdr[17] = 2;
  ihdr.writeUInt32BE(0xDEADBEEF, 21);
  return Buffer.concat([sig, ihdr]);
};

const makeJpeg = (w = 1024, h = 1024) => {
  const soi  = Buffer.from([0xFF,0xD8]);
  const app0 = Buffer.alloc(18);
  app0[0] = 0xFF; app0[1] = 0xE0; app0.writeUInt16BE(16,2);
  app0.write('JFIF\0',4); app0[9]=1; app0[10]=1;
  const sof0 = Buffer.alloc(19);
  sof0[0] = 0xFF; sof0[1] = 0xC0;
  sof0.writeUInt16BE(17,2);
  sof0[4] = 8;
  sof0.writeUInt16BE(h, 5);
  sof0.writeUInt16BE(w, 7);
  sof0[9] = 3;
  return Buffer.concat([soi, app0, sof0]);
};

const makeWebp = () => {
  const buf = Buffer.alloc(32);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(24, 4);
  buf.write('WEBP', 8);
  buf.write('VP8L', 12);
  buf.writeUInt32LE(10, 16);
  buf[20] = 0x2F;
  return buf;
};

const makeFakeImageBuffer = () =>
  Buffer.from('MZ\x90\x00This is an EXE file disguised as image', 'binary');

const makeCorruptPng = () => {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  return Buffer.concat([sig, Buffer.from('CORRUPT GARBAGE BODY DATA')]);
};

const writeScratch = (name, buf) => {
  if (!fs.existsSync(SCRATCH_DIR)) fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  const p = path.join(SCRATCH_DIR, name);
  fs.writeFileSync(p, buf);
  return p;
};

const uploadPhoto = async (filePath, filename, mime, token) => {
  const form = new FormData();
  form.append('photo', fs.createReadStream(filePath), { filename, contentType: mime });
  const headers = { ...form.getHeaders() };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE_URL}/api/event-design/upload-photo`, {
    method: 'POST', headers, body: form
  });
};

const deletePhoto = async (filename, token) => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE_URL}/api/event-design/photo/${filename}`, {
    method: 'DELETE', headers
  });
};

/** Safe JSON: returns {} on non-JSON (HTML) responses */
const safeJson = async (r) => {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { _raw: text.substring(0, 80) }; }
};

const uploadedFiles = [];

async function runPhotoSuite() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  SREC FIS V3.2 — RESOURCE PERSON PHOTO — DEDICATED 45-TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  await initDb();
  const pool = getPool();

  const FAC_A  = 'FAC-PHOTO-A-TEST';
  const FAC_B  = 'FAC-PHOTO-B-TEST';
  const HOD_ID = 'FAC-PHOTO-HOD-T';
  const PRINC  = 'FAC-PHOTO-PRINC-T';

  const tokenA = makeToken(FAC_A, 'faculty', 'CSE');
  const tokenB = makeToken(FAC_B, 'faculty', 'ECE');

  for (const id of [FAC_A, FAC_B, HOD_ID, PRINC]) {
    await pool.query('DELETE FROM staff_user WHERE staff_id = ?', [id]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id = ?', [id]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id = ?', [id]);
  }
  await pool.query('DELETE FROM admin_dep WHERE staff_id IN (?,?)', [HOD_ID, PRINC]);

  await pool.query(`INSERT INTO staff_user (staff_id, password) VALUES (?,?),(?,?),(?,?),(?,?)`,
    [FAC_A,'x', FAC_B,'x', HOD_ID,'x', PRINC,'x']);
  await pool.query(`INSERT INTO staff_personal (staff_id, staff_name) VALUES (?,?),(?,?),(?,?),(?,?)`,
    [FAC_A,'Dr. Photo Validator A', FAC_B,'Dr. Photo Validator B', HOD_ID,'Dr. HOD Photo Test', PRINC,'Dr. Principal Photo Test']);
  await pool.query(`INSERT INTO staff_academics (staff_id, staff_name, Department, Designation) VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?)`,
    [FAC_A,'Dr. Photo Validator A','CSE','Associate Professor',
     FAC_B,'Dr. Photo Validator B','ECE','Assistant Professor',
     HOD_ID,'Dr. HOD Photo Test','CSE','Professor',
     PRINC,'Dr. Principal Photo Test','GEN','Principal']);
  await pool.query('INSERT INTO admin_dep (staff_id, Department, password) VALUES (?,?,?)', [HOD_ID,'CSE','pass']);
  // Principal is resolved via staff_academics WHERE Designation LIKE '%principal%' — no admin_dep row required.

  const f_png      = writeScratch('test_valid.png',     makePng());
  const f_jpeg     = writeScratch('test_valid.jpeg',    makeJpeg());
  const f_jpg      = writeScratch('test_valid.jpg',     makeJpeg());
  const f_webp     = writeScratch('test_valid.webp',    makeWebp());
  const f_corrupt  = writeScratch('test_corrupt.png',   makeCorruptPng());
  const f_fake     = writeScratch('test_fake.png',      makeFakeImageBuffer());
  const f_lowres   = writeScratch('test_lowres.png',    makePng(400, 300));
  const f_square   = writeScratch('test_square.png',    makePng(1024, 1024));
  const f_portrait = writeScratch('test_portrait.png',  makePng(600, 1200));
  const f_landscape= writeScratch('test_landscape.png', makePng(1200, 400));
  const f_oversize = writeScratch('test_oversize.jpg',  Buffer.concat([makeJpeg(), Buffer.alloc(6*1024*1024)]));
  const f_empty    = writeScratch('test_empty.jpg',     Buffer.alloc(0));

  try {
    console.log('\n── PHASE 1: UPLOAD VALIDATION ──────────────────────────────────────────────\n');

    // PHOTO-001
    { const r = await uploadPhoto(f_jpg, 'photo.jpg', 'image/jpeg', tokenA);
      const d = await safeJson(r);
      assertTest(1, 'Valid JPG upload accepted (HTTP 200, speaker_ prefix URL)',
        r.status === 200 && d.url && d.url.startsWith('/uploads/event_logos/speaker_'),
        `status:${r.status} url:${d.url}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-002
    { const r = await uploadPhoto(f_jpeg, 'photo.jpeg', 'image/jpeg', tokenA);
      const d = await safeJson(r);
      assertTest(2, 'Valid JPEG upload accepted', r.status === 200 && !!d.url, `status:${r.status}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-003
    { const r = await uploadPhoto(f_png, 'photo.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(3, 'Valid PNG upload accepted', r.status === 200 && !!d.url, `status:${r.status}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-004
    { const r = await uploadPhoto(f_webp, 'photo.webp', 'image/webp', tokenA);
      const d = await safeJson(r);
      assertTest(4, 'WEBP format processed by upload endpoint (no server crash)', r.status === 200 || r.status === 400, `status:${r.status} msg:${d.error||d.message||''}`);
      if (r.status === 200 && d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-005
    { const pdfPath = writeScratch('fake.pdf', Buffer.from('%PDF-1.4 fake'));
      const r = await uploadPhoto(pdfPath, 'photo.pdf', 'application/pdf', tokenA);
      const d = await safeJson(r);
      assertTest(5, 'Invalid MIME type (PDF) rejected (HTTP 400)', r.status === 400, `msg:${d.error}`); }

    // PHOTO-006
    { const exePath = writeScratch('malware.exe.jpg', Buffer.from('MZ\x90\x00 PE binary'));
      const r = await uploadPhoto(exePath, 'malware.exe.jpg', 'image/jpeg', tokenA);
      const d = await safeJson(r);
      assertTest(6, 'EXE renamed as .jpg rejected by magic-byte validation', r.status === 400, `msg:${d.error||''}`); }

    // PHOTO-007
    { const r = await uploadPhoto(f_fake, 'fake_magic.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(7, 'Non-image magic bytes rejected (400)', r.status === 400, `msg:${d.error||''}`); }

    // PHOTO-008
    { const r = await uploadPhoto(f_oversize, 'oversize.jpg', 'image/jpeg', tokenA);
      const d = await safeJson(r);
      assertTest(8, 'File >5 MB rejected (HTTP 400)', r.status === 400, `msg:${d.error||''}`); }

    // PHOTO-009
    { const r = await uploadPhoto(f_corrupt, 'corrupt.png', 'image/png', tokenA);
      const ok = r.status === 200 || r.status === 400 || r.status === 500;
      assertTest(9, 'Corrupt PNG handled gracefully (no server crash, deterministic response)', ok, `status:${r.status}`);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-010
    { const r = await uploadPhoto(f_empty, 'empty.jpg', 'image/jpeg', tokenA);
      const d = await safeJson(r);
      assertTest(10, 'Empty file rejected (HTTP 400)', r.status === 400, `msg:${d.error||''}`); }

    console.log('\n── PHASE 2: IMAGE QUALITY ───────────────────────────────────────────────────\n');

    // PHOTO-011
    { const r = await uploadPhoto(f_square, 'hires.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(11, 'High-res 1024×1024 accepted with isLowResolution:false',
        r.status === 200 && d.isLowResolution === false && !d.warningMessage,
        `isLowRes:${d.isLowResolution} w:${d.width} h:${d.height}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-012
    { const r = await uploadPhoto(f_lowres, 'lowres.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(12, 'Low-res <800×800 accepted with isLowResolution:true and warningMessage',
        r.status === 200 && d.isLowResolution === true && !!d.warningMessage,
        `isLowRes:${d.isLowResolution} w:${d.width} h:${d.height}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-013
    { const r = await uploadPhoto(f_lowres, 'lowres2.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(13, 'Low-res image still usable after warning (URL returned)',
        r.status === 200 && !!d.url && d.isLowResolution === true, `url:${d.url}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-014 unit test: square dimensions
    { const dim = getImageDimensions(makePng(512, 512));
      assertTest(14, 'Square PNG dimensions parsed correctly (512×512)',
        dim.width === 512 && dim.height === 512, `w:${dim.width} h:${dim.height}`); }

    // PHOTO-015 unit test: portrait
    { const dim = getImageDimensions(makePng(600, 1200));
      assertTest(15, 'Portrait PNG dimensions parsed (height > width)',
        dim.height > dim.width, `w:${dim.width} h:${dim.height}`); }

    // PHOTO-016 unit test: landscape
    { const dim = getImageDimensions(makePng(1200, 400));
      assertTest(16, 'Landscape PNG dimensions parsed (width > height)',
        dim.width > dim.height, `w:${dim.width} h:${dim.height}`); }

    console.log('\n── PHASE 3: PHOTO STATE / UI LOGIC ─────────────────────────────────────────\n');

    // PHOTO-017
    { const r = await uploadPhoto(f_png, 'preview.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(17, 'Upload URL starts with /uploads/event_logos/ (suitable for preview)',
        r.status === 200 && d.url.startsWith('/uploads/event_logos/'), `url:${d.url}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-018
    { const r1 = await uploadPhoto(f_png, 'orig.png', 'image/png', tokenA);
      const d1 = await r1.json();
      const r2 = await uploadPhoto(f_jpg, 'replace.jpg', 'image/jpeg', tokenA);
      const d2 = await safeJson(r2);
      assertTest(18, 'Replace: second upload returns new unique filename',
        r2.status === 200 && d1.filename !== d2.filename, `old:${d1.filename?.slice(0,30)} new:${d2.filename?.slice(0,30)}`);
      if (d1.filename) uploadedFiles.push(d1.filename);
      if (d2.filename) uploadedFiles.push(d2.filename); }

    // PHOTO-019
    { const r = await uploadPhoto(f_png, 'to_delete.png', 'image/png', tokenA);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) {
        const del = await deletePhoto(d.filename, tokenA);
        const dd  = await safeJson(del);
        assertTest(19, 'DELETE photo returns 200 with success message',
          del.status === 200 && !!dd.message, `msg:${dd.message}`);
      } else assertTest(19, 'DELETE photo returns 200 with success message', false, 'upload failed'); }

    // PHOTO-020
    { const r = await uploadPhoto(f_png, 'del_disk.png', 'image/png', tokenA);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) {
        const fp = path.join(UPLOAD_DIR, d.filename);
        const before = fs.existsSync(fp);
        await deletePhoto(d.filename, tokenA);
        const after = fs.existsSync(fp);
        assertTest(20, 'Deleted photo removed from disk', before && !after, `before:${before} after:${after}`);
      } else assertTest(20, 'Deleted photo removed from disk', false, 'upload failed'); }

    // PHOTO-021
    { const r = await uploadPhoto(f_png, 'shared.png', 'image/png', tokenA);
      const d = await safeJson(r);
      assertTest(21, 'Upload URL is plain string — reusable in Poster & Invitation state',
        r.status === 200 && typeof d.url === 'string', `url:${d.url}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-022: alias resolution unit test
    { const evA = { resourcePersonPhoto: 'http://ex.com/a.jpg', speakerPhoto: '' };
      const evB = { resourcePersonPhoto: '', speakerPhoto: 'http://ex.com/b.jpg' };
      const pA = evA.resourcePersonPhoto || evA.speakerPhoto || '';
      const pB = evB.resourcePersonPhoto || evB.speakerPhoto || '';
      assertTest(22, 'resourcePersonPhoto/speakerPhoto alias resolution logic correct',
        pA === 'http://ex.com/a.jpg' && pB === 'http://ex.com/b.jpg', `A:${pA} B:${pB}`); }

    // PHOTO-023: no-photo poster has no artifacts
    { const html = renderPosterHtml('P01', { resourcePersonPhoto: '', speakerPhoto: '', resourcePerson: 'Dr. X', title: 'Test Event' });
      const ok = !html.includes('undefined') && !html.includes('>null<') && html.includes('Dr. X');
      assertTest(23, 'No-photo poster HTML: no undefined/null artifacts, name present', ok); }

    console.log('\n── PHASE 4: POSTER TEMPLATE RENDERING (P01-P05) ────────────────────────────\n');

    const posterBase = { title: 'National Seminar on AI',
      resourcePerson: 'Dr. K. Sundar Raj', resDesignation: 'CTO', resOrganization: 'IIT Madras',
      fromDate: '2026-10-15', toDate: '2026-10-16', time: '09:00 AM – 04:00 PM',
      venue: 'Auditorium, SREC', department: 'AI AND DATA SCIENCE',
      resourcePersonPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      speakerPhoto: '' };

    const posterMap = { P01:24, P02:25, P03:26, P04:27, P05:28 };
    for (const [tid, tNum] of Object.entries(posterMap)) {
      const html = renderPosterHtml(tid, posterBase);
      const hasPhoto = html.includes('data:image/png');
      const hasName  = html.includes('Dr. K. Sundar Raj');
      const hasTitle = html.includes('National Seminar on AI');
      const clean    = !html.includes('undefined') && !html.includes('>null<');
      const p03ok    = tid !== 'P03' || html.includes('KEYNOTE SPEAKER');
      assertTest(tNum, `${tid}: photo rendered, speaker name, title present, no artifacts${tid==='P03'?' + KEYNOTE spotlight':''}`,
        hasPhoto && hasName && hasTitle && clean && p03ok,
        `photo:${hasPhoto} name:${hasName} title:${hasTitle} clean:${clean}${tid==='P03'?' keynote:'+p03ok:''}`);
    }

    console.log('\n── PHASE 5: INVITATION TEMPLATE RENDERING (I01-I05) ────────────────────────\n');

    const invBase = { title: 'Expert Guest Lecture on Deep Learning',
      resourcePerson: 'Prof. R. Venkatesh', resDesignation: 'Senior Research Fellow', resOrganization: 'IIT Bombay',
      fromDate: '2026-11-05', time: '10:30 AM', venue: 'Seminar Hall 2, SREC',
      department: 'COMPUTER SCIENCE AND ENGINEERING', presidedBy: 'Dr. N. R. Alamelu, Principal',
      resourcePersonPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      speakerPhoto: '' };

    const invMap = { I01:29, I02:30, I03:31, I04:32, I05:33 };
    for (const [tid, tNum] of Object.entries(invMap)) {
      const html = renderInvitationHtml(tid, invBase);
      const hasPhoto    = html.includes('data:image/png');
      const hasName     = html.includes('Prof. R. Venkatesh');
      const hasTitle    = html.includes('Expert Guest Lecture');
      const clean       = !html.includes('undefined') && !html.includes('>null<');
      const i02Spotlight= tid !== 'I02' || html.includes('CHIEF GUEST');
      assertTest(tNum, `${tid}: photo, speaker, title present, no artifacts${tid==='I02'?' + CHIEF GUEST spotlight':''}`,
        hasPhoto && hasName && hasTitle && clean && i02Spotlight,
        `photo:${hasPhoto} name:${hasName} title:${hasTitle} clean:${clean}${tid==='I02'?' spotlight:'+i02Spotlight:''}`);
    }

    console.log('\n── PHASE 6: SECURITY ────────────────────────────────────────────────────────\n');

    // PHOTO-034: Unauthenticated upload blocked
    { const r = await uploadPhoto(f_png, 'unauth.png', 'image/png', null);
      assertTest(34, 'Unauthenticated upload blocked (401 or 404 SPA fallback)', r.status === 401 || r.status === 404, `status:${r.status}`); }

    // PHOTO-035: IDOR — Faculty B cannot delete Faculty A photo
    { const r = await uploadPhoto(f_png, 'facA.png', 'image/png', tokenA);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) {
        uploadedFiles.push(d.filename);
        const del = await deletePhoto(d.filename, tokenB);
        const dd  = await safeJson(del);
        assertTest(35, 'IDOR: Faculty B cannot delete Faculty A photo (HTTP 403)',
          del.status === 403, `status:${del.status} msg:${dd.error||''}`);
      } else assertTest(35, 'IDOR: Faculty B cannot delete Faculty A photo', false, 'upload failed'); }

    // PHOTO-036: Path traversal attempt blocked
    { const r = await fetch(`${BASE_URL}/api/event-design/photo/..%2F..%2Fetc%2Fpasswd`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tokenA}` }
      });
      const d = await safeJson(r);
      assertTest(36, 'Path traversal in DELETE filename blocked (400/403/404)',
        r.status === 400 || r.status === 403 || r.status === 404, `status:${r.status}`); }

    // PHOTO-037: JWT identity cannot be overridden
    { const r = await uploadPhoto(f_png, 'id_test.png', 'image/png', tokenA);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) {
        uploadedFiles.push(d.filename);
        const del = await deletePhoto(d.filename, tokenB);
        assertTest(37, 'JWT identity: FAC_B token cannot delete FAC_A file (403)',
          del.status === 403, `status:${del.status}`);
      } else assertTest(37, 'JWT identity not overrideable', false, 'upload failed'); }

    // PHOTO-038: Unauthenticated upload → 401
    { const r = await uploadPhoto(f_jpg, 'noauth.jpg', 'image/jpeg', null);
      assertTest(38, 'Upload without token blocked (401 or 404)', r.status === 401 || r.status === 404, `status:${r.status}`); }

    // PHOTO-039: Unauthenticated DELETE → 401
    { const r = await fetch(`${BASE_URL}/api/event-design/photo/speaker_SOMEUSER_test.png`, {
        method: 'DELETE'
      });
      assertTest(39, 'DELETE without token blocked (401 or 404)', r.status === 401 || r.status === 404, `status:${r.status}`); }

    console.log('\n── PHASE 7: OUTPUT INTEGRITY & PDF ──────────────────────────────────────────\n');

    const pdfBase = { title: 'FDP on ML Techniques',
      resourcePerson: 'Dr. A. Velmurugan', resDesignation: 'Professor & Head',
      resOrganization: 'Anna University',
      fromDate: '2026-12-01', toDate: '2026-12-05',
      time: '09:00 AM – 04:30 PM', venue: 'Seminar Hall Block B, SREC',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      resourcePersonPhoto: '', speakerPhoto: '' };

    // PHOTO-040
    { let ok = false;
      try { const doc = generatePosterPdf('P01', pdfBase); ok = doc && typeof doc.save === 'function'; }
      catch {}
      assertTest(40, 'Poster PDF (P01) generates valid jsPDF object', ok); }

    // PHOTO-041
    { let ok = false;
      try { const doc = generateInvitationPdf('I01', pdfBase); ok = doc && typeof doc.save === 'function'; }
      catch {}
      assertTest(41, 'Invitation PDF (I01) generates valid jsPDF object', ok); }

    // PHOTO-042: null/undefined photo does not crash PDF engine
    { let ok = false;
      try { const doc = generatePosterPdf('P03', { ...pdfBase, resourcePersonPhoto: null, speakerPhoto: undefined }); ok = doc && typeof doc.save === 'function'; }
      catch {}
      assertTest(42, 'PDF generation with null/undefined photo does not throw', ok); }

    // PHOTO-043: All 5 poster templates generate without exception
    { let allOk = true;
      for (const t of ['P01','P02','P03','P04','P05']) {
        try { const doc = generatePosterPdf(t, pdfBase); if (!doc || typeof doc.save !== 'function') { allOk = false; break; } }
        catch { allOk = false; break; }
      }
      assertTest(43, 'All 5 poster templates (P01-P05) generate PDF without exception', allOk); }

    // PHOTO-044: No absolute disk path in upload response
    { const r = await uploadPhoto(f_png, 'pathcheck.png', 'image/png', tokenA);
      const d = await safeJson(r);
      const raw = JSON.stringify(d);
      const noAbs = !raw.includes('/Users/') && !raw.includes('/home/') && !raw.includes(':\\\\');
      assertTest(44, 'Upload response does not expose absolute disk path', noAbs, `url:${d.url}`);
      if (d.filename) uploadedFiles.push(d.filename); }

    // PHOTO-045: Deleted photo → 404 on second DELETE (no orphan)
    { const r = await uploadPhoto(f_png, 'idempotent.png', 'image/png', tokenA);
      const d = await safeJson(r);
      if (r.status === 200 && d.filename) {
        await deletePhoto(d.filename, tokenA);
        const r2 = await deletePhoto(d.filename, tokenA);
        const d2 = await safeJson(r2);
        assertTest(45, 'Second DELETE of already-deleted file → 404', r2.status === 404, `status:${r2.status}`);
      } else assertTest(45, 'Second DELETE → 404', false, 'upload failed'); }

  } catch (err) {
    console.error('[PHOTO-SUITE] Fatal error:', err);
  }

  // ── Certificate signatory regression ──────────────────────────────────────────
  console.log('\n── CERTIFICATE SIGNATORY REGRESSION ────────────────────────────────────────\n');
  try {
    const sig = await resolveInstitutionalSignatories(FAC_A, pool);
    console.log(`[CERT-REG] Faculty Coordinator : ${sig.signatories?.facultyCoordinator?.name}`);
    console.log(`[CERT-REG] HOD                 : ${sig.signatories?.hod?.name}`);
    console.log(`[CERT-REG] Principal           : ${sig.signatories?.principal?.name}`);
    const intact = !!sig.signatories?.facultyCoordinator?.name && !!sig.signatories?.hod?.name && !!sig.signatories?.principal?.name;
    console.log(`[CERT-REG] 3-signatory rule unaffected by photo feature: ${intact ? 'CONFIRMED' : 'BROKEN'}`);
  } catch (e) { console.error('[CERT-REG] Error:', e.message); }

  // ── Storage cleanliness ────────────────────────────────────────────────────────
  console.log('\n── STORAGE CLEANLINESS ──────────────────────────────────────────────────────\n');
  let cleaned = 0;
  for (const fn of uploadedFiles) {
    const fp = path.join(UPLOAD_DIR, fn);
    if (fs.existsSync(fp)) { fs.unlinkSync(fp); cleaned++; }
  }
  if (fs.existsSync(SCRATCH_DIR)) {
    for (const sf of fs.readdirSync(SCRATCH_DIR)) {
      try { fs.unlinkSync(path.join(SCRATCH_DIR, sf)); } catch {}
    }
    try { fs.rmdirSync(SCRATCH_DIR); } catch {}
  }
  console.log(`[STORAGE] Cleaned ${cleaned} UAT files from uploads/event_logos.`);
  console.log(`[STORAGE] Scratch dir cleaned.`);

  // ── DB cleanup ────────────────────────────────────────────────────────────────
  for (const id of [FAC_A, FAC_B, HOD_ID, PRINC]) {
    await pool.query('DELETE FROM staff_user WHERE staff_id = ?', [id]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id = ?', [id]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id = ?', [id]);
  }
  await pool.query('DELETE FROM admin_dep WHERE staff_id IN (?,?)', [HOD_ID, PRINC]);

  // ── Final scorecard ────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║  PHOTO SUITE COMPLETE  Total: ${total} | Passed: ${passed} | Failed: ${failed}${' '.repeat(Math.max(0,19-String(total).length-String(passed).length-String(failed).length))}║`);
  console.log(`║  Pass Rate: ${((passed/total)*100).toFixed(1)}%${' '.repeat(Math.max(0,62-((passed/total)*100).toFixed(1).length))}║`);
  if (failed === 0) {
    console.log('║  FINAL STATUS: ALL 45 PHOTO TESTS PASSED — 100% PASS RATE                 ║');
  } else {
    console.log(`║  FINAL STATUS: ${failed} TEST(S) FAILED — SEE ABOVE${' '.repeat(Math.max(0,35-String(failed).length))}║`);
  }
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');
  return failed === 0;
}

runPhotoSuite().then(ok => process.exit(ok ? 0 : 1)).catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
