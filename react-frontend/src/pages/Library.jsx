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
  ArrowUpRight
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-glow"></div>
      </div>
    );
  }

  return (
    <div className="library-container fade-in">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4 mb-5">
        <div className="header-glass-node p-4 rounded-4 flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="icon-box-md bg-primary-soft">
              <LibraryIcon size={24} className="text-primary" />
            </div>
            <h1 className="h2 fw-bold text-white mb-0 italic-header text-uppercase tracking-wider">Knowledge Terminal</h1>
          </div>
          <p className="text-secondary opacity-75 mb-0">System Node: Central Repository / Digital Asset Management</p>
        </div>
        
        <div className="d-flex gap-3 align-self-start">
          <div className="search-box-glass">
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Query catalog..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {currentUser?.role === 'admin' && (
            <button className="btn-premium" onClick={() => setShowAddBook(true)}>
              <Plus size={18} className="me-2" />
              Inject Asset
            </button>
          )}
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Total Volume', value: stats.total, icon: BookOpen, color: 'primary' },
          { label: 'Available Nodes', value: stats.available, icon: CheckCircle2, color: 'emerald' },
          { label: 'Active Leases', value: stats.issued, icon: Activity, color: 'indigo' },
          { label: 'Return Latency', value: stats.overdue, icon: AlertCircle, color: 'danger' },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="glass-card p-4 h-100 border-hover">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className={`icon-box-sm bg-${stat.color}-soft`}>
                  <stat.icon size={20} className={`text-${stat.color}`} />
                </div>
                <TrendingUp size={16} className="text-secondary opacity-50" />
              </div>
              <h3 className="h2 fw-bold text-white mb-1">{stat.value}</h3>
              <p className="text-secondary extra-small text-uppercase tracking-widest mb-0 font-monospace">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-tabs-container mb-5">
        <div className="glass-tabs">
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Layers size={18} className="me-2" />
            Catalog Matrix
          </button>
          <button 
            className={`tab-btn ${activeTab === 'issued' ? 'active' : ''}`}
            onClick={() => setActiveTab('issued')}
          >
            <Activity size={18} className="me-2" />
            {currentUser?.role === 'student' ? 'My Acquisitions' : 'Active Leases'}
          </button>
        </div>
      </div>

      {/* Add Book Modal Overlay */}
      {showAddBook && (
        <div className="modal-overlay">
          <div className="glass-modal p-5 fade-in max-w-2xl">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h3 className="fw-bold text-white m-0 italic-header text-uppercase mb-1">Inject Asset Node</h3>
                <p className="text-secondary extra-small opacity-75 font-monospace">DATA_INJECTION_MODULE_V2.0</p>
              </div>
              <button className="btn-close-glass hover-scale" onClick={() => setShowAddBook(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddBook} className="row g-4">
              <div className="col-md-6">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Asset Title</label>
                <div className="input-group-glass">
                  <Book size={18} className="text-secondary" />
                  <input 
                    value={bookForm.book_title} 
                    onChange={e => setBookForm({...bookForm, book_title: e.target.value})} 
                    placeholder="Enter resource title"
                    required 
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Creator / Author</label>
                <div className="input-group-glass">
                  <User size={18} className="text-secondary" />
                  <input 
                    value={bookForm.author} 
                    onChange={e => setBookForm({...bookForm, author: e.target.value})} 
                    placeholder="Source identifier"
                    required 
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Reference ISBN</label>
                <div className="input-group-glass">
                  <Hash size={18} className="text-secondary" />
                  <input 
                    value={bookForm.isbn} 
                    onChange={e => setBookForm({...bookForm, isbn: e.target.value})} 
                    placeholder="Unique descriptor"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Taxonomy</label>
                <div className="input-group-glass py-0 px-2">
                  <Filter size={18} className="text-secondary ms-2" />
                  <select 
                    className="form-select-glass bg-transparent border-0 text-white w-100 py-3 px-2 outline-none"
                    value={bookForm.category} 
                    onChange={e => setBookForm({...bookForm, category: e.target.value})}
                  >
                    {['General', 'Computer Science', 'Mathematics', 'Physics', 'Management', 'Literature'].map(cat => (
                      <option key={cat} value={cat} className="text-dark">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-2">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Copies</label>
                <div className="input-group-glass">
                  <Layers size={18} className="text-secondary" />
                  <input 
                    type="number" 
                    value={bookForm.total_copies} 
                    onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="col-md-2">
                <label className="premium-label font-monospace text-uppercase small opacity-75 tracking-wider">Grid Location</label>
                <div className="input-group-glass">
                  <MapPin size={18} className="text-secondary" />
                  <input 
                    value={bookForm.location} 
                    onChange={e => setBookForm({...bookForm, location: e.target.value})} 
                    placeholder="Rack" 
                  />
                </div>
              </div>
              <div className="col-12 mt-5">
                <button type="submit" className="btn-premium w-100 py-3 shadow-lg">
                  Finalize Injection
                  <ArrowUpRight size={18} className="ms-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory View */}
      {activeTab === 'inventory' && (
        <div className="row g-4">
          {filteredBooks.map(book => (
            <div key={book.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="glass-card h-100 p-4 border-hover transition-300">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="icon-box-sm bg-primary-soft">
                    <Book size={20} className="text-primary" />
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <span className={`badge-premium px-3 ${book.available_copies > 0 ? 'bg-emerald-soft text-emerald' : 'bg-danger-soft text-danger'}`}>
                      {book.available_copies} / {book.total_copies} AVAIL
                    </span>
                    <span className="extra-small text-secondary mt-1 font-monospace opacity-50">L# {book.location || 'NULL'}</span>
                  </div>
                </div>
                
                <h5 className="fw-bold text-white mb-1 line-clamp-1 italic-header">{book.book_title}</h5>
                <p className="text-secondary small mb-4 font-monospace opacity-75">BY: {book.author}</p>
                
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <span className="badge-glass small border-hover bg-white-soft">{book.category}</span>
                </div>

                {currentUser?.role === 'admin' && (
                  <button 
                    disabled={book.available_copies <= 0}
                    className={`btn-glass-action w-100 mt-auto ${book.available_copies <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover-scale'}`}
                    onClick={() => book.available_copies > 0 && issueBook(book.id)}
                  >
                    {book.available_copies > 0 ? 'Initiate Lease' : 'N/A: Depleted'}
                    <ChevronRight size={16} className="ms-2" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-12 text-center py-5">
              <div className="glass-card p-5 max-w-md mx-auto">
                <div className="icon-box-lg bg-white-soft mx-auto mb-4">
                  <FilterX size={40} className="text-secondary" />
                </div>
                <h4 className="text-white italic-header text-uppercase">Null Result</h4>
                <p className="text-secondary font-monospace opacity-75">No catalog data matches present search parameters</p>
                <button className="btn-glass px-4 py-2 mt-3" onClick={() => setSearchTerm('')}>Reset Query</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Issued Books View */}
      {activeTab === 'issued' && (
        <div className="glass-card overflow-hidden border-hover">
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="font-monospace text-uppercase tracking-widest small opacity-75 px-4 py-4">Resource Identifier</th>
                  <th className="font-monospace text-uppercase tracking-widest small opacity-75 px-4">Entity Details</th>
                  <th className="font-monospace text-uppercase tracking-widest small opacity-75 px-4">Timeline Index</th>
                  <th className="font-monospace text-uppercase tracking-widest small opacity-75 px-4 text-center">Status Vector</th>
                  {currentUser?.role === 'admin' && <th className="font-monospace text-uppercase tracking-widest small opacity-75 px-4 text-end">Ops</th>}
                </tr>
              </thead>
              <tbody className="divide-y-glass">
                {issuedBooks.map(iss => (
                  <tr key={iss.id} className="row-hover">
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="icon-box-xs bg-indigo-soft me-3">
                          <Book size={16} className="text-indigo" />
                        </div>
                        <div>
                          <p className="text-white fw-bold mb-0 italic-header">{iss.book_title}</p>
                          <p className="text-secondary extra-small mb-0 font-monospace opacity-50">ISBN: {iss.isbn || 'REF_NULL'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="avatar-xs bg-purple-soft me-2 rounded-2 d-flex align-items-center justify-content-center text-purple fw-bold font-monospace">
                          {iss.student_name?.[0] || 'E'}
                        </div>
                        <div>
                          <p className="text-white small fw-bold mb-0">{iss.student_name}</p>
                          <p className="text-secondary extra-small mb-0 opacity-75 font-monospace">{iss.reg_no}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <Calendar size={14} className="text-secondary me-2" />
                        <div className={iss.days_remaining < 0 ? 'text-danger' : 'text-white'}>
                          <span className="small font-monospace">{iss.due_date}</span>
                          <p className="extra-small text-secondary mb-0 opacity-50 italic">
                            {iss.days_remaining < 0 ? `${Math.abs(iss.days_remaining)}D LATENCY` : `${iss.days_remaining}D REMAINING`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 text-center">
                      <span className={`badge-premium px-3 py-1 ${iss.days_remaining < 0 ? 'bg-danger-soft text-danger' : 'bg-emerald-soft text-emerald'}`}>
                        {iss.days_remaining < 0 ? <AlertCircle size={12} className="me-1" /> : <Clock size={12} className="me-1" />}
                        {iss.days_remaining < 0 ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-4 text-end">
                        <button 
                          className="btn-icon-glass text-emerald hover-scale" 
                          title="Terminate Lease / Return Asset"
                          onClick={() => returnBook(iss.id)}
                        >
                          <RotateCcw size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {issuedBooks.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === 'admin' ? 5 : 4} className="text-center py-5">
                      <div className="py-5 opacity-50">
                        <Activity size={32} className="text-secondary mb-3 mx-auto" />
                        <p className="text-secondary font-monospace text-uppercase tracking-widest small">No active lease protocols found</p>
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

