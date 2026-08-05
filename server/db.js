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

const MYSQL_HOST = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || process.env.DB_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'srec_fis';

let pool = null;

// Initialize MySQL database & pool asynchronously
const initDb = async () => {
  try {
    // 1. Connect without database to ensure database exists
    const tempConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD
    });

    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConn.end();

    // 2. Create pool connected to MYSQL_DATABASE
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      decimalNumbers: true
    });

    console.log(`Connected to MySQL database "${MYSQL_DATABASE}" on ${MYSQL_HOST}:${MYSQL_PORT}`);

    // 3. Create all tables
    await createTables();
  } catch (err) {
    console.error('MySQL connection error:', err.message);
  }
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
      joining_report_file TEXT
    )`,
    // 5. staff_academics
    `CREATE TABLE IF NOT EXISTS staff_academics (
      staff_id VARCHAR(100) PRIMARY KEY,
      staff_name TEXT,
      Date_of_joining TEXT,
      Department TEXT,
      Designation TEXT,
      Qualification TEXT,
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
      grant_category TEXT
    )`,
    // 13. staff_ipr
    `CREATE TABLE IF NOT EXISTS staff_ipr (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id VARCHAR(100),
      staff_name TEXT,
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
      membership_type TEXT
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
      status VARCHAR(50) DEFAULT 'Submitted',
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
      final_approved_at DATETIME
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
      max_marks DOUBLE DEFAULT 10,
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
    )`
  ];

  for (const query of tables) {
    try {
      await pool.query(query);
    } catch (e) {
      console.error('Table creation error:', e.message);
    }
  }

  // Safe column migration for staff_appraisal
  const extraCols = [
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_a_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_b_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_c_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_part_d_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_total_score TEXT',
    'ALTER TABLE staff_appraisal ADD COLUMN final_remarks TEXT'
  ];
  for (const alterQuery of extraCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for staff_publication
  const pubCols = [
    'ALTER TABLE staff_publication ADD COLUMN author_position VARCHAR(100)',
    'ALTER TABLE staff_publication ADD COLUMN pub_status VARCHAR(100)',
    'ALTER TABLE staff_publication ADD COLUMN paper_url VARCHAR(500)',
    'ALTER TABLE staff_publication ADD COLUMN conf_venue VARCHAR(255)',
    'ALTER TABLE staff_publication ADD COLUMN conf_dates VARCHAR(100)'
  ];
  for (const alterQuery of pubCols) {
    try { await pool.query(alterQuery); } catch (e) {}
  }

  // Safe column migration for staff_academics (Bibliometrics & Identifiers)
  const academicCols = [
    'ALTER TABLE staff_academics ADD COLUMN orcid_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN scholar_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN scopus_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN wos_id VARCHAR(100)',
    'ALTER TABLE staff_academics ADD COLUMN h_index INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN i10_index INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN total_citations INT DEFAULT 0',
    'ALTER TABLE staff_academics ADD COLUMN last_citation_sync DATETIME'
  ];
  for (const alterQuery of academicCols) {
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

  // Seed default appraisal template if empty
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM appraisal_template');
    if (rows[0].count === 0) {
      const defaultItems = [
        ['PART_A', 'PART A: Teaching Learning Process', 'A1', 'Use of Innovative ICT Tools', '5 marks per innovative ICT tool integrated in course delivery', 'manual', 10, 1],
        ['PART_A', 'PART A: Teaching Learning Process', 'A2', 'E-Content Development', '5 marks per e-content / video lecture launched on YouTube/LMS', 'manual', 10, 2],
        ['PART_A', 'PART A: Teaching Learning Process', 'A3', 'Development of New Experiments / Labs', '5 marks per new lab experiment or virtual lab manual developed', 'manual', 10, 3],
        ['PART_A', 'PART A: Teaching Learning Process', 'A4', 'Student Feedback Rating', '5 marks for >=4.0 rating, 3 marks for 2.5-3.9 rating', 'manual', 10, 4],
        ['PART_A', 'PART A: Teaching Learning Process', 'A5', 'End Semester Course Pass Percentage', '10 marks for >=80% pass rate, 5 marks for 60-79% pass rate', 'manual', 10, 5],
        ['PART_A', 'PART A: Teaching Learning Process', 'A6', 'Value Added Courses / Industry Workshops Organized', '5 marks per value added course or industry workshop delivered', 'manual', 5, 6],
        ['PART_A', 'PART A: Teaching Learning Process', 'A7', 'Mentoring Students in Hackathons & Competitions', '5 marks for winning/finalist mentoring in national hackathons', 'manual', 5, 7],
        ['PART_B', 'PART B: Professional Development Activities', 'B1', 'Professional Society Memberships', 'Automatic mapping: 2.5 marks per active professional society membership', 'auto', 5, 8],
        ['PART_B', 'PART B: Professional Development Activities', 'B2', 'Resource Speaker / Session Chair', 'Automatic mapping: 5 marks per invited talk / resource person role', 'auto', 10, 9],
        ['PART_B', 'PART B: Professional Development Activities', 'B3', 'External Academic / Professional Interactions', 'Automatic mapping: 2.5 marks per external interaction detail', 'auto', 5, 10],
        ['PART_B', 'PART B: Professional Development Activities', 'B4', 'Professional Development Programs / FDPs / NPTEL', 'Automatic mapping: 5 marks per FDP / NPTEL certification completed', 'auto', 10, 11],
        ['PART_B', 'PART B: Professional Development Activities', 'B5', 'Professional Certifications Earned', 'Automatic mapping: 2.5 marks per professional certification earned', 'auto', 5, 12],
        ['PART_B', 'PART B: Professional Development Activities', 'B6', 'Industrial Training / Internship Completed', '5 marks per industrial training or corporate fellowship completed', 'manual', 5, 13],
        ['PART_C', 'PART C: Research & Consultancy', 'C1', 'Research Publications in Indexed Journals', 'Automatic mapping: 10 marks per Scopus/WoS publication, 5 per UGC', 'auto', 20, 14],
        ['PART_C', 'PART C: Research & Consultancy', 'C2', 'Books & Book Chapters Published', 'Automatic mapping: 5 marks per book or book chapter published', 'auto', 10, 15],
        ['PART_C', 'PART C: Research & Consultancy', 'C3', 'Research Proposals Submitted / Grants Sanctioned', 'Automatic mapping: 5 marks per proposal, 10 per sanctioned grant', 'auto', 15, 16],
        ['PART_C', 'PART C: Research & Consultancy', 'C4', 'Patents & IPR Filed / Granted', 'Automatic mapping: 5 marks per patent filed, 10 per patent granted', 'auto', 10, 17],
        ['PART_C', 'PART C: Research & Consultancy', 'C5', 'Seed Money & Internal Research Grants', 'Automatic mapping: 5 marks per internal seed money grant received', 'auto', 5, 18],
        ['PART_D', 'PART D: Institutional Development & Contribution', 'D1', 'Departmental & Institutional Assigned Responsibilities', 'Automatic mapping: 5 marks per assigned institutional responsibility', 'auto', 20, 19],
        ['PART_D', 'PART D: Institutional Development & Contribution', 'D2', 'Student Mentoring & Counseling Contributions', '5 marks for active student counseling and mentee performance tracking', 'manual', 10, 20],
        ['PART_D', 'PART D: Institutional Development & Contribution', 'D3', 'Contribution to NBA / NAAC / Autonomous Accreditations', '5 marks for active module coordination in accreditations', 'manual', 10, 21]
      ];

      for (const item of defaultItems) {
        await pool.query(`
          INSERT INTO appraisal_template (section_code, section_title, criteria_code, criteria_title, rubric_description, mapping_type, max_marks, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE criteria_title = VALUES(criteria_title)
        `, item);
      }
    }
  } catch (e) {}

  // Seed default System Admin account if empty
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin');
    if (rows[0].count === 0) {
      const hashedPass = bcrypt.hashSync('admin123', 10);
      await pool.query('INSERT INTO admin (staff_id, password) VALUES (?, ?)', ['SREC1024', hashedPass]);
    }
  } catch (e) {}

  // Auto-generate/update Database_Schema.docx Word document
  exec('python3 ../scripts/generate_schema_doc.py', (err) => {
    if (!err) {
      console.log('Database_Schema.docx auto-updated successfully.');
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
  }
};

export default dbWrapper;
