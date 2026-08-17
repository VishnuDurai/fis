import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { Search, Eye, X, User, Download, FileText, Check, Mail, ShieldCheck, AlertCircle, RefreshCw, PhoneCall, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import EditableField from '../components/EditableField.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { showSuccess, showError } from '../context/AlertContext.jsx';
import { validateEmail, validateMobile, validatePan, validateAadhar } from '../utils/validators.js';
import { generateAcademicCV } from '../utils/cvGenerator.js';
import { sendFirebaseMobileOtp, verifyFirebaseMobileOtp } from '../config/firebase.js';

export default function Personal({ auth }) {
  const [personal, setPersonal] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [personalList, setPersonalList] = useState([]);
  const [careerHistory, setCareerHistory] = useState([]);
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

  // Mobile Phone Auth OTP State
  const [initialMobile, setInitialMobile] = useState('');
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const [showMobileOtpModal, setShowMobileOtpModal] = useState(false);
  const [mobileOtpInput, setMobileOtpInput] = useState('');
  const [mobileOtpSending, setMobileOtpSending] = useState(false);
  const [mobileOtpVerifying, setMobileOtpVerifying] = useState(false);
  const [mobileOtpError, setMobileOtpError] = useState('');
  const [mobileOtpMessage, setMobileOtpMessage] = useState('');

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
      showError('Please enter an email address to verify.');
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
      showInfo(`Verification code sent to ${emailToVerify}`);
      setOtpCountdown(60);
    } catch (err) {
      setOtpError(err.message);
      showError(err.message);
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
      showSuccess('Email address verified successfully! You can now save your personal details.');
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    } catch (err) {
      setOtpError(err.message);
      showError(err.message);
    } finally {
      setOtpVerifying(false);
    }
  };

  const handlePersonalDocUpload = async (fileObj, docType, targetStaffId = null) => {
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

      showSuccess(`${labelMap[docType] || 'Document'} proof uploaded successfully!`);
      if (targetStaffId && selectedFacultyTarget) {
        setSelectedFacultyTarget(prev => ({ ...prev, [docType]: data.fileName }));
        setPersonalList(prev => prev.map(p => p.staff_id === targetStaffId ? { ...p, [docType]: data.fileName } : p));
      } else {
        setPersonal(prev => ({ ...prev, [docType]: data.fileName }));
      }
    } catch (err) {
      showError(err.message);
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
            fetchCareerHistory(data[0].staff_id);
          }
        }
      } else {
        const [pRes, aRes, cRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/faculty/personal?staffId=${auth.staffId}`, { headers }),
          fetch(`${API_BASE_URL}/api/faculty/academics?staffId=${auth.staffId}`, { headers }),
          fetch(`${API_BASE_URL}/api/faculty/career-history?staffId=${auth.staffId}`, { headers })
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
        if (cRes.ok) {
          const cData = await cRes.json();
          setCareerHistory(Array.isArray(cData) ? cData : []);
        }
      }
    } catch (err) {
      console.error('Error fetching profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerHistory = async (sId) => {
    if (!sId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/career-history?staffId=${sId}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCareerHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
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

      showSuccess('Personal details saved successfully!');
      if (targetItem?.email) {
        setInitialEmail(targetItem.email);
        setVerifiedEmail(targetItem.email.trim().toLowerCase());
      }
      if (selectedFacultyTarget) setSelectedFacultyTarget(null);
      fetchDetails();
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      showError(err.message);
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
                    <th>Faculty Details</th>
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
                              onClick={() => {
                                setSelectedFacultyTarget(item);
                                fetchCareerHistory(item.staff_id);
                              }}
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
              <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
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
          <>
            <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                Personal Details
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => generateAcademicCV(auth)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0f5233' }}
                >
                  <FileText size={16} /> Download Academic CV
                </button>
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
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{auth.name || personal.staff_name || 'Faculty Member'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                    Staff ID: {auth.staffId || personal.staff_id}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{auth.designation || (academics && academics.Designation) || 'Faculty'}</span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>• {getDeptWithAcronym(auth.dept || auth.department || (academics && academics.Department))}</span>
                </div>
              </div>
              <a 
                href="/cv-generator"
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', borderColor: '#c4b5fd', textDecoration: 'none', borderRadius: '10px' }}
              >
                <span>✨ 1-Click AI CV</span>
              </a>
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
                    placeholder="10-digit Mobile Number" 
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

          {/* CAREER PROGRESSION & DESIGNATION HISTORY TIMELINE */}
          <div className="card" style={{ marginTop: '28px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '10px' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                    Career Progression & Designation History
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Official institutional service timeline and promotion milestones
                  </span>
                </div>
              </div>
            </div>

            {careerHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic' }}>
                No designation history milestones recorded yet.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '2.5px solid #16a34a', marginLeft: '12px' }}>
                {careerHistory.map((item, idx) => (
                  <div key={item.id || idx} style={{ position: 'relative', marginBottom: '24px' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-37px',
                      top: '0px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      border: '3px solid #ffffff',
                      boxShadow: '0 0 0 2px #16a34a'
                    }} />

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                          {item.designation}
                        </span>
                        <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.78rem', padding: '3px 8px', borderRadius: '6px' }}>
                          Effective: {item.effective_date ? new Date(item.effective_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span>🏛️ <strong>Dept:</strong> {item.department || personal?.Department || 'SREC'}</span>
                        {item.order_no && <span>📜 <strong>Order No:</strong> {item.order_no}</span>}
                        {item.remarks && <span>💬 <em>{item.remarks}</em></span>}
                      </div>

                      {item.order_file && (
                        <div style={{ marginTop: '8px' }}>
                          <a 
                            href={`${API_BASE_URL}/uploads/document/${item.order_file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}
                          >
                            <Download size={14} /> View Promotion / Appointment Order
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
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
