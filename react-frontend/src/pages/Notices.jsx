import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  User, 
  AlertTriangle, 
  Info, 
  Megaphone,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Flag,
  Radio,
  Zap,
  Activity,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight,
  Search,
  Users
} from 'lucide-react';

const Notices = ({ currentUser }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'General',
    priority: 'Normal',
    target_audience: 'All',
    expiry_date: ''
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notices/data');
      if (response.data.success) {
        setNotices(response.data.notices);
      }
    } catch (err) {
      setError('Neural link synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingId) {
        response = await axios.post(`/api/notices/edit/${editingId}`, formData);
      } else {
        response = await axios.post('/api/notices/add', formData);
      }

      if (response.data.success) {
        setSuccess(editingId ? 'Broadcast Terminated' : 'Signal Transmitted');
        setShowModal(false);
        resetForm();
        fetchNotices();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Transmission protocol error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Decommission this signal permanently?')) return;
    try {
      const response = await axios.post(`/api/notices/delete/${id}`);
      if (response.data.success) {
        setSuccess('Signal Purged');
        fetchNotices();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Sync de-synchronization occurred');
    }
  };

  const openEdit = (n) => {
    setEditingId(n.id);
    setFormData({
      title: n.title,
      content: n.content,
      type: n.type,
      priority: n.priority,
      target_audience: n.target_audience,
      expiry_date: n.expiry_date
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'General',
      priority: 'Normal',
      target_audience: 'All',
      expiry_date: ''
    });
    setEditingId(null);
  };

  const getPriorityConfig = (p) => {
    switch (p) {
      case 'High': return { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: Zap };
      case 'Medium': return { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Activity };
      default: return { color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20', icon: Radio };
    }
  };

  const filteredNotices = notices.filter(n => 
    (filter === 'All' || n.type === filter) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Bell className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">BULLETIN TERMINAL</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              Active broadcast signals and institutional protocols
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:min-w-[320px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Scan broadcast frequency..." 
              className="input-group-glass !pl-14 h-14 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => { resetForm(); setShowModal(true); }}
              className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="font-black tracking-[0.1em] text-[10px]">NEW ANNOUNCEMENT</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Signals', val: notices.length, icon: Radio, color: 'indigo' },
          { label: 'Critical Alert', val: notices.filter(n => n.priority === 'High').length, icon: AlertTriangle, color: 'rose' },
          { label: 'Recipients', val: '2.4K', icon: Users, color: 'emerald' },
          { label: 'Security Protocols', val: '12', icon: Shield, color: 'blue' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4 group">
            <div className={`p-4 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-text-muted tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-text-main group-hover:text-indigo-400 transition-colors">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories / Filters */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {['All', 'General', 'Academic', 'Exam', 'Placement', 'Event'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl whitespace-nowrap transition-all font-black text-[10px] uppercase tracking-widest border ${
              filter === f 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                : 'bg-glass-bg border-white/5 text-text-muted hover:border-white/20 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-64 animate-pulse opacity-50"></div>
          ))
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((n) => {
            const config = getPriorityConfig(n.priority);
            const PriorityIcon = config.icon;
            return (
              <div key={n.id} className="glass-card group p-8 hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col border-l-4 border-l-indigo-500/20 hover:border-l-indigo-500">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-xl ${config.color} border flex items-center gap-2`}>
                    <PriorityIcon className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{n.priority}</span>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <div className="flex gap-2">
                       <button onClick={() => openEdit(n)} className="p-2.5 rounded-lg bg-glass-bg border border-glass-border text-indigo-400 hover:text-white transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(n.id)} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black text-text-main group-hover:text-indigo-400 transition-colors tracking-tight uppercase italic mb-3 leading-tight font-serif">{n.title}</h3>
                  <div className="bg-glass-bg/50 p-4 rounded-2xl border border-glass-border mb-6">
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-4 font-medium italic">
                      "{n.content}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-glass-border">
                  <div className="flex items-center gap-2 group/sub cursor-help">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-widest">TRANSMITTER</p>
                      <p className="text-xs font-bold text-text-main uppercase">{n.posted_by_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 group/sub cursor-help">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-text-muted/40 tracking-widest">TIMESTAMP</p>
                      <p className="text-xs font-bold text-text-main uppercase">
                        {n.posted_date?.seconds ? new Date(n.posted_date.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : '---'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    <div className="px-3 py-1 rounded-lg bg-glass-bg border border-glass-border flex items-center gap-2">
                       <Flag className="w-3 h-3 text-emerald-400" />
                       <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">TO: {n.target_audience}</span>
                    </div>
                    <button className="p-2 rounded-lg bg-indigo-500 hover:bg-white text-white hover:text-indigo-900 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                       <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-48 glass-card border-dashed flex flex-col items-center justify-center opacity-30 text-center">
            <Megaphone className="w-16 h-16 text-indigo-400/50 mb-6" />
            <h3 className="text-xl font-black italic uppercase tracking-widest">Silence on Frequency {filter}</h3>
            <p className="text-sm font-medium mt-2 uppercase tracking-widest">Broadcast protocols awaiting initiation</p>
          </div>
        )}
      </div>

      {/* Modern High-Fidelity Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-0 overflow-hidden animate-scale-in border-indigo-500/30">
            <div className="p-10 border-b border-glass-border relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <h2 className="text-3xl font-black italic text-gradient-primary uppercase tracking-tight">{editingId ? 'EDIT BROADCAST' : 'INITIALIZE SIGNAL'}</h2>
               <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Institutional announcement protocol v3.2</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> SIGNAL TITLE
                </label>
                <input
                  type="text"
                  className="input-group-glass w-full text-lg font-bold h-14"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Primary objective summary..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> SPECTRUM
                  </label>
                  <select
                    className="input-group-glass w-full h-14 font-bold uppercase"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {['General', 'Academic', 'Exam', 'Placement', 'Event'].map(opt => (
                      <option key={opt} value={opt} className="bg-[#1a1b2a]">{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-rose-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-rose-500 rounded-full"></span> PRIORITY
                  </label>
                  <select
                    className="input-group-glass w-full h-14 font-bold uppercase"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    {['Normal', 'Medium', 'High'].map(opt => (
                      <option key={opt} value={opt} className="bg-[#1a1b2a]">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> SIGNAL PAYLOAD
                </label>
                <textarea
                  className="input-group-glass w-full h-40 resize-none py-6 text-sm font-medium leading-relaxed italic"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Insert detailed institutional instructions..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> TARGET RESONANCE
                  </label>
                  <select
                    className="input-group-glass w-full h-14 font-bold uppercase"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  >
                    <option value="All" className="bg-[#1a1b2a]">ENTIRE CAMPUS</option>
                    <option value="Students" className="bg-[#1a1b2a]">STUDENT BODY</option>
                    <option value="Faculty" className="bg-[#1a1b2a]">FACULTY NODES</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> EXPIRATION
                  </label>
                  <input
                    type="date"
                    className="input-group-glass w-full h-14 font-bold"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6 border-t border-glass-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-text-muted hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px]">TERMINATE OPS</button>
                <button type="submit" className="btn-premium px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]">
                  {editingId ? 'OVERWRITE SIGNAL' : 'TRANSMIT SIGNAL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Toasts */}
      {success && (
        <div className="fixed bottom-10 right-10 z-[100]">
           <div className="glass-card bg-emerald-500/10 border-emerald-500/30 p-6 rounded-2xl flex items-center gap-4 animate-slide-up shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 ring-2 ring-emerald-500/20 shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">PROTOCOL SUCCESS</p>
                 <p className="text-emerald-200 text-sm font-bold">{success}</p>
              </div>
           </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 right-10 z-[100]">
           <div className="glass-card bg-rose-500/10 border-rose-500/30 p-6 rounded-2xl flex items-center gap-4 animate-slide-up shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 ring-2 ring-rose-500/20 shadow-lg">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-rose-400 font-black uppercase tracking-widest text-[10px]">PROTOCOL ERROR</p>
                 <p className="text-rose-200 text-sm font-bold">{error}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
