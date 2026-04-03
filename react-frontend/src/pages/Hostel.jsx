import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building, 
  Home, 
  UserPlus, 
  Users, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  History, 
  Layout, 
  MapPin, 
  Search, 
  Filter, 
  MoreVertical, 
  Bed, 
  Zap, 
  DoorOpen,
  ArrowUpRight,
  Shield,
  Activity,
  Cpu,
  Database,
  ChevronRight
} from 'lucide-react';

const Hostel = ({ currentUser }) => {
  const [rooms, setRooms] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('inventory'); // 'inventory' or 'registrations'
  
  // Registration Form
  const [formData, setFormData] = useState({
    student_id: '',
    room_id: '',
    check_in_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, regRes, stdRes] = await Promise.all([
        axios.get('/api/hostel/data'),
        axios.get('/api/hostel/registrations'),
        axios.get('/api/students/data')
      ]);
      
      if (roomRes.data.success) setRooms(roomRes.data.rooms);
      if (regRes.data.success) setRegistrations(regRes.data.registrations);
      if (stdRes.data.success) setStudents(stdRes.data.students);
      
    } catch (err) {
      console.error('Neural link synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/hostel/register', formData);
      if (res.data.success) {
        setShowModal(false);
        fetchData();
        setFormData({ student_id: '', room_id: '', check_in_date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      alert('Allocation failure: Spatial node at max capacity or identity already allocated');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('De-allocate identity from this spatial node?')) return;
    try {
      const res = await axios.post(`/api/hostel/delete/${id}`);
      if (res.data.success) fetchData();
    } catch (err) {}
  };

  const getOccupancy = (roomId) => {
    return registrations.filter(r => r.room_id === roomId).length;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in text-white">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Building className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">RESIDENTIAL COMMAND</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Institutional spatial occupancy management v5.0
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-glass-bg border border-glass-border p-1 rounded-2xl overflow-hidden shadow-lg">
             <button 
                onClick={() => setTab('inventory')} 
                className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
                  tab === 'inventory' 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' 
                    : 'text-text-muted hover:text-white'
                }`}
             >
                Inventory
             </button>
             <button 
                onClick={() => setTab('registrations')} 
                className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
                  tab === 'registrations' 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' 
                    : 'text-text-muted hover:text-white'
                }`}
             >
                Allocation
             </button>
          </div>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform shrink-0 border-amber-500/30"
            >
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span className="font-black tracking-[0.1em] text-[10px]">ALLOCATE SPACE</span>
            </button>
          )}
        </div>
      </div>

      {/* Persistence Analytics - High Fidelity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Capacity', val: rooms.reduce((acc, r) => acc + (r.capacity || 0), 0), icon: Bed, color: 'amber', detail: 'Spatial Units' },
          { label: 'Resource Nodes', val: rooms.length, icon: DoorOpen, color: 'blue', detail: 'Global Chambers' },
          { label: 'Active Occupants', val: registrations.length, icon: Users, color: 'emerald', detail: 'Managed Identities' },
          { label: 'Available Slots', val: rooms.reduce((acc, r) => acc + (r.capacity || 0), 0) - registrations.length, icon: Zap, color: 'purple', detail: 'Residual Space' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col gap-4 group hover:translate-y-[-4px] transition-all overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-${stat.color}-500/10 transition-all`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-4 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <Activity className={`w-4 h-4 text-${stat.color}-400 animate-pulse opacity-40`} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-black text-text-main group-hover:text-amber-400 transition-colors italic tracking-tighter">{stat.val}</p>
                 <p className="text-[9px] font-bold text-text-muted/40 uppercase italic">{stat.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      {tab === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {loading ? (
             Array(8).fill(0).map((_, i) => <div key={i} className="glass-card h-64 animate-pulse opacity-50"></div>)
           ) : rooms.map(room => {
             const occupancy = getOccupancy(room.id);
             const percentage = (occupancy / (room.capacity || 1)) * 100;
             return (
               <div key={room.id} className="glass-card group p-8 hover:translate-y-[-4px] transition-all relative overflow-hidden flex flex-col border-b-4 border-b-amber-500/20 hover:border-b-amber-500">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-700">
                    <Home className="w-24 h-24" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-10 relative z-10">
                     <div className="px-5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner group-hover:shadow-amber-500/20 transition-all">
                        <span className="text-sm font-black text-amber-400 font-mono tracking-tighter">NODE #{room.room_number || 'X'}</span>
                     </div>
                     <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                        percentage >= 100 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                     }`}>
                        {room.type || 'LUX-GEN'}
                     </div>
                  </div>

                  <div className="space-y-4 mb-10 relative z-10">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                           <Activity className="w-3 h-3 text-amber-400" /> OCCUPANCY GRADIENT
                        </p>
                        <span className="text-sm font-black text-text-main italic tracking-tighter">{occupancy} <span className="text-text-muted/40 font-bold uppercase text-[10px]">/ {room.capacity}</span></span>
                     </div>
                     <div className="h-2.5 bg-glass-bg border border-glass-border rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                              percentage >= 90 ? 'bg-rose-500 animate-pulse' : percentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                           }`} 
                           style={{ width: `${percentage}%` }}
                        ></div>
                     </div>
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-glass-border mt-auto relative z-10">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.2em]">GEOSPATIAL INDEX</span>
                        <span className="text-xs font-black text-text-main flex items-center gap-2 uppercase italic tracking-tight">
                           <MapPin className="w-3.5 h-3.5 text-rose-400" /> FLOOR-0{room.floor || '1'}
                        </span>
                     </div>
                     <div className={`flex flex-col items-end`}>
                        <span className="text-[8px] font-black text-text-muted/40 uppercase tracking-[0.2em]">STATUS</span>
                        <span className={`text-xs font-black uppercase tracking-widest italic ${percentage >= 100 ? 'text-rose-400' : 'text-emerald-400 text-glow-emerald'}`}>
                           {percentage >= 100 ? 'STATION SATURATED' : 'AVAILABLE NODE'}
                        </span>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="glass-card p-0 overflow-hidden border-amber-500/10 shadow-2xl animate-fade-in relative">
           <div className="p-8 border-b border-glass-border flex justify-between items-center bg-glass-bg/30">
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-gradient-primary">Allocation Matrix Ledger</h3>
              <div className="flex gap-4">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/40 group-focus-within:text-amber-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Filter by roll no..." 
                      className="bg-background/50 border border-glass-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-64 focus:border-amber-500/50 outline-none transition-all"
                    />
                 </div>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="premium-table">
                <thead>
                   <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-text-muted tracking-[0.25em]">Managed Identity</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-text-muted tracking-[0.25em]">Spatial Hub</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-text-muted tracking-[0.25em]">Entry Vector</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-text-muted tracking-[0.25em]">Security Protocol</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase text-text-muted tracking-[0.25em] text-right">Operations</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                   {registrations.length > 0 ? registrations.map(reg => {
                     const std = students.find(s => s.id === reg.student_id);
                     const rm = rooms.find(r => r.id === reg.room_id);
                     return (
                        <tr key={reg.id} className="hover:bg-amber-500/5 transition-all group">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center font-black text-2xl text-amber-400 ring-1 ring-amber-500/20 group-hover:rotate-12 transition-all shadow-lg">
                                    {std?.name.charAt(0) || '?'}
                                 </div>
                                 <div>
                                    <p className="font-black text-text-main text-lg tracking-tight uppercase italic group-hover:text-amber-400 transition-colors">{std?.name || 'IDENTITY UNKNOWN'}</p>
                                    <p className="text-[10px] uppercase font-black text-text-muted/40 tracking-[0.2em] mt-1">ROLL: {std?.roll_no || '---'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <Home className="w-4 h-4" />
                                 </div>
                                 <span className="font-black text-text-main uppercase font-mono italic tracking-tighter">ROOM #{rm?.room_number || 'NULL'}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    <History className="w-4 h-4" />
                                 </div>
                                 <span className="text-xs font-black text-text-main uppercase font-mono">{reg.check_in_date || '---'}</span>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 flex items-center gap-2 w-fit">
                                 <ShieldCheck className="w-3 h-3" /> VERIFIED ALLOCATION
                              </div>
                           </td>
                           <td className="px-10 py-6 text-right">
                               <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-3 rounded-xl bg-glass-bg border border-glass-border text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all">
                                     <ArrowUpRight className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => handleDelete(reg.id)} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500 transition-all">
                                     <Trash2 className="w-5 h-5" />
                                  </button>
                               </div>
                           </td>
                        </tr>
                     );
                   }) : (
                     <tr>
                        <td colSpan="5" className="py-32 text-center">
                           <div className="flex flex-col items-center opacity-20">
                              <Database className="w-16 h-16 mb-4 text-amber-400" />
                              <p className="text-xl font-black italic uppercase tracking-widest">No Spatial Persistence Discovered</p>
                              <p className="text-sm font-medium mt-1">The allocation ledger is currently depopulated</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Allocation Modal - High Fidelity */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fade-in text-white">
          <div className="glass-card w-full max-w-2xl p-0 overflow-hidden animate-scale-in border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
             <div className="p-10 border-b border-glass-border relative overflow-hidden bg-amber-500/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h2 className="text-3xl font-black italic text-gradient-primary uppercase tracking-tight flex items-center gap-4">
                  <UserPlus className="w-10 h-10 text-amber-400 group-hover:rotate-12 transition-transform" />
                  ALLOCATE SPACE
                </h2>
                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Spatial residence authorization protocol v4.0</p>
             </div>
             
             <form onSubmit={handleRegister} className="p-10 space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black text-amber-400 tracking-[0.2em] flex items-center gap-2">
                     <span className="w-1 h-3 bg-amber-500 rounded-full"></span> OCCUPANT IDENTITY
                   </label>
                   <select 
                      className="input-group-glass w-full h-14 font-bold uppercase" 
                      required 
                      value={formData.student_id} 
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                   >
                      <option value="" className="bg-[#1a1b2a]">SELECT RESIDENT NODE...</option>
                      {students.map(s => <option key={s.id} value={s.id} className="bg-[#1a1b2a]">{s.name} [{s.roll_no}]</option>)}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] flex items-center gap-2">
                     <span className="w-1 h-3 bg-blue-500 rounded-full"></span> TARGET SPATIAL HUB
                   </label>
                   <select 
                      className="input-group-glass w-full h-14 font-bold uppercase font-mono" 
                      required 
                      value={formData.room_id} 
                      onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                   >
                      <option value="" className="bg-[#1a1b2a]">SELECT HUB NODE...</option>
                      {rooms.filter(r => getOccupancy(r.id) < (r.capacity || 1)).map(r => (
                        <option key={r.id} value={r.id} className="bg-[#1a1b2a]">
                          ROOM #{r.room_number?.padEnd(5)} | TYPE: {r.type?.padEnd(10)} | SLOTS: {(r.capacity || 0) - getOccupancy(r.id)}
                        </option>
                      ))}
                   </select>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                     <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> ALLOCATION VECTOR [ENTRY DATE]
                   </label>
                   <input 
                      type="date" 
                      className="input-group-glass w-full h-14 font-black border-indigo-500/20" 
                      required 
                      value={formData.check_in_date} 
                      onChange={(e) => setFormData({...formData, check_in_date: e.target.value})} 
                   />
                </div>

                <div className="flex justify-end gap-6 pt-6 border-t border-glass-border">
                   <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-text-muted hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px]">ABORT OPS</button>
                   <button type="submit" className="btn-premium px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-amber-500/30">
                      INITIALIZE ALLOCATION
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hostel;
