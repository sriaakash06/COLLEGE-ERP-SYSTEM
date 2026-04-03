import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  User, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  Sparkles, 
  Layout, 
  Filter, 
  MoreVertical, 
  Zap,
  Activity,
  ArrowUpRight,
  Monitor,
  Database,
  Search,
  Users
} from 'lucide-react';

const Timetable = ({ currentUser }) => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedCourse, setSelectedCourse] = useState('All');
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Registration Form
  const [formData, setFormData] = useState({
    course_id: '',
    subject_id: '',
    staff_id: '',
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, crsRes, subRes, staffRes] = await Promise.all([
        axios.get('/api/timetable/data'),
        axios.get('/api/courses/data'),
        axios.get('/api/courses/subjects'),
        axios.get('/api/staff/data')
      ]);
      
      if (sessRes.data.success) setSessions(sessRes.data.sessions);
      if (crsRes.data.success) setCourses(crsRes.data.courses);
      if (subRes.data.success) setSubjects(subRes.data.subjects);
      if (staffRes.data.success) setStaff(staffRes.data.staff);
      
    } catch (err) {
      console.error('Neural link synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await axios.post(`/api/timetable/edit/${editingId}`, formData);
      } else {
        res = await axios.post('/api/timetable/add', formData);
      }
      
      if (res.data.success) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (err) {
      alert('Collision detected in scheduling matrix');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Dissolve this session from schedule matrix?')) return;
    try {
      const res = await axios.post(`/api/timetable/delete/${id}`);
      if (res.data.success) fetchData();
    } catch (err) {}
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      subject_id: '',
      staff_id: '',
      day: selectedDay,
      start_time: '09:00',
      end_time: '10:00',
      room: ''
    });
    setEditingId(null);
  };

  const filteredSessions = sessions.filter(s => 
    s.day === selectedDay && (selectedCourse === 'All' || s.course_id === selectedCourse)
  ).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Calendar className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">CHRONO-MATRIX</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Dynamic academic session visualization and sync
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-glass-bg border border-glass-border p-1 rounded-2xl">
             <button 
                onClick={() => setSelectedCourse('All')}
                className={`px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
                  selectedCourse === 'All' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-text-muted hover:text-white'
                }`}
             >
                Global
             </button>
             {courses.slice(0, 3).map(c => (
               <button 
                  key={c.id}
                  onClick={() => setSelectedCourse(c.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
                    selectedCourse === c.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-text-muted hover:text-white'
                  }`}
               >
                 {c.name.split(' ')[0]}
               </button>
             ))}
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform shrink-0 border-emerald-500/30"
            >
              <Plus className="w-5 h-5" />
              <span className="font-black tracking-[0.1em] text-[10px]">INJECT SESSION</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector Strip - High Fidelity */}
      <div className="bg-glass-bg border border-glass-border p-2 rounded-[2rem] flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto scrollbar-hide">
        {days.map(d => (
          <button 
            key={d}
            onClick={() => handleDayChange(d)}
            className={`min-w-[120px] py-6 sm:py-8 rounded-2xl transition-all relative flex flex-col items-center justify-center gap-3 group border ${
              selectedDay === d 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-inner' 
                : 'bg-transparent border-transparent text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
              {d.charAt(0)}{d.charAt(1)}{d.charAt(2)}
            </span>
            <span className={`text-xl font-black italic tracking-tighter transition-all ${selectedDay === d ? 'text-emerald-400 scale-110' : 'group-hover:text-emerald-400'}`}>
              {d}
            </span>
            {selectedDay === d && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Timeline Grid - High Fidelity Terminal */}
      <div className="space-y-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse opacity-50"></div>
          ))
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((s, idx) => (
            <div key={s.id} className="glass-card group p-0 overflow-hidden flex hover:translate-y-[-2px] transition-all border-l-8 border-l-emerald-500/20 hover:border-l-emerald-500 shadow-xl">
               <div className="w-40 sm:w-56 bg-emerald-500/5 flex flex-col items-center justify-center p-8 border-r border-glass-border relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
                  </div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tighter italic">{s.start_time}</span>
                    <div className="w-1 h-6 bg-emerald-500/20 rounded-full group-hover:h-8 transition-all"></div>
                    <span className="text-sm sm:text-lg font-black font-mono text-text-muted/40 italic">{s.end_time}</span>
                  </div>
               </div>
               
               <div className="flex-1 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/20 shadow-lg group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 animate-pulse" />
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-black text-text-main group-hover:text-emerald-400 transition-colors uppercase italic tracking-tight font-serif leading-none">
                            {subjects.find(sub => sub.id === s.subject_id)?.name || 'PROTOCOL UNKNOWN'}
                          </h3>
                          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Core Session
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                           <div className="flex items-center gap-3 group/sub">
                              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover/sub:bg-blue-500 group-hover/sub:text-white transition-all">
                                 <User className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.2em]">EXECUTOR</p>
                                 <p className="text-xs font-bold text-text-main uppercase">{staff.find(st => st.id === s.staff_id)?.name || '---'}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-3 group/sub">
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover/sub:bg-rose-500 group-hover/sub:text-white transition-all">
                                 <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.2em]">SPATIAL HUB</p>
                                 <p className="text-xs font-bold text-text-main uppercase">{s.room || 'Digital Node'}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-3 group/sub">
                              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover/sub:bg-purple-500 group-hover/sub:text-white transition-all">
                                 <Layout className="w-4 h-4" />
                              </div>
                              <div>
                                 <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-[0.2em]">STREAM</p>
                                 <p className="text-xs font-bold text-text-main uppercase">{courses.find(c => c.id === s.course_id)?.name.split(' ')[0] || 'X-CORE'}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-3">
                       <button className="p-4 rounded-xl bg-glass-bg border border-glass-border text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all group/btn shadow-lg">
                          <Edit2 className="w-5 h-5 group-hover/btn:rotate-12" />
                       </button>
                       <button onClick={() => handleDelete(s.id)} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500 transition-all group/btn shadow-lg">
                          <Trash2 className="w-5 h-5 group-hover/btn:scale-110" />
                       </button>
                       <div className="w-px h-10 bg-glass-border mx-2"></div>
                       <button className="p-4 rounded-xl bg-emerald-500 text-white hover:bg-white hover:text-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <ArrowUpRight className="w-5 h-5" />
                       </button>
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="py-48 glass-card border-dashed flex flex-col items-center justify-center opacity-30 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="w-24 h-24 rounded-full bg-glass-bg flex items-center justify-center mb-8 border border-glass-border relative z-10">
                <Clock className="w-12 h-12 text-indigo-400 animate-pulse" />
             </div>
             <h2 className="text-3xl font-black text-text-main italic uppercase tracking-tighter mb-4 relative z-10">Temporal Void Detected</h2>
             <p className="text-text-muted text-xs uppercase font-black tracking-[0.4em] relative z-10">No sessions configured for this sector on {selectedDay}</p>
             <button className="mt-10 px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-background transition-all relative z-10">Initialize Temporal Logic</button>
          </div>
        )}
      </div>

      {/* Modern High-Fidelity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fade-in text-white">
          <div className="glass-card w-full max-w-2xl p-0 overflow-hidden animate-scale-in border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="p-10 border-b border-glass-border relative overflow-hidden bg-emerald-500/5">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <h2 className="text-3xl font-black italic text-gradient-primary uppercase tracking-tight flex items-center gap-4">
                 <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
                 INJECT SESSION
               </h2>
               <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Temporal core configuration protocol v9.0</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span> TARGET STREAM
                  </label>
                  <select 
                    className="input-group-glass w-full h-14 font-bold uppercase" 
                    required 
                    value={formData.course_id} 
                    onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  >
                    <option value="" className="bg-[#1a1b2a]">SELECT COURSE...</option>
                    {courses.map(c => <option key={c.id} value={c.id} className="bg-[#1a1b2a]">{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span> KNOWLEDGE NODE
                  </label>
                  <select 
                    className="input-group-glass w-full h-14 font-bold uppercase" 
                    required 
                    value={formData.subject_id} 
                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                  >
                    <option value="" className="bg-[#1a1b2a]">SELECT SUBJECT...</option>
                    {subjects.filter(sub => !formData.course_id || sub.course_id === formData.course_id).map(sub => (
                      <option key={sub.id} value={sub.id} className="bg-[#1a1b2a]">{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> EXECUTOR PROTOCOL
                </label>
                <select 
                  className="input-group-glass w-full h-14 font-bold uppercase" 
                  required 
                  value={formData.staff_id} 
                  onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                >
                  <option value="" className="bg-[#1a1b2a]">SELECT STAFF AGENT...</option>
                  {staff.map(st => <option key={st.id} value={st.id} className="bg-[#1a1b2a]">{st.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span> TEMPORAL ENTRY
                  </label>
                  <input 
                    type="time" 
                    className="input-group-glass w-full h-14 font-mono font-black border-emerald-500/20" 
                    required 
                    value={formData.start_time} 
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span> TEMPORAL EXIT
                  </label>
                  <input 
                    type="time" 
                    className="input-group-glass w-full h-14 font-mono font-black border-emerald-500/20" 
                    required 
                    value={formData.end_time} 
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-rose-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-3 bg-rose-500 rounded-full"></span> SPATIAL HUB
                </label>
                <input 
                  type="text" 
                  className="input-group-glass w-full h-14 font-bold uppercase" 
                  placeholder="Ex: SECTOR-4 or NODE-HAL 3..." 
                  value={formData.room} 
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-6 pt-6 border-t border-glass-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-text-muted hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px]">ABORT MATRIX</button>
                <button type="submit" className="btn-premium px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-emerald-500/30">
                  SYNCHRONIZE SESSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
