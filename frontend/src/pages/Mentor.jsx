import { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

export default function Mentor() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [requests, setRequests] = useState([]);
    const [mentorMsg, setMentorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const chatRef = useRef(null);

    const load = async (cancelled = () => false) => {
        try {
            const { data, error } = await requireSupabase().from('mentor_requests')
                .select('id, message, status, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (!cancelled()) setRequests(data);
        } catch (err) {
            if (!cancelled()) setError(err.message || 'Could not load mentor requests.');
        }
    };

    useEffect(() => {
        let cancelled = false;
        const client = requireSupabase();
        const loadData = async () => {
            try {
                const [{ data: requestsData, error: requestsError }, { data: messagesData, error: messagesError }] = await Promise.all([
                    client.from('mentor_requests').select('id, message, status, created_at')
                        .eq('user_id', user.id).order('created_at', { ascending: false }),
                    client.from('mentor_messages').select('id, message, created_at')
                        .eq('user_id', user.id).order('created_at', { ascending: true }),
                ]);
                if (requestsError) throw requestsError;
                if (messagesError) throw messagesError;
                if (!cancelled) {
                    setRequests(requestsData);
                    setMessages(messagesData);
                }
            } catch (loadError) {
                if (!cancelled) setError(loadError.message || 'Could not load mentor messages.');
            }
        };
        loadData();
        return () => { cancelled = true; };
    }, [user.id]);
    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

    const send = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setError('');
        try {
            const { error: sendError } = await requireSupabase().from('mentor_messages')
                .insert({ user_id: user.id, message: input.trim() });
            if (sendError) throw sendError;
            setMessages(current => [...current, { id: crypto.randomUUID(), message: input.trim(), created_at: new Date().toISOString() }]);
            setInput('');
        } catch (sendError) {
            setError(sendError.message || 'Could not send your message.');
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async () => {
        if (!mentorMsg.trim()) return;
        setLoading(true);
        setError('');
        try {
            const { error } = await requireSupabase().from('mentor_requests')
                .insert({ user_id: user.id, message: mentorMsg.trim() });
            if (error) throw error;
            setMentorMsg('');
            await load();
        } catch (err) {
            setError(err.message || 'Could not send your mentor request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">SOBER BUDDY</span>
                <h1>Mentor Support</h1>
                <p className="page-intro">Connect with recovery support.</p>

                <div className="chat" ref={chatRef}>
                    {messages.length === 0
                        ? <p className="muted">Send a message to record it for your support team.</p>
                        : messages.map(message => (
                            <div key={message.id} className="bubble user">{message.message}</div>
                        ))}
                </div>
                <div className="compose">
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                        onKeyDown={e => e.key === 'Enter' && send()} />
                    <button className="btn primary" onClick={send} disabled={loading || !input.trim()}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>

                <section className="dashcard" style={{ marginTop: 18 }}>
                    <h3>Request a mentor</h3>
                    {error && <div className="form-error">{error}</div>}
                    <textarea rows={3} value={mentorMsg} onChange={e => setMentorMsg(e.target.value)}
                        placeholder="What would you like support with?"
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 10, padding: 10, marginTop: 8, outline: 'none' }} />
                    <button className="btn primary" style={{ marginTop: 12 }} onClick={sendRequest} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                    </button>
                    <div style={{ marginTop: 15 }}>
                        {requests.length === 0
                            ? <p className="muted">No mentor requests yet.</p>
                            : requests.map(r => (
                                <div key={r.id} className="post">
                                    <b>{r.status}</b> — {r.message || 'Support requested'}
                                    <br /><small className="muted">{new Date(r.created_at).toLocaleString()}</small>
                                </div>
                            ))
                        }
                    </div>
                </section>
            </main>
        </>
    );
}
