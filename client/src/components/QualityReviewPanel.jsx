import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Archive, Eye, RefreshCw, AlertOctagon } from 'lucide-react';
import { knowledgeAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const QualityReviewPanel = () => {
    const [flaggedItems, setFlaggedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFlaggedItems();
    }, []);

    const fetchFlaggedItems = async () => {
        try {
            const { data } = await knowledgeAPI.getAll({ flagged: 'true' });
            setFlaggedItems(data);
        } catch (error) {
            console.error('Failed to fetch flagged items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setProcessing(true);
        try {
            if (action === 'safe') {
                await knowledgeAPI.manageQuality(id, { action: 'mark_safe' });
            } else if (action === 'archive') {
                await knowledgeAPI.archive(id);
                // Also clear quality flag to remove from list
                await knowledgeAPI.manageQuality(id, { action: 'mark_safe' });
            }
            fetchFlaggedItems();
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center py-8">Loading quality review queue...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Content Quality Review</h2>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    {flaggedItems.length} Flagged Items
                </span>
            </div>

            {flaggedItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                    <h3 className="text-lg font-medium text-slate-700">All Content is Healthy</h3>
                    <p className="text-slate-500">No items flagged for quality issues.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {flaggedItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-sm border border-l-4 border-l-red-500 overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="text-red-500" size={20} />
                                        <h3 className="font-bold text-slate-800">{item.title}</h3>
                                    </div>
                                    <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">
                                        Score: {item.qualityScore}/100
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600 mb-3">
                                    <p className="font-medium text-slate-700">Detected Issues:</p>
                                    <ul className="list-disc list-inside text-red-600">
                                        {item.qualityIssues && item.qualityIssues.length > 0
                                            ? item.qualityIssues.map((issue, i) => <li key={i}>{issue}</li>)
                                            : <li>General Quality Flag</li>
                                        }
                                    </ul>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                                    <div className="text-xs text-slate-500 flex gap-4">
                                        <span>Author: {item.author?.username || 'Unknown'}</span>
                                        <span>Duplicates: {item.aiAnalysis?.duplicateScore || 0}%</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/knowledge/${item._id}`)}
                                            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded flex items-center gap-1"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                        <button
                                            onClick={() => handleAction(item._id, 'safe')}
                                            disabled={processing}
                                            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <CheckCircle size={16} /> Mark Safe
                                        </button>
                                        <button
                                            onClick={() => handleAction(item._id, 'archive')}
                                            disabled={processing}
                                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <Archive size={16} /> Archive
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-3">
                <AlertOctagon className="shrink-0 mt-0.5" size={18} />
                <div>
                    <p className="font-bold mb-1">About Quality Review</p>
                    <p>Items listed here have been flagged by the automated NLP engine due to potential issues such as high duplicate scores, negative sentiment, or low readability. Please review them and take appropriate action.</p>
                </div>
            </div>
        </div>
    );
};

export default QualityReviewPanel;
