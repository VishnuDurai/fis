import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FileCheck, Plus, Trash2, Printer, BookOpen, Award, Layers, ShieldCheck, Edit, Save, Search, Eye, CheckCircle, RefreshCw, X, Check, AlertCircle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { getCurrentAcademicYear, getAppraisalAcademicYear, getAcademicYearOptions } from '../utils/academicYear.js';

export default function Appraisal({ auth }) {
  const location = useLocation();
  const isAdminOrHR = auth?.role === 'admin' || auth?.role === 'principal' || auth?.role === 'hr' || auth?.isInstitutionalAdmin || auth?.isInst;
  const isDeptAdmin = auth?.role === 'dept_admin' || auth?.isHod === true || auth?.isHod === 'true' || (auth?.designation || '').toLowerCase().includes('hod') || (auth?.designation || '').toLowerCase().includes('head');

  // Navigation Tab State for Admin/HR/Principal vs HOD
  const [activeAdminTab, setActiveAdminTab] = useState('submissions'); // 'submissions' or 'configurator'
  const [hodTab, setHodTab] = useState('submissions'); // 'submissions' or 'my_appraisal'

  // Submission State
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingAppraisal, setViewingAppraisal] = useState(null);
  const [viewingGeneralInfo, setViewingGeneralInfo] = useState(null);

  // Search & Filter State for Submissions
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    const tabParam = params.get('tab');

    if (statusParam) {
      if (statusParam.toLowerCase() === 'pending') {
        setStatusFilter(isAdminOrHR ? 'HOD Approved' : 'Submitted');
      } else {
        setStatusFilter(statusParam);
      }
    }
    if (tabParam === 'submissions' || statusParam) {
      setActiveAdminTab('submissions');
      setHodTab('submissions');
    }
  }, [location.search, isAdminOrHR]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);

  // Dynamic Template State & Rule Config Modal
  const [templateItems, setTemplateItems] = useState([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [ruleModalItem, setRuleModalItem] = useState(null);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Designation Filter State in Form Builder
  const [selectedDesignationFilter, setSelectedDesignationFilter] = useState('ALL');

  const handleCopyDefaultTemplateForDesignation = (targetDesig) => {
    if (!targetDesig || targetDesig === 'ALL') return;
    const defaultAllItems = templateItems.filter(i => (!i.target_designation || i.target_designation === 'ALL'));
    if (defaultAllItems.length === 0) {
      alert('No default criteria available to clone.');
      return;
    }
    const copiedItems = defaultAllItems.map(item => ({
      ...item,
      id: undefined,
      target_designation: targetDesig
    }));
    setTemplateItems(prev => [...prev, ...copiedItems]);
  };

  // Custom PART / Section State in Form Builder
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartForm, setNewPartForm] = useState({
    section_code: 'PART_E',
    section_title: 'PART E: Innovation, Startups & Entrepreneurship (Max Score: 20 Marks)',
    criteria_code: 'E1',
    criteria_title: 'Incubation & Startup Mentoring',
    rubric_description: '5 marks per startup mentored or incubated.',
    fixed_mark_per_record: 5,
    max_marks: 10
  });

  // Dynamic Section Extraction across template items
  const distinctSections = useMemo(() => {
    const defaultSections = ['PART_A', 'PART_B', 'PART_C', 'PART_D'];
    const codesInItems = Array.from(new Set((templateItems || []).map(i => i.section_code || 'PART_A')));
    const result = [...defaultSections];
    codesInItems.forEach(c => {
      if (c && !result.includes(c)) {
        result.push(c);
      }
    });
    return result;
  }, [templateItems]);

  const getSectionTitle = (sectionCode) => {
    const itemWithTitle = (templateItems || []).find(i => i.section_code === sectionCode && i.section_title);
    if (itemWithTitle?.section_title) {
      return itemWithTitle.section_title;
    }
    const defaultTitleMap = {
      'PART_A': 'PART A: Teaching Learning Process (Default Max: 60)',
      'PART_B': 'PART B: Professional Development Activities (Default Max: 40)',
      'PART_C': 'PART C: Research & Consultancy (Default Max: 80)',
      'PART_D': 'PART D: Institutional Development & Contribution (Default Max: 20)'
    };
    return defaultTitleMap[sectionCode] || `${sectionCode.replace('_', ' ')}: Custom Evaluation Part`;
  };

  const handleCreateNewPart = (e) => {
    e.preventDefault();
    if (!newPartForm.section_code || !newPartForm.section_title || !newPartForm.criteria_code) {
      alert('Please fill in Part Code, Part Title, and initial Criteria Code.');
      return;
    }
    const formattedCode = newPartForm.section_code.toUpperCase().trim().replace(/\s+/g, '_');
    setTemplateItems(prev => [
      ...prev,
      {
        section_code: formattedCode,
        section_title: newPartForm.section_title.trim(),
        criteria_code: newPartForm.criteria_code.toUpperCase().trim(),
        criteria_title: newPartForm.criteria_title.trim() || 'New Evaluation Criteria',
        rubric_description: newPartForm.rubric_description.trim() || 'Enter evaluation rubrics and scoring guidelines...',
        mapping_type: 'manual',
        fixed_mark_per_record: parseFloat(newPartForm.fixed_mark_per_record) || 5,
        max_marks: parseFloat(newPartForm.max_marks) || 10,
        calculation_rule: 'fixed_per_record',
        bracket_config: null,
        display_order: prev.length + 1
      }
    ]);
    setShowAddPartModal(false);
  };

  const handleRemoveSection = (code) => {
    if (window.confirm(`Are you sure you want to remove ${code} and all its evaluation criteria from the template?`)) {
      setTemplateItems(prev => prev.filter(i => i.section_code !== code));
    }
  };

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

  const getHodTotalScore = (app) => {
    if (!app) return null;
    const score = parseFloat(app.hod_total_score);
    if (!isNaN(score) && score > 0) return score;
    const partsSum = (parseFloat(app.hod_part_a_score) || 0) + (parseFloat(app.hod_part_b_score) || 0) + (parseFloat(app.hod_part_c_score) || 0) + (parseFloat(app.hod_part_d_score) || 0);
    if (partsSum > 0) return partsSum;
    return null;
  };

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

  // Draft saving state
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [draftId, setDraftId] = useState(null);

  const getVal = (...args) => {
    for (const a of args) {
      if (a !== undefined && a !== null) {
        const s = String(a).trim();
        if (
          s !== '' &&
          s.toLowerCase() !== 'n/a' &&
          s.toLowerCase() !== 'null' &&
          s.toLowerCase() !== 'undefined' &&
          !s.toLowerCase().startsWith('application/') &&
          !s.toLowerCase().startsWith('image/')
        ) {
          return s;
        }
      }
    }
    return '';
  };

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

  const handleStartNewForm = () => {
    setEditingAppraisalId(null);
    setAcademicYear(getCurrentAcademicYear());
    setCoursesTaught('');
    setSelfAppraisalScore('');
    setGoalsNextYear('');
    setA1Rows([{ class_name: '', course: '', ict_tool: '', score: '' }]);
    setA2Rows([{ class_name: '', course: '', title: '', platform: '', launch_date: '', link: '', score: '' }]);
    setA3Rows([{ class_name: '', course: '', experiment: '', score: '' }]);
    setA4Rows([{ class_name: '', course: '', mid_score: '', end_score: '', avg_score: '' }]);
    setA5Rows([{ class_name: '', course: '', odd_pass: '', even_pass: '', avg_pass: '' }]);
    setA6Rows([{ course_name: '', industry: '', duration: '', score: '' }]);
    setA7Rows([{ competition: '', team_members: '', project_title: '', position: '', score: '' }]);
    setB4Rows([{ course_name: '', academic_year: getCurrentAcademicYear(), details: '', score: '' }]);
    setB7Rows([{ name: '', company: '', duration: '', score: '' }]);
    setC3Rows([{ activity_name: '', event_type: '', location: '', date: '', score: '' }]);
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

      fetch(`${API_BASE_URL}/api/faculty/appraisal/fpi-summary/${viewingAppraisal.staff_id}?academicYear=${encodeURIComponent(viewingAppraisal.academic_year || academicYear)}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFpiDetails(data.details || null);
          setFpiBreakdown(data.breakdown || {});
        }
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

  // Re-fetch automated FPI metrics whenever Academic Year dropdown is changed
  useEffect(() => {
    if (academicYear) {
      fetchFpiSummary();
    }
  }, [academicYear]);

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

  const getDefaultSourcePage = (code) => {
    const c = (code || '').toUpperCase();
    const map = {
      B1: 'memberships',
      B2: 'resource',
      B3: 'interactions',
      B5: 'events',
      B6: 'certs',
      C1: 'publications',
      C2: 'books',
      C4: 'ipr',
      C5: 'funding',
      C6: 'seed_money',
      C7: 'scholars',
      C8: 'awards',
      D1: 'responsibilities'
    };
    return map[c] || 'publications';
  };

  const defaultFpiItemsFallback = [
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A1', criteria_title: 'Innovative ICT Tools Integrated in Course Delivery', rubric_description: '5 marks per innovative ICT tool (Kahoot, Virtual Labs, Canvas, Padlet, Google Classroom) integrated into course delivery.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 1 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A2', criteria_title: 'E-Content & Video Lectures Developed', rubric_description: '5 marks per original e-content / video lecture module developed and hosted on LMS / YouTube.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 2 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A3', criteria_title: 'Development of New Lab Experiments / Manuals', rubric_description: '5 marks per new lab experiment or virtual lab manual developed for curriculum enhancement.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 3 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A4', criteria_title: 'Student Feedback Score Rating', rubric_description: '5 marks for average feedback rating >=4.0/5, 3 marks for <4.0.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'bracket_rating', bracket_config: { rating_threshold: 4.0, high_score: 5, low_score: 3 }, display_order: 4 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A5', criteria_title: 'End Semester Course Pass Percentage', rubric_description: '10 marks for pass percentage >=80%, 5 marks for 60-79%.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: { pass_threshold: 80, high_score: 10, low_score: 5 }, display_order: 5 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A6', criteria_title: 'Value Added Courses & Industry Workshops Delivered', rubric_description: '5 marks per value-added course or industry hands-on workshop conducted.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 6 },
    { section_code: 'PART_A', section_title: 'PART A: Teaching Learning Process', criteria_code: 'A7', criteria_title: 'Mentoring Students in Hackathons & Competitions', rubric_description: '10 marks for Prize Won, 5 marks for Participation.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: { prize_score: 10, participation_score: 5 }, display_order: 7 },

    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B1', criteria_title: 'Professional Society Memberships', rubric_description: 'Automatic mapping: 3 marks per active professional society membership (IEEE, ISTE, ACM, CSI, etc.) [Max 3 pts].', mapping_type: 'auto', data_source_page: 'memberships', fixed_mark_per_record: 3, max_marks: 3, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 8 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B2', criteria_title: 'Resource Speaker / Session Chair / Invited Talks', rubric_description: 'Automatic mapping: 2 marks per invited guest lecture, resource talk, or session chair role delivered [Max 4 pts].', mapping_type: 'auto', data_source_page: 'resource', fixed_mark_per_record: 2, max_marks: 4, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 9 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B3', criteria_title: 'External Academic / Professional Interactions', rubric_description: 'Automatic mapping: 2.5 marks per interaction detail [Max 5 pts].', mapping_type: 'auto', data_source_page: 'interactions', fixed_mark_per_record: 2.5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 10 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B4', criteria_title: 'Curriculum Development & Board of Studies (BOS)', rubric_description: '5 marks for active BoS membership, syllabus revision, or curriculum framing.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 11 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B5', criteria_title: 'Organizing FDPs / Conferences / Symposia', rubric_description: 'Automatic mapping: 4 marks per national/international conference, FDP, or symposium organized [Max 8 pts].', mapping_type: 'auto', data_source_page: 'events', fixed_mark_per_record: 4, max_marks: 8, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 12 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B6', criteria_title: 'Online Certifications (SWAYAM / NPTEL / Coursera)', rubric_description: 'Automatic mapping: 5 marks for 8/12 week NPTEL/SWAYAM course, 2.5 marks for 4 week course [Max 10 pts].', mapping_type: 'auto', data_source_page: 'certs', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'bracket_rating', bracket_config: { long_course_score: 5, short_course_score: 2.5 }, display_order: 13 },
    { section_code: 'PART_B', section_title: 'PART B: Professional Development Activities', criteria_code: 'B7', criteria_title: 'Industrial Training / Corporate Internship Completed', rubric_description: '5 marks per corporate training / industrial fellowship completed (min 2 weeks).', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 14 },

    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C1', criteria_title: 'Research Publications in Journals & Conferences', rubric_description: 'Automatic mapping: 10 marks per Journal paper, 5 marks per Conference paper [Max 20 pts].', mapping_type: 'auto', data_source_page: 'publications', fixed_mark_per_record: 10, max_marks: 20, calculation_rule: 'pub_type_split', bracket_config: { journal_score: 10, conf_score: 5 }, display_order: 15 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C2', criteria_title: 'Books & Book Chapters Published', rubric_description: 'Automatic mapping: 5 marks per book or book chapter published with ISBN [Max 10 pts].', mapping_type: 'auto', data_source_page: 'books', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 16 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C3', criteria_title: 'Community Service & Extension Activities', rubric_description: '5 marks per community outreach, societal project, or extension program.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 17 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C4', criteria_title: 'IPR, Patents & Copyrights', rubric_description: 'Automatic mapping: 10 marks for Patent Granted / Copyright Registered, 7 marks for Patent Published, 3 marks for Filed [Max 10 pts].', mapping_type: 'auto', data_source_page: 'ipr', fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'patent_status_split', bracket_config: { granted_score: 10, published_score: 7, filed_score: 3 }, display_order: 18 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C5', criteria_title: 'Research Grants & External Sponsored Projects', rubric_description: 'Automatic mapping: 10 marks for sanctioned grant >5 Lakhs, 8 marks for <=5 Lakhs, 5 per proposal [Max 15 pts].', mapping_type: 'auto', data_source_page: 'funding', fixed_mark_per_record: 10, max_marks: 15, calculation_rule: 'bracket_rating', bracket_config: { high_grant_score: 10, low_grant_score: 8, proposal_score: 5 }, display_order: 19 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C6', criteria_title: 'Seed Money & Consultancy Services', rubric_description: 'Automatic mapping: 5 marks per internal seed money grant or external consultancy project [Max 10 pts].', mapping_type: 'auto', data_source_page: 'seed_money', fixed_mark_per_record: 5, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 20 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C7', criteria_title: 'Research Scholars Guidance (Ph.D)', rubric_description: 'Automatic mapping: 2.5 marks per registered Ph.D scholar (N/A for Non-Supervisors) [Max 5 pts].', mapping_type: 'auto', data_source_page: 'scholars', fixed_mark_per_record: 2.5, max_marks: 5, calculation_rule: 'phd_supervisor_gated', bracket_config: { scholar_unit_score: 2.5 }, display_order: 21 },
    { section_code: 'PART_C', section_title: 'PART C: Research & Consultancy', criteria_code: 'C8', criteria_title: 'Awards & Recognitions Received', rubric_description: 'Automatic mapping: 5 marks per national/international award or honor received [Max 5 pts].', mapping_type: 'auto', data_source_page: 'awards', fixed_mark_per_record: 5, max_marks: 5, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 22 },

    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D1', criteria_title: 'Assigned Institutional & Departmental Responsibilities', rubric_description: 'Automatic mapping: 10 marks per Institutional role (Max 20), 10 marks per Departmental role (Max 10). Combined Max 20 pts.', mapping_type: 'auto', data_source_page: 'responsibilities', fixed_mark_per_record: 10, max_marks: 20, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 23 },
    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D2', criteria_title: 'Student Mentoring, Counseling & Academic Guidance', rubric_description: '10 marks for effective mentee tracking, counseling logs, and academic progress monitoring.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 24 },
    { section_code: 'PART_D', section_title: 'PART D: Institutional Development & Contribution', criteria_code: 'D3', criteria_title: 'Contribution to NBA / NAAC / Autonomous Accreditations', rubric_description: '10 marks for criterion head / module coordinator role in NBA, NAAC, or Autonomous audits.', mapping_type: 'manual', data_source_page: null, fixed_mark_per_record: 10, max_marks: 10, calculation_rule: 'fixed_per_record', bracket_config: null, display_order: 25 }
  ];

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/template`, {
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
      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/template`, {
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

  const handleMoveCriteriaUp = (index) => {
    if (index <= 0) return;
    setTemplateItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy.map((item, i) => ({ ...item, display_order: i + 1 }));
    });
  };

  const handleMoveCriteriaDown = (index) => {
    setTemplateItems(prev => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy.map((item, i) => ({ ...item, display_order: i + 1 }));
    });
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

      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/fpi-summary/${auth.staffId}?academicYear=${encodeURIComponent(academicYear)}`, {
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
      // Update viewingAppraisal with new signature data + IP so UI refreshes immediately
      setViewingAppraisal(prev => ({
        ...prev,
        [`${role}_signed_at`]: data.signedAt,
        [`${role}_signed_name`]: data.signedName,
        [`${role}_signed_ip`]: data.signedIp
      }));
      fetchAppraisals();
      setMessage(`Digitally signed successfully as ${data.signedName}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Save Draft Handler — saves partial form without submitting
  const handleSaveDraft = async () => {
    if (!academicYear || !academicYear.trim()) { setError('Academic Year is required to save a draft.'); return; }
    setDraftSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = {
        academic_year: academicYear,
        courses_taught: coursesTaught || '',
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
        self_appraisal_score: String(manualScores.grandTotal),
        part_a_score: manualScores.partA,
        part_b_score: manualScores.partB,
        part_c_score: manualScores.partC,
        part_d_score: manualScores.partD,
        total_fpi_score: manualScores.grandTotal
      };

      // If we already have a draftId, update it directly
      const url = draftId
        ? `${API_BASE_URL}/api/faculty/appraisal/${draftId}/draft`
        : `${API_BASE_URL}/api/faculty/appraisal/draft`;
      const method = draftId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save draft');

      if (!draftId) setDraftId(data.id);
      if (!editingAppraisalId) setEditingAppraisalId(data.id);
      setDraftSavedAt(new Date(data.savedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      fetchAppraisals();
    } catch (err) {
      setError(err.message);
    } finally {
      setDraftSaving(false);
    }
  };

  // Save form + Sign in one step (when faculty clicks Sign in the signature block)
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

      // Update viewingAppraisal to reflect saved + signed state including IP
      setViewingAppraisal(prev => ({
        ...prev,
        id: appraisalId,
        isDraft: false,
        status: 'Submitted',
        faculty_signed_at: signData.signedAt,
        faculty_signed_name: signData.signedName,
        faculty_signed_ip: signData.signedIp
      }));
      setEditingAppraisalId(appraisalId);
      setDraftId(null);
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
      const targetApp = appraisals.find(a => a.id === appId) || {};
      const partA = hodScores.hod_part_a_score !== undefined && hodScores.hod_part_a_score !== '' ? parseFloat(hodScores.hod_part_a_score) : (parseFloat(targetApp.part_a_score) || 0);
      const partB = hodScores.hod_part_b_score !== undefined && hodScores.hod_part_b_score !== '' ? parseFloat(hodScores.hod_part_b_score) : (parseFloat(targetApp.part_b_score) || 0);
      const partC = hodScores.hod_part_c_score !== undefined && hodScores.hod_part_c_score !== '' ? parseFloat(hodScores.hod_part_c_score) : (parseFloat(targetApp.part_c_score) || 0);
      const partD = hodScores.hod_part_d_score !== undefined && hodScores.hod_part_d_score !== '' ? parseFloat(hodScores.hod_part_d_score) : (parseFloat(targetApp.part_d_score) || 0);
      const hodTotal = partA + partB + partC + partD;

      const res = await fetch(`${API_BASE_URL}/api/faculty/appraisal/${appId}/hod-approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          hod_part_a_score: partA,
          hod_part_b_score: partB,
          hod_part_c_score: partC,
          hod_part_d_score: partD,
          hod_total_score: hodTotal,
          hod_remarks: hodScores.hod_remarks || '',
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

    try {
      const resFpi = await fetch(`${API_BASE_URL}/api/faculty/appraisal/fpi-summary/${app.staff_id}?academicYear=${encodeURIComponent(app.academic_year || academicYear)}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (resFpi.ok) {
        const dataFpi = await resFpi.json();
        setFpiDetails(dataFpi.details || null);
        setFpiBreakdown(dataFpi.breakdown || {});
      }
    } catch (e) {
      console.error('Failed to fetch FPI summary for viewing appraisal:', e);
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

    const getProofUrl = (item) => {
      if (!item) return null;
      const file = item.file || item.file1 || item.document || item.proof || item.certificate || item.certificate_file;
      if (!file || file === 'N/A' || file === 'undefined' || file === 'null') return null;
      if (file.startsWith('http://') || file.startsWith('https://')) return file;
      return `${API_BASE_URL}/uploads/${encodeURIComponent(file)}?token=${encodeURIComponent(auth.token)}`;
    };

    return (
      <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1.5px solid #7dd3fc', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} /> Automatic Portal Activity Mappings & Proof Document Verification
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#0284c7' }}>
              Click any category below to verify fetched record details, awarded scores, and view original uploaded proof documents.
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
                  <th style={{ width: '130px', textAlign: 'center' }}>{currentCols.col3}</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>{currentCols.col4}</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Proof Document</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((item, index) => {
                  const f = fields(item, currentCatObj.key);
                  const proofUrl = getProofUrl(item);
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
                      <td style={{ textAlign: 'center' }}>
                        {proofUrl ? (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.78rem',
                              padding: '4px 10px',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              border: '1px solid #7dd3fc',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            <Eye size={13} /> View Proof
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No Proof Attached
                          </span>
                        )}
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

      {/* HOD / DEPT ADMIN NAVIGATION TABS */}
      {isDeptAdmin && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setHodTab('submissions')}
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: hodTab === 'submissions' ? 'hsl(var(--primary))' : '#f1f5f9',
              color: hodTab === 'submissions' ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileCheck size={18} />
            Submitted Department Appraisal Forms ({appraisals.length})
            {appraisals.filter(a => a.status === 'Submitted').length > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                {appraisals.filter(a => a.status === 'Submitted').length} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setHodTab('my_appraisal')}
            style={{
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: hodTab === 'my_appraisal' ? 'hsl(var(--primary))' : '#f1f5f9',
              color: hodTab === 'my_appraisal' ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={18} />
            My Faculty Appraisal Form
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

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowLivePreviewModal(true)}
                className="btn btn-secondary"
                style={{ padding: '10px 16px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#15803d', borderColor: '#86efac' }}
              >
                <Eye size={16} /> Live Preview Form
              </button>
              <button
                onClick={() => setShowAddPartModal(true)}
                className="btn btn-secondary"
                style={{ padding: '10px 16px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', borderColor: '#7dd3fc' }}
              >
                <Plus size={16} /> Add New PART / Section
              </button>
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
          </div>

          {/* DESIGNATION OVERRIDE TAB FILTER BAR */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0284c7" /> Target Designation Parameters:
              </span>
              {['ALL', 'Assistant Professor', 'Associate Professor', 'Professor', 'Professor & Head'].map((desig) => {
                const isSelected = selectedDesignationFilter === desig;
                const hasOverrides = desig !== 'ALL' && (templateItems || []).some(i => i.target_designation === desig);
                return (
                  <button
                    key={desig}
                    type="button"
                    onClick={() => setSelectedDesignationFilter(desig)}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                      background: isSelected ? '#0284c7' : (hasOverrides ? '#f0f9ff' : '#f8fafc'),
                      color: isSelected ? '#ffffff' : (hasOverrides ? '#0369a1' : '#475569'),
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {desig === 'ALL' ? 'All Designations (Default Common)' : desig}
                    {hasOverrides && !isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }}></span>}
                  </button>
                );
              })}
            </div>

            {selectedDesignationFilter !== 'ALL' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!(templateItems || []).some(i => i.target_designation === selectedDesignationFilter) ? (
                  <button
                    type="button"
                    onClick={() => handleCopyDefaultTemplateForDesignation(selectedDesignationFilter)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 800 }}
                  >
                    <Plus size={14} /> Create {selectedDesignationFilter} Overrides
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Clear custom parameter overrides for ${selectedDesignationFilter}? It will revert to using default ALL parameters.`)) {
                        setTemplateItems(prev => prev.filter(i => i.target_designation !== selectedDesignationFilter));
                      }
                    }}
                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.78rem', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Reset to Default Common Mappings
                  </button>
                )}
              </div>
            )}
          </div>

          {distinctSections.map((sectionCode) => {
            const currentTitle = getSectionTitle(sectionCode);
            const activeDesigItems = templateItems.filter(i => 
              i.section_code === sectionCode && 
              (i.target_designation || 'ALL') === selectedDesignationFilter
            );
            const sectionItems = activeDesigItems.length > 0 
              ? activeDesigItems 
              : templateItems.filter(i => i.section_code === sectionCode && (!i.target_designation || i.target_designation === 'ALL'));

            const isStandardPart = ['PART_A', 'PART_B', 'PART_C', 'PART_D'].includes(sectionCode);

            return (
              <div key={sectionCode} style={{ marginBottom: '28px', background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', border: '1px solid #7dd3fc' }}>
                      {sectionCode}
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={currentTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTemplateItems(prev => prev.map(item => item.section_code === sectionCode ? { ...item, section_title: val } : item));
                      }}
                      style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleAddCriteriaItem(sectionCode, currentTitle)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                    >
                      <Plus size={14} /> Add Criteria
                    </button>
                    {!isStandardPart && (
                      <button
                        onClick={() => handleRemoveSection(sectionCode)}
                        style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', fontSize: '0.78rem', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Delete this custom part"
                      >
                        <Trash2 size={13} /> Delete Part
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '65px' }}>Code</th>
                        <th style={{ width: '180px' }}>Criteria Title</th>
                        <th>Rubrics & Evaluation Description</th>
                        <th style={{ width: '130px' }}>Mapping Type</th>
                        <th style={{ width: '150px' }}>Calculation Rule</th>
                        <th style={{ width: '110px' }}>Mark / Record</th>
                        <th style={{ width: '100px' }}>Total Max</th>
                        <th style={{ width: '45px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
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
                                {item.mapping_type === 'auto' && (
                                  <div style={{ marginTop: '5px' }}>
                                    <label style={{ fontSize: '0.68rem', color: '#0369a1', fontWeight: 800, display: 'block', marginBottom: '2px' }}>
                                      Auto-Fetch Source Page:
                                    </label>
                                    <select
                                      className="form-control"
                                      value={item.data_source_page || getDefaultSourcePage(item.criteria_code)}
                                      onChange={(e) => handleTemplateItemChange(itemIndex, 'data_source_page', e.target.value)}
                                      style={{ fontSize: '0.75rem', padding: '3px 5px', background: '#f0f9ff', borderColor: '#7dd3fc', color: '#0369a1', fontWeight: 700 }}
                                    >
                                      <option value="memberships">👥 Professional Societies (staff_member)</option>
                                      <option value="resource">🎤 Resource Person (staff_resource)</option>
                                      <option value="interactions">🎓 FDPs Attended (staff_interaction)</option>
                                      <option value="events">🎪 Events Organized (staff_event_organized)</option>
                                      <option value="certs">📜 Online Certifications (staff_certificate)</option>
                                      <option value="publications">📚 Publications (staff_publication)</option>
                                      <option value="books">📖 Books Published (staff_book_published)</option>
                                      <option value="ipr">🛡️ IPR / Patents (staff_ipr)</option>
                                      <option value="funding">💰 Research Funding (staff_funding)</option>
                                      <option value="seed_money">🌱 Seed Money / Consultancy (staff_seed_money)</option>
                                      <option value="scholars">🎓 PhD Scholars (staff_scholars)</option>
                                      <option value="awards">🏆 Awards Received (staff_award)</option>
                                      <option value="responsibilities">📋 Responsibilities (staff_responsibilities)</option>
                                    </select>
                                  </div>
                                )}
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={item.calculation_rule || 'fixed_per_record'}
                                  onChange={(e) => handleTemplateItemChange(itemIndex, 'calculation_rule', e.target.value)}
                                  style={{ fontSize: '0.8rem', padding: '4px 6px', color: '#0369a1', fontWeight: 700 }}
                                >
                                  <option value="fixed_per_record">Fixed Unit Mark</option>
                                  <option value="bracket_rating">Threshold Bracket</option>
                                  <option value="pub_type_split">Publication Split</option>
                                  <option value="patent_status_split">Patent Status Split</option>
                                  <option value="phd_supervisor_gated">Ph.D Supervisor Gated</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setRuleModalItem({ index: itemIndex, item: { ...item } })}
                                  style={{
                                    marginTop: '4px',
                                    fontSize: '0.72rem',
                                    padding: '2px 8px',
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #7dd3fc',
                                    borderRadius: '4px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    width: '100%',
                                    justifyContent: 'center'
                                  }}
                                  title="Configure threshold bracket cutoffs & tier scores"
                                >
                                  <Settings size={11} /> Config Bracket
                                </button>
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
                                 <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
                                   <button
                                     type="button"
                                     onClick={() => handleMoveCriteriaUp(itemIndex)}
                                     disabled={itemIndex === 0}
                                     style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '2px 5px', cursor: 'pointer', fontSize: '0.7rem', opacity: itemIndex === 0 ? 0.3 : 1 }}
                                     title="Move Criteria Up"
                                   >
                                     ▲
                                   </button>
                                   <button
                                     type="button"
                                     onClick={() => handleMoveCriteriaDown(itemIndex)}
                                     disabled={itemIndex === templateItems.length - 1}
                                     style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '4px', padding: '2px 5px', cursor: 'pointer', fontSize: '0.7rem', opacity: itemIndex === templateItems.length - 1 ? 0.3 : 1 }}
                                     title="Move Criteria Down"
                                   >
                                     ▼
                                   </button>
                                   <button
                                     type="button"
                                     onClick={() => handleRemoveCriteriaItem(itemIndex)}
                                     style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                     title="Remove Criteria"
                                   >
                                     <Trash2 size={15} />
                                   </button>
                                 </div>
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
                  : 'Submit and view your annual Faculty Performance Indicator (FPI) appraisal forms.'}
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
                  getHodTotalScore(a) !== null ? `${getHodTotalScore(a)} / 200` : 'Pending Review',
                  a.status || 'Submitted'
                ])}
                auth={auth}
              />

              {!isAdminOrHR && (() => {
                const myAppraisal = appraisals.find(a => a.staff_id === auth.staffId) || lastSubmittedAppraisal;
                return (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        if (showAddForm && !editingAppraisalId) {
                          setShowAddForm(false);
                        } else {
                          handleStartNewForm();
                        }
                      }}
                      style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {showAddForm && !editingAppraisalId ? <X size={16} /> : <Plus size={16} />}
                      {showAddForm && !editingAppraisalId ? 'Close Form' : 'Fill New FPI Form'}
                    </button>

                    {myAppraisal && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          if (showAddForm && editingAppraisalId) {
                            setShowAddForm(false);
                            setEditingAppraisalId(null);
                          } else {
                            handleStartEdit(myAppraisal);
                          }
                        }}
                        style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={16} /> {showAddForm && editingAppraisalId ? 'Close Edit' : 'Edit FPI Form'}
                      </button>
                    )}

                    {myAppraisal && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleOpenViewModal(myAppraisal)}
                        style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #7dd3fc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={16} /> View Filled Appraisal Form
                      </button>
                    )}
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
                Complete the manual entry tables and review automated metrics matching evaluation guidelines.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={draftSaving}
                className="btn btn-secondary"
                style={{ fontWeight: 800, fontSize: '0.85rem', padding: '8px 16px', background: '#fef3c7', color: '#92400e', border: '1.5px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={16} /> {draftSaving ? 'Saving Draft...' : 'Save Draft'}
              </button>

              {draftSavedAt && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  Saved at {draftSavedAt}
                </span>
              )}

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

          {/* PART B: PROFESSIONAL DEVELOPMENT ACTIVITIES */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                PART B: Professional Development Activities (Max Score: 40 Marks)
              </h4>
              <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                Part B Score: {manualScores.partB} / 40 Pts
              </span>
            </div>

            {/* b1 Table (Auto-Mapped Professional Societies) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b1. Membership in Professional Societies at National/ International levels (Max: 3 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(3, (fpiDetails?.members?.length || 0) * 3)} / 3 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Membership in Professional Society</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Membership Number</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Life / Annual Membership</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.members || fpiDetails.members.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No professional memberships logged for {academicYear}</td></tr>
                  ) : fpiDetails.members.map((m, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.organization, m.societyname, m.society_name, m.society, m.name, m.title) || 'Professional Society Membership'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.membershipid, m.mem_id, m.membership_no, m.membership_id, m.member_id, m.id) || 'Active Member'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.membership_type, m.type) || 'Life Member'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>3 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                b1 Category Total Score: {Math.min(3, (fpiDetails?.members?.length || 0) * 3)} / 3 Pts
              </div>
            </div>

            {/* b2 Table (Auto-Mapped Resource Person) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b2. Faculty as Resource person in External STTPs/ FDPs/ Workshops/ Conferences/ Guest Speaker/ BOS/ Reviewer (Max: 4 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(4, (fpiDetails?.resource?.length || 0) * 2)} / 4 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Event</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Nature of Work</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s) [DD/MM/YY]</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.resource || fpiDetails.resource.length === 0) ? (
                    <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No resource person records logged for {academicYear}</td></tr>
                  ) : fpiDetails.resource.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.title, r.eventname, r.event_title, r.event_name, r.name, r.programme_name, r.topic) || (r.organizer ? `${getVal(r.actedas, r.role) || 'Resource Person'} @ ${r.organizer}` : 'Guest Session / Resource Activity')}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.actedas, r.natureofwork, r.role, r.work_type) || 'Resource Person'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.organizer, r.orgby, r.org, r.conducting_body) || 'External Institution'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.eventdate || (r.from_date ? (r.to_date ? `${r.from_date} to ${r.to_date}` : r.from_date) : (getVal(r.date) || 'N/A'))}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                b2 Category Total Score: {Math.min(4, (fpiDetails?.resource?.length || 0) * 2)} / 4 Pts
              </div>
            </div>

            {/* b3 Table (Auto-Mapped FDP/STTP Participation) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b3. Faculty member's Participation in STTPs/ FDPs/ Workshops/ Seminars/ Conferences (Max: 5 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(5, (fpiDetails?.interactions || []).reduce((acc, it) => {
                    const duration = (it.duration || '').toLowerCase();
                    return acc + ((duration.includes('5') || duration.includes('week') || duration.includes('6') || duration.includes('7') || duration.includes('10')) ? 2.5 : 2);
                  }, 0))} / 5 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of FDP / Workshop</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer / Institution</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Dates</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.interactions || fpiDetails.interactions.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No FDP/STTP participations logged in portal</td></tr>
                  ) : fpiDetails.interactions.map((it, i) => {
                    const duration = (it.duration || '').toLowerCase();
                    const pts = (duration.includes('5') || duration.includes('week') || duration.includes('6') || duration.includes('7') || duration.includes('10')) ? 2.5 : 2;
                    return (
                      <tr key={i}>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.program_name || it.title || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.organizer || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[it.duration, it.from_date].filter(Boolean).join(' | ') || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{pts} Pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                b3 Category Total Score: {Math.min(5, (fpiDetails?.interactions || []).reduce((acc, it) => {
                  const duration = (it.duration || '').toLowerCase();
                  return acc + ((duration.includes('5') || duration.includes('week') || duration.includes('6') || duration.includes('7') || duration.includes('10')) ? 2.5 : 2);
                }, 0))} / 5 Pts
              </div>
            </div>

            {/* B4: Contribution to Curriculum Development (Editable) */}
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

            {/* b5 Table (Auto-Mapped Organized Events) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b5. Organized- FDP/ STTP/ Conferences/ Seminars/ Skill development Programmes/ Guest Lectures (Max: 8 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(8, (fpiDetails?.events?.length || 0) * 4)} / 8 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Event Type & Title</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Role</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Funding / Sponsor</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.events || fpiDetails.events.length === 0) ? (
                    <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No organized events logged in portal</td></tr>
                  ) : fpiDetails.events.map((ev, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[ev.eventtype, ev.eventname].filter(Boolean).join(' - ') || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.role || 'Coordinator'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.sponsor || ev.funding_agency || 'Self / College'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[ev.fromdate, ev.todate].filter(Boolean).join(' to ') || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>4 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                b5 Category Total Score: {Math.min(8, (fpiDetails?.events?.length || 0) * 4)} / 8 Pts
              </div>
            </div>

            {/* b6 Table (Auto-Mapped Online Certifications) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b6. Faculty certification through SWAYAM/ NPTEL/ COURSERA and other approved courses (Max: 10 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(10, (fpiDetails?.certs?.length || 0) * 5)} / 10 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Title</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Platform</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Score</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.certs || fpiDetails.certs.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No online certifications logged in portal</td></tr>
                  ) : fpiDetails.certs.map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{c.coursename || c.title || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{c.offeredby || c.platform || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[c.duration, c.score_obtained].filter(Boolean).join(' | ') || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                b6 Category Total Score: {Math.min(10, (fpiDetails?.certs?.length || 0) * 5)} / 10 Pts
              </div>
            </div>

            {/* B7: Faculty Internship / Training / Industry Collaboration (Editable) */}
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

          {/* PART C: RESEARCH & DEVELOPMENT ACTIVITIES */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                PART C: Research & Development Activities (Max Score: 80 Marks)
              </h4>
              <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                Part C Score: {manualScores.partC} / 80 Pts
              </span>
            </div>

            {/* c1 Table (Auto-Mapped Journal Publications) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c1. Publication of Research Article in Journals (Scopus / WoS / SCI) (Max: 20 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(20, (fpiDetails?.publications || []).filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf'))).length * 10)} / 20 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '45px', textAlign: 'center' }}>S.No</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Author, Co-Author(s)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the Paper</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of Journal</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>ISSN No</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Month/Year</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Indexed In</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '80px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const journalPubs = (fpiDetails?.publications || []).filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
                    if (journalPubs.length === 0) {
                      return <tr><td colSpan={8} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No journal publications logged in portal</td></tr>;
                    }
                    return journalPubs.map((p, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{p.authors || p.author_name || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{p.title || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{p.journal || p.journal_name || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{p.issn || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[p.month, p.year].filter(Boolean).join('/') || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{p.indexing || p.index_type || 'Scopus/WoS'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c1 Category Total Score: {Math.min(20, (fpiDetails?.publications || []).filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf'))).length * 10)} / 20 Pts
              </div>
            </div>

            {/* c2 Table (Auto-Mapped Conferences & Books) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c2. Publication in Conference Proceedings / Book / Book Chapters (Max: 10 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(10, ((fpiDetails?.publications || []).filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf'))).length + (fpiDetails?.books?.length || 0)) * 5)} / 10 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '45px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of Author, Co-Author(s)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Category</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Paper / Book / Chapter</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Month & Year</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer / Publisher</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '80px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const confPubs = (fpiDetails?.publications || []).filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
                    const bookPubs = fpiDetails?.books || [];
                    const combined = [...confPubs.map(cp => ({ ...cp, isBook: false })), ...bookPubs.map(bk => ({ ...bk, isBook: true }))];

                    if (combined.length === 0) {
                      return <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No conference proceedings or books logged in portal</td></tr>;
                    }

                    return combined.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.authors || item.author_name || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.isBook ? 'Book / Chapter' : 'Conference'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.title || item.book_title || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[item.month, item.year].filter(Boolean).join('/') || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.publisher || item.organizer || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c2 Category Total Score: {Math.min(10, ((fpiDetails?.publications || []).filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf'))).length + (fpiDetails?.books?.length || 0)) * 5)} / 10 Pts
              </div>
            </div>

            {/* C3: Community Service & Outreach Activities (Editable) */}
            <div style={{ marginBottom: '16px' }}>
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

            {/* c4 Table (Auto-Mapped IPR / Patents) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c4. Intellectual Property- Published and Granted: Patents / Copy Rights (Max: 10 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(10, (fpiDetails?.ipr?.length || 0) * 10)} / 10 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Patents/Copyrights/ Trade Marks</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Filed/Published/ Granted</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.ipr || fpiDetails.ipr.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No patents or copyrights logged in portal</td></tr>
                  ) : fpiDetails.ipr.map((ip, i) => {
                    const st = (ip.status || '').toLowerCase();
                    const pts = st.includes('grant') ? 10 : st.includes('pub') ? 7 : 3;
                    return (
                      <tr key={i}>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.type || ip.category || 'Patent'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.title || ip.patent_title || 'N/A'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.status || 'Filed'}</td>
                        <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{pts} Pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c4 Category Total Score: {Math.min(10, (fpiDetails?.ipr?.length || 0) * 10)} / 10 Pts
              </div>
            </div>

            {/* c5 Table (Auto-Mapped Grants) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c5. Grants Applied/Received from Government and Non-Government agencies (Max: 15 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(15, (fpiDetails?.funding?.length || 0) * 10)} / 15 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Project / Event Category</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PI / Co-PI</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Project / Event</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Funding Agency</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Amount</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Applied / Sanctioned</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.funding || fpiDetails.funding.length === 0) ? (
                    <tr><td colSpan={8} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No research grants or event funding logged in portal</td></tr>
                  ) : fpiDetails.funding.map((fn, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.category || fn.project_type || 'Research Project'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.role || 'PI'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.title || fn.project_title || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.agency || fn.funding_agency || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.amount ? `₹ ${parseFloat(fn.amount).toLocaleString('en-IN')}` : 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.status || 'Sanctioned'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c5 Category Total Score: {Math.min(15, (fpiDetails?.funding?.length || 0) * 10)} / 15 Pts
              </div>
            </div>

            {/* c6 Table (Auto-Mapped Seed Money & Consultancy) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c6. Funded Consultancy Projects & Internal Seed Money for Research (Max: 10 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(10, (fpiDetails?.seedMoney?.length || 0) * 5)} / 10 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Faculty Members Involved</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PI / Co-PI</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Project</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Dates</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Amount Sanctioned</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.seedMoney || fpiDetails.seedMoney.length === 0) ? (
                    <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No seed money or consultancy logged in portal</td></tr>
                  ) : fpiDetails.seedMoney.map((sm, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.faculty_involved || sm.staff_name || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.role || 'PI'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.title || sm.project_title || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[sm.duration, sm.sanction_date].filter(Boolean).join(' | ') || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.amount ? `₹ ${parseFloat(sm.amount).toLocaleString('en-IN')}` : 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c6 Category Total Score: {Math.min(10, (fpiDetails?.seedMoney?.length || 0) * 5)} / 10 Pts
              </div>
            </div>

            {/* c7 Table (Auto-Mapped Ph.D Research Scholars) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                  c7. Guidance of Research Scholars (Ph.D Completed / Ongoing) (Max: 5 Marks)
                </h5>
                {fpiDetails?.is_recognized_supervisor === false ? (
                  <span className="badge" style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 800 }}>
                    Category Total: N/A (Not a Recognized Research Supervisor)
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                    Category Total: {Math.min(5, (fpiDetails?.scholars?.length || 0) * 2.5)} / 5 Pts
                  </span>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Supervisor Category</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Scholar Name & University</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Status (Ongoing / Completed)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {fpiDetails?.is_recognized_supervisor === false ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: 600, background: '#f8fafc' }}>
                        N/A - Not a Recognized Research Supervisor (No score calculated)
                      </td>
                    </tr>
                  ) : (!fpiDetails?.scholars || fpiDetails.scholars.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No research scholars logged in portal</td></tr>
                  ) : fpiDetails.scholars.map((sc, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sc.supervisor_type || 'Supervisor'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[sc.staff_name, sc.university].filter(Boolean).join(' - ') || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sc.status || 'Ongoing'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2.5 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: fpiDetails?.is_recognized_supervisor === false ? '#64748b' : '#0369a1' }}>
                c7 Category Total Score: {fpiDetails?.is_recognized_supervisor === false ? 'N/A' : `${Math.min(5, (fpiDetails?.scholars?.length || 0) * 2.5)} / 5 Pts`}
              </div>
            </div>

            {/* c8 Table (Auto-Mapped Awards & Recognitions) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c8. Awards and Recognitions (Max: 5 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(5, (fpiDetails?.awards?.length || 0) * 5)} / 5 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the award</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organization details</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date (DD/MM/YYYY)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.awards || fpiDetails.awards.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No awards or recognitions logged in portal</td></tr>
                  ) : fpiDetails.awards.map((aw, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awardname || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awardby || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awa_date || aw.date || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                c8 Category Total Score: {Math.min(5, (fpiDetails?.awards?.length || 0) * 5)} / 5 Pts
              </div>
            </div>
          </div>

          {/* PART D: INSTITUTIONAL DEVELOPMENT & CONTRIBUTION */}
          <div style={{ marginBottom: '28px', background: '#fafafa', padding: '20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                PART D: Institutional Development & Contribution (Max Score: 20 Marks)
              </h4>
              <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                Part D Score: {manualScores.partD} / 20 Pts
              </span>
            </div>

            {/* d1 Table (Auto-Mapped Additional Responsibilities) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>d1. Additional Responsibilities (College Level & Department Level) (Max: 20 Marks)</h5>
                <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                  Category Total: {Math.min(20, (fpiDetails?.responsibilities?.length || 0) * 10)} / 20 Pts
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Level (College / Dept)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Nature of Responsibility / Portfolio</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Assigned Details & Academic Year</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(!fpiDetails?.responsibilities || fpiDetails.responsibilities.length === 0) ? (
                    <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No assigned responsibilities logged in portal</td></tr>
                  ) : fpiDetails.responsibilities.map((resp, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{resp.level || 'Department Level'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{resp.responsibility || 'N/A'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[resp.assigned_by, resp.academic_year].filter(Boolean).join(' | ') || 'Assigned Responsibility'}</td>
                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                d1 Category Total Score: {Math.min(20, (fpiDetails?.responsibilities?.length || 0) * 10)} / 20 Pts
              </div>
            </div>
          </div>

          {/* SUMMARY OF FPI SCORES TABLE (MATCHING FPI.DOCX) */}
          <div style={{ marginBottom: '28px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #0284c7', fontSize: '0.9rem', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                  <th colSpan={5} style={{ padding: '12px', textAlign: 'center', fontSize: '1rem', fontWeight: 800 }}>
                    FPI APPRAISAL PERFORMANCE EVALUATION SUMMARY (TOTAL SCORE: 200 MARKS)
                  </th>
                </tr>
                <tr style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>
                  <th style={{ padding: '10px', border: '1px solid #bae6fd' }}>EVALUATION CRITERIA SECTION</th>
                  <th style={{ padding: '10px', border: '1px solid #bae6fd', textAlign: 'center', width: '110px' }}>MAX MARKS</th>
                  <th style={{ padding: '10px', border: '1px solid #bae6fd', textAlign: 'center', width: '140px' }}>FACULTY SELF SCORE</th>
                  <th style={{ padding: '10px', border: '1px solid #bae6fd', textAlign: 'center', width: '120px' }}>HOD SCORE</th>
                  <th style={{ padding: '10px', border: '1px solid #bae6fd', textAlign: 'center', width: '120px' }}>FINAL SCORE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>PART A: Teaching Learning Process</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>60</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{manualScores.partA}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>PART B: Professional Development Activities</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>40</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{manualScores.partB}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>PART C: Research & Development Activities</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>80</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{manualScores.partC}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>PART D: Institutional Development & Contribution</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>20</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>{manualScores.partD}</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                  <td style={{ padding: '10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>-</td>
                </tr>
                <tr style={{ background: '#f0f9ff', fontWeight: 800 }}>
                  <td style={{ padding: '12px', border: '1px solid #0284c7', color: '#0369a1', fontSize: '0.95rem' }}>GRAND TOTAL APPRAISAL SCORE</td>
                  <td style={{ padding: '12px', border: '1px solid #0284c7', textAlign: 'center', color: '#0369a1', fontSize: '0.95rem' }}>200</td>
                  <td style={{ padding: '12px', border: '1px solid #0284c7', textAlign: 'center', color: '#0284c7', fontSize: '1.05rem' }}>{manualScores.grandTotal} / 200</td>
                  <td style={{ padding: '12px', border: '1px solid #0284c7', textAlign: 'center', color: '#94a3b8' }}>-</td>
                  <td style={{ padding: '12px', border: '1px solid #0284c7', textAlign: 'center', color: '#94a3b8' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* GOALS NEXT YEAR */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Goals & Commitments for Next Academic Year</label>
            <textarea className="form-control" rows="3" placeholder="Specify targets for publication, consultancy, grants, and teaching innovations..." value={goalsNextYear} onChange={(e) => setGoalsNextYear(e.target.value)} />
          </div>

          {/* SUBMIT & PREVIEW ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={draftSaving}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontWeight: 800, background: '#fef3c7', color: '#92400e', border: '1.5px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={18} /> {draftSaving ? 'Saving Draft...' : 'Save Draft'}
            </button>

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
      {!isAdminOrHR && (!isDeptAdmin || hodTab === 'my_appraisal') && !showAddForm && (
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
      {!isAdminOrHR && (!isDeptAdmin || hodTab === 'my_appraisal') && !showAddForm && (
        <AutoMappedVerificationPanel details={fpiDetails} breakdown={fpiBreakdown} />
      )}

      {/* SUBMITTED APPRAISALS LIST VIEW */}
      {((isAdminOrHR && activeAdminTab === 'submissions') || (isDeptAdmin && hodTab === 'submissions') || (!isAdminOrHR && !isDeptAdmin)) && (
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
                        background: app.status === 'Draft' ? '#fef3c7' : app.status === 'Final Approved' ? '#dcfce7' : app.status === 'HOD Approved' ? '#e0f2fe' : 'hsla(var(--primary), 0.1)',
                        color: app.status === 'Draft' ? '#92400e' : app.status === 'Final Approved' ? '#15803d' : app.status === 'HOD Approved' ? '#0369a1' : 'hsl(var(--primary))',
                        border: `1px solid ${app.status === 'Draft' ? '#fde68a' : app.status === 'Final Approved' ? '#86efac' : app.status === 'HOD Approved' ? '#7dd3fc' : 'transparent'}`
                      }}>
                        Status: {app.status === 'Draft' ? 'Saved Draft' : app.status === 'HOD Approved' ? 'HOD Approved (Pending Principal/HR)' : (app.status || 'Submitted')}
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
                    <div><strong>HOD Total Score:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{getHodTotalScore(app) !== null ? `${getHodTotalScore(app)} / 200` : 'Pending'}</span></div>
                  </div>

                  {app.reviewer_remarks && (
                    <div style={{ marginBottom: '16px', background: '#fffbe6', border: '1.5px solid #ffe58f', borderRadius: '8px', padding: '12px 16px', color: '#92400e', fontSize: '0.85rem' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📌 Reviewer Feedback / Revision Note:</strong>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{app.reviewer_remarks}</p>
                    </div>
                  )}

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
                        Total HOD Evaluated Score: {getHodTotalScore(app) ?? 0} / 200
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
                        <strong>HOD Evaluated Score:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{getHodTotalScore(app) ?? 0} / 200</span>
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
                        <div><strong>Final Total Score:</strong> <span style={{ color: '#15803d', fontWeight: 800 }}>{app.final_total_score || getHodTotalScore(app) || 'N/A'} / 200</span></div>
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

        // Dynamic Helper to extract template constraints (unit mark & max mark cap) with designation override resolution
        const getConstraint = (code, defUnit, defMax) => {
          const facultyDesig = (viewingAppraisal?.designation || generalInfo?.designation || '').trim().toLowerCase();

          // 1. Check for designation-specific override first
          let item = (templateItems || []).find(i => 
            (i.criteria_code || '').toUpperCase() === code.toUpperCase() && 
            i.target_designation && 
            i.target_designation.trim().toLowerCase() === facultyDesig &&
            i.target_designation.toUpperCase() !== 'ALL'
          );

          // 2. Fall back to 'ALL' common mapping
          if (!item) {
            item = (templateItems || []).find(i => 
              (i.criteria_code || '').toUpperCase() === code.toUpperCase() && 
              (!i.target_designation || i.target_designation.toUpperCase() === 'ALL')
            );
          }

          return {
            unitMark: item && item.fixed_mark_per_record !== undefined && item.fixed_mark_per_record !== null && item.fixed_mark_per_record !== '' ? parseFloat(item.fixed_mark_per_record) : defUnit,
            maxMarks: item && item.max_marks !== undefined && item.max_marks !== null && item.max_marks !== '' ? parseFloat(item.max_marks) : defMax,
            rule: item?.calculation_rule || 'fixed_per_record',
            targetDesignation: item?.target_designation || 'ALL'
          };
        };

        const c_a1 = getConstraint('A1', 5, 10);
        const c_a2 = getConstraint('A2', 5, 10);
        const c_a3 = getConstraint('A3', 5, 10);
        const c_a4 = getConstraint('A4', 5, 5);
        const c_a5 = getConstraint('A5', 10, 10);
        const c_a6 = getConstraint('A6', 5, 5);
        const c_a7 = getConstraint('A7', 10, 10);

        const c_b1 = getConstraint('B1', 3, 3);
        const c_b2 = getConstraint('B2', 2, 4);
        const c_b3 = getConstraint('B3', 2.5, 5);
        const c_b4 = getConstraint('B4', 5, 5);
        const c_b5 = getConstraint('B5', 4, 8);
        const c_b6 = getConstraint('B6', 5, 10);
        const c_b7 = getConstraint('B7', 5, 5);

        const c_c1 = getConstraint('C1', 10, 20);
        const c_c2 = getConstraint('C2', 5, 10);
        const c_c3 = getConstraint('C3', 5, 5);
        const c_c4 = getConstraint('C4', 10, 10);
        const c_c5 = getConstraint('C5', 10, 15);
        const c_c6 = getConstraint('C6', 5, 10);
        const c_c7 = getConstraint('C7', 2.5, 5);
        const c_c8 = getConstraint('C8', 5, 5);

        const c_d1 = getConstraint('D1', 10, 20);

        // Categorywise Dynamic Score Calculations for Part A, B, C, D
        const score_a1 = Math.min(c_a1.maxMarks, vA1.length * c_a1.unitMark);
        const score_a2 = Math.min(c_a2.maxMarks, vA2.length * c_a2.unitMark);
        const score_a3 = Math.min(c_a3.maxMarks, vA3.length * c_a3.unitMark);
        const score_a4 = Math.min(c_a4.maxMarks, vA4.length * c_a4.unitMark);
        const score_a5 = Math.min(c_a5.maxMarks, vA5.length * c_a5.unitMark);
        const score_a6 = Math.min(c_a6.maxMarks, vA6.length * c_a6.unitMark);
        const score_a7 = Math.min(c_a7.maxMarks, vA7.reduce((acc, r) => acc + (r.position === 'Participation' ? Math.min(5, c_a7.unitMark / 2) : c_a7.unitMark), 0));
        const subtotal_A = viewingAppraisal.part_a_score || Math.min(60, score_a1 + score_a2 + score_a3 + score_a4 + score_a5 + score_a6 + score_a7);

        const score_b1 = Math.min(c_b1.maxMarks, fpiDetails?.breakdown?.b1_memberships ?? ((fpiDetails?.members?.length || 0) * c_b1.unitMark));
        const score_b2 = Math.min(c_b2.maxMarks, fpiDetails?.breakdown?.b2_resource ?? ((fpiDetails?.resource?.length || 0) * c_b2.unitMark));
        const score_b3 = Math.min(c_b3.maxMarks, fpiDetails?.breakdown?.b3_interactions ?? ((fpiDetails?.interactions?.length || 0) * c_b3.unitMark));
        const score_b4 = Math.min(c_b4.maxMarks, vB4.length * c_b4.unitMark);
        const score_b5 = Math.min(c_b5.maxMarks, fpiDetails?.breakdown?.b5_events ?? ((fpiDetails?.events?.length || 0) * c_b5.unitMark));
        const score_b6 = Math.min(c_b6.maxMarks, fpiDetails?.breakdown?.b6_certs ?? ((fpiDetails?.certs?.length || 0) * c_b6.unitMark));
        const score_b7 = Math.min(c_b7.maxMarks, vB7.length * c_b7.unitMark);
        const subtotal_B = viewingAppraisal.part_b_score || Math.min(40, score_b1 + score_b2 + score_b3 + score_b4 + score_b5 + score_b6 + score_b7);

        const journalPubsList = (fpiDetails?.publications || []).filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
        const confPubsList = (fpiDetails?.publications || []).filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
        const bookPubsList = fpiDetails?.books || [];

        const score_c1 = Math.min(c_c1.maxMarks, fpiDetails?.breakdown?.c1_publications ?? (journalPubsList.length * c_c1.unitMark));
        const score_c2 = Math.min(c_c2.maxMarks, fpiDetails?.breakdown?.c2_books ?? ((confPubsList.length + bookPubsList.length) * c_c2.unitMark));
        const score_c3 = Math.min(c_c3.maxMarks, vC3.length * c_c3.unitMark);
        const score_c4 = Math.min(c_c4.maxMarks, fpiDetails?.breakdown?.c4_ipr ?? ((fpiDetails?.ipr?.length || 0) * c_c4.unitMark));
        const score_c5 = Math.min(c_c5.maxMarks, fpiDetails?.breakdown?.c5_funding ?? ((fpiDetails?.funding?.length || 0) * c_c5.unitMark));
        const score_c6 = Math.min(c_c6.maxMarks, fpiDetails?.breakdown?.c6_seed_money ?? ((fpiDetails?.seedMoney?.length || 0) * c_c6.unitMark));
        const isSupervisor = fpiDetails?.is_recognized_supervisor !== false;
        const score_c7 = !isSupervisor ? 'N/A' : Math.min(c_c7.maxMarks, fpiDetails?.breakdown?.c8_scholars ?? ((fpiDetails?.scholars?.length || 0) * c_c7.unitMark));
        const score_c8 = Math.min(c_c8.maxMarks, fpiDetails?.breakdown?.c9_awards ?? ((fpiDetails?.awards?.length || 0) * c_c8.unitMark));
        const subtotal_C = viewingAppraisal.part_c_score || Math.min(80, (score_c1 + score_c2 + score_c3 + score_c4 + score_c5 + score_c6 + (isSupervisor ? (typeof score_c7 === 'number' ? score_c7 : 0) : 0) + score_c8));

        const score_d1 = viewingAppraisal.part_d_score || Math.min(c_d1.maxMarks, fpiDetails?.breakdown?.d_responsibilities ?? ((fpiDetails?.responsibilities?.length || 0) * c_d1.unitMark));
        const subtotal_D = score_d1;

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

              {/* AUTOMAPPED PORTAL ACTIVITY DATA & PROOF DOCUMENTS VERIFICATION PANEL FOR HOD / PRINCIPAL / HR / ADMIN (HIDDEN IN PRINT) */}
              <div className="no-print" style={{ marginBottom: '24px' }}>
                <AutoMappedVerificationPanel details={fpiDetails} breakdown={fpiBreakdown} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a1. Innovative Teaching Methods & ICT Tools Integrated in Course Delivery (Max: 10 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a1} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Code & Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>ICT Tools Used</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA1.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No ICT tools logged</td></tr>
                        ) : vA1.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.ict_tool || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a1 Category Total Score: {score_a1} / 10 Pts
                    </div>
                  </div>

                  {/* a2 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a2. Development of SWAYAM MOOCs & Other E-Content (YouTube / LMS) (Max: 10 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a2} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Code & Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the e-content</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Platform</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date of launching</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Link</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA2.length === 0 ? (
                          <tr><td colSpan={8} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No e-content logged</td></tr>
                        ) : vA2.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.platform || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.launch_date || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.link ? <a href={r.link} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>View Link</a> : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a2 Category Total Score: {score_a2} / 10 Pts
                    </div>
                  </div>

                  {/* a3 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a3. New Laboratory Experiments Developed (Max: 10 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a3} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Code & Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the experiment</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA3.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No lab experiments logged</td></tr>
                        ) : vA3.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.experiment || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2.5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a3 Category Total Score: {score_a3} / 10 Pts
                    </div>
                  </div>

                  {/* a4 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a4. Student Mid Sem & End Sem Feedback Rating (Max: 5 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a4} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Code & Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Mid Sem Score</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>End Sem Score</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Average</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA4.length === 0 ? (
                          <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No feedback ratings logged</td></tr>
                        ) : vA4.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.mid_score || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.end_score || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>{r.avg_score || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{parseFloat(r.avg_score) >= 4.0 ? '5 Pts' : '3 Pts'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a4 Category Total Score: {score_a4} / 5 Pts
                    </div>
                  </div>

                  {/* a5 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a5. Success Rate in Theory Courses (End Semester Pass %) (Max: 10 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a5} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Class & Semester</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Course Code & Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Pass % (ODD Sem)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Pass % (EVEN Sem)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>Average</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA5.length === 0 ? (
                          <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No pass percentage logged</td></tr>
                        ) : vA5.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.class_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.odd_pass ? `${r.odd_pass}%` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{r.even_pass ? `${r.even_pass}%` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>{r.avg_pass ? `${r.avg_pass}%` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{parseFloat(r.avg_pass) >= 80 ? '10 Pts' : '5 Pts'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a5 Category Total Score: {score_a5} / 10 Pts
                    </div>
                  </div>

                  {/* a6 Table */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a6. Steps Taken for Enhancing Industry Institute Partnerships (Max: 5 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a6} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Courses/ Training</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Industry</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA6.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No industry partnerships logged</td></tr>
                        ) : vA6.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.name || r.course_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.industry || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.duration || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a6 Category Total Score: {score_a6} / 5 Pts
                    </div>
                  </div>

                  {/* a7 Table */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>a7. Support & Guidance for Student Hackathons / Codethons / Contests (Max: 10 Marks)</h5>
                      <span className="category-total-badge" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                        Category Total: {score_a7} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Competition</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Team Members</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the Project</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Position held</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vA7.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No hackathon guidance logged</td></tr>
                        ) : vA7.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.competition || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.team_members || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.project_title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.position || 'Prize Won'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{r.position === 'Participation' ? '5 Pts' : '10 Pts'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      a7 Category Total Score: {score_a7} / 10 Pts
                    </div>
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

                  {/* b1 Table (Auto-Mapped) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b1. Membership in Professional Societies at National/ International levels (Max: 3 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b1} / 3 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Membership in Professional Society</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Membership Number</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Life / Annual Membership</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.members || fpiDetails.members.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No professional society memberships logged for {viewingAppraisal?.academic_year || academicYear}</td></tr>
                        ) : fpiDetails.members.map((m, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.organization, m.societyname, m.society_name, m.society, m.name, m.title) || 'Professional Society Membership'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.membershipid, m.mem_id, m.membership_no, m.membership_id, m.member_id, m.id) || 'Active Member'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(m.membership_type, m.type) || 'Life Member'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>3 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b1 Category Total Score: {score_b1} / 3 Pts
                    </div>
                  </div>

                  {/* b2 Table (Auto-Mapped) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b2. Faculty as Resource person in External STTPs/ FDPs/ Workshops/ Conferences/ Guest Speaker/ BOS/ Reviewer (Max: 4 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b2} / 4 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Nature of work</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s) [DD/MM/YY]</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.resource || fpiDetails.resource.length === 0) ? (
                          <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No resource person activities logged for {viewingAppraisal?.academic_year || academicYear}</td></tr>
                        ) : fpiDetails.resource.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.title, r.eventname, r.event_title, r.event_name, r.programme_name, r.topic) || (r.organizer ? `${getVal(r.actedas, r.role) || 'Resource Person'} @ ${r.organizer}` : 'Guest Session / Resource Activity')}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.actedas, r.natureofwork, r.role, r.work_type) || 'Resource Person'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{getVal(r.organizer, r.orgby, r.org, r.conducting_body) || 'External Institution'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.eventdate || (r.from_date ? (r.to_date ? `${r.from_date} to ${r.to_date}` : r.from_date) : (getVal(r.date) || 'N/A'))}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b2 Category Total Score: {score_b2} / 4 Pts
                    </div>
                  </div>

                  {/* b3 Table (Auto-Mapped) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b3. Faculty member’s Participation in STTPs/ FDPs/ Malaviya Mission / Workshop / Seminar / Conferences (Max: 5 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b3} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>No. of days</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s) From - To</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.interactions || fpiDetails.interactions.length === 0) ? (
                          <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No FDP/workshop participation logged in portal</td></tr>
                        ) : fpiDetails.interactions.map((it, i) => {
                          let days = 1;
                          if (it.from_date && it.to_date) {
                            const d1 = new Date(it.from_date);
                            const d2 = new Date(it.to_date);
                            days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
                          }
                          return (
                            <tr key={i}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.type || 'FDP / Workshop'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.organizer || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{days}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{it.from_date ? (it.to_date ? `${it.from_date} to ${it.to_date}` : it.from_date) : (it.date || 'N/A')}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{days >= 5 ? '2.5 Pts' : '2 Pts'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b3 Category Total Score: {score_b3} / 5 Pts
                    </div>
                  </div>

                  {/* b4 Table (Manual) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b4. Contribution to Curriculum Development & Board of Studies (BoS) (Max: 5 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b4} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the course</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Academic year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Details of Contribution / BoS Role</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vB4.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No curriculum contributions logged</td></tr>
                        ) : vB4.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.course_name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.academic_year || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.details || r.activity || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b4 Category Total Score: {score_b4} / 5 Pts
                    </div>
                  </div>

                  {/* b5 Table (Auto-Mapped) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b5. Organized - FDP/ STTP/Conferences/Seminars/Skill development Programmes/Internship/Guest Lecture (Max: 8 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b5} / 8 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Convener/ Organizer /Coordinator</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Sponsored by</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>No. of days</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s) From - To</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.events || fpiDetails.events.length === 0) ? (
                          <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No organized events logged in portal</td></tr>
                        ) : fpiDetails.events.map((ev, i) => {
                          let days = 1;
                          if (ev.from_date && ev.to_date) {
                            const d1 = new Date(ev.from_date);
                            const d2 = new Date(ev.to_date);
                            days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
                          }
                          return (
                            <tr key={i}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.role || ev.organizer || 'Coordinator'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.sponsership || 'SREC'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{days}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ev.from_date ? (ev.to_date ? `${ev.from_date} to ${ev.to_date}` : ev.from_date) : (ev.date || 'N/A')}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>4 Pts</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b5 Category Total Score: {score_b5} / 8 Pts
                    </div>
                  </div>

                  {/* b6 Table (Auto-Mapped) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b6. Faculty certification through SWAYAM/ SWAYAM PLUS/ NPTEL/ COURSERA (Max: 10 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b6} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Certification Agency</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the Course</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration in weeks</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.certs || fpiDetails.certs.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No online certifications logged in portal</td></tr>
                        ) : fpiDetails.certs.map((c, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{c.organisation || 'NPTEL / SWAYAM'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{c.course_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{c.duration_weeks ? `${c.duration_weeks} Weeks` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{(c.duration_weeks || '').includes('4') ? '2.5 Pts' : '5 Pts'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b6 Category Total Score: {score_b6} / 10 Pts
                    </div>
                  </div>

                  {/* b7 Table (Manual) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>b7. Faculty Internship/ Training/ Collaboration with Industry/ MoUs (Max: 5 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_b7} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the Internship/ Training/ Collaboration</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of the company & Place</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vB7.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No faculty internships logged</td></tr>
                        ) : vB7.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.company || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.duration || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      b7 Category Total Score: {score_b7} / 5 Pts
                    </div>
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

                  {/* c1 Table (Auto-Mapped Journal Publications) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c1. Publication of Research Article in Journals (Scopus / WoS / SCI) (Max: 20 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c1} / 20 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1', width: '40px', textAlign: 'center' }}>S.No</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Author, Co-Author(s)</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Title of the paper</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Name of journal</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>ISSN No</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Month/Year</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Page No</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Vol</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Issue</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Indexed in</th>
                          <th style={{ padding: '6px', border: '1px solid #cbd5e1', width: '70px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const journalPubs = (fpiDetails?.publications || []).filter(p => !((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
                          if (journalPubs.length === 0) {
                            return <tr><td colSpan={11} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No journal publications logged in portal</td></tr>;
                          }
                          return journalPubs.map((p, i) => (
                            <tr key={i}>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{[p.staff_name, p.co_authors].filter(Boolean).join(', ') || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.title || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.journel || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.issn_no || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.month_pub || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.pp || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.volume_pub || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.issue_no || 'N/A'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0' }}>{p.index_pub || 'Scopus / WoS'}</td>
                              <td style={{ padding: '6px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c1 Category Total Score: {score_c1} / 20 Pts
                    </div>
                  </div>

                  {/* c2 Table (Auto-Mapped Conference Papers & Books) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c2. Publication in Conference Proceedings / Book / Book Chapters (Max: 10 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c2} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name of Author, Co-Author(s)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Category</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Paper / Book / Chapter</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Month & Year</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organizer / Publisher</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const confPubs = (fpiDetails?.publications || []).filter(p => ((p.type_pub || p.type1 || '').toLowerCase().includes('conf')));
                          const bookPubs = fpiDetails?.books || [];
                          const combined = [...confPubs.map(cp => ({ ...cp, isConf: true })), ...bookPubs.map(bp => ({ ...bp, isBook: true }))];
                          if (combined.length === 0) {
                            return <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No conference proceedings or books logged in portal</td></tr>;
                          }
                          return combined.map((item, i) => (
                            <tr key={i}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[item.staff_name, item.co_authors || item.coauthor].filter(Boolean).join(', ') || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.isConf ? 'Conference' : (item.type || 'Book / Chapter')}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.month_pub || item.dateofpublication || item.date || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{item.organizer || item.publisher || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c2 Category Total Score: {score_c2} / 10 Pts
                    </div>
                  </div>

                  {/* c3 Table (Manual) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c3. Organizing Community service / Outreach activities (Yoga / NSS / NCC / Rural Dev) (Max: 5 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c3} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Activity Name</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Type of Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Location</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date(s)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vC3.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No outreach activities logged</td></tr>
                        ) : vC3.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.activity_name || r.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.event_type || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.location || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{r.date || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c3 Category Total Score: {score_c3} / 5 Pts
                    </div>
                  </div>

                  {/* c4 Table (Auto-Mapped IPR / Patents) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c4. Intellectual Property- Published and Granted: Patents / Copy Rights (Max: 10 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c4} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Patents/Copyrights/ Trade Marks</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Filed/Published/ Granted</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.ipr || fpiDetails.ipr.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No patents or copyrights logged in portal</td></tr>
                        ) : fpiDetails.ipr.map((ip, i) => {
                          const st = (ip.patent_status || ip.generation || '').toLowerCase();
                          const pts = st.includes('grant') || st.includes('reg') ? '10 Pts' : st.includes('publ') ? '7 Pts' : '3 Pts';
                          return (
                            <tr key={i}>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.ip_type || ip.patent || 'Patent'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.propose || ip.title || 'N/A'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{ip.patent_status || ip.generation || 'Published'}</td>
                              <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{pts}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c4 Category Total Score: {score_c4} / 10 Pts
                    </div>
                  </div>

                  {/* c5 Table (Auto-Mapped Research & Event Grants) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c5. Grants Applied/Received from Government and Non-Government agencies (Max: 15 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c5} / 15 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Project / Event Category</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PI / Co-PI</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Project / Event</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Funding Agency</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Amount</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Applied / Sanctioned</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.funding || fpiDetails.funding.length === 0) ? (
                          <tr><td colSpan={8} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No research grants or event funding logged in portal</td></tr>
                        ) : fpiDetails.funding.map((fn, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.grant_category || 'Research Project'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.faculty_role || 'PI'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.fa || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.amount ? `₹ ${parseFloat(fn.amount).toLocaleString('en-IN')}` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{fn.status || 'Sanctioned'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c5 Category Total Score: {score_c5} / 15 Pts
                    </div>
                  </div>

                  {/* c6 Table (Auto-Mapped Seed Money & Consultancy) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c6. Funded Consultancy Projects & Internal Seed Money for Research (Max: 10 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c6} / 10 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Faculty Members Involved</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>PI / Co-PI</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of Project</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Duration / Dates</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Amount Sanctioned</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.seedMoney || fpiDetails.seedMoney.length === 0) ? (
                          <tr><td colSpan={7} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No seed money or consultancy logged in portal</td></tr>
                        ) : fpiDetails.seedMoney.map((sm, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.staff_name || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.faculty_role || 'PI'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.title || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.duration || sm.sanctioned_date || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sm.amount ? `₹ ${parseFloat(sm.amount).toLocaleString('en-IN')}` : 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c6 Category Total Score: {score_c6} / 10 Pts
                    </div>
                  </div>

                  {/* c7 Table (Auto-Mapped Ph.D Research Scholars) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                        c7. Guidance of Research Scholars (Ph.D Completed / Ongoing) (Max: 5 Marks)
                      </h5>
                      {fpiDetails?.is_recognized_supervisor === false ? (
                        <span className="badge" style={{ fontSize: '0.78rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', fontWeight: 800 }}>
                          Category Total: N/A (Not a Recognized Research Supervisor)
                        </span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                          Category Total: {score_c7} / 5 Pts
                        </span>
                      )}
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Supervisor Category</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Scholar Name & University</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Status (Ongoing / Completed)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fpiDetails?.is_recognized_supervisor === false ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: 600, background: '#f8fafc' }}>
                              N/A - Not a Recognized Research Supervisor (No score calculated)
                            </td>
                          </tr>
                        ) : (!fpiDetails?.scholars || fpiDetails.scholars.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No research scholars logged in portal</td></tr>
                        ) : fpiDetails.scholars.map((sc, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sc.supervisor_type || 'Supervisor'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[sc.staff_name, sc.university].filter(Boolean).join(' - ') || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{sc.status || 'Ongoing'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>2.5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: fpiDetails?.is_recognized_supervisor === false ? '#64748b' : '#0369a1' }}>
                      c7 Category Total Score: {fpiDetails?.is_recognized_supervisor === false ? 'N/A' : `${score_c7} / 5 Pts`}
                    </div>
                  </div>

                  {/* c8 Table (Auto-Mapped Awards & Recognitions) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>c8. Awards and Recognitions (Max: 5 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_c8} / 5 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Title of the award</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Organization details</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Date (DD/MM/YYYY)</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.awards || fpiDetails.awards.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No awards or recognitions logged in portal</td></tr>
                        ) : fpiDetails.awards.map((aw, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awardname || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awardby || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{aw.awa_date || aw.date || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>5 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      c8 Category Total Score: {score_c8} / 5 Pts
                    </div>
                  </div>
                </div>

                {/* 5. PART D: INSTITUTIONAL DEVELOPMENT & CONTRIBUTION */}
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '20px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      PART D: Additional Responsibilities (Max Score: 20 Marks)
                    </h4>
                    <span style={{ fontSize: '0.88rem', background: '#0284c7', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800 }}>
                      Part D Score: {viewingAppraisal.part_d_score || 0} / 20 Pts
                    </span>
                  </div>

                  {/* d1 Table (Auto-Mapped Additional Responsibilities) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', margin: 0 }}>d1. Additional Responsibilities (Institute & Department Level) (Max: 20 Marks)</h5>
                      <span className="badge badge-success" style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 800 }}>
                        Category Total: {score_d1} / 20 Pts
                      </span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '50px', textAlign: 'center' }}>S. No.</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Institute Level / Department Level</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Responsibilities</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Description</th>
                          <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '90px', textAlign: 'center' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!fpiDetails?.responsibilities || fpiDetails.responsibilities.length === 0) ? (
                          <tr><td colSpan={5} style={{ padding: '8px', textAlign: 'center', color: '#94a3b8' }}>No additional responsibilities logged in portal</td></tr>
                        ) : fpiDetails.responsibilities.map((resp, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{resp.level || 'Department Level'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{resp.responsibility || 'N/A'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{[resp.assigned_by, resp.academic_year].filter(Boolean).join(' | ') || 'Assigned Responsibility'}</td>
                            <td style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>10 Pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderTop: 'none', padding: '6px 14px', borderRadius: '0 0 6px 6px', fontSize: '0.82rem', fontWeight: 800, color: '#0369a1' }}>
                      d1 Category Total Score: {score_d1} / 20 Pts
                    </div>
                  </div>
                </div>

                {/* 6. GOALS NEXT YEAR */}
                {viewingAppraisal.goals_next_year && (
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Goals & Commitments for Next Academic Year</h4>
                    <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, whiteSpace: 'pre-wrap' }}>{viewingAppraisal.goals_next_year}</p>
                  </div>
                )}

                {/* 6b. CATEGORY-WISE SUB-TOTAL BREAKDOWN TABLE */}
                <div style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
                  <div style={{ background: '#f1f5f9', color: '#0f172a', padding: '12px 18px', fontWeight: 800, fontSize: '1rem', borderBottom: '1.5px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>CATEGORYWISE SUB-TOTAL SCORE BREAKDOWN (CRITERIA-WISE)</span>
                    <span style={{ fontSize: '0.85rem', color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                      Categorywise Sum: {subtotal_A + subtotal_B + subtotal_C + subtotal_D} / 200 Pts
                    </span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="table-container">
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '1.5px solid #cbd5e1' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '70px' }}>Code</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Evaluation Criteria Description</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '100px' }}>Max Marks</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '130px' }}>Category Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Part A Breakdown */}
                      <tr style={{ background: '#f0f9ff', fontWeight: 800, borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                        <td colSpan={2} style={{ padding: '8px 12px', color: '#0369a1' }}>PART A: Teaching Learning Process</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>60</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>{subtotal_A} / 60 Pts</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a1</td><td style={{ padding: '6px 12px' }}>Innovative Teaching Methods & ICT Tools</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a1} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a2</td><td style={{ padding: '6px 12px' }}>Development of SWAYAM MOOCs & E-Content</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a2} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a3</td><td style={{ padding: '6px 12px' }}>New Laboratory Experiments Developed</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a3} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a4</td><td style={{ padding: '6px 12px' }}>Student Mid & End Sem Feedback Rating</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a4} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a5</td><td style={{ padding: '6px 12px' }}>End Sem Theory Courses Pass Percentage</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a5} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a6</td><td style={{ padding: '6px 12px' }}>Industry Institute Partnerships Steps</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a6} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>a7</td><td style={{ padding: '6px 12px' }}>Hackathons / Contests Support & Guidance</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_a7} Pts</td></tr>

                      {/* Part B Breakdown */}
                      <tr style={{ background: '#f0f9ff', fontWeight: 800, borderTop: '1.5px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                        <td colSpan={2} style={{ padding: '8px 12px', color: '#0369a1' }}>PART B: Professional Development Activities</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>40</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>{subtotal_B} / 40 Pts</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b1</td><td style={{ padding: '6px 12px' }}>Professional Society Memberships</td><td style={{ textAlign: 'center' }}>3</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b1} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b2</td><td style={{ padding: '6px 12px' }}>Resource Person / Invited Guest Speaker</td><td style={{ textAlign: 'center' }}>4</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b2} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b3</td><td style={{ padding: '6px 12px' }}>FDP / STTP / Workshop Participation</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b3} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b4</td><td style={{ padding: '6px 12px' }}>Curriculum Development & Board of Studies (BOS)</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b4} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b5</td><td style={{ padding: '6px 12px' }}>Organizing FDPs / Conferences / Symposia</td><td style={{ textAlign: 'center' }}>8</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b5} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b6</td><td style={{ padding: '6px 12px' }}>Online Certifications (SWAYAM / NPTEL)</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b6} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>b7</td><td style={{ padding: '6px 12px' }}>Industrial Training / Corporate Internship Completed</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_b7} Pts</td></tr>

                      {/* Part C Breakdown */}
                      <tr style={{ background: '#f0f9ff', fontWeight: 800, borderTop: '1.5px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                        <td colSpan={2} style={{ padding: '8px 12px', color: '#0369a1' }}>PART C: Research & Consultancy Output</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>80</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>{subtotal_C} / 80 Pts</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c1</td><td style={{ padding: '6px 12px' }}>Publication of Research Article in Journals (Scopus / WoS / SCI)</td><td style={{ textAlign: 'center' }}>20</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c1} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c2</td><td style={{ padding: '6px 12px' }}>Publication in Conference Proceedings / Book / Book Chapters</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c2} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c3</td><td style={{ padding: '6px 12px' }}>Consultancy & Product Development</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c3} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c4</td><td style={{ padding: '6px 12px' }}>IPR / Patents Granted / Published</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c4} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c5</td><td style={{ padding: '6px 12px' }}>Research Grants Received / Applied</td><td style={{ textAlign: 'center' }}>15</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c5} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c6</td><td style={{ padding: '6px 12px' }}>Seed Money & Consultancy Output</td><td style={{ textAlign: 'center' }}>10</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c6} Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c7</td><td style={{ padding: '6px 12px' }}>Ph.D Research Scholars Guidance</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: score_c7 === 'N/A' ? '#64748b' : '#0284c7' }}>{score_c7 === 'N/A' ? 'N/A' : `${score_c7} Pts`}</td></tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>c8</td><td style={{ padding: '6px 12px' }}>Awards & Recognitions</td><td style={{ textAlign: 'center' }}>5</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_c8} Pts</td></tr>

                      {/* Part D Breakdown */}
                      <tr style={{ background: '#f0f9ff', fontWeight: 800, borderTop: '1.5px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                        <td colSpan={2} style={{ padding: '8px 12px', color: '#0369a1' }}>PART D: Institutional Development & Contribution</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>20</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0369a1' }}>{subtotal_D} / 20 Pts</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}><td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>d1</td><td style={{ padding: '6px 12px' }}>Dept & Institutional Responsibilities</td><td style={{ textAlign: 'center' }}>20</td><td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{score_d1} Pts</td></tr>
                    </tbody>
                  </table>
                </div>

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
                        <td style={{ padding: '12px 14px', textAlign: 'center', color: '#15803d', fontSize: '1.1rem' }}>{getHodTotalScore(viewingAppraisal) !== null ? `${getHodTotalScore(viewingAppraisal)}` : '-'}</td>
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

                const SigBlock = ({ label, name, signedAt, signedName, signedIp, canSign, onSign }) => (
                  <div style={{ textAlign: 'center', width: '30%' }}>
                    <div style={{ height: signedAt ? '0' : '45px' }}></div>
                    {signedAt ? (
                      <div style={{ background: '#f0fdf4', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '10px 8px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.82rem' }}>
                          <span style={{ fontSize: '1rem' }}>✓</span> Digitally Signed
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>{signedName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{fmtDate(signedAt)}</div>
                        {signedIp && (
                          <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '2px', fontWeight: 700 }}>
                            IP: {signedIp}
                          </div>
                        )}
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
                      signedIp={viewingAppraisal.faculty_signed_ip}
                      canSign={isFaculty}
                      onSign={() => viewingAppraisal.isDraft ? handleSaveAndSign() : handleSign(viewingAppraisal.id, 'faculty')}
                    />
                    <SigBlock
                      label="Signature of Head of Department"
                      name={hodDisplayName}
                      signedAt={hSigned}
                      signedName={viewingAppraisal.hod_signed_name}
                      signedIp={viewingAppraisal.hod_signed_ip}
                      canSign={isHodOrAdmin}
                      onSign={() => handleSign(viewingAppraisal.id, 'hod')}
                    />
                    <SigBlock
                      label="Signature of Principal"
                      name={principalDisplayName || 'Principal'}
                      signedAt={pSigned}
                      signedName={viewingAppraisal.principal_signed_name}
                      signedIp={viewingAppraisal.principal_signed_ip}
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

      {/* RULE & THRESHOLD BRACKET CONFIGURATION MODAL */}
      {ruleModalItem && (() => {
        const { index, item } = ruleModalItem;
        let configObj = {};
        try {
          if (typeof item.bracket_config === 'object' && item.bracket_config !== null) {
            configObj = { ...item.bracket_config };
          } else if (typeof item.bracket_config === 'string' && item.bracket_config.trim() !== '') {
            configObj = JSON.parse(item.bracket_config);
          }
        } catch (e) {
          configObj = {};
        }

        const ruleType = item.calculation_rule || 'fixed_per_record';

        const updateConfigField = (key, val) => {
          const num = parseFloat(val);
          const newCfg = { ...configObj, [key]: isNaN(num) ? val : num };
          setRuleModalItem({
            ...ruleModalItem,
            item: {
              ...item,
              bracket_config: newCfg
            }
          });
        };

        const handleSaveRuleModal = () => {
          handleTemplateItemChange(index, 'bracket_config', item.bracket_config);
          setRuleModalItem(null);
        };

        return (
          <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '550px', width: '100%', padding: '24px', border: '1.5px solid #cbd5e1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} color="#0284c7" /> Configure Threshold & Rule Bracket ({item.criteria_code})
                </h3>
                <button type="button" onClick={() => setRuleModalItem(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Criteria: {item.criteria_title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  Rule Strategy: <strong style={{ color: '#0369a1' }}>{ruleType}</strong>
                </div>
              </div>

              {/* RULE SPECIFIC EDITORS */}
              {ruleType === 'bracket_rating' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                      Cutoff Threshold Rating / Benchmark Value:
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={configObj.rating_threshold ?? configObj.pass_threshold ?? 4.0}
                      onChange={(e) => {
                        updateConfigField('rating_threshold', e.target.value);
                        updateConfigField('pass_threshold', e.target.value);
                      }}
                      placeholder="e.g. 4.0 or 80"
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Benchmark value for evaluating high vs low mark tier.</small>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '4px' }}>
                        High Tier Score (Above / At Threshold):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control"
                        value={configObj.high_score ?? configObj.prize_score ?? 5}
                        onChange={(e) => {
                          updateConfigField('high_score', e.target.value);
                          updateConfigField('prize_score', e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', display: 'block', marginBottom: '4px' }}>
                        Low Tier Score (Below Threshold):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control"
                        value={configObj.low_score ?? configObj.participation_score ?? 3}
                        onChange={(e) => {
                          updateConfigField('low_score', e.target.value);
                          updateConfigField('participation_score', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {ruleType === 'pub_type_split' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', display: 'block', marginBottom: '4px' }}>
                      Journal Publication Mark (SCI / Scopus / WoS):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.journal_score ?? 10}
                      onChange={(e) => updateConfigField('journal_score', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Conference Paper Mark:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.conf_score ?? 5}
                      onChange={(e) => updateConfigField('conf_score', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {ruleType === 'patent_status_split' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '4px' }}>
                      Patent Granted / Registered Score:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.granted_score ?? 10}
                      onChange={(e) => updateConfigField('granted_score', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', display: 'block', marginBottom: '4px' }}>
                      Patent Published Score:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.published_score ?? 7}
                      onChange={(e) => updateConfigField('published_score', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', display: 'block', marginBottom: '4px' }}>
                      Patent Filed Score:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.filed_score ?? 3}
                      onChange={(e) => updateConfigField('filed_score', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {ruleType === 'phd_supervisor_gated' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1', display: 'block', marginBottom: '4px' }}>
                      Mark Awarded per Registered Ph.D Scholar:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      value={configObj.scholar_unit_score ?? 2.5}
                      onChange={(e) => updateConfigField('scholar_unit_score', e.target.value)}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0284c7', background: '#e0f2fe', padding: '8px 12px', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
                    Note: For faculty who are not Recognized Research Supervisors, score automatically calculates and displays as <strong>N/A (0 Marks)</strong>.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  onClick={() => setRuleModalItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '6px 18px', fontWeight: 800 }}
                  onClick={handleSaveRuleModal}
                >
                  Save Bracket Config
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ADD NEW PART / SECTION MODAL */}
      {showAddPartModal && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1150, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '600px', width: '100%', padding: '24px', border: '1.5px solid #cbd5e1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="#0284c7" /> Create New Appraisal PART / Section
              </h3>
              <button type="button" onClick={() => setShowAddPartModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateNewPart} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>
                    Section Code:
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newPartForm.section_code}
                    onChange={(e) => setNewPartForm({ ...newPartForm, section_code: e.target.value })}
                    placeholder="e.g. PART_E"
                    style={{ fontSize: '0.85rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>
                    Full Section Title:
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newPartForm.section_title}
                    onChange={(e) => setNewPartForm({ ...newPartForm, section_title: e.target.value })}
                    placeholder="e.g. PART E: Innovation & Startups (Max: 20 Marks)"
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0369a1' }}>
                  Initial Evaluation Criteria Item setup:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '3px', display: 'block' }}>
                      Criteria Code:
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newPartForm.criteria_code}
                      onChange={(e) => setNewPartForm({ ...newPartForm, criteria_code: e.target.value })}
                      placeholder="e.g. E1"
                      style={{ fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '3px', display: 'block' }}>
                      Criteria Title:
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={newPartForm.criteria_title}
                      onChange={(e) => setNewPartForm({ ...newPartForm, criteria_title: e.target.value })}
                      placeholder="e.g. Incubation & Startup Mentoring"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '3px', display: 'block' }}>
                    Rubrics & Evaluation Description:
                  </label>
                  <textarea
                    rows="2"
                    className="form-control"
                    value={newPartForm.rubric_description}
                    onChange={(e) => setNewPartForm({ ...newPartForm, rubric_description: e.target.value })}
                    placeholder="Enter rubrics description..."
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', marginBottom: '3px', display: 'block' }}>
                      Fixed Mark / Record:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-control"
                      value={newPartForm.fixed_mark_per_record}
                      onChange={(e) => setNewPartForm({ ...newPartForm, fixed_mark_per_record: e.target.value })}
                      style={{ fontSize: '0.85rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '3px', display: 'block' }}>
                      Criteria Max Marks:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-control"
                      value={newPartForm.max_marks}
                      onChange={(e) => setNewPartForm({ ...newPartForm, max_marks: e.target.value })}
                      style={{ fontSize: '0.85rem', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  onClick={() => setShowAddPartModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '6px 18px', fontWeight: 800 }}
                >
                  Create New PART
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE FORM BUILDER PREVIEW MODAL */}
      {showLivePreviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={20} color="#15803d" /> Live Faculty FPI Form Preview
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  This is how the configured appraisal form appears to faculty members during appraisal submission.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreviewModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {distinctSections.map(sectionCode => {
                const currentTitle = getSectionTitle(sectionCode);
                const sectionItems = templateItems.filter(i => i.section_code === sectionCode);
                return (
                  <div key={sectionCode} style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '12px' }}>
                      {currentTitle}
                    </h4>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Code</th>
                            <th style={{ width: '220px' }}>Criteria Title</th>
                            <th>Rubrics & Guidelines</th>
                            <th style={{ width: '120px' }}>Type</th>
                            <th style={{ width: '90px' }}>Max Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionItems.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 800, color: '#0369a1' }}>{item.criteria_code}</td>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.criteria_title}</td>
                              <td style={{ fontSize: '0.82rem', color: '#475569' }}>{item.rubric_description}</td>
                              <td>
                                <span style={{
                                  padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800,
                                  background: item.mapping_type === 'auto' ? '#ecfdf5' : '#fffbe6',
                                  color: item.mapping_type === 'auto' ? '#047857' : '#d97706',
                                  border: item.mapping_type === 'auto' ? '1px solid #a7f3d0' : '1px solid #fef08a'
                                }}>
                                  {item.mapping_type === 'auto' ? '⚡ Auto Portal' : '✍️ Manual Entry'}
                                </span>
                              </td>
                              <td style={{ fontWeight: 800, color: '#15803d', textAlign: 'center' }}>{item.max_marks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowLivePreviewModal(false)}
                style={{ padding: '8px 20px', fontWeight: 800 }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
