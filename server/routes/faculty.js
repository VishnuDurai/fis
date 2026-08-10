import express from 'express';
import multer from 'multer';
import path from 'path';
import nodemailer from 'nodemailer';
import db from '../db.js';
import { authenticateToken } from './auth.js';
import { calculateExperience, getHighestQualification } from './admin.js';
import { getFacultyStorageDir, formatFacultyFileName, getFacultyDepartment } from '../utils/fileStorage.js';

const router = express.Router();

// 0. GET Faculty Personal Stats
router.get('/stats', authenticateToken, (req, res) => {
  const staffId = req.query.staffId || req.user.staffId;

  const queries = {
    publications: 'SELECT COUNT(*) as count FROM staff_publication WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    books: 'SELECT COUNT(*) as count FROM staff_book_published WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    awards: 'SELECT COUNT(*) as count FROM staff_award WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    memberships: 'SELECT COUNT(*) as count FROM staff_member WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    resource: 'SELECT COUNT(*) as count FROM staff_resource WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    funding: 'SELECT COUNT(*) as count FROM staff_funding WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    ipr: 'SELECT COUNT(*) as count FROM staff_ipr WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    certifications: 'SELECT COUNT(*) as count FROM staff_certificate WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    events: 'SELECT COUNT(*) as count FROM staff_event_organized WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))',
    responsibilities: 'SELECT COUNT(*) as count FROM staff_responsibilities WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) OR LOWER(TRIM(staff_id)) IN (SELECT LOWER(TRIM(staff_name)) FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)))'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    const params = key === 'responsibilities' ? [staffId, staffId] : [staffId];
    db.get(sql, params, (err, row) => {
      results[key] = row ? row.count : 0;
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// 0b. GET Faculty Notifications & Pending Action Items
router.get('/notifications', authenticateToken, (req, res) => {
  const staffId = req.query.staffId || req.user.staffId;

  db.get('SELECT * FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (pErr, personal) => {
    db.all('SELECT * FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (eErr, edu) => {
      db.get('SELECT COUNT(*) as pubCount FROM staff_publication WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (pubErr, pubRow) => {
        const notifications = [];

        if (!personal || !personal.pan_file) {
          notifications.push({ id: 'pan_proof', type: 'warning', title: 'PAN Card Proof Missing', message: 'Please upload your PAN card document proof in Personal Details.', link: '/profile/personal' });
        }
        if (!personal || !personal.aadhar_file) {
          notifications.push({ id: 'aadhar_proof', type: 'warning', title: 'Aadhaar Card Proof Missing', message: 'Please upload your Aadhaar card document proof in Personal Details.', link: '/profile/personal' });
        }
        if (!personal || !personal.dob || !personal.address) {
          notifications.push({ id: 'personal_info', type: 'info', title: 'Complete Personal Profile', message: 'Some personal details (DOB / Address) are incomplete.', link: '/profile/personal' });
        }
        if (!edu || edu.length === 0) {
          notifications.push({ id: 'edu_info', type: 'info', title: 'Add Qualification History', message: 'No education history records found. Please add your UG/PG/Ph.D. details.', link: '/profile/education' });
        }
        if (!pubRow || pubRow.pubCount === 0) {
          notifications.push({ id: 'pub_info', type: 'system', title: 'Research Publications', message: 'Remember to log your recent journal and conference publications.', link: '/activities/publications' });
        }

        notifications.push({
          id: 'appraisal_notice',
          type: 'success',
          title: 'Annual Performance Appraisal',
          message: 'Academic Year Performance Appraisal portal is active for submission.',
          link: '/appraisal'
        });

        res.json({
          unreadCount: notifications.filter(n => n.type === 'warning' || n.type === 'info').length,
          notifications
        });
      });
    });
  });
});

// 0c. GET Aggregated Faculty Profile CV Data
router.get('/cv-data', authenticateToken, (req, res) => {
  const staffId = req.query.staffId || req.user.staffId;

  db.get('SELECT * FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (pErr, personal) => {
    db.get('SELECT * FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (aErr, academics) => {
      db.all('SELECT * FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) ORDER BY year DESC', [staffId], (eErr, education) => {
        db.all('SELECT * FROM staff_publication WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) ORDER BY id DESC', [staffId], (pubErr, publications) => {
          db.all('SELECT * FROM staff_book_published WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (bErr, books) => {
            db.all('SELECT * FROM staff_funding WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (fErr, funding) => {
              db.all('SELECT * FROM staff_ipr WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (iprErr, ipr) => {
                db.all('SELECT * FROM staff_award WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (awErr, awards) => {
                  res.json({
                    personal: personal || {},
                    academics: academics || {},
                    education: education || [],
                    publications: publications || [],
                    books: books || [],
                    funding: funding || [],
                    ipr: ipr || [],
                    awards: awards || []
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// 1. GET Personal Profile & Academic details
router.get('/personal', authenticateToken, (req, res) => {
  const reqStaffId = req.query.staffId;
  const isDeptAdmin = req.user.role === 'dept_admin';
  const isAdmin = req.user.role === 'admin';
  const isHod = req.user.isHod || (req.user.designation || '').toLowerCase().includes('hod') || (req.user.designation || '').toLowerCase().includes('head');

  const now = new Date();

  const sendEnriched = (rows) => {
    if (!rows || rows.length === 0) return res.json([]);
    db.all('SELECT staff_id, category, degree, specialization, year FROM staff_edu', [], (eErr, allEdu) => {
      const eduMap = {};
      (allEdu || []).forEach(item => {
        const key = (item.staff_id || '').trim().toLowerCase();
        if (!eduMap[key]) eduMap[key] = [];
        eduMap[key].push(item);
      });

      const enriched = rows.map(r => {
        const key = (r.staff_id || '').trim().toLowerCase();
        const highestQual = getHighestQualification(eduMap[key] || [], r.Qualification);
        return calculateExperience({ ...r, Qualification: highestQual }, now);
      });

      res.json(enriched);
    });
  };

  if (reqStaffId) {
    db.all(`
      SELECT p.*, a.Department, a.Designation, a.Date_of_joining, a.Qualification, 
             a.prev_exp_academic_years, a.prev_exp_academic_months, 
             a.prev_exp_industry_years, a.prev_exp_industry_months, 
             a.total_prev_exp_years, a.total_prev_exp_months, a.has_no_prev_exp,
             a.exp_srec_years, a.exp_srec_months, a.total_exp_years, a.total_exp_months
      FROM staff_personal p
      LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
      WHERE LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?))
    `, [reqStaffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      sendEnriched(rows);
    });
  } else if (isDeptAdmin || isHod) {
    let dept = (req.user.department || '').trim();

    const fetchDeptFaculty = (departmentName) => {
      db.all(`
        SELECT p.*, a.Department, a.Designation, a.Date_of_joining, a.Qualification, 
               a.prev_exp_academic_years, a.prev_exp_academic_months, 
               a.prev_exp_industry_years, a.prev_exp_industry_months, 
               a.total_prev_exp_years, a.total_prev_exp_months, a.has_no_prev_exp,
               a.exp_srec_years, a.exp_srec_months, a.total_exp_years, a.total_exp_months
        FROM staff_personal p
        JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
        WHERE TRIM(LOWER(a.Department)) IN (
          SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(?))
        )
        ORDER BY p.staff_name ASC
      `, [departmentName, departmentName, departmentName, departmentName, departmentName], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        sendEnriched(rows);
      });
    };

    if (!dept) {
      db.get('SELECT Department FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [req.user.staffId], (err, row) => {
        dept = row ? (row.Department || '').trim() : '';
        fetchDeptFaculty(dept);
      });
    } else {
      fetchDeptFaculty(dept);
    }
  } else if (isAdmin) {
    db.all(`
      SELECT p.*, a.Department, a.Designation, a.Date_of_joining, a.Qualification, 
             a.prev_exp_academic_years, a.prev_exp_academic_months, 
             a.prev_exp_industry_years, a.prev_exp_industry_months, 
             a.total_prev_exp_years, a.total_prev_exp_months, a.has_no_prev_exp,
             a.exp_srec_years, a.exp_srec_months, a.total_exp_years, a.total_exp_months
      FROM staff_personal p
      LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
      ORDER BY p.staff_name ASC
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      sendEnriched(rows);
    });
  } else {
    db.all(`
      SELECT p.*, a.Department, a.Designation, a.Date_of_joining, a.Qualification, 
             a.prev_exp_academic_years, a.prev_exp_academic_months, 
             a.prev_exp_industry_years, a.prev_exp_industry_months, 
             a.total_prev_exp_years, a.total_prev_exp_months, a.has_no_prev_exp,
             a.exp_srec_years, a.exp_srec_months, a.total_exp_years, a.total_exp_months
      FROM staff_personal p
      LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
      WHERE LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?))
    `, [req.user.staffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      sendEnriched(rows);
    });
  }
});

// In-Memory Stores for Email OTP Verification
const emailOtpStore = new Map();
const verifiedEmailStore = new Map();

const createMailTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
  const port = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '587', 10);

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }
  return null;
};

// 1b. Send Email Verification OTP
router.post('/personal/send-email-otp', authenticateToken, (req, res) => {
  const { email } = req.body;
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId) : req.user.staffId;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const cleanStaffId = staffId.trim().toUpperCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  emailOtpStore.set(cleanStaffId, { otp, expiresAt, email: cleanEmail });

  console.log(`\n======================================================`);
  console.log(`[FACULTY EMAIL OTP VERIFICATION] Staff ID: ${cleanStaffId} | OTP: ${otp} | Email: ${cleanEmail}`);
  console.log(`======================================================\n`);

  const transporter = createMailTransporter();
  if (transporter) {
    const mailOptions = {
      from: `"SREC FIS System" <${process.env.SMTP_USER || process.env.MAIL_USER}>`,
      to: cleanEmail,
      subject: 'SREC FIS - Email Verification Code (OTP)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f331f;">SREC Faculty Information System</h2>
          <p>Hello,</p>
          <p>You requested email verification for Staff ID: <strong>${cleanStaffId}</strong>.</p>
          <p>Your 6-digit Verification OTP Code is:</p>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #15583b; background: #e6f4ea; padding: 14px; text-align: center; border-radius: 6px; margin: 16px 0;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes. Please enter this code on the FIS portal to verify your email address before saving.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8rem; color: #64748b;">Sri Ramakrishna Engineering College (SREC) FIS V3.0</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('[Nodemailer Error]:', mailErr.message);
      } else {
        console.log('[Nodemailer Success]: Verification OTP email sent to', cleanEmail, info.response);
      }
    });
  }

  return res.json({
    success: true,
    message: `Verification code sent to ${cleanEmail}. (Valid for 10 minutes)`,
    otp: otp
  });
});

// 1c. Verify Email OTP
router.post('/personal/verify-email-otp', authenticateToken, (req, res) => {
  const { email, otp } = req.body;
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId) : req.user.staffId;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email address and 6-digit OTP code are required.' });
  }

  const cleanStaffId = staffId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();
  const record = emailOtpStore.get(cleanStaffId);

  if (!record) {
    return res.status(400).json({ error: 'No verification request found for this account. Please click "Verify Email" to get a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    emailOtpStore.delete(cleanStaffId);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new OTP.' });
  }

  if (record.email !== cleanEmail) {
    return res.status(400).json({ error: 'The email address does not match the address the OTP code was sent to.' });
  }

  if (record.otp !== otp.toString().trim()) {
    return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check your code and try again.' });
  }

  // Success: mark email as verified
  verifiedEmailStore.set(cleanStaffId, cleanEmail);
  emailOtpStore.delete(cleanStaffId);

  return res.json({
    success: true,
    message: 'Email address verified successfully!',
    verifiedEmail: cleanEmail
  });
});

// 2. UPDATE Personal Details (supports inline updates and full form updates)
router.post('/personal/update', authenticateToken, (req, res) => {
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId) : req.user.staffId;
  const { name, value, pk, ...fullFields } = req.body;

  // Inline update
  if (name !== undefined && value !== undefined) {
    const lockedFieldsForFaculty = ['staff_name', 'email', 'type', 'Date_of_joining', 'Department', 'Designation', 'staff_id'];
    if (req.user.role === 'faculty' && lockedFieldsForFaculty.includes(name)) {
      return res.status(403).json({ error: 'Access denied: Only System Administrators can modify this parameter.' });
    }

    const query = `UPDATE staff_personal SET ${name} = ? WHERE staff_id = ?`;
    db.run(query, [value, staffId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update field' });
      res.json({ success: true, message: 'Field updated successfully' });
    });
  } else {
    // Full form update
    const { staff_name, dob, gender, address, mobile, email, pan, aadhar, type, aicte_id, anna_univ_id, apaar_id } = req.body;

    if (req.user.role === 'faculty') {
      db.get('SELECT staff_name, email, type FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (pErr, existing) => {
        const finalName = existing ? existing.staff_name : staff_name;
        const finalType = existing ? existing.type : type;

        const currentSavedEmail = existing ? (existing.email || '').trim().toLowerCase() : '';
        const requestedEmail = (email || '').trim().toLowerCase();

        // If faculty changed their email, check if it has been verified via OTP
        if (requestedEmail !== currentSavedEmail) {
          const verified = verifiedEmailStore.get(staffId.trim().toUpperCase());
          if (!verified || verified !== requestedEmail) {
            return res.status(400).json({
              error: 'Email address verification required. Please click "Verify Email" and complete OTP verification before saving your changes.'
            });
          }
        }

        const finalEmail = requestedEmail ? email.trim() : (existing ? existing.email : '');

        db.run(`
          UPDATE staff_personal 
          SET staff_name = ?, dob = ?, gender = ?, address = ?, mobile = ?, email = ?, pan = ?, aadhar = ?, type = ?,
              aicte_id = ?, anna_univ_id = ?, apaar_id = ?
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))
        `, [finalName, dob, gender, address, mobile, finalEmail, pan, aadhar, finalType, aicte_id || '', anna_univ_id || '', apaar_id || '', staffId], function(err) {
          if (err) return res.status(500).json({ error: 'Failed to update profile' });
          verifiedEmailStore.delete(staffId.trim().toUpperCase());
          res.json({ success: true, message: 'Profile updated successfully' });
        });
      });
    } else {
      db.run(`
        UPDATE staff_personal 
        SET staff_name = ?, dob = ?, gender = ?, address = ?, mobile = ?, email = ?, pan = ?, aadhar = ?, type = ?,
            aicte_id = ?, anna_univ_id = ?, apaar_id = ?
        WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))
      `, [staff_name, dob, gender, address, mobile, email, pan, aadhar, type, aicte_id || '', anna_univ_id || '', apaar_id || '', staffId], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to update profile' });
        res.json({ success: true, message: 'Profile updated successfully' });
      });
    }
  }
});

// 2b. UPLOAD Personal Document (PAN, Aadhar, Appointment Order, Joining Report)
const srecStorage = multer.diskStorage({
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

const docUpload = multer({ storage: srecStorage });

router.post('/personal/upload-doc', authenticateToken, docUpload.single('file'), (req, res) => {
  const { docType } = req.body;
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId) : req.user.staffId;

  const validDocTypes = ['pan_file', 'aadhar_file', 'appointment_order_file', 'joining_report_file'];
  if (!validDocTypes.includes(docType)) {
    return res.status(400).json({ error: 'Invalid document type requested.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No document file was selected.' });
  }

  const fileName = req.file.filename;

  db.run(`UPDATE staff_personal SET ${docType} = ? WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))`, [fileName, staffId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    res.json({ success: true, fileName, message: 'Document uploaded successfully!' });
  });
});

// 3. GET Academic Details
router.get('/academics', authenticateToken, (req, res) => {
  const staffId = req.query.staffId || req.user.staffId;

  db.get('SELECT * FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.json([]);

    db.all('SELECT staff_id, category, degree, specialization, year FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (eErr, eduRows) => {
      const highestQual = getHighestQualification(eduRows || [], row.Qualification);
      const enriched = calculateExperience({ ...row, Qualification: highestQual }, new Date());
      res.json([enriched]);
    });
  });
});

// 4. UPDATE Academic Details
router.post('/academics/update', authenticateToken, (req, res) => {
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId || req.user.staff_id) : (req.user.staffId || req.user.staff_id);
  const {
    Date_of_joining, Department, Designation, Qualification,
    orcid_id, scholar_id, scopus_id, wos_id, h_index, i10_index, total_citations
  } = req.body;

  db.run(`
    INSERT INTO staff_academics (
      staff_id, Date_of_joining, Department, Designation, Qualification,
      orcid_id, scholar_id, scopus_id, wos_id, h_index, i10_index, total_citations
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      Date_of_joining = VALUES(Date_of_joining),
      Department = VALUES(Department),
      Designation = VALUES(Designation),
      Qualification = VALUES(Qualification),
      orcid_id = VALUES(orcid_id),
      scholar_id = VALUES(scholar_id),
      scopus_id = VALUES(scopus_id),
      wos_id = VALUES(wos_id),
      h_index = VALUES(h_index),
      i10_index = VALUES(i10_index),
      total_citations = VALUES(total_citations)
  `, [
    staffId || '', Date_of_joining || '', Department || '', Designation || '', Qualification || '',
    orcid_id || '', scholar_id || '', scopus_id || '', wos_id || '',
    parseInt(h_index || 0), parseInt(i10_index || 0), parseInt(total_citations || 0)
  ], function(err) {
    if (err) {
      console.error('Academics update error:', err);
      return res.status(500).json({ error: 'Failed to update academic info' });
    }
    res.json({ success: true });
  });
});

// 4b. GET Live Citation & Bibliometrics Sync Endpoint
router.get('/fetch-citation-metrics', authenticateToken, (req, res) => {
  const staffId = req.query.staffId;
  const reqDept = req.query.department || (req.user.role === 'dept_admin' ? req.user.department : null);

  // If a department aggregate is requested (or dept_admin viewing all department faculty)
  if (!staffId && reqDept) {
    db.all(`
      SELECT 
        COALESCE(SUM(total_citations), 0) as total_citations,
        COALESCE(MAX(h_index), 0) as h_index,
        COALESCE(SUM(i10_index), 0) as i10_index,
        COUNT(DISTINCT staff_id) as faculty_count
      FROM staff_academics 
      WHERE TRIM(LOWER(Department)) IN (
        SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(?))
      )
    `, [reqDept, reqDept, reqDept, reqDept, reqDept], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error fetching department metrics' });
      const stats = rows && rows[0] ? rows[0] : { total_citations: 0, h_index: 0, i10_index: 0, faculty_count: 0 };
      
      db.all(`
        SELECT p.index_pub, p.web_of_science FROM staff_publication p
        LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id))
        WHERE TRIM(LOWER(a.Department)) IN (
          SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(?))
        )
      `, [reqDept, reqDept, reqDept, reqDept, reqDept], (pErr, pRows) => {
        let scopusCount = 0, wosCount = 0;
        (pRows || []).forEach(p => {
          const idx = (p.index_pub || '').toLowerCase();
          const wosVal = (p.web_of_science || '').toString().toLowerCase();
          if (idx.includes('scopus')) scopusCount++;
          if (idx.includes('wos') || idx.includes('sci') || (wosVal && wosVal !== '0' && wosVal !== 'null' && wosVal !== 'false')) wosCount++;
        });

        return res.json({
          success: true,
          isAggregate: true,
          department: reqDept,
          total_citations: stats.total_citations || 0,
          h_index: stats.h_index || 0,
          i10_index: stats.i10_index || 0,
          faculty_count: stats.faculty_count || 0,
          scopus_publications_count: scopusCount,
          wos_publications_count: wosCount
        });
      });
    });
    return;
  }

  // System-wide aggregate for System Admin if no staffId or department specified
  if (!staffId && req.user.role === 'admin') {
    db.all(`
      SELECT 
        COALESCE(SUM(total_citations), 0) as total_citations,
        COALESCE(MAX(h_index), 0) as h_index,
        COALESCE(SUM(i10_index), 0) as i10_index,
        COUNT(DISTINCT staff_id) as faculty_count
      FROM staff_academics
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error fetching system metrics' });
      const stats = rows && rows[0] ? rows[0] : { total_citations: 0, h_index: 0, i10_index: 0, faculty_count: 0 };
      
      db.all('SELECT index_pub, web_of_science FROM staff_publication', [], (pErr, pRows) => {
        let scopusCount = 0, wosCount = 0;
        (pRows || []).forEach(p => {
          const idx = (p.index_pub || '').toLowerCase();
          const wosVal = (p.web_of_science || '').toString().toLowerCase();
          if (idx.includes('scopus')) scopusCount++;
          if (idx.includes('wos') || idx.includes('sci') || (wosVal && wosVal !== '0' && wosVal !== 'null' && wosVal !== 'false')) wosCount++;
        });

        return res.json({
          success: true,
          isAggregate: true,
          department: 'All Departments',
          total_citations: stats.total_citations || 0,
          h_index: stats.h_index || 0,
          i10_index: stats.i10_index || 0,
          faculty_count: stats.faculty_count || 0,
          scopus_publications_count: scopusCount,
          wos_publications_count: wosCount
        });
      });
    });
    return;
  }

  // Individual Faculty Record
  const targetStaffId = staffId || req.user.staffId;
  db.get('SELECT * FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [targetStaffId], async (err, row) => {
    if (err || !row) {
      return res.json({
        success: true,
        isAggregate: false,
        staffId: targetStaffId,
        total_citations: 0,
        h_index: 0,
        i10_index: 0,
        scopus_publications_count: 0,
        wos_publications_count: 0,
        scholar_id: '',
        scopus_id: '',
        orcid_id: '',
        wos_id: ''
      });
    }

    const scholarId = (row.scholar_id || '').trim();
    const scopusId = (row.scopus_id || '').trim();
    const orcidId = (row.orcid_id || '').trim();
    const wosId = (row.wos_id || '').trim();

    let fetchedCitations = row.total_citations || 0;
    let fetchedHIndex = row.h_index || 0;
    let fetchedI10Index = row.i10_index || 0;

    // 1. Google Scholar Live Citation Sync
    if (scholarId) {
      const cleanId = scholarId.includes('user=') ? scholarId.split('user=')[1].split('&')[0] : scholarId;
      const url = `https://scholar.google.com/citations?user=${cleanId}&hl=en`;

      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await response.text();

        const cMatch = html.match(/Citations<\/a><\/td><td class=\"gsc_rsb_std\">(\d+)<\/td>/);
        const hMatch = html.match(/h-index<\/a><\/td><td class=\"gsc_rsb_std\">(\d+)<\/td>/);
        const iMatch = html.match(/i10-index<\/a><\/td><td class=\"gsc_rsb_std\">(\d+)<\/td>/);

        if (cMatch) fetchedCitations = parseInt(cMatch[1]);
        if (hMatch) fetchedHIndex = parseInt(hMatch[1]);
        if (iMatch) fetchedI10Index = parseInt(iMatch[1]);

        db.run(`
          UPDATE staff_academics 
          SET total_citations = ?, h_index = ?, i10_index = ?, last_citation_sync = CURRENT_TIMESTAMP
          WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))
        `, [fetchedCitations, fetchedHIndex, fetchedI10Index, targetStaffId]);
      } catch (fErr) {
        console.warn('Google Scholar fetch warning:', fErr.message);
      }
    }

    // 2. Live Scopus & WoS Fetching via ORCID / Scopus API
    let liveOrcidScopus = 0;
    let liveOrcidWos = 0;
    let liveElsevierScopus = 0;

    const cleanOrcid = (orcidId || '').replace(/https?:\/\/orcid\.org\//i, '').trim();
    if (cleanOrcid) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const oRes = await fetch(`https://pub.orcid.org/v3.0/${cleanOrcid}/works`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (oRes.ok) {
          const oData = await oRes.json();
          (oData.group || []).forEach(g => {
            const summary = g['work-summary'] ? g['work-summary'][0] : null;
            if (summary) {
              const source = summary['source'] ? (summary['source']['source-name'] ? summary['source']['source-name'].value : '') : '';
              const extIds = (summary['external-ids'] ? summary['external-ids']['external-id'] : []) || [];
              const extTypes = extIds.map(e => (e['external-id-type'] || '').toLowerCase());
              if (extTypes.includes('eid') || source.toLowerCase().includes('scopus')) liveOrcidScopus++;
              if (extTypes.includes('wosuid') || source.toLowerCase().includes('web of science') || source.toLowerCase().includes('researcherid')) liveOrcidWos++;
            }
          });
        }
      } catch (oErr) {
        console.warn('ORCID live fetch warning:', oErr.message);
      }
    }

    const scopusApiKey = process.env.SCOPUS_API_KEY;
    const cleanScopus = scopusId.includes('authorId=') 
      ? scopusId.split('authorId=')[1].split('&')[0] 
      : scopusId.replace(/https?:\/\/www\.scopus\.com\/authid\/detail\.uri\?authorId=/i, '').trim();

    if (cleanScopus && scopusApiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const sRes = await fetch(`https://api.elsevier.com/content/author/author_id/${cleanScopus}`, {
          headers: { 'Accept': 'application/json', 'X-ELS-APIKey': scopusApiKey },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (sRes.ok) {
          const sData = await sRes.json();
          const docCountStr = sData['author-retrieval-response']?.[0]?.coredata?.['document-count'];
          if (docCountStr) liveElsevierScopus = parseInt(docCountStr, 10);
        }
      } catch (sErr) {
        console.warn('Elsevier API live fetch warning:', sErr.message);
      }
    }

    db.all('SELECT index_pub, web_of_science FROM staff_publication WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [targetStaffId], (pErr, pRows) => {
      let localScopusCount = 0, localWosCount = 0;
      (pRows || []).forEach(p => {
        const idx = (p.index_pub || '').toLowerCase();
        const wosVal = (p.web_of_science || '').toString().toLowerCase();
        if (idx.includes('scopus')) localScopusCount++;
        if (idx.includes('wos') || idx.includes('sci') || (wosVal && wosVal !== '0' && wosVal !== 'null' && wosVal !== 'false')) localWosCount++;
      });

      const finalScopusCount = Math.max(localScopusCount, liveOrcidScopus, liveElsevierScopus);
      const finalWosCount = Math.max(localWosCount, liveOrcidWos);

      return res.json({
        success: true,
        isAggregate: false,
        staffId: targetStaffId,
        scholar_id: scholarId,
        scopus_id: scopusId,
        orcid_id: orcidId,
        wos_id: wosId,
        total_citations: fetchedCitations,
        h_index: fetchedHIndex,
        i10_index: fetchedI10Index,
        scopus_publications_count: finalScopusCount,
        wos_publications_count: finalWosCount,
        last_citation_sync: new Date().toISOString()
      });
    });
  });
});

// 4c. GET Top Performing Faculty & Department Bibliometrics Leaderboards
router.get('/top-performing-bibliometrics', authenticateToken, (req, res) => {
  const reqDept = req.query.department || (req.user.role === 'dept_admin' ? req.user.department : null);

  // If department specified or dept_admin login: fetch top faculty in department
  if (reqDept && reqDept !== 'All Departments') {
    db.all(`
      SELECT 
        sa.staff_id, 
        COALESCE(NULLIF(sp.staff_name, ''), sa.staff_id) as staff_name, 
        sa.Department, 
        sa.Designation, 
        COALESCE(sa.total_citations, 0) as total_citations, 
        COALESCE(sa.h_index, 0) as h_index, 
        COALESCE(sa.i10_index, 0) as i10_index,
        sa.scholar_id,
        sa.scopus_id,
        sa.orcid_id
      FROM staff_academics sa
      LEFT JOIN staff_personal sp ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(sp.staff_id))
      WHERE TRIM(LOWER(sa.Department)) IN (
        SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(?))
      )
      ORDER BY total_citations DESC, h_index DESC, i10_index DESC 
      LIMIT 10
    `, [reqDept, reqDept, reqDept, reqDept, reqDept], (err, topFaculty) => {
      if (err) return res.status(500).json({ error: 'Database error fetching top faculty' });
      return res.json({
        success: true,
        department: reqDept,
        topFaculty: topFaculty || []
      });
    });
    return;
  }

  // If System Admin (admin) or System-Wide scope: fetch top faculty system-wide AND top departments
  db.all(`
    SELECT 
      sa.staff_id, 
      COALESCE(NULLIF(sp.staff_name, ''), sa.staff_id) as staff_name, 
      sa.Department, 
      sa.Designation, 
      COALESCE(sa.total_citations, 0) as total_citations, 
      COALESCE(sa.h_index, 0) as h_index, 
      COALESCE(sa.i10_index, 0) as i10_index,
      sa.scholar_id,
      sa.scopus_id,
      sa.orcid_id
    FROM staff_academics sa
    LEFT JOIN staff_personal sp ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(sp.staff_id))
    ORDER BY total_citations DESC, h_index DESC, i10_index DESC 
    LIMIT 10
  `, [], (fErr, topFaculty) => {
    if (fErr) return res.status(500).json({ error: 'Database error fetching top faculty' });

    db.all(`
      SELECT 
        sa.Department as department,
        SUM(COALESCE(sa.total_citations, 0)) as total_citations,
        MAX(COALESCE(sa.h_index, 0)) as max_h_index,
        SUM(COALESCE(sa.i10_index, 0)) as total_i10_index,
        COUNT(DISTINCT sa.staff_id) as faculty_count
      FROM staff_academics sa
      WHERE sa.Department IS NOT NULL AND sa.Department != ''
      GROUP BY sa.Department
      ORDER BY total_citations DESC, max_h_index DESC 
      LIMIT 10
    `, [], (dErr, topDepartments) => {
      if (dErr) return res.status(500).json({ error: 'Database error fetching top departments' });

      return res.json({
        success: true,
        scope: 'System-Wide',
        topFaculty: topFaculty || [],
        topDepartments: topDepartments || []
      });
    });
  });
});

// 5. GET Education Details
router.get('/education', authenticateToken, (req, res) => {
  const reqStaffId = req.query.staffId;
  const isDeptAdmin = req.user.role === 'dept_admin';
  const isAdmin = req.user.role === 'admin';

  if (reqStaffId && reqStaffId !== req.user.staffId) {
    db.all(`
      SELECT i.*, a.Department, a.Designation, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name 
      FROM staff_edu i 
      LEFT JOIN staff_academics a ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(i.staff_id)) = LOWER(TRIM(?))
    `, [reqStaffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else if (isDeptAdmin) {
    const dept = (req.user.department || '').trim();
    db.all(`
      SELECT i.*, a.Department, a.Designation, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name 
      FROM staff_edu i 
      JOIN staff_academics a ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE TRIM(LOWER(a.Department)) IN (
        SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(?))
      )
    `, [dept, dept, dept, dept, dept], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else if (isAdmin) {
    db.all(`
      SELECT i.*, a.Department, a.Designation, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name 
      FROM staff_edu i 
      LEFT JOIN staff_academics a ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(p.staff_id))
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    db.all(`
      SELECT i.*, a.Department, a.Designation, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name 
      FROM staff_edu i 
      LEFT JOIN staff_academics a ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(i.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(i.staff_id)) = LOWER(TRIM(?))
    `, [req.user.staffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});

// Configure Multer for Education Certificates & Profile Uploads
const upload = multer({ storage: srecStorage });

// 6. ADD Education Details
router.post('/education', authenticateToken, upload.single('file'), (req, res) => {
  const staffId = req.user.staffId;
  const { category, degree, specialization, institute, board, year, percentage } = req.body;
  
  let file = null;
  let fileType = null;
  let fileSize = 0;

  if (req.file) {
    file = req.file.filename;
    fileType = req.file.mimetype;
    fileSize = (req.file.size / 1000).toFixed(2); // KB
  }

  db.run(`
    INSERT INTO staff_edu (staff_id, category, degree, specialization, institute, board, year, percentage, file, type, size)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [staffId, category, degree, specialization, institute, board, year, percentage, file, fileType, fileSize], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// 7. DELETE Education Details
router.delete('/education/:id', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const id = req.params.id;

  db.run('DELETE FROM staff_edu WHERE id = ? AND staff_id = ?', [id, staffId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// 7b. UPDATE Education Details
router.put('/education/:id', authenticateToken, upload.single('file'), (req, res) => {
  const staffId = req.user.role === 'admin' ? (req.body.staffId || req.user.staffId) : req.user.staffId;
  const id = req.params.id;
  const { category, degree, specialization, institute, board, year, percentage } = req.body;

  if (req.file) {
    const file = req.file.filename;
    const fileType = req.file.mimetype;
    const fileSize = (req.file.size / 1000).toFixed(2);

    db.run(`
      UPDATE staff_edu 
      SET category = ?, degree = ?, specialization = ?, institute = ?, board = ?, year = ?, percentage = ?, file = ?, type = ?, size = ?
      WHERE id = ? AND (staff_id = ? OR ? = 'admin')
    `, [category, degree, specialization, institute, board, year, percentage, file, fileType, fileSize, id, staffId, req.user.role], function(err) {
      if (err) return res.status(500).json({ error: 'Database error updating qualification' });
      res.json({ success: true, message: 'Qualification updated successfully' });
    });
  } else {
    db.run(`
      UPDATE staff_edu 
      SET category = ?, degree = ?, specialization = ?, institute = ?, board = ?, year = ?, percentage = ?
      WHERE id = ? AND (staff_id = ? OR ? = 'admin')
    `, [category, degree, specialization, institute, board, year, percentage, id, staffId, req.user.role], function(err) {
      if (err) return res.status(500).json({ error: 'Database error updating qualification' });
      res.json({ success: true, message: 'Qualification updated successfully' });
    });
  }
});

// 8. GET Professional Memberships
router.get('/memberships', authenticateToken, (req, res) => {
  const staffId = req.query.staffId || req.user.staffId;

  db.all('SELECT * FROM staff_member WHERE staff_id = ?', [staffId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// 9. ADD Professional Membership
router.post('/memberships', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const { membershipid, organization } = req.body;

  db.get('SELECT staff_name FROM staff_personal WHERE staff_id = ?', [staffId], (err, row) => {
    const staffName = row ? row.staff_name : '';
    db.run(`
      INSERT INTO staff_member (staff_id, staff_name, membershipid, organization)
      VALUES (?, ?, ?, ?)
    `, [staffId, staffName, membershipid, organization], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true, id: this.lastID });
    });
  });
});

// 10. DELETE Professional Membership
router.delete('/memberships/:id', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const id = req.params.id;

  db.run('DELETE FROM staff_member WHERE id = ? AND staff_id = ?', [id, staffId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// 10b. GET Appraisal Template Criteria & Rubrics
router.get('/appraisal/template', authenticateToken, (req, res) => {
  db.all('SELECT * FROM appraisal_template ORDER BY display_order ASC, id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + (err ? err.message : '') });
    
    if (rows && rows.length > 0) {
      const seen = new Set();
      const uniqueRows = rows.filter(r => {
        if (!r.criteria_code) return true;
        if (seen.has(r.criteria_code)) return false;
        seen.add(r.criteria_code);
        return true;
      });
      return res.json(uniqueRows);
    }

    // Auto-seed default FPI.docx criteria and rubrics if empty
    const defaultFpiItems = [
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A1', criteria_title: 'Innovative ICT Tools Integrated in Course Delivery', rubric_description: '5 marks per innovative ICT tool (Kahoot, Virtual Labs, Canvas, Padlet, Google Classroom) integrated into course delivery.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 1 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A2', criteria_title: 'E-Content & Video Lectures Developed', rubric_description: '5 marks per original e-content / video lecture module developed and hosted on LMS / YouTube.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 2 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A3', criteria_title: 'Development of New Lab Experiments / Manuals', rubric_description: '5 marks per new lab experiment or virtual lab manual developed for curriculum enhancement.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 3 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A4', criteria_title: 'Student Feedback Score Rating', rubric_description: '5 marks for average feedback rating >=4.0/5, 3 marks for <4.0.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'bracket_rating', bracket_config: JSON.stringify({ rating_threshold: 4.0, high_score: 5, low_score: 3 }), target_designation: 'ALL', display_order: 4 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A5', criteria_title: 'End Semester Course Pass Percentage', rubric_description: '10 marks for pass percentage >=80%, 5 marks for 60-79%.', mapping_type: 'manual', fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: JSON.stringify({ pass_threshold: 80, high_score: 10, low_score: 5 }), target_designation: 'ALL', display_order: 5 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A6', criteria_title: 'Value Added Courses & Industry Workshops Delivered', rubric_description: '5 marks per value-added course or industry hands-on workshop conducted.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 6 },
      { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A7', criteria_title: 'Mentoring Students in Hackathons & Competitions', rubric_description: '10 marks for Prize Won, 5 marks for Participation.', mapping_type: 'manual', fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: JSON.stringify({ prize_score: 10, participation_score: 5 }), target_designation: 'ALL', display_order: 7 },

      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B1', criteria_title: 'Professional Society Memberships', rubric_description: 'Automatic mapping: 3 marks per active professional society membership (IEEE, ISTE, ACM, CSI, etc.) [Max 3 pts].', mapping_type: 'auto', data_source_page: 'memberships', fixed_mark_per_record: 3, max_marks: 3, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 8 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B2', criteria_title: 'Resource Speaker / Session Chair / Invited Talks', rubric_description: 'Automatic mapping: 2 marks per invited guest lecture, resource talk, or session chair role delivered [Max 4 pts].', mapping_type: 'auto', data_source_page: 'resource', fixed_mark_per_record: 2, max_marks: 4, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 9 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B3', criteria_title: 'External Academic / Professional Interactions', rubric_description: 'Automatic mapping: 2.5 marks per interaction detail [Max 5 pts].', mapping_type: 'auto', data_source_page: 'interactions', fixed_mark_per_record: 2.5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 10 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B4', criteria_title: 'Curriculum Development & Board of Studies (BOS)', rubric_description: '5 marks for active BoS membership, syllabus revision, or curriculum framing.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 11 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B5', criteria_title: 'Organizing FDPs / Conferences / Symposia', rubric_description: 'Automatic mapping: 4 marks per national/international conference, FDP, or symposium organized [Max 8 pts].', mapping_type: 'auto', data_source_page: 'events', fixed_mark_per_record: 4, max_marks: 8, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 12 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B6', criteria_title: 'Online Certifications (SWAYAM / NPTEL / Coursera)', rubric_description: 'Automatic mapping: 5 marks for 8/12 week NPTEL/SWAYAM course, 2.5 marks for 4 week course [Max 10 pts].', mapping_type: 'auto', data_source_page: 'certs', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: JSON.stringify({ long_course_score: 5, short_course_score: 2.5 }), target_designation: 'ALL', display_order: 13 },
      { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B7', criteria_title: 'Industrial Training / Corporate Internship Completed', rubric_description: '5 marks per corporate training / industrial fellowship completed (min 2 weeks).', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 14 },

      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C1', criteria_title: 'Research Publications in Indexed Journals', rubric_description: 'Automatic mapping: 10 marks per paper published in SCI / Scopus / WoS indexed journals, 5 per conference [Max 20 pts].', mapping_type: 'auto', data_source_page: 'publications', fixed_mark_per_record: 10, max_marks: 20, calculation_rule: 'pub_type_split', bracket_config: JSON.stringify({ journal_score: 10, conf_score: 5 }), target_designation: 'ALL', display_order: 15 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C2', criteria_title: 'Books & Book Chapters Published', rubric_description: 'Automatic mapping: 5 marks per book or book chapter published with ISBN [Max 10 pts].', mapping_type: 'auto', data_source_page: 'books', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 16 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C3', criteria_title: 'Community Service & Extension Activities', rubric_description: '5 marks per community outreach, societal project, or extension program.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 17 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C4', criteria_title: 'IPR & Patents (Filed / Published / Granted)', rubric_description: 'Automatic mapping: 10 marks for patent granted, 7 marks for published, 3 marks for filed [Max 10 pts].', mapping_type: 'auto', data_source_page: 'ipr', fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'patent_status_split', bracket_config: JSON.stringify({ granted_score: 10, published_score: 7, filed_score: 3 }), target_designation: 'ALL', display_order: 18 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C5', criteria_title: 'Research Grants & External Sponsored Projects', rubric_description: 'Automatic mapping: 10 marks for sanctioned grant >5 Lakhs, 8 marks for <=5 Lakhs, 5 per proposal [Max 15 pts].', mapping_type: 'auto', data_source_page: 'funding', fixed_mark_per_record: 10, max_marks: 15, calculation_rule: 'bracket_rating', bracket_config: JSON.stringify({ high_grant_score: 10, low_grant_score: 8, proposal_score: 5 }), target_designation: 'ALL', display_order: 19 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C6', criteria_title: 'Seed Money & Consultancy Services', rubric_description: 'Automatic mapping: 5 marks per internal seed money grant or external consultancy project [Max 10 pts].', mapping_type: 'auto', data_source_page: 'seed_money', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 20 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C7', criteria_title: 'Research Scholars Guidance (Ph.D)', rubric_description: 'Automatic mapping: 2.5 marks per registered Ph.D scholar (N/A for Non-Supervisors) [Max 5 pts].', mapping_type: 'auto', data_source_page: 'scholars', fixed_mark_per_record: 2.5, max_marks: 5, calculation_rule: 'phd_supervisor_gated', bracket_config: JSON.stringify({ scholar_unit_score: 2.5 }), target_designation: 'ALL', display_order: 21 },
      { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C8', criteria_title: 'Awards & Recognitions Received', rubric_description: 'Automatic mapping: 5 marks per national/international award or honor received [Max 5 pts].', mapping_type: 'auto', data_source_page: 'awards', fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 22 },

      { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D1', criteria_title: 'Assigned Institutional & Departmental Responsibilities', rubric_description: 'Automatic mapping: 10 marks per Institutional role (Max 20), 10 per Departmental role (Max 10). Combined Max 20.', mapping_type: 'auto', data_source_page: 'responsibilities', fixed_mark_per_record: 10, max_marks: 20, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 23 },
      { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D2', criteria_title: 'Student Mentoring, Counseling & Academic Guidance', rubric_description: '10 marks for effective mentee tracking, counseling logs, and academic progress monitoring.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 24 },
      { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D3', criteria_title: 'Contribution to NBA / NAAC / Autonomous Accreditations', rubric_description: '10 marks for criterion head / module coordinator role in NBA, NAAC, or Autonomous audits.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, target_designation: 'ALL', display_order: 25 }
    ];

    const stmt = db.prepare(`
      INSERT INTO appraisal_template (section_code, section_title, criteria_code, criteria_title, rubric_description, mapping_type, fixed_mark_per_record, max_marks, calculation_rule, bracket_config, data_source_page, target_designation, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultFpiItems.forEach((item, idx) => {
      stmt.run([
        item.section_code,
        item.section_title,
        item.criteria_code,
        item.criteria_title,
        item.rubric_description,
        item.mapping_type,
        item.fixed_mark_per_record,
        item.max_marks,
        item.calculation_rule || 'fixed_per_record',
        item.bracket_config || null,
        item.data_source_page || null,
        item.target_designation || 'ALL',
        idx + 1
      ]);
    });

    stmt.finalize(() => {
      res.json(defaultFpiItems);
    });
  });
});

// 10c. POST Save/Update Appraisal Template Criteria & Rubrics (Admin, Principal, HR Only)
router.post('/appraisal/template', authenticateToken, async (req, res) => {
  if (!['admin', 'principal', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Permission denied. Only System Admin, Principal, or HR can update appraisal criteria.' });
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid criteria items payload.' });
  }

  try {
    // 1. Clear existing template items
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM appraisal_template', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 2. Insert new template items sequentially
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const bracketStr = typeof item.bracket_config === 'object' && item.bracket_config !== null
        ? JSON.stringify(item.bracket_config)
        : (item.bracket_config || null);

      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO appraisal_template (
            section_code, section_title, criteria_code, criteria_title,
            rubric_description, mapping_type, fixed_mark_per_record, max_marks,
            calculation_rule, bracket_config, data_source_page, target_designation, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.section_code || 'PART_A',
          item.section_title || 'PART A',
          item.criteria_code || `C${index + 1}`,
          item.criteria_title || 'Criteria',
          item.rubric_description || '',
          item.mapping_type || 'manual',
          parseFloat(item.fixed_mark_per_record) || 0,
          parseFloat(item.max_marks) || 10,
          item.calculation_rule || 'fixed_per_record',
          bracketStr,
          item.data_source_page || null,
          item.target_designation || 'ALL',
          index + 1
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return res.json({ success: true, message: 'Appraisal template, rubrics, fixed marks, max marks, designation targets, and calculation rules saved successfully!' });
  } catch (err) {
    console.error('[Appraisal Template Save Error]:', err);
    return res.status(500).json({ error: 'Failed to save appraisal template: ' + err.message });
  }
});

// 10f. GET Pending Appraisal Notification Counts for HOD, Principal, HR
router.get('/appraisals/pending-counts', authenticateToken, (req, res) => {
  const isDeptAdmin = req.user.role === 'dept_admin' || req.user.isHod;
  const isInstAdmin = ['admin', 'principal', 'hr'].includes(req.user.role) || req.user.isInstitutionalAdmin;
  const dept = (req.user.department || '').trim();

  let pendingHodCount = 0;
  let pendingPrincipalHrCount = 0;

  db.get(`SELECT COUNT(*) as count FROM staff_appraisal WHERE status = 'HOD Approved'`, [], (err, pRow) => {
    if (!err && pRow) {
      pendingPrincipalHrCount = pRow.count || 0;
    }

    if (isDeptAdmin && dept) {
      db.get(`
        SELECT COUNT(*) as count
        FROM staff_appraisal sa
        JOIN staff_academics a ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(a.staff_id))
        WHERE sa.status = 'Submitted'
          AND (
            TRIM(LOWER(a.Department)) = TRIM(LOWER(?))
            OR LOWER(a.Department) LIKE CONCAT('%', LOWER(?), '%')
            OR LOWER(?) LIKE CONCAT('%', LOWER(a.Department), '%')
            OR TRIM(LOWER(a.Department)) IN (
              SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
              UNION
              SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
            )
          )
      `, [dept, dept, dept, dept, dept, dept, dept], (hErr, hRow) => {
        if (!hErr && hRow) {
          pendingHodCount = hRow.count || 0;
        }
        res.json({
          pendingHodCount,
          pendingPrincipalHrCount,
          isDeptAdmin,
          isInstAdmin,
          userPendingCount: isInstAdmin ? pendingPrincipalHrCount : (isDeptAdmin ? pendingHodCount : 0)
        });
      });
    } else {
      res.json({
        pendingHodCount: 0,
        pendingPrincipalHrCount,
        isDeptAdmin,
        isInstAdmin,
        userPendingCount: isInstAdmin ? pendingPrincipalHrCount : 0
      });
    }
  });
});

const sanitizeAppraisalRow = (r) => {
  if (!r) return r;
  const hodA = parseFloat(r.hod_part_a_score) || 0;
  const hodB = parseFloat(r.hod_part_b_score) || 0;
  const hodC = parseFloat(r.hod_part_c_score) || 0;
  const hodD = parseFloat(r.hod_part_d_score) || 0;
  const sumHodParts = hodA + hodB + hodC + hodD;

  let hodTotal = parseFloat(r.hod_total_score);
  if ((isNaN(hodTotal) || hodTotal === 0) && sumHodParts > 0) {
    hodTotal = sumHodParts;
  }

  const finalA = parseFloat(r.final_part_a_score) || 0;
  const finalB = parseFloat(r.final_part_b_score) || 0;
  const finalC = parseFloat(r.final_part_c_score) || 0;
  const finalD = parseFloat(r.final_part_d_score) || 0;
  const sumFinalParts = finalA + finalB + finalC + finalD;

  let finalTotal = parseFloat(r.final_total_score);
  if ((isNaN(finalTotal) || finalTotal === 0) && sumFinalParts > 0) {
    finalTotal = sumFinalParts;
  }

  return {
    ...r,
    hod_total_score: !isNaN(hodTotal) && hodTotal > 0 ? hodTotal : (r.status === 'HOD Approved' || r.status === 'Final Approved' ? sumHodParts : r.hod_total_score),
    final_total_score: !isNaN(finalTotal) && finalTotal > 0 ? finalTotal : (r.status === 'Final Approved' ? sumFinalParts : r.final_total_score)
  };
};

// 11. GET Appraisals
router.get('/appraisals', authenticateToken, (req, res) => {
  const reqStaffId = req.query.staffId;
  const isDeptAdmin = req.user.role === 'dept_admin' || req.user.isHod || req.user.isHod === 'true';
  const isAdmin = ['admin', 'principal', 'hr'].includes(req.user.role) || req.user.isInstitutionalAdmin;

  if (reqStaffId && reqStaffId !== req.user.staffId) {
    // Admin/HOD looking at a specific staff — show all including drafts for own staff only
    db.all(`
      SELECT sa.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation
      FROM staff_appraisal sa
      LEFT JOIN staff_academics a ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(?)) AND sa.status != 'Draft'
      ORDER BY sa.id DESC
    `, [reqStaffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json((rows || []).map(sanitizeAppraisalRow));
    });
  } else if (isDeptAdmin) {
    const dept = (req.user.department || '').trim();
    db.all(`
      SELECT sa.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation
      FROM staff_appraisal sa
      JOIN staff_academics a ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE TRIM(LOWER(a.Department)) IN (
        SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
        UNION
        SELECT TRIM(LOWER(?))
      )
      AND sa.status != 'Draft'
      ORDER BY sa.id DESC
    `, [dept, dept, dept, dept, dept], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json((rows || []).map(sanitizeAppraisalRow));
    });
  } else if (isAdmin) {
    db.all(`
      SELECT sa.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation
      FROM staff_appraisal sa
      LEFT JOIN staff_academics a ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE sa.status != 'Draft'
      ORDER BY sa.id DESC
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json((rows || []).map(sanitizeAppraisalRow));
    });
  } else {
    // Faculty sees all their own including drafts
    db.all(`
      SELECT sa.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name) as staff_name, a.Department, a.Designation
      FROM staff_appraisal sa
      LEFT JOIN staff_academics a ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(sa.staff_id)) = LOWER(TRIM(?))
      ORDER BY sa.id DESC
    `, [req.user.staffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json((rows || []).map(sanitizeAppraisalRow));
    });
  }
});

const sendAppraisalStatusEmail = (appraisalId, status, details = {}) => {
  db.get('SELECT * FROM staff_appraisal WHERE id = ?', [appraisalId], (err, appraisal) => {
    if (err || !appraisal) return;

    const staffId = appraisal.staff_id;
    const academicYear = appraisal.academic_year || 'Current Academic Year';

    db.get('SELECT email, staff_name FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (pErr, personal) => {
      if (pErr || !personal || !personal.email) {
        console.log(`[Appraisal Email Notice]: No email found for Staff ID ${staffId}`);
        return;
      }

      const facultyEmail = personal.email;
      const facultyName = personal.staff_name || staffId;

      const isRevision = status.toLowerCase().includes('revision');
      const statusTitle = isRevision ? 'SENT BACK FOR REVISION' : status.toUpperCase();
      const statusColor = isRevision ? '#dc2626' : '#16a34a';

      const subject = isRevision
        ? `[SREC FIS] Appraisal Form Sent Back for Revision (${academicYear})`
        : `[SREC FIS] Appraisal Form ${status} (${academicYear})`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #15583b; padding-bottom: 14px;">
            <h2 style="color: #0f331f; margin: 0; font-size: 1.5rem;">Sri Ramakrishna Engineering College</h2>
            <p style="color: #475569; margin: 4px 0 0 0; font-size: 0.9rem;">Faculty Information System (FIS V3.0) — Appraisal Notification</p>
          </div>

          <p style="font-size: 1rem; color: #1e293b;">Dear <strong>${facultyName}</strong> (Staff ID: <strong>${staffId}</strong>),</p>

          <p style="font-size: 0.95rem; color: #334155; line-height: 1.5;">
            Your self-appraisal form for <strong>${academicYear}</strong> has been evaluated.
          </p>

          <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700;">Evaluation Result</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: ${statusColor}; margin-top: 4px;">${statusTitle}</div>
          </div>

          <h4 style="color: #0f172a; margin-bottom: 10px;">Evaluated Scores Breakdown:</h4>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 10px; border: 1px solid #cbd5e1; color: #0f172a;">Appraisal Evaluation Section</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1; color: #0f172a; text-align: right;">Approved Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">Part A: Teaching Learning Process</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">${details.part_a ?? appraisal.final_part_a_score ?? appraisal.hod_part_a_score ?? 0} Marks</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">Part B: Professional Development Activities</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">${details.part_b ?? appraisal.final_part_b_score ?? appraisal.hod_part_b_score ?? 0} Marks</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">Part C: Research & Consultancy</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">${details.part_c ?? appraisal.final_part_c_score ?? appraisal.hod_part_c_score ?? 0} Marks</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1;">Part D: Institutional Development & Contribution</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: 700;">${details.part_d ?? appraisal.final_part_d_score ?? appraisal.hod_part_d_score ?? 0} Marks</td>
              </tr>
              <tr style="background: #e6f4ea; font-weight: 800;">
                <td style="padding: 12px; border: 1px solid #cbd5e1; color: #0f331f;">Total Final Evaluated Score</td>
                <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: right; color: #0f331f; font-size: 1.05rem;">${details.total_score ?? appraisal.final_total_score ?? appraisal.hod_total_score ?? appraisal.total_fpi_score ?? 0} Marks</td>
              </tr>
            </tbody>
          </table>

          ${details.remarks ? `
          <div style="margin: 20px 0; padding: 14px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <strong style="color: #b45309; font-size: 0.9rem; display: block; margin-bottom: 4px;">Reviewer Remarks & Revision Instructions:</strong>
            <p style="margin: 0; color: #78350f; font-size: 0.9rem; white-space: pre-wrap;">${details.remarks}</p>
          </div>` : ''}

          ${isRevision ? `
          <p style="font-size: 0.9rem; color: #475569; margin-top: 16px;">
            Please log into the FIS Portal at <a href="https://srec-fis.duckdns.org/appraisal" style="color: #15583b; font-weight: 700;">https://srec-fis.duckdns.org/appraisal</a> to update your details and resubmit your appraisal form.
          </p>` : ''}

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
          <p style="font-size: 0.78rem; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated notification from Sri Ramakrishna Engineering College FIS Portal.
          </p>
        </div>
      `;

      const host = process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
      const user = process.env.SMTP_USER || process.env.MAIL_USER;
      const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
      const port = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '587', 10);

      if (user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });

        transporter.sendMail({
          from: `"SREC FIS System" <${user}>`,
          to: facultyEmail,
          subject,
          html: htmlContent
        }, (mErr, info) => {
          if (mErr) {
            console.error('[Appraisal Email Error]:', mErr.message);
          } else {
            console.log(`[Appraisal Email Success]: Delivered appraisal notice to ${facultyEmail} (${statusTitle})`);
          }
        });
      }
    });
  });
};

// 11b. PUT HOD Appraisal Evaluation & Approval
router.put('/appraisal/:id/hod-approve', authenticateToken, (req, res) => {
  const isHod = req.user.isHod || req.user.role === 'dept_admin' || req.user.role === 'admin';
  if (!isHod) {
    return res.status(403).json({ error: 'Access denied: Only active Head of Department (HOD) or Department Admin can evaluate HOD appraisals.' });
  }

  const id = req.params.id;
  const {
    hod_part_a_score, hod_part_b_score, hod_part_c_score, hod_part_d_score,
    hod_total_score, hod_remarks, action
  } = req.body;

  const scoreA = hod_part_a_score !== undefined && hod_part_a_score !== '' ? parseFloat(hod_part_a_score) : 0;
  const scoreB = hod_part_b_score !== undefined && hod_part_b_score !== '' ? parseFloat(hod_part_b_score) : 0;
  const scoreC = hod_part_c_score !== undefined && hod_part_c_score !== '' ? parseFloat(hod_part_c_score) : 0;
  const scoreD = hod_part_d_score !== undefined && hod_part_d_score !== '' ? parseFloat(hod_part_d_score) : 0;
  const computedHodTotal = scoreA + scoreB + scoreC + scoreD;
  const finalHodTotal = (hod_total_score !== undefined && hod_total_score !== '' && parseFloat(hod_total_score) > 0)
    ? parseFloat(hod_total_score)
    : computedHodTotal;

  const status = action === 'revision' ? 'HOD Revision Requested' : 'HOD Approved';

  db.run(`
    UPDATE staff_appraisal
    SET hod_part_a_score = ?,
        hod_part_b_score = ?,
        hod_part_c_score = ?,
        hod_part_d_score = ?,
        hod_total_score = ?,
        hod_remarks = ?,
        status = ?,
        hod_approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    scoreA,
    scoreB,
    scoreC,
    scoreD,
    finalHodTotal,
    hod_remarks || '',
    status,
    id
  ], function(err) {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    
    // Trigger automated email notification to faculty member
    sendAppraisalStatusEmail(id, status, {
      part_a: scoreA,
      part_b: scoreB,
      part_c: scoreC,
      part_d: scoreD,
      total_score: finalHodTotal,
      remarks: hod_remarks
    });

    res.json({ success: true, message: `Appraisal form ${status.toLowerCase()} successfully!` });
  });
});

// 11c. PUT Principal & HR Final Approval
router.put('/appraisal/:id/final-approve', authenticateToken, (req, res) => {
  const id = req.params.id;
  const {
    action, remarks, final_remarks,
    final_part_a_score, final_part_b_score, final_part_c_score, final_part_d_score, final_total_score
  } = req.body;
  const status = action === 'revision' ? 'Revision Requested' : 'Final Approved';

  db.run(`
    UPDATE staff_appraisal
    SET status = ?,
        final_part_a_score = ?,
        final_part_b_score = ?,
        final_part_c_score = ?,
        final_part_d_score = ?,
        final_total_score = ?,
        final_remarks = ?,
        remarks = ?,
        final_approved_by = ?,
        final_approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    status,
    final_part_a_score || '',
    final_part_b_score || '',
    final_part_c_score || '',
    final_part_d_score || '',
    final_total_score || '',
    final_remarks || remarks || '',
    remarks || final_remarks || '',
    req.user.staffId || req.user.staff_id,
    id
  ], function(err) {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    
    // Trigger automated email notification to faculty member
    sendAppraisalStatusEmail(id, status, {
      part_a: final_part_a_score,
      part_b: final_part_b_score,
      part_c: final_part_c_score,
      part_d: final_part_d_score,
      total_score: final_total_score,
      remarks: final_remarks || remarks
    });

    res.json({ success: true, message: `Appraisal form ${status.toLowerCase()} successfully!` });
  });
});

// Helper to send FPI Appraisal Form Confirmation Email with complete scores & details
const sendAppraisalConfirmationEmail = (staffId, appraisalData) => {
  db.get('SELECT staff_name, email FROM staff_personal WHERE staff_id = ?', [staffId], (err, row) => {
    const facultyEmail = row && row.email ? row.email.trim() : null;
    const facultyName = (row && row.staff_name) || appraisalData.staff_name || staffId;

    if (!facultyEmail || !facultyEmail.includes('@')) {
      console.log(`[Appraisal Email Notice]: No registered email address found for ${staffId}. Email notification skipped.`);
      return;
    }

    const transporter = createMailTransporter();
    if (!transporter) {
      console.log('[Appraisal Email Notice]: Mail transporter not configured (SMTP_USER/SMTP_PASS missing). Email notification skipped.');
      return;
    }

    const parse = (str) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      try {
        const p = JSON.parse(str);
        return Array.isArray(p) ? p : [];
      } catch (e) {
        return [];
      }
    };

    const a1 = parse(appraisalData.a1_ict_tools);
    const a2 = parse(appraisalData.a2_econtent);
    const a3 = parse(appraisalData.a3_lab_experiments);
    const a4 = parse(appraisalData.a4_feedback_scores);
    const a5 = parse(appraisalData.a5_pass_percentage);
    const a6 = parse(appraisalData.a6_industry_partnerships);
    const a7 = parse(appraisalData.a7_hackathons);
    const b4 = parse(appraisalData.b4_curriculum_dev);
    const b7 = parse(appraisalData.b7_industry_training);
    const c3 = parse(appraisalData.c3_community_service);

    const partA = appraisalData.part_a_score || 0;
    const partB = appraisalData.part_b_score || 0;
    const partC = appraisalData.part_c_score || 0;
    const partD = appraisalData.part_d_score || 0;
    const totalScore = appraisalData.self_appraisal_score || appraisalData.total_fpi_score || 0;

    const buildRowsHtml = (rows, cols) => {
      if (!rows || rows.length === 0) return '<tr><td colSpan="' + cols.length + '" style="text-align: center; color: #94a3b8; font-style: italic;">No records logged</td></tr>';
      return rows.map(r => '<tr>' + cols.map(c => `<td>${r[c] || 'N/A'}</td>`).join('') + '</tr>').join('');
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1.5px solid #cbd5e1; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
          .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 1.4rem; font-weight: 800; }
          .header p { margin: 6px 0 0; font-size: 0.9rem; color: #94a3b8; }
          .content { padding: 24px; }
          .section { border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 20px; background: #fafafa; }
          .section-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 6px; margin-bottom: 12px; }
          .badge { background: #0284c7; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; float: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 0.85rem; }
          th { background: #f1f5f9; color: #334155; padding: 8px; text-align: left; border: 1px solid #cbd5e1; font-weight: 700; }
          td { padding: 8px; border: 1px solid #e2e8f0; }
          .summary-table th { background: #0284c7; color: #ffffff; text-align: center; }
          .summary-table td { text-align: center; }
          .grand-total { background: #e0f2fe; font-weight: 800; font-size: 1rem; color: #0369a1; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 0.8rem; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>Sri Ramakrishna Engineering College</h2>
            <p>Annual Faculty Performance Indicator (FPI) Appraisal Submission Confirmation</p>
          </div>

          <div class="content">
            <p>Dear <strong>${facultyName}</strong>,</p>
            <p>Your Annual Faculty Performance Indicator (FPI) Appraisal Form for Academic Year <strong>${appraisalData.academic_year}</strong> has been successfully submitted/updated in the SREC FIS Portal.</p>

            <div class="section" style="background: #f0f9ff; border-color: #7dd3fc;">
              <h3 style="margin-top: 0; color: #0369a1; font-size: 1.05rem;">Submission Overview</h3>
              <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Faculty Name:</strong> ${facultyName} (${staffId})</p>
              <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Academic Year:</strong> ${appraisalData.academic_year}</p>
              <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Submitted On:</strong> ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}</p>
              <p style="margin: 4px 0; font-size: 0.88rem;"><strong>Status:</strong> Submitted (Pending HOD Review)</p>
            </div>

            <!-- COMPREHENSIVE FPI PERFORMANCE SCORE EVALUATION TABLE -->
            <div class="section" style="border: 2px solid #0284c7; background: #ffffff;">
              <div class="section-title" style="color: #0369a1; border-bottom-color: #0284c7;">
                <span>FPI Performance Appraisal Evaluation Summary</span>
              </div>
              <table class="summary-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Evaluation Criteria Section</th>
                    <th>Max Marks</th>
                    <th>Calculated Self Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: left; font-weight: 700;">PART A: Teaching Learning Process</td>
                    <td>60</td>
                    <td style="font-weight: 800; color: #0284c7;">${partA} / 60</td>
                  </tr>
                  <tr>
                    <td style="text-align: left; font-weight: 700;">PART B: Professional Development Activities</td>
                    <td>40</td>
                    <td style="font-weight: 800; color: #0284c7;">${partB} / 40</td>
                  </tr>
                  <tr>
                    <td style="text-align: left; font-weight: 700;">PART C: Research & Development Activities</td>
                    <td>80</td>
                    <td style="font-weight: 800; color: #0284c7;">${partC} / 80</td>
                  </tr>
                  <tr>
                    <td style="text-align: left; font-weight: 700;">PART D: Institutional Development & Contribution</td>
                    <td>20</td>
                    <td style="font-weight: 800; color: #0284c7;">${partD} / 20</td>
                  </tr>
                  <tr class="grand-total">
                    <td style="text-align: left; color: #0369a1;">TOTAL APPRAISAL SCORE</td>
                    <td>200</td>
                    <td style="color: #15803d; font-size: 1.1rem;">${totalScore} / 200</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PART A BREAKDOWN -->
            <div class="section">
              <div class="section-title">
                <span class="badge">Part A: ${partA} / 60</span>
                PART A: Teaching Learning Process
              </div>
              <h4 style="margin: 10px 0 4px; font-size: 0.85rem; color: #334155;">a1. Innovative Teaching Methods & ICT Tools (${a1.length} entries)</h4>
              <table><thead><tr><th>Class</th><th>Course</th><th>ICT Tool / Methodology</th></tr></thead><tbody>${buildRowsHtml(a1, ['class_name', 'course', 'ict_tool'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a2. Development of SWAYAM MOOCs & E-Content (${a2.length} entries)</h4>
              <table><thead><tr><th>Class</th><th>Course</th><th>Module Title</th><th>Platform</th></tr></thead><tbody>${buildRowsHtml(a2, ['class_name', 'course', 'title', 'platform'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a3. New Lab Experiments Developed (${a3.length} entries)</h4>
              <table><thead><tr><th>Class</th><th>Course</th><th>Experiment</th></tr></thead><tbody>${buildRowsHtml(a3, ['class_name', 'course', 'experiment'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a4. Student Feedback Ratings (${a4.length} entries)</h4>
              <table><thead><tr><th>Class</th><th>Course</th><th>Mid-Sem</th><th>End-Sem</th><th>Avg Rating</th></tr></thead><tbody>${buildRowsHtml(a4, ['class_name', 'course', 'mid_score', 'end_score', 'avg_score'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a5. Theory Pass % (${a5.length} entries)</h4>
              <table><thead><tr><th>Class</th><th>Course</th><th>Odd Sem %</th><th>Even Sem %</th><th>Avg Pass %</th></thead><tbody>${buildRowsHtml(a5, ['class_name', 'course', 'odd_pass', 'even_pass', 'avg_pass'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a6. Industry Institute Partnerships (${a6.length} entries)</h4>
              <table><thead><tr><th>Program Name</th><th>Partner Industry</th><th>Duration</th></tr></thead><tbody>${buildRowsHtml(a6, ['name', 'industry', 'duration'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">a7. Student Hackathons Guidance (${a7.length} entries)</h4>
              <table><thead><tr><th>Competition</th><th>Team Members</th><th>Project Title</th><th>Result</th></tr></thead><tbody>${buildRowsHtml(a7, ['competition', 'team_members', 'project_title', 'position'])}</tbody></table>
            </div>

            <!-- PART B BREAKDOWN -->
            <div class="section">
              <div class="section-title">
                <span class="badge">Part B: ${partB} / 40</span>
                PART B: Professional Development Activities
              </div>
              <h4 style="margin: 10px 0 4px; font-size: 0.85rem; color: #334155;">b4. Curriculum Development & BoS (${b4.length} entries)</h4>
              <table><thead><tr><th>Course Name</th><th>Academic Year</th><th>Details / Role</th></tr></thead><tbody>${buildRowsHtml(b4, ['course_name', 'academic_year', 'details'])}</tbody></table>

              <h4 style="margin: 12px 0 4px; font-size: 0.85rem; color: #334155;">b7. Faculty Internships & MoUs (${b7.length} entries)</h4>
              <table><thead><tr><th>Internship Title</th><th>Company Name</th><th>Duration</th></tr></thead><tbody>${buildRowsHtml(b7, ['name', 'company', 'duration'])}</tbody></table>
            </div>

            <!-- PART C BREAKDOWN -->
            <div class="section">
              <div class="section-title">
                <span class="badge">Part C: ${partC} / 80</span>
                PART C: Research & Development Activities
              </div>
              <h4 style="margin: 10px 0 4px; font-size: 0.85rem; color: #334155;">c3. Community Service & Outreach Activities (${c3.length} entries)</h4>
              <table><thead><tr><th>Activity Name</th><th>Type</th><th>Location</th><th>Date</th></tr></thead><tbody>${buildRowsHtml(c3, ['activity_name', 'event_type', 'location', 'date'])}</tbody></table>

              <div style="margin-top: 12px; background: #f0f9ff; padding: 10px; border-radius: 6px; font-size: 0.82rem;">
                <strong>Auto-Mapped R&D Metrics:</strong> Publications: ${appraisalData.publications_count || 0} | Books: ${appraisalData.books_count || 0} | Patents: ${appraisalData.patents_count || 0} | Grants: ${appraisalData.grants_amount || 'N/A'}
              </div>
            </div>

            <!-- GOALS NEXT YEAR -->
            ${appraisalData.goals_next_year ? `
              <div class="section">
                <div class="section-title">Goals & Commitments for Next Academic Year</div>
                <p style="font-size: 0.88rem; color: #334155; margin: 0; white-space: pre-wrap;">${appraisalData.goals_next_year}</p>
              </div>
            ` : ''}

            <p style="font-size: 0.88rem; color: #475569; margin-top: 24px;">
              You can log into your SREC FIS Portal account at any time to view or edit your filled appraisal form prior to HOD and Executive approvals.
            </p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Sri Ramakrishna Engineering College (SREC FIS Portal). All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"SREC FIS Portal" <${process.env.SMTP_USER || process.env.MAIL_USER}>`,
      to: facultyEmail,
      subject: `Annual FPI Appraisal Submission Confirmation - ${appraisalData.academic_year} | ${facultyName}`,
      html: htmlContent
    };

    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('[Nodemailer Error - Appraisal Email]:', mailErr.message);
      } else {
        console.log(`[Nodemailer Success]: Appraisal confirmation email sent to ${facultyEmail} (${staffId})`, info.response);
      }
    });
  });
};

// 12. POST New Appraisal Form
// 11d. POST Save Draft — faculty saves partial form as Draft (no email, not visible to HOD)
router.post('/appraisal/draft', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const {
    academic_year, courses_taught, pass_percentage, student_feedback,
    innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
    a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
    a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
    publications_count, books_count, patents_count,
    grants_amount, fdp_attended, events_organized, self_appraisal_score, goals_next_year,
    part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
  } = req.body;

  if (!academic_year || !academic_year.trim()) {
    return res.status(400).json({ error: 'Academic Year is required.' });
  }

  // Check if draft already exists for this faculty + year
  db.get('SELECT id FROM staff_appraisal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) AND academic_year = ? AND status = \'Draft\'',
    [staffId, academic_year], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });

    if (existing) {
      // Update existing draft
      db.run(`
        UPDATE staff_appraisal SET
          courses_taught = ?, a1_ict_tools = ?, a2_econtent = ?, a3_lab_experiments = ?,
          a4_feedback_scores = ?, a5_pass_percentage = ?, a6_industry_partnerships = ?,
          a7_hackathons = ?, b4_curriculum_dev = ?, b7_industry_training = ?,
          c3_community_service = ?, publications_count = ?, books_count = ?, patents_count = ?,
          grants_amount = ?, goals_next_year = ?,
          part_a_score = ?, part_b_score = ?, part_c_score = ?, part_d_score = ?, total_fpi_score = ?,
          self_appraisal_score = ?
        WHERE id = ?
      `, [
        courses_taught, a1_ict_tools, a2_econtent, a3_lab_experiments,
        a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
        a7_hackathons, b4_curriculum_dev, b7_industry_training,
        c3_community_service, publications_count || 0, books_count || 0, patents_count || 0,
        grants_amount, goals_next_year,
        part_a_score || 0, part_b_score || 0, part_c_score || 0, part_d_score || 0, total_fpi_score || 0,
        self_appraisal_score || total_fpi_score,
        existing.id
      ], function(uErr) {
        if (uErr) return res.status(500).json({ error: 'Draft update error: ' + uErr.message });
        res.json({ success: true, id: existing.id, message: 'Draft saved successfully!', savedAt: new Date().toISOString() });
      });
    } else {
      // Create new draft
      db.run(`
        INSERT INTO staff_appraisal (
          staff_id, academic_year, courses_taught, pass_percentage, student_feedback,
          innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
          a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
          a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
          publications_count, books_count, patents_count,
          grants_amount, goals_next_year, self_appraisal_score, status,
          part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, ?)
      `, [
        staffId, academic_year, courses_taught, 'N/A', 'N/A',
        'N/A', a1_ict_tools, a2_econtent, a3_lab_experiments,
        a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
        a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
        publications_count || 0, books_count || 0, patents_count || 0,
        grants_amount, goals_next_year, self_appraisal_score || total_fpi_score,
        part_a_score || 0, part_b_score || 0, part_c_score || 0, part_d_score || 0, total_fpi_score || 0
      ], function(iErr) {
        if (iErr) return res.status(500).json({ error: 'Draft insert error: ' + iErr.message });
        res.json({ success: true, id: this.lastID, message: 'Draft saved successfully!', savedAt: new Date().toISOString() });
      });
    }
  });
});

// 11e. PUT Update an existing Draft record
router.put('/appraisal/:id/draft', authenticateToken, (req, res) => {
  const appId = req.params.id;
  const staffId = req.user.staffId;
  const {
    academic_year, courses_taught, a1_ict_tools, a2_econtent, a3_lab_experiments,
    a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
    a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
    publications_count, books_count, patents_count,
    grants_amount, goals_next_year, self_appraisal_score,
    part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
  } = req.body;

  // Verify ownership
  db.get('SELECT id, staff_id, status FROM staff_appraisal WHERE id = ?', [appId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Draft not found.' });
    if (row.staff_id.trim().toLowerCase() !== staffId.trim().toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized: You can only edit your own draft.' });
    }

    db.run(`
      UPDATE staff_appraisal SET
        academic_year = ?, courses_taught = ?,
        a1_ict_tools = ?, a2_econtent = ?, a3_lab_experiments = ?,
        a4_feedback_scores = ?, a5_pass_percentage = ?, a6_industry_partnerships = ?,
        a7_hackathons = ?, b4_curriculum_dev = ?, b7_industry_training = ?,
        c3_community_service = ?, publications_count = ?, books_count = ?, patents_count = ?,
        grants_amount = ?, goals_next_year = ?, self_appraisal_score = ?,
        part_a_score = ?, part_b_score = ?, part_c_score = ?, part_d_score = ?, total_fpi_score = ?
      WHERE id = ?
    `, [
      academic_year, courses_taught,
      a1_ict_tools, a2_econtent, a3_lab_experiments,
      a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
      a7_hackathons, b4_curriculum_dev, b7_industry_training,
      c3_community_service, publications_count || 0, books_count || 0, patents_count || 0,
      grants_amount, goals_next_year, self_appraisal_score || total_fpi_score,
      part_a_score || 0, part_b_score || 0, part_c_score || 0, part_d_score || 0, total_fpi_score || 0,
      appId
    ], function(uErr) {
      if (uErr) return res.status(500).json({ error: 'Draft update error: ' + uErr.message });
      res.json({ success: true, id: appId, message: 'Draft updated successfully!', savedAt: new Date().toISOString() });
    });
  });
});


// 12. POST New Appraisal Form (Final Submit — status = Submitted)
router.post('/appraisal', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const {
    academic_year, courses_taught, pass_percentage, student_feedback,
    innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
    a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
    a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
    publications_count, books_count, patents_count,
    grants_amount, fdp_attended, events_organized, self_appraisal_score, goals_next_year,
    part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
  } = req.body;

  if (!academic_year || !academic_year.trim()) {
    return res.status(400).json({ error: 'Academic Year is required.' });
  }

  db.run(`
    INSERT INTO staff_appraisal (
      staff_id, academic_year, courses_taught, pass_percentage, student_feedback,
      innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
      a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
      a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
      publications_count, books_count, patents_count,
      grants_amount, fdp_attended, events_organized, self_appraisal_score, goals_next_year, status,
      part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    staffId, academic_year, courses_taught, pass_percentage, student_feedback,
    innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
    a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
    a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
    publications_count || 0, books_count || 0, patents_count || 0,
    grants_amount, fdp_attended, events_organized, self_appraisal_score || total_fpi_score, goals_next_year, 'Submitted',
    part_a_score || 0, part_b_score || 0, part_c_score || 0, part_d_score || 0, total_fpi_score || 0
  ], function(err) {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    
    // Trigger appraisal confirmation email to faculty
    sendAppraisalConfirmationEmail(staffId, req.body);

    res.json({ success: true, id: this.lastID, message: 'Annual Appraisal Form submitted successfully!' });
  });
});

// 12a. PUT Update Existing Appraisal Form (Faculty Edit Before Final Submit)
router.put('/appraisal/:id', authenticateToken, (req, res) => {
  const appId = req.params.id;
  const staffId = req.user.staffId || req.user.staff_id;
  const {
    academic_year, courses_taught, pass_percentage, student_feedback,
    innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
    a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
    a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
    publications_count, books_count, patents_count,
    grants_amount, fdp_attended, events_organized, self_appraisal_score, goals_next_year,
    part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score
  } = req.body;

  if (!academic_year || !academic_year.trim()) {
    return res.status(400).json({ error: 'Academic Year is required.' });
  }

  db.get('SELECT * FROM staff_appraisal WHERE id = ?', [appId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    if (!row) return res.status(404).json({ error: 'Appraisal record not found.' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'principal' || req.user.role === 'hr';
    if (!isAdmin && row.staff_id !== staffId) {
      return res.status(403).json({ error: 'Unauthorized: You can only edit your own appraisal form.' });
    }

    db.run(`
      UPDATE staff_appraisal SET
        academic_year = ?,
        courses_taught = ?,
        pass_percentage = ?,
        student_feedback = ?,
        innovative_methods = ?,
        a1_ict_tools = ?,
        a2_econtent = ?,
        a3_lab_experiments = ?,
        a4_feedback_scores = ?,
        a5_pass_percentage = ?,
        a6_industry_partnerships = ?,
        a7_hackathons = ?,
        b4_curriculum_dev = ?,
        b7_industry_training = ?,
        c3_community_service = ?,
        publications_count = ?,
        books_count = ?,
        patents_count = ?,
        grants_amount = ?,
        fdp_attended = ?,
        events_organized = ?,
        self_appraisal_score = ?,
        goals_next_year = ?,
        status = 'Submitted',
        submitted_at = CURRENT_TIMESTAMP,
        part_a_score = ?,
        part_b_score = ?,
        part_c_score = ?,
        part_d_score = ?,
        total_fpi_score = ?
      WHERE id = ?
    `, [
      academic_year, courses_taught, pass_percentage, student_feedback,
      innovative_methods, a1_ict_tools, a2_econtent, a3_lab_experiments,
      a4_feedback_scores, a5_pass_percentage, a6_industry_partnerships,
      a7_hackathons, b4_curriculum_dev, b7_industry_training, c3_community_service,
      publications_count || 0, books_count || 0, patents_count || 0,
      grants_amount, fdp_attended, events_organized, self_appraisal_score || total_fpi_score, goals_next_year,
      part_a_score || 0, part_b_score || 0, part_c_score || 0, part_d_score || 0, total_fpi_score || 0,
      appId
    ], function(uErr) {
      if (uErr) return res.status(500).json({ error: 'Database update error: ' + uErr.message });
      
      // Trigger appraisal confirmation email to faculty
      sendAppraisalConfirmationEmail(staffId, req.body);

      res.json({ success: true, id: appId, message: 'Annual Appraisal Form updated and submitted successfully!' });
    });
  });
});

// Helper to parse date string into Academic Year (e.g. '2025-2026')
export function getAcademicYearFromDateStr(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str || str.toLowerCase() === 'n/a') return null;

  // Direct Academic Year format like "2025-2026" or "2025 - 2026"
  if (/^\d{4}\s*-\s*\d{4}$/.test(str)) {
    return str.replace(/\s+/g, '').trim();
  }

  let year = null;
  let month = null;

  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const parts = str.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const parts = str.split('/');
    year = parseInt(parts[2], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{1,2}-\d{1,2}-\d{4}/.test(str)) {
    const parts = str.split('-');
    year = parseInt(parts[2], 10);
    month = parseInt(parts[1], 10) - 1;
  } else if (/^\d{4}$/.test(str)) {
    year = parseInt(str, 10);
    month = 6;
  } else {
    // Try matching month name & 4-digit year like "October 2025", "Feb 2026", "2025/10"
    const mYear = str.match(/\b(20\d{2})\b/);
    if (mYear) {
      year = parseInt(mYear[1], 10);
      const lower = str.toLowerCase();
      if (lower.includes('jan')) month = 0;
      else if (lower.includes('feb')) month = 1;
      else if (lower.includes('mar')) month = 2;
      else if (lower.includes('apr')) month = 3;
      else if (lower.includes('may')) month = 4;
      else if (lower.includes('jun')) month = 5;
      else if (lower.includes('jul')) month = 6;
      else if (lower.includes('aug')) month = 7;
      else if (lower.includes('sep')) month = 8;
      else if (lower.includes('oct')) month = 9;
      else if (lower.includes('nov')) month = 10;
      else if (lower.includes('dec')) month = 11;
      else month = 6;
    } else {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        year = d.getFullYear();
        month = d.getMonth();
      }
    }
  }
  if (year === null || isNaN(year)) return null;

  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export function matchesTargetAcademicYear(row, targetAy) {
  if (!targetAy || !targetAy.trim()) return true;
  const cleanTarget = targetAy.replace(/\s+/g, '').trim();

  // 1. Explicit academic_year column on record
  if (row.academic_year && String(row.academic_year).trim() && String(row.academic_year).trim().toLowerCase() !== 'n/a') {
    const recAy = String(row.academic_year).replace(/\s+/g, '').trim();
    return recAy === cleanTarget;
  }

  // 2. Primary event date fields (when the event actually occurred)
  const primaryDateFields = [
    row.from_date, row.eventdate, row.date_con, row.dateofpublication,
    row.month_pub, row.to_date, row.sanctioned_date, row.registered_date,
    row.launch_date, row.year
  ];

  for (const d of primaryDateFields) {
    if (d && String(d).trim().toLowerCase() !== 'n/a' && String(d).trim() !== '') {
      const rowAy = getAcademicYearFromDateStr(d);
      if (rowAy) {
        return rowAy === cleanTarget;
      }
    }
  }

  // 3. Fallback entry/system timestamp fields ONLY if no primary event date exists
  const fallbackDateFields = [row.date, row.created_at];
  for (const d of fallbackDateFields) {
    if (d && String(d).trim().toLowerCase() !== 'n/a' && String(d).trim() !== '') {
      const rowAy = getAcademicYearFromDateStr(d);
      if (rowAy) {
        return rowAy === cleanTarget;
      }
    }
  }

  return false;
}

// 12b. GET Automated FPI Score Summary calculation
router.get('/appraisal/fpi-summary/:staffId', authenticateToken, async (req, res) => {
  const staffId = req.params.staffId;
  const academicYear = req.query.academicYear || req.query.academic_year;

  try {
    const getRows = (query, params = [staffId]) => {
      return new Promise((resolve) => {
        db.all(query, params, (err, rows) => {
          let list = rows || [];
          if (academicYear) {
            list = list.filter(r => matchesTargetAcademicYear(r, academicYear));
          }
          resolve(list);
        });
      });
    };

    const publications = await getRows('SELECT * FROM staff_publication WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const books = await getRows('SELECT * FROM staff_book_published WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const resource = await getRows('SELECT * FROM staff_resource WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const awards = await getRows('SELECT * FROM staff_award WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const funding = await getRows('SELECT * FROM staff_funding WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const ipr = await getRows('SELECT * FROM staff_ipr WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const certs = await getRows('SELECT * FROM staff_certificate WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const events = await getRows('SELECT * FROM staff_event_organized WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const interactions = await getRows('SELECT * FROM staff_interaction WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const scholars = await getRows('SELECT * FROM staff_scholars WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const members = await getRows('SELECT * FROM staff_member WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const seedMoney = await getRows('SELECT * FROM staff_seed_money WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const responsibilities = await getRows('SELECT * FROM staff_responsibilities WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');

    const supervisorRows = await getRows('SELECT * FROM staff_supervisor WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const academicRows = await getRows('SELECT Qualification, Designation FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const personalRows = await getRows('SELECT staff_name FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))');
    const staffName = personalRows[0]?.staff_name || '';
    const qual = academicRows[0]?.Qualification || '';
    const isRecognizedSupervisor = supervisorRows.length > 0;

    // Fetch rubric template for max marks & fixed marks
    const templateRows = await new Promise((resolve) => {
      db.all('SELECT * FROM appraisal_template', [], (err, rows) => resolve(rows || []));
    });
    const templateMap = {};
    templateRows.forEach(row => {
      if (row.criteria_code) templateMap[row.criteria_code] = row;
    });

    const getCriteriaRule = (code, defaultFixed, defaultMax) => {
      const row = templateMap[code];
      const fixedMark = row && row.fixed_mark_per_record !== undefined && row.fixed_mark_per_record !== null && row.fixed_mark_per_record > 0
        ? parseFloat(row.fixed_mark_per_record)
        : defaultFixed;
      const maxMark = row && row.max_marks !== undefined && row.max_marks !== null && row.max_marks > 0
        ? parseFloat(row.max_marks)
        : defaultMax;
      return { fixedMark, maxMark };
    };

    // Part B Calculation (Max 40)
    let scoreB = 0;
    // b1. Memberships
    const ruleB1 = getCriteriaRule('B1', 3, 3);
    const rawB1 = members.length * ruleB1.fixedMark;
    const scoreB1 = Math.min(ruleB1.maxMark, rawB1);
    scoreB += scoreB1;

    // b2. Resource Speaker
    const ruleB2 = getCriteriaRule('B2', 2, 4);
    const rawB2 = resource.length * ruleB2.fixedMark;
    const scoreB2 = Math.min(ruleB2.maxMark, rawB2);
    scoreB += scoreB2;

    // b3. FDP/STTP Participation from staff_interaction
    const ruleB3 = getCriteriaRule('B3', 2.5, 5);
    let rawB3 = 0;
    interactions.forEach(item => {
      let days = 1;
      const d1 = getAcademicYearFromDateStr(item.from_date) ? new Date(item.from_date) : null;
      const d2 = getAcademicYearFromDateStr(item.to_date) ? new Date(item.to_date) : null;
      if (d1 && d2 && d2 >= d1) {
        days = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      } else if (item.duration || item.duration_weeks) {
        const dur = String(item.duration || item.duration_weeks).toLowerCase();
        if (dur.includes('5') || dur.includes('week') || dur.includes('6') || dur.includes('7')) days = 5;
      }
      rawB3 += days >= 5 ? ruleB3.fixedMark : 2.0;
    });
    const scoreB3 = Math.min(ruleB3.maxMark, rawB3);
    scoreB += scoreB3;

    // b5. Organized FDP/Conferences
    const ruleB5 = getCriteriaRule('B5', 4, 8);
    const rawB5 = events.length * ruleB5.fixedMark;
    const scoreB5 = Math.min(ruleB5.maxMark, rawB5);
    scoreB += scoreB5;

    // b6. Online Certifications (SWAYAM/NPTEL)
    const ruleB6 = getCriteriaRule('B6', 5, 10);
    const rawB6 = certs.length * ruleB6.fixedMark;
    const scoreB6 = Math.min(ruleB6.maxMark, rawB6);
    scoreB += scoreB6;

    const finalPartB = Math.min(40, scoreB);

    // Part C Calculation (Max 80)
    let scoreC = 0;

    // c1. Journal Publications (10 marks each, max 20) & c2. Conference Proceedings / Books / Book Chapters (5 marks each, max 10)
    const journalPubs = publications.filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
    const confPubs = publications.filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));

    const ruleC1 = getCriteriaRule('C1', 10, 20);
    const rawC1 = journalPubs.length * ruleC1.fixedMark;
    const scoreC1 = Math.min(ruleC1.maxMark, rawC1);
    scoreC += scoreC1;

    const ruleC2 = getCriteriaRule('C2', 5, 10);
    const rawC2 = (confPubs.length + books.length) * ruleC2.fixedMark;
    const scoreC2 = Math.min(ruleC2.maxMark, rawC2);
    scoreC += scoreC2;

    // c4. IPR / Patents / Copyrights
    const ruleC4 = getCriteriaRule('C4', 10, 10);
    let rawC4 = 0;
    ipr.forEach(p => {
      const st = (p.status || '').toLowerCase();
      if (st.includes('grant')) rawC4 += ruleC4.fixedMark;
      else if (st.includes('pub')) rawC4 += (ruleC4.fixedMark * 0.7);
      else rawC4 += (ruleC4.fixedMark * 0.3);
    });
    const scoreC4 = Math.min(ruleC4.maxMark, rawC4);
    scoreC += scoreC4;

    // c5. Research Grants
    const ruleC5 = getCriteriaRule('C5', 10, 15);
    let rawC5 = 0;
    funding.forEach(f => {
      const amt = parseFloat(f.amount) || 0;
      const st = (f.status || '').toLowerCase();
      if (st.includes('sanc') || st.includes('grant') || st.includes('rec')) {
        rawC5 += amt > 500000 ? ruleC5.fixedMark : (ruleC5.fixedMark * 0.8);
      } else {
        rawC5 += (ruleC5.fixedMark * 0.5);
      }
    });
    const scoreC5 = Math.min(ruleC5.maxMark, rawC5);
    scoreC += scoreC5;

    // c6. Seed Money & Consultancy
    const ruleC6 = getCriteriaRule('C6', 5, 10);
    const rawC6 = seedMoney.length * ruleC6.fixedMark;
    const scoreC6 = Math.min(ruleC6.maxMark, rawC6);
    scoreC += scoreC6;

    // c8. Research Scholars
    const ruleC8 = getCriteriaRule('C8', 2.5, 5);
    let rawC8 = 0;
    let scoreC8 = 0;
    if (isRecognizedSupervisor) {
      rawC8 = scholars.length * ruleC8.fixedMark;
      scoreC8 = Math.min(ruleC8.maxMark, rawC8);
      scoreC += scoreC8;
    }

    // c9. Awards
    const ruleC9 = getCriteriaRule('C9', 5, 5);
    const rawC9 = awards.length * ruleC9.fixedMark;
    const scoreC9 = Math.min(ruleC9.maxMark, rawC9);
    scoreC += scoreC9;

    const finalPartC = Math.min(80, scoreC);

    // Part D Calculation (Max 20: 10 per Dept level max 10 cap, 10 per Institutional level max 20 cap)
    const ruleD1 = getCriteriaRule('D1', 10, 20);
    let collegeCount = 0;
    let deptCount = 0;
    responsibilities.forEach(r => {
      const lvl = (r.level || '').toLowerCase();
      if (lvl.includes('college') || lvl.includes('inst')) {
        collegeCount++;
      } else {
        deptCount++;
      }
    });
    const deptScore = Math.min(10, deptCount * 10);
    const collegeScore = Math.min(20, collegeCount * 10);
    const rawD1 = deptScore + collegeScore;
    const finalPartD = Math.min(20, rawD1);

    res.json({
      part_b_score: finalPartB,
      part_c_score: finalPartC,
      part_d_score: finalPartD,
      is_recognized_supervisor: isRecognizedSupervisor,
      counts: {
        publications: publications.length,
        books: books.length,
        patents: ipr.length,
        funding: funding.length,
        seed_money: seedMoney.length,
        certs: certs.length,
        events: events.length,
        memberships: members.length,
        awards: awards.length,
        responsibilities: responsibilities.length
      },
      details: {
        publications,
        books,
        ipr,
        funding,
        seedMoney,
        certs,
        events,
        members,
        awards,
        responsibilities,
        interactions,
        resource,
        scholars,
        is_recognized_supervisor: isRecognizedSupervisor
      },
      breakdown: {
        b1_memberships: scoreB1,
        b2_resource: scoreB2,
        b3_interactions: scoreB3,
        b5_events: scoreB5,
        b6_certs: scoreB6,
        c1_publications: scoreC1,
        c2_books: scoreC2,
        c4_ipr: scoreC4,
        c5_funding: scoreC5,
        c6_seed_money: scoreC6,
        c8_scholars: isRecognizedSupervisor ? scoreC8 : 'N/A',
        c9_awards: scoreC9,
        d_responsibilities: finalPartD
      },
      rawBreakdown: {
        c1_publications: { count: journalPubs.length, fixedMark: ruleC1.fixedMark, rawScore: rawC1, cappedScore: scoreC1, maxMark: ruleC1.maxMark },
        c2_books: { count: confPubs.length + books.length, fixedMark: ruleC2.fixedMark, rawScore: rawC2, cappedScore: scoreC2, maxMark: ruleC2.maxMark },
        c4_ipr: { count: ipr.length, fixedMark: ruleC4.fixedMark, rawScore: rawC4, cappedScore: scoreC4, maxMark: ruleC4.maxMark },
        c5_funding: { count: funding.length, fixedMark: ruleC5.fixedMark, rawScore: rawC5, cappedScore: scoreC5, maxMark: ruleC5.maxMark },
        c6_seed_money: { count: seedMoney.length, fixedMark: ruleC6.fixedMark, rawScore: rawC6, cappedScore: scoreC6, maxMark: ruleC6.maxMark },
        c8_scholars: { count: scholars.length, fixedMark: ruleC8.fixedMark, rawScore: rawC8, cappedScore: scoreC8, maxMark: ruleC8.maxMark },
        c9_awards: { count: awards.length, fixedMark: ruleC9.fixedMark, rawScore: rawC9, cappedScore: scoreC9, maxMark: ruleC9.maxMark },
        b1_memberships: { count: members.length, fixedMark: ruleB1.fixedMark, rawScore: rawB1, cappedScore: scoreB1, maxMark: ruleB1.maxMark },
        b2_resource: { count: resource.length, fixedMark: ruleB2.fixedMark, rawScore: rawB2, cappedScore: scoreB2, maxMark: ruleB2.maxMark },
        b3_interactions: { count: interactions.length, fixedMark: ruleB3.fixedMark, rawScore: rawB3, cappedScore: scoreB3, maxMark: ruleB3.maxMark },
        b5_events: { count: events.length, fixedMark: ruleB5.fixedMark, rawScore: rawB5, cappedScore: scoreB5, maxMark: ruleB5.maxMark },
        b6_certs: { count: certs.length, fixedMark: ruleB6.fixedMark, rawScore: rawB6, cappedScore: scoreB6, maxMark: ruleB6.maxMark },
        d_responsibilities: { count: responsibilities.length, fixedMark: ruleD1.fixedMark, rawScore: rawD1, cappedScore: finalPartD, maxMark: ruleD1.maxMark }
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate FPI score: ' + err.message });
  }
});

// 12c. GET General Information for FPI Appraisal Form
router.get('/appraisal/general-info/:staffId', authenticateToken, (req, res) => {
  let staffId = req.params.staffId;
  if (!staffId || staffId === 'undefined' || staffId === 'null') {
    staffId = req.user.staffId || req.user.username || req.user.id;
  }

  db.get(`
    SELECT 
      COALESCE(NULLIF(TRIM(a.staff_name), ''), NULLIF(TRIM(p.staff_name), ''), TRIM(?)) as staff_name,
      COALESCE(NULLIF(TRIM(a.Department), ''), '') as Department,
      COALESCE(NULLIF(TRIM(a.Designation), ''), '') as Designation,
      a.Date_of_joining,
      a.Qualification,
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
      a.total_exp_months
    FROM staff_academics a
    LEFT JOIN staff_personal p ON LOWER(TRIM(a.staff_id)) = LOWER(TRIM(p.staff_id))
    WHERE LOWER(TRIM(a.staff_id)) = LOWER(TRIM(?))
       OR LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?))
       OR LOWER(TRIM(p.email)) = LOWER(TRIM(?))
  `, [req.user.name || '', staffId, staffId, staffId], (err, acadRow) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    const row = acadRow || {};

    db.all('SELECT * FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (eErr, eduRows) => {
      const edu = eduRows || [];
      const highestQual = getHighestQualification(edu, row.Qualification);
      const exp = calculateExperience(row, new Date());

      // Query staff_scholars table (Research Scholars page) for faculty's own Ph.D status
      db.all('SELECT * FROM staff_scholars WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (sErr, scholarRows) => {
        const scholars = scholarRows || [];

        let phdStatus = 'Yet to Register';
        const pursuingStatuses = [
          'provisionally registered', 'provisionally confirmed', 
          'submitted synopsis', 'submitted thesis', 'pursuing', 'registered', 'course work'
        ];

        let foundScholarStatus = null;
        if (scholars.length > 0) {
          const latestScholar = scholars[scholars.length - 1];
          const st = (latestScholar.status || '').toLowerCase().trim();
          if (st.includes('degree awarded') || st.includes('completed') || st.includes('awarded')) {
            foundScholarStatus = 'Completed';
          } else if (pursuingStatuses.some(k => st.includes(k))) {
            foundScholarStatus = 'Pursuing';
          } else if (st) {
            foundScholarStatus = 'Pursuing';
          }
        }

        if (foundScholarStatus) {
          phdStatus = foundScholarStatus;
        } else {
          let hasPhdEdu = false;
          let isCompletedPhd = false;

          edu.forEach(item => {
            const str = `${item.category || ''} ${item.degree || ''} ${item.specialization || ''}`.toLowerCase();
            if (str.includes('ph.d') || str.includes('phd') || str.includes('doctor')) {
              hasPhdEdu = true;
              if (item.year && item.year.trim().length === 4) {
                isCompletedPhd = true;
              }
            }
          });

          const qualLower = (row.Qualification || '').toLowerCase();
          const nameLower = (row.staff_name || req.user.name || '').toLowerCase();
          if (nameLower.includes('dr.') || nameLower.includes('dr ') || qualLower.includes('ph.d') || qualLower.includes('phd')) {
            hasPhdEdu = true;
            isCompletedPhd = true;
          }

          if (isCompletedPhd) {
            phdStatus = 'Completed';
          } else if (hasPhdEdu) {
            phdStatus = 'Pursuing';
          } else {
            phdStatus = 'Yet to Register';
          }
        }

        db.all('SELECT * FROM staff_department_history WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)) ORDER BY id DESC', [staffId], (hErr, histRows) => {
          let promoText = 'N/A';
          if (histRows && histRows.length > 0) {
            const latest = histRows[0];
            promoText = `Transfer to ${latest.to_dept} (${latest.transfer_date || 'N/A'})`;
          }

          const deptName = row.Department || req.user.department || req.user.dept || '';
          const facultyName = row.staff_name || req.user.name || '';
          const designation = row.Designation || req.user.designation || '';
          const doj = row.Date_of_joining || 'N/A';

          const prevExpText = `${row.prev_exp_academic_years || 0} Y, ${row.prev_exp_academic_months || 0} M`;
          const srecExpText = `${exp.exp_srec_years || 0} Y, ${exp.exp_srec_months || 0} M`;
          const totalExpText = `${exp.total_exp_years || 0} Y, ${exp.total_exp_months || 0} M`;
          const industryExpText = `${row.prev_exp_industry_years || 0} Y, ${row.prev_exp_industry_months || 0} M`;

          // Dynamically look up HOD for the faculty's department
          db.get(`
            SELECT staff_name, Designation FROM staff_academics
            WHERE LOWER(TRIM(Department)) = LOWER(TRIM(?))
              AND (Designation LIKE '%HOD%' OR Designation LIKE '%Head%')
            ORDER BY CASE WHEN Designation LIKE '%Prof%HOD%' OR Designation LIKE '%Professor%HOD%' THEN 0 ELSE 1 END, staff_id
            LIMIT 1
          `, [deptName], (hodErr, hodRow) => {
            const hodName = (hodRow && hodRow.staff_name) ? hodRow.staff_name : null;

            // Dynamically look up Principal from staff_academics
            db.get(`
              SELECT staff_name FROM staff_academics
              WHERE Designation LIKE '%Principal%'
                AND Designation NOT LIKE '%Vice%'
                AND Designation NOT LIKE '%Physical%'
              ORDER BY staff_id
              LIMIT 1
            `, [], (pErr, principalRow) => {
              const principalName = (principalRow && principalRow.staff_name) ? principalRow.staff_name : null;

              res.json({
                departmentName: deptName,
                facultyName: facultyName,
                designation: designation,
                qualification: highestQual || row.Qualification || 'M.E. / M.Tech.',
                doj: doj,
                promotionDetails: promoText,
                prevExp: prevExpText,
                srecExp: srecExpText,
                totalTeachingExp: totalExpText,
                industryExp: industryExpText,
                phdStatus: phdStatus,
                hodName: hodName,
                principalName: principalName
              });
            });
          });
        });
      });
    });
  });
});

// 12d. POST — Faculty digitally signs their submitted appraisal
router.post('/appraisal/:id/sign/faculty', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const id = req.params.id;
  const signedAt = new Date().toISOString();
  const signedName = req.user.name || staffId;
  const signedIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // First verify this appraisal belongs to the requesting faculty
  db.get('SELECT id FROM staff_appraisal WHERE id = ? AND LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [id, staffId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Appraisal not found or unauthorized' });

    db.run(
      `UPDATE staff_appraisal SET faculty_signed_at = ?, faculty_signed_name = ?, faculty_signed_ip = ? WHERE id = ?`,
      [signedAt, signedName, signedIp, id],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, signedAt, signedName, signedIp });
      }
    );
  });
});

// 12e. POST — HOD digitally signs an appraisal after review
router.post('/appraisal/:id/sign/hod', authenticateToken, (req, res) => {
  const id = req.params.id;
  const signedAt = new Date().toISOString();
  const signedName = req.user.name || req.user.staffId;
  const signedIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  db.run(
    `UPDATE staff_appraisal SET hod_signed_at = ?, hod_signed_name = ?, hod_signed_ip = ? WHERE id = ?`,
    [signedAt, signedName, signedIp, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Appraisal not found' });
      res.json({ success: true, signedAt, signedName, signedIp });
    }
  );
});

// 12f. POST — Principal digitally signs an appraisal (final sign-off)
router.post('/appraisal/:id/sign/principal', authenticateToken, (req, res) => {
  const id = req.params.id;
  const signedAt = new Date().toISOString();
  const signedName = req.user.name || req.user.staffId;
  const signedIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  db.run(
    `UPDATE staff_appraisal SET principal_signed_at = ?, principal_signed_name = ?, principal_signed_ip = ? WHERE id = ?`,
    [signedAt, signedName, signedIp, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Appraisal not found' });
      res.json({ success: true, signedAt, signedName, signedIp });
    }
  );
});

// 13. DELETE Appraisal
router.delete('/appraisal/:id', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  const id = req.params.id;

  db.run('DELETE FROM staff_appraisal WHERE id = ? AND staff_id = ?', [id, staffId], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

// 14. GET Responsibilities
router.get('/responsibilities', authenticateToken, (req, res) => {
  const isDeptAdmin = req.user.role === 'dept_admin';
  const isAdmin = req.user.role === 'admin';
  const isHod = req.user.isHod || (req.user.designation || '').toLowerCase().includes('hod') || (req.user.designation || '').toLowerCase().includes('head');
  const reqStaffId = req.query.staffId;

  if (reqStaffId) {
    db.all(`
      SELECT r.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name, r.staff_id) as staff_name, a.Department, a.Designation
      FROM staff_responsibilities r
      LEFT JOIN staff_academics a ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(r.staff_id)) = LOWER(TRIM(?))
      ORDER BY r.id DESC
    `, [reqStaffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else if (isDeptAdmin || isHod) {
    let dept = (req.user.department || '').trim();

    const fetchDeptResponsibilities = (departmentName) => {
      db.all(`
        SELECT r.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name, r.staff_id) as staff_name, COALESCE(a.Department, r.department) as Department, a.Designation
        FROM staff_responsibilities r
        LEFT JOIN staff_academics a ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(a.staff_id))
        LEFT JOIN staff_personal p ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(p.staff_id))
        WHERE TRIM(LOWER(a.Department)) IN (
          SELECT TRIM(LOWER(name)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(acronym)) FROM departments WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) OR TRIM(LOWER(acronym)) = TRIM(LOWER(?))
          UNION
          SELECT TRIM(LOWER(?))
        ) 
        OR TRIM(LOWER(r.department)) = TRIM(LOWER(?))
        OR LOWER(TRIM(r.assigned_by)) IN (SELECT LOWER(TRIM(staff_name)) FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)))
        ORDER BY r.id DESC
      `, [departmentName, departmentName, departmentName, departmentName, departmentName, departmentName, req.user.staffId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
      });
    };

    if (!dept) {
      db.get('SELECT Department FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [req.user.staffId], (err, row) => {
        dept = row ? (row.Department || '').trim() : '';
        fetchDeptResponsibilities(dept);
      });
    } else {
      fetchDeptResponsibilities(dept);
    }
  } else if (isAdmin) {
    db.all(`
      SELECT r.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name, r.staff_id) as staff_name, a.Department, a.Designation
      FROM staff_responsibilities r
      LEFT JOIN staff_academics a ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(p.staff_id))
      ORDER BY r.id DESC
    `, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  } else {
    // Regular Faculty query - match by staff_id OR staff_name OR label
    db.all(`
      SELECT r.*, COALESCE(NULLIF(p.staff_name, ''), a.staff_name, r.staff_id) as staff_name, a.Department, a.Designation
      FROM staff_responsibilities r
      LEFT JOIN staff_academics a ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(a.staff_id))
      LEFT JOIN staff_personal p ON LOWER(TRIM(r.staff_id)) = LOWER(TRIM(p.staff_id))
      WHERE LOWER(TRIM(r.staff_id)) = LOWER(TRIM(?))
         OR LOWER(TRIM(r.staff_id)) LIKE '%' || LOWER(TRIM(?)) || '%'
         OR LOWER(TRIM(p.staff_name)) IN (SELECT LOWER(TRIM(staff_name)) FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)))
         OR LOWER(TRIM(r.staff_id)) IN (SELECT LOWER(TRIM(staff_name)) FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?)))
         OR LOWER(TRIM(r.staff_id)) LIKE '%' || (SELECT LOWER(TRIM(staff_name)) FROM staff_personal WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))) || '%'
      ORDER BY r.id DESC
    `, [req.user.staffId, req.user.staffId, req.user.staffId, req.user.staffId, req.user.staffId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    });
  }
});

// 15. POST Responsibility (HOD / Principal / HR / Admin)
router.post('/responsibility', authenticateToken, (req, res) => {
  let { staff_id, responsibility, academic_year, level } = req.body;

  if (!staff_id || !staff_id.trim()) {
    return res.status(400).json({ error: 'Faculty selection is required.' });
  }
  if (!responsibility || !responsibility.trim()) {
    return res.status(400).json({ error: 'Additional responsibility description is required.' });
  }

  const isInstitutionalAdmin = req.user.role === 'admin' || req.user.isInstitutionalAdmin || (req.user.designation || '').toLowerCase().includes('principal') || (req.user.designation || '').toLowerCase().includes('hr');
  const isHod = req.user.isHod || req.user.role === 'dept_admin';

  if (!isHod && !isInstitutionalAdmin) {
    return res.status(403).json({ error: 'Access denied: Only active Head of Department (HOD), Department Admin, or Institutional Admin can assign additional responsibilities.' });
  }

  const finalLevel = level || (isInstitutionalAdmin ? 'Institutional Level' : 'Department Level');

  const doInsert = (cleanStaffId, deptName) => {
    const assignedBy = req.user.name || req.user.username || 'HOD / Principal';

    db.run(`
      INSERT INTO staff_responsibilities (staff_id, assigned_by, department, academic_year, responsibility, level)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [cleanStaffId, assignedBy, deptName, academic_year || '2026-2027', responsibility.trim(), finalLevel], function(err) {
      if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
      res.json({ success: true, id: this.lastID, message: 'Additional responsibility assigned successfully!' });
    });
  };

  let targetStaffId = staff_id.trim();

  if (targetStaffId.includes('(')) {
    const rawName = targetStaffId.split('(')[0].trim();
    db.get('SELECT staff_id FROM staff_personal WHERE LOWER(TRIM(staff_name)) = LOWER(TRIM(?))', [rawName], (err, row) => {
      if (row && row.staff_id) {
        targetStaffId = row.staff_id;
      }
      resolveDeptAndInsert(targetStaffId);
    });
  } else {
    resolveDeptAndInsert(targetStaffId);
  }

  function resolveDeptAndInsert(finalStaffId) {
    if (req.user.department) {
      doInsert(finalStaffId, req.user.department);
    } else {
      db.get('SELECT Department FROM staff_academics WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [req.user.staffId], (err, row) => {
        const userDept = row ? (row.Department || 'N/A') : 'N/A';
        doInsert(finalStaffId, userDept);
      });
    }
  }
});

// 16. DELETE Responsibility
router.delete('/responsibility/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const isInstitutionalAdmin = req.user.role === 'admin' || req.user.isInstitutionalAdmin || (req.user.designation || '').toLowerCase().includes('principal') || (req.user.designation || '').toLowerCase().includes('hr');

  db.get('SELECT level FROM staff_responsibilities WHERE id = ?', [id], (err, row) => {
    if (row && row.level === 'Institutional Level' && !isInstitutionalAdmin) {
      return res.status(403).json({ error: 'Access denied: Institutional level responsibilities can only be deleted by Principal, HR, or System Administrators.' });
    }

    db.run('DELETE FROM staff_responsibilities WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

// 17. PUT Update Responsibility
router.put('/responsibility/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  let { staff_id, responsibility, academic_year, level } = req.body;

  if (!staff_id || !staff_id.trim()) {
    return res.status(400).json({ error: 'Faculty selection is required.' });
  }
  if (!responsibility || !responsibility.trim()) {
    return res.status(400).json({ error: 'Additional responsibility description is required.' });
  }

  const isInstitutionalAdmin = req.user.role === 'admin' || req.user.isInstitutionalAdmin || (req.user.designation || '').toLowerCase().includes('principal') || (req.user.designation || '').toLowerCase().includes('hr');

  db.get('SELECT level FROM staff_responsibilities WHERE id = ?', [id], (err, row) => {
    if (row && row.level === 'Institutional Level' && !isInstitutionalAdmin) {
      return res.status(403).json({ error: 'Access denied: Institutional level responsibilities can only be edited by Principal, HR, or System Administrators.' });
    }

    const finalLevel = level || (isInstitutionalAdmin ? 'Institutional Level' : 'Department Level');

    const doUpdate = (cleanStaffId) => {
      db.run(`
        UPDATE staff_responsibilities 
        SET staff_id = ?, academic_year = ?, responsibility = ?, level = ?
        WHERE id = ?
      `, [cleanStaffId, academic_year || '2026-2027', responsibility.trim(), finalLevel, id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
        res.json({ success: true, message: 'Additional responsibility updated successfully!' });
      });
    };

    let targetStaffId = staff_id.trim();
    if (targetStaffId.includes('(')) {
      const rawName = targetStaffId.split('(')[0].trim();
      db.get('SELECT staff_id FROM staff_personal WHERE LOWER(TRIM(staff_name)) = LOWER(TRIM(?))', [rawName], (err, row) => {
        if (row && row.staff_id) {
          targetStaffId = row.staff_id;
        }
        doUpdate(targetStaffId);
      });
    } else {
      doUpdate(targetStaffId);
    }
  });
});

// Check supervisor eligibility & dynamic role claims endpoint
router.get('/check-supervisor-eligibility', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  if (req.user.role === 'admin' || req.user.role === 'dept_admin') {
    return res.json({
      isSupervisorEligible: true,
      isHod: req.user.role === 'dept_admin',
      department: req.user.department || '',
      designation: req.user.role === 'dept_admin' ? 'Head of Department' : 'Administrator'
    });
  }

  db.get(`
    SELECT p.staff_name, a.Qualification, a.Department, a.Designation 
    FROM staff_personal p 
    LEFT JOIN staff_academics a ON LOWER(TRIM(p.staff_id)) = LOWER(TRIM(a.staff_id)) 
    WHERE LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?))
  `, [staffId], (err, row) => {
    const staffName = row ? (row.staff_name || '') : '';
    const qualification = row ? (row.Qualification || '') : '';
    const designation = row ? (row.Designation || '') : '';
    const department = row ? (row.Department || '') : '';
    const lowerDesg = designation.toLowerCase();
    const isHod = lowerDesg.includes('hod') || lowerDesg.includes('head');
    const isInstitutionalAdmin = lowerDesg.includes('principal') || lowerDesg.includes('hr');

    db.all('SELECT category, degree, specialization FROM staff_edu WHERE LOWER(TRIM(staff_id)) = LOWER(TRIM(?))', [staffId], (eErr, eduRows) => {
      const lowerName = staffName.toLowerCase();
      const isDr = lowerName.includes('dr.') || lowerName.includes('dr ');
      const checkPhd = (str) => {
        const s = (str || '').toUpperCase();
        return s.includes('PH.D') || s.includes('PHD') || s.includes('DOCTOR');
      };
      const isPhd = checkPhd(qualification) || (eduRows || []).some(e => checkPhd(e.category) || checkPhd(e.degree) || checkPhd(e.specialization));
      const isSupervisorEligible = isDr || isPhd;

      return res.json({ isSupervisorEligible, name: staffName, isHod, department, designation, isInstitutionalAdmin });
    });
  });
});

// 19. GET Dynamic Club Coordinator status for logged in faculty
router.get('/my-clubs', authenticateToken, (req, res) => {
  const staffId = req.user.staffId;
  if (!staffId) {
    return res.json({ isClubCoordinator: false, clubs: [] });
  }

  db.all('SELECT name FROM clubs WHERE LOWER(TRIM(faculty_incharge_id)) = LOWER(TRIM(?))', [staffId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const clubs = (rows || []).map(r => r.name);
    return res.json({ isClubCoordinator: clubs.length > 0, clubs });
  });
});

export default router;
