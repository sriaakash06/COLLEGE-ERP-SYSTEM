import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  PlusCircle, 
  GraduationCap, 
  BookMarked, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  History, 
  Globe, 
  ShieldCheck, 
  Mail, 
  PhoneCall, 
  CreditCard,
  UserCheck,
  Calendar,
  MapPin,
  X
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
      const [stdRes, crsRes] = await Promise.all([
        axios.get('/api/students/data'),
        axios.get('/api/courses/data')
      ]);
      if (stdRes.data.success) setStudents(stdRes.data.students);
      if (crsRes.data.success) setCourses(crsRes.data.courses);
    } catch (err) {
      console.error('Data fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/students/add', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchData();
        resetForm();
      }
    } catch (err) {
      alert('Admission failed: Roll number or Email collision detect');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student record? This cannot be undone')) return;
    try {
      const res = await axios.post(`/api/students/delete/${id}`);
      if (res.data.success) fetchData();
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
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_no.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled', val: students.length, icon: Users, color: 'indigo', status: 'Optimal' },
          { label: 'Academic Streams', val: courses.length, icon: BookMarked, color: 'emerald', status: 'Active' },
          { label: 'New This Month', val: students.filter(s => new Date(s.timestamp?.seconds * 1000).getMonth() === new Date().getMonth()).length, icon: History, color: 'amber', status: 'Syncing' },
          { label: 'Data Integrity', val: '100%', icon: ShieldCheck, color: 'rose', status: 'Secured' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 card-hover group cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-xl bg-${stat.color}-soft text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`badge-premium bg-${stat.color}-soft text-${stat.color}-400 border-${stat.color}-500/20`}>
                {stat.status}
              </span>
            </div>
            <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black">{stat.val}</h3>
          </div>
        ))}
      </div>

      {/* Controls Overlay */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Identify student by name, roll number or designation..." 
            className="w-full bg-glass-bg border border-glass-border rounded-xl pl-12 pr-4 py-3.5 text-text-main outline-none focus:border-indigo-500/50 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-glass-bg/50 p-1.5 rounded-xl border border-glass-border overflow-x-auto no-scrollbar gap-1 w-full md:w-auto">
          {['All', ...courses.map(c => c.id)].map(c_id => (
            <button 
              key={c_id}
              onClick={() => setFilterCrs(c_id)}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterCrs === c_id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-text-muted hover:text-text-main hover:bg-glass-bg'}`}
            >
              {c_id === 'All' ? 'Universal' : courses.find(c => c.id === c_id)?.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roster Matrix */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Student Terminal</th>
                <th>Credential ID</th>
                <th>Academic Stream</th>
                <th>Action Terminal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="spinner-glow"></div>
                      <p className="text-text-muted font-bold animate-pulse text-xs uppercase tracking-widest">Accessing Secure Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center font-black text-indigo-400 border border-indigo-500/20">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-text-main">{s.name}</p>
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                            <Mail className="w-3 h-3" />
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-glass-bg border border-glass-border text-indigo-300">
                        {s.roll_no}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold text-text-main">
                          {courses.find(c => c.id === s.course_id)?.name || 'Generic Entry'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-3 bg-glass-bg hover:bg-indigo-500/10 text-indigo-400 rounded-xl transition-all border border-glass-border">
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-3 bg-glass-bg hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all border border-glass-border"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-24">
                    <div className="flex flex-col items-center opacity-30">
                      <Users className="w-16 h-16 mb-4" />
                      <p className="font-bold italic">No identification records found in current frequency.</p>
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
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-4xl glass-card p-1 md:p-2 rounded-[2.5rem] shadow-2xl animate-scale-in">
            <div className="bg-bg-dark/80 rounded-[2.2rem] p-6 md:p-10 border border-glass-border/10 overflow-y-auto max-h-[85vh]">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gradient-primary">Enrollment Terminal</h2>
                    <p className="text-text-muted font-medium">Initialize new student entity record</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-glass-bg rounded-2xl hover:bg-rose-500/10 text-text-muted hover:text-rose-400 transition-all border border-glass-border"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 bg-glass-bg/30 p-6 rounded-3xl border border-glass-border">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Biological Identity</label>
                    <div className="input-group-glass">
                      <Users className="w-5 h-5 text-indigo-400/50" />
                      <input 
                        type="text" 
                        placeholder="Full Legal Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Primary Relay</label>
                    <div className="input-group-glass">
                      <Mail className="w-5 h-5 text-indigo-400/50" />
                      <input 
                        type="email" 
                        placeholder="Institutional Email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Credential Assignment</label>
                  <div className="input-group-glass">
                    <CreditCard className="w-5 h-5 text-indigo-400/50" />
                    <input 
                      type="text" 
                      className="font-mono uppercase"
                      placeholder="Roll/ID Number"
                      required
                      value={formData.roll_no}
                      onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Academic Deployment</label>
                  <div className="input-group-glass">
                    <GraduationCap className="w-5 h-5 text-indigo-400/50" />
                    <select 
                      required
                      value={formData.course_id}
                      onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                    >
                      <option value="">Select Specialization...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Contact Frequencies</label>
                  <div className="input-group-glass">
                    <PhoneCall className="w-5 h-5 text-indigo-400/50" />
                    <input 
                      type="text" 
                      placeholder="+1 (xxx) xxx-xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Entry Timestamp</label>
                  <div className="input-group-glass">
                    <Calendar className="w-5 h-5 text-indigo-400/50" />
                    <input 
                      type="date" 
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1">Geographical Vector</label>
                  <div className="input-group-glass">
                    <MapPin className="w-5 h-5 text-indigo-400/50" />
                    <textarea 
                      placeholder="Permanent Residence Address"
                      rows="2"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-5 mt-6 pt-8 border-t border-glass-border">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 text-text-muted font-bold uppercase tracking-widest text-xs hover:text-rose-400 transition-all"
                  >
                    ABORT PROTOCOL
                  </button>
                  <button 
                    type="submit" 
                    className="btn-premium px-12 py-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5" /> 
                    <span className="font-bold">VALIDATE & COMMIT</span>
                  </button>
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
