import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim()) { setError('Podaj nazwę użytkownika'); return; }
        if (!form.email.trim()) { setError('Podaj email'); return; }
        if (form.password.length < 4) { setError('Hasło musi mieć co najmniej 4 znaki'); return; }

        setLoading(true);
        try {
            await api.post('/auth/register', { userName: form.username, email: form.email, password: form.password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Nie udało się utworzyć konta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '32px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 15L22 10.64"/>
                    <path d="M20.91 11.7l-1.25-1.25c.53-.78.51-1.82-.15-2.51L15 3.46c-.66-.69-1.7-.71-2.48-.18L11.27 4.53"/>
                    <path d="M12.22 3.18l8.56 8.56"/>
                </svg>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111' }}>System Aukcyjny</span>
            </Link>

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '36px 40px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111', marginBottom: '6px' }}>Utwórz konto</h1>
                <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '28px' }}>Dołącz do platformy licytacji online</p>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '11px 14px', marginBottom: '20px', color: '#dc2626', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={labelStyle}>Nazwa użytkownika</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="jan_kowalski"
                            value={form.username}
                            onChange={handleChange}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="twoj@email.com"
                            value={form.email}
                            onChange={handleChange}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Hasło</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: '8px', padding: '12px', backgroundColor: loading ? '#555' : '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.92rem' }}
                    >
                        {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#888' }}>
                    Masz już konto?{' '}
                    <Link to="/login" style={{ color: '#111', fontWeight: '600', textDecoration: 'none' }}>
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '0.83rem', fontWeight: '500', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' };