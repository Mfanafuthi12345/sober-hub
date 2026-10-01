import AppHeader from '../components/AppHeader';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Employment() {
    const { user } = useAuth();
    const [saved, setSaved] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState('');
    const OPPORTUNITIES = [
        { icon: '☕', title: 'Hospitality / Barista Pathway', desc: 'Build hospitality skills and explore potential local-business opportunities.' },
        { icon: '📱', title: 'Mobile Repair Pathway', desc: 'Develop practical cell phone repair skills.' },
        { icon: '💻', title: 'Computer Skills Pathway', desc: 'Build basic computer or programming skills.' },
    ];

    useEffect(() => {
        let cancelled = false;
        requireSupabase().from('saved_opportunities').select('title').eq('user_id', user.id)
            .then(({ data, error: loadError }) => {
                if (loadError) throw loadError;
                if (!cancelled) setSaved(data.map(row => row.title));
            })
            .catch(loadError => { if (!cancelled) setError(loadError.message || 'Could not load saved opportunities.'); });
        return () => { cancelled = true; };
    }, [user.id]);

    const saveOpportunity = async (title) => {
        setSaving(title);
        setError('');
        try {
            if (saved.includes(title)) {
                const { error: deleteError } = await requireSupabase().from('saved_opportunities')
                    .delete().eq('user_id', user.id).eq('title', title);
                if (deleteError) throw deleteError;
                setSaved(items => items.filter(item => item !== title));
            } else {
                const { error: insertError } = await requireSupabase().from('saved_opportunities')
                    .insert({ user_id: user.id, title });
                if (insertError) throw insertError;
                setSaved(items => [...items, title]);
            }
        } catch (saveError) {
            setError(saveError.message || 'Could not update saved opportunities.');
        } finally {
            setSaving('');
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">EMPLOYMENT SUPPORT</span>
                <h1>Build towards opportunity.</h1>
                <p className="page-intro">Connect skills development with employment and local opportunity support.</p>

                {error && <div className="form-error">{error}</div>}
                <div className="jobs">
                    {OPPORTUNITIES.map((o, i) => (
                        <article key={i} className="job">
                            <div className="jobicon">{o.icon}</div>
                            <div>
                                <b>{o.title}</b>
                                <p className="muted" style={{ marginTop: 4 }}>{o.desc}</p>
                            </div>
                            <button className="btn primary" disabled={saving === o.title} onClick={() => saveOpportunity(o.title)}>
                                {saving === o.title ? 'Saving...' : saved.includes(o.title) ? 'Saved' : 'Save'}
                            </button>
                        </article>
                    ))}
                </div>
            </main>
        </>
    );
}
