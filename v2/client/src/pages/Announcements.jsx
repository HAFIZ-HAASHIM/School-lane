import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, MessageSquare, Plus, Search, Paperclip, Send,
    MoreVertical, Bell, Clock, CheckCheck, User, Check
} from 'lucide-react';
import Layout from '../components/Layout';

const ANNOUNCEMENTS = [
    { id: 1, title: 'Term 1 Report Cards Available', author: 'Principal Office', date: 'Today, 09:00 AM', priority: 'Urgent', content: 'Dear Faculty, please ensure all Term 1 grade entries are finalized by EOD today. Report cards will be published to the portal tomorrow morning.', tags: ['Faculty'] },
    { id: 2, title: 'Science Fair Requirements', author: 'Mr. Sharma', date: 'Yesterday, 02:30 PM', priority: 'Info', content: 'All students participating in the upcoming Science Fair must submit their project proposals by next Friday. The template is attached below.', tags: ['Grade 11', 'Grade 12'] },
    { id: 3, title: 'Library Renovation', author: 'Admin Dept', date: 'Oct 15, 2026', priority: 'General', content: 'The main library will be closed for renovation starting next Monday. A temporary reading room has been set up in Hall B.', tags: ['All Students', 'Faculty'] },
];

const CHATS = [
    { id: 1, name: 'Parent: Aarav Patel', role: 'Parent', avatar: 'https://i.pravatar.cc/150?img=41', lastMessage: 'Thank you for the update on Aaravs progress.', time: '10:42 AM', unread: 0 },
    { id: 2, name: '12-A Science Group', role: 'Group', avatar: 'https://i.pravatar.cc/150?img=42', lastMessage: 'Is the assignment due tomorrow?', time: '09:15 AM', unread: 3 },
    { id: 3, name: 'Diya Sharma', role: 'Student', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'Okay, I will submit it by 5.', time: 'Yesterday', unread: 0 },
];

const MESSAGES = [
    { id: 1, sender: 'them', text: 'Hello Mr. Sharma, I wanted to ask about Aaravs recent test scores. Is he struggling with Calculus?', time: '10:15 AM' },
    { id: 2, sender: 'me', text: 'Hi! Aarav is doing fine, but he needs to focus more on integration techniques. I’ve assigned him some extra practice materials.', time: '10:30 AM', status: 'read' },
    { id: 3, sender: 'them', text: 'Thank you for the update on Aaravs progress. I will make sure he completes the practice.', time: '10:42 AM' },
];

export default function Announcements() {
    const [activeTab, setActiveTab] = useState('announcements');
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [selectedChat, setSelectedChat] = useState(CHATS[0]);

    return (
        <Layout breadcrumbs={['Communication']}>
            <main className="p-8 max-w-[1600px] mx-auto w-full h-full flex flex-col">
                {/* Header & Tabs */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shadow-sm border-b border-white/5 pb-4">
                    <div className="flex space-x-6">
                        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} label="Announcements" icon={<Megaphone className="w-5 h-5 mr-2" />} />
                        <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} label="Messages" icon={<MessageSquare className="w-5 h-5 mr-2" />} badge={3} />
                    </div>
                    {activeTab === 'announcements' && (
                        <button onClick={() => setComposeOpen(true)} className="btn-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                            <Plus className="w-5 h-5 mr-2" />
                            <span>New Announcement</span>
                        </button>
                    )}
                </motion.div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">

                    {/* Announcements View */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'announcements' && (
                            <motion.div
                                key="announcements"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full flex flex-col max-w-4xl mx-auto w-full space-y-4"
                            >
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                                    <input type="text" placeholder="Search announcements..." className="w-full bg-surfaceSolid border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none" />
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                    {ANNOUNCEMENTS.map((ann, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            key={ann.id}
                                            className="glass-card p-6 border-l-4"
                                            style={{ borderLeftColor: ann.priority === 'Urgent' ? '#F43F5E' : ann.priority === 'Info' ? '#F59E0B' : '#10B981' }}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${ann.priority === 'Urgent' ? 'bg-danger/10 text-danger' :
                                                            ann.priority === 'Info' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                                                        }`}>
                                                        <Bell className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display text-lg font-bold text-white leading-tight">{ann.title}</h3>
                                                        <p className="text-xs text-textSecondary flex items-center mt-0.5">
                                                            <User className="w-3 h-3 mr-1" /> {ann.author} <span className="mx-2 line-through opacity-30">|</span>
                                                            <Clock className="w-3 h-3 mr-1" /> {ann.date}
                                                        </p>
                                                    </div>
                                                </div>
                                                <PriorityBadge priority={ann.priority} />
                                            </div>
                                            <p className="text-sm text-textSecondary leading-relaxed mb-4">{ann.content}</p>
                                            <div className="flex items-center space-x-2">
                                                {ann.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-white/5 border border-white/10 text-slate-300">Target: {tag}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Messages View */}
                        {activeTab === 'messages' && (
                            <motion.div
                                key="messages"
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                className="h-full flex flex-col md:flex-row gap-6"
                            >
                                {/* Chat List Sidebar */}
                                <div className="w-full md:w-80 glass-card flex flex-col overflow-hidden border-white/5 border shrink-0">
                                    <div className="p-4 border-b border-white/5 bg-surfaceSolid/50">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                                            <input type="text" placeholder="Search messages..." className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-primary-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                        {CHATS.map(chat => (
                                            <button
                                                key={chat.id}
                                                onClick={() => setSelectedChat(chat)}
                                                className={`w-full text-left p-4 flex items-start space-x-3 hover:bg-white/5 transition-colors relative ${selectedChat?.id === chat.id ? 'bg-primary-500/10' : ''}`}
                                            >
                                                {selectedChat?.id === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                                                <div className="relative">
                                                    <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full border border-white/10" />
                                                    {chat.unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-[#161B22] flex items-center justify-center text-[10px] font-bold text-white">{chat.unread}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className={`font-bold text-sm truncate pr-2 ${selectedChat?.id === chat.id ? 'text-white' : 'text-slate-200'}`}>{chat.name}</h4>
                                                        <span className="text-[10px] text-textSecondary whitespace-nowrap">{chat.time}</span>
                                                    </div>
                                                    <p className="text-xs text-textSecondary truncate">{chat.lastMessage}</p>
                                                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest text-textSecondary bg-background px-1.5 py-0.5 rounded border border-white/5">Role: {chat.role}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="flex-1 glass-card flex flex-col overflow-hidden border-white/5 border relative">
                                    {selectedChat ? (
                                        <>
                                            {/* Chat Header */}
                                            <div className="p-4 border-b border-white/5 bg-surfaceSolid/50 flex justify-between items-center z-10 backdrop-blur-md">
                                                <div className="flex items-center space-x-3">
                                                    <img src={selectedChat.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-white/10" />
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm">{selectedChat.name}</h3>
                                                        <p className="text-xs text-success flex items-center"><span className="w-1.5 h-1.5 bg-success rounded-full mr-1.5 animate-pulse"></span> Online</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-textSecondary hover:text-white transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                            </div>

                                            {/* Messages Area */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                                <div className="text-center text-xs text-textSecondary my-4">Today</div>
                                                {MESSAGES.map(msg => (
                                                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me' ? 'bg-primary-500 text-white rounded-br-sm shadow-[0_4px_15px_rgba(99,102,241,0.2)]' : 'bg-surfaceSolid text-slate-200 border border-white/10 rounded-bl-sm'
                                                            }`}>
                                                            {msg.text}
                                                        </div>
                                                        <div className="text-[10px] text-textSecondary mt-1 flex items-center space-x-1">
                                                            <span>{msg.time}</span>
                                                            {msg.sender === 'me' && (
                                                                <span className={msg.status === 'read' ? 'text-primary-400' : 'text-textSecondary'}>
                                                                    {msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Chat Input */}
                                            <div className="p-4 bg-surfaceSolid/50 border-t border-white/5 flex items-center space-x-3">
                                                <button className="p-2 text-textSecondary hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
                                                <input type="text" placeholder="Type a message..." className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 outline-none transition-colors" />
                                                <button className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-textSecondary">
                                            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                            <p>Select a conversation to start messaging</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Compose Announcement Modal */}
                <AnimatePresence>
                    {isComposeOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setComposeOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl glass-card z-50 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surfaceSolid/50 rounded-t-2xl">
                                    <h2 className="font-display text-xl font-bold text-white flex items-center"><Megaphone className="w-5 h-5 mr-2 text-primary-400" /> New Announcement</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <input type="text" placeholder="Announcement Title" className="input-field bg-background border-white/10 text-lg font-bold" />

                                    <div className="flex space-x-4">
                                        <select className="input-field bg-background border-white/10 flex-1">
                                            <option>Select Target Audience</option>
                                            <option>All Students</option>
                                            <option>Grade 12-A</option>
                                            <option>Faculty Only</option>
                                        </select>
                                        <select className="input-field bg-background border-white/10 w-40">
                                            <option>Priority: Info</option>
                                            <option>Priority: Urgent</option>
                                            <option>Priority: General</option>
                                        </select>
                                    </div>

                                    <div className="border border-white/10 rounded-xl overflow-hidden bg-background">
                                        <div className="flex items-center space-x-2 p-2 border-b border-white/5 bg-surfaceSolid">
                                            <button className="p-1 px-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded">B</button>
                                            <button className="p-1 px-2 text-xs italic text-slate-300 hover:text-white hover:bg-white/5 rounded">I</button>
                                            <button className="p-1 px-2 text-xs underline text-slate-300 hover:text-white hover:bg-white/5 rounded">U</button>
                                        </div>
                                        <textarea rows={6} placeholder="Type your announcement content here..." className="w-full bg-transparent p-4 text-sm text-white resize-none outline-none"></textarea>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-white/5 bg-surfaceSolid/50 rounded-b-2xl flex justify-between items-center">
                                    <button className="text-textSecondary hover:text-white text-sm font-medium flex items-center space-x-2"><Paperclip className="w-4 h-4" /> <span>Attach File</span></button>
                                    <div className="flex space-x-3">
                                        <button onClick={() => setComposeOpen(false)} className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors">Cancel</button>
                                        <button className="btn-primary" onClick={() => setComposeOpen(false)}>Publish Now</button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </main>
        </Layout>
    );
}

function TabButton({ active, onClick, label, icon, badge }) {
    return (
        <button
            onClick={onClick}
            className={`pb-4 flex items-center text-sm font-bold transition-all relative ${active ? 'text-white' : 'text-textSecondary hover:text-slate-300'
                }`}
        >
            {icon} {label}
            {badge > 0 && <span className="ml-2 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
            {active && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_8px_#6366F1]" />
            )}
        </button>
    );
}

function PriorityBadge({ priority }) {
    if (priority === 'Urgent') return <span className="bg-danger/10 text-danger border border-danger/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">🔴 Urgent</span>;
    if (priority === 'Info') return <span className="bg-warning/10 text-warning border border-warning/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">🟡 Info</span>;
    return <span className="bg-success/10 text-success border border-success/20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">🟢 General</span>;
}
