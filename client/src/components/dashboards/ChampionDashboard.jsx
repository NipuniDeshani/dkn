import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ClipboardList, TrendingUp, Users, AlertTriangle, Presentation } from 'lucide-react';
import api from '../../services/api';
import ValidationQueue from '../ValidationQueue';
import Leaderboard from '../Leaderboard';
import MentorshipPanel from '../MentorshipPanel';
import QualityReviewPanel from '../QualityReviewPanel';
import TrainingManagementPanel from '../TrainingManagementPanel';

const ChampionDashboard = ({ stats }) => {
    const [activeTab, setActiveTab] = useState('queue');

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Review Queue</h3>
                    <p className="text-4xl font-extrabold text-purple-600">{stats?.pendingApprovals || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={14} className="text-purple-400" /> Items awaiting review
                    </p>
                </div>
                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Approved This Week</h3>
                    <p className="text-4xl font-extrabold text-green-600">{stats?.approvedThisWeek || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <CheckCircle size={14} className="text-green-400" /> Knowledge items approved
                    </p>
                </div>
                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Flagged for Revision</h3>
                    <p className="text-4xl font-extrabold text-orange-600">{stats?.flaggedItems || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <AlertTriangle size={14} className="text-orange-400" /> Needs author attention
                    </p>
                </div>
            </div>

            {/* Pill Navigation */}
            <div className="bg-slate-100/80 p-1.5 rounded-xl inline-flex gap-1 overflow-x-auto max-w-full backdrop-blur-sm">
                {[
                    { id: 'queue', label: 'Validation Queue', icon: ClipboardList, badge: stats?.pendingApprovals },
                    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
                    { id: 'mentorship', label: 'Mentorship', icon: Users },
                    { id: 'quality', label: 'Quality Review', icon: AlertTriangle },
                    { id: 'training', label: 'Training', icon: Presentation },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm shadow-slate-200 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'stroke-2' : 'stroke-[1.5]'} />
                        {tab.label}
                        {tab.badge > 0 && (
                            <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'queue' && <ValidationQueue />}
            {activeTab === 'leaderboard' && <Leaderboard />}
            {activeTab === 'mentorship' && <MentorshipPanel />}
            {activeTab === 'quality' && <QualityReviewPanel />}
            {activeTab === 'training' && <TrainingManagementPanel />}
        </div>
    );
};

export default ChampionDashboard;
