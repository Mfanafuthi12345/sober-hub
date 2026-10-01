import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const loadProfile = async () => {
            try {
                const { data, error } = await requireSupabase().from('profiles')
                    .select('first_name, membership_status')
                    .eq('id', authUser.id)
                    .single();
                if (error) throw error;
                if (!cancelled) setProfile(data);
            } catch (error) {
                console.error('Could not load dashboard profile:', error.message);
            }
        };
        loadProfile();
        return () => { cancelled = true; };
    }, [authUser.id]);
    const firstName = profile?.first_name || authUser.user_metadata?.first_name || 'Member';
    const isMemberActive = profile?.membership_status === 'active';

    return (
        <>
            <header className="app-header">
                <a className="brand" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                    <span className="logo">SH</span>Sober Hub
                </a>
                <a className="back" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>← Website</a>
            </header>
            <div className="app-layout">
                <Sidebar />
                <main className="main">
                    <div className="welcome dashboard-welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                        <div>
                            <span className="eyebrow">MEMBER DASHBOARD</span>
                            <h1 style={{ fontSize: 32 }}>Welcome back, {firstName} 👋</h1>
                            <p className="muted">Small steps every day can build a stronger future.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <button className="btn outline" onClick={() => navigate('/payment')}>Membership Payment</button>
                            <button className="btn primary" onClick={() => navigate('/checkin')}>Complete Check-in</button>
                        </div>
                    </div>

                    <div className="alert">
                        💚
                        <div>
                            <b>You are not alone.</b>
                            <p>Use your mentor, community and support tools whenever you need connection.</p>
                        </div>
                        <a href="#" onClick={e => { e.preventDefault(); navigate('/mentor'); }}>Talk to a mentor →</a>
                    </div>

                    <div className="dashboard-overview" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 18, marginBottom: 30 }}>
                        <section className="dashcard">
                            <h3>Recovery Journey</h3>
                            <div style={{ width: 130, height: 130, borderRadius: '50%', margin: 'auto', background: 'conic-gradient(var(--g) 0 72%,#E2ECE4 72%)', display: 'grid', placeItems: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                                    <b style={{ fontSize: 24, color: 'var(--g)' }}>72%</b>
                                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>weekly activity</span>
                                </div>
                            </div>
                            <p className="muted" style={{ marginTop: 12, textAlign: 'center' }}>Consistency: <b style={{ color: 'var(--g)' }}>Good progress</b></p>
                        </section>

                        <section className="dashcard">
                            <h3>Today</h3>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {[
                                    { icon: '💚', title: 'Daily check-in', sub: 'Take a moment to reflect', to: '/checkin', label: 'Do it' },
                                    { icon: '🎓', title: 'Skills Hub', sub: 'Continue learning', to: '/skills', label: 'Open' },
                                    { icon: '💬', title: 'Mentor support', sub: 'Connect with Sober Buddy', to: '/mentor', label: 'Chat' },
                                ].map(item => (
                                    <div key={item.to} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', alignItems: 'center', background: '#F7FAF8', padding: 10, borderRadius: 11 }}>
                                        <span>{item.icon}</span>
                                        <span><strong style={{ display: 'block', fontSize: 11 }}>{item.title}</strong><small style={{ fontSize: 9, color: 'var(--muted)' }}>{item.sub}</small></span>
                                        <a href="#" style={{ fontSize: 10, color: 'var(--g)', fontWeight: 700 }} onClick={e => { e.preventDefault(); navigate(item.to); }}>{item.label}</a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="dashcard">
                            <h3>Membership</h3>
                            <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: isMemberActive ? 'var(--light)' : '#fff3e0', color: isMemberActive ? 'var(--gd)' : '#e65100', fontSize: 12, fontWeight: 700 }}>
                                {isMemberActive ? 'Active' : 'Inactive'}
                            </span>
                            <p className="muted" style={{ marginTop: 12 }}>✓ Wi-Fi &nbsp; ✓ Gaming &nbsp; ✓ Mini gym &nbsp; ✓ Peer support</p>
                            {!isMemberActive && (
                                <button className="btn primary" style={{ marginTop: 14, width: '100%' }} onClick={() => navigate('/payment')}>Activate Membership</button>
                            )}
                        </section>
                    </div>

                    <div style={{ marginTop: 30 }}>
                        <span className="eyebrow">QUICK ACCESS</span>
                        <h2 style={{ fontSize: 24, margin: '8px 0 18px' }}>What do you need today?</h2>
                        <div className="quick-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                            {[
                                { icon: '💚', title: 'Daily Check-in', sub: 'Record how you\'re doing.', to: '/checkin' },
                                { icon: '👥', title: 'Community', sub: 'Positive connection.', to: '/community' },
                                { icon: '🎓', title: 'Skills Hub', sub: 'Learn practical skills.', to: '/skills' },
                                { icon: '💼', title: 'Employment', sub: 'Explore opportunities.', to: '/employment' },
                                { icon: '💬', title: 'Mentor Chat', sub: 'Connect with support.', to: '/mentor' },
                                { icon: '🆘', title: 'Emergency Support', sub: 'Request urgent help.', to: '/emergency' },
                            ].map(item => (
                                <a key={item.to} href="#" onClick={e => { e.preventDefault(); navigate(item.to); }}
                                    style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 15, padding: 18, display: 'grid', gridTemplateColumns: '38px 1fr', gap: '2px 10px', textDecoration: 'none', color: 'inherit' }}>
                                    <span style={{ gridRow: 'span 2', fontSize: 24 }}>{item.icon}</span>
                                    <strong style={{ fontSize: 13 }}>{item.title}</strong>
                                    <small style={{ fontSize: 10, color: 'var(--muted)' }}>{item.sub}</small>
                                </a>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
