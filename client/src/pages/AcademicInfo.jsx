import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, BookOpen, FileText, User, FileSpreadsheet } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { exportNbaB2FacultyDetails } from '../utils/reportGenerator.js';
import { validateAicteId, validateAnnaUnivId, validateApaarId } from '../utils/validators.js';

export default function AcademicInfo({ auth }) {
  const [personal, setPersonal] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [personalList, setPersonalList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyTarget, setSelectedFacultyTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      
      const dRes = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
      if (dRes.ok) setDepartments(await dRes.json());

      if (auth.role === 'dept_admin' || auth.role === 'admin') {
        const pRes = await fetch(`${API_BASE_URL}/api/faculty/personal`, { headers });
        if (pRes.ok) {
          const data = await pRes.json();
          setPersonalList(data || []);
          if (data && data.length > 0) {
            setPersonal(data[0]);
          }
        }
      } else {
        const [pRes, aRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/faculty/personal?staffId=${auth.staffId}`, { headers }),
          fetch(`${API_BASE_URL}/api/faculty/academics?staffId=${auth.staffId}`, { headers })
        ]);

        if (pRes.ok) {
          const data = await pRes.json();
          setPersonal(data && data.length > 0 ? data[0] : null);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAcademics(aData && aData.length > 0 ? aData[0] : null);
        }
      }
    } catch (err) {
      console.error('Error fetching academic info profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeptWithAcronym = (deptName) => {
    if (!deptName) return 'N/A';
    const match = departments.find(d => 
      (d.name || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase() ||
      (d.acronym || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase()
    );
    if (!match) return deptName;
    if (match.acronym && match.acronym.trim().toLowerCase() !== match.name.trim().toLowerCase() && !deptName.includes(`(${match.acronym})`)) {
      return `${match.name} (${match.acronym})`;
    }
    return match.name;
  };

  useEffect(() => {
    fetchDetails();
  }, [auth]);

  const handleSaveAcademicInfo = async (e, targetItem = personal) => {
    if (e) e.preventDefault();
    setMessage('');
    setError('');

    if (targetItem) {
      if (!targetItem.aicte_id || !targetItem.aicte_id.trim()) { setError('AICTE Faculty ID is a mandatory field.'); return; }
      if (!targetItem.anna_univ_id || !targetItem.anna_univ_id.trim()) { setError('Anna University ID is a mandatory field.'); return; }
      if (!targetItem.apaar_id || !targetItem.apaar_id.trim()) { setError('APAAR ID is a mandatory field.'); return; }

      const aicteErr = validateAicteId(targetItem.aicte_id);
      if (aicteErr) { setError(aicteErr); return; }

      const auErr = validateAnnaUnivId(targetItem.anna_univ_id);
      if (auErr) { setError(auErr); return; }

      const apaarErr = validateApaarId(targetItem.apaar_id);
      if (apaarErr) { setError(apaarErr); return; }
    }

    const targetStaffId = targetItem?.staff_id || auth.staffId;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      };

      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE_URL}/api/faculty/personal/update`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            staffId: targetStaffId,
            dob: targetItem?.dob || '',
            gender: targetItem?.gender || 'Male',
            address: targetItem?.address || '',
            mobile: targetItem?.mobile || '',
            pan: targetItem?.pan || '',
            aadhar: targetItem?.aadhar || '',
            aicte_id: targetItem?.aicte_id || '',
            anna_univ_id: targetItem?.anna_univ_id || '',
            apaar_id: targetItem?.apaar_id || ''
          })
        }),
        fetch(`${API_BASE_URL}/api/faculty/academics/update`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            staffId: targetStaffId,
            Date_of_joining: (targetItem?.Date_of_joining !== undefined ? targetItem.Date_of_joining : academics?.Date_of_joining) || '',
            Department: (targetItem?.Department !== undefined ? targetItem.Department : academics?.Department) || '',
            Designation: (targetItem?.Designation !== undefined ? targetItem.Designation : academics?.Designation) || '',
            Qualification: (targetItem?.Qualification !== undefined ? targetItem.Qualification : academics?.Qualification) || '',
            area_of_specialization: (targetItem?.area_of_specialization !== undefined ? targetItem.area_of_specialization : academics?.area_of_specialization) || '',
            date_designated_prof: (targetItem?.date_designated_prof !== undefined ? targetItem.date_designated_prof : academics?.date_designated_prof) || '',
            nature_of_association: (targetItem?.nature_of_association !== undefined ? targetItem.nature_of_association : academics?.nature_of_association) || 'REGULAR',
            contractual_type: (targetItem?.contractual_type !== undefined ? targetItem.contractual_type : academics?.contractual_type) || '-',
            date_of_leaving: (targetItem?.date_of_leaving !== undefined ? targetItem.date_of_leaving : academics?.date_of_leaving) || '',
            orcid_id: (targetItem?.orcid_id !== undefined ? targetItem.orcid_id : academics?.orcid_id) || '',
            scholar_id: (targetItem?.scholar_id !== undefined ? targetItem.scholar_id : academics?.scholar_id) || '',
            scopus_id: (targetItem?.scopus_id !== undefined ? targetItem.scopus_id : academics?.scopus_id) || '',
            wos_id: (targetItem?.wos_id !== undefined ? targetItem.wos_id : academics?.wos_id) || '',
            h_index: academics?.h_index || 0,
            i10_index: academics?.i10_index || 0,
            total_citations: academics?.total_citations || 0
          })
        })
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error('Failed to update academic information');
      }

      setMessage('Academic & Publication identification information saved successfully!');
      if (selectedFacultyTarget) setSelectedFacultyTarget(null);
      fetchDetails();
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredPersonalList = personalList.filter(item => {
    if (selectedDepartment) {
      const itemDept = (item.Department || '').trim().toLowerCase();
      const selDept = selectedDepartment.trim().toLowerCase();
      const matches = itemDept === selDept || departments.some(d => (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept));
      if (!matches) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.staff_id || '').toLowerCase().includes(q) ||
      (item.staff_name || '').toLowerCase().includes(q) ||
      (item.Designation || '').toLowerCase().includes(q) ||
      (item.Department || '').toLowerCase().includes(q) ||
      (item.aicte_id || '').toLowerCase().includes(q) ||
      (item.anna_univ_id || '').toLowerCase().includes(q) ||
      (item.apaar_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Navbar title="Academic Information" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

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

      {/* DEPARTMENT ADMIN / SYSTEM ADMIN VIEW */}
      {(auth.role === 'dept_admin' || auth.role === 'admin') ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '20px', background: '#ffffff', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Faculty Academic Identification Directory</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {auth.role === 'dept_admin' 
                    ? `Institutional identification IDs (AICTE, Anna University, APAAR) of ${auth.department || auth.dept || 'department'} faculty`
                    : 'System-wide institutional identification IDs (AICTE, Anna University, APAAR) across all departments'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                {auth.role === 'admin' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      Filter Dept:
                    </label>
                    <select 
                      className="form-control" 
                      value={selectedDepartment} 
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      style={{ maxWidth: '240px', fontWeight: 600, fontSize: '0.88rem' }}
                    >
                      <option value="">-- All Departments --</option>
                      {departments.map(dept => (
                        <option key={dept.id || dept.acronym} value={dept.acronym || dept.name}>
                          {dept.name} ({dept.acronym})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '280px', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by ID, Name, AICTE, AU ID, APAAR ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <ReportButtons 
                  pageTitle="Faculty Academic Identification Directory" 
                  departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
                  headers={['Staff ID', 'Staff Name', 'Department', 'Designation', 'Specialization', 'AICTE Faculty ID', 'Anna University ID', 'APAAR ID']} 
                  rows={filteredPersonalList.map(f => [
                    f.staff_id,
                    f.staff_name,
                    f.Department || 'N/A',
                    f.Designation || 'N/A',
                    f.area_of_specialization || 'N/A',
                    f.aicte_id || 'N/A',
                    f.anna_univ_id || 'N/A',
                    f.apaar_id || 'N/A'
                  ])} 
                  auth={auth}
                />
                <button 
                  className="btn btn-secondary" 
                  onClick={() => exportNbaB2FacultyDetails(filteredPersonalList, selectedDepartment || auth.department || auth.dept || 'Department')}
                  style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}
                  title="Download Faculty Details of the Department (NBA Criterion 5 Form B2 Excel Sheet)"
                >
                  <FileSpreadsheet size={15} />
                  Export NBA B2 Details (Excel)
                </button>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', whiteSpace: 'nowrap' }}>
                Total Records: {filteredPersonalList.length}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading academic information...</div>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Faculty Details</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Area of Specialization</th>
                    <th>AICTE Faculty ID</th>
                    <th>Anna University ID</th>
                    <th>APAAR ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonalList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 500 }}>
                        No faculty academic records match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPersonalList.map((item) => {
                      const pic = item.file || item.profile_pic;
                      const picUrl = pic 
                        ? `${API_BASE_URL}/uploads/upload/${pic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}` 
                        : null;
                      return (
                        <tr key={item.staff_id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ position: 'relative', width: '42px', height: '42px', minWidth: '42px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '1.5px solid hsl(var(--primary), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {picUrl ? (
                                  <img 
                                    src={picUrl} 
                                    alt={item.staff_name || 'Faculty'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                                  />
                                ) : null}
                                <div style={{ display: picUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '0.85rem' }}>
                                  {(item.staff_name || item.staff_id || 'F').charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', lineHeight: '1.25' }}>
                                  {item.staff_name || 'Faculty Member'}
                                </div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 7px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                                  <span>Staff ID:</span>
                                  <span style={{ fontFamily: 'monospace', color: 'hsl(var(--primary))' }}>{item.staff_id || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{item.Designation || 'N/A'}</td>
                          <td>{getDeptWithAcronym(item.Department)}</td>
                          <td style={{ fontWeight: 600, color: '#0369a1' }}>{item.area_of_specialization || 'N/A'}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.aicte_id || 'N/A'}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.anna_univ_id || 'N/A'}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.apaar_id || 'N/A'}</td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                              onClick={() => setSelectedFacultyTarget(item)}
                            >
                              <Eye size={14} /> {auth.role === 'dept_admin' ? 'View Details' : 'View & Edit'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal View for Selected Faculty Member */}
          {selectedFacultyTarget && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '2px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selectedFacultyTarget.file || selectedFacultyTarget.profile_pic ? (
                        <img 
                          src={`${API_BASE_URL}/uploads/upload/${selectedFacultyTarget.file || selectedFacultyTarget.profile_pic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}`} 
                          alt={selectedFacultyTarget.staff_name || 'Faculty'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div style={{ display: (selectedFacultyTarget.file || selectedFacultyTarget.profile_pic) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.2rem' }}>
                        {(selectedFacultyTarget.staff_name || selectedFacultyTarget.staff_id || 'F').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{selectedFacultyTarget.staff_name || 'Faculty Member'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                          Staff ID: {selectedFacultyTarget.staff_id}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Dept: {getDeptWithAcronym(selectedFacultyTarget.Department)}</span>
                        {selectedFacultyTarget.Designation && (
                          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>• {selectedFacultyTarget.Designation}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedFacultyTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                </div>

                <form onSubmit={(e) => auth.role === 'dept_admin' ? setSelectedFacultyTarget(null) : handleSaveAcademicInfo(e, selectedFacultyTarget)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0369a1', marginBottom: '12px' }}>Academic & Research Specialization (NBA Criterion 5)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Primary Area of Specialization</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. High Performance Computing, Big Data and Data Science" 
                          disabled={auth.role === 'dept_admin'} 
                          value={selectedFacultyTarget.area_of_specialization || ''} 
                          onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, area_of_specialization: e.target.value })} 
                        />
                      </div>
                    </div>

                    {auth.role === 'admin' ? (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }}>
                        <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Institutional & Cadre Designations (Admin Only)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Date Designated as Prof / Assoc Prof</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              value={selectedFacultyTarget.date_designated_prof || ''} 
                              onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, date_designated_prof: e.target.value })} 
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Nature of Association</label>
                            <select 
                              className="form-control" 
                              value={selectedFacultyTarget.nature_of_association || 'REGULAR'} 
                              onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, nature_of_association: e.target.value })}
                            >
                              <option value="REGULAR">REGULAR</option>
                              <option value="CONTRACT">CONTRACT</option>
                              <option value="ADJUNCT">ADJUNCT</option>
                              <option value="VISITING">VISITING</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>If Contractual (Full time / Part time)</label>
                            <select 
                              className="form-control" 
                              value={selectedFacultyTarget.contractual_type || '-'} 
                              onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, contractual_type: e.target.value })}
                            >
                              <option value="-">- (Not Applicable / Regular)</option>
                              <option value="Full time">Full time</option>
                              <option value="Part time">Part time</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Date of Leaving (Relieved Date)</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              value={selectedFacultyTarget.date_of_leaving || ''} 
                              onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, date_of_leaving: e.target.value })} 
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                          Nature: {selectedFacultyTarget.nature_of_association || 'REGULAR'}
                        </span>
                        {selectedFacultyTarget.date_designated_prof && (
                          <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                            Designated as Prof: {selectedFacultyTarget.date_designated_prof}
                          </span>
                        )}
                        {selectedFacultyTarget.contractual_type && selectedFacultyTarget.contractual_type !== '-' && (
                          <span className="badge badge-secondary" style={{ fontSize: '0.8rem' }}>
                            Mode: {selectedFacultyTarget.contractual_type}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0369a1', marginBottom: '12px' }}>Regulatory & Institutional Identification</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '14px' }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>AICTE Faculty ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.aicte_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, aicte_id: e.target.value })} required />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Anna University ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.anna_univ_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, anna_univ_id: e.target.value })} required />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>APAAR ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.apaar_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, apaar_id: e.target.value })} required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0369a1', marginBottom: '12px' }}>Publication & Research Profile Identifiers</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>ORCID ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.orcid_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, orcid_id: e.target.value })} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Google Scholar Profile ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.scholar_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, scholar_id: e.target.value })} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Scopus Author ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.scopus_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, scopus_id: e.target.value })} />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Web of Science Researcher ID</label>
                        <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.wos_id || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, wos_id: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedFacultyTarget(null)}>Close</button>
                    {auth.role !== 'dept_admin' && (
                      <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>Save Academic Info</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* REGULAR FACULTY VIEW */
        loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading academic information...</div>
        ) : personal ? (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                Academic Information
              </h3>
              <ReportButtons 
                pageTitle="Academic Information" 
                departmentName={auth.dept || auth.department || (academics && academics.Department) || ''} 
                headers={['Parameter', 'Academic Identification Number']} 
                rows={[
                  ['Staff User ID', personal.staff_id || ''],
                  ['Staff Full Name', personal.staff_name || ''],
                  ['Designation', (academics && academics.Designation) || personal.Designation || 'Faculty'],
                  ['AICTE Faculty ID', personal.aicte_id || 'N/A'],
                  ['Anna University ID', personal.anna_univ_id || 'N/A'],
                  ['APAAR ID', personal.apaar_id || 'N/A']
                ]} 
                auth={auth}
              />
            </div>

            {/* Profile Identity Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ position: 'relative', width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '2px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {auth?.profilePic ? (
                  <img 
                    src={`${API_BASE_URL}/uploads/upload/${auth.profilePic}?token=${auth.token}`} 
                    alt={auth.name || 'Profile'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ display: auth?.profilePic ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.2rem' }}>
                  {(auth.name || auth.staffId || 'F').charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{auth.name || personal.staff_name || 'Faculty Member'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                    Staff ID: {auth.staffId || personal.staff_id}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{auth.designation || (academics && academics.Designation) || 'Faculty'}</span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>• {getDeptWithAcronym(auth.dept || auth.department || (academics && academics.Department))}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveAcademicInfo} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '14px', borderBottom: '2px solid #e0f2fe', paddingBottom: '6px' }}>
                  Academic & Research Specialization (Faculty Facility)
                </h4>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                    Primary Area of Specialization <span style={{ color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 500 }}>(e.g. High Performance Computing, Big Data And Data Science, Cloud Computing, Image Processing)</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter your primary area of research & specialization..." 
                    value={academics?.area_of_specialization || personal?.area_of_specialization || ''} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setAcademics({ ...(academics || {}), area_of_specialization: val });
                      setPersonal({ ...(personal || {}), area_of_specialization: val });
                    }} 
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    * This field directly populates the <strong>Area of Specialization</strong> column in NBA/AICTE Department Faculty Details Criterion 5 (Form B2).
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '14px', borderBottom: '2px solid #e0f2fe', paddingBottom: '6px' }}>
                  Institutional & Regulatory Identifiers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      AICTE Faculty ID <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 1-12345678" 
                      value={personal.aicte_id || ''} 
                      onChange={(e) => setPersonal({ ...personal, aicte_id: e.target.value })} 
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Anna University ID <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. AU-9876" 
                      value={personal.anna_univ_id || ''} 
                      onChange={(e) => setPersonal({ ...personal, anna_univ_id: e.target.value })} 
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      APAAR ID <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. APAAR-5432" 
                      value={personal.apaar_id || ''} 
                      onChange={(e) => setPersonal({ ...personal, apaar_id: e.target.value })} 
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '14px', borderBottom: '2px solid #e0f2fe', paddingBottom: '6px' }}>
                  Publication & Research Profile Identifiers (Bibliometric Sync)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      ORCID ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 0000-0002-1825-0097" 
                      value={academics?.orcid_id || personal.orcid_id || ''} 
                      onChange={(e) => setAcademics({ ...(academics || {}), orcid_id: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Google Scholar Profile ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. qc64620AAAAJ" 
                      value={academics?.scholar_id || personal.scholar_id || ''} 
                      onChange={(e) => setAcademics({ ...(academics || {}), scholar_id: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Scopus Author ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 57200214800" 
                      value={academics?.scopus_id || personal.scopus_id || ''} 
                      onChange={(e) => setAcademics({ ...(academics || {}), scopus_id: e.target.value })} 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                      Web of Science Researcher ID
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. AAH-1234-2020" 
                      value={academics?.wos_id || personal.wos_id || ''} 
                      onChange={(e) => setAcademics({ ...(academics || {}), wos_id: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 700, fontSize: '0.95rem' }}>
                  Save Academic Information
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>Academic details not found.</div>
        )
      )}
    </div>
  );
}
