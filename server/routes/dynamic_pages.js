import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, isTokenBlacklisted } from './auth.js';
import { fetchAllDeptHistory, getStaffDeptAtDate, matchesDepartment } from '../utils/deptHistory.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../uploads/document');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `dynamic_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token || isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Unauthorized access token' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

router.use(requireAuth);

// Helper function to format page definitions
const parsePage = (p) => ({
  ...p,
  portals: typeof p.portals === 'string' ? JSON.parse(p.portals || '[]') : (p.portals || []),
  fields: typeof p.fields === 'string' ? JSON.parse(p.fields || '[]') : (p.fields || [])
});

// 1. GET /api/dynamic-pages - List all dynamic pages
router.get('/', (req, res) => {
  db.all('SELECT * FROM dynamic_pages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = (rows || []).map(parsePage);
    res.json(formatted);
  });
});

// 2. POST /api/dynamic-pages - Create a new dynamic page (Admin only)
router.post('/', (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(430).json({ error: 'Only System Administrators can create dynamic pages' });
  }

  const { title, slug, category, portals, fields, icon } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'Page Title and Slug are required' });
  }

  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const portalsJson = JSON.stringify(portals || ['admin', 'dept_admin', 'faculty']);
  const fieldsJson = JSON.stringify(fields || []);
  const pageCategory = category || 'standalone';
  const pageIcon = icon || 'FileText';

  db.run(
    `INSERT INTO dynamic_pages (title, slug, category, portals, fields, icon) VALUES (?, ?, ?, ?, ?, ?)`,
    [title.trim(), cleanSlug, pageCategory, portalsJson, fieldsJson, pageIcon],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE') || err.message.includes('Duplicate')) {
          return res.status(400).json({ error: 'A page with this URL slug already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Dynamic page created successfully', id: this.lastID, slug: cleanSlug });
    }
  );
});

// 3. PUT /api/dynamic-pages/:id - Edit dynamic page (Admin only)
router.put('/:id', (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(430).json({ error: 'Only System Administrators can edit dynamic pages' });
  }

  const { title, category, portals, fields, icon } = req.body;
  const pageId = req.params.id;

  const portalsJson = JSON.stringify(portals || ['admin', 'dept_admin', 'faculty']);
  const fieldsJson = JSON.stringify(fields || []);

  db.run(
    `UPDATE dynamic_pages SET title = ?, category = ?, portals = ?, fields = ?, icon = ? WHERE id = ?`,
    [title, category || 'standalone', portalsJson, fieldsJson, icon || 'FileText', pageId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Dynamic page updated successfully' });
    }
  );
});

// 4. DELETE /api/dynamic-pages/:id - Delete dynamic page & data (Admin only)
router.delete('/:id', (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(430).json({ error: 'Only System Administrators can delete dynamic pages' });
  }

  const pageId = req.params.id;

  db.run(`DELETE FROM dynamic_page_data WHERE page_id = ?`, [pageId], (dErr) => {
    db.run(`DELETE FROM dynamic_pages WHERE id = ?`, [pageId], (pErr) => {
      if (pErr) return res.status(500).json({ error: pErr.message });
      res.json({ message: 'Dynamic page and all associated records deleted successfully' });
    });
  });
});

// 5. GET /api/dynamic-pages/:slug/data - Fetch submitted records for a dynamic page
router.get('/:slug/data', (req, res) => {
  const slug = req.params.slug;

  db.get(`SELECT * FROM dynamic_pages WHERE slug = ?`, [slug], (pErr, page) => {
    if (pErr || !page) return res.status(404).json({ error: 'Dynamic page not found' });

    let sql = `SELECT * FROM dynamic_page_data WHERE page_id = ? ORDER BY created_at DESC`;
    let params = [page.id];

    // Filter for regular faculty
    if (req.user?.role === 'faculty' && !req.user?.isHod && !req.user?.isInstitutionalAdmin) {
      sql = `SELECT * FROM dynamic_page_data WHERE page_id = ? AND staff_id = ? ORDER BY created_at DESC`;
      params = [page.id, req.user.staffId];
    }

    db.all(sql, params, (dErr, rows) => {
      if (dErr) return res.status(500).json({ error: dErr.message });

      db.all('SELECT * FROM departments', [], (deErr, deptsList) => {
        fetchAllDeptHistory((historyMap) => {
          const parsedRows = (rows || []).map(r => {
            const resolvedDept = getStaffDeptAtDate(r.staff_id, r.created_at, r.department, historyMap);
            return {
              ...r,
              department: resolvedDept,
              data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : (r.data || {})
            };
          });

          if (req.user?.role === 'dept_admin') {
            const targetDept = (req.user?.department || '').trim();
            const filtered = parsedRows.filter(r => matchesDepartment(r.department, targetDept, deptsList || []));
            return res.json({ page: parsePage(page), data: filtered });
          }

          res.json({ page: parsePage(page), data: parsedRows });
        });
      });
    });
  });
});

// 6. POST /api/dynamic-pages/:slug/data - Submit record for dynamic page
router.post('/:slug/data', upload.single('file'), (req, res) => {
  const slug = req.params.slug;

  db.get(`SELECT * FROM dynamic_pages WHERE slug = ?`, [slug], (pErr, page) => {
    if (pErr || !page) return res.status(404).json({ error: 'Dynamic page not found' });

    const staffId = req.user?.staffId || req.body.staff_id || 'UNKNOWN';
    const staffName = req.user?.name || req.body.staff_name || 'Faculty Member';
    const department = req.user?.department || req.user?.dept || req.body.department || 'General';

    // Parse non-file form values into data object
    const formData = { ...req.body };
    delete formData.staff_id;
    delete formData.staff_name;
    delete formData.department;

    let filePath = req.file ? req.file.filename : (req.body.file || null);

    const dataJson = JSON.stringify(formData);

    db.run(
      `INSERT INTO dynamic_page_data (page_id, staff_id, staff_name, department, data, file) VALUES (?, ?, ?, ?, ?, ?)`,
      [page.id, staffId, staffName, department, dataJson, filePath],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Record saved successfully', id: this.lastID });
      }
    );
  });
});

// 7. DELETE /api/dynamic-pages/:slug/data/:dataId - Delete single record
router.delete('/:slug/data/:dataId', (req, res) => {
  const dataId = req.params.dataId;

  db.run(`DELETE FROM dynamic_page_data WHERE id = ?`, [dataId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Record deleted successfully' });
  });
});

export default router;
