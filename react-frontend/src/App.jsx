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
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/staff', label: 'Staff Directory', icon: GraduationCap },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/courses', label: 'Curriculum', icon: BookOpen },
    { path: '/exams', label: 'Assessments', icon: FileText }
  ];

  const managementLinks = [
    { path: '/fees', label: 'Financials', icon: CreditCard },
    { path: '/library', label: 'Digital Library', icon: LibraryIcon },
    { path: '/hostel', label: 'Residency', icon: Hotel },
    { path: '/notices', label: 'Bulletins', icon: Megaphone },
    { path: '/timetable', label: 'Chronos', icon: Clock }
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle Overlay */}
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)}></div>
      
      <aside className={`sidebar-premium glass-nav ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between px-4 pb-5 pt-4">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none" onClick={() => setIsOpen(false)}>
            <div className="logo-box">
              <Zap size={20} className="text-primary fill-primary" />
            </div>
            <span className="logo-text fw-bold">Edu<span className="text-primary">Cloud</span></span>
          </Link>
          <button className="d-lg-none btn-close-glass border-0" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav px-3">
          <p className="nav-section-title px-3 mb-2 mt-4 text-secondary small fw-bold text-uppercase">Navigation</p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path, link.exact);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`nav-item-link ${active ? 'active' : ''}`}
              >
                <Icon size={20} className="icon" />
                <span>{link.label}</span>
                {active && <ChevronRight size={14} className="ms-auto active-indicator" />}
              </Link>
            );
          })}
          
          <p className="nav-section-title px-3 mb-2 mt-4 text-secondary small fw-bold text-uppercase">Management</p>
          {managementLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path, link.exact);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className={`nav-item-link ${active ? 'active' : ''}`}
              >
                <Icon size={20} className="icon" />
                <span>{link.label}</span>
                {active && <ChevronRight size={14} className="ms-auto active-indicator" />}
              </Link>
            );
          })}
          
          <div className="sidebar-footer mt-auto pt-5 pb-4">
            <hr className="glass-border opacity-10 my-4 mx-3" />
            <Link 
              to="/profile" 
              onClick={() => setIsOpen(false)}
              className={`nav-item-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <UserCircle size={20} className="icon" />
              <span>Profile Hub</span>
            </Link>
            <button 
              onClick={onLogout} 
              className="nav-item-link text-danger border-0 bg-transparent text-start w-100"
            >
              <LogOut size={20} className="icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

const Topbar = ({ currentUser, title, theme, toggleTheme, onMenuClick }) => (
  <header className="navbar-top-premium glass-nav px-4 py-3 mx-lg-4 mt-lg-4 rounded-4 mb-5 border-0">
    <div className="d-flex justify-content-between align-items-center w-100">
      <div className="d-flex align-items-center gap-3">
        <button className="btn-icon-glass d-lg-none" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h4 className="page-title mb-0 fw-bold d-none d-md-block">{title}</h4>
      </div>
      
      <div className="d-flex align-items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className="btn-icon-glass theme-toggle" 
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className="v-separator d-none d-sm-block"></div>
        
        <div className="user-profile-trigger d-flex align-items-center gap-3 ps-2">
          <div className="d-none d-md-flex flex-column text-end">
            <span className="user-name fw-bold text-white small m-0">{currentUser?.name || 'Academic User'}</span>
            <span className="user-role text-secondary m-0 text-uppercase d-flex align-items-center justify-content-end gap-1" style={{ fontSize: '0.65rem' }}>
              <ShieldCheck size={10} className="text-primary" />
              {currentUser?.role || 'Guest'}
            </span>
          </div>
          <div className="avatar-box p-1 glass-border rounded-circle">
            <img 
              src={`https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=6366f1&color=fff&bold=true`} 
              className="rounded-circle shadow-sm" 
              style={{ width: '36px', height: '36px' }}
              alt="User" 
            />
          </div>
        </div>
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
      setError(err.message || 'Identity verification failed. Please check connection and retry.');
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
        // Register new Firebase user
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Store profile with name
        await storeUserProfile(result.user, { name: name || 'EduCloud User' });
        onLoginSuccess();
      } else {
        // Login existing Firebase user
        await loginWithEmail(email, password);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-stage">
      <div className="auth-background"></div>
      <div className="auth-container p-4 p-md-5">
        <div className="auth-scaler">
          <div className="glass-card-premium overflow-hidden border-0 shadow-2xl">
            <div className="row g-0">
              <div className="col-lg-6 d-none d-lg-block">
                <div className="auth-sidebar-visual h-100 p-5 d-flex flex-column justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Zap size={24} className="text-white fill-white" />
                    <span className="h4 fw-bold text-white mb-0">EduCloud</span>
                  </div>
                  <div>
                    <h1 className="display-4 fw-bold text-white mb-4">Enterprise Grade Management</h1>
                    <p className="text-white opacity-75 lead">The future of academic coordination is glassmorphic, intelligent, and real-time.</p>
                  </div>
                  <div className="d-flex gap-3 text-white opacity-50 small">
                    <span>Cloud Sync</span>
                    <span>&bull;</span>
                    <span>REST API</span>
                    <span>&bull;</span>
                    <span>RBAC</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="auth-form-content p-5">
                  <div className="mb-5 d-lg-none text-center">
                    <Zap size={32} className="text-primary mb-3" />
                    <h2 className="fw-bold">College-ERP</h2>
                  </div>
                  
                  <div className="mb-5">
                    <h2 className="fw-bold text-white mb-2">{isRegistering ? 'Provision ID' : 'Secure Gateway'}</h2>
                    <p className="text-secondary mb-0">
                      {isRegistering ? 'Enter credentials to initialize your institutional node.' : 'Identity verification required to access the nexus.'}
                    </p>
                  </div>

                  {error && (
                    <div className="error-barrier mb-4 animate-shake">
                      <Lock size={16} className="text-danger me-2" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {isRegistering && (
                      <div className="mb-4">
                        <label className="premium-label">Legal Name</label>
                        <div className="input-group-glass py-3">
                          <UserCircle size={18} className="text-secondary" />
                          <input 
                            type="text" 
                            placeholder="John Doe" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                          />
                        </div>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="premium-label">Institutional Email</label>
                      <div className="input-group-glass py-3">
                        <Mail size={18} className="text-secondary" />
                        <input 
                          type="email" 
                          placeholder="name@college.edu" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="d-flex justify-content-between">
                        <label className="premium-label">Security Cipher</label>
                        {!isRegistering && <a href="#" className="small text-primary text-decoration-none opacity-75 hover-opacity-100">Forgot?</a>}
                      </div>
                      <div className="input-group-glass py-3">
                        <Lock size={18} className="text-secondary" />
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="btn-premium w-100 py-3 fw-bold mb-4" disabled={loading}>
                      {loading ? (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div className="spinner-border spinner-border-sm" role="status"></div>
                          <span>{isRegistering ? 'Provisions In Flight...' : 'Authenticating Nexus...'}</span>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <span>{isRegistering ? 'Create Academic Node' : 'Establish Session'}</span>
                          <ChevronRight size={18} />
                        </div>
                      )}
                    </button>

                    <div className="text-center mb-4">
                      <button 
                        type="button" 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="bg-transparent border-0 text-primary small fw-bold hover-opacity-100"
                      >
                        {isRegistering ? 'ALREADY REGISTERED? LOG IN' : 'NEW OPERATOR? PROVISION ACCOUNT'}
                      </button>
                    </div>

                    <div className="d-flex align-items-center mb-4">
                       <hr className="flex-grow-1 opacity-25" />
                       <span className="mx-3 small text-secondary">OR CONTINUE WITH IDENTITY PROVIDER</span>
                       <hr className="flex-grow-1 opacity-25" />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleGoogleLogin} 
                      className="btn-google-glass w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-3"
                      disabled={loading}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="G" />
                      <span>Google Authentication Gateway</span>
                    </button>
                    
                    <div className="mt-5 text-center text-secondary extra-small opacity-50">
                      SECURED BY EDUCLOUD FIREWALL &bull; v2.4.0-STABLE
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
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
        // Handle guest user or legacy auth
        if (unsubscribeUser) unsubscribeUser();
        
        try {
          const res = await axios.get('/api/me', { withCredentials: true });
          if (res.data.authenticated) {
            setCurrentUser(res.data.user);
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
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

// Placeholder for missing components
const SettingsPlaceholder = () => (
  <div className="glass-card-premium p-5 text-center">
    <h3 className="text-white">Settings Portal</h3>
    <p className="text-secondary">Infrastructure parameters are currently under maintenance.</p>
  </div>
);

export default App;

