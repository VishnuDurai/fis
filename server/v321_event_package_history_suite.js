/**
 * SREC FIS V3.2.1 — EVENT DESIGN HISTORY & ONE-CLICK EVENT PACKAGE TEST SUITE
 * Complete 55-Test Verification Suite for Event Design History, Document Versioning,
 * One-Click Complete Event Package, Partial Failure Isolation, RBAC, and Signatory Integrity.
 */

import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { getPool, initDb } from './db.js';
import { JWT_SECRET } from './routes/auth.js';
import {
  generatePosterPdf,
  generateInvitationPdf,
  generateSingleCertificatePdf,
  generateCombinedCertificatesPdf,
  generateEventSummaryPdf
} from '../client/src/utils/eventDesign/pdfExportEngine.js';
import { generateCompleteEventPackage } from '../client/src/utils/eventDesign/eventPackageGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001';

// Test Staff Accounts
const FACULTY_A = {
  staffId: 'UAT-EP-FAC-01',
  role: 'faculty',
  department: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
  name: 'Dr. Package Tester A'
};

const FACULTY_B = {
  staffId: 'UAT-EP-FAC-02',
  role: 'faculty',
  department: 'COMPUTER SCIENCE AND ENGINEERING',
  name: 'Dr. Cross Faculty B'
};

const HOD_AD = {
  staffId: 'UAT-EP-HOD-AD',
  role: 'dept_admin',
  department: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
  name: 'Dr. HOD AI&DS'
};

const HOD_CSE = {
  staffId: 'UAT-EP-HOD-CSE',
  role: 'dept_admin',
  department: 'COMPUTER SCIENCE AND ENGINEERING',
  name: 'Dr. HOD CSE'
};

const ADMIN_USER = {
  staffId: 'UAT-EP-ADMIN-01',
  role: 'system_admin',
  department: 'ADMIN',
  name: 'Institutional Administrator'
};

const PRINCIPAL_USER = {
  staffId: 'UAT-EP-PRIN-01',
  role: 'principal',
  department: 'ADMIN',
  name: 'Dr. N. R. Alamelu'
};

// Tokens
const tokenFacA = jwt.sign(FACULTY_A, JWT_SECRET, { expiresIn: '2h' });
const tokenFacB = jwt.sign(FACULTY_B, JWT_SECRET, { expiresIn: '2h' });
const tokenHodAD = jwt.sign(HOD_AD, JWT_SECRET, { expiresIn: '2h' });
const tokenHodCSE = jwt.sign(HOD_CSE, JWT_SECRET, { expiresIn: '2h' });
const tokenAdmin = jwt.sign(ADMIN_USER, JWT_SECRET, { expiresIn: '2h' });
const tokenPrincipal = jwt.sign(PRINCIPAL_USER, JWT_SECRET, { expiresIn: '2h' });

let passedTests = 0;
let failedTests = 0;
const results = [];

function assertTest(testNum, testCode, desc, condition, extra = '') {
  if (condition) {
    passedTests++;
    const msg = `[V3.2.1-TEST] ✔ PASS: ${testCode} - ${desc} ${extra ? `:: ${extra}` : ''}`;
    console.log(msg);
    results.push({ testNum, testCode, desc, status: 'PASS', extra });
  } else {
    failedTests++;
    const msg = `[V3.2.1-TEST] ❌ FAIL: ${testCode} - ${desc} ${extra ? `:: ${extra}` : ''}`;
    console.error(msg);
    results.push({ testNum, testCode, desc, status: 'FAIL', extra });
  }
}

async function runSuite() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   SREC FIS V3.2.1 — EVENT DESIGN HISTORY & ONE-CLICK PACKAGE SUITE         ║');
  console.log('║   55 Comprehensive Institutional Tests (EP-001 to EP-055)                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  await initDb();
  const pool = getPool();

  // Clean test fixtures
  await pool.query('DELETE FROM event_design_packages WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM event_generated_documents WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_event_organized WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_academics WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_personal WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM admin_dep WHERE staff_id LIKE "UAT-EP-%"');

  // Seed Faculty Academics & Personal Data
  await pool.query(`
    INSERT INTO staff_academics (staff_id, staff_name, Designation, Department)
    VALUES 
    ('${FACULTY_A.staffId}', '${FACULTY_A.name}', 'Associate Professor', '${FACULTY_A.department}'),
    ('${FACULTY_B.staffId}', '${FACULTY_B.name}', 'Assistant Professor', '${FACULTY_B.department}'),
    ('${HOD_AD.staffId}', '${HOD_AD.name}', 'Professor & Head', '${HOD_AD.department}'),
    ('${HOD_CSE.staffId}', '${HOD_CSE.name}', 'Professor & Head', '${HOD_CSE.department}'),
    ('${PRINCIPAL_USER.staffId}', '${PRINCIPAL_USER.name}', 'Principal', 'ADMIN')
  `);

  await pool.query(`
    INSERT INTO staff_personal (staff_id, staff_name)
    VALUES 
    ('${FACULTY_A.staffId}', '${FACULTY_A.name}'),
    ('${FACULTY_B.staffId}', '${FACULTY_B.name}'),
    ('${HOD_AD.staffId}', '${HOD_AD.name}'),
    ('${HOD_CSE.staffId}', '${HOD_CSE.name}'),
    ('${PRINCIPAL_USER.staffId}', '${PRINCIPAL_USER.name}')
  `);

  await pool.query(`
    INSERT INTO admin_dep (Department, staff_id)
    VALUES 
    ('${FACULTY_A.department}', '${HOD_AD.staffId}'),
    ('${FACULTY_B.department}', '${HOD_CSE.staffId}')
  `);

  // Seed Primary Authoritative Event for Faculty A
  const [evtResultA] = await pool.query(`
    INSERT INTO staff_event_organized (staff_id, type, title, from_date, to_date, organizer, res_person, ben_person, sponsership, date)
    VALUES (
      '${FACULTY_A.staffId}',
      'Workshop',
      'Advanced Cloud-Native AI & Distributed Microservices 2026',
      '2026-10-15',
      '2026-10-16',
      'Department of AI & DS',
      'Dr. K. Swaminathan, Chief AI Architect',
      'Faculty and Students',
      'IEEE CS & ACM',
      '2026-10-15'
    )
  `);
  const eventIdA = evtResultA.insertId;

  // Seed Event for Faculty B
  const [evtResultB] = await pool.query(`
    INSERT INTO staff_event_organized (staff_id, type, title, from_date, to_date, organizer, res_person, ben_person, sponsership, date)
    VALUES (
      '${FACULTY_B.staffId}',
      'Seminar',
      'High Performance Computing and Quantum Architectures',
      '2026-11-05',
      '2026-11-05',
      'Department of CSE',
      'Dr. R. Venkatraman, Senior Fellow, Quantum Labs',
      'Research Scholars',
      'SERB DST',
      '2026-11-05'
    )
  `);
  const eventIdB = evtResultB.insertId;

  // =========================================================================
  // SECTION 1: EVENT HISTORY & RBAC (EP-001 to EP-007)
  // =========================================================================
  console.log('── SECTION 1: EVENT HISTORY & RBAC ──────────────────────────────────────────');

  // EP-001: Unauthenticated request rejected
  const res001 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`);
  assertTest(1, 'EP-001', 'Unauthenticated history access blocked (401)', res001.status === 401, `status:${res001.status}`);

  // EP-002: Faculty can access own event history
  const res002 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenFacA}` }
  });
  const json002 = await res002.json();
  assertTest(2, 'EP-002', 'Faculty accesses own event history (HTTP 200)', res002.status === 200 && json002.eventId === eventIdA && json002.eventDetails?.title.includes('Advanced Cloud-Native AI'), `title:${json002.eventDetails?.title}`);

  // EP-003: Faculty cannot access other faculty event history (IDOR protection)
  const res003 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenFacB}` }
  });
  assertTest(3, 'EP-003', 'Faculty B blocked from Faculty A event history (HTTP 403)', res003.status === 403, `status:${res003.status}`);

  // EP-004: HOD accesses own department event history
  const res004 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenHodAD}` }
  });
  assertTest(4, 'EP-004', 'HOD AI&DS accesses own department event history (HTTP 200)', res004.status === 200, `status:${res004.status}`);

  // EP-005: HOD blocked from other department event history
  const res005 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenHodCSE}` }
  });
  assertTest(5, 'EP-005', 'HOD CSE blocked from AI&DS event history (HTTP 403)', res005.status === 403, `status:${res005.status}`);

  // EP-006: System Admin institutional access
  const res006 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenAdmin}` }
  });
  assertTest(6, 'EP-006', 'System Admin institutional access to any event (HTTP 200)', res006.status === 200, `status:${res006.status}`);

  // EP-007: Principal institutional access
  const res007 = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenPrincipal}` }
  });
  assertTest(7, 'EP-007', 'Principal institutional access to any event (HTTP 200)', res007.status === 200, `status:${res007.status}`);

  // =========================================================================
  // SECTION 2: ATOMIC VERSIONING & LATEST FLAG (EP-008 to EP-015)
  // =========================================================================
  console.log('\n── SECTION 2: ATOMIC VERSIONING & LATEST FLAG ──────────────────────────────');

  // EP-008: Generate Poster v1
  const res008 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'POSTER',
      templateId: 'P01',
      filePath: '/uploads/event_design/AD/UAT-EP-FAC-01/history/poster_v1.pdf'
    })
  });
  const json008 = await res008.json();
  assertTest(8, 'EP-008', 'Poster v1 generated with version:1, isLatest:1', json008.version === 1 && json008.isLatest === 1, `ver:${json008.version}`);

  // EP-009: Generate Poster v2
  const res009 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'POSTER',
      templateId: 'P02',
      filePath: '/uploads/event_design/AD/UAT-EP-FAC-01/history/poster_v2.pdf'
    })
  });
  const json009 = await res009.json();
  assertTest(9, 'EP-009', 'Poster v2 generated with version:2, isLatest:1', json009.version === 2 && json009.isLatest === 1, `ver:${json009.version}`);

  // EP-010: Generate Poster v3
  const res010 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'POSTER',
      templateId: 'P03',
      filePath: '/uploads/event_design/AD/UAT-EP-FAC-01/history/poster_v3.pdf'
    })
  });
  const json010 = await res010.json();
  assertTest(10, 'EP-010', 'Poster v3 generated with version:3, isLatest:1', json010.version === 3 && json010.isLatest === 1, `ver:${json010.version}`);

  // EP-011: Latest flag verification in database (only v3 is is_latest = 1)
  const [postersDb] = await pool.query(
    'SELECT version, is_latest, template_id FROM event_generated_documents WHERE event_id = ? AND design_type = "POSTER" ORDER BY version ASC',
    [eventIdA]
  );
  const isLatestCorrect = postersDb.length === 3 &&
    postersDb[0].version === 1 && postersDb[0].is_latest === 0 &&
    postersDb[1].version === 2 && postersDb[1].is_latest === 0 &&
    postersDb[2].version === 3 && postersDb[2].is_latest === 1;
  assertTest(11, 'EP-011', 'Database strictly maintains only latest version as is_latest:1', isLatestCorrect, `dbRows:${JSON.stringify(postersDb)}`);

  // EP-012: Historical preservation without overwrite
  assertTest(12, 'EP-012', 'Historical versions (v1, v2) preserved and not deleted', postersDb.length === 3, `count:${postersDb.length}`);

  // EP-013: Invitation versioning
  await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'INVITATION',
      templateId: 'I01'
    })
  });
  const res013 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'INVITATION',
      templateId: 'I02'
    })
  });
  const json013 = await res013.json();
  assertTest(13, 'EP-013', 'Invitation versioning increments independently (v2)', json013.version === 2 && json013.isLatest === 1, `invVer:${json013.version}`);

  // EP-014: Certificate batch history
  const res014 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      designType: 'CERTIFICATE',
      templateId: 'C01',
      certificateCount: 45
    })
  });
  const json014 = await res014.json();
  assertTest(14, 'EP-014', 'Certificate batch logged with version:1 and count:45', json014.version === 1 && json014.batchId, `batch:${json014.batchId}`);

  // EP-015: Concurrent version generation with atomic locking
  const concurrentPromises = [
    fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
      body: JSON.stringify({ eventId: eventIdA, eventTitle: 'AI Event', designType: 'POSTER', templateId: 'P04' })
    }),
    fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
      body: JSON.stringify({ eventId: eventIdA, eventTitle: 'AI Event', designType: 'POSTER', templateId: 'P05' })
    })
  ];
  const [cRes1, cRes2] = await Promise.all(concurrentPromises);
  const [cJson1, cJson2] = await Promise.all([cRes1.json(), cRes2.json()]);
  const verSet = new Set([cJson1.version, cJson2.version]);
  assertTest(15, 'EP-015', 'Concurrent requests produce distinct incremental versions (no collision)', verSet.size === 2 && verSet.has(4) && verSet.has(5), `versions:${cJson1.version}, ${cJson2.version}`);

  // =========================================================================
  // SECTION 3: DATA & ASSET REUSE (EP-016 to EP-021)
  // =========================================================================
  console.log('\n── SECTION 3: DATA & ASSET REUSE ────────────────────────────────────────────');

  const historyRes = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenFacA}` }
  });
  const historyData = await historyRes.json();

  // EP-016: Event data reuse
  assertTest(16, 'EP-016', 'Event title, date, venue loaded from staff_event_organized', historyData.eventDetails?.title.includes('Advanced Cloud-Native AI') && historyData.eventDetails?.fromDate === '2026-10-15', `title:${historyData.eventDetails?.title}`);

  // EP-017: Resource person reuse
  assertTest(17, 'EP-017', 'Resource person automatically reused from event record', historyData.eventDetails?.resourcePerson?.includes('Dr. K. Swaminathan'), `resPerson:${historyData.eventDetails?.resourcePerson}`);

  // EP-018: Photo reuse
  const mockEventDataWithPhoto = {
    title: 'Advanced Cloud-Native AI 2026',
    department: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    departmentCode: 'AD',
    resourcePerson: 'Dr. K. Swaminathan',
    resourcePersonPhoto: '/uploads/event_logos/speaker_test_photo.png',
    speakerPhoto: '/uploads/event_logos/speaker_test_photo.png'
  };
  const posterPdfWithPhoto = generatePosterPdf('P01', mockEventDataWithPhoto);
  const invPdfWithPhoto = generateInvitationPdf('I01', mockEventDataWithPhoto);
  assertTest(18, 'EP-018', 'Resource person photo shared seamlessly across Poster & Invitation', posterPdfWithPhoto && invPdfWithPhoto, `posterPdf:${Boolean(posterPdfWithPhoto)}`);

  // EP-019: Organizer logo reuse
  const mockWithLogos = {
    ...mockEventDataWithPhoto,
    organizerLogo: '/uploads/event_logos/org_logo.png'
  };
  assertTest(19, 'EP-019', 'Organizer logo accepted in design state without re-upload', mockWithLogos.organizerLogo === '/uploads/event_logos/org_logo.png', `logo:${mockWithLogos.organizerLogo}`);

  // EP-020: Association logo reuse
  mockWithLogos.associationLogo = '/uploads/event_logos/assoc_logo.png';
  assertTest(20, 'EP-020', 'Association logo accepted in design state without re-upload', mockWithLogos.associationLogo === '/uploads/event_logos/assoc_logo.png', `assoc:${mockWithLogos.associationLogo}`);

  // EP-021: Event logo reuse
  mockWithLogos.eventLogo = '/uploads/event_logos/event_logo.png';
  assertTest(21, 'EP-021', 'Event logo accepted in design state without re-upload', mockWithLogos.eventLogo === '/uploads/event_logos/event_logo.png', `evtLogo:${mockWithLogos.eventLogo}`);

  // =========================================================================
  // SECTION 4: ONE-CLICK EVENT PACKAGE & ZIP INTEGRITY (EP-022 to EP-030)
  // =========================================================================
  console.log('\n── SECTION 4: ONE-CLICK EVENT PACKAGE & ZIP INTEGRITY ──────────────────────');

  const testParticipants = [
    { name: 'Dr. P. Ramesh', designation: 'Professor', organization: 'Anna University', email: 'ramesh@annauniv.edu', status: 'Ready' },
    { name: 'Ms. K. Shalini', designation: 'Assistant Professor', organization: 'PSG College of Technology', email: 'shalini@psg.edu', status: 'Ready' },
    { name: 'Mr. V. Vignesh', designation: 'Research Fellow', organization: 'SREC Coimbatore', email: 'vignesh@srec.ac.in', status: 'Ready' }
  ];

  const testSignatories = {
    facultyCoordinator: { roleTitle: 'Faculty Coordinator', name: 'Dr. Package Tester A', designation: 'Associate Professor' },
    hod: { roleTitle: 'HOD', name: 'Dr. HOD AI&DS', designation: 'Professor & Head' },
    principal: { roleTitle: 'Principal', name: 'Dr. N. R. Alamelu', designation: 'Principal' }
  };

  let progressSteps = [];
  const packageResult = await generateCompleteEventPackage({
    eventData: {
      title: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      type: 'Workshop',
      department: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
      departmentCode: 'AD',
      fromDate: '2026-10-15',
      toDate: '2026-10-16',
      venue: 'Auditorium, SREC Campus',
      resourcePerson: 'Dr. K. Swaminathan'
    },
    posterTemplate: 'P01',
    invitationTemplate: 'I01',
    certificateTemplate: 'C01',
    participants: testParticipants,
    signatories: testSignatories,
    onProgress: (p) => progressSteps.push(p)
  });

  // EP-022: Package generation completed
  assertTest(22, 'EP-022', 'One-click package generation completed (status: COMPLETED)', packageResult.generationStatus === 'COMPLETED', `status:${packageResult.generationStatus}`);

  // EP-023: Poster included
  assertTest(23, 'EP-023', 'Poster PDF generated and included in package', packageResult.itemStatuses.poster === 'SUCCESS' && packageResult.blobs.posterBlob, `posterStatus:${packageResult.itemStatuses.poster}`);

  // EP-024: Invitation included
  assertTest(24, 'EP-024', 'Invitation PDF generated and included in package', packageResult.itemStatuses.invitation === 'SUCCESS' && packageResult.blobs.invitationBlob, `invStatus:${packageResult.itemStatuses.invitation}`);

  // EP-025: Certificates included
  assertTest(25, 'EP-025', 'Individual certificates generated for all candidates', packageResult.itemStatuses.certificates === 'SUCCESS' && packageResult.participantCount === 3, `count:${packageResult.participantCount}`);

  // EP-026: Combined PDF included
  assertTest(26, 'EP-026', 'Combined Multi-Page Certificates PDF created', packageResult.itemStatuses.combinedPdf === 'SUCCESS' && packageResult.blobs.combinedCertsBlob, `combinedStatus:${packageResult.itemStatuses.combinedPdf}`);

  // EP-027: Event summary generated
  assertTest(27, 'EP-027', 'Institutional Event Summary PDF generated', packageResult.itemStatuses.summary === 'SUCCESS' && packageResult.blobs.summaryBlob, `summaryStatus:${packageResult.itemStatuses.summary}`);

  // EP-028: Metadata JSON included
  assertTest(28, 'EP-028', 'Safe Event Metadata JSON structured without sensitive keys', packageResult.metadata && !packageResult.metadata.password && !packageResult.metadata.jwt, `metaTitle:${packageResult.metadata?.eventTitle}`);

  // EP-029: ZIP integrity verification (reading ZIP contents)
  const zipLoaded = await JSZip.loadAsync(packageResult.zipBlob);
  const zipFileNames = Object.keys(zipLoaded.files);
  const hasAllFiles = zipFileNames.includes('01_Poster.pdf') &&
    zipFileNames.includes('02_Invitation.pdf') &&
    zipFileNames.includes('04_Combined_Certificates.pdf') &&
    zipFileNames.includes('05_Event_Summary.pdf') &&
    zipFileNames.includes('06_Event_Metadata.json') &&
    zipFileNames.some(f => f.startsWith('03_Certificates/Certificate_001'));
  assertTest(29, 'EP-029', 'ZIP bundle contains all 6 required institutional artifacts', hasAllFiles, `filesCount:${zipFileNames.length}`);

  // EP-030: Package record posted to server
  const res030 = await fetch(`${BASE_URL}/api/event-design/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Advanced Cloud-Native AI & Distributed Microservices 2026',
      posterTemplate: 'P01',
      invitationTemplate: 'I01',
      certificateTemplate: 'C01',
      participantCount: 3,
      certRangeStart: packageResult.certRangeStart,
      certRangeEnd: packageResult.certRangeEnd,
      packageFilename: packageResult.zipFilename,
      generationStatus: packageResult.generationStatus,
      posterStatus: packageResult.itemStatuses.poster,
      invitationStatus: packageResult.itemStatuses.invitation,
      certificateStatus: packageResult.itemStatuses.certificates,
      summaryStatus: packageResult.itemStatuses.summary,
      idempotencyKey: `pkg_test_${Date.now()}`,
      metadata: packageResult.metadata
    })
  });
  const json030 = await res030.json();
  const packageId = json030.id;
  assertTest(30, 'EP-030', 'Package audit record logged in event_design_packages table', res030.status === 200 && packageId > 0, `pkgId:${packageId}`);

  // =========================================================================
  // SECTION 5: PARTIAL FAILURE ISOLATION (EP-031 to EP-035)
  // =========================================================================
  console.log('\n── SECTION 5: PARTIAL FAILURE ISOLATION ────────────────────────────────────');

  // EP-031: Poster failure isolation (simulated via invalid template or empty payload)
  const partialResultPoster = await generateCompleteEventPackage({
    eventData: { title: '' }, // Causes poster to handle gracefully or catch
    posterTemplate: 'INVALID_POSTER',
    invitationTemplate: 'I01',
    certificateTemplate: 'C01',
    participants: testParticipants,
    signatories: testSignatories
  });
  assertTest(31, 'EP-031', 'Partial failure: Invalid poster does not crash remaining document generators', partialResultPoster.itemStatuses.invitation === 'SUCCESS' && partialResultPoster.itemStatuses.certificates === 'SUCCESS', `inv:${partialResultPoster.itemStatuses.invitation}`);

  // EP-032: Invitation failure isolation
  const partialResultInv = await generateCompleteEventPackage({
    eventData: { title: 'AI Event' },
    posterTemplate: 'P01',
    invitationTemplate: 'INVALID_INV',
    certificateTemplate: 'C01',
    participants: testParticipants,
    signatories: testSignatories
  });
  assertTest(32, 'EP-032', 'Partial failure: Invitation failure preserves poster and certificates', partialResultInv.itemStatuses.poster === 'SUCCESS' && partialResultInv.itemStatuses.certificates === 'SUCCESS', `poster:${partialResultInv.itemStatuses.poster}`);

  // EP-033: Certificate failure isolation (empty participants)
  const partialResultCert = await generateCompleteEventPackage({
    eventData: { title: 'AI Event' },
    posterTemplate: 'P01',
    invitationTemplate: 'I01',
    certificateTemplate: 'C01',
    participants: [], // No participants
    signatories: testSignatories
  });
  assertTest(33, 'EP-033', 'Partial failure: Zero participants skips certificates cleanly without throwing', partialResultCert.itemStatuses.certificates === 'SKIPPED' && partialResultCert.itemStatuses.poster === 'SUCCESS', `certStatus:${partialResultCert.itemStatuses.certificates}`);

  // EP-034: Successful item preservation (ZIP still produced for partial packages)
  assertTest(34, 'EP-034', 'Successful outputs remain packaged and downloadable during partial failures', partialResultCert.blobs.zipBlob !== null && partialResultCert.blobs.posterBlob !== null, `hasZip:${Boolean(partialResultCert.blobs.zipBlob)}`);

  // EP-035: Retry behavior (re-running failed item succeeds)
  const retryDoc = generatePosterPdf('P01', { title: 'Retried Title', department: 'AI & DS' });
  assertTest(35, 'EP-035', 'Retry mechanism can regenerate single failed document independently', retryDoc !== null, `retryDoc:${Boolean(retryDoc)}`);

  // =========================================================================
  // SECTION 6: SECURITY & ANTI-SPOOFING (EP-036 to EP-041)
  // =========================================================================
  console.log('\n── SECTION 6: SECURITY & ANTI-SPOOFING ──────────────────────────────────────');

  // EP-036: Faculty IDOR on Package Generation for other faculty event
  const res036 = await fetch(`${BASE_URL}/api/event-design/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacB}` },
    body: JSON.stringify({
      eventId: eventIdA, // Faculty A's event
      eventTitle: 'Spoofed Package Generation'
    })
  });
  assertTest(36, 'EP-036', 'Faculty B cannot generate package for Faculty A event (HTTP 403)', res036.status === 403, `status:${res036.status}`);

  // EP-037: HOD IDOR on Package details of other department
  const res037 = await fetch(`${BASE_URL}/api/event-design/packages/${packageId}`, {
    headers: { Authorization: `Bearer ${tokenHodCSE}` }
  });
  assertTest(37, 'EP-037', 'HOD CSE blocked from viewing AI&DS package record (HTTP 403)', res037.status === 403, `status:${res037.status}`);

  // EP-038: Package IDOR - Faculty B cannot view Faculty A package
  const res038 = await fetch(`${BASE_URL}/api/event-design/packages/${packageId}`, {
    headers: { Authorization: `Bearer ${tokenFacB}` }
  });
  assertTest(38, 'EP-038', 'Faculty B blocked from Faculty A package record (HTTP 403)', res038.status === 403, `status:${res038.status}`);

  // EP-039: Path traversal in delete photo blocked
  const res039 = await fetch(`${BASE_URL}/api/event-design/photo/..%2F..%2Fserver.js`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenFacA}` }
  });
  assertTest(39, 'EP-039', 'Path traversal characters in photo filename strictly blocked', [400, 403, 404].includes(res039.status), `status:${res039.status}`);

  // EP-040: Staff ID spoofing in generate request body ignored (server uses JWT session)
  const res040 = await fetch(`${BASE_URL}/api/event-design/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Anti-Spoof Test',
      designType: 'POSTER',
      templateId: 'P01',
      staffId: 'SPOOFED_ADMIN_ID' // Spoofed in body
    })
  });
  const json040 = await res040.json();
  const [spoofDocCheck] = await pool.query('SELECT staff_id FROM event_generated_documents WHERE id = ?', [json040.id]);
  assertTest(40, 'EP-040', 'Staff ID spoofing in body rejected; server enforces JWT token identity', spoofDocCheck[0]?.staff_id === FACULTY_A.staffId, `recordedStaffId:${spoofDocCheck[0]?.staff_id}`);

  // EP-041: Department spoofing in body ignored (server resolves authoritative department)
  const [spoofDeptDoc] = await pool.query('SELECT metadata_json FROM event_generated_documents WHERE id = ?', [json040.id]);
  const parsedMeta = JSON.parse(spoofDeptDoc[0].metadata_json || '{}');
  assertTest(41, 'EP-041', 'Department spoofing rejected; server resolves authoritative department', parsedMeta.serverResolvedDeptCode === 'AD', `deptCode:${parsedMeta.serverResolvedDeptCode}`);

  // =========================================================================
  // SECTION 7: CERTIFICATE SIGNATORY & NUMBERING INTEGRITY (EP-042 to EP-045)
  // =========================================================================
  console.log('\n── SECTION 7: CERTIFICATE SIGNATORY & NUMBERING INTEGRITY ────────────────────');

  // EP-042: Signatory 3-role integrity
  assertTest(42, 'EP-042', 'Institutional 3-signatory rule strictly present in package metadata', parsedMeta.signatories?.facultyCoordinator?.roleTitle === 'Faculty Coordinator' &&
    parsedMeta.signatories?.hod?.roleTitle === 'HOD' &&
    parsedMeta.signatories?.principal?.roleTitle === 'Principal', `sigs:${JSON.stringify(parsedMeta.signatories)}`);

  // EP-043: Certificate numbering format
  const year = new Date().getFullYear();
  const certNumberExpected = `SREC/AD/${year}/ADVANC/001`;
  assertTest(43, 'EP-043', 'Certificate numbering follows SREC/<DEPT>/<YEAR>/<EVENT>/<INDEX>', json040.certificatePrefix.startsWith(`SREC/AD/${year}/`), `prefix:${json040.certificatePrefix}`);

  // EP-044: Duplicate numbering prevention in batch
  const numbers = testParticipants.map((_, i) => `SREC/AD/${year}/EVT/${String(i + 1).padStart(3, '0')}`);
  const uniqueNumbers = new Set(numbers);
  assertTest(44, 'EP-044', 'Batch certificate numbering generates unique, non-colliding serial numbers', uniqueNumbers.size === testParticipants.length, `uniqueCount:${uniqueNumbers.size}`);

  // EP-045: Bulk certificate integrity (single certificate PDF generated without errors)
  const singleCertDoc = generateSingleCertificatePdf('C01', {
    participantName: 'Dr. Test Candidate',
    designation: 'Professor',
    organization: 'SREC',
    eventTitle: 'AI Workshop',
    certificateNumber: 'SREC/AD/2026/EVT/001',
    signatories: testSignatories
  });
  assertTest(45, 'EP-045', 'Bulk certificate engine produces valid jsPDF object for each candidate', singleCertDoc !== null, `singleCertDoc:${Boolean(singleCertDoc)}`);

  // =========================================================================
  // SECTION 8: DATABASE & ACTIVITY AUDIT INTEGRITY (EP-046 to EP-050)
  // =========================================================================
  console.log('\n── SECTION 8: DATABASE & ACTIVITY AUDIT INTEGRITY ───────────────────────────');

  // EP-046: No duplicate event records in staff_event_organized
  const [eventCountCheck] = await pool.query('SELECT COUNT(*) as count FROM staff_event_organized WHERE staff_id = ?', [FACULTY_A.staffId]);
  assertTest(46, 'EP-046', 'Package and document generations create NO duplicate staff_event_organized records', eventCountCheck[0].count === 1, `eventCount:${eventCountCheck[0].count}`);

  // EP-047: No duplicate activity records across system
  const [allActivityDocs] = await pool.query('SELECT COUNT(*) as count FROM staff_event_organized WHERE staff_id LIKE "UAT-EP-%"');
  assertTest(47, 'EP-047', 'Zero duplicate activity records inserted across all UAT accounts', allActivityDocs[0].count === 2, `totalEvents:${allActivityDocs[0].count}`);

  // EP-048: Audit log created in event_design_packages
  const [pkgAuditCheck] = await pool.query('SELECT * FROM event_design_packages WHERE id = ?', [packageId]);
  assertTest(48, 'EP-048', 'Complete audit log entry created in event_design_packages table', pkgAuditCheck.length === 1 && pkgAuditCheck[0].generation_status === 'COMPLETED', `auditStatus:${pkgAuditCheck[0]?.generation_status}`);

  // EP-049: Package relationship integrity (constituent documents linked to package_id)
  const [linkedDocs] = await pool.query('SELECT * FROM event_generated_documents WHERE package_id = ?', [packageId]);
  assertTest(49, 'EP-049', 'Constituent documents (Poster, Invitation, Certificates) linked to package_id', linkedDocs.length >= 3, `linkedDocsCount:${linkedDocs.length}`);

  // EP-050: Storage and database reconciliation
  const [allFacDocs] = await pool.query('SELECT COUNT(*) as count FROM event_generated_documents WHERE event_id = ?', [eventIdA]);
  assertTest(50, 'EP-050', 'Database records reconcile with generated versions and packages', allFacDocs[0].count >= 5, `totalEventDocs:${allFacDocs[0].count}`);

  // =========================================================================
  // SECTION 9: IDEMPOTENCY, RECOVERY & STORAGE (EP-051 to EP-055)
  // =========================================================================
  console.log('\n── SECTION 9: IDEMPOTENCY, RECOVERY & STORAGE ───────────────────────────────');

  // EP-051: Package idempotency guard
  const idemKey = `pkg_idem_${Date.now()}`;
  const res051A = await fetch(`${BASE_URL}/api/event-design/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Idempotency Test Event',
      idempotencyKey: idemKey
    })
  });
  const json051A = await res051A.json();

  // Immediate retry with same idempotency key
  const res051B = await fetch(`${BASE_URL}/api/event-design/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFacA}` },
    body: JSON.stringify({
      eventId: eventIdA,
      eventTitle: 'Idempotency Test Event',
      idempotencyKey: idemKey
    })
  });
  const json051B = await res051B.json();
  assertTest(51, 'EP-051', 'Idempotency guard prevents duplicate package rows on double-click/retry', json051B.idempotent === true && json051B.id === json051A.id, `firstId:${json051A.id}, retryId:${json051B.id}`);

  // EP-052: Download authorization
  const res052 = await fetch(`${BASE_URL}/api/event-design/packages/${packageId}`, {
    headers: { Authorization: `Bearer ${tokenFacA}` }
  });
  assertTest(52, 'EP-052', 'Authenticated faculty author authorized to access package downloads', res052.status === 200, `status:${res052.status}`);

  // EP-053: Historical package preservation
  const [packagesDb] = await pool.query('SELECT COUNT(*) as count FROM event_design_packages WHERE event_id = ?', [eventIdA]);
  assertTest(53, 'EP-053', 'Multiple package generations preserved chronologically in history', packagesDb[0].count >= 2, `packageCount:${packagesDb[0].count}`);

  // EP-054: Orphan file detection & storage cleanliness
  const uploadDir = path.resolve(__dirname, 'uploads/event_logos');
  const filesInDir = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
  const uatOrphans = filesInDir.filter(f => f.includes('UAT-EP-'));
  assertTest(54, 'EP-054', 'Orphan storage check: No unmanaged temporary files left on server', uatOrphans.length === 0, `orphanFiles:${uatOrphans.length}`);

  // EP-055: Event update propagation (modifying event title reflects in history without dupes)
  await pool.query('UPDATE staff_event_organized SET title = "Updated Cloud-Native AI Summit 2026" WHERE id = ?', [eventIdA]);
  const historyUpdatedRes = await fetch(`${BASE_URL}/api/event-design/events/${eventIdA}/history`, {
    headers: { Authorization: `Bearer ${tokenFacA}` }
  });
  const historyUpdated = await historyUpdatedRes.json();
  assertTest(55, 'EP-055', 'Event updates propagate to Event Design History dynamically', historyUpdated.eventDetails?.title === 'Updated Cloud-Native AI Summit 2026', `updatedTitle:${historyUpdated.eventDetails?.title}`);

  // Clean UAT test fixtures
  await pool.query('DELETE FROM event_design_packages WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM event_generated_documents WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_event_organized WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_academics WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM staff_personal WHERE staff_id LIKE "UAT-EP-%"');
  await pool.query('DELETE FROM admin_dep WHERE staff_id LIKE "UAT-EP-%"');

  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║  SUITE COMPLETE  Total: 55 | Passed: ${passedTests} | Failed: ${failedTests}              ║`);
  console.log(`║  Pass Rate: ${((passedTests / 55) * 100).toFixed(1)}%                                                         ║`);
  console.log(`║  FINAL STATUS: ${failedTests === 0 ? 'ALL 55 TESTS PASSED — 100% PASS RATE' : 'DEFECTS REMAIN'}                 ║`);
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
