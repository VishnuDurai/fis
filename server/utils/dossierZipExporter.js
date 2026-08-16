import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import db from '../db.js';
import { findFileInSrecOrUploads } from './fileStorage.js';

/**
 * Builds and generates a complete NBA / NAAC Dossier Package ZIP buffer
 * containing compiled criteria Excel workbook and organized PDF proofs.
 * @param {string} department - Department acronym or name (optional, empty for college-wide)
 * @param {string} academicYear - Academic year filter (e.g. '2025-2026', optional)
 * @returns {Promise<{ buffer: Buffer, filename: string }>}
 */
export const generateDossierPackageZip = async (department = '', academicYear = '') => {
  const zip = new JSZip();
  const cleanDept = (department || '').trim();
  const cleanYear = (academicYear || '').trim();

  // 1. Fetch Faculty in Department
  const facultyRows = await new Promise((resolve) => {
    let sql = `
      SELECT p.staff_id, p.staff_name, p.email, p.mobile, a.Department, a.Designation, a.Qualification, a.Date_of_joining
      FROM staff_personal p
      LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
    `;
    const params = [];
    if (cleanDept && cleanDept !== 'All' && cleanDept !== 'All Departments') {
      sql += ` WHERE LOWER(TRIM(a.Department)) = LOWER(TRIM(?))`;
      params.push(cleanDept);
    }
    sql += ` ORDER BY a.Department, p.staff_name`;
    db.all(sql, params, (err, rows) => resolve(rows || []));
  });

  const staffIds = facultyRows.map(f => f.staff_id.trim());
  const staffIdSet = new Set(staffIds.map(s => s.toLowerCase()));

  // 2. Fetch Publications
  const publicationRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_publication ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => staffIdSet.has((r.staff_id || '').trim().toLowerCase()));
      resolve(filtered);
    });
  });

  // 3. Fetch Funding & Grants
  const fundingRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_funding ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => staffIdSet.has((r.staff_id || '').trim().toLowerCase()));
      resolve(filtered);
    });
  });

  // 4. Fetch Patents & IPR
  const iprRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_ipr ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => staffIdSet.has((r.staff_id || '').trim().toLowerCase()));
      resolve(filtered);
    });
  });

  // 5. Fetch FDP & Workshops (Interactions & Certifications)
  const interactionRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_interactions ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => staffIdSet.has((r.staff_id || '').trim().toLowerCase()));
      resolve(filtered);
    });
  });

  const certRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_certificate ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => staffIdSet.has((r.staff_id || '').trim().toLowerCase()));
      resolve(filtered);
    });
  });

  // 6. Fetch Research Scholars
  const scholarRows = await new Promise((resolve) => {
    db.all(`SELECT * FROM staff_scholars ORDER BY id DESC`, [], (err, rows) => {
      const filtered = (rows || []).filter(r => 
        staffIdSet.has((r.staff_id || '').trim().toLowerCase()) ||
        facultyRows.some(f => (r.sup_name || '').toLowerCase().includes((f.staff_name || '').toLowerCase()))
      );
      resolve(filtered);
    });
  });

  // Helper to add files to ZIP
  const addedFiles = new Set();
  const attachFileToZip = (folderPath, filename) => {
    if (!filename || typeof filename !== 'string') return;
    const cleanFilename = filename.trim();
    if (!cleanFilename || addedFiles.has(folderPath + cleanFilename)) return;

    try {
      const resolvedPath = findFileInSrecOrUploads(cleanFilename);
      if (resolvedPath && fs.existsSync(resolvedPath)) {
        const fileData = fs.readFileSync(resolvedPath);
        zip.folder(folderPath).file(cleanFilename, fileData);
        addedFiles.add(folderPath + cleanFilename);
      }
    } catch (e) {
      console.warn(`Could not attach proof ${cleanFilename}:`, e.message);
    }
  };

  // Build Excel Workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Department_Profile
  const profileData = [
    ['SRI RAMAKRISHNA ENGINEERING COLLEGE (AUTONOMOUS) - COIMBATORE - 641022'],
    ['NBA / NAAC ACCREDITATION DOSSIER SUMMARY REPORT'],
    ['Department:', cleanDept || 'Institution-Wide (All Departments)', 'Academic Year:', cleanYear || 'Cumulative'],
    ['Generated Date:', new Date().toLocaleDateString('en-GB'), 'Total Faculty Members:', facultyRows.length],
    [],
    ['S.No', 'Staff ID', 'Faculty Name', 'Department', 'Designation', 'Qualification', 'Date of Joining', 'Email', 'Mobile']
  ];
  facultyRows.forEach((f, idx) => {
    profileData.push([
      idx + 1,
      f.staff_id,
      f.staff_name,
      f.Department || '',
      f.Designation || '',
      f.Qualification || '',
      f.Date_of_joining || '',
      f.email || '',
      f.mobile || ''
    ]);
  });
  const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, wsProfile, 'Department_Profile');

  // Sheet 2: Criterion_5.3_Projects
  const projectData = [
    ['Criterion 5.3 - Sponsored Research Grants & Consultancy Projects'],
    ['S.No', 'Staff ID', 'Faculty Role', 'Project Title', 'Category', 'Funding Agency / Client', 'Grant Amount (INR)', 'Duration / Dates', 'Reference No', 'Status', 'Proof Document File']
  ];
  fundingRows.forEach((item, idx) => {
    projectData.push([
      idx + 1,
      item.staff_id,
      item.faculty_role || 'PI',
      item.title || '',
      item.grant_category || 'Research Project',
      item.fa || '',
      item.amount ? `₹ ${Number(item.amount).toLocaleString('en-IN')}` : '',
      [item.from_date, item.to_date].filter(Boolean).join(' to ') || item.date || '',
      item.referenceno || '',
      item.status || 'Sanctioned',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.3_Research_Projects', item.file);
  });
  const wsProjects = XLSX.utils.aoa_to_sheet(projectData);
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Criterion_5.3_Projects');

  // Sheet 3: Criterion_5.4_Publications
  const pubData = [
    ['Criterion 5.4 - Research Publications (Journals, Conferences & Book Chapters)'],
    ['S.No', 'Staff ID', 'Paper Title', 'Journal / Conference Name', 'Category', 'Authors', 'Year / Month', 'Volume', 'Issue', 'Pages', 'ISSN / ISBN', 'DOI', 'Indexed In', 'Proof Document File']
  ];
  publicationRows.forEach((item, idx) => {
    pubData.push([
      idx + 1,
      item.staff_id,
      item.title || '',
      item.name || '',
      item.category || 'Journal',
      item.authors || '',
      item.year || '',
      item.volume || '',
      item.issue || '',
      item.page || '',
      item.issn || '',
      item.doi || '',
      item.indexed || 'Scopus / WoS',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.4_Publications_IPR', item.file);
  });
  const wsPub = XLSX.utils.aoa_to_sheet(pubData);
  XLSX.utils.book_append_sheet(wb, wsPub, 'Criterion_5.4_Publications');

  // Sheet 4: Criterion_5.5_Patents_IPR
  const iprData = [
    ['Criterion 5.5 - Intellectual Property Rights & Patents'],
    ['S.No', 'Staff ID', 'IPR Type', 'Patent / Design Title', 'Patent Status', 'Application / File No', 'Filing / Grant Date', 'Brief Summary', 'Proof Document File']
  ];
  iprRows.forEach((item, idx) => {
    iprData.push([
      idx + 1,
      item.staff_id,
      item.ip_type || 'Patent',
      item.patent || '',
      item.patent_status || 'Filed',
      item.institution || '',
      item.generation || '',
      item.propose || '',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.4_Publications_IPR', item.file);
  });
  const wsIpr = XLSX.utils.aoa_to_sheet(iprData);
  XLSX.utils.book_append_sheet(wb, wsIpr, 'Criterion_5.5_Patents_IPR');

  // Sheet 5: Criterion_5.6_FDP_Certifications
  const fdpData = [
    ['Criterion 5.6 - Faculty Development Programs, Workshops & Online Certifications'],
    ['S.No', 'Staff ID', 'Type', 'Program / Course Title', 'Organizer / Institution', 'Duration (Days / Weeks)', 'Start Date', 'End Date', 'Grade / Marks', 'Proof Document File']
  ];
  let fdpIdx = 1;
  interactionRows.forEach((item) => {
    fdpData.push([
      fdpIdx++,
      item.staff_id,
      'FDP / Workshop / Interaction',
      item.title || '',
      item.organisation || '',
      item.duration || '',
      item.from_date || '',
      item.to_date || item.date || '',
      '-',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.6_FDP_Workshops', item.file);
  });
  certRows.forEach((item) => {
    fdpData.push([
      fdpIdx++,
      item.staff_id,
      'Online Certification (NPTEL/Coursera)',
      item.course_name || '',
      item.organisation || '',
      item.duration_weeks || '',
      item.data_of_exam || '',
      item.data_of_exam || '',
      item.mark || 'Passed',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.6_FDP_Workshops', item.file);
  });
  const wsFdp = XLSX.utils.aoa_to_sheet(fdpData);
  XLSX.utils.book_append_sheet(wb, wsFdp, 'Criterion_5.6_FDP_Workshops');

  // Sheet 6: Criterion_5.7_Research_Scholars
  const scholarData = [
    ['Criterion 5.7 - Ph.D Research Scholars Guided & Completed'],
    ['S.No', 'Scholar Reg No', 'Scholar Name', 'Scholar Type', 'Institution', 'Supervisor Name', 'Registration Year', 'Research Status', 'Proof Document File']
  ];
  scholarRows.forEach((item, idx) => {
    const isInternal = (item.supervisor_type || 'Internal').toLowerCase() === 'internal';
    scholarData.push([
      idx + 1,
      item.res_id || 'N/A',
      item.staff_name || '',
      isInternal ? 'Internal (Faculty Scholar)' : 'External Scholar',
      item.organisation || (isInternal ? 'Sri Ramakrishna Engineering College' : 'N/A'),
      item.supervisor_name || item.sup_name || 'N/A',
      item.registration_year || item.date || '',
      item.status || 'Pursuing',
      item.file || 'No File'
    ]);
    if (item.file) attachFileToZip('Criterion_5.7_Research_Scholars', item.file);
  });
  const wsScholar = XLSX.utils.aoa_to_sheet(scholarData);
  XLSX.utils.book_append_sheet(wb, wsScholar, 'Criterion_5.7_Scholars');

  // Add Excel Workbook to root of ZIP
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const excelFilename = `Criteria_Summary_Workbook_${cleanDept ? cleanDept.replace(/\s+/g, '_') : 'ALL'}.xlsx`;
  zip.file(excelFilename, excelBuffer);

  // Generate ZIP Buffer
  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const deptTag = cleanDept ? cleanDept.replace(/[\/\s\\:]+/g, '_') : 'INSTITUTION';
  const yearTag = cleanYear ? cleanYear.replace(/[\/\s\\:]+/g, '_') : 'ALL_YEARS';
  const zipFilename = `NBA_NAAC_Dossier_Package_${deptTag}_${yearTag}.zip`;

  return { buffer: zipBuffer, filename: zipFilename };
};
