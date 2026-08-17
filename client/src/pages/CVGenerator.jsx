import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  FileText, Download, Printer, Sparkles, RefreshCw, CheckSquare, Square, 
  User, Award, BookOpen, FileCheck, Layers, Briefcase, GraduationCap, 
  Compass, Phone, Mail, MapPin, Globe, Eye, Copy, Check, ChevronRight,
  ShieldCheck, ExternalLink, Calendar, Building, BookMarked
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function CVGenerator({ auth }) {
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(
    localStorage.getItem('srec_view_staffId') || auth?.staffId || auth?.username || ''
  );
  const [cvData, setCvData] = useState(null);
  const [template, setTemplate] = useState('institutional'); // 'institutional' | 'aicte' | 'modern'
  const [summaryTone, setSummaryTone] = useState('executive'); // 'executive' | 'research' | 'teaching'
  const [customBio, setCustomBio] = useState('');
  const [copiedBio, setCopiedBio] = useState(false);
  const printRef = useRef(null);

  // Section Visibility Toggles
  const [sections, setSections] = useState({
    photo: true,
    contact: true,
    aiSummary: true,
    education: true,
    experience: true,
    publications: true,
    pubFilter: 'all', // 'all' | '5' | '10'
    books: true,
    patents: true,
    funding: true,
    consultancy: true,
    seedMoney: true,
    scholars: true,
    memberships: true,
    awards: true,
    fdp: true,
    responsibilities: true,
    declaration: true
  });

  const isPrivileged = ['admin', 'principal', 'hr', 'dept_admin'].includes(auth?.role) || auth?.isHod;

  // Load faculty directory list if privileged user
  useEffect(() => {
    if (isPrivileged && auth?.token) {
      fetch(`${API_BASE_URL}/api/admin/staff`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setFacultyList(data);
      })
      .catch(err => console.error('Error fetching staff list:', err));
    }
  }, [auth, isPrivileged]);

  // Load CV data for target staff ID
  useEffect(() => {
    fetchCVData(selectedStaffId);
  }, [selectedStaffId, auth]);

  const fetchCVData = async (staffId) => {
    setLoading(true);
    try {
      const target = staffId || auth?.staffId || auth?.username;
      const res = await fetch(`${API_BASE_URL}/api/faculty/cv-data/${target}`, {
        headers: { 'Authorization': `Bearer ${auth?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCvData(data);
        if (data.aiSummaries) {
          setCustomBio(data.aiSummaries[summaryTone] || data.aiSummaries.executive || '');
        }
      } else {
        console.error('Failed to load CV data');
      }
    } catch (err) {
      console.error('Error loading CV data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (tone) => {
    setSummaryTone(tone);
    if (cvData?.aiSummaries && cvData.aiSummaries[tone]) {
      setCustomBio(cvData.aiSummaries[tone]);
    }
  };

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyBio = () => {
    if (customBio) {
      navigator.clipboard.writeText(customBio);
      setCopiedBio(true);
      setTimeout(() => setCopiedBio(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDirectPDF = async () => {
    if (!printRef.current) return;
    setGeneratingPDF(true);
    try {
      const element = printRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = (personal.staff_name || auth?.name || 'Faculty').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Academic_CV_${personal.staff_id || auth?.staffId || 'SREC'}_${safeName}.pdf`);
    } catch (err) {
      console.error('Error generating direct PDF, falling back to print:', err);
      window.print();
    } finally {
      setGeneratingPDF(false);
    }
  };

  const personal = cvData?.personal || {};
  const academics = cvData?.academics || {};
  const education = cvData?.education || [];
  const experience = cvData?.experience || [];
  const publications = cvData?.publications || [];
  const books = cvData?.books || [];
  const patents = cvData?.patents || [];
  const funding = cvData?.funding || [];
  const consultancy = cvData?.consultancy || [];
  const seedMoney = cvData?.seedMoney || [];
  const fdp = cvData?.fdp || [];
  const eventsOrganized = cvData?.eventsOrganized || [];
  const memberships = cvData?.memberships || [];
  const awards = cvData?.awards || [];
  const scholars = cvData?.scholars || [];
  const phdPursuing = cvData?.phdPursuing || null;
  const isSupervisor = cvData?.isSupervisor || false;
  const responsibilities = cvData?.responsibilities || [];
  const metrics = cvData?.metrics || {};

  const name = (personal.staff_name || auth?.name || 'Faculty Member').trim();
  const fullDisplayName = name;
  const designation = academics.Designation || personal.designation || 'Faculty Member';
  const department = academics.Department || '';
  const email = personal.email || `${personal.staff_id || 'faculty'}@srec.ac.in`;
  const phone = personal.mobile || personal.phone || personal.mobile_no || '';

  // Resolving photo URL
  const rawPhoto = cvData?.profilePic || personal.passport_file || personal.profile_pic || auth?.profilePic;
  const photoUrl = rawPhoto 
    ? (rawPhoto.startsWith('http') 
        ? rawPhoto 
        : `${API_BASE_URL}/uploads/${(rawPhoto.includes('dynamic') || rawPhoto.includes('passport') || rawPhoto.includes('doc')) ? 'document' : 'upload'}/${rawPhoto}?token=${auth?.token}`)
    : null;

  // Filtered publications based on toggle
  const displayPubs = sections.pubFilter === '5' 
    ? publications.slice(0, 5) 
    : (sections.pubFilter === '10' ? publications.slice(0, 10) : publications);

  return (
    <div className="cv-generator-page" style={{ paddingBottom: '60px' }}>
      {/* SCREEN CONTROL HEADER */}
      <div className="no-print" style={{
        background: 'linear-gradient(135deg, #0f331f 0%, #15583b 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 10px 25px -5px rgba(15, 51, 31, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✨ AI Powered
            </span>
            <span style={{ color: '#86efac', fontSize: '0.82rem', fontWeight: 700 }}>
              NAAC / NBA / AICTE Compliant
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Academic CV & Bio-Data Generator
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.88rem' }}>
            Generate official institutional dossiers, statutory inspection bio-data, and technical CVs with live AI summaries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isPrivileged && facultyList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <User size={16} color="#86efac" />
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '220px'
                }}
              >
                {facultyList.map(f => (
                  <option key={f.staff_id} value={f.staff_id} style={{ color: '#0f172a', background: '#fff' }}>
                    {f.staff_id} - {f.staff_name} ({f.Department})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadDirectPDF}
            disabled={generatingPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              color: '#0f331f',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: generatingPDF ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.15s'
            }}
          >
            {generatingPDF ? (
              <>
                <RefreshCw className="spin" size={18} color="#15583b" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={18} color="#15583b" />
                <span>1-Click Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Printer size={17} color="#ffffff" />
            <span>Print Dialog</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw className="spin" size={36} style={{ color: '#15583b', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>Aggregating complete academic profile data...</div>
          <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>Synthesizing publications, grants, patents & AI statement</div>
        </div>
      ) : (
        <div className="cv-grid-container" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR: CUSTOMIZER & TOGGLES (NO PRINT) */}
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Template Selector Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#15583b" />
                <span>Format & Template</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'institutional', title: '🏛️ Official Institutional (SREC)', desc: 'Official letterhead layout for college dossiers & accreditations' },
                  { id: 'aicte', title: '📜 Statutory / AICTE Inspection', desc: 'Compliant table format for AICTE, NBA & Anna University visits' },
                  { id: 'modern', title: '💼 Modern Executive Profile', desc: 'Contemporary two-column format for external forums & conferences' }
                ].map(t => (
                  <div
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: template === t.id ? '2px solid #15583b' : '1px solid #e2e8f0',
                      background: template === t.id ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: template === t.id ? '#0f331f' : '#1e293b' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {t.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. AI Summary Customizer */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#15583b" />
                  <span>AI Academic Bio</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBio}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedBio ? '#16a34a' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}
                >
                  {copiedBio ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedBio ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Tone Selection Pills */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {[
                  { id: 'executive', label: 'Executive' },
                  { id: 'research', label: 'Research' },
                  { id: 'teaching', label: 'Teaching' }
                ].map(tone => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => handleToneChange(tone.id)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      border: summaryTone === tone.id ? '1px solid #15583b' : '1px solid #e2e8f0',
                      background: summaryTone === tone.id ? '#15583b' : '#f8fafc',
                      color: summaryTone === tone.id ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={5}
                value={customBio}
                onChange={(e) => setCustomBio(e.target.value)}
                placeholder="AI Academic Summary statement..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  lineHeight: '1.45',
                  color: '#1e293b',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* 3. Section Toggles */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="#15583b" />
                <span>Include Sections</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {[
                  { key: 'photo', label: 'Passport Photo / Avatar' },
                  { key: 'contact', label: 'Contact Details & IDs' },
                  { key: 'aiSummary', label: 'AI Academic Statement' },
                  { key: 'education', label: `Education & Degrees (${education.length})` },
                  { key: 'experience', label: `Career Appointments (${experience.length})` },
                  { key: 'publications', label: `Publications (${publications.length})` },
                  { key: 'books', label: `Books & Chapters (${books.length})` },
                  { key: 'patents', label: `Patents & IPR (${patents.length})` },
                  { key: 'funding', label: `Sponsored Grants (${funding.length})` },
                  { key: 'consultancy', label: `Consultancies (${consultancy.length})` },
                  { key: 'seedMoney', label: `Seed Money (${seedMoney.length})` },
                  { key: 'scholars', label: isSupervisor ? `Ph.D Guidance (${scholars.length})` : (phdPursuing ? 'Ph.D. Status (Pursuing)' : 'Ph.D. Guidance (0)') },
                  { key: 'memberships', label: `Memberships (${memberships.length})` },
                  { key: 'awards', label: `Awards & Honors (${awards.length})` },
                  { key: 'fdp', label: `FDPs & Workshops (${fdp.length + eventsOrganized.length})` },
                  { key: 'responsibilities', label: `Responsibilities (${responsibilities.length})` },
                  { key: 'declaration', label: 'Official Declaration & Sign-off' }
                ].map(item => (
                  <label
                    key={item.key}
                    onClick={() => toggleSection(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.82rem',
                      color: sections[item.key] ? '#0f172a' : '#94a3b8',
                      fontWeight: sections[item.key] ? 600 : 400,
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {sections[item.key] ? (
                      <CheckSquare size={16} color="#15583b" />
                    ) : (
                      <Square size={16} color="#cbd5e1" />
                    )}
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {sections.publications && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                    Publications Count Filter:
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', '10', '5'].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setSections(prev => ({ ...prev, pubFilter: cnt }))}
                        style={{
                          flex: 1,
                          padding: '4px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: sections.pubFilter === cnt ? '1px solid #15583b' : '1px solid #e2e8f0',
                          background: sections.pubFilter === cnt ? '#f0fdf4' : '#fff',
                          color: sections.pubFilter === cnt ? '#15583b' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {cnt === 'all' ? 'All Pubs' : `Top ${cnt}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: LIVE CV DOCUMENT CANVAS (A4 PREVIEW & PRINT) */}
          <div style={{ overflowX: 'auto' }}>
            <div 
              ref={printRef}
              className="cv-canvas-root"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '40px 48px',
                boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                minHeight: '1050px',
                maxWidth: '900px',
                margin: '0 auto',
                color: '#0f172a',
                fontFamily: template === 'aicte' ? '"Times New Roman", Times, serif' : 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.5'
              }}
            >
              {/* ==================================================== */}
              {/* TEMPLATE 1: SREC INSTITUTIONAL OFFICIAL LETTERHEAD  */}
              {/* ==================================================== */}
              {template === 'institutional' && (
                <div>
                  {/* Institutional Header Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '2.5px solid #15583b',
                    paddingBottom: '16px',
                    marginBottom: '24px',
                    gap: '16px'
                  }}>
                    <img 
                      src="/srec-crest.png" 
                      alt="SREC Crest" 
                      style={{ height: '75px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f331f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Sri Ramakrishna Engineering College
                      </h2>
                      <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                        [Autonomous Institution | Affiliated to Anna University, Chennai | Accredited by NAAC with 'A+' Grade]
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Vattamalaipalayam, N.G.G.O. Colony Post, Coimbatore - 641 022, Tamil Nadu
                      </div>
                      <div style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        background: '#15583b',
                        color: '#ffffff',
                        padding: '2px 14px',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Comprehensive Faculty Academic Profile & Bio-Data
                      </div>
                    </div>
                    {sections.photo && (
                      photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={name} 
                          style={{ width: '85px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #15583b' }}
                          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null
                    )}
                    {sections.photo && (
                      <div style={{ display: photoUrl ? 'none' : 'flex', width: '85px', height: '100px', border: '1.5px solid #15583b', borderRadius: '6px', background: '#f0fdf4', color: '#15583b', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem' }}>
                        {(name || 'F').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Faculty Identity Card Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px',
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f331f' }}>{fullDisplayName}</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#15583b', marginTop: '2px' }}>
                        {designation} — Department of {department}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                        <strong>Specialization:</strong> {academics.area_of_specialization || 'Engineering & Technology'}
                      </div>
                      {academics.Date_of_joining && (
                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          <strong>Date of Joining SREC:</strong> {new Date(academics.Date_of_joining).toLocaleDateString('en-GB')} ({metrics.yearsExperience || 1} Years Service)
                        </div>
                      )}
                    </div>

                    {sections.contact && (
                      <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '2px solid #cbd5e1', paddingLeft: '14px' }}>
                        <div><strong>Staff ID:</strong> {personal.staff_id || auth?.staffId}</div>
                        <div><strong>Email:</strong> {email}</div>
                        {phone && <div><strong>Mobile:</strong> {phone}</div>}
                        {academics.orcid_id && <div><strong>ORCID:</strong> {academics.orcid_id}</div>}
                        {academics.scopus_id && <div><strong>Scopus ID:</strong> {academics.scopus_id}</div>}
                        {(personal.aicte_id || academics.aicte_id) && <div><strong>AICTE ID:</strong> {personal.aicte_id || academics.aicte_id}</div>}
                        {(personal.anna_univ_id || academics.anna_univ_id) && <div><strong>Anna Univ ID:</strong> {personal.anna_univ_id || academics.anna_univ_id}</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TEMPLATE 2: AICTE & ANNA UNIVERSITY REGULATORY BIO  */}
              {/* ==================================================== */}
              {template === 'aicte' && (
                <div>
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '18px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      SRI RAMAKRISHNA ENGINEERING COLLEGE, COIMBATORE - 22
                    </h2>
                    <h3 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 'bold' }}>
                      FACULTY PROFILE / BIO-DATA FOR STATUTORY & INSPECTION PURPOSES
                    </h3>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.88rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', width: '25%', fontWeight: 'bold' }}>1. Name of the Faculty</td>
                        <td style={{ border: '1px solid #000', padding: '6px', width: '45%' }}>{fullDisplayName}</td>
                        <td rowSpan={4} style={{ border: '1px solid #000', padding: '6px', width: '30%', textAlign: 'center', verticalAlign: 'middle' }}>
                          {sections.photo && (
                            photoUrl ? (
                              <img src={photoUrl} alt={name} style={{ width: '90px', height: '110px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', border: '1px dashed #ccc' }}>Official Photo</div>
                            )
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>2. Designation & Dept</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{designation}, Dept. of {department}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>3. Staff ID & AICTE ID</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{personal.staff_id || auth?.staffId} / {personal.aicte_id || academics.aicte_id || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>4. Date of Birth & Age</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{personal.dob ? new Date(personal.dob).toLocaleDateString('en-GB') : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>5. Date of Joining SREC</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}>{academics.Date_of_joining ? new Date(academics.Date_of_joining).toLocaleDateString('en-GB') : 'N/A'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px' }}><strong>Total Exp:</strong> {metrics.yearsExperience || 1} Years</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', fontWeight: 'bold' }}>6. Email & Phone</td>
                        <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{email} | {phone || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================== */}
              {/* TEMPLATE 3: MODERN TECHNICAL EUROPASS RESUME        */}
              {/* ==================================================== */}
              {template === 'modern' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '3px solid #0369a1',
                  paddingBottom: '20px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, color: '#0f172a' }}>{fullDisplayName}</h1>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                      {designation} in {department}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                      Sri Ramakrishna Engineering College, Coimbatore
                    </div>
                    {sections.contact && (
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#334155', marginTop: '8px' }}>
                        <span>✉️ {email}</span>
                        {phone && <span>📱 {phone}</span>}
                        {academics.orcid_id && <span>🆔 ORCID: {academics.orcid_id}</span>}
                        {(personal.aicte_id || academics.aicte_id) && <span>🏛️ AICTE: {personal.aicte_id || academics.aicte_id}</span>}
                      </div>
                    )}
                  </div>
                  {sections.photo && (
                    photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={name} 
                        style={{ width: '90px', height: '105px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <div style={{ width: '90px', height: '105px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem' }}>
                        {(name || 'F').charAt(0).toUpperCase()}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: AI ACADEMIC SUMMARY STATEMENT              */}
              {/* ==================================================== */}
              {sections.aiSummary && customBio && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '7. Executive Professional Summary' : 'Executive Academic & Research Statement'}
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#334155',
                    textAlign: 'justify',
                    margin: 0,
                    backgroundColor: template === 'institutional' ? '#f0fdf4' : 'transparent',
                    padding: template === 'institutional' ? '10px 14px' : '0',
                    borderRadius: '6px',
                    borderLeft: template === 'institutional' ? '3px solid #15583b' : 'none'
                  }}>
                    {customBio}
                  </p>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: ACADEMIC QUALIFICATIONS / EDUCATION        */}
              {/* ==================================================== */}
              {sections.education && education.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '8. Academic Qualifications' : 'Academic Background & Qualifications'}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: template === 'institutional' ? '#f1f5f9' : (template === 'modern' ? '#f0f9ff' : '#eee') }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Degree / Category</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Branch / Specialization</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Institution / University</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '90px' }}>Year</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '90px' }}>Score / Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {education.map((edu, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{edu.degree || edu.category || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{edu.specialization || edu.course || 'General'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{edu.institute || edu.board || edu.university || edu.institution || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{edu.year || edu.year_of_passing || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{edu.percentage ? `${edu.percentage}%` : (edu.class_obtained || 'N/A')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Highlight Pursuing Ph.D status if applicable */}
                  {phdPursuing && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      fontSize: '0.78rem',
                      color: '#1e40af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <GraduationCap size={16} />
                      <div>
                        <strong>Ph.D. Research Status:</strong> Currently Pursuing Ph.D. in <em>{phdPursuing.university || 'Anna University'}</em> (Status: <strong>{phdPursuing.status || 'Provisionally Confirmed'}</strong>) under supervisor <strong>{phdPursuing.sup_name || 'Dr. Supervisor'}</strong>.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: CAREER & TEACHING EXPERIENCE               */}
              {/* ==================================================== */}
              {sections.experience && experience.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '9. Professional Experience & Appointments' : 'Professional Appointments & Experience'}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: template === 'institutional' ? '#f1f5f9' : (template === 'modern' ? '#f0f9ff' : '#eee') }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Designation / Position</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Institution / Organization</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '160px' }}>Period / Duration</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Roles / Highlights</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experience.map((exp, idx) => (
                        <tr key={`exp-${idx}`}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{exp.designation || exp.role || 'Faculty'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{exp.organization || 'Sri Ramakrishna Engineering College'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>
                            {exp.from_date || 'N/A'} to {exp.to_date || 'Present'} {exp.years ? `(${exp.years} Yrs)` : ''}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{exp.nature_of_work || 'Academic & Research'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: DOCTORAL / Ph.D RESEARCH GUIDANCE          */}
              {/* ONLY SHOWN IF FACULTY IS AN ACTUAL SUPERVISOR       */}
              {/* ==================================================== */}
              {sections.scholars && isSupervisor && scholars.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '10. Doctoral (Ph.D.) Research Guidance' : 'Doctoral Research Guidance & Supervision'}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: template === 'institutional' ? '#f1f5f9' : (template === 'modern' ? '#f0f9ff' : '#eee') }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Scholar Name & Reg No</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Research Title / Area</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '110px' }}>University</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '100px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scholars.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{s.scholar || s.scholar_name || s.name}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{s.supj || s.research_title || s.area || 'Engineering & Technology'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{s.university || 'Anna University'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: (s.status || '').toLowerCase().includes('completed') ? '#16a34a' : '#0369a1' }}>
                            {s.status || 'Active'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: RESEARCH PUBLICATIONS                     */}
              {/* ==================================================== */}
              {sections.publications && displayPubs.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      {template === 'aicte' ? '11. Research Publications in Journals & Conferences' : 'Peer-Reviewed Research Publications'}
                    </span>
                    <span style={{ fontSize: '0.74rem', textTransform: 'none', color: '#64748b' }}>
                      Showing {displayPubs.length} of {publications.length} Papers
                    </span>
                  </div>
                  <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {displayPubs.map((pub, idx) => (
                      <li key={idx} style={{ color: '#334155', textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{pub.title || pub.title_of_paper}</span>. 
                        <em> {pub.journel || pub.journal_name || pub.conference_name || 'Academic Forum'}</em>, 
                        {pub.volume_pub && ` Vol. ${pub.volume_pub}`}{pub.issue_no && `, Issue ${pub.issue_no}`}, 
                        {pub.pp && ` pp. ${pub.pp},`} {pub.month_pub || pub.year_of_pub || pub.date_con || ''}. 
                        {pub.doi && <span style={{ color: '#0369a1' }}> DOI: {pub.doi}</span>}
                        {(pub.index_pub || pub.web_of_science || pub.indexed_in) && (
                          <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {pub.index_pub || pub.web_of_science || pub.indexed_in}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: BOOKS & BOOK CHAPTERS                     */}
              {/* ==================================================== */}
              {sections.books && books.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    Books & Book Chapters Authored
                  </div>
                  <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {books.map((b, idx) => (
                      <li key={idx} style={{ color: '#334155' }}>
                        <strong>{b.title}</strong>, Publisher: <em>{b.publisher || 'Reputed Academic Publisher'}</em>
                        {b.edition && `, Edition: ${b.edition}`}
                        {b.isbn && `, ISBN: ${b.isbn}`}
                        {(b.dateofpublication || b.date) && ` (${b.dateofpublication || b.date})`}.
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: PATENTS & INTELLECTUAL PROPERTY            */}
              {/* ==================================================== */}
              {sections.patents && patents.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '12. Patents & Intellectual Property Rights (IPR)' : 'Patents & Intellectual Property Rights'}
                  </div>
                  <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {patents.map((pat, idx) => (
                      <li key={idx} style={{ color: '#334155' }}>
                        <strong>{pat.title || pat.patent_title}</strong>. 
                        Application No: <em>{pat.application_no || pat.app_no || 'N/A'}</em>, 
                        Status: <span style={{ fontWeight: 700, color: (pat.status || '').toLowerCase().includes('grant') ? '#16a34a' : '#d97706' }}>{pat.status || 'Published'}</span>
                        {(pat.date || pat.year) && `, Year: ${pat.date || pat.year}`}.
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: SPONSORED RESEARCH & GRANTS                */}
              {/* ==================================================== */}
              {sections.funding && funding.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    {template === 'aicte' ? '13. Sponsored Research Projects & Grants' : 'Sponsored Research Projects & External Grants'}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: template === 'institutional' ? '#f1f5f9' : (template === 'modern' ? '#f0f9ff' : '#eee') }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Project / Event Title</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Funding Agency</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '110px' }}>Sanctioned (₹)</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '90px' }}>Duration</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '90px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funding.map((f, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{f.title || f.project_title || 'Research Grant'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{f.fa || f.funding_agency || f.agency || 'Government / AICTE'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>
                            ₹{Number(f.amount || f.grant_amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{f.duration || 'N/A'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{f.status || 'Completed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: FDPs, WORKSHOPS & CONFERENCES PARTICIPATION */}
              {/* ==================================================== */}
              {sections.fdp && (fdp.length > 0 || eventsOrganized.length > 0) && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    Professional Development Programs, FDPs & Workshops
                  </div>
                  <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {fdp.map((item, idx) => (
                      <li key={`fdp-${idx}`} style={{ color: '#334155' }}>
                        <strong>{item.title}</strong> — {item.type || 'FDP / Workshop'}, organized by <em>{item.organizer || 'Academic Institution'}</em>
                        {(item.from_date || item.to_date) ? ` (${item.from_date || ''} ${item.to_date ? `to ${item.to_date}` : ''})` : ''}.
                      </li>
                    ))}
                    {eventsOrganized.map((evt, idx) => (
                      <li key={`evt-${idx}`} style={{ color: '#334155' }}>
                        <strong>[Organized] {evt.title}</strong> — {evt.type || 'Event / Seminar'}, Role: <em>{evt.role || 'Coordinator / Organizer'}</em>
                        {(evt.from_date || evt.to_date) ? ` (${evt.from_date || ''} ${evt.to_date ? `to ${evt.to_date}` : ''})` : ''}.
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: INSTITUTIONAL & DEPT RESPONSIBILITIES       */}
              {/* ==================================================== */}
              {sections.responsibilities && responsibilities.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                    borderBottom: '1.5px solid #cbd5e1',
                    paddingBottom: '4px',
                    marginBottom: '8px'
                  }}>
                    Institutional & Departmental Responsibilities Handled
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: template === 'institutional' ? '#f1f5f9' : (template === 'modern' ? '#f0f9ff' : '#eee') }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left' }}>Assigned Responsibility / Portfolio</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'left', width: '160px' }}>Level</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center', width: '120px' }}>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responsibilities.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{r.responsibility || r.duty_name}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>{r.level || 'Department Level'}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{r.academic_year || 'Current'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION: PROFESSIONAL MEMBERSHIPS & AWARDS          */}
              {/* ==================================================== */}
              {(sections.memberships && memberships.length > 0) || (sections.awards && awards.length > 0) ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                  {sections.memberships && memberships.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                        borderBottom: '1.5px solid #cbd5e1',
                        paddingBottom: '4px',
                        marginBottom: '8px'
                      }}>
                        Professional Memberships
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {memberships.map((m, idx) => (
                          <li key={idx}>
                            <strong>{m.organization || m.society_name || m.name}</strong> 
                            {(m.membershipid || m.membership_id) ? ` (ID: ${m.membershipid || m.membership_id})` : ''} 
                            {m.membership_type ? ` — ${m.membership_type}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sections.awards && awards.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: template === 'institutional' ? '#0f331f' : (template === 'modern' ? '#0284c7' : '#000000'),
                        borderBottom: '1.5px solid #cbd5e1',
                        paddingBottom: '4px',
                        marginBottom: '8px'
                      }}>
                        Honors & Recognitions
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {awards.map((a, idx) => (
                          <li key={idx}>
                            <strong>{a.awardname || a.award_name || a.title}</strong> by {a.awardby || a.awarding_body || a.agency} ({(a.awa_date || a.year || 'N/A')})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              {/* ==================================================== */}
              {/* SECTION: OFFICIAL DECLARATION & SIGN-OFF            */}
              {/* ==================================================== */}
              {sections.declaration && (
                <div style={{
                  marginTop: '30px',
                  paddingTop: '16px',
                  borderTop: '1px dashed #94a3b8',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}>
                  <p style={{ margin: '0 0 24px', textAlign: 'justify' }}>
                    <strong>Declaration:</strong> I hereby certify that the information provided in this academic bio-data is true, complete, and correct to the best of my knowledge and verified against official institutional records at Sri Ramakrishna Engineering College.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div><strong>Place:</strong> Coimbatore</div>
                      <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '35px' }}></div>
                      <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', minWidth: '180px', fontWeight: 800, color: '#0f172a' }}>
                        ({fullDisplayName})
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Signature of Faculty</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT MEDIA STYLES */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print, nav, header, aside, .sidebar, .navbar, .portal-banner {
            display: none !important;
          }
          .cv-generator-page {
            padding: 0 !important;
            margin: 0 !important;
          }
          .cv-canvas-root {
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
