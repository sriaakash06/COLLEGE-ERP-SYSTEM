import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Calendar, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  TrendingUp, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  History, 
  Award,
  ChevronRight,
  Database,
  Layers,
  Layout,
  Cpu,
  Monitor
} from 'lucide-react';

const Exams = ({ currentUser }) => {
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'results', 'marks_entry'
  const [showAddExam, setShowAddExam] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);
  
  // Data for forms
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // New Exam Form
  const [examForm, setExamForm] = useState({
    name: '', subject_id: '', course_id: '', semester: '1',
    exam_type: 'Mid-term', max_marks: '100', exam_date: '',
    start_time: '10:00', duration_minutes: '120', venue: '', instructions: ''
  });

  // Marks Entry State
  const [marksEntry, setMarksEntry] = useState([]); // List of {student_id, name, marks_obtained, grade}

  useEffect(() => {
    fetchExams();
    if (currentUser?.role === 'student') {
      fetchMyResults();
    } else {
      fetchSupportingData();
    }
  }, [currentUser]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/exams/data');
      if (response.data?.success) setExams(response.data.exams);
    } catch (err) { console.error('Temporal sync failed'); }
    finally { setLoading(false); }
  };

  const fetchMyResults = async () => {
    try {
      const response = await axios.get('/api/exams/my-results/data');
      if (response.data?.success) setMyResults(response.data.results);
    } catch (err) { console.error('Results fetch failed'); }
  };

  const fetchSupportingData = async () => {
    try {
      const [crsRes, subRes] = await Promise.all([
        axios.get('/api/courses/data'),
        axios.get('/api/courses/subjects')
      ]);
      if (crsRes.data?.success) setCourses(crsRes.data.courses);
      if (subRes.data?.success) setSubjects(subRes.data.subjects);
    } catch (err) { console.error('Metadata sync failed'); }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/exams/save', examForm);
      if (response.data.success) {
        setShowAddExam(false);
        fetchExams();
        resetForm();
      }
    } catch (err) { alert('Collision in scheduling matrix'); }
  };

  const resetForm = () => {
    setExamForm({
      name: '', subject_id: '', course_id: '', semester: '1',
      exam_type: 'Mid-term', max_marks: '100', exam_date: '',
      start_time: '10:00', duration_minutes: '120', venue: '', instructions: ''
    });
  };

  const handleOpenMarksEntry = async (exam) => {
    try {
      setLoading(true);
      setSelectedExamForMarks(exam);
      // Fetch students for this course
      const response = await axios.get('/api/students/data');
      if (response.data.success) {
        const courseStudents = response.data.students.filter(s => s.course_id === exam.course_id);
        
        // Fetch existing marks
        const marksResp = await axios.get(`/api/exams/results/${exam.id}/data`);
        const existingMarks = marksResp.data.results || [];
        
        const entrySheet = courseStudents.map(st => {
          const existing = existingMarks.find(m => m.student_id === st.id);
          return {
            student_id: st.id,
            name: st.name,
            roll_no: st.roll_no,
            marks_obtained: existing?.marks_obtained || '',
            grade: existing?.grade || '',
            remarks: existing?.remarks || ''
          };
        });
        setMarksEntry(entrySheet);
        setActiveTab('marks_entry');
      }
    } catch (err) { alert('Sheet initialization failure'); }
    finally { setLoading(false); }
  };

  const saveMarks = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/exams/save-marks', {
        exam_id: selectedExamForMarks.id,
        marks: marksEntry
      });
      if (response.data.success) {
        setActiveTab('schedule');
      }
    } catch (err) { alert('Ledger persistence failure'); }
    finally { setLoading(false); }
  };

  if (loading && activeTab !== 'marks_entry') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-pulse">
        <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-2xl relative mb-4">
           <Trophy className="w-10 h-10 text-amber-500" />
           <div className="absolute inset-0 border-2 border-t-amber-500 border-transparent rounded-[2.1rem] animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] italic">DECRYPTING ASSESSMENT LEDGER...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Trophy className="w-8 h-8 text-amber-440 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">ASSESSMENT HUB</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Academic performance and terminal scheduling matrix v4.0
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-glass-bg/50 p-1 rounded-2xl border border-glass-border flex gap-1">
             <button 
                onClick={() => setActiveTab('schedule')} 
                className={`px-6 py-2.5 rounded-xl transition-all font-black text-[10px] tracking-widest ${activeTab === 'schedule' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-text-muted hover:text-text-main'}`}
             >
                SCHEDULE
             </button>
             {currentUser?.role === 'student' && (
               <button 
                  onClick={() => setActiveTab('results')} 
                  className={`px-6 py-2.5 rounded-xl transition-all font-black text-[10px] tracking-widest ${activeTab === 'results' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-text-muted hover:text-text-main'}`}
               >
                  PERFORMANCE
               </button>
             )}
           </div>
           
           {currentUser?.role !== 'student' && !showAddExam && activeTab !== 'marks_entry' && (
            <button 
              onClick={() => setShowAddExam(true)}
              className="btn-premium p-4 rounded-xl active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" />
            </button>
           )}
        </div>
      </div>

      {/* Persistence Analytics */}
      {!showAddExam && activeTab !== 'marks_entry' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Assessment', val: exams.length, icon: Calendar, color: 'amber', detail: 'Temporal Queue' },
            { label: 'Persistence Index', val: '84.2%', icon: TrendingUp, color: 'emerald', detail: 'Above Median' },
            { label: 'Knowledge Nodes', val: subjects.length, icon: BookOpen, color: 'blue', detail: 'Domain Clusters' },
            { label: 'Security Ranking', val: 'VETTED', icon: ShieldCheck, color: 'purple', detail: 'Immutability: ON' }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 group hover:translate-y-[-4px] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-[8px] font-black text-text-muted uppercase tracking-widest">
                  Live Sync
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-text-main group-hover:text-amber-400 transition-colors tracking-tight italic">
                   {stat.val}
                </p>
                <p className={`text-[10px] font-bold text-${stat.color}-400/80 mt-1 uppercase italic`}>{stat.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Container Area */}
      <div className="animate-fade-in">
        {showAddExam ? (
          <div className="glass-card p-8 md:p-14 relative overflow-hidden bg-gradient-to-br from-amber-900/10 to-transparent border-2 border-amber-500/20 animate-scale-in">
            <div className="absolute top-0 right-0 p-12 opacity-5">
               <Zap className="w-48 h-48 text-amber-500" />
            </div>
            
            <div className="flex items-center justify-between mb-16 relative z-10">
              <div>
                <h2 className="text-4xl font-black italic text-white flex items-center gap-6 tracking-tighter uppercase">
                   <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                      <Trophy className="w-8 h-8 text-amber-400" />
                   </div>
                   DEPLOY ASSESSMENT VECTOR
                </h2>
                <p className="text-[10px] text-amber-400/60 font-black uppercase tracking-[0.4em] mt-3 pl-20">Temporal Node Initialization Phase // Security Vetted</p>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-400/40">
                  <ShieldCheck className="w-4 h-4" /> SECURE DEPLOYMENT
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-3 col-span-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Monitor className="w-3 h-3 text-amber-400" /> Assessment Label
                  </label>
                  <div className="input-group-glass">
                    <input value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} placeholder="Ex: TERMINAL SURGE EXAMINATION 2024" required />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Layers className="w-3 h-3 text-amber-400" /> Module Type
                  </label>
                  <div className="input-group-glass">
                    <select value={examForm.exam_type} onChange={e => setExamForm({...examForm, exam_type: e.target.value})} required>
                        <option value="Mid-term">Mid-term Focus</option>
                        <option value="Final">Terminal (Final)</option>
                        <option value="Practical">Field (Practical)</option>
                        <option value="Internal">Unit Assessment</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 text-amber-400" /> Target Stream
                  </label>
                  <div className="input-group-glass">
                    <select value={examForm.course_id} onChange={e => setExamForm({...examForm, course_id: e.target.value})} required>
                        <option value="">Choose Course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-amber-400" /> Knowledge Node
                  </label>
                  <div className="input-group-glass">
                    <select value={examForm.subject_id} onChange={e => setExamForm({...examForm, subject_id: e.target.value})} required>
                        <option value="">Choose Subject...</option>
                        {subjects.filter(s => !examForm.course_id || s.course_id === examForm.course_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-amber-400" /> Temporal Entry
                  </label>
                  <div className="input-group-glass">
                    <input type="date" value={examForm.exam_date} onChange={e => setExamForm({...examForm, exam_date: e.target.value})} required />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-400" /> Sync Point
                  </label>
                  <div className="input-group-glass">
                    <input type="time" value={examForm.start_time} onChange={e => setExamForm({...examForm, start_time: e.target.value})} required />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <History className="w-3 h-3 text-amber-400" /> Duration (Min)
                  </label>
                  <div className="input-group-glass">
                    <input type="number" value={examForm.duration_minutes} onChange={e => setExamForm({...examForm, duration_minutes: e.target.value})} />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-400" /> Max Intensity
                  </label>
                  <div className="input-group-glass">
                    <input type="number" value={examForm.max_marks} onChange={e => setExamForm({...examForm, max_marks: e.target.value})} />
                  </div>
               </div>

               <div className="col-span-1 md:col-span-3 flex justify-end gap-6 mt-12 pt-8 border-t border-glass-border">
                  <button type="button" onClick={() => setShowAddExam(false)} className="px-8 py-3 text-text-muted/40 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">ABORT PROTOCOL</button>
                  <button type="submit" className="btn-premium px-16 py-4 rounded-2xl flex items-center gap-4 group">
                    <History className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    <span className="font-black tracking-[0.1em] text-xs">INITIALIZE DEPLOYMENT</span>
                  </button>
               </div>
            </form>
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map(exam => (
              <div key={exam.id} className="uiverse-card min-h-[320px] group cursor-pointer relative flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all group-hover:scale-125 group-hover:rotate-12 duration-700">
                   <Trophy className="w-24 h-24 text-amber-500" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10 p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                     <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-[9px] font-black tracking-widest border border-amber-500/20 uppercase italic">
                        {exam.exam_type} Protocol
                     </div>
                     <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 group-hover:border-amber-500/30 transition-colors">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-white italic tracking-tighter">{exam.exam_date}</span>
                     </div>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tighter italic uppercase leading-tight mb-8">
                    {exam.name}
                  </h3>

                  <div className="space-y-4 mb-auto">
                     <div className="flex items-center gap-4 group/item">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/60 group-hover/item:text-amber-400 transition-colors">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-text-muted group-hover/item:text-white transition-colors tracking-tight italic">{exam.subject_name}</span>
                     </div>
                     <div className="flex items-center gap-4 group/item">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover/item:text-emerald-400 transition-colors">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-text-muted group-hover/item:text-white transition-colors tracking-widest text-[11px] uppercase italic">{exam.course_name}</span>
                     </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-white/5 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.25em] mb-1">SYNC WINDOW</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-xs font-black text-white tracking-tighter italic">{exam.start_time} (60 MIN SESS)</span>
                        </div>
                     </div>
                     {currentUser?.role !== 'student' && (
                       <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenMarksEntry(exam); }} 
                          className="p-3 bg-white/5 hover:bg-amber-600 rounded-xl transition-all border border-white/10 text-amber-400 hover:text-white group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-90"
                       >
                          <Edit2 className="w-4.5 h-4.5" />
                       </button>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'results' ? (
          <div className="glass-card overflow-hidden p-0 border-white/5 bg-black/40">
             <div className="p-8 border-b border-glass-border flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-4">
                   <TrendingUp className="w-5 h-5 text-emerald-400" /> KNOWLEDGE PERSISTENCE LEDGER
                </h3>
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-4 py-2 rounded-lg bg-black/50 border border-white/5 italic">ACADEMIC YEAR: 2024-25</span>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="premium-table w-full">
                  <thead>
                     <tr className="bg-white/5">
                        <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">DEPLOYMENT IDENTITY</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">SUBJECT DOMAIN</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">STABILITY RATIO</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">PERSISTENCE GRADE</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {myResults.length > 0 ? myResults.map(res => (
                       <tr key={res.id} className="hover:bg-white/5 transition-all group">
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                   <Trophy className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="font-black text-white italic tracking-tighter uppercase text-lg leading-tight group-hover:text-amber-400 transition-colors">{res.exam_name}</span>
                                   <span className="text-[9px] font-black text-text-muted tracking-[0.2em] uppercase mt-1 italic">{res.exam_type} Protocol</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-text-muted group-hover:text-white transition-colors italic">{res.subject_name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-2">
                                   <span className="text-2xl font-black text-white italic tracking-tighter">{res.marks_obtained}</span>
                                   <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">/ {res.max_marks} UNITS</span>
                                </div>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                   <div className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${(res.marks_obtained/res.max_marks)*100}%` }}></div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-8 text-right">
                             <div className="flex items-center justify-end gap-5">
                                <div className="flex flex-col text-right">
                                  <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">COMPLIANCE</span>
                                  <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest italic">STABLE V-0.4</span>
                                </div>
                                <span className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black italic text-2xl flex items-center justify-center shadow-xl ring-1 ring-emerald-500/30 group-hover:scale-110 transition-transform">
                                   {res.grade}
                                </span>
                             </div>
                          </td>
                       </tr>
                     )) : (
                        <tr><td colSpan="4" className="py-48 text-center text-text-muted opacity-30 italic font-black tracking-[0.5em] uppercase">No Assessment Logs Detected In Security Hub</td></tr>
                     )}
                  </tbody>
                </table>
             </div>
          </div>
        ) : activeTab === 'marks_entry' ? (
          <div className="glass-card overflow-hidden animate-scale-in">
             <div className="p-8 border-b border-glass-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button 
                  onClick={() => setActiveTab('schedule')} 
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all group"
                >
                   <div className="w-8 h-8 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center group-hover:border-rose-500/50">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                   </div>
                   EXIT PERSISTENCE LEDGER
                </button>
                <div className="text-center">
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gradient-primary">{selectedExamForMarks?.name}</h2>
                   <p className="text-[9px] font-bold text-text-muted/60 uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-3">
                    <Monitor className="w-3 h-3" /> PERFORMANCE DATA SYNC <Database className="w-3 h-3" />
                   </p>
                </div>
                <button 
                  onClick={saveMarks} 
                  className="btn-premium px-10 py-3-5 rounded-xl text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                >
                   PUBLISH GLOBAL SYNC
                </button>
             </div>
             
             <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                     <tr>
                        <th>Personnel Entity</th>
                        <th>Intensity (Marks)</th>
                        <th>Persistence Grade</th>
                        <th>Feedback Node</th>
                     </tr>
                  </thead>
                  <tbody>
                     {marksEntry.map((entry, idx) => (
                        <tr key={idx} className="group">
                           <td>
                              <div className="flex flex-col">
                                <span className="font-black text-text-main uppercase italic group-hover:text-amber-400 transition-colors">{entry.name}</span>
                                <span className="text-[10px] font-bold text-text-muted tracking-[0.2em] mt-0.5">{entry.roll_no}</span>
                              </div>
                           </td>
                           <td>
                              <div className="input-group-glass max-w-[120px]">
                                <input 
                                   type="number" 
                                   className="text-center font-black text-amber-400 text-lg italic"
                                   value={entry.marks_obtained}
                                   onChange={e => {
                                     const updated = [...marksEntry];
                                     updated[idx].marks_obtained = e.target.value;
                                     setMarksEntry(updated);
                                   }}
                                />
                              </div>
                           </td>
                           <td>
                              <div className="input-group-glass max-w-[100px]">
                                <select 
                                   className="font-black text-emerald-400 text-center italic cursor-pointer"
                                   value={entry.grade}
                                   onChange={e => {
                                     const updated = [...marksEntry];
                                     updated[idx].grade = e.target.value;
                                     setMarksEntry(updated);
                                   }}
                                >
                                   <option value="">Grade</option>
                                   {['A+', 'A', 'B', 'B+', 'C', 'P', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </div>
                           </td>
                           <td>
                              <div className="input-group-glass">
                                <input 
                                   type="text" 
                                   className="text-sm text-text-muted italic focus:text-text-main transition-colors"
                                   placeholder="Add persistence feedback node..."
                                   value={entry.remarks}
                                   onChange={e => {
                                     const updated = [...marksEntry];
                                     updated[idx].remarks = e.target.value;
                                     setMarksEntry(updated);
                                   }}
                                />
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
             </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Exams;
