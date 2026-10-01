import { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

const MOODS = [
    { value: 'Great', emoji: '😊' },
    { value: 'Good', emoji: '🙂' },
    { value: 'Okay', emoji: '😐' },
    { value: 'Struggling', emoji: '😔' },
];

export default function CheckIn() {
    const { user } = useAuth();
    const [mood, setMood] = useState('');
    const [note, setNote] = useState('');
    const [checkins, setCheckins] = useState([]);
    const [msg, setMsg] = useState('');

    const load = async (cancelled = () => false) => {
        try {
            const client = requireSupabase();
            const { data, error } = await client.from('checkins')
                .select('id, mood, note, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (error) throw error;
            if (!cancelled()) setCheckins(data);
        } catch (err) {
            if (!cancelled()) setMsg(err.message || 'Could not load recent check-ins.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        requireSupabase().from('checkins')
            .select('id, mood, note, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)
            .then(({ data, error }) => {
                if (error) throw error;
                if (!cancelled) setCheckins(data);
            })
            .catch(error => { if (!cancelled) setMsg(error.message || 'Could not load recent check-ins.'); });
        return () => { cancelled = true; };
    }, [user.id]);

    const save = async () => {
        if (!mood) return setMsg('Please select how you are feeling.');
        try {
            const { error } = await requireSupabase().from('checkins').insert({
                user_id: user.id,
                mood,
                note: note.trim() || null,
            });
            if (error) throw error;
            setMsg('Check-in saved! 💚');
            setNote('');
            setMood('');
            await load();
        } catch (err) { setMsg(err.message || 'Failed to save check-in.'); }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">MEMBER ACTIVITY</span>
                <h1>Daily Check-in</h1>
                <p className="page-intro">Take a moment to reflect and track your activity.</p>

                <section className="form">
                    <h3>How are you feeling today?</h3>
                    <div className="moods">
                        {MOODS.map(m => (
                            <div key={m.value} className={`mood${mood === m.value ? ' selected' : ''}`} onClick={() => setMood(m.value)}>
                                <span>{m.emoji}</span>
                                <p>{m.value}</p>
                            </div>
                        ))}
                    </div>
                    <label>What would help you today?
                        <textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Write a short reflection..." />
                    </label>
                    {msg && <p style={{ color: 'var(--g)', fontSize: 13 }}>{msg}</p>}
                    <button className="btn primary" onClick={save}>Save Check-in</button>
                </section>

                <section className="dashcard" style={{ marginTop: 18 }}>
                    <h3>Recent check-ins</h3>
                    {checkins.length === 0
                        ? <p className="muted">No check-ins yet.</p>
                        : checkins.slice(0, 5).map(c => (
                            <div key={c.id} className="post">
                                <b>{c.mood}</b> — {c.note || 'No note added'}
                                <br /><small style={{ color: 'var(--muted)' }}>{new Date(c.created_at).toLocaleString()}</small>
                            </div>
                        ))
                    }
                </section>
            </main>
        </>
    );
}
