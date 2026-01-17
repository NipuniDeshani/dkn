import React, { useState, useEffect } from 'react';
import { Clock, User, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../services/api';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [filters, setFilters] = useState({
        action: '',
        targetModel: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getAuditLogs({
                page: pagination.page,
                limit: 20,
                ...filters
            });
            setLogs(data.logs);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('LOGIN') || action.includes('REGISTER')) return 'bg-blue-100 text-blue-700';
        if (action.includes('APPROVED')) return 'bg-green-100 text-green-700';
        if (action.includes('REJECTED')) return 'bg-red-100 text-red-700';
        if (action.includes('UPLOAD') || action.includes('CREATED')) return 'bg-purple-100 text-purple-700';
        if (action.includes('UPDATE') || action.includes('REVISION')) return 'bg-yellow-100 text-yellow-700';
        if (action.includes('DELETE') || action.includes('ARCHIVED')) return 'bg-red-100 text-red-700';
        return 'bg-slate-100 text-slate-700';
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const exportLogs = () => {
        const csv = [
            ['Timestamp', 'Action', 'Actor', 'Target Model', 'Details'].join(','),
            ...logs.map(log => [
                new Date(log.timestamp).toISOString(),
                log.action,
                log.actor?.username || 'System',
                log.targetModel,
                JSON.stringify(log.details || {})
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Audit Logs</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200'
                            }`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                    <button
                        onClick={exportLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Action</label>
                            <input
                                type="text"
                                placeholder="e.g., LOGIN, UPLOAD"
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Target Model</label>
                            <select
                                value={filters.targetModel}
                                onChange={(e) => handleFilterChange('targetModel', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                            >
                                <option value="">All Models</option>
                                <option value="User">User</option>
                                <option value="KnowledgeItem">Knowledge Item</option>
                                <option value="Validation">Validation</option>
                                <option value="Configuration">Configuration</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading audit logs...</div>
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No audit logs found.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Action</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actor</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Target</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <React.Fragment key={log._id}>
                                            <tr className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-slate-400" />
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-slate-400" />
                                                        {log.actor?.username || 'System'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {log.targetModel}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        {expandedLog === log._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        {log.details ? 'View' : 'None'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedLog === log._id && log.details && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-3 bg-slate-50">
                                                        <pre className="text-xs text-slate-600 overflow-x-auto">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page <= 1}
                                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= pagination.pages}
                                    className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogViewer;
