import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

const PLANS = [
    { value: 'R50', label: 'Starter', desc: 'Wi-Fi • community • peer support' },
    { value: 'R75', label: 'Standard', desc: 'Core access + skills activities' },
    { value: 'R100', label: 'Full', desc: 'Full hub access + support services' },
];

export default function Payment() {
    const { user } = useAuth();
    const [selected, setSelected] = useState('R50');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const requestMembership = async () => {
        setError('');
        setLoading(true);
        try {
            const { error: requestError } = await requireSupabase().from('membership_requests').insert({
                user_id: user.id,
                plan: selected,
            });
            if (requestError) throw requestError;
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Could not submit your membership request.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <>
                <AppHeader />
                <main className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                    <h1 style={{ fontSize: 32 }}>Membership request sent</h1>
                    <p className="muted" style={{ marginTop: 10 }}>
                        Your <strong>{selected}/month</strong> plan request has been sent to the Sober Hub team. Membership is not activated until payment is arranged with staff.
                    </p>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">MEMBERSHIP CHECKOUT</span>
                <h1>Choose your plan</h1>
                <p className="page-intro">Choose a plan to send a membership request. Online card payments are not configured yet; your request will not charge or collect card details.</p>

                {error && <div className="form-error">{error}</div>}
                <div className="payment-grid">
                    {PLANS.map(p => (
                        <button type="button" key={p.value} className={`price-card${selected === p.value ? ' selected' : ''}`} onClick={() => setSelected(p.value)}>
                            <strong>{p.value}</strong>
                            <span>{p.label} membership</span>
                            <small>{p.desc}</small>
                        </button>
                    ))}
                </div>

                <div style={{ textAlign: 'right' }}>
                    <button className="btn primary" onClick={requestMembership} disabled={loading}>
                        {loading ? 'Sending request...' : 'Request Membership'}
                    </button>
                </div>
            </main>
        </>
    );
}
