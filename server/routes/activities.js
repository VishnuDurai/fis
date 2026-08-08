import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { authenticateToken } from './auth.js';

import { getFacultyStorageDir, formatFacultyFileName, getFacultyDepartment } from '../utils/fileStorage.js';
import { fetchAllDeptHistory, getStaffDeptAtDate, matchesDepartment } from '../utils/deptHistory.js';

const router = express.Router();

// Multer Config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const staffId = (req.user && req.user.role === 'admin' && req.body && req.body.staffId)
      ? req.body.staffId
      : (req.user ? req.user.staffId : (req.body ? req.body.staffId : 'faculty123'));

    getFacultyDepartment(staffId, (err, dept) => {
      const dir = getFacultyStorageDir(staffId, dept);
      cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    const staffId = (req.user && req.user.role === 'admin' && req.body && req.body.staffId)
      ? req.body.staffId
      : (req.user ? req.user.staffId : (req.body ? req.body.staffId : 'faculty123'));

    const formattedName = formatFacultyFileName(staffId, file.originalname);
    cb(null, formattedName);
  }
});

const upload = multer({ storage });

// Map types to database table names and their column configurations
const tableMap = {
  interactions: {
    table: 'staff_interaction',
    cols: ['staff_id', 'staff_name', 'type', 'title', 'from_date', 'to_date', 'organizer', 'file', 'type1', 'size', 'date']
  },
  publications: {
    table: 'staff_publication',
    cols: ['staff_id', 'staff_name', 'type_pub', 'type', 'title', 'journel', 'date_con', 'organizer', 'doi', 'isbn', 'month_pub', 'volume_pub', 'pp', 'index_pub', 'web_of_science', 'citations', 'hindex', 'impact', 'issn_no', 'issue_no', 'co_authors', 'author_position', 'pub_status', 'paper_url', 'conf_venue', 'conf_dates', 'file', 'type1', 'size']
  },
  books: {
    table: 'staff_book_published',
    cols: ['staff_id', 'staff_name', 'title', 'coauthor', 'publisher', 'edition', 'isbn', 'file', 'type', 'size', 'date', 'dateofpublication']
  },
  resource: {
    table: 'staff_resource',
    cols: ['staff_id', 'staff_name', 'type', 'title', 'actedas', 'from_date', 'to_date', 'organizer', 'ben', 'file', 'type1', 'size', 'date']
  },
  awards: {
    table: 'staff_award',
    cols: ['staff_id', 'staff_name', 'awardname', 'awardby', 'event', 'awa_date', 'file', 'type', 'size', 'date']
  },
  funding: {
    table: 'staff_funding',
    cols: ['staff_id', 'staff_name', 'copiname', 'copiid', 'title', 'fa', 'status', 'date', 'amount', 'referenceno', 'faculty_role', 'grant_category', 'file']
  },
  ipr: {
    table: 'staff_ipr',
    cols: ['staff_id', 'staff_name', 'ip_type', 'patent', 'institution', 'generation', 'propose', 'patent_status', 'file', 'type', 'size', 'date']
  },
  certifications: {
    table: 'staff_certificate',
    cols: ['staff_id', 'staff_name', 'course_name', 'mark', 'organisation', 'data_of_exam', 'duration_weeks', 'file', 'type1', 'size', 'date']
  },
  competitive: {
    table: 'staff_competitive',
    cols: ['staff_id', 'staff_name', 'exam_name', 'level', 'score', 'date_of_certificate', 'date', 'file']
  },
  innovations: {
    table: 'staff_innovative',
    cols: ['staff_id', 'staff_name', 'project_title', 'description', 'from_date', 'to_date', 'status', 'date']
  },
  events: {
    table: 'staff_event_organized',
    cols: ['staff_id', 'type', 'title', 'from_date', 'to_date', 'organizer', 'res_person', 'ben_person', 'sponsership', 'granted', 'role', 'date', 'file']
  },
  development: {
    table: 'staff_development',
    cols: ['type', 'staff_name', 'coname', 'staff_id', 'coid', 'title', 'from_date', 'to_date', 'year_aca', 'status', 'institution', 'revenue', 'date']
  },
  scholars: {
    table: 'staff_scholars',
    cols: ['staff_id', 'res_id', 'staff_name', 'university', 'sup_name', 'desgination', 'organisation', 'status', 'date', 'file', 'supervisor_type', 'registration_year']
  },
  supervisors: {
    table: 'staff_supervisor',
    cols: ['staff_id', 'res_sup_id', 'staff_name', 'supj', 'university', 'internal', 'external', 'scholar', 'date', 'file', 'recognition_month_year']
  },
  clubs: {
    table: 'staff_club',
    cols: ['staff_id', 'club', 'type', 'title', 'from_date', 'to_date', 'organizer', 'res_person', 'ben_person', 'sponsership', 'granted', 'date', 'file']
  },
  memberships: {
    table: 'staff_member',
    cols: ['staff_id', 'staff_name', 'membershipid', 'organization', 'membership_type']
  },
  seed_money: {
    table: 'staff_seed_money',
    cols: ['staff_id', 'staff_name', 'title', 'faculty_role', 'sanctioned_date', 'duration', 'amount', 'file']
  }
};

// Route to fetch all available internal supervisors for scholar registration
router.get('/all-supervisors', authenticateToken, (req, res) => {
  const query = `
    SELECT DISTINCT s.staff_id, s.staff_name, s.res_sup_id, a.Department 
    FROM staff_supervisor s
    LEFT JOIN staff_academics a ON LOWER(TRIM(s.staff_id)) = LOWER(TRIM(a.staff_id))
    ORDER BY s.staff_name ASC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Helper middleware to validate type
function validateType(req, res, next) {
  const { type } = req.params;
  if (!tableMap[type] && type !== 'profile_photo') {
    return res.status(404).json({ error: 'Invalid activity type' });
  }
  next();
}

// 1. GET Activities
router.get('/:type', authenticateToken, validateType, (req, res) => {
  const { type } = req.params;
  const config = tableMap[type];
  const reqStaffId = req.query.staffId;
  const isDeptAdmin = req.user.role === 'dept_admin';
  const isAdmin = req.user.role === 'admin';

  let query = '';
  let params = [];

  // Special query for supervisors to include dynamic internal & external scholar counts
  const hasStaffNameCol = config.cols.includes('staff_name');
  const staffNameSelect = hasStaffNameCol ? "COALESCE(NULLIF(t.staff_name, ''), p.staff_name, a.staff_name)" : "COALESCE(p.staff_name, a.staff_name)";

  if (type === 'supervisors') {
    const extraSelect = `,
      (SELECT COUNT(*) FROM staff_scholars s 
       WHERE (LOWER(REPLACE(REPLACE(s.sup_name, '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(COALESCE(p.staff_name, t.staff_name), 'Dr.', ''), '.', ''), ' ', '')), '%'))
         AND (s.supervisor_type IS NULL OR LOWER(s.supervisor_type) = 'internal')) as internal,
      (SELECT COUNT(*) FROM staff_scholars s 
       WHERE (LOWER(REPLACE(REPLACE(s.sup_name, '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(COALESCE(p.staff_name, t.staff_name), 'Dr.', ''), '.', ''), ' ', '')), '%'))
         AND LOWER(s.supervisor_type) = 'external') as external
    `;

    if (reqStaffId && reqStaffId !== req.user.staffId) {
      query = `SELECT t.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation ${extraSelect} FROM staff_supervisor t LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id)) LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id)) WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))`;
      params = [reqStaffId];
    } else if (isAdmin) {
      query = `SELECT t.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation ${extraSelect} FROM staff_supervisor t LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id)) LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))`;
      params = [];
    } else {
      query = `SELECT t.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation ${extraSelect} FROM staff_supervisor t LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id)) LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id)) WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))`;
      params = [req.user.staffId];
    }
  } else if (type === 'scholars' && !isAdmin && !isDeptAdmin && (!reqStaffId || reqStaffId === req.user.staffId)) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM staff_scholars t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))
         OR (t.sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(t.sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')), '%'))
    `;
    params = [req.user.staffId, req.user.name || ''];
  } else if (reqStaffId && reqStaffId !== req.user.staffId) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))
    `;
    params = [reqStaffId];
  } else if (isDeptAdmin) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
    `;
    params = [];
  } else if (isAdmin) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
    `;
    params = [];
  } else {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))
    `;
    params = [req.user.staffId];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    db.all('SELECT * FROM departments', [], (dErr, deptsList) => {
      fetchAllDeptHistory((historyMap) => {
        const processedRows = (rows || []).map(row => {
          const rowDate = row.date_con || row.awa_date || row.from_date || row.data_of_exam || row.sanctioned_date || row.dateofpublication || row.generation || row.date || row.created_at;
          const resolvedDept = getStaffDeptAtDate(row.staff_id, rowDate, row.Department, historyMap);
          return { ...row, Department: resolvedDept };
        });

        if (isDeptAdmin) {
          const targetDept = (req.user.department || '').trim();
          const filtered = processedRows.filter(r => matchesDepartment(r.Department, targetDept, deptsList || []));
          return res.json(filtered);
        }

        res.json(processedRows);
      });
    });
  });
});

// 2. ADD Activity with optional file upload
router.post('/:type', authenticateToken, validateType, upload.single('file'), (req, res) => {
  const { type } = req.params;
  const staffId = req.user.staffId;
  const config = tableMap[type];

  // Get staff name for inserting
  db.get('SELECT staff_name FROM staff_personal WHERE staff_id = ?', [staffId], (err, personalRow) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const staffName = personalRow ? personalRow.staff_name : '';

    const data = { ...req.body };
    data.staff_id = staffId;
    data.staff_name = staffName;
    data.date = new Date().toLocaleDateString('en-GB'); // dd-mm-yyyy

    if (req.file) {
      data.file = req.file.filename;
      if (!req.body.type && config.cols.includes('type') && !['events', 'interactions', 'resource', 'publications', 'clubs', 'development', 'ipr'].includes(type)) {
        data.type = req.file.mimetype;
      }
      if (config.cols.includes('type1')) {
        data.type1 = req.file.mimetype;
      }
      data.size = (req.file.size / 1000).toFixed(2); // KB
    }

    const cols = config.cols;
    const values = cols.map(col => {
      let val = data[col];
      if (val === undefined || val === null || val === '') {
        return null;
      }
      return val;
    });
    const placeholders = cols.map(() => '?').join(', ');

    const query = `INSERT INTO ${config.table} (${cols.join(', ')}) VALUES (${placeholders})`;

    db.run(query, values, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to insert activity record' });
      }
      res.json({ success: true, id: this.lastID });
    });
  });
});

// 3. DELETE Activity
router.delete('/:type/:id', authenticateToken, validateType, (req, res) => {
  const { type, id } = req.params;
  const staffId = req.user.staffId;
  const config = tableMap[type];

  // Get filename to delete if it exists
  db.get(`SELECT file FROM ${config.table} WHERE id = ?`, [id], (err, row) => {
    if (row && row.file) {
      const filePath = path.resolve('uploads/document', row.file);
      fs.unlink(filePath, () => {});
    }

    // Admins can delete anything, faculty can only delete their own (or scholars under their supervisorship)
    let query = `DELETE FROM ${config.table} WHERE id = ?`;
    let params = [id];

    if (req.user.role !== 'admin' && req.user.role !== 'dept_admin') {
      if (type === 'scholars') {
        query += ` AND (staff_id = ? OR (sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE '%' || LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) || '%'))`;
        params.push(staffId, req.user.name || '');
      } else {
        query += ` AND staff_id = ?`;
        params.push(staffId);
      }
    }

    db.run(query, params, function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete record' });
      res.json({ success: true });
    });
  });
});

// 4. SPECIAL ROUTE: Upload Profile Picture
router.post('/upload/profile-pic', authenticateToken, upload.single('file'), (req, res) => {
  const staffId = req.user.staffId;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Find and unlink old file if exists
  db.get('SELECT file FROM staff_user WHERE staff_id = ?', [staffId], (err, row) => {
    if (row && row.file) {
      const oldPath = path.resolve('uploads/upload', row.file);
      fs.unlink(oldPath, () => {});
    }

    db.run('UPDATE staff_user SET file = ? WHERE staff_id = ?', [req.file.filename, staffId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update profile pic' });
      res.json({ success: true, file: req.file.filename });
    });
  });
});

// 5. UPDATE activity record by type and ID
router.put('/:type/:id', authenticateToken, upload.single('file'), (req, res) => {
  const { type, id } = req.params;
  const staffId = req.user.staffId;

  if (!tableMap[type]) {
    return res.status(400).json({ error: 'Invalid activity type' });
  }

  const config = tableMap[type];
  const updateCols = [];
  const params = [];

  Object.keys(req.body).forEach(key => {
    if (config.cols.includes(key) && key !== 'staff_id' && key !== 'id') {
      updateCols.push(`${key} = ?`);
      let val = req.body[key];
      if (val === undefined || val === null || val === '') {
        val = null;
      }
      params.push(val);
    }
  });

  if (req.file) {
    if (config.cols.includes('file')) {
      updateCols.push('file = ?');
      params.push(req.file.filename);
    }
    if (config.cols.includes('type1')) {
      updateCols.push('type1 = ?');
      params.push(req.file.mimetype);
    }
    if (config.cols.includes('size')) {
      updateCols.push('size = ?');
      params.push((req.file.size / 1000).toFixed(2));
    }
  }

  if (updateCols.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  let query = `UPDATE ${config.table} SET ${updateCols.join(', ')} WHERE id = ?`;
  params.push(id);

  if (req.user.role !== 'admin' && req.user.role !== 'dept_admin') {
    if (type === 'scholars') {
      query += ` AND (staff_id = ? OR (sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE '%' || LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) || '%'))`;
      params.push(staffId, req.user.name || '');
    } else {
      query += ` AND staff_id = ?`;
      params.push(staffId);
    }
  }

  db.run(query, params, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error updating activity record' });
    }
    res.json({ success: true, message: 'Activity record updated successfully' });
  });
});

export default router;
