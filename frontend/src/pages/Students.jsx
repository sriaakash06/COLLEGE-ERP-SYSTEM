import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Hash, 
  BookOpen,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Activity,
  Heart,
  User as UserIcon
} from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    reg_no: '',
    roll_no: '',
    course_id: '',
    department_id: '',
    admission_date: '',
    gender: 'Male',
    blood_group: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students/data');
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/students/courses');
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/students/save', formData);
      if (response.data.success) {
        setSuccess('Student admission successful');
        setShowModal(false);
        resetForm();
        fetchStudents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admission failed');
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm student record deletion?')) return;
    try {
      const response = await axios.post(`/api/students/delete/${id}`);
      if (response.data.success) {
        setSuccess('Student records removed');
        fetchStudents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Deletion failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      reg_no: '',
      roll_no: '',
      course_id: '',
      department_id: '',
      admission_date: '',
      gender: 'Male',
      blood_group: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.reg_no.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'All' || s.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            Student Mission Control
          </h1>
          <p className="text-blue-200/50 mt-1">Unified registry and student life-cycle management</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Admission
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/30" />
          <input 
            type="text"
            placeholder="Find students by name or registration number..."
            className="premium-field w-full pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="premium-field"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="All">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Results Table */}
      <div className="glass overflow-hidden rounded-3xl border-white/5 mx-[-1.5rem] md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-200/50">Student Profile</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-200/50">Identifiers</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-200/50">Academic Path</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-blue-200/50">Contact info</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-400 group-hover:scale-110 transition-transform">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{s.name}</p>
                          <p className="text-[10px] text-blue-200/30 uppercase tracking-tighter">{s.gender} • {s.blood_group || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-blue-200/60">
                          <Hash className="w-3.5 h-3.5 text-blue-400" />
                          Reg: {s.reg_no}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-200/60">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          Roll: {s.roll_no}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-white">
                          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                          {s.course_name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-200/30 uppercase">
                          <Calendar className="w-3.5 h-3.5" />
                          Adm: {s.admission_date}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-blue-200/60">
                          <Mail className="w-3.5 h-3.5" />
                          {s.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-200/60">
                          <Phone className="w-3.5 h-3.5" />
                          {s.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-blue-200/20 italic">No student matches found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="glass w-full max-w-2xl p-8 rounded-3xl border-white/10 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">New Student Admission</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 pb-4">
              {/* Personal Info */}
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-blue-200/50">Full Name</label>
                <input type="text" className="premium-field w-full" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="As per official documents" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Email Address</label>
                <input type="email" className="premium-field w-full" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Permanent Mobile</label>
                <input type="tel" className="premium-field w-full" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
              </div>

              {/* Identity Info */}
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Registration Number</label>
                <input type="text" className="premium-field w-full" value={formData.reg_no} onChange={(e) => setFormData({...formData, reg_no: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Class Roll Number</label>
                <input type="text" className="premium-field w-full" value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})} required />
              </div>

              {/* Academic Info */}
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Course Allocation</label>
                <select className="premium-field w-full" value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Admission Date</label>
                <input type="date" className="premium-field w-full" value={formData.admission_date} onChange={(e) => setFormData({...formData, admission_date: e.target.value})} required />
              </div>

              {/* Demographic Info */}
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Gender Identity</label>
                <select className="premium-field w-full" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Blood Group</label>
                <input type="text" className="premium-field w-full" value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value})} placeholder="e.g. O+" />
              </div>

              <div className="flex justify-end gap-3 mt-8 col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-blue-200/50 hover:text-white transition-all">Discard</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg flex items-center gap-2">
                  <UserIcon className="w-4 h-4" /> Finalize Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts */}
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

export default Students;
