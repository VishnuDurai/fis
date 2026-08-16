import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authenticateToken } from './auth.js';
import { moveFacultyDirectory, zipDirectory, SREC_ROOT, getFacultyStorageDir, sanitizeName, getFacultyDepartment } from '../utils/fileStorage.js';
import { fetchAllDeptHistory, getStaffDeptAtDate, matchesDepartment } from '../utils/deptHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Middleware to ensure user is admin or department admin
function requireAdminOrDeptAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'dept_admin') {
    return res.status(403).json({ error: 'Access denied: Requires administrator privilege' });
  }
  next();
}

function requireSystemAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Requires System Administrator privilege' });
  }
  next();
}

// Helper function to calculate Highest Qualification from staff_edu
export function getHighestQualification(eduRows = [], fallbackQual = '') {
  if (!eduRows || eduRows.length === 0) {
    return fallbackQual || 'Not configured';
  }

  const rankCategory = (item = {}) => {
    const c = `${item.category || ''} ${item.degree || ''}`.toString().trim().toUpperCase();
    if (c.includes('PH.D') || c.includes('PHD') || c.includes('DOCTOR')) return 6;
    if (c.includes('PG') || c.includes('POST') || c.includes('MASTER') || c.includes('M.E') || c.includes('M.TECH') || c.includes('M.S') || c.includes('M.SC') || c.includes('MBA') || c.includes('MCA')) return 5;
    if (c.includes('UG') || c.includes('UNDER') || c.includes('BACHELOR') || c.includes('B.E') || c.includes('B.TECH') || c.includes('B.SC') || c.includes('BCA')) return 4;
    if (c.includes('DIPLOMA')) return 3;
    if (c.includes('HSC') || c.includes('12')) return 2;
    if (c.includes('SSLC') || c.includes('10')) return 1;
    return 0;
  };

  const sorted = [...eduRows].sort((a, b) => {
    const rA = rankCategory(a);
    const rB = rankCategory(b);
    if (rA !== rB) return rB - rA;
    return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
  });

  const top = sorted[0];
  if (!top || (!top.category && !top.degree)) return fallbackQual || 'Not configured';

  const degreeName = (top.degree || top.category || '').trim();
  const spec = (top.specialization || '').trim();

  if (spec && degreeName) {
    return `${degreeName} (${spec})`;
  }
  return degreeName || fallbackQual || 'Not configured';
}

// Helper function to calculate Experience at SREC and Total Experience based on current date
export function calculateExperience(row, currentDate = new Date()) {
  if (!row) return { exp_srec_years: 0, exp_srec_months: 0, total_exp_years: 0, total_exp_months: 0, exp_srec: '0 Years, 0 Months', total_exp: '0 Years, 0 Months' };

  const dojStr = (row.Date_of_joining || '').toString().trim();
  let srecY = 0;
  let srecM = 0;

  if (dojStr) {
    let dojDate = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dojStr)) {
      const [y, m, d] = dojStr.split('-').map(Number);
      dojDate = new Date(y, m - 1, d);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dojStr)) {
      const [d, m, y] = dojStr.split('-').map(Number);
      dojDate = new Date(y, m - 1, d);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dojStr)) {
      const [d, m, y] = dojStr.split('/').map(Number);
      dojDate = new Date(y, m - 1, d);
    }

    if (dojDate && !isNaN(dojDate.getTime())) {
      srecY = currentDate.getFullYear() - dojDate.getFullYear();
      srecM = currentDate.getMonth() - dojDate.getMonth();
      if (currentDate.getDate() < dojDate.getDate()) {
        srecM--;
      }
      if (srecM < 0) {
        srecY--;
        srecM += 12;
      }
      if (srecY < 0) {
        srecY = 0;
        srecM = 0;
      }
    }
  }

  const noPrev = (row.has_no_prev_exp || row.no_prev_exp) ? 1 : 0;
  const acadY = noPrev ? 0 : (parseInt(row.prev_exp_academic_years) || 0);
  const acadM = noPrev ? 0 : (parseInt(row.prev_exp_academic_months) || 0);
  const indY = noPrev ? 0 : (parseInt(row.prev_exp_industry_years) || 0);
  const indM = noPrev ? 0 : (parseInt(row.prev_exp_industry_months) || 0);

  const prevMonths = (acadY * 12 + acadM) + (indY * 12 + indM);
  const srecMonths = (srecY * 12 + srecM);
  const grandTotalMonths = prevMonths + srecMonths;

  const totY = Math.floor(grandTotalMonths / 12);
  const totM = grandTotalMonths % 12;

  const formatText = (y, m) => {
    if (y === 0 && m === 0) return '0 Years, 0 Months';
    return `${y} Year${y !== 1 ? 's' : ''}, ${m} Month${m !== 1 ? 's' : ''}`;
  };

  return {
    ...row,
    exp_srec_years: srecY,
    exp_srec_months: srecM,
    total_exp_years: totY,
    total_exp_months: totM,
    exp_srec: formatText(srecY, srecM),
    total_exp: formatText(totY, totM)
  };
}

// 1. GET Staff List (filtered by department if dept_admin)
router.get('/staff', authenticateToken, requireAdminOrDeptAdmin, (req, res) => {
  let query = `
    SELECT 
      a.staff_id, 
      COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, 
      p.email, 
      p.mobile, 
      a.Department, 
      a.Designation, 
      a.Qualification,
      a.Date_of_joining,
      a.area_of_specialization,
      a.date_designated_prof,
      COALESCE(a.nature_of_association, 'REGULAR') as nature_of_association,
      COALESCE(a.contractual_type, '-') as contractual_type,
      a.date_of_leaving,
      p.pan,
      p.aadhar,
      p.aicte_id,
      p.anna_univ_id,
      p.apaar_id,
      p.address,
      p.dob,
      p.gender,
      p.type,
      a.prev_exp_academic_years,
      a.prev_exp_academic_months,
      a.prev_exp_industry_years,
      a.prev_exp_industry_months,
      a.total_prev_exp_years,
      a.total_prev_exp_months,
      a.has_no_prev_exp,
      a.exp_srec_years,
      a.exp_srec_months,
      a.total_exp_years,
      a.total_exp_months,
      COALESCE(u.is_relieved, 0) as is_relieved,
      u.file as profile_pic,
      u.file as file
    FROM staff_academics a
    LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
    LEFT JOIN staff_user u ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(u.staff_id))
  `;
  let params = [];

  if (req.user.role === 'dept_admin') {
    const dept = (req.user.department || '').trim();
    query += `
      WHERE TRIM(LOWER(a.Department)) IN (
        SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(?))
      )
    `;
    params = [dept, dept, dept, dept, dept];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!rows || rows.length === 0) return res.json([]);

    db.all('SELECT staff_id, category, degree, specialization, year FROM staff_edu', [], (eErr, allEdu) => {
      const eduMap = {};
      (allEdu || []).forEach(item => {
        const key = (item.staff_id || '').trim().toLowerCase();
        if (!eduMap[key]) eduMap[key] = [];
        eduMap[key].push(item);
      });

      const now = new Date();
      const enriched = rows.map(r => {
        const key = (r.staff_id || '').trim().toLowerCase();
        const highestQual = getHighestQualification(eduMap[key] || [], r.Qualification);
        return calculateExperience({ ...r, Qualification: highestQual }, now);
      });

      res.json(enriched);
    });
  });
});

// 2. ADD New Faculty member
router.post('/staff', authenticateToken, requireSystemAdmin, (req, res) => {
  const { 
    staff_id, staff_name, password, department, designation,
    prev_exp_academic_years, prev_exp_academic_months,
    prev_exp_industry_years, prev_exp_industry_months,
    has_no_prev_exp, no_prev_exp,
    area_of_specialization, date_designated_prof,
    nature_of_association, contractual_type
  } = req.body;

  if (!staff_id || !staff_name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPass = bcrypt.hashSync(password, 10);
  const noPrev = (has_no_prev_exp || no_prev_exp) ? 1 : 0;
  const acadY = noPrev ? 0 : (parseInt(prev_exp_academic_years) || 0);
  const acadM = noPrev ? 0 : (parseInt(prev_exp_academic_months) || 0);
  const indY = noPrev ? 0 : (parseInt(prev_exp_industry_years) || 0);
  const indM = noPrev ? 0 : (parseInt(prev_exp_industry_months) || 0);

  const totalMonths = (acadY * 12 + acadM) + (indY * 12 + indM);
  const totY = Math.floor(totalMonths / 12);
  const totM = totalMonths % 12;

  db.run(`
    INSERT INTO staff_user (staff_id, password) 
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE password = VALUES(password)
  `, [staff_id, hashedPass], function(err) {
    if (err) {
      console.error('Database error creating faculty user:', err);
      return res.status(500).json({ error: 'Database error creating faculty user' });
    }

    db.run(`
      INSERT INTO staff_personal (staff_id, staff_name, email, mobile, type)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE staff_name = VALUES(staff_name)
    `, [staff_id, staff_name, '', '', 'Regular']);

    db.run(`
      INSERT INTO staff_academics (
        staff_id, staff_name, Department, Designation, Qualification,
        area_of_specialization, date_designated_prof, nature_of_association, contractual_type,
        prev_exp_academic_years, prev_exp_academic_months,
        prev_exp_industry_years, prev_exp_industry_months,
        total_prev_exp_years, total_prev_exp_months, has_no_prev_exp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        Department = VALUES(Department), 
        Designation = VALUES(Designation),
        area_of_specialization = VALUES(area_of_specialization),
        date_designated_prof = VALUES(date_designated_prof),
        nature_of_association = VALUES(nature_of_association),
        contractual_type = VALUES(contractual_type),
        prev_exp_academic_years = VALUES(prev_exp_academic_years),
        prev_exp_academic_months = VALUES(prev_exp_academic_months),
        prev_exp_industry_years = VALUES(prev_exp_industry_years),
        prev_exp_industry_months = VALUES(prev_exp_industry_months),
        total_prev_exp_years = VALUES(total_prev_exp_years),
        total_prev_exp_months = VALUES(total_prev_exp_months),
        has_no_prev_exp = VALUES(has_no_prev_exp)
    `, [
      staff_id, staff_name, department || '', designation || '', '',
      area_of_specialization || '', date_designated_prof || '',
      nature_of_association || 'REGULAR', contractual_type || '-',
      acadY, acadM, indY, indM, totY, totM, noPrev
    ]);

    res.json({ success: true, message: 'Faculty member created successfully' });
  });
});

// 2.5 EDIT Faculty Profile (System Admin only)
router.put('/staff/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const { id } = req.params;
  const {
    staff_name, Department, Designation, Date_of_joining,
    email, mobile, address, pan, aadhar, type,
    aicte_id, anna_univ_id, apaar_id,
    prev_exp_academic_years, prev_exp_academic_months,
    prev_exp_industry_years, prev_exp_industry_months,
    has_no_prev_exp,
    area_of_specialization, date_designated_prof,
    nature_of_association, contractual_type, date_of_leaving
  } = req.body;

  const noPrev = has_no_prev_exp ? 1 : 0;
  const acadY = noPrev ? 0 : (parseInt(prev_exp_academic_years) || 0);
  const acadM = noPrev ? 0 : (parseInt(prev_exp_academic_months) || 0);
  const indY = noPrev ? 0 : (parseInt(prev_exp_industry_years) || 0);
  const indM = noPrev ? 0 : (parseInt(prev_exp_industry_months) || 0);

  const totalMonths = (acadY * 12 + acadM) + (indY * 12 + indM);
  const totY = Math.floor(totalMonths / 12);
  const totM = totalMonths % 12;

  // 1. Update staff_personal
  db.run(`
    INSERT INTO staff_personal (
      staff_id, staff_name, email, mobile, address, pan, aadhar, type,
      aicte_id, anna_univ_id, apaar_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      staff_name = VALUES(staff_name),
      email = VALUES(email),
      mobile = VALUES(mobile),
      address = VALUES(address),
      pan = VALUES(pan),
      aadhar = VALUES(aadhar),
      type = VALUES(type),
      aicte_id = VALUES(aicte_id),
      anna_univ_id = VALUES(anna_univ_id),
      apaar_id = VALUES(apaar_id)
  `, [
    id, staff_name || '', email || '', mobile || '', address || '',
    pan || '', aadhar || '', type || 'Regular',
    aicte_id || '', anna_univ_id || '', apaar_id || ''
  ], (pErr) => {
    if (pErr) console.error('Error updating staff_personal in PUT /staff/:id:', pErr);

    // 2. Update staff_academics
    db.run(`
      INSERT INTO staff_academics (
        staff_id, staff_name, Department, Designation, Date_of_joining,
        area_of_specialization, date_designated_prof, nature_of_association, contractual_type, date_of_leaving,
        prev_exp_academic_years, prev_exp_academic_months,
        prev_exp_industry_years, prev_exp_industry_months,
        total_prev_exp_years, total_prev_exp_months, has_no_prev_exp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        staff_name = VALUES(staff_name),
        Department = VALUES(Department),
        Designation = VALUES(Designation),
        Date_of_joining = VALUES(Date_of_joining),
        area_of_specialization = VALUES(area_of_specialization),
        date_designated_prof = VALUES(date_designated_prof),
        nature_of_association = VALUES(nature_of_association),
        contractual_type = VALUES(contractual_type),
        date_of_leaving = VALUES(date_of_leaving),
        prev_exp_academic_years = VALUES(prev_exp_academic_years),
        prev_exp_academic_months = VALUES(prev_exp_academic_months),
        prev_exp_industry_years = VALUES(prev_exp_industry_years),
        prev_exp_industry_months = VALUES(prev_exp_industry_months),
        total_prev_exp_years = VALUES(total_prev_exp_years),
        total_prev_exp_months = VALUES(total_prev_exp_months),
        has_no_prev_exp = VALUES(has_no_prev_exp)
    `, [
      id, staff_name || '', Department || '', Designation || '', Date_of_joining || '',
      area_of_specialization || '', date_designated_prof || '',
      nature_of_association || 'REGULAR', contractual_type || '-', date_of_leaving || '',
      acadY, acadM, indY, indM, totY, totM, noPrev
    ], (aErr) => {
      if (aErr) {
        console.error('Error updating staff_academics in PUT /staff/:id:', aErr);
        return res.status(500).json({ error: 'Failed to update faculty profile: ' + aErr.message });
      }
      res.json({ success: true, message: `Faculty profile for ${staff_name} (${id}) updated successfully.` });
    });
  });
});

// 3. DELETE Faculty member
router.delete('/staff/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const { id } = req.params;

  const tables = [
    'staff_user', 'staff_personal', 'staff_academics', 'staff_edu',
    'staff_publication', 'staff_book_published', 'staff_resource',
    'staff_award', 'staff_funding', 'staff_ipr', 'staff_certificate',
    'staff_competitive', 'staff_innovative', 'staff_event_organized',
    'staff_development', 'staff_scholars', 'staff_supervisor',
    'staff_club', 'staff_member', 'staff_interaction', 'staff_pan', 'staff_aadhar'
  ];

  tables.forEach(table => {
    db.run(`DELETE FROM ${table} WHERE staff_id = ?`, [id]);
  });

  res.json({ success: true, message: 'Faculty member deleted successfully' });
});

// 3.5. RELIEVE / REACTIVATE Faculty member (System Admin only)
router.put('/staff/:id/relieve', authenticateToken, requireSystemAdmin, (req, res) => {
  const { id } = req.params;
  const { is_relieved, date_of_leaving } = req.body;
  const statusVal = is_relieved ? 1 : 0;
  const leaveDate = statusVal === 1 ? (date_of_leaving || new Date().toISOString().split('T')[0]) : '';

  db.run('UPDATE staff_user SET is_relieved = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [statusVal, id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update faculty relieve status' });
    }

    db.run('UPDATE staff_academics SET date_of_leaving = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [leaveDate, id], (aErr) => {
      if (aErr) console.error('Error updating date_of_leaving on relieve:', aErr);
      res.json({
        success: true,
        message: `Faculty member ${id} ${statusVal === 1 ? `marked as relieved (Date of Leaving: ${leaveDate}). Login access is now blocked.` : 'reactivated. Login access is restored.'}`,
        is_relieved: statusVal,
        date_of_leaving: leaveDate
      });
    });
  });
});

// 3.6. RESET Faculty member password to default (System Admin only)
router.put('/staff/:id/reset-password', authenticateToken, requireSystemAdmin, (req, res) => {
  const { id } = req.params;
  const { defaultPassword } = req.body;

  const newPass = (defaultPassword && defaultPassword.trim()) ? defaultPassword.trim() : 'faculty123';
  const hashedPass = bcrypt.hashSync(newPass, 10);

  db.run('UPDATE staff_user SET password = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [hashedPass, id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to reset faculty password' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: `Faculty member with ID '${id}' not found in authentication records.` });
    }
    res.json({
      success: true,
      message: `Password for faculty member '${id}' has been reset to default password ('${newPass}') successfully.`,
      defaultPassword: newPass
    });
  });
});

// 4. GET Department Admins
router.get('/dept-admins', authenticateToken, requireSystemAdmin, (req, res) => {
  db.all('SELECT staff_id, Department FROM admin_dep', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// 5. ADD Department Admin
router.post('/dept-admins', authenticateToken, requireSystemAdmin, (req, res) => {
  const { staff_id, department, password } = req.body;

  if (!staff_id || !department || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPass = bcrypt.hashSync(password, 10);
  db.run(`
    INSERT INTO admin_dep (staff_id, Department, password) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      Department = VALUES(Department), 
      password = VALUES(password)
  `, [staff_id, department, hashedPass], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to create department admin' });
    res.json({ success: true });
  });
});

// 6. DELETE Department Admin
router.delete('/dept-admins/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  db.run('DELETE FROM admin_dep WHERE staff_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// 6.5 Designations Management APIs
router.get('/designations', authenticateToken, (req, res) => {
  db.all('SELECT id, name, sort_order FROM designations ORDER BY sort_order ASC, id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows || []);
  });
});

router.post('/designations', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Designation name is required' });
  }

  const cleanName = name.trim();

  db.get('SELECT IFNULL(MAX(sort_order), 0) + 1 AS next_order FROM designations', [], (err, row) => {
    const nextOrder = row ? row.next_order : 1;
    db.run('INSERT INTO designations (name, sort_order) VALUES (?, ?)', [cleanName, nextOrder], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Designation already exists' });
        }
        return res.status(500).json({ error: 'Failed to add designation' });
      }
      res.json({ success: true, id: this.lastID, name: cleanName, sort_order: nextOrder });
    });
  });
});

router.post('/designations/reorder', authenticateToken, requireSystemAdmin, (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds array is required' });
  }

  const stmt = db.prepare('UPDATE designations SET sort_order = ? WHERE id = ?');
  orderedIds.forEach((id, index) => {
    stmt.run([index + 1, id]);
  });
  stmt.finalize((err) => {
    if (err) return res.status(500).json({ error: 'Failed to reorder designations' });
    res.json({ success: true });
  });
});

router.delete('/designations/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  db.run('DELETE FROM designations WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete designation' });
    res.json({ success: true });
  });
});

// 7. GET Overview Stats for Dashboard (isolated by department if dept_admin)
router.get('/stats', authenticateToken, requireAdminOrDeptAdmin, (req, res) => {
  const isDeptAdmin = req.user.role === 'dept_admin';
  const dept = (req.user.department || '').trim();

  if (!isDeptAdmin) {
    db.get('SELECT COUNT(*) as count FROM staff_academics', [], (err, r1) => {
      db.get('SELECT COUNT(*) as count FROM staff_publication', [], (err, r2) => {
        db.get('SELECT COUNT(*) as count FROM staff_award', [], (err, r3) => {
          db.get('SELECT COUNT(*) as count FROM staff_event_organized', [], (err, r4) => {
            res.json({
              totalFaculty: r1 ? r1.count : 0,
              totalPublications: r2 ? r2.count : 0,
              totalAwards: r3 ? r3.count : 0,
              totalEvents: r4 ? r4.count : 0
            });
          });
        });
      });
    });
    return;
  }

  db.all('SELECT * FROM departments', [], (dErr, deptsList) => {
    fetchAllDeptHistory((historyMap) => {
      // 1. Faculty count
      db.all('SELECT staff_id, Department FROM staff_academics', [], (fErr, fRows) => {
        const matchingStaff = new Set();
        (fRows || []).forEach(f => {
          if (matchesDepartment(f.Department, dept, deptsList || [])) {
            matchingStaff.add(f.staff_id);
          }
        });
        Object.keys(historyMap).forEach(sId => {
          (historyMap[sId] || []).forEach(h => {
            if (matchesDepartment(h.from_dept, dept, deptsList || []) || matchesDepartment(h.to_dept, dept, deptsList || [])) {
              matchingStaff.add(sId);
            }
          });
        });

        // 2. Publications count
        db.all('SELECT p.staff_id, p.date_con, a.Department FROM staff_publication p LEFT JOIN staff_academics a ON p.staff_id = a.staff_id', [], (pErr, pRows) => {
          const matchingPubs = (pRows || []).filter(p => {
            const rDate = p.date_con;
            const rDept = getStaffDeptAtDate(p.staff_id, rDate, p.Department, historyMap);
            return matchesDepartment(rDept, dept, deptsList || []);
          });

          // 3. Awards count
          db.all('SELECT w.staff_id, w.awa_date, w.date, a.Department FROM staff_award w LEFT JOIN staff_academics a ON w.staff_id = a.staff_id', [], (aErr, aRows) => {
            const matchingAwards = (aRows || []).filter(w => {
              const rDate = w.awa_date || w.date;
              const rDept = getStaffDeptAtDate(w.staff_id, rDate, w.Department, historyMap);
              return matchesDepartment(rDept, dept, deptsList || []);
            });

            // 4. Events count
            db.all('SELECT e.staff_id, e.from_date, e.date, a.Department FROM staff_event_organized e LEFT JOIN staff_academics a ON e.staff_id = a.staff_id', [], (eErr, eRows) => {
              const matchingEvents = (eRows || []).filter(e => {
                const rDate = e.from_date || e.date;
                const rDept = getStaffDeptAtDate(e.staff_id, rDate, e.Department, historyMap);
                return matchesDepartment(rDept, dept, deptsList || []);
              });

              res.json({
                totalFaculty: matchingStaff.size,
                totalPublications: matchingPubs.length,
                totalAwards: matchingAwards.length,
                totalEvents: matchingEvents.length
              });
            });
          });
        });
      });
    });
  });
});

// 8. UPDATE Faculty Member Profile & Academic details (System Admin only)
router.put('/staff/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const targetId = req.params.id;
  const {
    staff_name, dob, gender, address, mobile, email, pan, aadhar, type,
    aicte_id, anna_univ_id, apaar_id,
    Department, Designation, Date_of_joining, Qualification
  } = req.body;

  db.serialize(() => {
    db.run(`
      UPDATE staff_personal
      SET staff_name = ?, dob = ?, gender = ?, address = ?, mobile = ?, email = ?, pan = ?, aadhar = ?, type = ?,
          aicte_id = ?, anna_univ_id = ?, apaar_id = ?
      WHERE staff_id = ?
    `, [
      staff_name || '', dob || '', gender || '', address || '', mobile || '', email || '', pan || '', aadhar || '', type || 'Regular',
      aicte_id || '', anna_univ_id || '', apaar_id || '',
      targetId
    ]);

    const {
      prev_exp_academic_years, prev_exp_academic_months,
      prev_exp_industry_years, prev_exp_industry_months,
      has_no_prev_exp, no_prev_exp
    } = req.body;

    const noPrev = (has_no_prev_exp || no_prev_exp) ? 1 : 0;
    const acadY = noPrev ? 0 : (parseInt(prev_exp_academic_years) || 0);
    const acadM = noPrev ? 0 : (parseInt(prev_exp_academic_months) || 0);
    const indY = noPrev ? 0 : (parseInt(prev_exp_industry_years) || 0);
    const indM = noPrev ? 0 : (parseInt(prev_exp_industry_months) || 0);

    const totalMonths = (acadY * 12 + acadM) + (indY * 12 + indM);
    const totY = Math.floor(totalMonths / 12);
    const totM = totalMonths % 12;

    const computed = calculateExperience({
      Date_of_joining,
      prev_exp_academic_years: acadY,
      prev_exp_academic_months: acadM,
      prev_exp_industry_years: indY,
      prev_exp_industry_months: indM,
      has_no_prev_exp: noPrev
    }, new Date());

    db.run(`
      UPDATE staff_academics
      SET staff_name = ?, Date_of_joining = ?, Department = ?, Designation = ?, Qualification = ?,
          prev_exp_academic_years = ?, prev_exp_academic_months = ?,
          prev_exp_industry_years = ?, prev_exp_industry_months = ?,
          total_prev_exp_years = ?, total_prev_exp_months = ?, has_no_prev_exp = ?,
          exp_srec_years = ?, exp_srec_months = ?,
          total_exp_years = ?, total_exp_months = ?
      WHERE staff_id = ?
    `, [
      staff_name || '', Date_of_joining || '', Department || '', Designation || '', Qualification || '',
      acadY, acadM, indY, indM, totY, totM, noPrev,
      computed.exp_srec_years, computed.exp_srec_months,
      computed.total_exp_years, computed.total_exp_months,
      targetId
    ], function(err) {
      if (err) return res.status(500).json({ error: 'Database error updating faculty details' });
      res.json({ success: true, message: 'Faculty profile updated successfully' });
    });
  });
});

// === DEPARTMENTS API ===
// GET all departments (available to all logged-in users)
router.get('/departments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM departments ORDER BY name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ADD a new department (System Admin only)
router.post('/departments', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name, acronym } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });

  db.run('INSERT INTO departments (name, acronym) VALUES (?, ?)', [name, acronym || ''], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Department already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// DELETE a department (System Admin only)
router.delete('/departments/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  db.run('DELETE FROM departments WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});


// === PROFESSIONAL SOCIETIES API ===
// GET all professional societies (available to all logged-in users)
router.get('/societies', authenticateToken, (req, res) => {
  db.all('SELECT * FROM professional ORDER BY pro_name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ADD professional society (System Admin only)
router.post('/societies', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Society name is required' });

  db.run('INSERT INTO professional (pro_name) VALUES (?)', [name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Professional society already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// DELETE professional society (System Admin only)
router.delete('/societies/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  db.run('DELETE FROM professional WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});


// === UNIVERSITIES API ===
// GET all universities (available to all logged-in users)
router.get('/universities', authenticateToken, (req, res) => {
  db.all('SELECT * FROM university ORDER BY uni_name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ADD university (System Admin only)
router.post('/universities', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'University name is required' });

  db.run('INSERT INTO university (uni_name) VALUES (?)', [name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'University already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// DELETE university (System Admin only)
router.delete('/universities/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  db.run('DELETE FROM university WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});


// === SYSTEM ADMINISTRATORS API ===
// GET all system administrators
router.get('/system-admins', authenticateToken, requireSystemAdmin, (req, res) => {
  db.all(`
    SELECT a.staff_id, p.staff_name, ac.Department, ac.Designation
    FROM admin a
    LEFT JOIN staff_personal p ON a.staff_id = p.staff_id
    LEFT JOIN staff_academics ac ON a.staff_id = ac.staff_id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ADD a new system administrator
router.post('/system-admins', authenticateToken, requireSystemAdmin, (req, res) => {
  const { staff_id, password } = req.body;
  if (!staff_id || !password) {
    return res.status(400).json({ error: 'Staff ID and Password are required' });
  }

  const hashedPass = bcrypt.hashSync(password, 10);
  db.run(`
    INSERT INTO admin (staff_id, password) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE password = VALUES(password)
  `, [staff_id, hashedPass], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to create system administrator' });
    res.json({ success: true, message: 'System Administrator account created successfully' });
  });
});

// DELETE system administrator
router.delete('/system-admins/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const staffId = req.params.id;
  db.run('DELETE FROM admin WHERE staff_id = ?', [staffId], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true, message: 'System Administrator account deleted successfully' });
  });
});

// === FACULTY DEPARTMENT TRANSFER ===
const handleDepartmentTransfer = (staff_id, target_department, transfer_date, res) => {
  const cleanId = (staff_id || '').toString().trim();
  const targetDept = (target_department || '').toString().trim();
  const effDate = (transfer_date || '').toString().trim() || new Date().toISOString().split('T')[0];

  if (!cleanId || !targetDept) {
    return res.status(400).json({ error: 'Staff ID and Target Department are required' });
  }

  // Find old department
  db.get('SELECT Department FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [cleanId], (err, row) => {
    const oldDept = row ? row.Department : 'General';

    // Record transfer history
    db.run(
      'INSERT INTO staff_department_history (staff_id, from_dept, to_dept, transfer_date) VALUES (?, ?, ?, ?)',
      [cleanId, oldDept, targetDept, effDate],
      (hErr) => {
        if (hErr) console.error('Error recording department transfer history:', hErr);

        // Update staff_academics table
        db.run('UPDATE staff_academics SET Department = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [targetDept, cleanId], function(err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error updating faculty department' });
          }

          // Also update admin_dep if user is a department administrator
          db.run('UPDATE admin_dep SET Department = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [targetDept, cleanId], (dErr) => {
            // Move physical directory & remap database paths
            moveFacultyDirectory(cleanId, oldDept, targetDept, (mErr) => {
              res.json({ 
                success: true, 
                message: `Faculty member ${cleanId} successfully transferred from ${oldDept} to ${targetDept} effective ${effDate}. Physical folder moved and DB paths remapped.` 
              });
            });
          });
        });
      }
    );
  });
};

router.post('/staff/transfer', authenticateToken, requireSystemAdmin, (req, res) => {
  const { staff_id, target_department, department, transfer_date } = req.body;
  handleDepartmentTransfer(staff_id, target_department || department, transfer_date, res);
});

router.put('/staff/:id/transfer', authenticateToken, requireSystemAdmin, (req, res) => {
  const { id } = req.params;
  const { target_department, department, transfer_date } = req.body;
  handleDepartmentTransfer(id, target_department || department, transfer_date, res);
});

// === MULTI-LEVEL DOCUMENT DOWNLOAD APIs ===

// 1. Download Individual Faculty Documents (ZIP)
router.get('/download/faculty/:staffId', authenticateToken, (req, res) => {
  const { staffId } = req.params;

  getFacultyDepartment(staffId, (err, deptName) => {
    const facultyDir = getFacultyStorageDir(staffId, deptName);

    if (!fs.existsSync(facultyDir) || fs.readdirSync(facultyDir).length === 0) {
      return res.status(404).json({ error: `No uploaded documents found for faculty member ${staffId}` });
    }

    try {
      const tempZipDir = path.join(__dirname, '../temp_downloads');
      if (!fs.existsSync(tempZipDir)) fs.mkdirSync(tempZipDir, { recursive: true });

      const zipPath = path.join(tempZipDir, `${staffId}_documents.zip`);
      zipDirectory(facultyDir, zipPath);

      res.download(zipPath, `${staffId}_documents.zip`, (dErr) => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      });
    } catch (e) {
      console.error('Faculty download zip error:', e);
      res.status(500).json({ error: 'Failed to compress faculty documents' });
    }
  });
});

// 2. Download Department-wise Documents (ZIP)
router.get('/download/department/:deptName', authenticateToken, requireAdminOrDeptAdmin, (req, res) => {
  const deptName = decodeURIComponent(req.params.deptName || '').trim();
  const cleanDept = sanitizeName(deptName);
  const deptDir = path.join(SREC_ROOT, cleanDept);

  if (!fs.existsSync(deptDir) || fs.readdirSync(deptDir).length === 0) {
    return res.status(404).json({ error: `No uploaded documents found for department "${deptName}"` });
  }

  try {
    const tempZipDir = path.join(__dirname, '../temp_downloads');
    if (!fs.existsSync(tempZipDir)) fs.mkdirSync(tempZipDir, { recursive: true });

    const zipPath = path.join(tempZipDir, `${cleanDept}_documents.zip`);
    zipDirectory(deptDir, zipPath);

    res.download(zipPath, `${cleanDept}_documents.zip`, (dErr) => {
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    });
  } catch (e) {
    console.error('Department download zip error:', e);
    res.status(500).json({ error: 'Failed to compress department documents' });
  }
});

// 3. Download Institution-wide Documents (ZIP)
router.get('/download/institution', authenticateToken, requireSystemAdmin, (req, res) => {
  if (!fs.existsSync(SREC_ROOT) || fs.readdirSync(SREC_ROOT).length === 0) {
    return res.status(404).json({ error: 'No documents found in SREC repository' });
  }

  try {
    const tempZipDir = path.join(__dirname, '../temp_downloads');
    if (!fs.existsSync(tempZipDir)) fs.mkdirSync(tempZipDir, { recursive: true });

    const zipPath = path.join(tempZipDir, 'SREC_All_Documents.zip');
    zipDirectory(SREC_ROOT, zipPath);

    res.download(zipPath, 'SREC_All_Documents.zip', (dErr) => {
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    });
  } catch (e) {
    console.error('Institution download zip error:', e);
    res.status(500).json({ error: 'Failed to compress institutional documents' });
  }
});

// UPDATE department lookup
router.put('/departments/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });

  db.run('UPDATE department SET name = ? WHERE id = ?', [name, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// UPDATE society lookup
router.put('/societies/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Society name is required' });

  db.run('UPDATE professional SET name = ? WHERE id = ?', [name, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// UPDATE university lookup
router.put('/universities/:id', authenticateToken, requireSystemAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'University name is required' });

  db.run('UPDATE university SET name = ? WHERE id = ?', [name, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// Configure Multer for Bulk Upload Memory Storage
const bulkUpload = multer({ storage: multer.memoryStorage() });

// Helper to normalize XLSX/CSV column keys
function getRowValue(row, possibleKeys) {
  if (!row) return '';
  const keys = Object.keys(row);
  for (const pKey of possibleKeys) {
    const pLower = pKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const kLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (kLower === pLower) {
        return row[key] !== undefined ? row[key].toString().trim() : '';
      }
    }
  }
  return '';
}

// === BULK FACULTY UPLOAD & SAMPLE TEMPLATE APIs ===

// 1. Download Sample Bulk Upload Template (CSV)
router.get('/bulk-faculty/template', authenticateToken, requireSystemAdmin, (req, res) => {
  const headers = [
    'Staff ID',
    'Faculty Name',
    'Department',
    'Designation',
    'Email',
    'Mobile',
    'Date of Joining (YYYY-MM-DD)',
    'Academic Exp Years',
    'Academic Exp Months',
    'Industry Exp Years',
    'Industry Exp Months',
    'No Previous Exp (1/0)'
  ];

  const sampleRows = [
    [
      'TE1050',
      'Dr. A. Raman',
      'Computer Science & Engineering',
      'Associate Professor',
      'raman.a@srec.ac.in',
      '9876543210',
      '2018-06-15',
      '5',
      '2',
      '2',
      '0',
      '0'
    ],
    [
      'TE1051',
      'Ms. S. Priya',
      'Information Technology',
      'Assistant Professor',
      'priya.s@srec.ac.in',
      '9876543211',
      '2021-07-01',
      '3',
      '0',
      '0',
      '0',
      '0'
    ]
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_faculty_bulk_upload.csv"');
  return res.send(csvContent);
});

// 2. Bulk Upload Faculty Details & Create Logins
router.post('/bulk-faculty/upload', authenticateToken, requireSystemAdmin, bulkUpload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV or Excel file was selected for upload.' });
  }

  let rows = [];
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  } catch (e) {
    console.error('Failed to parse uploaded bulk faculty file:', e);
    return res.status(400).json({ error: 'Failed to parse file. Please upload a valid CSV or Excel (.xlsx) file.' });
  }

  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: 'Uploaded template is empty. Please add faculty records and try again.' });
  }

  let createdCount = 0;
  const errors = [];
  let completed = 0;
  const total = rows.length;

  db.serialize(() => {
    rows.forEach((row, index) => {
      const rowNum = index + 2; // Accounting for 1-based index + header row

      const staffId = getRowValue(row, ['Staff ID', 'staff_id', 'StaffId', 'ID']);
      const staffName = getRowValue(row, ['Faculty Name', 'Staff Name', 'staff_name', 'Name']);
      const department = getRowValue(row, ['Department', 'dept', 'Department Name']);
      const designation = getRowValue(row, ['Designation', 'desg']) || 'Assistant Professor';
      const email = getRowValue(row, ['Email', 'email']);
      const mobile = getRowValue(row, ['Mobile', 'mobile', 'Phone']);
      const doj = getRowValue(row, ['Date of Joining (YYYY-MM-DD)', 'Date of Joining', 'Date_of_joining', 'DOJ', 'doj']);

      const acadY = parseInt(getRowValue(row, ['Academic Exp Years', 'prev_exp_academic_years'])) || 0;
      const acadM = parseInt(getRowValue(row, ['Academic Exp Months', 'prev_exp_academic_months'])) || 0;
      const indY = parseInt(getRowValue(row, ['Industry Exp Years', 'prev_exp_industry_years'])) || 0;
      const indM = parseInt(getRowValue(row, ['Industry Exp Months', 'prev_exp_industry_months'])) || 0;
      const noPrevVal = getRowValue(row, ['No Previous Exp (1/0)', 'has_no_prev_exp', 'no_prev_exp']);
      const hasNoPrev = (noPrevVal === '1' || noPrevVal.toLowerCase() === 'true' || noPrevVal.toLowerCase() === 'yes') ? 1 : 0;

      if (!staffId || !staffName || !department) {
        errors.push({ row: rowNum, staff_id: staffId || 'N/A', message: 'Missing required field(s): Staff ID, Faculty Name, or Department.' });
        completed++;
        if (completed === total) sendResponse();
        return;
      }

      const hashedPass = bcrypt.hashSync(staffId, 10);
      const totalMonths = (hasNoPrev ? 0 : (acadY * 12 + acadM)) + (hasNoPrev ? 0 : (indY * 12 + indM));
      const totY = Math.floor(totalMonths / 12);
      const totM = totalMonths % 12;

      const computed = calculateExperience({
        Date_of_joining: doj,
        prev_exp_academic_years: hasNoPrev ? 0 : acadY,
        prev_exp_academic_months: hasNoPrev ? 0 : acadM,
        prev_exp_industry_years: hasNoPrev ? 0 : indY,
        prev_exp_industry_months: hasNoPrev ? 0 : indM,
        has_no_prev_exp: hasNoPrev
      }, new Date());

      // 1. Upsert staff_user
      db.run(`
        INSERT INTO staff_user (staff_id, password, is_relieved) VALUES (?, ?, 0)
        ON DUPLICATE KEY UPDATE password = VALUES(password)
      `, [staffId, hashedPass], function(uErr) {
        if (uErr) {
          errors.push({ row: rowNum, staff_id: staffId, message: 'Database error creating user login' });
          completed++;
          if (completed === total) sendResponse();
          return;
        }

        // 2. Upsert staff_personal
        db.run(`
          INSERT INTO staff_personal (staff_id, staff_name, email, mobile, type) VALUES (?, ?, ?, ?, 'Regular')
          ON DUPLICATE KEY UPDATE 
            staff_name = VALUES(staff_name),
            email = CASE WHEN VALUES(email) != '' THEN VALUES(email) ELSE staff_personal.email END,
            mobile = CASE WHEN VALUES(mobile) != '' THEN VALUES(mobile) ELSE staff_personal.mobile END
        `, [staffId, staffName, email, mobile]);

        // 3. Upsert staff_academics
        db.run(`
          INSERT INTO staff_academics (
            staff_id, staff_name, Department, Designation, Date_of_joining, Qualification,
            prev_exp_academic_years, prev_exp_academic_months,
            prev_exp_industry_years, prev_exp_industry_months,
            total_prev_exp_years, total_prev_exp_months, has_no_prev_exp,
            exp_srec_years, exp_srec_months, total_exp_years, total_exp_months
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            staff_name = VALUES(staff_name),
            Department = VALUES(Department),
            Designation = VALUES(Designation),
            Date_of_joining = VALUES(Date_of_joining),
            prev_exp_academic_years = VALUES(prev_exp_academic_years),
            prev_exp_academic_months = VALUES(prev_exp_academic_months),
            prev_exp_industry_years = VALUES(prev_exp_industry_years),
            prev_exp_industry_months = VALUES(prev_exp_industry_months),
            total_prev_exp_years = VALUES(total_prev_exp_years),
            total_prev_exp_months = excluded.total_prev_exp_months,
            has_no_prev_exp = excluded.has_no_prev_exp,
            exp_srec_years = excluded.exp_srec_years,
            exp_srec_months = excluded.exp_srec_months,
            total_exp_years = excluded.total_exp_years,
            total_exp_months = excluded.total_exp_months
        `, [
          staffId, staffName, department, designation, doj || '', '',
          hasNoPrev ? 0 : acadY, hasNoPrev ? 0 : acadM,
          hasNoPrev ? 0 : indY, hasNoPrev ? 0 : indM,
          totY, totM, hasNoPrev,
          computed.exp_srec_years, computed.exp_srec_months,
          computed.total_exp_years, computed.total_exp_months
        ], (aErr) => {
          if (aErr) {
            errors.push({ row: rowNum, staff_id: staffId, message: 'Failed to update academic profile: ' + aErr.message });
          } else {
            createdCount++;
            // Initialize storage directory for faculty
            getFacultyStorageDir(staffId, department);
          }
          completed++;
          if (completed === total) sendResponse();
        });
      });
    });
  });

  function sendResponse() {
    return res.json({
      success: true,
      totalProcessed: total,
      createdCount,
      errorCount: errors.length,
      errors,
      message: `Bulk import completed! Successfully created/updated ${createdCount} faculty logins out of ${total} records.`
    });
  }
});

// Helper to check if user is System Admin, Principal, HR or Institutional Admin
const isInstAdminUser = (user) => {
  if (!user) return false;
  if (user.role === 'admin' || user.isInstitutionalAdmin) return true;
  const desg = (user.designation || '').toLowerCase();
  return desg.includes('principal') || desg.includes('hr');
};

// Helper to sync Club Faculty Incharge & Co-Faculty Incharge assignment with Institutional Responsibilities
function syncClubResponsibility(clubName, oldStaffId, newStaffId, assignedByName, customRolePrefix = 'Faculty Incharge', callback) {
  const respTitle = `${customRolePrefix} - ${clubName.trim()}`;

  const addOrUpdateNew = () => {
    if (!newStaffId) {
      if (callback) callback(null);
      return;
    }
    db.get(`
      SELECT p.staff_name, a.Department 
      FROM staff_personal p 
      LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id)) 
      WHERE LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?))
    `, [newStaffId], (err, row) => {
      const dept = row ? (row.Department || 'Institution') : 'Institution';
      const assigner = assignedByName || 'Institutional Administrator';

      db.get(`
        SELECT id FROM staff_responsibilities 
        WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
          AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
      `, [newStaffId, respTitle], (rErr, existing) => {
        if (!existing) {
          db.run(`
            INSERT INTO staff_responsibilities (staff_id, assigned_by, department, academic_year, responsibility, level)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [newStaffId, assigner, dept, '2026-2027', respTitle, 'Institutional Level'], (insErr) => {
            if (callback) callback(insErr);
          });
        } else {
          db.run(`
            UPDATE staff_responsibilities SET assigned_by = ? WHERE id = ?
          `, [assigner, existing.id], (upErr) => {
            if (callback) callback(upErr);
          });
        }
      });
    });
  };

  if (oldStaffId && oldStaffId.trim().toLowerCase() !== (newStaffId || '').trim().toLowerCase()) {
    db.run(`
      DELETE FROM staff_responsibilities 
      WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
        AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
    `, [oldStaffId, respTitle], () => {
      addOrUpdateNew();
    });
  } else {
    addOrUpdateNew();
  }
}

// 1. GET all clubs with faculty incharge & co-incharge details
router.get('/clubs', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'dept_admin' && !isInstAdminUser(req.user)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all(`
    SELECT c.*, 
           COALESCE(p.staff_name, c.faculty_incharge_id) as faculty_incharge_name,
           a.Department as faculty_department,
           a.Designation as faculty_designation,
           COALESCE(p2.staff_name, c.co_faculty_incharge_id) as co_faculty_incharge_name,
           a2.Department as co_faculty_department,
           a2.Designation as co_faculty_designation
    FROM clubs c
    LEFT JOIN staff_personal p ON LOWER(TRIM(c.faculty_incharge_id)) = LOWER(TRIM(p.staff_id))
    LEFT JOIN staff_academics a ON LOWER(TRIM(c.faculty_incharge_id)) = LOWER(TRIM(a.staff_id))
    LEFT JOIN staff_personal p2 ON LOWER(TRIM(c.co_faculty_incharge_id)) = LOWER(TRIM(p2.staff_id))
    LEFT JOIN staff_academics a2 ON LOWER(TRIM(c.co_faculty_incharge_id)) = LOWER(TRIM(a2.staff_id))
    ORDER BY c.name ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    res.json(rows || []);
  });
});

// 2. POST create a new club with faculty incharge & co-incharge
router.post('/clubs', authenticateToken, (req, res) => {
  if (!isInstAdminUser(req.user)) {
    return res.status(403).json({ error: 'Access denied: System Administrator, Principal, or HR only' });
  }

  const { name, faculty_incharge_id, co_faculty_incharge_id } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Club name is required' });
  }

  const cleanName = name.trim();
  const inchargeId = (faculty_incharge_id || '').trim();
  const coInchargeId = (co_faculty_incharge_id || '').trim();
  const assignerName = req.user.name || (req.user.designation ? req.user.designation : 'System Administrator');

  db.run(`
    INSERT INTO clubs (name, faculty_incharge_id, co_faculty_incharge_id) VALUES (?, ?, ?)
  `, [cleanName, inchargeId || null, coInchargeId || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'A club with this name already exists.' });
      }
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    const clubId = this.lastID;
    syncClubResponsibility(cleanName, null, inchargeId, assignerName, 'Faculty Incharge', () => {
      syncClubResponsibility(cleanName, null, coInchargeId, assignerName, 'Co-Faculty Incharge', () => {
        return res.json({ success: true, id: clubId, message: 'Club created successfully and Institutional Responsibilities assigned!' });
      });
    });
  });
});

// 3. PUT update an existing club or change faculty incharge / co-incharge
router.put('/clubs/:id', authenticateToken, (req, res) => {
  if (!isInstAdminUser(req.user)) {
    return res.status(403).json({ error: 'Access denied: System Administrator, Principal, or HR only' });
  }

  const { id } = req.params;
  const { name, faculty_incharge_id, co_faculty_incharge_id } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Club name is required' });
  }

  const cleanName = name.trim();
  const newInchargeId = (faculty_incharge_id || '').trim();
  const newCoInchargeId = (co_faculty_incharge_id || '').trim();
  const assignerName = req.user.name || (req.user.designation ? req.user.designation : 'System Administrator');

  db.get('SELECT * FROM clubs WHERE id = ?', [id], (err, existingClub) => {
    if (err || !existingClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const oldName = existingClub.name;
    const oldInchargeId = existingClub.faculty_incharge_id;
    const oldCoInchargeId = existingClub.co_faculty_incharge_id;

    db.run(`
      UPDATE clubs SET name = ?, faculty_incharge_id = ?, co_faculty_incharge_id = ? WHERE id = ?
    `, [cleanName, newInchargeId || null, newCoInchargeId || null, id], function(uErr) {
      if (uErr) {
        if (uErr.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'A club with this name already exists.' });
        }
        return res.status(500).json({ error: 'Database error: ' + uErr.message });
      }

      if (oldName !== cleanName && oldInchargeId) {
        db.run(`
          DELETE FROM staff_responsibilities 
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
            AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
        `, [oldInchargeId, `Faculty Incharge - ${oldName}`]);
      }
      if (oldName !== cleanName && oldCoInchargeId) {
        db.run(`
          DELETE FROM staff_responsibilities 
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
            AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
        `, [oldCoInchargeId, `Co-Faculty Incharge - ${oldName}`]);
      }

      syncClubResponsibility(cleanName, oldName === cleanName ? oldInchargeId : null, newInchargeId, assignerName, 'Faculty Incharge', () => {
        syncClubResponsibility(cleanName, oldName === cleanName ? oldCoInchargeId : null, newCoInchargeId, assignerName, 'Co-Faculty Incharge', () => {
          return res.json({ success: true, message: 'Club updated successfully and Institutional Responsibilities synced!' });
        });
      });
    });
  });
});

// 4. DELETE a club
router.delete('/clubs/:id', authenticateToken, (req, res) => {
  if (!isInstAdminUser(req.user)) {
    return res.status(403).json({ error: 'Access denied: System Administrator, Principal, or HR only' });
  }

  const { id } = req.params;

  db.get('SELECT * FROM clubs WHERE id = ?', [id], (err, existingClub) => {
    if (err || !existingClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const clubName = existingClub.name;
    const inchargeId = existingClub.faculty_incharge_id;
    const coInchargeId = existingClub.co_faculty_incharge_id;

    db.run('DELETE FROM clubs WHERE id = ?', [id], function(dErr) {
      if (dErr) return res.status(500).json({ error: 'Database error: ' + dErr.message });

      if (inchargeId) {
        db.run(`
          DELETE FROM staff_responsibilities 
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
            AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
        `, [inchargeId, `Faculty Incharge - ${clubName}`]);
      }

      if (coInchargeId) {
        db.run(`
          DELETE FROM staff_responsibilities 
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
            AND LOWER(TRIM(responsibility)) = LOWER(TRIM(?))
        `, [coInchargeId, `Co-Faculty Incharge - ${clubName}`]);
      }

      res.json({ success: true, message: 'Club deleted successfully!' });
    });
  });
});

// Instant Faculty Global Search API
router.get('/search-faculty', authenticateToken, (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) return res.json([]);

  const searchPattern = `%${query}%`;
  const sql = `
    SELECT p.staff_id, p.staff_name, a.Department as department, a.Designation as designation
    FROM staff_personal p
    LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
    WHERE p.staff_id LIKE ? OR p.staff_name LIKE ? OR a.Department LIKE ? OR a.Designation LIKE ?
    LIMIT 15
  `;

  db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// NAAC Accreditation Summary Exporter API (Criterion 3: Research & Extension)
router.get('/accreditation/naac-summary', authenticateToken, async (req, res) => {
  const department = (req.user.role === 'dept_admin' ? (req.user.department || '') : (req.query.department || '')).trim();
  const isInst = !department || ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE'].includes(department.toUpperCase());

  try {
    let filterClause = '';
    let params = [];
    if (!isInst) {
      filterClause = `
        WHERE LOWER(TRIM(staff_id)) IN (
          SELECT LOWER(TRIM(staff_id)) FROM staff_academics 
          WHERE LOWER(TRIM(Department)) = LOWER(TRIM(?))
             OR LOWER(TRIM(Department)) IN (
               SELECT LOWER(TRIM(name)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
               UNION
               SELECT LOWER(TRIM(acronym)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
             )
        )
      `;
      params = [department, department, department, department, department];
    }

    const publications = await new Promise(r => db.all(`SELECT * FROM staff_publication ${filterClause}`, params, (_, rows) => r(rows || [])));
    const books = await new Promise(r => db.all(`SELECT * FROM staff_book_published ${filterClause}`, params, (_, rows) => r(rows || [])));
    const funding = await new Promise(r => db.all(`SELECT * FROM staff_funding ${filterClause}`, params, (_, rows) => r(rows || [])));
    const seedMoney = await new Promise(r => db.all(`SELECT * FROM staff_seed_money ${filterClause}`, params, (_, rows) => r(rows || [])));
    const ipr = await new Promise(r => db.all(`SELECT * FROM staff_ipr ${filterClause}`, params, (_, rows) => r(rows || [])));

    res.json({
      department: isInst ? 'Institution' : department,
      naac_3_1_publications: publications,
      naac_3_2_books: books,
      naac_3_3_grants: funding,
      naac_3_4_seed_money: seedMoney,
      naac_3_5_patents: ipr
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// NBA Accreditation Summary Exporter API (Criterion 5: Faculty Contributions)
router.get('/accreditation/nba-summary', authenticateToken, async (req, res) => {
  const department = (req.user.role === 'dept_admin' ? (req.user.department || '') : (req.query.department || '')).trim();
  const isInst = !department || ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE'].includes(department.toUpperCase());

  try {
    let filterClause = '';
    let params = [];
    if (!isInst) {
      filterClause = `
        WHERE LOWER(TRIM(staff_id)) IN (
          SELECT LOWER(TRIM(staff_id)) FROM staff_academics 
          WHERE LOWER(TRIM(Department)) = LOWER(TRIM(?))
             OR LOWER(TRIM(Department)) IN (
               SELECT LOWER(TRIM(name)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
               UNION
               SELECT LOWER(TRIM(acronym)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
             )
        )
      `;
      params = [department, department, department, department, department];
    }

    const interactions = await new Promise(r => db.all(`SELECT * FROM staff_interaction ${filterClause}`, params, (_, rows) => r(rows || [])));
    const events = await new Promise(r => db.all(`SELECT * FROM staff_event_organized ${filterClause}`, params, (_, rows) => r(rows || [])));
    const certs = await new Promise(r => db.all(`SELECT * FROM staff_certificate ${filterClause}`, params, (_, rows) => r(rows || [])));
    const awards = await new Promise(r => db.all(`SELECT * FROM staff_award ${filterClause}`, params, (_, rows) => r(rows || [])));
    const responsibilities = await new Promise(r => db.all(`SELECT * FROM staff_responsibilities ${filterClause}`, params, (_, rows) => r(rows || [])));

    res.json({
      department: isInst ? 'Institution' : department,
      nba_5_1_fdp_attended: interactions,
      nba_5_2_events_organized: events,
      nba_5_3_certifications: certs,
      nba_5_4_awards: awards,
      nba_5_5_responsibilities: responsibilities
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper for parsing date string to Date object
const parseDateSafe = (dStr) => {
  if (!dStr) return null;
  const s = String(dStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmyMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const [_, d, m, y] = dmyMatch;
    const dobj = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00.000Z`);
    return isNaN(dobj.getTime()) ? null : dobj;
  }
  if (/^\d{4}$/.test(s)) {
    const dobj = new Date(`${s}-06-01T00:00:00.000Z`);
    return isNaN(dobj.getTime()) ? null : dobj;
  }
  const p = Date.parse(s);
  return isNaN(p) ? null : new Date(p);
};

// NBA Tier-1 Comprehensive Analytics API (Criterion 5.2, 5.3 & 5.6)
router.get('/accreditation/nba-tier1-analytics', authenticateToken, async (req, res) => {
  const department = (req.user.role === 'dept_admin' ? (req.user.department || '') : (req.query.department || '')).trim();
  const isInst = !department || ['ALL', 'ALL DEPARTMENTS', 'INSTITUTION', 'SRI RAMAKRISHNA ENGINEERING COLLEGE'].includes(department.toUpperCase());
  const academicYear = (req.query.academicYear || '2025-2026').trim();
  const sfrRatio = parseFloat(req.query.sfrRatio) || 15; // Tier-1 standard: 1:15 or 1:20

  try {
    // 1. Determine 3-Year Assessment Cohorts (CAY, CAYm1, CAYm2)
    const matchYear = academicYear.match(/^(\d{4})/);
    const startYear = matchYear ? parseInt(matchYear[1], 10) : 2025;

    const years = [
      {
        key: 'CAY',
        label: `CAY (${startYear}-${startYear + 1})`,
        academicYear: `${startYear}-${startYear + 1}`,
        startDate: new Date(`${startYear}-06-01T00:00:00.000Z`),
        endDate: new Date(`${startYear + 1}-05-31T23:59:59.999Z`),
        endYearNum: startYear + 1
      },
      {
        key: 'CAYm1',
        label: `CAYm1 (${startYear - 1}-${startYear})`,
        academicYear: `${startYear - 1}-${startYear}`,
        startDate: new Date(`${startYear - 1}-06-01T00:00:00.000Z`),
        endDate: new Date(`${startYear}-05-31T23:59:59.999Z`),
        endYearNum: startYear
      },
      {
        key: 'CAYm2',
        label: `CAYm2 (${startYear - 2}-${startYear - 1})`,
        academicYear: `${startYear - 2}-${startYear - 1}`,
        startDate: new Date(`${startYear - 2}-06-01T00:00:00.000Z`),
        endDate: new Date(`${startYear - 1}-05-31T23:59:59.999Z`),
        endYearNum: startYear - 1
      }
    ];

    // 2. Fetch all faculty members in department with academics, personal, user & education records
    let deptFilter = '';
    let params = [];
    if (!isInst) {
      deptFilter = `
        WHERE LOWER(TRIM(a.Department)) = LOWER(TRIM(?))
           OR LOWER(TRIM(a.Department)) IN (
             SELECT LOWER(TRIM(name)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
             UNION
             SELECT LOWER(TRIM(acronym)) FROM departments WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(acronym)) = LOWER(TRIM(?))
           )
      `;
      params = [department, department, department, department, department];
    }

    const staffQuery = `
      SELECT 
        a.staff_id,
        COALESCE(p.staff_name, a.staff_name, 'Faculty Member') as staff_name,
        a.Department,
        a.Designation,
        a.Qualification,
        a.Date_of_joining,
        a.date_designated_prof,
        a.nature_of_association,
        a.contractual_type,
        a.date_of_leaving,
        a.area_of_specialization,
        COALESCE(u.is_relieved, 0) as is_relieved,
        p.pan,
        p.aicte_id,
        p.anna_univ_id,
        p.apaar_id,
        p.email,
        p.mobile
      FROM staff_academics a
      LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
      LEFT JOIN staff_user u ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(u.staff_id))
      ${deptFilter}
      ORDER BY a.Date_of_joining ASC, a.staff_id ASC
    `;

    const facultyRows = await new Promise((resolve, reject) => {
      db.all(staffQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Fetch all degrees for these faculty members
    const staffIds = facultyRows.map(f => f.staff_id);
    let eduRows = [];
    if (staffIds.length > 0) {
      const placeholders = staffIds.map(() => '?').join(',');
      eduRows = await new Promise((resolve) => {
        db.all(`SELECT staff_id, category, degree, specialization, year FROM staff_edu WHERE staff_id IN (${placeholders})`, staffIds, (_, rows) => resolve(rows || []));
      });
    }

    const eduMap = {};
    eduRows.forEach(e => {
      const sId = (e.staff_id || '').trim().toLowerCase();
      if (!eduMap[sId]) eduMap[sId] = [];
      eduMap[sId].push(e);
    });

    // Helper to evaluate faculty member presence and degree status in a specific AY
    const evaluateFacultyInYear = (f, yr) => {
      const doj = parseDateSafe(f.Date_of_joining);
      const dol = parseDateSafe(f.date_of_leaving);
      const isRel = Boolean(f.is_relieved);

      // Check if joined on or before the end of the academic year
      if (doj && doj > yr.endDate) {
        return { active: false, reason: 'Joined after this AY' };
      }

      // Check if left before the start of the academic year
      if (isRel && dol && dol < yr.startDate) {
        return { active: false, reason: 'Left before this AY' };
      }

      // Faculty is active in this academic year
      const sId = (f.staff_id || '').trim().toLowerCase();
      const degs = eduMap[sId] || [];

      // Check if Ph.D. was acquired on or before this AY
      let isPhd = false;
      let phdYear = null;

      const phdDeg = degs.find(d => 
        (d.category || '').toLowerCase().includes('ph.d') ||
        (d.category || '').toLowerCase().includes('phd') ||
        (d.category || '').toLowerCase().includes('doctor') ||
        (d.degree || '').toLowerCase().includes('ph.d') ||
        (d.degree || '').toLowerCase().includes('phd') ||
        (d.degree || '').toLowerCase().includes('doctor')
      );

      const nameStr = (f.staff_name || '').trim().toLowerCase();
      const qualStr = (f.Qualification || '').trim().toLowerCase();
      const desigStr = (f.Designation || '').trim().toLowerCase();

      const hasDrPrefix = nameStr.startsWith('dr.') || nameStr.startsWith('dr ') || nameStr.includes('dr.') || nameStr.includes('ph.d') || nameStr.includes('phd') || nameStr.includes('doctor');
      const hasPhdQual = qualStr.includes('ph.d') || qualStr.includes('phd') || qualStr.includes('doctor');
      const isProfOrAssoc = (desigStr.includes('prof') || desigStr.includes('associate')) && !desigStr.includes('assistant') && !desigStr.includes('asst');

      if (phdDeg) {
        const py = parseInt(phdDeg.year, 10);
        if (!isNaN(py)) {
          phdYear = py;
          if (py <= yr.endYearNum) isPhd = true;
        } else {
          isPhd = true;
        }
      } else if (hasDrPrefix || hasPhdQual || isProfOrAssoc) {
        isPhd = true;
      }


      const isRegular = (f.nature_of_association || 'REGULAR').toUpperCase().includes('REGULAR');
      const desig = (f.Designation || '').toLowerCase();

      let cadre = 'Assistant Professor';
      if (desig.includes('assoc') || desig.includes('associate')) {
        cadre = 'Associate Professor';
      } else if (desig.includes('prof') && !desig.includes('assistant') && !desig.includes('associate')) {
        cadre = 'Professor';
      }

      return {
        active: true,
        isRegular,
        isPhd,
        phdYear,
        isPg: !isPhd,
        cadre
      };
    };


    // 3. Compute SAR Table 5.3 (Faculty Qualification) for CAY, CAYm1, CAYm2
    const qualificationTable = years.map(yr => {
      let X = 0; // Ph.D. holders
      let Y = 0; // PG holders
      let totalRegular = 0;
      let totalContract = 0;
      let profCount = 0;
      let assocCount = 0;
      let asstCount = 0;

      const activeFacultyRoster = [];

      facultyRows.forEach(f => {
        const evalRes = evaluateFacultyInYear(f, yr);
        if (evalRes.active) {
          activeFacultyRoster.push({
            ...f,
            isPhd: evalRes.isPhd,
            isPg: evalRes.isPg,
            cadre: evalRes.cadre,
            isRegular: evalRes.isRegular
          });

          if (evalRes.isRegular) {
            totalRegular++;
            if (evalRes.isPhd) X++;
            else Y++;

            if (evalRes.cadre === 'Professor') profCount++;
            else if (evalRes.cadre === 'Associate Professor') assocCount++;
            else asstCount++;
          } else {
            totalContract++;
          }
        }
      });

      // Required faculty F: either regular faculty count or SFR compliance
      const F = totalRegular > 0 ? totalRegular : (facultyRows.length || 1);

      // NBA Tier-1 Faculty Qualification Formula: 2.5 * [(10X + 4Y) / F] (Max: 20 Marks)
      const rawFq = F > 0 ? (2.5 * ((10 * X + 4 * Y) / F)) : 0;
      const fqScore = Math.min(20, Math.round(rawFq * 100) / 100);

      // Cadre Proportion Formula (Criterion 5.2): Professor : Assoc : Asst = 1 : 2 : 6
      const rfProf = Math.max(1, F / 9);
      const rfAssoc = Math.max(1, (2 * F) / 9);
      const rfAsst = Math.max(1, (6 * F) / 9);

      const cadreMarks = Math.min(20, Math.round(((Math.min(1, profCount / rfProf) + Math.min(1, assocCount / rfAssoc) * 0.6 + Math.min(1, asstCount / rfAsst) * 0.4) * 10) * 100) / 100);

      return {
        yearKey: yr.key,
        yearLabel: yr.label,
        academicYear: yr.academicYear,
        X, // Ph.D. count
        Y, // PG count
        F, // Total regular faculty
        totalRegular,
        totalContract,
        totalActive: totalRegular + totalContract,
        fqScore,
        rawFq: Math.round(rawFq * 100) / 100,
        cadre: {
          profCount,
          assocCount,
          asstCount,
          rfProf: Math.round(rfProf * 10) / 10,
          rfAssoc: Math.round(rfAssoc * 10) / 10,
          rfAsst: Math.round(rfAsst * 10) / 10,
          cadreMarks
        },
        facultyRoster: activeFacultyRoster
      };
    });

    // 3-Year Average FQ
    const totalFq = qualificationTable.reduce((sum, item) => sum + item.fqScore, 0);
    const averageFq = Math.round((totalFq / 3) * 100) / 100;

    // 4. Compute SAR Table 5.6 (Faculty Retention Rate)
    // Base Year is CAYm2 (index 2)
    const caym2Year = years[2];
    const caym1Year = years[1];
    const cayYear = years[0];

    const baseCohort = [];
    facultyRows.forEach(f => {
      const evalCAYm2 = evaluateFacultyInYear(f, caym2Year);
      if (evalCAYm2.active && evalCAYm2.isRegular) {
        baseCohort.push(f);
      }
    });

    const nBase = baseCohort.length;
    let nRetainedCAYm1 = 0;
    let nRetainedCAY = 0;

    const retentionRoster = baseCohort.map(f => {
      const evalCAYm1 = evaluateFacultyInYear(f, caym1Year);
      const evalCAY = evaluateFacultyInYear(f, cayYear);

      const retainedInCAYm1 = evalCAYm1.active && evalCAYm1.isRegular;
      const retainedInCAY = evalCAY.active && evalCAY.isRegular;

      if (retainedInCAYm1) nRetainedCAYm1++;
      if (retainedInCAY) nRetainedCAY++;

      return {
        staff_id: f.staff_id,
        staff_name: f.staff_name,
        Designation: f.Designation,
        Date_of_joining: f.Date_of_joining,
        date_of_leaving: f.date_of_leaving,
        is_relieved: f.is_relieved,
        retainedInCAYm2: true,
        retainedInCAYm1,
        retainedInCAY
      };
    });

    const retentionRate = nBase > 0 ? Math.round(((nRetainedCAY / nBase) * 100) * 100) / 100 : 100;

    // NBA Tier-1 Scoring Rubric (Max: 25 Marks)
    let retentionMarks = 0;
    if (retentionRate >= 90) retentionMarks = 25;
    else if (retentionRate >= 75) retentionMarks = 20;
    else if (retentionRate >= 60) retentionMarks = 15;
    else if (retentionRate >= 50) retentionMarks = 10;
    else retentionMarks = 0;

    const enrichedFacultyRows = facultyRows.map(f => {
      const sId = (f.staff_id || '').trim().toLowerCase();
      const degs = eduMap[sId] || [];
      const hasPhdDeg = degs.some(d => 
        (d.category || '').toLowerCase().includes('ph.d') ||
        (d.category || '').toLowerCase().includes('phd') ||
        (d.category || '').toLowerCase().includes('doctor') ||
        (d.degree || '').toLowerCase().includes('ph.d') ||
        (d.degree || '').toLowerCase().includes('phd') ||
        (d.degree || '').toLowerCase().includes('doctor')
      );
      const nameStr = (f.staff_name || '').trim();
      const qualStr = (f.Qualification || '').trim();
      const isDr = /^Dr\.?(\s|$)/i.test(nameStr) || /\b(Ph\.?D|Doctor)\b/i.test(nameStr);
      const hasPhdQual = /\b(Ph\.?D|Doctor|Doctorate)\b/i.test(qualStr);
      const isPhd = hasPhdDeg || isDr || hasPhdQual;

      let highestQual = f.Qualification;
      if (!highestQual || highestQual === 'null') {
        if (isPhd) highestQual = 'Ph.D.';
        else {
          const pgDeg = degs.find(d => (d.category || '').toUpperCase().includes('PG') || (d.degree || '').toUpperCase().includes('M.'));
          highestQual = pgDeg ? pgDeg.degree : 'Post Graduate (PG)';
        }
      }

      return {
        ...f,
        Qualification: highestQual,
        isPhd
      };
    });

    res.json({
      success: true,
      department: isInst ? 'Institution' : department,
      academicYear,
      sfrRatio,
      years: years.map(y => y.label),
      qualificationTable,
      averageFq,
      retention: {
        baseYear: caym2Year.label,
        nBase,
        nRetainedCAYm1,
        nRetainedCAY,
        retentionRate,
        retentionMarks,
        maxMarks: 25,
        roster: retentionRoster
      },
      facultyList: enrichedFacultyRows
    });

  } catch (err) {
    console.error('NBA Tier-1 Analytics Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

