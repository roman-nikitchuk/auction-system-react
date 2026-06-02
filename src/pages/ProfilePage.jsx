import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
    const { user, loading } = useAuth();

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '700px', margin: '40px auto' }}>
                <h1>Mój profil</h1>

                {loading && <p>Ładowanie...</p>}

                {!loading && !user && (
                    <p>Nie udało się załadować profilu.</p>
                )}

                {!loading && user && (
                    <div style={{ border: '1px solid #ddd', padding: 20 }}>
                        <p><strong>Nazwa:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rola:</strong> {user.role}</p>
                        <p>
                            <strong>Data:</strong>{' '}
                            {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : 'Brak'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}