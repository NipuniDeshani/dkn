import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, Briefcase, Clock } from 'lucide-react';
import { knowledgeAPI, leaderboardAPI, dashboardAPI } from '../../services/api';
import Leaderboard from '../Leaderboard';
import PerformanceDetailPanel from '../PerformanceDetailPanel';

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [teamStats, setTeamStats] = useState(null);
    const [recentItems, setRecentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, itemsRes] = await Promise.all([
                dashboardAPI.getStats(),
                knowledgeAPI.getAll({ limit: 10 })
            ]);
            setTeamStats(statsRes.data);
            setRecentItems(itemsRes.data);
        } catch (error) {
            console.error('Failed to fetch manager data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading manager dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="text-blue-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Project Manager Dashboard</h2>
                    <p className="text-slate-500">Team performance and knowledge metrics</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teamStats?.totalKnowledge || 0}</p>
                            <p className="text-sm text-slate-500">Total Knowledge</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Clock className="text-yellow-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teamStats?.pendingApprovals || 0}</p>
                            <p className="text-sm text-slate-500">Pending Review</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Users className="text-green-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teamStats?.activeContributors || 0}</p>
                            <p className="text-sm text-slate-500">Active Contributors</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-purple-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{teamStats?.weeklyGrowth || 0}%</p>
                            <p className="text-sm text-slate-500">Weekly Growth</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'leaderboard', label: 'Team Performance', icon: TrendingUp },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-px ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Recent Knowledge Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">Recent Knowledge Items</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {recentItems.slice(0, 5).map(item => (
                                <div key={item._id} className="px-6 py-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-slate-800">{item.title}</h4>
                                        <p className="text-sm text-slate-500">
                                            {item.category} • {item.author?.username || 'Unknown'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Knowledge by Category</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['Strategy', 'Technical', 'Market Research', 'Operations', 'Finance'].map(category => {
                                const count = recentItems.filter(i => i.category === category).length;
                                return (
                                    <div key={category} className="text-center p-4 bg-slate-50 rounded-lg">
                                        <p className="text-2xl font-bold text-slate-800">{count}</p>
                                        <p className="text-sm text-slate-500">{category}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
    );
};

export default ManagerDashboard;
