import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

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
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-surface-container rounded-3xl border border-outline-variant/20"></div>
          <div className="space-y-3">
            <div className="h-10 w-80 bg-surface-container rounded-xl"></div>
            <div className="h-4 w-48 bg-surface-container rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-surface-container border border-outline-variant/20 rounded-[2rem]"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-[500px] bg-surface-container border border-outline-variant/20 rounded-[2rem]"></div>
          <div className="lg:col-span-4 space-y-8">
            <div className="h-64 bg-surface-container border border-outline-variant/20 rounded-[2rem]"></div>
            <div className="h-64 bg-surface-container border border-outline-variant/20 rounded-[2rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* HUD Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-24 h-24 rounded-[2rem] bg-surface-container-highest flex items-center justify-center border border-primary/20 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
               <span className="material-symbols-outlined text-5xl text-primary animate-float" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl bg-background border-4 border-surface-container flex items-center justify-center">
               <div className={`w-3 h-3 rounded-full ${syncStatus === 'online' ? 'bg-success shadow-[0_0_12px_var(--success)]' : 'bg-warning shadow-[0_0_12px_var(--warning)]'} animate-pulse`}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="font-headline text-5xl lg:text-7xl font-bold text-on-surface tracking-tighter uppercase italic leading-none">COMMAND CENTER</h1>
              <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary tracking-widest uppercase">System v4.0</span>
            </div>
            <p className="text-on-surface-variant mt-4 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="material-symbols-outlined text-success">sensors</span>
              Institutional Nexus &bull; Node: {window.location.hostname}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="px-6 py-4 rounded-[1.5rem] bg-surface-container border border-outline-variant/20 flex items-center gap-5 hover:border-primary/30 transition-all cursor-default shadow-sm hover:shadow-primary/5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">speed</span>
              </div>
              <div className="pr-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Neural Latency</p>
                <p className="text-lg font-bold text-on-surface">0.24<span className="text-xs opacity-50 ml-1">ms</span></p>
              </div>
           </div>
           
           <div className="px-6 py-4 rounded-[1.5rem] bg-surface-container border border-outline-variant/20 flex items-center gap-5 hover:border-primary/30 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-success text-xl">cloud_sync</span>
              </div>
              <div className="pr-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Cloud Sync</p>
                <p className="text-lg font-bold text-on-surface uppercase italic">Hyper-Active</p>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Learners', val: data.stats?.total_students || 0, icon: 'group', color: 'primary', desc: 'Total Student Count' },
          { label: 'Neural Experts', val: data.stats?.total_faculty || 0, icon: 'badge', color: 'secondary', desc: 'Active Faculty Members' },
          { label: 'Knowledge Tracks', val: data.stats?.total_courses || 0, icon: 'menu_book', color: 'primary', desc: 'Available Courses' },
          { label: 'Protocol Signals', val: data.stats?.active_notices || 0, icon: 'campaign', color: 'secondary', desc: 'Live Bulletins' }
        ].map((stat, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2rem] border border-outline-variant/20 -z-10"></div>
            <div className="uiverse-card !justify-start !bg-surface-container/40 p-8 h-full border-outline-variant/10 group-hover:border-primary/30 transition-all duration-500 rounded-[2.5rem]">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center border border-${stat.color}/20 group-hover:scale-110 transition-transform duration-500`}>
                  <span className={`material-symbols-outlined text-3xl text-${stat.color}`}>{stat.icon}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 text-xl group-hover:rotate-45 transition-transform">north_east</span>
              </div>
              <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">{stat.label}</p>
              <h3 className="text-5xl font-bold text-on-surface tracking-tighter mb-4 italic group-hover:text-primary transition-colors">{stat.val}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest pt-4 border-t border-outline-variant/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {stat.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Central Intelligence Ledger */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container rounded-[2.5rem] border border-outline-variant/20 overflow-hidden flex flex-col shadow-xl">
            <div className="p-10 border-b border-outline-variant/10 flex items-center justify-between bg-gradient-to-r from-surface-container-high to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary relative">
                    <span className="material-symbols-outlined text-3xl animate-pulse">campaign</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-headline text-3xl font-bold tracking-tight text-on-surface uppercase italic">SIGNAL BROADCASTS</h3>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] mt-1 opacity-60">High-Priority Institutional Transmissions</p>
                  </div>
                </div>
                <button className="px-8 py-3.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95">
                  Archived Logs
                </button>
            </div>
            <div className="p-10 max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-outline-variant/10">
                {data.recent_notices && data.recent_notices.length > 0 ? (
                  data.recent_notices.map((notice, index) => (
                    <div key={index} className="py-8 first:pt-0 last:pb-0 group/item cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                             <div className="px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest">Active Link</div>
                             <time className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                               {notice.posted_date}
                             </time>
                           </div>
                           <h5 className="font-headline text-xl font-bold text-on-surface group-hover/item:text-primary transition-colors uppercase italic tracking-tight">{notice.title}</h5>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant/20 translate-x-2 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all">chevron_right</span>
                      </div>
                      <p className="text-on-surface-variant/80 text-lg leading-relaxed italic font-medium">
                        "{notice.content}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-32 flex flex-col items-center opacity-30 text-center">
                    <span className="material-symbols-outlined text-6xl text-primary mb-6 animate-float">signal_disconnected</span>
                    <p className="text-xl font-bold uppercase tracking-widest">Quiet Frequency Detected</p>
                    <p className="text-[10px] mt-2 font-bold uppercase tracking-[0.2em]">Standing by for incoming data streams</p>
                  </div>
                )}
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-surface-container rounded-[2.5rem] border border-outline-variant/20 p-10 relative overflow-hidden h-[300px] flex flex-col justify-end transition-all hover:border-primary/40 shadow-xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-700"></div>
               <div className="relative z-10 space-y-6">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-on-surface/5 flex items-center justify-center border border-outline-variant/30 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                   <span className="material-symbols-outlined text-4xl text-on-surface">shield_locked</span>
                 </div>
                 <div>
                   <h2 className="font-headline text-3xl font-bold text-on-surface uppercase italic">SECURITY CORE</h2>
                   <p className="text-on-surface-variant text-sm font-medium mt-2 leading-relaxed max-w-[240px]">
                     Multi-layered encryption protocols active. Neural firewalls fully functional.
                   </p>
                 </div>
                 <button className="w-fit px-8 py-3 bg-on-surface border border-background text-background font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                   Security Protocol
                 </button>
               </div>
            </div>

            <div className="group bg-gradient-to-br from-primary to-primary-container rounded-[2.5rem] p-10 relative overflow-hidden h-[300px] flex flex-col justify-end shadow-2xl shadow-primary/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-white/20 transition-colors duration-700"></div>
               <div className="relative z-10 space-y-6 text-white text-left">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-500">
                   <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                 </div>
                 <div>
                   <h2 className="font-headline text-3xl font-bold uppercase italic font-black">NETWORK RELAY</h2>
                   <p className="text-white/80 text-sm font-medium mt-2 leading-relaxed max-w-[240px]">
                     Institutional data matrix synchronized with core global clusters.
                   </p>
                 </div>
                 <button className="w-fit px-8 py-3 bg-white text-primary font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-on-surface hover:text-white transition-all">
                   Pulse Sync
                 </button>
               </div>
            </div>
          </div>
        </div>
        
        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Health Monitor */}
          <div className="bg-surface-container rounded-[2.5rem] border border-outline-variant/20 p-10 shadow-xl group">
              <div className="flex items-center justify-between mb-12">
                <h3 className="font-headline text-lg font-bold italic uppercase tracking-tight text-on-surface flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl text-success" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span> 
                  SYSTEM VIABILITY
                </h3>
                <div className="px-4 py-1 bg-success/10 text-success text-[8px] font-bold rounded-lg border border-success/20 tracking-widest">OPTIMIZED</div>
              </div>
              
              <div className="space-y-10 w-full">
                 {[
                   { label: 'Database Integrity', val: '98.8%', progress: '98%' },
                   { label: 'Neural Throughput', val: '1.2 GB/s', progress: '85%' },
                   { label: 'Kernel Stability', val: '99.9%', progress: '100%' },
                   { label: 'Memory Allocation', val: 'ACTIVE', progress: '72%' }
                 ].map((node, i) => (
                   <div key={i} className="space-y-4 group/node">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] group-hover/node:text-primary transition-colors">{node.label}</span>
                         <span className="text-xs font-bold text-on-surface font-headline italic tracking-widest">{node.val}</span>
                      </div>
                      <div className="h-1.5 bg-background border border-outline-variant/10 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_15px_rgba(166,140,255,0.4)]"
                           style={{ width: node.progress }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-14 pt-10 border-t border-outline-variant/10 w-full">
                <div className="flex items-center gap-6 p-6 rounded-3xl bg-background border border-outline-variant/20 group-hover:border-primary/20 transition-colors shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-primary animate-spin-slow">settings_backup_restore</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-1">Last Secure Backup</p>
                    <p className="text-sm font-bold text-on-surface tracking-widest italic uppercase">Sync Complete</p>
                  </div>
                </div>
              </div>
          </div>

          {/* Operational Matrix */}
          <div className="bg-surface-container-high rounded-[2.5rem] border border-outline-variant/30 p-10 relative overflow-hidden shadow-2xl flex flex-col group">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col items-center mb-12 text-center relative z-10">
                 <div className="w-20 h-20 rounded-[2rem] bg-background border border-outline-variant/20 flex items-center justify-center text-primary mb-6 shadow-xl group-hover:scale-105 transition-transform duration-500">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>apps</span>
                 </div>
                 <h4 className="font-headline text-3xl font-bold uppercase italic tracking-tighter text-on-surface">OPERATIONAL MATRIX</h4>
                 <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.4em] mt-2 opacity-60">System Commandeer Node</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                 {[
                   { label: 'Learners', icon: 'group', path: '/students' },
                   { label: 'Staff HUB', icon: 'badge', path: '/staff' },
                   { label: 'Schedule', icon: 'calendar_month', path: '/timetable' },
                   { label: 'Archive', icon: 'local_library', path: '/library' },
                   { label: 'Ledger', icon: 'payments', path: '/fees' },
                   { label: 'Stations', icon: 'apartment', path: '/hostel' }
                 ].map((cmd, i) => (
                   <button 
                    key={i} 
                    onClick={() => navigate(cmd.path)}
                    className="p-6 bg-background rounded-3xl border border-outline-variant/10 flex flex-col items-center gap-4 hover:bg-primary group/cmd transition-all duration-300 active:scale-95 shadow-sm"
                   >
                      <span className="material-symbols-outlined text-2xl text-primary group-hover/cmd:text-white group-hover/cmd:scale-110 transition-all duration-300">{cmd.icon}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] group-hover/cmd:text-white/90">{cmd.label}</span>
                   </button>
                 ))}
              </div>
              
              <button className="mt-8 p-6 rounded-3xl bg-error/5 border border-error/10 flex items-center justify-between group/override hover:bg-error/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-error shadow-[0_0_10px_var(--error)] animate-pulse"></div>
                  <span className="text-[10px] font-bold text-error uppercase tracking-[0.3em]">System Overhaul</span>
                </div>
                <span className="material-symbols-outlined text-sm text-error group-hover/override:translate-x-1 transition-transform">arrow_forward_ios</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
