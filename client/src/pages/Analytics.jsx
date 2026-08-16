import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Download, 
  RefreshCw, 
  ChevronRight, 
  Building2, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

// ==========================================
// 1. REUSABLE INTERACTIVE SVG CHART COMPONENTS
// ==========================================

// --- Multi-Series Bar & Area Trajectory Chart ---
function TrajectoryChart({ data = [], title, series = [], height = 260 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
        No historical trajectory data available.
      </div>
    );
  }

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const svgWidth = 650;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Find max value across all active series
  let maxVal = 5;
  data.forEach(d => {
    series.forEach(s => {
      const val = parseFloat(d[s.key]) || 0;
      if (val > maxVal) maxVal = val;
    });
  });
  // Add 15% headroom
  maxVal = Math.ceil(maxVal * 1.15);

  const stepX = chartW / Math.max(1, data.length - 1);
  const barGroupWidth = Math.min(60, chartW / data.length * 0.7);
  const singleBarW = Math.max(8, barGroupWidth / series.length);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: 'hsl(var(--primary))' }} /> {title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
          {series.map(s => (
            <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: s.color }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} /> {s.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${svgWidth} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '480px' }}>
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = paddingTop + chartH - (ratio * chartH);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeWidth="1" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--text-muted))" fontWeight="600">
                  {val >= 100000 ? `${(val / 100000).toFixed(1)}L` : val}
                </text>
              </g>
            );
          })}

          {/* Render Bars for each data point */}
          {data.map((d, dIdx) => {
            const centerX = paddingLeft + (dIdx * (chartW / data.length)) + ((chartW / data.length) / 2);
            const startX = centerX - (barGroupWidth / 2);
            const isHovered = hoveredIdx === dIdx;

            return (
              <g 
                key={d.year || dIdx} 
                onMouseEnter={() => setHoveredIdx(dIdx)} 
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={centerX - (chartW / data.length / 2)}
                    y={paddingTop}
                    width={chartW / data.length}
                    height={chartH}
                    fill="hsla(var(--primary), 0.06)"
                    rx="4"
                  />
                )}

                {series.map((s, sIdx) => {
                  const val = parseFloat(d[s.key]) || 0;
                  const barH = (val / maxVal) * chartH;
                  const barY = paddingTop + chartH - barH;
                  const barX = startX + (sIdx * singleBarW);

                  return (
                    <g key={s.key}>
                      <rect
                        x={barX}
                        y={barY}
                        width={singleBarW - 2}
                        height={Math.max(2, barH)}
                        fill={s.color}
                        rx="3"
                        style={{
                          transition: 'all 0.2s ease',
                          opacity: isHovered ? 1 : 0.88,
                          filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none'
                        }}
                      />
                      {/* Top value badge on hover or high bars */}
                      {isHovered && val > 0 && (
                        <text
                          x={barX + (singleBarW / 2) - 1}
                          y={barY - 6}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="800"
                          fill={s.color}
                        >
                          {val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* X Axis Label */}
                <text
                  x={centerX}
                  y={paddingTop + chartH + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'}
                >
                  {d.year || d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// --- Interactive Donut / Pie Chart ---
function InteractiveDonutChart({ data = [], title, totalLabel = 'Total' }) {
  const [activeSlice, setActiveSlice] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: 'hsl(var(--text-muted))' }}>
        No distribution data available.
      </div>
    );
  }

  const total = data.reduce((acc, cur) => acc + (cur.value || 0), 0);
  const size = 220;
  const center = size / 2;
  const radius = 78;
  const innerRadius = 48;

  let cumulativeAngle = -90;

  const slices = data.map((item, idx) => {
    const value = item.value || 0;
    const percentage = total > 0 ? (value / total) : 0;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const ix1 = center + innerRadius * Math.cos(startRad);
    const iy1 = center + innerRadius * Math.sin(startRad);
    const ix2 = center + innerRadius * Math.cos(endRad);
    const iy2 = center + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      percentage: Math.round(percentage * 100),
      pathData,
      idx
    };
  });

  return (
    <div>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PieChartIcon size={18} style={{ color: 'hsl(var(--primary))' }} /> {title}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice) => {
              const isSelected = activeSlice === slice.idx;
              return (
                <path
                  key={slice.name}
                  d={slice.pathData}
                  fill={slice.color || '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  onMouseEnter={() => setActiveSlice(slice.idx)}
                  onMouseLeave={() => setActiveSlice(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: activeSlice !== null && !isSelected ? 0.6 : 1,
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`
                  }}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'block', lineHeight: 1 }}>
              {activeSlice !== null ? slices[activeSlice]?.value : total}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {activeSlice !== null ? slices[activeSlice]?.name : totalLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '150px' }}>
          {slices.map((slice) => {
            const isSelected = activeSlice === slice.idx;
            return (
              <div 
                key={slice.name}
                onMouseEnter={() => setActiveSlice(slice.idx)}
                onMouseLeave={() => setActiveSlice(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  background: isSelected ? `${slice.color}15` : 'transparent',
                  border: isSelected ? `1px solid ${slice.color}40` : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-main))' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: slice.color }} />
                  <span>{slice.name}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: slice.color }}>
                  {slice.value} <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>({slice.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 5-Pillar Competency Spider / Radar Chart ---
function SpiderRadarChart({ data = [], title, subtitle = '', benchmarkLabel = 'Benchmark', userLabel = 'Actual' }) {
  if (!data || data.length === 0) return null;

  const size = 300;
  const center = size / 2;
  const radius = 95;
  const count = data.length;

  const getCoord = (value, idx) => {
    const angle = (idx * (360 / count) - 90) * (Math.PI / 180);
    const r = (Math.min(100, Math.max(0, value)) / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const userPoints = data.map((d, i) => {
    const pt = getCoord(d.score || d.instAvg || 0, i);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const benchPoints = data.map((d, i) => {
    const pt = getCoord(d.benchmark || d.bestDept || 80, i);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#8b5cf6' }} /> {title}
          </h4>
          {subtitle && <span style={{ fontSize: '0.76rem', color: 'hsl(var(--text-muted))' }}>{subtitle}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0284c7' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7' }} /> {userLabel}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#8b5cf6' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'rgba(139, 92, 246, 0.3)', border: '1px dashed #8b5cf6' }} /> {benchmarkLabel}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Concentric Polygons */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((lvl, idx) => {
            const pts = data.map((_, i) => {
              const pt = getCoord(lvl * 100, i);
              return `${pt.x},${pt.y}`;
            }).join(' ');
            return (
              <polygon key={idx} points={pts} fill="none" stroke="hsl(var(--border))" strokeWidth="1.2" />
            );
          })}

          {/* Radial Axis Lines */}
          {data.map((_, i) => {
            const pt = getCoord(100, i);
            return <line key={i} x1={center} y1={center} x2={pt.x} y2={pt.y} stroke="hsl(var(--border))" strokeWidth="1" />;
          })}

          {/* Benchmark Polygon */}
          <polygon points={benchPoints} fill="rgba(139, 92, 246, 0.12)" stroke="#8b5cf6" strokeWidth="1.6" strokeDasharray="3 3" />

          {/* User Score Polygon */}
          <polygon points={userPoints} fill="rgba(2, 132, 199, 0.28)" stroke="#0284c7" strokeWidth="2.4" />

          {/* Axis Labels & Vertex Dots */}
          {data.map((d, i) => {
            const pt = getCoord(d.score || d.instAvg || 0, i);
            const labelPt = getCoord(124, i);
            const val = Math.round(d.score || d.instAvg || 0);

            return (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x={labelPt.x}
                  y={labelPt.y + 4}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="hsl(var(--text-main))"
                >
                  {d.axis}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill="#0284c7"
                >
                  {val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// --- Horizontal Ranked Comparison Bar Chart ---
function HorizontalRankedChart({ items = [], title, valueKey = 'publications', labelKey = 'name', color = '#0284c7', unit = '' }) {
  if (!items || items.length === 0) return null;

  const maxVal = Math.max(...items.map(i => parseFloat(i[valueKey]) || 0), 1);

  return (
    <div>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={18} style={{ color }} /> {title}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.slice(0, 7).map((item, idx) => {
          const val = parseFloat(item[valueKey]) || 0;
          const pct = Math.min(100, (val / maxVal) * 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                <span style={{ color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: idx < 3 ? color : 'hsl(var(--card-bg-subtle, #f1f5f9))', color: idx < 3 ? '#ffffff' : 'hsl(var(--text-muted))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
                    {idx + 1}
                  </span>
                  {item[labelKey] || item.staffId || 'Item'}
                  {item.designation && <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>({item.designation})</span>}
                </span>
                <span style={{ color, fontWeight: 800 }}>
                  {val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val} {unit}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'hsl(var(--border))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Cadre Compliance Ratio Gauge ---
function CadreComplianceGauge({ cadre = {} }) {
  const { professors = 0, requiredProf = 1, assocProfessors = 0, requiredAssoc = 2, asstProfessors = 0, requiredAsst = 6 } = cadre;

  const cadres = [
    { label: 'Professors (AF1 / RF1)', actual: professors, req: requiredProf, color: '#7c3aed', bg: '#f3e8ff' },
    { label: 'Assoc. Professors (AF2 / RF2)', actual: assocProfessors, req: requiredAssoc, color: '#4f46e5', bg: '#e0e7ff' },
    { label: 'Asst. Professors (AF3 / RF3)', actual: asstProfessors, req: requiredAsst, color: '#0284c7', bg: '#e0f2fe' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: '#7c3aed' }} /> AICTE / NBA Cadre Compliance (1 : 2 : 6 Ratio)
        </h4>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.76rem',
          fontWeight: 800,
          background: cadre.isCadreCompliant ? 'hsla(var(--success), 0.15)' : 'hsla(var(--warning), 0.15)',
          color: cadre.isCadreCompliant ? 'hsl(var(--success))' : 'hsl(var(--warning))'
        }}>
          {cadre.isCadreCompliant ? '✓ Cadre Compliant' : '⚠ Cadre Variance Present'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {cadres.map(c => {
          const isMet = c.actual >= c.req;
          return (
            <div key={c.label} style={{ background: c.bg, borderRadius: '10px', padding: '12px 14px', border: `1px solid ${c.color}30` }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color, display: 'block', marginBottom: '6px' }}>{c.label}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: c.color }}>{c.actual}</span>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>/ {c.req} Req</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.7)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (c.actual / Math.max(1, c.req)) * 100)}%`, height: '100%', background: c.color, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN ANALYTICS DASHBOARD COMPONENT
// ==========================================

export default function Analytics({ auth }) {
  const [activeTab, setActiveTab] = useState(
    auth.role === 'admin' ? 'institution' : (auth.role === 'dept_admin' ? 'department' : 'faculty')
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDept, setSelectedDept] = useState(auth.department || auth.dept || '');
  const [facultyData, setFacultyData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);

  const dashboardRef = useRef(null);

  // Fetch Analytics data based on current active tab & filters
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${auth.token}` };

      if (activeTab === 'faculty' || auth.role === 'faculty') {
        const res = await fetch(`${API_BASE_URL}/api/analytics/faculty`, { headers });
        if (res.ok) setFacultyData(await res.json());
      }

      if (activeTab === 'department' || auth.role === 'dept_admin' || auth.role === 'admin') {
        const deptParam = selectedDept ? `?department=${encodeURIComponent(selectedDept)}` : '';
        const res = await fetch(`${API_BASE_URL}/api/analytics/department${deptParam}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setDepartmentData(data);
          if (data.departmentsList) setDepartmentsList(data.departmentsList);
          if (!selectedDept && data.department) setSelectedDept(data.department);
        }
      }

      if (activeTab === 'institution' && auth.role === 'admin') {
        const res = await fetch(`${API_BASE_URL}/api/analytics/institution`, { headers });
        if (res.ok) setInstitutionData(await res.json());
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, selectedDept, auth?.token]);

  const handlePrintDashboard = () => {
    window.print();
  };

  return (
    <div>
      <Navbar 
        title="Interactive Analytics & Intelligence Hub" 
        userName={auth.name} 
        profilePic={auth.profilePic} 
        auth={auth} 
      />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 8px 40px 8px' }}>
        
        {/* Dashboard Control Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Tab Selector for Higher Roles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'hsl(var(--card-bg-subtle, #f1f5f9))', padding: '4px', borderRadius: '10px' }}>
            {auth.role === 'admin' && (
              <button
                onClick={() => setActiveTab('institution')}
                className="btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: activeTab === 'institution' ? 'hsl(var(--primary))' : 'transparent',
                  color: activeTab === 'institution' ? '#ffffff' : 'hsl(var(--text-main))',
                  boxShadow: activeTab === 'institution' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🏛️ Institutional Command
              </button>
            )}

            {(auth.role === 'admin' || auth.role === 'dept_admin') && (
              <button
                onClick={() => setActiveTab('department')}
                className="btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  background: activeTab === 'department' ? 'hsl(var(--primary))' : 'transparent',
                  color: activeTab === 'department' ? '#ffffff' : 'hsl(var(--text-main))',
                  boxShadow: activeTab === 'department' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🏢 Department Intelligence
              </button>
            )}

            <button
              onClick={() => setActiveTab('faculty')}
              className="btn"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                background: activeTab === 'faculty' ? 'hsl(var(--primary))' : 'transparent',
                color: activeTab === 'faculty' ? '#ffffff' : 'hsl(var(--text-main))',
                boxShadow: activeTab === 'faculty' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              👤 Faculty Analytics
            </button>
          </div>

          {/* Contextual Filters & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {activeTab === 'department' && departmentsList.length > 0 && auth.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} style={{ color: 'hsl(var(--text-muted))' }} />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid hsl(var(--border))',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: 'hsl(var(--card-bg, #ffffff))',
                    color: 'hsl(var(--text-main))'
                  }}
                >
                  {departmentsList.map(d => (
                    <option key={d.name} value={d.name}>{d.name} ({d.acronym})</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => { setRefreshing(true); fetchAnalytics(); }}
              className="btn"
              disabled={refreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px solid hsl(var(--border))',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>

            <button
              onClick={handlePrintDashboard}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'hsl(var(--primary))', marginBottom: '12px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>Synthesizing Interactive Analytics...</div>
            <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Aggregating multi-source research records, appraisal indexes & departmental metrics</span>
          </div>
        ) : (
          <div ref={dashboardRef}>
            
            {/* ============================================================== */}
            {/* VIEW A: FACULTY PERSONAL ANALYTICS PORTAL                      */}
            {/* ============================================================== */}
            {activeTab === 'faculty' && facultyData && (
              <div>
                {/* Faculty KPI Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Total Publications</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>{facultyData.activityMetrics?.publications || 0}</span>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Research Grants Sanctioned</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>
                        ₹{((facultyData.activityMetrics?.totalGrantAmount || 0) / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>IPR & Patents Filed</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>{facultyData.activityMetrics?.patents || 0}</span>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>FDPs & Upskilling</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>{facultyData.activityMetrics?.certifications || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Chart Row: Trajectory & Indexing */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div className="card" style={{ padding: '20px' }}>
                    <TrajectoryChart
                      title="5-Year Publication Trajectory (Journals vs Conferences)"
                      data={facultyData.publicationsTrajectory}
                      series={[
                        { key: 'journal', label: 'Journals', color: '#0284c7' },
                        { key: 'conference', label: 'Conferences', color: '#8b5cf6' },
                        { key: 'scopus', label: 'Scopus / SCI', color: '#10b981' }
                      ]}
                    />
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    <InteractiveDonutChart
                      title="Research Indexing & Quality Distribution"
                      data={facultyData.indexingDistribution}
                      totalLabel="Publications"
                    />
                  </div>
                </div>

                {/* Secondary Row: Appraisal Competency Radar & Funding Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
                  <div className="card" style={{ padding: '20px' }}>
                    <SpiderRadarChart
                      title="PBAS Competency Breakdown vs Target Benchmark"
                      subtitle={`Current Academic Year: ${facultyData.latestAppraisal?.academicYear || '2023-24'} (Score: ${facultyData.latestAppraisal?.totalScore}/100)`}
                      data={facultyData.appraisalCompetency}
                      userLabel="Faculty Score"
                      benchmarkLabel="Target Benchmark"
                    />
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    <h4 style={{ margin: '0 0 14px 0', fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={18} style={{ color: '#10b981' }} /> Sponsored Grants & Seed Funding Portfolio
                    </h4>

                    {facultyData.fundingTimeline && facultyData.fundingTimeline.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {facultyData.fundingTimeline.map((item, idx) => (
                          <div key={idx} style={{ background: 'hsl(var(--card-bg-subtle, #f8fafc))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'hsl(var(--text-main))' }}>{item.title}</span>
                              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#10b981' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>
                              <span>Agency: <strong>{item.agency}</strong></span>
                              <span>Role: <strong>{item.role}</strong> ({item.academicYear})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
                        No sponsored research funding projects logged yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW B: DEPARTMENT ADMIN / HOD ANALYTICS PORTAL                */}
            {/* ============================================================== */}
            {activeTab === 'department' && departmentData && (
              <div>
                {/* Department Header Badge */}
                <div style={{ background: 'linear-gradient(135deg, hsla(var(--primary), 0.12), hsla(var(--secondary), 0.12))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text-main))' }}>
                      🏢 Department of {departmentData.department}
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))' }}>
                      Faculty Strength: <strong>{departmentData.overview?.totalFaculty || 0}</strong> • Ph.D. Density: <strong>{departmentData.overview?.phdPercentage || 0}%</strong> ({departmentData.overview?.phdCount} Ph.D. Holders)
                    </span>
                  </div>
                  <div style={{ background: 'hsl(var(--card-bg, #ffffff))', padding: '8px 16px', borderRadius: '8px', border: '1.5px solid hsl(var(--border))', fontWeight: 800, fontSize: '0.88rem', color: 'hsl(var(--primary))' }}>
                    Avg. PBAS Score: {departmentData.overview?.avgAppraisalScore || '78.5'} / 100
                  </div>
                </div>

                {/* Cadre Ratio Gauge */}
                <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <CadreComplianceGauge cadre={departmentData.cadreDistribution} />
                </div>

                {/* Departmental Trends & Leaderboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  <div className="card" style={{ padding: '20px' }}>
                    <TrajectoryChart
                      title="Departmental Research Output & Funding Velocity"
                      data={departmentData.annualTrends}
                      series={[
                        { key: 'publications', label: 'Publications', color: '#0284c7' },
                        { key: 'events', label: 'Events Organized', color: '#f59e0b' },
                        { key: 'patents', label: 'Patents / IPR', color: '#ea580c' }
                      ]}
                    />
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    <HorizontalRankedChart
                      title="Department Faculty Productivity Leaderboard"
                      items={departmentData.facultyLeaderboard}
                      valueKey="score"
                      labelKey="name"
                      color="#0284c7"
                      unit="pts"
                    />
                  </div>
                </div>

                {/* Appraisal Pipeline Funnel */}
                <div className="card" style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.96rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: '#10b981' }} /> Performance Appraisal Pipeline Funnel
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Drafts in Progress</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#64748b' }}>{departmentData.appraisalPipeline?.draft || 0}</span>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, display: 'block' }}>Submitted (Pending HOD)</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{departmentData.appraisalPipeline?.submitted || 0}</span>
                    </div>

                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, display: 'block' }}>HOD Verified</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed' }}>{departmentData.appraisalPipeline?.hodApproved || 0}</span>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'block' }}>Principal Approved</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{departmentData.appraisalPipeline?.principalApproved || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW C: INSTITUTION ADMIN EXECUTIVE COMMAND CENTER             */}
            {/* ============================================================== */}
            {activeTab === 'institution' && institutionData && (
              <div>
                {/* Institution Executive Scorecard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Total Institutional Faculty</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800 }}>{institutionData.overview?.totalFaculty || 0}</span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'block' }}>{institutionData.overview?.phdPercentage}% Ph.D. Holders</span>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Total Research Publications</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800 }}>{institutionData.overview?.totalPublications || 0}</span>
                      <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Scopus / WoS / UGC</span>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Total External Funding</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                        ₹{((institutionData.overview?.totalGrantsAmount || 0) / 100000).toFixed(1)}L
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'block' }}>Sponsored & Seed Grants</span>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', display: 'block', fontWeight: 700 }}>Patents & IPR Granted</span>
                      <span style={{ fontSize: '1.65rem', fontWeight: 800 }}>{institutionData.overview?.totalPatents || 0}</span>
                      <span style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 700, display: 'block' }}>National & International</span>
                    </div>
                  </div>
                </div>

                {/* Cross-Departmental Comparison Table / Chart */}
                <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📊 Cross-Departmental Performance & Accreditation Matrix
                  </h4>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'hsl(var(--card-bg-subtle, #f8fafc))', borderBottom: '2px solid hsl(var(--border))' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800 }}>Department</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>Faculty</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>Ph.D. %</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>Publications</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>Grants Secured</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>Patents</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>Avg PBAS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institutionData.departmentComparisons && institutionData.departmentComparisons.map((dept, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: 'hsl(var(--text-main))' }}>
                              {dept.department} <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>({dept.acronym})</span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{dept.facultyCount}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: dept.phdPercentage >= 50 ? '#059669' : '#d97706' }}>
                              {dept.phdPercentage}% <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))' }}>({dept.phdCount})</span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{dept.publicationsCount}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                              ₹{(dept.grantsAmount / 100000).toFixed(1)}L
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{dept.patentsCount}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'hsla(var(--primary), 0.12)', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: '0.78rem' }}>
                                {dept.avgAppraisalScore} / 100
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Institutional Trends & 5-Pillar Spider Radar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
                  <div className="card" style={{ padding: '20px' }}>
                    <TrajectoryChart
                      title="5-Year College-Wide Research & Grant Growth"
                      data={institutionData.growthTrends}
                      series={[
                        { key: 'publications', label: 'Publications', color: '#0284c7' },
                        { key: 'events', label: 'Events Organized', color: '#f59e0b' },
                        { key: 'patents', label: 'Patents / IPR', color: '#ea580c' }
                      ]}
                    />
                  </div>

                  <div className="card" style={{ padding: '20px' }}>
                    <SpiderRadarChart
                      title="5-Pillar Institutional Benchmark vs Top Department"
                      subtitle="Comparative accreditation readiness index across academic pillars"
                      data={institutionData.institutionalRadar}
                      userLabel="College Average"
                      benchmarkLabel="Benchmark Dept"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
