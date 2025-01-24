import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function TopNavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navStyle = {
        backgroundColor: '#007bff',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        cursor: 'pointer',
        marginLeft: '10px'
    };

    return (
        <div style={navStyle}>
            <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>HCC Study Abroad</span>
            </div>
            <div>
                {user ? (
                    <>
                        <span>Welcome, {user.display_name}!</span>
                        <button style={buttonStyle} onClick={() => navigate('/dashboard')}>Dashboard</button>
                        <button style={buttonStyle} onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button style={buttonStyle} onClick={() => navigate('/')}>Login</button>
                )}
            </div>
        </div>
    );
}

export default TopNavBar;
