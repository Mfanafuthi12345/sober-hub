import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <>
            <header className="auth-header" style={{ padding: '12px 5%' }}>
                <a className="brand" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}>
                    <span className="logo">SH</span>Sober Hub
                </a>
                <nav className="home-nav" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <a href="#services" style={{ fontSize: 14 }}>Services</a>
                    <a href="#about" style={{ fontSize: 14 }}>About</a>
                    <button className="btn outline" onClick={() => navigate('/login')}>Log in</button>
                    <button className="btn primary" onClick={() => navigate('/register')}>Join Sober Hub</button>
                </nav>
            </header>

            <main>
                {/* Hero */}
                <section className="home-hero" style={{ maxWidth: 1200, margin: 'auto', minHeight: 580, padding: '80px 5%', display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 60, alignItems: 'center' }}>
                    <div>
                        <span className="eyebrow">KATLEHONG SOBER-HUB & SKILLS LAB</span>
                        <h1 style={{ fontSize: 'clamp(42px,6vw,72px)', lineHeight: 1.05, letterSpacing: -2, marginBottom: 22 }}>
                            Support. Grow. <em style={{ color: 'var(--g)', fontStyle: 'normal' }}>Thrive.</em>
                        </h1>
                        <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 600 }}>
                            A safe, affordable and connected recovery support solution for young people—bringing mentorship, productive activities, practical skills and opportunity together.
                        </p>
                        <div style={{ display: 'flex', gap: 12, margin: '28px 0 15px' }}>
                            <button className="btn primary" onClick={() => navigate(user ? '/dashboard' : '/register')}>Explore Sober Hub</button>
                            <a className="btn outline" href="#services">View Services</a>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--muted)' }}><b>Membership:</b> R50–R100 per month</p>
                    </div>
                    <div style={{ background: 'linear-gradient(145deg,#fff,#EAF5EC)', border: '1px solid var(--border)', padding: 38, borderRadius: 30, boxShadow: 'var(--shadow)' }}>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 20px', background: 'linear-gradient(135deg,var(--g),var(--lg))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>SH</div>
                        <h2 style={{ fontSize: 22, marginBottom: 10 }}>A local solution for a real community need</h2>
                        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sober Hub addresses boredom, peer pressure, unemployment and limited access to supportive spaces through a combined physical and digital model.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                            <div style={{ background: '#fff', padding: 14, borderRadius: 14 }}><b style={{ display: 'block', fontSize: 22, color: 'var(--g)' }}>80%</b><span style={{ fontSize: 11, color: 'var(--muted)' }}>found Sober Buddy useful</span></div>
                            <div style={{ background: '#fff', padding: 14, borderRadius: 14 }}><b style={{ display: 'block', fontSize: 22, color: 'var(--g)' }}>65%</b><span style={{ fontSize: 11, color: 'var(--muted)' }}>considered R50–R100 fair</span></div>
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section className="section" id="services" style={{ maxWidth: 1200, margin: 'auto', padding: '75px 5%' }}>
                    <div style={{ textAlign: 'center', maxWidth: 730, margin: '0 auto 35px' }}>
                        <span className="eyebrow">OUR SOLUTION</span>
                        <h2 style={{ fontSize: 36, lineHeight: 1.2, marginBottom: 12 }}>One hub. Three connected pillars.</h2>
                        <p style={{ color: 'var(--muted)' }}>Sober Hub combines the physical Sober-Hub membership service, Sober-Buddy mobile support and Skills Lab vocational development.</p>
                    </div>
                    <div className="grid three">
                        <article className="card">
                            <i>🏠</i>
                            <h3>Sober-Hub Membership</h3>
                            <p>A safe environment where young people can spend free time productively.</p>
                            <ul><li>High-speed internet</li><li>Gaming stations such as FIFA</li><li>Small fitness centre / mini gym</li><li>Daily peer support groups</li></ul>
                        </article>
                        <article className="card featured">
                            <i>💬</i>
                            <h3>Sober-Buddy</h3>
                            <p>Mobile support connecting young people with recovery mentors.</p>
                            <ul><li>Round-the-clock mentor communication</li><li>Daily motivational audio messages</li><li>Panic button for urgent support</li><li>Escalation to support when needed</li></ul>
                        </article>
                        <article className="card">
                            <i>🎓</i>
                            <h3>Skills Lab</h3>
                            <p>Vocational training designed to improve employability.</p>
                            <ul><li>Cell phone repair</li><li>Barista training</li><li>Basic computer skills / programming</li><li>Potential local-business internships</li></ul>
                        </article>
                    </div>
                </section>

                {/* Stats */}
                <section id="about" style={{ maxWidth: 1200, margin: 'auto', padding: '50px 5%' }}>
                    <div style={{ textAlign: 'center', marginBottom: 30 }}>
                        <span className="eyebrow">RESEARCH INSIGHT</span>
                        <h2 style={{ fontSize: 32 }}>The idea is grounded in community feedback.</h2>
                    </div>
                    <div className="grid four">
                        <div className="stat-card"><b>90%</b><span>rated boredom as serious or very serious</span></div>
                        <div className="stat-card"><b>75%</b><span>identified peer pressure as a major cause</span></div>
                        <div className="stat-card"><b>55%</b><span>identified unemployment / hopelessness</span></div>
                        <div className="stat-card"><b>80%</b><span>said WhatsApp Sober Buddy would be useful</span></div>
                    </div>
                </section>

                {/* CTA */}
                <section className="home-cta" style={{ maxWidth: 1200, margin: '30px auto 70px', padding: '45px 5%', borderRadius: 28, background: 'linear-gradient(135deg,var(--gd),var(--g))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
                    <div>
                        <span className="eyebrow" style={{ color: '#C8E6C9' }}>DIGITAL PLATFORM</span>
                        <h2 style={{ fontSize: 30, color: '#fff' }}>See how Sober Hub works.</h2>
                        <p style={{ color: '#E8F5E9', maxWidth: 600 }}>The platform brings membership, daily check-ins, community, Skills Hub, mentor support, emergency support and employment support into one experience.</p>
                    </div>
                    <button className="btn white" onClick={() => navigate(user ? '/dashboard' : '/register')}>Open Platform</button>
                </section>
            </main>

            <footer className="home-footer" style={{ padding: '25px 5%', background: '#fff', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, justifyContent: 'space-between', color: 'var(--muted)', fontSize: 12 }}>
                <b style={{ color: 'var(--gd)' }}>Sober Hub</b>
                <span>Support • Grow • Thrive</span>
                <span>Katlehong • Community-based recovery support</span>
            </footer>
        </>
    );
}
