import { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Community() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async (cancelled = () => false) => {
        try {
            const client = requireSupabase();
            const { data, error } = await client.from('community_posts')
                .select('id, user_id, content, created_at')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            const authorIds = [...new Set(data.map(post => post.user_id))];
            const { data: profiles, error: profileError } = authorIds.length
                ? await client.from('profiles').select('id, first_name, last_name').in('id', authorIds)
                : { data: [], error: null };
            if (profileError) throw profileError;
            const authors = new Map(profiles.map(profile => [profile.id, profile]));
            if (!cancelled()) setPosts(data.map(post => ({
                ...post,
                author: authors.get(post.user_id),
            })));
        } catch (err) {
            if (!cancelled()) setError(err.message || 'Could not load community posts.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        const client = requireSupabase();
        client.from('community_posts').select('id, user_id, content, created_at')
            .order('created_at', { ascending: false }).limit(100)
            .then(async ({ data, error }) => {
                if (error) throw error;
                const authorIds = [...new Set(data.map(post => post.user_id))];
                const { data: profiles, error: profileError } = authorIds.length
                    ? await client.from('profiles').select('id, first_name, last_name').in('id', authorIds)
                    : { data: [], error: null };
                if (profileError) throw profileError;
                const authors = new Map(profiles.map(profile => [profile.id, profile]));
                if (!cancelled) setPosts(data.map(post => ({ ...post, author: authors.get(post.user_id) })));
            })
            .catch(error => { if (!cancelled) setError(error.message || 'Could not load community posts.'); });
        return () => { cancelled = true; };
    }, []);

    const share = async () => {
        if (!content.trim()) return;
        setLoading(true);
        setError('');
        try {
            const { error } = await requireSupabase().from('community_posts')
                .insert({ user_id: user.id, content: content.trim() });
            if (error) throw error;
            setContent('');
            await load();
        } catch (err) {
            setError(err.message || 'Could not share your post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">COMMUNITY</span>
                <h1>You are part of a community.</h1>
                <p className="page-intro">A positive space for connection, encouragement and productive engagement.</p>

                <section className="dashcard" style={{ marginBottom: 18 }}>
                    <h3>Share with the community</h3>
                    {error && <div className="form-error">{error}</div>}
                    <textarea rows={3} value={content} onChange={e => setContent(e.target.value)} placeholder="Share an encouraging message..." style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 10, padding: 10, marginTop: 8, outline: 'none' }} />
                    <button className="btn primary" style={{ marginTop: 12 }} onClick={share} disabled={loading}>
                        {loading ? 'Sharing...' : 'Share Post'}
                    </button>
                </section>

                <section className="dashcard">
                    <h3>Community posts</h3>
                    {posts.length === 0
                        ? <p className="muted">No posts yet. Be the first to share!</p>
                        : posts.map(p => (
                            <div key={p.id} className="post">
                                <b>{p.author?.first_name} {p.author?.last_name}</b>
                                <small className="muted"> • {new Date(p.created_at).toLocaleString()}</small>
                                <p>{p.content}</p>
                            </div>
                        ))
                    }
                </section>

                <section className="dashcard" style={{ marginTop: 18 }}>
                    <h3>Community activities</h3>
                    <p className="muted" style={{ marginBottom: 8 }}>🎮 <b>Gaming</b> — Positive recreation and connection</p>
                    <p className="muted" style={{ marginBottom: 8 }}>🤝 <b>Peer support</b> — Daily support groups</p>
                    <p className="muted">🎓 <b>Skills learning</b> — Build practical and employable skills</p>
                </section>
            </main>
        </>
    );
}
