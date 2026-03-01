import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Search, Filter, Plus, BookOpen, Clock, CheckCircle2, X } from 'lucide-react';

export default function AdminLibrary() {
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory or loans

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', section: '', totalCopies: 1 });

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ bookId: '', bookTitle: '', userId: '', userName: '', role: 'student', dueDate: '' });

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const [booksRes, loansRes] = await Promise.all([
        fetch('http://localhost:5000/api/library'),
        fetch('http://localhost:5000/api/library/loans')
      ]);
      const booksData = await booksRes.json();
      const loansData = await loansRes.json();

      if (booksData.data) setBooks(booksData.data.reverse());
      if (loansData.data) setLoans(loansData.data.reverse());
    } catch (error) {
      console.error('Failed to fetch library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewBook({ title: '', author: '', isbn: '', section: '', totalCopies: 1 });
        fetchLibraryData();
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const selectedBook = books.find(b => b.id === issueForm.bookId);
      const payload = {
        ...issueForm,
        bookTitle: selectedBook ? selectedBook.title : issueForm.bookId
      };

      const res = await fetch('http://localhost:5000/api/library/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsIssueOpen(false);
        setIssueForm({ bookId: '', bookTitle: '', userId: '', userName: '', role: 'student', dueDate: '' });
        fetchLibraryData();
      }
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const handleReturn = async (loanId) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/library/loans/${loanId}/return`, {
          method: 'POST'
        });
        if (res.ok) {
          fetchLibraryData();
        }
      } catch (error) {
        console.error('Error returning book:', error);
      }
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to remove this book from the catalog?')) {
      try {
        await fetch(`http://localhost:5000/api/library/${id}`, { method: 'DELETE' });
        fetchLibraryData();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const metrics = {
    totalBooks: books.reduce((sum, b) => sum + (b.totalCopies || 1), 0),
    availableBooks: books.reduce((sum, b) => sum + (b.availableCopies !== undefined ? b.availableCopies : b.totalCopies), 0),
    activeLoans: loans.length,
    overdue: loans.filter(l => new Date(l.dueDate) < new Date()).length
  };

  return (
    <Layout breadcrumbs={['Administration', 'Library Records']}>
      <main className="p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Library Records</h1>
            <p className="text-textSecondary text-sm">Manage school catalog inventory, active checkouts, and student returns.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setIsAddOpen(true)} className="btn-secondary">
              <Plus className="w-4 h-4 mr-2" /> Add Book
            </button>
            <button onClick={() => setIsIssueOpen(true)} className="btn-primary">
              <BookOpen className="w-4 h-4 mr-2" /> Issue Book
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Inventory" value={metrics.totalBooks} icon={<Library className="w-5 h-5 text-primary-400" />} color="primary-500" />
          <MetricCard title="Available Copies" value={metrics.availableBooks} icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
          <MetricCard title="Active Loans" value={metrics.activeLoans} icon={<BookOpen className="w-5 h-5 text-secondary" />} color="secondary" />
          <MetricCard title="Overdue Returns" value={metrics.overdue} icon={<Clock className="w-5 h-5 text-warning" />} color="warning" />
        </div>

        <div className="glass-card flex flex-col flex-1 border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5 bg-surfaceSolid/50">
            <button onClick={() => setActiveTab('inventory')} className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'inventory' ? 'text-primary-400 border-primary-500' : 'text-textSecondary border-transparent hover:text-white'}`}>
              Catalog Inventory
            </button>
            <button onClick={() => setActiveTab('loans')} className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'loans' ? 'text-primary-400 border-primary-500' : 'text-textSecondary border-transparent hover:text-white'}`}>
              Active Checkouts
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-textSecondary whitespace-nowrap">
              <thead className="text-xs uppercase bg-surfaceSolid/80 text-textSecondary sticky top-0 z-10 backdrop-blur-md">
                {activeTab === 'inventory' ? (
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Book Name & Author</th>
                    <th className="px-6 py-4 font-bold tracking-wider">ISBN</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Section</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-right">Available / Total</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Book Issued</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Borrower</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Issue Date</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Return Due</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-12"><div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto"></div></td></tr>
                ) : activeTab === 'inventory' ? (
                  books.map(book => (
                    <tr key={book.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white mb-1">{book.title}</div>
                        <div className="text-xs text-textSecondary">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{book.isbn || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] uppercase font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{book.section}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono text-lg font-bold ${book.availableCopies > 0 ? 'text-emerald-400' : 'text-danger'}`}>{book.availableCopies}</span>
                        <span className="text-textSecondary"> / {book.totalCopies}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDeleteBook(book.id)} className="text-xs font-bold text-danger opacity-0 group-hover:opacity-100 transition-opacity bg-danger/10 px-3 py-1 rounded border border-danger/20 hover:bg-danger/20">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  loans.map(loan => {
                    const isOverdue = new Date(loan.dueDate) < new Date();
                    return (
                      <tr key={loan.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-bold text-white">{loan.bookTitle}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{loan.userName}</div>
                          <div className="text-xs text-textSecondary uppercase tracking-wider">{loan.userRole} - {loan.userId}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{new Date(loan.issueDate).toLocaleDateString()}</td>
                        <td className={`px-6 py-4 font-mono text-xs font-bold ${isOverdue ? 'text-danger' : 'text-white'}`}>{new Date(loan.dueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${isOverdue ? 'text-danger bg-danger/10 border-danger/20' : 'text-warning bg-warning/10 border-warning/20'}`}>{isOverdue ? 'Overdue' : 'Issued'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleReturn(loan.id)} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Mark Returned</button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Add New Book</h2>
                  <button onClick={() => setIsAddOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddBook} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Book Title</label>
                    <input required type="text" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="input-field" placeholder="e.g. The Great Gatsby" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Author</label>
                    <input required type="text" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="input-field" placeholder="e.g. F. Scott Fitzgerald" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">ISBN</label>
                      <input type="text" value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} className="input-field" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Subject/Section</label>
                      <input required type="text" value={newBook.section} onChange={e => setNewBook({ ...newBook, section: e.target.value })} className="input-field" placeholder="e.g. Fiction" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Total Copies</label>
                    <input required type="number" min="1" value={newBook.totalCopies} onChange={e => setNewBook({ ...newBook, totalCopies: e.target.value })} className="input-field" />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Add to Catalog</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isIssueOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Issue Book</h2>
                  <button onClick={() => setIsIssueOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleIssueBook} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Select Book</label>
                    <select required value={issueForm.bookId} onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                      <option value="">Choose a book...</option>
                      {books.filter(b => b.availableCopies > 0).map(b => (
                        <option key={b.id} value={b.id}>{b.title} (Available: {b.availableCopies})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Borrower Role</label>
                      <select required value={issueForm.role} onChange={e => setIssueForm({ ...issueForm, role: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Borrower ID (Reg No)</label>
                      <input required type="text" value={issueForm.userId} onChange={e => setIssueForm({ ...issueForm, userId: e.target.value })} className="input-field" placeholder="e.g. ST-001" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Borrower Name</label>
                    <input required type="text" value={issueForm.userName} onChange={e => setIssueForm({ ...issueForm, userName: e.target.value })} className="input-field" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Return Due Date</label>
                    <input required type="date" value={issueForm.dueDate} onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })} className="input-field" />
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsIssueOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Confirm Issue</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-textSecondary mb-1">{title}</p>
          <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}/10 border border-${color}/20`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
