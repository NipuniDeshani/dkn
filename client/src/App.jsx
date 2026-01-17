import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import KnowledgeDetail from './components/KnowledgeDetail';
import GovernanceReview from './pages/GovernanceReview';
import MigrationPage from './pages/MigrationPage';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/ChatWidget';


function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-slate-50 font-sans">
                    <Navbar />
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />

                        <Route path="/knowledge/:id" element={
                            <ProtectedRoute>
                                <ErrorBoundary>
                                    <KnowledgeDetail />
                                </ErrorBoundary>
                            </ProtectedRoute>
                        } />

                        {/* Use Case: Governance Review */}
                        <Route path="/governance-review" element={
                            <ProtectedRoute>
                                <GovernanceReview />
                            </ProtectedRoute>
                        } />

                        {/* Use Case: Manage Migration */}
                        <Route path="/migrations" element={
                            <ProtectedRoute>
                                <MigrationPage />
                            </ProtectedRoute>
                        } />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <ChatWidget />
                </div>
            </AuthProvider>
        </Router>
    );
}


export default App;

