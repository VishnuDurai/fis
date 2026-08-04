import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

    const safeFilename = `${(filename || pageTitle).toLowerCase().replace(/[^a-z0-9]/gi, '_')}_report.pdf`;
    doc.save(safeFilename);
  } catch (err) {
    console.error('Failed to generate PDF report:', err);
    throw err;
  }
};
