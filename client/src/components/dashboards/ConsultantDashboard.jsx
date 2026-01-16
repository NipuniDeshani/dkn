import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, PlusCircle, Eye, TrendingUp, Star, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { knowledgeAPI, recommendationAPI } from '../../services/api';
import SearchBar from '../SearchBar';
import UploadForm from '../UploadForm';
import Leaderboard from '../Leaderboard';

const ConsultantDashboard = ({ stats }) => {
    const navigate = useNavigate();
    const [showUpload, setShowUpload] = useState(false);
    const [activeTab, setActiveTab] = useState('browse');
    const [knowledgeItems, setKnowledgeItems] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchKnowledge();
        fetchRecommendations();
    }, []);

    const fetchKnowledge = async (filters = {}) => {
        setLoading(true);
        try {
            const { data } = await knowledgeAPI.getAll(filters);
            setKnowledgeItems(data);
        } catch (error) {
            console.error('Failed to fetch knowledge:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const { data } = await recommendationAPI.getRecommendations({ limit: 4 });
            setRecommendations(data.recommendations || []);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        }
    };

    const handleSearch = (searchParams) => {
        fetchKnowledge({
            search: searchParams.query,
            category: searchParams.category,
            status: searchParams.status
        });
    };

    // ... (rest of helper functions same as before) ...
    const handleUploadSuccess = () => {
        setShowUpload(false);
        setMessage('Upload successful! Item is pending review.');
        fetchKnowledge();
        setTimeout(() => setMessage(''), 5000);
    };

    const getStatusBadge = (status) => {
        const colors = {
            Approved: 'bg-green-100 text-green-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Rejected: 'bg-red-100 text-red-700',
            Revision: 'bg-orange-100 text-orange-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}


            {/* AI Recommendations Section */}
            {!showUpload && activeTab === 'browse' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="text-purple-600" size={20} />
                        <h2 className="text-lg font-bold text-slate-800">AI Recommendations</h2>
                        <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-purple-100 text-purple-600 font-medium">
                            Personalized
                        </span>
                    </div>

                    {recommendations.filter(rec => rec.item).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recommendations.filter(rec => rec.item).map((rec) => (
                                <div
                                    key={rec.item._id}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/knowledge/${rec.item._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            {rec.item.category}
                                        </span>
                                        <span className="text-green-600 text-xs font-bold">
                                            {Math.round(rec.score * 100)}% match
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-2 min-h-[40px]">
                                        {rec.item.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Book size={12} />
                                        <span>{rec.reason || 'Based on your interests'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 bg-white/50 rounded-lg border border-purple-100 border-dashed">
                            <Star className="mx-auto text-purple-300 mb-2" size={32} />
                            <p className="font-medium text-slate-600">No recommendations yet</p>
                            <p className="text-sm">Start browsing and viewing content to get personalized suggestions!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Success Message */}
            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center gap-2">
                    <FileText size={18} />
                    {message}
                </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setActiveTab('browse'); setShowUpload(false); }}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'browse' && !showUpload
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <Search size={18} className="inline mr-2" />
                        Browse
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'leaderboard'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <TrendingUp size={18} className="inline mr-2" />
                        Leaderboard
                    </button>
                </div>
                <button
                    onClick={() => { setShowUpload(true); setActiveTab('browse'); }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <PlusCircle size={18} />
                    <span>Upload Knowledge</span>
                </button>
            </div>

            {/* Upload Form */}
            {showUpload && (
                <UploadForm
                    onSuccess={handleUploadSuccess}
                    onCancel={() => setShowUpload(false)}
                />
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && !showUpload && (
                <div className="space-y-6">
                    <SearchBar onSearch={handleSearch} />

                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : knowledgeItems.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-slate-700">No knowledge items found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {knowledgeItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/knowledge/${item._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-slate-800 line-clamp-1">{item.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{item.category}</span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {item.views || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && <Leaderboard />}
        </div>
    );
};

export default ConsultantDashboard;
