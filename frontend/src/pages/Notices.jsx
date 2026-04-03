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
  Flag
} from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // UI State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('All');
  
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
      setError('Failed to fetch notices');
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
        setSuccess(editingId ? 'Notice updated' : 'Notice posted');
        setShowModal(false);
        resetForm();
        fetchNotices();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice permanently?')) return;
    try {
      const response = await axios.post(`/api/notices/delete/${id}`);
      if (response.data.success) {
        setSuccess('Notice deleted');
        fetchNotices();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Delete failed');
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

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredNotices = notices.filter(n => filter === 'All' || n.type === filter);

  return (
    <div className="p-6 space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-400" />
            Notices & Bulletin
          </h1>
          <p className="text-blue-200/50 mt-1">Broadcast important announcements to the campus</p>
        </div>
        
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'General', 'Academic', 'Exam', 'Placement', 'Event'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              filter === f ? 'bg-white/10 text-white border border-white/20' : 'text-blue-200/40 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((n) => (
            <div key={n.id} className="glass p-6 rounded-3xl border-white/5 relative group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(n.priority)}`}>
                  {n.priority}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(n)} className="p-2 hover:bg-white/5 rounded-lg text-blue-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(n.id)} className="p-2 hover:bg-white/5 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{n.title}</h3>
              <p className="text-blue-200/60 text-sm leading-relaxed mb-6 line-clamp-3">{n.content}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200/30">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {n.posted_by_name}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(n.posted_date?.seconds * 1000).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Flag className="w-3.5 h-3.5" />
                  To: {n.target_audience}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 glass p-20 text-center rounded-3xl">
            <Megaphone className="w-16 h-16 text-blue-400/20 mx-auto mb-4" />
            <p className="text-blue-200/30 text-lg">No notices found for this category</p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="glass w-full max-w-xl p-8 rounded-3xl border-white/10 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Announcement' : 'Post Announcement'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Notice Title</label>
                <input
                  type="text"
                  className="premium-field w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Summarize the announcement"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/50">Category</label>
                  <select
                    className="premium-field w-full"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Placement">Placement</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/50">Priority</label>
                  <select
                    className="premium-field w-full"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-blue-200/50">Content</label>
                <textarea
                  className="premium-field w-full h-32 resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Describe the notice in detail..."
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/50">Target Audience</label>
                  <select
                    className="premium-field w-full"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  >
                    <option value="All">Everyone</option>
                    <option value="Students">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/50">Expiry Date</label>
                  <input
                    type="date"
                    className="premium-field w-full"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-blue-200/50 hover:text-white transition-all">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg">
                  {editingId ? 'Update Notice' : 'Post Now'}
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
    </div>
  );
};

export default Notices;
