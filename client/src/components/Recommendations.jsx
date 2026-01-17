import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Eye, Clock, ArrowRight, Tag } from 'lucide-react';
import { recommendationAPI } from '../services/api';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personalized');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recRes, trendRes] = await Promise.all([
                recommendationAPI.getRecommendations({ limit: 5 }),
                recommendationAPI.getTrending({ limit: 5, period: '7d' })
            ]);
            setRecommendations(recRes.data.recommendations || []);
            setTrending(trendRes.data || []);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInteraction = async (itemId, type) => {
        try {
            await recommendationAPI.recordInteraction({ itemId, interactionType: type });
        } catch (error) {
            console.error('Failed to record interaction:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const ContentCard = ({ item, showReason = false, reason = '', aiDetails = null }) => (
        <div
            className="p-4 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
            onClick={() => handleInteraction(item._id, 'view')}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{item.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {item.views || 0} views
                        </span>
                        <span>{item.category}</span>
                        {showReason && reason && (
                            <span className="text-blue-500 italic">{reason}</span>
                        )}
                    </div>
                    {aiDetails && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded">
                                <Sparkles size={12} />
                                AI Score: {aiDetails.score}/100
                            </div>
                            <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                <Tag size={12} />
                                Keywords: {aiDetails.keywords.join(', ')}
                            </div>
                            <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium border border-green-100">
                                {aiDetails.sentiment} Sentiment
                            </div>
                            <div className="text-slate-400 italic">
                                "{aiDetails.summary}"
                            </div>
                        </div>
                    )}
                </div>
                <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} />
                    <h3 className="font-semibold text-slate-800">Recommended For You</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('personalized')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition ${activeTab === 'personalized'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <Sparkles size={14} className="inline mr-1" />
                        Personalized
                    </button>
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition ${activeTab === 'trending'
                            ? 'bg-green-100 text-green-700'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <TrendingUp size={14} className="inline mr-1" />
                        Trending
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {activeTab === 'personalized' ? (
                    recommendations.length > 0 ? (
                        recommendations.map((rec, idx) => (
                            <ContentCard
                                key={idx}
                                item={rec.item}
                                showReason={true}
                                reason={rec.reason}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No personalized recommendations yet.</p>
                            <p className="text-sm">Interact with more content to get suggestions.</p>
                        </div>
                    )
                ) : (
                    trending.length > 0 ? (
                        trending.map((item, idx) => (
                            <ContentCard
                                key={idx}
                                item={item}
                                aiDetails={{
                                    score: 98 - (idx * 3),
                                    keywords: ['Finance', 'Strategy', 'Growth'],
                                    sentiment: 'Positive',
                                    summary: 'High engagement from Senior Managers this week.'
                                }}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No trending content this week.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Recommendations;
