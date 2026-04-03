import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  UserCheck,
  UserX,
  BadgeCheck
} from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'faculty',
    phone: '',
    department_id: '',
    designation: '',
    employee_id: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/staff/data');
      if (response.data.success) {
        setStaff(response.data.staff);
      }
    } catch (err) {
      setError('Failed to fetch staff data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/staff/departments');
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (err) {
      console.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/staff/add', formData);
      if (response.data.success) {
        setSuccess('Staff member added successfully');
        setShowModal(false);
        resetForm();
        fetchStaff();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
      setTimeout(() => setError(null), 4000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'faculty',
      phone: '',
      department_id: '',
      designation: '',
      employee_id: ''
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'faculty': return <BadgeCheck className="w-4 h-4 text-blue-400" />;
      case 'admin': return <UserCheck className="w-4 h-4 text-purple-400" />;
      default: return <Users className="w-4 h-4 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-400" />
            Faculty & Staff Directory
          </h1>
          <p className="text-blue-200/50 mt-1">Manage personnel records and academic roles</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Onboard New Staff
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="premium-field w-full pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'faculty', 'staff', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl capitalize transition-all ${
                roleFilter === r ? 'bg-white/10 text-white border border-white/20' : 'text-blue-200/40 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((s) => (
            <div key={s.id} className="glass p-6 rounded-3xl border-white/5 group hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl font-bold text-blue-400">
                  {s.name.charAt(0)}
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  s.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {getRoleIcon(s.role)}
                  {s.role}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1 truncate">{s.name}</h3>
              <p className="text-blue-200/40 text-sm mb-4 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {s.designation} • {s.department_name}
              </p>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-blue-200/60">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-200/60">
                  <Phone className="w-4 h-4" />
                  {s.phone || 'No phone set'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 glass p-20 text-center rounded-3xl">
            <Search className="w-16 h-16 text-blue-400/20 mx-auto mb-4" />
            <p className="text-blue-200/30 text-lg">No staff members found matching your search</p>
          </div>
        )}
      </div>

      {/* Onboard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl p-8 rounded-3xl border-white/10 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Onboard New Personnel</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="space-y-1 col-span-2">
                <label className="text-xs text-blue-200/50">Full Name</label>
                <input
                  type="text"
                  className="premium-field w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Email Address</label>
                <input
                  type="email"
                  className="premium-field w-full"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Phone Number</label>
                <input
                  type="tel"
                  className="premium-field w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">System Role</label>
                <select
                  className="premium-field w-full"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="faculty">Faculty</option>
                  <option value="staff">Non-Teaching Staff</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Employee ID</label>
                <input
                  type="text"
                  className="premium-field w-full"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                />
              </div>

              {formData.role === 'faculty' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-blue-200/50">Department</label>
                    <select
                      className="premium-field w-full"
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-blue-200/50">Designation</label>
                    <input
                      type="text"
                      className="premium-field w-full"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      placeholder="e.g. Asst. Professor"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-8 col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-blue-200/50 hover:text-white transition-all">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg">
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Toasts */}
      {success && (
        <div className="fixed bottom-6 right-6 glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-200">{success}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 glass bg-red-500/10 border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
          <XCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-200">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Staff;
