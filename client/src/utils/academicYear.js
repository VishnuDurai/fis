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
