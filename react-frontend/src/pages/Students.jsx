import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../firebase';
import { 
  collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { 
  Users, Search, GraduationCap, BookMarked, UserPlus, Trash2, Edit3, 
  History, ShieldCheck, Mail, PhoneCall, CreditCard, UserCheck, 
  Calendar, MapPin, X, ChevronRight, Filter
} from 'lucide-react';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterCrs, setFilterCrs] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '', email: '', roll_no: '', course_id: '',
    phone: '', dob: '', address: '',
    enrollment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const crsRes = await axios.get('/api/courses/data');
      if (crsRes.data.success) setCourses(crsRes.data.courses);

      const q = query(collection(db, 'students'));
      const querySnapshot = await getDocs(q);
      const studentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (studentData.length === 0) {
        const stdRes = await axios.get('/api/students/data');
        if (stdRes.data.success) setStudents(stdRes.data.students);
      } else {
        setStudents(studentData);
      }
    } catch (err) {
      console.error('Data sync failed, attempting recovery protocol...');
      const stdRes = await axios.get('/api/students/data').catch(() => ({ data: { success: false } }));
      if (stdRes.data.success) setStudents(stdRes.data.students);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'Active'
      });
      await axios.post('/api/students/add', formData).catch(() => {});
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (err) {
      alert('Admission failed: Database synchronization error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm deletion of academic record?')) return;
    try {
      await deleteDoc(doc(db, 'students', id)).catch(async () => {
        await axios.post(`/api/students/delete/${id}`);
      });
      fetchData();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', roll_no: '', course_id: '',
      phone: '', dob: '', address: '',
      enrollment_date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredStudents = students.filter(s => 
    (filterCrs === 'All' || s.course_id === filterCrs) &&
    ((s.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
     (s.roll_no?.toLowerCase() || '').includes(search.toLowerCase()))
  );

  return (
    <div className="students-root">
      
      {/* ── Header ── */}
      <div className="students-header">
        <div className="students-header-meta">
          <div className="header-icon-box">
            <Users size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Student Registry</h1>
            <p className="header-location">
              <UserCheck size={16} />
              Administrative Academic Management Portal
            </p>
          </div>
        </div>
        
        <button onClick={() => { resetForm(); setShowModal(true); }} className="admission-btn">
          <UserPlus size={18} />
          Initialise Admission
        </button>
      </div>

      {/* ── Analytics ── */}
      <div className="analytics-grid">
        {[
          { label: 'Total Enrolled', val: students.length, icon: Users, color: 'primary' },
          { label: 'Academic Streams', val: courses.length, icon: BookMarked, color: 'accent' },
          { label: 'System Uptime', val: '100%', icon: History, color: 'primary' },
          { label: 'Data Security', val: 'Verified', icon: ShieldCheck, color: 'accent' }
        ].map((stat, i) => (
          <div key={i} className="analytic-card">
            <div className="analytic-icon-box">
              <stat.icon size={20} className="text-primary" />
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stat.val}</h3>
            <div className="stat-desc-box">
              Status: Operational Node
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="filter-terminal">
        <div className="search-input-wrapper">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search student credentials..." 
            className="search-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {['All', ...Array.from(new Set(courses.map(c => c.id))).slice(0, 3)].map(c_id => (
            <button 
              key={c_id}
              onClick={() => setFilterCrs(c_id)}
              className={`filter-pill ${filterCrs === c_id ? 'active' : ''}`}
            >
              {c_id === 'All' ? 'Universal' : courses.find(c => c.id === c_id)?.name.split(' ')[0]}
            </button>
          ))}
          <button className="filter-pill"><Filter size={14} /></button>
        </div>
      </div>

      {/* ── Roster Table ── */}
      <div className="roster-table-container">
        <div className="overflow-x-auto">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Institutional Identity</th>
                <th>Credential Hash</th>
                <th>Academic Domain</th>
                <th className="text-right">Administrative Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-32">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 animate-pulse">Synchronising Database Matrix...</p>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="entity-cell">
                        <div className="entity-avatar">{s.name.charAt(0)}</div>
                        <div>
                          <p className="text-base font-bold text-white">{s.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <Mail size={12} className="opacity-40" />
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="roll-no-badge">{s.roll_no}</span>
                    </td>
                    <td>
                      <div className="entity-cell">
                        <GraduationCap size={18} className="text-primary opacity-40" />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {courses.find(c => c.id === s.course_id)?.name || 'General Entry'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-controls">
                        <button className="control-btn"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="control-btn delete"><Trash2 size={16} /></button>
                        <button className="control-btn"><ChevronRight size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-32 opacity-20">
                    <Users size={64} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No matching records available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Admission Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-12">
              <div className="students-header-meta">
                <div className="header-icon-box">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Provision Entity</h2>
                  <p className="text-primary text-[10px] uppercase font-bold tracking-widest mt-1">Student Node Identification</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="control-btn"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRegister} className="form-grid">
              <div className="input-field-group">
                <label className="input-label">Identity Designation</label>
                <input 
                  className="input-control" type="text" placeholder="Full Legal Identity" required
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Relay Email</label>
                <input 
                  className="input-control" type="email" placeholder="Institutional Relay" required
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Credential Hash (Roll No)</label>
                <input 
                  className="input-control" type="text" placeholder="Roll Identity" required
                  value={formData.roll_no} onChange={(e) => setFormData({...formData, roll_no: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Academic Domain</label>
                <select 
                  className="input-control" required
                  value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                >
                  <option value="">Select Department...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-field-group">
                <label className="input-label">Audio-Vocal Link</label>
                <input 
                  className="input-control" type="text" placeholder="+XX XXXX XXXXX"
                  value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Origin Epoch (DOB)</label>
                <input 
                  className="input-control" type="date" required
                  value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="input-field-group col-span-2">
                <label className="input-label">Habitat Coordinates</label>
                <textarea 
                  className="input-control" rows="3" placeholder="Permanent Residence Vector"
                  value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-8 pt-8 border-t border-white/5">
                <button type="submit" className="admission-btn">Validate & Commit Identity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
