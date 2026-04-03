import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  History, 
  DollarSign, 
  Filter, 
  MoreVertical, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  Globe,
  Wallet,
  Receipt,
  FileText,
  Activity,
  Zap,
  ChevronRight,
  User,
  Layers,
  Banknote
} from 'lucide-react';

const Fees = ({ currentUser }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFee, setShowAddFee] = useState(false);
  const [students, setStudents] = useState([]);
  
  const [feeForm, setFeeForm] = useState({
    student_id: '', fee_type: 'Tuition Fee', amount: '',
    due_date: new Date().toISOString().split('T')[0], 
    academic_year: '2024-25', semester: '1', remarks: ''
  });

  useEffect(() => {
    fetchFees();
    if (currentUser?.role === 'admin') {
      fetchStudents();
    }
  }, [currentUser]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/fees/data');
      if (response.data.success) setFees(response.data.fees);
    } catch (err) { console.error('Financial sync failed'); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students/data');
      if (response.data.success) setStudents(response.data.students);
    } catch (err) { console.error('Identity sync failed'); }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/fees/add', feeForm);
      if (response.data.success) {
        setShowAddFee(false);
        fetchFees();
        setFeeForm({ ...feeForm, student_id: '', amount: '' });
      }
    } catch (err) { alert('Invoice generation failure'); }
  };

  const markPaid = async (feeId) => {
    const method = prompt("Enter Payment Protocol (Online/UPI/Bank/Digital Cash):", "Online");
    const tid = prompt("Enter Temporal Transaction ID:", "");
    if (!method) return;

    try {
      const response = await axios.post(`/api/fees/pay/${feeId}`, {
        payment_method: method,
        transaction_id: tid
      });
      if (response.data.success) {
        fetchFees();
      }
    } catch (err) { alert('Transaction persistence failure'); }
  };

  const totalDues = fees.filter(f => f.status === 'Pending').reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalReceived = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + (f.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Wallet className="w-8 h-8 text-indigo-440 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic">FISCAL TERMINAL</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Institutional liquidity matrix and billing analytics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-4 rounded-xl bg-glass-bg border border-glass-border text-text-muted hover:text-white hover:border-indigo-500/30 transition-all">
            <Download className="w-5 h-5" />
          </button>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={() => setShowAddFee(!showAddFee)}
              className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform"
            >
              {showAddFee ? <History className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
              <span className="font-black tracking-[0.1em] text-[10px]">
                {showAddFee ? 'ABORT PROTOCOL' : 'INITIALIZE INVOICE'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Fiscal Matrix Stats */}
      {!showAddFee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Cumulative Yield', val: `₹${totalReceived.toLocaleString()}`, icon: TrendingUp, color: 'emerald', detail: '+12.4% vs Prev' },
            { label: 'Pending Dues', val: `₹${totalDues.toLocaleString()}`, icon: AlertCircle, color: 'rose', detail: 'Critical Threshold' },
            { label: 'Compliance Index', val: '94.2%', icon: ShieldCheck, color: 'indigo', detail: 'Risk Level: Min' },
            { label: 'Sync Invoices', val: fees.length, icon: FileText, color: 'amber', detail: 'Ledger: Active' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 group hover:translate-y-[-4px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-[8px] font-black text-text-muted uppercase tracking-widest">
                  Real-time
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-text-main group-hover:text-indigo-400 transition-colors tracking-tight italic">
                   {stat.val}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-1 h-1 rounded-full bg-${stat.color}-400 animate-pulse`}></div>
                  <span className={`text-[10px] font-bold text-${stat.color}-400/80 italic`}>{stat.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Persistence Interface */}
      <div className="animate-fade-in relative">
        {showAddFee ? (
          <div className="glass-card p-8 md:p-12 border-2 border-indigo-500/20 animate-scale-in">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black italic text-gradient-primary flex items-center gap-4">
                 <Plus className="w-8 h-8 text-indigo-400" />
                 INVOICE GENERATION PROTOCOL
              </h2>
              <div className="hidden md:flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400/40">
                  <ShieldCheck className="w-4 h-4" /> SECURE SESSION
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted/40">
                  <Globe className="w-4 h-4" /> V2.4-STABLE
                </div>
              </div>
            </div>

            <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-3 col-span-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <User className="w-3 h-3 text-indigo-400" /> Target Personnel Entity
                  </label>
                  <div className="input-group-glass">
                    <select value={feeForm.student_id} onChange={e => setFeeForm({...feeForm, student_id: e.target.value})} required>
                      <option value="">Select Personnel...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} - {s.roll_no}</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Layers className="w-3 h-3 text-indigo-400" /> Protocol Sector
                  </label>
                  <div className="input-group-glass">
                    <select value={feeForm.fee_type} onChange={e => setFeeForm({...feeForm, fee_type: e.target.value})}>
                        <option value="Tuition Fee">Tuition Portal</option>
                        <option value="Exam Fee">Assessment Entry</option>
                        <option value="Hostel Fee">Spatial Occupancy</option>
                        <option value="Library Fee">Knowledge Access</option>
                        <option value="Fine">Non-Compliance Fine</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Banknote className="w-3 h-3 text-indigo-400" /> Fiscal Intensity (₹)
                  </label>
                  <div className="input-group-glass">
                    <input type="number" value={feeForm.amount} onChange={e => setFeeForm({...feeForm, amount: e.target.value})} placeholder="X.XXX.XX" required />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-indigo-400" /> Terminal Point
                  </label>
                  <div className="input-group-glass">
                    <input type="date" value={feeForm.due_date} onChange={e => setFeeForm({...feeForm, due_date: e.target.value})} required />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-indigo-400" /> Academic Sector
                  </label>
                  <div className="input-group-glass">
                    <input value={feeForm.academic_year} onChange={e => setFeeForm({...feeForm, academic_year: e.target.value})} placeholder="20XX-XX" />
                  </div>
               </div>

               <div className="col-span-1 md:col-span-3 flex justify-end gap-6 mt-12 pt-8 border-t border-glass-border">
                  <button type="button" onClick={() => setShowAddFee(false)} className="px-8 py-3 text-text-muted/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">TERMINAL ABORT</button>
                  <button type="submit" className="btn-premium px-16 py-4 rounded-2xl flex items-center gap-4 group">
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-black tracking-[0.1em] text-xs">COMMIT INVOICE</span>
                  </button>
               </div>
            </form>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
               <table className="premium-table">
                  <thead>
                     <tr>
                        <th>Personnel Entity</th>
                        <th>Sector Type</th>
                        <th>Fiscal Value</th>
                        <th>Terminal Point</th>
                        <th>Compliance Index</th>
                        <th>Deployment</th>
                     </tr>
                  </thead>
                  <tbody>
                     {fees.length > 0 ? fees.map(fee => (
                        <tr key={fee.id} className="group">
                           <td>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                  {fee.student_name?.charAt(0) || '?'}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-black text-text-main group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm italic">{fee.student_name}</p>
                                  <p className="text-[9px] font-bold text-text-muted tracking-[0.2em] uppercase">{fee.reg_no}</p>
                                </div>
                              </div>
                           </td>
                           <td>
                              <span className="px-3 py-1 rounded-lg bg-glass-bg text-text-muted text-[9px] font-black uppercase tracking-widest border border-glass-border group-hover:border-indigo-500/30 transition-all">
                                 {fee.fee_type}
                              </span>
                           </td>
                           <td>
                             <div className="flex items-center gap-1.5">
                                <span className="text-text-muted text-[10px] font-black opacity-30 mt-1">₹</span>
                                <span className="text-lg font-black text-text-main group-hover:text-emerald-400 transition-colors tracking-tighter italic">
                                  {fee.amount?.toLocaleString()}
                                </span>
                             </div>
                           </td>
                           <td>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-text-muted italic opacity-40 uppercase tracking-widest mb-0.5">Deadline</span>
                                <span className="text-[11px] font-bold text-text-main tracking-tight uppercase">{fee.due_date}</span>
                             </div>
                           </td>
                           <td>
                              <div className={`px-4 py-1.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                fee.status === 'Paid' 
                                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                  : 'bg-rose-500/5 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                              }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${fee.status === 'Paid' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></div>
                                 <span className="text-[9px] font-black uppercase tracking-widest italic">
                                    {fee.status === 'Paid' ? 'VERIFIED' : 'PENDING'}
                                 </span>
                              </div>
                           </td>
                           <td>
                              {fee.status === 'Pending' && currentUser?.role === 'admin' ? (
                                <button 
                                  onClick={() => markPaid(fee.id)} 
                                  className="btn-premium py-2.5 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                                >
                                   EXECUTE SYNC <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                 <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400/40 pl-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400/60" /> IMMUTABLE
                                 </div>
                              )}
                           </td>
                        </tr>
                     )) : (
                        <tr><td colSpan="6" className="py-48 text-center text-text-muted opacity-30 italic font-bold tracking-widest uppercase">No Fiscal Vectors Detected In Persistence Hub</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;
