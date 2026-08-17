import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  ShieldCheck, 
  Download, 
  Building, 
  Building2, 
  Users, 
  CheckSquare, 
  Square,
  BookOpen,
  Award,
  DollarSign,
  Calendar,
  Layers,
  GraduationCap,
  Beaker,
  Sparkles,
  Activity,
  Folder,
  FolderDown,
  X
} from 'lucide-react';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar.jsx';
import { showSuccess, showError, showInfo } from '../context/AlertContext.jsx';
import { 
  downloadExcelReport, 
  downloadPdfReport, 
  getFullDepartmentName, 
  getDepartmentAcronym 
} from '../utils/reportGenerator.js';

const SECTION_CONFIGS = [
  { key: 'personal', label: 'Personal Details' },
  { key: 'academics', label: 'Academic Status' },
  { key: 'education', label: 'Education Details' },
  { key: 'memberships', label: 'Memberships' },
  { key: 'responsibilities', label: 'Responsibilities' },
  { key: 'publications', label: 'Publications' },
  { key: 'books', label: 'Books Published' },
  { key: 'funding', label: 'Research Funding' },
  { key: 'seed_money', label: 'Seed Money & Consultancy' },
  { key: 'ipr', label: 'IPR / Patents' },
  { key: 'awards', label: 'Awards Received' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'interactions', label: 'Interactions / FDPs' },
  { key: 'resource', label: 'Resource Person' },
  { key: 'events', label: 'Events Organized' },
  { key: 'clubs', label: 'Clubs Activities' },
  { key: 'scholars', label: 'Research Scholars' }
];

export default function Reports({ auth }) {
  // Departments List
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  // Report Scope & Selection Configuration
  // 'institutional' | 'department' | 'faculty'
  const [reportScope, setReportScope] = useState(
    auth.role === 'admin' ? 'institutional' : (auth.role === 'dept_admin' ? 'department' : 'faculty')
  );
  const [selectedDept, setSelectedDept] = useState(
    auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : ''
  );
  const [selectedStaffId, setSelectedStaffId] = useState(
    auth.role === 'faculty' ? auth.staffId : (localStorage.getItem('srec_view_staffId') || '')
  );

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pubCategoryFilter, setPubCategoryFilter] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('');
  const [interactionTypeFilter, setInteractionTypeFilter] = useState('');

  // Sections checkboxes
  const [sections, setSections] = useState({
    personal: true,
    academics: true,
    education: true,
    memberships: true,
    responsibilities: true,
    publications: true,
    books: true,
    funding: true,
    seed_money: true,
    ipr: true,
    awards: true,
    certifications: true,
    interactions: true,
    resource: true,
    events: true,
    clubs: true,
    scholars: true
  });

  // Report Data Output
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState(null);
  const [academics, setAcademics] = useState(null);

  // Initial Data Fetching (Departments & Faculty list)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${auth.token}` };
        
        // Fetch departments
        const dRes = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
        if (dRes.ok) {
          const dData = await dRes.json();
          setDepartments(dData || []);
        }

        // Fetch staff list for dropdowns
        if (auth.role === 'admin' || auth.role === 'dept_admin') {
          const sRes = await fetch(`${API_BASE_URL}/api/admin/staff`, { headers });
          if (sRes.ok) {
            const sData = await sRes.json();
            setFacultyList(sData || []);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata for reports:', err);
      }
    };
    fetchMeta();
  }, [auth]);

  // Section checkbox handlers
  const handleCheckboxChange = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSelectAllSections = () => {
    const all = {};
    Object.keys(sections).forEach(k => { all[k] = true; });
    setSections(all);
  };

  const handleDeselectAllSections = () => {
    const none = {};
    Object.keys(sections).forEach(k => { none[k] = false; });
    setSections(none);
  };

  // --- CUSTOM REPORT GENERATION ENGINE ---

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const effectiveScope = auth.role === 'faculty' ? 'faculty' : reportScope;
      
      let targetQuery = '';
      if (effectiveScope === 'faculty') {
        const staffIdToUse = selectedStaffId || auth.staffId;
        targetQuery = `?staffId=${encodeURIComponent(staffIdToUse)}`;
      }

      // Fetch Personal and Academics if single faculty
      if (effectiveScope === 'faculty') {
        const [pRes, aRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/faculty/personal${targetQuery}`, { headers }),
          fetch(`${API_BASE_URL}/api/faculty/academics${targetQuery}`, { headers })
        ]);
        if (pRes.ok) {
          const p = await pRes.json();
          setPersonal(p[0] || null);
        }
        if (aRes.ok) {
          const a = await aRes.json();
          setAcademics(a[0] || null);
        }
      } else {
        setPersonal(null);
        setAcademics(null);
      }

      // Active activity sections to fetch
      const activityKeys = [
        'education', 'memberships', 'responsibilities', 'publications', 'books',
        'funding', 'seed_money', 'ipr', 'awards', 'certifications', 'interactions',
        'resource', 'events', 'clubs', 'scholars'
      ];

      const activeKeys = activityKeys.filter(k => sections[k]);
      const fetchedData = {};

      await Promise.all(activeKeys.map(async (key) => {
        let url = `${API_BASE_URL}/api/activities/${key}${targetQuery}`;
        if (key === 'education') {
          url = `${API_BASE_URL}/api/faculty/education${targetQuery}`;
        } else if (key === 'responsibilities') {
          url = `${API_BASE_URL}/api/faculty/responsibilities${targetQuery}`;
        }

        try {
          const res = await fetch(url, { headers });
          if (!res.ok) {
            fetchedData[key] = [];
            return;
          }
          let rows = await res.json();
          if (!Array.isArray(rows)) rows = [];

          // 1. Filter by Department if reportScope === 'department'
          if (effectiveScope === 'department') {
            const targetD = (auth.role === 'dept_admin' ? (auth.department || auth.dept) : selectedDept) || '';
            if (targetD) {
              rows = rows.filter(r => 
                (r.Department || '').toLowerCase().trim() === targetD.toLowerCase().trim()
              );
            }
          }

          // 2. Client-side Date Range Filter
          const start = fromDate ? new Date(fromDate) : null;
          const end = toDate ? new Date(toDate) : null;
          if (start) start.setHours(0, 0, 0, 0);
          if (end) end.setHours(23, 59, 59, 999);

          if (start || end) {
            rows = rows.filter(item => {
              const dateVal = item.from_date || item.sanctioned_date || item.awa_date || item.date_con || item.data_of_exam || item.dateofpublication || item.generation || item.date || item.Date_of_joining || item.date_of_certificate || item.created_at;
              if (!dateVal) return true;

              let itemDate = new Date(dateVal);
              if (String(dateVal).includes('-') && String(dateVal).split('-')[0].length === 2) {
                const [d, m, y] = String(dateVal).split('-');
                itemDate = new Date(`${y}-${m}-${d}`);
              }
              if (isNaN(itemDate.getTime())) return true;
              if (start && itemDate < start) return false;
              if (end && itemDate > end) return false;
              return true;
            });
          }

          // 3. Category Filters
          if (key === 'publications' && pubCategoryFilter) {
            rows = rows.filter(item => (item.type_pub === pubCategoryFilter || item.type === pubCategoryFilter));
          }
          if (key === 'events' && eventCategoryFilter) {
            rows = rows.filter(item => item.type === eventCategoryFilter);
          }
          if (key === 'resource' && interactionTypeFilter) {
            rows = rows.filter(item => item.type === interactionTypeFilter);
          }

          // 4. Keyword Search Filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            rows = rows.filter(item =>
              Object.values(item).some(val => val && val.toString().toLowerCase().includes(q))
            );
          }

          fetchedData[key] = rows;
        } catch (e) {
          console.error(`Failed to fetch section ${key}:`, e);
          fetchedData[key] = [];
        }
      }));

      setReportData(fetchedData);
    } catch (err) {
      console.error('Failed to generate report:', err);
      showError('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [auth, reportScope, selectedStaffId, selectedDept, sections, fromDate, toDate, pubCategoryFilter, eventCategoryFilter, interactionTypeFilter, searchQuery]);

  // Automatically trigger report generation on mount and when target scope changes
  useEffect(() => {
    generateReport();
  }, [reportScope, selectedDept, selectedStaffId]);

  // --- DOWNLOAD WORKBOOK (EXCEL) ---
  const handleDownloadExcel = () => {
    if (!reportData) return;
    try {
      const wb = XLSX.utils.book_new();
      const effectiveScope = auth.role === 'faculty' ? 'faculty' : reportScope;
      const deptTitle = effectiveScope === 'institutional' 
        ? 'Institutional' 
        : (effectiveScope === 'department' ? (selectedDept || auth.department || 'Department') : (academics?.Department || 'Faculty'));

      // If single faculty, include summary sheet
      if (effectiveScope === 'faculty' && personal) {
        const summaryData = [
          ['SRI RAMAKRISHNA ENGINEERING COLLEGE'],
          [`FACULTY APPRAISAL & PERFORMANCE REPORT - ${deptTitle.toUpperCase()}`],
          [`Generated Date: ${new Date().toLocaleDateString('en-GB')}`],
          [],
          ['1. PERSONAL & ACADEMIC PROFILE'],
          ['Staff ID', personal.staff_id || ''],
          ['Staff Name', personal.staff_name || ''],
          ['Department', academics?.Department || ''],
          ['Designation', academics?.Designation || ''],
          ['Highest Qualification', academics?.Qualification || ''],
          ['Area of Specialization', academics?.area_of_specialization || ''],
          ['Date of Joining', academics?.Date_of_joining || ''],
          ['Email', personal.email || ''],
          ['Mobile', personal.mobile || ''],
          ['PAN', personal.pan || ''],
          ['Aadhaar', personal.aadhar || '']
        ];
        const sumSheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, sumSheet, "Profile Summary");
      }

      // Add sheet for each active section with rows
      Object.keys(reportData).forEach(key => {
        const rows = reportData[key];
        if (rows && rows.length > 0) {
          const sheet = XLSX.utils.json_to_sheet(rows);
          const sheetName = key.charAt(0).toUpperCase() + key.slice(1, 28);
          XLSX.utils.book_append_sheet(wb, sheet, sheetName);
        }
      });

      const filename = `SREC_FIS_${deptTitle.replace(/[^a-z0-9]/gi, '_')}_Report.xlsx`;
      XLSX.writeFile(wb, filename);
      showSuccess(`Excel report "${filename}" generated and downloaded!`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      showError('Failed to generate Excel report.');
    }
  };

  // --- DOWNLOAD OFFICIAL PDF REPORT ---
  const handleDownloadPDF = async () => {
    if (!reportData) return;
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const headerBanner = await fetchImageAsBase64('/srec-header-banner.png') || 
                           await fetchImageAsBase64('/logo.png');
      const bannerWidth = 165;
      const bannerHeight = bannerWidth / 5.505;

      const effectiveScope = auth.role === 'faculty' ? 'faculty' : reportScope;
      const isInstitutional = effectiveScope === 'institutional';
      const targetDept = effectiveScope === 'department' ? (selectedDept || auth.department || '') : '';
      const fullDept = isInstitutional ? 'Sri Ramakrishna Engineering College' : `Department of ${getFullDepartmentName(targetDept || academics?.Department || '')}`;
      const deptAcronym = isInstitutional ? '' : getDepartmentAcronym(targetDept || academics?.Department || '');

      let currentY = 4 + bannerHeight + 6;

      const drawPageHeader = (title) => {
        if (headerBanner) {
          try { doc.addImage(headerBanner, 'PNG', (pageWidth - bannerWidth) / 2, 4, bannerWidth, bannerHeight); } catch(e){}
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(fullDept, pageWidth / 2, 4 + bannerHeight + 5, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(2, 132, 199);
        doc.text(title, pageWidth / 2, 4 + bannerHeight + 10, { align: 'center' });
      };

      drawPageHeader(
        effectiveScope === 'faculty' && personal 
          ? `FACULTY DOSSIER: ${personal.staff_name || personal.staff_id} (${academics?.Designation || ''})`
          : `${isInstitutional ? 'INSTITUTIONAL' : 'DEPARTMENT'} PERFORMANCE & AUDIT REPORT`
      );

      currentY = 4 + bannerHeight + 16;

      // Section mapping dictionary for PDF autoTable
      const sectionConfigs = {
        education: {
          title: 'Education & Academic Qualifications',
          headers: ['Degree / Level', 'Course / Branch', 'College / Institution', 'University / Board', 'Year of Passing', 'Percentage / CGPA', 'Class Obtained'],
          mapRow: (r) => [r.degree_type || r.degree || 'N/A', r.course || r.specialization || 'N/A', r.college || r.institution || 'N/A', r.university || r.board || 'N/A', r.year_of_passing || r.year || 'N/A', r.percentage_cgpa || r.percentage || r.cgpa || 'N/A', r.class_obtained || r.class || 'N/A']
        },
        memberships: {
          title: 'Professional Society Memberships',
          headers: ['Faculty Name', 'Dept', 'Membership ID', 'Professional Society / Body', 'Type'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.membershipid || 'N/A', r.organization || 'N/A', r.membership_type || 'Life Member']
        },
        responsibilities: {
          title: 'Assigned Responsibilities',
          headers: ['Faculty Name', 'Dept', 'Responsibility Title', 'Scope / Level', 'Academic Year', 'Assigned By'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.responsibility || r.title || 'N/A', r.level || 'Department', r.academic_year || '2025-2026', r.assigned_by || 'HOD / Principal']
        },
        publications: {
          title: 'Research Publications',
          headers: ['Faculty Name', 'Dept', 'Type', 'Title', 'Journal / Conference', 'Date/Year', 'Indexing', 'Citations'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type_pub || 'Journal', r.title || 'N/A', r.journel || r.organizer || 'N/A', r.date_con || r.year || 'N/A', r.index_pub || 'N/A', r.citations || '0']
        },
        books: {
          title: 'Books Published',
          headers: ['Faculty Name', 'Dept', 'Book Title', 'Co-Authors', 'Publisher', 'Edition', 'ISBN', 'Date/Year'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.title || 'N/A', r.coauthor || 'None', r.publisher || 'N/A', r.edition || '1st', r.isbn || 'N/A', r.dateofpublication || r.year || 'N/A']
        },
        funding: {
          title: 'Research Projects & Funding Grants',
          headers: ['Faculty Name', 'Dept', 'Project Title', 'Category & Role', 'Funding Agency', 'Amount (INR)', 'Status'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.title || 'N/A', `${r.grant_category || 'Project'} (${r.faculty_role || 'PI'})`, r.fa || r.agency || 'N/A', r.amount ? `₹ ${Number(r.amount).toLocaleString('en-IN')}` : 'N/A', r.status || 'Ongoing']
        },
        seed_money: {
          title: 'Funded Consultancy & Seed Money',
          headers: ['Faculty Name', 'Dept', 'Category', 'Title / Description', 'Client / Agency', 'Role & Consultants', 'Amount (INR)', 'Status'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.entry_type || 'Seed Money', r.title || 'N/A', r.client_type || 'SREC Seed Fund', `${r.faculty_role || 'PI'}${r.consultants ? ` (${r.consultants})` : ''}`, r.amount ? `₹ ${Number(r.amount).toLocaleString('en-IN')}` : 'N/A', r.status || 'Received']
        },
        ipr: {
          title: 'Patents & Intellectual Property Rights',
          headers: ['Faculty Name', 'Dept', 'IP Type', 'Title', 'Application/File No', 'Status', 'Filing/Pub Date'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.ip_type || 'Patent', r.patent || r.title || 'N/A', r.institution || r.app_no || 'N/A', r.patent_status || r.status || 'Published', r.generation || r.date || 'N/A']
        },
        awards: {
          title: 'Awards & Recognitions',
          headers: ['Faculty Name', 'Dept', 'Award Title', 'Awarding Agency', 'Event Name', 'Award Date'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.awardname || 'N/A', r.awardby || 'N/A', r.event || 'N/A', r.awa_date || r.date || 'N/A']
        },
        certifications: {
          title: 'Faculty Certifications & Courses',
          headers: ['Faculty Name', 'Dept', 'Course Title', 'Issuing Organization', 'Duration (Weeks)', 'Score / Grade', 'Date'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.course_name || r.title || 'N/A', r.organisation || 'NPTEL / Coursera', r.duration_weeks || 'N/A', r.mark || r.grade || 'Elite', r.data_of_exam || r.from_date || 'N/A']
        },
        interactions: {
          title: 'Faculty Interactions / FDPs Attended',
          headers: ['Faculty Name', 'Dept', 'Type', 'Title / Topic', 'Organizer Agency', 'Period / Dates'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type || 'FDP', r.title || 'N/A', r.organizer || 'N/A', [r.from_date, r.to_date].filter(Boolean).join(' to ') || r.date || 'N/A']
        },
        resource: {
          title: 'Resource Person Details',
          headers: ['Faculty Name', 'Dept', 'Scope', 'Topic / Title', 'Acted As', 'Organizer', 'Period'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type || 'National', r.title || 'N/A', r.actedas || 'Speaker', r.organizer || 'N/A', [r.from_date, r.to_date].filter(Boolean).join(' to ') || r.date || 'N/A']
        },
        events: {
          title: 'Events & Workshops Organized',
          headers: ['Faculty Name', 'Dept', 'Category', 'Event Title', 'Role', 'Duration / Dates', 'Grant (INR)'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type || 'Workshop', r.title || 'N/A', r.role || 'Coordinator', [r.from_date, r.to_date].filter(Boolean).join(' to ') || r.date || 'N/A', r.granted ? `₹ ${Number(r.granted).toLocaleString('en-IN')}` : 'Nil']
        },
        clubs: {
          title: 'Clubs Activities Organized',
          headers: ['Faculty Name', 'Dept', 'Club Name', 'Event Type', 'Event Title', 'Organizer', 'Period / Dates', 'Grant (INR)'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.club || 'N/A', r.type || 'N/A', r.title || 'N/A', r.organizer || 'N/A', [r.from_date, r.to_date].filter(Boolean).join(' to ') || r.date || 'N/A', r.granted ? `₹ ${Number(r.granted).toLocaleString('en-IN')}` : 'Nil']
        },
        scholars: {
          title: 'Research Scholars Supervised',
          headers: ['Supervisor Name', 'Dept', 'Reg / Research ID', 'Scholar Name', 'University', 'Institution', 'Status', 'Reg Year'],
          mapRow: (r) => [r.sup_name || 'N/A', r.Department || 'N/A', r.res_id || 'N/A', r.staff_name || 'N/A', r.university || 'Anna University', r.organisation || 'SREC', r.status || 'Ongoing', r.registration_year || r.date || 'N/A']
        }
      };

      Object.keys(reportData).forEach((key) => {
        const rows = reportData[key];
        const conf = sectionConfigs[key];
        if (!conf || !rows || rows.length === 0) return;

        if (currentY > 165) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`${conf.title} (${rows.length} Records)`, 10, currentY);
        currentY += 4;

        // If department-specific or faculty dossier, omit redundant Department column
        let headersToUse = conf.headers;
        let rowsToUse = rows.map(conf.mapRow);

        if (!isInstitutional && conf.headers.includes('Dept')) {
          const deptIdx = conf.headers.indexOf('Dept');
          headersToUse = conf.headers.filter((_, i) => i !== deptIdx);
          rowsToUse = rowsToUse.map(r => r.filter((_, i) => i !== deptIdx));
        }

        autoTable(doc, {
          head: [headersToUse],
          body: rowsToUse,
          startY: currentY,
          margin: { left: 10, right: 10, bottom: 22 },
          styles: { font: 'times', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        currentY = (doc.lastAutoTable.finalY || currentY) + 12;
      });

      // Signature Footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY;
      const sigY = Math.min(finalY + 16, pageHeight - 16);

      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);

      if (auth.role === 'admin' || isInstitutional) {
        doc.text('PRINCIPAL', pageWidth - 14, sigY, { align: 'right' });
        doc.setFont('times', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text('Sri Ramakrishna Engineering College', pageWidth - 14, sigY + 5, { align: 'right' });
      } else if (auth.role === 'dept_admin') {
        doc.text('Faculty In-charge', 14, sigY);
        doc.text(`HOD - ${deptAcronym}`, pageWidth - 14, sigY, { align: 'right' });
      } else {
        doc.text(`Signature of Faculty (${personal?.staff_name || auth.name})`, 14, sigY);
        doc.text(`HOD - ${deptAcronym}`, pageWidth - 14, sigY, { align: 'right' });
      }

      const safeFilename = `SREC_FIS_${(targetDept || (isInstitutional ? 'Institutional' : 'Faculty')).replace(/[^a-z0-9]/gi, '_')}_Report.pdf`;
      doc.save(safeFilename);
      showSuccess(`PDF report "${safeFilename}" generated and downloaded!`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showError('Failed to generate PDF report: ' + err.message);
    }
  };

  // Helper to load image
  const fetchImageAsBase64 = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  };

  // Print Window Trigger
  const handlePrint = () => {
    window.print();
  };

  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleDownloadDossierZip = async () => {
    setDownloadingZip(true);
    try {
      const deptQuery = (reportScope === 'department' || auth.role === 'dept_admin') ? (selectedDept || auth.dept || '') : '';
      const res = await fetch(`${API_BASE_URL}/api/admin/dossier-package-zip?department=${encodeURIComponent(deptQuery)}&academic_year=${encodeURIComponent(academicYear || '')}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to download dossier ZIP package.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NBA_NAAC_Dossier_Package_${(deptQuery || 'INSTITUTION').replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('NBA / NAAC Dossier Package (.ZIP) downloaded successfully with all supporting proof documents!');
    } catch (err) {
      showError(err.message);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Navbar 
        title="Comprehensive Performance Reports & Dossier Suite" 
        subtitle="Generate Institution, Department, and Faculty dossiers with full export capabilities" 
        auth={auth} 
      />

      {/* FILTER & CONFIGURATION CARD */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Configure Custom Report & Dossier</h3>

        {/* 1. REPORT SCOPE SELECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {auth.role === 'admin' && (
            <div className="form-group">
              <label className="form-label">Report Scope</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReportScope('institutional')}
                  className={`btn ${reportScope === 'institutional' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Building size={15} style={{ marginRight: '4px' }} /> Institution
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('department')}
                  className={`btn ${reportScope === 'department' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Building2 size={15} style={{ marginRight: '4px' }} /> Department
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('faculty')}
                  className={`btn ${reportScope === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Users size={15} style={{ marginRight: '4px' }} /> Faculty
                </button>
              </div>
            </div>
          )}

          {/* Department Selector */}
          {(reportScope === 'department' || (reportScope === 'faculty' && auth.role === 'admin')) && (
            <div className="form-group">
              <label className="form-label">Select Department</label>
              <select
                className="form-control"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={auth.role === 'dept_admin'}
                style={{ fontWeight: 600 }}
              >
                <option value="">-- Choose Department --</option>
                {departments.map(d => (
                  <option key={d.id || d.name} value={d.name}>{d.name} ({d.acronym})</option>
                ))}
              </select>
            </div>
          )}

          {/* Single Faculty Selector */}
          {reportScope === 'faculty' && (auth.role === 'admin' || auth.role === 'dept_admin') && (
            <div className="form-group">
              <label className="form-label">Select Faculty Member</label>
              <select
                className="form-control"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="">-- Choose Faculty --</option>
                {facultyList
                  .filter(f => !selectedDept || (f.Department || '').toLowerCase() === selectedDept.toLowerCase())
                  .map(f => (
                    <option key={f.staff_id} value={f.staff_id}>
                      {f.staff_name || f.name} ({f.staff_id}) - {f.Department}
                    </option>
                  ))
                }
              </select>
            </div>
          )}
        </div>

        {/* 2. DATE RANGE & SEARCH FILTERS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Publication Category Filter</label>
            <select className="form-control" value={pubCategoryFilter} onChange={(e) => setPubCategoryFilter(e.target.value)} style={{ fontWeight: 600 }}>
              <option value="">-- All Categories --</option>
              <option value="Journal">Journal Only</option>
              <option value="Conference">Conference Only</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Event Category Filter</label>
            <select className="form-control" value={eventCategoryFilter} onChange={(e) => setEventCategoryFilter(e.target.value)} style={{ fontWeight: 600 }}>
              <option value="">-- All Event Categories --</option>
              {['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Keyword Search Filter</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter by title, journal, keywords..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
        </div>

        {/* 3. INCLUDE SECTIONS CHECKBOXES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="form-label" style={{ fontWeight: 800, margin: 0 }}>Include Sections</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleSelectAllSections} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                Select All
              </button>
              <button type="button" onClick={handleDeselectAllSections} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
                Deselect All
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {SECTION_CONFIGS.map(({ key, label }) => (
              <label 
                key={key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  background: sections[key] ? 'hsla(var(--primary), 0.08)' : '#f8fafc', 
                  padding: '7px 12px', 
                  borderRadius: '6px', 
                  border: sections[key] ? '1px solid hsla(var(--primary), 0.3)' : '1px solid #e2e8f0',
                  transition: 'all 0.15s ease'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={!!sections[key]} 
                  onChange={() => handleCheckboxChange(key)}
                  style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--primary))' }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: sections[key] ? 700 : 500, color: sections[key] ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. GENERATE & DOWNLOAD ACTIONS */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid hsl(var(--border))', paddingTop: '20px' }}>
          <button 
            className="btn btn-primary" 
            onClick={generateReport} 
            disabled={loading} 
            style={{ padding: '10px 22px', fontWeight: 800, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={18} />
            {loading ? 'Generating Report...' : '⚡ Generate Report'}
          </button>

          {reportData && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleDownloadExcel}
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileSpreadsheet size={18} color="#16a34a" />
                Download Excel (.xlsx)
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handleDownloadPDF}
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={18} color="#dc2626" />
                Download PDF (.pdf)
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handlePrint}
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={18} />
                Print / Save PDF
              </button>

              {(auth.role === 'admin' || auth.role === 'dept_admin') && (
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  onClick={handleDownloadDossierZip}
                  disabled={downloadingZip}
                  style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', borderColor: '#86efac' }}
                >
                  <FolderDown size={18} color="#16a34a" />
                  {downloadingZip ? 'Building ZIP Package...' : '📦 Download NBA/NAAC Dossier Package (.ZIP)'}
                </button>
              )}

              <Link 
                to="/cv-generator"
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5f3ff', color: '#7c3aed', borderColor: '#c4b5fd', textDecoration: 'none' }}
              >
                <Sparkles size={18} color="#7c3aed" />
                📄 1-Click AI CV Generator
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 5. GENERATED REPORT PREVIEW */}
      {reportData ? (
        <div className="card report-print-area" style={{ background: '#fff', color: '#000', padding: '40px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
          
          {/* Header with Left and Right Logos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '24px' }}>
            <img src="/report-logo-left.png" alt="SREC Logo Left" style={{ height: '80px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
              <h2 style={{ color: '#000', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                SRI RAMAKRISHNA ENGINEERING COLLEGE
              </h2>
              <p style={{ color: '#000', fontSize: '1.05rem', fontWeight: 700, margin: '4px 0 0 0' }}>
                {reportScope === 'institutional' ? 'ALL DEPARTMENTS - INSTITUTIONAL DOSSIER' : (reportScope === 'department' ? `DEPARTMENT OF ${getFullDepartmentName(selectedDept || auth.department).toUpperCase()}` : `FACULTY DOSSIER - ${personal?.staff_name || auth.name}`)}
              </p>
              {fromDate || toDate ? (
                <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '2px' }}>
                  Period: {fromDate || 'Beginning'} to {toDate || 'Present'}
                </p>
              ) : null}
            </div>
            <img src="/report-logo-right.png" alt="SNR Sons Trust Logo Right" style={{ height: '140px', objectFit: 'contain', margin: '-30px 0' }} />
          </div>

          {/* Individual Faculty Personal & Academic Summary */}
          {reportScope === 'faculty' && personal && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {sections.personal && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#0f172a', fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '10px', fontWeight: 800 }}>
                    1. Personal Details
                  </h3>
                  <table style={{ border: 'none', width: '100%', fontSize: '0.88rem' }}>
                    <tbody>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', width: '140px', fontWeight: 700 }}>Staff ID:</td><td style={{ border: 'none', padding: '3px' }}>{personal.staff_id}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Staff Name:</td><td style={{ border: 'none', padding: '3px' }}>{personal.staff_name}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>DOB:</td><td style={{ border: 'none', padding: '3px' }}>{personal.dob || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Email Address:</td><td style={{ border: 'none', padding: '3px' }}>{personal.email || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Mobile:</td><td style={{ border: 'none', padding: '3px' }}>{personal.mobile || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {sections.academics && academics && (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#0f172a', fontSize: '1.05rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '10px', fontWeight: 800 }}>
                    2. Academic Status
                  </h3>
                  <table style={{ border: 'none', width: '100%', fontSize: '0.88rem' }}>
                    <tbody>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', width: '140px', fontWeight: 700 }}>Department:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Department || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Designation:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Designation || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Highest Qual:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Qualification || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Specialization:</td><td style={{ border: 'none', padding: '3px' }}>{academics.area_of_specialization || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Date of Joining:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Date_of_joining || 'N/A'}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Institutional / Department KPI Stats Cards */}
          {reportScope !== 'faculty' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Publications</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', margin: '4px 0 0 0' }}>{reportData.publications?.length || 0}</h3>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Books</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a', margin: '4px 0 0 0' }}>{reportData.books?.length || 0}</h3>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Grants & Funding</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#d97706', margin: '4px 0 0 0' }}>{reportData.funding?.length || 0}</h3>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Patents / IPR</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#9333ea', margin: '4px 0 0 0' }}>{reportData.ipr?.length || 0}</h3>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Events Organized</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d9488', margin: '4px 0 0 0' }}>{reportData.events?.length || 0}</h3>
              </div>
            </div>
          )}

          {/* Education Details Section */}
          {sections.education && reportData.education && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                3. Education & Academic Qualifications ({reportData.education.length} Records)
              </h3>
              {reportData.education.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Degree / Level</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Course / Specialization</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>College / Institution</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>University / Board</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Year of Passing</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Percentage / CGPA</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Class Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.education.map((e, idx) => (
                      <tr key={e.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{e.degree_type || e.degree || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{e.course || e.specialization || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{e.college || e.institution || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{e.university || e.board || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{e.year_of_passing || e.year || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{e.percentage_cgpa || e.percentage || e.cgpa || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{e.class_obtained || e.class || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No education records reported.</p>
              )}
            </div>
          )}

          {/* Memberships Section */}
          {sections.memberships && reportData.memberships && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Professional Society Memberships ({reportData.memberships.length} Records)
              </h3>
              {reportData.memberships.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Membership ID</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Professional Society / Body</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Membership Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.memberships.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{m.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.membershipid || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.organization || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{m.membership_type || 'Life Member'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No professional membership records reported.</p>
              )}
            </div>
          )}

          {/* Assigned Responsibilities Section */}
          {sections.responsibilities && reportData.responsibilities && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Institutional & Department Responsibilities ({reportData.responsibilities.length} Records)
              </h3>
              {reportData.responsibilities.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Responsibility Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Scope / Level</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Academic Year</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Assigned By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.responsibilities.map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{r.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.responsibility || r.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.level || 'Department'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{r.academic_year || '2025-2026'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.assigned_by || 'HOD / Principal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No responsibilities reported.</p>
              )}
            </div>
          )}

          {/* Publications Section */}
          {sections.publications && reportData.publications && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Research Publications ({reportData.publications.length} Records)
              </h3>
              {reportData.publications.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Dept</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Type</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Journal / Publisher</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Date</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Indexing</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Citations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.publications.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{p.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.Department || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.type_pub || 'Journal'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.title}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.journel || p.organizer || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.date_con || p.year || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{p.index_pub || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{p.citations || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No publication records reported.</p>
              )}
            </div>
          )}

          {/* Books Section */}
          {sections.books && reportData.books && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Books Published ({reportData.books.length} Records)
              </h3>
              {reportData.books.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Dept</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Book Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Co-Authors</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Publisher</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Edition</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>ISBN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.books.map((b, idx) => (
                      <tr key={b.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{b.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.Department || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.title}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.coauthor || 'None'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.publisher}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.edition || '1st'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.isbn || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No books published reported.</p>
              )}
            </div>
          )}

          {/* Research Funding Section */}
          {sections.funding && reportData.funding && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Research Projects & Funding Grants ({reportData.funding.length} Records)
              </h3>
              {reportData.funding.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Dept</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Project Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category & Role</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Funding Agency</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Amount (INR)</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.funding.map((f, idx) => (
                      <tr key={f.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{f.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.Department || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.title}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.grant_category || 'Project'} ({f.faculty_role || 'PI'})</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.fa || f.agency || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>₹ {f.amount ? Number(f.amount).toLocaleString('en-IN') : 0}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No research funding grants reported.</p>
              )}
            </div>
          )}

          {/* Seed Money & Consultancy Section */}
          {sections.seed_money && reportData.seed_money && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Funded Consultancy Projects & Seed Money for Research ({reportData.seed_money.length} Records)
              </h3>
              {reportData.seed_money.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Title / Nature of Consultation</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Client / Sponsoring Agency</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Role & Consultants</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Amount (INR)</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Status</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Date / Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.seed_money.map((sm, idx) => (
                      <tr key={sm.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{sm.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{sm.entry_type || 'Seed Money'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{sm.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{sm.client_type || 'SREC Seed Fund'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{sm.faculty_role || 'PI'}{sm.consultants ? ` (${sm.consultants})` : ''}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>₹ {Number(sm.amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{sm.status || 'Received'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{[sm.sanctioned_date, sm.duration].filter(Boolean).join(' | ') || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No seed money or consultancy records reported.</p>
              )}
            </div>
          )}

          {/* Patents / IPR Section */}
          {sections.ipr && reportData.ipr && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Patents & Intellectual Property Rights ({reportData.ipr.length} Records)
              </h3>
              {reportData.ipr.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Dept</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>IP Type</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Application/File No</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.ipr.map((ip, idx) => (
                      <tr key={ip.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{ip.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ip.Department || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ip.ip_type || 'Patent'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ip.patent || ip.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ip.institution || ip.app_no || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ip.patent_status || ip.status || 'Published'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No patents or IPR records reported.</p>
              )}
            </div>
          )}

          {/* Awards Received Section */}
          {sections.awards && reportData.awards && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Awards & Recognitions Received ({reportData.awards.length} Records)
              </h3>
              {reportData.awards.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Award Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Awarding Body / Agency</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Name of Event</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Date of Award</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.awards.map((a, idx) => (
                      <tr key={a.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{a.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{a.awardname || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{a.awardby || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{a.event || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{a.awa_date || a.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No award records reported.</p>
              )}
            </div>
          )}

          {/* Certifications Section */}
          {sections.certifications && reportData.certifications && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Faculty Certifications & Online Courses ({reportData.certifications.length} Records)
              </h3>
              {reportData.certifications.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Course Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Issuing Organization</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Duration (Weeks)</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Score / Grade</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Exam Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.certifications.map((c, idx) => (
                      <tr key={c.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{c.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.course_name || c.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.organisation || 'NPTEL / Coursera'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{c.duration_weeks || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{c.mark || c.score || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.data_of_exam || c.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No certification records reported.</p>
              )}
            </div>
          )}

          {/* Faculty Interactions Section */}
          {sections.interactions && reportData.interactions && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Faculty Interactions (FDPs, Seminars, Workshops Attended) ({reportData.interactions.length} Records)
              </h3>
              {reportData.interactions.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Interaction Type</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Title / Topic</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Organizer Agency</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Period / Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.interactions.map((it, idx) => (
                      <tr key={it.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{it.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{it.type || 'FDP'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{it.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{it.organizer || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{[it.from_date, it.to_date].filter(Boolean).join(' to ') || it.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No interaction records reported.</p>
              )}
            </div>
          )}

          {/* Resource Person Section */}
          {sections.resource && reportData.resource && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Resource Person & Invited Talks Delivered ({reportData.resource.length} Records)
              </h3>
              {reportData.resource.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Topic / Lecture Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Scope</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Acted As</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Organizer Agency</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Beneficiaries</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Period / Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.resource.map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{r.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.type || 'National'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.actedas || 'Speaker'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.organizer || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{r.ben || 0}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{[r.from_date, r.to_date].filter(Boolean).join(' to ') || r.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No resource person records reported.</p>
              )}
            </div>
          )}

          {/* Events Organized Section */}
          {sections.events && reportData.events && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Events / Workshops Organized ({reportData.events.length} Records)
              </h3>
              {reportData.events.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Faculty</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Dept</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Event Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Role</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Period</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Grant (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.events.map((ev, idx) => (
                      <tr key={ev.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{ev.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.Department || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.type}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.title}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.role || 'Coordinator'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{[ev.from_date, ev.to_date].filter(Boolean).join(' to ') || ev.date || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.granted ? `₹ ${Number(ev.granted).toLocaleString('en-IN')}` : 'Nil'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No events organized reported.</p>
              )}
            </div>
          )}

          {/* Clubs Activities Section */}
          {sections.clubs && reportData.clubs && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Clubs Activities Organized ({reportData.clubs.length} Records)
              </h3>
              {reportData.clubs.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Club Name</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Event Type</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Event Title</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Organizer</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Period / Dates</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Grant (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.clubs.map((c, idx) => (
                      <tr key={c.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{c.club || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.type || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.title || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.organizer || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{[c.from_date, c.to_date].filter(Boolean).join(' to ') || c.date || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{c.granted ? `₹ ${Number(c.granted).toLocaleString('en-IN')}` : 'Nil'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No club activities reported.</p>
              )}
            </div>
          )}

          {/* Research Scholars Section */}
          {sections.scholars && reportData.scholars && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Research Scholars Supervised ({reportData.scholars.length} Records)
              </h3>
              {reportData.scholars.length > 0 ? (
                <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Research ID / Reg No</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Scholar Name</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>University</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Organization</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Supervisor Type</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Status</th>
                      <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Reg Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.scholars.map((s, idx) => (
                      <tr key={s.id || idx}>
                        <td style={{ border: '1px solid #ccc', padding: '6px', fontWeight: 600 }}>{s.res_id || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{s.staff_name || 'N/A'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{s.university || 'Anna University'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{s.organisation || 'SREC'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{s.supervisor_type || 'Internal'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px' }}>{s.status || 'Ongoing'}</td>
                        <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'center' }}>{s.registration_year || s.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic', margin: '4px 0 16px 0', fontSize: '0.85rem' }}>No research scholars reported.</p>
              )}
            </div>
          )}

          {/* Footer Signature */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px', borderTop: '1px dashed #000' }}>
            <span style={{ fontSize: '0.9rem', color: '#000', fontWeight: 700 }}>Faculty In-charge / Verifier</span>
            <span style={{ fontSize: '0.9rem', color: '#000', fontWeight: 700 }}>
              {auth.role === 'admin' || reportScope === 'institutional' ? 'PRINCIPAL' : `HOD - ${getDepartmentAcronym(selectedDept || auth.department)}`}
            </span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          Please select your report scope above and click "⚡ Generate Report" to load and preview the dossier.
        </div>
      )}
    </div>
  );
}
