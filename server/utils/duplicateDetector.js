import db from '../db.js';
import path from 'path';

/**
 * Normalizes strings for robust similarity comparisons
 */
export function normalizeText(str) {
  if (!str) return '';
  return str.toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate simple Dice/Levenshtein similarity between two strings (0.0 to 1.0)
 */
export function calculateTextSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return (intersection.size * 2) / (words1.size + words2.size);
}

/**
 * Level 1: Document-Level Duplicate Detection
 * Checks fileHash, fileSize, and filename across faculty's own files AND cross-faculty shared files
 */
export async function checkDocumentDuplicate(fileHash, originalFilename, fileSize, currentStaffId) {
  if (!fileHash) return { isDuplicate: false, isDefinite: false, isPossible: false };

  const activityTables = [
    { table: 'staff_interaction', label: 'Interaction / FDP' },
    { table: 'staff_publication', label: 'Publication' },
    { table: 'staff_award', label: 'Award' },
    { table: 'staff_funding', label: 'Research Funding' },
    { table: 'staff_ipr', label: 'Patent / IPR' },
    { table: 'staff_certificate', label: 'Online Certification' },
    { table: 'staff_event_organized', label: 'Event Organized' },
    { table: 'staff_member', label: 'Professional Membership' },
    { table: 'staff_seed_money', label: 'Seed Money / Consultancy' },
    { table: 'staff_resource', label: 'Resource Person' },
    { table: 'staff_book_published', label: 'Book Published' },
    { table: 'staff_scholars', label: 'Research Scholar' }
  ];

  // 1. Check in document_ai_processing audit table first
  const aiAuditMatches = await new Promise((resolve) => {
    db.all(
      'SELECT staff_id, original_filename, saved_filename, activity_type, created_at FROM document_ai_processing WHERE file_hash = ? ORDER BY id DESC LIMIT 5',
      [fileHash],
      (err, rows) => resolve(rows || [])
    );
  });

  if (aiAuditMatches.length > 0) {
    const ownMatch = aiAuditMatches.find(m => (m.staff_id || '').toLowerCase() === (currentStaffId || '').toLowerCase());
    if (ownMatch) {
      return {
        isDuplicate: true,
        isDefinite: true,
        isPossible: false,
        duplicateType: 'exact_hash_own',
        isCrossFaculty: false,
        confidence: 1.0,
        matchedFilename: ownMatch.original_filename || ownMatch.saved_filename,
        matchedActivity: ownMatch.activity_type || 'Activity Record',
        uploadedAt: ownMatch.created_at,
        message: `Identical document previously uploaded to your profile as "${ownMatch.original_filename || ownMatch.saved_filename}".`
      };
    }

    const otherMatch = aiAuditMatches[0];
    return {
      isDuplicate: true,
      isDefinite: false,
      isPossible: true,
      duplicateType: 'exact_hash_cross_faculty',
      isCrossFaculty: true,
      confidence: 0.95,
      matchedFilename: otherMatch.original_filename,
      matchedActivity: otherMatch.activity_type || 'Shared Event / Activity',
      uploadedAt: otherMatch.created_at,
      message: 'Possible shared/duplicate document detected. An identical document was previously uploaded in SREC FIS.'
    };
  }

  // 2. Check across activity tables by file_hash
  for (const item of activityTables) {
    const rows = await new Promise((resolve) => {
      db.all(
        `SELECT id, staff_id, file, date FROM ${item.table} WHERE file_hash = ? LIMIT 2`,
        [fileHash],
        (err, r) => resolve(r || [])
      );
    });

    if (rows && rows.length > 0) {
      const ownRow = rows.find(r => (r.staff_id || '').toLowerCase() === (currentStaffId || '').toLowerCase());
      if (ownRow) {
        return {
          isDuplicate: true,
          isDefinite: true,
          isPossible: false,
          duplicateType: 'exact_hash_own',
          isCrossFaculty: false,
          confidence: 1.0,
          matchedFilename: ownRow.file,
          matchedActivity: item.label,
          matchedRecordId: ownRow.id,
          message: `Identical document already attached to your existing ${item.label} record.`
        };
      } else {
        return {
          isDuplicate: true,
          isDefinite: false,
          isPossible: true,
          duplicateType: 'exact_hash_cross_faculty',
          isCrossFaculty: true,
          confidence: 0.95,
          matchedFilename: rows[0].file,
          matchedActivity: item.label,
          message: `Possible shared/duplicate document detected. A matching document exists in ${item.label}.`
        };
      }
    }
  }

  return { isDuplicate: false, isDefinite: false, isPossible: false };
}

/**
 * Level 2: Record-Level Duplicate Detection (Definite vs Possible Duplicate)
 */
export async function checkRecordDuplicate(category, fields, staffId) {
  if (!category || !fields) return { isDuplicate: false, isDefinite: false, isPossible: false };

  const cleanStaffId = (staffId || '').toString().trim().toLowerCase();

  // 1. Publications: DOI is the primary strong unique identifier (DEFINITE DUPLICATE)
  if (category === 'publications' || fields.doi) {
    const rawDoi = (fields.doi || '').trim();
    if (rawDoi && rawDoi.includes('/')) {
      const cleanDoi = rawDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').replace(/^doi:\s*/i, '').trim();

      const existingPubs = await new Promise((resolve) => {
        db.all(
          'SELECT p.*, a.Department FROM staff_publication p LEFT JOIN staff_academics a ON p.staff_id COLLATE utf8mb4_unicode_ci = a.staff_id COLLATE utf8mb4_unicode_ci WHERE LOWER(TRIM(p.doi)) = LOWER(TRIM(?)) OR LOWER(TRIM(p.doi)) LIKE ?',
          [cleanDoi, `%${cleanDoi}%`],
          (err, rows) => resolve(rows || [])
        );
      });

      if (existingPubs.length > 0) {
        const ownPub = existingPubs.find(p => (p.staff_id || '').toLowerCase() === cleanStaffId);
        if (ownPub) {
          return {
            isDuplicate: true,
            isDefinite: true,
            isPossible: false,
            duplicateType: 'doi_exact_own',
            isCrossFaculty: false,
            existingRecord: ownPub,
            message: `Duplicate record detected: This publication (DOI: ${cleanDoi}) is already recorded in your profile.`
          };
        }

        // Another faculty registered this DOI in SREC FIS
        const masterPub = existingPubs[0];
        return {
          isDuplicate: true,
          isDefinite: true,
          isPossible: false,
          duplicateType: 'doi_cross_faculty',
          isCrossFaculty: true,
          existingRecord: masterPub,
          ownerStaffId: masterPub.staff_id,
          ownerStaffName: masterPub.staff_name,
          ownerDepartment: masterPub.Department,
          message: `This publication (DOI: ${cleanDoi}) already exists in SREC FIS (Registered by ${masterPub.staff_name || masterPub.staff_id}). Would you like to link it to your profile?`
        };
      }
    }
  }

  // 2. Patents (IPR): Application number matching (DEFINITE DUPLICATE)
  if (category === 'ipr' && fields.institution) {
    const cleanAppNo = fields.institution.trim().toLowerCase();
    if (cleanAppNo.length >= 6) {
      const existingPatents = await new Promise((resolve) => {
        db.all(
          'SELECT * FROM staff_ipr WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND LOWER(TRIM(institution)) = LOWER(TRIM(?))',
          [cleanStaffId, cleanAppNo],
          (err, rows) => resolve(rows || [])
        );
      });
      if (existingPatents.length > 0) {
        return {
          isDuplicate: true,
          isDefinite: true,
          isPossible: false,
          duplicateType: 'patent_app_exact_own',
          isCrossFaculty: false,
          existingRecord: existingPatents[0],
          message: `Duplicate record detected: A patent with Application No. "${fields.institution}" is already recorded in your profile.`
        };
      }
    }
  }

  // 3. Funding / Grants: Sanction reference number matching (DEFINITE DUPLICATE)
  if (category === 'funding' && fields.referenceno) {
    const cleanRefNo = fields.referenceno.trim().toLowerCase();
    if (cleanRefNo.length >= 5) {
      const existingGrants = await new Promise((resolve) => {
        db.all(
          'SELECT * FROM staff_funding WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND LOWER(TRIM(referenceno)) = LOWER(TRIM(?))',
          [cleanStaffId, cleanRefNo],
          (err, rows) => resolve(rows || [])
        );
      });
      if (existingGrants.length > 0) {
        return {
          isDuplicate: true,
          isDefinite: true,
          isPossible: false,
          duplicateType: 'grant_ref_exact_own',
          isCrossFaculty: false,
          existingRecord: existingGrants[0],
          message: `Duplicate record detected: A research grant with Sanction Order No. "${fields.referenceno}" is already recorded in your profile.`
        };
      }
    }
  }

  // 4. Professional Memberships: Membership ID matching (DEFINITE DUPLICATE)
  if (category === 'memberships' && fields.membershipid && fields.organization) {
    const cleanMemId = fields.membershipid.trim().toLowerCase();
    const cleanOrg = fields.organization.trim().toLowerCase();
    if (cleanMemId.length >= 4) {
      const existingMems = await new Promise((resolve) => {
        db.all(
          'SELECT * FROM staff_member WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND LOWER(TRIM(membershipid)) = LOWER(TRIM(?)) AND LOWER(TRIM(organization)) = LOWER(TRIM(?))',
          [cleanStaffId, cleanMemId, cleanOrg],
          (err, rows) => resolve(rows || [])
        );
      });
      if (existingMems.length > 0) {
        return {
          isDuplicate: true,
          isDefinite: true,
          isPossible: false,
          duplicateType: 'membership_id_exact_own',
          isCrossFaculty: false,
          existingRecord: existingMems[0],
          message: `Duplicate record detected: A ${fields.organization} membership with ID "${fields.membershipid}" is already recorded in your profile.`
        };
      }
    }
  }

  // 5. Generic Activities: Semantic similarity on Title + Dates (POSSIBLE DUPLICATE WARNING)
  const tableConfigMap = {
    interactions: { table: 'staff_interaction', titleCol: 'title', orgCol: 'organizer', dateCol: 'from_date' },
    certifications: { table: 'staff_certificate', titleCol: 'course_name', orgCol: 'organisation', dateCol: 'data_of_exam' },
    awards: { table: 'staff_award', titleCol: 'awardname', orgCol: 'awardby', dateCol: 'awa_date' },
    funding: { table: 'staff_funding', titleCol: 'title', orgCol: 'fa', dateCol: 'referenceno' },
    ipr: { table: 'staff_ipr', titleCol: 'patent', orgCol: 'institution', dateCol: 'generation' },
    events: { table: 'staff_event_organized', titleCol: 'title', orgCol: 'organizer', dateCol: 'from_date' },
    memberships: { table: 'staff_member', titleCol: 'organization', orgCol: 'membershipid', dateCol: 'membership_type' },
    resource: { table: 'staff_resource', titleCol: 'title', orgCol: 'organizer', dateCol: 'from_date' }
  };

  const cfg = tableConfigMap[category];
  if (!cfg) return { isDuplicate: false, isDefinite: false, isPossible: false };

  const inputTitle = fields[cfg.titleCol] || fields.title || '';
  if (!inputTitle || inputTitle.trim().length < 5) return { isDuplicate: false, isDefinite: false, isPossible: false };

  const existingRows = await new Promise((resolve) => {
    db.all(
      `SELECT * FROM ${cfg.table} WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))`,
      [cleanStaffId],
      (err, rows) => resolve(rows || [])
    );
  });

  for (const row of existingRows) {
    const rowTitle = row[cfg.titleCol] || row.title || '';
    const sim = calculateTextSimilarity(inputTitle, rowTitle);

    // High semantic similarity warning (does not block save - faculty can decide)
    if (sim >= 0.88) {
      return {
        isDuplicate: true,
        isDefinite: false,
        isPossible: true,
        duplicateType: 'similar_record_own',
        isCrossFaculty: false,
        confidence: sim,
        existingRecord: row,
        message: `Possible duplicate detected: A very similar ${category} record ("${rowTitle}") exists in your profile. Please verify before saving.`
      };
    }
  }

  return { isDuplicate: false, isDefinite: false, isPossible: false };
}
