import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: {
      total_students: 0,
      total_faculty: 0,
      total_courses: 0,
      active_notices: 0
    },
    recent_notices: []
  });
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('online');

  useEffect(() => {
    const fetchInitialCounts = async () => {
      try {
        const [studentsSnap, staffSnap, coursesSnap, noticesSnap] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'staff')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'notices')),
        ]);
        const notices = noticesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData({
          stats: {
            total_students: studentsSnap.size,
            total_faculty: staffSnap.size,
            total_courses: coursesSnap.size,
            active_notices: noticesSnap.size,
          },
          recent_notices: notices.slice(0, 5),
        });
        setSyncStatus('online');
      } catch (err) {
        setSyncStatus('degraded');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialCounts();
    const studentsUnsub = onSnapshot(collection(db, 'students'), (snap) => {
      setData(prev => ({ ...prev, stats: { ...prev.stats, total_students: snap.size } }));
    });
    const staffUnsub = onSnapshot(collection(db, 'staff'), (snap) => {
      setData(prev => ({ ...prev, stats: { ...prev.stats, total_faculty: snap.size } }));
    });
    const coursesUnsub = onSnapshot(collection(db, 'courses'), (snap) => {
      setData(prev => ({ ...prev, stats: { ...prev.stats, total_courses: snap.size } }));
    });
    const noticesUnsub = onSnapshot(collection(db, 'notices'), (snap) => {
      const notices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({
        ...prev,
        stats: { ...prev.stats, active_notices: snap.size },
        recent_notices: notices.slice(0, 5),
      }));
    });
    return () => {
      studentsUnsub(); staffUnsub(); coursesUnsub(); noticesUnsub();
    };
  }, []);

  if (loading) {
    return (
      <div className="skeleton-root">
        <div className="skeleton-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text-stack">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
        <div className="stats-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
        <div className="main-content-layout">
          <div className="skeleton-main"></div>
          <div className="skeleton-sidebar-stack">
            <div className="skeleton-sidebar-card"></div>
            <div className="skeleton-sidebar-card"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusClass = (status) => {
    return status === 'online' ? 'status-dot-online' : 'status-dot-warning';
  };

  return (
    <div className="dashboard-root">
      
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="header-meta">
          <div className="header-logo-container">
            <div className="header-logo-box">
              <div className="header-logo-gradient"></div>
              <span className="material-symbols-outlined text-5xl text-primary icon-fill">monitoring</span>
            </div>
            <div className="header-status-indicator">
              <div className={getStatusClass(syncStatus)}></div>
            </div>
          </div>
          <div>
            <div className="header-title-row">
              <h1 className="text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-none">
                Dashboard
              </h1>
              <span className="header-badge">Admin Access</span>
            </div>
            <p className="header-location">
              <span className="material-symbols-outlined text-success text-base">domain</span>
              College Management System &bull; Institutional Portal
            </p>
          </div>
        </div>

        <div className="header-action-container">
          <div className="header-stat-chip">
            <div className="stat-chip-icon-box bg-primary-fade">
              <span className="material-symbols-outlined text-primary text-xl">speed</span>
            </div>
            <div>
              <p className="font-bold text-[10px] uppercase text-on-surface-variant opacity-60">System Ping</p>
              <p className="text-lg font-bold text-on-surface">24.5ms</p>
            </div>
          </div>

          <div className="header-stat-chip">
            <div className="stat-chip-icon-box bg-success-fade">
              <span className="material-symbols-outlined text-success text-xl">cloud_sync</span>
            </div>
            <div>
              <p className="font-bold text-[10px] uppercase text-on-surface-variant opacity-60">DB Status</p>
              <p className="text-lg font-bold text-on-surface">
                {syncStatus === 'online' ? 'Connected' : 'Syncing'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="stats-grid">
        {[
          { label: 'Registered Students', val: data.stats.total_students, icon: 'group', color: 'primary', desc: 'Current Enrollment' },
          { label: 'Faculty Members', val: data.stats.total_faculty, icon: 'badge', color: 'secondary', desc: 'Active Academic Staff' },
          { label: 'Available Courses', val: data.stats.total_courses, icon: 'menu_book', color: 'primary', desc: 'Departments' },
          { label: 'Active Notices', val: data.stats.active_notices, icon: 'campaign', color: 'secondary', desc: 'New Bulletins' },
        ].map((stat, i) => (
          <div key={i} className="stat-card-outer">
            <div className="stat-card-inner">
              <div className="stat-card-header">
                <div className={`stat-icon-container stat-theme-${stat.color}`}>
                  <span className="material-symbols-outlined stat-icon">{stat.icon}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/20 text-lg">trending_up</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{stat.label}</p>
              <h3 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">
                {stat.val.toLocaleString()}
              </h3>
              <div className="stat-desc-box">
                {stat.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Area ── */}
      <div className="main-content-layout">
        
        <div className="broadcast-section">
          <div className="notices-container">
            <div className="notices-header">
              <div className="notices-title-group">
                <div className="notice-icon-box">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Institutional Notices</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase opacity-50">Board of Announcements</p>
                </div>
              </div>
              <button onClick={() => navigate('/notices')} className="notice-view-all-btn">
                All Notices
              </button>
            </div>

            <div className="notice-scroll-area custom-scrollbar">
              {data.recent_notices.length > 0 ? (
                data.recent_notices.map((notice, index) => (
                  <div key={notice.id || index} className="notice-item">
                    <div className="notice-item-split">
                      <div className="notice-meta-stack">
                        <div className="notice-badge-row">
                          <div className="header-badge">Broadcast</div>
                          <time className="font-bold text-[10px] opacity-40">
                            {notice.posted_date || notice.date || '—'}
                          </time>
                        </div>
                        <h5 className="notice-title">{notice.title}</h5>
                      </div>
                      <span className="material-symbols-outlined notice-chevron">arrow_forward</span>
                    </div>
                    <p className="notice-content">
                      {notice.content || notice.message || notice.description || ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="empty-state-notice">
                  <span className="material-symbols-outlined text-5xl mb-4 opacity-10">notifications_off</span>
                  <p className="text-sm font-bold opacity-30">No active notices recovered.</p>
                </div>
              )}
            </div>
          </div>

          <div className="quick-actions-grid">
            <div className="action-card-dark">
              <div className="action-card-content">
                <div className="action-icon-box">
                  <span className="material-symbols-outlined text-2xl text-on-surface">lock</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Security Vault</h2>
                  <p className="text-on-surface-variant text-xs mt-1">Enterprise encryption protocols active.</p>
                </div>
                <button className="action-card-btn">Settings</button>
              </div>
            </div>

            <div className="action-card-primary">
              <div className="action-card-content">
                <div className="action-icon-box">
                  <span className="material-symbols-outlined text-2xl text-white">dns</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Database Cluster</h2>
                  <p className="text-white/60 text-xs mt-1">Real-time backup and sync active.</p>
                </div>
                <button className="action-card-btn">Verify Backup</button>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="health-module">
            <div className="health-header">
              <h3 className="health-title text-base font-bold">
                <span className="material-symbols-outlined text-xl text-success icon-fill">security</span>
                System Health
              </h3>
              <div className="header-badge">Healthy</div>
            </div>

            <div className="health-status-list">
              {[
                { label: 'Database Integrity', val: '98.8%', progress: '98%' },
                { label: 'Network Speed', val: '1.2 GB/s', progress: '85%' },
                { label: 'Server Uptime', val: '100%', progress: '100%' },
                { label: 'Resource Load', val: 'Normal', progress: '32%' },
              ].map((node, i) => (
                <div key={i} className="progress-node">
                  <div className="progress-node-meta">
                    <span className="font-bold text-[10px] text-on-surface-variant uppercase">{node.label}</span>
                    <span className="text-xs font-bold italic">{node.val}</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-fill-bar" style={{ '--progress-pct': node.progress }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="matrix-module">
            <div className="matrix-header">
              <div className="matrix-icon-wrapper">
                <span className="material-symbols-outlined text-3xl">grid_view</span>
              </div>
              <h4 className="text-lg font-bold">Quick Navigation</h4>
              <p className="text-[10px] font-bold opacity-30 mt-1 uppercase">Terminal Access</p>
            </div>

            <div className="quick-access-grid">
              {[
                { label: 'Students', icon: 'group', path: '/students' },
                { label: 'Staff', icon: 'badge', path: '/staff' },
                { label: 'Courses', icon: 'menu_book', path: '/courses' },
                { label: 'Schedule', icon: 'calendar_today', path: '/timetable' },
                { label: 'Finance', icon: 'payments', path: '/fees' },
                { label: 'Archives', icon: 'auto_stories', path: '/library' },
              ].map((cmd, i) => (
                <button key={i} onClick={() => navigate(cmd.path)} className="quick-access-btn">
                  <span className="material-symbols-outlined text-xl text-primary">{cmd.icon}</span>
                  <span className="font-bold text-[10px] uppercase opacity-60 group-hover:opacity-100">{cmd.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => navigate('/exams')} className="matrix-more-btn">
              <div className="matrix-btn-content">
                <span className="material-symbols-outlined text-base">apps</span>
                <span className="font-bold text-[10px] uppercase tracking-widest">More Modules</span>
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;