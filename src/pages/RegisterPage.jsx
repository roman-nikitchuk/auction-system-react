import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';

export function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post('/auth/register', {
                userName: form.username,
                email: form.email,
                password: form.password,
            });

            setSuccess('Konto zostało utworzone');

            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err) {
            setError(err.response?.data || 'Nie udało się utworzyć konta');
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '500px', margin: '40px auto' }}>
                <h1>Rejestracja</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nazwa użytkownika"
                        value={form.username}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Hasło"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <button style={buttonStyle}>
                        Zarejestruj się
                    </button>
                </form>

                <p>
                    Masz konto? <Link to="/login">Zaloguj się</Link>
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