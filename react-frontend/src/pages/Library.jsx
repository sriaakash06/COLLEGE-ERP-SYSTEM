import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Book, 
  Search, 
  Plus, 
  Calendar, 
  User, 
  Hash, 
  MapPin, 
  Layers, 
  RotateCcw, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  BookOpen,
  FilterX,
  TrendingUp,
  Activity,
  Library as LibraryIcon,
  ChevronRight,
  ArrowUpRight,
  X,
  Database
} from 'lucide-react';

const Library = ({ currentUser = { role: 'admin' } }) => {
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'issued'
  const [showAddBook, setShowAddBook] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [bookForm, setBookForm] = useState({
    book_title: '', author: '', isbn: '', category: 'General',
    total_copies: '1', location: ''
  });

  useEffect(() => {
    fetchLibraryData();
    if (currentUser?.role === 'admin') {
      fetchStudents();
    }
  }, [currentUser]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/library/data', { withCredentials: true });
      if (response.data.success) {
        setBooks(response.data.books || []);
        setIssuedBooks(response.data.issued_books || []);
      }
    } catch (err) { 
      console.error('Library fetch error', err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/attendance/fetch-students', { withCredentials: true });
      if (response.data.success) setStudents(response.data.students || []);
    } catch (err) { 
      console.error('Students fetch error', err); 
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/library/add_book', bookForm, { withCredentials: true });
      if (response.data.success) {
        setShowAddBook(false);
        setBookForm({
          book_title: '', author: '', isbn: '', category: 'General',
          total_copies: '1', location: ''
        });
        fetchLibraryData();
      }
    } catch (err) { 
      console.error('Failed to add book', err); 
    }
  };

  const issueBook = async (bookId) => {
    const studentId = prompt("Enter Student ID (System ID):");
    const dueDate = prompt("Enter Due Date (YYYY-MM-DD):", new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    
    if (!studentId || !dueDate) return;

    try {
      const response = await axios.post(`/api/library/issue_book/${bookId}`, {
        student_id: studentId,
        due_date: dueDate
      }, { withCredentials: true });
      
      if (response.data.success) {
        fetchLibraryData();
      }
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to issue book'); 
    }
  };

  const returnBook = async (issuanceId) => {
    if (!window.confirm("Confirm book return?")) return;
    try {
      const response = await axios.post(`/api/library/return_book/${issuanceId}`, {}, { withCredentials: true });
      if (response.data.success) {
        fetchLibraryData();
      }
    } catch (err) { 
      console.error('Failed to return book', err); 
    }
  };

  const filteredBooks = books.filter(book => 
    book.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: books.length,
    available: books.reduce((acc, curr) => acc + (curr.available_copies || 0), 0),
    issued: issuedBooks.length,
    overdue: issuedBooks.filter(iss => iss.days_remaining < 0).length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-pulse">
        <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl relative mb-4">
          <LibraryIcon className="w-10 h-10 text-indigo-400" />
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-transparent rounded-[2.1rem] animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">SYNCHRONIZING KNOWLEDGE BASE...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <LibraryIcon className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gradient-primary tracking-tight italic uppercase">KNOWLEDGE TERMINAL</h1>
            <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Central repository &amp; digital asset management v2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:min-w-[320px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Query catalog..."
              className="input-group-glass !pl-14 h-14 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowAddBook(true)}
              className="btn-premium px-8 py-4 rounded-2xl flex items-center gap-3 active:scale-95 transition-transform shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span className="font-black tracking-[0.1em] text-[10px]">INJECT ASSET</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', val: stats.total, icon: BookOpen, color: 'indigo', detail: 'Knowledge Nodes' },
          { label: 'Available Nodes', val: stats.available, icon: CheckCircle2, color: 'emerald', detail: 'Ready to Lease' },
          { label: 'Active Leases', val: stats.issued, icon: Activity, color: 'blue', detail: 'Active Protocols' },
          { label: 'Return Latency', val: stats.overdue, icon: AlertCircle, color: 'rose', detail: 'Overdue Units' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 group hover:translate-y-[-4px] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="px-2 py-1 rounded-md bg-glass-bg border border-glass-border text-[8px] font-black text-text-muted uppercase tracking-widest">Live Sync</div>
            </div>
            <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-text-main group-hover:text-indigo-400 transition-colors tracking-tight italic">{stat.val}</p>
            <p className={`text-[10px] font-bold text-${stat.color}-400/80 mt-1 uppercase italic`}>{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-glass-bg border border-glass-border p-1 rounded-2xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
            activeTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-text-muted hover:text-white'
          }`}
        >
          Catalog Matrix
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`px-8 py-3 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
            activeTab === 'issued'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-text-muted hover:text-white'
          }`}
        >
          {currentUser?.role === 'student' ? 'My Acquisitions' : 'Active Leases'}
        </button>
      </div>

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-0 overflow-hidden animate-scale-in border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
            <div className="p-10 border-b border-glass-border relative overflow-hidden bg-indigo-500/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h2 className="text-3xl font-black italic text-gradient-primary uppercase tracking-tight">INJECT ASSET NODE</h2>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Data injection module v2.0</p>
                </div>
                <button onClick={() => setShowAddBook(false)} className="p-3 rounded-xl bg-glass-bg border border-glass-border text-text-muted hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddBook} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> ASSET TITLE
                  </label>
                  <div className="input-group-glass">
                    <Book className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      value={bookForm.book_title}
                      onChange={e => setBookForm({...bookForm, book_title: e.target.value})}
                      placeholder="Enter resource title"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> CREATOR / AUTHOR
                  </label>
                  <div className="input-group-glass">
                    <User className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      value={bookForm.author}
                      onChange={e => setBookForm({...bookForm, author: e.target.value})}
                      placeholder="Source identifier"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> REFERENCE ISBN
                  </label>
                  <div className="input-group-glass">
                    <Hash className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      value={bookForm.isbn}
                      onChange={e => setBookForm({...bookForm, isbn: e.target.value})}
                      placeholder="Unique descriptor"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> TAXONOMY
                  </label>
                  <div className="input-group-glass">
                    <Filter className="w-4 h-4 text-text-muted shrink-0" />
                    <select
                      className="bg-transparent border-none outline-none text-text-main w-full py-3 font-bold uppercase"
                      value={bookForm.category}
                      onChange={e => setBookForm({...bookForm, category: e.target.value})}
                    >
                      {['General', 'Computer Science', 'Mathematics', 'Physics', 'Management', 'Literature'].map(cat => (
                        <option key={cat} value={cat} className="bg-[#1a1b2a]">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-indigo-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span> COPIES
                  </label>
                  <div className="input-group-glass">
                    <Layers className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      type="number"
                      value={bookForm.total_copies}
                      onChange={e => setBookForm({...bookForm, total_copies: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-rose-400 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-3 bg-rose-500 rounded-full"></span> GRID LOCATION
                  </label>
                  <div className="input-group-glass">
                    <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                      value={bookForm.location}
                      onChange={e => setBookForm({...bookForm, location: e.target.value})}
                      placeholder="Rack identifier"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-6 border-t border-glass-border">
                <button type="button" onClick={() => setShowAddBook(false)} className="px-8 py-4 text-text-muted hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px]">ABORT OPS</button>
                <button type="submit" className="btn-premium px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                  FINALIZE INJECTION <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory View */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="glass-card group p-6 hover:translate-y-[-4px] transition-all flex flex-col relative overflow-hidden border-b-4 border-b-indigo-500/10 hover:border-b-indigo-500">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-125 duration-700">
                <Book className="w-24 h-24 text-indigo-400" />
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Book className="w-5 h-5" />
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${book.available_copies > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {book.available_copies} / {book.total_copies} AVAIL
                </div>
              </div>

              <h5 className="font-black text-text-main group-hover:text-indigo-400 transition-colors italic uppercase tracking-tight text-lg leading-tight mb-1 line-clamp-2 relative z-10">{book.book_title}</h5>
              <p className="text-text-muted text-sm font-bold mb-3 uppercase tracking-wider relative z-10">BY: {book.author}</p>

              <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                <span className="px-3 py-1 rounded-lg bg-glass-bg border border-glass-border text-[10px] font-black uppercase text-text-muted tracking-widest">{book.category}</span>
                {book.location && (
                  <span className="px-3 py-1 rounded-lg bg-glass-bg border border-glass-border text-[10px] font-black uppercase text-text-muted tracking-widest flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {book.location}
                  </span>
                )}
              </div>

              {currentUser?.role === 'admin' && (
                <button
                  disabled={book.available_copies <= 0}
                  className={`mt-auto w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border ${
                    book.available_copies > 0
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-transparent'
                      : 'bg-glass-bg border-glass-border text-text-muted/30 cursor-not-allowed'
                  }`}
                  onClick={() => book.available_copies > 0 && issueBook(book.id)}
                >
                  {book.available_copies > 0 ? 'Initiate Lease' : 'N/A: Depleted'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {filteredBooks.length === 0 && (
            <div className="col-span-full py-48 glass-card border-dashed flex flex-col items-center justify-center opacity-30 text-center">
              <FilterX className="w-16 h-16 text-indigo-400/50 mb-6" />
              <h3 className="text-xl font-black italic uppercase tracking-widest">Null Result</h3>
              <p className="text-sm font-medium mt-2 uppercase tracking-widest">No catalog data matches present search parameters</p>
              <button className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-background transition-all" onClick={() => setSearchTerm('')}>Reset Query</button>
            </div>
          )}
        </div>
      )}

      {/* Issued Books View */}
      {activeTab === 'issued' && (
        <div className="glass-card overflow-hidden p-0 border-indigo-500/10">
          <div className="p-8 border-b border-glass-border flex items-center justify-between bg-glass-bg/30">
            <h3 className="text-xl font-black italic tracking-tighter uppercase text-gradient-primary flex items-center gap-4">
              <Activity className="w-5 h-5 text-indigo-400" /> ACTIVE LEASE LEDGER
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="premium-table w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Resource Identifier</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Entity Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Timeline Index</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Status Vector</th>
                  {currentUser?.role === 'admin' && <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Ops</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {issuedBooks.map(iss => (
                  <tr key={iss.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Book className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-text-main italic uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{iss.book_title}</p>
                          <p className="text-[9px] font-black text-text-muted/40 uppercase tracking-widest mt-1">ISBN: {iss.isbn || 'REF_NULL'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 text-lg">
                          {iss.student_name?.[0] || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-text-main">{iss.student_name}</p>
                          <p className="text-[10px] text-text-muted/60 uppercase font-bold tracking-wider">{iss.reg_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className={iss.days_remaining < 0 ? 'text-rose-400' : 'text-text-main'}>
                          <p className="font-black text-sm uppercase font-mono">{iss.due_date}</p>
                          <p className="text-[10px] font-bold text-text-muted/60 italic">
                            {iss.days_remaining < 0 ? `${Math.abs(iss.days_remaining)}D LATENCY` : `${iss.days_remaining}D REMAINING`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 w-fit mx-auto ${
                        iss.days_remaining < 0
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {iss.days_remaining < 0 ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {iss.days_remaining < 0 ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-8 py-6 text-right">
                        <button
                          title="Terminate Lease / Return Asset"
                          onClick={() => returnBook(iss.id)}
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {issuedBooks.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="py-48 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Database className="w-16 h-16 mb-4 text-indigo-400" />
                        <p className="text-xl font-black italic uppercase tracking-widest">No Active Lease Protocols Found</p>
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
    </div>
  );
};

export default Library;
