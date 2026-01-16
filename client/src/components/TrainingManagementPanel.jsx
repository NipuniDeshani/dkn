import React, { useState, useEffect } from 'react';
import { Calendar, Users, Video, Clock, Plus, CheckCircle } from 'lucide-react';
import { trainingAPI } from '../services/api';

const TrainingManagementPanel = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        scheduledDate: '',
        duration: 60,
        meetingLink: '',
        maxParticipants: 50
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await trainingAPI.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await trainingAPI.createSession(newItem);
            setShowCreateForm(false);
            setNewItem({ title: '', description: '', scheduledDate: '', duration: 60, meetingLink: '', maxParticipants: 50 });
            fetchSessions();
        } catch (error) {
            alert('Failed to create session: ' + error.response?.data?.message);
        }
    };

    if (loading) return <div>Loading sessions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Training Sessions</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Schedule Session
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
                    <h3 className="font-bold text-lg mb-4">Schedule New Session (UC09)</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                className="w-full p-2 border rounded"
                                value={newItem.scheduledDate}
                                onChange={e => setNewItem({ ...newItem, scheduledDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newItem.duration}
                                onChange={e => setNewItem({ ...newItem, duration: Number(e.target.value) })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Meeting Link</label>
                            <input
                                className="w-full p-2 border rounded"
                                value={newItem.meetingLink}
                                onChange={e => setNewItem({ ...newItem, meetingLink: e.target.value })}
                                placeholder="https://zoom.us/j/..."
                            />
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Schedule Session
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {sessions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-500">No upcoming sessions provided.</p>
                    </div>
                ) : (
                    sessions.map(session => (
                        <div key={session._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
                            <div className="flex flex-col md:flex-row">
                                {/* Date Ticket Stub */}
                                <div className="bg-blue-50 p-6 flex flex-col items-center justify-center min-w-[120px] border-b md:border-b-0 md:border-r border-blue-100">
                                    <span className="text-blue-600 font-bold text-xl">{new Date(session.scheduledDate).getDate()}</span>
                                    <span className="text-blue-400 font-medium uppercase text-sm">{new Date(session.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-slate-400 text-xs mt-1">{new Date(session.scheduledDate).getFullYear()}</span>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full font-bold ${session.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {session.status}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <Clock size={12} /> {new Date(session.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{session.title}</h3>
                                        <p className="text-sm text-slate-600 line-clamp-1">{session.description}</p>

                                        <div className="flex gap-4 text-xs text-slate-500 mt-3 font-medium">
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={12} /> {session.duration} mins</span>
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Users size={12} /> {session.attendees.length} / {session.maxParticipants} Registered</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end w-full md:w-auto">
                                        {session.meetingLink && (
                                            <a
                                                href={session.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                                            >
                                                <Video size={16} /> Join Meeting
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TrainingManagementPanel;
