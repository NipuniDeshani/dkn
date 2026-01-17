import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Shield, Activity, TrendingUp, UserPlus, X, Trash2, Eye, EyeOff, Sparkles, Database, Pencil, Server } from 'lucide-react';
import { adminAPI } from '../../services/api';
import AuditLogViewer from '../AuditLogViewer';
import Leaderboard from '../Leaderboard';
import Recommendations from '../Recommendations';
import MigrationPanel from '../MigrationPanel';
import SystemHealthPanel from '../SystemHealthPanel';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Consultant',
        region: 'Global'
    });
    const [aiConfig, setAiConfig] = useState({
        enableRecommendations: true,
        model: 'hybrid',
        confidenceScore: 75,
        enableSentiment: true,
        enableAutoTags: true,
        enableDuplicateDetection: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, configsRes] = await Promise.all([
                adminAPI.getSystemStats(),
                adminAPI.getUsers({ limit: 50 }),
                adminAPI.getConfigurations()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setConfigs(configsRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            fetchData();
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');

        // Password validation
        if (newUser.password !== newUser.confirmPassword) {
            setCreateError('Passwords do not match');
            return;
        }

        if (newUser.password.length < 6) {
            setCreateError('Password must be at least 6 characters');
            return;
        }

        setCreating(true);
        try {
            await adminAPI.createUser({
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                region: newUser.region
            });
            setNewUser({ username: '', email: '', password: '', confirmPassword: '', role: 'Consultant', region: 'Global' });
            setShowCreateForm(false);
            fetchData();
        } catch (error) {
            setCreateError(error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await adminAPI.deleteUser(userId);
            setDeleteConfirm(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(editingUser._id, {
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role,
                region: editingUser.region
            });
            setEditingUser(null);
            fetchData();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleAiConfigChange = (key, value) => {
        setAiConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveAiConfig = async () => {
        try {
            // Simulate saving to backend
            await new Promise(resolve => setTimeout(resolve, 800));
            // In a real implementation: await adminAPI.updateConfiguration('ai_settings', aiConfig);
            alert('AI Configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save AI config:', error);
            alert('Failed to save configuration');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading admin dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Delete User</h3>
                        <p className="text-slate-600 mb-4">
                            Are you sure you want to delete <strong>{deleteConfirm.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteUser(deleteConfirm._id)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                >
                                    {['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'].map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                                <select
                                    value={editingUser.region}
                                    onChange={(e) => setEditingUser({ ...editingUser, region: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                                >
                                    {['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America'].map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={false} // Todo: add loading state
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-red-100 p-3 rounded-lg">
                    <Settings className="text-red-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Administrator Dashboard</h2>
                    <p className="text-slate-500">System management and configuration</p>
                </div>
            </div>

            {/* Stats Grid */}
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Total Users</h3>
                    <p className="text-4xl font-extrabold text-blue-600">{stats?.users?.total || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <Users size={14} className="text-blue-400" /> Active Platform Users
                    </p>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Knowledge Assets</h3>
                    <p className="text-4xl font-extrabold text-green-600">{stats?.knowledge?.total || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <FileText size={14} className="text-green-400" /> Total Items
                    </p>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Pending Review</h3>
                    <p className="text-4xl font-extrabold text-yellow-600">{stats?.knowledge?.pending || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <Activity size={14} className="text-yellow-400" /> Awaiting Action
                    </p>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <h3 className="text-slate-500 uppercase text-xs font-bold mb-2 tracking-wider">Approved Content</h3>
                    <p className="text-4xl font-extrabold text-purple-600">{stats?.knowledge?.approved || 0}</p>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                        <Shield size={14} className="text-purple-400" /> Live in Base
                    </p>
                </div>
            </div>

            {/* Pill Navigation */}
            <div className="bg-slate-100/80 p-1.5 rounded-xl inline-flex gap-1 overflow-x-auto max-w-full backdrop-blur-sm mb-6">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'integrations', label: 'Integrations', icon: Server },
                    { id: 'users', label: 'User Management', icon: Users },
                    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
                    { id: 'migrations', label: 'Migrations', icon: Database },
                    { id: 'audit', label: 'Audit Logs', icon: FileText },
                    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
                    { id: 'config', label: 'Configuration', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm shadow-slate-200 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'stroke-2' : 'stroke-[1.5]'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Users by Role</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(stats?.users?.byRole || {}).map(([role, count]) => (
                                <div key={role} className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-2xl font-bold text-slate-800">{count}</p>
                                    <p className="text-sm text-slate-500 truncate">{role}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/governance-review"
                            className="group bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1"
                        >
                            <Shield size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-lg mb-1">Governance Review</h4>
                            <p className="text-purple-200 text-sm">Review pending items for policy compliance</p>
                        </a>
                        <a
                            href="/migrations"
                            className="group bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1"
                        >
                            <Database size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-lg mb-1">Data Migrations</h4>
                            <p className="text-blue-200 text-sm">Import legacy data from external systems</p>
                        </a>
                        <a
                            href="/profile"
                            className="group bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-slate-500/25 transition-all duration-300 hover:-translate-y-1"
                        >
                            <Settings size={32} className="mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-lg mb-1">System Settings</h4>
                            <p className="text-slate-300 text-sm">Configure application preferences</p>
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {stats?.recentActivity?.slice(0, 8).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${activity.action.includes('LOGIN') ? 'bg-blue-100 text-blue-700' :
                                            activity.action.includes('APPROVED') ? 'bg-green-100 text-green-700' :
                                                activity.action.includes('UPLOAD') ? 'bg-purple-100 text-purple-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {activity.action}
                                        </span>
                                        <span className="text-slate-600">{activity.actor?.username || 'System'}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Create User Button */}
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">User Management</h3>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <UserPlus size={18} />
                            Create User
                        </button>
                    </div>

                    {/* Create User Form */}
                    {showCreateForm && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-slate-800">Create New User</h4>
                                <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            {createError && (
                                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{createError}</div>
                            )}
                            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Min 6 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={newUser.confirmPassword}
                                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                            className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 ${newUser.confirmPassword && newUser.password !== newUser.confirmPassword
                                                ? 'border-red-400 bg-red-50'
                                                : newUser.confirmPassword && newUser.password === newUser.confirmPassword
                                                    ? 'border-green-400 bg-green-50'
                                                    : 'border-slate-200'
                                                }`}
                                            placeholder="Confirm password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                    )}
                                    {newUser.confirmPassword && newUser.password === newUser.confirmPassword && (
                                        <p className="text-green-500 text-xs mt-1">Passwords match ✓</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'].map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                                    <select
                                        value={newUser.region}
                                        onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America'].map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || (newUser.password !== newUser.confirmPassword)}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creating ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Region</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{user.username}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className="text-sm border border-slate-200 rounded px-2 py-1"
                                            >
                                                {['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'].map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{user.region || 'N/A'}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit user"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete user"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && <Recommendations />}

            {activeTab === 'migrations' && <MigrationPanel />}

            {activeTab === 'audit' && <AuditLogViewer />}

            {activeTab === 'leaderboard' && <Leaderboard />}

            {activeTab === 'config' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">System Configuration</h3>
                    <div className="space-y-4">
                        {configs.map(config => (
                            <div key={config._id} className="flex justify-between items-center py-3 border-b border-slate-100">
                                <div>
                                    <p className="font-medium text-slate-800">{config.key}</p>
                                    <p className="text-sm text-slate-500">{config.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm text-slate-600">
                                        {String(config.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {configs.length === 0 && (
                            <p className="text-slate-500 text-sm italic text-center py-4">No configurations found.</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && <SystemHealthPanel />}
        </div >
    );
};

export default AdminDashboard;
