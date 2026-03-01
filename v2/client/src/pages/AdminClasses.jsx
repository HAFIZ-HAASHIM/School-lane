import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Database, Plus, Search, Users, BookOpen, Edit2, Trash2, CalendarDays, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacher: '', teacherName: '' });
  const [teachers, setTeachers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMessage, setAddMessage] = useState({ type: '', text: '' });

  // Edit Class Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch classes and teachers from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch classes
        const q = query(collection(db, 'classes'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const classData = [];
        querySnapshot.forEach((doc) => {
          classData.push({ id: doc.id, ...doc.data() });
        });
        setClasses(classData);

        // Fetch teachers for the dropdown
        const teacherQ = query(collection(db, 'users'));
        const preTeacherQ = query(collection(db, 'preRegisteredUsers'));

        const [teacherSnapshot, preTeacherSnapshot] = await Promise.all([getDocs(teacherQ), getDocs(preTeacherQ)]);
        const teacherData = [];

        teacherSnapshot.forEach(doc => {
          if (doc.data().role === 'teacher') {
            teacherData.push({ id: doc.id, ...doc.data() });
          }
        });

        preTeacherSnapshot.forEach(doc => {
          if (doc.data().role === 'teacher' && !teacherData.find(t => t.email === doc.data().email)) {
            teacherData.push({ id: doc.id, ...doc.data(), status: 'pending' });
          }
        });

        setTeachers(teacherData);

      } catch (error) {
        console.error("Error fetching admin classes data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteClass = async (cls) => {
    if (window.confirm(`Are you sure you want to delete ${cls.name}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'classes', cls.id));
        setClasses(classes.filter(c => c.id !== cls.id));
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete class");
      }
    }
  };

  const handleEditClick = (cls) => {
    setEditingClass({ ...cls, teacher: cls.teacherId || '' });
    setEditMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout breadcrumbs={['Administration', 'Classes & Subjects']}>
      <main className="p-8 max-w-[1400px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <Database className="w-8 h-8 mr-3 text-secondary" /> Classes & Subjects
          </h1>
          <div className="flex space-x-3">
            <button className="btn-secondary space-x-2 bg-surfaceSolid border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>Manage Subjects</span>
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Class</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card mb-6 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs text-textSecondary uppercase font-bold mb-1 ml-1">Academic Year</span>
              <select className="bg-surfaceSolid border border-white/10 text-white text-sm rounded-lg px-3 py-2 w-40">
                <option>2026 - 2027</option>
                <option>2025 - 2026</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-textSecondary uppercase font-bold mb-1 ml-1">Grade Level</span>
              <select className="bg-surfaceSolid border border-white/10 text-white text-sm rounded-lg px-3 py-2 w-32">
                <option>All Grades</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72 mt-4 sm:mt-0 self-end">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-textSecondary" />
            </div>
            <input
              type="text"
              placeholder="Search classes or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 h-10 bg-surfaceSolid border-white/10 w-full text-sm"
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 min-h-[220px] animate-pulse">
                <div className="w-24 h-6 bg-white/10 rounded mb-4"></div>
                <div className="w-40 h-4 bg-white/10 rounded mb-6"></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="w-full h-12 bg-white/5 rounded"></div>
                  <div className="w-full h-12 bg-white/5 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <div key={cls.id} className="glass-card p-6 hover:-translate-y-1 transition-all group relative overflow-hidden">
                {cls.status === 'draft' && (
                  <div className="absolute top-0 right-0 bg-warning/20 text-warning text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Draft Setup
                  </div>
                )}
                <div className="flex justify-between items-start mb-2 mt-2">
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-secondary transition-colors">{cls.name}</h3>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(cls)} className="p-1.5 rounded-md hover:bg-white/10 text-textSecondary hover:text-white tooltip-trigger" title="Edit Class"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteClass(cls)} className="p-1.5 rounded-md hover:bg-danger/20 text-textSecondary hover:text-danger tooltip-trigger" title="Delete Class"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="flex items-center text-sm text-textSecondary mb-6">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-2 text-xs font-bold text-white uppercase">
                    {cls.teacherName ? cls.teacherName.charAt(0) : '?'}
                  </div>
                  Class Teacher: <span className="text-white ml-1">{cls.teacherName || 'Unassigned'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surfaceSolid/50 rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                    <Users className="w-5 h-5 text-primary-400 mb-1" />
                    <span className="text-lg font-bold text-white">{cls.students?.length || 0}</span>
                    <span className="text-[10px] text-textSecondary uppercase tracking-wider">Students</span>
                  </div>
                  <div className="bg-surfaceSolid/50 rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success mb-1" />
                    <span className="text-lg font-bold text-white">{cls.subjects?.length || 0}</span>
                    <span className="text-[10px] text-textSecondary uppercase tracking-wider">Subjects</span>
                  </div>
                </div>

                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5">
                  Manage Timetable
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full glass-card p-12 flex flex-col items-center justify-center text-center">
              <Database className="w-12 h-12 text-textSecondary/50 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Classes Found</h3>
              <p className="text-textSecondary">We couldn't find any classes matching your search or filters.</p>
            </div>
          )}
        </div>

      </main>

      {/* Add Class Modal */}
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
                  <Database className="w-5 h-5 mr-2 text-secondary" /> Create New Class
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-textSecondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {addMessage.text && (
                  <div className={`mb-4 p-3 rounded-lg text-sm font-medium border ${addMessage.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                    {addMessage.text}
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setAddMessage({ type: '', text: '' });
                  try {
                    const selectedTeacher = teachers.find(t => t.id === newClass.teacher);

                    const docRef = await addDoc(collection(db, 'classes'), {
                      name: newClass.name,
                      teacherId: newClass.teacher,
                      teacherName: selectedTeacher ? selectedTeacher.name : '',
                      students: [],
                      subjects: [],
                      status: 'active',
                      createdAt: serverTimestamp()
                    });

                    setClasses(prev => [...prev, {
                      id: docRef.id,
                      name: newClass.name,
                      teacherId: newClass.teacher,
                      teacherName: selectedTeacher ? selectedTeacher.name : '',
                      students: [],
                      subjects: [],
                      status: 'active'
                    }]);

                    setAddMessage({ type: 'success', text: 'Class created successfully!' });
                    setTimeout(() => setShowAddModal(false), 1500);
                  } catch (error) {
                    setAddMessage({ type: 'error', text: 'Failed to create class.' });
                    console.error(error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Class Name</label>
                    <input
                      type="text"
                      className="input-field bg-background/50"
                      placeholder="e.g. Class 10A"
                      value={newClass.name}
                      onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Assign Class Teacher</label>
                    <select
                      className="w-full bg-background/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      value={newClass.teacher}
                      onChange={e => setNewClass({ ...newClass, teacher: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select a teacher...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg bg-surfaceSolid border border-white/10 hover:bg-white/5 text-sm font-bold text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-2 text-sm font-bold">
                      {isSubmitting ? 'Creating...' : 'Create Class'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {showEditModal && editingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surfaceSolid border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-primary-500/10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Edit2 className="w-5 h-5 mr-2 text-secondary" /> Edit Class
                </h2>
                <button onClick={() => setShowEditModal(false)} className="text-textSecondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
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
                  setIsEditing(true);
                  setEditMessage({ type: '', text: '' });
                  try {
                    const selectedTeacher = teachers.find(t => t.id === editingClass.teacher);

                    const classRef = doc(db, 'classes', editingClass.id);
                    await updateDoc(classRef, {
                      name: editingClass.name,
                      teacherId: editingClass.teacher,
                      teacherName: selectedTeacher ? selectedTeacher.name : ''
                    });

                    setClasses(classes.map(c => c.id === editingClass.id ? {
                      ...c,
                      name: editingClass.name,
                      teacherId: editingClass.teacher,
                      teacherName: selectedTeacher ? selectedTeacher.name : ''
                    } : c));

                    setEditMessage({ type: 'success', text: 'Class updated successfully!' });
                    setTimeout(() => setShowEditModal(false), 1500);
                  } catch (error) {
                    setEditMessage({ type: 'error', text: 'Failed to update class.' });
                    console.error(error);
                  } finally {
                    setIsEditing(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Class Name</label>
                    <input
                      type="text"
                      className="input-field bg-background/50"
                      value={editingClass.name}
                      onChange={e => setEditingClass({ ...editingClass, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textSecondary uppercase mb-1 block">Assign Class Teacher</label>
                    <select
                      className="w-full bg-background/50 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      value={editingClass.teacher}
                      onChange={e => setEditingClass({ ...editingClass, teacher: e.target.value })}
                    >
                      <option value="">No Teacher Assigned</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
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
