import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET, isTokenBlacklisted } from './auth.js';

const router = express.Router();

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

// Standard Default Page Configurations
export const DEFAULT_PAGE_CONFIGS = {
  publications: {
    page_key: 'publications',
    title: 'Publications',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'BookOpen',
    fields: [
      { name: 'type_pub', label: 'Publication Category', type: 'select', options: ['Journal', 'Conference', 'Book Chapter', 'Patent'], required: true, status: 'active' },
      { name: 'type', label: 'Domain Scope', type: 'select', options: ['International', 'National'], required: true, status: 'active' },
      { name: 'title', label: 'Publication Title', type: 'text', required: true, status: 'active' },
      { name: 'journel', label: 'Journal / Conference Name', type: 'text', required: true, status: 'active' },
      { name: 'co_authors', label: 'Co-Author(s) List', type: 'text', required: true, status: 'active' },
      { name: 'author_position', label: 'Author Position', type: 'select', options: ['First Author', 'Corresponding Author', 'Second Author', 'Co-Author', 'Other'], required: false, status: 'active' },
      { name: 'date_con', label: 'Date of Publication', type: 'date', required: true, status: 'active' },
      { name: 'month_pub', label: 'Month of Publication', type: 'select', options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], required: true, status: 'active' },
      { name: 'organizer', label: 'Organizer / Publisher', type: 'text', required: true, status: 'active' },
      { name: 'doi', label: 'DOI Number', type: 'text', required: false, status: 'active' },
      { name: 'paper_url', label: 'Paper URL / Publisher URL', type: 'text', required: false, status: 'active' },
      { name: 'pp', label: 'Page Range (PP)', type: 'text', required: false, status: 'active' },
      { name: 'index_pub', label: 'Indexing (Scopus, WoS, SCI, SCIE, ESCI, UGC Care)', type: 'multiselect', options: ['Scopus', 'WoS', 'SCI', 'SCIE', 'ESCI', 'UGC Care', 'Other'], required: true, status: 'active' },
      { name: 'citations', label: 'Citations Count', type: 'number', required: false, status: 'active' },
      { name: 'issn_no', label: 'ISSN Number', type: 'text', required: false, status: 'active' },
      { name: 'volume_pub', label: 'Volume Number', type: 'text', required: false, status: 'active' },
      { name: 'issue_no', label: 'Issue Number', type: 'text', required: false, status: 'active' },
      { name: 'impact', label: 'Impact Factor', type: 'number', required: false, status: 'active' },
      { name: 'isbn', label: 'ISBN Number', type: 'text', required: false, status: 'active' },
      { name: 'conf_venue', label: 'Conference Venue / Location', type: 'text', required: false, status: 'active' },
      { name: 'conf_dates', label: 'Conference Date Range', type: 'date', required: false, status: 'active' },
      { name: 'patent_no', label: 'Patent Application / Grant No', type: 'text', required: false, status: 'active' },
      { name: 'patent_status', label: 'Patent Status', type: 'select', options: ['Filed', 'Published', 'Granted'], required: false, status: 'active' }
    ],
    publication_type_constraints: {
      Journal: {
        requiredFields: ['type_pub', 'type', 'title', 'journel', 'co_authors', 'date_con', 'month_pub', 'organizer', 'index_pub'],
        optionalFields: ['author_position', 'doi', 'paper_url', 'pp', 'citations', 'issn_no', 'volume_pub', 'issue_no', 'impact'],
        hiddenFields: ['isbn', 'conf_venue', 'conf_dates', 'patent_no', 'patent_status']
      },
      Conference: {
        requiredFields: ['type_pub', 'type', 'title', 'journel', 'co_authors', 'date_con', 'organizer'],
        optionalFields: ['author_position', 'isbn', 'conf_venue', 'conf_dates', 'doi', 'paper_url', 'pp', 'citations', 'index_pub'],
        hiddenFields: ['issn_no', 'volume_pub', 'issue_no', 'impact', 'patent_no', 'patent_status']
      },
      'Book Chapter': {
        requiredFields: ['type_pub', 'type', 'title', 'journel', 'co_authors', 'organizer'],
        optionalFields: ['isbn', 'doi', 'paper_url', 'pp', 'date_con', 'month_pub'],
        hiddenFields: ['issn_no', 'volume_pub', 'issue_no', 'impact', 'conf_venue', 'conf_dates', 'patent_no', 'patent_status']
      },
      Patent: {
        requiredFields: ['type_pub', 'type', 'title', 'patent_no', 'patent_status', 'date_con'],
        optionalFields: ['co_authors', 'organizer', 'paper_url', 'doi'],
        hiddenFields: ['journel', 'issn_no', 'volume_pub', 'issue_no', 'impact', 'isbn', 'conf_venue', 'conf_dates', 'pp', 'citations', 'index_pub']
      }
    }
  },
  events: {
    page_key: 'events',
    title: 'Events Organized',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'BarChart2',
    fields: [
      { name: 'type', label: 'Event Category', type: 'select', options: ['Seminar', 'Workshop', 'FDP', 'Conference', 'Webinar', 'Guest Lecture', 'Symposium'], required: true, status: 'active' },
      { name: 'title', label: 'Event Title', type: 'text', required: true, status: 'active' },
      { name: 'role', label: 'Role / Designation in Event', type: 'select', options: ['Convener', 'Coordinator', 'Co-coordinator', 'Organizer', 'Resource Person'], required: true, status: 'active' },
      { name: 'participants', label: 'Number of Participants', type: 'number', required: true, status: 'active' },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true, status: 'active' },
      { name: 'end_date', label: 'End Date', type: 'date', required: true, status: 'active' },
      { name: 'sponsor', label: 'Sponsoring Agency / Funding Body', type: 'text', required: false, status: 'active' },
      { name: 'amount', label: 'Grant Sanctioned (INR)', type: 'number', required: false, status: 'active' }
    ]
  },
  certifications: {
    page_key: 'certifications',
    title: 'Certifications',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'GraduationCap',
    fields: [
      { name: 'course_name', label: 'Course / Certification Name', type: 'text', required: true, status: 'active' },
      { name: 'offered_by', label: 'Offered By (NPTEL, Coursera, Udemy, edX, Industrial Body)', type: 'text', required: true, status: 'active' },
      { name: 'duration', label: 'Duration / Duration Units', type: 'text', required: true, status: 'active' },
      { name: 'score', label: 'Grade / Score Obtained', type: 'text', required: false, status: 'active' },
      { name: 'issue_date', label: 'Issue Date', type: 'date', required: true, status: 'active' }
    ]
  }
};

// Parse single db row
const parseConfigRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    portals: typeof row.portals === 'string' ? JSON.parse(row.portals || '[]') : (row.portals || []),
    fields: typeof row.fields === 'string' ? JSON.parse(row.fields || '[]') : (row.fields || []),
    publication_type_constraints: typeof row.publication_type_constraints === 'string' 
      ? JSON.parse(row.publication_type_constraints || '{}') 
      : (row.publication_type_constraints || {})
  };
};

// 1. GET /api/system-page-configs - List all system page configurations
router.get('/', (req, res) => {
  db.all('SELECT * FROM system_page_configs ORDER BY page_key ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const dbConfigsMap = {};
    (rows || []).forEach(r => {
      const parsed = parseConfigRow(r);
      dbConfigsMap[parsed.page_key] = parsed;
    });

    // Merge with default configs so missing keys return defaults
    const finalConfigs = [];
    const allKeys = new Set([...Object.keys(DEFAULT_PAGE_CONFIGS), ...Object.keys(dbConfigsMap)]);

    allKeys.forEach(key => {
      if (dbConfigsMap[key]) {
        finalConfigs.push(dbConfigsMap[key]);
      } else if (DEFAULT_PAGE_CONFIGS[key]) {
        finalConfigs.push(DEFAULT_PAGE_CONFIGS[key]);
      }
    });

    res.json(finalConfigs);
  });
});

// 2. GET /api/system-page-configs/:pageKey - Get config for specific page
router.get('/:pageKey', (req, res) => {
  const pageKey = req.params.pageKey;

  db.get('SELECT * FROM system_page_configs WHERE page_key = ?', [pageKey], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.json(parseConfigRow(row));
    }
    if (DEFAULT_PAGE_CONFIGS[pageKey]) {
      return res.json(DEFAULT_PAGE_CONFIGS[pageKey]);
    }
    return res.status(404).json({ error: 'System page configuration not found' });
  });
});

// 3. PUT /api/system-page-configs/:pageKey - Update page configuration (Admin only)
router.put('/:pageKey', (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(430).json({ error: 'Only System Administrators can update system page configurations' });
  }

  const pageKey = req.params.pageKey;
  const { title, category, portals, icon, fields, publication_type_constraints } = req.body;

  const portalsJson = JSON.stringify(portals || ['admin', 'dept_admin', 'faculty']);
  const fieldsJson = JSON.stringify(fields || []);
  const pubConstraintsJson = JSON.stringify(publication_type_constraints || {});

  db.get('SELECT id FROM system_page_configs WHERE page_key = ?', [pageKey], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      db.run(
        `UPDATE system_page_configs SET title = ?, category = ?, portals = ?, icon = ?, fields = ?, publication_type_constraints = ? WHERE page_key = ?`,
        [title, category || 'activity', portalsJson, icon || 'FileText', fieldsJson, pubConstraintsJson, pageKey],
        function (uErr) {
          if (uErr) return res.status(500).json({ error: uErr.message });
          res.json({ message: `System configuration for ${pageKey} updated successfully` });
        }
      );
    } else {
      db.run(
        `INSERT INTO system_page_configs (page_key, title, category, portals, icon, fields, publication_type_constraints) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [pageKey, title, category || 'activity', portalsJson, icon || 'FileText', fieldsJson, pubConstraintsJson],
        function (iErr) {
          if (iErr) return res.status(500).json({ error: iErr.message });
          res.json({ message: `System configuration for ${pageKey} created successfully` });
        }
      );
    }
  });
});

// 4. POST /api/system-page-configs/:pageKey/reset - Reset config to system default (Admin only)
router.post('/:pageKey/reset', (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(430).json({ error: 'Only System Administrators can reset system page configurations' });
  }

  const pageKey = req.params.pageKey;

  db.run('DELETE FROM system_page_configs WHERE page_key = ?', [pageKey], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const defaultConfig = DEFAULT_PAGE_CONFIGS[pageKey] || null;
    res.json({ message: `System page configuration for ${pageKey} reset to default`, config: defaultConfig });
  });
});

export default router;
