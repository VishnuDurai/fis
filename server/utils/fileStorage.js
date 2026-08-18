import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root SREC directory path
export const SREC_ROOT = path.resolve(__dirname, '../SREC');

// Ensure SREC root directory exists
if (!fs.existsSync(SREC_ROOT)) {
  fs.mkdirSync(SREC_ROOT, { recursive: true });
}

/**
 * Canonical Mapping connecting Academic Department Titles to Physical Filesystem Directory Codes
 */
export const DEPARTMENT_FOLDER_MAP = {
  // CSE
  'cse': 'CSE',
  'computer science and engineering': 'CSE',
  'computer science & engineering': 'CSE',
  'computer science': 'CSE',
  'm.tech cse': 'M.Tech CSE',
  'm.tech computer science and engineering': 'M.Tech CSE',
  
  // IT
  'it': 'IT',
  'information technology': 'IT',
  
  // AI & DS
  'ai & ds': 'AI & DS',
  'ai&ds': 'AI & DS',
  'aids': 'AI & DS',
  'ai and ds': 'AI & DS',
  'ai & data science': 'AI & DS',
  'artificial intelligence and data science': 'AI & DS',
  'artificial intelligence & data science': 'AI & DS',
  'artificial intelligence': 'AI & DS',
  'data science': 'AI & DS',
  
  // ECE
  'ece': 'ECE',
  'electronics and communication engineering': 'ECE',
  'electronics & communication engineering': 'ECE',
  'electronics and communication': 'ECE',
  
  // EEE
  'eee': 'EEE',
  'electrical and electronics engineering': 'EEE',
  'electrical & electronics engineering': 'EEE',
  'electrical and electronics': 'EEE',
  
  // MECH
  'mech': 'MECH',
  'mechanical engineering': 'MECH',
  'mechanical': 'MECH',
  
  // CIVIL
  'civil': 'CIVIL',
  'civil engineering': 'CIVIL',
  
  // BME
  'bme': 'BME',
  'biomedical engineering': 'BME',
  'biomedical': 'BME',
  
  // AERO
  'aero': 'AERO',
  'aeronautical engineering': 'AERO',
  'aeronautical': 'AERO',
  
  // EIE
  'eie': 'EIE',
  'electronics and instrumentation engineering': 'EIE',
  'electronics & instrumentation engineering': 'EIE',
  'electronics and instrumentation': 'EIE',
  
  // R & A
  'r & a': 'R & A',
  'r&a': 'R & A',
  'robotics and automation': 'R & A',
  'robotics & automation': 'R & A',
  'research and academics': 'R & A',
  'research & academics': 'R & A',
  
  // S&H
  'maths': 'MATHS',
  'mathematics': 'MATHS',
  'phy': 'PHY',
  'physics': 'PHY',
  'chem': 'CHEM',
  'chemistry': 'CHEM',
  'eng': 'ENG',
  'english': 'ENG',
  'eng (tamil discipline)': 'ENG (Tamil Discipline)',
  'g.e - s&h': 'G.E - S&H',
  'general engineering': 'G.E - S&H',
  
  // Management & Others
  'mba': 'MBA',
  'management': 'MBA',
  'admin': 'ADMIN',
  'administration': 'ADMIN',
  'office': 'Office',
  'lib': 'LIB',
  'library': 'LIB',
  'phy edu': 'PHY EDU',
  'physical education': 'PHY EDU',
  'placement cell': 'Placement Cell',
  'placement': 'Placement Cell'
};

/**
 * Resolve academic department name to canonical filesystem directory folder code
 */
export function getCanonicalDepartmentFolder(deptName) {
  if (!deptName) return 'General';
  const raw = deptName.toString().trim();
  const normalizedKey = raw.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (DEPARTMENT_FOLDER_MAP[normalizedKey]) {
    return DEPARTMENT_FOLDER_MAP[normalizedKey];
  }
  
  const directPath = path.join(SREC_ROOT, raw);
  if (fs.existsSync(directPath)) {
    return raw;
  }
  
  return sanitizeName(raw);
}

/**
 * Sanitize directory or file names for filesystem safety
 */
export function sanitizeName(name) {
  if (!name) return 'Unassigned';
  return name.toString().trim().replace(/[\/\\?%*:|"<>]/g, '_');
}

/**
 * Get or lookup department name for a given staff ID
 */
export function getFacultyDepartment(staffId, callback) {
  const cleanId = (staffId || '').toString().trim();
  if (!cleanId) {
    return callback(null, 'General');
  }

  db.get(
    'SELECT Department FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    [cleanId],
    (err, row) => {
      if (err || !row || !row.Department) {
        // Fallback check in admin_dep
        db.get(
          'SELECT Department FROM admin_dep WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
          [cleanId],
          (dErr, dRow) => {
            const dept = (dRow && dRow.Department) ? dRow.Department : 'General';
            callback(null, dept);
          }
        );
      } else {
        callback(null, row.Department);
      }
    }
  );
}

/**
 * Get full storage directory path for a faculty member: SREC/{Department}/{Staff_ID}/
 */
export function getFacultyStorageDir(staffId, deptName) {
  const cleanId = (staffId || 'UNKNOWN').toString().trim();
  const canonicalDept = getCanonicalDepartmentFolder(deptName || 'General');
  const dirPath = path.join(SREC_ROOT, canonicalDept, cleanId);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
}

/**
 * Format file name to always start with {staff_id}_
 */
export function formatFacultyFileName(staffId, originalName) {
  const cleanId = (staffId || 'FACULTY').toString().trim();
  const cleanOriginal = (originalName || 'file')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  // If already starts with staffId_, avoid duplicating prefix
  if (cleanOriginal.startsWith(`${cleanId.toLowerCase()}_`)) {
    return `${Date.now()}-${cleanOriginal}`;
  }

  return `${cleanId}_${Date.now()}-${cleanOriginal}`;
}

/**
 * Move a faculty member's physical directory from old department to new department
 */
export function moveFacultyDirectory(staffId, oldDept, newDept, callback) {
  const cleanId = (staffId || '').toString().trim();
  if (!cleanId) {
    if (callback) callback(null, false);
    return;
  }

  const oldCanonical = getCanonicalDepartmentFolder(oldDept || 'General');
  const newCanonical = getCanonicalDepartmentFolder(newDept || 'General');

  const oldDeptClean = sanitizeName(oldDept || 'General');
  const newDeptClean = sanitizeName(newDept || 'General');

  // Candidate source directory paths to search
  const oldCandidatePaths = [
    path.join(SREC_ROOT, oldCanonical, cleanId),
    path.join(SREC_ROOT, oldDeptClean, cleanId),
    path.join(SREC_ROOT, (oldDept || '').toString().trim(), cleanId)
  ];

  let actualOldDirPath = null;
  for (const p of oldCandidatePaths) {
    if (fs.existsSync(p)) {
      actualOldDirPath = p;
      break;
    }
  }

  const newDeptParent = path.join(SREC_ROOT, newCanonical);
  const newDirPath = path.join(newDeptParent, cleanId);

  if (!fs.existsSync(newDeptParent)) {
    fs.mkdirSync(newDeptParent, { recursive: true });
  }

  if (actualOldDirPath && actualOldDirPath !== newDirPath) {
    try {
      if (fs.existsSync(newDirPath)) {
        const files = fs.readdirSync(actualOldDirPath);
        files.forEach(file => {
          const src = path.join(actualOldDirPath, file);
          const dest = path.join(newDirPath, file);
          fs.renameSync(src, dest);
        });
        fs.rmdirSync(actualOldDirPath);
      } else {
        fs.renameSync(actualOldDirPath, newDirPath);
      }
      console.log(`[Directory Move] Moved ${actualOldDirPath} -> ${newDirPath}`);
    } catch (e) {
      console.error(`[Directory Move Error] Failed to move ${actualOldDirPath} to ${newDirPath}:`, e.message);
    }
  } else {
    if (!fs.existsSync(newDirPath)) {
      fs.mkdirSync(newDirPath, { recursive: true });
    }
  }

  // Remap paths in DB tables across all potential source variants
  const oldVariants = Array.from(new Set([oldCanonical, oldDeptClean, (oldDept || '').toString().trim()]));
  remapDbFilePaths(cleanId, oldVariants, newCanonical, () => {
    if (callback) callback(null, true);
  });
}

/**
 * Update DB file path references across all 18 evidence and activity tables
 */
export function remapDbFilePaths(staffId, oldDepts, newDept, callback) {
  const oldDeptList = Array.isArray(oldDepts) ? oldDepts : [oldDepts];
  const newCanonical = getCanonicalDepartmentFolder(newDept);
  const newSegment = `SREC/${newCanonical}/${staffId}`;

  const tables = [
    { name: 'staff_user', col: 'file' },
    { name: 'staff_personal', col: 'pan_file' },
    { name: 'staff_personal', col: 'aadhar_file' },
    { name: 'staff_personal', col: 'appointment_order_file' },
    { name: 'staff_personal', col: 'joining_report_file' },
    { name: 'staff_edu', col: 'file' },
    { name: 'staff_interaction', col: 'file' },
    { name: 'staff_publication', col: 'file' },
    { name: 'staff_book_published', col: 'file' },
    { name: 'staff_resource', col: 'file' },
    { name: 'staff_award', col: 'file' },
    { name: 'staff_funding', col: 'file' },
    { name: 'staff_ipr', col: 'file' },
    { name: 'staff_certificate', col: 'file' },
    { name: 'staff_competitive', col: 'file' },
    { name: 'staff_scholars', col: 'file' },
    { name: 'staff_club', col: 'file' },
    { name: 'staff_event_organized', col: 'file' },
    { name: 'staff_seed_money', col: 'file' },
    { name: 'staff_pan', col: 'path1' },
    { name: 'staff_aadhar', col: 'path1' }
  ];

  let totalQueries = tables.length * oldDeptList.length;
  let done = 0;

  oldDeptList.forEach(oldD => {
    const oldSegment = `SREC/${oldD}/${staffId}`;
    tables.forEach(({ name, col }) => {
      const query = `
        UPDATE ${name} 
        SET ${col} = REPLACE(${col}, ?, ?) 
        WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND ${col} IS NOT NULL AND ${col} LIKE ?
      `;
      db.run(query, [oldSegment, newSegment, staffId, `%${oldSegment}%`], (err) => {
        done++;
        if (done === totalQueries && callback) {
          callback();
        }
      });
    });
  });
}

/**
 * Dynamic lookup function to resolve a file across SREC/ and legacy uploads/ directories
 */
export function findFileInSrecOrUploads(filename) {
  if (!filename) return null;
  const rawPath = filename.toString().trim().split('?')[0];
  const cleanName = path.basename(rawPath);

  // 1. Check legacy uploads folders first
  const legacyPaths = [
    path.resolve(__dirname, '../uploads/document', cleanName),
    path.resolve(__dirname, '../uploads/upload', cleanName),
    path.resolve(__dirname, '../uploads', cleanName)
  ];

  for (const p of legacyPaths) {
    if (fs.existsSync(p)) return p;
  }

  // 2. Search SREC_ROOT recursively
  function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const result = searchDirectory(fullPath);
          if (result) return result;
        } else if (entry.isFile() && entry.name.toLowerCase() === cleanName.toLowerCase()) {
          return fullPath;
        }
      }
    } catch (e) {
      // Ignore reading errors
    }
    return null;
  }

  return searchDirectory(SREC_ROOT);
}

/**
 * Migration helper to move legacy files from uploads/ into SREC/{Department}/{Staff_ID}/
 */
export function migrateExistingUploads() {
  const legacyDir = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(legacyDir)) return;

  db.all('SELECT staff_id, Department FROM staff_academics', [], (err, staffRows) => {
    if (err || !staffRows) return;

    const deptMap = {};
    staffRows.forEach(row => {
      if (row.staff_id && row.Department) {
        deptMap[row.staff_id.trim().toLowerCase()] = row.Department.trim();
      }
    });

    const subDirs = ['document', 'upload'];
    subDirs.forEach(sub => {
      const targetSubDir = path.join(legacyDir, sub);
      if (fs.existsSync(targetSubDir)) {
        const files = fs.readdirSync(targetSubDir);
        files.forEach(file => {
          const srcPath = path.join(targetSubDir, file);
          if (!fs.statSync(srcPath).isFile()) return;

          // Attempt to extract staff ID from filename if present (e.g. TE1024_... or faculty123_...)
          let matchedStaffId = null;
          let matchedDept = 'General';

          for (const sId of Object.keys(deptMap)) {
            if (file.toLowerCase().includes(sId)) {
              matchedStaffId = sId;
              matchedDept = deptMap[sId];
              break;
            }
          }

          if (!matchedStaffId) {
            // Default to faculty123 if unassigned
            matchedStaffId = 'faculty123';
            matchedDept = deptMap['faculty123'] || 'Information Technology';
          }

          const targetDir = getFacultyStorageDir(matchedStaffId, matchedDept);
          
          // Ensure filename starts with staffId_
          const formattedName = file.toLowerCase().startsWith(`${matchedStaffId.toLowerCase()}_`)
            ? file
            : `${matchedStaffId}_${file}`;

          const destPath = path.join(targetDir, formattedName);
          try {
            if (!fs.existsSync(destPath)) {
              fs.copyFileSync(srcPath, destPath);
            }
          } catch (e) {
            console.error(`Migration error copying ${file}:`, e.message);
          }
        });
      }
    });
  });
}

/**
 * Ensure storage directories exist for ALL faculty members in the database
 */
export function ensureAllFacultyDirectoriesExist(callback) {
  db.all(
    `SELECT sa.staff_id, sa.Department 
     FROM staff_academics sa 
     UNION 
     SELECT su.staff_id, 'General' as Department 
     FROM staff_user su 
     WHERE su.staff_id NOT IN (SELECT staff_id FROM staff_academics WHERE staff_id IS NOT NULL)`,
    [],
    (err, rows) => {
      if (err || !rows) {
        if (callback) callback(err);
        return;
      }
      let count = 0;
      rows.forEach(row => {
        if (row.staff_id) {
          const dir = getFacultyStorageDir(row.staff_id, row.Department || 'General');
          if (dir) count++;
        }
      });
      console.log(`[Faculty Storage] Verified/Created storage directories for ${count} faculty members.`);
      if (callback) callback(null, count);
    }
  );
}

// Auto-run directory check on module import
setTimeout(() => {
  ensureAllFacultyDirectoriesExist();
}, 2000);

/**
 * Zip directory using native zip CLI on macOS or fallback
 */
export function zipDirectory(sourceDir, zipFilePath) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Directory not found: ${sourceDir}`);
  }

  // Remove existing zip file if present
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  const parentDir = path.dirname(sourceDir);
  const folderName = path.basename(sourceDir);

  try {
    // macOS built-in zip command
    execSync(`cd "${parentDir}" && zip -r "${zipFilePath}" "${folderName}"`, { stdio: 'ignore' });
    return zipFilePath;
  } catch (e) {
    console.error('Failed to create zip archive using zip command:', e);
    throw new Error('Zip archive creation failed');
  }
}
