import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { 
  Layers, Plus, Trash2, Edit3, Eye, FileText, CheckSquare, 
  Square, ShieldAlert, Award, BookOpen, Sparkles, Folder, 
  GraduationCap, Users, Star, Save, X, ArrowLeft 
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'FileText', icon: FileText },
  { name: 'Award', icon: Award },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Layers', icon: Layers },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Folder', icon: Folder },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Users', icon: Users },
  { name: 'Star', icon: Star },
  { name: 'ShieldAlert', icon: ShieldAlert }
];

const MENU_POSITION_OPTIONS = [
  { id: 'standalone', label: 'Standalone Top-Level Menu Item' },
  { id: 'personal', label: 'Sub-Menu under Personal Details' },
  { id: 'academic', label: 'Sub-Menu under Academics' },
  { id: 'activity', label: 'Sub-Menu under Faculty Activity' },
  { id: 'reports', label: 'Sub-Menu under Reports & Dossier' }
];

export default function DynamicPagesAdmin({ auth }) {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('standalone');
  const [portals, setPortals] = useState(['admin', 'dept_admin', 'faculty']);
  const [icon, setIcon] = useState('FileText');
  const [fields, setFields] = useState([
    { id: 'f_1', label: 'Title / Description', type: 'text', required: true, options: '' }
  ]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dynamic-pages`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setCategory('standalone');
    setPortals(['admin', 'dept_admin', 'faculty']);
    setIcon('FileText');
    setFields([
      { id: 'f_1', label: 'Title / Description', type: 'text', required: true, options: '' }
    ]);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (page) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setCategory(page.category || 'standalone');
    setPortals(page.portals || ['admin', 'dept_admin', 'faculty']);
    setIcon(page.icon || 'FileText');
    setFields(page.fields && page.fields.length > 0 ? page.fields : [
      { id: 'f_1', label: 'Title / Description', type: 'text', required: true, options: '' }
    ]);
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingId) {
      const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
      setSlug(autoSlug);
    }
  };

  const togglePortal = (portalKey) => {
    if (portals.includes(portalKey)) {
      if (portals.length === 1) return; // Must have at least one portal
      setPortals(portals.filter(p => p !== portalKey));
    } else {
      setPortals([...portals, portalKey]);
    }
  };

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    setFields([...fields, { id: newId, label: '', type: 'text', required: false, options: '' }]);
  };

  const handleRemoveField = (index) => {
    if (fields.length === 1) {
      alert('A dynamic page must have at least one field');
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, key, val) => {
    const updated = [...fields];
    updated[index][key] = val;
    setFields(updated);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!title.trim() || !slug.trim()) {
      setError('Page Title and URL Slug are required');
      return;
    }

    if (fields.some(f => !f.label.trim())) {
      setError('All field labels must be filled out');
      return;
    }

    const payload = { title, slug, category, portals, fields, icon };
    const url = editingId 
      ? `${API_BASE_URL}/api/dynamic-pages/${editingId}`
      : `${API_BASE_URL}/api/dynamic-pages`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? 'Dynamic page updated successfully!' : 'Dynamic page created successfully!');
        setShowModal(false);
        fetchPages();
      } else {
        setError(data.error || 'Failed to save dynamic page');
      }
    } catch (err) {
      setError('Server error while saving dynamic page');
    }
  };

  const handleDeletePage = async (page) => {
    if (!window.confirm(`Are you sure you want to delete the dynamic page "${page.title}"?\nAll submitted entries for this page will also be permanently deleted.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/dynamic-pages/${page.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage(`Dynamic page "${page.title}" deleted.`);
        fetchPages();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete dynamic page');
      }
    } catch (err) {
      setError('Server error while deleting dynamic page');
    }
  };

  return (
    <div>
      <Navbar title="Dynamic Pages Manager" userName={auth.name} profilePic={auth.profilePic} auth={auth} />

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

      {/* Admin Tab Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '24px', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          <button className="btn" style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }} onClick={() => navigate('/admin/faculty')}>
            Faculty Profiles
          </button>
          <button className="btn" style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }} onClick={() => navigate('/admin/system-admins')}>
            System Administrators
          </button>
          <button className="btn" style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }} onClick={() => navigate('/admin/dept-admins')}>
            Dept Admins
          </button>
          <button className="btn" style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }} onClick={() => navigate('/admin/clubs')}>
            Clubs & Incharges
          </button>
          <button className="btn" style={{ background: 'hsl(var(--primary))', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} />
            Dynamic Page Builder
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={26} style={{ color: 'hsl(var(--primary))' }} />
              System Admin Provision: Dynamic Page Builder
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Create custom dynamic pages with tailored form fields, position them as standalone or sub-menu items, and control visibility across portals.
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
            style={{ padding: '12px 24px', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Create New Dynamic Page
          </button>
        </div>
      </div>

      {/* Pages List */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>Configured Dynamic Pages</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading dynamic pages...</div>
        ) : pages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No dynamic pages created yet. Click "Create New Dynamic Page" above to add your first page!
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>URL Slug / Route</th>
                  <th>Menu Position</th>
                  <th>Target Portals</th>
                  <th>Fields Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>/custom/{p.slug}</code></td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                        {MENU_POSITION_OPTIONS.find(m => m.id === p.category)?.label || p.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {p.portals?.includes('admin') && <span className="badge" style={{ background: '#0284c7', color: '#fff' }}>Admin</span>}
                        {p.portals?.includes('dept_admin') && <span className="badge" style={{ background: '#16a34a', color: '#fff' }}>Dept Admin</span>}
                        {p.portals?.includes('faculty') && <span className="badge" style={{ background: '#8b5cf6', color: '#fff' }}>Faculty</span>}
                      </div>
                    </td>
                    <td><span className="badge badge-success">{p.fields?.length || 0} fields</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a 
                          href={`/custom/${p.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={14} /> Preview
                        </a>
                        <button 
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleOpenEditModal(p)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button 
                          className="btn"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', border: '1px solid hsl(var(--danger))', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeletePage(p)}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', color: '#111827', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                {editingId ? 'Edit Dynamic Page' : 'Create New Dynamic Page'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
            </div>

            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Page Basic Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label className="form-label">Page Title <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Extension & Outreach Activities"
                    value={title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">URL Slug / Route <span style={{ color: 'hsl(var(--danger))' }}>*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ background: '#f1f5f9', padding: '10px 12px', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>/custom/</span>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ borderRadius: '0 8px 8px 0' }}
                      placeholder="extension-activities"
                      value={slug} 
                      disabled={!!editingId}
                      onChange={(e) => setSlug(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Menu Positioning & Icon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <label className="form-label">Menu Position</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {MENU_POSITION_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Sidebar Menu Icon</label>
                  <select className="form-control" value={icon} onChange={(e) => setIcon(e.target.value)}>
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Portals Visibility */}
              <div>
                <label className="form-label">Target Portals (Visibility)</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={portals.includes('admin')} onChange={() => togglePortal('admin')} />
                    System Admin Portal
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={portals.includes('dept_admin')} onChange={() => togglePortal('dept_admin')} />
                    Department Admin Portal
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={portals.includes('faculty')} onChange={() => togglePortal('faculty')} />
                    Faculty Portal
                  </label>
                </div>
              </div>

              {/* Dynamic Field Builder */}
              <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Dynamic Form Fields Setup</h4>
                  <button type="button" className="btn btn-secondary" onClick={handleAddField} style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fields.map((f, idx) => (
                    <div key={f.id || idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Field Label</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Event Title / Client Name"
                          value={f.label} 
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Field Type</label>
                        <select className="form-control" value={f.type} onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}>
                          <option value="text">Single-line Text</option>
                          <option value="number">Numeric Value</option>
                          <option value="date">Date Picker</option>
                          <option value="select">Dropdown Select</option>
                          <option value="textarea">Multi-line Textarea</option>
                          <option value="file">File Attachment Upload</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Required</label>
                        <select className="form-control" value={f.required ? 'true' : 'false'} onChange={(e) => handleFieldChange(idx, 'required', e.target.value === 'true')}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Options (Select)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Option 1, Option 2"
                          disabled={f.type !== 'select'}
                          value={f.options || ''} 
                          onChange={(e) => handleFieldChange(idx, 'options', e.target.value)}
                        />
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '18px' }}>
                        <button type="button" onClick={() => handleRemoveField(idx)} style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> {editingId ? 'Save Changes' : 'Create Dynamic Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
