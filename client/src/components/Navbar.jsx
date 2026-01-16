import React, { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, Home, Shield, Database, LayoutDashboard, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    // Role-based navigation items
    const getNavItems = () => {
        const items = [
            { path: '/', label: 'Dashboard', icon: Home, roles: ['all'] }
        ];

        // Governance Review - for Governance Council and Admin
        if (['Governance Council', 'Administrator'].includes(user.role)) {
            items.push({ path: '/governance-review', label: 'Governance Review', icon: Shield });
        }

        // Migrations - for Admin only
        if (user.role === 'Administrator') {
            items.push({ path: '/migrations', label: 'Migrations', icon: Database });
        }

        return items;
    };

    const navItems = getNavItems();
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700/50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold flex items-center space-x-2 group">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:scale-105 transition-transform">
                            <BookOpen size={20} />
                        </div>
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            DKN Enterprise
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive(item.path)
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <item.icon size={16} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* User Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{user.username}</p>
                                    <p className="text-xs text-slate-400">{user.role}</p>
                                </div>
                                <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                                    >
                                        <User size={16} />
                                        My Profile
                                    </Link>
                                    <hr className="my-2 border-slate-700" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-slate-700 transition"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-slate-700 pt-4 space-y-2 animate-fade-in">
                        {/* Mobile Nav Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        <hr className="border-slate-700 my-3" />

                        {/* User Info */}
                        <div className="px-4 py-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">{user.username}</p>
                                    <p className="text-sm text-slate-400">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition"
                        >
                            <User size={18} />
                            <span>My Profile</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg transition"
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
