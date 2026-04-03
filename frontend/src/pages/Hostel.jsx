import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Home, 
  Users, 
  DoorOpen, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  MapPin, 
  Phone, 
  Mail,
  UserPlus,
  LogOut,
  LayoutGrid,
  Info
} from 'lucide-react';

const Hostel = () => {
  const [data, setData] = useState({
    stats: {},
    rooms: [],
    hostels: [],
    allocations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // UI State
  const [view, setView] = useState('inventory'); // 'inventory' or 'allocations'
  const [showAddHostel, setShowAddHostel] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  
  // Form States
  const [hostelForm, setHostelForm] = useState({
    name: '',
    type: 'Boys',
    total_rooms: '',
    capacity_per_room: '1',
    address: '',
    phone: '',
    email: ''
  });

  const [allocForm, setAllocForm] = useState({
    student_id: '',
    hostel_id: '',
    room_no: '',
    bed_no: ''
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/hostel/data');
      if (response.data.success) {
        setData(response.data);
      }
    } catch (err) {
      setError('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Re-using students endpoint if exists or general data
      const response = await axios.get('/api/students/data');
      if (response.data.success) {
        // Filter out already allocated
        const allocatedIds = new Set(data.allocations.map(a => a.student_id));
        setStudents(response.data.students.filter(s => !allocatedIds.has(s.id)));
      }
    } catch (err) {
      console.error('Student fetch failed');
    }
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/hostel/add', hostelForm);
      if (response.data.success) {
        setSuccess('Hostel added successfully');
        setShowAddHostel(false);
        setHostelForm({
          name: '', type: 'Boys', total_rooms: '', 
          capacity_per_room: '1', address: '', phone: '', email: ''
        });
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hostel');
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/hostel/allocate', allocForm);
      if (response.data.success) {
        setSuccess('Room allocated successfully');
        setShowAllocateModal(false);
        setAllocForm({ student_id: '', hostel_id: '', room_no: '', bed_no: '' });
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Allocation failed');
    }
  };

  const handleVacate = async (id) => {
    if (!window.confirm('Are you sure you want to vacate this student?')) return;
    try {
      const response = await axios.post(`/api/hostel/vacate/${id}`);
      if (response.data.success) {
        setSuccess('Room vacated successfully');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Vacate operation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-400" />
            Hostel Management
          </h1>
          <p className="text-blue-200/70 mt-1">Manage residency, room allocations and blocks</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchStudents(); setShowAllocateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 glass text-blue-200 hover:bg-white/10 rounded-xl transition-all"
          >
            <UserPlus className="w-4 h-4" />
            New Allocation
          </button>
          <button 
            onClick={() => setShowAddHostel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40"
          >
            <Plus className="w-4 h-4" />
            Add Hostel Block
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Rooms', value: data.stats.total_rooms, icon: DoorOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Occupied', value: data.stats.occupied_rooms, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Available', value: data.stats.available_rooms, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Residents', value: data.stats.total_students, icon: LayoutGrid, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-200/50">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 glass rounded-xl w-fit">
        <button 
          onClick={() => setView('inventory')}
          className={`px-4 py-2 rounded-lg transition-all ${view === 'inventory' ? 'bg-white/10 text-white' : 'text-blue-200/60 hover:text-white'}`}
        >
          Room Inventory
        </button>
        <button 
          onClick={() => setView('allocations')}
          className={`px-4 py-2 rounded-lg transition-all ${view === 'allocations' ? 'bg-white/10 text-white' : 'text-blue-200/60 hover:text-white'}`}
        >
          Active Allocations
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {view === 'inventory' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.rooms.map((room, idx) => (
              <div key={idx} className="glass p-5 rounded-2xl hover:bg-white/5 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 font-bold text-lg">
                    {room.room_number}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${room.available > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {room.available > 0 ? `${room.available} Bed Free` : 'Full'}
                  </span>
                </div>
                <h4 className="font-semibold text-white">{room.block_name}</h4>
                <p className="text-xs text-blue-200/40 mb-3">{room.room_type} Room • Capacity: {room.capacity}</p>
                
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  {room.students.length > 0 ? (
                    room.students.map((s, sidx) => (
                      <div key={sidx} className="flex justify-between items-center text-xs">
                        <span className="text-blue-200/60">{s.student_name}</span>
                        <span className="text-blue-200/30">{s.reg_no}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-blue-200/20 italic">No occupants</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-2xl border-white/10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-blue-200 uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Hostel & Room</th>
                  <th className="px-6 py-4">Allocated Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.allocations.map((alloc) => (
                  <tr key={alloc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
                          {alloc.student_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{alloc.student_name}</p>
                          <p className="text-xs text-blue-200/40">{alloc.reg_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-blue-200">{alloc.hostel_name || 'Hostel'}</p>
                      <p className="text-xs text-blue-200/40">Room {alloc.room_no} (Bed {alloc.bed_no})</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-blue-200/60">{alloc.allocation_date}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleVacate(alloc.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Vacate Room"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Hostel Modal */}
      {showAddHostel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass w-full max-w-md p-8 rounded-3xl border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Home className="w-6 h-6 text-blue-400" />
                Add Hostel
              </h2>
              <button onClick={() => setShowAddHostel(false)} className="text-blue-200/50 hover:text-white">×</button>
            </div>

            <form onSubmit={handleAddHostel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-blue-200/60 ml-1">Hostel Name</label>
                <input
                  type="text"
                  className="premium-field w-full"
                  value={hostelForm.name}
                  onChange={(e) => setHostelForm({...hostelForm, name: e.target.value})}
                  placeholder="e.g. Newton House"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/60 ml-1">Type</label>
                  <select
                    className="premium-field w-full"
                    value={hostelForm.type}
                    onChange={(e) => setHostelForm({...hostelForm, type: e.target.value})}
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/60 ml-1">Total Rooms</label>
                  <input
                    type="number"
                    className="premium-field w-full"
                    value={hostelForm.total_rooms}
                    onChange={(e) => setHostelForm({...hostelForm, total_rooms: e.target.value})}
                    placeholder="20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-200/60 ml-1">Capacity Per Room</label>
                <input
                  type="number"
                  className="premium-field w-full"
                  value={hostelForm.capacity_per_room}
                  onChange={(e) => setHostelForm({...hostelForm, capacity_per_room: e.target.value})}
                  defaultValue="1"
                />
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                Create Hostel Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Room Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass w-full max-w-lg p-8 rounded-3xl border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Room Allocation</h2>
              <button onClick={() => setShowAllocateModal(false)} className="text-blue-200/50 hover:text-white">×</button>
            </div>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-blue-200/60 ml-1">Select Student</label>
                <select
                  className="premium-field w-full"
                  value={allocForm.student_id}
                  onChange={(e) => setAllocForm({...allocForm, student_id: e.target.value})}
                  required
                >
                  <option value="">Unallocated Students</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reg_no})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/60 ml-1">Hostel</label>
                  <select
                    className="premium-field w-full"
                    value={allocForm.hostel_id}
                    onChange={(e) => setAllocForm({...allocForm, hostel_id: e.target.value})}
                    required
                  >
                    <option value="">Select Hostel</option>
                    {data.hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-200/60 ml-1">Room No</label>
                  <input
                    type="number"
                    className="premium-field w-full"
                    value={allocForm.room_no}
                    onChange={(e) => setAllocForm({...allocForm, room_no: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all">
                Confirm Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div className="fixed bottom-6 right-6 glass bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-200 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
};

export default Hostel;
