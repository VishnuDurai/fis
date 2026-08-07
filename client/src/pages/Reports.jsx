import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { FileText, Printer, FileSpreadsheet, Eye, EyeOff, Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

export default function Reports({ auth }) {
  const [personal, setPersonal] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);

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
    events: true
  });

  const handleCheckboxChange = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const viewStaffId = localStorage.getItem('srec_view_staffId') || '';

      let targetQuery = '';
      if (auth.role === 'dept_admin' || auth.role === 'admin') {
        if (viewStaffId) targetQuery = `?staffId=${viewStaffId}`;
      } else {
        targetQuery = `?staffId=${auth.staffId}`;
      }

      // 1. Fetch personal and academics (always needed)
      const [personalRes, academicsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/faculty/personal${targetQuery}`, { headers }),
        fetch(`${API_BASE_URL}/api/faculty/academics${targetQuery}`, { headers })
      ]);

      if (personalRes.ok) {
        const d = await personalRes.json();
        setPersonal(d[0] || null);
      }
      if (academicsRes.ok) {
        const d = await academicsRes.json();
        setAcademics(d[0] || null);
      }

      // 2. Fetch other selected sections
      const dataPromises = {};
      const activeSections = Object.keys(sections).filter(s => sections[s] && s !== 'personal' && s !== 'academics');

      for (const section of activeSections) {
        let url = `${API_BASE_URL}/api/activities/${section}${targetQuery}`;
        if (section === 'education') {
          url = `${API_BASE_URL}/api/faculty/education${targetQuery}`;
        }
        
        dataPromises[section] = fetch(url, { headers })
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            // Apply client-side date range filter if specified
            if (fromDate || toDate) {
              return data.filter(item => {
                // Find date column in item (could be date_con, awa_date, from_date, data_of_exam, dateofpublication, etc)
                const dateVal = item.date_con || item.awa_date || item.from_date || item.data_of_exam || item.dateofpublication || item.generation || item.date;
                if (!dateVal) return true;
                
                // Parse dateVal (supports dd-mm-yyyy or yyyy-mm-dd)
                let itemDate = new Date(dateVal);
                if (dateVal.includes('-') && dateVal.split('-')[0].length === 2) {
                  const [d, m, y] = dateVal.split('-');
                  itemDate = new Date(`${y}-${m}-${d}`);
                }

                if (fromDate && itemDate < new Date(fromDate)) return false;
                if (toDate && itemDate > new Date(toDate)) return false;
                return true;
              });
            }

            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase().trim();
              data = data.filter(item =>
                Object.values(item).some(val => val && val.toString().toLowerCase().includes(q))
              );
            }

            return data;
          });
      }
      const data = {};
      if (pRes.ok) data.publications = await pRes.json();
      if (eRes.ok) data.education = await eRes.json();
      if (bRes.ok) data.books = await bRes.json();
      if (aRes.ok) data.awards = await aRes.json();
      if (mRes.ok) data.memberships = await mRes.json();
      if (rRes.ok) data.resource = await rRes.json();
      if (fRes.ok) data.funding = await fRes.json();
      if (iRes.ok) data.ipr = await iRes.json();
      if (cRes.ok) data.certifications = await cRes.json();
      if (evRes.ok) data.events = await evRes.json();
      
      if (persRes.ok) {
        const pObj = await persRes.json();
        setPersonal(pObj[0] || null);
      }
      if (acaRes.ok) {
        const aObj = await acaRes.json();
        setAcademics(aObj[0] || null);
      }

      // Filter activities data by date range and search query
      const filtered = {};
      const start = fromDate ? new Date(fromDate) : null;
      const end = toDate ? new Date(toDate) : null;

      Object.keys(data).forEach(key => {
        filtered[key] = (data[key] || []).filter(item => {
          // Date Filter
          if (start || end) {
            const dateVal = item.date_con || item.awa_date || item.from_date || item.data_of_exam || item.dateofpublication || item.generation || item.date;
            if (dateVal) {
              const itemDate = new Date(dateVal);
              if (start && itemDate < start) return false;
              if (end && itemDate > end) return false;
            }
          }

          // Publication Category Filter
          if (key === 'publications' && pubCategoryFilter) {
            if (item.type_pub !== pubCategoryFilter && item.type !== pubCategoryFilter) return false;
          }

          // Event Category Filter
          if (key === 'events' && eventCategoryFilter) {
            if (item.type !== eventCategoryFilter) return false;
          }

          // Interaction Type Filter
          if (key === 'resource' && interactionTypeFilter) {
            if (item.type !== interactionTypeFilter) return false;
          }

          // Keyword Search Filter
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const match = Object.values(item).some(v => v && v.toString().toLowerCase().includes(q));
            if (!match) return false;
          }

          return true;
        });
      });

      setReportData(filtered);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <Navbar title="Reports & Appraisal Dossier" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {/* Control Panel (no-print) */}
      <div className="card no-print" style={{ marginBottom: '32px' }}>
        {/* Accreditation Quick Presets */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
            Accreditation Audit Quick Presets:
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSections({ personal: true, academics: true, education: true, publications: false, books: false, awards: false, memberships: false, resource: false, funding: false, ipr: false, certifications: true, events: true });
                setEventCategoryFilter('FDP');
              }}
              style={{ fontSize: '0.82rem', fontWeight: 700 }}
            >
              NAAC Criteria 2 (Faculty Quality & FDPs)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSections({ personal: true, academics: true, education: false, publications: true, books: true, awards: false, memberships: false, resource: false, funding: true, ipr: true, certifications: false, events: false });
                setPubCategoryFilter('');
              }}
              style={{ fontSize: '0.82rem', fontWeight: 700 }}
            >
              NAAC / NBA Criteria 3 (Research, Patents & Grants)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSections({ personal: true, academics: true, education: true, publications: true, books: true, awards: true, memberships: true, resource: true, funding: true, ipr: true, certifications: true, events: true });
                setPubCategoryFilter('');
                setEventCategoryFilter('');
              }}
              style={{ fontSize: '0.82rem', fontWeight: 700 }}
            >
              Full Institutional Dossier (NBA / NIRF Audit)
            </button>
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Configure Custom Report</h3>

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
            <label className="form-label">Interaction Type Filter</label>
            <select className="form-control" value={interactionTypeFilter} onChange={(e) => setInteractionTypeFilter(e.target.value)} style={{ fontWeight: 600 }}>
              <option value="">-- All Interaction Types --</option>
              {['FDP', 'Seminar', 'Workshop', 'Short Term Course', 'Industry Interaction', 'Webinar', 'Guest Lecture'].map(t => (
                <option key={t} value={t}>{t}</option>
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
                placeholder="Filter by keyword / title..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">Include Sections</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {Object.keys(sections).map((section) => (
              <label key={section} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={sections[section]} 
                  onChange={() => handleCheckboxChange(section)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ textTransform: 'capitalize', fontSize: '0.95rem' }}>
                  {section === 'ipr' ? 'IPR / Patents' : section}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
            <FileText size={16} />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {personal && (
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Generated Report Layout */}
      {personal ? (
        <div className="card report-print-area" style={{ background: '#fff', color: '#000', padding: '40px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
          {/* Header with Left and Right Logos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '24px' }}>
            <img src="/report-logo-left.png" alt="SREC Logo Left" style={{ height: '80px', objectFit: 'contain' }} />
            <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
              <h2 style={{ color: '#000', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>FACULTY INFORMATION SYSTEM</h2>
              <p style={{ color: '#555', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Appraisal & Performance Summary Report</p>
              {fromDate || toDate ? (
                <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '2px' }}>
                  Period: {fromDate || 'Beginning'} to {toDate || 'Present'}
                </p>
              ) : null}
            </div>
            <img src="/report-logo-right.png" alt="SNR Sons Trust Logo Right" style={{ height: '140px', objectFit: 'contain', margin: '-30px 0' }} />
          </div>

          {/* Personal Details */}
          {sections.personal && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                1. Personal Details
              </h3>
              <table style={{ border: 'none', width: '100%' }}>
                <tbody>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', width: '200px', fontWeight: 600 }}>Staff ID:</td><td style={{ border: 'none', padding: '4px' }}>{personal.staff_id}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Staff Name:</td><td style={{ border: 'none', padding: '4px' }}>{personal.staff_name}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Date of Birth:</td><td style={{ border: 'none', padding: '4px' }}>{personal.dob}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Gender:</td><td style={{ border: 'none', padding: '4px' }}>{personal.gender}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Email Address:</td><td style={{ border: 'none', padding: '4px' }}>{personal.email}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Mobile:</td><td style={{ border: 'none', padding: '4px' }}>{personal.mobile}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Address:</td><td style={{ border: 'none', padding: '4px' }}>{personal.address}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Academic Profile */}
          {sections.academics && academics && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                2. Academic Status
              </h3>
              <table style={{ border: 'none', width: '100%' }}>
                <tbody>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', width: '200px', fontWeight: 600 }}>Department:</td><td style={{ border: 'none', padding: '4px' }}>{academics.Department}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Designation:</td><td style={{ border: 'none', padding: '4px' }}>{academics.Designation}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Highest Qualification:</td><td style={{ border: 'none', padding: '4px' }}>{academics.Qualification}</td></tr>
                  <tr style={{ border: 'none' }}><td style={{ border: 'none', padding: '4px', fontWeight: 600 }}>Date of Joining SREC:</td><td style={{ border: 'none', padding: '4px' }}>{academics.Date_of_joining}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Education Details */}
          {sections.education && reportData.education && reportData.education.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                3. Qualifications
              </h3>
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Degree</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Specialization</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Institution</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Board / University</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Year</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.education.map(e => (
                    <tr key={e.id}>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.category}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.degree || e.category}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.specialization}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.institute}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.board}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.year}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{e.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Publications */}
          {sections.publications && reportData.publications && reportData.publications.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                4. Research Publications
              </h3>
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Title</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Journal / Conference</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Date</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Indexing</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Impact Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.publications.map(p => (
                    <tr key={p.id}>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.type_pub} ({p.type})</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.title}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.journel}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.date_con}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.index_pub || 'N/A'}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{p.impact || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Awards */}
          {sections.awards && reportData.awards && reportData.awards.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                5. Awards Received
              </h3>
              <ul>
                {reportData.awards.map(a => (
                  <li key={a.id} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                    <strong>{a.awardname}</strong> awarded by {a.awardby} (Event: {a.event || 'N/A'}) on {a.awa_date}.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Memberships */}
          {sections.memberships && reportData.memberships && reportData.memberships.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                Professional Memberships
              </h3>
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Membership ID</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Professional Society / Organization</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.memberships.map(m => (
                    <tr key={m.id}>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000', fontWeight: 600 }}>{m.membershipid}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{m.organization}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* R&D Funding */}
          {sections.funding && reportData.funding && reportData.funding.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                6. Supported Research Projects / Funding
              </h3>
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Project Title</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Agency</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Reference</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Amount</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.funding.map(f => (
                    <tr key={f.id}>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{f.title}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{f.fa}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{f.referenceno || 'N/A'}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>₹ {f.amount?.toLocaleString('en-IN')}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Events Organized */}
          {sections.events && reportData.events && reportData.events.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#000', fontSize: '1.1rem', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
                7. Events Organized
              </h3>
              <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Category</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Event Title</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Organizer / Venue</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Period</th>
                    <th style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>Grant Received</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.events.map(ev => (
                    <tr key={ev.id}>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{ev.type}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{ev.title}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{ev.organizer}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{ev.from_date} to {ev.to_date}</td>
                      <td style={{ border: '1px solid #ccc', padding: '6px', color: '#000' }}>{ev.granted ? `₹ ${ev.granted?.toLocaleString('en-IN')}` : 'Nil'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Signature */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px', borderTop: '1px dashed #000' }}>
            <span style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>FIS Verifier Signature</span>
            <span style={{ fontSize: '0.9rem', color: '#000', fontWeight: 600 }}>Faculty Signature</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          Please click "Generate Report" above to load and preview the dossier.
        </div>
      )}
    </div>
  );
}
