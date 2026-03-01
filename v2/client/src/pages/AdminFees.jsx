import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Search, Filter, DollarSign, CheckCircle2, Clock, AlertCircle, X, Download } from 'lucide-react';

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newFee, setNewFee] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    targetClass: 'All',
    targetStudent: 'All'
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/fees');
      const data = await res.json();
      if (data.data) {
        setFees(data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newFee, amount: parseFloat(newFee.amount) };
      const res = await fetch('http://localhost:5000/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewFee({ title: '', description: '', amount: '', dueDate: '', targetClass: 'All', targetStudent: 'All' });
        fetchFees();
      }
    } catch (error) {
      console.error('Error creating fee:', error);
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Mark this invoice as fully paid?')) {
      try {
        await fetch(`http://localhost:5000/api/fees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid', paidAt: new Date().toISOString() })
        });
        fetchFees();
      } catch (error) {
        console.error('Error marking fee as paid:', error);
      }
    }
  };

  const handleDeleteFee = async (id) => {
    if (window.confirm('Void this invoice permanently?')) {
      try {
        await fetch(`http://localhost:5000/api/fees/${id}`, { method: 'DELETE' });
        fetchFees();
      } catch (error) {
        console.error('Error deleting fee:', error);
      }
    }
  };

  const metrics = {
    totalRevenue: fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0),
    pending: fees.filter(f => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0),
    overdueCount: fees.filter(f => f.status === 'Pending' && new Date(f.dueDate) < new Date()).length,
    invoicesCount: fees.length
  };

  return (
    <Layout breadcrumbs={['Administration', 'Fees & Payments']}>
      <main className="p-8 max-w-[1400px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Fees Management</h1>
            <p className="text-textSecondary text-sm">Track school fee collection, generate invoices, and monitor overdue payments.</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
            <button onClick={() => setIsAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Issue Invoice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Collected" value={`$${metrics.totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} color="emerald-500" />
          <MetricCard title="Outstanding Balance" value={`$${metrics.pending.toLocaleString()}`} icon={<Clock className="w-5 h-5 text-warning" />} color="warning" />
          <MetricCard title="Total Invoices" value={metrics.invoicesCount} icon={<CreditCard className="w-5 h-5 text-primary-400" />} color="primary-500" />
          <MetricCard title="Accounts Overdue" value={metrics.overdueCount} icon={<AlertCircle className="w-5 h-5 text-danger" />} color="danger" />
        </div>

        <div className="glass-card flex flex-col flex-1 border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-background/50">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input type="text" placeholder="Search invoices, students, classes..." className="input-field pl-10 bg-surfaceSolid/50 text-sm border-white/10" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-textSecondary uppercase font-bold tracking-wider mr-2">Status:</span>
              <select className="input-field py-1.5 px-3 bg-surfaceSolid/50 border-white/10 text-sm w-32">
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs uppercase bg-surfaceSolid/80 text-textSecondary sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Invoice Details</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Billed To</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Due Date</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-12"><div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto"></div></td></tr>
                ) : fees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-textSecondary flex flex-col items-center">
                      <CreditCard className="w-10 h-10 mb-3 opacity-20" />
                      <p>No fee records found in the database.</p>
                    </td>
                  </tr>
                ) : (
                  fees.map(fee => {
                    const isOverdue = fee.status !== 'Paid' && new Date(fee.dueDate) < new Date();
                    return (
                      <tr key={fee.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white mb-1">{fee.title}</div>
                          <div className="text-xs text-textSecondary font-mono opacity-60">ID: {fee.id.substring(0, 8).toUpperCase()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">{fee.targetStudent === 'All' ? 'Whole Class' : fee.targetStudent}</div>
                          <div className="text-xs text-textSecondary uppercase tracking-widest">Class: {fee.targetClass}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono text-lg font-bold text-white">${fee.amount.toFixed(2)}</span>
                        </td>
                        <td className={`px-6 py-4 font-mono font-bold ${isOverdue ? 'text-danger' : 'text-white'}`}>
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {fee.status === 'Paid' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded border text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded border text-[10px] uppercase font-bold text-danger bg-danger/10 border-danger/20">
                              <AlertCircle className="w-3 h-3 mr-1" /> Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded border text-[10px] uppercase font-bold text-warning bg-warning/10 border-warning/20">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {fee.status !== 'Paid' && (
                            <button onClick={() => handleMarkPaid(fee.id)} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Mark Paid</button>
                          )}
                          <button onClick={() => handleDeleteFee(fee.id)} className="text-xs font-bold text-danger bg-danger/10 px-3 py-1.5 rounded border border-danger/20 hover:bg-danger/20 transition-colors">Void</button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Fee Modal */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-background">
                  <h2 className="text-xl font-bold text-white flex items-center"><DollarSign className="w-5 h-5 mr-2 text-emerald-400" /> Issue Invoice</h2>
                  <button onClick={() => setIsAddOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleCreateFee} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Fee Title / Description</label>
                    <input required type="text" value={newFee.title} onChange={e => setNewFee({ ...newFee, title: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. Term 2 Tuition Fee" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Amount ($)</label>
                      <input required type="number" step="0.01" value={newFee.amount} onChange={e => setNewFee({ ...newFee, amount: e.target.value })} className="input-field bg-[#0D1117] font-mono" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Payment Due Date</label>
                      <input required type="date" value={newFee.dueDate} onChange={e => setNewFee({ ...newFee, dueDate: e.target.value })} className="input-field bg-[#0D1117]" />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-2">
                    <h4 className="text-sm font-bold text-white mb-3">Billing Target</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Target Class</label>
                        <input type="text" value={newFee.targetClass} onChange={e => setNewFee({ ...newFee, targetClass: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. Grade 10A or All" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-textSecondary mb-1">Target Student (Optional)</label>
                        <input type="text" value={newFee.targetStudent} onChange={e => setNewFee({ ...newFee, targetStudent: e.target.value })} className="input-field bg-[#0D1117]" placeholder="Reg No or All" />
                      </div>
                    </div>
                    <p className="text-[10px] text-textSecondary mt-2"><AlertCircle className="w-3 h-3 inline mr-1" /> Leaving targets as "All" will apply the fee globally to all students.</p>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Generate Invoice</button>
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
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-textSecondary">{title}</p>
          <div className={`p-2 rounded-lg bg-${color}/10 border border-${color}/20`}>
            {icon}
          </div>
        </div>
        <h3 className="font-display text-4xl font-bold text-white">{value}</h3>
      </div>
    </motion.div>
  );
}
