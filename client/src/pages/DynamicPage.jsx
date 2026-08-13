import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ReportButtons from '../components/ReportButtons.jsx';
import { 
  FileText, Plus, Search, Trash2, Eye, Download, X, Save, 
  Award, BookOpen, Layers, Sparkles, Folder, GraduationCap, Users, Star, ShieldAlert 
} from 'lucide-react';

const ICON_MAP = {
  FileText, Award, BookOpen, Layers, Sparkles, Folder, GraduationCap, Users, Star, ShieldAlert
};

export default function DynamicPage({ auth }) {
  const { slug } = useParams();
  const [pageInfo, setPageInfo] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [fileAttachment, setFileAttachment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dynamic-pages/${slug}/data`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setPageInfo(result.page);
        setRecords(result.data || []);
      } else {
        setError('Failed to load dynamic page');
      }
    } catch (err) {
      setError('Server error while loading page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [slug]);

  const handleInputChange = (fieldId, val) => {
    setFormData({ ...formData, [fieldId]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const body = new FormData();
    Object.keys(formData).forEach(k => {
      body.append(k, formData[k]);
    });
    if (fileAttachment) {
      body.append('file', fileAttachment);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/dynamic-pages/${slug}/data`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Record saved successfully!');
        setFormData({});
        setFileAttachment(null);
        setShowAddForm(false);
        fetchPageData();
      } else {
        setError(data.error || 'Failed to save record');
      }
    } catch (err) {
      setError('Server error while saving record');
    }
  };

  const handleDelete = async (dataId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/dynamic-pages/${slug}/data/${dataId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage('Record deleted successfully');
        fetchPageData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete record');
      }
    } catch (err) {
      setError('Server error while deleting record');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar title="Loading Dynamic Page..." userName={auth.name} profilePic={auth.profilePic} auth={auth} />
        <div style={{ padding: '60px', textAlign: 'center' }}>Loading dynamic page details...</div>
      </div>
    );
  }

  if (!pageInfo) {
    return (
      <div>
        <Navbar title="Page Not Found" userName={auth.name} profilePic={auth.profilePic} auth={auth} />
        <div className="card" style={{ margin: '40px auto', maxWidth: '600px', textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: 'hsl(var(--danger))', marginBottom: '12px' }}>Page Not Found</h3>
          <p>The requested dynamic page <code>/custom/{slug}</code> does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const HeaderIcon = ICON_MAP[pageInfo.icon] || FileText;

  // Filtered records for table & reports
  const filteredRecords = records.filter(r => {
    if (selectedDept) {
      if ((r.department || '').toLowerCase() !== selectedDept.toLowerCase()) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    return (
      (r.staff_name || '').toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q) ||
      Object.values(r.data || {}).some(val => String(val || '').toLowerCase().includes(q))
    );
  });

  const dynamicFields = pageInfo.fields || [];
  const reportHeaders = ['Faculty Name', 'Department', ...dynamicFields.map(f => f.label), 'Submitted Date'];
  const reportRows = filteredRecords.map(r => [
    r.staff_name || 'N/A',
    r.department || 'N/A',
    ...dynamicFields.map(f => r.data?.[f.id] || 'N/A'),
    r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'
  ]);

  return (
    <div>
      <Navbar title={pageInfo.title} userName={auth.name} profilePic={auth.profilePic} auth={auth} />

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
              <HeaderIcon size={26} style={{ color: 'hsl(var(--primary))' }} />
              {pageInfo.title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Official records directory for {pageInfo.title}. Submit and track entries with attachments and export custom reports.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <ReportButtons 
              pageTitle={pageInfo.title}
              departmentName={auth.department || ''}
              headers={reportHeaders}
              rows={reportRows}
              records={filteredRecords}
              auth={auth}
            />
            {auth.role === 'faculty' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> {showAddForm ? 'Close Form' : 'Submit New Record'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Record Form Card */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '32px', border: '2px solid hsl(var(--primary))' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
            Submit Record: {pageInfo.title}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {dynamicFields.map(f => (
                <div key={f.id} style={['textarea', 'radio', 'multiselect', 'range', 'color', 'rating'].includes(f.type) ? { gridColumn: 'span 2' } : {}}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    {f.label} {f.required && <span style={{ color: 'hsl(var(--danger))' }}>*</span>}
                  </label>

                  {/* ── Text & Input ── */}
                  {f.type === 'text' && (
                    <input type="text" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'textarea' && (
                    <textarea className="form-control" rows="3" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required}></textarea>
                  )}
                  {f.type === 'email' && (
                    <input type="email" className="form-control" placeholder="name@example.com" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'tel' && (
                    <input type="tel" className="form-control" placeholder="+91 XXXXX XXXXX" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'url' && (
                    <input type="url" className="form-control" placeholder="https://example.com" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'password' && (
                    <input type="password" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}

                  {/* ── Numeric ── */}
                  {f.type === 'number' && (
                    <input type="number" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'range' && (
                    <div>
                      <input type="range" min="0" max="100" className="form-control" style={{ padding: '6px 0', cursor: 'pointer' }} value={formData[f.id] || 50} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Value: {formData[f.id] || 50}</span>
                    </div>
                  )}

                  {/* ── Date & Time ── */}
                  {f.type === 'date' && (
                    <input type="date" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'time' && (
                    <input type="time" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'datetime-local' && (
                    <input type="datetime-local" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'month' && (
                    <input type="month" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}
                  {f.type === 'week' && (
                    <input type="week" className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                  )}

                  {/* ── Choice ── */}
                  {f.type === 'select' && (
                    <select className="form-control" value={formData[f.id] || ''} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required}>
                      <option value="">-- Select {f.label} --</option>
                      {(f.options || '').split(',').map(opt => (
                        <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  )}
                  {f.type === 'radio' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
                      {(f.options || '').split(',').map(opt => (
                        <label key={opt.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
                          <input
                            type="radio"
                            name={`radio_${f.id}`}
                            value={opt.trim()}
                            checked={formData[f.id] === opt.trim()}
                            onChange={() => handleInputChange(f.id, opt.trim())}
                            required={f.required}
                          />
                          {opt.trim()}
                        </label>
                      ))}
                    </div>
                  )}
                  {f.type === 'checkbox' && (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px', fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={!!formData[f.id]}
                        onChange={(e) => handleInputChange(f.id, e.target.checked ? 'Yes' : 'No')}
                      />
                      {formData[f.id] === 'Yes' ? 'Yes' : 'No'}
                    </label>
                  )}
                  {f.type === 'multiselect' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                      {(f.options || '').split(',').map(opt => {
                        const selected = (formData[f.id] || '').split(',').map(s => s.trim()).filter(Boolean);
                        const isChecked = selected.includes(opt.trim());
                        return (
                          <label key={opt.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? selected.filter(s => s !== opt.trim())
                                  : [...selected, opt.trim()];
                                handleInputChange(f.id, updated.join(', '));
                              }}
                            />
                            {opt.trim()}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Special ── */}
                  {f.type === 'file' && (
                    <input type="file" className="form-control" onChange={(e) => setFileAttachment(e.target.files[0])} required={f.required} />
                  )}
                  {f.type === 'color' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="color" style={{ width: '48px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', cursor: 'pointer' }} value={formData[f.id] || '#3b82f6'} onChange={(e) => handleInputChange(f.id, e.target.value)} required={f.required} />
                      <span style={{ fontSize: '0.9rem', color: '#64748b', fontFamily: 'monospace' }}>{formData[f.id] || '#3b82f6'}</span>
                    </div>
                  )}
                  {f.type === 'rating' && (
                    <div style={{ display: 'flex', gap: '6px', paddingTop: '4px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange(f.id, String(star))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem', lineHeight: 1, color: Number(formData[f.id] || 0) >= star ? '#f59e0b' : '#d1d5db', transition: 'color 0.15s' }}
                        >★</button>
                      ))}
                      {formData[f.id] && <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#64748b' }}>{formData[f.id]} / 5</span>}
                    </div>
                  )}
                </div>
              ))}

              {/* Standard File Attachment Upload if not present in custom fields */}
              {!dynamicFields.some(f => f.type === 'file') && (
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Supporting Document Attachment</label>
                  <input type="file" className="form-control" onChange={(e) => setFileAttachment(e.target.files[0])} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} /> Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder={`Search ${pageInfo.title} records...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
        </div>
      </div>

      {/* Records Data Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>
          Submitted Records ({filteredRecords.length})
        </h3>

        {filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No records found. Click "Submit New Record" above to add your first entry.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  {dynamicFields.map(f => (
                    <th key={f.id}>{f.label}</th>
                  ))}
                  <th>Document File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.staff_name || 'N/A'}</td>
                    <td><span className="badge badge-secondary">{r.department || 'N/A'}</span></td>
                    {dynamicFields.map(f => (
                      <td key={f.id} style={{ maxWidth: '250px' }}>
                        {r.data?.[f.id] || 'N/A'}
                      </td>
                    ))}
                    <td>
                      {r.file ? (
                        <a 
                          href={`${API_BASE_URL}/uploads/${r.file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={14} /> View File
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No File</span>
                      )}
                    </td>
                    <td>
                      {(auth.role === 'admin' || auth.role === 'dept_admin' || auth.staffId === r.staff_id) && (
                        <button 
                          className="btn"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', border: '1px solid hsl(var(--danger))', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
