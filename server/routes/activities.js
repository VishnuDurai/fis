import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { authenticateToken } from './auth.js';
import { matchesTargetAcademicYear } from './faculty.js';

import { getFacultyStorageDir, formatFacultyFileName, getFacultyDepartment, findFileInSrecOrUploads } from '../utils/fileStorage.js';
import { fetchAllDeptHistory, getStaffDeptAtDate, matchesDepartment } from '../utils/deptHistory.js';
import { fetchPublicationByDoi } from '../utils/doiHelper.js';
import { standardizeProfilePic } from '../utils/processProfilePic.js';
import { extractRawTextFromFile, classifyDocument, extractFieldsForCategory, attemptLlmExtraction, computeFileHash } from '../utils/aiDocumentExtractor.js';
import { checkDocumentDuplicate, checkRecordDuplicate } from '../utils/duplicateDetector.js';
import { matchInternalCoAuthors, linkFacultyToPublication, getLinkedPublicationAuthors } from '../utils/coAuthorMatcher.js';

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

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// Map types to database table names and their column configurations
const tableMap = {
  interactions: {
    table: 'staff_interaction',
    cols: ['staff_id', 'staff_name', 'type', 'title', 'from_date', 'to_date', 'organizer', 'file', 'type1', 'size', 'date', 'file_hash']
  },
  publications: {
    table: 'staff_publication',
    cols: ['staff_id', 'staff_name', 'type_pub', 'type', 'title', 'journel', 'date_con', 'organizer', 'doi', 'isbn', 'month_pub', 'volume_pub', 'pp', 'index_pub', 'web_of_science', 'citations', 'hindex', 'impact', 'issn_no', 'issue_no', 'co_authors', 'author_position', 'pub_status', 'paper_url', 'conf_venue', 'conf_dates', 'file', 'type1', 'size', 'file_hash']
  },
  books: {
    table: 'staff_book_published',
    cols: ['staff_id', 'staff_name', 'title', 'coauthor', 'publisher', 'edition', 'isbn', 'file', 'type', 'size', 'date', 'dateofpublication', 'file_hash']
  },
  resource: {
    table: 'staff_resource',
    cols: ['staff_id', 'staff_name', 'type', 'title', 'actedas', 'from_date', 'to_date', 'organizer', 'ben', 'file', 'type1', 'size', 'date', 'file_hash']
  },
  awards: {
    table: 'staff_award',
    cols: ['staff_id', 'staff_name', 'awardname', 'awardby', 'event', 'awa_date', 'file', 'type', 'size', 'date', 'file_hash']
  },
  funding: {
    table: 'staff_funding',
    cols: ['staff_id', 'staff_name', 'copiname', 'copiid', 'title', 'fa', 'status', 'date', 'amount', 'referenceno', 'faculty_role', 'grant_category', 'project_type', 'from_date', 'to_date', 'file', 'file_hash']
  },
  ipr: {
    table: 'staff_ipr',
    cols: ['staff_id', 'staff_name', 'ip_type', 'patent', 'institution', 'generation', 'propose', 'patent_status', 'file', 'type', 'size', 'date', 'file_hash']
  },
  certifications: {
    table: 'staff_certificate',
    cols: ['staff_id', 'staff_name', 'course_name', 'mark', 'organisation', 'data_of_exam', 'duration_weeks', 'file', 'type1', 'size', 'date', 'file_hash']
  },
  competitive: {
    table: 'staff_competitive',
    cols: ['staff_id', 'staff_name', 'exam_name', 'level', 'score', 'date_of_certificate', 'date', 'file', 'file_hash']
  },
  innovations: {
    table: 'staff_innovative',
    cols: ['staff_id', 'staff_name', 'project_title', 'description', 'from_date', 'to_date', 'status', 'date']
  },
  events: {
    table: 'staff_event_organized',
    cols: ['staff_id', 'type', 'title', 'from_date', 'to_date', 'organizer', 'res_person', 'ben_person', 'sponsership', 'granted', 'role', 'date', 'file', 'file_hash']
  },
  development: {
    table: 'staff_development',
    cols: ['type', 'staff_name', 'coname', 'staff_id', 'coid', 'title', 'from_date', 'to_date', 'year_aca', 'status', 'institution', 'revenue', 'date', 'file_hash']
  },
  scholars: {
    table: 'staff_scholars',
    cols: ['staff_id', 'res_id', 'staff_name', 'university', 'sup_name', 'desgination', 'organisation', 'status', 'date', 'file', 'supervisor_type', 'registration_year', 'file_hash']
  },
  supervisors: {
    table: 'staff_supervisor',
    cols: ['staff_id', 'res_sup_id', 'staff_name', 'supj', 'university', 'internal', 'external', 'scholar', 'date', 'file', 'recognition_month_year']
  },
  clubs: {
    table: 'staff_club',
    cols: ['staff_id', 'club', 'type', 'title', 'from_date', 'to_date', 'organizer', 'res_person', 'ben_person', 'sponsership', 'granted', 'date', 'file', 'role', 'file_hash']
  },
  memberships: {
    table: 'staff_member',
    cols: ['staff_id', 'staff_name', 'membershipid', 'organization', 'membership_type', 'file', 'type', 'size', 'date', 'file_hash']
  },
  seed_money: {
    table: 'staff_seed_money',
    cols: ['staff_id', 'staff_name', 'title', 'faculty_role', 'sanctioned_date', 'duration', 'amount', 'entry_type', 'client_type', 'consultants', 'status', 'from_date', 'to_date', 'file', 'file_hash']
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

// DOI AUTO-FILL ENDPOINT: Queries CrossRef REST API for publication metadata
router.get('/fetch-doi', authenticateToken, async (req, res) => {
  const { doi } = req.query;
  if (!doi || !doi.trim()) {
    return res.status(400).json({ error: 'DOI query parameter is required.' });
  }

  try {
    const metadata = await fetchPublicationByDoi(doi);
    res.json(metadata);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to fetch DOI metadata from CrossRef.' });
  }
});

// AI DOCUMENT EXTRACTION & SMART CLASSIFICATION ENDPOINT
router.post('/ai-extract-document', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No document file uploaded.' });
  }

  const staffId = req.user.staffId;
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const originalFilename = req.file.originalname;

  try {
    // 1. Layer 1 & 2: Extract raw text via digital PDF or Tesseract OCR
    const { rawText, fileHash, fileSize, extractionMethod } = await extractRawTextFromFile(filePath, mimeType);

    // 2. Level 1: Document-Level Duplicate Check (own profile + cross-faculty)
    const docDuplicate = await checkDocumentDuplicate(fileHash, originalFilename, fileSize, staffId);

    // 3. Layer 3: Smart Document Classification
    const classification = classifyDocument(rawText, originalFilename);

    // 4. Layer 3: Deterministic Field Extraction + Confidence Scoring
    let { fields, confidences } = extractFieldsForCategory(classification.category, rawText);

    // 5. Layer 4: Optional LLM interpretation (if API key is configured)
    try {
      const llmFields = await attemptLlmExtraction(rawText, classification.category);
      if (llmFields && typeof llmFields === 'object') {
        Object.keys(llmFields).forEach(k => {
          if (llmFields[k] && (!fields[k] || (confidences[k] || 0) < 70)) {
            fields[k] = llmFields[k];
            confidences[k] = 88;
          }
        });
      }
    } catch (llmErr) {}

    // 6. Publication & Internal Co-Author Handling
    let coAuthors = [];
    let recordDuplicate = { isDuplicate: false };

    if (classification.category === 'publications' || fields.doi) {
      if (fields.doi) {
        try {
          const doiMeta = await fetchPublicationByDoi(fields.doi);
          if (doiMeta) {
            if (!fields.title || confidences.title < 80) { fields.title = doiMeta.title; confidences.title = 98; }
            if (!fields.journel) { fields.journel = doiMeta.journal; confidences.journel = 95; }
            if (!fields.co_authors && doiMeta.authors) { fields.co_authors = doiMeta.authors; confidences.co_authors = 95; }
            if (doiMeta.year) { fields.date_con = `${doiMeta.year}-01-01`; confidences.date_con = 85; }
            if (doiMeta.month) { fields.month_pub = doiMeta.month; }
            if (doiMeta.issn) { fields.issn_no = doiMeta.issn; }
            if (doiMeta.volume) { fields.volume_pub = doiMeta.volume; }
            if (doiMeta.issue) { fields.issue_no = doiMeta.issue; }
            if (doiMeta.publisher) { fields.organizer = doiMeta.publisher; confidences.organizer = 90; }
          }
        } catch (doiErr) {}
      }

      // Match internal co-authors (READ-ONLY)
      coAuthors = await matchInternalCoAuthors(fields.co_authors || '', [], staffId);
      recordDuplicate = await checkRecordDuplicate('publications', fields, staffId);
    } else {
      recordDuplicate = await checkRecordDuplicate(classification.category, fields, staffId);
    }

    // 7. Audit log in document_ai_processing
    try {
      db.run(
        `INSERT INTO document_ai_processing 
          (staff_id, original_filename, saved_filename, file_hash, file_size, mime_type, classification_category, classification_confidence, extracted_fields, field_confidences, is_duplicate, duplicate_details, activity_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          staffId,
          originalFilename,
          req.file.filename,
          fileHash,
          fileSize,
          mimeType,
          classification.category,
          classification.confidence,
          JSON.stringify(fields),
          JSON.stringify(confidences),
          docDuplicate.isDuplicate || recordDuplicate.isDuplicate ? 1 : 0,
          JSON.stringify({ docDuplicate, recordDuplicate }),
          classification.category,
          'extracted'
        ]
      );
    } catch (auditErr) {
      console.warn('[Audit Log Warning]', auditErr.message);
    }

    res.json({
      success: true,
      savedFilename: req.file.filename,
      fileHash,
      fileSize,
      extractionMethod,
      classification,
      fields,
      confidences,
      documentDuplicate: docDuplicate,
      recordDuplicate,
      coAuthors,
      rawTextSnippet: (rawText || '').slice(0, 300)
    });
  } catch (err) {
    console.error('AI Document Extraction error:', err);
    res.status(500).json({ error: 'Failed to extract information from document. You can still enter details manually.' });
  }
});

// RECORD-LEVEL PRE-SAVE DUPLICATE CHECK ENDPOINT
router.post('/check-duplicate', authenticateToken, async (req, res) => {
  const { category, fields, staffId } = req.body;
  const targetStaffId = staffId || req.user.staffId;

  try {
    const result = await checkRecordDuplicate(category, fields, targetStaffId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ-ONLY: Match co-authors against SREC faculty
router.get('/publications/match-coauthors', authenticateToken, async (req, res) => {
  const { authors, doi } = req.query;
  const staffId = req.user.staffId;

  try {
    let crossRefAuthors = [];
    if (doi && doi.trim()) {
      try {
        const meta = await fetchPublicationByDoi(doi);
        if (meta && meta.authors) {
          // If DOI has authors
        }
      } catch (e) {}
    }
    const matched = await matchInternalCoAuthors(authors || '', crossRefAuthors, staffId);
    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPLICIT ACTION: Link an SREC faculty member to an existing publication
router.post('/publications/link-coauthor', authenticateToken, async (req, res) => {
  const { publicationId, staffId, staffName, authorPosition } = req.body;
  const targetStaffId = staffId || req.user.staffId;
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'dept_admin';

  if (!isPrivileged && targetStaffId !== req.user.staffId) {
    return res.status(403).json({ error: 'You can only link publications to your own faculty profile.' });
  }

  try {
    const result = await linkFacultyToPublication(publicationId, targetStaffId, staffName || req.user.name, authorPosition || 'Co-Author', 'manual_link');
    res.json({ success: true, message: 'Publication successfully linked to profile.', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPLICIT ACTION: Unlink an SREC faculty member from a publication
router.delete('/publications/:pubId/unlink-coauthor/:staffId', authenticateToken, async (req, res) => {
  const { pubId, staffId } = req.params;
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'dept_admin';

  if (!isPrivileged && staffId !== req.user.staffId) {
    return res.status(403).json({ error: 'You can only unlink publications from your own profile.' });
  }

  try {
    db.run(
      'DELETE FROM publication_authors WHERE publication_id = ? AND LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
      [pubId, staffId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Co-author unlinked successfully.' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all linked co-authors for a publication
router.get('/publications/:id/authors', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const authors = await getLinkedPublicationAuthors(id);
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  const hasStaffNameCol = config.cols.includes('staff_name');
  const staffNameSelect = hasStaffNameCol ? "COALESCE(NULLIF(t.staff_name, ''), p.staff_name, a.staff_name)" : "COALESCE(p.staff_name, a.staff_name)";

  if (type === 'publications') {
    // Special handling for publications: Include publications created by staff OR linked via publication_authors
    if (reqStaffId && reqStaffId !== req.user.staffId) {
      query = `
        SELECT DISTINCT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
        FROM staff_publication t
        LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
        LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
        LEFT JOIN publication_authors pa ON t.id = pa.publication_id
        WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?)) OR (LOWER(TRIM(pa.staff_id)) = LOWER(TRIM(?)) AND pa.is_confirmed = 1)
        ORDER BY t.id DESC
      `;
      params = [reqStaffId, reqStaffId];
    } else if (isAdmin || isDeptAdmin) {
      query = `
        SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
        FROM staff_publication t
        LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
        LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
        ORDER BY t.id DESC
      `;
      params = [];
    } else {
      query = `
        SELECT DISTINCT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
        FROM staff_publication t
        LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
        LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
        LEFT JOIN publication_authors pa ON t.id = pa.publication_id
        WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?)) OR (LOWER(TRIM(pa.staff_id)) = LOWER(TRIM(?)) AND pa.is_confirmed = 1)
        ORDER BY t.id DESC
      `;
      params = [req.user.staffId, req.user.staffId];
    }
  } else if (type === 'supervisors') {
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
    } else if (isAdmin || isDeptAdmin) {
      query = `SELECT t.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation ${extraSelect} FROM staff_supervisor t LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id)) LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))`;
      params = [];
    } else {
      query = `SELECT t.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation ${extraSelect} FROM staff_supervisor t LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id)) LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id)) WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))`;
      params = [req.user.staffId];
    }
  } else if (type === 'scholars') {
    const scholarSelect = `
      SELECT t.*, 
             ${staffNameSelect} as staff_name, 
             a.Department, 
             a.Designation,
             sup_a.Department as supervisor_dept,
             sup_a.Designation as supervisor_desig,
             COALESCE(sup_p.staff_name, sup_a.staff_name, t.sup_name) as supervisor_name,
             sup_s.res_sup_id as supervisor_ref_no
      FROM staff_scholars t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      LEFT JOIN staff_personal sup_p ON 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(sup_p.staff_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) = 
          LOWER(REPLACE(REPLACE(REPLACE(REPLACE(t.sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', ''))
      LEFT JOIN staff_academics sup_a ON LOWER(TRIM(sup_a.staff_id)) = LOWER(TRIM(sup_p.staff_id))
      LEFT JOIN staff_supervisor sup_s ON LOWER(TRIM(sup_s.staff_id)) = LOWER(TRIM(sup_p.staff_id))
    `;

    if (reqStaffId && reqStaffId !== req.user.staffId) {
      query = `${scholarSelect} WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?)) OR (t.sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(t.sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')), '%'))`;
      params = [reqStaffId, reqStaffId];
    } else if (isAdmin || isDeptAdmin) {
      query = scholarSelect;
      params = [];
    } else {
      query = `${scholarSelect} WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?)) OR (t.sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(t.sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')), '%'))`;
      params = [req.user.staffId, req.user.name || ''];
    }
  } else if (reqStaffId && reqStaffId !== req.user.staffId) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))
      ORDER BY t.id DESC
    `;
    params = [reqStaffId];
  } else if (isDeptAdmin) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      ORDER BY t.id DESC
    `;
    params = [];
  } else if (isAdmin) {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      ORDER BY t.id DESC
    `;
    params = [];
  } else {
    query = `
      SELECT t.*, ${staffNameSelect} as staff_name, a.Department, a.Designation
      FROM ${config.table} t
      LEFT JOIN staff_academics a ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(t.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(t.staff_id)) = LOWER(TRIM(?))
      ORDER BY t.id DESC
    `;
    params = [req.user.staffId];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }

    db.all('SELECT * FROM departments', [], (dErr, deptsList) => {
      fetchAllDeptHistory(async (historyMap) => {
        let processedRows = (rows || []).map(row => {
          const rowDate = row.date_con || row.awa_date || row.from_date || row.data_of_exam || row.sanctioned_date || row.dateofpublication || row.generation || row.date || row.created_at;
          const resolvedDept = getStaffDeptAtDate(row.staff_id, rowDate, row.Department, historyMap);
          return { ...row, Department: resolvedDept };
        });

        const targetAy = req.query.academicYear || req.query.academic_year;
        if (targetAy) {
          processedRows = processedRows.filter(r => matchesTargetAcademicYear(r, targetAy));
        }

        // For publications, attach linked internal co-authors
        if (type === 'publications' && processedRows.length > 0) {
          const pubIds = processedRows.map(r => r.id);
          const placeholders = pubIds.map(() => '?').join(',');
          const authorsQuery = `
            SELECT pa.publication_id, pa.staff_id, pa.staff_name, pa.author_position, a.Department 
            FROM publication_authors pa
            LEFT JOIN staff_academics a ON pa.staff_id COLLATE utf8mb4_unicode_ci = a.staff_id COLLATE utf8mb4_unicode_ci
            WHERE pa.publication_id IN (${placeholders}) AND pa.is_confirmed = 1
          `;
          
          const pubAuthorsMap = {};
          await new Promise((resAuth) => {
            db.all(authorsQuery, pubIds, (aErr, aRows) => {
              if (aRows) {
                aRows.forEach(ar => {
                  if (!pubAuthorsMap[ar.publication_id]) pubAuthorsMap[ar.publication_id] = [];
                  pubAuthorsMap[ar.publication_id].push(ar);
                });
              }
              resAuth();
            });
          });

          processedRows = processedRows.map(pr => {
            const linked = pubAuthorsMap[pr.id] || [];
            return {
              ...pr,
              internal_coauthors: linked,
              internal_coauthors_count: linked.length
            };
          });
        }

        if (isDeptAdmin) {
          const targetDept = (req.user.department || '').trim();
          const filtered = processedRows.filter(r => 
            matchesDepartment(r.Department, targetDept, deptsList || []) ||
            (type === 'scholars' && matchesDepartment(r.supervisor_dept, targetDept, deptsList || []))
          );
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
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'dept_admin';
  const targetStaffId = (isPrivileged && req.body.staff_id) ? req.body.staff_id : req.user.staffId;
  const config = tableMap[type];

  // Get staff name for inserting
  db.get('SELECT staff_name FROM staff_personal WHERE staff_id = ?', [targetStaffId], (err, personalRow) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const staffName = req.body.staff_name || (personalRow ? personalRow.staff_name : '');

    const data = { ...req.body };
    data.staff_id = targetStaffId;
    data.staff_name = staffName;
    data.date = new Date().toLocaleDateString('en-GB'); // dd-mm-yyyy

    if (req.file) {
      data.file = req.file.filename;
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        data.file_hash = computeFileHash(fileBuffer);
      } catch (hErr) {}

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
      
      const newId = this.lastID;

      // Special handling for Publications: Link primary author and confirmed internal co-authors in publication_authors
      if (type === 'publications') {
        try {
          // 1. Link primary creator
          linkFacultyToPublication(newId, targetStaffId, staffName, data.author_position || 'First Author', 'primary_creator');

          // 2. Link confirmed internal co-authors if provided
          let coAuthorIds = req.body.confirmed_coauthor_ids || req.body.internal_coauthor_ids;
          if (typeof coAuthorIds === 'string') {
            try { coAuthorIds = JSON.parse(coAuthorIds); } catch (e) { coAuthorIds = coAuthorIds.split(',').map(s => s.trim()).filter(Boolean); }
          }
          if (Array.isArray(coAuthorIds) && coAuthorIds.length > 0) {
            coAuthorIds.forEach(coStaffId => {
              if (coStaffId && coStaffId !== targetStaffId) {
                linkFacultyToPublication(newId, coStaffId, '', 'Co-Author', 'confirmed_srec_match');
              }
            });
          }
        } catch (linkErr) {
          console.warn('[Publication Linking Warning]', linkErr.message);
        }
      }

      res.json({ success: true, id: newId });
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

    // If publication, also delete from publication_authors
    if (type === 'publications') {
      db.run('DELETE FROM publication_authors WHERE publication_id = ?', [id], () => {});
    }

    // Admins can delete anything, faculty can only delete their own (or scholars under their supervisorship)
    let query = `DELETE FROM ${config.table} WHERE id = ?`;
    let params = [id];

    if (req.user.role !== 'admin' && req.user.role !== 'dept_admin') {
      if (type === 'scholars') {
        query += ` AND (staff_id = ? OR (sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')), '%')))`;
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
router.post('/upload/profile-pic', authenticateToken, upload.single('file'), async (req, res) => {
  const staffId = req.user.staffId;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    await standardizeProfilePic(req.file.path, '#ffffff');
  } catch (procErr) {
    console.warn('[ProfilePicUpload] Warning during background standardization:', procErr);
  }

  // Find and unlink old file if exists
  db.get('SELECT file FROM staff_user WHERE staff_id = ?', [staffId], (err, row) => {
    if (row && row.file && row.file !== req.file.filename) {
      const oldPath = findFileInSrecOrUploads(row.file) || path.resolve('uploads/upload', row.file);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }

    db.run('UPDATE staff_user SET file = ? WHERE staff_id = ?', [req.file.filename, staffId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update profile pic' });
      res.json({ 
        success: true, 
        file: req.file.filename,
        message: 'Profile picture uploaded with white background successfully!' 
      });
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
    if (config.cols.includes(key) && key !== 'id') {
      if (key === 'staff_id' && req.user.role !== 'admin' && req.user.role !== 'dept_admin') {
        return;
      }
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
    if (config.cols.includes('file_hash')) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        updateCols.push('file_hash = ?');
        params.push(computeFileHash(fileBuffer));
      } catch (e) {}
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
      query += ` AND (staff_id = ? OR (sup_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(sup_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) LIKE CONCAT('%', LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')), '%')))`;
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

    // If publication, sync confirmed co-authors if provided
    if (type === 'publications' && req.body.confirmed_coauthor_ids) {
      let coAuthorIds = req.body.confirmed_coauthor_ids;
      if (typeof coAuthorIds === 'string') {
        try { coAuthorIds = JSON.parse(coAuthorIds); } catch (e) { coAuthorIds = coAuthorIds.split(',').map(s => s.trim()).filter(Boolean); }
      }
      if (Array.isArray(coAuthorIds)) {
        coAuthorIds.forEach(coStaffId => {
          if (coStaffId && coStaffId !== staffId) {
            linkFacultyToPublication(id, coStaffId, '', 'Co-Author', 'confirmed_srec_match');
          }
        });
      }
    }

    res.json({ success: true, message: 'Activity record updated successfully' });
  });
});

export default router;
