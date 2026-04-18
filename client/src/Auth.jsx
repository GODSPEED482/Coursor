import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { styles } from './Auth.styles';

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

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(text || 'Server Error: Received non-JSON response');
            }

            if (!res.ok) {
                throw new Error(data.message || 'Authentication Failed');
            }

            login(data.token);
            navigate('/');
        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <div className="glass-panel" style={styles.glassPanel}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Coursor AI</h1>
                    <p style={styles.subtitle}>
                        {isLogin ? 'Sign back into your learning journey' : 'Begin your personalized journey'}
                    </p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <div style={styles.googleWrapper}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Authentication Popup Closed or Failed')}
                        useOneTap
                        shape="pill"
                        text={isLogin ? 'signin_with' : 'signup_with'}
                        theme="filled_black"
                    />
                </div>

                <div style={styles.divider}>
                    &mdash; OR CONTINUE WITH EMAIL &mdash;
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="pill-input-container" style={styles.inputContainer}>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="input-field"
                            value={email}
                            style={styles.input}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pill-input-container" style={styles.inputContainer}>
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            style={styles.input}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={styles.submitBtn}>
                        {isLogin ? <><LogIn size={18} /> Authenticate</> : <><UserPlus size={18} /> Register</>}
                    </button>
                </form>

                <div style={styles.switchAuthWrapper}>
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={styles.switchAuthBtn}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
