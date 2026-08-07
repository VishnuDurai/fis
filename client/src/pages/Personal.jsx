import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, User, Download, FileText, Check, Mail, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import EditableField from '../components/EditableField.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { validateEmail, validateMobile, validatePan, validateAadhar } from '../utils/validators.js';

export default function Personal({ auth }) {
  const [personal, setPersonal] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [personalList, setPersonalList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacultyTarget, setSelectedFacultyTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [initialEmail, setInitialEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendEmailOtp = async () => {
    setOtpError('');
    setOtpMessage('');
    const emailToVerify = personal?.email ? personal.email.trim() : '';

    if (!emailToVerify) {
      setError('Please enter an email address to verify.');
      return;
    }

    const emailErr = validateEmail(emailToVerify);
    if (emailErr) {
      setFieldErrors(prev => ({ ...prev, email: emailErr }));
      return;
    }

    setOtpSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/personal/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ email: emailToVerify, staffId: auth.staffId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification OTP');

      setShowOtpModal(true);
      setOtpInput('');
      setOtpMessage(data.message || `Verification code sent to ${emailToVerify}`);
      setOtpCountdown(60);
    } catch (err) {
      setOtpError(err.message);
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setOtpError('');
    setOtpMessage('');
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/personal/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ email: personal.email, otp: otpInput, staffId: auth.staffId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setVerifiedEmail((data.verifiedEmail || personal.email).trim().toLowerCase());
      setShowOtpModal(false);
      setOtpInput('');
      setMessage('Email address verified successfully! You can now save your personal details.');
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handlePersonalDocUpload = async (fileObj, docType, targetStaffId = null) => {
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('docType', docType);
      if (targetStaffId) {
        formData.append('staffId', targetStaffId);
      }

      const res = await fetch(`${API_BASE_URL}/api/faculty/personal/upload-doc`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload document proof');

      const labelMap = {
        pan_file: 'PAN Card',
        aadhar_file: 'Aadhaar Card',
        appointment_order_file: 'Appointment Order',
        joining_report_file: 'Joining Report'
      };

      setMessage(`${labelMap[docType] || 'Document'} proof uploaded successfully!`);
      if (targetStaffId && selectedFacultyTarget) {
        setSelectedFacultyTarget(prev => ({ ...prev, [docType]: data.fileName }));
        setPersonalList(prev => prev.map(p => p.staff_id === targetStaffId ? { ...p, [docType]: data.fileName } : p));
      } else {
        setPersonal(prev => ({ ...prev, [docType]: data.fileName }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDetails = async (targetId) => {
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
          const pRecord = data && data.length > 0 ? data[0] : null;
          setPersonal(pRecord);
          if (pRecord && pRecord.email) {
            setInitialEmail(pRecord.email);
          }
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAcademics(aData && aData.length > 0 ? aData[0] : null);
        }
      }
    } catch (err) {
      console.error('Error fetching profile details:', err);
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

  const handleSaveAllPersonalDetails = async (e, targetItem = personal) => {
    if (e) e.preventDefault();
    setMessage('');
    setError('');
    setFieldErrors({});

    if (targetItem) {
      const errs = {};
      if (!targetItem.dob) errs.dob = 'Date of Birth is mandatory';
      
      if (!targetItem.mobile || !targetItem.mobile.trim()) {
        errs.mobile = 'Mobile Number is mandatory';
      } else {
        const mErr = validateMobile(targetItem.mobile);
        if (mErr) errs.mobile = mErr;
      }

      if (!targetItem.email || !targetItem.email.trim()) {
        errs.email = 'Email ID is mandatory';
      } else {
        const eErr = validateEmail(targetItem.email);
        if (eErr) {
          errs.email = eErr;
        } else if (auth.role === 'faculty') {
          const currentSavedEmail = (initialEmail || '').trim().toLowerCase();
          const inputEmail = (targetItem.email || '').trim().toLowerCase();
          if (inputEmail !== currentSavedEmail && inputEmail !== verifiedEmail) {
            errs.email = 'Email verification required. Please click "Verify Email" to verify your email via OTP before saving.';
          }
        }
      }

      if (!targetItem.pan || !targetItem.pan.trim()) {
        errs.pan = 'PAN Card Number is mandatory';
      } else {
        const pErr = validatePan(targetItem.pan);
        if (pErr) errs.pan = pErr;
      }

      if (!targetItem.aadhar || !targetItem.aadhar.trim()) {
        errs.aadhar = 'Aadhar Number is mandatory';
      } else {
        const aErr = validateAadhar(targetItem.aadhar);
        if (aErr) errs.aadhar = aErr;
      }

      if (!targetItem.address || !targetItem.address.trim()) {
        errs.address = 'Contact Address is mandatory';
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
    }

    const targetStaffId = targetItem?.staff_id || auth.staffId;

    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/personal/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staffId: targetStaffId,
          dob: targetItem?.dob || '',
          gender: targetItem?.gender || 'Male',
          address: targetItem?.address || '',
          mobile: targetItem?.mobile || '',
          email: targetItem?.email || '',
          pan: targetItem?.pan || '',
          aadhar: targetItem?.aadhar || '',
          aicte_id: targetItem?.aicte_id || '',
          anna_univ_id: targetItem?.anna_univ_id || '',
          apaar_id: targetItem?.apaar_id || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update personal details');

      setMessage('Personal details saved successfully!');
      if (targetItem?.email) {
        setInitialEmail(targetItem.email);
        setVerifiedEmail(targetItem.email.trim().toLowerCase());
      }
      if (selectedFacultyTarget) setSelectedFacultyTarget(null);
      fetchDetails();
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const [selectedDepartment, setSelectedDepartment] = useState('');

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
      (item.email || '').toLowerCase().includes(q) ||
      (item.mobile || '').toLowerCase().includes(q) ||
      (item.pan || '').toLowerCase().includes(q) ||
      (item.aadhar || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Navbar title="Personal Details" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

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
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Faculty Personal Details Directory</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>View DOB, Gender, Mobile, PAN, Aadhaar, and Contact Address details of department faculty</p>
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
                    placeholder="Search by ID, Name, PAN, Aadhar, Mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '38px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <ReportButtons 
                  pageTitle="Faculty Personal Directory" 
                  departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
                  headers={['Staff ID', 'Staff Name', 'Department', 'DOB', 'Gender', 'Email ID', 'Mobile', 'PAN Number', 'Aadhaar Number', 'Address']} 
                  rows={filteredPersonalList.map(f => [
                    f.staff_id,
                    f.staff_name,
                    f.Department || 'N/A',
                    f.dob || 'N/A',
                    f.gender || 'N/A',
                    f.email || 'N/A',
                    f.mobile || 'N/A',
                    f.pan || 'N/A',
                    f.aadhar || 'N/A',
                    f.address || 'N/A'
                  ])} 
                  auth={auth}
                />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))', whiteSpace: 'nowrap' }}>
                Total Records: {filteredPersonalList.length}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading faculty personal details...</div>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Date of Birth & Gender</th>
                    <th>Email & Mobile</th>
                    <th>PAN & Aadhaar</th>
                    <th>Contact Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonalList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 500 }}>
                        No faculty personal records match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPersonalList.map((item) => (
                      <tr key={item.staff_id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.staff_name || 'N/A'}</td>
                        <td style={{ fontWeight: 600 }}>{item.Designation || 'N/A'}</td>
                        <td>{getDeptWithAcronym(item.Department)}</td>
                        <td style={{ fontWeight: 600 }}>{item.dob || 'N/A'} ({item.gender || 'Male'})</td>
                        <td style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          <div><strong style={{ color: '#0f172a' }}>Email:</strong> {item.email || 'N/A'}</div>
                          <div><strong style={{ color: '#0f172a' }}>Mobile:</strong> {item.mobile || 'N/A'}</div>
                        </td>
                        <td style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          <div><strong style={{ color: '#0f172a' }}>PAN:</strong> {item.pan || 'N/A'}</div>
                          <div><strong style={{ color: '#0f172a' }}>Aadhaar:</strong> {item.aadhar || 'N/A'}</div>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.address || 'N/A'}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal View for Selected Faculty Member */}
          {selectedFacultyTarget && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>Personal Details: {selectedFacultyTarget.staff_name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 700 }}>Staff ID: {selectedFacultyTarget.staff_id} | Dept: {selectedFacultyTarget.Department}</span>
                  </div>
                  <button onClick={() => setSelectedFacultyTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
                </div>

                <form onSubmit={(e) => auth.role === 'dept_admin' ? setSelectedFacultyTarget(null) : handleSaveAllPersonalDetails(e, selectedFacultyTarget)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                    <div>
                      <label className="form-label">Date of Birth</label>
                      <input type="date" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.dob || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, dob: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">Gender</label>
                      <select className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.gender || 'Male'} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, gender: e.target.value })} required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Mobile Number</label>
                      <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.mobile || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, mobile: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">Email ID</label>
                      <input type="email" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.email || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, email: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">PAN Card Number</label>
                      <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.pan || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, pan: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">Aadhar Number</label>
                      <input type="text" className="form-control" disabled={auth.role === 'dept_admin'} value={selectedFacultyTarget.aadhar || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, aadhar: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Contact Address</label>
                    <textarea className="form-control" disabled={auth.role === 'dept_admin'} rows="2" value={selectedFacultyTarget.address || ''} onChange={(e) => setSelectedFacultyTarget({ ...selectedFacultyTarget, address: e.target.value })} required></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedFacultyTarget(null)}>Close</button>
                    {auth.role !== 'dept_admin' && (
                      <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>Save Personal Details</button>
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
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading personal profile...</div>
        ) : personal ? (
          <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                Personal Details
              </h3>
              <ReportButtons 
                pageTitle="Personal Details" 
                departmentName={auth.dept || auth.department || (academics && academics.Department) || ''} 
                headers={['Personal Parameter', 'Registered Value']} 
                rows={[
                  ['Staff User ID', personal.staff_id || ''],
                  ['Staff Full Name', personal.staff_name || ''],
                  ['Date of Birth', personal.dob || 'N/A'],
                  ['Gender', personal.gender || 'N/A'],
                  ['Mobile Number', personal.mobile || 'N/A'],
                  ['Email ID', personal.email || 'N/A'],
                  ['PAN Card Number', personal.pan || 'N/A'],
                  ['Aadhaar Number', personal.aadhar || 'N/A'],
                  ['Contact Address', personal.address || 'N/A']
                ]} 
                auth={auth}
              />
            </div>
            
            <form onSubmit={handleSaveAllPersonalDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Date of Birth <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    style={{ borderColor: fieldErrors.dob ? '#dc2626' : undefined }}
                    value={personal.dob || ''} 
                    onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} 
                    required
                  />
                  {fieldErrors.dob && (
                    <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {fieldErrors.dob}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Gender <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <select 
                    className="form-control" 
                    value={personal.gender || 'Male'} 
                    onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Mobile Number <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Mobile Number" 
                    style={{ borderColor: fieldErrors.mobile ? '#dc2626' : undefined }}
                    value={personal.mobile || ''} 
                    onChange={(e) => setPersonal({ ...personal, mobile: e.target.value })} 
                    required
                  />
                  {fieldErrors.mobile && (
                    <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {fieldErrors.mobile}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>
                      Email ID <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                    </label>
                    {((personal.email || '').trim().toLowerCase() === (initialEmail || '').trim().toLowerCase() || (personal.email || '').trim().toLowerCase() === (verifiedEmail || '').trim().toLowerCase()) ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Check size={12} /> Verified
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <AlertCircle size={12} /> Verification Required
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Email Address (e.g. faculty@srec.ac.in)" 
                      style={{ borderColor: fieldErrors.email ? '#dc2626' : ((personal.email || '').trim().toLowerCase() !== (initialEmail || '').trim().toLowerCase() && (personal.email || '').trim().toLowerCase() !== (verifiedEmail || '').trim().toLowerCase() ? '#f59e0b' : undefined), flex: 1 }}
                      value={personal.email || ''} 
                      onChange={(e) => setPersonal({ ...personal, email: e.target.value })} 
                      required
                    />
                    {((personal.email || '').trim().toLowerCase() !== (initialEmail || '').trim().toLowerCase() && (personal.email || '').trim().toLowerCase() !== (verifiedEmail || '').trim().toLowerCase()) && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={otpSending}
                        onClick={handleSendEmailOtp}
                        style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0f5233' }}
                      >
                        <Mail size={15} /> {otpSending ? 'Sending...' : 'Verify Email'}
                      </button>
                    )}
                  </div>
                  {fieldErrors.email && (
                    <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    PAN Card Number <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="PAN Number" 
                    style={{ borderColor: fieldErrors.pan ? '#dc2626' : undefined }}
                    value={personal.pan || ''} 
                    onChange={(e) => setPersonal({ ...personal, pan: e.target.value })} 
                    required
                  />
                  {fieldErrors.pan && (
                    <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {fieldErrors.pan}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Aadhar Card Number <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Aadhar Number" 
                    style={{ borderColor: fieldErrors.aadhar ? '#dc2626' : undefined }}
                    value={personal.aadhar || ''} 
                    onChange={(e) => setPersonal({ ...personal, aadhar: e.target.value })} 
                    required
                  />
                  {fieldErrors.aadhar && (
                    <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {fieldErrors.aadhar}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Contact Address <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                </label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Enter full contact address..." 
                  style={{ borderColor: fieldErrors.address ? '#dc2626' : undefined }}
                  value={personal.address || ''} 
                  onChange={(e) => setPersonal({ ...personal, address: e.target.value })} 
                  required
                />
                {fieldErrors.address && (
                  <span style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {fieldErrors.address}
                  </span>
                )}
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 700, fontSize: '0.95rem' }}>
                  Save Personal Details
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>Personal details not found.</div>
        )
      )}
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%', background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#e6f4ea', color: '#15583b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>Verify Email Address</h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Enter 6-digit OTP code</span>
                </div>
              </div>
              <button onClick={() => setShowOtpModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '16px', lineHeight: '1.5' }}>
              A 6-digit verification OTP code has been sent to:<br />
              <strong style={{ color: '#0f5233', fontSize: '0.95rem' }}>{personal?.email}</strong>
            </p>

            {otpError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
                {otpError}
              </div>
            )}

            {otpMessage && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', fontWeight: 600 }}>
                {otpMessage}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>6-Digit Verification Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 123456"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: '6px', fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', padding: '10px', borderRadius: '8px', border: '2px solid #0f5233' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={otpCountdown > 0 || otpSending}
                onClick={handleSendEmailOtp}
                style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} /> {otpCountdown > 0 ? `Resend (${otpCountdown}s)` : 'Resend Code'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={otpVerifying || otpInput.length !== 6}
                onClick={handleVerifyEmailOtp}
                style={{ padding: '8px 20px', fontWeight: 700, fontSize: '0.88rem', background: '#0f5233' }}
              >
                {otpVerifying ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
