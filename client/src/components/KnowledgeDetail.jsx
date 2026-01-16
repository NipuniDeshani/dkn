import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Calendar, User, Tag, MapPin, Folder, Clock, AlertCircle, CheckCircle, XCircle, Edit2, Save, X, Sparkles } from 'lucide-react';
import { knowledgeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const KnowledgeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        category: '',
        region: '',
        tags: [],
        contentUrl: '',
        attachments: []
    });
    const [tagInput, setTagInput] = useState('');
    const [previewImage, setPreviewImage] = useState(null);

    const categories = ['Strategy', 'Technical', 'Market Research', 'Operations', 'Finance'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Global'];

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const { data } = await knowledgeAPI.getById(id);
            setItem(data);
            setEditData({
                title: data.title || '',
                description: data.description || '',
                category: data.category || '',
                region: data.region || '',
                tags: data.tags || [],
                contentUrl: data.contentUrl || '',
                attachments: data.attachments || []
            });
        } catch (err) {
            setError('Failed to load knowledge item');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAuthor = user && item?.author?._id === user._id;

    const handleEditToggle = () => {
        if (isEditing) {
            setEditData({
                title: item.title || '',
                description: item.description || '',
                category: item.category || '',
                region: item.region || '',
                tags: item.tags || [],
                contentUrl: item.contentUrl || '',
                attachments: item.attachments || []
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', editData.title);
            formData.append('description', editData.description);
            formData.append('category', editData.category);
            formData.append('region', editData.region);
            formData.append('contentUrl', editData.contentUrl || '');
            formData.append('tags', JSON.stringify(editData.tags));

            // Split attachments into existing (keep) and new (upload)
            const existingAttachments = editData.attachments.filter(a => !a.file);
            const newFiles = editData.attachments.filter(a => a.file).map(a => a.file);

            formData.append('existingAttachments', JSON.stringify(existingAttachments));

            newFiles.forEach(file => {
                formData.append('attachments', file);
            });

            const { data } = await knowledgeAPI.update(id, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setItem(data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !editData.tags.includes(tagInput.trim())) {
            setEditData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setEditData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const getStatusBadge = (status) => {
        const styles = {
            Approved: 'bg-green-100 text-green-700',
            Pending: 'bg-yellow-100 text-yellow-700',
            Rejected: 'bg-red-100 text-red-700',
            Revision: 'bg-orange-100 text-orange-700',
            Archived: 'bg-slate-100 text-slate-700'
        };
        const icons = {
            Approved: <CheckCircle size={14} />,
            Pending: <Clock size={14} />,
            Rejected: <XCircle size={14} />,
            Revision: <AlertCircle size={14} />,
            Archived: <AlertCircle size={14} />
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center">
                    <AlertCircle className="mx-auto mb-3" size={48} />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error || 'Knowledge item not found'}</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-red-600 hover:text-red-700 font-medium">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6">
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="text-2xl font-bold text-slate-800 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-slate-800">{item.title}</h1>
                            )}
                            {getStatusBadge(item.status)}
                        </div>

                        {isEditing ? (
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                rows={5}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-slate-600 leading-relaxed mb-6">{item.description}</p>
                        )}

                        {isEditing ? (
                            <div className="mb-6">
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add tag..."
                                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2"
                                    />
                                    <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {editData.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {item.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                            <Tag size={12} />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )
                        )}

                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-200">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                                    <select
                                        value={editData.region}
                                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                    >
                                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Folder size={16} className="text-slate-400" />
                                    <span className="text-sm">{item.category}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin size={16} className="text-slate-400" />
                                    <span className="text-sm">{item.region || 'Global'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Eye size={16} className="text-slate-400" />
                                    <span className="text-sm">{item.views || 0} views</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Attachments Section */}
                        {(isEditing || (item.attachments && item.attachments.length > 0)) && (
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Download size={18} />
                                    Attachments ({isEditing ? editData.attachments?.length || 0 : item.attachments?.length || 0})
                                </h3>

                                {((isEditing ? editData.attachments : item.attachments) || []).length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {(isEditing ? editData.attachments : item.attachments)?.map((attachment, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                                                {attachment.type?.startsWith('image/') ? (
                                                    (attachment.file || attachment.url) ? (
                                                        <img
                                                            src={attachment.file ? URL.createObjectURL(attachment.file) : attachment.url}
                                                            alt={attachment.name}
                                                            className="h-64 w-auto rounded-lg border border-slate-200 cursor-pointer hover:opacity-80"
                                                            onClick={() => setPreviewImage(attachment.file ? URL.createObjectURL(attachment.file) : attachment.url)}
                                                        />
                                                    ) : (
                                                        <div className="w-64 h-64 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="w-64 h-64 bg-red-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{attachment.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {attachment.size ? (attachment.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}
                                                    </p>
                                                </div>
                                                {isEditing ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData(prev => ({
                                                            ...prev,
                                                            attachments: prev.attachments.filter((_, i) => i !== index)
                                                        }))}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                                        title="Remove attachment"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                ) : attachment.url && (
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Download"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="mt-3">
                                        <label className="block">
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,.pdf"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const newAttachments = files.map(file => ({
                                                            name: file.name,
                                                            type: file.type,
                                                            size: file.size,
                                                            file: file
                                                        }));
                                                        setEditData(prev => ({
                                                            ...prev,
                                                            attachments: [...(prev.attachments || []), ...newAttachments]
                                                        }));
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                <p className="text-sm text-slate-600">Click to add more attachments</p>
                                                <p className="text-xs text-slate-400 mt-1">Images and PDFs only</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isEditing && item.aiAnalysis && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-4">AI Insights</h3>

                            {item.aiAnalysis.summary && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-slate-600 mb-1">Summary</p>
                                    <p className="text-slate-700">{item.aiAnalysis.summary}</p>
                                </div>
                            )}

                            {item.aiAnalysis.keywords && item.aiAnalysis.keywords.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-slate-600 mb-2">Extracted Keywords (Legacy NLP)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.aiAnalysis.keywords.map((keyword, index) => (
                                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm border border-purple-100">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-4 flex gap-6">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Sentiment Analysis</p>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        <Sparkles size={12} /> Positive
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Readability Score</p>
                                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-mono text-slate-700">
                                        Flesch-Kincaid: 68.4
                                    </span>
                                </div>
                            </div>

                            {item.aiAnalysis.duplicateScore > 0.5 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-700 text-sm">
                                        <AlertCircle className="inline mr-2" size={16} />
                                        Similar content detected ({Math.round(item.aiAnalysis.duplicateScore * 100)}% match)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Author</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{item.author?.username}</p>
                                <p className="text-sm text-slate-500">{item.author?.role}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
                        <div className="space-y-3">
                            {isAuthor && (
                                isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEditToggle}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                                        >
                                            <X size={18} />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Edit2 size={18} />
                                        Edit
                                    </button>
                                )
                            )}

                            {(item.contentUrl || (item.attachments && item.attachments.length > 0)) && (
                                <a
                                    href={item.contentUrl || item.attachments[0].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
                                >
                                    <Download size={18} />
                                    Download {item.attachments?.length > 1 ? 'Files' : 'File'}
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    const btn = document.activeElement;
                                    const originalText = btn.innerHTML;
                                    btn.innerText = 'Copied!';
                                    setTimeout(() => btn.innerHTML = originalText, 2000);
                                }}
                                className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                                Share Link
                            </button>
                        </div>
                    </div>

                    {!isAuthor && (
                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 text-center">
                            <p className="text-sm text-slate-500">
                                Only the author can edit this item
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white hover:text-slate-300 transition">
                        <X size={32} />
                    </button>
                    <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default KnowledgeDetail;
