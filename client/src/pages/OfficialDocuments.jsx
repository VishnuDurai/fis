import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Dropzone from '../components/Dropzone';
import ReportButtons from '../components/ReportButtons';
import { showSuccess, showError } from '../context/AlertContext';
import { FileText, Download, ShieldCheck, Search, Upload, CheckCircle2 } from 'lucide-react';

export default function OfficialDocuments({ auth }) {
  const [personal, setPersonal] = useState({
    pan_file: '',
    aadhar_file: '',
    appointment_order_file: '',
    joining_report_file: '',
    passport_file: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Selected files for saving
  const [selectedFiles, setSelectedFiles] = useState({});
  const [savingDoc, setSavingDoc] = useState({});

  // System Page Config for Dynamic Field Visibility
  const [sysPageConfig, setSysPageConfig] = useState(null);

  // Admin / Dept Admin State
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [personalList, setPersonalList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultDocCards = [
    { key: 'pan_file', label: 'PAN Card Proof Document', subLabel: 'Upload PAN card copy (PDF / Image)' },
    { key: 'aadhar_file', label: 'Aadhaar Card Proof Document', subLabel: 'Upload Aadhaar card copy (PDF / Image)' },
    { key: 'appointment_order_file', label: 'Appointment Order Proof Document', subLabel: 'Upload Appointment Order (PDF / Image)' },
    { key: 'joining_report_file', label: 'Joining Report Proof Document', subLabel: 'Upload Joining Report (PDF / Image)' },
    { key: 'passport_file', label: 'Passport Proof Document', subLabel: 'Upload Passport copy (PDF / Image)' }
  ];

  useEffect(() => {
    fetchDetails();
    fetch(`${API_BASE_URL}/api/system-page-configs/documents`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSysPageConfig(data); })
      .catch(err => console.error('SysPageConfig fetch error:', err));
  }, [auth]);

  const activeDocCards = useMemo(() => {
    const sysFields = sysPageConfig?.fields || [];
    if (sysFields.length === 0) return defaultDocCards;

    const result = [];
    sysFields.forEach(sf => {
      if (sf.status === 'hidden') return;
      const matched = defaultDocCards.find(d => d.key === sf.name);
      if (matched) {
        result.push({
          ...matched,
          label: sf.label || matched.label,
          required: sf.required
        });
      } else {
        result.push({
          key: sf.name,
          label: sf.label,
          subLabel: `Upload ${sf.label} copy (PDF / Image)`,
          required: sf.required
        });
      }
    });
    return result;
  }, [sysPageConfig]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      if (auth.role === 'dept_admin' || auth.role === 'admin') {
        const deptsRes = await fetch(`${API_BASE_URL}/api/admin/departments`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData || []);
        }

        const listRes = await fetch(`${API_BASE_URL}/api/faculty/personal`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          setPersonalList(listData || []);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/faculty/personal`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPersonal(Array.isArray(data) ? (data[0] || {}) : (data || {}));
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fileObj, docType) => {
    setSelectedFiles(prev => ({ ...prev, [docType]: fileObj }));
  };

  const handleSaveDoc = async (docType) => {
    const fileObj = selectedFiles[docType];
    if (!fileObj) return;

    setSavingDoc(prev => ({ ...prev, [docType]: true }));

    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('docType', docType);

      const res = await fetch(`${API_BASE_URL}/api/faculty/personal/upload-doc`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload and save document proof');

      const cardMatch = activeDocCards.find(c => c.key === docType);
      const cardLabel = cardMatch ? cardMatch.label : 'Document';

      showSuccess(`${cardLabel} saved and uploaded successfully!`);
      setPersonal(prev => ({ ...prev, [docType]: data.fileName }));
      setSelectedFiles(prev => ({ ...prev, [docType]: null }));
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      showError(err.message);
    } finally {
      setSavingDoc(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleSaveAllDocs = async () => {
    const docTypes = Object.keys(selectedFiles).filter(key => Boolean(selectedFiles[key]));
    if (docTypes.length === 0) return;

    for (const docType of docTypes) {
      await handleSaveDoc(docType);
    }
  };

  const filteredPersonalList = personalList.filter(item => {
    if (selectedDepartment) {
      const itemDept = (item.Department || '').trim().toLowerCase();
      const selDept = selectedDepartment.trim().toLowerCase();
      const matches = itemDept === selDept || departments.some(d => 
        (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && 
        (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept)
      );
      if (!matches) return false;
    }
    return true;
  });

  const searchedPersonalList = filteredPersonalList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.staff_name || '').toLowerCase().includes(q) ||
      (item.staff_id || '').toLowerCase().includes(q) ||
      (item.Designation || '').toLowerCase().includes(q) ||
      (item.Department || '').toLowerCase().includes(q)
    );
  });

  const hasAnySelectedFile = Object.values(selectedFiles).some(Boolean);

  return (
    <div>
      <Navbar title="Official Documents" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {/* ADMIN & DEPT ADMIN TABLE VIEW */}
      {(auth.role === 'admin' || auth.role === 'dept_admin') ? (
        <>
          {/* Header Controls Bar */}
          <div className="card" style={{ marginBottom: '24px', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={20} style={{ color: 'hsl(var(--primary))' }} />
                  Faculty Official Proof Documents Status
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  View and download official identity cards, appointment orders, joining reports, and passport proofs uploaded by department faculty.
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
                    placeholder="Search by ID, Name, Designation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <ReportButtons 
                  pageTitle="Official Proof Documents Directory" 
                  departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
                  headers={['Staff ID', 'Staff Name', 'Designation', 'Department', ...activeDocCards.map(c => c.label)]} 
                  rows={searchedPersonalList.map(f => [
                    f.staff_id,
                    f.staff_name,
                    f.Designation || 'N/A',
                    f.Department || 'N/A',
                    ...activeDocCards.map(c => f[c.key] ? 'Uploaded' : 'Not Uploaded')
                  ])} 
                  auth={auth}
                />
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', whiteSpace: 'nowrap' }}>
                Total Records: {searchedPersonalList.length}
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading faculty official documents directory...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', margin: 0, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 18px', textTransform: 'uppercase', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Staff Info</th>
                      <th style={{ padding: '14px 18px', textTransform: 'uppercase', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Department</th>
                      {activeDocCards.map(c => (
                        <th key={c.key} style={{ padding: '14px 18px', textTransform: 'uppercase', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {searchedPersonalList.length === 0 ? (
                      <tr>
                        <td colSpan={2 + activeDocCards.length} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No matching faculty records found.
                        </td>
                      </tr>
                    ) : (
                      searchedPersonalList.map((f, idx) => (
                        <tr key={f.staff_id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{f.staff_name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{f.staff_id} • {f.Designation || 'Faculty'}</div>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                            {f.Department || 'N/A'}
                          </td>
                          {activeDocCards.map(c => (
                            <td key={c.key} style={{ padding: '14px 18px' }}>
                              {f[c.key] ? (
                                <a
                                  href={`${API_BASE_URL}/uploads/document/${f[c.key]}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-secondary"
                                  style={{ padding: '5px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                                >
                                  <Download size={14} /> View File
                                </a>
                              ) : (
                                <span className="badge badge-secondary" style={{ opacity: 0.75 }}>Not Uploaded</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* REGULAR FACULTY PERSONAL PROOF DOCUMENTS UPLOAD CARDS */
        <div className="card" style={{ padding: '28px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={22} style={{ color: 'hsl(var(--primary))' }} />
              Official Identity &amp; Employment Proof Documents
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Upload and save your official identity cards, appointment orders, joining reports, and passport proofs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {activeDocCards.map(card => {
              const docKey = card.key;
              const fileVal = personal ? personal[docKey] : '';
              const isSelected = Boolean(selectedFiles[docKey]);
              const isSaving = Boolean(savingDoc[docKey]);

              return (
                <div key={docKey} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {card.label}
                        {card.required && <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{card.subLabel}</span>
                    </div>
                    {fileVal ? (
                      <a
                        href={`${API_BASE_URL}/uploads/document/${fileVal}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                      >
                        <Download size={15} /> View Saved File
                      </a>
                    ) : (
                      <span className="badge badge-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>Not Uploaded</span>
                    )}
                  </div>
                  
                  <Dropzone
                    onFileSelect={(f) => handleFileSelect(f, docKey)}
                    accept=".pdf,.png,.jpg,.jpeg"
                    label={`Upload / Change ${card.label}`}
                  />

                  {isSelected && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSaveDoc(docKey)}
                      disabled={isSaving}
                      style={{ fontWeight: 700, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Upload size={16} />
                      {isSaving ? 'Saving Document...' : `Save & Upload ${card.label}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save All Button Footer */}
          {hasAnySelectedFile && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAllDocs}
                style={{ padding: '12px 32px', fontWeight: 800, fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
              >
                <Upload size={18} /> Save All Uploaded Documents
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
