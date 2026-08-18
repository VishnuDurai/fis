import db from '../db.js';
import { getCanonicalDepartmentFolder } from './fileStorage.js';

/**
 * Standardize date string to YYYY-MM-DD for comparison
 */
export function normalizeDate(dateVal) {
  if (!dateVal) return null;
  const s = dateVal.toString().trim();
  if (!s) return null;

  // Handles DD-MM-YYYY or DD/MM/YYYY
  if (s.includes('-') && s.split('-')[0].length === 2) {
    const parts = s.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  if (s.includes('/') && s.split('/')[0].length === 2) {
    const parts = s.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  // ISO string or YYYY-MM-DD
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}

  return s;
}

/**
 * Load all department transfers grouped by staff_id
 */
export function fetchAllDeptHistory(callback) {
  db.all('SELECT staff_id, from_dept, to_dept, transfer_date FROM staff_department_history ORDER BY transfer_date ASC, id ASC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching department history:', err);
      return callback({});
    }

    const historyMap = {};
    (rows || []).forEach(r => {
      const sId = (r.staff_id || '').toLowerCase().trim();
      if (!historyMap[sId]) historyMap[sId] = [];
      historyMap[sId].push({
        from_dept: (r.from_dept || '').trim(),
        to_dept: (r.to_dept || '').trim(),
        transfer_date: normalizeDate(r.transfer_date)
      });
    });

    callback(historyMap);
  });
}

/**
 * Determine a staff member's department at a specific record date
 */
export function getStaffDeptAtDate(staffId, dateVal, currentDept, historyMap) {
  const cDept = (currentDept || 'General').trim();
  const sId = (staffId || '').toLowerCase().trim();

  if (!sId || !historyMap || !historyMap[sId] || historyMap[sId].length === 0) {
    return cDept;
  }

  const rDate = normalizeDate(dateVal);
  if (!rDate) {
    return cDept;
  }

  const transfers = historyMap[sId];

  // If record date is before the first transfer, department was from_dept of first transfer
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    if (t.transfer_date && rDate < t.transfer_date) {
      return t.from_dept || cDept;
    }
  }

  // Otherwise, record date is on or after the last transfer date
  return transfers[transfers.length - 1].to_dept || cDept;
}

/**
 * Helper to check if a resolved department matches a target department (or acronym)
 */
export function matchesDepartment(resolvedDept, targetDept, deptsLookup = []) {
  if (!targetDept) return true;
  const d1 = (resolvedDept || '').toLowerCase().trim();
  const d2 = (targetDept || '').toLowerCase().trim();

  if (d1 === d2) return true;
  if (!d1 || !d2) return false;

  const c1 = getCanonicalDepartmentFolder(d1);
  const c2 = getCanonicalDepartmentFolder(d2);
  if (c1 && c2 && c1.toLowerCase() === c2.toLowerCase()) return true;

  // Check lookup for acronym/name match
  const match = (deptsLookup || []).find(d => {
    const name = (d.name || '').toLowerCase().trim();
    const acr = (d.acronym || '').toLowerCase().trim();
    return (name === d1 || acr === d1) && (name === d2 || acr === d2);
  });

  return !!match;
}
