import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getFullDepartmentName, getDepartmentAcronym } from './reportGenerator.js';

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
 * Robust date parser supporting DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, and ISO date strings
 */
export const parseDateSafe = (dateStr) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'null' || dateStr === 'undefined') return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  const str = String(dateStr).trim();

  // 1. Check DD-MM-YYYY or DD/MM/YYYY format (e.g. '01-06-2015' -> 1st June 2015)
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Check YYYY-MM-DD format (e.g. '2015-06-01')
  const yyyymmddMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format a date string into readable DD Month YYYY (e.g. 01 June 2015)
 */
export const formatDateDisplay = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return dateStr || 'N/A';
  try {
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
};

export const formatDateShort = (dateStr) => {
  const d = parseDateSafe(dateStr);
  if (!d) return dateStr || 'N/A';
  try {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

/**
 * Resolves proper salutation (Dr., Mr., Mrs., Ms., Prof., Lt. Dr.), clean display name, and pronouns
 */
export const resolveFacultyDetails = (faculty, options = {}) => {
  const rawName = (faculty.staff_name || faculty.name || 'Faculty Member').trim();
  const genderFromDb = (faculty.gender || '').toLowerCase();
  
  let salutation = options.salutation || '';
  let cleanName = rawName;

  if (!salutation) {
    // Check if name has a prefix
    const prefixMatch = rawName.match(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Miss\.|Prof\.|Lt\.Dr\.)\s*/i);
    if (prefixMatch) {
      const p = prefixMatch[1];
      if (/^Dr\./i.test(p)) salutation = 'Dr.';
      else if (/^Mr\./i.test(p)) salutation = 'Mr.';
      else if (/^Mrs\./i.test(p)) salutation = 'Mrs.';
      else if (/^Ms\.|Miss\./i.test(p)) salutation = 'Ms.';
      else if (/^Prof\./i.test(p)) salutation = 'Prof.';
      else if (/^Lt\.Dr\./i.test(p)) salutation = 'Lt. Dr.';
    } else {
      if (genderFromDb === 'female') salutation = 'Ms.';
      else salutation = 'Mr.';
    }
  }

  // Strip leading salutations from cleanName if present to format properly
  const baseName = rawName.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Miss\.|Prof\.|Lt\.Dr\.)\s*/i, '').trim();
  const displayName = `${salutation} ${baseName}`.trim();

  // Determine gender for pronoun usage
  let isFemale = false;
  if (options.gender) {
    isFemale = options.gender.toLowerCase() === 'female';
  } else if (genderFromDb === 'female' || salutation === 'Mrs.' || salutation === 'Ms.' || salutation === 'Miss.') {
    isFemale = true;
  } else {
    isFemale = false;
  }

  const pronouns = {
    subject: isFemale ? 'she' : 'he',
    Subject: isFemale ? 'She' : 'He',
    possessive: isFemale ? 'her' : 'his',
    Possessive: isFemale ? 'Her' : 'His',
    object: isFemale ? 'her' : 'him',
    Object: isFemale ? 'Her' : 'Him'
  };

  return {
    salutation,
    baseName,
    displayName,
    isFemale,
    pronouns
  };
};

/**
 * Calculate precise tenure in Years, Months, Days between two dates
 */
export const calculateTenure = (startDateStr, endDateStr) => {
  const start = parseDateSafe(startDateStr);
  if (!start) return 'N/A';
  try {
    const end = endDateStr && endDateStr !== 'Till Date' ? (parseDateSafe(endDateStr) || new Date()) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 'N/A';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

    return parts.join(', ');
  } catch {
    return 'N/A';
  }
};

/**
 * Converts a number to Indian Currency Words (e.g. 85400 -> Rupees Eighty-Five Thousand Four Hundred Only)
 */
export const numberToWordsIndian = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Rupees Zero Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n) => {
    let current = '';
    if (n >= 100) {
      current += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      current += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      current += ones[n] + ' ';
    }
    return current;
  };

  let words = '';
  const crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (crore > 0) words += convertLessThanOneThousand(crore) + 'Crore ';
  if (lakh > 0) words += convertLessThanOneThousand(lakh) + 'Lakh ';
  if (thousand > 0) words += convertLessThanOneThousand(thousand) + 'Thousand ';
  if (remainder > 0) words += convertLessThanOneThousand(remainder);

  return `Rupees ${words.trim()} Only`;
};

/**
 * Draw Official SREC Letterhead Banner & Borders
 */
const drawOfficialHeaderAndBorders = async (doc) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Double border for high-security certificate appearance
  doc.setDrawColor(30, 41, 59); // Slate 800
  doc.setLineWidth(0.75);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(203, 213, 225); // Slate 300 inner border
  doc.setLineWidth(0.3);
  doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23);

  // Top header banner
  const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') ||
                       await fetchImageAsBase64('/report-logo-left.png') ||
                       await fetchImageAsBase64('/logo.png');

  if (headerBanner) {
    const bannerWidth = 140;
    const bannerHeight = bannerWidth / 5.505;
    const bannerX = (pageWidth - bannerWidth) / 2;
    doc.addImage(headerBanner, 'PNG', bannerX, 14, bannerWidth, bannerHeight);
  } else {
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('SRI RAMAKRISHNA ENGINEERING COLLEGE', pageWidth / 2, 22, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('[Autonomous Institution | Accredited by NAAC with ‘A+’ Grade | Approved by AICTE, New Delhi]', pageWidth / 2, 27, { align: 'center' });
    doc.text('Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore - 641 022, Tamil Nadu, India', pageWidth / 2, 31, { align: 'center' });
  }

  // Header bottom divider line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.6);
  doc.line(16, 44, pageWidth - 16, 44);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(16, 45, pageWidth - 16, 45);
};

/**
 * 1. EXPERIENCE & SERVICE CERTIFICATE (PDF)
 */
export const downloadExperienceCertificate = async (faculty, options = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  await drawOfficialHeaderAndBorders(doc);

  const curYear = new Date().getFullYear();
  const refNo = options.refNo || `SREC/ESTT/EXP/${curYear}/${faculty.staff_id || 'FAC'}`;
  const issueDate = options.issueDate ? formatDateDisplay(options.issueDate) : formatDateDisplay(new Date());

  // Reference & Date Row
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Ref. No: ${refNo}`, 16, 52);
  doc.text(`Date: ${issueDate}`, pageWidth - 16, 52, { align: 'right' });

  // Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('TO WHOMSOEVER IT MAY CONCERN', pageWidth / 2, 63, { align: 'center' });

  doc.setFontSize(14);
  doc.text('EXPERIENCE & SERVICE CERTIFICATE', pageWidth / 2, 70, { align: 'center' });
  
  // Underline Title
  const titleWidth = doc.getTextWidth('EXPERIENCE & SERVICE CERTIFICATE');
  doc.setLineWidth(0.5);
  doc.line((pageWidth - titleWidth) / 2, 71.5, (pageWidth + titleWidth) / 2, 71.5);

  // Faculty details resolution
  const { displayName, pronouns } = resolveFacultyDetails(faculty, options);
  const staffId = (faculty.staff_id || 'N/A').trim();
  const designation = (faculty.Designation || faculty.designation || 'Assistant Professor').trim();
  const fullDeptName = getFullDepartmentName(faculty.Department || faculty.department || 'Engineering');
  
  const rawDoj = options.doj || options.dateOfJoining || faculty.Date_of_joining || faculty.doj || faculty.joining_date;
  const dojFormatted = formatDateDisplay(rawDoj);
  
  const isRelieved = Boolean(faculty.is_relieved);
  const rawLeavingDate = options.dateOfLeaving || options.relievingDate || faculty.date_of_leaving;
  const reliefDateFormatted = (isRelieved && rawLeavingDate) ? formatDateDisplay(rawLeavingDate) : null;
  const tenureText = calculateTenure(rawDoj, isRelieved ? rawLeavingDate : null);
  const conduct = options.conduct || 'Good';

  // Body Paragraph
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  const para1 = isRelieved
    ? `This is to certify that ${displayName} (Staff ID: ${staffId}) was working as a regular full-time faculty member in this institution, designated as ${designation} in the Department of ${fullDeptName}, from ${dojFormatted} to ${reliefDateFormatted}.`
    : `This is to certify that ${displayName} (Staff ID: ${staffId}) is currently working as a regular full-time faculty member in this institution, designated as ${designation} in the Department of ${fullDeptName}, since ${dojFormatted}.`;

  const splitPara1 = doc.splitTextToSize(para1, pageWidth - 36);
  doc.text(splitPara1, 18, 84, { lineHeightFactor: 1.5 });

  const para1Height = (splitPara1.length * 7);
  const nextY = 84 + para1Height + 6;

  const para2 = isRelieved
    ? `During ${pronouns.possessive} total tenure of ${tenureText} at Sri Ramakrishna Engineering College, ${pronouns.possessive} character, conduct, and professional performance were found to be ${conduct}.`
    : `As of date, ${pronouns.subject} has completed a total service tenure of ${tenureText} at Sri Ramakrishna Engineering College. ${pronouns.Possessive} character, conduct, and professional commitment have been found to be ${conduct}.`;

  const splitPara2 = doc.splitTextToSize(para2, pageWidth - 36);
  doc.text(splitPara2, 18, nextY, { lineHeightFactor: 1.5 });

  const para3Y = nextY + (splitPara2.length * 7) + 6;
  const para3 = options.purpose 
    ? `This certificate is issued upon ${pronouns.possessive} request for the purpose of ${options.purpose}.`
    : `This certificate is issued upon ${pronouns.possessive} request for official purposes without any liability on the part of the institution.`;

  const splitPara3 = doc.splitTextToSize(para3, pageWidth - 36);
  doc.text(splitPara3, 18, para3Y, { lineHeightFactor: 1.5 });

  // Summary Information Table
  const tableY = para3Y + (splitPara3.length * 7) + 10;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 24, right: 24 },
    theme: 'grid',
    styles: { font: 'times', fontSize: 10, cellPadding: 3, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    body: [
      [{ content: 'Faculty Name', fontStyle: 'bold', width: 45 }, displayName],
      [{ content: 'Staff ID', fontStyle: 'bold' }, staffId],
      [{ content: 'Designation', fontStyle: 'bold' }, designation],
      [{ content: 'Department', fontStyle: 'bold' }, fullDeptName],
      [{ content: 'Date of Joining', fontStyle: 'bold' }, dojFormatted],
      [{ content: isRelieved ? 'Date of Relieving' : 'Service Status', fontStyle: 'bold' }, isRelieved ? reliefDateFormatted : 'Active in Service'],
      [{ content: 'Total Service Period', fontStyle: 'bold' }, tenureText]
    ]
  });

  // Footer Signatures
  const footerY = pageHeight - 45;

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  // Left Signatory: HR alone
  doc.text('HR', 20, footerY);
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Sri Ramakrishna Engineering College', 20, footerY + 5);

  // Center Seal Area
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.rect((pageWidth / 2) - 18, footerY - 12, 36, 22);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('College Seal', pageWidth / 2, footerY + 1, { align: 'center' });

  // Right Signatory: PRINCIPAL
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('PRINCIPAL', pageWidth - 20, footerY, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Sri Ramakrishna Engineering College', pageWidth - 20, footerY + 5, { align: 'right' });
  doc.text('Coimbatore - 641 022', pageWidth - 20, footerY + 9, { align: 'right' });

  const safeFilename = `Experience_Certificate_${staffId}_${displayName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(safeFilename);
};

/**
 * 2. OFFICIAL RELIEVING ORDER (PDF)
 */
export const downloadRelievingOrder = async (faculty, options = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  await drawOfficialHeaderAndBorders(doc);

  const curYear = new Date().getFullYear();
  const refNo = options.refNo || `SREC/ESTT/RO/${curYear}/${faculty.staff_id || 'FAC'}`;
  const issueDate = options.issueDate ? formatDateDisplay(options.issueDate) : formatDateDisplay(new Date());

  // Reference & Date Row
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Ref. No: ${refNo}`, 16, 52);
  doc.text(`Date: ${issueDate}`, pageWidth - 16, 52, { align: 'right' });

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICE ORDER', pageWidth / 2, 63, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Sub: Establishment – Relieving of Faculty Member – Orders Issued.', pageWidth / 2, 70, { align: 'center' });

  const resignDate = options.resignationDate ? formatDateDisplay(options.resignationDate) : 'earlier communication';
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(`Ref: Resignation letter submitted by the faculty member dated ${resignDate}.`, pageWidth / 2, 76, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(20, 80, pageWidth - 20, 80);

  const { displayName, pronouns } = resolveFacultyDetails(faculty, options);
  const staffId = (faculty.staff_id || 'N/A').trim();
  const designation = (faculty.Designation || faculty.designation || 'Assistant Professor').trim();
  const fullDeptName = getFullDepartmentName(faculty.Department || faculty.department || 'Engineering');
  const deptAcronym = getDepartmentAcronym(faculty.Department || faculty.department);
  
  const rawDoj = options.doj || options.dateOfJoining || faculty.Date_of_joining || faculty.doj || faculty.joining_date;
  const dojFormatted = formatDateDisplay(rawDoj);
  const relievingDate = options.relievingDate || faculty.date_of_leaving || new Date().toISOString().split('T')[0];
  const relievingDateFormatted = formatDateDisplay(relievingDate);
  const tenureText = calculateTenure(rawDoj, relievingDate);

  // Order Paragraph 1
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  const orderText1 = `With reference to the resignation letter cited, ${displayName} (Staff ID: ${staffId}), ${designation} in the Department of ${fullDeptName}, is hereby relieved from ${pronouns.possessive} duties on the afternoon of ${relievingDateFormatted}.`;
  const splitOrder1 = doc.splitTextToSize(orderText1, pageWidth - 36);
  doc.text(splitOrder1, 18, 88, { lineHeightFactor: 1.5 });

  // Order Paragraph 2 (No Dues Clearance)
  const p2Y = 88 + (splitOrder1.length * 7) + 4;
  const orderText2 = `${pronouns.Subject} has completed all handover formalities and obtained necessary "No Dues Clearances" from the Department of ${fullDeptName}, Central Library, Laboratories, Accounts Section, and the Central Administrative Office.`;
  const splitOrder2 = doc.splitTextToSize(orderText2, pageWidth - 36);
  doc.text(splitOrder2, 18, p2Y, { lineHeightFactor: 1.5 });

  // Order Paragraph 3 (Appreciation)
  const p3Y = p2Y + (splitOrder2.length * 7) + 4;
  const orderText3 = `The Management, Principal, and Faculty of Sri Ramakrishna Engineering College place on record their sincere appreciation for ${pronouns.possessive} dedicated service and valuable contributions to the institution during ${pronouns.possessive} tenure of ${tenureText}. We wish ${pronouns.object} all success in ${pronouns.possessive} future endeavors.`;
  const splitOrder3 = doc.splitTextToSize(orderText3, pageWidth - 36);
  doc.text(splitOrder3, 18, p3Y, { lineHeightFactor: 1.5 });

  // Faculty Summary Table
  const tableY = p3Y + (splitOrder3.length * 7) + 8;
  autoTable(doc, {
    startY: tableY,
    margin: { left: 24, right: 24 },
    theme: 'grid',
    styles: { font: 'times', fontSize: 9.5, cellPadding: 2.5, textColor: [30, 41, 59] },
    body: [
      [{ content: 'Faculty Name', fontStyle: 'bold', width: 45 }, displayName],
      [{ content: 'Staff ID', fontStyle: 'bold' }, staffId],
      [{ content: 'Designation & Department', fontStyle: 'bold' }, `${designation}, ${fullDeptName}`],
      [{ content: 'Date of Joining', fontStyle: 'bold' }, dojFormatted],
      [{ content: 'Effective Relieving Date', fontStyle: 'bold' }, `${relievingDateFormatted} (A.N.)`],
      [{ content: 'Total Service Rendered', fontStyle: 'bold' }, tenureText]
    ]
  });

  // Copy To Distribution Section
  const copyY = tableY + 45;
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Copy To:', 18, copyY);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`1. The Individual (${displayName})`, 22, copyY + 5);
  doc.text(`2. Head of the Department - ${deptAcronym}`, 22, copyY + 9.5);
  doc.text('3. Accounts & Payroll Section', 22, copyY + 14);
  doc.text('4. Personal File / Establishment Section', 22, copyY + 18.5);

  // Signatures at bottom
  const footerY = pageHeight - 38;

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  doc.text(`HOD - ${deptAcronym}`, 20, footerY);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Department of ' + fullDeptName, 20, footerY + 5);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('PRINCIPAL', pageWidth - 20, footerY, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Sri Ramakrishna Engineering College', pageWidth - 20, footerY + 5, { align: 'right' });

  const safeFilename = `Relieving_Order_${staffId}_${displayName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(safeFilename);
};

/**
 * 3. SALARY & REMUNERATION CERTIFICATE (PDF)
 */
export const downloadSalaryCertificate = async (faculty, salaryData = {}, options = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  await drawOfficialHeaderAndBorders(doc);

  const curYear = new Date().getFullYear();
  const refNo = options.refNo || `SREC/ESTT/SAL/${curYear}/${faculty.staff_id || 'FAC'}`;
  const issueDate = options.issueDate ? formatDateDisplay(options.issueDate) : formatDateDisplay(new Date());

  // Reference & Date Row
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Ref. No: ${refNo}`, 16, 52);
  doc.text(`Date: ${issueDate}`, pageWidth - 16, 52, { align: 'right' });

  // Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('TO WHOMSOEVER IT MAY CONCERN', pageWidth / 2, 63, { align: 'center' });

  doc.setFontSize(14);
  doc.text('SALARY & REMUNERATION CERTIFICATE', pageWidth / 2, 70, { align: 'center' });

  const purpose = options.purpose || 'Official Bank Loan / Financial Verification';
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`(Issued for: ${purpose})`, pageWidth / 2, 75.5, { align: 'center' });

  // Faculty details resolution
  const { displayName, pronouns } = resolveFacultyDetails(faculty, options);
  const staffId = (faculty.staff_id || 'N/A').trim();
  const designation = (faculty.Designation || faculty.designation || 'Assistant Professor').trim();
  const fullDeptName = getFullDepartmentName(faculty.Department || faculty.department || 'Engineering');
  
  const rawDoj = options.doj || options.dateOfJoining || faculty.Date_of_joining || faculty.doj || faculty.joining_date;
  const dojFormatted = formatDateDisplay(rawDoj);

  // Body Paragraph
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);

  const monthYear = options.salaryMonth || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const introPara = `This is to certify that ${displayName} (Staff ID: ${staffId}) is a regular full-time employee of Sri Ramakrishna Engineering College, working as ${designation} in the Department of ${fullDeptName} since ${dojFormatted}.`;
  const splitIntro = doc.splitTextToSize(introPara, pageWidth - 36);
  doc.text(splitIntro, 18, 83, { lineHeightFactor: 1.5 });

  const statementPara = `${pronouns.Possessive} monthly salary breakdown and earnings structure for the month of ${monthYear} are as detailed below:`;
  doc.text(statementPara, 18, 83 + (splitIntro.length * 7) + 2);

  // Earnings & Deductions items
  const basic = Number(salaryData.basicPay) || 54000;
  const agp = Number(salaryData.agp) || 6000;
  const da = Number(salaryData.da) || 28000;
  const hra = Number(salaryData.hra) || 8000;
  const otherAllowance = Number(salaryData.otherAllowance) || 2500;
  const gross = basic + agp + da + hra + otherAllowance;

  const epf = Number(salaryData.epf) || 1800;
  const pt = Number(salaryData.professionalTax) || 208;
  const tds = Number(salaryData.tds) || 3500;
  const otherDeductions = Number(salaryData.otherDeductions) || 0;
  const totalDeductions = epf + pt + tds + otherDeductions;

  const netPay = gross - totalDeductions;
  const netInWords = numberToWordsIndian(netPay);

  // Dual Column Salary Table
  const tableY = 83 + (splitIntro.length * 7) + 10;

  const formatCurr = (val) => `Rs. ${Number(val).toLocaleString('en-IN')}/-`;

  autoTable(doc, {
    startY: tableY,
    margin: { left: 18, right: 18 },
    theme: 'grid',
    head: [
      [
        { content: 'EARNINGS & ALLOWANCES', colSpan: 2, styles: { halign: 'center', fillColor: [30, 41, 59], textColor: [255, 255, 255] } },
        { content: 'DEDUCTIONS & RECOVERIES', colSpan: 2, styles: { halign: 'center', fillColor: [71, 85, 105], textColor: [255, 255, 255] } }
      ],
      ['Particulars', 'Amount', 'Particulars', 'Amount']
    ],
    body: [
      ['Basic Pay', formatCurr(basic), 'Employees Provident Fund (EPF)', formatCurr(epf)],
      ['Academic Grade Pay (AGP)', formatCurr(agp), 'Professional Tax (PT)', formatCurr(pt)],
      ['Dearness Allowance (DA)', formatCurr(da), 'Income Tax (TDS)', formatCurr(tds)],
      ['House Rent Allowance (HRA)', formatCurr(hra), 'Other Recoveries / Deductions', formatCurr(otherDeductions)],
      ['Special / Conveyance Allowance', formatCurr(otherAllowance), '', ''],
      [
        { content: 'GROSS MONTHLY EARNINGS', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: formatCurr(gross), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'TOTAL DEDUCTIONS', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: formatCurr(totalDeductions), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
      ]
    ],
    foot: [
      [
        { content: 'NET TAKE-HOME PAY (Gross - Deductions)', colSpan: 2, styles: { fontStyle: 'bold', fontSize: 10.5, fillColor: [224, 231, 255], textColor: [30, 27, 75] } },
        { content: formatCurr(netPay), colSpan: 2, styles: { fontStyle: 'bold', fontSize: 11, halign: 'center', fillColor: [224, 231, 255], textColor: [30, 27, 75] } }
      ]
    ],
    styles: { font: 'times', fontSize: 9.5, cellPadding: 2.5 }
  });

  // Net in words box
  const tableEndY = doc.lastAutoTable.finalY + 6;
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Net Monthly Salary in Words:', 18, tableEndY);

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138); // Navy blue
  doc.text(`${netInWords}`, 18, tableEndY + 5.5);

  const disclaimY = tableEndY + 14;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const disclaimText = `This salary certificate is issued upon the employee's request for the specific purpose of ${purpose} without any financial undertaking on the part of the college.`;
  const splitDisclaim = doc.splitTextToSize(disclaimText, pageWidth - 36);
  doc.text(splitDisclaim, 18, disclaimY);

  // Footer Signatures
  const footerY = pageHeight - 38;

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);

  // Left Signatory
  doc.text('FINANCE & ACCOUNTS OFFICER', 20, footerY);
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Sri Ramakrishna Engineering College', 20, footerY + 5);

  // Right Signatory
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('PRINCIPAL', pageWidth - 20, footerY, { align: 'right' });
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.text('Sri Ramakrishna Engineering College', pageWidth - 20, footerY + 5, { align: 'right' });
  doc.text('Coimbatore - 641 022', pageWidth - 20, footerY + 9, { align: 'right' });

  const safeFilename = `Salary_Certificate_${staffId}_${displayName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(safeFilename);
};
