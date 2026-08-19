import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { exec } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const uploadDir = path.resolve(__dirname, 'uploads');
const docsDir = path.resolve(uploadDir, 'document');
const profilePicsDir = path.resolve(uploadDir, 'upload');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(profilePicsDir)) fs.mkdirSync(profilePicsDir, { recursive: true });

let MYSQL_HOST = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
let MYSQL_PORT = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
let MYSQL_USER = process.env.MYSQL_USER || process.env.DB_USER || 'root';
let MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || '';
let MYSQL_DATABASE = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'srec_fis';

let pool = null;

// Initialize MySQL database & pool asynchronously with intelligent credential fallback
const initDb = async () => {
  let activeUser = MYSQL_USER;
  let activePassword = MYSQL_PASSWORD;
  let connected = false;

  const candidateCredentials = [
    { user: activeUser, password: activePassword },
    { user: 'fis_user', password: 'SREC_Secure_Pass_2026' },
    { user: 'root', password: '' }
  ];

  for (const cred of candidateCredentials) {
    try {
      // 1. Connect to verify and create database if missing
      const tempConn = await mysql.createConnection({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: cred.user,
        password: cred.password
      });

      await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await tempConn.end();

      // 2. Create pool connected to MYSQL_DATABASE
      pool = mysql.createPool({
        host: MYSQL_HOST,
        port: MYSQL_PORT,
        user: cred.user,
        password: cred.password,
        database: MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        decimalNumbers: true
      });

      activeUser = cred.user;
      activePassword = cred.password;
      connected = true;
      console.log(`Connected to MySQL database "${MYSQL_DATABASE}" on ${MYSQL_HOST}:${MYSQL_PORT} (user: ${activeUser})`);
      break;
    } catch (connErr) {
      // If access denied, attempt next candidate credential
      if (connErr.code === 'ER_ACCESS_DENIED_ERROR' || connErr.errno === 1045) {
        continue;
      }
      console.error('MySQL connection attempt error:', connErr.message);
    }
  }

  if (!connected) {
    console.error('MySQL connection error: All candidate database credentials exhausted.');
    return;
  }

  // 3. Create all tables
  await createTables();
};

// Asynchronous DDL table setup
const createTables = async () => {
  if (!pool) return;

  const tables = [
    // 1. admin
    `CREATE TABLE IF NOT EXISTS admin (
      staff_id VARCHAR(100) PRIMARY KEY,
      password TEXT
    )`,
    // 2. admin_dep
    `CREATE TABLE IF NOT EXISTS admin_dep (
      staff_id VARCHAR(100) PRIMARY KEY,
      Department TEXT,
      password TEXT
    )`,
    // 3. staff_user
    `CREATE TABLE IF NOT EXISTS staff_user (
      staff_id VARCHAR(100) PRIMARY KEY,
      password TEXT,
      file TEXT,
      is_relieved INT DEFAULT 0
    )`,
    // 4. staff_personal
    `CREATE TABLE IF NOT EXISTS staff_personal (
      staff_id VARCHAR(100) PRIMARY KEY,
      staff_name TEXT,
      dob TEXT,
      gender TEXT,
      address TEXT,
      mobile TEXT,
      email TEXT,
      pan TEXT,
      aadhar TEXT,
      type TEXT,
      aicte_id TEXT,
      anna_univ_id TEXT,
      apaar_id TEXT,
      pan_file TEXT,
      aadhar_file TEXT,
      appointment_order_file TEXT,
      joining_report_file TEXT,
      passport_file TEXT
    )`,
    // 5. staff_academics
    `CREATE TABLE IF NOT EXISTS staff_academics (
      staff_id VARCHAR(100) PRIMARY KEY,
      staff_name TEXT,
      Date_of_joining TEXT,
      Department TEXT,
      Designation TEXT,
      Qualification TEXT,
      area_of_specialization TEXT,
      date_designated_prof TEXT,
      nature_of_association VARCHAR(100) DEFAULT 'REGULAR',
      contractual_type VARCHAR(100) DEFAULT '-',
      date_of_leaving TEXT,
      prev_exp_academic_years INT DEFAULT 0,
      prev_exp_academic_months INT DEFAULT 0,
      prev_exp_industry_years INT DEFAULT 0,
      prev_exp_industry_months INT DEFAULT 0,
      total_prev_exp_years INT DEFAULT 0,
      total_prev_exp_months INT DEFAULT 0,
      has_no_prev_exp INT DEFAULT 0,
      exp_srec_years INT DEFAULT 0,
      exp_srec_months INT DEFAULT 0,
      total_exp_years INT DEFAULT 0,
      total_exp_months INT DEFAULT 0
    )`,
    // 6. staff_edu
    `CREATE TABLE IF NOT EXISTS staff_edu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      category TEXT,
      degree TEXT,
      specialization TEXT,
      institute TEXT,
      board TEXT,
      year TEXT,
      percentage DOUBLE,
      file TEXT,
      type TEXT,
      size DOUBLE
    )`,
    // 7. staff_interaction
    `CREATE TABLE IF NOT EXISTS staff_interaction (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      type TEXT,
      title TEXT,
      from_date TEXT,
      to_date TEXT,
      organizer TEXT,
      file TEXT,
      type1 TEXT,
      size DOUBLE,
      date TEXT
    )`,
    // 8. staff_publication
    `CREATE TABLE IF NOT EXISTS staff_publication (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      type_pub TEXT,
      type TEXT,
      title TEXT,
      journel TEXT,
      date_con TEXT,
      organizer TEXT,
      doi TEXT,
      isbn TEXT,
      month_pub TEXT,
      volume_pub TEXT,
      pp TEXT,
      index_pub TEXT,
      web_of_science TEXT,
      citations INT DEFAULT 0,
      hindex INT DEFAULT 0,
      impact DOUBLE DEFAULT 0,
      file TEXT,
      type1 TEXT,
      size DOUBLE,
      issn_no TEXT,
      issue_no TEXT,
      co_authors TEXT
    )`,
    // 9. staff_book_published
    `CREATE TABLE IF NOT EXISTS staff_book_published (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      title TEXT,
      coauthor TEXT,
      publisher TEXT,
      edition TEXT,
      isbn TEXT,
      file TEXT,
      type TEXT,
      size DOUBLE,
      date TEXT,
      dateofpublication TEXT
    )`,
    // 10. staff_resource
    `CREATE TABLE IF NOT EXISTS staff_resource (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      type TEXT,
      title TEXT,
      actedas TEXT,
      from_date TEXT,
      to_date TEXT,
      organizer TEXT,
      ben INT DEFAULT 0,
      file TEXT,
      type1 TEXT,
      size DOUBLE,
      date TEXT
    )`,
    // 11. staff_award
    `CREATE TABLE IF NOT EXISTS staff_award (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      awardname TEXT,
      awardby TEXT,
      event TEXT,
      awa_date TEXT,
      file TEXT,
      type TEXT,
      size DOUBLE,
      date TEXT
    )`,
    // 12. staff_funding
    `CREATE TABLE IF NOT EXISTS staff_funding (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      copiname TEXT,
      copiid TEXT,
      title TEXT,
      fa TEXT,
      status TEXT,
      date TEXT,
      amount DOUBLE DEFAULT 0,
      referenceno TEXT,
      file TEXT,
      faculty_role TEXT,
      grant_category TEXT,
      project_type TEXT,
      from_date TEXT,
      to_date TEXT
    )`,
    // 13. staff_ipr
    `CREATE TABLE IF NOT EXISTS staff_ipr (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      ip_type VARCHAR(100) DEFAULT 'Patent',
      patent TEXT,
      institution TEXT,
      generation TEXT,
      propose TEXT,
      file TEXT,
      type TEXT,
      size DOUBLE,
      date TEXT,
      patent_status TEXT
    )`,
    // 14. staff_certificate
    `CREATE TABLE IF NOT EXISTS staff_certificate (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      course_name TEXT,
      mark DOUBLE DEFAULT 0,
      organisation TEXT,
      data_of_exam TEXT,
      file TEXT,
      type1 TEXT,
      size DOUBLE,
      date TEXT,
      duration_weeks TEXT
    )`,
    // 15. staff_competitive
    `CREATE TABLE IF NOT EXISTS staff_competitive (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      exam_name TEXT,
      level TEXT,
      score DOUBLE DEFAULT 0,
      date_of_certificate TEXT,
      date TEXT,
      file TEXT
    )`,
    // 16. staff_innovative
    `CREATE TABLE IF NOT EXISTS staff_innovative (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      project_title TEXT,
      description TEXT,
      from_date TEXT,
      to_date TEXT,
      status TEXT,
      date TEXT
    )`,
    // 17. staff_development
    `CREATE TABLE IF NOT EXISTS staff_development (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type TEXT,
      staff_name TEXT,
      coname TEXT,
      staff_id VARCHAR(100),
      coid TEXT,
      title TEXT,
      from_date TEXT,
      to_date TEXT,
      year_aca TEXT,
      status TEXT,
      institution TEXT,
      revenue DOUBLE DEFAULT 0,
      date TEXT
    )`,
    // 18. staff_scholars
    `CREATE TABLE IF NOT EXISTS staff_scholars (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      res_id TEXT,
      staff_name TEXT,
      university TEXT,
      sup_name TEXT,
      desgination TEXT,
      organisation TEXT,
      status TEXT,
      date TEXT,
      file TEXT,
      supervisor_type TEXT,
      registration_year TEXT
    )`,
    // 19. staff_supervisor
    `CREATE TABLE IF NOT EXISTS staff_supervisor (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      res_sup_id TEXT,
      staff_name TEXT,
      supj TEXT,
      university TEXT,
      \`internal\` INT DEFAULT 0,
      \`external\` INT DEFAULT 0,
      scholar TEXT,
      date TEXT,
      recognition_month_year TEXT,
      file TEXT
    )`,
    // 20. staff_club
    `CREATE TABLE IF NOT EXISTS staff_club (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      club TEXT,
      type TEXT,
      title TEXT,
      from_date TEXT,
      to_date TEXT,
      organizer TEXT,
      res_person TEXT,
      ben_person TEXT,
      sponsership TEXT,
      granted DOUBLE DEFAULT 0,
      date TEXT,
      file TEXT,
      role TEXT
    )`,
    // 21. staff_member
    `CREATE TABLE IF NOT EXISTS staff_member (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      membershipid TEXT,
      organization TEXT,
      membership_type TEXT,
      file TEXT,
      type TEXT,
      size DOUBLE,
      date TEXT
    )`,
    // 22. staff_event_organized
    `CREATE TABLE IF NOT EXISTS staff_event_organized (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      type TEXT,
      title TEXT,
      from_date TEXT,
      to_date TEXT,
      organizer TEXT,
      res_person TEXT,
      ben_person TEXT,
      sponsership TEXT,
      granted DOUBLE DEFAULT 0,
      date TEXT,
      file TEXT,
      role TEXT
    )`,
    // 23. staff_pan
    `CREATE TABLE IF NOT EXISTS staff_pan (
      staff_id VARCHAR(100) PRIMARY KEY,
      staff_name TEXT,
      path1 TEXT
    )`,
    // 24. staff_aadhar
    `CREATE TABLE IF NOT EXISTS staff_aadhar (
      staff_id VARCHAR(100) PRIMARY KEY,
      staff_name TEXT,
      path1 TEXT
    )`,
    // 25. departments lookup
    `CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      acronym VARCHAR(100)
    )`,
    // 26. university lookup
    `CREATE TABLE IF NOT EXISTS university (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uni_name VARCHAR(255) UNIQUE
    )`,
    // 27. professional societies lookup
    `CREATE TABLE IF NOT EXISTS professional (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pro_name VARCHAR(255) UNIQUE
    )`,
    // 28. staff_appraisal
    `CREATE TABLE IF NOT EXISTS staff_appraisal (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      academic_year VARCHAR(50) NOT NULL,
      courses_taught TEXT,
      pass_percentage TEXT,
      student_feedback TEXT,
      innovative_methods TEXT,
      a1_ict_tools TEXT,
      a2_econtent TEXT,
      a3_lab_experiments TEXT,
      a4_feedback_scores TEXT,
      a5_pass_percentage TEXT,
      a6_industry_partnerships TEXT,
      a7_hackathons TEXT,
      b4_curriculum_dev TEXT,
      b7_industry_training TEXT,
      c3_community_service TEXT,
      publications_count INT DEFAULT 0,
      books_count INT DEFAULT 0,
      patents_count INT DEFAULT 0,
      grants_amount TEXT,
      fdp_attended TEXT,
      events_organized TEXT,
      self_appraisal_score TEXT,
      goals_next_year TEXT,
      status VARCHAR(50) DEFAULT 'Draft',
      remarks TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      part_a_score TEXT,
      part_b_score TEXT,
      part_c_score TEXT,
      part_d_score TEXT,
      total_fpi_score TEXT,
      hod_part_a_score TEXT,
      hod_part_b_score TEXT,
      hod_part_c_score TEXT,
      hod_part_d_score TEXT,
      hod_total_score TEXT,
      hod_remarks TEXT,
      hod_approved_at DATETIME,
      final_part_a_score TEXT,
      final_part_b_score TEXT,
      final_part_c_score TEXT,
      final_part_d_score TEXT,
      final_total_score TEXT,
      final_remarks TEXT,
      final_approved_by TEXT,
      final_approved_at DATETIME,
      faculty_signed_at VARCHAR(100) DEFAULT NULL,
      faculty_signed_name VARCHAR(255) DEFAULT NULL,
      faculty_signed_ip VARCHAR(100) DEFAULT NULL,
      hod_signed_at VARCHAR(100) DEFAULT NULL,
      hod_signed_name VARCHAR(255) DEFAULT NULL,
      hod_signed_ip VARCHAR(100) DEFAULT NULL,
      principal_signed_at VARCHAR(100) DEFAULT NULL,
      principal_signed_name VARCHAR(255) DEFAULT NULL,
      principal_signed_ip VARCHAR(100) DEFAULT NULL
    )`,
    // 29. staff_seed_money
    `CREATE TABLE IF NOT EXISTS staff_seed_money (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
      title TEXT,
      faculty_role TEXT,
      sanctioned_date TEXT,
      duration TEXT,
      amount DOUBLE DEFAULT 0,
      entry_type TEXT,
      client_type TEXT,
      consultants TEXT,
      status TEXT,
      from_date TEXT,
      to_date TEXT,
      file TEXT
    )`,
    // 30. appraisal_template
    `CREATE TABLE IF NOT EXISTS appraisal_template (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_code VARCHAR(50) NOT NULL,
      section_title TEXT NOT NULL,
      criteria_code VARCHAR(50) UNIQUE NOT NULL,
      criteria_title TEXT NOT NULL,
      rubric_description TEXT,
      mapping_type VARCHAR(50) DEFAULT 'manual',
      fixed_mark_per_record DOUBLE DEFAULT 0,
      max_marks DOUBLE DEFAULT 10,
      calculation_rule VARCHAR(100) DEFAULT 'fixed_per_record',
      bracket_config TEXT,
      data_source_page VARCHAR(100) DEFAULT NULL,
      target_designation VARCHAR(100) DEFAULT 'ALL',
      display_order INT DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    // 31. staff_responsibilities
    `CREATE TABLE IF NOT EXISTS staff_responsibilities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      assigned_by TEXT NOT NULL,
      department TEXT NOT NULL,
      academic_year VARCHAR(50) DEFAULT '2026-2027',
      responsibility TEXT NOT NULL,
      level VARCHAR(100) DEFAULT 'Department Level',
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 32. designations lookup
    `CREATE TABLE IF NOT EXISTS designations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      des_name VARCHAR(255)
    )`,
    // 33. clubs lookup
    `CREATE TABLE IF NOT EXISTS clubs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      club_name VARCHAR(255),
      category VARCHAR(100)
    )`,
    // 34. dynamic_pages
    `CREATE TABLE IF NOT EXISTS dynamic_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) DEFAULT 'standalone',
      portals TEXT,
      fields LONGTEXT,
      icon VARCHAR(100) DEFAULT 'FileText',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 35. dynamic_page_data
    `CREATE TABLE IF NOT EXISTS dynamic_page_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_id INT NOT NULL,
      staff_id VARCHAR(100) NOT NULL,
      staff_name VARCHAR(255),
      department VARCHAR(100),
      data LONGTEXT,
      file TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 36. staff_department_history
    `CREATE TABLE IF NOT EXISTS staff_department_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      from_dept VARCHAR(255) NOT NULL,
      to_dept VARCHAR(255) NOT NULL,
      transfer_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 37. system_page_configs
    `CREATE TABLE IF NOT EXISTS system_page_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'activity',
      portals TEXT,
      icon VARCHAR(100) DEFAULT 'FileText',
      fields LONGTEXT,
      publication_type_constraints LONGTEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    // 38. staff_designation_history
    `CREATE TABLE IF NOT EXISTS staff_designation_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      designation VARCHAR(150) NOT NULL,
      department VARCHAR(150) NOT NULL,
      effective_date DATE NOT NULL,
      order_no VARCHAR(100),
      order_file TEXT,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 39. system_audit_log
    `CREATE TABLE IF NOT EXISTS system_audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      actor_id VARCHAR(100),
      actor_name VARCHAR(150),
      actor_role VARCHAR(50),
      action_type VARCHAR(100),
      target_id VARCHAR(100),
      target_name VARCHAR(150),
      details TEXT,
      ip_address VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 40. system_announcements
    `CREATE TABLE IF NOT EXISTS system_announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(50) DEFAULT 'General',
      target_audience VARCHAR(50) DEFAULT 'ALL',
      department VARCHAR(100),
      is_active INT DEFAULT 1,
      valid_until DATE,
      created_by VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 41. staff_push_subscriptions
    `CREATE TABLE IF NOT EXISTS staff_push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 42. document_ai_processing (Audit trail for AI/OCR extractions, confidences, duplicate checks, faculty verification)
    `CREATE TABLE IF NOT EXISTS document_ai_processing (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      original_filename TEXT NOT NULL,
      saved_filename TEXT,
      file_hash VARCHAR(64),
      file_size INT,
      mime_type VARCHAR(100),
      classification_category VARCHAR(100),
      classification_confidence DOUBLE,
      extracted_fields LONGTEXT,
      field_confidences LONGTEXT,
      faculty_modified_fields LONGTEXT,
      status VARCHAR(50) DEFAULT 'processed',
      is_duplicate INT DEFAULT 0,
      duplicate_details TEXT,
      activity_type VARCHAR(100),
      created_record_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    // 43. publication_authors (Normalized 1-publication-to-multiple-SREC-faculty co-author relationships)
    `CREATE TABLE IF NOT EXISTS publication_authors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      publication_id INT NOT NULL,
      staff_id VARCHAR(100) NOT NULL,
      staff_name VARCHAR(255),
      author_position VARCHAR(100) DEFAULT 'Co-Author',
      author_order INT DEFAULT 1,
      is_confirmed INT DEFAULT 1,
      match_type VARCHAR(100) DEFAULT 'primary_creator',
      match_confidence DOUBLE DEFAULT 1.0,
      orcid VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pub_id (publication_id),
      INDEX idx_pub_staff (staff_id)
    )`,
    // 44. appraisal_revision_history (Audit log of appraisal states, HOD remarks, returns, revisions)
    `CREATE TABLE IF NOT EXISTS appraisal_revision_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      appraisal_id INT NOT NULL,
      revision_number INT DEFAULT 1,
      status VARCHAR(100) NOT NULL,
      remarks TEXT,
      actor_id VARCHAR(100),
      actor_name VARCHAR(255),
      actor_role VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_appraisal_rev_id (appraisal_id)
    )`,
    // 45. event_design_templates (V3.2 Institutional Design Suite Templates: Posters, Invitations, Certificates)
    `CREATE TABLE IF NOT EXISTS event_design_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      template_id VARCHAR(50) UNIQUE NOT NULL,
      template_name VARCHAR(150) NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      preview_image TEXT,
      is_active INT DEFAULT 1,
      is_default INT DEFAULT 0,
      layout_config LONGTEXT,
      version VARCHAR(20) DEFAULT '1.0',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tmpl_type (type),
      INDEX idx_tmpl_active (is_active)
    )`,
    // 46. event_generated_documents (V3.2 Audit & Record of Generated Posters, Invitations, and Bulk Certificate Batches)
    `CREATE TABLE IF NOT EXISTS event_generated_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100) NOT NULL,
      event_id INT DEFAULT NULL,
      event_title VARCHAR(255) NOT NULL,
      design_type VARCHAR(50) NOT NULL,
      template_id VARCHAR(50) NOT NULL,
      file_path TEXT NOT NULL,
      preview_path TEXT,
      file_format VARCHAR(20) DEFAULT 'pdf',
      certificate_count INT DEFAULT 1,
      certificate_batch_id VARCHAR(100) DEFAULT NULL,
      version INT DEFAULT 1,
      is_latest TINYINT(1) DEFAULT 1,
      package_id INT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'COMPLETED',
      metadata_json LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_event_gen_staff (staff_id),
      INDEX idx_event_gen_event (event_id),
      INDEX idx_event_gen_type (design_type),
      INDEX idx_event_doc_ver (event_id, design_type, version)
    )`,
    // 47. event_design_packages (V3.2.1 One-Click Complete Event Packages & Audit Log)
    `CREATE TABLE IF NOT EXISTS event_design_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      staff_id VARCHAR(100) NOT NULL,
      department VARCHAR(255) NOT NULL,
      event_title VARCHAR(255) NOT NULL,
      poster_template VARCHAR(50),
      invitation_template VARCHAR(50),
      certificate_template VARCHAR(50),
      participant_count INT DEFAULT 0,
      cert_range_start VARCHAR(100),
      cert_range_end VARCHAR(100),
      package_filename VARCHAR(255),
      file_path TEXT,
      generation_status VARCHAR(50) DEFAULT 'COMPLETED',
      poster_status VARCHAR(50) DEFAULT 'SUCCESS',
      invitation_status VARCHAR(50) DEFAULT 'SUCCESS',
      certificate_status VARCHAR(50) DEFAULT 'SUCCESS',
      summary_status VARCHAR(50) DEFAULT 'SUCCESS',
      idempotency_key VARCHAR(100) DEFAULT NULL,
      error_details TEXT,
      metadata_json LONGTEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pkg_event (event_id),
      INDEX idx_pkg_staff (staff_id),
      INDEX idx_pkg_dept (department),
      INDEX idx_pkg_idempotency (idempotency_key)
    )`
  ];

  for (const query of tables) {
    try {
      await pool.query(query);
    } catch (e) {
      console.error('Table creation error:', e.message);
    }
  }

  // Seed default accredited event design templates for V3.2
  const initialTemplates = [
    // Posters
    { id: 'P01', name: 'Institutional Classic', type: 'POSTER', desc: 'Maroon & Navy formal academic grid with central institutional seal', is_default: 1 },
    { id: 'P02', name: 'Research & Technical', type: 'POSTER', desc: 'Modern dark slate & indigo tech gradient with circuit accents', is_default: 0 },
    { id: 'P03', name: 'Seminar / Guest Lecture', type: 'POSTER', desc: 'Keynote portrait layout with prominent speaker profile and bio highlights', is_default: 0 },
    { id: 'P04', name: 'Workshop / Training', type: 'POSTER', desc: 'Dynamic emerald & teal grid with schedule highlights and registration badges', is_default: 0 },
    { id: 'P05', name: 'Minimal Academic', type: 'POSTER', desc: 'High-elegance minimalist typography with gold & navy borders', is_default: 0 },
    // Invitations
    { id: 'I01', name: 'Formal Institutional', type: 'INVITATION', desc: 'Classic gold-bordered formal invite card with royal blue header', is_default: 1 },
    { id: 'I02', name: 'Chief Guest Invitation', type: 'INVITATION', desc: 'Prominent dignitary honorifics and institutional seal', is_default: 0 },
    { id: 'I03', name: 'Seminar / Workshop', type: 'INVITATION', desc: 'Modern academic card with date, time, and venue highlights', is_default: 0 },
    { id: 'I04', name: 'Conference / Symposium', type: 'INVITATION', desc: 'Sophisticated dual-column schedule and formal invitation text', is_default: 0 },
    { id: 'I05', name: 'Minimal Professional', type: 'INVITATION', desc: 'Clean executive invitation card with refined typography', is_default: 0 },
    // Certificates
    { id: 'C01', name: 'Classic Institutional', type: 'CERTIFICATE', desc: 'Traditional guilloche ornate border, gold foil seal, and formal script', is_default: 1 },
    { id: 'C02', name: 'Modern Academic', type: 'CERTIFICATE', desc: 'Sleek geometric borders with vibrant emerald and sapphire ribbon accent', is_default: 0 },
    { id: 'C03', name: 'Research / Conference', type: 'CERTIFICATE', desc: 'Prestigious conference citation certificate with academic medal emblem', is_default: 0 },
    { id: 'C04', name: 'Workshop / FDP', type: 'CERTIFICATE', desc: 'Professional skill development certificate with training hours breakdown', is_default: 0 },
    { id: 'C05', name: 'Minimal Professional', type: 'CERTIFICATE', desc: 'Crisp, clean corporate-academic certificate layout with dual signature blocks', is_default: 0 }
  ];

  for (const tmpl of initialTemplates) {
    try {
      await pool.query(
        `INSERT IGNORE INTO event_design_templates (template_id, template_name, type, description, is_active, is_default, version)
         VALUES (?, ?, ?, ?, 1, ?, '1.0')`,
        [tmpl.id, tmpl.name, tmpl.type, tmpl.desc, tmpl.is_default]
      );
    } catch (e) {}
  }

  // Safe column migration for staff_appraisal
  const extraCols = [
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_a_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_b_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_c_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_d_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_total_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_remarks TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN faculty_signed_at VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN faculty_signed_name VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN faculty_signed_ip VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN hod_signed_at VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN hod_signed_name VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN hod_signed_ip VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN principal_signed_at VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN principal_signed_name VARCHAR(255) DEFAULT NULL',
    'ALTER TABLE staff_appraisal ADD COLUMN principal_signed_ip VARCHAR(100) DEFAULT NULL'
  ];
  for (const alterQuery of extraCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for staff_personal
  const personalCols = [
    'ALTER TABLE staff_personal ADD COLUMN passport_file TEXT'
  ];
  for (const alterQuery of personalCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for staff_publication
  const pubCols = [
    'ALTER TABLE staff_publication ADD COLUMN author_position VARCHAR(100)',
    'ALTER TABLE staff_publication ADD COLUMN pub_status VARCHAR(100)',
    'ALTER TABLE staff_publication ADD COLUMN paper_url VARCHAR(500)',
    'ALTER TABLE staff_publication ADD COLUMN conf_venue VARCHAR(255)',
    'ALTER TABLE staff_publication ADD COLUMN conf_dates VARCHAR(100)',
    'ALTER TABLE staff_publication ADD COLUMN file_hash VARCHAR(64)'
  ];
  for (const alterQuery of pubCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migrations for file_hash on all activity tables for O(1) duplicate detection
  const hashCols = [
    'ALTER TABLE staff_interaction ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_award ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_funding ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_ipr ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_certificate ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_event_organized ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_member ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_seed_money ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_resource ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_book_published ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_scholars ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_club ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_development ADD COLUMN file_hash VARCHAR(64)',
    'ALTER TABLE staff_competitive ADD COLUMN file_hash VARCHAR(64)'
  ];
  for (const alterQuery of hashCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }
  try { await pool.query('ALTER TABLE staff_club ADD COLUMN role TEXT'); } catch (e) {}

  // Align table collations for safe joins
  try {
    await pool.query("ALTER TABLE publication_authors CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
  } catch (e) {}

  // Populate publication_authors for existing publications if missing
  try {
    const [existingPubs] = await pool.query(`
      SELECT p.id, p.staff_id, p.staff_name, p.author_position 
      FROM staff_publication p 
      WHERE p.id NOT IN (SELECT publication_id FROM publication_authors) AND p.staff_id IS NOT NULL
    `);
    if (existingPubs && existingPubs.length > 0) {
      for (const pub of existingPubs) {
        await pool.query(
          'INSERT INTO publication_authors (publication_id, staff_id, staff_name, author_position, author_order, is_confirmed, match_type) VALUES (?, ?, ?, ?, 1, 1, ?)',
          [pub.id, pub.staff_id, pub.staff_name || '', pub.author_position || 'First Author', 'primary_creator']
        );
      }
      console.log(`[Publication Migration] Linked ${existingPubs.length} existing publications into publication_authors.`);
    }
  } catch (pubMigErr) {
    console.error('Publication authors migration error:', pubMigErr.message);
  }

  // Safe column migration for staff_academics (Bibliometrics, Identifiers & NBA B2 Compliance)
  const academicCols = [
    'ALTER TABLE staff_academics ADD COLUMN orcid_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN scholar_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN scopus_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN wos_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN h_index INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN i10_index INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN total_citations INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN last_citation_sync DATETIME',
    'ALTER TABLE staff_academics ADD COLUMN area_of_specialization TEXT',
    'ALTER TABLE staff_academics ADD COLUMN date_designated_prof TEXT',
    "ALTER TABLE staff_academics ADD COLUMN nature_of_association VARCHAR(100) DEFAULT 'REGULAR'",
    "ALTER TABLE staff_academics ADD COLUMN contractual_type VARCHAR(100) DEFAULT '-'",
    'ALTER TABLE staff_academics ADD COLUMN date_of_leaving TEXT'
  ];
  for (const alterQuery of academicCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for clubs (Faculty Incharge & Co-Faculty Incharge)
  const clubCols = [
    'ALTER TABLE clubs ADD COLUMN faculty_incharge_id VARCHAR(100)',
    'ALTER TABLE clubs ADD COLUMN co_faculty_incharge_id VARCHAR(100)'
  ];
  for (const alterQuery of clubCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for staff_member (file upload support)
  const memberCols = [
    'ALTER TABLE staff_member ADD COLUMN file TEXT',
    'ALTER TABLE staff_member ADD COLUMN type TEXT',
    'ALTER TABLE staff_member ADD COLUMN size DOUBLE',
    'ALTER TABLE staff_member ADD COLUMN date TEXT'
  ];
  for (const alterQuery of memberCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for event_generated_documents (V3.2.1 Document Versioning & Packages)
  const eventDocCols = [
    'ALTER TABLE event_generated_documents ADD COLUMN version INT DEFAULT 1',
    'ALTER TABLE event_generated_documents ADD COLUMN is_latest TINYINT(1) DEFAULT 1',
    'ALTER TABLE event_generated_documents ADD COLUMN package_id INT DEFAULT NULL',
    "ALTER TABLE event_generated_documents ADD COLUMN status VARCHAR(50) DEFAULT 'COMPLETED'"
  ];
  for (const alterQuery of eventDocCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for event_design_packages (V3.2.1 Idempotency & Status)
  const eventPkgCols = [
    'ALTER TABLE event_design_packages ADD COLUMN idempotency_key VARCHAR(100) DEFAULT NULL',
    'ALTER TABLE event_design_packages ADD INDEX idx_pkg_idempotency (idempotency_key)'
  ];
  for (const alterQuery of eventPkgCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Seed default departments if empty
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM departments');
    if (rows[0].count === 0) {
      const officialDepts = [
        { acronym: 'ADMIN', name: 'Admin' },
        { acronym: 'ENG', name: 'English' },
        { acronym: 'ENG (Tamil Discipline)', name: 'English (Tamil Discipline)' },
        { acronym: 'MATHS', name: 'Maths' },
        { acronym: 'G.E - S&H', name: 'Science and Humanities' },
        { acronym: 'PHY', name: 'Physics' },
        { acronym: 'CHEM', name: 'Chemistry' },
        { acronym: 'CIVIL', name: 'Civil Engineering' },
        { acronym: 'MECH', name: 'Mechanical Engineering' },
        { acronym: 'AERO', name: 'Aeronautical Engineering' },
        { acronym: 'EEE', name: 'Electrical & Electronics Engineering' },
        { acronym: 'EIE', name: 'Electronics and Instrumentation Engineering' },
        { acronym: 'BME', name: 'Biomedical Engineering' },
        { acronym: 'ECE', name: 'Electronics and Communication Engineering' },
        { acronym: 'CSE', name: 'Computer Science & Engineering' },
        { acronym: 'M.Tech CSE', name: 'M.Tech Computer Science and Engineering' },
        { acronym: 'IT', name: 'Information Technology' },
        { acronym: 'MBA', name: 'Master of Business Administration' },
        { acronym: 'PHY EDU', name: 'Physical Education' },
        { acronym: 'Placement Cell', name: 'Placement Cell' },
        { acronym: 'R & A', name: 'Robotics and Automation Engineering' },
        { acronym: 'AI & DS', name: 'Artificial Intelligence and Data Science' }
      ];

      for (const d of officialDepts) {
        await pool.query('INSERT INTO departments (name, acronym) VALUES (?, ?) ON DUPLICATE KEY UPDATE acronym = VALUES(acronym)', [d.name, d.acronym]);
      }
    }
  } catch (e) {}

  // Add appraisal_template columns if missing
  try { await pool.query('ALTER TABLE appraisal_template ADD COLUMN fixed_mark_per_record DOUBLE DEFAULT 0'); } catch (e) {}
  try { await pool.query("ALTER TABLE appraisal_template ADD COLUMN calculation_rule VARCHAR(100) DEFAULT 'fixed_per_record'"); } catch (e) {}
  try { await pool.query('ALTER TABLE appraisal_template ADD COLUMN bracket_config TEXT'); } catch (e) {}
  try { await pool.query('ALTER TABLE appraisal_template ADD COLUMN data_source_page VARCHAR(100) DEFAULT NULL'); } catch (e) {}
  try { await pool.query("ALTER TABLE appraisal_template ADD COLUMN target_designation VARCHAR(100) DEFAULT 'ALL'"); } catch (e) {}
  try { await pool.query("ALTER TABLE appraisal_template ADD COLUMN academic_year VARCHAR(20) DEFAULT '2026-2027'"); } catch (e) {}

  // Add staff_appraisals reviewer_remarks column if missing
  try { await pool.query('ALTER TABLE staff_appraisals ADD COLUMN reviewer_remarks TEXT'); } catch (e) {}

  // Ensure criteria_code is VARCHAR(50) NOT NULL, deduplicate existing rows, and add UNIQUE index
  try {
    await pool.query('ALTER TABLE appraisal_template MODIFY COLUMN criteria_code VARCHAR(50) NOT NULL');
    await pool.query(`
      DELETE t1 FROM appraisal_template t1
      INNER JOIN appraisal_template t2 
      WHERE t1.id > t2.id AND t1.criteria_code = t2.criteria_code
    `);
    await pool.query('ALTER TABLE appraisal_template ADD UNIQUE INDEX idx_criteria_code (criteria_code)');
  } catch (e) {}

  // Seed / Sync default appraisal template
  try {
    const defaultItems = [
      ['PART_A', 'PART A: Teaching Learning Process', 'A1', 'Use of Innovative ICT Tools', '5 marks per innovative ICT tool integrated in course delivery', 'manual', 5, 10, 'fixed_per_record', null, null, 1],
      ['PART_A', 'PART A: Teaching Learning Process', 'A2', 'E-Content Development', '5 marks per e-content / video lecture launched on YouTube/LMS', 'manual', 5, 10, 'fixed_per_record', null, null, 2],
      ['PART_A', 'PART A: Teaching Learning Process', 'A3', 'Development of New Experiments / Labs', '5 marks per new lab experiment or virtual lab manual developed', 'manual', 5, 10, 'fixed_per_record', null, null, 3],
      ['PART_A', 'PART A: Teaching Learning Process', 'A4', 'Student Feedback Rating', '5 marks for >=4.0 rating, 3 marks for <4.0 rating', 'manual', 5, 5, 'bracket_rating', JSON.stringify({ rating_threshold: 4.0, high_score: 5, low_score: 3 }), null, 4],
      ['PART_A', 'PART A: Teaching Learning Process', 'A5', 'End Semester Course Pass Percentage', '10 marks for >=80% pass rate, 5 marks for 60-79% pass rate', 'manual', 10, 10, 'bracket_rating', JSON.stringify({ pass_threshold: 80, high_score: 10, low_score: 5 }), null, 5],
      ['PART_A', 'PART A: Teaching Learning Process', 'A6', 'Value Added Courses / Industry Workshops Organized', '5 marks per value added course or industry workshop delivered', 'manual', 5, 5, 'fixed_per_record', null, null, 6],
      ['PART_A', 'PART A: Teaching Learning Process', 'A7', 'Mentoring Students in Hackathons & Competitions', '10 marks for Prize Won, 5 marks for Participation', 'manual', 10, 10, 'bracket_rating', JSON.stringify({ prize_score: 10, participation_score: 5 }), null, 7],
      ['PART_B', 'PART B: Professional Development Activities', 'B1', 'Professional Society Memberships', 'Automatic mapping: 3 marks per active professional society membership', 'auto', 3, 3, 'fixed_per_record', null, 'memberships', 8],
      ['PART_B', 'PART B: Professional Development Activities', 'B2', 'Resource Speaker / Session Chair', 'Automatic mapping: 2 marks per invited talk / resource person role', 'auto', 2, 4, 'fixed_per_record', null, 'resource', 9],
      ['PART_B', 'PART B: Professional Development Activities', 'B3', 'External Academic / Professional Interactions', 'Automatic mapping: 2.5 marks per external interaction detail', 'auto', 2.5, 5, 'fixed_per_record', null, 'interactions', 10],
      ['PART_B', 'PART B: Professional Development Activities', 'B4', 'Curriculum Development & Board of Studies (BOS)', '5 marks for active BoS membership / syllabus revision', 'manual', 5, 5, 'fixed_per_record', null, null, 11],
      ['PART_B', 'PART B: Professional Development Activities', 'B5', 'Organizing FDPs / Conferences / Symposia', 'Automatic mapping: 4 marks per national/international conference, FDP, or symposium organized [Max 8 pts]', 'auto', 4, 8, 'fixed_per_record', null, 'events', 12],
      ['PART_B', 'PART B: Professional Development Activities', 'B6', 'Online Certifications (SWAYAM / NPTEL / Coursera)', 'Automatic mapping: 5 marks for 8/12 week course, 2.5 for 4 week', 'auto', 5, 10, 'bracket_rating', JSON.stringify({ long_course_score: 5, short_course_score: 2.5 }), 'certs', 13],
      ['PART_B', 'PART B: Professional Development Activities', 'B7', 'Industrial Training / Corporate Internship Completed', '5 marks per industrial training completed', 'manual', 5, 5, 'fixed_per_record', null, null, 14],
      ['PART_C', 'PART C: Research & Consultancy', 'C1', 'Research Publications in Journals & Conferences', 'Automatic mapping: 10 marks per Journal, 5 per Conference', 'auto', 10, 20, 'pub_type_split', JSON.stringify({ journal_score: 10, conf_score: 5 }), 'publications', 15],
      ['PART_C', 'PART C: Research & Consultancy', 'C2', 'Books & Book Chapters Published', 'Automatic mapping: 5 marks per book or book chapter published', 'auto', 5, 10, 'fixed_per_record', null, 'books', 16],
      ['PART_C', 'PART C: Research & Consultancy', 'C3', 'Community Service & Extension Activities', '5 marks per community outreach project', 'manual', 5, 5, 'fixed_per_record', null, null, 17],
      ['PART_C', 'PART C: Research & Consultancy', 'C4', 'IPR, Patents & Copyrights', 'Automatic mapping: 10 marks for Granted/Registered, 7 for Published, 3 for Filed', 'auto', 10, 10, 'patent_status_split', JSON.stringify({ granted_score: 10, published_score: 7, filed_score: 3 }), 'ipr', 18],
      ['PART_C', 'PART C: Research & Consultancy', 'C5', 'Grants Applied/Received from Government and Non-Government agencies', 'Note: External Grants Only & Equal weightage shall be given to PI & Co-PI. (i) Research Projects: Sanctioned >5L (10m), <=5L (8m), Applied (5m) [Max 10]. (ii) Event Grants (Workshops/Seminars/FDPs): Sanctioned >1L (5m), <=1L (3m), Applied (2m) [Max 5]. Category Max 15 Pts.', 'auto', 10, 15, 'bracket_rating', JSON.stringify({ research_max: 10, research_received_high: 10, research_received_low: 8, research_applied: 5, events_max: 5, events_received_high: 5, events_received_low: 3, events_applied: 2 }), 'funding', 19],
      ['PART_C', 'PART C: Research & Consultancy', 'C6', 'Funded Consultancy Projects / Seed Fund', 'Note: Equal weightage shall be given to PI & Co-PI. (i) Consultancy: Received >1L (5m), <=1L (3m) [Max 5]. (ii) Seed Money for Research: Received (5m), Applied (3m) [Max 5]. Category Max 10 Pts.', 'auto', 5, 10, 'bracket_rating', JSON.stringify({ consultancy_max: 5, consultancy_high: 5, consultancy_low: 3, seed_max: 5, seed_received: 5, seed_applied: 3 }), 'seed_money', 20],
      ['PART_C', 'PART C: Research & Consultancy', 'C7', 'Research Scholars Guidance (Ph.D)', 'Automatic mapping: 2.5 marks per registered Ph.D scholar (Only for Recognized Research Supervisors)', 'auto', 2.5, 5, 'phd_supervisor_gated', JSON.stringify({ scholar_unit_score: 2.5 }), 'scholars', 21],
      ['PART_C', 'PART C: Research & Consultancy', 'C8', 'Awards & Recognitions Received', 'Automatic mapping: 5 marks per national/international award received', 'auto', 5, 5, 'fixed_per_record', null, 'awards', 22],
      ['PART_D', 'PART D: Institutional Development & Contribution', 'D1', 'Assigned Institutional & Departmental Responsibilities', 'Automatic mapping: 10 marks per Institutional role (Max 20), 10 per Departmental role (Max 10). Combined Max 20', 'auto', 10, 20, 'fixed_per_record', null, 'responsibilities', 23],
      ['PART_D', 'PART D: Institutional Development & Contribution', 'D2', 'Student Mentoring & Counseling Contributions', '10 marks for active student counseling tracking', 'manual', 10, 10, 'fixed_per_record', null, null, 24],
      ['PART_D', 'PART D: Institutional Development & Contribution', 'D3', 'Contribution to NBA / NAAC / Autonomous Accreditations', '10 marks for active module coordination in accreditations', 'manual', 10, 10, 'fixed_per_record', null, null, 25]
    ];

    for (const item of defaultItems) {
      await pool.query(`
        INSERT INTO appraisal_template (section_code, section_title, criteria_code, criteria_title, rubric_description, mapping_type, fixed_mark_per_record, max_marks, calculation_rule, bracket_config, data_source_page, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          criteria_title = VALUES(criteria_title),
          rubric_description = VALUES(rubric_description),
          fixed_mark_per_record = VALUES(fixed_mark_per_record),
          max_marks = VALUES(max_marks),
          calculation_rule = VALUES(calculation_rule),
          bracket_config = VALUES(bracket_config),
          data_source_page = VALUES(data_source_page)
      `, item);
    }
  } catch (e) {}

  // Migrate missing columns on staff_funding and staff_seed_money safely
  try {
    await pool.query("ALTER TABLE staff_funding ADD COLUMN project_type TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_funding ADD COLUMN from_date TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_funding ADD COLUMN to_date TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN entry_type TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN client_type TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN consultants TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN status TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN from_date TEXT");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE staff_seed_money ADD COLUMN to_date TEXT");
  } catch (e) {}

  // Seed default System Admin account if empty
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin');
    if (rows[0].count === 0) {
      const hashedPass = bcrypt.hashSync('admin123', 10);
      await pool.query('INSERT INTO admin (staff_id, password) VALUES (?, ?)', ['admin', hashedPass]);
      await pool.query('INSERT INTO admin (staff_id, password) VALUES (?, ?)', ['SREC1024', hashedPass]);
    }
  } catch (e) {}

  // Ensure ip_type column exists on staff_ipr
  try {
    await pool.query("ALTER TABLE staff_ipr ADD COLUMN ip_type VARCHAR(100) DEFAULT 'Patent'");
  } catch (e) {}

  // Clean up any MIME type values stored in activity type columns
  try {
    await pool.query("UPDATE staff_event_organized SET type = 'Workshop' WHERE type LIKE 'application/%' OR type LIKE 'image/%' OR type IS NULL OR type = ''");
    await pool.query("UPDATE staff_interaction SET type = 'FDP' WHERE type LIKE 'application/%' OR type LIKE 'image/%' OR type IS NULL OR type = ''");
    await pool.query("UPDATE staff_resource SET type = 'National' WHERE type LIKE 'application/%' OR type LIKE 'image/%' OR type IS NULL OR type = ''");
  } catch (e) {}

  // Seed default Faculty Member (TE2273) if empty
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM staff_user');
    if (rows[0].count === 0) {
      const hashedPass = bcrypt.hashSync('TE2273', 10);
      await pool.query('INSERT INTO staff_user (staff_id, password) VALUES (?, ?)', ['TE2273', hashedPass]);
      await pool.query(`
        INSERT INTO staff_personal (staff_id, staff_name, email, pan_file)
        VALUES ('TE2273', 'Mr.R.S.VISHNUDURAI', 'vishnudurai.rs@srec.ac.in', 'TE2273_1785317273451-07pan.jpg')
      `);
      await pool.query(`
        INSERT INTO staff_academics (staff_id, staff_name, Date_of_joining, Department, Designation, Qualification)
        VALUES ('TE2273', 'Mr.R.S.VISHNUDURAI', '2022-06-01', 'Artificial Intelligence and Data Science', 'Assistant Professor', 'M.E.')
      `);
    }
  } catch (e) {}

  // Seed sample pending appraisal forms if needed for testing and review
  try {
    const [subRows] = await pool.query("SELECT COUNT(*) as count FROM staff_appraisal WHERE status = 'Submitted'");
    if (subRows[0].count === 0) {
      await pool.query(`
        INSERT INTO staff_appraisal 
          (staff_id, academic_year, self_appraisal_score, part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score, publications_count, books_count, patents_count, grants_amount, status, submitted_at)
        VALUES 
          ('TE0014', '2025-2026', '165 / 200', '50', '35', '60', '20', '165', 3, 1, 1, '₹ 2,50,000', 'Submitted', CURRENT_TIMESTAMP),
          ('TE0015', '2025-2026', '145 / 200', '45', '30', '50', '20', '145', 2, 0, 0, '₹ 1,00,000', 'Submitted', CURRENT_TIMESTAMP)
      `);
    }
    const [hodRows] = await pool.query("SELECT COUNT(*) as count FROM staff_appraisal WHERE status = 'HOD Approved'");
    if (hodRows[0].count === 0) {
      await pool.query(`
        INSERT INTO staff_appraisal 
          (staff_id, academic_year, self_appraisal_score, part_a_score, part_b_score, part_c_score, part_d_score, total_fpi_score, hod_part_a_score, hod_part_b_score, hod_part_c_score, hod_part_d_score, hod_total_score, hod_remarks, status, submitted_at, hod_approved_at)
        VALUES 
          ('TE0011', '2025-2026', '180 / 200', '55', '35', '70', '20', '180', '55', '35', '70', '20', '180', 'Excellent performance in teaching, research, and institutional activities.', 'HOD Approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
    }
  } catch (e) {
    console.error('Seed pending appraisals error:', e.message);
  }

  // Auto-generate/update living Word documentation files
  exec('python3 ../scripts/generate_portal_workflows_doc.py && python3 ../scripts/generate_schema_doc.py && python3 ../scripts/generate_system_constraints_doc.py && python3 ../scripts/generate_tech_file_guide_doc.py', (err) => {
    if (!err) {
      console.log('Complete_3_Portals_Workflow_Guide.docx & system docs auto-updated successfully.');
    }
  });
};

// Start DB initialization
initDb();

// Helper to normalize params and handle callbacks
const dbWrapper = {
  // db.get(sql, params, callback)
  get: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (!params) params = [];

    if (!pool) {
      if (callback) callback(new Error('MySQL Pool not initialized'), null);
      return;
    }

    pool.query(sql, params)
      .then(([rows]) => {
        const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
        if (callback) callback(null, result);
      })
      .catch(err => {
        console.error('db.get Error:', err.message, 'SQL:', sql);
        if (callback) callback(err, null);
      });
  },

  // db.all(sql, params, callback)
  all: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (!params) params = [];

    if (!pool) {
      if (callback) callback(new Error('MySQL Pool not initialized'), []);
      return;
    }

    pool.query(sql, params)
      .then(([rows]) => {
        if (callback) callback(null, Array.isArray(rows) ? rows : []);
      })
      .catch(err => {
        console.error('db.all Error:', err.message, 'SQL:', sql);
        if (callback) callback(err, []);
      });
  },

  // db.run(sql, params, callback)
  run: function (sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (!params) params = [];

    if (!pool) {
      if (callback) callback(new Error('MySQL Pool not initialized'));
      return;
    }

    pool.query(sql, params)
      .then(([result]) => {
        const context = {
          lastID: result ? result.insertId : 0,
          changes: result ? result.affectedRows : 0
        };
        if (callback) callback.call(context, null);
      })
      .catch(err => {
        console.error('db.run Error:', err.message, 'SQL:', sql);
        if (callback) callback.call({ lastID: 0, changes: 0 }, err);
      });
  },

  // db.serialize(fn)
  serialize: (fn) => {
    if (typeof fn === 'function') fn();
  },

  // db.prepare(sql)
  prepare: (sql) => {
    return {
      run: (params, callback) => {
        dbWrapper.run(sql, params, callback);
      },
      finalize: () => {}
    };
  },

  getPool: () => pool
};

export const getPool = () => pool;
export { initDb };
export default dbWrapper;
