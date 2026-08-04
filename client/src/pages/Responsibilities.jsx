import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Plus, Trash2, Search, CheckCircle2, FileText, User, Edit2, Award } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import SearchableSelect from '../components/SearchableSelect.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../utils/academicYear.js';

export default function Responsibilities({ auth }) {
  const [responsibilities, setResponsibilities] = useState([]);
  const [deptFaculty, setDeptFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [responsibilityLevel, setResponsibilityLevel] = useState('Department Level');
  const [responsibilityText, setResponsibilityText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isInstitutionalAdmin = auth.role === 'admin' || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('principal') || (auth.designation || '').toLowerCase().includes('hr');
  const isHOD = isInstitutionalAdmin || auth.isHod || (auth.designation || '').toLowerCase().includes('hod') || (auth.designation || '').toLowerCase().includes('head');
  const canViewDept = isHOD || auth.role === 'dept_admin';

  useEffect(() => {
    if (isInstitutionalAdmin) {
      setResponsibilityLevel('Institutional Level');
    } else {
      setResponsibilityLevel('Department Level');
    }
  }, [isInstitutionalAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch assigned responsibilities
      let url = 'http://localhost:5001/api/faculty/responsibilities';
      if (!canViewDept) {
        url += `?staffId=${auth.staffId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResponsibilities(data);
      }

      // If HOD/Admin/Principal/HR, fetch faculty for SearchableSelect
      if (isHOD) {
        const facUrl = isInstitutionalAdmin 
          ? 'http://localhost:5001/api/faculty/personal?scope=institution' 
          : 'http://localhost:5001/api/faculty/personal';

        const facRes = await fetch(facUrl, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (facRes.ok) {
          const facData = await facRes.json();
          setDeptFaculty(facData);
        }
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

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSelectedStaffId(item.staff_id);
    setAcademicYear(item.academic_year || getCurrentAcademicYear());
    setResponsibilityLevel(item.level || (isInstitutionalAdmin ? 'Institutional Level' : 'Department Level'));
    setResponsibilityText(item.responsibility || '');
    setShowAddForm(true);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setSelectedStaffId('');
    setResponsibilityText('');
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedStaffId) {
      setError('Please select a faculty member from the dropdown.');
      return;
    }
    if (!responsibilityText || !responsibilityText.trim()) {
      setError('Additional responsibility description is required.');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5001/api/faculty/responsibility/${editingId}`
        : 'http://localhost:5001/api/faculty/responsibility';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          staff_id: selectedStaffId,
          academic_year: academicYear,
          level: responsibilityLevel,
          responsibility: responsibilityText
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save additional responsibility');

      setMessage(editingId ? 'Additional responsibility updated successfully!' : 'Additional responsibility assigned successfully to faculty member!');
      setEditingId(null);
      setResponsibilityText('');
      setSelectedStaffId('');
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assigned responsibility?')) return;
    try {
      const res = await fetch(`http://localhost:5001/api/faculty/responsibility/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage('Assigned responsibility deleted successfully.');
        setResponsibilities(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/admin/departments', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setDepartments(data))
    .catch(err => console.error(err));
  }, [auth]);

  // Options for SearchableSelect (Name and Designation without ID)
  const facultyOptions = deptFaculty
    .filter(fac => !selectedDepartment || (fac.Department || '').trim().toLowerCase() === selectedDepartment.trim().toLowerCase())
    .map(fac => ({
      value: fac.staff_id,
      label: `${fac.staff_name || 'Faculty'}${fac.Designation ? ` (${fac.Designation})` : ''}${fac.Department ? ` - ${fac.Department}` : ''}`
    }));

  const filteredList = responsibilities.filter(r => {
    if (selectedDepartment) {
      const itemDept = (r.Department || '').trim().toLowerCase();
      const selDept = selectedDepartment.trim().toLowerCase();
      const matches = itemDept === selDept || departments.some(d => (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept));
      if (!matches) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (r.staff_name || '').toLowerCase().includes(q) ||
      (r.Designation || '').toLowerCase().includes(q) ||
      (r.Department || '').toLowerCase().includes(q) ||
      (r.level || '').toLowerCase().includes(q) ||
      (r.responsibility || '').toLowerCase().includes(q) ||
      (r.academic_year || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Navbar 
        title={isInstitutionalAdmin ? "Assign Institutional Level Responsibilities" : (isHOD ? "Assign Department Responsibilities" : (auth.role === 'dept_admin' ? "Department Additional Responsibilities" : "My Assigned Responsibilities"))} 
        userName={auth.name} 
        profilePic={auth.profilePic} 
        auth={auth} 
      />

      {message && (
        <div className="card" style={{ marginBottom: '20px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', fontWeight: 600 }}>
          {message}
        </div>
      )}
      {error && (
        <div className="card" style={{ marginBottom: '20px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={26} style={{ color: 'hsl(var(--primary))' }} />
              {isInstitutionalAdmin 
                ? "Principal & HR Provision: Assign Institutional Level Responsibilities" 
                : (isHOD ? "HOD Provision: Assign Additional Responsibilities" : (auth.role === 'dept_admin' ? "Department Faculty Additional Responsibilities" : "Faculty Assigned Responsibilities"))}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {isInstitutionalAdmin 
                ? "Assign institutional-level additional responsibilities to any faculty member across all departments in the institution."
                : (isHOD 
                  ? "Assign departmental additional responsibilities to department faculty members." 
                  : (auth.role === 'dept_admin' ? "View official additional responsibilities assigned to faculty members in your department." : "View official additional responsibilities assigned to you by your HOD, Principal, HR, or Institution Admin."))}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <ReportButtons 
              pageTitle={isInstitutionalAdmin ? "Institutional Level Responsibilities" : (isHOD ? "Department Additional Responsibilities" : "Assigned Responsibilities")} 
              departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
              headers={['Faculty Name', 'Designation', 'Department', 'Academic Year', 'Level', 'Assigned Responsibility']} 
              rows={filteredList.map(r => [
                r.staff_name || '',
                r.Designation || '',
                r.Department || '',
                r.academic_year || '',
                r.level || '',
                r.responsibility || ''
              ])} 
              auth={auth}
            />
            {isHOD && (
              <>
                {isInstitutionalAdmin && (
                  <Link 
                    to="/admin/clubs" 
                    className="btn" 
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 14px', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', borderRadius: '8px' }}
                  >
                    <Award size={16} />
                    Assign Club Coordinators
                  </Link>
                )}
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  <Plus size={18} />
                  {showAddForm ? 'Close Form' : 'Assign New Responsibility'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* HOD / Principal Assign Form Card */}
      {isHOD && showAddForm && (
        <div className="card" style={{ marginBottom: '32px', border: '2px solid hsl(var(--primary))' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
            {editingId ? 'Edit Assigned Additional Responsibility' : (isInstitutionalAdmin ? 'Assign Institutional Level Responsibility to Any Faculty' : 'Assign Department Responsibility to Faculty')}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
              {/* 1. Faculty Name (Search Dropdown) */}
              <div className="form-group">
                <label className="form-label">
                  Faculty Name (Search Dropdown) <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                </label>
                <SearchableSelect 
                  options={facultyOptions}
                  value={selectedStaffId}
                  onChange={(val) => setSelectedStaffId(val)}
                  placeholder="Search or select faculty member..."
                  searchPlaceholder="Type faculty name, designation, or department..."
                  required
                />
              </div>

              {/* 2. Responsibility Level */}
              <div className="form-group">
                <label className="form-label">Responsibility Level <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <select className="form-control" value={responsibilityLevel} onChange={(e) => setResponsibilityLevel(e.target.value)} required>
                  <option value="Institutional Level">Institutional Level (College-wide)</option>
                  <option value="Department Level">Department Level</option>
                </select>
              </div>

              {/* 3. Academic Year */}
              <div className="form-group">
                <label className="form-label">Academic Year <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <select className="form-control" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required>
                  {getAcademicYearOptions(5, 1).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 4. Additional Responsibility Text Box */}
              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label className="form-label">
                  Additional Responsibility Description <span style={{ color: 'hsl(var(--danger))' }}>*</span>
                </label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder={isInstitutionalAdmin ? "e.g. NAAC Steering Committee Convenor / Campus Placement Director / Institution Innovation Council Coordinator..." : "e.g. Class Tutor for IV CSE A / NBA Criteria 4 Incharge / Timetable Coordinator..."} 
                  value={responsibilityText} 
                  onChange={(e) => setResponsibilityText(e.target.value)} 
                  required 
                  style={{ minHeight: '90px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 700 }}>
                {editingId ? 'Update Assignment' : 'Save Assignment'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Real-time Search Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {auth.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                Filter Department:
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search assigned responsibilities by faculty name, designation, level, or responsibility text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsibilities List Table */}
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>
        {canViewDept ? "Assigned Additional Responsibilities Directory" : "My Assigned Additional Responsibilities"}
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading responsibilities list...</div>
      ) : filteredList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          {canViewDept 
            ? "No additional responsibilities assigned yet."
            : "No additional responsibilities have been assigned to you yet."}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {canViewDept && <th>Faculty Name</th>}
                {canViewDept && <th>Designation</th>}
                {canViewDept && <th>Department</th>}
                <th>Level</th>
                <th>Academic Year</th>
                <th>Additional Responsibility Description</th>
                <th>Assigned Date</th>
                {isHOD && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  {canViewDept && <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.staff_name || 'N/A'}</td>}
                  {canViewDept && <td><span className="badge badge-success">{item.Designation || 'N/A'}</span></td>}
                  {canViewDept && <td><span className="badge badge-secondary">{item.Department || 'N/A'}</span></td>}
                  <td>
                    <span className={item.level === 'Institutional Level' ? "badge" : "badge badge-secondary"} style={item.level === 'Institutional Level' ? { background: '#8b5cf6', color: '#ffffff' } : {}}>
                      {item.level || 'Department Level'}
                    </span>
                  </td>
                  <td><span className="badge badge-secondary">{item.academic_year || '2026-2027'}</span></td>
                  <td style={{ fontWeight: 600, color: '#1e293b', maxWidth: '400px' }}>
                    {item.responsibility}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {new Date(item.assigned_at || Date.now()).toLocaleDateString()}
                  </td>
                  {isHOD && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {(isInstitutionalAdmin || item.level !== 'Institutional Level') ? (
                        <>
                          <button 
                            onClick={() => handleEdit(item)}
                            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', padding: '6px', marginRight: '6px' }}
                            title="Edit Assignment"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '6px' }}
                            title="Delete Assignment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          View Only
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
