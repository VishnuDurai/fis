import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Sparkles, 
  Award, 
  GraduationCap, 
  Users, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { 
  exportNbaB2FacultyDetails, 
  exportNbaB2FacultyDetailsPdf, 
  exportNbaTier1SarExcel, 
  exportNbaTier1SarPdf,
  exportNaacCriterion3Pdf
} from '../utils/reportGenerator';

const API_BASE_URL = 'http://localhost:5000';

// --- NBA CRITERION 5 VISUALIZATION COMPONENTS ---

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

export default function AccreditationSuite({ auth }) {
  const { showError, showSuccess } = useAlert();
  
  // State
  const [accreditationDept, setAccreditationDept] = useState(
    auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : ''
  );
  const [departments, setDepartments] = useState([]);
  const [nbaAssessmentYear, setNbaAssessmentYear] = useState('2026-2027');
  const [nbaSfrRatio, setNbaSfrRatio] = useState(15);
  const [nbaActiveTab, setNbaActiveTab] = useState('overview');
  const [nbaTier1Data, setNbaTier1Data] = useState(null);
  const [loadingNbaTier1, setLoadingNbaTier1] = useState(false);
  const [exportingAccreditation, setExportingAccreditation] = useState(false);

  // Fetch Departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${auth.token}` };
        const res = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepts();
  }, [auth]);

  // Fetch NBA Analytics
  const fetchNbaTier1Analytics = async (ay = nbaAssessmentYear, sfr = nbaSfrRatio, dept = accreditationDept) => {
    setLoadingNbaTier1(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : (dept || '');
      const queryParams = new URLSearchParams({
        department: targetDept,
        academicYear: ay || '2026-2027',
        sfrRatio: sfr || 15
      });

      const res = await fetch(`${API_BASE_URL}/api/admin/accreditation/nba-tier1-analytics?${queryParams.toString()}`, { headers });
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      setNbaTier1Data(data);
    } catch (err) {
      console.error('Failed to fetch NBA Tier-1 analytics:', err);
      showError('Failed to calculate NBA Tier-1 metrics: ' + err.message);
    } finally {
      setLoadingNbaTier1(false);
    }
  };

  useEffect(() => {
    fetchNbaTier1Analytics(nbaAssessmentYear, nbaSfrRatio, accreditationDept);
  }, [nbaAssessmentYear, nbaSfrRatio, accreditationDept]);

  // Handle NAAC export
  const handleExportNaac = async (format = 'excel') => {
    setExportingAccreditation(true);
    try {
      const targetDept = auth.role === 'dept_admin' ? (auth.department || auth.dept || '') : accreditationDept;
      const q = targetDept ? `?department=${encodeURIComponent(targetDept)}` : '';
      
      const res = await fetch(`${API_BASE_URL}/api/admin/accreditation/naac-summary${q}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch NAAC data');
      const data = await res.json();

      if (format === 'pdf') {
        await exportNaacCriterion3Pdf(data, targetDept || 'Institution', auth);
        showSuccess('NAAC Accreditation PDF Dossier downloaded successfully!');
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

        const fdpSheet = XLSX.utils.json_to_sheet(data.naac_3_6_fdp || []);
        XLSX.utils.book_append_sheet(wb, fdpSheet, "3.6 FDP & Workshops");

        const filename = `NAAC_Criterion_3_${(targetDept || 'Institution').replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        XLSX.writeFile(wb, filename);
        showSuccess(`NAAC SSR Workbook "${filename}" downloaded successfully!`);
      }
    } catch (err) {
      console.error('Failed to export NAAC dossier:', err);
      showError('Failed to generate NAAC dossier: ' + err.message);
    } finally {
      setExportingAccreditation(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '24px 28px', color: '#ffffff', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <ShieldCheck size={28} color="#38bdf8" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Accreditation Suite (NBA Tier-1 & NAAC)
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
                  Standard SAR Criterion 5 Evaluation Suite, Cadre Compliance, Qualification (FQ), Retention, Form B2 & NAAC Criteria
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Department, AY, SFR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {auth.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Department:</span>
                <select
                  className="form-control"
                  value={accreditationDept}
                  onChange={(e) => setAccreditationDept(e.target.value)}
                  style={{ background: '#334155', color: '#fff', borderColor: '#475569', fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}
                >
                  <option value="">Institution (All Departments)</option>
                  {departments.map(d => (
                    <option key={d.id || d.name} value={d.name || d.department_name}>
                      {d.name || d.department_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>AY:</span>
              <select
                className="form-control"
                value={nbaAssessmentYear}
                onChange={(e) => setNbaAssessmentYear(e.target.value)}
                style={{ background: '#334155', color: '#fff', borderColor: '#475569', fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}
              >
                <option value="2026-2027">2026-2027 (CAY)</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>SFR:</span>
              <select
                className="form-control"
                value={nbaSfrRatio}
                onChange={(e) => setNbaSfrRatio(Number(e.target.value))}
                style={{ background: '#334155', color: '#fff', borderColor: '#475569', fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}
              >
                <option value={15}>1 : 15 (Tier-1 UG Standard)</option>
                <option value={20}>1 : 20 (AICTE Standard)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TOP EXECUTIVE KPI SUMMARY CARDS (IN NATURAL CRITERIA ORDER: 5.2 -> 5.3 -> 5.6 -> ROSTER) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* 1. Criterion 5.2 */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #e9d5ff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>5.2 Cadre Proportion</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed' }}>
              {nbaTier1Data?.qualificationTable?.[0]?.cadre?.cadreMarks != null ? `${nbaTier1Data.qualificationTable[0].cadre.cadreMarks}` : '--'}
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b' }}>/ 20.00 Marks</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#7c3aed', marginTop: '2px', fontWeight: 600 }}>Prof : Assoc : Asst Prof (1:2:6)</div>
        </div>

        {/* 2. Criterion 5.3 */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #bae6fd', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>5.3 Faculty Qualification (FQ)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>{nbaTier1Data?.averageFq ?? '--'}</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b' }}>/ 20.00 Marks (3-Yr Avg)</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>FQ = 2.5 * [(10X + 4Y) / F]</div>
        </div>

        {/* 3. Criterion 5.6 */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #bbf7d0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>5.6 Faculty Retention</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a' }}>{nbaTier1Data?.retention?.retentionRate != null ? `${nbaTier1Data.retention.retentionRate}%` : '--'}</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>({nbaTier1Data?.retention?.retentionMarks ?? 0} / 25 Marks)</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Base Year: {nbaTier1Data?.retention?.baseYear || 'CAYm2'}</div>
        </div>

        {/* 4. Total Verified Roster */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Total Department Faculty</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{nbaTier1Data?.facultyList?.length || 0}</span>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b' }}>Members</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', fontWeight: 600 }}>Form B2 Inspection Verified</div>
        </div>
      </div>

      {/* CRITERIA NAVIGATION PILL TABS (IN NUMERICAL ORDER: 5.0 -> 5.2 -> 5.3 -> 5.6 -> 5.1-5.5 -> B2 -> NAAC) */}
      <div style={{ display: 'flex', gap: '8px', padding: '10px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        {[
          { id: 'overview', label: '📊 5.0 SAR Overview' },
          { id: 'cadre', label: '🏛️ 5.2 Cadre Proportion' },
          { id: 'fq', label: '🎓 5.3 Faculty Qualification (FQ)' },
          { id: 'retention', label: '🔄 5.6 Faculty Retention' },
          { id: 'activities', label: '⚡ 5.1-5.5 Contributions & Activities' },
          { id: 'b2', label: '📋 Form B2: Faculty Details Roster' },
          { id: 'naac', label: '🏛️ NAAC Accreditation Suite' }
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

      {/* TAB CONTENT BODY */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {loadingNbaTier1 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Calculating Accreditation & SAR Metrics...</div>
            <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>Evaluating qualifications, retention survival and cadre balance across CAY, CAYm1 and CAYm2.</div>
          </div>
        ) : !nbaTier1Data ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444' }}>
            Failed to load accreditation data. Please check your connection and try again.
          </div>
        ) : (
          <>
            {/* TAB 1: 5.0 SAR OVERVIEW */}
            {nbaActiveTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '12px', padding: '18px 20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0369a1', fontWeight: 800 }}>
                    NBA Tier-1 Criteria 5 Summary & Evaluation Dossier
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: '1.6' }}>
                    This suite dynamically evaluates institutional academic records for <strong>{nbaTier1Data.department}</strong> and executes exact mathematical formulas mandated by the <strong>NBA Tier-1 Self Assessment Report (SAR)</strong> for Autonomous & Tier-1 Engineering Institutions.
                  </p>
                </div>

                {/* All 3 Visual Graphs in Numerical Order: 5.2 -> 5.3 -> 5.6 */}
                <NbaCadreChart qualificationTable={nbaTier1Data.qualificationTable} />
                <NbaFqChart qualificationTable={nbaTier1Data.qualificationTable} averageFq={nbaTier1Data.averageFq} />
                <NbaRetentionChart retention={nbaTier1Data.retention} />

                {/* Export CTA Bar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => exportNbaTier1SarExcel(nbaTier1Data, nbaTier1Data.department, nbaAssessmentYear)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
                  >
                    <FileSpreadsheet size={18} /> Download Complete NBA Tier-1 Dossier (Excel)
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => exportNbaTier1SarPdf(nbaTier1Data, nbaTier1Data.department, nbaAssessmentYear, auth)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
                  >
                    <FileText size={18} /> Download Complete NBA Tier-1 Dossier (PDF)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CRITERION 5.2 CADRE PROPORTION */}
            {nbaActiveTab === 'cadre' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#faf5ff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
                  <div style={{ fontWeight: 800, color: '#6b21a8', fontSize: '0.96rem' }}>
                    Criterion 5.2 Faculty Cadre Proportion (1 : 2 : 6 Target Ratio)
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#581c87', marginTop: '4px' }}>
                    Target Cadre Distribution: 1 Professor : 2 Associate Professors : 6 Assistant Professors per 9 required faculty members (Max: 20 Marks).
                  </div>
                </div>

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

            {/* TAB 3: CRITERION 5.3 FACULTY QUALIFICATION */}
            {nbaActiveTab === 'fq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.96rem' }}>
                    Criterion 5.3 Faculty Qualification Calculation Details
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#0c4a6e', marginTop: '4px' }}>
                    Formula: <code style={{ background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>FQ = 2.5 * [(10X + 4Y) / F]</code> (Maximum 20 Marks). Faculty with Ph.D. are counted in <strong>X</strong> and with Post-Graduate degree (M.E./M.Tech) in <strong>Y</strong>.
                  </div>
                </div>

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

            {/* TAB 4: CRITERION 5.6 FACULTY RETENTION */}
            {nbaActiveTab === 'retention' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0fdf4', padding: '16px 20px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.96rem' }}>
                    Criterion 5.6 Faculty Retention Evaluation
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#14532d', marginTop: '4px' }}>
                    Retention Rate = (Faculty members from base year <strong>{nbaTier1Data.retention?.baseYear}</strong> retained in <strong>CAY</strong> / Total in base year) * 100.
                    <br />
                    <strong>Scoring Rubric:</strong> &gt;= 90% : <strong>25 Marks</strong> | 75-89% : <strong>20 Marks</strong> | 60-74% : <strong>15 Marks</strong> | 50-59% : <strong>10 Marks</strong> | &lt; 50% : <strong>0 Marks</strong>.
                  </div>
                </div>

                <NbaRetentionChart retention={nbaTier1Data.retention} />

                <div className="table-container" style={{ marginTop: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '8px' }}>
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

            {/* TAB 5: 5.1-5.5 CONTRIBUTIONS & ACTIVITIES */}
            {nbaActiveTab === 'activities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>
                    Faculty Research, Publications & Outreach (Criteria 5.1 - 5.5)
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Summary metrics of all faculty contributions, funded research, patents, and faculty development activities.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>5.4.1 PUBLICATIONS</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                      {nbaTier1Data?.activitiesSummary?.publications || 0} Papers
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>5.4.2 R&D & GRANTS</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                      {nbaTier1Data?.activitiesSummary?.funding || 0} Grants
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>5.4.3 PATENTS / IPR</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
                      {nbaTier1Data?.activitiesSummary?.ipr || 0} Filed/Granted
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>5.5 FDP & WORKSHOPS</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ea580c', marginTop: '2px' }}>
                      {nbaTier1Data?.activitiesSummary?.interactions || 0} Attended
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: FORM B2 FACULTY DETAILS ROSTER */}
            {nbaActiveTab === 'b2' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                      Faculty Details of the Department (NBA Form B2)
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                      Official inspection table with PAN, Qualifications, Specialization, DOJ, Designation, and Association details.
                    </p>
                  </div>

                  {/* Export Form B2 buttons */}
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => exportNbaB2FacultyDetails(nbaTier1Data.facultyList, nbaTier1Data.department, nbaAssessmentYear)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 12px', fontWeight: 700 }}
                    >
                      <FileSpreadsheet size={15} /> Export Form B2 (Excel)
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => exportNbaB2FacultyDetailsPdf(nbaTier1Data.facultyList, nbaTier1Data.department, nbaAssessmentYear, auth)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 12px', fontWeight: 700 }}
                    >
                      <FileText size={15} /> Export Form B2 (PDF)
                    </button>
                  </div>
                </div>

                <div className="table-container">
                  <table style={{ width: '100%', fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Name</th>
                        <th>PAN</th>
                        <th>Highest Qual.</th>
                        <th>Specialization</th>
                        <th>Designation</th>
                        <th>DOJ</th>
                        <th>Designated Prof Date</th>
                        <th>Assoc.</th>
                        <th>Nature</th>
                        <th>Contract Type</th>
                        <th>Leaving Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(nbaTier1Data.facultyList || []).map((f, idx) => (
                        <tr key={f.staff_id || idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 700 }}>{f.staff_name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{f.pan || 'N/A'}</td>
                          <td>
                            <span style={{ 
                              background: (f.Qualification || '').toUpperCase().includes('PH.D') ? '#e0f2fe' : '#f1f5f9', 
                              color: (f.Qualification || '').toUpperCase().includes('PH.D') ? '#0369a1' : '#475569', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontWeight: 700 
                            }}>
                              {f.Qualification || 'Ph.D.'}
                            </span>
                          </td>
                          <td>{f.area_of_specialization || 'N/A'}</td>
                          <td style={{ fontWeight: 600 }}>{f.Designation || 'N/A'}</td>
                          <td>{f.Date_of_joining || 'N/A'}</td>
                          <td>{f.date_designated_prof || 'NA'}</td>
                          <td>{f.is_relieved ? 'N' : 'Y'}</td>
                          <td>{(f.nature_of_association || 'REGULAR').toUpperCase()}</td>
                          <td>{f.contractual_type || '-'}</td>
                          <td>{f.is_relieved ? (f.date_of_leaving || 'Yes') : 'NA'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: NAAC ACCREDITATION SUITE */}
            {nbaActiveTab === 'naac' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                    NAAC Institutional & Department Accreditation Suite
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                    Evaluates criteria across Criteria 2 (Teaching-Learning & Faculty Profile) and Criteria 3 (Research, Innovations & Extension) according to NAAC SSR manual.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={exportingAccreditation}
                    onClick={() => handleExportNaac('excel')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
                  >
                    <FileSpreadsheet size={18} /> Export NAAC SSR Workbook (Excel)
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={exportingAccreditation}
                    onClick={() => handleExportNaac('pdf')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 700 }}
                  >
                    <FileText size={18} /> Export NAAC SSR Dossier (PDF)
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
