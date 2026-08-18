import db from '../db.js';
import { calculateTextSimilarity } from './duplicateDetector.js';

/**
 * Normalizes author name by removing honorifics, academic titles, dots, and excess whitespace
 */
export function normalizeAuthorName(name) {
  if (!name) return '';
  return name.toString()
    .toLowerCase()
    .replace(/\b(dr|prof|mr|mrs|ms|er|ph\.?d|doctor|professor)\b\.?/gi, '')
    .replace(/[^a-z\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits standard author strings (e.g. "Dr. R. Brindha, John Doe and A. Kumar") into individual author tokens
 */
export function parseAuthorList(rawAuthors) {
  if (!rawAuthors) return [];
  if (Array.isArray(rawAuthors)) return rawAuthors.map(a => typeof a === 'string' ? a.trim() : a.name || `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean);

  return rawAuthors
    .split(/[,;\n]|(?:\sand\s)/i)
    .map(a => a.trim())
    .filter(a => a.length > 1);
}

/**
 * Matches a list of authors against all SREC faculty members
 * READ-ONLY operation - returns matched suggestions and confidence scores
 */
export async function matchInternalCoAuthors(authorsInput, crossRefAuthors = [], currentStaffId = '') {
  // Fetch all active faculty members from database
  const facultyList = await new Promise((resolve) => {
    const query = `
      SELECT 
        p.staff_id, 
        p.staff_name, 
        p.email, 
        a.Department, 
        a.Designation, 
        a.orcid_id, 
        a.scopus_id, 
        a.wos_id 
      FROM staff_personal p
      LEFT JOIN staff_academics a ON p.staff_id COLLATE utf8mb4_unicode_ci = a.staff_id COLLATE utf8mb4_unicode_ci
      WHERE p.staff_id IS NOT NULL AND p.staff_id != ''
    `;
    db.all(query, [], (err, rows) => resolve(rows || []));
  });

  const parsedAuthors = parseAuthorList(authorsInput);
  const matchedResults = [];

  // Combine raw text author list and CrossRef metadata objects
  const authorEntries = [];
  parsedAuthors.forEach((name, idx) => {
    authorEntries.push({
      originalName: name,
      index: idx + 1,
      orcid: crossRefAuthors[idx]?.ORCID || crossRefAuthors[idx]?.orcid || null,
      email: crossRefAuthors[idx]?.email || null,
      scopusId: crossRefAuthors[idx]?.scopusId || null,
      wosId: crossRefAuthors[idx]?.wosId || null
    });
  });

  for (const author of authorEntries) {
    const cleanAuthName = normalizeAuthorName(author.originalName);
    const authParts = cleanAuthName.split(' ').filter(Boolean);

    let bestMatch = null;
    let highestScore = 0;
    let matchType = 'external';

    for (const fac of facultyList) {
      const cleanFacName = normalizeAuthorName(fac.staff_name);
      const facParts = cleanFacName.split(' ').filter(Boolean);

      // Signal 1: ORCID Match (Strongest - 100%)
      if (author.orcid && fac.orcid_id && fac.orcid_id.trim() && author.orcid.includes(fac.orcid_id.trim())) {
        bestMatch = fac;
        highestScore = 1.0;
        matchType = 'orcid_match';
        break;
      }

      // Signal 2: Scopus Author ID Match (98%)
      if (author.scopusId && fac.scopus_id && fac.scopus_id.trim() && author.scopusId.toString().includes(fac.scopus_id.trim())) {
        if (0.98 > highestScore) {
          bestMatch = fac;
          highestScore = 0.98;
          matchType = 'scopus_id';
        }
      }

      // Signal 3: ResearcherID / Web of Science ID Match (98%)
      if (author.wosId && fac.wos_id && fac.wos_id.trim() && author.wosId.toString().includes(fac.wos_id.trim())) {
        if (0.98 > highestScore) {
          bestMatch = fac;
          highestScore = 0.98;
          matchType = 'wos_id';
        }
      }

      // Signal 4: Institutional Email Match (95%)
      if (author.email && fac.email && author.email.trim().toLowerCase() === fac.email.trim().toLowerCase()) {
        if (0.95 > highestScore) {
          bestMatch = fac;
          highestScore = 0.95;
          matchType = 'institutional_email';
        }
      }

      // Signal 5: Exact Normalized Name Match (95%)
      if (cleanAuthName && cleanFacName && cleanAuthName === cleanFacName) {
        if (0.95 > highestScore) {
          bestMatch = fac;
          highestScore = 0.95;
          matchType = 'exact_name';
        }
      }

      // Signal 6: Initial + Surname / Reverse Name Match (e.g. "R. Brindha" <-> "Brindha R" or "Brindha, R.") (90%)
      if (authParts.length >= 2 && facParts.length >= 2) {
        const authFirst = authParts[0];
        const authLast = authParts[authParts.length - 1];
        const facFirst = facParts[0];
        const facLast = facParts[facParts.length - 1];

        const matchForward = (authFirst === facFirst || authFirst[0] === facFirst[0]) && (authLast === facLast);
        const matchReverse = (authFirst === facLast || authFirst[0] === facLast[0]) && (authLast === facFirst);

        if ((matchForward || matchReverse) && 0.90 > highestScore) {
          bestMatch = fac;
          highestScore = 0.90;
          matchType = 'initial_surname';
        }
      }

      // Signal 7: Fuzzy / Token Overlap Match (75% - Requires explicit confirmation)
      const similarity = calculateTextSimilarity(cleanAuthName, cleanFacName);
      if (similarity >= 0.78 && similarity > highestScore) {
        bestMatch = fac;
        highestScore = Math.min(0.75, similarity);
        matchType = 'fuzzy_name';
      }
    }

    if (bestMatch && highestScore >= 0.70) {
      const isCurrent = (bestMatch.staff_id || '').toLowerCase() === (currentStaffId || '').toLowerCase();
      matchedResults.push({
        originalAuthor: author.originalName,
        isSrecFaculty: true,
        staffId: bestMatch.staff_id,
        staffName: bestMatch.staff_name,
        department: bestMatch.Department || 'Engineering',
        designation: bestMatch.Designation || 'Faculty',
        matchConfidence: Math.round(highestScore * 100),
        matchType,
        isCurrentUser: isCurrent,
        // High confidence (>= 90%) is marked likely; fuzzy (< 90%) requires explicit confirmation
        isConfirmed: highestScore >= 0.90,
        needsConfirmation: highestScore < 0.90
      });
    } else {
      matchedResults.push({
        originalAuthor: author.originalName,
        isSrecFaculty: false,
        staffId: null,
        staffName: author.originalName,
        department: null,
        designation: null,
        matchConfidence: 0,
        matchType: 'external_author',
        isCurrentUser: false,
        isConfirmed: true,
        needsConfirmation: false
      });
    }
  }

  return matchedResults;
}

/**
 * Links an SREC faculty member to an existing master publication in publication_authors
 */
export async function linkFacultyToPublication(publicationId, staffId, staffName, authorPosition = 'Co-Author', matchType = 'manual_link') {
  if (!publicationId || !staffId) {
    throw new Error('Publication ID and Staff ID are required for co-author linking.');
  }

  return new Promise((resolve, reject) => {
    // Check if link already exists
    db.get(
      'SELECT id FROM publication_authors WHERE publication_id = ? AND LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
      [publicationId, staffId],
      (err, existing) => {
        if (err) return reject(err);
        if (existing) {
          return resolve({ success: true, alreadyLinked: true, linkId: existing.id });
        }

        db.run(
          `INSERT INTO publication_authors (publication_id, staff_id, staff_name, author_position, author_order, is_confirmed, match_type) 
           VALUES (?, ?, ?, ?, 1, 1, ?)`,
          [publicationId, staffId, staffName || '', authorPosition || 'Co-Author', matchType],
          function (insErr) {
            if (insErr) return reject(insErr);
            resolve({ success: true, linkId: this.lastID });
          }
        );
      }
    );
  });
}

/**
 * Fetches all linked internal SREC faculty co-authors for a given publication
 */
export async function getLinkedPublicationAuthors(publicationId) {
  if (!publicationId) return [];

  return new Promise((resolve) => {
    const query = `
      SELECT 
        pa.id as link_id, 
        pa.publication_id, 
        pa.staff_id, 
        pa.staff_name, 
        pa.author_position, 
        pa.match_type, 
        pa.is_confirmed,
        a.Department, 
        a.Designation 
      FROM publication_authors pa
      LEFT JOIN staff_academics a ON pa.staff_id COLLATE utf8mb4_unicode_ci = a.staff_id COLLATE utf8mb4_unicode_ci
      WHERE pa.publication_id = ?
      ORDER BY pa.author_order ASC, pa.id ASC
    `;
    db.all(query, [publicationId], (err, rows) => resolve(rows || []));
  });
}
