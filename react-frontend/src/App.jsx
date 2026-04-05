import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  BookOpen, 
  FileText, 
  CreditCard, 
  Library as LibraryIcon, 
  Hotel, 
  Megaphone, 
  Clock, 
  UserCircle,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Lock,
  Mail,
  Zap
} from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Firebase imports
import { 
  auth, 
  signInWithGoogle, 
  loginWithEmail, 
  logout as firebaseLogout, 
  db,
  createUserWithEmailAndPassword,
  storeUserProfile
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

// Importing pages
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Library from './pages/Library';
import Hostel from './pages/Hostel';
import Exams from './pages/Exams';
import Staff from './pages/Staff';
import Courses from './pages/Courses';
import Notices from './pages/Notices';
import Profile from './pages/Profile';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';

const Sidebar = ({ currentUser, onLogout, isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
    { path: '/students', label: 'Students', icon: 'group' },
    { path: '/staff', label: 'Staff Hub', icon: 'badge' },
    { path: '/attendance', label: 'Attendance', icon: 'calendar_today' },
    { path: '/courses', label: 'Curriculum', icon: 'menu_book' },
    { path: '/exams', label: 'Assessments', icon: 'assignment' }
  ];

  const managementLinks = [
    { path: '/fees', label: 'Financials', icon: 'payments' },
    { path: '/library', label: 'Digital Library', icon: 'library_books' },
    { path: '/hostel', label: 'Residency', icon: 'hotel' },
    { path: '/notices', label: 'Bulletins', icon: 'campaign' },
    { path: '/timetable', label: 'Chronos', icon: 'schedule' }
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      <aside className={`fixed left-0 top-0 h-full flex flex-col p-6 z-50 bg-surface-container h-screen w-72 border-r border-outline-variant/15 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 decoration-none" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            </div>
            <div>
              <h1 className="font-headline text-xl font-bold text-on-surface">EduCloud</h1>
              <p className="font-body uppercase tracking-[0.05em] text-[10px] font-semibold text-on-surface-variant">Nexus OS</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <p className="px-4 mb-2 mt-4 text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-widest">Core Systems</p>
          {navLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/25' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10'
                }`}
              >
                <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${active ? 'fill-1' : ''}`} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {link.icon}
                </span>
                <span className="font-body uppercase tracking-[0.05em] text-[11px] font-bold">{link.label}</span>
              </Link>
            );
          })}
          
          <p className="px-4 mb-2 mt-6 text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-widest">Operations</p>
          {managementLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/25' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10'
                }`}
              >
                <span className={`material-symbols-outlined text-xl transition-transform group-hover:scale-110 ${active ? 'fill-1' : ''}`} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {link.icon}
                </span>
                <span className="font-body uppercase tracking-[0.05em] text-[11px] font-bold">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-outline-variant/15 space-y-1">
          <Link 
            to="/profile" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive('/profile') 
                ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-lg shadow-primary/25' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10'
            }`}
          >
            <span className="material-symbols-outlined text-xl">account_circle</span>
            <span className="font-body uppercase tracking-[0.05em] text-[11px] font-bold">Identity</span>
          </Link>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-error/70 hover:text-error hover:bg-error/5 rounded-xl transition-all duration-200 group"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-body uppercase tracking-[0.05em] text-[11px] font-bold">Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ currentUser, title, theme, toggleTheme, onMenuClick }) => (
  <header className="flex justify-between items-center px-8 w-full sticky top-0 z-40 backdrop-blur-xl bg-background/60 h-20 shadow-none bg-gradient-to-b from-surface-container to-transparent border-b border-outline-variant/10 lg:border-none">
    <div className="flex items-center gap-6 flex-1">
      <button className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all" onClick={onMenuClick}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className="relative hidden md:block w-96">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
        <input 
          className="w-full bg-surface-container border-none rounded-full pl-12 pr-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50 transition-all outline-none" 
          placeholder="Quantum search across node..." 
          type="text"
        />
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <button 
        onClick={toggleTheme}
        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-90"
      >
        <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
      </button>
      
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all relative">
        <span className="material-symbols-outlined">notifications</span>
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
      </button>

      <div className="hidden sm:block h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <p className="text-sm font-bold text-on-surface leading-tight m-0">{currentUser?.name || 'Administrator'}</p>
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold m-0">{currentUser?.role || 'Operator'}</p>
        </div>
        <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all active:scale-95">
          <img 
            alt="Profile" 
            className="w-full h-full object-cover" 
            src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=a68cff&color=fff&bold=true`} 
          />
        </Link>
      </div>
    </div>
  </header>
);

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await storeUserProfile(result.user, { name: name || 'EduCloud User' });
        onLoginSuccess();
      } else {
        await loginWithEmail(email, password);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-surface-container rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/10 relative z-10">
        {/* Visual Sidebar */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-surface-container-high to-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(166,140,255,0.2),transparent_70%)]"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
              </div>
              <span className="font-headline text-2xl font-bold text-on-surface">EduCloud</span>
            </div>
            
            <h1 className="font-headline text-5xl font-bold text-on-surface mb-6 leading-tight">
              Enterprise Grade <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Access the next generation of academic management. Secure, fragmented, and universally synchronized.
            </p>
          </div>
          
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">
            <span>Core v4.2.0</span>
            <span>Secure Node</span>
            <span>Neural Sync</span>
          </div>
        </div>

        {/* Login Form Area */}
        <div className="p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">
              {isRegistering ? 'Provision Node' : 'Authentication Nexus'}
            </h2>
            <p className="text-on-surface-variant">
              {isRegistering ? 'Initialize your institutional credentials.' : 'Identify to access the management matrix.'}
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error-dim p-4 rounded-xl text-sm mb-6 flex items-center gap-3 animate-shake">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Operator Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                  <input 
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Institutional Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">alternate_email</span>
                <input 
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="name@college.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Security Cipher</label>
                {!isRegistering && <button type="button" className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Lost Access?</button>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input 
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl pl-12 pr-4 py-3.5 text-on-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              disabled={loading}
            >
              {loading ? 'Processing Protocol...' : isRegistering ? 'Initialize Node' : 'Establish Session'}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-on-surface-variant/30">
            <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Identity Provider</span>
            <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="mt-8 w-full py-3.5 bg-surface-container-high border border-outline-variant/20 text-on-surface font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container-highest transition-all active:scale-[0.98]"
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            Sign in with Institutional Hub
          </button>

          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-8 text-sm text-center w-full text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            {isRegistering ? 'Already part of the network? Authenticate here' : 'New operator? Request node initialization'}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let unsubscribeUser = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Stop previous listener if exists
        if (unsubscribeUser) unsubscribeUser();

        // Listen for real-time changes to the user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data());
          } else {
            // Fallback for extremely new users where doc creation is in flight
            setCurrentUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'EduCloud User',
              email: firebaseUser.email,
              role: 'Student'
            });
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("Firestore Listener Error:", error);
          setAuthLoading(false);
        });
      } else {
        // No Firebase user — clean up any previous listener
        if (unsubscribeUser) unsubscribeUser();
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      await axios.get('/api/logout', { withCredentials: true });
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-stage d-flex align-items-center justify-content-center">
        <div className="spinner-glow large"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <Router>
      <div className="layout-wrapper flex-column flex-lg-row d-flex">
        <Sidebar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        
        <main className="main-stage">
          <Routes>
            <Route path="/" element={<PageWrapper title="COMMAND CENTER" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Dashboard /></PageWrapper>} />
            <Route path="/attendance" element={<PageWrapper title="NEURAL PRESENCE HUB" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Attendance currentUser={currentUser} /></PageWrapper>} />
            <Route path="/students" element={<PageWrapper title="STUDENT REGISTRY" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Students currentUser={currentUser} /></PageWrapper>} />
            <Route path="/staff" element={<PageWrapper title="PERSONNEL DIRECTORY" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Staff currentUser={currentUser} /></PageWrapper>} />
            <Route path="/courses" element={<PageWrapper title="COURSE ARCHIVE" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Courses currentUser={currentUser} /></PageWrapper>} />
            <Route path="/notices" element={<PageWrapper title="BROADCAST CENTER" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Notices currentUser={currentUser} /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper title="IDENTITY CONTROL" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Profile currentUser={currentUser} /></PageWrapper>} />
            <Route path="/library" element={<PageWrapper title="LIBRARY ARCHIVE" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Library currentUser={currentUser} /></PageWrapper>} />
            <Route path="/hostel" element={<PageWrapper title="Residential Operations" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Hostel currentUser={currentUser} /></PageWrapper>} />
            <Route path="/timetable" element={<PageWrapper title="Scheduling Chronos" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Timetable currentUser={currentUser} /></PageWrapper>} />
            <Route path="/fees" element={<PageWrapper title="Ledger Terminal" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Fees currentUser={currentUser} /></PageWrapper>} />
            <Route path="/exams" element={<PageWrapper title="ASSESSMENT HUB" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><Exams currentUser={currentUser} /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper title="CORE SETTINGS" theme={theme} toggleTheme={toggleTheme} setSidebarOpen={setSidebarOpen} currentUser={currentUser}><SettingsPlaceholder /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Wrapper to simplify main page structure
const PageWrapper = ({ children, title, theme, toggleTheme, setSidebarOpen, currentUser }) => (
  <div className="page-wrapper h-100 d-flex flex-column">
    <Topbar 
      currentUser={currentUser} 
      title={title} 
      theme={theme} 
      toggleTheme={toggleTheme} 
      onMenuClick={() => setSidebarOpen(true)} 
    />
    <div className="page-content-scroll flex-grow-1 px-4 px-lg-4 pb-5 overflow-auto">
      <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        {children}
      </div>
    </div>
  </div>
);

// Settings Module
const SettingsPlaceholder = () => (
  <div className="p-2">
    <div className="mb-5">
      <h1 className="fw-bold text-gradient-primary mb-1" style={{fontSize:'2rem'}}>System Configuration</h1>
      <p className="text-text-muted">Manage application preferences and institutional parameters</p>
    </div>
    <div className="row g-4">
      {[
        { title: 'Theme & Display', desc: 'Customize visual appearance, color schemes, and layout preferences.', icon: '🎨', badge: 'Active' },
        { title: 'Notification Center', desc: 'Configure alert thresholds, broadcast channels, and push notification rules.', icon: '🔔', badge: 'Enabled' },
        { title: 'Security & Access', desc: 'Manage RBAC roles, 2FA protocols, and session expiry policies.', icon: '🛡️', badge: 'Verified' },
        { title: 'Data & Backups', desc: 'Configure Firestore sync intervals, export scheduling, and retention policies.', icon: '💾', badge: 'Synced' },
        { title: 'Integrations', desc: 'Connect external LMS platforms, payment gateways, and SMS providers.', icon: '🔗', badge: 'Coming Soon' },
        { title: 'About EduCloud', desc: 'Version info, changelog, license, and institutional deployment metadata.', icon: 'ℹ️', badge: 'v2.4.0' },
      ].map((item, i) => (
        <div key={i} className="col-md-6 col-xl-4">
          <div className="glass-card p-5 h-100 d-flex flex-col gap-3" style={{cursor:'default'}}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span style={{fontSize:'2rem'}}>{item.icon}</span>
              <span className="badge-premium bg-primary-soft text-primary" style={{fontSize:'0.65rem',letterSpacing:'0.1em'}}>{item.badge}</span>
            </div>
            <h5 className="fw-bold text-white mb-2">{item.title}</h5>
            <p className="text-text-muted small mb-0 flex-grow-1">{item.desc}</p>
            <button className="btn-glass py-2 px-4 mt-3 w-100" style={{opacity:item.badge==='Coming Soon'?0.4:1}} disabled={item.badge==='Coming Soon'}>
              {item.badge === 'Coming Soon' ? 'Coming Soon' : 'Configure'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default App;

