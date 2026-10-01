import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { supabaseConfigured } from './lib/supabase';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import Community from './pages/Community';
import Mentor from './pages/Mentor';
import Emergency from './pages/Emergency';
import Skills from './pages/Skills';
import Employment from './pages/Employment';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (!supabaseConfigured) return <ConfigurationRequired />;
    if (loading) return <main className="auth-page"><p>Loading your account...</p></main>;
    return user ? children : <Navigate to="/login" replace />;
}

function ConfigurationRequired() {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Supabase setup required</h1>
                <p className="page-intro">Copy <code>frontend/.env.example</code> to <code>frontend/.env.local</code>, then add your Supabase Project URL and publishable/anon key. For Vercel, add these as project environment variables and redeploy.</p>
            </section>
        </main>
    );
}

function AppRoutes() {
    if (!supabaseConfigured) return <ConfigurationRequired />;
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/checkin" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
            <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
            <Route path="/mentor" element={<PrivateRoute><Mentor /></PrivateRoute>} />
            <Route path="/emergency" element={<PrivateRoute><Emergency /></PrivateRoute>} />
            <Route path="/skills" element={<PrivateRoute><Skills /></PrivateRoute>} />
            <Route path="/employment" element={<PrivateRoute><Employment /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
    );
}
