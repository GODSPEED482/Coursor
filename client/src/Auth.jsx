import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`http://localhost:8080/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Google Auth Failed');
            
            login(data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const res = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }
            
            login(data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #631f50 0%, #000000 100%)', animation: 'breathe 8s infinite alternate ease-in-out' }}>
            <div className="glass-panel" style={{ width: '400px', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Coursor AI</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'Sign back into your learning journey' : 'Begin your personalized journey'}
                    </p>
                </div>
                
                {error && <div style={{ color: 'var(--error)', background: 'rgba(255,50,50,0.1)', padding: '12px', border: '1px solid var(--error)', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Authentication Popup Closed or Failed')}
                        useOneTap
                        shape="pill"
                        text={isLogin ? 'signin_with' : 'signup_with'}
                        theme="filled_black"
                    />
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    &mdash; OR CONTINUE WITH EMAIL &mdash;
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="pill-input-container" style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
                        <input 
                            type="email" 
                            placeholder="Email address"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pill-input-container" style={{ padding: '8px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
                        <input 
                            type="password" 
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '8px', borderRadius: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {isLogin ? <><LogIn size={18} /> Authenticate</> : <><UserPlus size={18} /> Register</>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
