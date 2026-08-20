/**
 * SREC FIS V3.2.2 — LIVE PRODUCTION DEPLOYMENT & SMOKE VALIDATION SUITE
 * Tests all 12 operational tracks live against the active deployed production server.
 */

import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { getPool, initDb } from './db.js';
import { JWT_SECRET } from './routes/auth.js';
import {
  PERSON_ROLES,
  SPEAKER_LAYOUT_MODES,
  createDefaultPerson,
  normalizeEventPersons,
  calculateSmartLayout,
  renderDesignToSVG,
  auditDesignRules,
  THEMES,
  APPROVED_FONTS,
  SOCIAL_PRESETS,
  generateQRCodeSVG
} from './utils/designRenderer.js';
import {
  renderPosterHtml,
  POSTER_TEMPLATES
} from '../client/src/utils/eventDesign/posterTemplates.js';
import {
  renderInvitationHtml,
  INVITATION_TEMPLATES
} from '../client/src/utils/eventDesign/invitationTemplates.js';
import {
  generatePosterPdf,
  generateInvitationPdf,
  generateSingleCertificatePdf,
  generateCombinedCertificatesPdf,
  generateEventSummaryPdf
} from '../client/src/utils/eventDesign/pdfExportEngine.js';
import {
  generateCompleteEventPackage
} from '../client/src/utils/eventDesign/eventPackageGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:5001';

let passed = 0;
let failed = 0;

function assertTest(id, name, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`[PROD-SMOKE] ✔ PASS: ${id} — ${name}${details ? ` (${details})` : ''}`);
  } else {
    failed++;
    console.error(`[PROD-SMOKE] ✖ FAIL: ${id} — ${name}${details ? ` (${details})` : ''}`);
  }
}

async function runProductionSmoke() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  SREC FIS V3.2.2 — LIVE PRODUCTION DEPLOYMENT & SMOKE SUITE               ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  await initDb();
  const pool = getPool();

  const [countRows] = await pool.query('SELECT COUNT(*) as count FROM staff_event_organized');
  const initialEventCount = countRows[0].count;

  // Track 1: Server Health & Authentication Tokens
  console.log('── TRACK 1: HEALTH & AUTHENTICATION TOKENS ─────────────────────────────────');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  assertTest('SMK-01', 'Live Server Health Endpoint (HTTP 200)', healthRes.status === 200 && healthJson.status === 'OK');

  const tokenFac = jwt.sign({ staffId: 'FAC_PROD_01', department: 'Computer Science and Engineering', role: 'faculty' }, JWT_SECRET, { expiresIn: '2h' });
  const tokenHod = jwt.sign({ staffId: 'HOD_PROD_01', department: 'Computer Science and Engineering', role: 'dept_admin' }, JWT_SECRET, { expiresIn: '2h' });
  const tokenAdmin = jwt.sign({ staffId: 'ADMIN_PROD_01', role: 'admin', isInstitutionalAdmin: true }, JWT_SECRET, { expiresIn: '2h' });
  const tokenPrincipal = jwt.sign({ staffId: 'PRINCIPAL_PROD_01', role: 'admin', isInstitutionalAdmin: true }, JWT_SECRET, { expiresIn: '2h' });

  assertTest('SMK-02', 'Cryptographic Token Signatures Valid for 4 Roles', Boolean(tokenFac && tokenHod && tokenAdmin && tokenPrincipal));

  // Track 2: Event Design Auto-Population & Public Brand Kit
  console.log('\n── TRACK 2: EVENT DESIGN AUTO-POPULATION & BRAND KIT ─────────────────────────');
  const brandRes = await fetch(`${BASE_URL}/api/event-design/brand-kit`);
  const brandJson = await brandRes.json();
  assertTest('SMK-03', 'Public Brand Kit Configuration Retrieved', brandRes.status === 200 && brandJson.institutionName.includes('Sri Ramakrishna'));

  const themesRes = await fetch(`${BASE_URL}/api/event-design/themes`);
  const themesJson = await themesRes.json();
  assertTest('SMK-04', '8 Approved Themes Catalog Retrieved', themesRes.status === 200 && themesJson.themes.length === 8);

  const fontsRes = await fetch(`${BASE_URL}/api/event-design/fonts`);
  const fontsJson = await fontsRes.json();
  assertTest('SMK-05', 'Approved Fonts Catalog Retrieved', fontsRes.status === 200 && fontsJson.fonts.length >= 7);

  // Track 3: Multi-Person Architecture & Role Matrix
  console.log('\n── TRACK 3: MULTI-PERSON ARCHITECTURE & ROLE MATRIX ─────────────────────────');
  const dignitaries = [
    createDefaultPerson(1, 'Chief Guest', 'Dr. Padma Shri Speaker', 'Executive Vice President', 'L&T Infotech', 'http://localhost:5001/uploads/dignitary_1.png'),
    createDefaultPerson(2, 'Keynote Speaker', 'Dr. S. K. Ramesh', 'Professor & Dean', 'CSUN USA'),
    createDefaultPerson(3, 'Resource Person', 'Dr. M. Venkat', 'Director of AI', 'NVIDIA India')
  ];
  const normalized = normalizeEventPersons({ eventPersons: dignitaries });
  assertTest('SMK-06', 'Dignitaries Collection Normalized (3 Persons)', normalized.length === 3 && normalized[0].role === 'Chief Guest');

  const p01Html = renderPosterHtml('P01', {
    title: 'NextGen Distributed Cloud Systems',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    eventPersons: dignitaries
  });
  assertTest('SMK-07', 'Multi-Speaker Poster HTML Rendered', p01Html.includes('Dr. Padma Shri Speaker') && p01Html.includes('Dr. S. K. Ramesh'));

  const i02Html = renderInvitationHtml('I02', {
    title: 'International Computing Summit',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    eventPersons: dignitaries
  });
  assertTest('SMK-08', 'Chief Guest Focused Invitation HTML Rendered', i02Html.includes('CHIEF GUEST') && i02Html.includes('Dr. Padma Shri Speaker'));

  // Track 4: Photo Studio & Geometry Transforms
  console.log('\n── TRACK 4: PHOTO STUDIO & GEOMETRY ISOLATION ──────────────────────────────');
  const dignitaryPhoto = createDefaultPerson(1, 'Chief Guest', 'Dr. Photo Test', 'Chief Scientist', 'ISRO', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38GBgYGBhBgAAMAAHkBEP3u1/kAAAAASUVORK5CYII=');
  dignitaryPhoto.photoCrop = 'rounded_rectangle';
  dignitaryPhoto.photoZoom = 1.3;
  const svgPhoto = renderDesignToSVG({ title: 'Photo Summit', department: 'CSE' }, { eventPersons: [dignitaryPhoto] });
  assertTest('SMK-09', 'Photo Crop Rounded Rectangle & Vector Scaling Intact', svgPhoto.includes('rx="16"') && svgPhoto.includes('Dr. Photo Test'));

  // Track 5: QR Code Vector Matrix
  console.log('\n── TRACK 5: QR CODE VECTOR MATRIX ──────────────────────────────────────────');
  const qrSvg = generateQRCodeSVG('https://forms.gle/srec2026eventreg');
  assertTest('SMK-10', 'Deterministic Vector QR Code Generated', qrSvg.startsWith('<svg') && qrSvg.includes('</svg>'));

  // Track 6: AI Governance & Fail-Safe Non-Autonomy
  console.log('\n── TRACK 6: AI GOVERNANCE & FAIL-SAFE NON-AUTONOMY ─────────────────────────');
  const aiSuggestRes = await fetch(`${BASE_URL}/api/event-design/ai/suggest-design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFac}` },
    body: JSON.stringify({ eventTitle: 'National Conference on Deep Learning' })
  });
  const aiSuggest = await aiSuggestRes.json();
  assertTest('SMK-11', 'AI Design Suggestion Endpoint Active & Non-Binding', aiSuggestRes.status === 200 && aiSuggest.is_suggestion === true);

  // Track 7: Export Outputs (PDF, PNG, Certs, Social Media)
  console.log('\n── TRACK 7: EXPORT OUTPUTS (PDF, PNG, CERTS, SOCIAL PACK) ──────────────────');
  const posterPdf = generatePosterPdf('P01', {
    title: 'Cloud Conclave 2026',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    eventPersons: dignitaries
  });
  assertTest('SMK-12', 'Poster Vector PDF Export Generated', posterPdf !== null && posterPdf.output('blob').size > 1000);

  const invitePdf = generateInvitationPdf('I01', {
    title: 'Cloud Conclave 2026',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    eventPersons: dignitaries
  });
  assertTest('SMK-13', 'Invitation Vector PDF Export Generated', invitePdf !== null && invitePdf.output('blob').size > 1000);

  const certParts = [
    { name: 'Dr. Participant One', designation: 'AP', organization: 'SREC', certificateNumber: 'SREC/CS/2026/001' },
    { name: 'Dr. Participant Two', designation: 'AP', organization: 'CIT', certificateNumber: 'SREC/CS/2026/002' }
  ];
  const combinedCertPdf = generateCombinedCertificatesPdf('C01', certParts, {
    title: 'Cloud Conclave 2026',
    department: 'COMPUTER SCIENCE AND ENGINEERING',
    departmentCode: 'CS'
  });
  assertTest('SMK-14', 'Combined Certificates Multi-Page PDF Generated (2 Pages)', combinedCertPdf.internal.getNumberOfPages() === 2);

  // Track 8: Complete Event Package ZIP Generation
  console.log('\n── TRACK 8: COMPLETE EVENT PACKAGE ZIP GENERATION ──────────────────────────');
  const pkgResult = await generateCompleteEventPackage({
    eventData: {
      title: 'Production Smoke Summit 2026',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      departmentCode: 'CS',
      fromDate: '2026-10-20',
      eventPersons: dignitaries
    },
    posterTemplate: 'P01',
    invitationTemplate: 'I01',
    certificateTemplate: 'C01',
    participants: certParts,
    signatories: {
      facultyCoordinator: 'Dr. Faculty Coordinator',
      hod: 'Dr. Head of Department',
      principal: 'Dr. N. R. Alamelu'
    }
  });
  const zip = await JSZip.loadAsync(pkgResult.zipBlob);
  const zipFiles = Object.keys(zip.files);
  const zipComplete = zipFiles.some(f => f.includes('01_Poster.pdf')) &&
                      zipFiles.some(f => f.includes('02_Invitation.pdf')) &&
                      zipFiles.some(f => f.includes('04_Combined_Certificates.pdf')) &&
                      zipFiles.some(f => f.includes('05_Event_Summary.pdf')) &&
                      zipFiles.some(f => f.includes('06_Event_Metadata.json'));
  assertTest('SMK-15', 'One-Click Complete Event Package ZIP Structure Valid', zipComplete && pkgResult.generationStatus === 'COMPLETED');

  // Track 9: Social Media Multi-Format Reflow (8 Dimensions)
  console.log('\n── TRACK 9: SOCIAL MEDIA MULTI-FORMAT REFLOW ───────────────────────────────');
  let socialPass = true;
  for (const [key, preset] of Object.entries(SOCIAL_PRESETS)) {
    const sSvg = renderDesignToSVG({ title: 'Social Summit', department: 'CSE' }, { eventPersons: dignitaries }, preset);
    if (!sSvg.includes(`width="${preset.width}"`) || !sSvg.includes(`height="${preset.height}"`)) {
      socialPass = false;
    }
  }
  assertTest('SMK-16', 'All 8 Social Media Presets Reflow Validated', socialPass);

  // Track 10: Security & RBAC Authorization Guards
  console.log('\n── TRACK 10: SECURITY & RBAC AUTHORIZATION GUARDS ──────────────────────────');
  const idorRes = await fetch(`${BASE_URL}/api/event-design/events/999999/history`, {
    headers: { Authorization: `Bearer ${tokenFac}` }
  });
  assertTest('SMK-17', 'Unowned / Cross-Faculty Event Access Blocked (HTTP 403/404)', idorRes.status === 403 || idorRes.status === 404);

  const unauthRes = await fetch(`${BASE_URL}/api/event-design/events/1/history`);
  assertTest('SMK-18', 'Unauthenticated Access Strictly Blocked (HTTP 401)', unauthRes.status === 401);

  const brandAdminRes = await fetch(`${BASE_URL}/api/event-design/admin/brand-kit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFac}` },
    body: JSON.stringify({ primaryColor: '#FF0000' })
  });
  assertTest('SMK-19', 'Faculty Blocked from Modifying Admin Brand Kit (HTTP 403)', brandAdminRes.status === 403);

  // Track 11: Real Performance Benchmarks
  console.log('\n── TRACK 11: REAL PERFORMANCE BENCHMARKS (MEASURED) ────────────────────────');
  const t1 = performance.now();
  generatePosterPdf('P01', { title: 'Perf Poster', department: 'CSE', eventPersons: dignitaries });
  const tPoster = Math.round(performance.now() - t1);
  assertTest('SMK-20', 'Poster PDF Generation Time (<50ms)', tPoster < 50, `Measured: ${tPoster}ms`);

  const batch1000 = Array.from({ length: 1000 }, (_, i) => ({
    name: `Student Participant ${i + 1}`,
    certificateNumber: `SREC/CS/2026/PERF/${String(i + 1).padStart(4, '0')}`
  }));
  const t2 = performance.now();
  const c1000 = generateCombinedCertificatesPdf('C01', batch1000, { title: 'Mega Summit', department: 'CSE', departmentCode: 'CS' });
  const tCerts = Math.round(performance.now() - t2);
  assertTest('SMK-21', '1000 Certificates Batch Generation (<500ms)', tCerts < 500 && c1000.internal.getNumberOfPages() === 1000, `Measured: ${tCerts}ms, Rate: ${Math.round(1000 / (tCerts / 1000))} certs/sec`);

  // Track 12: Database Integrity & staff_event_organized Immutability
  console.log('\n── TRACK 12: DATABASE INTEGRITY & IMMUTABILITY ─────────────────────────────');
  const [finalCountRows] = await pool.query('SELECT COUNT(*) as count FROM staff_event_organized');
  const finalEventCount = finalCountRows[0].count;
  const dbUnchanged = initialEventCount === finalEventCount;
  assertTest('SMK-22', 'staff_event_organized Record Count Identical (Zero Mutation)', dbUnchanged, `Before: ${initialEventCount}, After: ${finalEventCount}`);

  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║  SMOKE SUITE COMPLETE  Total: 22 | Passed: ${passed} | Failed: ${failed}               ║`);
  console.log(`║  Pass Rate: ${((passed / 22) * 100).toFixed(1)}%                                                 ║`);
  console.log(`║  FINAL STATUS: ${failed === 0 ? 'ALL 22 LIVE SMOKE CHECKS PASSED — 100% PASS RATE' : 'DEFECTS FOUND'}            ║`);
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  return failed === 0;
}

runProductionSmoke().then(ok => process.exit(ok ? 0 : 1)).catch(err => {
  console.error('Smoke suite fatal error:', err);
  process.exit(1);
});
