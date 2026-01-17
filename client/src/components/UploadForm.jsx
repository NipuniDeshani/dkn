import React, { useState, useRef } from 'react';
import { Upload, X, Tag, MapPin, Folder, FileText, AlertCircle, CheckCircle, Image, File, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { knowledgeAPI } from '../services/api';

const UploadForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        region: '',
        tags: [],
        contentUrl: ''
    });
    const [files, setFiles] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const categories = ['Strategy', 'Technical', 'Market Research', 'Operations', 'Finance'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Global'];

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => {
            if (!allowedFileTypes.includes(file.type)) {
                setError(`Invalid file type: ${file.name}. Only images and PDFs are allowed.`);
                return false;
            }
            if (file.size > maxFileSize) {
                setError(`File too large: ${file.name}. Maximum size is 10MB.`);
                return false;
            }
            // Check for duplicates
            if (files.some(f => f.name === file.name)) {
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles]);
        setError(null);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const addTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <Image size={20} className="text-blue-500" />;
        }
        return <File size={20} className="text-red-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDuplicateWarning(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('region', formData.region);
            formDataToSend.append('contentUrl', formData.contentUrl || '');

            // Append metadata as JSON string
            formDataToSend.append('metadata', JSON.stringify(formData.metadata || {}));

            // Append tags
            // If it's an array, we can stringify it or append multiple times headers
            // Controller expects string or array, stringified array is safest
            formDataToSend.append('tags', JSON.stringify(formData.tags));

            // Append files
            files.forEach(file => {
                formDataToSend.append('attachments', file);
            });

            await knowledgeAPI.create(formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            // Handle duplicate content detection (409 Conflict)
            if (err.response?.status === 409) {
                setDuplicateWarning({
                    message: err.response.data.message,
                    score: err.response.data.similarityScore,
                    similarItems: err.response.data.similarItems || []
                });
            } else {
                setError(err.response?.data?.message || 'Failed to upload knowledge item');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Successful!</h2>
                <p className="text-slate-600">Your knowledge item has been submitted for review.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white">
                        <Upload size={24} />
                        <h2 className="text-xl font-bold">Upload Knowledge</h2>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Duplicate Content Warning */}
                {duplicateWarning && (
                    <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={20} className="text-amber-600" />
                            <span className="font-semibold">{duplicateWarning.message}</span>
                        </div>
                        <p className="text-sm mb-2">
                            Similarity Score: <span className="font-mono font-bold">{Math.round(duplicateWarning.score * 100)}%</span>
                        </p>
                        {duplicateWarning.similarItems.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Similar existing content:</p>
                                <ul className="text-sm list-disc list-inside text-amber-700">
                                    {duplicateWarning.similarItems.slice(0, 3).map((item, idx) => (
                                        <li key={idx}>{item.title || item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs mt-3 text-amber-600">
                            Please modify your content to make it more unique, or search the knowledge base for existing resources.
                        </p>
                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <FileText size={16} className="inline mr-2" />
                        Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter a descriptive title"
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Provide a detailed description of the knowledge content..."
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Image size={16} className="inline mr-2" />
                        Attachments (Images & PDFs)
                    </label>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="mx-auto mb-3 text-slate-400" size={40} />
                        <p className="text-slate-600 font-medium">
                            Drag & drop files here, or click to browse
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            Supports: Images (JPG, PNG, GIF, WebP) and PDF files. Max 10MB each.
                        </p>
                    </div>

                    {/* File List with Previews */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {file.type.startsWith('image/') ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                <File size={24} className="text-red-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <p className="text-xs text-slate-500 mt-2">
                                {files.length} file(s) selected
                            </p>
                        </div>
                    )}
                </div>

                {/* Category and Region */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Folder size={16} className="inline mr-2" />
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <MapPin size={16} className="inline mr-2" />
                            Region *
                        </label>
                        <select
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a region</option>
                            {regions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Tag size={16} className="inline mr-2" />
                        Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                            placeholder="Add tags..."
                            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                        >
                            Add
                        </button>
                    </div>
                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-blue-900"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content URL */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Content URL (optional)
                    </label>
                    <input
                        type="url"
                        name="contentUrl"
                        value={formData.contentUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Link to external document, presentation, or file
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Submit for Review
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadForm;
