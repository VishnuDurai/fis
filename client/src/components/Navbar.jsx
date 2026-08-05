import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, Settings, LogOut, ChevronDown, ShieldCheck, Bell } from 'lucide-react';

export default function Navbar({ title, userName, profilePic, auth, logout }) {
  const navigate = useNavigate();
  const [deptFaculty, setDeptFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(localStorage.getItem('srec_view_staffId') || '');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingNotice, setPendingNotice] = useState({ userPendingCount: 0, pendingHodCount: 0, pendingPrincipalHrCount: 0 });
  const profileMenuRef = useRef(null);

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
    }
  }, [auth]);

  // Click outside listener to close profile dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
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
  const profilePicUrl = profilePic 
    ? `${API_BASE_URL}/uploads/upload/${profilePic}?token=${auth?.token || localStorage.getItem('srec_token') || ''}` 
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

        {/* PENDING APPRAISAL REVIEW NOTIFICATION BELL */}
        {pendingNotice.userPendingCount > 0 && (
          <button
            type="button"
            onClick={() => navigate('/appraisal')}
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
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.92rem', color: '#0f172a' }}>{userName || 'User'}</span>
              <span style={{
                fontSize: '0.75rem',
                color: isHodUser ? '#0369a1' : 'hsl(var(--primary))',
                fontWeight: 800,
                background: isHodUser ? '#e0f2fe' : 'transparent',
                padding: isHodUser ? '1px 8px' : 0,
                borderRadius: isHodUser ? '10px' : 0,
                border: isHodUser ? '1px solid #7dd3fc' : 'none',
                display: 'inline-block'
              }}>
                {roleLabel}
              </span>
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
  );
}
