import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ConsultantDashboard from '../components/dashboards/ConsultantDashboard';
import ChampionDashboard from '../components/dashboards/ChampionDashboard';
import GovernanceDashboard from '../components/dashboards/GovernanceDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const renderRoleDashboard = () => {
        switch (user.role) {
            case 'Consultant':
                return <ConsultantDashboard stats={stats} />;
            case 'Knowledge Champion':
                return <ChampionDashboard stats={stats} />;
            case 'Governance Council':
                return <GovernanceDashboard />;
            case 'Project Manager':
                return <ManagerDashboard />;
            case 'Administrator':
                return <AdminDashboard />;
            default:
                return (
                    <div className="p-4 bg-gray-50 rounded">
                        <h2 className="text-xl">Welcome, {user.username}</h2>
                        <p>Total Knowledge: {stats?.totalKnowledge}</p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Dashboard: <span className="text-blue-600">{user.role}</span>
                </h1>
                <p className="text-slate-500">Welcome back, {user.username}</p>
            </header>

            {renderRoleDashboard()}
        </div>
    );
};

export default Dashboard;
