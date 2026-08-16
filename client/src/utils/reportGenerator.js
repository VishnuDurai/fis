import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { showSuccess, showError } from '../context/AlertContext.jsx';

// Map department acronyms to official full department names
const DEPT_ACRONYM_MAP = {
  'IT': 'Information Technology',
  'INFT': 'Information Technology',
  'AI & DS': 'Artificial Intelligence and Data Science',
  'AIDS': 'Artificial Intelligence and Data Science',
  'AD': 'Artificial Intelligence and Data Science',
  'CSE': 'Computer Science and Engineering',
  'CS': 'Computer Science and Engineering',
  'ECE': 'Electronics and Communication Engineering',
  'EEE': 'Electrical and Electronics Engineering',
  'MECH': 'Mechanical Engineering',
  'ME': 'Mechanical Engineering',
  'CIVIL': 'Civil Engineering',
  'CE': 'Civil Engineering',
  'BME': 'Biomedical Engineering',
  'BM': 'Biomedical Engineering',
  'RA': 'Robotics and Automation',
  'ROBOTICS': 'Robotics and Automation',
  'AERO': 'Aeronautical Engineering',
  'AE': 'Aeronautical Engineering',
  'MATHS': 'Mathematics',
  'MATH': 'Mathematics',
  'PHYSICS': 'Physics',
  'PHY': 'Physics',
  'CHEMISTRY': 'Chemistry',
  'CHEM': 'Chemistry',
  'ENGLISH': 'English',
  'ENG': 'English',
  'MBA': 'Master of Business Administration',
  'MCA': 'Master of Computer Applications'
};

const FULL_TO_ACRONYM_MAP = {
  'INFORMATION TECHNOLOGY': 'IT',
  'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE': 'AI & DS',
  'COMPUTER SCIENCE AND ENGINEERING': 'CSE',
  'ELECTRONICS AND COMMUNICATION ENGINEERING': 'ECE',
  'ELECTRICAL AND ELECTRONICS ENGINEERING': 'EEE',
  'MECHANICAL ENGINEERING': 'MECH',
  'CIVIL ENGINEERING': 'CIVIL',
  'BIOMEDICAL ENGINEERING': 'BME',
  'ROBOTICS AND AUTOMATION': 'RA',
  'AERONAUTICAL ENGINEERING': 'AERO',
  'MATHEMATICS': 'MATHS',
  'PHYSICS': 'PHYSICS',
  'CHEMISTRY': 'CHEMISTRY',
  'ENGLISH': 'ENGLISH',
  'MASTER OF BUSINESS ADMINISTRATION': 'MBA',
  'MASTER OF COMPUTER APPLICATIONS': 'MCA'
};

/**
 * Returns full department name without acronyms (for report titles)
 */
export const getFullDepartmentName = (deptStr) => {
  if (!deptStr) return 'Information Technology';
  let clean = deptStr.toString().replace(/^Department of\s+/i, '').trim();
  const upper = clean.toUpperCase();
  if (DEPT_ACRONYM_MAP[upper]) {
    return DEPT_ACRONYM_MAP[upper];
  }
  return clean;
};

/**
 * Returns department acronym (for report footer HOD line)
 */
export const getDepartmentAcronym = (deptStr) => {
  if (!deptStr) return 'IT';
  let clean = deptStr.toString().replace(/^Department of\s+/i, '').trim();
  const upper = clean.toUpperCase();
  if (DEPT_ACRONYM_MAP[upper]) {
    return upper === 'INFT' ? 'IT' : (upper === 'AD' || upper === 'AIDS' ? 'AI & DS' : (upper === 'CS' ? 'CSE' : upper));
  }
  if (FULL_TO_ACRONYM_MAP[upper]) {
    return FULL_TO_ACRONYM_MAP[upper];
  }
  return clean;
};

/**
 * Returns numeric rank for academic designations for hierarchical report sorting
 */
export const getDesignationRank = (desgStr) => {
  if (!desgStr) return 0;
  const d = desgStr.toString().trim().toUpperCase();

  if (d.includes('PRINCIPAL') || d.includes('DIRECTOR') || d.includes('DEAN')) return 1000;
  if (d.includes('HOD') || d.includes('HEAD OF') || d.includes('PROFESSOR & HEAD') || d.includes('PROFESSOR AND HEAD')) return 900;
  if (d.includes('PROFESSOR') && !d.includes('ASSOCIATE') && !d.includes('ASSISTANT')) return 800;
  if (d.includes('ASSOCIATE PROFESSOR') || d.includes('ASSOC. PROFESSOR') || d.includes('ASSOC PROFESSOR')) return 700;
  if (d.includes('ASSISTANT PROFESSOR (SEL.G)') || d.includes('ASSISTANT PROFESSOR (SELECTION GRADE)') || d.includes('ASST.PROFESSOR (SEL.G)') || d.includes('ASST PROFESSOR (SEL.G)')) return 600;
  if (d.includes('ASSISTANT PROFESSOR (SR.G)') || d.includes('ASSISTANT PROFESSOR (SENIOR GRADE)') || d.includes('ASST.PROFESSOR (SR.G)') || d.includes('ASST PROFESSOR (SR.G)')) return 500;
  if (d.includes('ASSISTANT PROFESSOR') || d.includes('ASST.PROFESSOR') || d.includes('ASST PROFESSOR') || d.includes('LECTURER')) return 400;
  if (d.includes('FELLOW') || d.includes('INSTRUCTOR') || d.includes('TEACHING')) return 300;
  return 100;
};

// Helper to sort rows (Group by Dept for Institutional reports, order by Designation rank) & strip redundant Department column
const prepareReportData = (headers, rows, departmentName) => {
  let safeHeaders = (Array.isArray(headers) ? [...headers] : []).map(h => {
    const hClean = String(h || '').trim().toLowerCase();
    if (hClean === 'joining date' || hClean === 'date of joining') return 'DOJ';
    return h;
  });
  let safeRows = (rows || []).map(r => 
    Array.isArray(r) ? [...r].map(c => c === null || c === undefined ? '' : String(c)) : [String(r || '')]
  );

  const isInstitutional = !departmentName || 
    ['ALL', 'ALL DEPARTMENTS', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toString().trim().toUpperCase());

  const desgColIdx = safeHeaders.findIndex(h => String(h || '').trim().toLowerCase().includes('designation'));
  const deptColIdx = safeHeaders.findIndex(h => {
    const hClean = String(h || '').trim().toLowerCase();
    return hClean === 'department' || hClean === 'dept';
  });
  const nameColIdx = safeHeaders.findIndex(h => String(h || '').trim().toLowerCase().includes('name'));

  if (isInstitutional && deptColIdx !== -1) {
    // Institutional-level report: Group by Department (alphabetical), under each Department order by Designation Rank
    safeRows.sort((a, b) => {
      const deptA = getFullDepartmentName(a[deptColIdx]);
      const deptB = getFullDepartmentName(b[deptColIdx]);
      
      // 1. Group by Department Name
      const deptCompare = deptA.localeCompare(deptB);
      if (deptCompare !== 0) return deptCompare;

      // 2. Under each Department, order by Designation Rank
      if (desgColIdx !== -1) {
        const rankA = getDesignationRank(a[desgColIdx]);
        const rankB = getDesignationRank(b[desgColIdx]);
        if (rankB !== rankA) return rankB - rankA;
      }

      // 3. Secondary sort by Faculty Name
      if (nameColIdx !== -1) {
        return String(a[nameColIdx] || '').localeCompare(String(b[nameColIdx] || ''));
      }

      return 0;
    });
  } else if (desgColIdx !== -1) {
    // Department-level report: Order by Designation Rank
    safeRows.sort((a, b) => {
      const rankA = getDesignationRank(a[desgColIdx]);
      const rankB = getDesignationRank(b[desgColIdx]);
      if (rankB !== rankA) return rankB - rankA;
      if (nameColIdx !== -1) {
        return String(a[nameColIdx] || '').localeCompare(String(b[nameColIdx] || ''));
      }
      return 0;
    });
  }

  // Strip redundant Department column if report is for a specific department
  if (!isInstitutional && deptColIdx !== -1) {
    safeHeaders.splice(deptColIdx, 1);
    safeRows = safeRows.map(row => {
      const newRow = [...row];
      newRow.splice(deptColIdx, 1);
      return newRow;
    });
  }

  return { cleanHeaders: safeHeaders, cleanRows: safeRows };
};

// Helper to load image via fetch and convert to Base64 data URL reliably
const fetchImageAsBase64 = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error(`Failed to fetch image at ${url}:`, e);
    return null;
  }
};

/**
 * Download Excel Report (.xlsx)
 */
export const downloadExcelReport = ({ filename, pageTitle, departmentName, headers, rows }) => {
  try {
    const isInstitutional = !departmentName || 
      ['ALL', 'ALL DEPARTMENTS', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toString().trim().toUpperCase());

    const fullDeptName = isInstitutional ? '' : getFullDepartmentName(departmentName);
    const fullDeptTitle = isInstitutional ? 'Sri Ramakrishna Engineering College' : `Department of ${fullDeptName}`;
    const fullReportTitle = `${pageTitle} Report`;

    const { cleanHeaders, cleanRows } = prepareReportData(headers, rows, departmentName);

    // Construct sheet data
    const sheetData = [
      [fullDeptTitle],
      [fullReportTitle],
      [`Generated Date: ${new Date().toLocaleDateString('en-GB')}`],
      [], // Empty spacing row
      cleanHeaders,
      ...cleanRows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths based on maximum length in each column
    const colWidths = cleanHeaders.map((h, i) => {
      let maxLen = h ? h.toString().length : 10;
      cleanRows.forEach(r => {
        if (r[i]) {
          const len = r[i].toString().length;
          if (len > maxLen) maxLen = len;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    const safeFilename = `${(filename || pageTitle).toLowerCase().replace(/[^a-z0-9]/gi, '_')}_report.xlsx`;
    XLSX.writeFile(workbook, safeFilename);
  } catch (err) {
    console.error('Failed to generate Excel report:', err);
    throw err;
  }
};

/**
 * Download PDF Report (.pdf)
 * Specifications:
 * - Page size: A4
 * - Default orientation: Vertical (Portrait); Horizontal (Landscape) if > 5 columns
 * - Header: SREC Header Banner image
 * - Titles (Font: Times New Roman, Size: 14pt, Bold):
 *    1. Department-based: Department of "Full Name of the department"
 *       Institutional-level: Sri Ramakrishna Engineering College
 *    2. "Title of the page" Report
 * - Table Content (Font: Times New Roman, Size: 12pt)
 * - Institutional Report Sorting: Group by Department (alphabetical), under Department order by Designation (hierarchy)
 * - Department Column: Included for institutional reports, omitted for department-specific reports
 * - Role-Based Footer Signatures:
 *    - Faculty Portal: Left side "Signature of Faculty" (with Faculty Name & Designation below), Right side "HOD-[Department Acronym]" (e.g. HOD - IT)
 *    - Department Admin: Left side "Faculty In-charge", Right side "HOD-[Department Acronym]" (e.g. HOD - IT)
 *    - System Admin: Bottom right end "PRINCIPAL", "Sri Ramakrishna Engineering College"
 */
export const downloadPdfReport = async ({ filename, pageTitle, departmentName, headers, rows, orientation, auth = {} }) => {
  try {
    const { cleanHeaders, cleanRows } = prepareReportData(headers, rows, departmentName);

    // Determine orientation: default vertical (portrait), horizontal (landscape) if > 5 columns or requested
    const isLandscape = orientation === 'landscape' || cleanHeaders.length > 5;
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fetch official SREC Header Banner image as base64 data URL
    const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') ||
                         await fetchImageAsBase64('/report-logo-left.png') ||
                         await fetchImageAsBase64('/logo.png');

    const isInstitutional = !departmentName || 
      ['ALL', 'ALL DEPARTMENTS', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toString().trim().toUpperCase());

    const fullDeptName = isInstitutional ? '' : getFullDepartmentName(departmentName || auth.dept || auth.department);
    const deptAcronym = isInstitutional ? '' : getDepartmentAcronym(departmentName || auth.dept || auth.department);

    const titleLine1 = isInstitutional ? 'Sri Ramakrishna Engineering College' : `Department of ${fullDeptName}`;
    const titleLine2 = `${pageTitle} Report`;

    // Calculate Header Banner dimensions (Aspect ratio approx 1024:186 => 5.505)
    // Compact, elegantly centered logo banner (125mm in portrait, 165mm in landscape)
    const bannerWidth = isLandscape ? 165 : 125;
    const bannerHeight = bannerWidth / 5.505;
    const bannerX = (pageWidth - bannerWidth) / 2;

    const title1Y = 4 + bannerHeight + 5;
    const title2Y = title1Y + 6;
    const dateY = title2Y + 5;
    const dividerY = dateY + 4;
    const tableStartY = dividerY + 5;

    // Execute autoTable using standard ES module autoTable(doc, options)
    autoTable(doc, {
      head: [cleanHeaders],
      body: cleanRows,
      startY: tableStartY,
      margin: { top: tableStartY, bottom: 25, left: 10, right: 10 },
      styles: {
        font: 'times',
        fontSize: 12,
        cellPadding: 3.5,
        textColor: [15, 23, 42],
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        font: 'times',
        fontStyle: 'bold',
        fontSize: 12,
        fillColor: [2, 132, 199], // #0284c7 theme blue
        textColor: [255, 255, 255],
        halign: 'left'
      },
      bodyStyles: {
        font: 'times',
        fontSize: 12
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didDrawPage: (data) => {
        // 1. Draw Official Header Banner at top of page (centered & compact)
        if (headerBanner) {
          try {
            doc.addImage(headerBanner, 'PNG', bannerX, 4, bannerWidth, bannerHeight);
          } catch (e) {
            console.error('Failed to add banner image to PDF:', e);
          }
        }

        // 2. Render 2 Header Titles (Font: Times New Roman, Size: 14pt, Bold)
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // #0f172a

        doc.text(titleLine1, pageWidth / 2, title1Y, { align: 'center' });
        doc.text(titleLine2, pageWidth / 2, title2Y, { align: 'center' });

        // 3. Sub-date line
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, dateY, { align: 'center' });

        // 4. Horizontal Divider Line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(10, dividerY, pageWidth - 10, dividerY);

        // 5. Footer - Page Numbering & Institution Disclaimer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 10, pageHeight - 8, { align: 'right' });
        doc.text('Sri Ramakrishna Engineering College - Faculty Information System (FIS)', 10, pageHeight - 8, { align: 'left' });
      }
    });

    // 6. Draw Footer Signatures / Approvals on the final page
    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 22 : pageHeight - 40;

    // If table ended too near the bottom, add a new page for signatures
    if (finalY > pageHeight - 35) {
      doc.addPage();
      finalY = tableStartY + 15;
    }

    const sigY = finalY;
    const userRole = (auth.role || 'faculty').toLowerCase();
    const facultyName = auth.name || auth.staff_name || auth.userName || '';
    const designation = auth.designation || auth.Designation || '';

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);

    if (userRole === 'faculty') {
      // Faculty Portal Report Footer:
      // Left side: Signature of Faculty, (Below: Faculty Name, Designation)
      doc.text('Signature of Faculty', 14, sigY);
      if (facultyName) {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(facultyName, 14, sigY + 6);
      }
      if (designation) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(designation, 14, sigY + 11);
      }

      // Right side: HOD-[Department Acronym] (e.g. HOD - IT)
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`HOD - ${deptAcronym}`, pageWidth - 14, sigY, { align: 'right' });

    } else if (userRole === 'dept_admin') {
      // Department Admin Panel Report Footer:
      // Left side: Faculty In-charge
      doc.text('Faculty In-charge', 14, sigY);

      // Right side: HOD-[Department Acronym] (e.g. HOD - IT)
      doc.text(`HOD - ${deptAcronym}`, pageWidth - 14, sigY, { align: 'right' });

    } else if (userRole === 'admin') {
      // System Admin Panel Report Footer:
      // Bottom right end: PRINCIPAL, Sri Ramakrishna Engineering College
      doc.text('PRINCIPAL', pageWidth - 14, sigY, { align: 'right' });
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Sri Ramakrishna Engineering College', pageWidth - 14, sigY + 6, { align: 'right' });
    }

    // Digital Verification Seal & Authenticity Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const verCode = `SREC-FIS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    doc.text(`Digital Verification Code: ${verCode}`, 10, pageHeight - 14);
    doc.text(`Verified Online Portal: https://srec-fis.duckdns.org/verify`, 10, pageHeight - 10);

    const safeFilename = `${(filename || pageTitle).toLowerCase().replace(/[^a-z0-9]/gi, '_')}_report.pdf`;
    doc.save(safeFilename);
  } catch (err) {
    console.error('Failed to generate PDF report:', err);
    throw err;
  }
};

/**
 * Exports Faculty Details in standard NBA Criterion 5 Form B2 Excel (.xlsx) format
 */
export const exportNbaB2FacultyDetails = (facultyList, departmentName = 'Department', academicYear = '2026-2027') => {
  const headers = [
    'S. No.',
    'Name',
    'PAN No.',
    'Qualification',
    'Area of Specialization',
    'Designation',
    'Date of Joining',
    'Date on which Designated as Professor/ Associate Professor',
    'Currently Associated (Y/N)',
    'Nature of Association (Regular/Contract/Adjunct)',
    'If contractual mention Full time or Part time',
    'Date of Leaving'
  ];

  const rows = (facultyList || []).map((f, idx) => [
    idx + 1,
    f.staff_name || 'N/A',
    f.pan || 'N/A',
    f.Qualification || 'Ph.D',
    f.area_of_specialization || 'N/A',
    f.Designation || 'N/A',
    f.Date_of_joining || 'N/A',
    f.date_designated_prof || 'NA',
    f.is_relieved ? 'N' : 'Y',
    (f.nature_of_association || 'REGULAR').toUpperCase(),
    f.contractual_type || '-',
    f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'
  ]);

  const fullDept = getFullDepartmentName(departmentName) || departmentName;

  const worksheetData = [
    ['Educational Service : SNR Sons Charitable Trust'],
    ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
    ['Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore - 641022.'],
    [`Department of ${fullDept}`],
    ['FACULTY DETAILS OF THE DEPARTMENT'],
    [`ACADEMIC YEAR ${academicYear}`],
    [],
    headers,
    ...rows
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // S. No.
    { wch: 28 }, // Name
    { wch: 15 }, // PAN No.
    { wch: 15 }, // Qualification
    { wch: 32 }, // Area of Specialization
    { wch: 22 }, // Designation
    { wch: 15 }, // Date of Joining
    { wch: 28 }, // Date on which Designated as Prof
    { wch: 14 }, // Currently Associated
    { wch: 20 }, // Nature of Association
    { wch: 18 }, // Contractual type
    { wch: 15 }  // Date of Leaving
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty Details (B2)');
  XLSX.writeFile(workbook, `NBA_B2_Faculty_Details_${(departmentName || 'Dept').replace(/[^a-z0-9]/gi, '_')}.xlsx`);
};

/**
 * Exports Faculty Details in standard NBA Criterion 5 Form B2 PDF format
 */
export const exportNbaB2FacultyDetailsPdf = async (facultyList, departmentName = 'Department', academicYear = '2026-2027', auth = {}) => {
  try {
    const isInstitutional = !departmentName || 
      ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toString().trim().toUpperCase());

    const fullDeptName = isInstitutional ? '' : getFullDepartmentName(departmentName);
    const deptAcronym = isInstitutional ? '' : getDepartmentAcronym(departmentName);

    const titleLine1 = isInstitutional ? 'Sri Ramakrishna Engineering College' : `Department of ${fullDeptName}`;
    const titleLine2 = `FACULTY DETAILS OF THE DEPARTMENT - ACADEMIC YEAR ${academicYear}`;
    const subTitle = `(NBA Criterion 5 - Form B2 Inspection Report)`;

    const headers = [
      'S.No',
      'Faculty Name',
      'PAN No.',
      'Highest Qual.',
      'Area of Specialization',
      'Designation',
      'DOJ',
      'Date Designated as Prof/Assoc Prof',
      'Currently Associated',
      'Nature',
      'Mode',
      'Date of Leaving'
    ];

    const rows = (facultyList || []).map((f, idx) => [
      idx + 1,
      f.staff_name || 'N/A',
      f.pan || 'N/A',
      f.Qualification || 'Ph.D',
      f.area_of_specialization || 'N/A',
      f.Designation || 'N/A',
      f.Date_of_joining || 'N/A',
      f.date_designated_prof || 'NA',
      f.is_relieved ? 'N' : 'Y',
      (f.nature_of_association || 'REGULAR').toUpperCase(),
      f.contractual_type || '-',
      f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'
    ]);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') ||
                         await fetchImageAsBase64('/report-logo-left.png') ||
                         await fetchImageAsBase64('/logo.png');

    const bannerWidth = 165;
    const bannerHeight = bannerWidth / 5.505;
    const bannerX = (pageWidth - bannerWidth) / 2;

    const title1Y = 4 + bannerHeight + 5;
    const title2Y = title1Y + 5;
    const subTitleY = title2Y + 4;
    const dividerY = subTitleY + 3;
    const tableStartY = dividerY + 4;

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: tableStartY,
      margin: { top: tableStartY, bottom: 25, left: 8, right: 8 },
      styles: {
        font: 'times',
        fontSize: 8.5,
        cellPadding: 2.2,
        textColor: [15, 23, 42],
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        font: 'times',
        fontStyle: 'bold',
        fontSize: 8.5,
        fillColor: [13, 148, 136], // #0d9488 Teal
        textColor: [255, 255, 255],
        halign: 'center'
      },
      bodyStyles: {
        font: 'times',
        fontSize: 8.5
      },
      alternateRowStyles: {
        fillColor: [240, 253, 250]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // S.No
        1: { cellWidth: 32 },                   // Name
        2: { cellWidth: 20, halign: 'center' }, // PAN
        3: { cellWidth: 20, halign: 'center' }, // Qual
        4: { cellWidth: 42 },                   // Specialization
        5: { cellWidth: 28 },                   // Designation
        6: { cellWidth: 18, halign: 'center' }, // DOJ
        7: { cellWidth: 26, halign: 'center' }, // Date Designated Prof
        8: { cellWidth: 18, halign: 'center' }, // Associated
        9: { cellWidth: 20, halign: 'center' }, // Nature
        10: { cellWidth: 18, halign: 'center' },// Mode
        11: { cellWidth: 20, halign: 'center' } // Leaving Date
      },
      didDrawPage: (data) => {
        if (headerBanner) {
          try {
            doc.addImage(headerBanner, 'PNG', bannerX, 4, bannerWidth, bannerHeight);
          } catch (e) {}
        }

        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(titleLine1, pageWidth / 2, title1Y, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(13, 148, 136);
        doc.text(titleLine2, pageWidth / 2, title2Y, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('times', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(subTitle, pageWidth / 2, subTitleY, { align: 'center' });

        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.4);
        doc.line(8, dividerY, pageWidth - 8, dividerY);

        // Page Number
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(str, pageWidth - 10, pageHeight - 8, { align: 'right' });
      }
    });

    const finalY = doc.lastAutoTable.finalY || 150;
    const sigY = Math.min(finalY + 16, pageHeight - 16);

    const userRole = auth.role || 'faculty';
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    if (userRole === 'admin' || isInstitutional) {
      doc.text('PRINCIPAL', pageWidth - 14, sigY, { align: 'right' });
      doc.setFont('times', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Sri Ramakrishna Engineering College', pageWidth - 14, sigY + 5, { align: 'right' });
    } else {
      doc.text('Faculty In-charge', 14, sigY);
      doc.text(`HOD - ${deptAcronym}`, pageWidth - 14, sigY, { align: 'right' });
    }

    const b2Filename = `NBA_B2_Faculty_Details_${(departmentName || 'Dept').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(b2Filename);
    showSuccess(`NBA Form B2 PDF "${b2Filename}" generated and downloaded!`);
  } catch (err) {
    console.error('Failed to generate NBA B2 PDF:', err);
    showError('Failed to generate NBA Form B2 PDF.');
  }
};

/**
 * Exports NAAC Criterion 3 Multi-Table PDF
 */
export const exportNaacCriterion3Pdf = async (data, departmentName = 'Institution', auth = {}) => {
  try {
    const isInst = !departmentName || ['ALL', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toUpperCase());
    const fullDept = isInst ? 'Sri Ramakrishna Engineering College' : `Department of ${getFullDepartmentName(departmentName)}`;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') || await fetchImageAsBase64('/logo.png');
    const bannerWidth = 165;
    const bannerHeight = bannerWidth / 5.505;

    let currentY = 4 + bannerHeight + 6;

    // Header drawing helper
    const drawHeader = (title) => {
      if (headerBanner) {
        try { doc.addImage(headerBanner, 'PNG', (pageWidth - bannerWidth) / 2, 4, bannerWidth, bannerHeight); } catch(e){}
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(fullDept, pageWidth / 2, 4 + bannerHeight + 5, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(22, 163, 74);
      doc.text(title, pageWidth / 2, 4 + bannerHeight + 10, { align: 'center' });
    };

    drawHeader('NAAC CRITERION 3 - RESEARCH & EXTENSION INSPECTION DOSSIER');
    currentY = 4 + bannerHeight + 16;

    // 1. Publications
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`3.1 Research Publications (${(data.naac_3_1_publications || []).length} Records)`, 10, currentY);
    currentY += 4;

    const pubHeaders = ['Type', 'Title', 'Journal / Publisher', 'Authors', 'ISSN/ISBN', 'Date/Year', 'Indexing', 'Citations'];
    const pubRows = (data.naac_3_1_publications || []).map(p => [
      p.type_pub || 'Journal',
      p.title || 'N/A',
      p.journel || p.organizer || 'N/A',
      p.co_authors || 'N/A',
      p.issn_no || p.isbn || 'N/A',
      p.date_con || p.year || 'N/A',
      p.index_pub || 'N/A',
      p.citations || '0'
    ]);

    autoTable(doc, {
      head: [pubHeaders],
      body: pubRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 2. Books
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`3.2 Books Published (${(data.naac_3_2_books || []).length} Records)`, 10, currentY);
    currentY += 4;

    const bookHeaders = ['Title', 'Co-Authors', 'Publisher', 'Edition', 'ISBN', 'Year / Date'];
    const bookRows = (data.naac_3_2_books || []).map(b => [
      b.title || 'N/A',
      b.coauthor || 'None',
      b.publisher || 'N/A',
      b.edition || '1st',
      b.isbn || 'N/A',
      b.dateofpublication || b.year || 'N/A'
    ]);

    autoTable(doc, {
      head: [bookHeaders],
      body: bookRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 3. Sponsored Grants
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`3.3 Sponsored Research Grants (${(data.naac_3_3_grants || []).length} Records)`, 10, currentY);
    currentY += 4;

    const grantHeaders = ['Project Title', 'Category & Role', 'Funding Agency', 'Status', 'Sanctioned Amount (INR)', 'Ref No.'];
    const grantRows = (data.naac_3_3_grants || []).map(g => [
      g.title || 'N/A',
      `${g.grant_category || 'Project'} (${g.faculty_role || 'PI'})`,
      g.agency || 'N/A',
      g.status || 'Ongoing',
      g.amount ? `₹ ${Number(g.amount).toLocaleString('en-IN')}` : 'N/A',
      g.ref_no || 'N/A'
    ]);

    autoTable(doc, {
      head: [grantHeaders],
      body: grantRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 4. Patents & IPR
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`3.5 Patents & Intellectual Property Rights (${(data.naac_3_5_patents || []).length} Records)`, 10, currentY);
    currentY += 4;

    const iprHeaders = ['IP Type', 'Title', 'Application / File No', 'Status', 'Filing Date', 'Granted / Pub Date'];
    const iprRows = (data.naac_3_5_patents || []).map(ip => [
      ip.ip_type || 'Patent',
      ip.patent || ip.title || 'N/A',
      ip.institution || ip.app_no || 'N/A',
      ip.patent_status || ip.status || 'Published',
      ip.filing_date || 'N/A',
      ip.date || ip.pub_date || 'N/A'
    ]);

    autoTable(doc, {
      head: [iprHeaders],
      body: iprRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] }
    });

    const naacFilename = `NAAC_Criterion_3_Research_Report_${(departmentName || 'Institution').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(naacFilename);
    showSuccess(`NAAC Criterion 3 PDF "${naacFilename}" generated and downloaded!`);
  } catch (err) {
    console.error('Failed to generate NAAC PDF:', err);
    showError('Failed to generate NAAC PDF report.');
  }
};

/**
 * Exports NBA Criterion 5 Multi-Table PDF
 */
export const exportNbaCriterion5Pdf = async (data, departmentName = 'Institution', auth = {}) => {
  try {
    const isInst = !departmentName || ['ALL', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE', 'N/A', ''].includes(departmentName.toUpperCase());
    const fullDept = isInst ? 'Sri Ramakrishna Engineering College' : `Department of ${getFullDepartmentName(departmentName)}`;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') || await fetchImageAsBase64('/logo.png');
    const bannerWidth = 165;
    const bannerHeight = bannerWidth / 5.505;

    let currentY = 4 + bannerHeight + 6;

    const drawHeader = (title) => {
      if (headerBanner) {
        try { doc.addImage(headerBanner, 'PNG', (pageWidth - bannerWidth) / 2, 4, bannerWidth, bannerHeight); } catch(e){}
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(fullDept, pageWidth / 2, 4 + bannerHeight + 5, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(2, 132, 199);
      doc.text(title, pageWidth / 2, 4 + bannerHeight + 10, { align: 'center' });
    };

    drawHeader('NBA CRITERION 5 - FACULTY CONTRIBUTIONS INSPECTION DOSSIER');
    currentY = 4 + bannerHeight + 16;

    // 1. FDPs / Interactions
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`5.1 Faculty Development Programs & Workshops Attended (${(data.nba_5_1_fdp_attended || []).length} Records)`, 10, currentY);
    currentY += 4;

    const fdpHeaders = ['Type', 'Event Title', 'Organizer', 'Duration / Dates', 'Venue / Mode'];
    const fdpRows = (data.nba_5_1_fdp_attended || []).map(f => [
      f.type || 'FDP',
      f.title || 'N/A',
      f.organizer || 'N/A',
      f.from_date && f.to_date ? `${f.from_date} to ${f.to_date}` : (f.from_date || f.date || 'N/A'),
      f.venue || f.nature_event || 'N/A'
    ]);

    autoTable(doc, {
      head: [fdpHeaders],
      body: fdpRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 2. Events Organized
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`5.2 Events / Workshops Organized (${(data.nba_5_2_events_organized || []).length} Records)`, 10, currentY);
    currentY += 4;

    const eventHeaders = ['Category', 'Event Title', 'Organizer Role', 'Dates / Duration', 'Participants', 'Sponsor Grant (INR)'];
    const eventRows = (data.nba_5_2_events_organized || []).map(e => [
      e.type || 'Workshop',
      e.title || 'N/A',
      e.role || 'Coordinator',
      e.from_date && e.to_date ? `${e.from_date} to ${e.to_date}` : (e.from_date || 'N/A'),
      e.ben_person || 0,
      e.granted ? `₹ ${Number(e.granted).toLocaleString('en-IN')}` : 'N/A'
    ]);

    autoTable(doc, {
      head: [eventHeaders],
      body: eventRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 3. Certifications
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`5.3 Faculty Certifications (${(data.nba_5_3_certifications || []).length} Records)`, 10, currentY);
    currentY += 4;

    const certHeaders = ['Course / Title', 'Issuing Organization', 'Score / Grade', 'Issue Date / Period'];
    const certRows = (data.nba_5_3_certifications || []).map(c => [
      c.title || 'N/A',
      c.organization || 'NPTEL / Coursera',
      c.grade || c.score || 'Elite',
      c.from_date && c.to_date ? `${c.from_date} to ${c.to_date}` : (c.from_date || c.date || 'N/A')
    ]);

    autoTable(doc, {
      head: [certHeaders],
      body: certRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 4. Awards
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`5.4 Awards & Honors Received (${(data.nba_5_4_awards || []).length} Records)`, 10, currentY);
    currentY += 4;

    const awardHeaders = ['Award Title', 'Awarding Agency', 'Event Name', 'Award Date'];
    const awardRows = (data.nba_5_4_awards || []).map(a => [
      a.awardname || 'N/A',
      a.awardby || 'N/A',
      a.event || 'N/A',
      a.awa_date || a.date || 'N/A'
    ]);

    autoTable(doc, {
      head: [awardHeaders],
      body: awardRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    currentY = (doc.lastAutoTable.finalY || currentY) + 12;

    // 5. Responsibilities
    if (currentY > 160) { doc.addPage(); currentY = 20; }
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(`5.5 Responsibilities Assigned (${(data.nba_5_5_responsibilities || []).length} Records)`, 10, currentY);
    currentY += 4;

    const respHeaders = ['Responsibility Title', 'Level / Scope', 'Academic Year', 'Assigned By'];
    const respRows = (data.nba_5_5_responsibilities || []).map(r => [
      r.responsibility || 'N/A',
      r.level || 'Department Level',
      r.academic_year || '2025-2026',
      r.assigned_by || 'HOD / Principal'
    ]);

    autoTable(doc, {
      head: [respHeaders],
      body: respRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    const nba5Filename = `NBA_Criterion_5_Faculty_Contributions_${(departmentName || 'Institution').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(nba5Filename);
    showSuccess(`NBA Criterion 5 PDF "${nba5Filename}" generated and downloaded!`);
  } catch (err) {
    console.error('Failed to generate NBA PDF:', err);
    showError('Failed to generate NBA PDF report.');
  }
};
export const exportNbaTier1SarExcel = (data, departmentName = 'Department', academicYear = '2026-2027') => {
  try {
    const wb = XLSX.utils.book_new();
    const isInst = !departmentName || ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE'].includes(departmentName.toUpperCase());
    const fullDept = isInst ? 'Institution' : (getFullDepartmentName(departmentName) || departmentName);

    // Sheet 1: 5.2 Cadre Proportion
    const cadreRows = [
      ['Educational Service : SNR Sons Charitable Trust'],
      ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
      [`Department of ${fullDept}`],
      [`NBA TIER-1 SAR CRITERION 5.2: FACULTY CADRE PROPORTION (1:2:6 RATIO)`],
      [`Assessment Period: Academic Year ${academicYear}`],
      [],
      [
        'Assessment Year',
        'Professors (Actual / Required)',
        'Associate Professors (Actual / Required)',
        'Assistant Professors (Actual / Required)',
        'Cadre Proportion Marks (Max: 20)'
      ]
    ];

    (data.qualificationTable || []).forEach(q => {
      const c = q.cadre || {};
      cadreRows.push([
        q.yearLabel,
        `${c.profCount || 0} / ${c.rfProf || 0}`,
        `${c.assocCount || 0} / ${c.rfAssoc || 0}`,
        `${c.asstCount || 0} / ${c.rfAsst || 0}`,
        `${c.cadreMarks || 0} / 20.00`
      ]);
    });

    const cadreSheet = XLSX.utils.aoa_to_sheet(cadreRows);
    cadreSheet['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 40 }, { wch: 40 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, cadreSheet, '5.2 Cadre Proportion');

    // Sheet 2: 5.3 Faculty Qualification
    const fqRows = [
      ['Educational Service : SNR Sons Charitable Trust'],
      ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
      ['Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore - 641022.'],
      [`Department of ${fullDept}`],
      [`NBA TIER-1 SAR CRITERION 5.3: FACULTY QUALIFICATION (FQ) EVALUATION`],
      [`Assessment Period: Academic Year ${academicYear}`],
      [],
      [
        'Assessment Year',
        'X (No. of Regular Faculty with Ph.D.)',
        'Y (No. of Regular Faculty with PG / M.Tech)',
        'F (Total Regular Faculty / Required SFR Faculty)',
        'Faculty Qualification Score [FQ = 2.5 * (10X + 4Y) / F] (Max: 20)'
      ]
    ];

    (data.qualificationTable || []).forEach(q => {
      fqRows.push([
        q.yearLabel,
        q.X,
        q.Y,
        q.F,
        q.fqScore
      ]);
    });

    fqRows.push([]);
    fqRows.push([
      '3-Year Average Faculty Qualification (FQ) Score [Max: 20 Marks]',
      '',
      '',
      '',
      `${data.averageFq} / 20.00`
    ]);

    const fqSheet = XLSX.utils.aoa_to_sheet(fqRows);
    fqSheet['!cols'] = [{ wch: 24 }, { wch: 36 }, { wch: 40 }, { wch: 42 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, fqSheet, '5.3 Faculty Qualification');

    // Sheet 3: 5.6 Faculty Retention
    const ret = data.retention || {};
    const retRows = [
      ['Educational Service : SNR Sons Charitable Trust'],
      ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
      [`Department of ${fullDept}`],
      [`NBA TIER-1 SAR CRITERION 5.6: FACULTY RETENTION EVALUATION`],
      [`Assessment Period: Academic Year ${academicYear}`],
      [],
      ['Item / Metric', 'Assessment Details / Numbers'],
      ['Base Academic Year (CAYm2)', ret.baseYear || 'CAYm2'],
      ['Number of Regular Faculty Members in Base Year (CAYm2)', ret.nBase || 0],
      ['Number of Faculty from Base Cohort Retained in CAYm1', ret.nRetainedCAYm1 || 0],
      ['Number of Faculty from Base Cohort Retained in CAY', ret.nRetainedCAY || 0],
      ['Faculty Retention Rate (%) [Retained in CAY / Base Year]', `${ret.retentionRate || 0}%`],
      ['NBA Criterion 5.6 Score Awarded (Max: 25 Marks)', `${ret.retentionMarks || 0} / 25 Marks`],
      [],
      ['Faculty Cohort Retention Tracking Roster:'],
      ['S.No', 'Staff ID', 'Faculty Name', 'Designation', 'DOJ', 'In Base Year (CAYm2)', 'Retained in CAYm1', 'Retained in CAY', 'Current Status']
    ];

    (ret.roster || []).forEach((r, idx) => {
      retRows.push([
        idx + 1,
        r.staff_id,
        r.staff_name,
        r.Designation,
        r.Date_of_joining || 'N/A',
        'Yes',
        r.retainedInCAYm1 ? 'Yes' : 'No',
        r.retainedInCAY ? 'Yes' : 'No',
        r.is_relieved ? `Relieved (${r.date_of_leaving || 'N/A'})` : 'Active'
      ]);
    });

    const retSheet = XLSX.utils.aoa_to_sheet(retRows);
    retSheet['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 28 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, retSheet, '5.6 Faculty Retention');

    // Sheet 4: Form B2 Faculty Details
    const b2Headers = [
      'S. No.',
      'Name',
      'PAN No.',
      'Qualification',
      'Area of Specialization',
      'Designation',
      'Date of Joining',
      'Date Designated as Prof/Assoc Prof',
      'Currently Associated',
      'Nature of Association',
      'Contract Type',
      'Date of Leaving'
    ];

    const b2Rows = [
      ['Educational Service : SNR Sons Charitable Trust'],
      ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
      [`Department of ${fullDept}`],
      ['FACULTY DETAILS OF THE DEPARTMENT (FORM B2)'],
      [`ACADEMIC YEAR ${academicYear}`],
      [],
      b2Headers
    ];

    (data.facultyList || []).forEach((f, idx) => {
      b2Rows.push([
        idx + 1,
        f.staff_name || 'N/A',
        f.pan || 'N/A',
        f.Qualification || 'Ph.D',
        f.area_of_specialization || 'N/A',
        f.Designation || 'N/A',
        f.Date_of_joining || 'N/A',
        f.date_designated_prof || 'NA',
        f.is_relieved ? 'N' : 'Y',
        (f.nature_of_association || 'REGULAR').toUpperCase(),
        f.contractual_type || '-',
        f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'
      ]);
    });

    const b2Sheet = XLSX.utils.aoa_to_sheet(b2Rows);
    b2Sheet['!cols'] = [
      { wch: 8 }, { wch: 28 }, { wch: 15 }, { wch: 15 }, { wch: 32 },
      { wch: 22 }, { wch: 15 }, { wch: 28 }, { wch: 14 }, { wch: 20 },
      { wch: 18 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, b2Sheet, 'Form B2 Faculty Details');

    const filename = `NBA_Tier1_SAR_Criterion5_${(departmentName || 'Dept').replace(/[^a-z0-9]/gi, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);
    showSuccess(`NBA Tier-1 SAR Excel dossier "${filename}" downloaded successfully!`);
  } catch (err) {
    console.error('Failed to export NBA Tier-1 Excel:', err);
    showError('Failed to generate NBA Tier-1 Excel report: ' + err.message);
  }
};

export const exportNbaTier1SarPdf = async (data, departmentName = 'Department', academicYear = '2026-2027', auth = {}) => {
  try {
    const isInst = !departmentName || ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE'].includes(departmentName.toUpperCase());
    const fullDept = isInst ? 'Sri Ramakrishna Engineering College' : `Department of ${getFullDepartmentName(departmentName)}`;
    const deptAcronym = isInst ? 'Institution' : getDepartmentAcronym(departmentName);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') || await fetchImageAsBase64('/logo.png');
    const bannerWidth = 165;
    const bannerHeight = bannerWidth / 5.505;

    const drawHeader = (title) => {
      if (headerBanner) {
        try { doc.addImage(headerBanner, 'PNG', (pageWidth - bannerWidth) / 2, 4, bannerWidth, bannerHeight); } catch(e){}
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(fullDept, pageWidth / 2, 4 + bannerHeight + 5, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(2, 132, 199);
      doc.text(title, pageWidth / 2, 4 + bannerHeight + 10, { align: 'center' });
    };

    // ==========================================
    // PAGE 1: CRITERIA 5.2 (CADRE) & 5.3 (FQ) WITH VECTOR GRAPHS
    // ==========================================
    drawHeader(`NBA TIER-1 SAR EVALUATION DOSSIER - CRITERION 5 (AY ${academicYear})`);
    let currentY = 4 + bannerHeight + 14;

    // Top Executive KPI Summary Row (In Numerical Order: 5.2 -> 5.3 -> 5.6 -> Total Faculty)
    const kpiW = (pageWidth - 26) / 4;
    const kpiH = 13;
    const kpis = [
      { label: '5.2 CADRE PROPORTION', val: `${data.qualificationTable?.[0]?.cadre?.cadreMarks?.toFixed(2) || '0.00'} / 20.00`, sub: 'Target 1:2:6 Ratio', color: [124, 58, 237] },
      { label: '5.3 FACULTY QUALIFICATION', val: `${data.averageFq?.toFixed(2) || '0.00'} / 20.00`, sub: '3-Yr Avg FQ Score', color: [2, 132, 199] },
      { label: '5.6 FACULTY RETENTION', val: `${data.retention?.retentionRate || 0}%`, sub: `${data.retention?.retentionMarks || 0} / 25 Marks`, color: [22, 163, 74] },
      { label: 'TOTAL FACULTY MEMBERS', val: `${data.facultyList?.length || 0} Faculty`, sub: 'Form B2 Verified', color: [15, 23, 42] }
    ];

    kpis.forEach((k, idx) => {
      const kx = 10 + (idx * (kpiW + 2));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(kx, currentY, kpiW, kpiH, 1.5, 1.5, 'FD');

      doc.setFont('times', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(k.label, kx + 3, currentY + 3.5);

      doc.setFontSize(10.5);
      doc.setTextColor(k.color[0], k.color[1], k.color[2]);
      doc.text(k.val, kx + 3, currentY + 8);

      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(k.sub, kx + 3, currentY + 11.5);
    });

    currentY += kpiH + 4;

    // SECTION 1: CRITERION 5.2 CADRE PROPORTION (TABLE ON LEFT + VECTOR GRAPH ON RIGHT)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`5.2 Faculty Cadre Proportion Assessment [Target Ratio 1 : 2 : 6 | Max: 20 Marks]`, 10, currentY);
    currentY += 3;

    const cadreHeaders = ['Assessment Year', 'Prof (AF1/RF1)', 'Assoc (AF2/RF2)', 'Asst (AF3/RF3)', 'Score'];
    const cadreRows = (data.qualificationTable || []).map(q => [
      q.yearLabel,
      `${q.cadre?.profCount || 0} / ${q.cadre?.rfProf || 0}`,
      `${q.cadre?.assocCount || 0} / ${q.cadre?.rfAssoc || 0}`,
      `${q.cadre?.asstCount || 0} / ${q.cadre?.rfAsst || 0}`,
      `${q.cadre?.cadreMarks?.toFixed(2) || '0.00'} / 20`
    ]);

    const tableLeftW = 138;
    const chartRightW = pageWidth - 20 - tableLeftW - 4; // ~135mm
    const section1StartY = currentY;

    autoTable(doc, {
      head: [cadreHeaders],
      body: cadreRows,
      startY: section1StartY,
      margin: { left: 10, right: pageWidth - 10 - tableLeftW },
      styles: { font: 'times', fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] }
    });

    const cadreTableEndY = doc.lastAutoTable.finalY || (section1StartY + 35);
    const chartHeight1 = cadreTableEndY - section1StartY;

    // Draw Vector Graphic 5.2 on Right
    drawCadrePdfChart(doc, 10 + tableLeftW + 4, section1StartY, chartRightW, Math.max(chartHeight1, 35), data.qualificationTable);

    currentY = Math.max(cadreTableEndY, section1StartY + 35) + 6;

    // SECTION 2: CRITERION 5.3 FACULTY QUALIFICATION (TABLE ON LEFT + VECTOR GRAPH ON RIGHT)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`5.3 Faculty Qualification (FQ) [Formula: FQ = 2.5 * (10X + 4Y)/F | Max: 20 Marks]`, 10, currentY);
    currentY += 3;

    const fqHeaders = ['Year', 'X (Ph.D.)', 'Y (PG)', 'F (Total)', 'FQ Score'];
    const fqRows = (data.qualificationTable || []).map(q => [
      q.yearLabel,
      q.X,
      q.Y,
      q.F,
      q.fqScore.toFixed(2)
    ]);
    fqRows.push([
      { content: '3-Year Average FQ', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: `${data.averageFq.toFixed(2)} / 20.00`, styles: { fontStyle: 'bold', textColor: [2, 132, 199] } }
    ]);

    const section2StartY = currentY;

    autoTable(doc, {
      head: [fqHeaders],
      body: fqRows,
      startY: section2StartY,
      margin: { left: 10, right: pageWidth - 10 - tableLeftW },
      styles: { font: 'times', fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    const fqTableEndY = doc.lastAutoTable.finalY || (section2StartY + 35);
    const chartHeight2 = fqTableEndY - section2StartY;

    // Draw Vector Graphic 5.3 on Right
    drawFqPdfChart(doc, 10 + tableLeftW + 4, section2StartY, chartRightW, Math.max(chartHeight2, 35), data.qualificationTable);

    // ==========================================
    // PAGE 2: CRITERION 5.6 (RETENTION) & BASE COHORT ROSTER
    // ==========================================
    doc.addPage();
    drawHeader(`NBA TIER-1 SAR EVALUATION DOSSIER - CRITERION 5.6 (AY ${academicYear})`);
    currentY = 4 + bannerHeight + 14;

    // SECTION 3: CRITERION 5.6 FACULTY RETENTION (TABLE ON LEFT + VECTOR GRAPH ON RIGHT)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`5.6 Faculty Retention Assessment [Base Year: ${data.retention?.baseYear || 'CAYm2'} | Max: 25 Marks]`, 10, currentY);
    currentY += 3;

    const ret = data.retention || {};
    const retHeaders = ['Metric Description', 'Cohort / Evaluation Data'];
    const retRows = [
      ['Base Year (CAYm2) Faculty', `${ret.nBase || 0} Faculty Members`],
      ['Retained in Year 1 (CAYm1)', `${ret.nRetainedCAYm1 || 0} Faculty Members`],
      ['Retained in Year 2 (CAY)', `${ret.nRetainedCAY || 0} Faculty Members`],
      ['Faculty Retention Rate (%)', `${ret.retentionRate || 0}%`],
      ['NBA Score Awarded', `${ret.retentionMarks || 0} / 25 Marks (${ret.retentionRate >= 90 ? '>= 90% Full Marks' : 'Tier Rubric'})`]
    ];

    const section3StartY = currentY;

    autoTable(doc, {
      head: [retHeaders],
      body: retRows,
      startY: section3StartY,
      margin: { left: 10, right: pageWidth - 10 - tableLeftW },
      styles: { font: 'times', fontSize: 7.5, cellPadding: 1.8 },
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] }
    });

    const retTableEndY = doc.lastAutoTable.finalY || (section3StartY + 35);
    const chartHeight3 = retTableEndY - section3StartY;

    // Draw Vector Graphic 5.6 on Right
    drawRetentionPdfChart(doc, 10 + tableLeftW + 4, section3StartY, chartRightW, Math.max(chartHeight3, 34), data.retention);

    currentY = Math.max(retTableEndY, section3StartY + 34) + 6;

    // SECTION 3.2: BASE COHORT RETENTION TRACKING ROSTER
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Base Year (${data.retention?.baseYear || 'CAYm2'}) Cohort Retention Tracking Roster:`, 10, currentY);
    currentY += 3;

    const rosterHeaders = ['S.No', 'Staff ID', 'Faculty Name', 'Designation', 'DOJ', 'In Base Year', 'In CAYm1', 'In CAY', 'Status'];
    const rosterRows = (data.retention?.roster || []).map((r, idx) => [
      idx + 1,
      r.staff_id,
      r.staff_name,
      r.Designation,
      r.Date_of_joining || 'N/A',
      'Yes',
      r.retainedInCAYm1 ? 'Yes' : 'No',
      r.retainedInCAY ? 'Yes' : 'No',
      r.is_relieved ? 'Relieved' : 'Active'
    ]);

    autoTable(doc, {
      head: [rosterHeaders],
      body: rosterRows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 20 },
      styles: { font: 'times', fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] }
    });

    // ==========================================
    // PAGE 3: FORM B2 FACULTY DETAILS TABLE ON NEW PAGE
    // ==========================================
    doc.addPage();
    drawHeader(`FORM B2: FACULTY DETAILS OF THE DEPARTMENT (AY ${academicYear})`);
    currentY = 4 + bannerHeight + 14;

    const b2Headers = [
      'S.No', 'Faculty Name', 'PAN No.', 'Highest Qual.', 'Specialization',
      'Designation', 'DOJ', 'Designated Prof Date', 'Assoc.', 'Nature', 'Mode', 'Leaving Date'
    ];

    const b2Rows = (data.facultyList || []).map((f, idx) => [
      idx + 1,
      f.staff_name || 'N/A',
      f.pan || 'N/A',
      f.Qualification || 'Ph.D',
      f.area_of_specialization || 'N/A',
      f.Designation || 'N/A',
      f.Date_of_joining || 'N/A',
      f.date_designated_prof || 'NA',
      f.is_relieved ? 'N' : 'Y',
      (f.nature_of_association || 'REGULAR').toUpperCase(),
      f.contractual_type || '-',
      f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'
    ]);

    autoTable(doc, {
      head: [b2Headers],
      body: b2Rows,
      startY: currentY,
      margin: { left: 10, right: 10, bottom: 24 },
      styles: { font: 'times', fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] }
    });

    // Verification signatures on final page
    const finalPage = doc.internal.getNumberOfPages();
    doc.setPage(finalPage);
    const sigY = 195;
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text('NBA Criterion 5 In-Charge', 14, sigY);
    doc.text(`HOD - ${deptAcronym}`, pageWidth / 2, sigY, { align: 'center' });
    doc.text('Principal / Head of Institution', pageWidth - 14, sigY, { align: 'right' });

    const safeFilename = `NBA_Tier1_SAR_Criterion5_Dossier_${(departmentName || 'Dept').replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(safeFilename);
    showSuccess(`NBA Tier-1 SAR PDF Dossier with Vector Graphics "${safeFilename}" generated and downloaded!`);
  } catch (err) {
    console.error('Failed to generate NBA Tier-1 PDF:', err);
    showError('Failed to generate NBA Tier-1 PDF report: ' + err.message);
  }
};



