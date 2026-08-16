import db from './db.js';

/**
 * Handles all background updates when a faculty member's salutation changes to Dr. or Ph.D details are saved:
 * 1. Updates staff_academics.Qualification = 'Ph.D' and staff_name with Dr. prefix
 * 2. Updates staff_personal.staff_name with Dr. prefix
 * 3. Updates staff_user.staff_name with Dr. prefix
 * 4. Upserts staff_edu with category='Ph.D', degree='Ph.D', completion year & institute
 * 5. Updates staff_scholars records for this faculty to status='Degree Awarded', reflecting for internal supervisors
 */
export const processDoctoratePromotion = (staffId, newStaffName, phdDetails = {}, callback) => {
  if (!staffId) {
    if (callback) callback();
    return;
  }

  const cleanStaffId = String(staffId).trim();
  const nameStr = String(newStaffName || '').trim();
  const isDoctorate = nameStr.toLowerCase().startsWith('dr.') || 
                      nameStr.toLowerCase().startsWith('dr ') || 
                      nameStr.toLowerCase().startsWith('dr') ||
                      Boolean(phdDetails && (phdDetails.phd_completion_month_year || phdDetails.year || phdDetails.phd_year));

  if (!isDoctorate) {
    if (callback) callback();
    return;
  }

  const completionYearMonth = phdDetails?.phd_completion_month_year || phdDetails?.year || phdDetails?.phd_year || new Date().toISOString().slice(0, 7);
  const university = phdDetails?.phd_university || phdDetails?.university || phdDetails?.institute || 'Anna University';
  const specialization = phdDetails?.phd_specialization || phdDetails?.specialization || '';

  // 1. Update staff_academics Qualification to 'Ph.D' and staff_name
  db.run(
    `UPDATE staff_academics SET Qualification = 'Ph.D', staff_name = COALESCE(NULLIF(?, ''), staff_name) WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))`,
    [nameStr, cleanStaffId],
    (aErr) => {
      if (aErr) console.error('Doctorate Helper - Error updating staff_academics:', aErr);

      // 2. Update staff_personal staff_name
      db.run(
        `UPDATE staff_personal SET staff_name = COALESCE(NULLIF(?, ''), staff_name) WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))`,
        [nameStr, cleanStaffId],
        (pErr) => {
          if (pErr) console.error('Doctorate Helper - Error updating staff_personal:', pErr);

          // 3. Update staff_user staff_name
          db.run(
            `UPDATE staff_user SET staff_name = COALESCE(NULLIF(?, ''), staff_name) WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))`,
            [nameStr, cleanStaffId],
            (uErr) => {
              if (uErr) console.error('Doctorate Helper - Error updating staff_user:', uErr);

              // 4. Upsert Ph.D degree into staff_edu
              db.get(
                `SELECT id FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND (LOWER(category) LIKE '%ph.d%' OR LOWER(degree) LIKE '%ph.d%' OR LOWER(category) LIKE '%phd%')`,
                [cleanStaffId],
                (eduErr, existingEdu) => {
                  if (existingEdu) {
                    db.run(
                      `UPDATE staff_edu SET year = ?, institute = ?, board = ?, specialization = COALESCE(NULLIF(?, ''), specialization), degree = 'Ph.D', category = 'Ph.D' WHERE id = ?`,
                      [completionYearMonth, university, university, specialization, existingEdu.id]
                    );
                  } else {
                    db.run(
                      `INSERT INTO staff_edu (staff_id, category, degree, specialization, institute, board, year, percentage) VALUES (?, 'Ph.D', 'Ph.D', ?, ?, ?, ?, NULL)`,
                      [cleanStaffId, specialization, university, university, completionYearMonth]
                    );
                  }

                  // 5. Update staff_scholars status to 'Degree Awarded' & completion date
                  db.run(
                    `UPDATE staff_scholars 
                     SET status = 'Degree Awarded', date = ?, registration_year = COALESCE(NULLIF(registration_year, ''), ?)
                     WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) 
                        OR (staff_name IS NOT NULL AND LOWER(REPLACE(REPLACE(REPLACE(REPLACE(staff_name, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')) = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(?, 'Dr.', ''), 'Dr', ''), '.', ''), ' ', '')))`,
                    [completionYearMonth, completionYearMonth, cleanStaffId, nameStr],
                    (schErr) => {
                      if (schErr) console.error('Doctorate Helper - Error updating staff_scholars:', schErr);
                      if (callback) callback();
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
