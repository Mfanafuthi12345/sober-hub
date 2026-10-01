import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requireSupabase } from '../lib/supabase';

export default function Register() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        setLoading(true);
        try {
            const client = requireSupabase();
            const { data, error } = await client.auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/verify-email`,
                    data: {
                        first_name: form.firstName.trim(),
                        last_name: form.lastName.trim(),
                        phone: form.phone.trim(),
                        role: 'member',
                    },
                },
            });
            if (error) throw error;
            if (data.session) {
                await client.auth.signOut();
                throw new Error('Email confirmation is disabled for this Supabase project. Enable it in Supabase Auth settings.');
            }
            setSuccess(`Confirmation email sent to ${form.email}. Open the link to activate your account, then log in.`);
            setRegistrationComplete(true);
        } catch (err) {
            setError(err.message);
            if (err.message.startsWith('Your account was created')) setPendingVerification(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="auth-header" style={{ padding: '12px 5%' }}>
                <Link className="brand" to="/"><span className="logo">SH</span>Sober Hub</Link>
                <Link className="btn outline" to="/login">Log in</Link>
            </header>
            <main className="auth-page">
                <section className="auth-card" style={{ width: 'min(560px,100%)' }}>
                    <span className="eyebrow">CREATE YOUR ACCOUNT</span>
                    <h1>Sign up</h1>
                    <p className="muted">Join Sober Hub and access support, skills and community.</p>
                    {error && <div className="form-error">{error}</div>}
                    {success && <div className="form-success">{success}</div>}
                    {pendingVerification && (
                        <Link className="btn outline" to="/login" state={{ email: form.email }}>
                            Go to login to resend verification
                        </Link>
                    )}
                    {registrationComplete ? (
                        <Link className="btn primary" to="/login" state={{ email: form.email }}>Continue to login</Link>
                    ) : <form className="form" onSubmit={handleSubmit}>
                        <div className="formgrid">
                            <label>First name<input value={form.firstName} onChange={set('firstName')} placeholder="e.g. Thabo" required /></label>
                            <label>Last name<input value={form.lastName} onChange={set('lastName')} placeholder="e.g. Dlamini" required /></label>
                            <label>Email address<input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required /></label>
                            <label>Phone number<input type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. 071 234 5678" /></label>
                        </div>
                        <label>Password<input type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" minLength={8} autoComplete="new-password" required /></label>
                        <label>Confirm password<input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm password" required /></label>
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>}
                    <p style={{ marginTop: 18, fontSize: 13 }}>
                        Already have an account? <Link className="text-link" to="/login">Log in</Link>
                    </p>
                </section>
            </main>
        </>
    );
}
