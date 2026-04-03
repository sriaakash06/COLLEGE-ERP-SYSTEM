import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Presentation, 
  BookOpen, 
  Bell, 
  Activity, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Shield, 
  Zap, 
  Cpu,
  Layers,
  Layout,
  ArrowUpRight,
  ChevronRight,
  Search,
  Calendar,
  Monitor,
  Database
} from 'lucide-react';

const Dashboard = () => {
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/data', {
          withCredentials: true
        });
        if (response.data) {
          setData(response.data);
        }
        setError(null);
      } catch (err) {
        console.error('Neural link synchronization failure:', err);
        setError('Failed to establish connection with core motherboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-glass-bg border border-glass-border rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-glass-bg border border-glass-border rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-glass-bg border border-glass-border rounded-[2.5rem]"></div>
           <div className="h-96 bg-glass-bg border border-glass-border rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
         <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-6">
            <Cpu className="w-10 h-10 text-rose-500 animate-pulse" />
         </div>
         <h2 className="text-2xl font-black italic uppercase tracking-tighter text-rose-400">Core Sync Interrupted</h2>
         <p className="text-text-muted text-sm mt-2 uppercase tracking-widest font-black">{error}</p>
         <button onClick={() => window.location.reload()} className="btn-premium mt-8 px-10 py-3 border-rose-500/30">Force Reinitialization</button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in text-white">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Monitor className="w-8 h-8 text-indigo-400 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gradient-primary tracking-tight italic uppercase">MISSION CONTROL</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Real-time institutional performance matrix v9.2
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 rounded-2xl bg-glass-bg border border-glass-border flex items-center gap-3">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Temporal Sync Active</span>
           </div>
           <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 p-1">
              <div className="w-full h-full rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
           </div>
        </div>
      </div>

      {/* Persistence Analytics - Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', val: data.stats?.total_students || 0, icon: Users, color: 'indigo', detail: '+12.4% vs prev' },
          { label: 'Active Faculty', val: data.stats?.total_faculty || 0, icon: Presentation, color: 'blue', detail: 'Saturated Nodes' },
          { label: 'Curriculum Units', val: data.stats?.total_courses || 0, icon: BookOpen, color: 'amber', detail: 'Modular Frameworks' },
          { label: 'Active Signals', val: data.stats?.active_notices || 0, icon: Bell, color: 'rose', detail: 'Broadcast Priority' }
        ].map((stat, i) => (
          <div key={i} className="glass-card group p-6 flex flex-col gap-4 hover:translate-y-[-4px] transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${stat.color}-500/10 transition-all`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-4 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black text-text-muted tracking-widest uppercase mb-1">{stat.label}</p>
                 <div className="flex items-baseline justify-end gap-2 text-text-main">
                    <span className="text-4xl font-black italic tracking-tighter group-hover:text-amber-400 transition-colors uppercase">{stat.val}</span>
                 </div>
              </div>
            </div>
            <div className="pt-4 border-t border-glass-border flex items-center justify-between relative z-10">
               <span className={`text-[9px] font-black text-${stat.color}-400 uppercase italic tracking-widest flex items-center gap-1.5`}>
                 <TrendingUp className="w-3 h-3" /> {stat.detail}
               </span>
               <ChevronRight className="w-4 h-4 text-text-muted/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Notice Module (Recent Activity) */}
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden relative group">
           <div className="p-8 border-b border-glass-border flex items-center justify-between bg-glass-bg/30">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase text-gradient-primary flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400" /> Neural Information Ledger
                </h3>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Institutional broadcast signals & protocols</p>
              </div>
              <button className="btn-premium px-6 py-2.5 rounded-xl font-black tracking-widest text-[9px] uppercase border-indigo-500/20">ACCESS ARCHIVE</button>
           </div>
           
           <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
              {data.recent_notices && data.recent_notices.length > 0 ? (
                data.recent_notices.map((notice, index) => (
                  <div key={index} className="glass-card bg-glass-bg/20 border-white/5 p-6 hover:translate-x-2 transition-all group/item relative overflow-hidden border-l-4 border-l-indigo-500/20 hover:border-l-indigo-500">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                       <h5 className="font-black text-lg text-text-main group-hover/item:text-indigo-400 transition-colors uppercase italic tracking-tight">{notice.title}</h5>
                       <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">Protocol X</span>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed mb-4 font-medium italic">"{notice.content}"</p>
                    <div className="flex items-center gap-4 text-[9px] font-black text-text-muted/40 uppercase tracking-widest">
                       <time className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {notice.posted_date}</time>
                       <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> VERIFIED DEPLOYMENT</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center opacity-20 text-center">
                   <Zap className="w-12 h-12 mb-4 text-indigo-400 animate-pulse" />
                   <p className="text-lg font-black uppercase tracking-widest">No Signals Detected</p>
                   <p className="text-xs font-bold mt-1">The neural information ledger is currently silent</p>
                </div>
              )}
           </div>
        </div>

        {/* Global Performance Node */}
        <div className="space-y-8">
           <div className="glass-card p-8 border-indigo-500/20 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                 <Shield className="w-24 h-24" />
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-text-main mb-6 flex items-center gap-3">
                 <Activity className="w-5 h-5 text-emerald-400" /> SYSTEM INTEGRITY
              </h3>
              
              <div className="space-y-6">
                 {[
                   { label: 'Cloud Persistence', val: '99.9%', color: 'emerald' },
                   { label: 'Neural Sync Speed', val: '0.4s', color: 'indigo' },
                   { label: 'Security Protocols', val: 'Active', color: 'blue' }
                 ].map((node, i) => (
                   <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{node.label}</span>
                         <span className={`text-xs font-black text-${node.color}-400 uppercase italic`}>{node.val}</span>
                      </div>
                      <div className="h-1.5 bg-glass-bg border border-glass-border rounded-full overflow-hidden p-[2px]">
                         <div className={`h-full bg-${node.color}-500 rounded-full transition-all duration-1000 w-[95%] shadow-[0_0_10px_rgba(0,0,0,0.5)]`}></div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="btn-premium w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                 <span className="font-black tracking-[0.2em] text-[9px]">ENFORCE PROTOCOLS</span>
                 <ArrowUpRight className="w-4 h-4" />
              </button>
           </div>

           <div className="glass-card p-8 border-indigo-500/20 relative group overflow-hidden bg-gradient-to-br from-indigo-900/40 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Layers className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-md font-black uppercase italic tracking-tighter">QUICK COMMANDS</h4>
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Execute core operations</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Enroll', icon: Users },
                   { label: 'Schedule', icon: Calendar },
                   { label: 'Report', icon: Database },
                   { label: 'Broadcast', icon: Bell }
                 ].map((cmd, i) => (
                   <button key={i} className="glass-card bg-glass-bg/20 border-white/5 p-4 flex flex-col items-center gap-3 hover:bg-indigo-600 hover:text-white transition-all group/cmd active:scale-90">
                      <cmd.icon className="w-5 h-5 text-indigo-400 group-hover/cmd:text-white transition-colors" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{cmd.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
