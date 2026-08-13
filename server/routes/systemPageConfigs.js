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

// Standard Default Page Configurations for all 19 System Pages
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
  books: {
    page_key: 'books',
    title: 'Book Published',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'BookOpen',
    fields: [
      { name: 'title', label: 'Book Title', type: 'text', required: true, status: 'active' },
      { name: 'coauthor', label: 'Co-Author Details', type: 'text', required: true, status: 'active' },
      { name: 'publisher', label: 'Publisher Name', type: 'text', required: true, status: 'active' },
      { name: 'edition', label: 'Edition', type: 'text', required: true, status: 'active' },
      { name: 'isbn', label: 'ISBN Code', type: 'text', required: true, status: 'active' },
      { name: 'dateofpublication', label: 'Date of Publication', type: 'date', required: true, status: 'active' }
    ]
  },
  awards: {
    page_key: 'awards',
    title: 'Awards Received',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Award',
    fields: [
      { name: 'awardname', label: 'Award Title', type: 'text', required: true, status: 'active' },
      { name: 'awardby', label: 'Awarding Body / Agency', type: 'text', required: true, status: 'active' },
      { name: 'event', label: 'Name of the Event', type: 'text', required: true, status: 'active' },
      { name: 'awa_date', label: 'Date of Award', type: 'date', required: true, status: 'active' }
    ]
  },
  resource: {
    page_key: 'resource',
    title: 'Resource Person Details',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Users',
    fields: [
      { name: 'type', label: 'Scope', type: 'select', options: ['International', 'National', 'State', 'Local'], required: true, status: 'active' },
      { name: 'title', label: 'Topic of Lecture / Talk', type: 'text', required: true, status: 'active' },
      { name: 'actedas', label: 'Role / Designation (e.g. Speaker, Chair)', type: 'text', required: true, status: 'active' },
      { name: 'from_date', label: 'From Date', type: 'date', required: true, status: 'active' },
      { name: 'to_date', label: 'To Date', type: 'date', required: true, status: 'active' },
      { name: 'organizer', label: 'Organizer Agency', type: 'text', required: true, status: 'active' },
      { name: 'ben', label: 'Beneficiary Student/Faculty Count', type: 'number', required: true, status: 'active' }
    ]
  },
  funding: {
    page_key: 'funding',
    title: 'Research Funding',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'FileText',
    fields: [
      { name: 'title', label: 'Project Title', type: 'text', required: true, status: 'active' },
      { name: 'grant_category', label: 'Grant Category', type: 'select', options: ['Research Project', 'Workshop/Seminar/Conference'], required: true, status: 'active' },
      { name: 'faculty_role', label: 'Faculty Role', type: 'select', options: ['PI', 'Co-PI'], required: true, status: 'active' },
      { name: 'copiname', label: 'Co-PI Staff Name', type: 'text', required: true, status: 'active' },
      { name: 'copiid', label: 'Co-PI Staff ID', type: 'text', required: true, status: 'active' },
      { name: 'fa', label: 'Funding Agency Name', type: 'text', required: true, status: 'active' },
      { name: 'status', label: 'Current Status', type: 'select', options: ['Applied', 'Sanctioned', 'Ongoing', 'Completed'], required: true, status: 'active' },
      { name: 'amount', label: 'Sanctioned Amount (INR)', type: 'number', required: true, status: 'active' },
      { name: 'referenceno', label: 'Agency Order Reference', type: 'text', required: true, status: 'active' }
    ]
  },
  seed_money: {
    page_key: 'seed_money',
    title: 'Seed Money for Research',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'FileText',
    fields: [
      { name: 'title', label: 'Research Project Title', type: 'text', required: true, status: 'active' },
      { name: 'faculty_role', label: 'Faculty Role', type: 'select', options: ['PI', 'Co-PI'], required: true, status: 'active' },
      { name: 'sanctioned_date', label: 'Sanctioned Date', type: 'date', required: true, status: 'active' },
      { name: 'duration', label: 'Duration (e.g. 1 Year)', type: 'text', required: true, status: 'active' },
      { name: 'amount', label: 'Amount Sanctioned (INR)', type: 'number', required: true, status: 'active' }
    ]
  },
  ipr: {
    page_key: 'ipr',
    title: 'IPR / Copyrights',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'ShieldAlert',
    fields: [
      { name: 'ip_type', label: 'IPR Category', type: 'select', options: ['Patent', 'Copyright'], required: true, status: 'active' },
      { name: 'patent', label: 'Patent / Design Title', type: 'text', required: true, status: 'active' },
      { name: 'patent_status', label: 'Patent Status', type: 'select', options: ['Filed', 'Published', 'Granted'], required: true, status: 'active' },
      { name: 'institution', label: 'File Number', type: 'text', required: true, status: 'active' },
      { name: 'generation', label: 'Date of Filing/Publication', type: 'date', required: true, status: 'active' },
      { name: 'propose', label: 'Purpose / Brief Summary', type: 'textarea', required: true, status: 'active' }
    ]
  },
  certifications: {
    page_key: 'certifications',
    title: 'Certifications',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'GraduationCap',
    fields: [
      { name: 'course_name', label: 'Course Name', type: 'text', required: true, status: 'active' },
      { name: 'organisation', label: 'Issuing Authority (NPTEL/Coursera)', type: 'text', required: true, status: 'active' },
      { name: 'duration_weeks', label: 'Course Duration (Weeks)', type: 'select', options: ['4 Weeks', '8 Weeks', '12 Weeks'], required: true, status: 'active' },
      { name: 'mark', label: 'Marks / Percentage / Grade', type: 'text', required: true, status: 'active' },
      { name: 'data_of_exam', label: 'Completion Date', type: 'date', required: true, status: 'active' }
    ]
  },
  events: {
    page_key: 'events',
    title: 'Events Organized',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'BarChart2',
    fields: [
      { name: 'type', label: 'Event Category', type: 'select', options: ['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'], required: true, status: 'active' },
      { name: 'title', label: 'Event Name / Title', type: 'text', required: true, status: 'active' },
      { name: 'role', label: 'Organizer Role', type: 'select', options: ['Convener', 'Coordinator', 'Organizing Member'], required: true, status: 'active' },
      { name: 'from_date', label: 'From Date', type: 'date', required: true, status: 'active' },
      { name: 'to_date', label: 'To Date', type: 'date', required: true, status: 'active' },
      { name: 'organizer', label: 'Organizing Department / Venue', type: 'text', required: true, status: 'active' },
      { name: 'res_person', label: 'Resource Person Details', type: 'textarea', required: true, status: 'active' },
      { name: 'ben_person', label: 'Number of Beneficiaries', type: 'number', required: true, status: 'active' },
      { name: 'sponsership', label: 'Sponsor Details', type: 'text', required: true, status: 'active' },
      { name: 'granted', label: 'Sponsorship Grant Amount (INR)', type: 'number', required: true, status: 'active' }
    ]
  },
  memberships: {
    page_key: 'memberships',
    title: 'Professional Memberships',
    category: 'academic',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Users',
    fields: [
      { name: 'membershipid', label: 'Membership ID / Number', type: 'text', required: true, status: 'active' },
      { name: 'organization', label: 'Professional Society / Organization', type: 'text', required: true, status: 'active' },
      { name: 'membership_type', label: 'Membership Type', type: 'select', options: ['Annual Member', 'Life Member'], required: true, status: 'active' }
    ]
  },
  interactions: {
    page_key: 'interactions',
    title: 'Interaction Details',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Users',
    fields: [
      { name: 'type', label: 'Interaction Type', type: 'select', options: ['FDP', 'Seminar', 'Workshop', 'Short Term Course', 'Industry Interaction', 'Webinar', 'Guest Lecture'], required: true, status: 'active' },
      { name: 'title', label: 'Interaction Title', type: 'text', required: true, status: 'active' },
      { name: 'from_date', label: 'From Date', type: 'date', required: true, status: 'active' },
      { name: 'to_date', label: 'To Date', type: 'date', required: true, status: 'active' },
      { name: 'organizer', label: 'Organizer Agency / Venue', type: 'text', required: true, status: 'active' }
    ]
  },
  scholars: {
    page_key: 'scholars',
    title: 'Research Scholar',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'GraduationCap',
    fields: [
      { name: 'res_id', label: 'Scholar Reg / Ref No', type: 'text', required: true, status: 'active' },
      { name: 'staff_name', label: 'Scholar Full Name', type: 'text', required: true, status: 'active' },
      { name: 'registration_year', label: 'Registration Month & Year', type: 'month', required: true, status: 'active' },
      { name: 'supervisor_type', label: 'Supervisor Type', type: 'select', options: ['Internal', 'External'], required: true, status: 'active' },
      { name: 'sup_name', label: 'Supervisor Name', type: 'text', required: true, status: 'active' },
      { name: 'organisation', label: 'Institution', type: 'text', required: true, status: 'active' },
      { name: 'university', label: 'Affiliated University', type: 'text', required: true, status: 'active' },
      { name: 'desgination', label: 'Category', type: 'select', options: ['Full Time', 'Part Time'], required: true, status: 'active' },
      { name: 'status', label: 'Research Status', type: 'select', options: ['Provisionally Registered', 'Provisionally Confirmed', 'Submitted Synopsis', 'Submitted Thesis', 'Degree Awarded'], required: true, status: 'active' }
    ]
  },
  supervisors: {
    page_key: 'supervisors',
    title: 'Research Supervisorship',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Award',
    fields: [
      { name: 'res_sup_id', label: 'Supervisor Reference Number', type: 'text', required: true, status: 'active' },
      { name: 'recognition_month_year', label: 'Recognition Month & Year', type: 'month', required: true, status: 'active' }
    ]
  },
  clubs: {
    page_key: 'clubs',
    title: 'Clubs Activity Organized',
    category: 'activity',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'Award',
    fields: [
      { name: 'club', label: 'Club Name', type: 'text', required: true, status: 'active' },
      { name: 'type', label: 'Event Category', type: 'select', options: ['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'], required: true, status: 'active' },
      { name: 'title', label: 'Event Name / Title', type: 'text', required: true, status: 'active' },
      { name: 'role', label: 'Organizer Role', type: 'select', options: ['Convener', 'Coordinator', 'Organizing Member'], required: true, status: 'active' },
      { name: 'from_date', label: 'From Date', type: 'date', required: true, status: 'active' },
      { name: 'to_date', label: 'To Date', type: 'date', required: true, status: 'active' },
      { name: 'organizer', label: 'Organizing Department / Venue', type: 'text', required: true, status: 'active' },
      { name: 'res_person', label: 'Resource Person Details', type: 'textarea', required: true, status: 'active' },
      { name: 'ben_person', label: 'Number of Beneficiaries', type: 'number', required: true, status: 'active' },
      { name: 'sponsership', label: 'Sponsor Details', type: 'text', required: true, status: 'active' },
      { name: 'granted', label: 'Sponsorship Grant Amount (INR)', type: 'number', required: true, status: 'active' }
    ]
  },
  personal: {
    page_key: 'personal',
    title: 'Personal Details',
    category: 'personal',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'User',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, status: 'active' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true, status: 'active' },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true, status: 'active' },
      { name: 'mobile', label: 'Mobile Phone', type: 'tel', required: true, status: 'active' },
      { name: 'email', label: 'Personal Email', type: 'email', required: true, status: 'active' },
      { name: 'community', label: 'Community Category', type: 'select', options: ['OC', 'BC', 'MBC', 'DNC', 'SC', 'ST'], required: false, status: 'active' },
      { name: 'address', label: 'Permanent Address', type: 'textarea', required: false, status: 'active' }
    ]
  },
  academic: {
    page_key: 'academic',
    title: 'Academic Information',
    category: 'academic',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'BookOpen',
    fields: [
      { name: 'doj', label: 'Date of Joining', type: 'date', required: true, status: 'active' },
      { name: 'designation', label: 'Current Designation', type: 'text', required: true, status: 'active' },
      { name: 'department', label: 'Department', type: 'text', required: true, status: 'active' },
      { name: 'experience_years', label: 'Prior Teaching Experience (Years)', type: 'number', required: false, status: 'active' },
      { name: 'industry_exp', label: 'Industry Experience (Years)', type: 'number', required: false, status: 'active' }
    ]
  },
  documents: {
    page_key: 'documents',
    title: 'Official Documents',
    category: 'academic',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'FileText',
    fields: [
      { name: 'aadhar_no', label: 'Aadhar Number', type: 'text', required: false, status: 'active' },
      { name: 'pan_no', label: 'PAN Card Number', type: 'text', required: false, status: 'active' },
      { name: 'passport_no', label: 'Passport Number', type: 'text', required: false, status: 'active' }
    ]
  },
  education: {
    page_key: 'education',
    title: 'Education Details',
    category: 'academic',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'GraduationCap',
    fields: [
      { name: 'degree', label: 'Degree Name (UG/PG/PhD)', type: 'text', required: true, status: 'active' },
      { name: 'specialization', label: 'Specialization / Major Branch', type: 'text', required: true, status: 'active' },
      { name: 'institution', label: 'College / Institute Name', type: 'text', required: true, status: 'active' },
      { name: 'university', label: 'University / Board Name', type: 'text', required: true, status: 'active' },
      { name: 'year_passing', label: 'Year of Passing', type: 'number', required: true, status: 'active' }
    ]
  },
  responsibilities: {
    page_key: 'responsibilities',
    title: 'Assigned Responsibilities',
    category: 'academic',
    portals: ['admin', 'dept_admin', 'faculty'],
    icon: 'FileText',
    fields: [
      { name: 'responsibility_name', label: 'Responsibility Title / Role', type: 'text', required: true, status: 'active' },
      { name: 'level', label: 'Level (Departmental / Institutional)', type: 'select', options: ['Department Level', 'Institutional Level'], required: true, status: 'active' },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true, status: 'active' },
      { name: 'status', label: 'Current Status', type: 'select', options: ['Active', 'Completed'], required: true, status: 'active' }
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
