import React, { useState, useEffect } from 'react';
import { Database, Play, Square, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { migrationAPI } from '../services/api';

const MigrationPanel = () => {
    const [migrations, setMigrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

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

    const handleStart = async (id) => {
        try {
            setActionLoading(id + '-start');
            setError(null);
            await migrationAPI.start(id);
            await fetchMigrations();
        } catch (error) {
            console.error('Failed to start migration:', error);
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
            console.error('Failed to cancel migration:', error);
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
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Database className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-slate-800">Data Migrations</h3>
                </div>
                <button
                    onClick={fetchMigrations}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                    title="Refresh"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {migrations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Database size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No migrations found</p>
                    <p className="text-sm">Legacy data imports will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {migrations.map((migration) => (
                        <div
                            key={migration._id}
                            className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-medium text-slate-800">{migration.name}</h4>
                                    <p className="text-sm text-slate-500">{migration.description}</p>
                                </div>
                                {getStatusBadge(migration.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                                <div>
                                    <span className="text-slate-400">Source:</span>{' '}
                                    {migration.source?.system || 'N/A'}
                                </div>
                                <div>
                                    <span className="text-slate-400">Target:</span>{' '}
                                    {migration.target?.system || 'DKN'}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            {migration.progress && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Progress</span>
                                        <span>{migration.progress.processed || 0} / {migration.progress.total || '?'}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
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
                            <div className="flex gap-2">
                                {migration.status === 'Pending' && (
                                    <button
                                        onClick={() => handleStart(migration._id)}
                                        disabled={actionLoading !== null}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === migration._id + '-start' ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Play size={14} />
                                        )}
                                        {actionLoading === migration._id + '-start' ? 'Starting...' : 'Start'}
                                    </button>
                                )}
                                {['Pending', 'InProgress'].includes(migration.status) && (
                                    <button
                                        onClick={() => handleCancel(migration._id)}
                                        disabled={actionLoading !== null}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === migration._id + '-cancel' ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            <Square size={14} />
                                        )}
                                        {actionLoading === migration._id + '-cancel' ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MigrationPanel;
