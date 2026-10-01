import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { requireSupabase } from '../lib/supabase';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [requiresVerification, setRequiresVerification] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResendMessage('');
        setRequiresVerification(false);
        setLoading(true);
        try {
            const client = requireSupabase();
            const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                setRequiresVerification(error.message.toLowerCase().includes('email not confirmed'));
                throw error;
            }
            if (!data.user?.email_confirmed_at) {
                await client.auth.signOut();
                setRequiresVerification(true);
                throw new Error('Confirm your email using the link we sent before logging in.');
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Unable to log in. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        setLoading(true);
        setResendMessage('');
        try {
            const client = requireSupabase();
            const { error } = await client.auth.resend({
                type: 'signup',
                email: email.trim(),
                options: { emailRedirectTo: `${window.location.origin}/verify-email` },
            });
            if (error) throw error;
            setResendMessage('A new confirmation email has been sent.');
        } catch (err) {
            setResendMessage(err.message || 'Could not resend verification email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="auth-header" style={{ padding: '12px 5%' }}>
                <Link className="brand" to="/"><span className="logo">SH</span>Sober Hub</Link>
                <Link className="btn outline" to="/register">Create account</Link>
            </header>
            <main className="auth-page">
                <section className="auth-card">
                    <span className="eyebrow">MEMBER & STAFF ACCESS</span>
                    <h1>Welcome back</h1>
                    <p className="muted" style={{ marginBottom: 8 }}>Log in to access your Sober Hub account.</p>
                    {error && <div className="form-error">{error}</div>}
                    {requiresVerification && (
                        <button className="btn outline" type="button" onClick={resendVerification} disabled={loading || !email}>
                            {loading ? 'Sending...' : 'Resend verification email'}
                        </button>
                    )}
                    {resendMessage && <div className={resendMessage.startsWith('A new') || resendMessage.startsWith('If the') ? 'form-success' : 'form-error'} role="status">{resendMessage}</div>}
                    <form className="form" onSubmit={handleSubmit}>
                        <label>Email address
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
                        </label>
                        <label>Password
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required />
                        </label>
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Log In'}
                        </button>
                    </form>
                    <p style={{ marginTop: 18, fontSize: 13 }}>
                        New to Sober Hub? <Link className="text-link" to="/register">Create an account</Link>
                    </p>
                </section>
            </main>
        </>
    );
}
