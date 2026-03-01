import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, X, Clock, MapPin, Users, Award, BookOpen, Star, AlertCircle } from 'lucide-react';

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    type: 'Event',
    audience: 'all'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/calendar');
      const data = await res.json();
      if (data.data) {
        // Sort by date ascending
        const sorted = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        setIsAddOpen(false);
        setNewEvent({ title: '', description: '', date: '', endDate: '', type: 'Event', audience: 'all' });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await fetch(`http://localhost:5000/api/calendar/${id}`, { method: 'DELETE' });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Holiday': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Exam': return 'text-danger bg-danger/10 border-danger/20';
      case 'Sports': return 'text-warning bg-warning/10 border-warning/20';
      case 'Meeting': return 'text-secondary bg-secondary/10 border-secondary/20';
      default: return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Holiday': return <Star className="w-4 h-4" />;
      case 'Exam': return <BookOpen className="w-4 h-4" />;
      case 'Sports': return <Award className="w-4 h-4" />;
      case 'Meeting': return <Users className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Group events by month
  const groupedEvents = {};
  events.forEach(event => {
    const d = new Date(event.date);
    const monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groupedEvents[monthYear]) groupedEvents[monthYear] = [];
    groupedEvents[monthYear].push(event);
  });

  return (
    <Layout breadcrumbs={['Administration', 'Academic Calendar']}>
      <main className="p-8 max-w-[1200px] mx-auto w-full flex flex-col h-full">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Academic Calendar</h1>
            <p className="text-textSecondary text-sm">Schedule school-wide events, exams, holidays, and meetings.</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setIsAddOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Schedule Event
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card flex flex-col justify-center items-center h-64 text-center border-white/5">
              <CalendarIcon className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Events Scheduled</h3>
              <p className="text-textSecondary max-w-sm">The academic calendar is currently empty. Start by adding a new event.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.keys(groupedEvents).map(month => (
                <div key={month} className="relative">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-4 mb-4 border-b border-white/5 flex items-center">
                    <div className="w-2 h-8 bg-primary-500 rounded-r-md mr-4"></div>
                    <h2 className="text-2xl font-bold text-white">{month}</h2>
                  </div>
                  <div className="space-y-4 pl-6 border-l-2 border-white/5 ml-1">
                    {groupedEvents[month].map(event => {
                      const startDate = new Date(event.date);
                      const isMultiDay = event.endDate && event.date !== event.endDate;

                      return (
                        <div key={event.id} className="relative pl-8 group">
                          {/* Timeline Dot */}
                          <div className="absolute left-[-21px] top-6 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center bg-surfaceSolid">
                            <div className={`w-4 h-4 rounded-full ${getTypeColor(event.type).split(' ')[1]}`}></div>
                          </div>

                          <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors bg-surfaceSolid/30 flex flex-col md:flex-row gap-6">
                            {/* Date Date Container */}
                            <div className="min-w-[120px] text-center md:text-left flex flex-col justify-center">
                              <div className="text-3xl font-display font-bold text-white leading-none mb-1">
                                {startDate.getDate()}
                              </div>
                              <div className="text-sm font-bold text-primary-400 uppercase tracking-widest">
                                {startDate.toLocaleDateString('default', { weekday: 'short' })}
                              </div>
                              {isMultiDay && (
                                <div className="text-xs text-textSecondary mt-2">
                                  to {new Date(event.endDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Separator */}
                            <div className="hidden md:block w-px bg-white/10"></div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-center">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border flex items-center ${getTypeColor(event.type)}`}>
                                      <span className="mr-1">{getTypeIcon(event.type)}</span> {event.type}
                                    </span>
                                  </div>
                                  <p className="text-sm text-textSecondary">{event.description || 'No description provided.'}</p>
                                </div>
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-xs font-bold text-danger bg-danger/10 px-3 py-1 rounded border border-danger/20 hover:bg-danger/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-4">Remove</button>
                              </div>
                              <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-white/5 text-xs text-textSecondary font-medium">
                                <span className="flex items-center capitalize"><Users className="w-4 h-4 mr-1.5" /> Audience: {event.audience}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        <AnimatePresence>
          {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#161B22] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Schedule New Event</h2>
                  <button onClick={() => setIsAddOpen(false)} className="text-textSecondary hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddEvent} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Event Title</label>
                    <input required type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="input-field bg-[#0D1117]" placeholder="e.g. Science Fair 2024" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">Description</label>
                    <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="input-field bg-[#0D1117] h-20 resize-none" placeholder="Provide event details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Start Date</label>
                      <input required type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="input-field bg-[#0D1117]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">End Date (Optional)</label>
                      <input type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="input-field bg-[#0D1117]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Event Type</label>
                      <select required value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                        <option value="Event">General Event</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Exam">Exam / Assessment</option>
                        <option value="Sports">Sports / Extracurricular</option>
                        <option value="Meeting">Meeting / Conference</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-textSecondary mb-1">Target Audience</label>
                      <select required value={newEvent.audience} onChange={e => setNewEvent({ ...newEvent, audience: e.target.value })} className="input-field bg-[#0D1117] border-white/10">
                        <option value="all">Entire School</option>
                        <option value="students">Students Only</option>
                        <option value="teachers">Teachers Only</option>
                        <option value="parents">Parents Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Add Event</button>
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
