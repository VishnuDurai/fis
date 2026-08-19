import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { getPool } from '../db.js';
import { authenticateToken, isTokenBlacklisted } from './auth.js';
import { SREC_ROOT } from '../utils/fileStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure logos directory exists
const eventLogosDir = path.resolve(__dirname, '../uploads/event_logos');
if (!fs.existsSync(eventLogosDir)) {
  fs.mkdirSync(eventLogosDir, { recursive: true });
}

// Multer storage configuration with sanitization and security
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventLogosDir);
  },
  filename: (req, file, cb) => {
    const staffId = (req.user?.staffId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `logo_${staffId}_${safeBase}_${uniqueSuffix}${cleanExt}`);
  }
});

const speakerPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventLogosDir);
  },
  filename: (req, file, cb) => {
    const staffId = (req.user?.staffId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, cleanExt).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `speaker_${staffId}_${safeBase}_${uniqueSuffix}${cleanExt}`);
  }
});

const logoFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP.'));
  }
};

const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: logoFileFilter
});

const uploadSpeakerPhoto = multer({
  storage: speakerPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: logoFileFilter
});

/**
 * Server-side magic bytes validation to reject corrupt files or executables renamed as images.
 */
export const validateImageMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 8) return false;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  // WEBP: RIFF .... WEBP
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return false;
};

/**
 * Image dimensions reader from buffer without external binary dependencies.
 */
export const getImageDimensions = (buffer) => {
  if (!buffer || buffer.length < 24) return { width: 0, height: 0 };
  
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] === 0xFF && (buffer[offset + 1] === 0xC0 || buffer[offset + 1] === 0xC2)) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset++;
    }
  }

  // WEBP
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
    if (chunkType === 'VP8L' && buffer.length >= 25) {
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      const width = 1 + (((b1 & 0x3F) << 8) | b0);
      const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
      return { width, height };
    }
    if (chunkType === 'VP8 ' && buffer.length >= 30) {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    }
  }

  return { width: 0, height: 0 };
};

const participantUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max for participant spreadsheets
});

// Helper: Canonical Department Mapping
const getDepartmentCanonical = (deptStr) => {
  if (!deptStr) return { code: 'GEN', name: 'GENERAL ENGINEERING' };
  const str = String(deptStr).trim().toUpperCase();
  const map = {
    'AI & DS': { code: 'AD', name: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' },
    'AI&DS': { code: 'AD', name: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' },
    'AD': { code: 'AD', name: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' },
    'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE': { code: 'AD', name: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' },
    'ARTIFICIAL INTELLIGENCE & DATA SCIENCE': { code: 'AD', name: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' },
    'CSE': { code: 'CS', name: 'COMPUTER SCIENCE AND ENGINEERING' },
    'CS': { code: 'CS', name: 'COMPUTER SCIENCE AND ENGINEERING' },
    'COMPUTER SCIENCE AND ENGINEERING': { code: 'CS', name: 'COMPUTER SCIENCE AND ENGINEERING' },
    'COMPUTER SCIENCE & ENGINEERING': { code: 'CS', name: 'COMPUTER SCIENCE AND ENGINEERING' },
    'ECE': { code: 'EC', name: 'ELECTRONICS AND COMMUNICATION ENGINEERING' },
    'ELECTRONICS AND COMMUNICATION ENGINEERING': { code: 'EC', name: 'ELECTRONICS AND COMMUNICATION ENGINEERING' },
    'EEE': { code: 'EE', name: 'ELECTRICAL AND ELECTRONICS ENGINEERING' },
    'ELECTRICAL AND ELECTRONICS ENGINEERING': { code: 'EE', name: 'ELECTRICAL AND ELECTRONICS ENGINEERING' },
    'MECH': { code: 'ME', name: 'MECHANICAL ENGINEERING' },
    'MECHANICAL ENGINEERING': { code: 'ME', name: 'MECHANICAL ENGINEERING' },
    'CIVIL': { code: 'CE', name: 'CIVIL ENGINEERING' },
    'CIVIL ENGINEERING': { code: 'CE', name: 'CIVIL ENGINEERING' },
    'IT': { code: 'IT', name: 'INFORMATION TECHNOLOGY' },
    'INFORMATION TECHNOLOGY': { code: 'IT', name: 'INFORMATION TECHNOLOGY' },
    'AERO': { code: 'AE', name: 'AERONAUTICAL ENGINEERING' },
    'AERONAUTICAL ENGINEERING': { code: 'AE', name: 'AERONAUTICAL ENGINEERING' },
    'EIE': { code: 'EI', name: 'ELECTRONICS AND INSTRUMENTATION ENGINEERING' },
    'ELECTRONICS AND INSTRUMENTATION ENGINEERING': { code: 'EI', name: 'ELECTRONICS AND INSTRUMENTATION ENGINEERING' },
    'BME': { code: 'BM', name: 'BIOMEDICAL ENGINEERING' },
    'BIOMEDICAL ENGINEERING': { code: 'BM', name: 'BIOMEDICAL ENGINEERING' },
    'MBA': { code: 'MB', name: 'MASTER OF BUSINESS ADMINISTRATION' },
    'MASTER OF BUSINESS ADMINISTRATION': { code: 'MB', name: 'MASTER OF BUSINESS ADMINISTRATION' },
    'M.TECH CSE': { code: 'MCS', name: 'M.TECH COMPUTER SCIENCE AND ENGINEERING' },
    'VLSI': { code: 'VLS', name: 'VLSI DESIGN' },
    'CHEMISTRY': { code: 'CH', name: 'DEPARTMENT OF CHEMISTRY' },
    'PHYSICS': { code: 'PH', name: 'DEPARTMENT OF PHYSICS' },
    'MATHS': { code: 'MA', name: 'DEPARTMENT OF MATHEMATICS' },
    'ENGLISH': { code: 'EN', name: 'DEPARTMENT OF ENGLISH' }
  };
  return map[str] || { code: str.substring(0, 4), name: str };
};

/**
 * Resolves the 3 Institutional Signatories strictly from server-side database lookups:
 * 1. Faculty Coordinator (Authenticated faculty organizer)
 * 2. HOD (Head of the Department for faculty coordinator's current department)
 * 3. Principal (Institutionally configured Principal)
 */
export const resolveInstitutionalSignatories = async (staffId, pool) => {
  // 1. Resolve Faculty Coordinator
  const [facultyRows] = await pool.query(
    `SELECT a.staff_id, COALESCE(p.staff_name, a.staff_name) as staff_name, a.Designation, a.Department 
     FROM staff_academics a 
     LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
     WHERE LOWER(TRIM(a.staff_id)) = LOWER(TRIM(?))`,
    [staffId]
  );
  const faculty = facultyRows[0] || {};
  const facultyName = faculty.staff_name || 'Faculty Member';
  const facultyDesignation = faculty.Designation || 'Faculty Coordinator';
  const rawDept = faculty.Department || '';
  const deptInfo = getDepartmentCanonical(rawDept);

  // 2. Resolve HOD for this department
  let hodName = 'Head of the Department';
  let hodDesignation = 'Professor & Head';

  // Try admin_dep first
  const [adminDepRows] = await pool.query(
    `SELECT ad.staff_id, COALESCE(p.staff_name, a.staff_name) as staff_name, a.Designation 
     FROM admin_dep ad
     LEFT JOIN staff_academics a ON LOWER(TRIM(ad.staff_id)) = LOWER(TRIM(a.staff_id))
     LEFT JOIN staff_personal p ON LOWER(TRIM(ad.staff_id)) = LOWER(TRIM(p.staff_id))
     WHERE LOWER(TRIM(ad.Department)) = LOWER(TRIM(?)) OR LOWER(TRIM(ad.Department)) = LOWER(TRIM(?))
     LIMIT 1`,
    [rawDept, deptInfo.code]
  );

  if (adminDepRows.length > 0 && adminDepRows[0].staff_name) {
    hodName = adminDepRows[0].staff_name;
    hodDesignation = adminDepRows[0].Designation || 'Professor & Head';
  } else {
    // Check staff_academics for faculty with HOD/Head in designation in this department
    const [hodAcademics] = await pool.query(
      `SELECT a.staff_id, COALESCE(p.staff_name, a.staff_name) as staff_name, a.Designation 
       FROM staff_academics a
       LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
       WHERE (LOWER(a.Designation) LIKE '%hod%' OR LOWER(a.Designation) LIKE '%head%')
       AND (LOWER(TRIM(a.Department)) = LOWER(TRIM(?)) OR LOWER(TRIM(a.Department)) = LOWER(TRIM(?)))
       LIMIT 1`,
      [rawDept, deptInfo.code]
    );
    if (hodAcademics.length > 0 && hodAcademics[0].staff_name) {
      hodName = hodAcademics[0].staff_name;
      hodDesignation = hodAcademics[0].Designation || 'Professor & Head';
    }
  }

  // 3. Resolve Institutional Principal
  let principalName = 'Dr. N. R. Alamelu';
  let principalDesignation = 'Principal';

  const [principalRows] = await pool.query(
    `SELECT a.staff_id, COALESCE(p.staff_name, a.staff_name) as staff_name, a.Designation 
     FROM staff_academics a
     LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
     WHERE LOWER(a.Designation) LIKE '%principal%'
     LIMIT 1`
  );

  if (principalRows.length > 0 && principalRows[0].staff_name) {
    principalName = principalRows[0].staff_name;
    principalDesignation = principalRows[0].Designation || 'Principal';
  }

  return {
    department: deptInfo.name,
    departmentCode: deptInfo.code,
    signatories: {
      facultyCoordinator: {
        roleTitle: 'Faculty Coordinator',
        name: facultyName,
        designation: facultyDesignation
      },
      hod: {
        roleTitle: 'HOD',
        name: hodName,
        designation: hodDesignation
      },
      principal: {
        roleTitle: 'Principal',
        name: principalName,
        designation: principalDesignation
      }
    }
  };
};

// =========================================================================
// 1. GET /api/event-design/events - Retrieve events organized by logged-in faculty
// =========================================================================
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const staffId = req.user?.staffId;

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID missing in token session' });
    }

    // Resolve authenticated department and institutional signatories
    const sigData = await resolveInstitutionalSignatories(staffId, pool);

    // Retrieve events organized by this faculty
    const [eventRows] = await pool.query(
      'SELECT id, type, title, from_date, to_date, organizer, res_person, ben_person, sponsership, granted, date, file, role FROM staff_event_organized WHERE staff_id = ? ORDER BY id DESC',
      [staffId]
    );

    return res.json({
      department: sigData.department,
      departmentCode: sigData.departmentCode,
      facultyName: sigData.signatories.facultyCoordinator.name,
      designation: sigData.signatories.facultyCoordinator.designation,
      signatories: sigData.signatories,
      events: eventRows
    });
  } catch (err) {
    console.error('Error fetching faculty events for design suite:', err);
    return res.status(500).json({ error: 'Database error fetching events' });
  }
});

// =========================================================================
// 2. GET /api/event-design/templates - List active templates (or all for admin)
// =========================================================================
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { type, all } = req.query;
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);

    let query = 'SELECT * FROM event_design_templates WHERE 1=1';
    const params = [];

    // Faculty only gets active templates
    if (!isAdmin || all !== 'true') {
      query += ' AND is_active = 1';
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type.toUpperCase());
    }

    query += ' ORDER BY type ASC, is_default DESC, template_id ASC';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching design templates:', err);
    return res.status(500).json({ error: 'Failed to retrieve design templates' });
  }
});

// =========================================================================
// 3. PUT /api/event-design/admin/templates/:templateId - Toggle template status (Admin RBAC)
// =========================================================================
router.put('/admin/templates/:templateId', authenticateToken, async (req, res) => {
  try {
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied: System Administrator privileges required' });
    }

    const pool = getPool();
    const { templateId } = req.params;
    const { is_active, is_default, template_name, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM event_design_templates WHERE template_id = ?', [templateId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // If setting default, unset others of same type
    if (is_default === 1 || is_default === true) {
      await pool.query('UPDATE event_design_templates SET is_default = 0 WHERE type = ?', [existing[0].type]);
    }

    await pool.query(
      `UPDATE event_design_templates 
       SET is_active = COALESCE(?, is_active),
           is_default = COALESCE(?, is_default),
           template_name = COALESCE(?, template_name),
           description = COALESCE(?, description)
       WHERE template_id = ?`,
      [
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        is_default !== undefined ? (is_default ? 1 : 0) : null,
        template_name || null,
        description || null,
        templateId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM event_design_templates WHERE template_id = ?', [templateId]);
    return res.json({ message: 'Template updated successfully', template: updated[0] });
  } catch (err) {
    console.error('Error updating template:', err);
    return res.status(500).json({ error: 'Failed to update template' });
  }
});

// =========================================================================
// 4. POST /api/event-design/upload-logo - Secure upload for organizer/event logos
// =========================================================================
router.post('/upload-logo', authenticateToken, (req, res) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Logo file exceeds maximum permitted size of 5 MB' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }

    // Safe relative URL path for client preview & PDF rendering
    const relativeUrl = `/uploads/event_logos/${req.file.filename}`;
    return res.json({
      message: 'Logo uploaded successfully',
      filename: req.file.filename,
      url: relativeUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// =========================================================================
// 4B. POST /api/event-design/upload-photo - Upload Chief Guest / Speaker Photo
// =========================================================================
router.post('/upload-photo', authenticateToken, (req, res) => {
  uploadSpeakerPhoto.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Photo file exceeds maximum permitted size of 5 MB' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo file uploaded' });
    }

    // Read the file buffer for magic bytes and dimension check
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const validatedMime = validateImageMagicBytes(fileBuffer);
      if (!validatedMime) {
        fs.unlinkSync(req.file.path); // Remove invalid/corrupt file immediately
        return res.status(400).json({ error: 'Invalid or corrupt image file. Only genuine PNG, JPG, and WEBP images are accepted.' });
      }

      const dimensions = getImageDimensions(fileBuffer);
      const isLowResolution = dimensions.width > 0 && dimensions.height > 0 && (dimensions.width < 800 || dimensions.height < 800);
      const warningMessage = isLowResolution ? 'Photo resolution is low and may appear less sharp in the generated poster/invitation.' : null;

      const relativeUrl = `/uploads/event_logos/${req.file.filename}`;
      return res.json({
        message: 'Resource person photo uploaded successfully',
        filename: req.file.filename,
        url: relativeUrl,
        size: req.file.size,
        mimetype: validatedMime,
        assetType: 'RESOURCE_PERSON_PHOTO',
        width: dimensions.width,
        height: dimensions.height,
        isLowResolution,
        warningMessage
      });
    } catch (readErr) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Failed to process uploaded photo: ' + readErr.message });
    }
  });
});

// =========================================================================
// 4C. DELETE /api/event-design/photo/:filename - Remove Chief Guest Photo
// =========================================================================
router.delete('/photo/:filename', authenticateToken, (req, res) => {
  try {
    const rawFilename = req.params.filename;
    // Strict path traversal and character sanitization
    const sanitizedFilename = path.basename(rawFilename).replace(/[^a-zA-Z0-9_.-]/g, '');
    if (!sanitizedFilename || sanitizedFilename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const staffId = (req.user?.staffId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const isOwner = sanitizedFilename.startsWith(`speaker_${staffId}_`) || sanitizedFilename.startsWith(`logo_${staffId}_`);
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to delete this file.' });
    }

    const filePath = path.join(eventLogosDir, sanitizedFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'Photo deleted successfully', filename: sanitizedFilename });
    } else {
      return res.status(404).json({ error: 'Photo file not found on server' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete photo: ' + err.message });
  }
});

// =========================================================================
// 5. POST /api/event-design/validate-participants - Excel/CSV Participant Parser
// =========================================================================
router.post('/validate-participants', authenticateToken, participantUpload.single('file'), async (req, res) => {
  try {
    const pool = getPool();
    let rawRows = [];

    // Case A: File upload (XLSX, XLS, CSV)
    if (req.file) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return res.status(400).json({ error: 'The uploaded spreadsheet contains no readable sheets.' });
      }
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } 
    // Case B: Raw JSON payload sent directly
    else if (req.body.participants && Array.isArray(req.body.participants)) {
      rawRows = req.body.participants;
    } else {
      return res.status(400).json({ error: 'Please upload an Excel (.xlsx) or CSV (.csv) participant file.' });
    }

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: 'Participant list is empty. Please ensure the file contains participant rows.' });
    }

    if (rawRows.length > 2000) {
      return res.status(400).json({ error: 'Participant list exceeds single-batch limit of 2,000 rows. Please split into smaller batches.' });
    }

    const validatedParticipants = [];
    const seenNames = new Set();
    let validCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;

    rawRows.forEach((row, idx) => {
      // Normalize column header keys (case-insensitive, trimmed)
      const normalized = {};
      Object.keys(row).forEach(k => {
        const cleanKey = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        normalized[cleanKey] = String(row[k]).trim();
      });

      // Flexible column resolution
      const rawName = normalized['participantname'] || normalized['name'] || normalized['fullname'] || normalized['studentname'] || normalized['candidate'] || row['Participant Name'] || row['Name'] || '';
      const designation = normalized['designation'] || normalized['role'] || normalized['position'] || row['Designation'] || 'Participant';
      const organization = normalized['organization'] || normalized['organisation'] || normalized['college'] || normalized['institution'] || row['Organization'] || row['Organisation'] || 'Sri Ramakrishna Engineering College';
      const email = normalized['email'] || normalized['emailid'] || normalized['mail'] || row['Email'] || '';

      const cleanName = rawName.trim();
      let status = 'Ready';
      let errorReason = '';

      // Validation 1: Mandatory Participant Name
      if (!cleanName) {
        status = 'Error';
        errorReason = 'Participant name is missing or blank';
        errorCount++;
      } 
      // Validation 2: Duplicate Check within the batch
      else {
        const nameKey = cleanName.toLowerCase();
        if (seenNames.has(nameKey)) {
          status = 'Duplicate';
          errorReason = 'Duplicate participant name in batch';
          duplicateCount++;
        } else {
          seenNames.add(nameKey);
          validCount++;
        }
      }

      // Validation 3: Basic Email check if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status === 'Ready') {
          // Warning note, not hard error
          errorReason = 'Email format warning';
        }
      }

      validatedParticipants.push({
        sno: idx + 1,
        name: cleanName,
        designation: designation || 'Participant',
        organization: organization || 'Sri Ramakrishna Engineering College',
        email: email || '',
        status,
        errorReason
      });
    });

    const sigData = await resolveInstitutionalSignatories(req.user?.staffId, pool);

    return res.json({
      totalRows: validatedParticipants.length,
      validCount,
      errorCount,
      duplicateCount,
      department: sigData.department,
      departmentCode: sigData.departmentCode,
      signatories: sigData.signatories,
      participants: validatedParticipants
    });
  } catch (err) {
    console.error('Participant validation error:', err);
    return res.status(500).json({ error: 'Failed to parse and validate participant list: ' + err.message });
  }
});

// =========================================================================
// 6. GET /api/event-design/templates/sample-excel & sample-csv - Template Downloads
// =========================================================================
router.get('/templates/sample-excel', (req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      { 'Participant Name': 'Dr. S. Karthik', 'Designation': 'Associate Professor', 'Organization': 'Sri Ramakrishna Engineering College', 'Email': 'karthik.s@srec.ac.in' },
      { 'Participant Name': 'Ms. R. Priya', 'Designation': 'Assistant Professor', 'Organization': 'PSG College of Technology', 'Email': 'priya.r@psgtech.ac.in' },
      { 'Participant Name': 'Mr. K. Vignesh', 'Designation': 'Student / Scholar', 'Organization': 'Sri Ramakrishna Engineering College', 'Email': 'vignesh.k@srec.ac.in' }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="SREC_Certificate_Participants_Template.xlsx"');
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate sample Excel template' });
  }
});

router.get('/templates/sample-csv', (req, res) => {
  try {
    const csvContent = 'Participant Name,Designation,Organization,Email\nDr. S. Karthik,Associate Professor,Sri Ramakrishna Engineering College,karthik.s@srec.ac.in\nMs. R. Priya,Assistant Professor,PSG College of Technology,priya.r@psgtech.ac.in\nMr. K. Vignesh,Student / Scholar,Sri Ramakrishna Engineering College,vignesh.k@srec.ac.in\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SREC_Certificate_Participants_Template.csv"');
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate sample CSV template' });
  }
});

// =========================================================================
// 7. POST /api/event-design/generate - Record generated design with Atomic Versioning
// =========================================================================
router.post('/generate', authenticateToken, async (req, res) => {
  const pool = getPool();
  let conn;
  try {
    const staffId = req.user?.staffId;

    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing staffId' });
    }

    const {
      eventId,
      eventTitle,
      designType,
      templateId,
      filePath,
      previewPath,
      fileFormat = 'pdf',
      certificateCount = 1,
      packageId = null,
      status = 'COMPLETED',
      metadata = {}
    } = req.body;

    if (!eventTitle || !designType || !templateId) {
      return res.status(400).json({ error: 'Mandatory fields missing: eventTitle, designType, templateId are required.' });
    }

    // SERVER-ENFORCED DEPARTMENT & INSTITUTIONAL SIGNATORIES LOOKUP (ANTI-SPOOFING)
    const sigData = await resolveInstitutionalSignatories(staffId, pool);

    const year = new Date().getFullYear();
    const cleanEventCode = (eventTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) || 'EVENT').toUpperCase();
    const batchId = `BATCH-${sigData.departmentCode}-${year}-${Date.now().toString().slice(-6)}`;

    // Build metadata payload strictly using server-resolved signatories (overriding any client manipulation)
    const safeMetadata = {
      ...metadata,
      serverResolvedDepartment: sigData.department,
      serverResolvedDeptCode: sigData.departmentCode,
      signatories: sigData.signatories,
      facultyCoordinator: sigData.signatories.facultyCoordinator,
      hod: sigData.signatories.hod,
      principal: sigData.signatories.principal,
      generatedByStaffId: staffId,
      generatedByStaffName: sigData.signatories.facultyCoordinator.name,
      generatedTimestamp: new Date().toISOString()
    };

    conn = await pool.getConnection();
    const lockName = `srec_evt_ver_${eventId || 'none'}_${designType.toUpperCase()}`;
    await conn.query('SELECT GET_LOCK(?, 15)', [lockName]);

    await conn.beginTransaction();

    let nextVersion = 1;

    // Atomic version computation for this (event_id, design_type)
    if (eventId) {
      const [verRows] = await conn.query(
        'SELECT COALESCE(MAX(version), 0) as maxVer FROM event_generated_documents WHERE event_id = ? AND design_type = ? FOR UPDATE',
        [eventId, designType.toUpperCase()]
      );
      nextVersion = (verRows[0]?.maxVer || 0) + 1;

      // Mark previous versions as is_latest = 0
      await conn.query(
        'UPDATE event_generated_documents SET is_latest = 0 WHERE event_id = ? AND design_type = ?',
        [eventId, designType.toUpperCase()]
      );
    }

    safeMetadata.version = nextVersion;

    const [result] = await conn.query(
      `INSERT INTO event_generated_documents 
       (staff_id, event_id, event_title, design_type, template_id, file_path, preview_path, file_format, certificate_count, certificate_batch_id, version, is_latest, package_id, status, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        staffId,
        eventId || null,
        eventTitle,
        designType.toUpperCase(),
        templateId,
        filePath || '',
        previewPath || '',
        fileFormat,
        certificateCount || 1,
        batchId,
        nextVersion,
        packageId || null,
        status || 'COMPLETED',
        JSON.stringify(safeMetadata)
      ]
    );

    await conn.commit();
    await conn.query('SELECT RELEASE_LOCK(?)', [lockName]);

    return res.json({
      message: 'Event design record logged successfully',
      id: result.insertId,
      batchId,
      version: nextVersion,
      isLatest: 1,
      department: sigData.department,
      departmentCode: sigData.departmentCode,
      signatories: sigData.signatories,
      facultyCoordinator: sigData.signatories.facultyCoordinator,
      hod: sigData.signatories.hod,
      principal: sigData.signatories.principal,
      certificatePrefix: `SREC/${sigData.departmentCode}/${year}/${cleanEventCode}/`
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error recording generated event design:', err);
    return res.status(500).json({ error: 'Failed to record generated design: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// =========================================================================
// 8. GET /api/event-design/events/:eventId/history - Event Design History with RBAC
// =========================================================================
router.get('/events/:eventId/history', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { eventId } = req.params;
    const staffId = req.user?.staffId;
    const userRole = req.user?.role;
    const userDept = req.user?.department;

    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing staffId' });
    }

    // 1. Fetch authoritative event record from staff_event_organized
    const [eventRows] = await pool.query(
      `SELECT e.*, COALESCE(p.staff_name, a.staff_name) as organizer_name, a.Department as organizer_dept 
       FROM staff_event_organized e
       LEFT JOIN staff_academics a ON LOWER(TRIM(e.staff_id)) = LOWER(TRIM(a.staff_id))
       LEFT JOIN staff_personal p ON LOWER(TRIM(e.staff_id)) = LOWER(TRIM(p.staff_id))
       WHERE e.id = ?`,
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event record not found in staff_event_organized' });
    }

    const event = eventRows[0];

    // 2. Strict Multi-Tier RBAC Verification
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(userRole);
    const isOwner = String(event.staff_id).trim().toLowerCase() === String(staffId).trim().toLowerCase();

    // HOD check: Must belong to same department as event organizer
    let isDeptHod = false;
    if (userRole === 'dept_admin' || userRole === 'hod') {
      const canonicalUserDept = getDepartmentCanonical(userDept).code;
      const canonicalEventDept = getDepartmentCanonical(event.organizer_dept || event.organizer).code;
      if (canonicalUserDept === canonicalEventDept) {
        isDeptHod = true;
      }
    }

    if (!isAdmin && !isOwner && !isDeptHod) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to view design history for this event.' });
    }

    // 3. Fetch all generated documents for this event (Posters, Invitations, Certificates)
    const [docs] = await pool.query(
      `SELECT id, staff_id, event_id, event_title, design_type, template_id, file_path, preview_path, 
              file_format, certificate_count, certificate_batch_id, version, is_latest, package_id, status, metadata_json, created_at 
       FROM event_generated_documents 
       WHERE event_id = ? 
       ORDER BY version DESC, created_at DESC`,
      [eventId]
    );

    // Group documents into categories
    const posters = docs.filter(d => d.design_type === 'POSTER');
    const invitations = docs.filter(d => d.design_type === 'INVITATION');
    const certificates = docs.filter(d => d.design_type === 'CERTIFICATE');

    // 4. Fetch packages generated for this event
    const [packages] = await pool.query(
      `SELECT * FROM event_design_packages WHERE event_id = ? ORDER BY created_at DESC`,
      [eventId]
    );

    // 5. Institutional Signatories for this event
    const sigData = await resolveInstitutionalSignatories(event.staff_id, pool);

    return res.json({
      eventId: event.id,
      eventDetails: {
        id: event.id,
        title: event.title,
        type: event.type,
        department: sigData.department,
        departmentCode: sigData.departmentCode,
        fromDate: event.from_date || event.date,
        toDate: event.to_date,
        date: event.date || event.from_date,
        organizer: event.organizer,
        organizerStaffId: event.staff_id,
        organizerName: event.organizer_name || sigData.signatories.facultyCoordinator.name,
        resourcePerson: event.res_person,
        beneficiary: event.ben_person,
        sponsorship: event.sponsership,
        granted: event.granted,
        file: event.file,
        role: event.role
      },
      signatories: sigData.signatories,
      status: {
        posterGenerated: posters.length > 0,
        posterLatest: posters.find(p => p.is_latest === 1) || posters[0] || null,
        posterVersionCount: posters.length,
        invitationGenerated: invitations.length > 0,
        invitationLatest: invitations.find(i => i.is_latest === 1) || invitations[0] || null,
        invitationVersionCount: invitations.length,
        certificatesGenerated: certificates.length > 0,
        certificatesLatest: certificates.find(c => c.is_latest === 1) || certificates[0] || null,
        certificateBatchesCount: certificates.length,
        packagesGenerated: packages.length > 0,
        packageLatest: packages[0] || null,
        packageCount: packages.length
      },
      history: {
        posters,
        invitations,
        certificates,
        packages
      }
    });
  } catch (err) {
    console.error('Error fetching event design history:', err);
    return res.status(500).json({ error: 'Failed to retrieve event design history: ' + err.message });
  }
});

// =========================================================================
// 9. POST /api/event-design/packages - Record One-Click Event Package Audit
// =========================================================================
router.post('/packages', authenticateToken, async (req, res) => {
  const pool = getPool();
  let conn;
  try {
    const staffId = req.user?.staffId;
    if (!staffId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing staffId' });
    }

    const {
      eventId,
      eventTitle,
      posterTemplate = 'P01',
      invitationTemplate = 'I01',
      certificateTemplate = 'C01',
      participantCount = 0,
      certRangeStart = '',
      certRangeEnd = '',
      packageFilename = '',
      filePath = '',
      generationStatus = 'COMPLETED',
      posterStatus = 'SUCCESS',
      invitationStatus = 'SUCCESS',
      certificateStatus = 'SUCCESS',
      summaryStatus = 'SUCCESS',
      errorDetails = '',
      idempotencyKey = '',
      metadata = {}
    } = req.body;

    if (!eventId || !eventTitle) {
      return res.status(400).json({ error: 'Mandatory fields missing: eventId and eventTitle are required.' });
    }

    // 1. Verify Event ownership / RBAC
    const [eventCheck] = await pool.query('SELECT staff_id FROM staff_event_organized WHERE id = ?', [eventId]);
    if (eventCheck.length === 0) {
      return res.status(404).json({ error: 'Event not found in staff_event_organized' });
    }

    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);
    if (!isAdmin && eventCheck[0].staff_id !== staffId) {
      return res.status(403).json({ error: 'Access denied: You cannot create packages for other faculty events' });
    }

    // 2. Server-side resolved department & signatories
    const sigData = await resolveInstitutionalSignatories(staffId, pool);

    conn = await pool.getConnection();
    const pkgLockName = `srec_pkg_lock_${idempotencyKey || eventId}`;
    conn._pkgLockName = pkgLockName;
    await conn.query('SELECT GET_LOCK(?, 15)', [pkgLockName]);

    // 3. Idempotency Check
    if (idempotencyKey) {
      const [existingPkg] = await conn.query(
        `SELECT * FROM event_design_packages 
         WHERE (idempotency_key = ? OR (event_id = ? AND staff_id = ? AND metadata_json LIKE ?))
         AND created_at >= NOW() - INTERVAL 5 MINUTE LIMIT 1`,
        [idempotencyKey, eventId, staffId, `%"idempotencyKey":"${idempotencyKey}"%`]
      );
      if (existingPkg.length > 0) {
        await conn.query('SELECT RELEASE_LOCK(?)', [pkgLockName]);
        conn.release();
        return res.json({
          message: 'Package already recorded (idempotent)',
          package: existingPkg[0],
          id: existingPkg[0].id,
          idempotent: true
        });
      }
    }

    const safeMetadata = {
      ...metadata,
      idempotencyKey: idempotencyKey || undefined,
      serverResolvedDepartment: sigData.department,
      serverResolvedDeptCode: sigData.departmentCode,
      signatories: sigData.signatories,
      generatedByStaffId: staffId,
      generatedByStaffName: sigData.signatories.facultyCoordinator.name,
      generatedTimestamp: new Date().toISOString()
    };

    await conn.beginTransaction();

    const [pkgResult] = await conn.query(
      `INSERT INTO event_design_packages 
       (event_id, staff_id, department, event_title, poster_template, invitation_template, certificate_template, 
        participant_count, cert_range_start, cert_range_end, package_filename, file_path, 
        generation_status, poster_status, invitation_status, certificate_status, summary_status, idempotency_key, error_details, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        staffId,
        sigData.department,
        eventTitle,
        posterTemplate,
        invitationTemplate,
        certificateTemplate,
        participantCount,
        certRangeStart,
        certRangeEnd,
        packageFilename,
        filePath,
        generationStatus,
        posterStatus,
        invitationStatus,
        certificateStatus,
        summaryStatus,
        idempotencyKey || null,
        errorDetails ? (typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)) : '',
        JSON.stringify(safeMetadata)
      ]
    );

    const packageId = pkgResult.insertId;

    // Atomically link constituent documents into event_generated_documents
    const docTypes = [
      { type: 'POSTER', template: posterTemplate, status: posterStatus },
      { type: 'INVITATION', template: invitationTemplate, status: invitationStatus },
      { type: 'CERTIFICATE', template: certificateTemplate, status: certificateStatus, count: participantCount }
    ];

    for (const d of docTypes) {
      if (d.status === 'SUCCESS') {
        const [lastDoc] = await conn.query(
          `SELECT id FROM event_generated_documents 
           WHERE event_id = ? AND design_type = ? AND is_latest = 1 
           ORDER BY id DESC LIMIT 1`,
          [eventId, d.type]
        );
        if (lastDoc.length > 0) {
          await conn.query(
            'UPDATE event_generated_documents SET package_id = ? WHERE id = ?',
            [packageId, lastDoc[0].id]
          );
        } else {
          // Record constituent document stub if not already recorded independently
          await conn.query(
            `INSERT INTO event_generated_documents 
             (staff_id, event_id, event_title, design_type, template_id, file_path, certificate_count, version, is_latest, package_id, status, metadata_json)
             VALUES (?, ?, ?, ?, ?, NULL, ?, 1, 1, ?, 'COMPLETED', ?)`,
            [
              staffId,
              eventId,
              eventTitle,
              d.type,
              d.template,
              d.count || 1,
              packageId,
              JSON.stringify(safeMetadata)
            ]
          );
        }
      }
    }

    await conn.commit();
    await conn.query('SELECT RELEASE_LOCK(?)', [pkgLockName]);
    conn.release();

    return res.json({
      message: 'Event package logged successfully',
      id: packageId,
      packageId,
      generationStatus,
      posterStatus,
      invitationStatus,
      certificateStatus,
      summaryStatus,
      department: sigData.department,
      signatories: sigData.signatories
    });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
      // Release named lock even on failure to avoid lock starvation
      try { await conn.query('SELECT RELEASE_LOCK(?)', [conn._pkgLockName || '']); } catch (_) {}
    }
    // Unique constraint violation on idempotency_key = duplicate request → idempotent response
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('uq_idempotency_key')) {
      try {
        const pool = getPool();
        const [dupPkg] = await pool.query(
          'SELECT * FROM event_design_packages WHERE idempotency_key = ? LIMIT 1',
          [req.body?.idempotencyKey]
        );
        if (dupPkg.length > 0) {
          return res.json({
            message: 'Package already recorded (idempotent)',
            package: dupPkg[0],
            id: dupPkg[0].id,
            idempotent: true
          });
        }
      } catch (_) {}
    }
    console.error('Error recording event package:', err);
    return res.status(500).json({ error: 'Failed to record event package: ' + err.message });
  } finally {
    if (conn) conn.release();
  }
});

// =========================================================================
// 10. GET /api/event-design/packages/:packageId - Get Package by ID with RBAC
// =========================================================================
router.get('/packages/:packageId', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { packageId } = req.params;
    const staffId = req.user?.staffId;
    const userRole = req.user?.role;
    const userDept = req.user?.department;

    const [rows] = await pool.query('SELECT * FROM event_design_packages WHERE id = ?', [packageId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Package record not found' });
    }

    const pkg = rows[0];
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(userRole);
    const isOwner = pkg.staff_id === staffId;

    let isDeptHod = false;
    if (userRole === 'dept_admin' || userRole === 'hod') {
      const userDeptCode = getDepartmentCanonical(userDept).code;
      const pkgDeptCode = getDepartmentCanonical(pkg.department).code;
      if (userDeptCode === pkgDeptCode) isDeptHod = true;
    }

    if (!isAdmin && !isOwner && !isDeptHod) {
      return res.status(403).json({ error: 'Access denied: You cannot view packages generated by other faculty' });
    }

    return res.json(pkg);
  } catch (err) {
    console.error('Error fetching package details:', err);
    return res.status(500).json({ error: 'Database error fetching package details' });
  }
});

// =========================================================================
// 11. GET /api/event-design/my-designs - List generated designs for faculty
// =========================================================================
router.get('/my-designs', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const staffId = req.user?.staffId;
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);
    const { all } = req.query;

    let query = 'SELECT * FROM event_generated_documents';
    const params = [];

    if (!isAdmin || all !== 'true') {
      query += ' WHERE staff_id = ?';
      params.push(staffId);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching design history:', err);
    return res.status(500).json({ error: 'Database error fetching generated designs' });
  }
});

// =========================================================================
// 12. DELETE /api/event-design/my-designs/:id - Delete generated design record
// =========================================================================
router.delete('/my-designs/:id', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const staffId = req.user?.staffId;
    const isAdmin = ['admin', 'system_admin', 'principal'].includes(req.user?.role);

    const [rows] = await pool.query('SELECT * FROM event_generated_documents WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Generated design record not found' });
    }

    const doc = rows[0];
    if (!isAdmin && doc.staff_id !== staffId) {
      return res.status(403).json({ error: 'Access denied: You cannot delete designs generated by other faculty' });
    }

    await pool.query('DELETE FROM event_generated_documents WHERE id = ?', [id]);
    return res.json({ message: 'Generated design record deleted successfully' });
  } catch (err) {
    console.error('Error deleting design record:', err);
    return res.status(500).json({ error: 'Failed to delete generated design' });
  }
});

export default router;

