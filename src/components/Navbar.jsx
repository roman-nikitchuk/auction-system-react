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
            padding: '10px 20px',
            backgroundColor: '#1a1a2e',
            color: 'white',
        }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
                🏷️ AuctionApp
            </Link>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                    Aukcje
                </Link>

                {isLoggedIn && (
                    <Link to="/create-auction" style={{ color: 'white', textDecoration: 'none' }}>
                        + Dodaj aukcję
                    </Link>
                )}

                {isAdmin && (
                    <>
                        <Link to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>
                            Użytkownicy
                        </Link>
                        <Link to="/admin/categories" style={{ color: 'white', textDecoration: 'none' }}>
                            Kategorie
                        </Link>
                    </>
                )}

                {isLoggedIn ? (
                    <>
                        <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>
                            👤 {user?.userName}
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid white',
                                color: 'white',
                                padding: '4px 12px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                            }}
                        >
                            Wyloguj
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                            Zaloguj
                        </Link>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                            Rejestracja
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}