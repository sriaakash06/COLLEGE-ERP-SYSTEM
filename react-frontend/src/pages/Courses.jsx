import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  GraduationCap, 
  Users, 
  ChevronRight, 
  ExternalLink, 
  Building2, 
  Bookmark,
  ShieldCheck,
  Cpu,
  Monitor,
  Zap,
  Activity,
  Database,
  ArrowUpRight
} from 'lucide-react';

const Courses = ({ currentUser }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/courses/data');
      if (res.data.success) setCourses(res.data.courses);
    } catch (err) {
      console.error('Temporal sync failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <BookOpen className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">ACADEMIC STREAMS</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Institutional curriculum and program matrix v3.2
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:min-w-[320px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search curriculum spectrum..." 
              className="input-group-glass !pl-14 h-14 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {currentUser?.role === 'admin' && (
            <button className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform shrink-0">
              <Plus className="w-5 h-5" />
              <span className="font-black tracking-[0.1em] text-[10px]">INITIALIZE STREAM</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Active Programs', val: courses.length, icon: Layers, color: 'indigo', detail: 'Modular Units' },
          { label: 'Core Faculties', val: '04', icon: Building2, color: 'blue', detail: 'Institutional Pillars' },
          { label: 'Digital Assets', val: '240+', icon: ShieldCheck, color: 'emerald', detail: 'Curated Nodes' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 group hover:translate-y-[-4px] transition-all overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${stat.color}-500/10 transition-all`}></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20 shadow-lg`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-black text-text-muted tracking-[0.2em] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-text-main group-hover:text-indigo-400 transition-colors tracking-tighter italic">
                    {stat.val}
                  </p>
                  <Activity className={`w-4 h-4 text-${stat.color}-400 animate-pulse`} />
                </div>
                <p className={`text-[10px] font-bold text-${stat.color}-400/80 mt-1 uppercase italic tracking-widest`}>{stat.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-80 animate-pulse opacity-50"></div>
          ))
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((c) => (
            <div key={c.id} className="glass-card group p-8 hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col border-b-4 border-b-indigo-500/20 hover:border-b-indigo-500">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-700">
                  <BookOpen className="w-24 h-24" />
               </div>
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="px-4 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 shadow-inner">
                    {c.code || 'STREAM-CORE'}
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2.5 rounded-lg bg-glass-bg border border-glass-border text-text-muted hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                       <Monitor className="w-4.5 h-4.5" />
                    </button>
                 </div>
               </div>

               <h3 className="text-2xl font-black text-text-main group-hover:text-amber-400 transition-colors tracking-tight uppercase italic mb-4 leading-tight">{c.name}</h3>
               <p className="text-text-muted text-sm leading-relaxed mb-8 flex-1 line-clamp-3 font-medium">
                 {c.description || 'Comprehensive academic framework designed for industrial integration, technical mastery, and advanced research protocols.'}
               </p>

               <div className="grid grid-cols-2 gap-4 pt-8 border-t border-glass-border relative z-10">
                 <div className="space-y-1.5 group/sub">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-text-muted tracking-widest">
                       <Users className="w-3 h-3 text-emerald-400" /> RESIDENCE LOAD
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-text-main group-hover/sub:text-emerald-400 transition-colors italic">{c.enrolled_students || '0'}</span>
                      <span className="text-[10px] font-bold text-text-muted/40 uppercase">/ {c.capacity || '120'}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-1.5 group/sub">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-text-muted tracking-widest">
                       <GraduationCap className="w-3 h-3 text-blue-400" /> TEMPORAL SPAN
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-text-main group-hover/sub:text-blue-400 transition-colors italic">{c.semesters || '8'}</span>
                      <span className="text-[10px] font-bold text-text-muted/40 uppercase">PHASES</span>
                    </div>
                 </div>
               </div>

               <button className="btn-premium mt-8 w-full py-4 rounded-xl flex items-center justify-center gap-4 group/btn transition-transform active:scale-[0.98]">
                  <span className="font-black tracking-[0.2em] text-[10px]">ACCESS CURRICULUM</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
               </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-48 glass-card border-dashed flex flex-col items-center justify-center opacity-30 text-center">
            <div className="w-20 h-20 rounded-full bg-glass-bg flex items-center justify-center mb-6 border border-glass-border">
              <Database className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-widest">No Curriculum Resonance Detected</h3>
            <p className="text-sm font-medium mt-2">The requested curriculum spectrum is not currently synchronized</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
