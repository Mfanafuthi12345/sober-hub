import { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Profile() {
    const { user } = useAuth();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadProfile = async () => {
            try {
                const { data, error } = await requireSupabase().from('profiles')
                    .select('first_name, last_name, phone')
                    .eq('id', user.id)
                    .single();
                if (error) throw error;
                if (!cancelled) setForm({
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    email: user.email || '',
                    phone: data.phone || '',
                });
            } catch (err) {
                if (!cancelled) setMsg(err.message || 'Could not load your profile.');
            }
        };
        loadProfile();
        return () => { cancelled = true; };
    }, [user.id, user.email]);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const save = async () => {
        setLoading(true);
        setMsg('');
        try {
            const client = requireSupabase();
            const { error } = await client.from('profiles').update({
                first_name: form.firstName.trim(),
                last_name: form.lastName.trim(),
                phone: form.phone.trim() || null,
            }).eq('id', user.id);
            if (error) throw error;
            const { error: metadataError } = await client.auth.updateUser({
                data: {
                    first_name: form.firstName.trim(),
                    last_name: form.lastName.trim(),
                    phone: form.phone.trim(),
                },
            });
            if (metadataError) throw metadataError;
            setMsg('Profile updated successfully.');
        } catch (err) {
            setMsg(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">MEMBER PROFILE</span>
                <h1>My Profile</h1>
                <p className="page-intro">Manage your Sober Hub member information.</p>

                <section className="form">
                    <div className="formgrid">
                        <label>First name<input value={form.firstName} onChange={set('firstName')} /></label>
                        <label>Last name<input value={form.lastName} onChange={set('lastName')} /></label>
                        <label>Email<input value={form.email} readOnly style={{ background: '#f5f5f5' }} /></label>
                        <label>Phone<input value={form.phone} onChange={set('phone')} placeholder="e.g. 071 234 5678" /></label>
                    </div>
                    {msg && <p style={{ color: 'var(--g)', fontSize: 13 }}>{msg}</p>}
                    <button className="btn primary" onClick={save} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </section>
            </main>
        </>
    );
}
