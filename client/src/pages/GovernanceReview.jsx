import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle, Eye, ThumbsUp, ThumbsDown, MessageSquare, RefreshCw } from 'lucide-react';
import { knowledgeAPI, validationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * GovernanceReview Page
 * Use Case: Governance Review
 * Actor: Governance Council
 * 
 * This page implements the governance review workflow for knowledge items
 * that require policy compliance verification and final approval.
 */
const GovernanceReview = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        fetchReviewItems();
    }, [filter]);

    const fetchReviewItems = async () => {
        try {
            setLoading(true);
            const { data } = await knowledgeAPI.getAll({
                status: filter === 'pending' ? 'Pending' : filter,
                limit: 50
            });
            // API returns items directly as array or as data.items
            setItems(Array.isArray(data) ? data : (data.items || []));
        } catch (error) {
            console.error('Failed to fetch review items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setActionLoading(id);
            await knowledgeAPI.review(id, { status: 'Approved', comment: reviewComment || 'Approved by Governance Council' });
            setReviewComment('');
            setSelectedItem(null);
            await fetchReviewItems();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve item');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!reviewComment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            setActionLoading(id);
            await knowledgeAPI.review(id, { status: 'Rejected', comment: reviewComment });
            setReviewComment('');
            setSelectedItem(null);
            await fetchReviewItems();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject item');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestRevision = async (id) => {
        if (!reviewComment.trim()) {
            alert('Please provide revision feedback');
            return;
        }
        try {
            setActionLoading(id);
            await knowledgeAPI.review(id, { status: 'Revision', comment: reviewComment });
            setReviewComment('');
            setSelectedItem(null);
            await fetchReviewItems();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to request revision');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Approved: 'bg-green-100 text-green-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Rejected: 'bg-red-100 text-red-700',
            Revision: 'bg-orange-100 text-orange-700'
        };
        const icons = {
            Approved: <CheckCircle size={14} />,
            Pending: <Clock size={14} />,
            Rejected: <XCircle size={14} />,
            Revision: <AlertCircle size={14} />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-purple-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Governance Review</h1>
                        <p className="text-slate-500 text-sm">Review and approve knowledge items for policy compliance</p>
                    </div>
                </div>
                <button
                    onClick={fetchReviewItems}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                {[
                    { id: 'pending', label: 'Pending Review', count: filter === 'pending' ? items.length : undefined },
                    { id: 'Approved', label: 'Approved', count: filter === 'Approved' ? items.length : undefined },
                    { id: 'Rejected', label: 'Rejected', count: filter === 'Rejected' ? items.length : undefined },
                    { id: 'Revision', label: 'Needs Revision', count: filter === 'Revision' ? items.length : undefined }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 font-medium border-b-2 -mb-px transition ${filter === tab.id
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Review Items */}
            {items.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <Shield size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No items to review</p>
                    <p className="text-sm">All knowledge items have been processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div
                            key={item._id}
                            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                                <span>Category: <strong>{item.category}</strong></span>
                                <span>Region: <strong>{item.region}</strong></span>
                                <span>Author: <strong>{item.author?.username}</strong></span>
                                <span>Submitted: <strong>{new Date(item.createdAt).toLocaleDateString()}</strong></span>
                            </div>

                            {/* Actions */}
                            {item.status === 'Pending' && (
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    {selectedItem === item._id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="Enter review comments (required for rejection/revision)..."
                                                rows={3}
                                                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                                            />
                                            {!reviewComment.trim() && (
                                                <p className="text-xs text-slate-500 italic">
                                                    * Comment required to Request Revision or Reject
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(item._id)}
                                                    disabled={actionLoading === item._id}
                                                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    <ThumbsUp size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRequestRevision(item._id)}
                                                    disabled={actionLoading === item._id || !reviewComment.trim()}
                                                    className={`flex items-center gap-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${!reviewComment.trim() ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
                                                        }`}
                                                >
                                                    <AlertCircle size={16} />
                                                    Request Revision
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item._id)}
                                                    disabled={actionLoading === item._id || !reviewComment.trim()}
                                                    className={`flex items-center gap-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${!reviewComment.trim() ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
                                                        }`}
                                                >
                                                    <ThumbsDown size={16} />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedItem(null); setReviewComment(''); }}
                                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/knowledge/${item._id}`)}
                                                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => setSelectedItem(item._id)}
                                                className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                            >
                                                <MessageSquare size={16} />
                                                Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GovernanceReview;
