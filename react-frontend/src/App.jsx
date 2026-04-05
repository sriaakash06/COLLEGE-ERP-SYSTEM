import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { auth, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ── Page imports ──────────────────────────────────────────────
import Dashboard   from './pages/Dashboard';
import Students    from './pages/Students';
import Staff       from './pages/Staff';
import Attendance  from './pages/Attendance';
import Courses     from './pages/Courses';
import Exams       from './pages/Exams';
import Fees        from './pages/Fees';
import Library     from './pages/Library';
import Hostel      from './pages/Hostel';
import Notices     from './pages/Notices';
import Timetable   from './pages/Timetable';
import Profile     from './pages/Profile';
import Login       from './pages/Login';

// ── Nav config ────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',     icon: 'dashboard',      path: '/'            },
  { label: 'Students',      icon: 'group',           path: '/students'    },
  { label: 'Staff',         icon: 'badge',           path: '/staff'       },
  { label: 'Attendance',    icon: 'event_available', path: '/attendance'  },
  { label: 'Curriculum',    icon: 'menu_book',       path: '/courses'     },
  { label: 'Assessments',   icon: 'assignment',      path: '/exams'       },
  { label: 'Financials',    icon: 'payments',        path: '/fees'        },
  { label: 'Digital Library', icon: 'local_library', path: '/library'     },
  { label: 'Residency',     icon: 'apartment',       path: '/hostel'      },
];

const BOTTOM_ITEMS = [
  { label: 'Support',  icon: 'help_outline', path: '/notices'  },
  { label: 'Log Out',  icon: 'logout',       path: '/logout', danger: true },
];

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40 flex flex-col
        bg-[#0f1117] border-r border-white/5
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[220px]'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-[#7c5cbf] flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/40">
          <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight tracking-wide">EduCloud</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Command Center</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group relative
                ${active
                  ? 'bg-[#7c5cbf] text-white shadow-lg shadow-purple-900/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              <span
                className={`material-symbols-outlined text-xl flex-shrink-0 transition-all
                  ${active ? 'text-white' : 'text-white/40 group-hover:text-white'}`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1e2130] border border-white/10 rounded-lg text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-2 pb-4 border-t border-white/5 pt-3 flex flex-col gap-1">
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={async () => {
              if (item.label === 'Log Out') {
                await logout();
              } else {
                navigate(item.path);
              }
            }}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
              transition-all duration-200 group relative
              ${item.danger
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-white/40 hover:text-white hover:bg-white/5'}
            `}
          >
            <span
              className={`material-symbols-outlined text-xl flex-shrink-0
                ${item.danger ? 'text-red-400' : 'text-white/40 group-hover:text-white'}`}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className={`text-[13px] font-semibold tracking-wide whitespace-nowrap ${item.danger ? 'text-red-400' : ''}`}>
                {item.label}
              </span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1e2130] border border-white/10 rounded-lg text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1e2130] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#7c5cbf] transition-all shadow-lg z-50"
      >
        <span className="material-symbols-outlined text-sm">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────
function Topbar({ user }) {
  const location = useLocation();
  const [search, setSearch] = useState('');

  const pageTitle = NAV_ITEMS.find(n =>
    n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
  )?.label || 'Dashboard';

  return (
    <header className="h-[72px] flex items-center justify-between px-8 border-b border-white/5 bg-[#0f1117]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 w-80 group focus-within:border-purple-500/40 transition-all">
        <span className="material-symbols-outlined text-white/30 text-lg">search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Global node search..."
          className="bg-transparent text-white/70 text-sm placeholder-white/25 outline-none w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Live status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse"></span>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Live Hyper-Sync</span>
        </div>

        {/* Bell */}
        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all relative">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-400"></span>
        </button>

        {/* Settings */}
        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group">
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{user?.displayName || 'EduCloud User'}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">{user?.email || 'User'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-900/30 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (user?.displayName || 'E')[0].toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── 404 Page ──────────────────────────────────────────────────
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center select-none">
      {/* Glitchy 404 */}
      <div className="relative mb-8">
        <p className="text-[160px] font-black text-white/5 leading-none select-none tracking-tighter">404</p>
        <p className="absolute inset-0 flex items-center justify-center text-[160px] font-black leading-none tracking-tighter"
           style={{
             background: 'linear-gradient(135deg, #7c5cbf 0%, #a78bfa 50%, #6366f1 100%)',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
             filter: 'drop-shadow(0 0 40px rgba(124,92,191,0.5))',
           }}>
          404
        </p>
      </div>

      <div className="w-20 h-20 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 animate-bounce">
        <span className="material-symbols-outlined text-5xl text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>
          satellite_alt
        </span>
      </div>

      <h2 className="text-white text-3xl font-bold uppercase tracking-widest mb-3">Node Not Found</h2>
      <p className="text-white/40 text-sm mb-10 max-w-sm leading-relaxed">
        The requested cluster node does not exist in the institutional matrix. Signal lost.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/10 transition-all"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-2xl bg-[#7c5cbf] text-white text-sm font-semibold hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/40"
        >
          Return to Command Center
        </button>
      </div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0f1117] flex flex-col items-center justify-center z-50">
      {/* Orbital rings */}
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-4 rounded-full border border-indigo-400/20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c5cbf] to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-900/60">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
        </div>
      </div>

      <p className="text-white text-xl font-bold uppercase tracking-[0.3em] mb-3">EduCloud</p>
      <p className="text-white/40 text-xs uppercase tracking-widest mb-10">Initializing Command Center</p>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full animate-[loading_2s_ease-in-out_infinite]"
          style={{ animation: 'loadbar 2s ease-in-out infinite' }}
        ></div>
      </div>

      <style>{`
        @keyframes loadbar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Layout wrapper ────────────────────────────────────────────
function Layout({ user }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0f18] text-white flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: collapsed ? '72px' : '220px' }}
      >
        <Topbar user={user} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/"           element={<Dashboard />}  />
            <Route path="/students"   element={<Students />}   />
            <Route path="/staff"      element={<Staff />}      />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/courses"    element={<Courses />}    />
            <Route path="/exams"      element={<Exams />}      />
            <Route path="/fees"       element={<Fees />}       />
            <Route path="/library"    element={<Library />}    />
            <Route path="/hostel"     element={<Hostel />}     />
            <Route path="/notices"    element={<Notices />}    />
            <Route path="/timetable"  element={<Timetable />}  />
            <Route path="/profile"    element={<Profile />}    />
            <Route path="*"           element={<NotFound />}   />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout user={user} />
    </Router>
  );
}
