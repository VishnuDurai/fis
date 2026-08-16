import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, Settings, LogOut, ChevronDown, ShieldCheck, Bell, Sun, Moon, Search, Megaphone, X } from 'lucide-react';

export default function Navbar({ title, userName, profilePic, auth, logout }) {
  const navigate = useNavigate();
  const [deptFaculty, setDeptFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(localStorage.getItem('srec_view_staffId') || '');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifData, setNotifData] = useState({ unreadCount: 0, notifications: [] });
  const [pendingNotice, setPendingNotice] = useState({ userPendingCount: 0, pendingHodCount: 0, pendingPrincipalHrCount: 0 });
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('srec_theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState([]);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('srec_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('srec_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!searchQuery.trim() || !auth) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/admin/search-faculty?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setSearchResults(data || []);
        setShowSearchResults(true);
      })
      .catch(err => console.error(err));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, auth]);

  useEffect(() => {
    if (auth && (auth.role === 'dept_admin' || auth.role === 'admin')) {
      const headers = { 'Authorization': `Bearer ${auth.token}` };
      Promise.all([
        fetch(`${API_BASE_URL}/api/admin/staff`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/departments`, { headers })
      ])
      .then(async ([sRes, dRes]) => {
        if (sRes.ok) setDeptFaculty(await sRes.json());
        if (dRes.ok) setDepartments(await dRes.json());
      })
      .catch(err => console.error(err));
    }

    if (auth && auth.token) {
      fetch(`${API_BASE_URL}/api/faculty/appraisals/pending-counts`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setPendingNotice(data);
      })
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/faculty/notifications`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setNotifData(data);
      })
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/admin/announcements/active`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(err => console.error(err));
    }
  }, [auth]);

  // Click outside listener to close profile & notification dropdown menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDeptAcronym = (deptName) => {
    if (!deptName) return '';
    const match = departments.find(d => 
      (d.name || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase() ||
      (d.acronym || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase()
    );
    return match && match.acronym && match.acronym.trim().toLowerCase() !== match.name.trim().toLowerCase() ? ` [${match.acronym}]` : '';
  };

  const handleSelectFaculty = (e) => {
    const val = e.target.value;
    setSelectedStaffId(val);
    if (val) {
      localStorage.setItem('srec_view_staffId', val);
    } else {
      localStorage.removeItem('srec_view_staffId');
    }
    window.location.reload();
  };

  const handleSignOut = () => {
    const token = localStorage.getItem('srec_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    if (typeof logout === 'function') {
      logout();
    }
    
    localStorage.removeItem('srec_token');
    localStorage.removeItem('srec_user');
    localStorage.removeItem('srec_role');
    localStorage.removeItem('srec_staffId');
    localStorage.removeItem('srec_name');
    localStorage.removeItem('srec_profilePic');
    localStorage.removeItem('srec_dept');
    localStorage.removeItem('srec_designation');
    localStorage.removeItem('srec_isHod');
    localStorage.removeItem('srec_isInst');
    localStorage.removeItem('srec_isSupervisorEligible');
    localStorage.removeItem('srec_view_staffId');

    window.dispatchEvent(new Event('srec_logout'));
    window.location.href = '/login';
  };

  // Construct absolute URL for profile picture
  const activePic = profilePic || localStorage.getItem('srec_profilePic');
  const profilePicUrl = activePic 
    ? `${API_BASE_URL}/uploads/upload/${activePic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}` 
    : null;

  const isHodUser = auth?.isHod || (auth?.designation || '').toLowerCase().includes('hod') || (auth?.designation || '').toLowerCase().includes('head');
  const isInstAdminUser = auth?.isInstitutionalAdmin || (auth?.designation || '').toLowerCase().includes('principal') || (auth?.designation || '').toLowerCase().includes('hr');
  const roleLabel = auth?.role === 'admin' 
    ? 'System Admin' 
    : auth?.role === 'dept_admin' 
    ? 'Dept Admin' 
    : isHodUser 
    ? 'HOD' 
    : isInstAdminUser
    ? (auth?.designation || 'Executive Admin')
    : 'Faculty';

  return (
    <>
      {/* IN-APP ANNOUNCEMENTS BROADCAST BANNER */}
      {announcements && announcements.filter(a => !dismissedAnnouncements.includes(a.id)).length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {announcements.filter(a => !dismissedAnnouncements.includes(a.id)).map(a => (
            <div 
              key={a.id}
              style={{
                background: a.category === 'Urgent' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <Megaphone size={18} style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', marginRight: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    [{a.category || 'Announcement'}] {a.title}:
                  </span>
                  <span style={{ fontSize: '0.88rem', opacity: 0.95 }}>
                    {a.message}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedAnnouncements(prev => [...prev, a.id])}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingBottom: '24px', 
        marginBottom: '32px',
        borderBottom: '1px solid hsl(var(--border))' 
      }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{title}</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Sri Ramakrishna Engineering College FIS <span className="version-badge-anim">V3.0</span>
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* INSTANT GLOBAL FACULTY SEARCH */}
        {auth && (auth.role === 'admin' || auth.role === 'dept_admin' || auth.role === 'principal' || auth.role === 'hr') && (
          <div ref={searchRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '4px 12px', gap: '6px', width: '210px' }}>
              <Search size={15} style={{ color: 'hsl(var(--text-muted))' }} />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '100%', color: 'hsl(var(--text-main))' }}
              />
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '250px', overflowY: 'auto' }}>
                {searchResults.map(f => (
                  <div
                    key={f.staff_id}
                    onClick={() => {
                      localStorage.setItem('srec_view_staffId', f.staff_id);
                      setSelectedStaffId(f.staff_id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                      window.dispatchEvent(new Event('srec_view_staffId_changed'));
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#0f172a' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <div style={{ fontWeight: 700, color: '#15583b' }}>{f.staff_name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{f.staff_id} • {f.designation || 'Faculty'} ({f.department || 'DEPT'})</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {auth && (auth.role === 'dept_admin' || auth.role === 'admin') && deptFaculty.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'hsla(var(--primary), 0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid hsla(var(--primary), 0.2)' }}>
            <Eye size={16} style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>Filter Faculty Dossier:</span>
            <select 
              className="form-control" 
              style={{ padding: '4px 8px', fontSize: '0.82rem', height: 'auto', background: '#fff' }} 
              value={selectedStaffId} 
              onChange={handleSelectFaculty}
            >
              <option value="">-- All Department Faculty --</option>
              {deptFaculty.map(f => (
                <option key={f.staff_id} value={f.staff_id}>
                  {f.staff_id} - {f.staff_name} ({f.Designation}{getDeptAcronym(f.Department)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DARK MODE / SLEEK THEME SWITCHER */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          style={{
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0f172a',
            transition: 'all 0.2s ease'
          }}
        >
          {isDarkMode ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#6366f1' }} />}
        </button>

        {/* PENDING APPRAISAL REVIEW NOTIFICATION BELL */}
        {pendingNotice.userPendingCount > 0 && (
          <button
            type="button"
            onClick={() => {
              const targetStatus = pendingNotice.isInstAdmin ? 'HOD Approved' : 'Submitted';
              navigate(`/appraisal?tab=submissions&status=${encodeURIComponent(targetStatus)}`);
            }}
            title={
              pendingNotice.isInstAdmin
                ? `${pendingNotice.pendingPrincipalHrCount} HOD-approved appraisal form(s) pending Principal & HR evaluation`
                : `${pendingNotice.pendingHodCount} department appraisal form(s) pending HOD review`
            }
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fffbe6',
              border: '1.5px solid #ffe58f',
              borderRadius: '20px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#d48806',
              boxShadow: '0 2px 5px rgba(212,136,6,0.18)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Bell size={16} style={{ color: '#fa8c16' }} />
            <span>Appraisals Pending</span>
            <span style={{
              background: '#ff4d4f',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '10px',
              marginLeft: '2px'
            }}>
              {pendingNotice.userPendingCount}
            </span>
          </button>
        )}

        {/* SYSTEM & PROFILE ACTION NOTIFICATIONS BELL DROPDOWN */}
        <div ref={notifMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="System & Action Notifications"
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0f172a',
              transition: 'all 0.2s ease'
            }}
          >
            <Bell size={18} />
            {notifData.unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {notifData.unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '320px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              zIndex: 1050,
              padding: '12px',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{notifData.notifications?.length || 0} total</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifData.notifications?.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>No pending notifications.</div>
                ) : (
                  notifData.notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifMenu(false);
                        if (n.link) navigate(n.link);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: n.type === 'warning' ? '#fffbe6' : n.type === 'info' ? '#f0f9ff' : '#f0fdf4',
                        border: '1px solid ' + (n.type === 'warning' ? '#ffe58f' : n.type === 'info' ? '#bae6fd' : '#bbf7d0'),
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.3' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* CLICKABLE PROFILE PICTURE AVATAR BLOCK & DROPDOWN MENU */}
        <div ref={profileMenuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Click for Profile Menu (Settings & Sign Out)"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '24px',
              border: showProfileMenu ? '1.5px solid hsl(var(--primary))' : '1.5px solid transparent',
              background: showProfileMenu ? 'hsla(var(--primary), 0.08)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 800, display: 'block', fontSize: '0.92rem', color: 'hsl(var(--text-main))' }}>{userName || 'User'}</span>
              <div style={{ marginTop: '2px' }}>
                {auth?.role === 'admin' || isInstAdminUser ? (
                  <span className="portal-badge portal-badge-admin" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>{roleLabel}</span>
                ) : auth?.role === 'dept_admin' || isHodUser ? (
                  <span className="portal-badge portal-badge-hod" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>{roleLabel}</span>
                ) : (
                  <span className="portal-badge portal-badge-faculty" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>{roleLabel}</span>
                )}
              </div>
            </div>

            {profilePicUrl ? (
              <img 
                src={profilePicUrl} 
                alt="Profile avatar" 
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(var(--primary))' }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                background: 'hsla(var(--primary), 0.15)', 
                color: 'hsl(var(--primary))', 
                display: profilePicUrl ? 'none' : 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1.5px solid hsl(var(--primary))'
              }}
            >
              <User size={20} />
            </div>

            <ChevronDown size={16} style={{ color: '#64748b', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>

          {/* FLOATING PROFILE DROPDOWN MENU */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '230px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.05)',
              border: '1.5px solid #e2e8f0',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease'
            }}>
              {/* Account Header */}
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                  {userName || 'User'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} style={{ color: 'hsl(var(--primary))' }} /> {roleLabel} Portal Session
                </span>
              </div>

              {/* Navigation Menu Options */}
              <div style={{ padding: '6px' }}>
                <button
                  type="button"
                  onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.88rem',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} style={{ color: 'hsl(var(--primary))' }} />
                  <span>Settings & Security</span>
                </button>

                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.88rem',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} style={{ color: '#ef4444' }} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
