import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <button className="logout-button" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;
