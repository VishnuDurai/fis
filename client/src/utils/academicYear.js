/**
 * Centralized Academic Year Utility
 * Academic year starts in June (month index 5) and ends in May (month index 4).
 * e.g. July 2026 falls into Academic Year 2026 - 2027.
 */

export function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 5 = June, 11 = Dec

  if (month >= 5) {
    // June - December: Start year is current year
    return `${year}-${year + 1}`;
  } else {
    // January - May: Start year is previous year
    return `${year - 1}-${year}`;
  }
}

/**
 * Performance Appraisal Academic Year Utility
 * Performance appraisals evaluate the completed academic year (e.g. 2025-2026 when in 2026-2027).
 */
export function getAppraisalAcademicYear() {
  const now = new Date();
  let currentStartYear = now.getFullYear();
  if (now.getMonth() < 5) {
    currentStartYear -= 1;
  }
  const appraisalStartYear = currentStartYear - 1;
  return `${appraisalStartYear}-${appraisalStartYear + 1}`;
}

export function getAcademicYearOptions(yearsPast = 5, yearsFuture = 1) {
  const now = new Date();
  let currentStartYear = now.getFullYear();
  if (now.getMonth() < 5) {
    currentStartYear -= 1;
  }

  const options = [];
  // Future years down to past years
  for (let i = yearsFuture; i >= -yearsPast; i--) {
    const startYear = currentStartYear + i;
    const endYear = startYear + 1;
    options.push({
      value: `${startYear}-${endYear}`,
      label: `${startYear} - ${endYear}`
    });
  }
  return options;
}

/**
 * Helper to parse arbitrary date strings into academic year (e.g. '2025-2026')
 */
export function getAcademicYearFromDateStr(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str || str.toLowerCase() === 'n/a') return null;

  // Direct Academic Year format like "2025-2026" or "2025 - 2026"
  if (/^\d{4}\s*-\s*\d{4}$/.test(str)) {
    return str.replace(/\s+/g, '').trim();
  }

  let year = null;
  let month = null;

  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const parts = str.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const parts = str.split('/');
    year = parseInt(parts[2], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(str)) {
    const parts = str.split('-');
    year = parseInt(parts[2], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{4}$/.test(str)) {
    year = parseInt(str, 10);
    month = 6;
  } else {
    const mYear = str.match(/\b(20\d{2})\b/);
    if (mYear) {
      year = parseInt(mYear[1], 10);
      const lower = str.toLowerCase();
      if (lower.includes('jan')) month = 0;
      else if (lower.includes('feb')) month = 1;
      else if (lower.includes('mar')) month = 2;
      else if (lower.includes('apr')) month = 3;
      else if (lower.includes('may')) month = 4;
      else if (lower.includes('jun')) month = 5;
      else if (lower.includes('jul')) month = 6;
      else if (lower.includes('aug')) month = 7;
      else if (lower.includes('sep')) month = 8;
      else if (lower.includes('oct')) month = 9;
      else if (lower.includes('nov')) month = 10;
      else if (lower.includes('dec')) month = 11;
      else month = 6;
    } else {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
        month = d.getMonth();
      }
    }
  }
  if (year === null || isNaN(year)) return null;

  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export function matchesTargetAcademicYear(row, targetAy) {
  if (!targetAy || !targetAy.trim()) return true;
  const cleanTarget = targetAy.replace(/\s+/g, '').trim();

  if (row.academic_year) {
    const ay = String(row.academic_year).replace(/\s+/g, '').trim();
    if (ay === cleanTarget) return true;
  }

  const dateFields = [
    'Date_of_Joining', 'date_of_joining', 'join_date',
    'Date', 'date', 'Award_Date', 'award_date',
    'from_date', 'to_date', 'From_Date', 'To_Date',
    'publication_date', 'issue_date', 'filing_date', 'grant_date',
    'created_at', 'start_date', 'end_date', 'month_year', 'year'
  ];

  for (const f of dateFields) {
    const d = row[f];
    if (d) {
      const rowAy = getAcademicYearFromDateStr(d);
      if (rowAy && rowAy === cleanTarget) return true;
    }
  }
  return false;
}
