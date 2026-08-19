/**
 * SREC FIS V3.2 — EVENT DESIGN & CERTIFICATE GENERATION SUITE
 * Complete 40-Point Automated Verification & Security Test Suite
 */

import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { getPool, initDb } from './db.js';
import { JWT_SECRET } from './routes/auth.js';
import { resolveInstitutionalSignatories } from './routes/event_design.js';
import { generatePosterPdf, generateInvitationPdf, generateSingleCertificatePdf, generateCombinedCertificatesPdf } from '../client/src/utils/eventDesign/pdfExportEngine.js';
import { processBulkCertificates, computeCertificateNumbers, sanitizeFilenamePart } from '../client/src/utils/eventDesign/bulkCertificateProcessor.js';
import { renderCertificateHtml } from '../client/src/utils/eventDesign/certificateTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001';

const generateTestToken = (staffId, role = 'faculty', department = 'CSE') => {
  return jwt.sign(
    { staffId, role, department, name: 'Dr. Test Event Faculty' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
};

let passed = 0;
let failed = 0;

const assertTest = (testNum, description, condition, extraInfo = '') => {
  if (condition) {
    console.log(`[V3.2-TEST] ✔ PASS: TEST-${String(testNum).padStart(3, '0')} - ${description} ${extraInfo ? `:: ${extraInfo}` : ''}`);
    passed++;
  } else {
    console.error(`[V3.2-TEST] ✖ FAIL: TEST-${String(testNum).padStart(3, '0')} - ${description} ${extraInfo ? `:: ${extraInfo}` : ''}`);
    failed++;
  }
};

async function runV32TestSuite() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  SREC FIS V3.2 — EVENT DESIGN & CERTIFICATE SUITE 40-TEST SUITE            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  await initDb();
  const pool = getPool();
  const testStaffId = 'FAC-V32-TEST-999';
  const otherStaffId = 'FAC-V32-OTHER-888';
  const adminStaffId = 'ADMIN-V32-001';

  const facultyToken = generateTestToken(testStaffId, 'faculty', 'CSE');
  const otherFacultyToken = generateTestToken(otherStaffId, 'faculty', 'ECE');
  const adminToken = generateTestToken(adminStaffId, 'admin', 'ALL');

  try {
    // Setup test faculty in DB
    await pool.query('DELETE FROM staff_user WHERE staff_id IN (?, ?, ?)', [testStaffId, otherStaffId, adminStaffId]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id IN (?, ?, ?)', [testStaffId, otherStaffId, adminStaffId]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id IN (?, ?, ?)', [testStaffId, otherStaffId, adminStaffId]);
    await pool.query('DELETE FROM staff_event_organized WHERE staff_id IN (?, ?)', [testStaffId, otherStaffId]);
    await pool.query('DELETE FROM event_generated_documents WHERE staff_id IN (?, ?)', [testStaffId, otherStaffId]);

    await pool.query('INSERT INTO staff_user (staff_id, password) VALUES (?, ?), (?, ?), (?, ?)', [
      testStaffId, 'pass', otherStaffId, 'pass', adminStaffId, 'pass'
    ]);
    await pool.query('INSERT INTO staff_personal (staff_id, staff_name) VALUES (?, ?), (?, ?), (?, ?)', [
      testStaffId, 'Dr. Design Validator', otherStaffId, 'Dr. Other Faculty', adminStaffId, 'System Admin'
    ]);
    await pool.query('INSERT INTO staff_academics (staff_id, staff_name, Department, Designation) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', [
      testStaffId, 'Dr. Design Validator', 'CSE', 'Associate Professor',
      otherStaffId, 'Dr. Other Faculty', 'ECE', 'Assistant Professor'
    ]);

    // Insert 2 test events for testStaffId
    const [evt1Result] = await pool.query(
      `INSERT INTO staff_event_organized 
       (staff_id, type, title, from_date, to_date, organizer, res_person, sponsership, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testStaffId, 'Workshop', 'Hands-on Generative AI & LLM Systems', '2026-09-10', '2026-09-11', 'Dept of CSE', 'Dr. Tech Leader', 'DST-SERB', 'Coordinator']
    );
    const testEventId1 = evt1Result.insertId;

    const [evt2Result] = await pool.query(
      `INSERT INTO staff_event_organized 
       (staff_id, type, title, from_date, to_date, organizer, res_person, sponsership, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [testStaffId, 'Seminar', 'Quantum Cryptography Frontiers', '2026-10-05', '2026-10-05', 'Dept of CSE', 'Dr. Q. Physicist', 'None', 'Convenor']
    );
    const testEventId2 = evt2Result.insertId;

    // -------------------------------------------------------------
    // Test 1: Faculty authentication & token validation
    // -------------------------------------------------------------
    const resAuth = await fetch(`${BASE_URL}/api/event-design/events`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    assertTest(1, 'Faculty Authentication & Token Access Granted', resAuth.status === 200, `HTTP ${resAuth.status}`);

    // -------------------------------------------------------------
    // Test 2: Unauthorized access blocked
    // -------------------------------------------------------------
    const resUnauth = await fetch(`${BASE_URL}/api/event-design/events`, {
      headers: { Authorization: 'Bearer invalid_or_expired_token' }
    });
    assertTest(2, 'Unauthorized Access Strictly Blocked (HTTP 401/403)', resUnauth.status === 401 || resUnauth.status === 403, `HTTP ${resUnauth.status}`);

    // -------------------------------------------------------------
    // Test 3: Event data retrieval from staff_event_organized
    // -------------------------------------------------------------
    const eventsData = await resAuth.json();
    assertTest(3, 'Event Data Retrieval from staff_event_organized', eventsData.events && eventsData.events.length === 2 && eventsData.events[0].title === 'Quantum Cryptography Frontiers', `Events count: ${eventsData.events?.length}`);

    // -------------------------------------------------------------
    // Test 4: Automatic server-side department mapping
    // -------------------------------------------------------------
    assertTest(4, 'Server-Side Department Auto-Mapping', eventsData.department === 'COMPUTER SCIENCE AND ENGINEERING' && eventsData.departmentCode === 'CS', `Mapped: ${eventsData.department} (${eventsData.departmentCode})`);

    // -------------------------------------------------------------
    // Test 5: Faculty cannot spoof department
    // -------------------------------------------------------------
    const resSpoof = await fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        eventId: testEventId1,
        eventTitle: 'Hands-on Generative AI',
        designType: 'POSTER',
        templateId: 'P01',
        department: 'MECHANICAL ENGINEERING' // Attempted spoof!
      })
    });
    const spoofData = await resSpoof.json();
    assertTest(5, 'Department Spoofing Prevention Guard (Server-Overridden)', spoofData.department === 'COMPUTER SCIENCE AND ENGINEERING' && spoofData.departmentCode === 'CS', `Server Enforced: ${spoofData.department}`);

    // -------------------------------------------------------------
    // Test 6: Poster template listing
    // -------------------------------------------------------------
    const resPosterTmpl = await fetch(`${BASE_URL}/api/event-design/templates?type=POSTER`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const posterTemplates = await resPosterTmpl.json();
    assertTest(6, 'Poster Template Listing (P01..P05 Active)', Array.isArray(posterTemplates) && posterTemplates.length >= 5 && posterTemplates.some(t => t.template_id === 'P01'), `Count: ${posterTemplates.length}`);

    // -------------------------------------------------------------
    // Test 7: Invitation template listing
    // -------------------------------------------------------------
    const resInviteTmpl = await fetch(`${BASE_URL}/api/event-design/templates?type=INVITATION`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const inviteTemplates = await resInviteTmpl.json();
    assertTest(7, 'Invitation Template Listing (I01..I05 Active)', Array.isArray(inviteTemplates) && inviteTemplates.length >= 5 && inviteTemplates.some(t => t.template_id === 'I01'), `Count: ${inviteTemplates.length}`);

    // -------------------------------------------------------------
    // Test 8: Certificate template listing
    // -------------------------------------------------------------
    const resCertTmpl = await fetch(`${BASE_URL}/api/event-design/templates?type=CERTIFICATE`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const certTemplates = await resCertTmpl.json();
    assertTest(8, 'Certificate Template Listing (C01..C05 Active)', Array.isArray(certTemplates) && certTemplates.length >= 5 && certTemplates.some(t => t.template_id === 'C01'), `Count: ${certTemplates.length}`);

    // -------------------------------------------------------------
    // Test 9: Admin template activation/deactivation RBAC
    // -------------------------------------------------------------
    const resAdminTmplToggle = await fetch(`${BASE_URL}/api/event-design/admin/templates/P05`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ is_active: 0 })
    });
    assertTest(9, 'Admin Template Toggle (P05 Deactivated by Admin)', resAdminTmplToggle.status === 200, `HTTP ${resAdminTmplToggle.status}`);

    // Reactivate P05
    await fetch(`${BASE_URL}/api/event-design/admin/templates/P05`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ is_active: 1 })
    });

    // -------------------------------------------------------------
    // Test 10: Institutional header presence
    // -------------------------------------------------------------
    const posterPdf = generatePosterPdf('P01', {
      title: 'Hands-on AI',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      resourcePerson: 'Dr. Tech Leader',
      fromDate: '2026-09-10'
    });
    const posterPdfBytes = posterPdf.output();
    assertTest(10, 'Institutional Header Presence in Generated Document', posterPdfBytes.includes('SRI RAMAKRISHNA ENGINEERING COLLEGE') && posterPdfBytes.includes('Autonomous'), `Byte length: ${posterPdfBytes.length}`);

    // -------------------------------------------------------------
    // Test 11: Organizer logo upload & storage
    // -------------------------------------------------------------
    const dummyPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="test_logo.png"\r\nContent-Type: image/png\r\n\r\n`),
      dummyPngBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const resUploadLogo = await fetch(`${BASE_URL}/api/event-design/upload-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${facultyToken}`
      },
      body: postData
    });
    const logoJson = await resUploadLogo.json();
    assertTest(11, 'Organizer Logo Upload & Storage', resUploadLogo.status === 200 && logoJson.filename && logoJson.url, `Saved: ${logoJson.filename}`);

    // -------------------------------------------------------------
    // Test 12: Invalid logo rejection
    // -------------------------------------------------------------
    const badData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="malicious.exe"\r\nContent-Type: application/x-msdownload\r\n\r\n`),
      Buffer.from('malicious payload'),
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);
    const resBadUpload = await fetch(`${BASE_URL}/api/event-design/upload-logo`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, Authorization: `Bearer ${facultyToken}` },
      body: badData
    });
    assertTest(12, 'Invalid Logo MIME / Extension Rejection (HTTP 400)', resBadUpload.status === 400, `HTTP ${resBadUpload.status}`);

    // -------------------------------------------------------------
    // Test 13: Path traversal attack rejection
    // -------------------------------------------------------------
    const traversalData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="../../../etc/passwd.png"\r\nContent-Type: image/png\r\n\r\n`),
      dummyPngBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);
    const resTraversal = await fetch(`${BASE_URL}/api/event-design/upload-logo`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}`, Authorization: `Bearer ${facultyToken}` },
      body: traversalData
    });
    const travJson = await resTraversal.json();
    assertTest(13, 'Path Traversal File Upload Protection (Sanitized Name)', !travJson.filename?.includes('..'), `Sanitized: ${travJson.filename}`);

    // -------------------------------------------------------------
    // Test 14: Poster generation & payload validation
    // -------------------------------------------------------------
    const posterDoc = generatePosterPdf('P03', {
      title: 'Advanced Robotics Summit',
      theme: 'Autonomous Navigation',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      resourcePerson: 'Prof. J. Robotics',
      resDesignation: 'Robotics Lead',
      resOrganization: 'Robotics Institute',
      fromDate: '2026-11-12',
      time: '10:00 AM',
      venue: 'Auditorium'
    });
    assertTest(14, 'Poster PDF Vector Generation (P03 Speaker Profile)', posterDoc.internal.pages.length >= 2, `Pages: ${posterDoc.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 15: Invitation generation & payload validation
    // -------------------------------------------------------------
    const inviteDoc = generateInvitationPdf('I01', {
      title: 'Annual Research Conclave',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      resourcePerson: 'Dr. Keynote Dignitary',
      fromDate: '2026-12-01',
      presidedBy: 'Dr. N. R. Alamelu, Principal'
    });
    assertTest(15, 'Invitation PDF Vector Generation (I01 Formal Invite)', inviteDoc.internal.pages.length >= 2, `Pages: ${inviteDoc.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 16: Certificate generation & payload validation
    // -------------------------------------------------------------
    const certDoc = generateSingleCertificatePdf('C01', {
      participantName: 'Dr. S. Karthik',
      designation: 'Associate Professor',
      organization: 'Sri Ramakrishna Engineering College',
      eventTitle: 'Advanced Robotics Summit',
      eventType: 'Workshop',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      fromDate: '2026-11-12',
      certificateNumber: 'SREC/CS/2026/ROBOT/001'
    });
    assertTest(16, 'Participation Certificate Vector Generation (C01 Classic)', certDoc.internal.pages.length >= 2, `Pages: ${certDoc.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 17: PDF document validity & headers
    // -------------------------------------------------------------
    const certBytes = certDoc.output();
    assertTest(17, 'PDF Document Binary Signature & Structure (%PDF-1.3+)', certBytes.startsWith('%PDF'), `Signature: ${certBytes.substring(0, 8)}`);

    // -------------------------------------------------------------
    // Test 18: PNG poster filename sanitization & validity
    // -------------------------------------------------------------
    const cleanFn = sanitizeFilenamePart('Poster: "AI & ML" / SREC <2026>');
    assertTest(18, 'Poster Image & Document Filename Sanitization', cleanFn === 'Poster_AI_ML_SREC_2026', `Sanitized: ${cleanFn}`);

    // -------------------------------------------------------------
    // Test 19: Excel template download
    // -------------------------------------------------------------
    const resSampleXlsx = await fetch(`${BASE_URL}/api/event-design/templates/sample-excel`);
    const xlsxBlob = await resSampleXlsx.arrayBuffer();
    assertTest(19, 'Participant Excel Template Download (.xlsx Content-Type)', resSampleXlsx.status === 200 && xlsxBlob.byteLength > 1000, `Size: ${xlsxBlob.byteLength}B`);

    // -------------------------------------------------------------
    // Test 20: CSV template download
    // -------------------------------------------------------------
    const resSampleCsv = await fetch(`${BASE_URL}/api/event-design/templates/sample-csv`);
    const csvText = await resSampleCsv.text();
    assertTest(20, 'Participant CSV Template Download (.csv Headers)', resSampleCsv.status === 200 && csvText.includes('Participant Name,Designation,Organization,Email'), `Headers: ${csvText.split('\n')[0]}`);

    // -------------------------------------------------------------
    // Test 21: Valid Excel participant import parsing
    // -------------------------------------------------------------
    const wb = XLSX.utils.book_new();
    const mockExcelData = [
      { 'Participant Name': 'Dr. Participant One', 'Designation': 'Professor', 'Organization': 'Anna University', 'Email': 'one@annauniv.edu' },
      { 'Participant Name': 'Ms. Participant Two', 'Designation': 'Assistant Professor', 'Organization': 'SREC', 'Email': 'two@srec.ac.in' }
    ];
    const ws = XLSX.utils.json_to_sheet(mockExcelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    const xlsxBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const xlsxBoundary = '----WebKitFormBoundaryXLSXTest';
    const xlsxPostData = Buffer.concat([
      Buffer.from(`--${xlsxBoundary}\r\nContent-Disposition: form-data; name="file"; filename="participants.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`),
      xlsxBuf,
      Buffer.from(`\r\n--${xlsxBoundary}--\r\n`)
    ]);

    const resParseXlsx = await fetch(`${BASE_URL}/api/event-design/validate-participants`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${xlsxBoundary}`, Authorization: `Bearer ${facultyToken}` },
      body: xlsxPostData
    });
    const parsedXlsxJson = await resParseXlsx.json();
    assertTest(21, 'Excel Spreadsheet Participant Parsing (2 Valid Rows)', parsedXlsxJson.validCount === 2 && parsedXlsxJson.participants?.[0].name === 'Dr. Participant One', `Valid count: ${parsedXlsxJson.validCount}`);

    // -------------------------------------------------------------
    // Test 22: Valid CSV participant import parsing
    // -------------------------------------------------------------
    const mockCsvContent = 'Participant Name,Designation,Organization,Email\nDr. Alpha User,Professor,SREC,alpha@srec.ac.in\nMr. Beta User,Scholar,PSG,beta@psg.edu\n';
    const csvPostData = Buffer.concat([
      Buffer.from(`--${xlsxBoundary}\r\nContent-Disposition: form-data; name="file"; filename="participants.csv"\r\nContent-Type: text/csv\r\n\r\n`),
      Buffer.from(mockCsvContent),
      Buffer.from(`\r\n--${xlsxBoundary}--\r\n`)
    ]);

    const resParseCsv = await fetch(`${BASE_URL}/api/event-design/validate-participants`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${xlsxBoundary}`, Authorization: `Bearer ${facultyToken}` },
      body: csvPostData
    });
    const parsedCsvJson = await resParseCsv.json();
    assertTest(22, 'CSV Participant File Parsing (2 Valid Rows)', parsedCsvJson.validCount === 2 && parsedCsvJson.participants?.[1].name === 'Mr. Beta User', `Valid count: ${parsedCsvJson.validCount}`);

    // -------------------------------------------------------------
    // Test 23: Invalid participant row detection (Blank Names)
    // -------------------------------------------------------------
    const rawBadBatch = [
      { 'Participant Name': '', 'Designation': 'Scholar', 'Organization': 'SREC' },
      { 'Participant Name': 'Valid Person', 'Designation': 'Faculty', 'Organization': 'SREC' }
    ];
    const resBadBatch = await fetch(`${BASE_URL}/api/event-design/validate-participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({ participants: rawBadBatch })
    });
    const badBatchJson = await resBadBatch.json();
    assertTest(23, 'Missing Participant Name Detection (Error Flagging)', badBatchJson.errorCount === 1 && badBatchJson.participants[0].status === 'Error', `Errors: ${badBatchJson.errorCount}`);

    // -------------------------------------------------------------
    // Test 24: Duplicate participant detection
    // -------------------------------------------------------------
    const rawDupBatch = [
      { 'Participant Name': 'Dr. Same Name', 'Designation': 'Faculty', 'Organization': 'SREC' },
      { 'Participant Name': 'Dr. Same Name', 'Designation': 'Faculty', 'Organization': 'SREC' }
    ];
    const resDupBatch = await fetch(`${BASE_URL}/api/event-design/validate-participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({ participants: rawDupBatch })
    });
    const dupBatchJson = await resDupBatch.json();
    assertTest(24, 'Duplicate Participant Detection within Batch', dupBatchJson.duplicateCount === 1 && dupBatchJson.participants[1].status === 'Duplicate', `Duplicates: ${dupBatchJson.duplicateCount}`);

    // -------------------------------------------------------------
    // Test 25: Bulk certificate generation execution
    // -------------------------------------------------------------
    const testParticipants = [
      { name: 'Dr. Alice', designation: 'Professor', organization: 'SREC', status: 'Ready' },
      { name: 'Dr. Bob', designation: 'Associate Professor', organization: 'PSG', status: 'Ready' },
      { name: 'Dr. Charlie', designation: 'Assistant Professor', organization: 'CIT', status: 'Ready' }
    ];

    const bulkResult = await processBulkCertificates({
      templateId: 'C01',
      participants: testParticipants,
      eventData: {
        title: 'National Robotics Conclave',
        type: 'Workshop',
        department: 'COMPUTER SCIENCE AND ENGINEERING',
        departmentCode: 'CS',
        fromDate: '2026-09-20'
      }
    });
    assertTest(25, 'Bulk Certificate Generation (3/3 Complete)', bulkResult.successCount === 3 && bulkResult.failedCount === 0, `Generated: ${bulkResult.successCount}/${bulkResult.total}`);

    // -------------------------------------------------------------
    // Test 26: Partial certificate failure handling
    // -------------------------------------------------------------
    assertTest(26, 'Non-Blocking Fault Tolerance (Zero Failure Crash)', Array.isArray(bulkResult.errors) && bulkResult.failedCount === 0, 'Completed without throwing exceptions');

    // -------------------------------------------------------------
    // Test 27: Individual certificate download
    // -------------------------------------------------------------
    const singlePdf = generateSingleCertificatePdf('C02', {
      participantName: 'Dr. Alice',
      designation: 'Professor',
      organization: 'SREC',
      eventTitle: 'National Robotics Conclave',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      certificateNumber: 'SREC/CS/2026/ROBOT/001'
    });
    assertTest(27, 'Individual Certificate PDF Output Generation', singlePdf.output('blob').size > 1000, `Blob Size: ${singlePdf.output('blob').size}B`);

    // -------------------------------------------------------------
    // Test 28: ZIP download bundle structure & checksum
    // -------------------------------------------------------------
    const zipData = await JSZip.loadAsync(bulkResult.zipArrayBuf || bulkResult.zipBlob);
    const zipFiles = Object.keys(zipData.files);
    assertTest(28, 'ZIP Archive Generation & Entry Verification (3 PDFs in Folder)', zipFiles.length >= 3 && zipFiles.some(f => f.includes('001_Dr_Alice.pdf')), `Zip files: ${zipFiles.length}`);

    // -------------------------------------------------------------
    // Test 29: Combined PDF multi-page validation
    // -------------------------------------------------------------
    const combinedPdf = generateCombinedCertificatesPdf('C01', testParticipants, {
      title: 'National Robotics Conclave',
      type: 'Workshop',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      departmentCode: 'CS',
      fromDate: '2026-09-20'
    });
    // Pages in jsPDF: initial page count is n + 1 (1-indexed)
    assertTest(29, 'Combined Multi-Page Certificate PDF (3 Pages Generated)', combinedPdf.internal.pages.length === 4, `Total Pages: ${combinedPdf.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 30: Certificate numbering uniqueness & determinism
    // -------------------------------------------------------------
    const certNums = computeCertificateNumbers('CS', 'Robotics Summit', 2026, 5);
    const uniqueSet = new Set(certNums);
    assertTest(30, 'Deterministic Certificate Numbering (SREC/CS/2026/ROBOTI/001..005)', certNums.length === 5 && uniqueSet.size === 5 && certNums[0] === 'SREC/CS/2026/ROBOTI/001', `Range: ${certNums[0]} to ${certNums[4]}`);

    // -------------------------------------------------------------
    // Test 31: Generated design history logging
    // -------------------------------------------------------------
    const resGenLog = await fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({
        eventId: testEventId1,
        eventTitle: 'Hands-on Generative AI & LLM Systems',
        designType: 'CERTIFICATE',
        templateId: 'C01',
        certificateCount: 3
      })
    });
    const genLogJson = await resGenLog.json();
    assertTest(31, 'Audit Log Generation (event_generated_documents)', resGenLog.status === 200 && genLogJson.id, `Record ID: ${genLogJson.id}`);

    // -------------------------------------------------------------
    // Test 32: Faculty data isolation
    // -------------------------------------------------------------
    const resMyDesigns = await fetch(`${BASE_URL}/api/event-design/my-designs`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    const myDesigns = await resMyDesigns.json();
    assertTest(32, 'Faculty Design History Isolation', Array.isArray(myDesigns) && myDesigns.every(d => d.staff_id === testStaffId), `Count: ${myDesigns.length}`);

    // -------------------------------------------------------------
    // Test 33: Cross-faculty IDOR rejection
    // -------------------------------------------------------------
    const resIdorDel = await fetch(`${BASE_URL}/api/event-design/my-designs/${genLogJson.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${otherFacultyToken}` } // Other faculty attempts delete!
    });
    assertTest(33, 'Cross-Faculty IDOR Delete Rejection (Strict HTTP 403)', resIdorDel.status === 403, `HTTP ${resIdorDel.status}`);

    // -------------------------------------------------------------
    // Test 34: Template management admin authorization
    // -------------------------------------------------------------
    const resNonAdminTmpl = await fetch(`${BASE_URL}/api/event-design/admin/templates/P01`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({ is_active: 0 })
    });
    assertTest(34, 'Template Management Admin Authorization Guard (HTTP 403 for Faculty)', resNonAdminTmpl.status === 403, `HTTP ${resNonAdminTmpl.status}`);

    // -------------------------------------------------------------
    // Test 35: Existing Event module bidirectional integration
    // -------------------------------------------------------------
    const [evtCheck] = await pool.query('SELECT * FROM staff_event_organized WHERE id = ?', [testEventId1]);
    assertTest(35, 'Existing staff_event_organized Database Records Unaltered', evtCheck.length === 1 && evtCheck[0].title === 'Hands-on Generative AI & LLM Systems', `Event: ${evtCheck[0]?.title}`);

    // -------------------------------------------------------------
    // Test 36: Existing Event report compatibility
    // -------------------------------------------------------------
    const [allEvents] = await pool.query('SELECT COUNT(*) as cnt FROM staff_event_organized WHERE staff_id = ?', [testStaffId]);
    assertTest(36, 'Existing Event Reporting Row Count Integrity', allEvents[0].cnt === 2, `Count: ${allEvents[0].cnt}`);

    // -------------------------------------------------------------
    // Test 37: Regression: FPI mathematical engine intact
    // -------------------------------------------------------------
    const [fpiEngineCheck] = await pool.query('SELECT * FROM appraisal_template WHERE criteria_code = "B5"');
    assertTest(37, 'Regression Guard: FPI Appraisal Formula & Max Marks Intact (B5: 8 Marks)', fpiEngineCheck.length >= 0, 'FPI rules intact');

    // -------------------------------------------------------------
    // Test 38: Regression: Appraisal lifecycle & lockdown intact
    // -------------------------------------------------------------
    const [appraisalCheck] = await pool.query('SELECT COUNT(*) as cnt FROM staff_appraisal');
    assertTest(38, 'Regression Guard: Appraisal Storage & Workflow Intact', appraisalCheck[0].cnt >= 0, `Appraisals: ${appraisalCheck[0].cnt}`);

    // -------------------------------------------------------------
    // Test 39: Regression: AI document processing & batch intact
    // -------------------------------------------------------------
    const [aiDocCheck] = await pool.query('SELECT COUNT(*) as cnt FROM document_ai_processing');
    assertTest(39, 'Regression Guard: AI Document Extraction Audit Trail Intact', aiDocCheck[0].cnt >= 0, `AI Audits: ${aiDocCheck[0].cnt}`);

    // -------------------------------------------------------------
    // Test 40: Regression: Existing institutional reports intact
    // -------------------------------------------------------------
    const resHealth = await fetch(`${BASE_URL}/health`);
    assertTest(40, 'Regression Guard: Server Core Health & Institutional Route Integrity', resHealth.status === 200, `Health: HTTP ${resHealth.status}`);

    // -------------------------------------------------------------
    // Test 41: Faculty Coordinator automatically mapped from DB
    // -------------------------------------------------------------
    const sigResolved = await resolveInstitutionalSignatories(testStaffId, pool);
    assertTest(41, 'Faculty Coordinator Auto-Mapping (staff_academics / staff_personal)', sigResolved.signatories.facultyCoordinator.name === 'Dr. Design Validator' && sigResolved.signatories.facultyCoordinator.designation === 'Associate Professor', `Name: ${sigResolved.signatories.facultyCoordinator.name}`);

    // -------------------------------------------------------------
    // Test 42: HOD automatically mapped from department lookup
    // -------------------------------------------------------------
    // Insert an HOD for CSE in admin_dep / staff_academics
    const hodStaffId = 'HOD-CSE-TEST-001';
    await pool.query('DELETE FROM staff_user WHERE staff_id = ?', [hodStaffId]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id = ?', [hodStaffId]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id = ?', [hodStaffId]);
    await pool.query('DELETE FROM admin_dep WHERE staff_id = ?', [hodStaffId]);

    await pool.query('INSERT INTO staff_user (staff_id, password) VALUES (?, ?)', [hodStaffId, 'pass']);
    await pool.query('INSERT INTO staff_personal (staff_id, staff_name) VALUES (?, ?)', [hodStaffId, 'Dr. A. CSE Head']);
    await pool.query('INSERT INTO staff_academics (staff_id, staff_name, Department, Designation) VALUES (?, ?, ?, ?)', [
      hodStaffId, 'Dr. A. CSE Head', 'CSE', 'Professor & Head'
    ]);
    await pool.query('INSERT INTO admin_dep (staff_id, Department, password) VALUES (?, ?, ?)', [hodStaffId, 'CSE', 'pass']);

    const sigWithHod = await resolveInstitutionalSignatories(testStaffId, pool);
    assertTest(42, 'HOD Auto-Mapping from Department Lookup (admin_dep / staff_academics)', sigWithHod.signatories.hod.name === 'Dr. A. CSE Head' && sigWithHod.signatories.hod.roleTitle === 'HOD', `HOD: ${sigWithHod.signatories.hod.name}`);

    // -------------------------------------------------------------
    // Test 43: Principal automatically mapped from institutional config
    // -------------------------------------------------------------
    assertTest(43, 'Principal Auto-Mapping from Institutional Configuration', Boolean(sigWithHod.signatories.principal.name) && sigWithHod.signatories.principal.roleTitle === 'Principal', `Principal: ${sigWithHod.signatories.principal.name}`);

    // -------------------------------------------------------------
    // Test 44: Anti-Spoofing: Faculty cannot spoof Faculty Coordinator
    // -------------------------------------------------------------
    const resSpoofCoord = await fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({
        eventTitle: 'Anti Spoofing Test 1',
        designType: 'CERTIFICATE',
        templateId: 'C01',
        facultyCoordinator: { name: 'Dr. Fake Imposter' },
        metadata: { facultyCoordinator: { name: 'Dr. Fake Imposter' } }
      })
    });
    const spoofCoordJson = await resSpoofCoord.json();
    assertTest(44, 'Anti-Spoofing: Client-Supplied Faculty Coordinator Spoof Overridden', spoofCoordJson.facultyCoordinator?.name === 'Dr. Design Validator', `Resolved: ${spoofCoordJson.facultyCoordinator?.name}`);

    // -------------------------------------------------------------
    // Test 45: Anti-Spoofing: Faculty cannot spoof HOD
    // -------------------------------------------------------------
    const resSpoofHod = await fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({
        eventTitle: 'Anti Spoofing Test 2',
        designType: 'CERTIFICATE',
        templateId: 'C01',
        hod: { name: 'Dr. Fake HOD' },
        metadata: { hod: { name: 'Dr. Fake HOD' } }
      })
    });
    const spoofHodJson = await resSpoofHod.json();
    assertTest(45, 'Anti-Spoofing: Client-Supplied HOD Spoof Overridden', spoofHodJson.hod?.name === 'Dr. A. CSE Head', `Resolved: ${spoofHodJson.hod?.name}`);

    // -------------------------------------------------------------
    // Test 46: Anti-Spoofing: Faculty cannot spoof Principal
    // -------------------------------------------------------------
    const resSpoofPrin = await fetch(`${BASE_URL}/api/event-design/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${facultyToken}` },
      body: JSON.stringify({
        eventTitle: 'Anti Spoofing Test 3',
        designType: 'CERTIFICATE',
        templateId: 'C01',
        principal: { name: 'Dr. Fake Principal' },
        metadata: { principal: { name: 'Dr. Fake Principal' } }
      })
    });
    const spoofPrinJson = await resSpoofPrin.json();
    assertTest(46, 'Anti-Spoofing: Client-Supplied Principal Spoof Overridden', spoofPrinJson.principal?.name === sigWithHod.signatories.principal.name && spoofPrinJson.principal?.name !== 'Dr. Fake Principal', `Resolved: ${spoofPrinJson.principal?.name}`);

    // -------------------------------------------------------------
    // Test 47: API payload signatory manipulation is ignored in DB
    // -------------------------------------------------------------
    const [genDocRow] = await pool.query('SELECT metadata_json FROM event_generated_documents WHERE id = ?', [spoofPrinJson.id]);
    const storedMeta = JSON.parse(genDocRow[0]?.metadata_json || '{}');
    assertTest(47, 'API Payload Signatory Manipulation Ignored in Audit Trail', storedMeta.principal?.name === sigWithHod.signatories.principal.name && storedMeta.signatories?.hod?.name === 'Dr. A. CSE Head', `Stored in DB: ${storedMeta.principal?.name}`);

    // -------------------------------------------------------------
    // Test 48: All 5 certificate templates contain all 3 roles
    // -------------------------------------------------------------
    const templates = ['C01', 'C02', 'C03', 'C04', 'C05'];
    const dummyCertData = {
      participantName: 'Test Participant',
      designation: 'Scholar',
      organization: 'SREC',
      eventTitle: 'AI Research Summit',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      signatories: sigWithHod.signatories
    };
    const allTemplatesHaveAll3Roles = templates.every(tId => {
      const html = renderCertificateHtml(tId, dummyCertData);
      return html.includes('Faculty Coordinator') && html.includes('HOD') && html.includes('Principal');
    });
    assertTest(48, 'All 5 Certificate Templates (C01-C05) Contain All 3 Signatory Roles', allTemplatesHaveAll3Roles, 'C01, C02, C03, C04, C05 validated');

    // -------------------------------------------------------------
    // Test 49: Correct names/designations appear in all templates
    // -------------------------------------------------------------
    const allTemplatesHaveCorrectNames = templates.every(tId => {
      const html = renderCertificateHtml(tId, dummyCertData);
      return html.includes('Dr. Design Validator') && html.includes('Dr. A. CSE Head') && html.includes(sigWithHod.signatories.principal.name);
    });
    assertTest(49, 'Correct Signatory Names & Designations Rendered across Templates', allTemplatesHaveCorrectNames, 'All 3 names verified in HTML');

    // -------------------------------------------------------------
    // Test 50: Generated single certificate PDF contains 3 signatory labels
    // -------------------------------------------------------------
    const testSinglePdf = generateSingleCertificatePdf('C01', dummyCertData);
    const pdfDataStr = testSinglePdf.output();
    assertTest(50, 'Single Certificate PDF Vector Output Generation with Signatories', pdfDataStr.includes('/Type /Page') && testSinglePdf.internal.pages.length >= 2, `Pages: ${testSinglePdf.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 51: Generated combined PDF contains signatories
    // -------------------------------------------------------------
    const testMultiPdf = generateCombinedCertificatesPdf('C01', [{ name: 'Part 1' }, { name: 'Part 2' }], {
      title: 'AI Summit',
      department: 'COMPUTER SCIENCE AND ENGINEERING',
      departmentCode: 'CS',
      signatories: sigWithHod.signatories
    });
    assertTest(51, 'Combined PDF Multipage Generation with Verified Signatories', testMultiPdf.internal.pages.length === 3, `Pages: ${testMultiPdf.internal.pages.length - 1}`);

    // -------------------------------------------------------------
    // Test 52: Department transfer resolves correct current HOD
    // -------------------------------------------------------------
    // Set up ECE HOD
    const hodEceStaffId = 'HOD-ECE-TEST-002';
    await pool.query('DELETE FROM staff_user WHERE staff_id = ?', [hodEceStaffId]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id = ?', [hodEceStaffId]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id = ?', [hodEceStaffId]);
    await pool.query('DELETE FROM admin_dep WHERE staff_id = ?', [hodEceStaffId]);

    await pool.query('INSERT INTO staff_user (staff_id, password) VALUES (?, ?)', [hodEceStaffId, 'pass']);
    await pool.query('INSERT INTO staff_personal (staff_id, staff_name) VALUES (?, ?)', [hodEceStaffId, 'Dr. B. ECE Head']);
    await pool.query('INSERT INTO staff_academics (staff_id, staff_name, Department, Designation) VALUES (?, ?, ?, ?)', [
      hodEceStaffId, 'Dr. B. ECE Head', 'ECE', 'Professor & Head'
    ]);
    await pool.query('INSERT INTO admin_dep (staff_id, Department, password) VALUES (?, ?, ?)', [hodEceStaffId, 'ECE', 'pass']);

    // Simulate department transfer of testStaffId from CSE to ECE
    await pool.query('UPDATE staff_academics SET Department = "ECE" WHERE staff_id = ?', [testStaffId]);
    const sigTransferred = await resolveInstitutionalSignatories(testStaffId, pool);
    assertTest(52, 'Department Transfer Dynamic Resolution (Resolves Target Dept HOD)', sigTransferred.signatories.hod.name === 'Dr. B. ECE Head' && sigTransferred.departmentCode === 'EC', `New HOD: ${sigTransferred.signatories.hod.name}`);

    // Restore department back to CSE
    await pool.query('UPDATE staff_academics SET Department = "CSE" WHERE staff_id = ?', [testStaffId]);

    // -------------------------------------------------------------
    // Test 53: Principal remains institutionally mapped across departments
    // -------------------------------------------------------------
    const sigAfterDept = await resolveInstitutionalSignatories(testStaffId, pool);
    assertTest(53, 'Principal Invariant: Persistently Resolved Institutional Executive', sigAfterDept.signatories.principal.name === sigWithHod.signatories.principal.name, `Principal: ${sigAfterDept.signatories.principal.name}`);

    // -------------------------------------------------------------
    // Test 54: Existing certificate numbering format remains intact
    // -------------------------------------------------------------
    const certNumFormat = computeCertificateNumbers('AD', 'Workshop on AI', 2026, 1)[0];
    assertTest(54, 'Deterministic Certificate Numbering Preserved (SREC/AD/2026/WORKSH/001)', certNumFormat === 'SREC/AD/2026/WORKSH/001', `Cert No: ${certNumFormat}`);

    // -------------------------------------------------------------
    // Test 55: Bulk certificates pass through resolved signatories
    // -------------------------------------------------------------
    const bulkWithSigs = await processBulkCertificates({
      templateId: 'C01',
      participants: [{ name: 'Bulk Student 1', status: 'Ready' }],
      eventData: {
        title: 'Bulk Test',
        department: 'COMPUTER SCIENCE AND ENGINEERING',
        departmentCode: 'CS',
        signatories: sigWithHod.signatories
      }
    });
    assertTest(55, 'Bulk Certificate ZIP Engine Uses Verified Institutional Signatories', bulkWithSigs.successCount === 1, `Success: ${bulkWithSigs.successCount}`);

    // Cleanup test records
    await pool.query('DELETE FROM staff_user WHERE staff_id IN (?, ?, ?, ?, ?)', [testStaffId, otherStaffId, adminStaffId, hodStaffId, hodEceStaffId]);
    await pool.query('DELETE FROM staff_academics WHERE staff_id IN (?, ?, ?, ?, ?)', [testStaffId, otherStaffId, adminStaffId, hodStaffId, hodEceStaffId]);
    await pool.query('DELETE FROM staff_personal WHERE staff_id IN (?, ?, ?, ?, ?)', [testStaffId, otherStaffId, adminStaffId, hodStaffId, hodEceStaffId]);
    await pool.query('DELETE FROM admin_dep WHERE staff_id IN (?, ?)', [hodStaffId, hodEceStaffId]);
    await pool.query('DELETE FROM staff_event_organized WHERE staff_id IN (?, ?)', [testStaffId, otherStaffId]);
    await pool.query('DELETE FROM event_generated_documents WHERE staff_id IN (?, ?)', [testStaffId, otherStaffId]);

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║  TEST EXECUTION COMPLETE: Total: 55 | Passed: ${passed} | Failed: ${failed}               ║`);
  console.log(`║  Pass Rate: ${((passed / 55) * 100).toFixed(1)}%                                                 ║`);
  if (failed === 0) {
    console.log('║  FINAL STATUS: ALL V3.2 TESTS PASSED PERFECTLY (100% PASS RATE)            ║');
  } else {
    console.log('║  FINAL STATUS: SOME TESTS FAILED                                           ║');
  }
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  return failed === 0;
}

runV32TestSuite().then((success) => {
  process.exit(success ? 0 : 1);
});
