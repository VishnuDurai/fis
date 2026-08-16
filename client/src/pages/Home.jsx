import { API_BASE_URL } from "../config";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Award, Users, Calendar, GraduationCap, Briefcase, ShieldAlert, FileText, CheckCircle2, Star, Layers, BarChart2, FileCheck
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

export default function Home({ auth }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [facultyStats, setFacultyStats] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${auth.token}` };

        // Fetch departments for acronym mapping
        fetch(`${API_BASE_URL}/api/admin/departments`, { headers })
          .then(res => res.ok ? res.json() : [])
          .then(data => setDepartments(data))
          .catch(err => console.error(err));
        
        if (auth.role === 'admin' || auth.role === 'dept_admin') {
          // Fetch admin statistics
          const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } else {
          // Fetch faculty academic, personal profile, and personal activity stats
          const [aRes, pRes, sRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/faculty/academics`, { headers }),
            fetch(`${API_BASE_URL}/api/faculty/personal`, { headers }),
            fetch(`${API_BASE_URL}/api/faculty/stats`, { headers })
          ]);

          if (aRes.ok) {
            const aData = await aRes.json();
            if (aData && aData.length > 0) setAcademic(aData[0]);
          }
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData && pData.length > 0) setPersonal(pData[0]);
          }
          if (sRes.ok) {
            const sData = await sRes.json();
            setFacultyStats(sData);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth]);

  const getDeptWithAcronym = (deptName) => {
    if (!deptName) return '';
    const match = departments.find(d => 
      (d.name || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase() ||
      (d.acronym || '').trim().toLowerCase() === (deptName || '').trim().toLowerCase()
    );
    if (!match) return deptName;
    if (match.acronym && match.acronym.trim().toLowerCase() !== match.name.trim().toLowerCase() && !deptName.includes(`(${match.acronym})`)) {
      return `${match.name} (${match.acronym})`;
    }
    return match.name;
  };

  return (
    <div>
      <Navbar 
        title={auth.role === 'admin' ? 'Admin Dashboard' : auth.role === 'dept_admin' ? 'Dept Admin Dashboard' : 'Faculty Dashboard'} 
        userName={auth.name} 
        profilePic={auth.profilePic} 
        auth={auth}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading Dashboard details...</div>
      ) : (
        <div>
          {/* Admin Stats Grid */}
          {(auth.role === 'admin' || auth.role === 'dept_admin') && stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'hsla(var(--primary), 0.15)', color: 'hsl(var(--primary))' }}>
                  <Users size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Total Faculty</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalFaculty || 0}</span>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'hsla(var(--secondary), 0.15)', color: 'hsl(var(--secondary))' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Publications</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPublications || 0}</span>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'hsla(var(--success), 0.15)', color: 'hsl(var(--success))' }}>
                  <Award size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Faculty Awards</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalAwards || 0}</span>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'hsla(var(--accent), 0.15)', color: 'hsl(var(--accent))' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Events Organized</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalEvents || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Welcome and Academic Details (Faculty Portal) */}
          {auth.role === 'faculty' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'stretch' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', height: '100%', padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <div style={{ 
                      width: '165px', 
                      height: '165px', 
                      borderRadius: '50%', 
                      background: 'hsla(var(--primary), 0.1)', 
                      border: '3px solid hsl(var(--primary))', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {(auth.profilePic || personal?.file || localStorage.getItem('srec_profilePic')) ? (
                        <img 
                          src={`${API_BASE_URL}/uploads/upload/${auth.profilePic || personal?.file || localStorage.getItem('srec_profilePic')}?token=${auth?.token || localStorage.getItem('srec_token') || ''}`} 
                          alt="Profile" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <Users size={64} style={{ color: 'hsl(var(--primary))' }} />
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{auth.name}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Staff ID: {auth.staffId}</span>
                      {academic?.Designation && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--primary))', display: 'block', marginTop: '4px' }}>
                          {academic.Designation}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/profile/personal')}
                    style={{ width: '100%', marginTop: '16px', fontWeight: 700 }}
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Academic Information Card (Right of Profile Card) */}
                <div className="card">
                  <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '12px' }}>
                    Academic Information
                  </h3>
                  {academic ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Department</span>
                          <span style={{ fontWeight: 600 }}>{getDeptWithAcronym(academic.Department) || 'Not configured'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--accent), 0.1)', color: 'hsl(var(--accent))' }}>
                          <Calendar size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Date of Joining</span>
                          <span style={{ fontWeight: 600 }}>{academic.Date_of_joining || 'Not configured'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Experience at SREC</span>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{academic.exp_srec || '0 Years, 0 Months'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))' }}>
                          <Award size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Total Experience</span>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--success))' }}>{academic.total_exp || '0 Years, 0 Months'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))' }}>
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Highest Qualification</span>
                          <span style={{ fontWeight: 600 }}>{academic.Qualification || 'Not configured'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>AICTE Faculty ID</span>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>{personal?.aicte_id || 'Not Assigned'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))' }}>
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>Anna University ID</span>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--secondary))' }}>{personal?.anna_univ_id || 'Not Assigned'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'hsla(var(--accent), 0.1)', color: 'hsl(var(--accent))' }}>
                          <Award size={20} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>APAAR ID</span>
                          <span style={{ fontWeight: 700, color: 'hsl(var(--accent))' }}>{personal?.apaar_id || 'Not Assigned'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--text-muted))' }}>
                      Academic information is empty. Please contact Administrator.
                    </div>
                  )}
                </div>
              </div>

            </>
          )}

          {/* Faculty Activity Statistics Summary */}
          {auth.role === 'faculty' && facultyStats && (
            <div style={{ marginTop: '36px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={24} style={{ color: 'hsl(var(--primary))' }} />
                My Performance & Activity Statistics
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
                {/* 1. Publications */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/publications')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Publications</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.publications || 0}</span>
                  </div>
                </div>

                {/* 2. Books */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/books')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #8b5cf6', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Books & Chapters</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.books || 0}</span>
                  </div>
                </div>

                {/* 3. Awards */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/awards')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #eab308', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Awards & Honors</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.awards || 0}</span>
                  </div>
                </div>

                {/* 4. Research Grants */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/funding')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Research Grants</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.funding || 0}</span>
                  </div>
                </div>

                {/* 5. IPR & Patents */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/ipr')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #ec4899', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>IPR / Copyrights</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.ipr || 0}</span>
                  </div>
                </div>

                {/* 6. Resource Person */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/resource')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #06b6d4', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Resource Person</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.resource || 0}</span>
                  </div>
                </div>

                {/* 7. Memberships */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/memberships')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #6366f1', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
                    <Star size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Memberships</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.memberships || 0}</span>
                  </div>
                </div>

                {/* 8. Certifications */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/certifications')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f97316', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Certifications</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.certifications || 0}</span>
                  </div>
                </div>

                {/* 9. Events Organized */}
                <div 
                  className="card" 
                  onClick={() => navigate('/activities/events')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #14b8a6', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(20, 184, 166, 0.12)', color: '#14b8a6' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Events Organized</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.events || 0}</span>
                  </div>
                </div>

                {/* 10. Assigned Responsibilities */}
                <div 
                  className="card" 
                  onClick={() => navigate('/responsibilities')} 
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #64748b', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(100, 116, 139, 0.12)', color: '#64748b' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 600 }}>Responsibilities</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{facultyStats.responsibilities || 0}</span>
                  </div>
                </div>
              </div>

              {/* Profile Strength & Completion Status SVG Pie/Donut Chart Card (At End of Page) */}
              {(() => {
                const { score, checks } = (() => {
                  let s = 0;
                  const c = [];
                  if (personal?.dob) { s += 15; c.push({ text: 'Date of Birth registered', done: true }); }
                  else c.push({ text: 'Add Date of Birth', done: false, link: '/profile/personal' });
                  if (personal?.address) { s += 15; c.push({ text: 'Contact Address registered', done: true }); }
                  else c.push({ text: 'Add Contact Address', done: false, link: '/profile/personal' });
                  if (personal?.email) { s += 15; c.push({ text: 'Email ID registered & verified', done: true }); }
                  else c.push({ text: 'Add Email Address', done: false, link: '/profile/personal' });
                  if (personal?.pan_file) { s += 20; c.push({ text: 'PAN Card Proof Uploaded', done: true }); }
                  else c.push({ text: 'Upload PAN Card Proof', done: false, link: '/profile/personal' });
                  if (personal?.aadhar_file) { s += 20; c.push({ text: 'Aadhaar Proof Uploaded', done: true }); }
                  else c.push({ text: 'Upload Aadhaar Proof', done: false, link: '/profile/personal' });
                  if (academic?.Qualification) { s += 15; c.push({ text: 'Academic Qualification logged', done: true }); }
                  else c.push({ text: 'Configure Qualification', done: false, link: '/profile/academic' });
                  return { score: Math.min(s, 100), checks: c };
                })();

                const radius = 55;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (score / 100) * circumference;
                const chartColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

                return (
                  <div className="card" style={{ marginTop: '36px', padding: '28px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={24} style={{ color: chartColor }} />
                      Profile Strength Score & Completion Status
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '36px', alignItems: 'center' }}>
                      {/* SVG Pie / Donut Chart */}
                      <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="150" height="150" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                          <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke="#e2e8f0"
                            strokeWidth="14"
                          />
                          <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="transparent"
                            stroke={chartColor}
                            strokeWidth="14"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1 }}>{score}%</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: chartColor, textTransform: 'uppercase', tracking: '0.5px', marginTop: '4px', display: 'block' }}>
                            {score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Action'}
                          </span>
                        </div>
                      </div>

                      {/* Checklist Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        {checks.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => !item.done && item.link && navigate(item.link)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              fontSize: '0.84rem', 
                              padding: '10px 14px', 
                              background: item.done ? '#f0fdf4' : '#fef2f2', 
                              border: '1.5px solid ' + (item.done ? '#bbf7d0' : '#fecaca'), 
                              borderRadius: '8px', 
                              cursor: item.done ? 'default' : 'pointer' 
                            }}
                          >
                            <span style={{ color: item.done ? '#166534' : '#991b1b', fontWeight: 600 }}>{item.text}</span>
                            <span style={{ fontWeight: 800, fontSize: '0.78rem', color: item.done ? '#166534' : '#dc2626' }}>{item.done ? '✓ Done' : 'Pending Action →'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Admin Profile Card */}
          {(auth.role === 'admin' || auth.role === 'dept_admin') && (
            <div className="card" style={{ 
              marginBottom: '32px', 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '24px',
              background: 'linear-gradient(135deg, hsla(var(--primary), 0.08), hsla(var(--secondary), 0.08))',
              border: '1px solid hsla(var(--primary), 0.2)'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'hsl(var(--primary))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800
              }}>
                {auth.name ? auth.name.charAt(0) : 'A'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{auth.name || 'System Administrator'}</h3>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    background: 'hsl(var(--primary))', 
                    color: '#fff', 
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {auth.role === 'admin' ? 'System Administrator' : `Dept Admin (${auth.department})`}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                  <span><strong>Staff ID:</strong> {auth.staffId}</span>
                  {auth.department && <span><strong>Department:</strong> {auth.department}</span>}
                  <span><strong>System Privileges:</strong> {auth.role === 'admin' ? 'Full System Administrative Privileges (All Access)' : 'Departmental Management'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {(auth.role === 'admin' || auth.role === 'dept_admin' || auth.isHod || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('hod') || (auth.designation || '').toLowerCase().includes('head')) && (
            <div className="card" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={20} style={{ color: 'hsl(var(--primary))' }} />
                    Admin Controls
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Quick access to administrative management modules, user permissions, dynamic page builders, and system actions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {(auth.role === 'admin' || auth.role === 'dept_admin') && (
                  <button className="btn btn-primary" onClick={() => navigate('/admin/faculty')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                    <Users size={16} />
                    Manage Faculty Profiles
                  </button>
                )}

                {auth.role === 'admin' && (
                  <>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/dept-admins')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                      <ShieldAlert size={16} />
                      Manage Dept Admins
                    </button>

                    <button className="btn btn-secondary" onClick={() => navigate('/admin/system-admins')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                      <ShieldAlert size={16} />
                      Manage System Admins
                    </button>

                    <button className="btn btn-secondary" onClick={() => navigate('/admin/dynamic-pages')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                      <Layers size={16} />
                      Dynamic Page Builder
                    </button>
                  </>
                )}

                {(auth.role === 'admin' || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('principal') || (auth.designation || '').toLowerCase().includes('hr')) && (
                  <button className="btn btn-secondary" onClick={() => navigate('/admin/clubs')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                    <Award size={16} />
                    Clubs &amp; Incharges
                  </button>
                )}

                {(auth.role === 'admin' || auth.role === 'dept_admin' || auth.isHod || (auth.designation || '').toLowerCase().includes('hod')) && (
                  <button className="btn btn-secondary" onClick={() => navigate('/responsibilities')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                    <FileText size={16} />
                    Assign Responsibilities
                  </button>
                )}

                {(auth.role === 'admin' || auth.isInstitutionalAdmin || (auth.designation || '').toLowerCase().includes('principal') || (auth.designation || '').toLowerCase().includes('hr')) && (
                  <button className="btn btn-secondary" onClick={() => navigate('/appraisal')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                    <FileCheck size={16} />
                    Appraisals Review
                  </button>
                )}

                {(auth.role === 'admin' || auth.role === 'dept_admin') && (
                  <button className="btn btn-secondary" onClick={() => navigate('/reports')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}>
                    <BarChart2 size={16} />
                    Reports &amp; Dossiers
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
