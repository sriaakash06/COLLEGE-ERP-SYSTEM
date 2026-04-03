import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XSquare, 
  Clock, 
  User, 
  Activity, 
  TrendingUp,
  RotateCcw,
  BookOpen,
  Hash,
  Database,
  Calendar,
  Layers,
  ChevronDown,
  UserCheck,
  UserX,
  Zap
} from 'lucide-react';

const Attendance = ({ currentUser }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'view'
  
  // Selection state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({}); // {student_id: 'Present'/'Absent'}
  
  // Stats
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [crsRes, subsRes] = await Promise.all([
        axios.get('/api/courses/data'),
        axios.get('/api/courses/subjects')
      ]);
      if (crsRes.data.success) setCourses(crsRes.data.courses);
      if (subsRes.data.success) setSubjects(subsRes.data.subjects);
      setLoading(false);
    } catch (err) {
      console.error('Metadata fetch failed');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/students/data');
      if (res.data.success) {
        const filtered = res.data.students.filter(s => s.course_id === selectedCourse);
        setStudents(filtered);
        // Initialize attendance data
        const initial = {};
        filtered.forEach(s => initial[s.id] = 'Present');
        setAttendanceData(initial);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    if (!selectedCourse || !selectedSubject) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/attendance/stats?course_id=${selectedCourse}&subject_id=${selectedSubject}`);
      if (res.data.success) {
        setStats(res.data.stats);
        setHistory(res.data.history || []);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const submitAttendance = async () => {
    try {
      const payload = {
        course_id: selectedCourse,
        subject_id: selectedSubject,
        date: selectedDate,
        attendance: attendanceData
      };
      const res = await axios.post('/api/attendance/mark', payload);
      if (res.data.success) {
        alert('Attendance synchronized successfully');
        setViewMode('view');
        fetchAttendanceStats();
      }
    } catch (err) {
      alert('Action failed: Attendance already marked for this period');
    }
  };

  const toggleStatus = (id) => {
    setAttendanceData(prev => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-success-soft flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CalendarCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight">Attendance Dynamics</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Real-time synchronization of institutional presence records
            </p>
          </div>
        </div>
        
        <div className="bg-glass-bg/50 p-1.5 rounded-2xl border border-glass-border flex gap-1">
          {[
            { id: 'mark', label: 'MARK SESSION', icon: UserCheck },
            { id: 'view', label: 'ANALYTICS HUB', icon: TrendingUp }
          ].map(mode => (
            <button 
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all font-black text-xs tracking-widest ${viewMode === mode.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-text-muted hover:text-text-main hover:bg-glass-bg'}`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Persistence Configuration Panel */}
      <div className="glass-card p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
              <Layers className="w-3 h-3 text-indigo-400/50" /> Academic Stream
            </label>
            <div className="input-group-glass">
              <select 
                className="w-full"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                onBlur={fetchStudents}
              >
                <option value="">Select Stream...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-indigo-400/50" /> Subject Terminal
            </label>
            <div className="input-group-glass">
              <select 
                className="w-full"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.filter(s => !selectedCourse || s.course_id === selectedCourse).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em] pl-1 flex items-center gap-2">
              <Calendar className="w-3 h-3 text-indigo-400/50" /> Temporal Vector
            </label>
            <div className="input-group-glass">
              <input 
                type="date" 
                className="w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={viewMode === 'mark' ? fetchStudents : fetchAttendanceStats}
            className="btn-premium py-4 font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
          >
            <Database className="w-5 h-5" />
            INITIALIZE SYNC
          </button>
        </div>
      </div>

      {/* Main Interface Terminal */}
      {viewMode === 'mark' ? (
        <div className="space-y-8">
          {students.length > 0 ? (
            <div className="fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => toggleStatus(s.id)}
                    className={`glass-card p-5 cursor-pointer flex items-center justify-between group transition-all duration-300 border-2 ${
                      attendanceData[s.id] === 'Present' 
                        ? 'border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                        : 'border-rose-500/20 bg-rose-500/5 shadow-lg shadow-rose-500/5'
                    } hover:translate-y-[-4px]`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner ${
                        attendanceData[s.id] === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-main text-sm lg:text-base group-hover:text-white transition-colors">{s.name}</p>
                        <p className="text-[10px] text-text-muted font-black tracking-widest uppercase mt-0.5">ROL: {s.roll_no}</p>
                      </div>
                    </div>
                    {attendanceData[s.id] === 'Present' ? (
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 transition-transform group-hover:scale-110">
                        <UserCheck className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 transition-transform group-hover:scale-110">
                        <UserX className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-10">
                <button 
                  onClick={submitAttendance}
                  className="btn-premium px-16 py-5 rounded-2xl flex items-center gap-4 group"
                >
                  <RotateCcw className="w-6 h-6 transition-transform group-hover:rotate-180 duration-500" /> 
                  <span className="font-black tracking-[0.1em]">COMMIT PERSISTENCE DATA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-32 flex flex-col items-center opacity-30 border-dashed border-2">
              <div className="w-20 h-20 rounded-full bg-glass-bg flex items-center justify-center mb-6 border border-glass-border">
                <Database className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold italic">Awaiting Synchronized Metadata...</h3>
              <p className="text-sm font-medium mt-2">Initialize stream parameters to mark session personnel</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 fade-in">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Avg Persistence', val: `${stats.percentage}%`, icon: TrendingUp, color: 'emerald', detail: 'Above Threshold' },
                { label: 'Total Sessions', val: stats.total_classes, icon: BookOpen, color: 'indigo', detail: 'Completed Units' },
                { label: 'Active Personnel', val: students.length || '---', icon: UserCheck, color: 'amber', detail: 'In Current Stream' }
              ].map((s, i) => (
                <div key={i} className="glass-card p-8 group overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-${s.color}-500/10 transition-all`}></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`p-5 rounded-2xl bg-${s.color}-soft text-${s.color}-400 ring-1 ring-${s.color}-500/20`}>
                      <s.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        {s.label}
                        <span className="text-[8px] px-2 py-0.5 rounded-full bg-glass-bg border border-glass-border">LIVE</span>
                      </p>
                      <p className="text-4xl font-black text-gradient-primary mt-1">{s.val}</p>
                      <p className={`text-[10px] font-bold text-${s.color}-400 mt-1 uppercase`}>{s.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Timestamp Vector</th>
                    <th>Persistence Index</th>
                    <th>Record Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? history.map((h, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-text-main">{h.date}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-48 h-2 bg-glass-bg rounded-full overflow-hidden border border-glass-border">
                            <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" style={{ width: `${(h.present / h.total) * 100}%` }}></div>
                          </div>
                          <span className="text-sm font-black text-indigo-400 tracking-tighter">
                            {Math.round((h.present / h.total) * 100)}% <span className="text-[10px] text-text-muted ml-1 opacity-50">STABILITY</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-glass-bg hover:bg-indigo-500/10 border border-glass-border text-text-muted hover:text-indigo-400 transition-all font-black text-[10px] uppercase tracking-widest group">
                          Access Metadata <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="text-center py-24 opacity-30 italic font-bold">
                        No persistence history available in synchronized database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
