import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, FileText, CheckCircle, Eye, Star, Briefcase } from 'lucide-react';
import { knowledgeAPI, managerAPI } from '../services/api';

const PerformanceDetailPanel = ({ user, onBack }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserItems = async () => {
            try {
                const { data } = await knowledgeAPI.getAll({ author: user._id });
                setItems(data);
            } catch (error) {
                console.error('Failed to fetch user items:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchUserItems();
        }
    }, [user]);

    // Calculate aggregated stats
    const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
    const approvedCount = items.filter(i => i.status === 'Approved').length;
    const avgQuality = items.length > 0
        ? items.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / items.length
        : 0;

    // Promotion Criteria Defaults
    const CRITERIA = {
        minUploads: 5,
        minQuality: 80,
        minViews: 50
    };

    const criteriaChecks = {
        uploads: items.length >= CRITERIA.minUploads,
        quality: avgQuality >= CRITERIA.minQuality,
        views: totalViews >= CRITERIA.minViews
    };

    const isEligible = Object.values(criteriaChecks).every(Boolean);

    // Evaluation State
    const [evalStatus, setEvalStatus] = useState(user.promotionStatus || 'None');
    const [evalNotes, setEvalNotes] = useState(user.promotionNotes || '');
    const [saving, setSaving] = useState(false);

    const handleEvaluation = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await managerAPI.evaluateUser(user._id, {
                status: evalStatus,
                notes: evalNotes
            });
            alert('Evaluation saved successfully!');
        } catch (error) {
            console.error('Failed to save evaluation:', error);
            alert('Failed to save evaluation');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ... (Header and Profile Card as before) ... */}

            {/* Header / Back */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Performance Detail</h2>
                    <p className="text-slate-500">In-depth view of {user.username}'s contributions</p>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{user.username}</h3>
                        <p className="text-slate-500">{user.role} • {user.region || 'Global'}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Current Standing</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${evalStatus === 'Recommended' ? 'bg-green-100 text-green-700' :
                        evalStatus === 'Monitoring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {evalStatus}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Overview */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="text-blue-500" size={18} />
                            <span className="text-sm text-slate-500">Total Uploads</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{items.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="text-green-500" size={18} />
                            <span className="text-sm text-slate-500">Approved</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{approvedCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Eye className="text-purple-500" size={18} />
                            <span className="text-sm text-slate-500">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{totalViews}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="text-amber-500" size={18} />
                            <span className="text-sm text-slate-500">Quality Score</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{Math.round(avgQuality)}%</p>
                    </div>
                </div>

                {/* Promotion Criteria Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:row-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Promotion Eligibility</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Min Uploads ({CRITERIA.minUploads})</span>
                            {criteriaChecks.uploads ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <span className="text-xs text-red-500">Needs {CRITERIA.minUploads - items.length} more</span>
                            )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${criteriaChecks.uploads ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (items.length / CRITERIA.minUploads) * 100)}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-slate-600">Avg Quality ({CRITERIA.minQuality}%)</span>
                            {criteriaChecks.quality ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <span className="text-xs text-red-500">{Math.round(avgQuality)}%</span>
                            )}
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${criteriaChecks.quality ? 'bg-green-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, avgQuality)}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-slate-600">Visibility ({CRITERIA.minViews} views)</span>
                            {criteriaChecks.views ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <span className="text-xs text-red-500">{totalViews}/{CRITERIA.minViews}</span>
                            )}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-center mb-6 text-sm font-semibold ${isEligible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {isEligible ? 'Eligible for Promotion Review' : 'Criteria Not Met'}
                    </div>

                    <form onSubmit={handleEvaluation} className="space-y-3 pt-4 border-t border-slate-100">
                        <h4 className="font-medium text-slate-800 text-sm">Record Decision</h4>
                        <select
                            value={evalStatus}
                            onChange={(e) => setEvalStatus(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="None">No Action</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Recommended">Recommended</option>
                            <option value="Not Ready">Not Ready</option>
                        </select>
                        <textarea
                            value={evalNotes}
                            onChange={(e) => setEvalNotes(e.target.value)}
                            placeholder="Add evaluation notes..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-20 resize-none"
                        ></textarea>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Evaluation'}
                        </button>
                    </form>
                </div>

                {/* Contributions List (spans 2 columns) */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Contributions History</h3>
                    </div>
                    {/* ... list content ... */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading history...</div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No contributions found.</div>
                        ) : (
                            items.map(item => (
                                <div key={item._id} className="p-6 hover:bg-slate-50 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-slate-800">{item.title}</h4>
                                            <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-slate-500 mt-2">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded">{item.category}</span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} /> {item.views}
                                        </span>
                                        <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDetailPanel;
