import React, { useState, useEffect } from 'react';
import { Shield, Archive, AlertTriangle, Users, FileText, Settings, Clock } from 'lucide-react';
import { adminAPI, knowledgeAPI } from '../../services/api';
import AuditLogViewer from '../AuditLogViewer';
import ValidationQueue from '../ValidationQueue';

const GovernanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [archivedItems, setArchivedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, archivedRes] = await Promise.all([
                adminAPI.getSystemStats(),
                knowledgeAPI.getAll({ status: 'Archived' })
            ]);
            setStats(statsRes.data);
            setArchivedItems(archivedRes.data);
        } catch (error) {
            console.error('Failed to fetch governance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (itemId) => {
        if (!confirm('Are you sure you want to archive this item?')) return;
        try {
            await knowledgeAPI.archive(itemId);
            fetchData();
        } catch (error) {
            console.error('Archive failed:', error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading governance dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header with Role Badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                        <Shield className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Governance Dashboard</h2>
                        <p className="text-slate-500">Oversight and compliance management</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Users className="text-blue-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.users?.total || 0}</p>
                            <p className="text-sm text-slate-500">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <FileText className="text-green-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.knowledge?.approved || 0}</p>
                            <p className="text-sm text-slate-500">Approved Items</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Clock className="text-yellow-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stats?.knowledge?.pending || 0}</p>
                            <p className="text-sm text-slate-500">Pending Review</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                        <Archive className="text-slate-500" size={20} />
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{archivedItems.length}</p>
                            <p className="text-sm text-slate-500">Archived</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                {[
                    { id: 'overview', label: 'Overview', icon: Shield },
                    { id: 'validations', label: 'Validations', icon: Clock },
                    { id: 'audit', label: 'Audit Logs', icon: FileText },
                    { id: 'archived', label: 'Archived', icon: Archive }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-px ${activeTab === tab.id
                                ? 'border-purple-600 text-purple-600'
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
                    {/* User Distribution */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">User Distribution by Role</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                                <div key={role} className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-2xl font-bold text-slate-800">{count}</p>
                                    <p className="text-sm text-slate-500">{role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Recent System Activity</h3>
                        <div className="space-y-3">
                            {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FileText size={14} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700">{activity.action}</p>
                                            <p className="text-sm text-slate-500">{activity.actor?.username || 'System'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'validations' && <ValidationQueue />}

            {activeTab === 'audit' && <AuditLogViewer />}

            {activeTab === 'archived' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    {archivedItems.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Archive className="mx-auto mb-3" size={48} />
                            <p>No archived items</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {archivedItems.map(item => (
                                <div key={item._id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-slate-800">{item.title}</h4>
                                        <p className="text-sm text-slate-500">{item.category} • Archived on {new Date(item.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">Archived</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GovernanceDashboard;
