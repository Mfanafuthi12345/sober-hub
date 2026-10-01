import { useNavigate } from 'react-router-dom';
import { signOut } from '../auth/useAuth';
import { useState } from 'react';

export default function AppHeader() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const logout = async () => {
        setError('');
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Could not sign out.');
        }
    };

    return (
        <header className="app-header">
            <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                <span className="logo">SH</span>Sober Hub
            </a>
            {error && <span className="form-error" role="alert">{error}</span>}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a className="back" href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>← Dashboard</a>
                <button className="btn outline" onClick={logout}>Log out</button>
            </div>
        </header>
    );
}
