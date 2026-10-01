import AppHeader from '../components/AppHeader';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { requireSupabase } from '../lib/supabase';

const COURSES = [
    { id: 'cell-phone-repair', title: 'Cell Phone Repair', icon: '📱', description: 'Explore practical repair skills for future work or entrepreneurship.', featured: false },
    { id: 'barista-training', title: 'Barista Training', icon: '☕', description: 'Develop hospitality-related skills for employment opportunities.', featured: true },
    { id: 'computer-programming', title: 'Computer & Programming', icon: '💻', description: 'Build basic computer skills or explore programming fundamentals.', featured: false },
];

export default function Skills() {
    const { user } = useAuth();
    const [started, setStarted] = useState([]);
    const [error, setError] = useState('');
    const [loadingCourse, setLoadingCourse] = useState('');

    useEffect(() => {
        let cancelled = false;
        requireSupabase().from('course_progress').select('course').eq('user_id', user.id)
            .then(({ data, error: loadError }) => {
                if (loadError) throw loadError;
                if (!cancelled) setStarted(data.map(row => row.course));
            })
            .catch(loadError => { if (!cancelled) setError(loadError.message || 'Could not load course progress.'); });
        return () => { cancelled = true; };
    }, [user.id]);

    const startCourse = async (course) => {
        setLoadingCourse(course);
        setError('');
        try {
            const { error: saveError } = await requireSupabase().from('course_progress')
                .upsert({ user_id: user.id, course, status: 'started' }, { onConflict: 'user_id,course' });
            if (saveError) throw saveError;
            setStarted(current => current.includes(course) ? current : [...current, course]);
        } catch (saveError) {
            setError(saveError.message || 'Could not save course progress.');
        } finally {
            setLoadingCourse('');
        }
    };

    return (
        <>
            <AppHeader />
            <main className="page">
                <span className="eyebrow">SKILLS LAB</span>
                <h1>Learn. Build. Grow.</h1>
                <p className="page-intro">Vocational training to help young people improve employability and build a productive future.</p>

                {error && <div className="form-error">{error}</div>}
                <div className="grid three">
                    {COURSES.map(course => (
                        <article key={course.id} className={`card${course.featured ? ' featured' : ''}`}>
                            <i>{course.icon}</i>
                            <h3>{course.title}</h3>
                            <p>{course.description}</p>
                            <button className={`btn ${course.featured ? 'primary' : 'outline'}`} style={{ marginTop: 16 }}
                                onClick={() => startCourse(course.id)} disabled={loadingCourse === course.id}>
                                {loadingCourse === course.id ? 'Saving...' : started.includes(course.id) ? 'In Progress' : 'Start Module'}
                            </button>
                        </article>
                    ))}
                </div>

                <section className="dashcard" style={{ marginTop: 18 }}>
                    <h3>Local opportunities</h3>
                    <p className="muted">Skills Lab can connect suitable participants with internships at local businesses, depending on programme requirements and progress.</p>
                </section>
            </main>
        </>
    );
}
