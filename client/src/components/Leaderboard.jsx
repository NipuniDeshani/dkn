import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, TrendingDown, Award, User, Sparkles, Target, Zap, ArrowUp, Brain } from 'lucide-react';
import { leaderboardAPI } from '../services/api';

const Leaderboard = ({ compact = false, onUserSelect }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [showAiPrediction, setShowAiPrediction] = useState(false);

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            const [leaderboardRes, myStatsRes] = await Promise.all([
                leaderboardAPI.getLeaderboard({ period, limit: compact ? 5 : 10 }),
                leaderboardAPI.getMyStats()
            ]);
            setLeaderboard(leaderboardRes.data);
            setMyStats(myStatsRes.data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // AI Prediction Logic (Mock)
    const getAiPrediction = () => {
        if (!myStats || !leaderboard.length) return null;

        const currentRank = myStats.rank || leaderboard.length + 1;
        const currentScore = myStats.totalScore || 0;
        const avgGrowthRate = (myStats.scores?.uploads || 0) * 10 + (myStats.scores?.validations || 0) * 5;

        // Find the person above current user
        const personAbove = leaderboard.find(e => e.rank === currentRank - 1);
        const pointsToNextRank = personAbove ? personAbove.totalScore - currentScore : 0;

        // Predicted rank change based on activity
        const predictedChange = avgGrowthRate > 20 ? -2 : avgGrowthRate > 10 ? -1 : avgGrowthRate > 5 ? 0 : 1;
        const predictedRank = Math.max(1, currentRank + predictedChange);

        // Growth trend
        const trend = avgGrowthRate > 15 ? 'rising' : avgGrowthRate > 5 ? 'stable' : 'declining';

        // AI Tips based on scores
        const tips = [];
        if ((myStats.scores?.uploads || 0) < 3) {
            tips.push({ icon: '📤', text: 'Upload more knowledge items to boost your score significantly (+10 pts each)' });
        }
        if ((myStats.scores?.validations || 0) < 5) {
            tips.push({ icon: '✅', text: 'Review pending items to earn validation points (+5 pts each)' });
        }
        if ((myStats.scores?.views || 0) < 10) {
            tips.push({ icon: '👁️', text: 'Create engaging content to increase your view count' });
        }
        if (tips.length === 0) {
            tips.push({ icon: '🌟', text: 'Excellent performance! Keep up the great work to maintain your position' });
        }

        return {
            currentRank,
            predictedRank,
            predictedChange,
            pointsToNextRank,
            trend,
            tips,
            confidence: Math.min(95, 60 + avgGrowthRate * 2)
        };
    };

    const prediction = getAiPrediction();

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="text-yellow-500" size={24} />;
            case 2: return <Medal className="text-slate-400" size={22} />;
            case 3: return <Medal className="text-amber-600" size={22} />;
            default: return <span className="text-slate-500 font-bold w-6 text-center">{rank}</span>;
        }
    };

    const getRankBg = (rank) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 2: return 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200';
            case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
            default: return 'bg-white border-slate-200';
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading leaderboard...</div>;
    }

    return (
        <div className="space-y-6">
            {!compact && (
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Leaderboard</h2>
                    <div className="flex gap-2">
                        {['all', 'weekly', 'monthly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* My Stats Card */}
            {myStats && !compact && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">Your Ranking</p>
                            <p className="text-4xl font-bold">#{myStats.rank || '-'}</p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold">{myStats.scores?.uploads || 0}</p>
                            <p className="text-blue-100 text-xs">Uploads</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{myStats.scores?.validations || 0}</p>
                            <p className="text-blue-100 text-xs">Reviews</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{myStats.scores?.views || 0}</p>
                            <p className="text-blue-100 text-xs">Views</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{myStats.totalScore || 0}</p>
                            <p className="text-blue-100 text-xs">Total</p>
                        </div>
                    </div>
                    {myStats.streaks?.currentStreak > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <Award size={16} />
                            <span>{myStats.streaks.currentStreak} day streak!</span>
                        </div>
                    )}
                </div>
            )}

            {/* AI Prediction Panel */}
            {!compact && prediction && (
                <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-200 overflow-hidden">
                    <button
                        onClick={() => setShowAiPrediction(!showAiPrediction)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-100/50 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Brain className="text-white" size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    AI Rank Prediction
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                        {prediction.confidence}% confident
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-500">View your predicted performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {prediction.trend === 'rising' && (
                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                    <TrendingUp size={16} /> Rising
                                </span>
                            )}
                            {prediction.trend === 'stable' && (
                                <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                                    <Target size={16} /> Stable
                                </span>
                            )}
                            {prediction.trend === 'declining' && (
                                <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                                    <TrendingDown size={16} /> Needs Focus
                                </span>
                            )}
                            <Sparkles size={20} className={`text-purple-500 transition-transform ${showAiPrediction ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {showAiPrediction && (
                        <div className="px-6 pb-6 space-y-4">
                            {/* Prediction Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Predicted Rank (Next Week)</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-purple-600">#{prediction.predictedRank}</span>
                                        {prediction.predictedChange < 0 && (
                                            <span className="flex items-center gap-0.5 text-green-600 text-sm font-semibold bg-green-50 px-2 py-0.5 rounded">
                                                <ArrowUp size={14} /> {Math.abs(prediction.predictedChange)}
                                            </span>
                                        )}
                                        {prediction.predictedChange > 0 && (
                                            <span className="flex items-center gap-0.5 text-red-600 text-sm font-semibold bg-red-50 px-2 py-0.5 rounded">
                                                <TrendingDown size={14} /> {prediction.predictedChange}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Points to Next Rank</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-indigo-600">
                                            {prediction.pointsToNextRank > 0 ? prediction.pointsToNextRank : '🏆'}
                                        </span>
                                        {prediction.pointsToNextRank > 0 && (
                                            <span className="text-sm text-slate-500">points needed</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Activity Score</p>
                                    <div className="flex items-center gap-2">
                                        <Zap className="text-yellow-500" size={24} />
                                        <span className="text-3xl font-bold text-slate-700">
                                            {((myStats.scores?.uploads || 0) * 10 + (myStats.scores?.validations || 0) * 5)}
                                        </span>
                                        <span className="text-sm text-slate-500">/ week</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Tips */}
                            <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
                                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                    <Sparkles size={16} className="text-purple-500" />
                                    AI Recommendations to Improve Your Rank
                                </h4>
                                <div className="space-y-2">
                                    {prediction.tips.map((tip, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                            <span className="text-lg">{tip.icon}</span>
                                            <p className="text-sm text-slate-600">{tip.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Leaderboard List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {compact && (
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-semibold text-slate-700">Top Contributors</h3>
                    </div>
                )}
                <div className="divide-y divide-slate-100">
                    {leaderboard.map((entry, index) => (
                        <div
                            key={entry._id}
                            onClick={() => onUserSelect && onUserSelect(entry.user)}
                            className={`flex items-center gap-4 p-4 ${getRankBg(entry.rank)} ${onUserSelect ? 'cursor-pointer hover:shadow-md transition' : ''}`}
                        >
                            <div className="flex items-center justify-center w-8">
                                {getRankIcon(entry.rank)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                        <User size={16} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{entry.user?.username}</p>
                                        <p className="text-xs text-slate-500">{entry.user?.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-800">{entry.totalScore}</p>
                                <p className="text-xs text-slate-500">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges Section */}
            {myStats?.badges?.length > 0 && !compact && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Your Badges</h3>
                    <div className="flex flex-wrap gap-3">
                        {myStats.badges.map((badge, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg"
                            >
                                <Award size={16} />
                                <span className="text-sm font-medium">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
