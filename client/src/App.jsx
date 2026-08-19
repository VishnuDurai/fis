import { API_BASE_URL } from "./config";
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Personal from './pages/Personal.jsx';
import AcademicInfo from './pages/AcademicInfo.jsx';
import OfficialDocuments from './pages/OfficialDocuments.jsx';
import Education from './pages/Education.jsx';
import Activities from './pages/Activities.jsx';
import Reports from './pages/Reports.jsx';
import AccreditationSuite from './pages/AccreditationSuite.jsx';
import Appraisal from './pages/Appraisal.jsx';
import Responsibilities from './pages/Responsibilities.jsx';
import DynamicPagesAdmin from './pages/DynamicPagesAdmin.jsx';
import DynamicPage from './pages/DynamicPage.jsx';
import Analytics from './pages/Analytics.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Settings from './pages/Settings.jsx';
import CVGenerator from './pages/CVGenerator.jsx';
import EventDesignSuite from './pages/EventDesignSuite.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PWAInstallBanner from './components/PWAInstallBanner.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import { AlertProvider, showWarning } from './context/AlertContext.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const token = localStorage.getItem('srec_token');
    const role = localStorage.getItem('srec_role');
    const staffId = localStorage.getItem('srec_staffId');
    const name = localStorage.getItem('srec_name');
    const profilePic = localStorage.getItem('srec_profilePic');
    const department = localStorage.getItem('srec_dept');
    const designation = localStorage.getItem('srec_designation');
    const isHod = localStorage.getItem('srec_isHod') === 'true';
    const isInstitutionalAdmin = localStorage.getItem('srec_isInst') === 'true';
    const isSupervisorEligible = role === 'admin' || role === 'dept_admin' || localStorage.getItem('srec_isSupervisorEligible') === 'true';
    const isClubCoordinator = localStorage.getItem('srec_isClubCoord') === 'true';
    let myClubs = [];
    try {
      const rawClubs = localStorage.getItem('srec_myClubs');
      if (rawClubs && rawClubs !== 'undefined' && rawClubs !== 'null') {
        myClubs = JSON.parse(rawClubs);
      }
    } catch (e) {
      myClubs = [];
    }

    if (token && role && staffId) {
      setAuth({ token, role, staffId, name, profilePic, department, designation, isHod, isInstitutionalAdmin, isSupervisorEligible, isClubCoordinator, myClubs });
    }
    setCheckingAuth(false);
  }, []);

  // Sync supervisor eligibility & HOD role claims from server
  const checkSupervisorEligibility = React.useCallback(() => {
    if (auth && auth.token && auth.role === 'faculty') {
      fetch(`${API_BASE_URL}/api/faculty/check-supervisor-eligibility`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.isSupervisorEligible === 'boolean') {
            localStorage.setItem('srec_isSupervisorEligible', data.isSupervisorEligible ? 'true' : 'false');
            if (typeof data.isHod === 'boolean') {
              localStorage.setItem('srec_isHod', data.isHod ? 'true' : 'false');
            }
            if (data.department) {
              localStorage.setItem('srec_dept', data.department);
            }
            if (data.designation) {
              localStorage.setItem('srec_designation', data.designation);
            }
            if (data.name) {
              localStorage.setItem('srec_name', data.name);
            }
            setAuth(prev => {
              if (!prev) return null;
              const newName = data.name || prev.name;
              const newHod = typeof data.isHod === 'boolean' ? data.isHod : prev.isHod;
              const newDept = data.department || prev.department;
              const newDesg = data.designation || prev.designation;
              if (
                prev.isSupervisorEligible !== data.isSupervisorEligible ||
                prev.name !== newName ||
                prev.isHod !== newHod ||
                prev.department !== newDept ||
                prev.designation !== newDesg
              ) {
                return {
                  ...prev,
                  isSupervisorEligible: data.isSupervisorEligible,
                  name: newName,
                  isHod: newHod,
                  department: newDept,
                  designation: newDesg
                };
              }
              return prev;
            });
          }
        })
        .catch(err => console.error('Error checking supervisor eligibility:', err));

      fetch(`${API_BASE_URL}/api/faculty/my-clubs`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.clubs)) {
            const hasCoord = data.clubs.some(c => c.role === 'coordinator');
            localStorage.setItem('srec_isClubCoord', hasCoord ? 'true' : 'false');
            localStorage.setItem('srec_myClubs', JSON.stringify(data.clubs));
            setAuth(prev => prev ? { ...prev, isClubCoordinator: hasCoord, myClubs: data.clubs } : null);
          }
        })
        .catch(err => console.error('Error checking user clubs:', err));
    }
  }, [auth?.token, auth?.staffId, auth?.role]);

  useEffect(() => {
    checkSupervisorEligibility();
    window.addEventListener('srec_profile_updated', checkSupervisorEligibility);
    window.addEventListener('focus', checkSupervisorEligibility);
    return () => {
      window.removeEventListener('srec_profile_updated', checkSupervisorEligibility);
      window.removeEventListener('focus', checkSupervisorEligibility);
    };
  }, [checkSupervisorEligibility]);

  const logout = () => {
    const token = localStorage.getItem('srec_token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }

    localStorage.removeItem('srec_token');
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
    setAuth(null);
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };
    window.addEventListener('srec_logout', handleLogoutEvent);
    return () => window.removeEventListener('srec_logout', handleLogoutEvent);
  }, []);

  // 5-Minute Inactivity Auto-Logout Effect
  useEffect(() => {
    if (!auth) return;

    const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)
    let timer = null;

    const handleInactivityLogout = () => {
      logout();
      showWarning('You have been logged out due to 5 minutes of inactivity for security.');
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer));

    // Start timer on mount
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [auth]);

  const updateProfilePic = (newPic) => {
    if (newPic) {
      localStorage.setItem('srec_profilePic', newPic);
      setAuth(prev => prev ? { ...prev, profilePic: newPic } : null);
    }
  };

  if (checkingAuth) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Restoring Session...</div>;
  }

  return (
    <ErrorBoundary>
      <AlertProvider>
        <BrowserRouter>
          <PWAInstallPrompt />
          {auth ? (
            <div className="dashboard-layout">
              <Sidebar role={auth.role} logout={logout} auth={auth} />
              <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <div style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/dashboard" element={<Home auth={auth} />} />
                    <Route path="/profile/academic" element={<AcademicInfo auth={auth} />} />
                    <Route path="/profile/personal" element={<Personal auth={auth} />} />
                    <Route path="/profile/documents" element={<OfficialDocuments auth={auth} />} />
                    <Route path="/profile/education" element={<Education auth={auth} />} />
                    <Route path="/activities/:type" element={<Activities auth={auth} />} />
                    <Route path="/appraisal" element={<Appraisal auth={auth} />} />
                    <Route path="/responsibilities" element={<Responsibilities auth={auth} />} />
                    <Route path="/analytics" element={<Analytics auth={auth} />} />
                    <Route path="/reports" element={<Reports auth={auth} />} />
                    <Route path="/cv-generator" element={<CVGenerator auth={auth} />} />
                    <Route path="/resume-builder" element={<CVGenerator auth={auth} />} />
                    <Route path="/event-design-suite" element={<EventDesignSuite auth={auth} />} />
                    <Route path="/event-design" element={<EventDesignSuite auth={auth} />} />
                    <Route path="/reports/accreditation" element={<AccreditationSuite auth={auth} />} />
                    <Route path="/accreditation" element={<AccreditationSuite auth={auth} />} />
                    <Route path="/custom/:slug" element={<DynamicPage auth={auth} />} />
                    
                    {/* Admin Routes */}
                    {auth.role === 'admin' && (
                      <Route path="/admin/dynamic-pages" element={<DynamicPagesAdmin auth={auth} />} />
                    )}
                    {(auth.role === 'admin' || auth.role === 'dept_admin') && (
                      <Route path="/admin/faculty" element={<AdminUsers auth={auth} initialTab="faculty" />} />
                    )}
                    {(auth.role === 'admin' || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('principal') || (auth.designation || '').toLowerCase().includes('hr')) && (
                      <Route path="/admin/clubs" element={<AdminUsers auth={auth} initialTab="clubs" />} />
                    )}
                    {auth.role === 'admin' && (
                      <>
                        <Route path="/admin/dept-admins" element={<AdminUsers auth={auth} initialTab="dept_admins" />} />
                        <Route path="/admin/system-admins" element={<AdminUsers auth={auth} initialTab="system_admins" />} />
                      </>
                    )}

                    <Route path="/settings" element={<Settings auth={auth} updateProfilePic={updateProfilePic} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
                <Footer />
              </main>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/login" element={<Login setAuth={setAuth} />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </div>
              <Footer />
            </div>
          )}
          <PWAInstallBanner />
        </BrowserRouter>
      </AlertProvider>
    </ErrorBoundary>
  );
}
