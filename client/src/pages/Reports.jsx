import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useCallback } from 'react';
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
  X
} from 'lucide-react';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar.jsx';
import { showSuccess, showError, showInfo } from '../context/AlertContext.jsx';
import { 
  exportNbaB2FacultyDetails, 
  exportNbaB2FacultyDetailsPdf, 
  exportNaacCriterion3Pdf, 
  exportNbaCriterion5Pdf,
  exportNbaTier1SarExcel,
  exportNbaTier1SarPdf,
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

// --- NBA CRITERION 5 VISUALIZATION COMPONENTS ---

function NbaFqChart({ qualificationTable = [], averageFq = 0 }) {
  if (!qualificationTable || qualificationTable.length === 0) return null;
  const maxFaculty = Math.max(...qualificationTable.map(q => Math.max(q.F || 0, (q.X || 0) + (q.Y || 0), 10)), 15);

  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📈 3-Year Faculty Qualification & FQ Score Progression
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ph.D. Faculty (X) vs PG Faculty (Y) vs Total Regular Faculty (F)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7', display: 'inline-block' }} /> Ph.D. Faculty (X)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#94a3b8', display: 'inline-block' }} /> PG Faculty (Y)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0f172a' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#e2e8f0', border: '1px solid #cbd5e1', display: 'inline-block' }} /> Total (F)
          </span>
        </div>
      </div>

      {/* 3-Year Grouped Column Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'flex-end', paddingTop: '6px' }}>
        {qualificationTable.map((q) => {
          const phdPct = q.F > 0 ? Math.round((q.X / q.F) * 100) : 0;
          const pgPct = 100 - phdPct;
          const heightPhd = Math.max(14, ((q.X || 0) / maxFaculty) * 130);
          const heightPg = Math.max(14, ((q.Y || 0) / maxFaculty) * 130);
          const heightTotal = Math.max(14, ((q.F || 0) / maxFaculty) * 130);

          return (
            <div key={q.yearKey} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{q.yearLabel}</span>
                <span style={{ background: '#e0f2fe', color: '#0284c7', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  FQ: {q.fqScore.toFixed(2)} / 20
                </span>
              </div>

              {/* Visual Bars Container */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', height: '140px', paddingBottom: '8px', borderBottom: '1.5px dashed #cbd5e1' }}>
                {/* Ph.D. Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '42px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>{q.X}</span>
                  <div style={{ width: '100%', height: `${heightPhd}px`, background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', borderRadius: '6px 6px 2px 2px', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', marginTop: '4px' }}>Ph.D.</span>
                </div>

                {/* PG Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '42px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>{q.Y}</span>
                  <div style={{ width: '100%', height: `${heightPg}px`, background: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '6px 6px 2px 2px' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginTop: '4px' }}>PG</span>
                </div>

                {/* Total Regular Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '42px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{q.F}</span>
                  <div style={{ width: '100%', height: `${heightTotal}px`, background: 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)', borderRadius: '6px 6px 2px 2px' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>Total (F)</span>
                </div>
              </div>

              {/* Qualification Ratio Bar */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  <span>Ph.D. Mix: <strong style={{ color: '#0284c7' }}>{phdPct}%</strong></span>
                  <span>PG Mix: <strong style={{ color: '#475569' }}>{pgPct}%</strong></span>
                </div>
                <div style={{ width: '100%', height: '7px', background: '#cbd5e1', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${phdPct}%`, background: '#0284c7' }} />
                  <div style={{ width: `${pgPct}%`, background: '#94a3b8' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NbaRetentionChart({ retention = {} }) {
  const rate = retention.retentionRate ?? 100;
  const marks = retention.retentionMarks ?? 25;
  const nBase = retention.nBase ?? 0;
  const nCAYm1 = retention.nRetainedCAYm1 ?? 0;
  const nCAY = retention.nRetainedCAY ?? 0;

  const pctCAYm1 = nBase > 0 ? Math.round((nCAYm1 / nBase) * 100) : 100;
  const pctCAY = nBase > 0 ? Math.round((nCAY / nBase) * 100) : 100;

  // Gauge color based on rubric
  let gaugeColor = '#16a34a';
  let rubricText = '>= 90% (Full 25 Marks)';
  if (rate < 50) { gaugeColor = '#ef4444'; rubricText = '< 50% (0 Marks)'; }
  else if (rate < 60) { gaugeColor = '#f97316'; rubricText = '50 - 59% (10 Marks)'; }
  else if (rate < 75) { gaugeColor = '#eab308'; rubricText = '60 - 74% (15 Marks)'; }
  else if (rate < 90) { gaugeColor = '#10b981'; rubricText = '75 - 89% (20 Marks)'; }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
      {/* 1. Retention Survival Funnel Flow */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔄 Faculty Cohort Survival Funnel (Base Year to CAY)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Step 1: Base Year */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              <span>1. Base Year Cohort ({retention.baseYear || 'CAYm2'})</span>
              <span style={{ color: '#0f172a' }}>{nBase} Faculty (100%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Step 2: CAYm1 */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
              <span>2. Retained in Year 1 (CAYm1)</span>
              <span style={{ color: '#0284c7' }}>{nCAYm1} Faculty ({pctCAYm1}%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, pctCAYm1)}%`, height: '100%', background: '#0284c7', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Step 3: CAY */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: '4px' }}>
              <span style={{ color: '#166534' }}>3. Retained in Year 2 (CAY)</span>
              <span style={{ color: '#16a34a' }}>{nCAY} Faculty ({pctCAY}%)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, pctCAY)}%`, height: '100%', background: '#16a34a', borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Retention Rate & Score Radial Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
          NBA Retention Score Awarded
        </span>
        <div style={{ position: 'relative', width: '160px', height: '90px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 55" style={{ width: '160px', height: '90px' }}>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="126"
              strokeDashoffset={126 - (126 * Math.min(100, Math.max(0, rate))) / 100}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', bottom: '2px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: gaugeColor }}>{rate}%</span>
          </div>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <span style={{ background: gaugeColor, color: '#ffffff', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem' }}>
            {marks} / 25 Marks Awarded
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
            Rubric: {rubricText}
          </div>
        </div>
      </div>
    </div>
  );
}

function NbaCadreChart({ qualificationTable = [] }) {
  if (!qualificationTable || qualificationTable.length === 0) return null;

  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏛️ Cadre Distribution: Actual Available vs AICTE Required (1:2:6 Ratio)
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Professors (1/9) : Associate Professors (2/9) : Assistant Professors (6/9)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#7c3aed' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#7c3aed', display: 'inline-block' }} /> Actual Cadre (AF)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a855f7' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#e9d5ff', border: '1px solid #c084fc', display: 'inline-block' }} /> Required Cadre (RF)
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {qualificationTable.map((q) => {
          const c = q.cadre || {};
          const maxVal = Math.max(c.profCount || 0, c.rfProf || 0, c.assocCount || 0, c.rfAssoc || 0, c.asstCount || 0, c.rfAsst || 0, 10);

          return (
            <div key={q.yearKey} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#581c87' }}>{q.yearLabel}</span>
                <span style={{ background: '#f3e8ff', color: '#7c3aed', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  Cadre Score: {c.cadreMarks?.toFixed(2) || '0.00'} / 20
                </span>
              </div>

              {/* Grouped Comparison Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Professors */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#6b21a8', marginBottom: '3px' }}>
                    <span>Professors (AF1 / RF1):</span>
                    <span><strong>{c.profCount || 0}</strong> actual / {c.rfProf || 0} req</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e9d5ff', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${Math.min(100, ((c.profCount || 0) / maxVal) * 100)}%`, background: '#7c3aed', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Associate Professors */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#4338ca', marginBottom: '3px' }}>
                    <span>Assoc. Professors (AF2 / RF2):</span>
                    <span><strong>{c.assocCount || 0}</strong> actual / {c.rfAssoc || 0} req</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#c7d2fe', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${Math.min(100, ((c.assocCount || 0) / maxVal) * 100)}%`, background: '#4f46e5', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Assistant Professors */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, color: '#0369a1', marginBottom: '3px' }}>
                    <span>Asst. Professors (AF3 / RF3):</span>
                    <span><strong>{c.asstCount || 0}</strong> actual / {c.rfAsst || 0} req</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#bae6fd', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${Math.min(100, ((c.asstCount || 0) / maxVal) * 100)}%`, background: '#0284c7', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  // NBA Tier-1 SAR & Criterion 5 Evaluation Suite State
  const [showNbaTier1Modal, setShowNbaTier1Modal] = useState(false);
  const [nbaTier1Data, setNbaTier1Data] = useState(null);
  const [loadingNbaTier1, setLoadingNbaTier1] = useState(false);
  const [nbaAssessmentYear, setNbaAssessmentYear] = useState('2026-2027');
  const [nbaSfrRatio, setNbaSfrRatio] = useState(15);
  const [nbaActiveTab, setNbaActiveTab] = useState('overview');

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
      showError('Error exporting NAAC Criterion 3: ' + e.message);
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
      showError('Error exporting NBA Criterion 5: ' + e.message);
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
      showError('Error exporting NBA Form B2: ' + e.message);
    } finally {
      setExportingAccreditation(false);
    }
  };

  const fetchNbaTier1Analytics = async (overrideYear = nbaAssessmentYear, overrideSfr = nbaSfrRatio) => {
    try {
      setLoadingNbaTier1(true);
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : accreditationDept;
      const qDept = targetDept ? `department=${encodeURIComponent(targetDept)}&` : '';
      const q = `?${qDept}academicYear=${encodeURIComponent(overrideYear)}&sfrRatio=${overrideSfr}`;

      const res = await fetch(`${API_BASE_URL}/api/admin/accreditation/nba-tier1-analytics${q}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to compute NBA Tier-1 analytics');
      const data = await res.json();
      setNbaTier1Data(data);
    } catch (e) {
      showError('Error loading NBA Tier-1 data: ' + e.message);
    } finally {
      setLoadingNbaTier1(false);
    }
  };

  const handleOpenNbaTier1Modal = () => {
    setShowNbaTier1Modal(true);
    fetchNbaTier1Analytics(nbaAssessmentYear, nbaSfrRatio);
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

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <Navbar 
        title="Comprehensive Performance Reports & Dossier Suite" 
        subtitle="Generate Institution, Department, and Faculty dossiers with full export capabilities" 
        auth={auth} 
      />

      {/* ACCREDITATION SUITE BAR (NAAC & NBA) */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, hsla(217, 91%, 60%, 0.08) 0%, hsla(142, 76%, 36%, 0.08) 100%)', border: '1px solid hsla(217, 91%, 60%, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'hsl(var(--text-main))' }}>
              <ShieldCheck size={20} color="#0284c7" />
              Accreditation Compliance Exporters (NAAC & NBA Suite)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', margin: '4px 0 0 0' }}>
              Instant one-click official tables formatted strictly per NAAC Criterion 3 & NBA Tier-1 Criterion 5 SAR guidelines.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {auth.role === 'admin' && (
              <select
                className="form-control"
                style={{ minWidth: '180px', fontWeight: 700, padding: '8px 12px' }}
                value={accreditationDept}
                onChange={(e) => setAccreditationDept(e.target.value)}
              >
                <option value="">Institution (All Depts)</option>
                {departments.map(d => (
                  <option key={d.id || d.name} value={d.name}>{d.name} ({d.acronym})</option>
                ))}
              </select>
            )}

            {/* NAAC Criterion 3 Suite */}
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleExportNAAC('excel')}
                disabled={exportingAccreditation}
                style={{ fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Export NAAC Criterion 3 (Research, Seed Money, Patents) Excel Sheet"
              >
                <FileSpreadsheet size={16} color="#16a34a" />
                NAAC Crit 3 (Excel)
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => handleExportNAAC('pdf')}
                disabled={exportingAccreditation}
                style={{ fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Export NAAC Criterion 3 (Research, Seed Money, Patents) Official PDF Dossier"
              >
                <FileText size={16} color="#dc2626" />
                NAAC Crit 3 (PDF)
              </button>
            </div>

            {/* Comprehensive NBA Tier-1 SAR Suite (includes Crit 5.3, 5.6, 5.2, Form B2 and 5.1-5.5) */}
            <button
              className="btn btn-primary"
              onClick={handleOpenNbaTier1Modal}
              style={{
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                boxShadow: '0 4px 12px hsla(var(--primary), 0.3)'
              }}
              title="Open NBA Tier-1 SAR Evaluation Suite: Faculty Qualification (5.3), Faculty Retention (5.6), Cadre (5.2), and Form B2"
            >
              <ShieldCheck size={18} />
              NBA Tier-1 SAR Suite (Crit 5.3, 5.6 & B2)
            </button>
          </div>
        </div>
      </div>

      {/* NBA TIER-1 SAR EVALUATION & CRITERION 5 SUITE MODAL */}
      {showNbaTier1Modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '1240px', width: '96vw', height: '92vh', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ flexShrink: 0, padding: '16px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#38bdf8" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    NBA Tier-1 SAR Evaluation Suite (Criterion 5)
                  </h3>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Department: <strong style={{ color: '#38bdf8' }}>{nbaTier1Data?.department || (auth.role === 'dept_admin' ? (auth.department || auth.dept) : (accreditationDept || 'Institution'))}</strong> | Target AY: <strong style={{ color: '#38bdf8' }}>{nbaAssessmentYear}</strong>
                </p>
              </div>

              {/* Assessment Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>AY:</span>
                  <select
                    className="form-control"
                    value={nbaAssessmentYear}
                    onChange={(e) => {
                      setNbaAssessmentYear(e.target.value);
                      fetchNbaTier1Analytics(e.target.value, nbaSfrRatio);
                    }}
                    style={{ background: '#334155', color: '#fff', borderColor: '#475569', fontSize: '0.8rem', padding: '5px 10px', borderRadius: '6px', fontWeight: 700 }}
                  >
                    <option value="2026-2027">2026-2027 (CAY)</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>SFR:</span>
                  <select
                    className="form-control"
                    value={nbaSfrRatio}
                    onChange={(e) => {
                      setNbaSfrRatio(Number(e.target.value));
                      fetchNbaTier1Analytics(nbaAssessmentYear, Number(e.target.value));
                    }}
                    style={{ background: '#334155', color: '#fff', borderColor: '#475569', fontSize: '0.8rem', padding: '5px 10px', borderRadius: '6px', fontWeight: 700 }}
                  >
                    <option value={15}>1 : 15 (Tier-1 UG Standard)</option>
                    <option value={20}>1 : 20 (AICTE Standard)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNbaTier1Modal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>5.3 Faculty Qualification (FQ)</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0284c7' }}>{nbaTier1Data?.averageFq ?? '--'}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>/ 20.00 Marks (3-Yr Avg)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '2px' }}>FQ = 2.5 * [(10X + 4Y) / F]</div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>5.6 Faculty Retention</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16a34a' }}>{nbaTier1Data?.retention?.retentionRate != null ? `${nbaTier1Data.retention.retentionRate}%` : '--'}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>({nbaTier1Data?.retention?.retentionMarks ?? 0} / 25 Marks)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px' }}>Base Year: {nbaTier1Data?.retention?.baseYear || 'CAYm2'}</div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>5.2 Cadre Proportion</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#7c3aed' }}>
                    {nbaTier1Data?.qualificationTable?.[0]?.cadre?.cadreMarks != null ? `${nbaTier1Data.qualificationTable[0].cadre.cadreMarks}` : '--'}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>/ 20.00 Marks (1:2:6 Ratio)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '2px' }}>Prof : Assoc : Asst Prof</div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Department Faculty</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a' }}>{nbaTier1Data?.facultyList?.length || 0}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Members</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>Form B2 Roster Verified</div>
              </div>
            </div>

            {/* Tab Navigation - Pill Style with Flex Wrap and Clear Visibility */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '8px', padding: '10px 24px', background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'overview', label: '📊 SAR Overview' },
                { id: 'fq', label: '🎓 5.3 Faculty Qualification (FQ)' },
                { id: 'retention', label: '🔄 5.6 Faculty Retention' },
                { id: 'cadre', label: '🏛️ 5.2 Cadre Proportion' },
                { id: 'b2', label: '📋 Form B2: Faculty Details Roster' },
                { id: 'activities', label: '⚡ 5.1-5.5 Contributions & Activities' }
              ].map(tab => {
                const isActive = nbaActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setNbaActiveTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#ffffff' : '#334155',
                      background: isActive ? '#0284c7' : '#ffffff',
                      border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.3)' : '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      lineHeight: '1.3',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Area */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

              {loadingNbaTier1 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Calculating NBA Tier-1 Metrics...</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Evaluating qualifications, retention survival and cadre balance across CAY, CAYm1 and CAYm2.</div>
                </div>
              ) : !nbaTier1Data ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444' }}>
                  Failed to load NBA data. Please try again.
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {nbaActiveTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '16px 20px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#0369a1', fontWeight: 800 }}>
                          NBA Tier-1 Criteria 5 Summary & Evaluation Dossier
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.5' }}>
                          This suite dynamically parses institutional academic records for <strong>{nbaTier1Data.department}</strong> and executes exact mathematical formulas mandated by the <strong>NBA Tier-1 Self Assessment Report (SAR)</strong> for Autonomous & Tier-1 Engineering Institutions.
                        </p>
                      </div>

                      {/* Visual Interactive Graphs for Criteria 5.3, 5.6 & 5.2 */}
                      <NbaFqChart qualificationTable={nbaTier1Data.qualificationTable} averageFq={nbaTier1Data.averageFq} />
                      <NbaRetentionChart retention={nbaTier1Data.retention} />
                      <NbaCadreChart qualificationTable={nbaTier1Data.qualificationTable} />

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
                        {/* Summary Table 5.3 */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ padding: '10px 16px', background: '#f8fafc', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                            Criterion 5.3: Faculty Qualification (FQ) [Max: 20 Marks]
                          </div>
                          <table style={{ width: '100%', fontSize: '0.84rem' }}>
                            <thead style={{ background: '#f1f5f9' }}>
                              <tr>
                                <th>Year</th>
                                <th>X (Ph.D.)</th>
                                <th>Y (PG)</th>
                                <th>F (Regular)</th>
                                <th>FQ Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(nbaTier1Data.qualificationTable || []).map(q => (
                                <tr key={q.yearKey}>
                                  <td style={{ fontWeight: 700 }}>{q.yearLabel}</td>
                                  <td>{q.X}</td>
                                  <td>{q.Y}</td>
                                  <td>{q.F}</td>
                                  <td style={{ fontWeight: 800, color: '#0284c7' }}>{q.fqScore.toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                                <td colSpan={4} style={{ textAlign: 'right' }}>3-Year Average FQ Score:</td>
                                <td style={{ color: '#0284c7', fontSize: '0.95rem' }}>{nbaTier1Data.averageFq.toFixed(2)} / 20.00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Summary Table 5.6 */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ padding: '10px 16px', background: '#f8fafc', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                            Criterion 5.6: Faculty Retention [Max: 25 Marks]
                          </div>
                          <table style={{ width: '100%', fontSize: '0.84rem' }}>
                            <tbody>
                              <tr>
                                <td style={{ fontWeight: 600, width: '60%' }}>Base Academic Year (CAYm2):</td>
                                <td style={{ fontWeight: 700 }}>{nbaTier1Data.retention?.baseYear}</td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 600 }}>Faculty Members in Base Year:</td>
                                <td style={{ fontWeight: 700 }}>{nbaTier1Data.retention?.nBase}</td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 600 }}>Faculty Retained in CAYm1:</td>
                                <td style={{ fontWeight: 700 }}>{nbaTier1Data.retention?.nRetainedCAYm1}</td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 600 }}>Faculty Retained in CAY:</td>
                                <td style={{ fontWeight: 700 }}>{nbaTier1Data.retention?.nRetainedCAY}</td>
                              </tr>
                              <tr style={{ background: '#f0fdf4' }}>
                                <td style={{ fontWeight: 800, color: '#16a34a' }}>Retention Rate (%):</td>
                                <td style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>{nbaTier1Data.retention?.retentionRate}%</td>
                              </tr>
                              <tr style={{ background: '#f0fdf4' }}>
                                <td style={{ fontWeight: 800, color: '#15803d' }}>NBA Score Awarded:</td>
                                <td style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>{nbaTier1Data.retention?.retentionMarks} / 25 Marks</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CRITERION 5.3 FACULTY QUALIFICATION */}
                  {nbaActiveTab === 'fq' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                          Criterion 5.3 Faculty Qualification Calculation Details
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                          Formula: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>FQ = 2.5 * [(10X + 4Y) / F]</code> (Maximum 20 Marks). Faculty with Ph.D. are counted in <strong>X</strong> and with Post-Graduate degree (M.E./M.Tech) in <strong>Y</strong>.
                        </div>
                      </div>

                      {/* Visual 5.3 Progression & Mix Chart */}
                      <NbaFqChart qualificationTable={nbaTier1Data.qualificationTable} averageFq={nbaTier1Data.averageFq} />

                      <div className="table-container">
                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Assessment Year</th>
                              <th>X (Ph.D. Faculty)</th>
                              <th>Y (PG / M.Tech Faculty)</th>
                              <th>F (Total Regular Faculty)</th>
                              <th>Total Active Faculty</th>
                              <th>FQ Formula Output</th>
                              <th>FQ Score Awarded (Max: 20)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(nbaTier1Data.qualificationTable || []).map(q => (
                              <tr key={q.yearKey}>
                                <td style={{ fontWeight: 800 }}>{q.yearLabel}</td>
                                <td style={{ fontWeight: 700, color: '#0284c7' }}>{q.X}</td>
                                <td style={{ fontWeight: 700, color: '#475569' }}>{q.Y}</td>
                                <td style={{ fontWeight: 700 }}>{q.F}</td>
                                <td>{q.totalActive}</td>
                                <td style={{ fontFamily: 'monospace' }}>2.5 * [({10 * q.X} + {4 * q.Y}) / {q.F}] = {q.rawFq}</td>
                                <td style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{q.fqScore.toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr style={{ background: '#f8fafc', fontWeight: 900 }}>
                              <td colSpan={6} style={{ textAlign: 'right', fontSize: '0.92rem' }}>
                                3-Year Average Faculty Qualification (FQ) Score:
                              </td>
                              <td style={{ color: '#0284c7', fontSize: '1.05rem' }}>
                                {nbaTier1Data.averageFq.toFixed(2)} / 20.00
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CRITERION 5.6 FACULTY RETENTION */}
                  {nbaActiveTab === 'retention' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: '#f0fdf4', padding: '14px 18px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                          Criterion 5.6 Faculty Retention Evaluation
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#14532d', marginTop: '4px' }}>
                          Retention Rate = (Faculty members from base year <strong>{nbaTier1Data.retention?.baseYear}</strong> retained in <strong>CAY</strong> / Total in base year) * 100.
                          <br />
                          <strong>Scoring Rubric:</strong> &gt;= 90% : <strong>25 Marks</strong> | 75-89% : <strong>20 Marks</strong> | 60-74% : <strong>15 Marks</strong> | 50-59% : <strong>10 Marks</strong> | &lt; 50% : <strong>0 Marks</strong>.
                        </div>
                      </div>

                      {/* Visual Retention Survival Funnel and Score Radial Gauge */}
                      <NbaRetentionChart retention={nbaTier1Data.retention} />

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>BASE YEAR (CAYm2)</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{nbaTier1Data.retention?.nBase} Faculty</div>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>RETAINED IN CAYm1</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{nbaTier1Data.retention?.nRetainedCAYm1} Faculty</div>
                        </div>
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>RETAINED IN CAY</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>{nbaTier1Data.retention?.nRetainedCAY} Faculty</div>
                        </div>
                        <div style={{ background: '#ffffff', border: '1.5px solid #16a34a', padding: '10px 14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>RETENTION RATE & SCORE</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>
                            {nbaTier1Data.retention?.retentionRate}% ({nbaTier1Data.retention?.retentionMarks}/25)
                          </div>
                        </div>
                      </div>

                      <div className="table-container" style={{ marginTop: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '8px' }}>
                          Base Year Cohort Retention Tracking Roster:
                        </div>
                        <table style={{ width: '100%', fontSize: '0.84rem' }}>
                          <thead>
                            <tr>
                              <th>S.No</th>
                              <th>Staff ID</th>
                              <th>Faculty Name</th>
                              <th>Designation</th>
                              <th>DOJ</th>
                              <th>In Base Year ({nbaTier1Data.retention?.baseYear})</th>
                              <th>Retained in CAYm1</th>
                              <th>Retained in CAY</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(nbaTier1Data.retention?.roster || []).map((r, idx) => (
                              <tr key={r.staff_id}>
                                <td>{idx + 1}</td>
                                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{r.staff_id}</td>
                                <td style={{ fontWeight: 700 }}>{r.staff_name}</td>
                                <td>{r.Designation}</td>
                                <td>{r.Date_of_joining || 'N/A'}</td>
                                <td><span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Yes</span></td>
                                <td>{r.retainedInCAYm1 ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Yes</span> : <span style={{ color: '#ef4444', fontWeight: 700 }}>✗ No</span>}</td>
                                <td>{r.retainedInCAY ? <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Yes</span> : <span style={{ color: '#ef4444', fontWeight: 700 }}>✗ No</span>}</td>
                                <td>
                                  {r.is_relieved ? (
                                    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                      Relieved
                                    </span>
                                  ) : (
                                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                      Active
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CRITERION 5.2 CADRE PROPORTION */}
                  {nbaActiveTab === 'cadre' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: '#faf5ff', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                        <div style={{ fontWeight: 800, color: '#6b21a8', fontSize: '0.92rem' }}>
                          Criterion 5.2 Faculty Cadre Proportion (1 : 2 : 6 Target Ratio)
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#581c87', marginTop: '4px' }}>
                          Target Cadre Distribution: 1 Professor : 2 Associate Professors : 6 Assistant Professors per 9 required faculty members (Max: 20 Marks).
                        </div>
                      </div>

                      {/* Visual Cadre Distribution Bar Chart */}
                      <NbaCadreChart qualificationTable={nbaTier1Data.qualificationTable} />

                      <div className="table-container">
                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Assessment Year</th>
                              <th>Professors (Actual / Required)</th>
                              <th>Associate Professors (Actual / Required)</th>
                              <th>Assistant Professors (Actual / Required)</th>
                              <th>Total Regular Faculty</th>
                              <th>Cadre Proportion Score (Max: 20)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(nbaTier1Data.qualificationTable || []).map(q => (
                              <tr key={q.yearKey}>
                                <td style={{ fontWeight: 800 }}>{q.yearLabel}</td>
                                <td style={{ fontWeight: 700 }}>{q.cadre?.profCount || 0} / {q.cadre?.rfProf || 0}</td>
                                <td style={{ fontWeight: 700 }}>{q.cadre?.assocCount || 0} / {q.cadre?.rfAssoc || 0}</td>
                                <td style={{ fontWeight: 700 }}>{q.cadre?.asstCount || 0} / {q.cadre?.rfAsst || 0}</td>
                                <td>{q.F}</td>
                                <td style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.95rem' }}>{q.cadre?.cadreMarks?.toFixed(2) || '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: FORM B2 FACULTY DETAILS ROSTER */}
                  {nbaActiveTab === 'b2' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
                            Faculty Details of the Department (NBA Form B2)
                          </h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                            Official inspection table with PAN, Qualifications, Specialization, DOJ, Designation, and Association details.
                          </p>
                        </div>

                        {/* Export Form B2 buttons */}
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => exportNbaB2FacultyDetails(nbaTier1Data.facultyList, nbaTier1Data.department, nbaAssessmentYear)}
                            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#16a34a' }}
                          >
                            <FileSpreadsheet size={15} /> Export B2 (Excel)
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => exportNbaB2FacultyDetailsPdf(nbaTier1Data.facultyList, nbaTier1Data.department, nbaAssessmentYear, auth)}
                            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#dc2626' }}
                          >
                            <FileText size={15} /> Export B2 (PDF)
                          </button>
                        </div>
                      </div>

                      <div className="table-container">
                        <table style={{ width: '100%', fontSize: '0.82rem' }}>
                          <thead>
                            <tr>
                              <th>S.No</th>
                              <th>Name</th>
                              <th>PAN</th>
                              <th>Qualification</th>
                              <th>Specialization</th>
                              <th>Designation</th>
                              <th>DOJ</th>
                              <th>Associated</th>
                              <th>Nature</th>
                              <th>Contract</th>
                              <th>Leaving Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(nbaTier1Data.facultyList || []).map((f, idx) => (
                              <tr key={f.staff_id}>
                                <td>{idx + 1}</td>
                                <td style={{ fontWeight: 700 }}>{f.staff_name}</td>
                                <td>{f.pan || 'N/A'}</td>
                                <td style={{ fontWeight: 600, color: (f.Qualification || '').includes('Ph.D') ? '#0284c7' : '#334155' }}>
                                  {f.Qualification || 'Ph.D'}
                                </td>
                                <td>{f.area_of_specialization || 'N/A'}</td>
                                <td>{f.Designation || 'Faculty'}</td>
                                <td>{f.Date_of_joining || 'N/A'}</td>
                                <td>{f.is_relieved ? <span style={{ color: '#ef4444', fontWeight: 700 }}>N</span> : <span style={{ color: '#16a34a', fontWeight: 700 }}>Y</span>}</td>
                                <td>{f.nature_of_association || 'REGULAR'}</td>
                                <td>{f.contractual_type || '-'}</td>
                                <td>{f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: CRITERION 5.1-5.5 CONTRIBUTIONS */}
                  {nbaActiveTab === 'activities' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
                            Faculty Contributions & Academic Activities (Criteria 5.1 - 5.5)
                          </h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                            FDPs Attended, Events Organized, Certifications, Awards & Assigned Responsibilities.
                          </p>
                        </div>

                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleExportNBA('excel')}
                            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#16a34a' }}
                          >
                            <FileSpreadsheet size={15} /> Crit 5 Activities (Excel)
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleExportNBA('pdf')}
                            style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#dc2626' }}
                          >
                            <FileText size={15} /> Crit 5 Activities (PDF)
                          </button>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                          Click the export buttons above to generate the full multi-table dossier containing all faculty interaction records, workshops, certifications, awards, and responsibilities for accreditation inspection.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer with One-Click Comprehensive Dossier Exporters */}
            <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                All calculations strictly conform to the <strong>NBA Tier-1 UG Engineering SAR manual</strong>.
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => exportNbaTier1SarExcel(nbaTier1Data, nbaTier1Data?.department || accreditationDept, nbaAssessmentYear)}
                  disabled={!nbaTier1Data || loadingNbaTier1}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', borderColor: '#16a34a' }}
                >
                  <FileSpreadsheet size={16} /> Download Complete NBA Tier-1 Dossier (Excel)
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => exportNbaTier1SarPdf(nbaTier1Data, nbaTier1Data?.department || accreditationDept, nbaAssessmentYear, auth)}
                  disabled={!nbaTier1Data || loadingNbaTier1}
                  style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <FileText size={16} /> Download Complete NBA Tier-1 Dossier (PDF)
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNbaTier1Modal(false)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
