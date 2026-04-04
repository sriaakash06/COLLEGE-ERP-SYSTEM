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
  Database,
  BarChart3,
  Network,
  Globe,
  Radio,
  ExternalLink
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore';

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
  const [syncStatus, setSyncStatus] = useState('online');

  useEffect(() => {
    // 1. Fetch Legacy Data
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard/data', {
          withCredentials: true
        });
        if (response.data) {
          setData(prev => ({
            ...prev,
            stats: { ...prev.stats, ...response.data.stats },
            recent_notices: response.data.recent_notices || []
          }));
        }
      } catch (err) {
        console.error('Neural link synchronization failure:', err);
        setSyncStatus('degraded');
      }
    };

    fetchDashboardData();

    // 2. Real-time Firestore Stats Listener (Hybrid)
    const studentsUnsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      if (!snapshot.empty) {
        setData(prev => ({
          ...prev,
          stats: { ...prev.stats, total_students: snapshot.size }
        }));
      }
    });

    const staffUnsubscribe = onSnapshot(collection(db, "staff"), (snapshot) => {
      if (!snapshot.empty) {
        setData(prev => ({
          ...prev,
          stats: { ...prev.stats, total_faculty: snapshot.size }
        }));
      }
    });

    const coursesUnsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
      if (!snapshot.empty) {
        setData(prev => ({
          ...prev,
          stats: { ...prev.stats, total_courses: snapshot.size }
        }));
      }
    });

    // Handle loading state
    const timer = setTimeout(() => setLoading(false), 800);

    return () => {
      studentsUnsubscribe();
      staffUnsubscribe();
      coursesUnsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4 animate-pulse">
           <div className="w-12 h-12 bg-glass-bg rounded-lg border border-glass-border"></div>
           <div className="h-8 w-64 bg-glass-bg border border-glass-border rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-glass-bg border border-glass-border rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-glass-bg border border-glass-border rounded-[2.5rem] animate-pulse"></div>
           <div className="h-96 bg-glass-bg border border-glass-border rounded-[2.5rem] animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in text-white min-h-screen">
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-110"></div>
            <div className="w-20 h-20 rounded-[1.75rem] bg-indigo-600/20 flex items-center justify-center border border-indigo-500/40 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Monitor className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0a] border border-glass-border flex items-center justify-center">
               <div className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'} animate-pulse`}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">COMMAND CENTER</h1>
              <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 tracking-widest h-fit mt-2">V4.0</span>
            </div>
            <p className="text-text-muted mt-2 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              Institutional Nexus &bull; Node: {window.location.hostname}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="px-5 py-3 rounded-2xl bg-glass-bg border border-glass-border flex items-center gap-4 group hover:border-indigo-500/30 transition-all cursor-default">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Network Latency</p>
                <p className="text-sm font-black text-text-main">0.24ms <span className="text-[10px] text-emerald-500">STABLE</span></p>
              </div>
           </div>
           
           <div className="px-5 py-3 rounded-2xl bg-glass-bg border border-glass-border flex items-center gap-4 group hover:border-indigo-500/30 transition-all">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">Cloud Status</p>
                <p className="text-sm font-black text-text-main uppercase">Hyper-Sync</p>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
        {[
          { label: 'Active Learners', val: data.stats?.total_students || 0, icon: Users, color: 'indigo', detail: 'NESTED Registry' },
          { label: 'Neural Experts', val: data.stats?.total_faculty || 0, icon: Presentation, color: 'blue', detail: 'Faculty Cluster' },
          { label: 'Knowledge Tracks', val: data.stats?.total_courses || 0, icon: BookOpen, color: 'emerald', detail: 'Subject Density' },
          { label: 'Protocol Signals', val: data.stats?.active_notices || 0, icon: Bell, color: 'rose', detail: 'Broadcast Stream' }
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
              <span className="highlight">Powered By</span>
               Stitch Intelligence
            </p>
          </div>
        ))}
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Central Intelligence Ledger */}
        <div className="lg:col-span-8 space-y-8">
          <div className="uiverse-card !justify-start !p-0 overflow-hidden h-full">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">SIGNAL BROADCASTS</h3>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">REAL-TIME INSTITUTIONAL TRANSMISSIONS</p>
                  </div>
                </div>
                <button className="btn-premium px-8 py-3 rounded-2xl font-black tracking-widest text-[10px] uppercase">
                  ARCHIVE ACCESS
                </button>
            </div>
            <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar space-y-6">
                {data.recent_notices && data.recent_notices.length > 0 ? (
                  data.recent_notices.map((notice, index) => (
                    <div key={index} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item border-l-4 border-l-indigo-500/30 hover:border-l-indigo-500 duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-black text-xl text-text-main group-hover/item:text-indigo-400 transition-colors uppercase italic tracking-tight">{notice.title}</h5>
                          <div className="flex items-center gap-3 mt-1">
                             <div className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-widest">SECURE</div>
                             <time className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                               {notice.posted_date}
                             </time>
                          </div>
                        </div>
                      </div>
                      <p className="text-text-muted text-lg leading-relaxed font-medium italic opacity-80 group-hover/item:opacity-100 transition-opacity">
                        "{notice.content}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-24 flex flex-col items-center opacity-30 text-center">
                    <Zap className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
                    <p className="text-xl font-black uppercase tracking-widest">QUIET FREQUENCY</p>
                  </div>
                )}
            </div>
          </div>

          {/* Quick Action Grid - Using the new 3D Holo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="uiverse-card-3d group">
              <div className="card-content">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="card-title">SECURITY CORE</h2>
                <p className="card-para text-xs mt-2">
                  Multi-layered encryption protocols active. Integrity verification in progress.
                </p>
                <div className="mt-6">
                  <button className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black tracking-widest">RUN AUDIT</button>
                </div>
              </div>
            </div>

            <div className="uiverse-card-3d group" style={{ backgroundImage: 'linear-gradient(43deg, #6366f1 0%, #a855f7 46%, #ec4899 100%)' }}>
              <div className="card-content">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <h2 className="card-title">NETWORK RELAY</h2>
                <p className="card-para text-xs mt-2">
                  Institutional data stream synchronized with core nexus clusters.
                </p>
                <div className="mt-6">
                  <button className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-black tracking-widest">SYNC DATA</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Health Monitor */}
          <div className="uiverse-card !justify-start p-8 group">
              <div className="flex items-center justify-between mb-10 z-10">
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-400" /> SYSTEM VIABILITY
                </h3>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-lg border border-emerald-500/20">OPTIMIZED</div>
              </div>
              
              <div className="space-y-8 z-10 w-full">
                 {[
                   { label: 'Database Integrity', val: '98.8%', color: 'emerald', progress: '98%' },
                   { label: 'Neural Throughput', val: '1.2 GB/s', color: 'indigo', progress: '85%' },
                   { label: 'Memory Allocation', val: 'Active', color: 'blue', progress: '92%' },
                   { label: 'Encryption Shield', val: 'Enabled', color: 'indigo', progress: '100%' }
                 ].map((node, i) => (
                   <div key={i} className="flex flex-col gap-3 group/node">
                      <div className="flex justify-between items-end">
                         <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] group-hover/node:text-white transition-colors">{node.label}</span>
                         <span className={`text-xs font-black text-indigo-400 uppercase italic tracking-widest`}>{node.val}</span>
                      </div>
                      <div className="h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden p-[2px]">
                         <div 
                           className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]`}
                           style={{ width: node.progress }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-14 pt-8 border-t border-white/5 z-10 w-full">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                  <div>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Mainframe Load</p>
                    <p className="highlight leading-none mt-1">Cluster Alpha-9</p>
                  </div>
                </div>
              </div>
          </div>

          {/* Quick Command Matrix */}
          <div className="glass-card p-10 border-white/5 relative group overflow-hidden bg-gradient-to-br from-indigo-900/40 via-[#0a0a0a] to-[#0a0a0a]">
              <div className="flex flex-col items-center mb-10 text-center relative z-10">
                 <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-xl">
                    <Layers className="w-8 h-8" />
                 </div>
                 <h4 className="text-xl font-black uppercase italic tracking-tighter text-white">OPERATIONAL NEXUS</h4>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">DIRECT SYSTEM COMMANDEER</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 {[
                   { label: 'PROVISION', icon: Users, path: '/students' },
                   { label: 'SCHEDULER', icon: Calendar, path: '/timetable' },
                   { label: 'KNOWLEDGE', icon: BookOpen, path: '/library' },
                   { label: 'SIGNALS', icon: Bell, path: '/notices' },
                   { label: 'LEDGER', icon: Database, path: '/fees' },
                   { label: 'ANALYTICS', icon: BarChart3, path: '/' }
                 ].map((cmd, i) => (
                   <button 
                    key={i} 
                    onClick={() => window.location.href = cmd.path}
                    className="glass-card bg-[#0f0f0f]/40 border-white/5 p-6 flex flex-col items-center gap-4 hover:bg-indigo-600/40 hover:text-white transition-all group/cmd active:scale-95 border-b-2 border-b-transparent hover:border-b-indigo-400"
                   >
                      <cmd.icon className="w-6 h-6 text-indigo-400 group-hover/cmd:text-white group-hover/cmd:scale-110 transition-all duration-300" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{cmd.label}</span>
                   </button>
                 ))}
              </div>
              
              <div className="mt-10 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></div>
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Emergency Override</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-500" />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
