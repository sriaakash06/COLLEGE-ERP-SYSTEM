import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserRound, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  UserCheck, 
  Trash2, 
  Edit3, 
  Filter, 
  MoreVertical, 
  Download, 
  ShieldCheck, 
  Clock, 
  Globe,
  Database,
  Cpu,
  Monitor,
  Zap,
  ChevronRight,
  Layers,
  Activity,
  Fingerprint
} from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterDep, setFilterDep] = useState('All');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    department_id: '',
    phone: '',
    qualification: '',
    joining_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStaff();
    fetchDeps();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/staff/data');
      if (res.data.success) setStaff(res.data.staff);
    } catch (err) {
      console.error('Staff fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeps = async () => {
    try {
      const res = await axios.get('/api/staff/departments');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/staff/onboard', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchStaff();
        setFormData({
          name: '',
          email: '',
          role: 'Staff',
          department_id: '',
          phone: '',
          qualification: '',
          joining_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      alert('Registration failed: Email already exists or server error');
    }
  };

  const filteredStaff = staff.filter(s => 
    (filterDep === 'All' || s.department_id === filterDep) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <UserRound className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic">PERSONNEL HUB</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Institutional human resource and deployment matrix
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-4 rounded-xl bg-glass-bg border border-glass-border text-text-muted hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span className="font-black tracking-[0.1em] text-[10px]">ONBOARD FACULTY</span>
          </button>
        </div>
      </div>

      {/* Persistence Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Deployment', val: staff.length, icon: UserCheck, color: 'emerald', detail: 'Personnel Online' },
          { label: 'Sectors Active', val: departments.length, icon: Layers, color: 'indigo', detail: 'Institutional Units' },
          { label: 'Admin Override', val: staff.filter(s => s.role === 'admin').length, icon: ShieldCheck, color: 'amber', detail: 'Privileged Access' },
          { label: 'System Uptime', val: '99.9%', icon: Activity, color: 'rose', detail: 'Registry: Nominal' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 group hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-[8px] font-black text-text-muted uppercase tracking-widest">
                Real-Time
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-text-main group-hover:text-indigo-400 transition-colors tracking-tight italic">
                 {stat.val}
              </p>
              <p className={`text-[10px] font-bold text-${stat.color}-400/80 mt-1 uppercase italic`}>{stat.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Terminal */}
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by identity vector or credential..." 
            className="input-group-glass !pl-14 h-14 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="bg-glass-bg/50 p-1.5 rounded-2xl border border-glass-border flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none w-full lg:w-auto">
          <button 
            onClick={() => setFilterDep('All')}
            className={`px-6 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest ${filterDep === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-text-muted hover:text-text-main hover:bg-glass-bg'}`}
          >
            UNIVERSAL
          </button>
          {departments.map(d => (
            <button 
              key={d.id}
              onClick={() => setFilterDep(d.id)}
              className={`px-6 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest ${filterDep === d.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-text-muted hover:text-text-main hover:bg-glass-bg'}`}
            >
              {d.name.split(' ')[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-64 animate-pulse opacity-50"></div>
          ))
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((s) => (
            <div key={s.id} className="glass-card group p-6 hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col border-b-4 border-b-indigo-500/20 hover:border-b-indigo-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl font-black text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-text-main text-lg truncate tracking-tight uppercase italic group-hover:text-indigo-400 transition-colors">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{s.role}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                <div className="flex items-center gap-3 text-sm text-text-muted group-hover:text-text-main transition-colors group/item">
                  <div className="w-8 h-8 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center group-hover/item:text-indigo-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate flex-1 font-bold italic text-xs">{s.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted group-hover:text-text-main transition-colors group/item">
                  <div className="w-8 h-8 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center group-hover/item:text-blue-400 transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="truncate flex-1 font-bold text-[10px] uppercase tracking-widest">
                    {departments.find(d => d.id === s.department_id)?.name || 'Central Unit'}
                  </span>
                </div>
                {s.phone && (
                  <div className="flex items-center gap-3 text-sm text-text-muted group-hover:text-text-main transition-colors group/item">
                    <div className="w-8 h-8 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center group-hover/item:text-amber-400 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="truncate flex-1 font-mono text-xs">{s.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-glass-border flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">DEPLOYED ON</span>
                  <span className="text-[10px] font-bold text-text-main italic tracking-tighter">
                    {new Date(s.timestamp?.seconds * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-lg bg-glass-bg border border-glass-border text-text-muted hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-lg bg-glass-bg border border-glass-border text-text-muted hover:text-rose-400 hover:border-rose-500/30 transition-all hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-48 glass-card border-dashed flex flex-col items-center justify-center opacity-30 text-center">
            <div className="w-20 h-20 rounded-full bg-glass-bg flex items-center justify-center mb-6 border border-glass-border">
              <Database className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-widest">No Persistence Vectors Detected</h3>
            <p className="text-sm font-medium mt-2">Adjust search parameters or initialize new onboarding session</p>
          </div>
        )}
      </div>

      {/* Onboarding Operational Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-8 md:p-12 border-2 border-indigo-500/20 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="flex items-center gap-6 mb-12 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg text-indigo-400">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic text-gradient-primary tracking-tight">FACULTY ONBOARDING HUB</h2>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Initializing Personnel Credential Session</p>
              </div>
            </div>
            
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3 col-span-full md:col-span-1">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                  <UserRound className="w-3 h-3 text-indigo-400" /> Legal Persona
                </label>
                <div className="input-group-glass">
                  <input 
                    type="text" 
                    placeholder="FULL LEGAL ENTITY NAME"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-3 col-span-full md:col-span-1">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                  <Mail className="w-3 h-3 text-indigo-400" /> Institutional Sync ID
                </label>
                <div className="input-group-glass">
                  <input 
                    type="email" 
                    placeholder="EMAIL@COLLEGE.DOMAIN"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                  <Layers className="w-3 h-3 text-indigo-400" /> Functional Sector
                </label>
                <div className="input-group-glass">
                  <select 
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  >
                    <option value="">SELECT DEPARTMENT...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-indigo-400" /> Access Tier
                </label>
                <div className="input-group-glass">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Staff">FACULTY / STAFF</option>
                    <option value="Admin">ADMINISTRATIVE / OVERSIGHT</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full flex flex-col sm:flex-row justify-end gap-6 mt-12 pt-8 border-t border-glass-border">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 text-text-muted/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all order-2 sm:order-1"
                >
                  TERMINAL ABORT
                </button>
                <button 
                  type="submit" 
                  className="btn-premium px-16 py-4 rounded-2xl flex items-center justify-center gap-4 group order-1 sm:order-2"
                >
                  <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-black tracking-[0.1em] text-xs">VALIDATE ONBOARDING</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
