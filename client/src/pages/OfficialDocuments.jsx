import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Dropzone from '../components/Dropzone';
import ReportButtons from '../components/ReportButtons';
import { FileText, Download, ShieldCheck, Search, Upload, CheckCircle2 } from 'lucide-react';

export default function OfficialDocuments({ auth }) {
  const [personal, setPersonal] = useState({
    pan_file: '',
    aadhar_file: '',
    appointment_order_file: '',
    joining_report_file: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Selected files for saving
  const [selectedFiles, setSelectedFiles] = useState({
    pan_file: null,
    aadhar_file: null,
    appointment_order_file: null,
    joining_report_file: null
  });

  const [savingDoc, setSavingDoc] = useState({
    pan_file: false,
    aadhar_file: false,
    appointment_order_file: false,
    joining_report_file: false
  });

  // Admin / Dept Admin State
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [personalList, setPersonalList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [auth]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      if (auth.role === 'dept_admin' || auth.role === 'admin') {
        const deptsRes = await fetch('http://localhost:5001/api/admin/departments', {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData || []);
        }

        const listRes = await fetch('http://localhost:5001/api/faculty/personal', {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          setPersonalList(listData || []);
        }
      } else {
        const res = await fetch('http://localhost:5001/api/faculty/personal', {
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

    setMessage('');
    setError('');
    setSavingDoc(prev => ({ ...prev, [docType]: true }));

    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('docType', docType);

      const res = await fetch('http://localhost:5001/api/faculty/personal/upload-doc', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload and save document proof');

      const labelMap = {
        pan_file: 'PAN Card Proof',
        aadhar_file: 'Aadhaar Card Proof',
        appointment_order_file: 'Appointment Order Proof',
        joining_report_file: 'Joining Report Proof'
      };

      setMessage(`${labelMap[docType] || 'Document'} saved and uploaded successfully!`);
      setPersonal(prev => ({ ...prev, [docType]: data.fileName }));
      setSelectedFiles(prev => ({ ...prev, [docType]: null }));
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      setError(err.message);
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

      {message && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--success), 0.15)', border: '1px solid hsla(var(--success), 0.3)', color: 'hsl(var(--success))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--danger), 0.15)', border: '1px solid hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {error}
        </div>
      )}

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
                  View and download official identity cards, appointment orders, and joining reports uploaded by department faculty.
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
                  headers={['Staff ID', 'Staff Name', 'Designation', 'Department', 'PAN Proof', 'Aadhaar Proof', 'Appointment Order', 'Joining Report']} 
                  rows={searchedPersonalList.map(f => [
                    f.staff_id,
                    f.staff_name,
                    f.Designation || 'N/A',
                    f.Department || 'N/A',
                    f.pan_file ? 'Uploaded' : 'Not Uploaded',
                    f.aadhar_file ? 'Uploaded' : 'Not Uploaded',
                    f.appointment_order_file ? 'Uploaded' : 'Not Uploaded',
                    f.joining_report_file ? 'Uploaded' : 'Not Uploaded'
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
          <div className="card" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading official documents status...</div>
            ) : (
              <div className="table-container">
                <table style={{ width: '100%', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Faculty Name</th>
                      <th>Designation</th>
                      <th>Department</th>
                      <th>PAN Card Proof</th>
                      <th>Aadhaar Card Proof</th>
                      <th>Appointment Order</th>
                      <th>Joining Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchedPersonalList.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 500 }}>
                          No faculty document records match your search filter.
                        </td>
                      </tr>
                    ) : (
                      searchedPersonalList.map((f) => (
                        <tr key={f.staff_id}>
                          <td style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{f.staff_id}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{f.staff_name}</td>
                          <td><span className="badge badge-success">{f.Designation || 'N/A'}</span></td>
                          <td><span className="badge badge-secondary">{f.Department || 'N/A'}</span></td>
                          <td>
                            {f.pan_file ? (
                              <a
                                href={`${API_BASE_URL}/uploads/document/${f.pan_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                          <td>
                            {f.aadhar_file ? (
                              <a
                                href={`${API_BASE_URL}/uploads/document/${f.aadhar_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                          <td>
                            {f.appointment_order_file ? (
                              <a
                                href={`${API_BASE_URL}/uploads/document/${f.appointment_order_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                          <td>
                            {f.joining_report_file ? (
                              <a
                                href={`${API_BASE_URL}/uploads/document/${f.joining_report_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
              Official Identity & Employment Proof Documents
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              Upload and save your official identity cards, appointment orders, and joining reports.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {/* 1. PAN Card Proof */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>PAN Card Proof</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Upload PAN card copy (PDF / Image)</span>
                </div>
                {personal.pan_file ? (
                  <a
                    href={`${API_BASE_URL}/uploads/document/${personal.pan_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                onFileSelect={(f) => handleFileSelect(f, 'pan_file')}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Upload / Change PAN Card Proof"
              />

              {selectedFiles.pan_file && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveDoc('pan_file')}
                  disabled={savingDoc.pan_file}
                  style={{ fontWeight: 700, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Upload size={16} />
                  {savingDoc.pan_file ? 'Saving Document...' : 'Save & Upload PAN Card'}
                </button>
              )}
            </div>

            {/* 2. Aadhaar Card Proof */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Aadhaar Card Proof</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Upload Aadhaar card copy (PDF / Image)</span>
                </div>
                {personal.aadhar_file ? (
                  <a
                    href={`${API_BASE_URL}/uploads/document/${personal.aadhar_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                onFileSelect={(f) => handleFileSelect(f, 'aadhar_file')}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Upload / Change Aadhaar Card Proof"
              />

              {selectedFiles.aadhar_file && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveDoc('aadhar_file')}
                  disabled={savingDoc.aadhar_file}
                  style={{ fontWeight: 700, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Upload size={16} />
                  {savingDoc.aadhar_file ? 'Saving Document...' : 'Save & Upload Aadhaar Card'}
                </button>
              )}
            </div>

            {/* 3. Appointment Order Proof */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Appointment Order Proof</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Upload Appointment Order (PDF / Image)</span>
                </div>
                {personal.appointment_order_file ? (
                  <a
                    href={`${API_BASE_URL}/uploads/document/${personal.appointment_order_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                onFileSelect={(f) => handleFileSelect(f, 'appointment_order_file')}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Upload / Change Appointment Order"
              />

              {selectedFiles.appointment_order_file && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveDoc('appointment_order_file')}
                  disabled={savingDoc.appointment_order_file}
                  style={{ fontWeight: 700, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Upload size={16} />
                  {savingDoc.appointment_order_file ? 'Saving Document...' : 'Save & Upload Appointment Order'}
                </button>
              )}
            </div>

            {/* 4. Joining Report Proof */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>Joining Report Proof</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Upload Joining Report (PDF / Image)</span>
                </div>
                {personal.joining_report_file ? (
                  <a
                    href={`${API_BASE_URL}/uploads/document/${personal.joining_report_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
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
                onFileSelect={(f) => handleFileSelect(f, 'joining_report_file')}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Upload / Change Joining Report"
              />

              {selectedFiles.joining_report_file && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSaveDoc('joining_report_file')}
                  disabled={savingDoc.joining_report_file}
                  style={{ fontWeight: 700, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Upload size={16} />
                  {savingDoc.joining_report_file ? 'Saving Document...' : 'Save & Upload Joining Report'}
                </button>
              )}
            </div>
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
