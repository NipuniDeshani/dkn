import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Shield, Calendar, Award, Edit2, Save, X, Camera, Briefcase, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profile, setProfile] = useState({
        username: user?.username || '',
        email: user?.email || '',
        region: user?.region || 'Global',
        skills: user?.skills || [],
        bio: user?.bio || ''
    });

    const roleColors = {
        'Consultant': 'from-blue-500 to-blue-600',
        'Knowledge Champion': 'from-green-500 to-green-600',
        'Project Manager': 'from-purple-500 to-purple-600',
        'Administrator': 'from-red-500 to-red-600',
        'Governance Council': 'from-yellow-500 to-amber-600'
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const getInitials = (name) => {
        return name
            ?.split('_')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
            {/* Success Message */}
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slideIn">
                    <CheckCircle size={20} />
                    Profile updated successfully!
                </div>
            )}

            {/* Header Card */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl">
                {/* Banner */}
                <div className={`h-32 bg-gradient-to-r ${roleColors[user?.role] || 'from-blue-500 to-blue-600'} relative`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-800/80 to-transparent"></div>
                </div>

                {/* Profile Info */}
                <div className="relative px-6 pb-6">
                    {/* Avatar */}
                    <div className="absolute -top-16 left-6">
                        <div className="relative group">
                            <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${roleColors[user?.role] || 'from-blue-500 to-blue-600'} flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-slate-800`}>
                                {getInitials(user?.username)}
                            </div>
                            <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={16} className="text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <div className="flex justify-end pt-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                            >
                                <Edit2 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* User Details */}
                    <div className="mt-8 ml-2">
                        <h1 className="text-3xl font-bold text-white">{user?.username?.replace('_', ' ') || 'User'}</h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${roleColors[user?.role] || 'from-blue-500 to-blue-600'} text-white shadow`}>
                                <Shield className="inline mr-1" size={14} />
                                {user?.role || 'User'}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                                <MapPin size={16} />
                                {user?.region || 'Global'}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                                <Calendar size={16} />
                                Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Information */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="text-blue-500" size={20} />
                        Account Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Username</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.username}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="text-slate-800 font-medium">{user?.username}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Email Address</label>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                <p className="text-slate-800">{user?.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Region</label>
                            {isEditing ? (
                                <select
                                    value={profile.region}
                                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {['Global', 'North America', 'Europe', 'Asia Pacific', 'Latin America'].map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-400" />
                                    <p className="text-slate-800">{user?.region || 'Global'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Role & Permissions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="text-green-500" size={20} />
                        Role & Permissions
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-500 mb-1">Current Role</label>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${roleColors[user?.role] || 'from-blue-500 to-blue-600'} text-white`}>
                                <Briefcase size={14} />
                                {user?.role || 'User'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-500 mb-2">Permissions</label>
                            <div className="space-y-2">
                                {user?.role === 'Administrator' || user?.role === 'Governance Council' ? (
                                    <>
                                        <PermissionBadge text="Full System Access" active />
                                        <PermissionBadge text="User Management" active />
                                        <PermissionBadge text="Content Approval" active />
                                        <PermissionBadge text="Audit Logs" active />
                                    </>
                                ) : user?.role === 'Knowledge Champion' ? (
                                    <>
                                        <PermissionBadge text="Content Upload" active />
                                        <PermissionBadge text="Content Approval" active />
                                        <PermissionBadge text="User Management" active={false} />
                                    </>
                                ) : user?.role === 'Project Manager' ? (
                                    <>
                                        <PermissionBadge text="Content Upload" active />
                                        <PermissionBadge text="Team Management" active />
                                        <PermissionBadge text="Content Approval" active={false} />
                                    </>
                                ) : (
                                    <>
                                        <PermissionBadge text="Content Upload" active />
                                        <PermissionBadge text="View Knowledge Base" active />
                                        <PermissionBadge text="Content Approval" active={false} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" size={20} />
                        Activity & Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Contributions" value="12" color="blue" />
                        <StatCard label="Approvals" value="8" color="green" />
                        <StatCard label="Views" value="156" color="purple" />
                        <StatCard label="Points" value="340" color="yellow" />
                    </div>
                </div>

                {/* Bio */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">About</h2>
                    {isEditing ? (
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Write a short bio about yourself..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    ) : (
                        <p className="text-slate-600">
                            {profile.bio || 'No bio added yet. Click Edit Profile to add one.'}
                        </p>
                    )}
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

const PermissionBadge = ({ text, active }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
        {text}
    </div>
);

const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100'
    };
    return (
        <div className={`p-4 rounded-xl border ${colors[color]}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-75">{label}</p>
        </div>
    );
};

export default Profile;
