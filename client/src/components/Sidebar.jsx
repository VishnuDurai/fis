import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, User, BookOpen, GraduationCap, Award, FileText,
  LogOut, Users, ShieldAlert, BarChart3, FileCheck,
  ChevronDown, ChevronRight, Beaker, Activity, Layers, Sparkles, Folder, Star
} from 'lucide-react';

const DYNAMIC_ICONS_MAP = {
  FileText: { icon: <FileText size={15} strokeWidth={2.2} />, color: '#10b981' },
  Award: { icon: <Award size={15} strokeWidth={2.2} />, color: '#eab308' },
  BookOpen: { icon: <BookOpen size={15} strokeWidth={2.2} />, color: '#2563eb' },
  Layers: { icon: <Layers size={15} strokeWidth={2.2} />, color: '#f59e0b' },
  Sparkles: { icon: <Sparkles size={15} strokeWidth={2.2} />, color: '#d946ef' },
  Folder: { icon: <Folder size={15} strokeWidth={2.2} />, color: '#0d9488' },
  GraduationCap: { icon: <GraduationCap size={15} strokeWidth={2.2} />, color: '#6366f1' },
  Users: { icon: <Users size={15} strokeWidth={2.2} />, color: '#0284c7' },
  Star: { icon: <Star size={15} strokeWidth={2.2} />, color: '#ec4899' },
  ShieldAlert: { icon: <ShieldAlert size={15} strokeWidth={2.2} />, color: '#f43f5e' }
};

const renderMenuIcon = (icon, color = '#10b981', isActive = false, isGroupHeader = false) => {
  const size = isGroupHeader ? 28 : 24;
  const iconSize = isGroupHeader ? 16 : 14;

  return (
    <span
      className="sidebar-icon-badge"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isActive ? color : `${color}18`,
        color: isActive ? '#ffffff' : color,
        boxShadow: isActive ? `0 2px 10px ${color}66` : 'none',
        borderRadius: isGroupHeader ? '8px' : '6px',
        border: isActive ? `1px solid ${color}` : `1px solid ${color}22`
      }}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon, { size: iconSize, strokeWidth: 2.2 })
        : icon}
    </span>
  );
};

export default function Sidebar({ role, logout, auth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [systemPageConfigs, setSystemPageConfigs] = useState([]);
  const [dynamicPages, setDynamicPages] = useState([]);
  const [pendingAppraisalsCount, setPendingAppraisalsCount] = useState(0);

  const fetchMenuData = useCallback(() => {
    if (auth && auth.token) {
      Promise.all([
        fetch(`${API_BASE_URL}/api/dynamic-pages`, { headers: { 'Authorization': `Bearer ${auth.token}` } }),
        fetch(`${API_BASE_URL}/api/faculty/appraisals/pending-counts`, { headers: { 'Authorization': `Bearer ${auth.token}` } }),
        fetch(`${API_BASE_URL}/api/system-page-configs`, { headers: { 'Authorization': `Bearer ${auth.token}` } })
      ])
        .then(async ([pRes, cRes, sRes]) => {
          if (pRes && pRes.ok) {
            const data = await pRes.json();
            if (Array.isArray(data)) setDynamicPages(data);
          }
          if (cRes && cRes.ok) {
            const data = await cRes.json();
            if (data && typeof data.userPendingCount === 'number') setPendingAppraisalsCount(data.userPendingCount);
          }
          if (sRes && sRes.ok) {
            const data = await sRes.json();
            if (Array.isArray(data)) setSystemPageConfigs(data);
          }
        })
        .catch(err => console.error('Sidebar fetch error:', err));
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchMenuData();
    window.addEventListener('srec_dynamic_pages_updated', fetchMenuData);
    return () => {
      window.removeEventListener('srec_dynamic_pages_updated', fetchMenuData);
    };
  }, [fetchMenuData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHod = auth?.isHod || (auth?.designation || '').toLowerCase().includes('hod') || (auth?.designation || '').toLowerCase().includes('head');
  const isDoctorateOrPhd = auth?.isSupervisorEligible || 
                           (auth?.name || '').toLowerCase().includes('dr.') || 
                           (auth?.name || '').toLowerCase().includes('dr ');
  const isInstAdminUser = auth?.isInstitutionalAdmin || (auth?.designation || '').toLowerCase().includes('principal') || (auth?.designation || '').toLowerCase().includes('hr');
  const isClubCoord = auth?.isClubCoordinator || (auth?.myClubs && auth.myClubs.length > 0);

  // Define menu structure across all 3 portals with memoization
  const menuStructure = useMemo(() => {
    let baseMenu = [];

    if (role === 'admin') {
      baseMenu = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          isSingle: true,
          to: '/dashboard',
          icon: <Home />,
          color: '#0284c7'
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: false,
          icon: <User />,
          color: '#8b5cf6',
          items: [
            { to: '/admin/faculty', label: 'Faculty Directory', icon: <Users />, color: '#3b82f6' },
            { to: '/admin/dept-admins', label: 'Dept Admins', icon: <ShieldAlert />, color: '#8b5cf6' },
            { to: '/admin/system-admins', label: 'System Admins', icon: <ShieldAlert />, color: '#ef4444' },
            { to: '/admin/dynamic-pages', label: 'Dynamic Page Builder', icon: <Layers />, color: '#f59e0b' },
            { to: '/admin/clubs', label: 'Clubs & Incharges', icon: <Sparkles />, color: '#d946ef' },
            { to: '/profile/personal', label: 'Personal Details', icon: <User />, color: '#06b6d4' }
          ]
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen />,
          color: '#2563eb',
          items: [
            { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen />, color: '#2563eb' },
            { to: '/profile/documents', label: 'Official Documents', icon: <Folder />, color: '#0d9488' },
            { to: '/profile/education', label: 'Education Details', icon: <GraduationCap />, color: '#6366f1' },
            { to: '/activities/memberships', label: 'Memberships', icon: <Users />, color: '#8b5cf6' },
            { to: '/responsibilities', label: 'Assign Responsibilities', icon: <FileText />, color: '#d97706' }
          ]
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity />,
          color: '#f59e0b',
          items: [
            { to: '/activities/interactions', label: 'Interaction Details', icon: <Users />, color: '#0284c7' },
            { to: '/activities/resource', label: 'Resource Person', icon: <Award />, color: '#8b5cf6' },
            { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap />, color: '#10b981' },
            { to: '/activities/awards', label: 'Awards Received', icon: <Award />, color: '#eab308' },
            { to: '/activities/events', label: 'Events Organized', icon: <BarChart3 />, color: '#f97316' },
            { to: '/activities/clubs', label: 'Clubs Activity Organized', icon: <Sparkles />, color: '#d946ef' },
            { to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap />, color: '#06b6d4' },
            { to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award />, color: '#6366f1' },
            { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText />, color: '#10b981' },
            { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <Beaker />, color: '#14b8a6' },
            { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert />, color: '#ea580c' },
            { to: '/activities/publications', label: 'Publications', icon: <BookOpen />, color: '#3b82f6' },
            { to: '/activities/books', label: 'Book Published', icon: <BookOpen />, color: '#9333ea' }
          ]
        },
        {
          id: 'appraisal',
          title: 'Appraisal Form',
          isSingle: true,
          to: '/appraisal',
          icon: <FileCheck />,
          color: '#10b981'
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <BarChart3 />,
          color: '#06b6d4'
        }
      ];
    } else if (role === 'dept_admin') {
      baseMenu = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          isSingle: true,
          to: '/dashboard',
          icon: <Home />,
          color: '#0284c7'
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: false,
          icon: <User />,
          color: '#8b5cf6',
          items: [
            { to: '/admin/faculty', label: 'Dept Faculty Directory', icon: <Users />, color: '#3b82f6' },
            { to: '/profile/personal', label: 'Personal Details', icon: <User />, color: '#06b6d4' }
          ]
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen />,
          color: '#2563eb',
          items: [
            { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen />, color: '#2563eb' },
            { to: '/profile/documents', label: 'Official Documents', icon: <Folder />, color: '#0d9488' },
            { to: '/profile/education', label: 'Education Details', icon: <GraduationCap />, color: '#6366f1' },
            { to: '/activities/memberships', label: 'Memberships', icon: <Users />, color: '#8b5cf6' },
            { to: '/responsibilities', label: 'Assigned Responsibilities', icon: <FileText />, color: '#d97706' }
          ]
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity />,
          color: '#f59e0b',
          items: [
            { to: '/activities/interactions', label: 'Interaction Details', icon: <Users />, color: '#0284c7' },
            { to: '/activities/resource', label: 'Resource Person', icon: <Award />, color: '#8b5cf6' },
            { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap />, color: '#10b981' },
            { to: '/activities/awards', label: 'Awards Received', icon: <Award />, color: '#eab308' },
            { to: '/activities/events', label: 'Events Organized', icon: <BarChart3 />, color: '#f97316' },
            { to: '/activities/clubs', label: 'Clubs Activity Organized', icon: <Sparkles />, color: '#d946ef' }
          ]
        },
        {
          id: 'rnd',
          title: 'R&D',
          isSingle: false,
          icon: <Beaker />,
          color: '#ec4899',
          items: [
            { to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap />, color: '#06b6d4' },
            { to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award />, color: '#6366f1' },
            { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText />, color: '#10b981' },
            { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <Beaker />, color: '#14b8a6' },
            { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert />, color: '#ea580c' },
            { to: '/activities/publications', label: 'Publications', icon: <BookOpen />, color: '#3b82f6' },
            { to: '/activities/books', label: 'Book Published', icon: <BookOpen />, color: '#9333ea' }
          ]
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <BarChart3 />,
          color: '#06b6d4'
        }
      ];
    } else {
      // REGULAR FACULTY PORTAL MENU
      const academicsSubItems = [
        { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen />, color: '#2563eb' },
        { to: '/profile/documents', label: 'Official Documents', icon: <Folder />, color: '#0d9488' },
        { to: '/profile/education', label: 'Education Details', icon: <GraduationCap />, color: '#6366f1' },
        { to: '/activities/memberships', label: 'Memberships', icon: <Users />, color: '#8b5cf6' },
        { to: '/responsibilities', label: isHod ? 'Assign Responsibilities' : 'Assigned Responsibilities', icon: <FileText />, color: '#d97706' }
      ];

      if (isInstAdminUser) {
        academicsSubItems.push({ to: '/admin/clubs', label: 'Assign Club Coordinators', icon: <Star />, color: '#ec4899' });
      }

      const activitySubItems = [
        { to: '/activities/interactions', label: 'Interaction Details', icon: <Users />, color: '#0284c7' },
        { to: '/activities/resource', label: 'Resource Person', icon: <Award />, color: '#8b5cf6' },
        { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap />, color: '#10b981' },
        { to: '/activities/awards', label: 'Awards Received', icon: <Award />, color: '#eab308' },
        { to: '/activities/events', label: 'Events Organized', icon: <BarChart3 />, color: '#f97316' }
      ];

      if (isClubCoord) {
        activitySubItems.push({ to: '/activities/clubs', label: 'Clubs', icon: <Sparkles />, color: '#d946ef' });
      }

      const rndSubItems = [];
      if (!isDoctorateOrPhd) {
        rndSubItems.push({ to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap />, color: '#06b6d4' });
      } else {
        rndSubItems.push({ to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award />, color: '#6366f1' });
      }

      rndSubItems.push(
        { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText />, color: '#10b981' },
        { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <Beaker />, color: '#14b8a6' },
        { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert />, color: '#ea580c' },
        { to: '/activities/publications', label: 'Publications', icon: <BookOpen />, color: '#3b82f6' },
        { to: '/activities/books', label: 'Book Published', icon: <BookOpen />, color: '#9333ea' }
      );

      baseMenu = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          isSingle: true,
          to: '/dashboard',
          icon: <Home />,
          color: '#0284c7'
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: true,
          to: '/profile/personal',
          icon: <User />,
          color: '#8b5cf6'
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen />,
          color: '#2563eb',
          items: academicsSubItems
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity />,
          color: '#f59e0b',
          items: activitySubItems
        },
        {
          id: 'rnd',
          title: 'R&D',
          isSingle: false,
          icon: <Beaker />,
          color: '#ec4899',
          items: rndSubItems
        },
        {
          id: 'appraisal',
          title: 'Appraisal Form',
          isSingle: true,
          to: '/appraisal',
          icon: <FileCheck />,
          color: '#10b981'
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <BarChart3 />,
          color: '#06b6d4'
        }
      ];
    }

    // INJECT CUSTOM DYNAMIC PAGES INTO NAVIGATION TREE
    const userRole = role || 'faculty';
    const allowedDynamicPages = (dynamicPages || []).filter(p => {
      let pPortals = p.portals;
      if (typeof pPortals === 'string') {
        try { pPortals = JSON.parse(pPortals); } catch (e) { pPortals = []; }
      }
      if (!Array.isArray(pPortals) || pPortals.length === 0) return true;
      return pPortals.includes(userRole);
    });

    allowedDynamicPages.forEach(p => {
      const iconConfig = DYNAMIC_ICONS_MAP[p.icon] || { icon: <FileText size={15} strokeWidth={2.2} />, color: '#10b981' };
      const subItem = { to: `/custom/${p.slug}`, label: p.title, icon: iconConfig.icon, color: iconConfig.color };
      const cat = (p.category || '').toLowerCase().trim();

      if (cat === 'personal') {
        const sec = baseMenu.find(s => s.id === 'personal');
        if (sec) {
          if (sec.isSingle) {
            sec.isSingle = false;
            sec.items = [
              { to: sec.to, label: 'Personal Details', icon: <User />, color: '#06b6d4' },
              subItem
            ];
            delete sec.to;
          } else if (Array.isArray(sec.items)) {
            sec.items.push(subItem);
          }
        }
      } else if (cat === 'academic' || cat === 'academics') {
        const sec = baseMenu.find(s => s.id === 'academics');
        if (sec && Array.isArray(sec.items)) sec.items.push(subItem);
      } else if (cat === 'activity' || cat === 'activities' || cat === 'faculty_activity') {
        const sec = baseMenu.find(s => s.id === 'activity');
        if (sec && Array.isArray(sec.items)) sec.items.push(subItem);
      } else if (cat === 'rnd') {
        const sec = baseMenu.find(s => s.id === 'rnd' || s.id === 'activity');
        if (sec && Array.isArray(sec.items)) sec.items.push(subItem);
      } else if (cat === 'reports') {
        const sec = baseMenu.find(s => s.id === 'reports');
        if (sec) {
          if (sec.isSingle) {
            sec.isSingle = false;
            sec.items = [
              { to: sec.to, label: 'Reports and Dossier', icon: <BarChart3 />, color: '#06b6d4' },
              subItem
            ];
            delete sec.to;
          } else if (Array.isArray(sec.items)) {
            sec.items.push(subItem);
          }
        }
      } else {
        // Standalone Top-Level Menu item
        baseMenu.push({
          id: `custom-${p.slug}`,
          title: p.title,
          isSingle: true,
          to: `/custom/${p.slug}`,
          icon: iconConfig.icon,
          color: iconConfig.color
        });
      }
    });

    return baseMenu;
  }, [role, dynamicPages, isHod, isDoctorateOrPhd, isInstAdminUser, isClubCoord]);

  // Track expanded state for accordion categories
  const [expandedGroups, setExpandedGroups] = useState({
    academics: true,
    activity: true,
    rnd: true,
    personal: true
  });

  useEffect(() => {
    // Auto expand group if current pathname matches an item inside, without infinite loop
    menuStructure.forEach(group => {
      if (!group.isSingle && Array.isArray(group.items)) {
        const hasActive = group.items.some(item => location.pathname === item.to);
        if (hasActive) {
          setExpandedGroups(prev => {
            if (prev[group.id]) return prev;
            return { ...prev, [group.id]: true };
          });
        }
      }
    });
  }, [location.pathname, menuStructure]);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '20px 20px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'hsla(var(--bg-card), 0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="SREC logo" style={{ height: '46px', width: 'auto', objectFit: 'contain' }} />
          <h3 style={{ fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            SREC FIS <span className="version-badge-anim">V3.0</span>
          </h3>
        </div>
        <div style={{ marginTop: '10px' }}>
          {role === 'admin' || isInstAdminUser ? (
            <span className="portal-badge portal-badge-admin">
              <ShieldAlert size={13} /> Institutional Admin
            </span>
          ) : role === 'dept_admin' || isHod ? (
            <span className="portal-badge portal-badge-hod">
              <Award size={13} /> HOD / Dept Admin
            </span>
          ) : (
            <span className="portal-badge portal-badge-faculty">
              <GraduationCap size={13} /> Faculty Portal
            </span>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 14px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {menuStructure.map((group) => {
            if (group.isSingle) {
              return (
                <li key={group.id} style={{ marginBottom: '6px' }}>
                  <NavLink
                    to={group.to}
                    className="sidebar-nav-link"
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 14px',
                      borderRadius: 'var(--radius)',
                      color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                      background: isActive ? 'hsla(var(--primary), 0.1)' : 'transparent',
                      borderLeft: isActive ? '4px solid hsl(var(--primary))' : '4px solid transparent',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.92rem',
                      textDecoration: 'none'
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        {renderMenuIcon(group.icon, group.color, isActive, true)}
                        <span>{group.title}</span>
                        {group.id === 'appraisal' && pendingAppraisalsCount > 0 && (
                          <span style={{
                            marginLeft: 'auto',
                            background: '#ff4d4f',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '10px'
                          }}>
                            {pendingAppraisalsCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            }

            const isExpanded = !!expandedGroups[group.id];
            const hasActiveChild = Array.isArray(group.items) && group.items.some(item => location.pathname === item.to);

            return (
              <li key={group.id} style={{ marginBottom: '6px' }}>
                {/* Section Group Header */}
                <button
                  type="button"
                  className="sidebar-group-btn"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius)',
                    background: hasActiveChild ? 'hsla(var(--primary), 0.08)' : 'transparent',
                    border: 'none',
                    color: hasActiveChild ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {renderMenuIcon(group.icon, group.color, hasActiveChild, true)}
                    <span>{group.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Sub Items List */}
                {isExpanded && Array.isArray(group.items) && (
                  <ul style={{ listStyle: 'none', paddingLeft: '14px', margin: '4px 0 6px 0', borderLeft: '2px solid hsl(var(--border))', marginLeft: '22px' }}>
                    {group.items.map((item, idx) => (
                      <li key={`${group.id}-item-${idx}`} style={{ marginBottom: '4px' }}>
                        <NavLink
                          to={item.to}
                          className="sidebar-nav-link"
                          style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '7px 12px',
                            borderRadius: 'var(--radius)',
                            color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                            background: isActive ? 'hsla(var(--primary), 0.12)' : 'transparent',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.86rem',
                            textDecoration: 'none'
                          })}
                        >
                          {({ isActive }) => (
                            <>
                              {renderMenuIcon(item.icon, item.color, isActive, false)}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile & logout footer */}
      <div style={{ padding: '16px', borderTop: '1px solid hsl(var(--border))', background: 'hsla(var(--bg-card), 0.5)' }}>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '9px 14px', fontSize: '0.9rem', fontWeight: 600 }}
        >
          {renderMenuIcon(<LogOut />, '#ef4444', false, false)}
          Logout
        </button>
      </div>
    </aside>
  );
}
