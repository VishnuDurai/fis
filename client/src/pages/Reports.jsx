import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar.jsx';
import { 
  exportNbaB2FacultyDetails, 
  exportNbaB2FacultyDetailsPdf, 
  exportNaacCriterion3Pdf, 
  exportNbaCriterion5Pdf,
  downloadExcelReport,
  downloadPdfReport,
  getFullDepartmentName,
  getDepartmentAcronym
} from '../utils/reportGenerator.js';

export default function Reports({ auth }) {
  // Accreditation Suite State
  const [accreditationDept, setAccreditationDept] = useState(
    auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : ''
  );
  const [exportingAccreditation, setExportingAccreditation] = useState(false);

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
    publications: true,
    books: true,
    awards: true,
    memberships: true,
    resource: true,
    funding: true,
    ipr: true,
    certifications: true,
    events: true,
    responsibilities: true
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

  // --- NAAC & NBA ACCREDITATION EXPORTERS ---

  const handleExportNAAC = async (format = 'excel') => {
    try {
      setExportingAccreditation(true);
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : accreditationDept;
      const q = targetDept ? `?department=${encodeURIComponent(targetDept)}` : '';
      
      const res = await fetch(`${API_BASE_URL}/api/admin/accreditation/naac-summary${q}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch NAAC data');
      const data = await res.json();

      if (format === 'pdf') {
        await exportNaacCriterion3Pdf(data, targetDept || 'Institution', auth);
      } else {
        const wb = XLSX.utils.book_new();
        const pubSheet = XLSX.utils.json_to_sheet(data.naac_3_1_publications || []);
        XLSX.utils.book_append_sheet(wb, pubSheet, "3.1 Research Publications");

        const bookSheet = XLSX.utils.json_to_sheet(data.naac_3_2_books || []);
        XLSX.utils.book_append_sheet(wb, bookSheet, "3.2 Books Published");

        const grantSheet = XLSX.utils.json_to_sheet(data.naac_3_3_grants || []);
        XLSX.utils.book_append_sheet(wb, grantSheet, "3.3 Sponsored Grants");

        const seedSheet = XLSX.utils.json_to_sheet(data.naac_3_4_seed_money || []);
        XLSX.utils.book_append_sheet(wb, seedSheet, "3.4 Seed Money");

        const iprSheet = XLSX.utils.json_to_sheet(data.naac_3_5_patents || []);
        XLSX.utils.book_append_sheet(wb, iprSheet, "3.5 Patents & IPR");

        XLSX.writeFile(wb, `NAAC_Criterion_3_Research_${(targetDept || 'Institution').replace(/[^a-z0-9]/gi, '_')}.xlsx`);
      }
    } catch (e) {
      alert('Error exporting NAAC Criterion 3: ' + e.message);
    } finally {
      setExportingAccreditation(false);
    }
  };

  const handleExportNBA = async (format = 'excel') => {
    try {
      setExportingAccreditation(true);
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : accreditationDept;
      const q = targetDept ? `?department=${encodeURIComponent(targetDept)}` : '';

      const res = await fetch(`${API_BASE_URL}/api/admin/accreditation/nba-summary${q}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch NBA data');
      const data = await res.json();

      if (format === 'pdf') {
        await exportNbaCriterion5Pdf(data, targetDept || 'Institution', auth);
      } else {
        const wb = XLSX.utils.book_new();
        const fdpSheet = XLSX.utils.json_to_sheet(data.nba_5_1_fdp_attended || []);
        XLSX.utils.book_append_sheet(wb, fdpSheet, "5.1 FDPs Attended");

        const eventSheet = XLSX.utils.json_to_sheet(data.nba_5_2_events_organized || []);
        XLSX.utils.book_append_sheet(wb, eventSheet, "5.2 Events Organized");

        const certSheet = XLSX.utils.json_to_sheet(data.nba_5_3_certifications || []);
        XLSX.utils.book_append_sheet(wb, certSheet, "5.3 Certifications");

        const awardSheet = XLSX.utils.json_to_sheet(data.nba_5_4_awards || []);
        XLSX.utils.book_append_sheet(wb, awardSheet, "5.4 Awards");

        const respSheet = XLSX.utils.json_to_sheet(data.nba_5_5_responsibilities || []);
        XLSX.utils.book_append_sheet(wb, respSheet, "5.5 Responsibilities");

        XLSX.writeFile(wb, `NBA_Criterion_5_Contributions_${(targetDept || 'Institution').replace(/[^a-z0-9]/gi, '_')}.xlsx`);
      }
    } catch (e) {
      alert('Error exporting NBA Criterion 5: ' + e.message);
    } finally {
      setExportingAccreditation(false);
    }
  };

  const handleExportNBAB2 = async (format = 'excel') => {
    try {
      setExportingAccreditation(true);
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : accreditationDept;
      
      const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch faculty details');
      const staffList = await res.json();
      
      let filtered = staffList;
      if (targetDept && !['ALL', 'ALL DEPARTMENTS', 'INSTITUTION'].includes(targetDept.toUpperCase())) {
        filtered = staffList.filter(f => 
          (f.Department || '').toLowerCase().trim() === targetDept.toLowerCase().trim()
        );
      }

      if (format === 'pdf') {
        await exportNbaB2FacultyDetailsPdf(filtered, targetDept || 'Institution', '2025-2026', auth);
      } else {
        exportNbaB2FacultyDetails(filtered, targetDept || 'Institution', '2025-2026');
      }
    } catch (e) {
      alert('Error exporting NBA Form B2: ' + e.message);
    } finally {
      setExportingAccreditation(false);
    }
  };

  // --- CUSTOM REPORT GENERATION ENGINE ---

  const generateReport = async () => {
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
        'education', 'publications', 'books', 'awards', 'memberships', 
        'resource', 'funding', 'ipr', 'certifications', 'events', 'responsibilities'
      ];

      const activeKeys = activityKeys.filter(k => sections[k]);
      const fetchedData = {};

      await Promise.all(activeKeys.map(async (key) => {
        let url = `${API_BASE_URL}/api/activities/${key}${targetQuery}`;
        if (key === 'education') {
          url = `${API_BASE_URL}/api/faculty/education${targetQuery}`;
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
              const dateVal = item.date_con || item.awa_date || item.from_date || item.data_of_exam || item.dateofpublication || item.generation || item.date || item.Date_of_joining || item.created_at;
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
      alert('Error generating report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('Failed to generate Excel report.');
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

      // Render each active section as an autoTable
      const sectionConfigs = {
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
        ipr: {
          title: 'Patents & Intellectual Property Rights',
          headers: ['Faculty Name', 'Dept', 'IP Type', 'Title', 'Application/File No', 'Status', 'Filing/Pub Date'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.ip_type || 'Patent', r.patent || r.title || 'N/A', r.institution || r.app_no || 'N/A', r.patent_status || r.status || 'Published', r.filing_date || r.date || 'N/A']
        },
        awards: {
          title: 'Awards & Recognitions',
          headers: ['Faculty Name', 'Dept', 'Award Title', 'Awarding Agency', 'Event Name', 'Award Date'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.awardname || 'N/A', r.awardby || 'N/A', r.event || 'N/A', r.awa_date || r.date || 'N/A']
        },
        events: {
          title: 'Events & Workshops Organized',
          headers: ['Faculty Name', 'Dept', 'Category', 'Event Title', 'Role', 'Duration / Dates', 'Grant (INR)'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type || 'Workshop', r.title || 'N/A', r.role || 'Coordinator', r.from_date && r.to_date ? `${r.from_date} to ${r.to_date}` : (r.from_date || 'N/A'), r.granted ? `₹ ${Number(r.granted).toLocaleString('en-IN')}` : 'Nil']
        },
        certifications: {
          title: 'Faculty Certifications',
          headers: ['Faculty Name', 'Dept', 'Course Title', 'Issuing Organization', 'Score / Grade', 'Date / Period'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.course_name || r.title || 'N/A', r.organisation || 'NPTEL / Coursera', r.mark || r.grade || 'Elite', r.data_of_exam || r.from_date || 'N/A']
        },
        resource: {
          title: 'Resource Person Details',
          headers: ['Faculty Name', 'Dept', 'Scope', 'Topic / Title', 'Acted As', 'Organizer', 'Period'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.type || 'National', r.title || 'N/A', r.actedas || 'Speaker', r.organizer || 'N/A', r.from_date && r.to_date ? `${r.from_date} to ${r.to_date}` : (r.from_date || 'N/A')]
        },
        memberships: {
          title: 'Professional Society Memberships',
          headers: ['Faculty Name', 'Dept', 'Membership ID', 'Professional Body', 'Type'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.membershipid || 'N/A', r.organization || 'N/A', r.membership_type || 'Life Member']
        },
        responsibilities: {
          title: 'Institutional / Department Responsibilities',
          headers: ['Faculty Name', 'Dept', 'Responsibility Title', 'Level / Scope', 'Academic Year', 'Assigned By'],
          mapRow: (r) => [r.staff_name || 'N/A', r.Department || 'N/A', r.responsibility || 'N/A', r.level || 'Department', r.academic_year || '2025-2026', r.assigned_by || 'HOD / Principal']
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

        if (!isInstitutional) {
          const deptIdx = 1;
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
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF report: ' + err.message);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Navbar title="Reports & Accreditation Suite" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {/* Control Panel (no-print) */}
      <div className="card no-print" style={{ marginBottom: '32px' }}>
        
        {/* 1. NAAC & NBA ACCREDITATION 1-CLICK EXPORT SUITE */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <ShieldCheck size={22} color="#16a34a" /> NAAC & NBA Accreditation Export Suite (Excel & PDF)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#166534', margin: '4px 0 0 0' }}>
                Download pre-formatted Multi-Sheet Excel Workbooks and Official PDFs ready for NAAC SSR Criterion 3 & NBA SAR Criterion 5 inspection audits.
              </p>
            </div>

            {/* Department Selection for Accreditation (System Admin) */}
            {auth.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #86efac' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#14532d', whiteSpace: 'nowrap' }}>
                  Accreditation Scope:
                </label>
                <select
                  className="form-control"
                  value={accreditationDept}
                  onChange={(e) => setAccreditationDept(e.target.value)}
                  style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.85rem', minWidth: '220px' }}
                >
                  <option value="">🏫 Institutional (All Departments)</option>
                  {departments.map(d => (
                    <option key={d.id || d.acronym} value={d.acronym || d.name}>
                      🏢 {d.name} ({d.acronym})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {/* NAAC Criterion 3 Box */}
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#15803d', display: 'block', marginBottom: '8px' }}>
                📗 NAAC SSR Criterion 3 (Research & Extension)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExportNAAC('excel')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#16a34a', borderColor: '#15803d' }}
                >
                  <FileSpreadsheet size={15} /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportNAAC('pdf')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dc2626', borderColor: '#b91c1c' }}
                >
                  <FileText size={15} /> PDF (.pdf)
                </button>
              </div>
            </div>

            {/* NBA Criterion 5 Box */}
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0369a1', display: 'block', marginBottom: '8px' }}>
                📘 NBA SAR Criterion 5 (Faculty Contributions)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExportNBA('excel')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0284c7', borderColor: '#0369a1' }}
                >
                  <FileSpreadsheet size={15} /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportNBA('pdf')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dc2626', borderColor: '#b91c1c' }}
                >
                  <FileText size={15} /> PDF (.pdf)
                </button>
              </div>
            </div>

            {/* NBA Form B2 Box */}
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f766e', display: 'block', marginBottom: '8px' }}>
                📙 NBA Criterion 5 Form B2 (Faculty Details)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExportNBAB2('excel')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#0d9488', borderColor: '#0f766e' }}
                >
                  <FileSpreadsheet size={15} /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleExportNBAB2('pdf')}
                  disabled={exportingAccreditation}
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dc2626', borderColor: '#b91c1c' }}
                >
                  <FileText size={15} /> PDF (.pdf)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. REPORT SCOPE & ENTITY SELECTION */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Layers size={20} color="#0284c7" /> Select Report Scope & Target
          </h3>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            {/* System Admin Scope Options */}
            {auth.role === 'admin' && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setReportScope('institutional')}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: reportScope === 'institutional' ? '#0284c7' : '#ffffff',
                    color: reportScope === 'institutional' ? '#ffffff' : '#334155',
                    border: '1.5px solid #0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Building2 size={16} /> 🏫 Institutional Report (Whole College)
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('department')}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: reportScope === 'department' ? '#0284c7' : '#ffffff',
                    color: reportScope === 'department' ? '#ffffff' : '#334155',
                    border: '1.5px solid #0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Building size={16} /> 🏢 Department-wise Report
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('faculty')}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: reportScope === 'faculty' ? '#0284c7' : '#ffffff',
                    color: reportScope === 'faculty' ? '#ffffff' : '#334155',
                    border: '1.5px solid #0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Users size={16} /> 👤 Individual Faculty Dossier
                </button>
              </div>
            )}

            {/* Department Admin Scope Options */}
            {auth.role === 'dept_admin' && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setReportScope('department')}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: reportScope === 'department' ? '#0284c7' : '#ffffff',
                    color: reportScope === 'department' ? '#ffffff' : '#334155',
                    border: '1.5px solid #0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Building size={16} /> 🏢 Department Report ({auth.department})
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('faculty')}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: reportScope === 'faculty' ? '#0284c7' : '#ffffff',
                    color: reportScope === 'faculty' ? '#ffffff' : '#334155',
                    border: '1.5px solid #0284c7',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Users size={16} /> 👤 Individual Faculty Dossier
                </button>
              </div>
            )}
          </div>

          {/* Conditional Sub-selectors */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {reportScope === 'department' && auth.role === 'admin' && (
              <div className="form-group" style={{ margin: 0, minWidth: '300px' }}>
                <label className="form-label" style={{ fontWeight: 800 }}>Choose Department:</label>
                <select
                  className="form-control"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id || d.acronym} value={d.acronym || d.name}>
                      {d.name} ({d.acronym})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportScope === 'faculty' && (
              <div className="form-group" style={{ margin: 0, minWidth: '340px', flex: 1 }}>
                <label className="form-label" style={{ fontWeight: 800 }}>Select Faculty Member:</label>
                <select
                  className="form-control"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {facultyList
                    .filter(f => {
                      if (auth.role === 'dept_admin') {
                        return (f.Department || '').toLowerCase() === (auth.department || '').toLowerCase();
                      }
                      return true;
                    })
                    .map(f => (
                      <option key={f.staff_id} value={f.staff_id}>
                        {f.staff_name || f.staff_id} ({f.staff_id}) - {f.Designation || ''} [{f.Department || ''}]
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 3. FILTERS & DATE RANGE */}
        <h3 style={{ marginBottom: '16px', fontSize: '1.15rem', fontWeight: 800 }}>Configure Date & Activity Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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

        {/* 4. INCLUDE SECTIONS CHECKBOXES */}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {Object.keys(sections).map((section) => (
              <label key={section} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <input 
                  type="checkbox" 
                  checked={sections[section]} 
                  onChange={() => handleCheckboxChange(section)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ textTransform: 'capitalize', fontSize: '0.9rem', fontWeight: 600 }}>
                  {section === 'ipr' ? 'IPR / Patents' : (section === 'resource' ? 'Resource Person' : section)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 5. GENERATE & DOWNLOAD ACTIONS */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading} style={{ padding: '10px 22px', fontWeight: 800, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} />
            {loading ? 'Generating Report...' : '⚡ Generate Report'}
          </button>

          {reportData && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleDownloadExcel}
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1.5px solid #a7f3d0' }}
              >
                <FileSpreadsheet size={18} />
                Download Excel (.xlsx)
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handleDownloadPDF}
                style={{ padding: '10px 18px', fontWeight: 800, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#b91c1c', border: '1.5px solid #fecaca' }}
              >
                <Download size={18} />
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
            </>
          )}
        </div>
      </div>

      {/* 6. GENERATED REPORT PREVIEW */}
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
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>DOB:</td><td style={{ border: 'none', padding: '3px' }}>{personal.dob}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Email Address:</td><td style={{ border: 'none', padding: '3px' }}>{personal.email}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Mobile:</td><td style={{ border: 'none', padding: '3px' }}>{personal.mobile}</td></tr>
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
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', width: '140px', fontWeight: 700 }}>Department:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Department}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Designation:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Designation}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Highest Qual:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Qualification}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Specialization:</td><td style={{ border: 'none', padding: '3px' }}>{academics.area_of_specialization || 'N/A'}</td></tr>
                      <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '3px', fontWeight: 700 }}>Date of Joining:</td><td style={{ border: 'none', padding: '3px' }}>{academics.Date_of_joining}</td></tr>
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

          {/* Publications Section */}
          {sections.publications && reportData.publications && reportData.publications.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Research Publications ({reportData.publications.length} Records)
              </h3>
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
            </div>
          )}

          {/* Books Section */}
          {sections.books && reportData.books && reportData.books.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Books Published ({reportData.books.length} Records)
              </h3>
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
            </div>
          )}

          {/* Research Funding Section */}
          {sections.funding && reportData.funding && reportData.funding.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Research Projects & Funding Grants ({reportData.funding.length} Records)
              </h3>
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
                      <td style={{ border: '1px solid #ccc', padding: '6px' }}>₹ {f.amount?.toLocaleString('en-IN')}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px' }}>{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Patents / IPR Section */}
          {sections.ipr && reportData.ipr && reportData.ipr.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Patents & Intellectual Property Rights ({reportData.ipr.length} Records)
              </h3>
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
            </div>
          )}

          {/* Events Organized Section */}
          {sections.events && reportData.events && reportData.events.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ color: '#000', fontSize: '1.05rem', borderBottom: '1.5px solid #000', paddingBottom: '4px', marginBottom: '12px', fontWeight: 800 }}>
                Events / Workshops Organized ({reportData.events.length} Records)
              </h3>
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
                      <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.from_date} to {ev.to_date}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px' }}>{ev.granted ? `₹ ${Number(ev.granted).toLocaleString('en-IN')}` : 'Nil'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
