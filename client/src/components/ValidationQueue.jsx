import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Clock, User, FileText } from 'lucide-react';
import { validationAPI } from '../services/api';

const ValidationQueue = () => {
    const [validations, setValidations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchValidations();
    }, []);

    const fetchValidations = async () => {
        try {
            // Fetch all validations - backend handles RBAC filtering
            const { data } = await validationAPI.getAll();
            setValidations(data);
        } catch (error) {
            console.error('Failed to fetch validations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (validationId, status) => {
        setProcessing(true);
        try {
            await validationAPI.update(validationId, {
                status,
                reviewNotes,
                revisionComments: status === 'RevisionRequested' ? reviewNotes : undefined
            });
            setReviewNotes('');
            setSelectedItem(null);
            fetchValidations();
        } catch (error) {
            console.error('Review failed:', error);
        } finally {
            setProcessing(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-700';
            case 'High': return 'bg-orange-100 text-orange-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Low': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="text-green-500" size={18} />;
            case 'Rejected': return <XCircle className="text-red-500" size={18} />;
            case 'RevisionRequested': return <RotateCcw className="text-yellow-500" size={18} />;
            default: return <Clock className="text-blue-500" size={18} />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading validation queue...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Validation Queue</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {validations.filter(v => v.status === 'Pending').length} Pending
                </span>
            </div>

            {validations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                    <h3 className="text-lg font-medium text-slate-700">All caught up!</h3>
                    <p className="text-slate-500">No pending validations in your queue.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {validations.map((validation) => (
                        <div
                            key={validation._id}
                            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(validation.status)}
                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {validation.knowledgeItem?.title || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Category: {validation.knowledgeItem?.category}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(validation.priority)}`}>
                                        {validation.priority}
                                    </span>
                                </div>

                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                    {validation.knowledgeItem?.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {validation.knowledgeItem?.author?.username || 'Unknown'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(validation.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {validation.status === 'Pending' && (
                                        <button
                                            onClick={() => setSelectedItem(selectedItem === validation._id ? null : validation._id)}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            {selectedItem === validation._id ? 'Cancel' : 'Review'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {selectedItem === validation._id && (
                                <div className="border-t border-slate-200 bg-slate-50 p-4">
                                    <textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add review notes (optional)..."
                                        className="w-full border border-slate-200 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(validation._id, 'Approved')}
                                            disabled={processing}
                                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(validation._id, 'RevisionRequested')}
                                            disabled={processing}
                                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                                        >
                                            <RotateCcw size={18} />
                                            Request Revision
                                        </button>
                                        <button
                                            onClick={() => handleReview(validation._id, 'Rejected')}
                                            disabled={processing}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ValidationQueue;
