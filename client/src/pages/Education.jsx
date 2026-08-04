import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Download, FileSignature, Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { validatePercentage, validateYear } from '../utils/validators.js';

export default function Education({ auth }) {
  const [educationList, setEducationList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [category, setCategory] = useState('UG');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [institute, setInstitute] = useState('');
  const [board, setBoard] = useState('');
  const [year, setYear] = useState('');
  const [percentage, setPercentage] = useState('');
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unis, setUnis] = useState([]);
  const [deptFaculty, setDeptFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const resetForm = () => {
    setEditItem(null);
    setCategory('UG');
    setDegree('');
    setSpecialization('');
    setInstitute('');
    setBoard('');
    setYear('');
    setPercentage('');
    setFile(null);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setCategory(item.category || 'UG');
    setDegree(item.degree || '');
    setSpecialization(item.specialization || '');
    setInstitute(item.institute || '');
    setBoard(item.board || '');
    setYear(item.year || '');
    setPercentage(item.percentage || '');
    setFile(null);
    setShowAddForm(true);
  };

  useEffect(() => {
    if (auth.role === 'dept_admin' || auth.role === 'admin') {
      fetch('http://localhost:5001/api/faculty/personal', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDeptFaculty(data))
      .catch(err => console.error(err));

      fetch('http://localhost:5001/api/admin/departments', {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDepartments(data))
      .catch(err => console.error(err));
    }
  }, [auth]);

  const fetchEducation = async (staffIdFilter = selectedFaculty) => {
    setLoading(true);
    try {
      let url = `http://localhost:5001/api/faculty/education`;
      
      if (staffIdFilter) {
        url = `http://localhost:5001/api/faculty/education?staffId=${staffIdFilter}`;
      } else if (auth.role !== 'dept_admin' && auth.role !== 'admin') {
        url = `http://localhost:5001/api/faculty/education?staffId=${auth.staffId}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEducationList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation(selectedFaculty);
    fetch('http://localhost:5001/api/admin/universities', {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setUnis(data))
    .catch(err => console.error(err));
  }, [auth]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this qualification?')) return;
    setMessage('');
    setError('');

    try {
      const res = await fetch(`http://localhost:5001/api/faculty/education/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage('Qualification deleted successfully.');
        setEducationList(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to delete qualification');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getDegreeRank = (category, degreeVal = '') => {
    const cat = `${category || ''} ${degreeVal || ''}`.toString().trim().toUpperCase();
    if (cat.includes('PH.D') || cat.includes('PHD') || cat.includes('DOCTORATE')) return 100;
    if (cat.includes('PG') || cat.includes('POST') || cat.includes('MASTER') || cat.includes('M.E') || cat.includes('M.TECH') || cat.includes('M.S') || cat.includes('M.SC') || cat.includes('MBA') || cat.includes('MCA')) return 80;
    if (cat.includes('UG') || cat.includes('UNDER') || cat.includes('BACHELOR') || cat.includes('B.E') || cat.includes('B.TECH') || cat.includes('B.SC') || cat.includes('BCA')) return 60;
    if (cat.includes('DIPLOMA')) return 40;
    if (cat.includes('HSC') || cat.includes('XII') || cat.includes('HIGHER')) return 20;
    if (cat.includes('SSLC') || cat.includes('X') || cat.includes('10')) return 10;
    return 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMessage('');
    setError('');

    if (!degree || !degree.trim()) { setError('Degree (e.g. B.E., M.E., Ph.D) is a mandatory field.'); return; }
    if (!specialization || !specialization.trim()) { setError('Specialization / Major is a mandatory field.'); return; }
    if (!institute || !institute.trim()) { setError('Institute / School Name is a mandatory field.'); return; }
    if (!board || !board.trim()) { setError('Board / University is a mandatory field.'); return; }
    if (!year) { setError('Year of Passing is a mandatory field.'); return; }
    if (percentage === undefined || percentage === '' || percentage === null) { setError('Percentage / CGPA is a mandatory field.'); return; }

    if (!editItem && !file) {
      setError('Attach Degree Certificate / Marksheet file is mandatory.');
      return;
    }

    const yearErr = validateYear(year);
    if (yearErr) { setError(yearErr); return; }

    const percErr = validatePercentage(percentage);
    if (percErr) { setError(percErr); return; }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('degree', degree);
    formData.append('specialization', specialization);
    formData.append('institute', institute);
    formData.append('board', board);
    formData.append('year', year);
    formData.append('percentage', percentage);
    if (file) {
      formData.append('file', file);
    }

    try {
      const url = editItem 
        ? `http://localhost:5001/api/faculty/education/${editItem.id}` 
        : 'http://localhost:5001/api/faculty/education';
      
      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to save qualification details');
      }

      setMessage(editItem ? 'Qualification updated successfully!' : 'Qualification added successfully!');
      setShowAddForm(false);
      resetForm();
      fetchEducation();
      window.dispatchEvent(new Event('srec_profile_updated'));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEducation = [...educationList]
    .sort((a, b) => {
      const rankA = getDegreeRank(a.category, a.degree);
      const rankB = getDegreeRank(b.category, b.degree);
      if (rankB !== rankA) return rankB - rankA;
      return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    })
    .filter(edu => {
      if (selectedDepartment) {
        const itemDept = (edu.Department || '').trim().toLowerCase();
        const selDept = selectedDepartment.trim().toLowerCase();
        const matches = itemDept === selDept || departments.some(d => (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept));
        if (!matches) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (edu.staff_name || '').toLowerCase().includes(q) ||
        (edu.staff_id || '').toLowerCase().includes(q) ||
        (edu.category || '').toLowerCase().includes(q) ||
        (edu.degree || '').toLowerCase().includes(q) ||
        (edu.specialization || '').toLowerCase().includes(q) ||
        (edu.institute || '').toLowerCase().includes(q) ||
        (edu.board || '').toLowerCase().includes(q) ||
        (edu.year || '').toString().toLowerCase().includes(q) ||
        (edu.percentage || '').toString().toLowerCase().includes(q)
      );
    });

  return (
    <div>
      <Navbar title="Educational Qualifications" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Qualifications Overview</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <ReportButtons 
            pageTitle="Educational Qualifications" 
            departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
            headers={['Faculty Name', 'Designation', 'Department', 'Category', 'Degree', 'Specialization', 'Institute / College', 'University / Board', 'Year of Passing', '% / CGPA']} 
            rows={filteredEducation.map(item => [
              item.staff_name || 'N/A',
              item.Designation || 'N/A',
              item.Department || 'N/A',
              item.category || '',
              item.degree || '',
              item.specialization || '',
              item.institute || '',
              item.board || '',
              item.year || '',
              item.percentage || ''
            ])} 
            auth={auth}
          />
          {auth.role !== 'dept_admin' && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={16} />
              {showAddForm ? 'Close Form' : 'Add Qualification'}
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Add Educational Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Degree Category <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="SSLC">SSLC / X Std</option>
                  <option value="HSC">HSC / XII Std</option>
                  <option value="Diploma">Diploma</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="Ph.D">Ph.D</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Degree <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. B.E., M.E., Ph.D, B.Tech, M.Tech" 
                  value={degree} 
                  onChange={(e) => setDegree(e.target.value)}
                  list="degrees-list"
                  required 
                />
                <datalist id="degrees-list">
                  <option value="B.E." />
                  <option value="B.Tech" />
                  <option value="B.Sc" />
                  <option value="BCA" />
                  <option value="B.Com" />
                  <option value="B.A." />
                  <option value="B.Arch" />
                  <option value="M.E." />
                  <option value="M.Tech" />
                  <option value="M.Sc" />
                  <option value="MCA" />
                  <option value="MBA" />
                  <option value="M.S." />
                  <option value="M.Phil" />
                  <option value="Ph.D" />
                  <option value="Diploma" />
                  <option value="HSC" />
                  <option value="SSLC" />
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Specialization / Major <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Computer Science, Mechanical" 
                  value={specialization} 
                  onChange={(e) => setSpecialization(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institute / School Name <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter institution" 
                  value={institute} 
                  onChange={(e) => setInstitute(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Board / University <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Anna University, State Board" 
                  value={board} 
                  onChange={(e) => setBoard(e.target.value)}
                  list="universities-list"
                  required 
                />
                <datalist id="universities-list">
                  {unis.map(u => (
                    <option key={u.id} value={u.uni_name} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Year of Passing <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="YYYY" 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Percentage / CGPA <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-control" 
                  placeholder="e.g. 85.5 or 8.5" 
                  value={percentage} 
                  onChange={(e) => setPercentage(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Attach Degree Certificate / Marksheet <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
              <Dropzone onFileSelect={(f) => setFile(f)} accept=".pdf,.jpg,.jpeg,.png" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Save Qualification</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Department & Faculty Filter Dropdown */}
      {(auth.role === 'dept_admin' || auth.role === 'admin') && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {auth.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  Filter Department:
                </label>
                <select 
                  className="form-control" 
                  value={selectedDepartment} 
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{ maxWidth: '280px', fontWeight: 600 }}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Select Faculty Member:
              </label>
              <select 
                className="form-control" 
                value={selectedFaculty} 
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedFaculty(val);
                  fetchEducation(val);
                }}
                style={{ maxWidth: '420px', fontWeight: 600 }}
              >
                <option value="">-- All Faculty Members --</option>
                {deptFaculty
                  .filter(fac => !selectedDepartment || (fac.Department || '').trim().toLowerCase() === selectedDepartment.trim().toLowerCase())
                  .map(fac => (
                    <option key={fac.staff_id} value={fac.staff_id}>
                      {fac.staff_name || 'Faculty Member'}{fac.Designation ? ` (${fac.Designation})` : ''}
                    </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Search Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search qualifications by degree, specialization, institute, university, year..."
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading list...</div>
      ) : educationList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          No educational qualifications added yet. Click the "Add Qualification" button to start.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {(auth.role === 'dept_admin' || auth.role === 'admin') && (
                  <>
                    <th>Faculty Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                  </>
                )}
                <th>Category</th>
                <th>Degree</th>
                <th>Specialization</th>
                <th>Institute</th>
                <th>Board / University</th>
                <th>Year</th>
                <th>Percentage/CGPA</th>
                <th>Certificate</th>
                {auth.role !== 'dept_admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredEducation.map((edu) => (
                <tr key={edu.id}>
                  {(auth.role === 'dept_admin' || auth.role === 'admin') && (
                    <>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{edu.staff_name || 'N/A'}</td>
                      <td><span className="badge badge-success">{edu.Designation || 'N/A'}</span></td>
                      <td><span className="badge badge-secondary">{edu.Department || 'N/A'}</span></td>
                    </>
                  )}
                  <td><span className="badge badge-success">{edu.category}</span></td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{edu.degree || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{edu.specialization}</td>
                  <td>{edu.institute}</td>
                  <td>{edu.board}</td>
                  <td>{edu.year}</td>
                  <td>
                    {(() => {
                      if (edu.percentage === undefined || edu.percentage === null || edu.percentage === '') return 'N/A';
                      const str = edu.percentage.toString().trim().replace('%', '');
                      const num = parseFloat(str);
                      if (!isNaN(num) && num <= 10) {
                        return str;
                      }
                      return `${str}%`;
                    })()}
                  </td>
                  <td>
                    {edu.file ? (
                      <a 
                        href={`http://localhost:5001/uploads/document/${edu.file}?token=${auth?.token}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <Download size={14} />
                        View File
                      </a>
                    ) : (
                      <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>No file</span>
                    )}
                  </td>
                  {auth.role !== 'dept_admin' && (
                    <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        onClick={() => openEditModal(edu)} 
                        title="Edit Qualification"
                        style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', padding: '4px' }}
                      >
                        <FileSignature size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(edu.id)} 
                        title="Delete Qualification"
                        style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
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
