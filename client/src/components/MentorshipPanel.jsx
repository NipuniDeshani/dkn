import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Clock, CheckCircle, BookOpen, Send } from 'lucide-react';
import { mentorshipAPI } from '../services/api';

const MentorshipPanel = () => {
    const [mentorships, setMentorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentorship, setSelectedMentorship] = useState(null);
    const [sessionNote, setSessionNote] = useState('');
    const [duration, setDuration] = useState(30);

    useEffect(() => {
        fetchMentorships();
    }, []);

    const fetchMentorships = async () => {
        try {
            const { data } = await mentorshipAPI.getAll({ role: 'mentor' });
            setMentorships(data);
        } catch (error) {
            console.error('Failed to fetch mentorships:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogSession = async (e) => {
        e.preventDefault();
        if (!selectedMentorship) return;

        try {
            await mentorshipAPI.addSession(selectedMentorship._id, {
                duration,
                notes: sessionNote,
                topics: ['General Guidance'] // Simplified for now
            });
            setSessionNote('');
            setSelectedMentorship(null);
            fetchMentorships(); // Refresh to show updated date/stats if we tracked them
            alert('Session logged successfully!');
        } catch (error) {
            console.error('Failed to log session:', error);
            alert('Failed to log session');
        }
    };

    if (loading) return <div className="text-center py-8 text-slate-500">Loading mentorships...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">My Mentees</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {mentorships.length} Active
                </span>
            </div>

            {mentorships.length === 0 ? (
                <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
                    <User className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-500">You don't have any active mentorships yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentorships.map(m => (
                        <div key={m._id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {m.mentee.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{m.mentee.username}</h3>
                                        <p className="text-xs text-slate-500">{m.mentee.role}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded font-medium ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100'
                                    }`}>
                                    {m.status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-slate-600 mb-1 font-medium">Focus Areas:</p>
                                <div className="flex flex-wrap gap-1">
                                    {m.focusAreas?.map((area, i) => (
                                        <span key={i} className="bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                            {area}
                                        </span>
                                    )) || <span className="text-xs text-slate-400">None defined</span>}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedMentorship(m)}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                            >
                                <MessageSquare size={16} />
                                Provide Guidance
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Session Logging Modal */}
            {selectedMentorship && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Log Session with {selectedMentorship.mentee.username}</h3>
                        <form onSubmit={handleLogSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                                <div className="flex items-center gap-2">
                                    <Clock className="text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={e => setDuration(parseInt(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Guidance / Notes</label>
                                <textarea
                                    value={sessionNote}
                                    onChange={e => setSessionNote(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 h-32"
                                    placeholder="Describe the guidance provided or topics discussed..."
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMentorship(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Log Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipPanel;
