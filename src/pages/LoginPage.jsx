import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function LoginPage() {
    const navigate = useNavigate();

    const { login } = useAuth(); // 👈 TYLKO tutaj

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '500px', margin: '40px auto' }}>
                <h1>Logowanie</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    <button type="submit" style={buttonStyle}>
                        Zaloguj się
                    </button>
                </form>

                <p>
                    Nie masz konta? <Link to="/register">Zarejestruj się</Link>
                </p>
            </div>
        </>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    cursor: 'pointer',
};