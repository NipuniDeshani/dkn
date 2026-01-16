import React, { useState, useEffect } from 'react';
import { Database, Play, Square, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Plus, Upload, Settings, X } from 'lucide-react';
import { migrationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * MigrationPage
 * Use Case: Manage Migration
 * Actor: Administrator
 * 
 * This page implements the data migration management workflow for
 * importing legacy data from external systems into DKN.
 */
const MigrationPage = () => {
    const { user } = useAuth();
    const [migrations, setMigrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedMigration, setSelectedMigration] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [newMigration, setNewMigration] = useState({
        name: '',
        description: '',
        sourceSystem: 'SharePoint',
        sourceUrl: '',
        batchSize: 100
    });

    useEffect(() => {
        fetchMigrations();
    }, []);

    const fetchMigrations = async () => {
        try {
            setError(null);
            const { data } = await migrationAPI.getAll();
            setMigrations(data.migrations || []);
        } catch (error) {
            console.error('Failed to fetch migrations:', error);
            setError(error.response?.data?.message || 'Failed to load migrations');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            setDetailsLoading(true);
            const { data } = await migrationAPI.getById(id);
            setSelectedMigration(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load migration details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setActionLoading('create');
            await migrationAPI.create({
                name: newMigration.name,
                description: newMigration.description,
                source: {
                    system: newMigration.sourceSystem,
                    connectionDetails: { url: newMigration.sourceUrl }
                },
                target: { system: 'DKN' },
                migrationConfig: {
                    batchSize: newMigration.batchSize
                }
            });
            setShowCreateForm(false);
            setNewMigration({ name: '', description: '', sourceSystem: 'SharePoint', sourceUrl: '', batchSize: 100 });
            await fetchMigrations();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create migration');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStart = async (id) => {
        try {
            setActionLoading(id + '-start');
            setError(null);
            await migrationAPI.start(id);
            await fetchMigrations();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to start migration');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (id) => {
        try {
            setActionLoading(id + '-cancel');
            setError(null);
            await migrationAPI.cancel(id);
            await fetchMigrations();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to cancel migration');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-700',
            InProgress: 'bg-blue-100 text-blue-700',
            Completed: 'bg-green-100 text-green-700',
            Failed: 'bg-red-100 text-red-700',
            Cancelled: 'bg-slate-100 text-slate-700'
        };
        const icons = {
            Pending: <Clock size={14} />,
            InProgress: <RefreshCw size={14} className="animate-spin" />,
            Completed: <CheckCircle size={14} />,
            Failed: <XCircle size={14} />,
            Cancelled: <AlertCircle size={14} />
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
                            <div key={i} className="h-24 bg-slate-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Details Modal */}
            {selectedMigration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Migration Details</h2>
                            <button
                                onClick={() => setSelectedMigration(null)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-1">{selectedMigration.name}</h3>
                                <p className="text-slate-500">{selectedMigration.description || 'No description provided'}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {getStatusBadge(selectedMigration.status)}
                                <span className="text-sm text-slate-500">
                                    Created: {new Date(selectedMigration.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Source System</p>
                                    <p className="font-medium text-slate-700">{selectedMigration.source?.system || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Target System</p>
                                    <p className="font-medium text-slate-700">{selectedMigration.target?.system || 'DKN'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Source URL</p>
                                    <p className="font-medium text-slate-700 text-sm break-all">
                                        {selectedMigration.source?.connectionDetails?.url || 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Initiated By</p>
                                    <p className="font-medium text-slate-700">
                                        {selectedMigration.initiatedBy?.username || 'System'}
                                    </p>
                                </div>
                            </div>

                            {selectedMigration.progress && (
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-3">Progress</h4>
                                    <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Total Items</span>
                                            <span className="font-medium">{selectedMigration.progress.total || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Processed</span>
                                            <span className="font-medium text-green-600">{selectedMigration.progress.processed || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Failed</span>
                                            <span className="font-medium text-red-600">{selectedMigration.progress.failed || 0}</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${selectedMigration.status === 'Completed' ? 'bg-green-500' :
                                                    selectedMigration.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{
                                                    width: `${selectedMigration.progress.total
                                                        ? (selectedMigration.progress.processed / selectedMigration.progress.total) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedMigration.startedAt && (
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium">Started:</span> {new Date(selectedMigration.startedAt).toLocaleString()}
                                </div>
                            )}
                            {selectedMigration.completedAt && (
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium">Completed:</span> {new Date(selectedMigration.completedAt).toLocaleString()}
                                </div>
                            )}

                            {selectedMigration.errors && selectedMigration.errors.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-red-600 mb-2">Errors ({selectedMigration.errors.length})</h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {selectedMigration.errors.slice(0, 10).map((err, i) => (
                                            <div key={i} className="p-2 bg-red-50 text-red-700 text-sm rounded">
                                                {err.message || err}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setSelectedMigration(null)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Database className="text-blue-600" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Manage Migrations</h1>
                        <p className="text-slate-500 text-sm">Import legacy data from external systems</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchMigrations}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        New Migration
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* Create Migration Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Upload size={20} />
                        Create New Migration
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Migration Name *</label>
                                <input
                                    type="text"
                                    value={newMigration.name}
                                    onChange={(e) => setNewMigration({ ...newMigration, name: e.target.value })}
                                    required
                                    placeholder="e.g., SharePoint Q1 2026 Import"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source System *</label>
                                <select
                                    value={newMigration.sourceSystem}
                                    onChange={(e) => setNewMigration({ ...newMigration, sourceSystem: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="SharePoint">SharePoint</option>
                                    <option value="Confluence">Confluence</option>
                                    <option value="Excel">Excel</option>
                                    <option value="CSV">CSV File</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                value={newMigration.description}
                                onChange={(e) => setNewMigration({ ...newMigration, description: e.target.value })}
                                rows={2}
                                placeholder="Describe the data being imported..."
                                className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Source URL/Path</label>
                                <input
                                    type="text"
                                    value={newMigration.sourceUrl}
                                    onChange={(e) => setNewMigration({ ...newMigration, sourceUrl: e.target.value })}
                                    placeholder="https://company.sharepoint.com/sites/..."
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Size</label>
                                <input
                                    type="number"
                                    value={newMigration.batchSize}
                                    onChange={(e) => setNewMigration({ ...newMigration, batchSize: parseInt(e.target.value) })}
                                    min={10}
                                    max={500}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={actionLoading === 'create'}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {actionLoading === 'create' ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                                Create Migration
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Migrations List */}
            {migrations.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center text-slate-400">
                    <Database size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No migrations found</p>
                    <p className="text-sm">Click "New Migration" to import legacy data</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {migrations.map((migration) => (
                        <div
                            key={migration._id}
                            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">{migration.name}</h3>
                                    <p className="text-slate-500 text-sm">{migration.description}</p>
                                </div>
                                {getStatusBadge(migration.status)}
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                                <div>
                                    <span className="text-slate-400">Source:</span>{' '}
                                    <strong>{migration.source?.system || 'N/A'}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">Target:</span>{' '}
                                    <strong>{migration.target?.system || 'DKN'}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">Created:</span>{' '}
                                    <strong>{new Date(migration.createdAt).toLocaleDateString()}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400">By:</span>{' '}
                                    <strong>{migration.initiatedBy?.username || 'System'}</strong>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {migration.progress && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Progress</span>
                                        <span>{migration.progress.processed || 0} / {migration.progress.total || '?'}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${migration.status === 'Completed' ? 'bg-green-500' :
                                                migration.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'
                                                }`}
                                            style={{
                                                width: `${migration.progress.total
                                                    ? (migration.progress.processed / migration.progress.total) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                {migration.status === 'Pending' && (
                                    <button
                                        onClick={() => handleStart(migration._id)}
                                        disabled={actionLoading !== null}
                                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {actionLoading === migration._id + '-start' ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Play size={14} />
                                        )}
                                        Start Migration
                                    </button>
                                )}
                                {['Pending', 'InProgress'].includes(migration.status) && (
                                    <button
                                        onClick={() => handleCancel(migration._id)}
                                        disabled={actionLoading !== null}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition disabled:opacity-50"
                                    >
                                        {actionLoading === migration._id + '-cancel' ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Square size={14} />
                                        )}
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={() => handleViewDetails(migration._id)}
                                    disabled={detailsLoading}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition disabled:opacity-50"
                                >
                                    {detailsLoading ? <RefreshCw size={14} className="animate-spin" /> : <Settings size={14} />}
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MigrationPage;

