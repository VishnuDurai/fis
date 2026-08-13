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

  // Main Tab State: 'sys_pages' | 'custom_builder'
  const [adminTab, setAdminTab] = useState('sys_pages');

  // System Page Config State
  const [sysConfigs, setSysConfigs] = useState([]);
  const [selectedSysPageKey, setSelectedSysPageKey] = useState('publications');
  const [sysPageTitle, setSysPageTitle] = useState('Publications');
  const [sysCategory, setSysCategory] = useState('activity');
  const [sysPortals, setSysPortals] = useState(['admin', 'dept_admin', 'faculty']);
  const [sysIcon, setSysIcon] = useState('BookOpen');
  const [sysFields, setSysFields] = useState([]);
  const [pubConstraints, setPubConstraints] = useState({});
  const [selectedPubCat, setSelectedPubCat] = useState('Journal');
  const [newCatName, setNewCatName] = useState('');
  const [sysLoading, setSysLoading] = useState(false);

  const fetchSysConfigs = async () => {
    setSysLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/system-page-configs`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSysConfigs(data);
        const active = data.find(d => d.page_key === selectedSysPageKey);
        if (active) {
          loadSysPageConfig(active);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSysLoading(false);
    }
  };

  const loadSysPageConfig = (config) => {
    setSelectedSysPageKey(config.page_key);
    setSysPageTitle(config.title || config.page_key);
    setSysCategory(config.category || 'activity');
    setSysPortals(config.portals || ['admin', 'dept_admin', 'faculty']);
    setSysIcon(config.icon || 'BookOpen');
    setSysFields(config.fields || []);
    setPubConstraints(config.publication_type_constraints || {});
    const catKeys = Object.keys(config.publication_type_constraints || {});
    if (catKeys.length > 0) {
      setSelectedPubCat(catKeys[0]);
    }
  };

  const handleSelectSysPage = (pageKey) => {
    const found = sysConfigs.find(c => c.page_key === pageKey);
    if (found) {
      loadSysPageConfig(found);
    }
  };

  const handleSaveSysPageConfig = async () => {
    setMessage('');
    setError('');
    try {
      const payload = {
        title: sysPageTitle,
        category: sysCategory,
        portals: sysPortals,
        icon: sysIcon,
        fields: sysFields,
        publication_type_constraints: pubConstraints
      };
      const res = await fetch(`${API_BASE_URL}/api/system-page-configs/${selectedSysPageKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`System page configuration for "${sysPageTitle}" saved successfully!`);
        fetchSysConfigs();
      } else {
        setError(data.error || 'Failed to save system page configuration');
      }
    } catch (err) {
      setError('Server error while saving system page configuration');
    }
  };

  const handleResetSysPageConfig = async () => {
    if (!window.confirm(`Reset "${sysPageTitle}" configuration to system default?`)) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/system-page-configs/${selectedSysPageKey}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Configuration for "${sysPageTitle}" reset to default.`);
        fetchSysConfigs();
      } else {
        setError(data.error || 'Failed to reset configuration');
      }
    } catch (err) {
      setError('Server error while resetting configuration');
    }
  };

  useEffect(() => {
    fetchPages();
    fetchSysConfigs();
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

      {/* Top Navigation & Sub-Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
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
              Clubs &amp; Incharges
            </button>
            <button className="btn" style={{ background: 'hsl(var(--primary))', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} />
              Page &amp; Menu Configurator
            </button>
          </div>
        </div>

        {/* Configurator Sub-Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setAdminTab('sys_pages')}
            style={{
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              borderBottom: adminTab === 'sys_pages' ? '3px solid hsl(var(--primary))' : '3px solid transparent',
              background: 'transparent',
              color: adminTab === 'sys_pages' ? 'hsl(var(--primary))' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BookOpen size={18} /> Standard System Pages &amp; Rules Configurator
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('custom_builder')}
            style={{
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              borderBottom: adminTab === 'custom_builder' ? '3px solid hsl(var(--primary))' : '3px solid transparent',
              background: 'transparent',
              color: adminTab === 'custom_builder' ? 'hsl(var(--primary))' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Layers size={18} /> Custom Dynamic Pages Builder ({pages.length})
          </button>
        </div>
      </div>

      {/* TAB 1: STANDARD SYSTEM PAGES CONFIGURATOR */}
      {adminTab === 'sys_pages' && (
        <div>
          {/* System Page Banner */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={26} style={{ color: 'hsl(var(--primary))' }} />
                  System Page &amp; Menu Rules Configurator
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  Dynamically modify standard system pages, set mandatory/optional/hidden fields, configure publication type constraints (Journal, Conference, Patent, etc.), and manage menu positions across portals without code modifications.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleResetSysPageConfig}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontWeight: 600, fontSize: '0.88rem' }}
                >
                  Reset Page to Default
                </button>
                <button
                  type="button"
                  onClick={handleSaveSysPageConfig}
                  className="btn btn-primary"
                  style={{ padding: '10px 22px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={18} /> Save Page Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Active System Page Selector */}
          <div className="card" style={{ marginBottom: '24px', padding: '18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Select System Page to Configure:</label>
              <select
                className="form-control"
                style={{ maxWidth: '320px', fontWeight: 700 }}
                value={selectedSysPageKey}
                onChange={(e) => handleSelectSysPage(e.target.value)}
              >
                {sysConfigs.map(c => (
                  <option key={c.page_key} value={c.page_key}>{c.title} ({c.page_key})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Settings & Menu Positioning */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: '#0f172a', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '10px' }}>
              1. Menu &amp; Portal Settings: {sysPageTitle}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Page / Menu Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={sysPageTitle}
                  onChange={(e) => setSysPageTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Menu Position / Category</label>
                <select className="form-control" value={sysCategory} onChange={(e) => setSysCategory(e.target.value)}>
                  {MENU_POSITION_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Sidebar Menu Icon</label>
                <select className="form-control" value={sysIcon} onChange={(e) => setSysIcon(e.target.value)}>
                  {ICON_OPTIONS.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Target Portals (Visibility)</label>
              <div style={{ display: 'flex', gap: '24px', marginTop: '6px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={sysPortals.includes('admin')}
                    onChange={() => {
                      if (sysPortals.includes('admin')) {
                        if (sysPortals.length === 1) return;
                        setSysPortals(sysPortals.filter(p => p !== 'admin'));
                      } else {
                        setSysPortals([...sysPortals, 'admin']);
                      }
                    }}
                  /> System Admin Portal
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={sysPortals.includes('dept_admin')}
                    onChange={() => {
                      if (sysPortals.includes('dept_admin')) {
                        if (sysPortals.length === 1) return;
                        setSysPortals(sysPortals.filter(p => p !== 'dept_admin'));
                      } else {
                        setSysPortals([...sysPortals, 'dept_admin']);
                      }
                    }}
                  /> Department Admin Portal
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={sysPortals.includes('faculty')}
                    onChange={() => {
                      if (sysPortals.includes('faculty')) {
                        if (sysPortals.length === 1) return;
                        setSysPortals(sysPortals.filter(p => p !== 'faculty'));
                      } else {
                        setSysPortals([...sysPortals, 'faculty']);
                      }
                    }}
                  /> Faculty Portal
                </label>
              </div>
            </div>
          </div>

          {/* Special Section: Publication Type Rules Editor */}
          {selectedSysPageKey === 'publications' && (
            <div className="card" style={{ marginBottom: '24px', border: '2px solid hsl(var(--primary))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>
                    2. Publication Type Constraints &amp; Rules Editor
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Configure specific field visibility and mandatory rules based on Publication Category (Journal vs Conference vs Book Chapter vs Patent).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New Category Name (e.g. Patent)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (!newCatName.trim()) return;
                      const catName = newCatName.trim();
                      if (pubConstraints[catName]) {
                        alert('Category already exists');
                        return;
                      }
                      const updated = {
                        ...pubConstraints,
                        [catName]: { requiredFields: ['title', 'date_con'], optionalFields: [], hiddenFields: [] }
                      };
                      setPubConstraints(updated);
                      setSelectedPubCat(catName);
                      setNewCatName('');
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {Object.keys(pubConstraints).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className="btn"
                    onClick={() => setSelectedPubCat(cat)}
                    style={{
                      background: selectedPubCat === cat ? 'hsl(var(--primary))' : '#f1f5f9',
                      color: selectedPubCat === cat ? '#ffffff' : '#334155',
                      borderColor: selectedPubCat === cat ? 'hsl(var(--primary))' : '#cbd5e1',
                      fontWeight: selectedPubCat === cat ? 800 : 600,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.88rem'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Field Rule Toggles for Selected Category */}
              {selectedPubCat && pubConstraints[selectedPubCat] && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>
                    Field Rules for "{selectedPubCat}" Category:
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {sysFields.map(field => {
                      const rules = pubConstraints[selectedPubCat] || {};
                      const isReq = (rules.requiredFields || []).includes(field.name);
                      const isOpt = (rules.optionalFields || []).includes(field.name);
                      const isHid = (rules.hiddenFields || []).includes(field.name);

                      let currentStatus = 'optional';
                      if (isReq) currentStatus = 'required';
                      if (isHid) currentStatus = 'hidden';

                      const handleStatusChange = (newStatus) => {
                        const updatedCatRules = {
                          requiredFields: (rules.requiredFields || []).filter(f => f !== field.name),
                          optionalFields: (rules.optionalFields || []).filter(f => f !== field.name),
                          hiddenFields: (rules.hiddenFields || []).filter(f => f !== field.name)
                        };
                        if (newStatus === 'required') updatedCatRules.requiredFields.push(field.name);
                        if (newStatus === 'optional') updatedCatRules.optionalFields.push(field.name);
                        if (newStatus === 'hidden') updatedCatRules.hiddenFields.push(field.name);

                        setPubConstraints({
                          ...pubConstraints,
                          [selectedPubCat]: updatedCatRules
                        });
                      };

                      return (
                        <div key={field.name} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px', color: '#0f172a' }}>
                            {field.label} <code style={{ fontSize: '0.75rem', color: '#64748b' }}>({field.name})</code>
                          </div>
                          <select
                            className="form-control"
                            style={{ fontSize: '0.8rem', padding: '4px 8px', fontWeight: 600 }}
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                          >
                            <option value="required">🔴 Mandatory (Required)</option>
                            <option value="optional">🟡 Optional</option>
                            <option value="hidden">⚪ Hidden (Not Shown)</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Constraints Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>
                3. Global Field Constraints &amp; Mandatory Options ({sysFields.length} Fields)
              </h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  const newFieldName = `field_${Date.now()}`;
                  setSysFields([...sysFields, { name: newFieldName, label: 'New Custom Field', type: 'text', required: false, status: 'active' }]);
                }}
                style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Add Custom Field
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sysFields.map((f, idx) => (
                <div key={f.name || idx} style={{ background: (f.status === 'hidden') ? '#f1f5f9' : '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.2fr 1.2fr 1.5fr 40px', gap: '12px', alignItems: 'center', opacity: (f.status === 'hidden') ? 0.75 : 1 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Field Label</label>
                    <input
                      type="text"
                      className="form-control"
                      value={f.label}
                      onChange={(e) => {
                        const updated = [...sysFields];
                        updated[idx].label = e.target.value;
                        setSysFields(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Field Type</label>
                    <select
                      className="form-control"
                      value={f.type}
                      onChange={(e) => {
                        const updated = [...sysFields];
                        updated[idx].type = e.target.value;
                        setSysFields(updated);
                      }}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="month">Month</option>
                      <option value="select">Dropdown Select</option>
                      <option value="multiselect">Multi-Select</option>
                      <option value="textarea">Textarea</option>
                      <option value="file">File Upload</option>
                      <option value="email">Email</option>
                      <option value="tel">Phone</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Visibility (Show/Hide)</label>
                    <select
                      className="form-control"
                      style={{ fontWeight: 700, color: (f.status === 'hidden') ? '#64748b' : '#16a34a' }}
                      value={f.status || 'active'}
                      onChange={(e) => {
                        const updated = [...sysFields];
                        updated[idx].status = e.target.value;
                        setSysFields(updated);
                      }}
                    >
                      <option value="active">🟢 Visible (Show)</option>
                      <option value="hidden">⚪ Hidden (Hide)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Mandatory?</label>
                    <select
                      className="form-control"
                      style={{ fontWeight: 700, color: f.required ? '#dc2626' : '#d97706' }}
                      value={f.required ? 'true' : 'false'}
                      onChange={(e) => {
                        const updated = [...sysFields];
                        updated[idx].required = e.target.value === 'true';
                        setSysFields(updated);
                      }}
                    >
                      <option value="true">🔴 Required</option>
                      <option value="false">🟡 Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Options List (Select)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Option 1, Option 2"
                      disabled={f.type !== 'select' && f.type !== 'multiselect'}
                      value={Array.isArray(f.options) ? f.options.join(', ') : (f.options || '')}
                      onChange={(e) => {
                        const updated = [...sysFields];
                        updated[idx].options = e.target.value.split(',').map(s => s.trim());
                        setSysFields(updated);
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '18px' }}>
                    <button
                      type="button"
                      onClick={() => setSysFields(sysFields.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSaveSysPageConfig}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={18} /> Save Page Configuration &amp; Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM DYNAMIC PAGES BUILDER */}
      {adminTab === 'custom_builder' && (
        <div>
          {/* Header Banner */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={26} style={{ color: 'hsl(var(--primary))' }} />
                  Custom Dynamic Pages Builder
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
        </div>
      )}

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
                          <optgroup label="── Text & Input ──">
                            <option value="text">Single-line Text</option>
                            <option value="textarea">Multi-line Textarea</option>
                            <option value="email">Email Address</option>
                            <option value="tel">Phone Number</option>
                            <option value="url">Website URL</option>
                            <option value="password">Password</option>
                          </optgroup>
                          <optgroup label="── Numeric ──">
                            <option value="number">Numeric Value</option>
                            <option value="range">Range / Slider</option>
                          </optgroup>
                          <optgroup label="── Date & Time ──">
                            <option value="date">Date Picker</option>
                            <option value="time">Time Picker</option>
                            <option value="datetime-local">Date &amp; Time Picker</option>
                            <option value="month">Month Picker</option>
                            <option value="week">Week Picker</option>
                          </optgroup>
                          <optgroup label="── Choice ──">
                            <option value="select">Dropdown Select</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="checkbox">Checkbox (Yes / No)</option>
                            <option value="multiselect">Multi-Select Checkboxes</option>
                          </optgroup>
                          <optgroup label="── Special ──">
                            <option value="file">File Attachment Upload</option>
                            <option value="color">Color Picker</option>
                            <option value="rating">Star Rating (1–5)</option>
                          </optgroup>
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
                          disabled={f.type !== 'select' && f.type !== 'radio' && f.type !== 'multiselect'}
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
