import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, User, BookOpen, GraduationCap, Award, FileText,
  Settings, LogOut, Users, ShieldAlert, BarChart3, HelpCircle, FileCheck,
  ChevronDown, ChevronRight, Beaker, Activity, Layers, Sparkles, Folder, Star
} from 'lucide-react';

const DYNAMIC_ICONS_MAP = {
  FileText: <FileText size={16} />,
  Award: <Award size={16} />,
  BookOpen: <BookOpen size={16} />,
  Layers: <Layers size={16} />,
  Sparkles: <Sparkles size={16} />,
  Folder: <Folder size={16} />,
  GraduationCap: <GraduationCap size={16} />,
  Users: <Users size={16} />,
  Star: <Star size={16} />,
  ShieldAlert: <ShieldAlert size={16} />
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
          icon: <Home size={18} />
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: false,
          icon: <User size={18} />,
          items: [
            { to: '/admin/faculty', label: 'Faculty Directory', icon: <Users size={16} /> },
            { to: '/admin/dept-admins', label: 'Dept Admins', icon: <ShieldAlert size={16} /> },
            { to: '/admin/system-admins', label: 'System Admins', icon: <ShieldAlert size={16} /> },
            { to: '/admin/dynamic-pages', label: 'Dynamic Page Builder', icon: <Layers size={16} /> },
            { to: '/admin/clubs', label: 'Clubs & Incharges', icon: <Award size={16} /> },
            { to: '/profile/personal', label: 'Personal Details', icon: <User size={16} /> }
          ]
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen size={18} />,
          items: [
            { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen size={16} /> },
            { to: '/profile/documents', label: 'Official Documents', icon: <FileText size={16} /> },
            { to: '/profile/education', label: 'Education Details', icon: <GraduationCap size={16} /> },
            { to: '/activities/memberships', label: 'Memberships', icon: <Users size={16} /> },
            { to: '/responsibilities', label: 'Assign Responsibilities', icon: <FileText size={16} /> }
          ]
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity size={18} />,
          items: [
            { to: '/activities/interactions', label: 'Interaction Details', icon: <Users size={16} /> },
            { to: '/activities/resource', label: 'Resource Person', icon: <Award size={16} /> },
            { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap size={16} /> },
            { to: '/activities/awards', label: 'Awards Received', icon: <Award size={16} /> },
            { to: '/activities/events', label: 'Events Organized', icon: <FileText size={16} /> },
            { to: '/activities/clubs', label: 'Clubs Activity Organized', icon: <Award size={16} /> },
            { to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap size={16} /> },
            { to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award size={16} /> },
            { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText size={16} /> },
            { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <FileText size={16} /> },
            { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert size={16} /> },
            { to: '/activities/publications', label: 'Publications', icon: <BookOpen size={16} /> },
            { to: '/activities/books', label: 'Book Published', icon: <BookOpen size={16} /> }
          ]
        },
        {
          id: 'appraisal',
          title: 'Appraisal Form',
          isSingle: true,
          to: '/appraisal',
          icon: <FileCheck size={18} />
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <FileText size={18} />
        }
      ];
    } else if (role === 'dept_admin') {
      baseMenu = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          isSingle: true,
          to: '/dashboard',
          icon: <Home size={18} />
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: false,
          icon: <User size={18} />,
          items: [
            { to: '/admin/faculty', label: 'Dept Faculty Directory', icon: <Users size={16} /> },
            { to: '/profile/personal', label: 'Personal Details', icon: <User size={16} /> }
          ]
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen size={18} />,
          items: [
            { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen size={16} /> },
            { to: '/profile/documents', label: 'Official Documents', icon: <FileText size={16} /> },
            { to: '/profile/education', label: 'Education Details', icon: <GraduationCap size={16} /> },
            { to: '/activities/memberships', label: 'Memberships', icon: <Users size={16} /> },
            { to: '/responsibilities', label: 'Assigned Responsibilities', icon: <FileText size={16} /> }
          ]
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity size={18} />,
          items: [
            { to: '/activities/interactions', label: 'Interaction Details', icon: <Users size={16} /> },
            { to: '/activities/resource', label: 'Resource Person', icon: <Users size={16} /> },
            { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap size={16} /> },
            { to: '/activities/awards', label: 'Awards Received', icon: <Award size={16} /> },
            { to: '/activities/events', label: 'Events Organized', icon: <BarChart3 size={16} /> },
            { to: '/activities/clubs', label: 'Clubs Activity Organized', icon: <Award size={16} /> }
          ]
        },
        {
          id: 'rnd',
          title: 'R&D',
          isSingle: false,
          icon: <Beaker size={18} />,
          items: [
            { to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap size={16} /> },
            { to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award size={16} /> },
            { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText size={16} /> },
            { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <FileText size={16} /> },
            { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert size={16} /> },
            { to: '/activities/publications', label: 'Publications', icon: <BookOpen size={16} /> },
            { to: '/activities/books', label: 'Book Published', icon: <BookOpen size={16} /> }
          ]
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <FileText size={18} />
        }
      ];
    } else {
      // REGULAR FACULTY PORTAL MENU
      const academicsSubItems = [
        { to: '/profile/academic', label: 'Academic Information', icon: <BookOpen size={16} /> },
        { to: '/profile/documents', label: 'Official Documents', icon: <FileText size={16} /> },
        { to: '/profile/education', label: 'Education Details', icon: <GraduationCap size={16} /> },
        { to: '/activities/memberships', label: 'Memberships', icon: <Users size={16} /> },
        { to: '/responsibilities', label: isHod ? 'Assign Responsibilities' : 'Assigned Responsibilities', icon: <FileText size={16} /> }
      ];

      if (isInstAdminUser) {
        academicsSubItems.push({ to: '/admin/clubs', label: 'Assign Club Coordinators', icon: <Award size={16} /> });
      }

      const activitySubItems = [
        { to: '/activities/interactions', label: 'Interaction Details', icon: <Users size={16} /> },
        { to: '/activities/resource', label: 'Resource Person', icon: <Users size={16} /> },
        { to: '/activities/certifications', label: 'Certifications', icon: <GraduationCap size={16} /> },
        { to: '/activities/awards', label: 'Awards Received', icon: <Award size={16} /> },
        { to: '/activities/events', label: 'Events Organized', icon: <BarChart3 size={16} /> }
      ];

      if (isClubCoord) {
        activitySubItems.push({ to: '/activities/clubs', label: 'Clubs', icon: <Award size={16} /> });
      }

      const rndSubItems = [];
      if (!isDoctorateOrPhd) {
        rndSubItems.push({ to: '/activities/scholars', label: 'Research Scholar', icon: <GraduationCap size={16} /> });
      } else {
        rndSubItems.push({ to: '/activities/supervisors', label: 'Research Supervisor', icon: <Award size={16} /> });
      }

      rndSubItems.push(
        { to: '/activities/funding', label: 'Research Funding & Grants', icon: <FileText size={16} /> },
        { to: '/activities/seed_money', label: 'Seed Money & Consultancy', icon: <FileText size={16} /> },
        { to: '/activities/ipr', label: 'IPR / Copyrights', icon: <ShieldAlert size={16} /> },
        { to: '/activities/publications', label: 'Publications', icon: <BookOpen size={16} /> },
        { to: '/activities/books', label: 'Book Published', icon: <BookOpen size={16} /> }
      );

      baseMenu = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          isSingle: true,
          to: '/dashboard',
          icon: <Home size={18} />
        },
        {
          id: 'personal',
          title: 'Personal',
          isSingle: true,
          to: '/profile/personal',
          icon: <User size={18} />
        },
        {
          id: 'academics',
          title: 'Academics',
          isSingle: false,
          icon: <BookOpen size={18} />,
          items: academicsSubItems
        },
        {
          id: 'activity',
          title: 'Faculty Activity',
          isSingle: false,
          icon: <Activity size={18} />,
          items: activitySubItems
        },
        {
          id: 'rnd',
          title: 'R&D',
          isSingle: false,
          icon: <Beaker size={18} />,
          items: rndSubItems
        },
        {
          id: 'appraisal',
          title: 'Appraisal Form',
          isSingle: true,
          to: '/appraisal',
          icon: <FileCheck size={18} />
        },
        {
          id: 'reports',
          title: 'Reports and Dossier',
          isSingle: true,
          to: '/reports',
          icon: <FileText size={18} />
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
      const pIcon = DYNAMIC_ICONS_MAP[p.icon] || <FileText size={16} />;
      const subItem = { to: `/custom/${p.slug}`, label: p.title, icon: pIcon };
      const cat = (p.category || '').toLowerCase().trim();

      if (cat === 'personal') {
        const sec = baseMenu.find(s => s.id === 'personal');
        if (sec) {
          if (sec.isSingle) {
            sec.isSingle = false;
            sec.items = [
              { to: sec.to, label: 'Personal Details', icon: <User size={16} /> },
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
              { to: sec.to, label: 'Reports and Dossier', icon: <FileText size={16} /> },
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
          icon: DYNAMIC_ICONS_MAP[p.icon] ? React.cloneElement(DYNAMIC_ICONS_MAP[p.icon], { size: 18 }) : <FileText size={18} />
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
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 16px',
                      borderRadius: 'var(--radius)',
                      color: isActive ? '#ffffff' : 'hsl(var(--text-muted))',
                      background: isActive ? 'hsl(var(--primary))' : 'transparent',
                      borderLeft: isActive ? '4px solid hsl(var(--secondary))' : '4px solid transparent',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      transition: 'var(--transition-smooth)'
                    })}
                  >
                    {group.icon}
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
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
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
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Sub Items List */}
                {isExpanded && Array.isArray(group.items) && (
                  <ul style={{ listStyle: 'none', paddingLeft: '16px', margin: '4px 0 6px 0', borderLeft: '2px solid hsl(var(--border))', marginLeft: '24px' }}>
                    {group.items.map((item, idx) => (
                      <li key={`${group.id}-item-${idx}`} style={{ marginBottom: '4px' }}>
                        <NavLink
                          to={item.to}
                          style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                            background: isActive ? 'hsla(var(--primary), 0.12)' : 'transparent',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.86rem',
                            textDecoration: 'none',
                            transition: 'var(--transition-smooth)'
                          })}
                        >
                          {item.icon}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
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
          style={{ width: '100%', justifyContent: 'center', gap: '8px', padding: '10px' }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
