import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Stats and Metadata
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    course_id: '',
    subject_id: '',
    faculty_id: '',
    semester: '1',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room_no: '',
    academic_year: '2024-25'
  });

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/timetable/data');
      if (response.data.success) {
        setTimetable(response.data.timetable);
        setDays(response.data.days);
        if (response.data.days.length > 0 && !activeTab) {
          setActiveTab(response.data.days[0]);
        }
      }
    } catch (err) {
      setError('Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [coursesRes, subjectsRes, facultyRes] = await Promise.all([
        axios.get('/api/courses/data'),
        axios.get('/api/subjects/data'),
        axios.get('/api/faculty/data')
      ]);
      
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.subjects);
      if (facultyRes.data.success) setFaculty(facultyRes.data.faculty);
    } catch (err) {
      console.error('Metadata fetch failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingEntry) {
        response = await axios.post(`/api/timetable/edit/${editingEntry.id}`, formData);
      } else {
        response = await axios.post('/api/timetable/add', formData);
      }

      if (response.data.success) {
        setSuccess(editingEntry ? 'Entry updated successfully' : 'Entry added successfully');
        setShowAddModal(false);
        setEditingEntry(null);
        resetForm();
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    try {
      const response = await axios.post(`/api/timetable/delete/${id}`);
      if (response.data.success) {
        setSuccess('Entry deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      subject_id: '',
      faculty_id: '',
      semester: '1',
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      room_no: '',
      academic_year: '2024-25'
    });
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormData({
      course_id: entry.course_id,
      subject_id: entry.subject_id,
      faculty_id: entry.faculty_id,
      semester: entry.semester,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      room_no: entry.room_no,
      academic_year: entry.academic_year
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-400" />
            Academic Timetable
          </h1>
          <p className="text-blue-200/70 mt-1">Manage weekly class schedules and faculty allocations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { resetForm(); setEditingEntry(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="glass bg-red-500/10 border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">×</button>
        </div>
      )}
      {success && (
        <div className="glass bg-green-500/10 border-green-500/20 p-4 rounded-xl flex items-center gap-3 text-green-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveTab(day)}
            className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
              activeTab === day 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'glass text-blue-200 hover:bg-white/10'
            }`}
          >
            {day}
          </button>
        )}
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 gap-4">
        {timetable[activeTab]?.length > 0 ? (
          timetable[activeTab].map((slot) => (
            <div key={slot.id} className="glass p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex flex-col items-center justify-center text-blue-400">
                  <Clock className="w-5 h-5" />
                  <span className="text-xs font-bold mt-1">{slot.start_time}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{slot.subject_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-blue-200/60">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {slot.faculty_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {slot.course_name} (Sem {slot.semester})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Room {slot.room_no}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(slot)}
                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(slot.id)}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass p-12 text-center rounded-3xl">
            <Calendar className="w-12 h-12 text-blue-400/20 mx-auto mb-4" />
            <p className="text-blue-200/50">No classes scheduled for {activeTab}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingEntry ? 'Update Class Slot' : 'Schedule New Class'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-blue-200/50 hover:text-white"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Course</label>
                  <select
                    className="premium-field w-full"
                    value={formData.course_id}
                    onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Subject</label>
                  <select
                    className="premium-field w-full"
                    value={formData.subject_id}
                    onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects
                      .filter(s => s.course_id === formData.course_id)
                      .map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Faculty</label>
                  <select
                    className="premium-field w-full"
                    value={formData.faculty_id}
                    onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Semester</label>
                  <select
                    className="premium-field w-full"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Day</label>
                  <select
                    className="premium-field w-full"
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Room Number</label>
                  <input
                    type="text"
                    className="premium-field w-full"
                    value={formData.room_no}
                    onChange={(e) => setFormData({...formData, room_no: e.target.value})}
                    placeholder="e.g. LAB-101"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Start Time</label>
                  <input
                    type="time"
                    className="premium-field w-full"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">End Time</label>
                  <input
                    type="time"
                    className="premium-field w-full"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 rounded-xl text-blue-200 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40"
                >
                  {editingEntry ? 'Update Entry' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
