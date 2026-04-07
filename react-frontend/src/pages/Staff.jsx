import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserRound, Search, Plus, Mail, Phone, Briefcase, Building2, UserCheck, 
  Trash2, Edit3, Download, ShieldCheck, Clock, Database, ChevronRight, 
  Layers, Activity, Fingerprint, X
} from 'lucide-react';
import './Staff.css';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterDep, setFilterDep] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Staff', department_id: '',
    phone: '', qualification: '', joining_date: new Date().toISOString().split('T')[0]
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
      console.error('Staff sync failed');
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
        resetForm();
      }
    } catch (err) {
      alert('Onboarding failed: Server error or identity conflict');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', role: 'Staff', department_id: '',
      phone: '', qualification: '', joining_date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredStaff = staff.filter(s => 
    (filterDep === 'All' || s.department_id === filterDep) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="staff-root">
      
      {/* ── Header ── */}
      <div className="staff-header">
        <div className="staff-header-meta">
          <div className="staff-icon-box">
            <UserRound className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Personnel Hub</h1>
            <p className="header-location">
              <Activity className="w-4 h-4 text-emerald-400" />
              Institutional Human Resource Management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="control-btn"><Download size={18} /></button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="onboard-btn">
            <Plus size={18} />
            Onboard Faculty
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="staff-analytics">
        {[
          { label: 'Active Personnel', val: staff.length, icon: UserCheck, color: 'emerald' },
          { label: 'Departments', val: departments.length, icon: Layers, color: 'indigo' },
          { label: 'Admin Tier', val: staff.filter(s => s.role === 'Admin').length, icon: ShieldCheck, color: 'amber' },
          { label: 'System Uptime', val: '100%', icon: Activity, color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="staff-analytic-card">
            <div className="analytic-icon-box">
              <stat.icon size={20} className="text-primary" />
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stat.val}</h3>
            <div className="stat-desc-box">Operational Connectivity</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="staff-terminal">
        <div className="staff-search-wrapper">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search personnel directory..." 
            className="staff-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="staff-filter-bar scrollbar-hide">
          <button 
            onClick={() => setFilterDep('All')}
            className={`staff-filter-btn ${filterDep === 'All' ? 'active' : ''}`}
          >
            Universal
          </button>
          {departments.map(d => (
            <button 
              key={d.id}
              onClick={() => setFilterDep(d.id)}
              className={`staff-filter-btn ${filterDep === d.id ? 'active' : ''}`}
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Staff Records ── */}
      <div className="staff-grid">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="staff-card animate-pulse opacity-40"></div>
          ))
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((s) => (
            <div key={s.id} className="staff-card">
              <div className="staff-card-header">
                <div className="staff-avatar">{s.name.charAt(0)}</div>
                <div className="staff-info">
                  <h3 className="staff-name">{s.name}</h3>
                  <div className="staff-role-badge">
                    <UserCheck size={12} className="text-primary" />
                    {s.role}
                  </div>
                </div>
              </div>

              <div className="staff-details">
                <div className="detail-item">
                  <div className="detail-item-icon"><Mail size={14} /></div>
                  <span className="truncate">{s.email}</span>
                </div>
                <div className="detail-item">
                  <div className="detail-item-icon"><Building2 size={14} /></div>
                  <span className="truncate">
                    {departments.find(d => d.id === s.department_id)?.name || 'Central Admin'}
                  </span>
                </div>
                {s.phone && (
                  <div className="detail-item">
                    <div className="detail-item-icon"><Phone size={14} /></div>
                    <span>{s.phone}</span>
                  </div>
                )}
              </div>

              <div className="staff-card-footer">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Joining Date</span>
                  <span className="staff-date">{new Date(s.timestamp?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button className="control-btn"><Edit3 size={14} /></button>
                  <button className="control-btn delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-48 text-center opacity-20">
            <Database size={64} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-widest">No matching personnel records</h3>
          </div>
        )}
      </div>

      {/* ── Onboarding Modal ── */}
      {showModal && (
        <div className="onboard-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="onboard-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-12">
              <div className="staff-header-meta">
                <div className="staff-icon-box"><Fingerprint size={32} /></div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Personnel Onboarding</h2>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Official Resource Registration</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="control-btn"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRegister} className="form-grid">
              <div className="input-field-group">
                <label className="input-label">Full Legal Persona</label>
                <input 
                  className="input-control" type="text" placeholder="Identity Name" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Institutional Relay (Email)</label>
                <input 
                  className="input-control" type="email" placeholder="email@college.edu" required
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Functional Sector</label>
                <select 
                  className="input-control" required
                  value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                >
                  <option value="">Select Domain...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="input-field-group">
                <label className="input-label">Access Tier</label>
                <select 
                  className="input-control"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Staff">Faculty / Academic</option>
                  <option value="Admin">Administrative Overseer</option>
                </select>
              </div>
              <div className="input-field-group">
                <label className="input-label">Qualification</label>
                <input 
                  className="input-control" type="text" placeholder="Ph.D / Master / etc."
                  value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Vocal Link (Phone)</label>
                <input 
                  className="input-control" type="text" placeholder="+1 XXX XXX XXXX"
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-8 pt-8 border-t border-white/5">
                <button type="submit" className="onboard-btn">Confirm Personnel Deployment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
