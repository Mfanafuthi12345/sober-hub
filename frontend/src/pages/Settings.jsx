import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

const DEFAULT_PREFERENCES = {
    mentor_notifications: true,
    training_reminders: true,
    community_updates: true,
    privacy_mode: false,
};

export default function Settings() {
    const { user } = useAuth();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [msg, setMsg] = useState('');
    const [preferenceMsg, setPreferenceMsg] = useState('');
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(false);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    useEffect(() => {
        let cancelled = false;
        requireSupabase().from('profiles').select('preferences').eq('id', user.id).single()
            .then(({ data, error }) => {
                if (error) throw error;
                if (!cancelled) setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
            })
            .catch(error => { if (!cancelled) setPreferenceMsg(error.message || 'Could not load preferences.'); });
        return () => { cancelled = true; };
    }, [user.id]);

    const updatePreference = async (field, value) => {
        const next = { ...preferences, [field]: value };
        setPreferences(next);
        setPreferenceMsg('');
        const { error } = await requireSupabase().from('profiles').update({ preferences: next }).eq('id', user.id);
        if (error) {
            setPreferences(preferences);
            setPreferenceMsg(error.message || 'Could not save this preference.');
            return;
        }
        setPreferenceMsg('Preferences saved.');
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setMsg('');
        if (form.next.length < 8) return setMsg('New password must be at least 8 characters.');
        if (form.next !== form.confirm) return setMsg('New passwords do not match.');
        setLoading(true);
        try {
            const client = requireSupabase();
            const { error: verificationError } = await client.auth.signInWithPassword({
                email: user.email,
                password: form.current,
            });
            if (verificationError) throw new Error('Current password is incorrect.');
            const { error } = await client.auth.updateUser({ password: form.next });
            if (error) throw error;
            setMsg('Password changed successfully.');
            setForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            setMsg(err.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">ACCOUNT</span>
                <h1>Settings</h1>
                <p className="page-intro">Manage your communication preferences and account security.</p>

                <section className="form" style={{ marginBottom: 22 }}>
                    <h3 style={{ marginBottom: 4 }}>Notifications</h3>
                    {[
                        ['mentor_notifications', 'Mentor notifications'],
                        ['training_reminders', 'Training reminders'],
                        ['community_updates', 'Community updates'],
                    ].map(([field, label]) => (
                        <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                            <input type="checkbox" checked={preferences[field]} onChange={e => updatePreference(field, e.target.checked)} style={{ accentColor: 'var(--g)' }} />
                            {label}
                        </label>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500 }}>
                        <input type="checkbox" checked={preferences.privacy_mode} onChange={e => updatePreference('privacy_mode', e.target.checked)} style={{ accentColor: 'var(--g)' }} />
                        Privacy mode
                    </label>
                    {preferenceMsg && <p role="status" className={preferenceMsg === 'Preferences saved.' ? 'form-success' : 'form-error'}>{preferenceMsg}</p>}
                </section>

                <section className="dashcard">
                    <h3>Change password</h3>
                    <form className="form" style={{ padding: 0, border: 0, boxShadow: 'none', marginTop: 12 }} onSubmit={changePassword}>
                        <label>Current password<input type="password" value={form.current} onChange={set('current')} required /></label>
                        <label>New password<input type="password" value={form.next} onChange={set('next')} required /></label>
                        <label>Confirm new password<input type="password" value={form.confirm} onChange={set('confirm')} required /></label>
                        {msg && <p style={{ color: msg.includes('success') ? 'var(--g)' : 'var(--red)', fontSize: 13 }}>{msg}</p>}
                        <button className="btn primary" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </section>
            </main>
        </>
    );
}
