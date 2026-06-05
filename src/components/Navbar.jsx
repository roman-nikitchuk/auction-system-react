import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
    const { isLoggedIn, isAdmin, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 48px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/>
                    <path d="M17.64 15L22 10.64"/>
                    <path d="M20.91 11.7l-1.25-1.25c.53-.78.51-1.82-.15-2.51L15 3.46c-.66-.69-1.7-.71-2.48-.18L11.27 4.53"/>
                    <path d="M12.22 3.18l8.56 8.56"/>
                </svg>
                <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111', lineHeight: 1.2 }}>System Aukcyjny</div>
                    <div style={{ fontSize: '0.7rem', color: '#aaa', lineHeight: 1.2 }}>Platforma licytacji online</div>
                </div>
            </Link>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link to="/" style={{ color: '#555', textDecoration: 'none', fontSize: '0.88rem' }}>
                    Strona główna
                </Link>

                {isAdmin && (
                    <>
                        <Link to="/admin/users" style={{ color: '#555', textDecoration: 'none', fontSize: '0.88rem' }}>
                            Użytkownicy
                        </Link>
                        <Link to="/admin/categories" style={{ color: '#555', textDecoration: 'none', fontSize: '0.88rem' }}>
                            Kategorie
                        </Link>
                    </>
                )}

                {isLoggedIn ? (
                    <>
                        {/* User */}
                        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#333', textDecoration: 'none', fontSize: '0.88rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {user?.userName}
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                background: 'none',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                cursor: 'pointer',
                                color: '#333',
                                fontSize: '0.88rem',
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#333', textDecoration: 'none', fontSize: '0.88rem' }}>
                            Zaloguj
                        </Link>
                        <Link to="/register" style={{
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            backgroundColor: '#111',
                            padding: '7px 16px',
                            borderRadius: '6px',
                            fontWeight: '500',
                        }}>
                            Rejestracja
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
