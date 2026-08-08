import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useMemo } from 'react';
import { FileCheck, Plus, Trash2, Printer, BookOpen, Award, Layers, ShieldCheck, Edit, Save, Search, Eye, CheckCircle, RefreshCw, X, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../utils/academicYear.js';

export default function Appraisal({ auth }) {
  const isAdminOrHR = auth.role === 'admin' || auth.role === 'principal' || auth.role === 'hr';
  const isDeptAdmin = auth.role === 'dept_admin';

  // Navigation Tab State for Admin/HR/Principal
  const [activeAdminTab, setActiveAdminTab] = useState('submissions'); // 'submissions' or 'configurator'

  // Submission State
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingAppraisal, setViewingAppraisal] = useState(null);
  const [viewingGeneralInfo, setViewingGeneralInfo] = useState(null);

  // Search & Filter State for Submissions
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);

  // Dynamic Template State
  const [templateItems, setTemplateItems] = useState([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // General Information State (Auto-Mapped from Portal)
  const [generalInfo, setGeneralInfo] = useState({
    departmentName: '',
    facultyName: '',
    designation: '',
    qualification: '',
    doj: '',
    promotionDetails: 'N/A',
    prevExp: '0 Y',
    srecExp: '0 Y',
    totalTeachingExp: '0 Y',
    industryExp: '0 Y',
    phdStatus: 'Yet to Register'
  });

  // Detailed Activity Mappings State (Auto-Mapped Data Verification)
  const [fpiDetails, setFpiDetails] = useState(null);
  const [fpiBreakdown, setFpiBreakdown] = useState({});
  const [activeDetailCategory, setActiveDetailCategory] = useState('publications');

  // General FPI Form Details
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [coursesTaught, setCoursesTaught] = useState('');
  const [selfAppraisalScore, setSelfAppraisalScore] = useState('');
  const [goalsNextYear, setGoalsNextYear] = useState('');

  // Table Grid States (Matching FPI.docx)
  const [a1Rows, setA1Rows] = useState([{ class_name: '', course: '', ict_tool: '', score: '' }]);
  const [a2Rows, setA2Rows] = useState([{ class_name: '', course: '', title: '', platform: '', launch_date: '', link: '', score: '' }]);
  const [a3Rows, setA3Rows] = useState([{ class_name: '', course: '', experiment: '', score: '' }]);
  const [a4Rows, setA4Rows] = useState([{ class_name: '', course: '', mid_score: '', end_score: '', avg_score: '' }]);
  const [a5Rows, setA5Rows] = useState([{ class_name: '', course: '', odd_pass: '', even_pass: '', avg_pass: '' }]);
  const [a6Rows, setA6Rows] = useState([{ course_name: '', industry: '', duration: '', score: '' }]);
  const [a7Rows, setA7Rows] = useState([{ competition: '', team_members: '', project_title: '', position: '', score: '' }]);

  const [b4Rows, setB4Rows] = useState([{ course_name: '', academic_year: getCurrentAcademicYear(), details: '', score: '' }]);
  const [b7Rows, setB7Rows] = useState([{ name: '', company: '', duration: '', score: '' }]);
  const [c3Rows, setC3Rows] = useState([{ activity_name: '', event_type: '', location: '', date: '', score: '' }]);

  // Summary counts (Auto-Mapped)
  const [publicationsCount, setPublicationsCount] = useState('0');
  const [booksCount, setBooksCount] = useState('0');
  const [patentsCount, setPatentsCount] = useState('0');
  const [grantsAmount, setGrantsAmount] = useState('');
  const [fdpAttended, setFdpAttended] = useState('');
  const [eventsOrganized, setEventsOrganized] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingAppraisalId, setEditingAppraisalId] = useState(null);
  const [lastSubmittedAppraisal, setLastSubmittedAppraisal] = useState(null);

  const parseRows = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  };

  const handleStartEdit = (appRecord) => {
    const myApp = appraisals.find(a => a.staff_id === auth.staffId);
    const app = appRecord || lastSubmittedAppraisal || myApp;
    if (!app) return;

    setEditingAppraisalId(app.id);
    setAcademicYear(app.academic_year || getCurrentAcademicYear());

    const safeParse = (val, fallback) => {
      if (!val) return fallback;
      if (Array.isArray(val)) return val;
      try {
        const p = JSON.parse(val);
        return Array.isArray(p) && p.length > 0 ? p : fallback;
      } catch (e) {
        return fallback;
      }
    };

    setA1Rows(safeParse(app.a1_ict_tools, [{ class_name: '', course: '', ict_tool: '', score: '' }]));
    setA2Rows(safeParse(app.a2_econtent, [{ class_name: '', course: '', title: '', platform: '', launch_date: '', link: '', score: '' }]));
    setA3Rows(safeParse(app.a3_lab_experiments, [{ class_name: '', course: '', experiment: '', score: '' }]));
    setA4Rows(safeParse(app.a4_feedback_scores, [{ class_name: '', course: '', mid_score: '', end_score: '', avg_score: '' }]));
    setA5Rows(safeParse(app.a5_pass_percentage, [{ class_name: '', course: '', odd_pass: '', even_pass: '', avg_pass: '' }]));
    setA6Rows(safeParse(app.a6_industry_partnerships, [{ course_name: '', industry: '', duration: '', score: '' }]));
    setA7Rows(safeParse(app.a7_hackathons, [{ competition: '', team_members: '', project_title: '', position: '', score: '' }]));
    setB4Rows(safeParse(app.b4_curriculum_dev, [{ course_name: '', academic_year: getCurrentAcademicYear(), details: '', score: '' }]));
    setB7Rows(safeParse(app.b7_industry_training, [{ name: '', company: '', duration: '', score: '' }]));
    setC3Rows(safeParse(app.c3_community_service, [{ activity_name: '', event_type: '', location: '', date: '', score: '' }]));

    setGoalsNextYear(app.goals_next_year || '');
    setViewingAppraisal(null);
    setShowAddForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 100);
  };

  // Automatically sync academic_year in b4Rows whenever top-level academicYear changes
  useEffect(() => {
    if (academicYear) {
      setB4Rows(prev => prev.map(r => ({ ...r, academic_year: academicYear })));
    }
  }, [academicYear]);

  const handlePreviewCurrentForm = () => {
    const liveDraftAppraisal = {
      id: editingAppraisalId || 'draft',
      isDraft: true,
      staff_id: auth.staffId,
      staff_name: auth.name,
      Department: auth.department || auth.dept,
      Designation: auth.designation,
      academic_year: academicYear,
      a1_ict_tools: JSON.stringify(a1Rows),
      a2_econtent: JSON.stringify(a2Rows),
      a3_lab_experiments: JSON.stringify(a3Rows),
      a4_feedback_scores: JSON.stringify(a4Rows),
      a5_pass_percentage: JSON.stringify(a5Rows),
      a6_industry_partnerships: JSON.stringify(a6Rows),
      a7_hackathons: JSON.stringify(a7Rows),
      b4_curriculum_dev: JSON.stringify(b4Rows.map(r => ({ ...r, academic_year: academicYear }))),
      b7_industry_training: JSON.stringify(b7Rows),
      c3_community_service: JSON.stringify(c3Rows),
      publications_count: publicationsCount,
      books_count: booksCount,
      patents_count: patentsCount,
      grants_amount: grantsAmount,
      goals_next_year: goalsNextYear,
      self_appraisal_score: `${manualScores.grandTotal} / ${totalMax}`,
      part_a_score: manualScores.partA,
      part_b_score: manualScores.partB,
      part_c_score: manualScores.partC,
      part_d_score: manualScores.partD,
      total_fpi_score: manualScores.grandTotal,
      status: editingAppraisalId ? 'Form Edit Preview' : 'Draft Form Preview',
      submitted_at: new Date().toISOString()
    };

    if (generalInfo) {
      setViewingGeneralInfo(generalInfo);
    }
    setViewingAppraisal(liveDraftAppraisal);
  };

  // Automated FPI Summary State
  const [fpiSummary, setFpiSummary] = useState({
    part_a_score: 0,
    part_b_score: 0,
    part_c_score: 0,
    part_d_score: 0,
    total_fpi_score: 0
  });

  useEffect(() => {
    fetchTemplate();
    fetchAppraisals();
    fetchFpiSummary();
    fetchGeneralInfo();
    if (isAdminOrHR) {
      fetchDepartments();
    }
  }, [auth]);

  useEffect(() => {
    if (viewingAppraisal && viewingAppraisal.staff_id) {
      fetch(`${API_BASE_URL}/api/faculty/appraisal/general-info/${viewingAppraisal.staff_id}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setViewingGeneralInfo(data);
      })
      .catch(() => {});
    } else {
      setViewingGeneralInfo(null);
    }
  }, [viewingAppraisal, auth.token]);

  const [interactionsList, setInteractionsList] = useState([]);
  const [responsibilitiesList, setResponsibilitiesList] = useState([]);

  // HOD Evaluation State
  const [hodScores, setHodScores] = useState({
    hod_part_a_score: '',
    hod_part_b_score: '',
    hod_part_c_score: '',
    hod_part_d_score: '',
    hod_remarks: ''
  });

  // Principal & HR Final Evaluation State
  const [finalScores, setFinalScores] = useState({});

  useEffect(() => {
    fetchTemplate();
    fetchAppraisals();
    fetchFpiSummary();
    fetchGeneralInfo();
    if (isAdminOrHR) {
      fetchDepartments();
    }
  }, [auth]);

  const fetchGeneralInfo = async (targetStaffId = auth.staffId) => {
    try {
      const staffIdToUse = (targetStaffId && targetStaffId !== 'undefined' && targetStaffId !== 'null') 
        ? targetStaffId 
        : (auth.staffId || auth.username || auth.id || 'me');

      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/general-info/${staffIdToUse}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneralInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch general info:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const defaultFpiItemsFallback = [
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A1', criteria_title: 'Innovative ICT Tools Integrated in Course Delivery', rubric_description: '5 marks per innovative ICT tool (Kahoot, Virtual Labs, Canvas, Padlet, Google Classroom) integrated into course delivery.', mapping_type: 'manual', max_marks: 10, display_order: 1 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A2', criteria_title: 'E-Content & Video Lectures Developed', rubric_description: '5 marks per original e-content / video lecture module developed and hosted on LMS / YouTube.', mapping_type: 'manual', max_marks: 10, display_order: 2 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A3', criteria_title: 'Development of New Lab Experiments / Manuals', rubric_description: '5 marks per new lab experiment or virtual lab manual developed for curriculum enhancement.', mapping_type: 'manual', max_marks: 10, display_order: 3 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A4', criteria_title: 'Student Feedback Score Rating', rubric_description: '10 marks for average feedback rating >=4.5/5, 7 marks for 4.0-4.4, 5 marks for 3.0-3.9.', mapping_type: 'manual', max_marks: 10, display_order: 4 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A5', criteria_title: 'End Semester Course Pass Percentage', rubric_description: '10 marks for pass percentage >=85%, 7 marks for 75-84%, 5 marks for 60-74%.', mapping_type: 'manual', max_marks: 10, display_order: 5 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A6', criteria_title: 'Value Added Courses & Industry Workshops Delivered', rubric_description: '5 marks per value-added course or industry hands-on workshop conducted.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, display_order: 6 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A7', criteria_title: 'Mentoring Students in Hackathons & Competitions', rubric_description: '5 marks for mentoring winning/finalist teams in national/international hackathons.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, display_order: 7 },

    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B1', criteria_title: 'Professional Society Memberships', rubric_description: 'Automatic mapping: 3 marks per active professional society membership (IEEE, ISTE, ACM, CSI, etc.) [Max 3 pts].', mapping_type: 'auto', fixed_mark_per_record: 3, max_marks: 3, display_order: 8 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B2', criteria_title: 'Resource Speaker / Session Chair / Invited Talks', rubric_description: 'Automatic mapping: 2 marks per invited guest lecture, resource talk, or session chair role delivered [Max 4 pts].', mapping_type: 'auto', fixed_mark_per_record: 2, max_marks: 4, display_order: 9 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B3', criteria_title: 'FDPs / STTPs / Workshops Attended', rubric_description: 'Automatic mapping: 2.5 marks if >=5 days duration, 2 marks if <5 days duration [Max 5 pts].', mapping_type: 'auto', fixed_mark_per_record: 2.5, max_marks: 5, display_order: 10 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B4', criteria_title: 'Curriculum Development & Board of Studies (BOS)', rubric_description: '5 marks for active BoS membership, syllabus revision, or curriculum framing.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, display_order: 11 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B5', criteria_title: 'Organizing FDPs / Conferences / Symposia', rubric_description: 'Automatic mapping: 4 marks per national/international conference, FDP, or symposium organized [Max 8 pts].', mapping_type: 'auto', fixed_mark_per_record: 4, max_marks: 8, display_order: 12 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B6', criteria_title: 'Online Certifications (SWAYAM / NPTEL / Coursera)', rubric_description: 'Automatic mapping: 5 marks for 8/12 week NPTEL/SWAYAM course, 2.5 marks for 4 week course [Max 10 pts].', mapping_type: 'auto', fixed_mark_per_record: 5, max_marks: 10, display_order: 13 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B7', criteria_title: 'Industrial Training / Corporate Internship Completed', rubric_description: '5 marks per corporate training / industrial fellowship completed (min 2 weeks).', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, display_order: 14 },

    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C1', criteria_title: 'Research Publications in Journals & Conferences', rubric_description: 'Automatic mapping: 10 marks per Journal paper, 5 marks per Conference paper [Max 20 pts].', mapping_type: 'auto', fixed_mark_per_record: 10, max_marks: 20, display_order: 15 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C2', criteria_title: 'Books & Book Chapters Published', rubric_description: 'Automatic mapping: 5 marks per book or book chapter published with ISBN [Max 10 pts].', mapping_type: 'auto', fixed_mark_per_record: 5, max_marks: 10, display_order: 16 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C3', criteria_title: 'Community Service & Extension Activities', rubric_description: '5 marks per community outreach, societal project, or extension program.', mapping_type: 'manual', fixed_mark_per_record: 5, max_marks: 5, display_order: 17 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C4', criteria_title: 'IPR, Patents & Copyrights', rubric_description: 'Automatic mapping: 10 marks for Patent Granted / Copyright Registered, 7 marks for Patent Published, 3 marks for Filed [Max 10 pts].', mapping_type: 'auto', fixed_mark_per_record: 10, max_marks: 10, display_order: 18 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C5', criteria_title: 'Research Grants & External Sponsored Projects', rubric_description: 'Automatic mapping: 10 marks for sanctioned grant >5 Lakhs, 8 marks for <=5 Lakhs, 5 per proposal [Max 15 pts].', mapping_type: 'auto', fixed_mark_per_record: 10, max_marks: 15, display_order: 19 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C6', criteria_title: 'Seed Money & Consultancy Services', rubric_description: 'Automatic mapping: 5 marks per internal seed money grant or external consultancy project [Max 10 pts].', mapping_type: 'auto', fixed_mark_per_record: 5, max_marks: 10, display_order: 20 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C8', criteria_title: 'Research Scholars Guidance (Ph.D)', rubric_description: 'Automatic mapping: 2.5 marks per registered Ph.D scholar under supervisorship [Max 5 pts].', mapping_type: 'auto', fixed_mark_per_record: 2.5, max_marks: 5, display_order: 21 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C9', criteria_title: 'Awards & Recognitions Received', rubric_description: 'Automatic mapping: 5 marks per national/international award or honor received [Max 5 pts].', mapping_type: 'auto', fixed_mark_per_record: 5, max_marks: 5, display_order: 22 },

    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D1', criteria_title: 'Assigned Institutional & Departmental Responsibilities', rubric_description: 'Automatic mapping: 10 marks per Institutional role (Max 20), 10 marks per Departmental role (Max 10). Combined Max 20 pts.', mapping_type: 'auto', fixed_mark_per_record: 10, max_marks: 20, display_order: 23 },
    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D2', criteria_title: 'Student Mentoring, Counseling & Academic Guidance', rubric_description: '10 marks for effective mentee tracking, counseling logs, and academic progress monitoring.', mapping_type: 'manual', fixed_mark_per_record: 10, max_marks: 10, display_order: 24 },
    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D3', criteria_title: 'Contribution to NBA / NAAC / Autonomous Accreditations', rubric_description: '10 marks for criterion head / module coordinator role in NBA, NAAC, or Autonomous audits.', mapping_type: 'manual', fixed_mark_per_record: 10, max_marks: 10, display_order: 25 }
  ];

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appraisal/template`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTemplateItems(data && data.length > 0 ? data : defaultFpiItemsFallback);
      } else {
        setTemplateItems(defaultFpiItemsFallback);
      }
    } catch (err) {
      console.error('Failed to fetch appraisal template:', err);
      setTemplateItems(defaultFpiItemsFallback);
    }
  };

  const handleSaveTemplate = async () => {
    setMessage('');
    setError('');
    setSavingTemplate(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appraisal/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ items: templateItems })
      });

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.substring(0, 100)}`);
      }

      if (!res.ok) throw new Error(data.error || 'Failed to save template');
      setMessage('Appraisal template, rubrics, fixed marks, and max marks saved successfully! Changes are now live for all faculty members.');
    } catch (err) {
      setError(err.message || 'Failed to save template due to a network or server error.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleTemplateItemChange = (index, field, value) => {
    setTemplateItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleAddCriteriaItem = (sectionCode, sectionTitle) => {
    const nextCode = `X${templateItems.length + 1}`;
    setTemplateItems(prev => [
      ...prev,
      {
        section_code: sectionCode,
        section_title: sectionTitle,
        criteria_code: nextCode,
        criteria_title: 'New Evaluation Criteria',
        rubric_description: 'Enter evaluation rubrics and scoring guidelines...',
        mapping_type: 'manual',
        fixed_mark_per_record: 5,
        max_marks: 10,
        display_order: prev.length + 1
      }
    ]);
  };

  const handleRemoveCriteriaItem = (index) => {
    setTemplateItems(prev => prev.filter((_, i) => i !== index));
  };

  const fetchFpiSummary = async () => {
    try {
      fetch(`${API_BASE_URL}/api/activities/interactions?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => setInteractionsList(data))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/activities/responsibilities?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => setResponsibilitiesList(data))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/activities/publications?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPublicationsCount(data.length))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/activities/books?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => setBooksCount(data.length))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/activities/ipr?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPatentsCount(data.length))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/activities/funding?staffId=${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        let totalAmt = 0;
        data.forEach(f => { totalAmt += (parseFloat(f.amount) || 0); });
        setGrantsAmount(totalAmt > 0 ? `₹ ${totalAmt.toLocaleString('en-IN')}` : '₹ 0');
      })
      .catch(err => console.error(err));

      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/fpi-summary/${auth.staffId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFpiDetails(data.details || null);
        setFpiBreakdown(data.breakdown || {});

        let partA = 0;
        a1Rows.forEach(r => { if (parseFloat(r.score)) partA += parseFloat(r.score); });
        a2Rows.forEach(r => { if (parseFloat(r.score)) partA += parseFloat(r.score); });
        a3Rows.forEach(r => { if (parseFloat(r.score)) partA += parseFloat(r.score); });
        a4Rows.forEach(r => { 
          const avg = parseFloat(r.avg_score);
          if (avg >= 4.0) partA += 5;
          else if (avg >= 2.5) partA += 3;
        });
        a5Rows.forEach(r => {
          const pass = parseFloat(r.avg_pass);
          if (pass >= 80) partA += 10;
          else if (pass >= 60) partA += 5;
        });
        a6Rows.forEach(r => { if (parseFloat(r.score)) partA += parseFloat(r.score); });
        a7Rows.forEach(r => { if (parseFloat(r.score)) partA += parseFloat(r.score); });
        const finalPartA = Math.min(60, partA);

        const totalFpi = finalPartA + (data.part_b_score || 0) + (data.part_c_score || 0) + (data.part_d_score || 0);

        setFpiSummary({
          part_a_score: finalPartA,
          part_b_score: data.part_b_score || 0,
          part_c_score: data.part_c_score || 0,
          part_d_score: data.part_d_score || 0,
          total_fpi_score: Math.min(200, totalFpi)
        });

        if (!selfAppraisalScore) {
          setSelfAppraisalScore(`${Math.min(200, totalFpi)} / 200`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch automated FPI summary:', err);
    }
  };

  const fetchAppraisals = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/faculty/appraisals`;
      if (!isAdminOrHR && !isDeptAdmin) {
        url += `?staffId=${auth.staffId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppraisals(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRow = (setter, emptyObj) => setter(prev => [...prev, { ...emptyObj }]);
  const removeRow = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));
  const updateRow = (setter, index, field, value) => {
    setter(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  // Helper for A4 Feedback rating change with automatic score calculation (>=4.0 -> 5 pts, >=2.5 -> 3 pts)
  const handleA4Change = (index, field, value) => {
    setA4Rows(prev => prev.map((row, i) => {
      if (i !== index) return row;
      const updated = { ...row, [field]: value };
      const mid = parseFloat(field === 'mid_score' ? value : row.mid_score);
      const end = parseFloat(field === 'end_score' ? value : row.end_score);
      let avg = null;
      if (!isNaN(mid) && !isNaN(end)) avg = (mid + end) / 2;
      else if (!isNaN(mid)) avg = mid;
      else if (!isNaN(end)) avg = end;

      if (avg !== null) {
        updated.avg_score = avg.toFixed(2);
        updated.score = avg >= 4.0 ? 5 : avg >= 2.5 ? 3 : 0;
      }
      return updated;
    }));
  };

  // Helper for A5 Pass Percentage change with automatic score calculation (>=80% -> 10 pts, >=60% -> 5 pts)
  const handleA5Change = (index, field, value) => {
    setA5Rows(prev => prev.map((row, i) => {
      if (i !== index) return row;
      const updated = { ...row, [field]: value };
      const odd = parseFloat(field === 'odd_pass' ? value : row.odd_pass);
      const even = parseFloat(field === 'even_pass' ? value : row.even_pass);
      let avg = null;
      if (!isNaN(odd) && !isNaN(even)) avg = (odd + even) / 2;
      else if (!isNaN(odd)) avg = odd;
      else if (!isNaN(even)) avg = even;

      if (avg !== null) {
        updated.avg_pass = avg.toFixed(2);
        updated.score = avg >= 80 ? 10 : avg >= 60 ? 5 : 0;
      }
      return updated;
    }));
  };

  // Real-time automatic score calculation for manual entry rows matching FPI.docx
  useEffect(() => {
    if (isAdminOrHR) return;

    // A1: 2 marks per ICT tool (Max 10)
    let calcA1 = Math.min(10, a1Rows.filter(r => (r.ict_tool || r.course || r.class_name || '').trim().length > 0).length * 2);
    // A2: 5 marks per e-content (Max 10)
    let calcA2 = Math.min(10, a2Rows.filter(r => (r.title || r.platform || r.course || '').trim().length > 0).length * 5);
    // A3: 2.5 marks per lab experiment (Max 10)
    let calcA3 = Math.min(10, a3Rows.filter(r => (r.experiment || r.lab_name || r.course || r.class_name || '').trim().length > 0).length * 2.5);

    // A4: Feedback Rating >4 -> 5 marks, 2.5 to 4 -> 3 marks (Max 5)
    let calcA4 = 0;
    a4Rows.forEach(r => {
      const avg = parseFloat(r.avg_score);
      if (!isNaN(avg)) {
        if (avg >= 4.0) calcA4 += 5;
        else if (avg >= 2.5) calcA4 += 3;
      }
    });
    calcA4 = Math.min(5, calcA4);

    // A5: Pass Percentage >80% -> 10 marks, 60-80% -> 5 marks (Max 10)
    let calcA5 = 0;
    a5Rows.forEach(r => {
      const pass = parseFloat(r.avg_pass);
      if (!isNaN(pass)) {
        if (pass >= 80) calcA5 += 10;
        else if (pass >= 60) calcA5 += 5;
      }
    });
    calcA5 = Math.min(10, calcA5);

    // A6: Industry Institute Partnerships (Max 5)
    let calcA6 = Math.min(5, a6Rows.filter(r => (r.name || r.industry || r.course_name || '').trim().length > 0).length * 5);

    // A7: Hackathons Guidance (Prize Won -> 10 marks, Participation -> 5 marks, Max 10)
    let calcA7 = 0;
    a7Rows.forEach(r => {
      if ((r.competition || r.project_title || r.team_members || '').trim().length > 0) {
        if (r.position === 'Prize Won') calcA7 += 10;
        else calcA7 += 5;
      }
    });
    calcA7 = Math.min(10, calcA7);

    const totalPartA = Math.min(60, calcA1 + calcA2 + calcA3 + calcA4 + calcA5 + calcA6 + calcA7);

    // Manual B4 & B7
    let calcB4 = Math.min(5, b4Rows.filter(r => (r.course_name || r.details || r.title || r.activity || '').trim().length > 0).length * 5);
    let calcB7 = Math.min(5, b7Rows.filter(r => (r.name || r.company || r.duration || r.title || '').trim().length > 0).length * 5);
    const autoPartB = (fpiBreakdown.b1_memberships || 0) + (fpiBreakdown.b2_resource || 0) + (fpiBreakdown.b3_interactions || 0) + (fpiBreakdown.b5_events || 0) + (fpiBreakdown.b6_certs || 0);
    const totalPartB = Math.min(40, autoPartB + calcB4 + calcB7);

    // Manual C3
    let calcC3 = Math.min(5, c3Rows.filter(r => (r.activity_name || r.event_type || r.location || r.title || r.organization || '').trim().length > 0).length * 5);
    const autoPartC = (fpiBreakdown.c1_publications || 0) + (fpiBreakdown.c2_books || 0) + (fpiBreakdown.c4_ipr || 0) + (fpiBreakdown.c5_funding || 0) + (fpiBreakdown.c6_seed_money || 0);
    const totalPartC = Math.min(80, autoPartC + calcC3);

    // Part D
    const autoPartD = fpiBreakdown.d_responsibilities || 0;
    const totalPartD = Math.min(20, autoPartD);

    const grandTotal = Math.min(200, totalPartA + totalPartB + totalPartC + totalPartD);

    setFpiSummary({
      part_a_score: totalPartA,
      part_b_score: totalPartB,
      part_c_score: totalPartC,
      part_d_score: totalPartD,
      total_fpi_score: grandTotal
    });

    setSelfAppraisalScore(`${grandTotal} / 200`);
  }, [a1Rows, a2Rows, a3Rows, a4Rows, a5Rows, a6Rows, a7Rows, b4Rows, b7Rows, c3Rows, fpiBreakdown]);

  // Live Category-Wise and Section-Wise Manual Scores Calculation
  const manualScores = useMemo(() => {
    const a1 = Math.min(10, a1Rows.filter(r => (r.ict_tool || r.course || r.class_name || '').trim().length > 0).length * 2);
    const a2 = Math.min(10, a2Rows.filter(r => (r.title || r.platform || r.course || '').trim().length > 0).length * 5);
    const a3 = Math.min(10, a3Rows.filter(r => (r.experiment || r.lab_name || r.course || r.class_name || '').trim().length > 0).length * 2.5);

    let a4 = 0;
    a4Rows.forEach(r => {
      const avg = parseFloat(r.avg_score);
      if (!isNaN(avg)) {
        if (avg >= 4.0) a4 += 5;
        else if (avg >= 2.5) a4 += 3;
      }
    });
    a4 = Math.min(5, a4);

    let a5 = 0;
    a5Rows.forEach(r => {
      const pass = parseFloat(r.avg_pass);
      if (!isNaN(pass)) {
        if (pass >= 80) a5 += 10;
        else if (pass >= 60) a5 += 5;
      }
    });
    a5 = Math.min(10, a5);

    const a6 = Math.min(5, a6Rows.filter(r => (r.name || r.industry || r.course_name || '').trim().length > 0).length * 5);

    let a7 = 0;
    a7Rows.forEach(r => {
      if ((r.competition || r.project_title || r.team_members || '').trim().length > 0) {
        if (r.position === 'Prize Won') a7 += 10;
        else a7 += 5;
      }
    });
    a7 = Math.min(10, a7);

    const partA = Math.min(60, a1 + a2 + a3 + a4 + a5 + a6 + a7);

    const b4 = Math.min(5, b4Rows.filter(r => (r.course_name || r.details || r.title || r.activity || '').trim().length > 0).length * 5);
    const b7 = Math.min(5, b7Rows.filter(r => (r.name || r.company || r.duration || r.title || '').trim().length > 0).length * 5);
    const autoPartB = (fpiBreakdown.b1_memberships || 0) + (fpiBreakdown.b2_resource || 0) + (fpiBreakdown.b3_interactions || 0) + (fpiBreakdown.b5_events || 0) + (fpiBreakdown.b6_certs || 0);
    const partB = Math.min(40, autoPartB + b4 + b7);

    const c3 = Math.min(5, c3Rows.filter(r => (r.activity_name || r.event_type || r.location || r.title || r.organization || '').trim().length > 0).length * 5);
    const autoPartC = (fpiBreakdown.c1_publications || 0) + (fpiBreakdown.c2_books || 0) + (fpiBreakdown.c4_ipr || 0) + (fpiBreakdown.c5_funding || 0) + (fpiBreakdown.c6_seed_money || 0);
    const partC = Math.min(80, autoPartC + c3);

    const partD = Math.min(20, fpiBreakdown.d_responsibilities || 0);

    return {
      a1, a2, a3, a4, a5, a6, a7, partA,
      b4, b7, autoPartB, partB,
      c3, autoPartC, partC,
      partD,
      grandTotal: Math.min(200, partA + partB + partC + partD)
    };
  }, [a1Rows, a2Rows, a3Rows, a4Rows, a5Rows, a6Rows, a7Rows, b4Rows, b7Rows, c3Rows, fpiBreakdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!academicYear || !academicYear.trim()) { setError('Academic Year is mandatory.'); return; }
    if (!selfAppraisalScore || !selfAppraisalScore.trim()) { setError('Self Appraisal Score is mandatory.'); return; }

    try {
      const isEditing = Boolean(editingAppraisalId);
      const url = isEditing
        ? `${API_BASE_URL}/api/faculty/appraisal/${editingAppraisalId}`
        : `${API_BASE_URL}/api/faculty/appraisal`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          academic_year: academicYear,
          courses_taught: coursesTaught || 'N/A',
          pass_percentage: 'See Grid a5',
          student_feedback: 'See Grid a4',
          innovative_methods: 'See Grid a1',
          a1_ict_tools: JSON.stringify(a1Rows),
          a2_econtent: JSON.stringify(a2Rows),
          a3_lab_experiments: JSON.stringify(a3Rows),
          a4_feedback_scores: JSON.stringify(a4Rows),
          a5_pass_percentage: JSON.stringify(a5Rows),
          a6_industry_partnerships: JSON.stringify(a6Rows),
          a7_hackathons: JSON.stringify(a7Rows),
          b4_curriculum_dev: JSON.stringify(b4Rows),
          b7_industry_training: JSON.stringify(b7Rows),
          c3_community_service: JSON.stringify(c3Rows),
          publications_count: publicationsCount,
          books_count: booksCount,
          patents_count: patentsCount,
          grants_amount: grantsAmount,
          fdp_attended: fdpAttended || '2',
          events_organized: eventsOrganized || '1',
          self_appraisal_score: selfAppraisalScore,
          goals_next_year: goalsNextYear,
          part_a_score: manualScores.partA,
          part_b_score: manualScores.partB,
          part_c_score: manualScores.partC,
          part_d_score: manualScores.partD,
          total_fpi_score: manualScores.grandTotal
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit appraisal form');

      const savedRecord = {
        id: isEditing ? editingAppraisalId : data.id,
        staff_id: auth.staffId,
        staff_name: auth.name,
        Department: auth.department || auth.dept,
        Designation: auth.designation,
        academic_year: academicYear,
        a1_ict_tools: JSON.stringify(a1Rows),
        a2_econtent: JSON.stringify(a2Rows),
        a3_lab_experiments: JSON.stringify(a3Rows),
        a4_feedback_scores: JSON.stringify(a4Rows),
        a5_pass_percentage: JSON.stringify(a5Rows),
        a6_industry_partnerships: JSON.stringify(a6Rows),
        a7_hackathons: JSON.stringify(a7Rows),
        b4_curriculum_dev: JSON.stringify(b4Rows),
        b7_industry_training: JSON.stringify(b7Rows),
        c3_community_service: JSON.stringify(c3Rows),
        publications_count: publicationsCount,
        books_count: booksCount,
        patents_count: patentsCount,
        grants_amount: grantsAmount,
        goals_next_year: goalsNextYear,
        self_appraisal_score: selfAppraisalScore,
        part_a_score: manualScores.partA,
        part_b_score: manualScores.partB,
        part_c_score: manualScores.partC,
        part_d_score: manualScores.partD,
        total_fpi_score: manualScores.grandTotal,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      };

      setLastSubmittedAppraisal(savedRecord);
      setMessage(isEditing ? 'Annual FPI Appraisal Form updated and re-submitted successfully!' : 'Annual FPI Appraisal Form submitted successfully! Click "View Filled Appraisal Form" to check your details.');
      setEditingAppraisalId(null);
      setShowAddForm(false);
      fetchAppraisals();
    } catch (err) {
      setError(err.message);
    }
  };

  // Digital Signature Handler
  const handleSign = async (appraisalId, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${appraisalId}/sign/${role}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign');
      // Update viewingAppraisal with new signature data so UI refreshes immediately
      setViewingAppraisal(prev => ({
        ...prev,
        [`${role}_signed_at`]: data.signedAt,
        [`${role}_signed_name`]: data.signedName
      }));
      fetchAppraisals();
      setMessage(`Digitally signed successfully as ${data.signedName}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Save form + Sign in one step (when faculty signs from draft preview before submitting)
  const handleSaveAndSign = async () => {
    setMessage('');
    setError('');
    try {
      const isEditing = Boolean(editingAppraisalId);
      const url = isEditing
        ? `${API_BASE_URL}/api/faculty/appraisal/${editingAppraisalId}`
        : `${API_BASE_URL}/api/faculty/appraisal`;
      const method = isEditing ? 'PUT' : 'POST';

      const saveRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify({
          academic_year: academicYear,
          courses_taught: coursesTaught || 'N/A',
          pass_percentage: 'See Grid a5',
          student_feedback: 'See Grid a4',
          innovative_methods: 'See Grid a1',
          a1_ict_tools: JSON.stringify(a1Rows),
          a2_econtent: JSON.stringify(a2Rows),
          a3_lab_experiments: JSON.stringify(a3Rows),
          a4_feedback_scores: JSON.stringify(a4Rows),
          a5_pass_percentage: JSON.stringify(a5Rows),
          a6_industry_partnerships: JSON.stringify(a6Rows),
          a7_hackathons: JSON.stringify(a7Rows),
          b4_curriculum_dev: JSON.stringify(b4Rows),
          b7_industry_training: JSON.stringify(b7Rows),
          c3_community_service: JSON.stringify(c3Rows),
          publications_count: publicationsCount,
          books_count: booksCount,
          patents_count: patentsCount,
          grants_amount: grantsAmount,
          fdp_attended: fdpAttended || '2',
          events_organized: eventsOrganized || '1',
          self_appraisal_score: selfAppraisalScore,
          goals_next_year: goalsNextYear,
          part_a_score: manualScores.partA,
          part_b_score: manualScores.partB,
          part_c_score: manualScores.partC,
          part_d_score: manualScores.partD,
          total_fpi_score: manualScores.grandTotal
        })
      });
      if (!saveRes.ok) {
        const saveErr = await saveRes.json();
        throw new Error(saveErr.error || 'Failed to save form');
      }
      const saveData = await saveRes.json();
      const appraisalId = isEditing ? editingAppraisalId : saveData.id;

      // Now digitally sign as faculty
      const signRes = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${appraisalId}/sign/faculty`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || 'Failed to sign');

      // Update viewingAppraisal to reflect saved + signed state
      setViewingAppraisal(prev => ({
        ...prev,
        id: appraisalId,
        isDraft: false,
        faculty_signed_at: signData.signedAt,
        faculty_signed_name: signData.signedName
      }));
      setEditingAppraisalId(appraisalId);
      fetchAppraisals();
      setMessage(`Form submitted and digitally signed as ${signData.signedName}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleHodApproveSubmit = async (appId, action) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${appId}/hod-approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          ...hodScores,
          action
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit HOD evaluation');
      setMessage(data.message || 'HOD Evaluation submitted successfully!');
      fetchAppraisals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinalApproveSubmit = async (target, action) => {
    setMessage('');
    setError('');
    try {
      const appId = typeof target === 'object' ? target.id : target;
      const app = typeof target === 'object' ? target : appraisals.find(a => a.id === appId) || {};
      const fState = finalScores[appId] || {};

      const partA = fState.part_a !== undefined && fState.part_a !== '' ? parseFloat(fState.part_a) : (parseFloat(app.hod_part_a_score) || parseFloat(app.part_a_score) || 0);
      const partB = fState.part_b !== undefined && fState.part_b !== '' ? parseFloat(fState.part_b) : (parseFloat(app.hod_part_b_score) || parseFloat(app.part_b_score) || 0);
      const partC = fState.part_c !== undefined && fState.part_c !== '' ? parseFloat(fState.part_c) : (parseFloat(app.hod_part_c_score) || parseFloat(app.part_c_score) || 0);
      const partD = fState.part_d !== undefined && fState.part_d !== '' ? parseFloat(fState.part_d) : (parseFloat(app.hod_part_d_score) || parseFloat(app.part_d_score) || 0);
      const totalScore = partA + partB + partC + partD;

      const payload = {
        action,
        final_part_a_score: partA,
        final_part_b_score: partB,
        final_part_c_score: partC,
        final_part_d_score: partD,
        final_total_score: totalScore,
        final_remarks: fState.remarks || '',
        remarks: fState.remarks || ''
      };

      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${appId}/final-approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process final approval');
      setMessage(data.message || 'Final evaluation & executive approval processed successfully!');
      fetchAppraisals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appraisal submission?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage('Appraisal record deleted successfully.');
        fetchAppraisals();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete appraisal.');
      }
    } catch (err) {
      setError('Failed to delete appraisal.');
    }
  };

  const handleOpenViewModal = async (app) => {
    setViewingAppraisal(app);
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/general-info/${app.staff_id}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setViewingGeneralInfo(data);
      }
    } catch (e) {
      setViewingGeneralInfo(null);
    }
  };

  // Filter appraisals for Admin / Dept Admin / Principal / HR
  const filteredAppraisals = appraisals.filter(app => {
    if (selectedDeptFilter) {
      const itemDept = (app.Department || '').trim().toLowerCase();
      const selDept = selectedDeptFilter.trim().toLowerCase();
      const matches = itemDept === selDept || departments.some(d => 
        (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && 
        (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept)
      );
      if (!matches) return false;
    }
    if (statusFilter) {
      if ((app.status || 'Submitted').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        (app.staff_name || '').toLowerCase().includes(q) ||
        (app.staff_id || '').toLowerCase().includes(q) ||
        (app.Designation || '').toLowerCase().includes(q) ||
        (app.Department || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Section Max Marks from Dynamic Template (Matching official FPI.docx: Part A=60, Part B=40, Part C=80, Part D=20, Total=200)
  const partAMax = Math.min(60, templateItems.filter(i => i.section_code === 'PART_A').reduce((acc, curr) => acc + (parseFloat(curr.max_marks) || 0), 0) || 60);
  const partBMax = Math.min(40, templateItems.filter(i => i.section_code === 'PART_B').reduce((acc, curr) => acc + (parseFloat(curr.max_marks) || 0), 0) || 40);
  const partCMax = Math.min(80, templateItems.filter(i => i.section_code === 'PART_C').reduce((acc, curr) => acc + (parseFloat(curr.max_marks) || 0), 0) || 80);
  const partDMax = Math.min(20, templateItems.filter(i => i.section_code === 'PART_D').reduce((acc, curr) => acc + (parseFloat(curr.max_marks) || 0), 0) || 20);
  const totalMax = Math.min(200, partAMax + partBMax + partCMax + partDMax);

  // General Information Table Component matching FPI.docx
  const GeneralInfoTable = ({ data }) => {
    const info = data || viewingGeneralInfo || generalInfo || {};
    const dept = info.departmentName || (viewingAppraisal && viewingAppraisal.Department) || auth.department || auth.dept || 'N/A';
    const name = info.facultyName || (viewingAppraisal && viewingAppraisal.staff_name) || auth.name || 'N/A';
    const desig = info.designation || (viewingAppraisal && viewingAppraisal.Designation) || auth.designation || 'N/A';
    const qual = (info.qualification && info.qualification !== 'N/A') ? info.qualification : (generalInfo && generalInfo.qualification ? generalInfo.qualification : 'M.E. / M.Tech.');
    const doj = (info.doj && info.doj !== 'N/A') ? info.doj : (generalInfo && generalInfo.doj && generalInfo.doj !== 'N/A' ? generalInfo.doj : 'N/A');
    const promo = (info.promotionDetails && info.promotionDetails !== 'N/A') ? info.promotionDetails : (generalInfo && generalInfo.promotionDetails ? generalInfo.promotionDetails : 'N/A');
    const prevExp = (info.prevExp && info.prevExp !== 'N/A') ? info.prevExp : (generalInfo && generalInfo.prevExp ? generalInfo.prevExp : '0 Y, 0 M');
    const srecExp = (info.srecExp && info.srecExp !== 'N/A') ? info.srecExp : (generalInfo && generalInfo.srecExp ? generalInfo.srecExp : '0 Y, 0 M');
    const totalExp = (info.totalTeachingExp && info.totalTeachingExp !== 'N/A') ? info.totalTeachingExp : (generalInfo && generalInfo.totalTeachingExp ? generalInfo.totalTeachingExp : '0 Y, 0 M');
    const indExp = (info.industryExp && info.industryExp !== 'N/A') ? info.industryExp : (generalInfo && generalInfo.industryExp ? generalInfo.industryExp : '0 Y, 0 M');
    const phd = (info.phdStatus && info.phdStatus !== 'N/A') ? info.phdStatus : (generalInfo && generalInfo.phdStatus ? generalInfo.phdStatus : 'Yet to Register');

    return (
      <div style={{ marginBottom: '24px', border: '1.5px solid #0f172a', borderRadius: '8px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>GENERAL INFORMATION</span>
          <span style={{ fontSize: '0.75rem', background: '#334155', padding: '2px 8px', borderRadius: '4px', textTransform: 'none', fontWeight: 600 }}>Auto-Mapped from Portal</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, width: '35%', background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>Name of the Department</td>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{dept}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>Name of the Faculty</td>
              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{name}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>Designation</td>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{desig}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>Qualification</td>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{qual}</td>
            </tr>

            {/* Date of Appointment @ SREC */}
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b', verticalAlign: 'top' }}>
                Date of Appointment @ SREC
              </td>
              <td style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, width: '35%', background: '#f1f5f9', borderRight: '1px solid #cbd5e1' }}>DOJ</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{doj}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', fontWeight: 700, background: '#f1f5f9', borderRight: '1px solid #cbd5e1' }}>
                        Promotion if any<br/><span style={{ fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic', color: '#64748b' }}>(Designation with year)</span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>{promo}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Teaching Experience */}
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b', verticalAlign: 'top' }}>
                Teaching Experience<br/><span style={{ fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic', color: '#64748b' }}>(In Years)</span>
              </td>
              <td style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', fontWeight: 700 }}>
                      <th style={{ padding: '6px 10px', borderRight: '1px solid #cbd5e1', width: '33%' }}>Previous Institution</th>
                      <th style={{ padding: '6px 10px', borderRight: '1px solid #cbd5e1', width: '33%' }}>Present Institution</th>
                      <th style={{ padding: '6px 10px', width: '34%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{prevExp}</td>
                      <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{srecExp}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0284c7' }}>{totalExp}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* Industry Experience */}
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>
                Industry Experience<br/><span style={{ fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic', color: '#64748b' }}>(In Years)</span>
              </td>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{indExp}</td>
            </tr>

            {/* Ph.D Status */}
            <tr>
              <td style={{ padding: '10px 14px', fontWeight: 700, background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#1e293b' }}>
                Ph.D Status<br/><span style={{ fontSize: '0.75rem', fontWeight: 500, fontStyle: 'italic', color: '#64748b' }}>(Completed / Pursuing / Yet to Register)</span>
              </td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{
                  padding: '5px 14px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'inline-block',
                  background: phd === 'Completed' ? '#dcfce7' : phd === 'Pursuing' ? '#e0f2fe' : '#f1f5f9',
                  color: phd === 'Completed' ? '#15803d' : phd === 'Pursuing' ? '#0369a1' : '#475569',
                  border: `1px solid ${phd === 'Completed' ? '#86efac' : phd === 'Pursuing' ? '#7dd3fc' : '#cbd5e1'}`
                }}>
                  {phd}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Detailed Activity Verification Component for Auto-Mapped Portal Data
  const AutoMappedVerificationPanel = ({ details, breakdown }) => {
    const d = details || fpiDetails || {};
    const b = breakdown || fpiBreakdown || {};

    const groupedCategories = [
      {
        sectionCode: 'PART_B',
        sectionTitle: 'PART B: Professional Development Activities',
        items: [
          { key: 'members', title: 'Professional Memberships', icon: '👥', count: (d.members || []).length, score: b.b1_memberships || 0, max: 3, code: 'B1' },
          { key: 'interactions', title: 'FDPs & Interactions Attended', icon: '🎤', count: (d.interactions || []).length, score: b.b3_interactions || 0, max: 5, code: 'B3' },
          { key: 'events', title: 'Events Organized', icon: '🎪', count: (d.events || []).length, score: b.b5_events || 0, max: 8, code: 'B5' },
          { key: 'certs', title: 'Online Certifications', icon: '🎓', count: (d.certs || []).length, score: b.b6_certs || 0, max: 10, code: 'B6' }
        ]
      },
      {
        sectionCode: 'PART_C',
        sectionTitle: 'PART C: Research & Consultancy',
        items: [
          { key: 'publications', title: 'Research Publications', icon: '📚', count: (d.publications || []).length, score: b.c1_publications || 0, max: 20, code: 'C1' },
          { key: 'books', title: 'Books & Chapters Published', icon: '📖', count: (d.books || []).length, score: b.c2_books || 0, max: 10, code: 'C2' },
          { key: 'ipr', title: 'Patents & IPR', icon: '🛡️', count: (d.ipr || []).length, score: b.c4_ipr || 0, max: 10, code: 'C4' },
          { key: 'funding', title: 'Research Grants Received', icon: '💰', count: (d.funding || []).length, score: b.c5_funding || 0, max: 15, code: 'C5' },
          { key: 'seedMoney', title: 'Seed Money Grants', icon: '🌱', count: (d.seedMoney || []).length, score: b.c6_seed_money || 0, max: 10, code: 'C6' }
        ]
      },
      {
        sectionCode: 'PART_D',
        sectionTitle: 'PART D: Institutional Development & Contribution',
        items: [
          { key: 'responsibilities', title: 'Assigned Responsibilities', icon: '📋', count: (d.responsibilities || []).length, score: b.d_responsibilities || 0, max: 20, code: 'D1' }
        ]
      }
    ];

    const allCategories = groupedCategories.flatMap(g => g.items);
    const currentCatObj = allCategories.find(c => c.key === activeDetailCategory) || allCategories[0];
    const currentList = d[currentCatObj.key] || [];

    const cols = (catKey) => {
      switch (catKey) {
        case 'publications': return { col1: 'Paper Title', col2: 'Journal Name & Indexing', col3: 'Year', col4: 'Indexing Status' };
        case 'books': return { col1: 'Book / Chapter Title', col2: 'Publisher & ISBN', col3: 'Year', col4: 'Type' };
        case 'ipr': return { col1: 'Patent / IPR Title', col2: 'Application No / Details', col3: 'Date', col4: 'Patent Status' };
        case 'funding': return { col1: 'Project Title', col2: 'Funding Agency', col3: 'Sanctioned Amount', col4: 'Status' };
        case 'seedMoney': return { col1: 'Scheme / Proposal Title', col2: 'Sanctioned Amount', col3: 'Year', col4: 'Status' };
        case 'certs': return { col1: 'Course Title', col2: 'Platform / Organization', col3: 'Duration', col4: 'Score %' };
        case 'events': return { col1: 'Event Title / Name', col2: 'Organizer / Sponsorship', col3: 'Dates', col4: 'Category' };
        case 'interactions': return { col1: 'Event / Program Title', col2: 'Organizer / Venue', col3: 'Duration / Dates', col4: 'Category' };
        case 'members': return { col1: 'Professional Body / Organization', col2: 'Membership ID', col3: 'Type / Period', col4: 'Status' };
        case 'responsibilities': return { col1: 'Assigned Role / Position', col2: 'Department / College Level', col3: 'Academic Year', col4: 'Level' };
        default: return { col1: 'Title / Name', col2: 'Organization / Details', col3: 'Date / Year', col4: 'Status' };
      }
    };

    const fields = (item, catKey) => {
      switch (catKey) {
        case 'publications':
          return {
            field1: item.title || item.paper_title || item.name || 'N/A',
            field2: `${item.journal_name || item.journal || ''} ${item.indexing ? `(${item.indexing})` : ''}`.trim() || 'N/A',
            field3: item.year || item.date || 'N/A',
            field4: item.indexing || item.status || 'Published'
          };
        case 'books':
          return {
            field1: item.title || item.book_title || item.name || 'N/A',
            field2: `${item.publisher || ''} ${item.isbn ? `[ISBN: ${item.isbn}]` : ''}`.trim() || 'N/A',
            field3: item.year || item.date || 'N/A',
            field4: item.type || 'Book Chapter'
          };
        case 'ipr':
          return {
            field1: item.title || item.patent_title || item.name || 'N/A',
            field2: item.app_no || item.file || item.details || 'N/A',
            field3: item.date || item.year || 'N/A',
            field4: item.patent_status || item.generation || item.status || 'Filed'
          };
        case 'funding':
          return {
            field1: item.title || item.project_title || item.name || 'N/A',
            field2: item.agency || item.organization || item.sponsership || 'N/A',
            field3: item.amount ? `₹ ${parseFloat(item.amount).toLocaleString('en-IN')}` : 'N/A',
            field4: item.status || 'Sanctioned'
          };
        case 'seedMoney':
          return {
            field1: item.title || item.scheme_title || item.name || 'N/A',
            field2: item.amount || item.granted ? `₹ ${(parseFloat(item.amount || item.granted)).toLocaleString('en-IN')}` : 'N/A',
            field3: item.year || item.date || 'N/A',
            field4: item.status || 'Approved'
          };
        case 'certs':
          return {
            field1: item.title || item.course_name || item.name || 'N/A',
            field2: item.issuer || item.platform || item.organization || 'NPTEL / SWAYAM',
            field3: item.duration_weeks ? `${item.duration_weeks} Weeks` : item.duration || 'N/A',
            field4: item.score || item.percentage ? `${item.score || item.percentage}%` : 'Completed'
          };
        case 'events':
          return {
            field1: item.title || item.name || item.event_title || 'N/A',
            field2: item.organizer || item.sponsership || item.institution || 'N/A',
            field3: item.from_date && item.to_date ? `${item.from_date} to ${item.to_date}` : item.date || 'N/A',
            field4: item.type || item.role || 'Organized'
          };
        case 'interactions':
          return {
            field1: item.title || item.program || item.type || item.event_title || 'N/A',
            field2: item.organizer || item.institute || item.organisation || item.place || 'N/A',
            field3: item.from_date && item.to_date ? `${item.from_date} to ${item.to_date}` : item.date || 'N/A',
            field4: item.type || item.category || 'Attended'
          };
        case 'members':
          return {
            field1: item.organization || item.title || item.name || item.membershipid || 'Professional Body',
            field2: item.membershipid || item.membership_id || item.id || 'N/A',
            field3: item.membership_type || item.type || item.date || 'Life Member',
            field4: 'Active'
          };
        case 'responsibilities':
          return {
            field1: item.role || item.title || item.name || item.responsibility || 'N/A',
            field2: item.level || item.category || item.department || 'Institute Level',
            field3: item.academic_year || item.year || getCurrentAcademicYear(),
            field4: item.level || 'Active'
          };
        default:
          return {
            field1: item.title || item.name || item.role || item.organization || 'N/A',
            field2: item.journal_name || item.publisher || item.organisation || item.agency || item.membershipid || 'N/A',
            field3: item.year || item.date || item.from_date || 'N/A',
            field4: item.status || item.patent_status || item.level || 'Verified'
          };
      }
    };

    const currentCols = cols(currentCatObj.key);

    return (
      <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1.5px solid #7dd3fc', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} /> Automatic Portal Activity Mappings & Score Verification
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#0284c7' }}>
              Click any category below to verify your fetched record details and calculated scores.
            </span>
          </div>

          <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Auto-Fetched from Portal Data
          </span>
        </div>

        {/* Grouped Category Section Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          {groupedCategories.map((group) => (
            <div key={group.sectionCode} style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }}></span>
                  {group.sectionTitle}
                </div>
                <span style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  Section Total: {group.items.reduce((sum, item) => sum + (item.score || 0), 0)} Pts
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {group.items.map((cat) => {
                  const isActive = activeDetailCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveDetailCategory(cat.key)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: isActive ? '1.5px solid #0284c7' : '1px solid #e0f2fe',
                        background: isActive ? '#0284c7' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.title} ({cat.count})</span>
                      <span style={{ padding: '2px 6px', borderRadius: '8px', background: isActive ? 'rgba(255,255,255,0.25)' : '#e0f2fe', color: isActive ? '#ffffff' : '#0369a1', fontSize: '0.75rem', fontWeight: 800 }}>
                        +{cat.score}/{cat.max} pts
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Itemized Table View */}
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #bae6fd', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #e0f2fe', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0369a1' }}>
              {currentCatObj.icon} {currentCatObj.title} Details ({currentList.length} Items)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentCatObj.score >= currentCatObj.max && currentList.length > 0 && (
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  Capped at Max {currentCatObj.max} Marks
                </span>
              )}
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px', border: '1px solid #86efac' }}>
                Awarded Score: {currentCatObj.score} / {currentCatObj.max} Points
              </span>
            </div>
          </div>

          {currentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic' }}>
              No records found in FIS portal for {currentCatObj.title.toLowerCase()}.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>{currentCols.col1}</th>
                  <th>{currentCols.col2}</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>{currentCols.col3}</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>{currentCols.col4}</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((item, index) => {
                  const f = fields(item, currentCatObj.key);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{f.field1}</td>
                      <td>{f.field2}</td>
                      <td style={{ textAlign: 'center' }}>{f.field3}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.78rem', padding: '2px 8px' }}>
                          {f.field4}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* WRAP BACKGROUND PAGE CONTENT IN NO-PRINT SO ONLY FPI MODAL PRINTS */}
      <div className="no-print">
        <Navbar title="Faculty Appraisals" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {message && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--success), 0.15)', border: '1px solid hsla(var(--success), 0.3)', color: 'hsl(var(--success))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--danger), 0.15)', border: '1px solid hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* ADMIN / PRINCIPAL / HR NAVIGATION TABS */}
      {isAdminOrHR && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveAdminTab('submissions')}
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeAdminTab === 'submissions' ? 'hsl(var(--primary))' : '#f1f5f9',
              color: activeAdminTab === 'submissions' ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileCheck size={18} />
            Submitted Faculty Appraisal Forms ({appraisals.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('configurator')}
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeAdminTab === 'configurator' ? 'hsl(var(--primary))' : '#f1f5f9',
              color: activeAdminTab === 'configurator' ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Layers size={18} />
            Dynamic Appraisal Form Builder & Rubrics Configurator
          </button>
        </div>
      )}

      {/* TAB 2: DYNAMIC APPRAISAL FORM BUILDER & RUBRICS CONFIGURATOR (ADMIN/PRINCIPAL/HR) */}
      {isAdminOrHR && activeAdminTab === 'configurator' && (
        <div className="card" style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Layers size={22} style={{ color: 'hsl(var(--primary))' }} />
                Dynamic Appraisal Form Builder & Rubrics Configurator
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Customize FPI appraisal criteria categories, rubrics description, mapping types (Automatic vs Manual), and max marks weights. Changes saved here will immediately reflect in faculty members' logins.
              </p>
            </div>

            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {savingTemplate ? 'Publishing Template...' : 'Save & Publish Template'}
            </button>
          </div>

          {['PART_A', 'PART_B', 'PART_C', 'PART_D'].map((sectionCode) => {
            const sectionTitleMap = {
              'PART_A': 'PART A: Teaching Learning Process (Default Max: 60)',
              'PART_B': 'PART B: Professional Development Activities (Default Max: 40)',
              'PART_C': 'PART C: Research & Consultancy (Default Max: 80)',
              'PART_D': 'PART D: Institutional Development & Contribution (Default Max: 20)'
            };
            const sectionItems = templateItems.filter(i => i.section_code === sectionCode);

            return (
              <div key={sectionCode} style={{ marginBottom: '28px', background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {sectionTitleMap[sectionCode] || sectionCode}
                  </h4>
                  <button
                    onClick={() => handleAddCriteriaItem(sectionCode, sectionTitleMap[sectionCode])}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> Add Criteria
                  </button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '75px' }}>Code</th>
                        <th style={{ width: '200px' }}>Criteria Title</th>
                        <th>Rubrics & Evaluation Description</th>
                        <th style={{ width: '150px' }}>Mapping Type</th>
                        <th style={{ width: '120px' }}>Fixed Mark / Record</th>
                        <th style={{ width: '110px' }}>Total Max Mark</th>
                        <th style={{ width: '50px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionItems.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                            No criteria items added for this section.
                          </td>
                        </tr>
                      ) : (
                        sectionItems.map((item) => {
                          const itemIndex = templateItems.findIndex(i => i.criteria_code === item.criteria_code);
                          return (
                            <tr key={item.criteria_code || itemIndex}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.criteria_code}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'criteria_code', e.target.value)}
                                  style={{ fontSize: '0.82rem', fontWeight: 800, textAlign: 'center' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={item.criteria_title}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'criteria_title', e.target.value)}
                                  style={{ fontSize: '0.85rem' }}
                                />
                              </td>
                              <td>
                                <textarea
                                  className="form-control"
                                  rows="2"
                                  value={item.rubric_description || ''}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'rubric_description', e.target.value)}
                                  style={{ fontSize: '0.82rem' }}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={item.mapping_type || 'manual'}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'mapping_type', e.target.value)}
                                  style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                                >
                                  <option value="auto">Auto (Portal Data)</option>
                                  <option value="manual">Manual Entry</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  className="form-control"
                                  value={item.fixed_mark_per_record ?? 0}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'fixed_mark_per_record', e.target.value)}
                                  style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#0f5233', background: '#f0fdf4' }}
                                  placeholder="0"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  className="form-control"
                                  value={item.max_marks}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'max_marks', e.target.value)}
                                  style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', color: '#1e3a8a', background: '#eff6ff' }}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => handleRemoveCriteriaItem(itemIndex)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  title="Remove Criteria"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HEADER CARD / CONTROL BAR FOR SUBMISSIONS */}
      {(!isAdminOrHR || activeAdminTab === 'submissions') && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={22} style={{ color: 'hsl(var(--primary))' }} />
                Faculty Performance Indicator (FPI) Appraisal Forms
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {isAdminOrHR || isDeptAdmin 
                  ? 'View, verify, evaluate scores, and process approvals for annual FPI performance appraisal forms submitted by faculty members.'
                  : 'Submit and view your annual Faculty Performance Indicator (FPI) appraisal forms matching the official FPI.docx format.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {isAdminOrHR && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <select
                    className="form-control"
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 12px', minWidth: '180px' }}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d, i) => (
                      <option key={i} value={d.name}>{d.name} ({d.acronym})</option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '8px 12px', minWidth: '150px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="HOD Approved">HOD Approved</option>
                    <option value="Final Approved">Final Approved</option>
                  </select>
                </div>
              )}

              <ReportButtons
                pageTitle="Faculty Appraisals"
                departmentName={auth.role === 'admin' ? selectedDeptFilter : (auth.department || auth.dept || '')}
                headers={['Staff ID', 'Faculty Name', 'Designation', 'Department', 'Academic Year', 'Self Score', 'HOD Evaluated Score', 'Status']}
                rows={filteredAppraisals.map(a => [
                  a.staff_id,
                  a.staff_name || 'N/A',
                  a.Designation || 'N/A',
                  a.Department || 'N/A',
                  a.academic_year || 'N/A',
                  a.self_appraisal_score || 'N/A',
                  a.hod_total_score ? `${a.hod_total_score} / 200` : 'Pending Review',
                  a.status || 'Submitted'
                ])}
                auth={auth}
              />

              {!isAdminOrHR && (() => {
                const myAppraisal = appraisals.find(a => a.staff_id === auth.staffId) || lastSubmittedAppraisal;
                return (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {myAppraisal && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleOpenViewModal(myAppraisal)}
                        style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={16} /> View Filled Appraisal Form (FPI.docx)
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (showAddForm) {
                          setShowAddForm(false);
                          setEditingAppraisalId(null);
                        } else if (myAppraisal) {
                          handleStartEdit(myAppraisal);
                        } else {
                          setShowAddForm(true);
                        }
                      }}
                      style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {showAddForm ? <X size={16} /> : myAppraisal ? <Edit size={16} /> : <Plus size={16} />}
                      {showAddForm ? 'Close Form' : myAppraisal ? 'Edit FPI Form' : 'Fill FPI Form'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* FACULTY INTERACTIVE FPI FORM ENTRY CONTAINER (WHEN showAddForm IS TRUE) */}
      {!isAdminOrHR && showAddForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '28px', background: '#ffffff', borderRadius: '12px', border: '2px solid hsl(var(--primary))', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={24} style={{ color: 'hsl(var(--primary))' }} />
                Annual Faculty Performance Indicator (FPI) Form
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Complete the manual entry tables and review automated metrics matching FPI.docx guidelines.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handlePreviewCurrentForm}
                className="btn btn-secondary"
                style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Eye size={16} /> View Full FPI Form (Preview)
              </button>

              <button
                type="button"
                onClick={() => { setShowAddForm(false); setEditingAppraisalId(null); }}
                className="btn btn-secondary"
                style={{ fontWeight: 700, fontSize: '0.85rem' }}
              >
                Close Form
              </button>
            </div>
          </div>

          {/* GENERAL INFORMATION SECTION (AUTO-MAPPED FROM PORTAL MATCHING FPI.DOCX) */}
          <GeneralInfoTable data={generalInfo} />

          {/* General Information Header Grid */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Academic Year *</label>
              <select className="form-control" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required>
                {getAcademicYearOptions().map((yr, idx) => (
                  <option key={idx} value={typeof yr === 'object' ? yr.value : yr}>
                    {typeof yr === 'object' ? yr.label : yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Computed Self Appraisal Score</label>
              <input type="text" className="form-control" value={selfAppraisalScore || `${fpiSummary.total_fpi_score} / ${totalMax}`} readOnly style={{ fontWeight: 800, color: 'hsl(var(--primary))', background: '#ffffff' }} />
            </div>
          </div>

          {/* LIVE SECTION-WISE & CATEGORY-WISE TOTALS OVERVIEW CARD */}
          <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #0284c7', marginBottom: '24px' }}>
            <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0369a1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Section-Wise Live Appraisal Score Summary & Breakdown
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>PART A (Teaching Process)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{manualScores.partA} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>/ {partAMax} Pts</span></div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>PART B (Prof. Dev)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{manualScores.partB} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>/ {partBMax} Pts</span></div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>PART C (Research & Dev)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{manualScores.partC} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>/ {partCMax} Pts</span></div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>PART D (Inst. Contribution)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{manualScores.partD} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>/ {partDMax} Pts</span></div>
              </div>
              <div style={{ background: '#0284c7', color: '#ffffff', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>TOTAL SELF SCORE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{manualScores.grandTotal} <span style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 600 }}>/ {totalMax} Pts</span></div>
              </div>
            </div>
          </div>

          {/* PART A: TEACHING LEARNING PROCESS (MANUAL ENTRY TABLES) */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>PART A: Teaching Learning Process (Max Score: {partAMax})</span>
              <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                Part A Section Total: {manualScores.partA} / {partAMax} Pts
              </span>
            </h4>

            {/* A1: ICT Tools */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a1. Innovative Teaching Methods & ICT Tools Integrated in Course Delivery (Max: 10 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a1} / 10 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA1Rows, { class_name: '', course: '', ict_tool: '', score: '2' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class & Year</th>
                      <th>Course Title / Code</th>
                      <th>Innovative ICT Tool / Methodology Used</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a1Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="e.g. III Year IT-A" value={r.class_name} onChange={(e) => updateRow(setA1Rows, i, 'class_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="e.g. 20IT101 Data Structures" value={r.course} onChange={(e) => updateRow(setA1Rows, i, 'course', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="e.g. Kahoot, Virtual Labs, Google Classroom" value={r.ict_tool} onChange={(e) => updateRow(setA1Rows, i, 'ict_tool', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="2 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="Automatically calculated: 2 marks per ICT tool" /></td>
                        <td><button type="button" onClick={() => removeRow(setA1Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a1 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a1} / 10 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A2: E-Content Development */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a2. Development of SWAYAM MOOCs & Other E-Content (YouTube / LMS) (Max: 10 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a2} / 10 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA2Rows, { class_name: '', course: '', title: '', platform: '', launch_date: '', link: '', score: '5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class & Year</th>
                      <th>Course Code & Title</th>
                      <th>Title of E-Content / Video Module</th>
                      <th>Platform (YouTube / Slideshare / LMS)</th>
                      <th>Link to E-Content</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a2Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Class" value={r.class_name} onChange={(e) => updateRow(setA2Rows, i, 'class_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Course" value={r.course} onChange={(e) => updateRow(setA2Rows, i, 'course', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Module Title" value={r.title} onChange={(e) => updateRow(setA2Rows, i, 'title', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Platform" value={r.platform} onChange={(e) => updateRow(setA2Rows, i, 'platform', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="URL Link" value={r.link} onChange={(e) => updateRow(setA2Rows, i, 'link', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="Automatically calculated: 5 marks per e-content module" /></td>
                        <td><button type="button" onClick={() => removeRow(setA2Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={5} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a2 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a2} / 10 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A3: New Laboratory Experiments */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a3. New Laboratory Experiments Developed (Max: 10 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a3} / 10 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA3Rows, { class_name: '', course: '', experiment: '', score: '2.5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class & Year</th>
                      <th>Course Code & Title</th>
                      <th>Name of Experiment / Virtual Lab Manual Developed</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a3Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Class" value={r.class_name} onChange={(e) => updateRow(setA3Rows, i, 'class_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Course" value={r.course} onChange={(e) => updateRow(setA3Rows, i, 'course', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Experiment Name" value={r.experiment} onChange={(e) => updateRow(setA3Rows, i, 'experiment', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="2.5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="Automatically calculated: 2.5 marks per experiment" /></td>
                        <td><button type="button" onClick={() => removeRow(setA3Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a3 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a3} / 10 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A4: Student Feedback Rating */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a4. Student Mid Sem & End Sem Feedback Rating (Max: 5 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a4} / 5 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA4Rows, { class_name: '', course: '', mid_score: '', end_score: '', avg_score: '' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class & Year</th>
                      <th>Course Title / Code</th>
                      <th style={{ width: '120px' }}>Mid-Sem Score (/5)</th>
                      <th style={{ width: '120px' }}>End-Sem Score (/5)</th>
                      <th style={{ width: '120px' }}>Average Rating</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a4Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Class" value={r.class_name} onChange={(e) => updateRow(setA4Rows, i, 'class_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Course" value={r.course} onChange={(e) => updateRow(setA4Rows, i, 'course', e.target.value)} /></td>
                        <td><input type="number" step="0.1" className="form-control" placeholder="4.5" value={r.mid_score} onChange={(e) => handleA4Change(i, 'mid_score', e.target.value)} /></td>
                        <td><input type="number" step="0.1" className="form-control" placeholder="4.8" value={r.end_score} onChange={(e) => handleA4Change(i, 'end_score', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Auto Calc" value={r.avg_score ? `${r.avg_score} (Auto)` : ''} readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0369a1' }} title="Automatically calculated average rating" /></td>
                        <td><button type="button" onClick={() => removeRow(setA4Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a4 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a4} / 5 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A5: Course Pass Percentage */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a5. Success Rate in Theory Courses (End Semester Pass %) (Max: 10 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a5} / 10 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA5Rows, { class_name: '', course: '', odd_pass: '', even_pass: '', avg_pass: '' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Class & Semester</th>
                      <th>Course Title / Code</th>
                      <th style={{ width: '130px' }}>Odd Sem Pass %</th>
                      <th style={{ width: '130px' }}>Even Sem Pass %</th>
                      <th style={{ width: '130px' }}>Avg Pass %</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a5Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Class" value={r.class_name} onChange={(e) => updateRow(setA5Rows, i, 'class_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Course" value={r.course} onChange={(e) => updateRow(setA5Rows, i, 'course', e.target.value)} /></td>
                        <td><input type="number" step="0.1" className="form-control" placeholder="85.5%" value={r.odd_pass} onChange={(e) => handleA5Change(i, 'odd_pass', e.target.value)} /></td>
                        <td><input type="number" step="0.1" className="form-control" placeholder="92.0%" value={r.even_pass} onChange={(e) => handleA5Change(i, 'even_pass', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Auto Calc" value={r.avg_pass ? `${r.avg_pass}% (Auto)` : ''} readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0369a1' }} title="Automatically calculated average pass percentage" /></td>
                        <td><button type="button" onClick={() => removeRow(setA5Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a5 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a5} / 10 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A6: Industry Institute Partnerships */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a6. Steps Taken for Enhancing Industry Institute Partnerships (Max: 5 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a6} / 5 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA6Rows, { name: '', industry: '', duration: '', score: '5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Course / Training / Program</th>
                      <th>Industry / Partner Company</th>
                      <th>Duration / Dates</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a6Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Program Name" value={r.name || r.course_name} onChange={(e) => updateRow(setA6Rows, i, 'name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Industry Name" value={r.industry} onChange={(e) => updateRow(setA6Rows, i, 'industry', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="e.g. 2 Weeks / July 2025" value={r.duration} onChange={(e) => updateRow(setA6Rows, i, 'duration', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="5 marks per industry partnership item" /></td>
                        <td><button type="button" onClick={() => removeRow(setA6Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a6 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a6} / 5 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A7: Hackathons Guidance */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>a7. Support & Guidance for Student Hackathons / Codethons / Contests (Max: 10 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.a7} / 10 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setA7Rows, { competition: '', team_members: '', project_title: '', position: 'Prize Won', score: '10' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Competition / Contest</th>
                      <th>Team Members</th>
                      <th>Title of Project</th>
                      <th style={{ width: '170px' }}>Position Held / Result</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {a7Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Competition Name" value={r.competition} onChange={(e) => updateRow(setA7Rows, i, 'competition', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Student Team" value={r.team_members} onChange={(e) => updateRow(setA7Rows, i, 'team_members', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Project Title" value={r.project_title} onChange={(e) => updateRow(setA7Rows, i, 'project_title', e.target.value)} /></td>
                        <td>
                          <select className="form-control" value={r.position || 'Prize Won'} onChange={(e) => updateRow(setA7Rows, i, 'position', e.target.value)} style={{ fontSize: '0.82rem', padding: '4px 8px' }}>
                            <option value="Prize Won">Prize Won (10 pts)</option>
                            <option value="Participation">Participation (5 pts)</option>
                          </select>
                        </td>
                        <td><input type="text" className="form-control" value={r.position === 'Participation' ? '5 pts (Auto)' : '10 pts (Auto)'} readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="10 marks for Prize Won, 5 marks for Participation" /></td>
                        <td><button type="button" onClick={() => removeRow(setA7Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>a7 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.a7} / 10 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PART B: PROFESSIONAL DEVELOPMENT ACTIVITIES (MANUAL ENTRY TABLES) */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>PART B: Professional Development Activities (Manual Entry Tables)</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '14px', fontWeight: 700 }}>
                  Manual Subtotal: {(manualScores.b4 + manualScores.b7)} / 10 Pts
                </span>
                <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                  Part B Section Total: {manualScores.partB} / {partBMax} Pts
                </span>
              </div>
            </h4>

            {/* B4: Contribution to Curriculum Development */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>b4. Contribution to Curriculum Development & Board of Studies (BoS) (Max: 5 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.b4} / 5 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setB4Rows, { course_name: '', academic_year: academicYear, details: '', score: '5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Course / Syllabus Revised</th>
                      <th>Academic Year</th>
                      <th>Details of Contribution / BoS Role</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {b4Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Course Name" value={r.course_name || r.title || ''} onChange={(e) => updateRow(setB4Rows, i, 'course_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value={academicYear} readOnly style={{ background: '#f1f5f9', color: '#334155', fontWeight: 700, cursor: 'not-allowed' }} title="Fetched from Academic Year selected at top of FPI form (Non-Editable)" /></td>
                        <td><input type="text" className="form-control" placeholder="Details / BoS Role" value={r.details || r.activity || ''} onChange={(e) => updateRow(setB4Rows, i, 'details', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="5 marks per curriculum contribution" /></td>
                        <td><button type="button" onClick={() => removeRow(setB4Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>b4 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.b4} / 5 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* B7: Faculty Internship / Training / Industry Collaboration */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>b7. Faculty Internship / Training / Collaboration with Industry / MoUs (Max: 5 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.b7} / 5 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setB7Rows, { name: '', company: '', duration: '', score: '5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Internship / Training / Collaboration</th>
                      <th>Name of Company & Place</th>
                      <th>Duration / Dates</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {b7Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Internship / Training Name" value={r.name || r.title || ''} onChange={(e) => updateRow(setB7Rows, i, 'name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Company Name & Place" value={r.company} onChange={(e) => updateRow(setB7Rows, i, 'company', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="e.g. 2 Weeks / July 2025" value={r.duration} onChange={(e) => updateRow(setB7Rows, i, 'duration', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="5 marks per internship/training" /></td>
                        <td><button type="button" onClick={() => removeRow(setB7Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={3} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>b7 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.b7} / 5 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PART C: RESEARCH & DEVELOPMENT ACTIVITIES (MANUAL ENTRY TABLES) */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span>PART C: Research & Development Activities (Manual Entry Tables)</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', background: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '14px', fontWeight: 700 }}>
                  Manual Subtotal: {manualScores.c3} / 5 Pts
                </span>
                <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                  Part C Section Total: {manualScores.partC} / {partCMax} Pts
                </span>
              </div>
            </h4>

            {/* C3: Community Service & Outreach Activities */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>c3. Organizing Community Service / Outreach Activities (Yoga / NSS / NCC / Rural Development / Awareness) (Max: 5 Marks)</span>
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>Category Total: {manualScores.c3} / 5 Pts</span>
                </div>
                <button type="button" onClick={() => addRow(setC3Rows, { activity_name: '', event_type: '', location: '', date: '', score: '5' })} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Activity</th>
                      <th>Type of Event (Yoga/NSS/NCC/Outreach)</th>
                      <th>Place / Location</th>
                      <th>Date(s)</th>
                      <th style={{ width: '110px' }}>Score</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {c3Rows.map((r, i) => (
                      <tr key={i}>
                        <td><input type="text" className="form-control" placeholder="Activity Name" value={r.activity_name || r.title || ''} onChange={(e) => updateRow(setC3Rows, i, 'activity_name', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Type of Event" value={r.event_type} onChange={(e) => updateRow(setC3Rows, i, 'event_type', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="Location" value={r.location} onChange={(e) => updateRow(setC3Rows, i, 'location', e.target.value)} /></td>
                        <td><input type="text" className="form-control" placeholder="DD/MM/YYYY" value={r.date} onChange={(e) => updateRow(setC3Rows, i, 'date', e.target.value)} /></td>
                        <td><input type="text" className="form-control" value="5 pts (Auto)" readOnly style={{ fontWeight: 800, textAlign: 'center', background: '#f1f5f9', color: '#0284c7' }} title="5 marks per outreach activity" /></td>
                        <td><button type="button" onClick={() => removeRow(setC3Rows, i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: 'right', color: '#475569', fontSize: '0.82rem' }}>c3 Category Subtotal:</td>
                      <td style={{ textAlign: 'center', color: '#0284c7', fontSize: '0.88rem', fontWeight: 800 }}>{manualScores.c3} / 5 Pts</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PART B, C, D AUTO-MAPPED DETAILED VERIFICATION PANEL */}
          <AutoMappedVerificationPanel details={fpiDetails} breakdown={fpiBreakdown} />

          {/* GOALS NEXT YEAR */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Goals & Commitments for Next Academic Year</label>
            <textarea className="form-control" rows="3" placeholder="Specify targets for publication, consultancy, grants, and teaching innovations..." value={goalsNextYear} onChange={(e) => setGoalsNextYear(e.target.value)} />
          </div>

          {/* SUBMIT & PREVIEW ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={handlePreviewCurrentForm}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={18} /> View Full FPI Form (Preview Before Submit)
            </button>

            <button
              type="button"
              onClick={() => { setShowAddForm(false); setEditingAppraisalId(null); }}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontWeight: 700 }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 26px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}
            >
              <FileCheck size={18} /> {editingAppraisalId ? 'Update & Re-Submit FPI Form' : 'Submit FPI Form'}
            </button>
          </div>
        </form>
      )}

      {/* AUTOMATED FPI SUMMARY CARD FOR FACULTY */}
      {!isAdminOrHR && !showAddForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1.5px solid #0284c7', background: '#f0f9ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#0369a1', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} /> Automated FPI Performance Evaluation Summary
            </h4>
            <span className="badge badge-success">SYSTEM GENERATED (LIVE SYNC)</span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>FPI Evaluation Criteria Category</th>
                  <th style={{ textAlign: 'center' }}>Max Marks</th>
                  <th style={{ textAlign: 'center' }}>Calculated Score (Faculty Self)</th>
                  <th style={{ textAlign: 'center' }}>Evaluated Score (HOD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PART A: Teaching Learning Process</strong> (ICT, E-Content, Labs, Feedback, Pass %, Industry, Hackathons)</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{partAMax}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>{fpiSummary.part_a_score || 0} / {partAMax}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Pending HOD Review</td>
                </tr>
                <tr>
                  <td><strong>PART B: Professional Development Activities</strong> (Memberships, Resource Speaker, FDPs, Certifications)</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{partBMax}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>{fpiSummary.part_b_score || 0} / {partBMax}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Pending HOD Review</td>
                </tr>
                <tr>
                  <td><strong>PART C: Research & Consultancy</strong> (Publications, Books, Grants, Patents, Seed Money)</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{partCMax}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>{fpiSummary.part_c_score || 0} / {partCMax}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Pending HOD Review</td>
                </tr>
                <tr>
                  <td><strong>PART D: Institutional Development & Contribution</strong> (Assigned Responsibilities, Mentoring, Accreditations)</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{partDMax}</td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>{fpiSummary.part_d_score || 0} / {partDMax}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>Pending HOD Review</td>
                </tr>
                <tr style={{ background: '#e0f2fe', fontWeight: 800, fontSize: '1.05rem' }}>
                  <td style={{ color: '#0369a1' }}>TOTAL FPI PERFORMANCE SCORE</td>
                  <td style={{ textAlign: 'center', color: '#0369a1' }}>{totalMax}</td>
                  <td style={{ textAlign: 'center', color: '#15803d', fontSize: '1.15rem' }}>{fpiSummary.total_fpi_score || 0} / {totalMax}</td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED AUTO-MAPPED PORTAL ACTIVITY VERIFICATION CONTAINER */}
      {!isAdminOrHR && !showAddForm && (
        <AutoMappedVerificationPanel details={fpiDetails} breakdown={fpiBreakdown} />
      )}

      {/* SUBMITTED APPRAISALS LIST VIEW */}
      {(!isAdminOrHR || activeAdminTab === 'submissions') && (
        <div>
          {/* HOD PENDING REVIEW NOTIFICATION BANNER */}
          {(auth.role === 'dept_admin' || auth.isHod) && appraisals.filter(a => a.status === 'Submitted').length > 0 && (
            <div style={{ background: '#fffbe6', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #ffe58f', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={24} style={{ color: '#d48806' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#873800' }}>
                    Attention HOD: Department Appraisal Forms Pending Review
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#d48806' }}>
                    You have <strong>{appraisals.filter(a => a.status === 'Submitted').length}</strong> faculty performance appraisal form(s) submitted by your department awaiting your evaluation & score verification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('Submitted')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 16px', background: '#d48806', borderColor: '#d48806', fontWeight: 800 }}
              >
                Review Pending Forms Now
              </button>
            </div>
          )}

          {/* PRINCIPAL & HR PENDING EXECUTIVE REVIEW NOTIFICATION BANNER */}
          {isAdminOrHR && appraisals.filter(a => a.status === 'HOD Approved').length > 0 && (
            <div style={{ background: '#e0f2fe', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #7dd3fc', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} style={{ color: '#0284c7' }} />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0369a1' }}>
                    Executive Notification: Appraisal Forms Forwarded by HODs Pending Final Evaluation
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#0284c7' }}>
                    There are <strong>{appraisals.filter(a => a.status === 'HOD Approved').length}</strong> performance appraisal form(s) approved and forwarded by HODs awaiting final evaluation by Principal / HR.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusFilter('HOD Approved')}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 16px', background: '#0284c7', borderColor: '#0284c7', fontWeight: 800 }}
              >
                Evaluate Pending Forms Now
              </button>
            </div>
          )}

          {isAdminOrHR && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Executive Status Quick Filter Bar for Principal & HR */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('')}
                  className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px' }}
                >
                  All Submissions ({appraisals.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('HOD Approved')}
                  style={{
                    fontSize: '0.85rem', fontWeight: 800, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: statusFilter === 'HOD Approved' ? '#0284c7' : '#e0f2fe',
                    color: statusFilter === 'HOD Approved' ? '#ffffff' : '#0369a1',
                    border: `1.5px solid ${statusFilter === 'HOD Approved' ? '#0284c7' : '#7dd3fc'}`,
                    boxShadow: statusFilter === 'HOD Approved' ? '0 2px 4px rgba(2,132,199,0.3)' : 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <ShieldCheck size={16} /> Pending Principal/HR Evaluation ({appraisals.filter(a => a.status === 'HOD Approved').length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Final Approved')}
                  style={{
                    fontSize: '0.85rem', fontWeight: 800, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: statusFilter === 'Final Approved' ? '#15803d' : '#dcfce7',
                    color: statusFilter === 'Final Approved' ? '#ffffff' : '#166534',
                    border: `1.5px solid ${statusFilter === 'Final Approved' ? '#15803d' : '#86efac'}`,
                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <CheckCircle size={16} /> Final Approved ({appraisals.filter(a => a.status === 'Final Approved').length})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('Submitted')}
                  style={{
                    fontSize: '0.85rem', fontWeight: 700, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                    background: statusFilter === 'Submitted' ? '#d97706' : '#fef3c7',
                    color: statusFilter === 'Submitted' ? '#ffffff' : '#92400e',
                    border: `1.5px solid ${statusFilter === 'Submitted' ? '#d97706' : '#fde68a'}`
                  }}
                >
                  ⏳ Pending HOD Review ({appraisals.filter(a => a.status === 'Submitted').length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="card" style={{ padding: '14px 20px', marginBottom: 0 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search submitted appraisals by faculty name, staff ID, designation, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a', fontWeight: 800 }}>
            Submitted Performance Appraisals ({filteredAppraisals.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading appraisal records...</div>
          ) : filteredAppraisals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
              No performance appraisal forms match the selected status or department filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredAppraisals.map((app) => (
                <div key={app.id} className="card" style={{ borderLeft: `5px solid ${app.status === 'Final Approved' ? '#15803d' : app.status === 'HOD Approved' ? '#0284c7' : 'hsl(var(--primary))'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '6px 12px', marginBottom: '8px', display: 'inline-block' }}>
                        Academic Year: {app.academic_year}
                      </span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        Annual FPI Form - {app.staff_name || auth.name} ({app.staff_id})
                      </h4>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>
                        {app.Designation || 'Faculty'} - {app.Department || 'N/A'} | Submitted on: {new Date(app.submitted_at || Date.now()).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        background: app.status === 'Final Approved' ? '#dcfce7' : app.status === 'HOD Approved' ? '#e0f2fe' : 'hsla(var(--primary), 0.1)',
                        color: app.status === 'Final Approved' ? '#15803d' : app.status === 'HOD Approved' ? '#0369a1' : 'hsl(var(--primary))',
                        border: `1px solid ${app.status === 'Final Approved' ? '#86efac' : app.status === 'HOD Approved' ? '#7dd3fc' : 'transparent'}`
                      }}>
                        Status: {app.status === 'HOD Approved' ? 'HOD Approved (Pending Principal/HR)' : (app.status || 'Submitted')}
                      </span>

                      <button
                        onClick={() => handleOpenViewModal(app)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                      >
                        <Eye size={15} /> View Full FPI Form
                      </button>

                      <button 
                        onClick={() => window.print()}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                      >
                        <Printer size={14} /> Print FPI Form
                      </button>

                      {auth.role !== 'dept_admin' && (
                        <button 
                          onClick={() => handleDelete(app.id)}
                          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '6px' }}
                          title="Delete Appraisal"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.88rem', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div><strong>Self Appraisal Score:</strong> <span style={{ color: 'hsl(var(--primary))', fontWeight: 800 }}>{app.self_appraisal_score || 'N/A'}</span></div>
                    <div><strong>Publications:</strong> {app.publications_count}</div>
                    <div><strong>Books / Chapters:</strong> {app.books_count}</div>
                    <div><strong>Patents Count:</strong> {app.patents_count}</div>
                    <div><strong>Grants Received:</strong> {app.grants_amount || 'N/A'}</div>
                    <div><strong>HOD Total Score:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{app.hod_total_score ? `${app.hod_total_score} / 200` : 'Pending'}</span></div>
                  </div>

                  {/* HOD Evaluation & Score Breakdown View */}
                  {(app.status === 'HOD Approved' || app.status === 'Final Approved') && (
                    <div style={{ marginTop: '16px', background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={16} /> HOD Verification & Score Evaluation
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.85rem', marginBottom: '8px' }}>
                        <div><strong>Part A Score:</strong> {app.hod_part_a_score || 0} / 60</div>
                        <div><strong>Part B Score:</strong> {app.hod_part_b_score || 0} / 40</div>
                        <div><strong>Part C Score:</strong> {app.hod_part_c_score || 0} / 80</div>
                        <div><strong>Part D Score:</strong> {app.hod_part_d_score || 0} / 20</div>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
                        Total HOD Evaluated Score: {app.hod_total_score || 0} / 200
                      </div>
                      {app.hod_remarks && (
                        <div style={{ fontSize: '0.82rem', color: '#166534', fontStyle: 'italic' }}>
                          <strong>HOD Remarks:</strong> {app.hod_remarks}
                        </div>
                      )}
                    </div>
                  )}

                  {/* HOD Action Card (For HOD & Dept Admins when Status is Submitted) */}
                  {(auth.role === 'dept_admin' || auth.isHod) && app.status === 'Submitted' && (
                    <div style={{ marginTop: '16px', background: '#fffbe6', padding: '16px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#873800', marginBottom: '12px' }}>
                        HOD Verification & Evaluated Score Entry
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>HOD Part A Score (/60)</label>
                          <input type="number" className="form-control" placeholder={app.part_a_score || '0'} value={hodScores.hod_part_a_score} onChange={(e) => setHodScores(prev => ({ ...prev, hod_part_a_score: e.target.value }))} />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>HOD Part B Score (/40)</label>
                          <input type="number" className="form-control" placeholder={app.part_b_score || '0'} value={hodScores.hod_part_b_score} onChange={(e) => setHodScores(prev => ({ ...prev, hod_part_b_score: e.target.value }))} />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>HOD Part C Score (/80)</label>
                          <input type="number" className="form-control" placeholder={app.part_c_score || '0'} value={hodScores.hod_part_c_score} onChange={(e) => setHodScores(prev => ({ ...prev, hod_part_c_score: e.target.value }))} />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem' }}>HOD Part D Score (/20)</label>
                          <input type="number" className="form-control" placeholder={app.part_d_score || '0'} value={hodScores.hod_part_d_score} onChange={(e) => setHodScores(prev => ({ ...prev, hod_part_d_score: e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>HOD Deviation Remarks / Feedback</label>
                        <input type="text" className="form-control" placeholder="Remarks in case of score adjustment..." value={hodScores.hod_remarks} onChange={(e) => setHodScores(prev => ({ ...prev, hod_remarks: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={() => handleHodApproveSubmit(app.id, 'approve')} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                          Approve & Forward to Principal/HR
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleHodApproveSubmit(app.id, 'revision')} style={{ fontSize: '0.85rem', padding: '8px 16px', background: '#fff1f0', color: '#cf1322', borderColor: '#ffa39e' }}>
                          Request Revision
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Principal & HR Final Performance Evaluation Card (When HOD Approved) */}
                  {isAdminOrHR && app.status === 'HOD Approved' && (
                    <div style={{ marginTop: '16px', background: '#f0f9ff', padding: '18px', borderRadius: '10px', border: '1.5px solid #0284c7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={18} /> Principal & HR Final Performance Evaluation
                        </h5>
                        <span className="badge badge-success" style={{ background: '#0284c7', color: '#fff' }}>FORWARDED BY HOD</span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '14px', background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                        <strong>HOD Evaluated Score:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{app.hod_total_score || 0} / 200</span>
                        {app.hod_remarks && <span style={{ marginLeft: '12px', fontStyle: 'italic', color: '#475569' }}>— HOD Remarks: "{app.hod_remarks}"</span>}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Final Part A Score (/60)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={app.hod_part_a_score || app.part_a_score || '0'}
                            value={finalScores[app.id]?.part_a ?? ''}
                            onChange={(e) => setFinalScores(prev => ({
                              ...prev,
                              [app.id]: { ...(prev[app.id] || {}), part_a: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Final Part B Score (/40)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={app.hod_part_b_score || app.part_b_score || '0'}
                            value={finalScores[app.id]?.part_b ?? ''}
                            onChange={(e) => setFinalScores(prev => ({
                              ...prev,
                              [app.id]: { ...(prev[app.id] || {}), part_b: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Final Part C Score (/80)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={app.hod_part_c_score || app.part_c_score || '0'}
                            value={finalScores[app.id]?.part_c ?? ''}
                            onChange={(e) => setFinalScores(prev => ({
                              ...prev,
                              [app.id]: { ...(prev[app.id] || {}), part_c: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Final Part D Score (/20)</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder={app.hod_part_d_score || app.part_d_score || '0'}
                            value={finalScores[app.id]?.part_d ?? ''}
                            onChange={(e) => setFinalScores(prev => ({
                              ...prev,
                              [app.id]: { ...(prev[app.id] || {}), part_d: e.target.value }
                            }))}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Executive Remarks / Recommendations (Principal & HR)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Executive feedback, promotion recommendations, or final approval notes..."
                          value={finalScores[app.id]?.remarks ?? ''}
                          onChange={(e) => setFinalScores(prev => ({
                            ...prev,
                            [app.id]: { ...(prev[app.id] || {}), remarks: e.target.value }
                          }))}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleFinalApproveSubmit(app, 'approve')}
                          style={{ background: '#0284c7', borderColor: '#0284c7', fontSize: '0.88rem', padding: '9px 22px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle size={16} /> Final Approve FPI Form
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleFinalApproveSubmit(app, 'revision')}
                          style={{ fontSize: '0.88rem', padding: '9px 18px', background: '#fff1f0', color: '#cf1322', borderColor: '#ffa39e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <AlertCircle size={16} /> Request Revision
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Principal & HR Final Approval Summary (When Status is Final Approved) */}
                  {app.status === 'Final Approved' && (
                    <div style={{ marginTop: '16px', background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #86efac' }}>
                      <h5 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> Principal & HR Final Executive Approval Confirmed
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <div><strong>Final Total Score:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{app.final_total_score || app.hod_total_score || 'N/A'} / 200</span></div>
                        <div><strong>Approved By:</strong> {app.final_approved_by || 'Principal / HR'}</div>
                        <div><strong>Approved On:</strong> {app.final_approved_at ? new Date(app.final_approved_at).toLocaleDateString('en-GB') : 'Recently'}</div>
                      </div>
                      {(app.final_remarks || app.remarks) && (
                        <div style={{ fontSize: '0.82rem', color: '#166534', fontStyle: 'italic', marginTop: '4px' }}>
                          <strong>Executive Remarks:</strong> {app.final_remarks || app.remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* VIEW FULL FPI FORM MODAL (MATCHING OFFICIAL FPI.DOCX FORMAT & REPORTS HEADER) */}
      {viewingAppraisal && (() => {
        const vA1 = parseRows(viewingAppraisal.a1_ict_tools);
        const vA2 = parseRows(viewingAppraisal.a2_econtent);
        const vA3 = parseRows(viewingAppraisal.a3_lab_experiments);
        const vA4 = parseRows(viewingAppraisal.a4_feedback_scores);
        const vA5 = parseRows(viewingAppraisal.a5_pass_percentage);
        const vA6 = parseRows(viewingAppraisal.a6_industry_partnerships);
        const vA7 = parseRows(viewingAppraisal.a7_hackathons);
        const vB4 = parseRows(viewingAppraisal.b4_curriculum_dev);
        const vB7 = parseRows(viewingAppraisal.b7_industry_training);
        const vC3 = parseRows(viewingAppraisal.c3_community_service);

        const canEdit = !isAdminOrHR || viewingAppraisal.staff_id === auth.staffId;
        const deptAcronym = (viewingAppraisal.Department || auth.department || auth.dept || '').toUpperCase();
        const deptFullNameMap = {
          'AI & DS': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
          'AI&DS': 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
          'CSE': 'COMPUTER SCIENCE AND ENGINEERING',
          'ECE': 'ELECTRONICS AND COMMUNICATION ENGINEERING',
          'EEE': 'ELECTRICAL AND ELECTRONICS ENGINEERING',
          'MECH': 'MECHANICAL ENGINEERING',
          'CIVIL': 'CIVIL ENGINEERING',
          'IT': 'INFORMATION TECHNOLOGY',
          'AERO': 'AERONAUTICAL ENGINEERING',
          'EIE': 'ELECTRONICS AND INSTRUMENTATION ENGINEERING',
          'BME': 'BIOMEDICAL ENGINEERING',
          'MBA': 'MASTER OF BUSINESS ADMINISTRATION',
          'MATHS': 'MATHEMATICS',
          'PHY': 'PHYSICS',
          'CHEM': 'CHEMISTRY',
          'ENG': 'ENGLISH',
          'R & A': 'ROBOTICS AND AUTOMATION ENGINEERING',
          'R&A': 'ROBOTICS AND AUTOMATION ENGINEERING',
          'M.TECH CSE': 'M.TECH COMPUTER SCIENCE AND ENGINEERING',
          'S&H': 'SCIENCE AND HUMANITIES',
          'G.E - S&H': 'SCIENCE AND HUMANITIES',
          'PHY EDU': 'PHYSICAL EDUCATION',
          'ADMIN': 'ADMINISTRATION',
          'PLACEMENT CELL': 'PLACEMENT CELL'
        };
        const deptTitle = deptFullNameMap[deptAcronym] || deptAcronym || 'ACADEMICS';
        const facultyDisplayName = (viewingGeneralInfo && viewingGeneralInfo.facultyName) || viewingAppraisal.staff_name || auth.name || '';
        const hodDisplayName = (viewingGeneralInfo && viewingGeneralInfo.hodName) || (viewingAppraisal.hod_name) || '';
        const principalDisplayName = (viewingGeneralInfo && viewingGeneralInfo.principalName) || '';

        return (
          <div className="fpi-print-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="fpi-print-document" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '1050px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '32px', border: '1.5px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              
              {/* MODAL CONTROL HEADER (HIDDEN IN PRINT) */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', gap: '10px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '5px 12px', marginRight: 'auto' }}>
                  Status: {viewingAppraisal.status || 'Submitted'}
                </span>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(viewingAppraisal)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '7px 16px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit size={16} /> Edit Form
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '7px 16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={16} /> Print FPI Form
                </button>
                <button
                  type="button"
                  onClick={() => setViewingAppraisal(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={26} />
                </button>
              </div>

              {/* OFFICIAL SREC REPORT HEADER BANNER (MATCHING FIS REPORTS HEADER) */}
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
                <img
                  src="/srec-header-banner.png"
                  alt="Sri Ramakrishna Engineering College Header Banner"
                  style={{ maxWidth: '650px', width: '100%', height: 'auto', marginBottom: '12px', display: 'block', margin: '0 auto 12px auto' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DEPARTMENT OF {deptTitle}
                </h2>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', margin: '6px 0 0 0', textTransform: 'uppercase' }}>
                  ANNUAL FACULTY PERFORMANCE INDICATOR (FPI) APPRAISAL FORM
                </h3>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155', display: 'block', marginTop: '4px' }}>
                  ACADEMIC YEAR: {viewingAppraisal.academic_year}
                </span>
              </div>

              {/* DOCUMENT CONTENT BODY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. GENERAL INFORMATION SECTION */}
                <GeneralInfoTable data={viewingGeneralInfo || {
                  departmentName: viewingAppraisal.Department,
                  facultyName: viewingAppraisal.staff_name,
                  designation: viewingAppraisal.Designation,
                  qualification: 'Auto-mapped',
                  doj: 'N/A',
                  promotionDetails: 'N/A',
                  prevExp: 'N/A',
                  srecExp: 'N/A',
                  totalTeachingExp: 'N/A',
                  industryExp: 'N/A',
                  phdStatus: 'N/A'
                }} />

                {/* 2. PART A: TEACHING LEARNING PROCESS */}
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      PART A: Teaching Learning Process (Max Score: 60 Marks)
                    </h4>
                    <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                      Part A Score: {viewingAppraisal.part_a_score || 0} / 60 Pts
                    </span>
                  </div>

                  {/* a1 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a1. Innovative Teaching Methods & ICT Tools Integrated in Course Delivery</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Title / Code</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Innovative ICT Tool / Methodology Used</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA1.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No ICT tools logged</td></tr>
                        ) : vA1.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.ict_tool || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a2 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a2. Development of SWAYAM MOOCs & Other E-Content (YouTube / LMS)</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Module Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Platform</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Link</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA2.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No e-content logged</td></tr>
                        ) : vA2.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.platform || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.link ? <a href={r.link} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>View Link</a> : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a3 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a3. New Laboratory Experiments Developed</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Experiment / Virtual Lab Manual</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA3.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No lab experiments logged</td></tr>
                        ) : vA3.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.experiment || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2.5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a4 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a4. Student Mid Sem & End Sem Feedback Rating</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Mid-Sem (/5)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>End-Sem (/5)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Average Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA4.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No feedback ratings logged</td></tr>
                        ) : vA4.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.mid_score || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.end_score || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>{r.avg_score || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a5 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a5. Success Rate in Theory Courses (End Semester Pass %)</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Semester</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Odd Sem %</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Even Sem %</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Avg Pass %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA5.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No pass percentage logged</td></tr>
                        ) : vA5.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.odd_pass ? `${r.odd_pass}%` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.even_pass ? `${r.even_pass}%` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>{r.avg_pass ? `${r.avg_pass}%` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a6 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a6. Steps Taken for Enhancing Industry Institute Partnerships</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Program Name</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Partner Industry</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Dates</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA6.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No industry partnerships logged</td></tr>
                        ) : vA6.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.name || r.course_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.industry || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.duration || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* a7 Table */}
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>a7. Support & Guidance for Student Hackathons / Codethons / Contests</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Competition Name</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Student Team</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Project Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Result / Position</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA7.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No hackathon guidance logged</td></tr>
                        ) : vA7.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.competition || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.team_members || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.project_title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.position || 'Prize Won'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{r.position === 'Participation' ? '5 Pts' : '10 Pts'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. PART B: PROFESSIONAL DEVELOPMENT ACTIVITIES */}
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      PART B: Professional Development Activities (Max Score: 40 Marks)
                    </h4>
                    <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                      Part B Score: {viewingAppraisal.part_b_score || 0} / 40 Pts
                    </span>
                  </div>

                  {/* b4 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>b4. Contribution to Curriculum Development & Board of Studies (BoS)</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Name / Syllabus Revised</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Academic Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Details of Contribution / BoS Role</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vB4.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No curriculum contributions logged</td></tr>
                        ) : vB4.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course_name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.academic_year || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.details || r.activity || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* b7 Table */}
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>b7. Faculty Internship / Training / Industry Collaboration / MoUs</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Internship / Training Name</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Company Name & Place</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Dates</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vB7.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No faculty internships logged</td></tr>
                        ) : vB7.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.company || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.duration || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. PART C: RESEARCH & DEVELOPMENT ACTIVITIES */}
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      PART C: Research & Development Activities (Max Score: 80 Marks)
                    </h4>
                    <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                      Part C Score: {viewingAppraisal.part_c_score || 0} / 80 Pts
                    </span>
                  </div>

                  {/* c3 Table */}
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>c3. Community Service & Outreach Activities (Yoga / NSS / NCC / Rural Dev)</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Activity Name</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Type of Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Location</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vC3.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No outreach activities logged</td></tr>
                        ) : vC3.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.activity_name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.event_type || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.location || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.date || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. AUTO-MAPPED PORTAL ACTIVITIES VERIFICATION PANEL */}
                <AutoMappedVerificationPanel details={fpiDetails} breakdown={fpiBreakdown} />

                {/* 6. GOALS NEXT YEAR */}
                {viewingAppraisal.goals_next_year && (
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Goals & Commitments for Next Academic Year</h4>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, whiteSpace: 'pre-wrap' }}>{viewingAppraisal.goals_next_year}</p>
                  </div>
                )}

                {/* 7. COMPREHENSIVE FPI SCORE EVALUATION & SUMMARY TABLE */}
                <div style={{ border: '1.5px solid #0284c7', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
                  <div style={{ background: '#0284c7', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '1.05rem' }}>
                    FPI APPRAISAL PERFORMANCE EVALUATION SUMMARY (TOTAL SCORE: 200 MARKS)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#f0f9ff', color: '#0369a1', borderBottom: '1.5px solid #bae6fd' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left' }}>Evaluation Criteria Section</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', width: '110px' }}>Max Marks</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', width: '130px' }}>Faculty Self Score</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', width: '140px' }}>HOD Score</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', width: '140px' }}>Final Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>PART A: Teaching Learning Process</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>60</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{viewingAppraisal.part_a_score || 0}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.hod_part_a_score ?? '-'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.final_part_a_score ?? '-'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>PART B: Professional Development Activities</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>40</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{viewingAppraisal.part_b_score || 0}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.hod_part_b_score ?? '-'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.final_part_b_score ?? '-'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>PART C: Research & Development Activities</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>80</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{viewingAppraisal.part_c_score || 0}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.hod_part_c_score ?? '-'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.final_part_c_score ?? '-'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>PART D: Institutional Development & Contribution</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>20</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{viewingAppraisal.part_d_score || 0}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.hod_part_d_score ?? '-'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>{viewingAppraisal.final_part_d_score ?? '-'}</td>
                      </tr>
                      <tr style={{ background: '#e0f2fe', fontWeight: 800, fontSize: '1rem' }}>
                        <td style={{ padding: '12px 14px', color: '#0369a1' }}>GRAND TOTAL APPRAISAL SCORE</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0369a1' }}>200</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#15803d', fontSize: '1.1rem' }}>{viewingAppraisal.self_appraisal_score || viewingAppraisal.total_fpi_score || 0}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#15803d', fontSize: '1.1rem' }}>{viewingAppraisal.hod_total_score ? `${viewingAppraisal.hod_total_score}` : '-'}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#15803d', fontSize: '1.1rem' }}>{viewingAppraisal.final_total_score ? `${viewingAppraisal.final_total_score}` : '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OFFICIAL SIGNATURE BLOCK FOR FPI.DOCX PRINTING */}
              {(() => {
                const fSigned = viewingAppraisal.faculty_signed_at;
                const hSigned = viewingAppraisal.hod_signed_at;
                const pSigned = viewingAppraisal.principal_signed_at;
                const isFaculty = auth.staffId === viewingAppraisal.staff_id;
                const isHodOrAdmin = isAdminOrHR || auth.role === 'hod';
                const isPrincipal = auth.role === 'principal' || auth.designation?.toLowerCase().includes('principal');
                const fmtDate = (iso) => {
                  if (!iso) return '';
                  try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
                };

                const SigBlock = ({ label, name, signedAt, signedName, canSign, onSign }) => (
                  <div style={{ textAlign: 'center', width: '30%' }}>
                    <div style={{ height: signedAt ? '0' : '45px' }}></div>
                    {signedAt ? (
                      <div style={{ background: '#f0fdf4', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '10px 8px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.82rem' }}>
                          <span style={{ fontSize: '1rem' }}>✓</span> Digitally Signed
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>{signedName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{fmtDate(signedAt)}</div>
                      </div>
                    ) : (
                      canSign ? (
                        <button
                          className="no-print"
                          onClick={() => onSign()}
                          style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 16px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', marginBottom: '6px', display: 'block', width: '100%' }}
                        >
                          ✍ Click to Sign
                        </button>
                      ) : (
                        <div style={{ height: '36px' }}></div>
                      )
                    )}
                    <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '6px', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                      {name}
                    </div>
                  </div>
                );

                return (
                  <div className="signature-block" style={{ marginTop: '48px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px' }}>
                    <SigBlock
                      label="Signature of Faculty Member"
                      name={facultyDisplayName}
                      signedAt={fSigned}
                      signedName={viewingAppraisal.faculty_signed_name}
                      canSign={isFaculty}
                      onSign={() => viewingAppraisal.isDraft ? handleSaveAndSign() : handleSign(viewingAppraisal.id, 'faculty')}
                    />
                    <SigBlock
                      label="Signature of Head of Department"
                      name={hodDisplayName}
                      signedAt={hSigned}
                      signedName={viewingAppraisal.hod_signed_name}
                      canSign={isHodOrAdmin}
                      onSign={() => handleSign(viewingAppraisal.id, 'hod')}
                    />
                    <SigBlock
                      label="Signature of Principal"
                      name={principalDisplayName || 'Principal'}
                      signedAt={pSigned}
                      signedName={viewingAppraisal.principal_signed_name}
                      canSign={isPrincipal || (isAdminOrHR && auth.role === 'admin')}
                      onSign={() => handleSign(viewingAppraisal.id, 'principal')}
                    />
                  </div>
                );
              })()}

              {/* MODAL ACTION FOOTER */}
              <div className="no-print" style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                {viewingAppraisal.isDraft ? (
                  <>
                    <button
                      onClick={() => setViewingAppraisal(null)}
                      className="btn btn-secondary"
                      style={{ padding: '9px 20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Edit size={16} /> Continue Editing Form
                    </button>
                    <button
                      onClick={(e) => {
                        setViewingAppraisal(null);
                        handleSubmit(e);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '9px 22px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      <FileCheck size={16} /> Submit FPI Form Now
                    </button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <button
                        onClick={() => handleStartEdit(viewingAppraisal)}
                        className="btn btn-primary"
                        style={{ padding: '9px 20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={16} /> Edit Appraisal Form
                      </button>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="btn btn-secondary"
                      style={{ padding: '9px 20px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={16} /> Print FPI Form
                    </button>
                  </>
                )}
                <button
                  onClick={() => setViewingAppraisal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '9px 20px', fontWeight: 700 }}
                >
                  Close FPI View
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
