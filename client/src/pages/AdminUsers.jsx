import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, ShieldAlert, Users, BookOpen, GraduationCap, ArrowLeftRight, FileSignature, Eye, X, ArrowUp, ArrowDown, UserX, UserCheck, Download, FolderDown, FileSpreadsheet, FileText, Upload, Award, KeyRound, Layers, User, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import SearchableSelect from '../components/SearchableSelect.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import PhdCompletionModal from '../components/PhdCompletionModal.jsx';
import { showSuccess, showError, showInfo } from '../context/AlertContext.jsx';
import { exportNbaB2FacultyDetails, exportNbaB2FacultyDetailsPdf } from '../utils/reportGenerator.js';
import { validateStaffId, validateEmail, validateMobile, validatePan, validateAadhar, validateAicteId, validateAnnaUnivId, validateApaarId } from '../utils/validators.js';

export default function AdminUsers({ auth, initialTab }) {
  const navigate = useNavigate();
  const [facultyList, setFacultyList] = useState([]);
  const [deptAdmins, setDeptAdmins] = useState([]);
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer & Edit Faculty State
  const [transferTarget, setTransferTarget] = useState(null);
  const [targetDept, setTargetDept] = useState('');
  const [editFacultyTarget, setEditFacultyTarget] = useState(null);
  
  // Reset Password State
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [resetCustomPassword, setResetCustomPassword] = useState('faculty123');
  
  // Edit Faculty Form fields
  const [editSalutation, setEditSalutation] = useState('Mr.');
  const [editCoreName, setEditCoreName] = useState('');
  const [originalSalutation, setOriginalSalutation] = useState('');
  const [editStaffName, setEditStaffName] = useState('');
  const [showPhdPromptModal, setShowPhdPromptModal] = useState(false);
  const [phdDetails, setPhdDetails] = useState({
    phd_completion_month_year: '',
    phd_university: 'Anna University',
    phd_specialization: ''
  });
  const [editDept, setEditDept] = useState('');
  const [editDesg, setEditDesg] = useState('');
  const [editOriginalDesg, setEditOriginalDesg] = useState('');
  const [editDoj, setEditDoj] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPan, setEditPan] = useState('');
  const [editAadhar, setEditAadhar] = useState('');
  const [editType, setEditType] = useState('Regular');
  const [editAicteId, setEditAicteId] = useState('');
  const [editAnnaUnivId, setEditAnnaUnivId] = useState('');
  const [editApaarId, setEditApaarId] = useState('');
  
  // NBA B2 Compliance Fields
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editDateDesignatedProf, setEditDateDesignatedProf] = useState('');
  const [editNatureOfAssociation, setEditNatureOfAssociation] = useState('REGULAR');
  const [editContractualType, setEditContractualType] = useState('-');
  const [editDateOfLeaving, setEditDateOfLeaving] = useState('');
  
  // Previous Experience Edit States
  const [editHasNoPrevExp, setEditHasNoPrevExp] = useState(false);
  const [editPrevAcadYears, setEditPrevAcadYears] = useState(0);
  const [editPrevAcadMonths, setEditPrevAcadMonths] = useState(0);
  const [editPrevIndYears, setEditPrevIndYears] = useState(0);
  const [editPrevIndMonths, setEditPrevIndMonths] = useState(0);

  // View Dossier State (Dept Admin)
  const [dossierTarget, setDossierTarget] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  // Search & Filter
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchStatus, setSearchStatus] = useState('all'); // 'all' | 'active' | 'relieved'
  const [searchLookupDept, setSearchLookupDept] = useState('');
  const [searchLookupSociety, setSearchLookupSociety] = useState('');
  const [searchLookupUni, setSearchLookupUni] = useState('');
  const [searchSystemAdmin, setSearchSystemAdmin] = useState('');
  const [searchDeptAdmin, setSearchDeptAdmin] = useState('');

  // Add Faculty Form Modal/State
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [fId, setFId] = useState('');
  const [fName, setFName] = useState('');
  const [fPass, setFPass] = useState('');
  const [fDept, setFDept] = useState('');
  const [fDesg, setFDesg] = useState('Assistant Professor');
  const [fAreaOfSpecialization, setFAreaOfSpecialization] = useState('');
  const [fDateDesignatedProf, setFDateDesignatedProf] = useState('');
  const [fNatureOfAssociation, setFNatureOfAssociation] = useState('REGULAR');
  const [fContractualType, setFContractualType] = useState('-');

  // Previous Experience Add States
  const [fHasNoPrevExp, setFHasNoPrevExp] = useState(false);
  const [fPrevAcadYears, setFPrevAcadYears] = useState(0);
  const [fPrevAcadMonths, setFPrevAcadMonths] = useState(0);
  const [fPrevIndYears, setFPrevIndYears] = useState(0);
  const [fPrevIndMonths, setFPrevIndMonths] = useState(0);

  const calculateTotalExperience = (acadY, acadM, indY, indM, hasNoExp) => {
    if (hasNoExp) {
      return { years: 0, months: 0, text: '0 Years, 0 Months (No Experience)' };
    }
    const ay = parseInt(acadY) || 0;
    const am = parseInt(acadM) || 0;
    const iy = parseInt(indY) || 0;
    const im = parseInt(indM) || 0;

    const totalMonthsSum = (ay * 12 + am) + (iy * 12 + im);
    const years = Math.floor(totalMonthsSum / 12);
    const months = totalMonthsSum % 12;

    let text = '';
    if (years === 0 && months === 0) {
      text = '0 Years, 0 Months';
    } else {
      text = `${years} Year${years !== 1 ? 's' : ''}, ${months} Month${months !== 1 ? 's' : ''}`;
    }
    return { years, months, text };
  };

  // Add Dept Admin Form State
  const [showAddDeptAdmin, setShowAddDeptAdmin] = useState(false);
  const [daId, setDaId] = useState('');
  const [daDept, setDaDept] = useState('');
  const [daPass, setDaPass] = useState('');

  // Add System Admin Form State
  const [showAddSystemAdmin, setShowAddSystemAdmin] = useState(false);
  const [saId, setSaId] = useState('');
  const [saPass, setSaPass] = useState('');

  // Bulk Upload Faculty Form State
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Lookup Lists States
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Lookup Form Inputs
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptAcronym, setNewDeptAcronym] = useState('');
  const [newDesgName, setNewDesgName] = useState('');
  const [searchLookupDesg, setSearchLookupDesg] = useState('');
  const [newSocietyName, setNewSocietyName] = useState('');
  const [newUniName, setNewUniName] = useState('');

  // Club Management State
  const [clubsList, setClubsList] = useState([]);
  const [searchClub, setSearchClub] = useState('');
  const [showAddClub, setShowAddClub] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubFacultyId, setNewClubFacultyId] = useState('');
  const [newClubCoFacultyId, setNewClubCoFacultyId] = useState('');
  const [editClubTarget, setEditClubTarget] = useState(null);
  const [editClubName, setEditClubName] = useState('');
  const [editClubFacultyId, setEditClubFacultyId] = useState('');
  const [editClubCoFacultyId, setEditClubCoFacultyId] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState(initialTab || 'faculty'); // 'faculty' | 'dept_admins' | 'system_admins' | 'clubs' | 'lookups'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isInstAdmin = auth.role === 'admin' || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('principal') || (auth.designation || '').toLowerCase().includes('hr');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      
      // 1. Fetch Faculty List
      const facRes = await fetch(`${API_BASE_URL}/api/admin/staff`, { headers });
      if (facRes.ok) {
        const facData = await facRes.json();
        setFacultyList(facData);
      }

      // 2. Fetch Dept Admins & System Admins (System Admin / Principal / HR)
      if (isInstAdmin) {
        const [daRes, saRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/dept-admins`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/system-admins`, { headers })
        ]);

        if (daRes.ok) {
          const daData = await daRes.json();
          setDeptAdmins(daData);
        }
        if (saRes.ok) {
          const saData = await saRes.json();
          setSystemAdmins(saData);
        }
      }

      // 3. Fetch Departments
      const deptRes = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
        if (deptData.length > 0) {
          setFDept(deptData[0].name);
          setDaDept(deptData[0].name);
        }
      }

      // 3.5 Fetch Designations
      const desgRes = await fetch(`${API_BASE_URL}/api/admin/designations`, { headers });
      if (desgRes.ok) {
        const desgData = await desgRes.json();
        setDesignations(desgData);
        if (desgData.length > 0) {
          setFDesg(desgData[0]);
        }
      }

      // 4. Fetch Societies
      const socRes = await fetch(`${API_BASE_URL}/api/admin/societies`, { headers });
      if (socRes.ok) {
        const socData = await socRes.json();
        setSocieties(socData);
      }

      // 5. Fetch Universities
      const uniRes = await fetch(`${API_BASE_URL}/api/admin/universities`, { headers });
      if (uniRes.ok) {
        const uniData = await uniRes.json();
        setUniversities(uniData);
      }

      // 6. Fetch Clubs
      const clubRes = await fetch(`${API_BASE_URL}/api/admin/clubs`, { headers });
      if (clubRes.ok) {
        const clubData = await clubRes.json();
        setClubsList(clubData);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth]);

  const handleAddClub = async (e) => {
    e.preventDefault();
    if (!newClubName || !newClubName.trim()) {
      showError('Club name is required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: newClubName.trim(),
          faculty_incharge_id: newClubFacultyId,
          co_faculty_incharge_id: newClubCoFacultyId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create club');
      showSuccess(data.message || 'Club created successfully!');
      setShowAddClub(false);
      setNewClubName('');
      setNewClubFacultyId('');
      setNewClubCoFacultyId('');
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();
    if (!editClubTarget) return;
    if (!editClubName || !editClubName.trim()) {
      showError('Club name is required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/clubs/${editClubTarget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: editClubName.trim(),
          faculty_incharge_id: editClubFacultyId,
          co_faculty_incharge_id: editClubCoFacultyId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update club');
      showSuccess(data.message || 'Club updated successfully!');
      setEditClubTarget(null);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteClub = async (club) => {
    if (!window.confirm(`Are you sure you want to delete the club "${club.name}"? Any assigned Institutional Responsibility will also be removed.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/clubs/${club.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete club');
      showSuccess(data.message || 'Club deleted successfully!');
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();

    const staffIdErr = validateStaffId(fId);
    if (staffIdErr) {
      showError(staffIdErr);
      return;
    }

    if (!fName || !fName.trim()) {
      showError('Faculty Name is required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staff_id: fId,
          staff_name: fName,
          password: fId,
          department: fDept || (departments[0]?.name || ''),
          designation: typeof fDesg === 'string' ? fDesg : (fDesg?.name || ''),
          area_of_specialization: fAreaOfSpecialization,
          date_designated_prof: fDateDesignatedProf,
          nature_of_association: fNatureOfAssociation,
          contractual_type: fContractualType,
          prev_exp_academic_years: fHasNoPrevExp ? 0 : (parseInt(fPrevAcadYears) || 0),
          prev_exp_academic_months: fHasNoPrevExp ? 0 : (parseInt(fPrevAcadMonths) || 0),
          prev_exp_industry_years: fHasNoPrevExp ? 0 : (parseInt(fPrevIndYears) || 0),
          prev_exp_industry_months: fHasNoPrevExp ? 0 : (parseInt(fPrevIndMonths) || 0),
          has_no_prev_exp: fHasNoPrevExp ? 1 : 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create faculty member');
      }

      showSuccess(`Faculty member ${fName} (${fId}) registered successfully! Default login password assigned as Staff ID (${fId}).`);
      setFId('');
      setFName('');
      setFPass('');
      setFAreaOfSpecialization('');
      setFDateDesignatedProf('');
      setFNatureOfAssociation('REGULAR');
      setFContractualType('-');
      setShowAddFaculty(false);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteFaculty = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete Faculty "${name}" (${id})? This will delete all their details, files and records forever.`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      
      if (res.ok) {
        showSuccess(`Faculty member ${name} deleted successfully.`);
        setFacultyList(prev => prev.filter(f => f.staff_id !== id));
      } else {
        throw new Error('Failed to delete faculty member');
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAddDeptAdmin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dept-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staff_id: daId,
          department: daDept || (departments[0]?.name || ''),
          password: daPass
        })
      });

      if (!res.ok) throw new Error('Failed to create department admin');

      showSuccess(`Department administrator created for ${daDept}.`);
      setDaId('');
      setDaPass('');
      setShowAddDeptAdmin(false);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteDeptAdmin = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to revoke Dept Admin privileges for ${id} of department "${deptName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dept-admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        showSuccess('Department Admin revoked successfully.');
        setDeptAdmins(prev => prev.filter(da => da.staff_id !== id));
      } else {
        throw new Error('Failed to delete department admin');
      }
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAddSystemAdmin = async (e) => {
    e.preventDefault();
    if (!saId || !saPass) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/system-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staff_id: saId,
          password: saPass
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add system administrator');
      }

      showSuccess(`System Administrator account "${saId}" created successfully!`);
      setSaId('');
      setSaPass('');
      setShowAddSystemAdmin(false);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteSystemAdmin = async (id) => {
    if (!window.confirm(`Are you sure you want to remove system administrator privilege from "${id}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/system-admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete system administrator');
      }

      showSuccess('System Administrator removed successfully.');
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleOpenTransfer = (faculty) => {
    setTransferTarget(faculty);
    setTargetDept(faculty.Department || (departments[0]?.name || ''));
  };

  const handleTransferFaculty = async (e) => {
    e.preventDefault();
    if (!transferTarget || !targetDept) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${transferTarget.staff_id}/transfer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ department: targetDept })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transfer faculty');

      showSuccess(`Faculty member ${transferTarget.staff_name || transferTarget.staff_id} successfully transferred to ${targetDept} department.`);
      setTransferTarget(null);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const formatDojForInput = (dateStr) => {
    if (!dateStr) return '';
    const str = dateStr.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
      const [d, m, y] = str.split('-');
      return `${y}-${m}-${d}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split('/');
      return `${y}-${m}-${d}`;
    }
    return str;
  };

  const parseSalutationAndName = (fullName) => {
    if (!fullName) return { salutation: 'Mr.', coreName: '' };
    const str = String(fullName).trim();
    const match = str.match(/^(Dr\.|Dr|Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms|Prof\.|Prof)\s*(.*)$/i);
    if (match) {
      let sal = match[1];
      if (!sal.endsWith('.')) sal += '.';
      sal = sal.charAt(0).toUpperCase() + sal.slice(1).toLowerCase();
      if (sal.toLowerCase() === 'dr.') sal = 'Dr.';
      if (sal.toLowerCase() === 'mr.') sal = 'Mr.';
      if (sal.toLowerCase() === 'mrs.') sal = 'Mrs.';
      if (sal.toLowerCase() === 'ms.') sal = 'Ms.';
      if (sal.toLowerCase() === 'prof.') sal = 'Prof.';
      return { salutation: sal, coreName: match[2].trim() };
    }
    return { salutation: 'Mr.', coreName: str };
  };

  const handleSalutationChange = (newSal) => {
    setEditSalutation(newSal);
    const formatted = `${newSal} ${editCoreName}`.trim();
    setEditStaffName(formatted);
    if (newSal === 'Dr.' && originalSalutation !== 'Dr.') {
      setShowPhdPromptModal(true);
    }
  };

  const handleCoreNameChange = (newCore) => {
    setEditCoreName(newCore);
    const formatted = `${editSalutation} ${newCore}`.trim();
    setEditStaffName(formatted);
  };

  const handleOpenEditFaculty = async (faculty) => {
    setEditFacultyTarget(faculty);
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/personal?staffId=${faculty.staff_id}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const data = res.ok ? await res.json() : [];
      const p = data[0] || {};

      const fullName = faculty.staff_name || p.staff_name || '';
      const { salutation, coreName } = parseSalutationAndName(fullName);
      setEditSalutation(salutation);
      setOriginalSalutation(salutation);
      setEditCoreName(coreName);
      setEditStaffName(fullName);
      setPhdDetails({
        phd_completion_month_year: '',
        phd_university: 'Anna University',
        phd_specialization: faculty.area_of_specialization || p.area_of_specialization || ''
      });

      setEditDept(faculty.Department || p.Department || '');
      setEditDesg(faculty.Designation || p.Designation || '');
      setEditOriginalDesg(faculty.Designation || p.Designation || '');
      setEditDoj(formatDojForInput(faculty.Date_of_joining || p.Date_of_joining || ''));
      setEditEmail(faculty.email || p.email || '');
      setEditMobile(faculty.mobile || p.mobile || '');
      setEditAddress(p.address || '');
      setEditPan(p.pan || '');
      setEditAadhar(p.aadhar || '');
      setEditType(p.type || 'Regular');
      setEditAicteId(p.aicte_id || '');
      setEditAnnaUnivId(p.anna_univ_id || '');
      setEditApaarId(p.apaar_id || '');

      // NBA B2 fields
      setEditSpecialization(faculty.area_of_specialization || p.area_of_specialization || '');
      setEditDateDesignatedProf(formatDojForInput(faculty.date_designated_prof || p.date_designated_prof || ''));
      setEditNatureOfAssociation(faculty.nature_of_association || p.nature_of_association || 'REGULAR');
      setEditContractualType(faculty.contractual_type || p.contractual_type || '-');
      setEditDateOfLeaving(formatDojForInput(faculty.date_of_leaving || p.date_of_leaving || ''));

      setEditHasNoPrevExp(Boolean(p.has_no_prev_exp || faculty.has_no_prev_exp));
      setEditPrevAcadYears(p.prev_exp_academic_years ?? faculty.prev_exp_academic_years ?? 0);
      setEditPrevAcadMonths(p.prev_exp_academic_months ?? faculty.prev_exp_academic_months ?? 0);
      setEditPrevIndYears(p.prev_exp_industry_years ?? faculty.prev_exp_industry_years ?? 0);
      setEditPrevIndMonths(p.prev_exp_industry_months ?? faculty.prev_exp_industry_months ?? 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFacultyEdit = async (e) => {
    e.preventDefault();
    if (!editFacultyTarget) return;

    if (!editStaffName || !editStaffName.trim()) {
      showError('Faculty Full Name is required.');
      return;
    }

    // If promoting to Dr. and completion month/year not entered yet, prompt modal
    if (editSalutation === 'Dr.' && originalSalutation !== 'Dr.' && !phdDetails.phd_completion_month_year) {
      setShowPhdPromptModal(true);
      return;
    }

    const emailErr = validateEmail(editEmail);
    if (emailErr) { showError(emailErr); return; }

    const mobileErr = validateMobile(editMobile);
    if (mobileErr) { showError(mobileErr); return; }

    const panErr = validatePan(editPan);
    if (panErr) { showError(panErr); return; }

    const aadharErr = validateAadhar(editAadhar);
    if (aadharErr) { showError(aadharErr); return; }

    const aicteErr = validateAicteId(editAicteId);
    if (aicteErr) { showError(aicteErr); return; }

    const auErr = validateAnnaUnivId(editAnnaUnivId);
    if (auErr) { showError(auErr); return; }

    const apaarErr = validateApaarId(editApaarId);
    if (apaarErr) { showError(apaarErr); return; }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${editFacultyTarget.staff_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staff_name: editStaffName,
          Department: editDept,
          Designation: editDesg,
          Date_of_joining: editDoj,
          email: editEmail,
          mobile: editMobile,
          address: editAddress,
          pan: editPan,
          aadhar: editAadhar,
          type: editType,
          aicte_id: editAicteId,
          anna_univ_id: editAnnaUnivId,
          apaar_id: editApaarId,
          area_of_specialization: editSpecialization,
          date_designated_prof: editDateDesignatedProf,
          nature_of_association: editNatureOfAssociation,
          contractual_type: editContractualType,
          date_of_leaving: editDateOfLeaving,
          prev_exp_academic_years: editHasNoPrevExp ? 0 : (parseInt(editPrevAcadYears) || 0),
          prev_exp_academic_months: editHasNoPrevExp ? 0 : (parseInt(editPrevAcadMonths) || 0),
          prev_exp_industry_years: editHasNoPrevExp ? 0 : (parseInt(editPrevIndYears) || 0),
          prev_exp_industry_months: editHasNoPrevExp ? 0 : (parseInt(editPrevIndMonths) || 0),
          has_no_prev_exp: editHasNoPrevExp ? 1 : 0,
          phd_completion_month_year: phdDetails.phd_completion_month_year,
          phd_university: phdDetails.phd_university,
          phd_specialization: phdDetails.phd_specialization || editSpecialization
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update faculty profile');

      showSuccess(`Faculty profile for ${editStaffName} updated successfully.`);
      setEditFacultyTarget(null);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleOpenDossier = async (faculty) => {
    setDossierTarget(faculty);
    setDossierLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      const [pRes, eRes, pubRes, awRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/faculty/personal?staffId=${faculty.staff_id}`, { headers }),
        fetch(`${API_BASE_URL}/api/faculty/education?staffId=${faculty.staff_id}`, { headers }),
        fetch(`${API_BASE_URL}/api/activities/publications?staffId=${faculty.staff_id}`, { headers }),
        fetch(`${API_BASE_URL}/api/activities/awards?staffId=${faculty.staff_id}`, { headers })
      ]);

      const pData = pRes.ok ? await pRes.json() : [];
      const eData = eRes.ok ? await eRes.json() : [];
      const pubData = pubRes.ok ? await pubRes.json() : [];
      const awData = awRes.ok ? await awRes.json() : [];

      const pList = Array.isArray(pData) ? pData : [pData];
      const personalRecord = pList.find(p => (p.staff_id || '').trim().toLowerCase() === (faculty.staff_id || '').trim().toLowerCase()) || pList[0] || {};

      setDossierData({
        personal: personalRecord,
        academics: faculty,
        education: eData || [],
        publications: pubData || [],
        awards: awData || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setDossierLoading(false);
    }
  };

  // Lookup API Handlers
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name: newDeptName, acronym: newDeptAcronym })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add department');
      setNewDeptName('');
      setNewDeptAcronym('');
      fetchData();
      showSuccess('Department added successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteDept = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete department');
      fetchData();
      showSuccess('Department deleted successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesgName.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/designations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name: newDesgName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add designation');
      setNewDesgName('');
      fetchData();
      showSuccess(`Designation "${newDesgName.trim()}" added successfully.`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteDesignation = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete designation "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/designations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete designation');
      fetchData();
      showSuccess(`Designation "${name}" deleted successfully.`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleMoveDesignation = async (index, direction) => {
    const newDesgs = [...designations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newDesgs.length) return;

    const temp = newDesgs[index];
    newDesgs[index] = newDesgs[targetIndex];
    newDesgs[targetIndex] = temp;

    setDesignations(newDesgs);

    try {
      const orderedIds = newDesgs.map(d => d.id);
      const res = await fetch(`${API_BASE_URL}/api/admin/designations/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ orderedIds })
      });
      if (!res.ok) throw new Error('Failed to save designation reordering');
      showSuccess('Designation order updated successfully.');
    } catch (err) {
      showError(err.message);
      fetchData();
    }
  };

  const handleAddSociety = async (e) => {
    e.preventDefault();
    if (!newSocietyName) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/societies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name: newSocietyName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add society');
      setNewSocietyName('');
      fetchData();
      showSuccess('Professional society added successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteSociety = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete professional society "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/societies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete professional society');
      fetchData();
      showSuccess('Professional society deleted successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAddUni = async (e) => {
    e.preventDefault();
    if (!newUniName) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name: newUniName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add university');
      setNewUniName('');
      fetchData();
      showSuccess('University/Board added successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDeleteUni = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete university/board "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/universities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete university');
      fetchData();
      showSuccess('University/Board deleted successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleToggleRelieve = async (faculty) => {
    const isRelievedNow = Boolean(faculty.is_relieved);
    let dateOfLeaving = '';

    if (!isRelievedNow) {
      const defaultDate = new Date().toISOString().split('T')[0];
      const inputDate = window.prompt(
        `Mark faculty "${faculty.staff_name}" (${faculty.staff_id}) as RELIEVED.\n\nEnter Date of Leaving / Relieving Date (YYYY-MM-DD):`,
        defaultDate
      );
      if (inputDate === null) return; // User cancelled
      dateOfLeaving = inputDate.trim() || defaultDate;
    } else {
      if (!window.confirm(`Are you sure you want to REACTIVATE faculty member "${faculty.staff_name}" (${faculty.staff_id})?\n\n- Login access to the Faculty Panel will be RESTORED.`)) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${faculty.staff_id}/relieve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ is_relieved: !isRelievedNow, date_of_leaving: dateOfLeaving })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update faculty relieve status');

      showSuccess(data.message);
      fetchData();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordTarget) return;

    const targetPass = (resetCustomPassword && resetCustomPassword.trim()) ? resetCustomPassword.trim() : 'faculty123';

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${resetPasswordTarget.staff_id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ defaultPassword: targetPass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset faculty password');

      showSuccess(data.message || `Password for ${resetPasswordTarget.staff_name} (${resetPasswordTarget.staff_id}) has been reset to '${targetPass}' successfully.`);
      setResetPasswordTarget(null);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDownloadZip = async (type, identifier = '') => {
    try {
      let url = `${API_BASE_URL}/api/admin/download/institution`;
      let defaultFilename = 'SREC_All_Documents.zip';

      if (type === 'department') {
        const targetDept = identifier || searchDept || (auth.role === 'dept_admin' ? auth.department : '');
        if (!targetDept) {
          showError('Please select or specify a department to download department-wise documents.');
          return;
        }
        url = `${API_BASE_URL}/api/admin/download/department/${encodeURIComponent(targetDept)}`;
        defaultFilename = `${targetDept}_documents.zip`;
      } else if (type === 'faculty') {
        if (!identifier) return;
        url = `${API_BASE_URL}/api/admin/download/faculty/${encodeURIComponent(identifier)}`;
        defaultFilename = `${identifier}_documents.zip`;
      }

      showInfo(`Preparing zip download...`);

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to download documents');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showSuccess(`Zip archive downloaded successfully: ${defaultFilename}`);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bulk-faculty/template`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (!res.ok) throw new Error('Failed to download sample template');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_faculty_bulk_upload.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Sample bulk upload template downloaded successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      showError('Please select a CSV or Excel file to upload.');
      return;
    }

    setBulkUploading(true);
    setBulkResult(null);

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      const res = await fetch(`${API_BASE_URL}/api/admin/bulk-faculty/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk upload failed');

      setBulkResult(data);
      showSuccess(data.message);
      setBulkFile(null);
      fetchData();
    } catch (err) {
      showError(err.message);
    } finally {
      setBulkUploading(false);
    }
  };

  // Filter staff list based on search terms
  const filteredFaculty = (Array.isArray(facultyList) ? facultyList : []).filter(f => {
    if (!f) return false;
    const matchesId = (f.staff_id || '').toLowerCase().includes((searchId || '').trim().toLowerCase());
    const matchesName = (f.staff_name || '').toLowerCase().includes((searchName || '').trim().toLowerCase());
    const matchesDept = (auth && auth.role === 'dept_admin') || (f.Department || '').toLowerCase().includes((searchDept || '').trim().toLowerCase());
    const matchesStatus = searchStatus === 'all'
      ? true
      : searchStatus === 'relieved'
        ? Boolean(f.is_relieved)
        : !f.is_relieved;
    return matchesId && matchesName && matchesDept && matchesStatus;
  });

  return (
    <div>
      <Navbar 
        title={isInstAdmin ? 'System & Club Management' : 'Department Faculty Panel'} 
        userName={auth.name} 
        profilePic={auth.profilePic} 
        auth={auth}
      />

      {/* Admin / Principal / HR tab selector */}
      {isInstAdmin && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '24px', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button 
              className="btn" 
              style={{ 
                background: activeTab === 'faculty' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'faculty' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('faculty')}
            >
              Faculty Profiles
            </button>
            <button 
              className="btn" 
              style={{ 
                background: activeTab === 'system_admins' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'system_admins' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('system_admins')}
            >
              System Administrators ({(systemAdmins || []).length})
            </button>
            <button 
              className="btn" 
              style={{ 
                background: activeTab === 'dept_admins' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'dept_admins' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('dept_admins')}
            >
              Dept Admins ({(deptAdmins || []).length})
            </button>
            <button 
              className="btn" 
              style={{ 
                background: activeTab === 'clubs' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'clubs' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('clubs')}
            >
              Clubs & Incharges ({(clubsList || []).length})
            </button>
            <button 
              className="btn" 
              style={{ 
                background: activeTab === 'lookups' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'lookups' ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setActiveTab('lookups')}
            >
              Manage Lookup Lists
            </button>
            <button 
              className="btn" 
              style={{ 
                background: 'hsl(var(--primary))',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => navigate('/admin/dynamic-pages')}
            >
              <Layers size={16} />
              Dynamic Page Builder
            </button>
          </div>

          {activeTab === 'faculty' && (
            <button 
              className="btn btn-secondary" 
              onClick={() => handleDownloadZip('institution')}
              style={{ background: '#0284c7', color: '#ffffff', borderColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <FolderDown size={16} />
              Download Institution Docs (ZIP)
            </button>
          )}
        </div>
      )}

      {/* Tab Contextual Action Bar (System Admin only) */}
      {auth.role === 'admin' && activeTab === 'faculty' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-primary" onClick={() => { setShowAddFaculty(true); setShowAddDeptAdmin(false); setShowAddSystemAdmin(false); setShowBulkUpload(false); }}>
            <Plus size={16} />
            Add New Faculty
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => { setShowBulkUpload(true); setShowAddFaculty(false); setShowAddSystemAdmin(false); setShowAddDeptAdmin(false); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={16} />
            Bulk Import Faculty
          </button>
        </div>
      )}

          {/* Bulk Upload Faculty Form */}
          {showBulkUpload && (
            <div className="card" style={{ marginBottom: '32px', border: '2px solid hsl(var(--primary))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={20} />
                  Bulk Upload Faculty Logins & Profiles
                </h3>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleDownloadTemplate}
                  style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9' }}
                >
                  <Download size={14} />
                  Download Sample Template (CSV)
                </button>
              </div>

              <form onSubmit={handleBulkUploadSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Select Filled CSV or Excel (.xlsx) Template <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                  </label>
                  <input 
                    type="file" 
                    accept=".csv, .xlsx, .xls"
                    className="form-control" 
                    onChange={(e) => setBulkFile(e.target.files[0])}
                    required
                  />
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '6px', display: 'block' }}>
                    * Default login password for each created account will automatically be set to their <strong>Staff ID</strong>. Faculty storage directory (<code>SREC/Department/Staff_ID</code>) will be created automatically.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: bulkResult ? '20px' : '0px' }}>
                  <button type="submit" className="btn btn-primary" disabled={bulkUploading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={16} />
                    {bulkUploading ? 'Uploading & Processing...' : 'Start Bulk Import'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowBulkUpload(false); setBulkResult(null); }}>
                    Cancel
                  </button>
                </div>
              </form>

              {bulkResult && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '10px', color: '#0f172a' }}>Import Summary</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Total Rows</span>
                      <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{bulkResult.totalProcessed}</strong>
                    </div>
                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#047857', display: 'block' }}>Logins Created</span>
                      <strong style={{ fontSize: '1.2rem', color: '#047857' }}>{bulkResult.createdCount}</strong>
                    </div>
                    <div style={{ background: bulkResult.errorCount > 0 ? '#fef2f2' : '#ffffff', padding: '10px', borderRadius: '6px', border: bulkResult.errorCount > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: bulkResult.errorCount > 0 ? '#b91c1c' : '#64748b', display: 'block' }}>Row Errors</span>
                      <strong style={{ fontSize: '1.2rem', color: bulkResult.errorCount > 0 ? '#b91c1c' : '#0f172a' }}>{bulkResult.errorCount}</strong>
                    </div>
                  </div>

                  {bulkResult.errors && bulkResult.errors.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.85rem', color: '#b91c1c', marginBottom: '6px' }}>Row Error Log:</h5>
                      <ul style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', color: '#7f1d1d', paddingLeft: '20px' }}>
                        {bulkResult.errors.map((err, idx) => (
                          <li key={idx}>Row {err.row} (ID: {err.staff_id}): {err.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Faculty Form */}
          {showAddFaculty && (
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Create New Faculty User</h3>
              <form onSubmit={handleAddFaculty}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '16px' }}>
                  {/* 1. Staff ID */}
                  <div className="form-group">
                    <label className="form-label">Staff ID <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                    <input type="text" className="form-control" placeholder="e.g. TE1024" value={fId} onChange={(e) => setFId(e.target.value)} required />
                  </div>

                  {/* 2. Faculty Name */}
                  <div className="form-group">
                    <label className="form-label">Faculty Name <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                    <input type="text" className="form-control" placeholder="e.g. Dr. Jane Smith" value={fName} onChange={(e) => setFName(e.target.value)} required />
                  </div>

                  {/* 3. Designation */}
                  <div className="form-group">
                    <label className="form-label">Designation <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                    <SearchableSelect 
                      options={designations}
                      value={typeof fDesg === 'string' ? fDesg : (fDesg?.name || '')}
                      onChange={(val) => setFDesg(val)}
                      placeholder="Search or select designation..."
                      searchPlaceholder="Type designation..."
                      required
                    />
                  </div>

                  {/* 4. Department */}
                  <div className="form-group">
                    <label className="form-label">Department <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                    <SearchableSelect 
                      options={departments}
                      value={fDept}
                      onChange={(val) => setFDept(val)}
                      placeholder="Search or select department..."
                      searchPlaceholder="Type department..."
                      required
                    />
                  </div>

                  {/* 5. Previous Experience Section */}
                  <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', gridColumn: 'span 2', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        Previous Experience
                      </span>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                        <input 
                          type="checkbox" 
                          checked={fHasNoPrevExp} 
                          onChange={(e) => {
                            setFHasNoPrevExp(e.target.checked);
                            if (e.target.checked) {
                              setFPrevAcadYears(0);
                              setFPrevAcadMonths(0);
                              setFPrevIndYears(0);
                              setFPrevIndMonths(0);
                            }
                          }} 
                          style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--primary))' }}
                        />
                        No Previous Experience
                      </label>
                    </div>

                    {!fHasNoPrevExp ? (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                          {/* Academic Experience */}
                          <div>
                            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                              Academic Experience
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Years</span>
                                <select className="form-control" value={fPrevAcadYears} onChange={(e) => setFPrevAcadYears(e.target.value)}>
                                  {Array.from({ length: 41 }, (_, i) => (
                                    <option key={i} value={i}>{i} Year{i !== 1 ? 's' : ''}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Months</span>
                                <select className="form-control" value={fPrevAcadMonths} onChange={(e) => setFPrevAcadMonths(e.target.value)}>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>{i} Month{i !== 1 ? 's' : ''}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Industry Experience */}
                          <div>
                            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                              Industry Experience
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Years</span>
                                <select className="form-control" value={fPrevIndYears} onChange={(e) => setFPrevIndYears(e.target.value)}>
                                  {Array.from({ length: 41 }, (_, i) => (
                                    <option key={i} value={i}>{i} Year{i !== 1 ? 's' : ''}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Months</span>
                                <select className="form-control" value={fPrevIndMonths} onChange={(e) => setFPrevIndMonths(e.target.value)}>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i} value={i}>{i} Month{i !== 1 ? 's' : ''}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Calculated Total Previous Experience */}
                        <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                            Calculated Total Previous Experience:
                          </span>
                          <span className="badge badge-primary" style={{ fontSize: '0.88rem', padding: '6px 14px', fontWeight: 800 }}>
                            {calculateTotalExperience(fPrevAcadYears, fPrevAcadMonths, fPrevIndYears, fPrevIndMonths, fHasNoPrevExp).text}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                        Selected: No Previous Experience (0 Years, 0 Months)
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '20px', fontWeight: 500 }}>
                  * Default login password will be set automatically to the Staff ID ({fId || 'e.g. TE1024'}).
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Create Profile</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddFaculty(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Dept Admin Form */}
          {showAddDeptAdmin && (
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Create Department Administrator</h3>
              <form onSubmit={handleAddDeptAdmin}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Dept Admin Staff ID</label>
                    <input type="text" className="form-control" placeholder="e.g. DEPT_IT" value={daId} onChange={(e) => setDaId(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="Choose password" value={daPass} onChange={(e) => setDaPass(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Target Department</label>
                    <SearchableSelect 
                      options={departments}
                      value={daDept}
                      onChange={(val) => setDaDept(val)}
                      placeholder="Search or select target department..."
                      searchPlaceholder="Type department..."
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Register Admin</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddDeptAdmin(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Add System Admin Form */}
          {showAddSystemAdmin && (
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} />
                Create New System Administrator
              </h3>
              <form onSubmit={handleAddSystemAdmin}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Staff ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. TE2273, TE2751, or Admin" 
                      value={saId} 
                      onChange={(e) => setSaId(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Enter administrator password" 
                      value={saPass} 
                      onChange={(e) => setSaPass(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Grant System Admin Privileges</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddSystemAdmin(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Transfer Faculty Department Modal */}
          {transferTarget && (
            <div className="card" style={{ marginBottom: '32px', border: '2px solid hsl(var(--primary))' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeftRight size={18} />
                Transfer Department for {transferTarget.staff_name} ({transferTarget.staff_id})
              </h3>
              <form onSubmit={handleTransferFaculty}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label className="form-label">Current Department</label>
                    <input type="text" className="form-control" value={transferTarget.Department || 'N/A'} disabled />
                  </div>
                  <div>
                    <label className="form-label">New Target Department</label>
                    <SearchableSelect 
                      options={departments}
                      value={targetDept}
                      onChange={(val) => setTargetDept(val)}
                      placeholder="Search or select new department..."
                      searchPlaceholder="Type department..."
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">Confirm Department Transfer</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setTransferTarget(null)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'system_admins' ? (
            /* System Administrators Management Tab */
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} />
                  System Administrators
                </h3>
                <button className="btn btn-primary" onClick={() => setShowAddSystemAdmin(true)}>
                  <Plus size={16} />
                  Add System Administrator
                </button>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Full Name / Designation</th>
                      <th>Department</th>
                      <th>Role & Privileges</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(systemAdmins) ? systemAdmins : []).map(sa => sa && (
                      <tr key={sa.staff_id || Math.random()}>
                        <td style={{ fontWeight: 700 }}>{sa.staff_id}</td>
                        <td style={{ fontWeight: 600 }}>{sa.staff_name || 'System Administrator'}</td>
                        <td>{sa.Department || 'All Departments (System Wide)'}</td>
                        <td>
                          <span className="badge badge-success" style={{ background: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))' }}>
                            Full System Administrator
                          </span>
                        </td>
                        <td>
                          {sa.staff_id !== auth.staffId && (
                            <button 
                              onClick={() => handleDeleteSystemAdmin(sa.staff_id)} 
                              style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'dept_admins' ? (
            /* Department Administrators Management Tab */
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} />
                  Department Administrators
                </h3>
                <button className="btn btn-primary" onClick={() => setShowAddDeptAdmin(true)}>
                  <Plus size={16} />
                  Register Dept Admin
                </button>
              </div>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Department</th>
                      <th>Privileges</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(deptAdmins) ? deptAdmins : []).map(da => da && (
                      <tr key={da.staff_id || Math.random()}>
                        <td style={{ fontWeight: 700 }}>{da.staff_id}</td>
                        <td style={{ fontWeight: 600 }}>{da.Department}</td>
                        <td><span className="badge badge-secondary">Departmental Admin</span></td>
                        <td>
                          <button 
                            onClick={() => handleDeleteDeptAdmin(da.staff_id, da.Department)} 
                            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'faculty' ? (
            /* Faculty Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: auth.role === 'admin' ? '2fr 1fr' : '1fr', gap: '32px' }}>
              {/* Faculty List Section */}
              <div>
                <div className="card" style={{ paddingBottom: '0px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={18} />
                    Filter Faculty Records
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <input type="text" className="form-control" style={{ minWidth: 0 }} placeholder="Search by ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
                    <input type="text" className="form-control" style={{ minWidth: 0 }} placeholder="Search by Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                    {auth.role === 'admin' ? (
                      <input type="text" className="form-control" style={{ minWidth: 0 }} placeholder="Search by Dept" value={searchDept} onChange={(e) => setSearchDept(e.target.value)} />
                    ) : (
                      <input type="text" className="form-control" style={{ minWidth: 0 }} value={auth.department} disabled />
                    )}
                    <select className="form-control" style={{ minWidth: 0 }} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="active">Active Faculty</option>
                      <option value="relieved">Relieved Faculty</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingBottom: '16px', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>
                      Showing {filteredFaculty.length} faculty record{filteredFaculty.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <ReportButtons 
                        pageTitle="Faculty Directory" 
                        departmentName={auth.role === 'admin' ? searchDept : (auth.department || auth.dept || '')} 
                        headers={['Staff ID', 'Staff Name', 'Department', 'Designation', 'DOJ', 'Specialization', 'Status']} 
                        rows={filteredFaculty.map(f => [
                          f.staff_id,
                          f.staff_name,
                          f.Department || 'N/A',
                          f.Designation || 'N/A',
                          f.Date_of_joining || 'N/A',
                          f.area_of_specialization || 'N/A',
                          f.status === 'relieved' ? 'Relieved' : 'Active'
                        ])} 
                        auth={auth}
                      />
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => exportNbaB2FacultyDetails(filteredFaculty, auth.role === 'admin' ? (searchDept || 'Institution') : (auth.department || auth.dept || 'Department'))}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: 700 }}
                        title="Download Faculty Details of the Department (NBA Criterion 5 Form B2 Excel Sheet)"
                      >
                        <FileSpreadsheet size={15} />
                        Export NBA B2 Details (Excel)
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => exportNbaB2FacultyDetailsPdf(filteredFaculty, auth.role === 'admin' ? (searchDept || 'Institution') : (auth.department || auth.dept || 'Department'), '2025-2026', auth)}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 700 }}
                        title="Download Faculty Details of the Department (NBA Criterion 5 Form B2 PDF)"
                      >
                        <FileText size={15} />
                        Export NBA B2 Details (PDF)
                      </button>
                      {auth.role === 'dept_admin' && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleDownloadZip('department', auth.department)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FolderDown size={15} />
                          Download Dept Documents ({auth.department})
                        </button>
                      )}
                      {auth.role === 'admin' && searchDept && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleDownloadZip('department', searchDept)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FolderDown size={15} />
                          Download Dept Documents ({searchDept})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>Loading staff records...</div>
                ) : filteredFaculty.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
                    No faculty records match your criteria.
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Faculty Details</th>
                          <th>Status</th>
                          <th>Designation</th>
                          <th>Department</th>
                          <th>Email</th>
                          {(auth.role === 'admin' || auth.role === 'dept_admin') && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFaculty.map(f => {
                          const pic = f.file || f.profile_pic;
                          const picUrl = pic 
                            ? `${API_BASE_URL}/uploads/upload/${pic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}` 
                            : null;
                          return (
                            <tr key={f.staff_id} style={{ opacity: f.is_relieved ? 0.75 : 1 }}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ position: 'relative', width: '42px', height: '42px', minWidth: '42px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '1.5px solid hsl(var(--primary), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {picUrl ? (
                                      <img 
                                        src={picUrl} 
                                        alt={f.staff_name || 'Faculty'} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                                      />
                                    ) : null}
                                    <div style={{ display: picUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '0.85rem' }}>
                                      {(f.staff_name || f.staff_id || 'F').charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', lineHeight: '1.25' }}>
                                      {f.staff_name || 'Faculty Member'}
                                    </div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 7px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                                      <span>Staff ID:</span>
                                      <span style={{ fontFamily: 'monospace', color: 'hsl(var(--primary))' }}>{f.staff_id || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {f.is_relieved ? (
                                  <span className="badge" style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', fontWeight: 700 }}>
                                    Relieved
                                  </span>
                                ) : (
                                  <span className="badge badge-success" style={{ fontWeight: 700 }}>
                                    Active
                                  </span>
                                )}
                              </td>
                              <td><span className="badge badge-secondary">{f.Designation}</span></td>
                              <td>{f.Department}</td>
                              <td>{f.email || 'N/A'}</td>
                            {(auth.role === 'admin' || auth.role === 'dept_admin') && (
                              <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {auth.role === 'admin' ? (
                                  <>
                                    <button 
                                      onClick={() => handleDownloadZip('faculty', f.staff_id)} 
                                      title="Download All Documents for this Faculty (ZIP)"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Download size={14} />
                                      Docs
                                    </button>
                                    <button 
                                      onClick={() => { setResetPasswordTarget(f); setResetCustomPassword('faculty123'); }} 
                                      title="Reset Password to Default Password"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}
                                    >
                                      <KeyRound size={14} />
                                      Reset Pass
                                    </button>
                                    <button 
                                      onClick={() => handleOpenEditFaculty(f)} 
                                      title="Edit Profile"
                                      className="btn btn-primary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <FileSignature size={14} />
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => { setTransferTarget(f); setTargetDept(departments[0]?.name || ''); }} 
                                      title="Transfer Department"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <ArrowLeftRight size={14} />
                                      Transfer
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadZip('faculty', f.staff_id)} 
                                      title="Download All Documents for this Faculty (ZIP)"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Download size={14} />
                                      Docs
                                    </button>
                                    {f.is_relieved ? (
                                      <button 
                                        onClick={() => handleToggleRelieve(f)} 
                                        title="Reactivate Faculty (Restore Login Access)"
                                        className="btn"
                                        style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                                      >
                                        <UserCheck size={14} />
                                        Reactivate
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleToggleRelieve(f)} 
                                        title="Mark as Relieved (Block Login Access)"
                                        className="btn"
                                        style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                                      >
                                        <UserX size={14} />
                                        Relieve
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleDeleteFaculty(f.staff_id, f.staff_name)} 
                                      title="Delete Faculty Account & All Records"
                                      style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px' }}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleOpenDossier(f)} 
                                      title="View Full Faculty Dossier"
                                      className="btn btn-primary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Eye size={14} />
                                      View Dossier
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadZip('faculty', f.staff_id)} 
                                      title="Download All Documents for this Faculty (ZIP)"
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <Download size={14} />
                                      Docs
                                    </button>
                                  </>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Dept & System Admins Side Panel */}
              {auth.role === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* System Admins Panel */}
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={18} />
                      System Admins ({systemAdmins.length})
                    </h3>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search System Admins..." 
                        value={searchSystemAdmin} 
                        onChange={(e) => setSearchSystemAdmin(e.target.value)} 
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', padding: '6px 10px 6px 32px' }}
                      />
                    </div>
                    <ul style={{ listStyle: 'none', maxHeight: '240px', overflowY: 'auto' }}>
                      {systemAdmins.filter(sa => 
                        !searchSystemAdmin || 
                        (sa.staff_id || '').toLowerCase().includes(searchSystemAdmin.toLowerCase()) || 
                        (sa.staff_name || '').toLowerCase().includes(searchSystemAdmin.toLowerCase())
                      ).map(sa => (
                        <li key={sa.staff_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid hsl(var(--border))' }}>
                          <div>
                            <span style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem' }}>{sa.staff_id}</span>
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{sa.staff_name || 'System Administrator'}</span>
                          </div>
                          {sa.staff_id !== auth.staffId && (
                            <button onClick={() => handleDeleteSystemAdmin(sa.staff_id)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dept Admins Panel */}
                  <div className="card">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={18} />
                      Dept Admins ({deptAdmins.length})
                    </h3>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search Dept Admins..." 
                        value={searchDeptAdmin} 
                        onChange={(e) => setSearchDeptAdmin(e.target.value)} 
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', padding: '6px 10px 6px 32px' }}
                      />
                    </div>
                    <ul style={{ listStyle: 'none', maxHeight: '240px', overflowY: 'auto' }}>
                      {deptAdmins.filter(da => 
                        !searchDeptAdmin || 
                        (da.staff_id || '').toLowerCase().includes(searchDeptAdmin.toLowerCase()) || 
                        (da.Department || '').toLowerCase().includes(searchDeptAdmin.toLowerCase())
                      ).map(da => (
                        <li key={da.staff_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid hsl(var(--border))' }}>
                          <div>
                            <span style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem' }}>{da.staff_id}</span>
                            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{da.Department}</span>
                          </div>
                          <button onClick={() => handleDeleteDeptAdmin(da.staff_id, da.Department)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'lookups' ? (
        /* Manage Lookup Lists Tab */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          {/* Designations Management Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} />
              Designations Management & Order
            </h3>
            <form onSubmit={handleAddDesignation} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Professor of Practice" 
                value={newDesgName} 
                onChange={(e) => setNewDesgName(e.target.value)} 
                required 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                <Plus size={16} /> Add Designation
              </button>
            </form>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter designations..." 
                value={searchLookupDesg} 
                onChange={(e) => setSearchLookupDesg(e.target.value)} 
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
              {designations.length === 0 ? (
                <div style={{ padding: '16px', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>No designations configured yet.</div>
              ) : (
                designations
                  .filter(d => !searchLookupDesg || (d.name || d || '').toLowerCase().includes(searchLookupDesg.toLowerCase()))
                  .map((desgItem, idx) => {
                    const id = desgItem.id || idx;
                    const name = desgItem.name || desgItem;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, minWidth: '24px', height: '24px', borderRadius: '50%', background: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            type="button" 
                            disabled={idx === 0}
                            onClick={() => handleMoveDesignation(idx, 'up')} 
                            title="Move Designation Up"
                            style={{ background: 'transparent', border: 'none', color: idx === 0 ? '#cbd5e1' : 'hsl(var(--primary))', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px' }}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button 
                            type="button" 
                            disabled={idx === designations.length - 1}
                            onClick={() => handleMoveDesignation(idx, 'down')} 
                            title="Move Designation Down"
                            style={{ background: 'transparent', border: 'none', color: idx === designations.length - 1 ? '#cbd5e1' : 'hsl(var(--primary))', cursor: idx === designations.length - 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteDesignation(id, name)} 
                            title="Delete Designation"
                            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px', marginLeft: '4px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
          {/* Departments Lookup Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} />
              Departments
            </h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Department Name" 
                  value={newDeptName} 
                  onChange={(e) => setNewDeptName(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Acronym (e.g. IT)" 
                  value={newDeptAcronym} 
                  onChange={(e) => setNewDeptAcronym(e.target.value)} 
                  style={{ maxWidth: '130px' }}
                  required 
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px' }}>
                  <Plus size={16} />
                </button>
              </div>
            </form>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter departments..." 
                value={searchLookupDept} 
                onChange={(e) => setSearchLookupDept(e.target.value)} 
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
              {departments.length === 0 ? (
                <div style={{ padding: '16px', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>No departments.</div>
              ) : (
                departments.filter(d => !searchLookupDept || (d.name || '').toLowerCase().includes(searchLookupDept.toLowerCase()) || (d.acronym || '').toLowerCase().includes(searchLookupDept.toLowerCase())).map(dept => (
                  <div key={dept.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dept.name}</span>
                      {dept.acronym && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))' }}>
                          {dept.acronym}
                        </span>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteDept(dept.id, dept.name)} 
                      style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Professional Societies Lookup Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} />
              Professional Societies
            </h3>
            <form onSubmit={handleAddSociety} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. ASME, IEI" 
                value={newSocietyName} 
                onChange={(e) => setNewSocietyName(e.target.value)} 
                required 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px' }}>
                <Plus size={16} />
              </button>
            </form>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter societies..." 
                value={searchLookupSociety} 
                onChange={(e) => setSearchLookupSociety(e.target.value)} 
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
              {societies.length === 0 ? (
                <div style={{ padding: '16px', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>No professional societies.</div>
              ) : (
                societies.filter(s => !searchLookupSociety || (s.pro_name || '').toLowerCase().includes(searchLookupSociety.toLowerCase())).map(soc => (
                  <div key={soc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid hsl(var(--border))' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{soc.pro_name}</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSociety(soc.id, soc.pro_name)} 
                      style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Universities Lookup Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} />
              Universities / Boards
            </h3>
            <form onSubmit={handleAddUni} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Madras University" 
                value={newUniName} 
                onChange={(e) => setNewUniName(e.target.value)} 
                required 
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 16px' }}>
                <Plus size={16} />
              </button>
            </form>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter universities..." 
                value={searchLookupUni} 
                onChange={(e) => setSearchLookupUni(e.target.value)} 
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
              {universities.length === 0 ? (
                <div style={{ padding: '16px', color: 'hsl(var(--text-muted))', textAlign: 'center' }}>No universities.</div>
              ) : (
                universities.filter(u => !searchLookupUni || (u.uni_name || '').toLowerCase().includes(searchLookupUni.toLowerCase())).map(uni => (
                  <div key={uni.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid hsl(var(--border))' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{uni.uni_name}</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteUni(uni.id, uni.uni_name)} 
                      style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Clubs & Incharges Tab Content */}
      {activeTab === 'clubs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} />
                  Institution Clubs & Faculty Incharges ({clubsList.length})
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
                  Manage student and institutional clubs and assign Faculty Incharges. Assigned incharges automatically receive an Institutional Responsibility.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <ReportButtons 
                  pageTitle="Institution Clubs & Faculty Incharges" 
                  departmentName="Sri Ramakrishna Engineering College" 
                  headers={['Club Name', 'Faculty Incharge Name', 'Staff ID', 'Department']} 
                  rows={clubsList.map(c => [
                    c.name || '',
                    c.faculty_incharge_name || 'Not Assigned',
                    c.faculty_incharge_id || 'N/A',
                    c.Department || 'N/A'
                  ])} 
                  auth={auth}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setNewClubName('');
                    setNewClubFacultyId('');
                    setShowAddClub(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 600 }}
                >
                  <Plus size={18} />
                  Add New Club
                </button>
              </div>
            </div>

            {/* Filter / Search Bar */}
            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search clubs, faculty incharges, departments..." 
                value={searchClub} 
                onChange={(e) => setSearchClub(e.target.value)} 
                style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Table of Clubs */}
            <div className="table-container">
              <table style={{ width: '100%', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Club Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Faculty Incharge (Coordinator)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Co-Faculty Incharge (Co-Coordinator)</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubsList.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No clubs found. Click "Add New Club" to create one.
                      </td>
                    </tr>
                  ) : (
                    clubsList
                      .filter(c => {
                        if (!searchClub.trim()) return true;
                        const term = searchClub.toLowerCase();
                        return (
                          (c.name || '').toLowerCase().includes(term) ||
                          (c.faculty_incharge_name || '').toLowerCase().includes(term) ||
                          (c.faculty_incharge_id || '').toLowerCase().includes(term) ||
                          (c.co_faculty_incharge_name || '').toLowerCase().includes(term) ||
                          (c.co_faculty_incharge_id || '').toLowerCase().includes(term) ||
                          (c.faculty_department || '').toLowerCase().includes(term)
                        );
                      })
                      .map((club, idx) => {
                        const hasIncharge = !!club.faculty_incharge_id;
                        const hasCoIncharge = !!club.co_faculty_incharge_id;
                        return (
                          <tr key={club.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{club.name}</td>
                            <td style={{ padding: '12px' }}>
                              {hasIncharge ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{club.faculty_incharge_name}</span>
                                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>ID: {club.faculty_incharge_id} | {club.faculty_department || ''}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No Incharge Assigned</span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {hasCoIncharge ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{club.co_faculty_incharge_name}</span>
                                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>ID: {club.co_faculty_incharge_id} | {club.co_faculty_department || ''}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No Co-Incharge Assigned</span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {hasIncharge || hasCoIncharge ? (
                                <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'hsla(var(--success), 0.15)', color: 'hsl(var(--success))', fontSize: '0.78rem', fontWeight: 700 }}>
                                  Assigned
                                </span>
                              ) : (
                                <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button 
                                  className="btn" 
                                  onClick={() => {
                                    setEditClubTarget(club);
                                    setEditClubName(club.name);
                                    setEditClubFacultyId(club.faculty_incharge_id || '');
                                    setEditClubCoFacultyId(club.co_faculty_incharge_id || '');
                                  }}
                                  style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Edit Club / Reassign Incharge"
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn" 
                                  onClick={() => handleDeleteClub(club)}
                                  style={{ padding: '6px 10px', fontSize: '0.8rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600 }}
                                  title="Delete Club"
                                >
                                  <Trash2 size={14} />
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
        </div>
      )}

      {/* Add Club Modal */}
      {showAddClub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>Add New Club</h3>
              <button onClick={() => setShowAddClub(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddClub} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Club Name <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Robotics Club" 
                  value={newClubName} 
                  onChange={(e) => setNewClubName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Assign Faculty Incharge (Coordinator)</label>
                <SearchableSelect 
                  options={[
                    { value: '', label: '-- Select Faculty Incharge (Optional) --' },
                    ...(facultyList || []).map(f => ({
                      value: f.staff_id,
                      label: `${f.staff_name} (${f.staff_id}) - ${f.Department || 'Dept'}`
                    }))
                  ]}
                  value={newClubFacultyId}
                  onChange={(val) => setNewClubFacultyId(val)}
                  placeholder="Search faculty name or ID..."
                  searchPlaceholder="Type faculty name or staff ID..."
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Selecting a faculty member will automatically add this club as an Institutional Responsibility to their profile.
                </span>
              </div>
              <div>
                <label className="form-label">Assign Co-Faculty Incharge (Co-Coordinator)</label>
                <SearchableSelect 
                  options={[
                    { value: '', label: '-- Select Co-Faculty Incharge (Optional) --' },
                    ...(facultyList || []).map(f => ({
                      value: f.staff_id,
                      label: `${f.staff_name} (${f.staff_id}) - ${f.Department || 'Dept'}`
                    }))
                  ]}
                  value={newClubCoFacultyId}
                  onChange={(val) => setNewClubCoFacultyId(val)}
                  placeholder="Search co-coordinator name or ID..."
                  searchPlaceholder="Type faculty name or staff ID..."
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Assigning a co-coordinator automatically syncs their Institutional Responsibility for Part D FPI calculation.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddClub(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Club</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {editClubTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>Edit Club: {editClubTarget.name}</h3>
              <button onClick={() => setEditClubTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditClub} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Club Name <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editClubName} 
                  onChange={(e) => setEditClubName(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Assign Faculty Incharge (Coordinator)</label>
                <SearchableSelect 
                  options={[
                    { value: '', label: '-- No Incharge (Unassigned) --' },
                    ...(facultyList || []).map(f => ({
                      value: f.staff_id,
                      label: `${f.staff_name} (${f.staff_id}) - ${f.Department || 'Dept'}`
                    }))
                  ]}
                  value={editClubFacultyId}
                  onChange={(val) => setEditClubFacultyId(val)}
                  placeholder="Search faculty name or ID..."
                  searchPlaceholder="Type faculty name or staff ID..."
                />
              </div>
              <div>
                <label className="form-label">Assign Co-Faculty Incharge (Co-Coordinator)</label>
                <SearchableSelect 
                  options={[
                    { value: '', label: '-- No Co-Incharge (Unassigned) --' },
                    ...(facultyList || []).map(f => ({
                      value: f.staff_id,
                      label: `${f.staff_name} (${f.staff_id}) - ${f.Department || 'Dept'}`
                    }))
                  ]}
                  value={editClubCoFacultyId}
                  onChange={(val) => setEditClubCoFacultyId(val)}
                  placeholder="Search co-coordinator name or ID..."
                  searchPlaceholder="Type faculty name or staff ID..."
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Updating club incharge or co-incharge automatically syncs Institutional Responsibilities for Part D.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditClubTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Faculty Profile Modal (System Admin) */}
      {editFacultyTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '2px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editFacultyTarget.file || editFacultyTarget.profile_pic ? (
                    <img 
                      src={`${API_BASE_URL}/uploads/upload/${editFacultyTarget.file || editFacultyTarget.profile_pic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}`} 
                      alt={editFacultyTarget.staff_name || 'Faculty'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{ display: (editFacultyTarget.file || editFacultyTarget.profile_pic) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.2rem' }}>
                    {(editFacultyTarget.staff_name || editFacultyTarget.staff_id || 'F').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Edit Faculty Profile: {editFacultyTarget.staff_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                      Staff ID: {editFacultyTarget.staff_id}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Dept: {editFacultyTarget.Department}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setEditFacultyTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveFacultyEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Salutation & Faculty Full Name <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="form-control"
                      style={{
                        width: '105px',
                        fontWeight: 700,
                        background: editSalutation === 'Dr.' ? '#f0fdf4' : '#ffffff',
                        color: editSalutation === 'Dr.' ? '#15803d' : '#0f172a',
                        borderColor: editSalutation === 'Dr.' ? '#86efac' : undefined
                      }}
                      value={editSalutation}
                      onChange={(e) => handleSalutationChange(e.target.value)}
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ flex: 1 }}
                      value={editCoreName} 
                      onChange={(e) => handleCoreNameChange(e.target.value)} 
                      placeholder="e.g. A. SOUNDARRAJAN"
                      required 
                    />
                  </div>
                  {editSalutation === 'Dr.' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
                        {phdDetails.phd_completion_month_year ? `🎓 Ph.D: ${phdDetails.phd_completion_month_year} (${phdDetails.phd_university})` : '🎓 Ph.D completion details required'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowPhdPromptModal(true)} 
                        style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}
                      >
                        {phdDetails.phd_completion_month_year ? 'Edit Ph.D Info' : '+ Enter Ph.D Info'}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="form-label">Department <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <SearchableSelect 
                    options={departments}
                    value={editDept}
                    onChange={(val) => setEditDept(val)}
                    placeholder="Search or select department..."
                    searchPlaceholder="Type department..."
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Designation <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <SearchableSelect 
                    options={designations}
                    value={editDesg}
                    onChange={(val) => setEditDesg(val)}
                    placeholder="Search or select designation..."
                    searchPlaceholder="Type designation..."
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Date of Joining (DOJ) <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="date" className="form-control" value={editDoj} onChange={(e) => setEditDoj(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Email Address <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="email" className="form-control" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Mobile Number <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Faculty Type <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <select className="form-control" value={editType} onChange={(e) => setEditType(e.target.value)} required>
                    <option value="Regular">Regular</option>
                    <option value="Adhoc">Adhoc</option>
                    <option value="Visiting">Visiting</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">AICTE Faculty ID <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editAicteId} onChange={(e) => setEditAicteId(e.target.value)} placeholder="e.g. 1-12345678" required />
                </div>
                <div>
                  <label className="form-label">Anna University ID <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editAnnaUnivId} onChange={(e) => setEditAnnaUnivId(e.target.value)} placeholder="e.g. AU-9876" required />
                </div>
                <div>
                  <label className="form-label">APAAR ID <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editApaarId} onChange={(e) => setEditApaarId(e.target.value)} placeholder="e.g. APAAR-5432" required />
                </div>
                <div>
                  <label className="form-label">PAN Card Number <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editPan} onChange={(e) => setEditPan(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Aadhar Number <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input type="text" className="form-control" value={editAadhar} onChange={(e) => setEditAadhar(e.target.value)} required />
                </div>
              </div>
                <div>
                  <label className="form-label">Contact Address <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <textarea className="form-control" rows="2" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} required></textarea>
                </div>

              {/* Designation Change Effective Date Prompt */}
              {editDesg !== editOriginalDesg && (
                <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '14px 18px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px' }}>
                    <AlertTriangle size={18} />
                    Designation Change Detected ({editOriginalDesg || 'None'} ➔ {editDesg})
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#92400e', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Faculty designation has been modified. Please specify the <strong>Date from which this new designation is effective</strong> (Date on which Designated as Professor / Associate Professor for NBA Form B2):
                  </p>
                  <div style={{ maxWidth: '320px' }}>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={editDateDesignatedProf} 
                      onChange={(e) => setEditDateDesignatedProf(e.target.value)} 
                      style={{ borderColor: '#f59e0b', background: '#ffffff', fontWeight: 600 }}
                      required 
                    />
                  </div>
                </div>
              )}

              {/* NBA B2 Compliance & Institutional Cadre Section */}
              <div style={{ background: '#f0fdf4', padding: '16px 20px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', marginBottom: '12px', textTransform: 'uppercase' }}>
                  NBA Accreditation & Institutional Cadre Details (Form B2)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Primary Area of Specialization</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. High Performance Computing, Big Data and Data Science, Cloud Computing" 
                      value={editSpecialization} 
                      onChange={(e) => setEditSpecialization(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Date Designated as Prof / Assoc Prof</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={editDateDesignatedProf} 
                      onChange={(e) => setEditDateDesignatedProf(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Nature of Association</label>
                    <select 
                      className="form-control" 
                      value={editNatureOfAssociation} 
                      onChange={(e) => setEditNatureOfAssociation(e.target.value)}
                    >
                      <option value="REGULAR">REGULAR</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="ADJUNCT">ADJUNCT</option>
                      <option value="VISITING">VISITING</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>If Contractual (Full time / Part time)</label>
                    <select 
                      className="form-control" 
                      value={editContractualType} 
                      onChange={(e) => setEditContractualType(e.target.value)}
                    >
                      <option value="-">- (Not Applicable / Regular)</option>
                      <option value="Full time">Full time</option>
                      <option value="Part time">Part time</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Date of Leaving (If Relieved)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={editDateOfLeaving} 
                      onChange={(e) => setEditDateOfLeaving(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Previous Experience Edit Section */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                    Previous Experience
                  </span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                    <input 
                      type="checkbox" 
                      checked={editHasNoPrevExp} 
                      onChange={(e) => {
                        setEditHasNoPrevExp(e.target.checked);
                        if (e.target.checked) {
                          setEditPrevAcadYears(0);
                          setEditPrevAcadMonths(0);
                          setEditPrevIndYears(0);
                          setEditPrevIndMonths(0);
                        }
                      }} 
                      style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--primary))' }}
                    />
                    No Previous Experience
                  </label>
                </div>

                {!editHasNoPrevExp ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                      {/* Academic Experience */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          Academic Experience
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Years</span>
                            <select className="form-control" value={editPrevAcadYears} onChange={(e) => setEditPrevAcadYears(e.target.value)}>
                              {Array.from({ length: 41 }, (_, i) => (
                                <option key={i} value={i}>{i} Year{i !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Months</span>
                            <select className="form-control" value={editPrevAcadMonths} onChange={(e) => setEditPrevAcadMonths(e.target.value)}>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{i} Month{i !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Industry Experience */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                          Industry Experience
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Years</span>
                            <select className="form-control" value={editPrevIndYears} onChange={(e) => setEditPrevIndYears(e.target.value)}>
                              {Array.from({ length: 41 }, (_, i) => (
                                <option key={i} value={i}>{i} Year{i !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Months</span>
                            <select className="form-control" value={editPrevIndMonths} onChange={(e) => setEditPrevIndMonths(e.target.value)}>
                              {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{i} Month{i !== 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Total Previous Experience */}
                    <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Calculated Total Previous Experience:
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.88rem', padding: '6px 14px', fontWeight: 800 }}>
                        {calculateTotalExperience(editPrevAcadYears, editPrevAcadMonths, editPrevIndYears, editPrevIndMonths, editHasNoPrevExp).text}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                    Selected: No Previous Experience (0 Years, 0 Months)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditFacultyTarget(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Faculty Dossier Modal (Dept Admin / System Admin) */}
      {dossierTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ position: 'relative', width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(var(--primary), 0.1)', border: '2px solid hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {dossierTarget.file || dossierTarget.profile_pic ? (
                    <img 
                      src={`${API_BASE_URL}/uploads/upload/${dossierTarget.file || dossierTarget.profile_pic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}`} 
                      alt={dossierTarget.staff_name || 'Faculty'} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{ display: (dossierTarget.file || dossierTarget.profile_pic) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '1.2rem' }}>
                    {(dossierTarget.staff_name || dossierTarget.staff_id || 'F').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Faculty Dossier: {dossierTarget.staff_name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: '6px', border: '1px solid hsla(var(--primary), 0.2)' }}>
                      Staff ID: {dossierTarget.staff_id}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Dept: {dossierTarget.Department}</span>
                    {dossierTarget.Designation && (
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>• {dossierTarget.Designation}</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setDossierTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
            </div>

            {dossierLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#334155', fontWeight: 600 }}>Loading Faculty Dossier...</div>
            ) : dossierData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Personal & Official Overview */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', color: 'hsl(var(--primary))', fontWeight: 800 }}>Personal & Identification Overview</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '0.9rem', color: '#334155' }}>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Designation:</strong> {dossierTarget.Designation || dossierData.personal.Designation || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Date of Joining:</strong> {dossierData.personal.Date_of_joining || dossierTarget.Date_of_joining || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Email:</strong> {dossierData.personal.email || dossierTarget.email || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Mobile:</strong> {dossierData.personal.mobile || dossierData.personal.Mobile || dossierTarget.mobile || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Gender:</strong> {dossierData.personal.gender || dossierData.personal.Gender || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>DOB:</strong> {dossierData.personal.dob || dossierData.personal.DOB || dossierData.personal.date_of_birth || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>AICTE ID:</strong> {dossierData.personal.aicte_id || dossierData.personal.Aicte_id || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>Anna Univ ID:</strong> {dossierData.personal.anna_univ_id || dossierData.personal.Anna_univ_id || 'N/A'}</div>
                    <div><strong style={{ color: '#0f172a', fontWeight: 700 }}>APAAR ID:</strong> {dossierData.personal.apaar_id || dossierData.personal.Apaar_id || 'N/A'}</div>
                  </div>
                </div>

                {/* Educational Qualifications */}
                <div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', color: '#0f172a', fontWeight: 800 }}>Educational Qualifications</h4>
                  {dossierData.education.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>No qualifications uploaded yet.</div>
                  ) : (
                    <div className="table-container">
                      <table style={{ width: '100%', fontSize: '0.88rem' }}>
                        <thead>
                          <tr><th>Category</th><th>Degree</th><th>Specialization</th><th>Institute</th><th>Board/University</th><th>Year</th></tr>
                        </thead>
                        <tbody>
                          {dossierData.education.map(e => (
                            <tr key={e.id}>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>{e.category}</td>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>{e.degree || '-'}</td>
                              <td>{e.specialization}</td>
                              <td>{e.institute}</td>
                              <td>{e.board}</td>
                              <td style={{ fontWeight: 600 }}>{e.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Publications Summary */}
                <div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', color: '#0f172a', fontWeight: 800 }}>Publications ({dossierData.publications.length})</h4>
                  {dossierData.publications.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>No publications recorded.</div>
                  ) : (
                    <div className="table-container">
                      <table style={{ width: '100%', fontSize: '0.88rem' }}>
                        <thead>
                          <tr><th>Type</th><th>Title</th><th>Journal / Conference</th><th>Indexing</th></tr>
                        </thead>
                        <tbody>
                          {dossierData.publications.map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600 }}>{p.type_pub} ({p.type})</td>
                              <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</td>
                              <td>{p.journel}</td>
                              <td>{p.index_pub || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ph.D COMPLETION PROMPT MODAL */}
      <PhdCompletionModal
        isOpen={showPhdPromptModal}
        onClose={() => setShowPhdPromptModal(false)}
        facultyName={editStaffName}
        defaultMonthYear={phdDetails.phd_completion_month_year}
        defaultUniversity={phdDetails.phd_university}
        defaultSpecialization={phdDetails.phd_specialization}
        onConfirm={(details) => {
          setPhdDetails(details);
          setShowPhdPromptModal(false);
          showSuccess('Ph.D degree details captured. Click "Save Faculty Details" to apply.');
        }}
      />

      {/* RESET PASSWORD MODAL FOR SYSTEM ADMIN */}
      {resetPasswordTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <KeyRound size={20} style={{ color: 'hsl(var(--primary))' }} />
                Reset Faculty Password
              </h3>
              <button onClick={() => setResetPasswordTarget(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.88rem' }}>
                <div><strong style={{ color: '#0f172a' }}>Faculty Name:</strong> {resetPasswordTarget.staff_name}</div>
                <div><strong style={{ color: '#0f172a' }}>Staff ID:</strong> {resetPasswordTarget.staff_id}</div>
                <div><strong style={{ color: '#0f172a' }}>Department:</strong> {resetPasswordTarget.Department || 'N/A'}</div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700 }}>New Default Password *</label>
                <input
                  type="text"
                  className="form-control"
                  value={resetCustomPassword}
                  onChange={(e) => setResetCustomPassword(e.target.value)}
                  placeholder="e.g. faculty123"
                  required
                />
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setResetCustomPassword('faculty123')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', fontWeight: 700 }}
                >
                  Set to 'faculty123'
                </button>
                <button
                  type="button"
                  onClick={() => setResetCustomPassword(resetPasswordTarget.staff_id)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', fontWeight: 700 }}
                >
                  Set to Staff ID ({resetPasswordTarget.staff_id})
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                This action will hash and overwrite the current login password for this faculty member. The faculty can log in using this default password and change it anytime under Settings.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setResetPasswordTarget(null)} className="btn btn-secondary" style={{ fontWeight: 700 }}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmResetPassword} className="btn btn-primary" style={{ fontWeight: 800, padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={16} /> Confirm Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
