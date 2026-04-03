import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserCheck, 
  Calendar, 
  Search, 
  User, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter,
  Users,
  PieChart,
  AlertCircle
} from 'lucide-react';

const Attendance = () => {
  const [stats, setStats] = useState({});
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mark Attendance State
  const [mode, setMode] = useState('view'); // 'view' or 'mark'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsToMark, setStudentsToMark] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // studentId: status

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/attendance/data');
      if (response.data.stats) setStats(response.data.stats);
      if (response.data.attendance) setRecords(response.data.attendance);
    } catch (err) {
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await axios.get('/api/attendance/subjects');
      if (response.data.success) {
        setSubjects(response.data.subjects);
        setFilteredSubjects(response.data.subjects);
      }
    } catch (err) {
      console.error('Metadata fetch failed');
    }
  };

  const handleFetchStudents = async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      const response = await axios.post('/api/attendance/fetch-students', {
        subject_id: selectedSubject,
        date: selectedDate
      });
      if (response.data.success) {
        setStudentsToMark(response.data.students);
        setAttendanceData(response.data.existing || {});
      }
    } catch (err) {
      setError('Failed to fetch students for marking');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    const list = studentsToMark.map(s => ({
      student_id: s.id,
      status: attendanceData[s.id] || 'Absent'
    }));

    try {
      setLoading(true);
      const response = await axios.post('/api/attendance/save', {
        subject_id: selectedSubject,
        date: selectedDate,
        attendance: list
      });
      if (response.data.success) {
        setSuccess('Attendance saved successfully');
        setMode('view');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  if (loading && mode === 'view') {
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
            <UserCheck className="w-8 h-8 text-blue-400" />
            Attendance Management
          </h1>
          <p className="text-blue-200/70 mt-1">Track student daily presence and academic engagement</p>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'view' ? (
            <button 
              onClick={() => setMode('mark')}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40"
            >
              <Users className="w-4 h-4" />
              Mark Attendance
            </button>
          ) : (
            <button 
              onClick={() => setMode('view')}
              className="flex items-center gap-2 px-6 py-2 glass text-blue-200 hover:bg-white/10 rounded-xl transition-all"
            >
              Cancel Marking
            </button>
          )}
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

      {mode === 'view' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Today's Present", value: stats.present_today || 0, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: "Today's Absent", value: stats.absent_today || 0, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'On Leave', value: stats.on_leave || 0, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Overall Rate', value: `${stats.attendance_rate || 0}%`, icon: PieChart, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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

          {/* Records Table */}
          <div className="glass overflow-hidden rounded-2xl border-white/10 mt-8">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Recent Records
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-blue-200 uppercase text-xs tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                            {row.student_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{row.student_name}</p>
                            <p className="text-xs text-blue-200/40">ID: {row.student_id?.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-blue-200/80">{row.date}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-blue-200/80">{row.subject_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          row.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 
                          row.status === 'Absent' ? 'bg-red-500/10 text-red-400' : 
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-blue-200/40">{row.marked_by_name || 'Admin'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Mark Attendance Form */}
          <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200">Subject</label>
              <select
                className="premium-field w-full"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-200">Date</label>
              <input
                type="date"
                className="premium-field w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <button 
              onClick={handleFetchStudents}
              disabled={!selectedSubject}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all"
            >
              <Search className="w-4 h-4" />
              Load Students
            </button>
          </div>

          {studentsToMark.length > 0 && (
            <div className="glass overflow-hidden rounded-2xl">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Student Enrollment</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-200/40">Present: {Object.values(attendanceData).filter(v => v === 'Present').length}</span>
                  <span className="text-blue-200/40">Absent: {studentsToMark.length - Object.values(attendanceData).filter(v => v === 'Present').length}</span>
                  <button 
                    onClick={handleSaveAttendance}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
                  >
                    Save All
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {studentsToMark.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => toggleStatus(s.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      attendanceData[s.id] === 'Present' 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          attendanceData[s.id] === 'Present' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{s.name}</p>
                          <p className="text-xs text-blue-200/40">{s.reg_no}</p>
                        </div>
                      </div>
                      {attendanceData[s.id] === 'Present' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
