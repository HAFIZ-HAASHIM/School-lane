import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Search, Plus, MoreVertical, Edit2, Trash2, Key, Shield, UserX, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'teacher' });
  const [addMessage, setAddMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const preQ = query(collection(db, 'preRegisteredUsers'), orderBy('createdAt', 'desc'));

        const [querySnapshot, preQuerySnapshot] = await Promise.all([getDocs(q), getDocs(preQ)]);
        const usersData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.name || 'Unknown User',
            email: data.email || 'No Email',
            role: data.role || 'Unassigned',
            status: data.status || 'active',
            joinDate: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
          });
        });

        preQuerySnapshot.forEach((doc) => {
          const data = doc.data();
          if (!usersData.find(u => u.email === data.email)) {
            usersData.push({
              id: doc.id,
              name: data.name || 'Unknown User',
              email: data.email || 'No Email',
              role: data.role || 'Unassigned',
              status: data.status || 'pending',
              joinDate: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString()
            });
          }
        });

        usersData.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      if (user.status === 'pending') {
        if (window.confirm(`Are you sure you want to cancel the pre-registration for ${user.email}?`)) {
          await deleteDoc(doc(db, 'preRegisteredUsers', user.id));
          setUsers(users.filter(u => u.id !== user.id));
        }
        return;
      }

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { status: newStatus });

      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
    setEditMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Layout breadcrumbs={['Administration', 'User Management']}>
      <main className="p-8 max-w-[1400px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-primary-400" /> User Management
          </h1>
          <button onClick={() => setShowAddModal(true)} className="btn-primary space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Filters and Tabs */}
        <div className="glass-card mb-6 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-1 bg-surfaceSolid/50 p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto">
            {['all', 'admin', 'teacher', 'student', 'parent'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-500/20 text-primary-400' : 'text-textSecondary hover:text-white hover:bg-white/5'}`}
              >
                {tab} ({tab === 'all' ? users.length : users.filter(u => u.role === tab).length})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-textSecondary" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 h-10 bg-surfaceSolid border-white/10 w-full text-sm"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surfaceSolid/50 border-b border-white/5 text-xs uppercase tracking-wider text-textSecondary font-bold">
                  <th className="p-4 rounded-tl-xl whitespace-nowrap">User</th>
                  <th className="p-4 whitespace-nowrap">Role</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Join Date</th>
                  <th className="p-4 rounded-tr-xl text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse bg-white/5">
                      <td className="p-4"><div className="w-32 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-24 h-4 bg-white/10 rounded"></div></td>
                      <td className="p-4"><div className="w-8 h-8 bg-white/10 rounded mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold border border-primary-500/30 font-display">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{user.name}</div>
                            <div className="text-xs text-textSecondary">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold capitalize border ${user.role === 'admin' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          user.role === 'teacher' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                            user.role === 'student' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1 text-xs font-bold ${user.status === 'active' ? 'text-success' : 'text-danger'}`}>
                          {user.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="p-4 text-sm text-textSecondary">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(user)} className="p-1.5 rounded bg-white/5 hover:bg-primary-500/20 text-textSecondary hover:text-primary-400 transition-colors tooltip-trigger" title="Edit User">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded bg-white/5 hover:bg-warning/20 text-textSecondary hover:text-warning transition-colors tooltip-trigger" title="Reset Password">
                            <Key className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <button onClick={() => handleToggleStatus(user)} className={`p-1.5 rounded bg-white/5 transition-colors tooltip-trigger ${user.status === 'active' ? 'hover:bg-danger/20 text-textSecondary hover:text-danger' : 'hover:bg-success/20 text-textSecondary hover:text-success'}`} title={user.status === 'active' ? "Disable User" : "Enable User"}>
                              {user.status === 'active' ? <Trash2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-textSecondary italic">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-textSecondary bg-surfaceSolid/30">
              <div>Showing 1 to {filteredUsers.length} of {users.length} entries</div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-50">Prev</button>
                <button className="px-3 py-1 rounded bg-white/5 hover:bg-white/10">Next</button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surfaceSolid border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary-500/10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary-400" /> Pre-Register User
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-textSecondary hover:text-white transition-colors">
                  <UserX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-textSecondary mb-6">
                  Pre-register a user so they can securely sign up with their email address.
                </p>

                {addMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${addMessage.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                    {addMessage.text}
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAddMessage({ type: '', text: '' });
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('http://localhost:5000/api/users/pre-register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newUser)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setAddMessage({ type: 'success', text: `Successfully pre-registered ${newUser.name}. They can now sign up.` });
                      setNewUser({ name: '', email: '', role: 'teacher' });
                      // Add them to the local state so they show up as 'pending'
                      setUsers(prev => [{
                        id: newUser.email,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        status: 'pending',
                        joinDate: new Date().toISOString()
                      }, ...prev]);
                    } else {
                      setAddMessage({ type: 'error', text: data.error || 'Failed to pre-register user' });
                    }
                  } catch (error) {
                    setAddMessage({ type: 'error', text: 'Network error occurred' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Full Name</label>
                    <input
                      type="text"
                      className="input-field bg-background/50"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Email Address</label>
                    <input
                      type="email"
                      className="input-field bg-background/50"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Role</label>
                    <select
                      className="w-full bg-background/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg bg-surfaceSolid border border-white/10 hover:bg-white/5 text-sm font-bold text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2 text-sm font-bold">
                      {isSubmitting ? 'Registering...' : 'Authorize User'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surfaceSolid border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary-500/10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Edit2 className="w-5 h-5 mr-2 text-primary-400" /> Edit User
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-textSecondary hover:text-white transition-colors">
                  <UserX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {editMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${editMessage.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                    {editMessage.text}
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setEditMessage({ type: '', text: '' });
                  setIsEditing(true);
                  try {
                    // Update in Firestore
                    if (editingUser.status !== 'pending') {
                      const userRef = doc(db, 'users', editingUser.id);
                      await updateDoc(userRef, {
                        name: editingUser.name,
                        role: editingUser.role
                      });
                    } else {
                      const userRef = doc(db, 'preRegisteredUsers', editingUser.id);
                      await updateDoc(userRef, {
                        name: editingUser.name,
                        role: editingUser.role
                      });
                    }

                    // Update local state
                    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                    setEditMessage({ type: 'success', text: `Successfully updated ${editingUser.name}.` });
                    setTimeout(() => setShowEditModal(false), 1500);
                  } catch (error) {
                    console.error("Error updating user:", error);
                    setEditMessage({ type: 'error', text: 'Failed to update user. They may be a pending registration.' });
                  } finally {
                    setIsEditing(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Full Name</label>
                    <input
                      type="text"
                      className="input-field bg-background/50"
                      value={editingUser.name}
                      onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Email Address</label>
                    <input
                      type="email"
                      className="input-field bg-background/50 opacity-50 cursor-not-allowed"
                      value={editingUser.email}
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Role</label>
                    <select
                      className="w-full bg-background/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                      disabled={editingUser.role === 'admin'}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {editingUser.role === 'admin' && <p className="text-xs text-warning mt-1">Admin roles cannot be changed from this interface.</p>}
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 rounded-lg bg-surfaceSolid border border-white/10 hover:bg-white/5 text-sm font-bold text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isEditing} className="flex-1 btn-primary py-2 text-sm font-bold">
                      {isEditing ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
