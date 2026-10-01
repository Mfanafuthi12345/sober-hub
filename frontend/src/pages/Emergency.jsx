import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Emergency() {
    const { user } = useAuth();
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePanic = async () => {
        if (!window.confirm('Send an urgent support request to Sober Hub staff?')) return;
        setLoading(true);
        setError('');
        try {
            const { error: requestError } = await requireSupabase().from('support_requests').insert({
                user_id: user.id,
                message: 'Urgent support requested via panic button.',
                priority: 'urgent',
            });
            if (requestError) throw requestError;
            setSent(true);
        } catch (err) {
            setError(err.message || 'Could not send the support request. Please try again or contact local emergency services.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow" style={{ color: 'var(--red)' }}>URGENT SUPPORT</span>
                <h1>Emergency / Panic Support</h1>

                <div className="panic">
                    <div style={{ fontSize: 42 }}>🆘</div>
                    <h2 style={{ margin: '12px 0' }}>Need immediate support?</h2>
                    <p style={{ maxWidth: 600, margin: '0 auto 20px', color: 'var(--muted)', fontSize: 13 }}>
                        The Sober-Buddy concept includes a panic button for situations involving cravings or danger.
                        Pressing this button sends an urgent request to the Sober-Hub support desk.
                    </p>
                    {error && <div className="form-error">{error}</div>}
                    {sent
                        ? <div style={{ background: 'var(--light)', border: '1px solid var(--lg)', borderRadius: 14, padding: '16px 24px', display: 'inline-block', color: 'var(--gd)', fontWeight: 700 }}>
                            ✅ Support request recorded. Staff have been notified.
                          </div>
                        : <button className="panic-btn" onClick={handlePanic} disabled={loading}>
                            {loading ? 'SENDING...' : 'PRESS FOR SUPPORT'}
                          </button>
                    }
                </div>

                <section className="dashcard" style={{ marginTop: 18, textAlign: 'center' }}>
                    <b>You</b> → <b>Mentor / Sober Buddy</b> → <b>Sober-Hub Support Desk</b>
                </section>
            </main>
        </>
    );
}
