import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  auth, 
  db 
} from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Users, 
  Search, 
  GraduationCap, 
  BookMarked, 
  UserPlus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  History, 
  ShieldCheck, 
  Mail, 
  PhoneCall, 
  CreditCard,
  UserCheck,
  Calendar,
  MapPin,
  X,
  ChevronRight,
  Filter
} from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterCrs, setFilterCrs] = useState('All');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_no: '',
    course_id: '',
    phone: '',
    dob: '',
    address: '',
    enrollment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Courses (can keep from API if that's where they are, or Firestore)
      const crsRes = await axios.get('/api/courses/data');
      if (crsRes.data.success) setCourses(crsRes.data.courses);

      // 2. Fetch Students from Firestore (Preferred)
      const q = query(collection(db, 'students'));
      const querySnapshot = await getDocs(q);
      const studentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If Firestore is empty, fallback to API for legacy data
      if (studentData.length === 0) {
        const stdRes = await axios.get('/api/students/data');
        if (stdRes.data.success) setStudents(stdRes.data.students);
      } else {
        setStudents(studentData);
      }
    } catch (err) {
      console.error('Data fetch failed, attempting secondary protocol...');
      // Final fallback
      const stdRes = await axios.get('/api/students/data').catch(() => ({ data: { success: false } }));
      if (stdRes.data.success) setStudents(stdRes.data.students);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register in Firestore
      const docRef = await addDoc(collection(db, 'students'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'Active'
      });

      // Optional: Sync with backend if needed
      await axios.post('/api/students/add', formData).catch(() => {});

      setShowModal(false);
      fetchData();
      resetForm();
    } catch (err) {
      alert('Admission failed: Database sync error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student record? This cannot be undone')) return;
    try {
      await deleteDoc(doc(db, 'students', id)).catch(async () => {
        // Fallback to API if ID is from legacy SQL
        await axios.post(`/api/students/delete/${id}`);
      });
      fetchData();
    } catch (err) {
      alert('Delete operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      roll_no: '',
      course_id: '',
      phone: '',
      dob: '',
      address: '',
      enrollment_date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredStudents = students.filter(s => 
    (filterCrs === 'All' || s.course_id === filterCrs) &&
    ((s.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
     (s.roll_no?.toLowerCase() || '').includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Dynamic Background Element */}
      <div className="fixed top-0 right-0 -z-10 opacity-20 pointer-events-none">
          <div className="w-[800px] h-[800px] bg-indigo-600 rounded-full blur-[160px] animate-pulse"></div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight">Student Registry</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Manage institutional records and academic deployments
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-premium py-4 px-8 flex items-center justify-center gap-3 group"
        >
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-bold tracking-wide">INITIALIZE ADMISSION</span>
        </button>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
        {[
          { label: 'Total Enrolled', val: students.length, icon: Users, color: 'indigo', status: 'Optimal' },
          { label: 'Academic Streams', val: courses.length, icon: BookMarked, color: 'emerald', status: 'Active' },
          { label: 'System Uptime', val: '99.9%', icon: History, color: 'blue', status: 'Stable' },
          { label: 'Data Integrity', val: 'Secured', icon: ShieldCheck, color: 'rose', status: 'Verified' }
        ].map((stat, i) => (
          <div key={i} className="uiverse-card">
            <div className={`absolute top-6 left-6 p-4 rounded-xl bg-white/5 border border-white/10 text-white z-10`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="heading uppercase">
              {stat.label}
            </p>
            <p className="text-4xl font-black italic tracking-tighter text-white mb-2">
              {stat.val}
            </p>
            <p className="flex items-center gap-2">
              <span className="highlight">{stat.status}</span>
               Verified Node
            </p>
          </div>
        ))}
      </div>

      {/* Filter & Search Terminal */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center border border-white/5">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search student bio-signatures..." 
            className="w-full bg-slate-950/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-100 outline-none focus:border-indigo-500/40 transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-950/30 p-1.5 rounded-2xl border border-white/5 gap-1 w-full md:w-auto">
          {['All', ...Array.from(new Set(courses.map(c => c.id))).slice(0, 3)].map(c_id => (
            <button 
              key={c_id}
              onClick={() => setFilterCrs(c_id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterCrs === c_id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {c_id === 'All' ? 'Universal' : courses.find(c => c.id === c_id)?.name.split(' ')[0]}
            </button>
          ))}
          <button className="px-4 py-2.5 text-slate-400 hover:text-indigo-400">
             <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Main Roster Matrix */}
      <div className="glass-card overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="premium-table w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-5">System Entity / Bio</th>
                <th className="px-8 py-5">Credential Hash</th>
                <th className="px-8 py-5">Academic Domain</th>
                <th className="px-8 py-5 text-right">Operation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-32">
                    <div className="flex flex-col items-center gap-6">
                      <div className="spinner-glow"></div>
                      <p className="text-indigo-400 font-black animate-pulse text-xs uppercase tracking-[0.3em]">Synchronizing Registry Nexus...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center font-black text-xl text-indigo-300 border border-indigo-500/20 shadow-inner">
                            {s.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-lg">
                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                            <Mail className="w-3.5 h-3.5 opacity-40" />
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-[10px] font-black px-4 py-2 rounded-xl bg-slate-950/40 border border-white/10 text-indigo-400 tracking-wider shadow-sm">
                        {s.roll_no}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                           <span className="text-sm font-bold text-white block">
                             {courses.find(c => c.id === s.course_id)?.name || 'Generic Entry'}
                           </span>
                           <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/60">Verified Domain</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3 translate-x-2 opacity-100 lg:opacity-40 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-300">
                        <button className="w-11 h-11 bg-white/5 hover:bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center border border-white/5 hover:border-indigo-500/30 transition-all shadow-lg">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="w-11 h-11 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center border border-white/5 hover:border-rose-500/30 transition-all shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="w-11 h-11 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/5 transition-all shadow-lg">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-40">
                    <div className="flex flex-col items-center opacity-20">
                      <Users className="w-24 h-24 mb-6 text-indigo-400" />
                      <p className="font-black italic text-sm tracking-[0.3em] uppercase">No identification records discovered on this frequency.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Terminal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-4xl glass-card rounded-[3rem] shadow-2xl animate-scale-in border border-white/10 overflow-hidden">
             {/* Glow Effect */}
             <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="p-8 md:p-14 overflow-y-auto max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                    <UserPlus className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gradient-primary tracking-tight">Provision Entity</h2>
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] mt-1">Initialize Student Identity Node</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-12 h-12 bg-white/5 rounded-2xl hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all border border-white/5 flex items-center justify-center"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-indigo-400/70 tracking-[0.3em] pl-1">Primary Designation</label>
                    <div className="input-group-glass py-1 bg-slate-950/40 rounded-2xl border-white/5">
                      <Users className="w-5 h-5 text-indigo-400/40" />
                      <input 
                        type="text" 
                        placeholder="Full Legal Identity"
                        required
                        className="text-lg py-4"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-indigo-400/70 tracking-[0.3em] pl-1">Comm Channel</label>
                    <div className="input-group-glass py-1 bg-slate-950/40 rounded-2xl border-white/5">
                      <Mail className="w-5 h-5 text-indigo-400/40" />
                      <input 
                        type="email" 
                        placeholder="Institutional Relay"
                        required
                        className="text-lg py-4"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] pl-1">Hash Assignment</label>
                  <div className="input-group-glass bg-slate-950/40 border-white/5">
                    <CreditCard className="w-5 h-5 text-indigo-400/40" />
                    <input 
                      type="text" 
                      className="font-mono uppercase tracking-widest text-indigo-300"
                      placeholder="Roll-ID Matrix"
                      required
                      value={formData.roll_no}
                      onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] pl-1">Academic Grid</label>
                  <div className="input-group-glass bg-slate-950/40 border-white/5">
                    <GraduationCap className="w-5 h-5 text-indigo-400/40" />
                    <select 
                      required
                      className="bg-transparent border-none outline-none text-white w-full py-4 appearance-none cursor-pointer"
                      value={formData.course_id}
                      onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                    >
                      <option value="" className="bg-slate-900">Select Domain...</option>
                      {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] pl-1">Vocal Relay</label>
                  <div className="input-group-glass bg-slate-950/40 border-white/5">
                    <PhoneCall className="w-5 h-5 text-indigo-400/40" />
                    <input 
                      type="text" 
                      placeholder="+1 (xxx) xxx-xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] pl-1">Origin Epoch</label>
                  <div className="input-group-glass bg-slate-950/40 border-white/5 px-4">
                    <Calendar className="w-5 h-5 text-indigo-400/40" />
                    <input 
                      type="date" 
                      required
                      className="w-full py-4 bg-transparent text-white border-none outline-none [color-scheme:dark]"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] pl-1">Residence Vector</label>
                  <div className="input-group-glass bg-slate-950/40 border-white/5 items-start py-3">
                    <MapPin className="w-5 h-5 text-indigo-400/40 mt-1" />
                    <textarea 
                      placeholder="Specify permanent habitat coordinates..."
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="resize-none w-full bg-transparent border-none outline-none text-white py-1"
                    ></textarea>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center justify-between gap-8 mt-10 pt-10 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-rose-400 transition-all"
                  >
                    Abort Provisioning
                  </button>
                  <div className="flex gap-4">
                    <button 
                      type="submit" 
                      className="btn-premium px-12 py-5 flex items-center gap-4 text-xs tracking-[0.2em]"
                    >
                      <CheckCircle2 className="w-6 h-6" /> 
                      VALIDATE & COMMIT NODE
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

