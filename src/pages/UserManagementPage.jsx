import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function UserManagementPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingUser, setEditingUser] =
        useState(null);

    const [editUserName, setEditUserName] =
        useState('');

    const [editEmail, setEditEmail] =
        useState('');

    const [editError, setEditError] =
        useState(null);

    const [editSuccess, setEditSuccess] =
        useState(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const response = await api.get('/users');

            setUsers(response.data);
        } catch {
            setError(
                'Nie udało się załadować użytkowników'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Usunąć użytkownika?'))
            return;

        try {
            await api.delete(`/users/${userId}`);

            setUsers(
                users.filter((u) => u.id !== userId)
            );
        } catch {
            alert('Błąd podczas usuwania');
        }
    };

    const handleEditOpen = (user) => {
        setEditingUser(user);
        setEditUserName(user.userName);
        setEditEmail(user.email);

        setEditError(null);
        setEditSuccess(null);
    };

    const handleEditSave = async () => {
        setEditError(null);

        try {
            const response = await api.put(
                `/users/${editingUser.id}`,
                {
                    userName: editUserName,
                    email: editEmail,
                }
            );

            setUsers(
                users.map((u) =>
                    u.id === editingUser.id
                        ? response.data
                        : u
                )
            );

            setEditSuccess('Zapisano!');

            setTimeout(() => {
                setEditingUser(null);
            }, 1000);
        } catch (err) {
            setEditError(
                err.response?.data?.message ||
                'Błąd podczas zapisywania'
            );
        }
    };

    if (loading) return <p>Ładowanie...</p>;

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <>
        <Navbar />
        <div
            style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '20px',
            }}
        >
            <h1>Zarządzanie użytkownikami</h1>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                }}
            >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nazwa użytkownika</th>
                        <th>Email</th>
                        <th>Rola</th>
                        <th>Akcje</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.userName}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>

                            <td>
                                <button
                                    onClick={() =>
                                        handleEditOpen(u)
                                    }
                                >
                                    Edytuj
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(u.id)
                                    }
                                >
                                    Usuń
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingUser && (
                <div>
                    <h2>Edytuj użytkownika</h2>

                    <input
                        value={editUserName}
                        onChange={(e) =>
                            setEditUserName(e.target.value)
                        }
                        placeholder="Nazwa użytkownika"
                    />

                    <input
                        value={editEmail}
                        onChange={(e) =>
                            setEditEmail(e.target.value)
                        }
                        placeholder="Email"
                    />

                    {editError && (
                        <p style={{ color: 'red' }}>
                            {editError}
                        </p>
                    )}

                    {editSuccess && (
                        <p style={{ color: 'green' }}>
                            {editSuccess}
                        </p>
                    )}

                    <button onClick={handleEditSave}>
                        Zapisz
                    </button>

                    <button
                        onClick={() =>
                            setEditingUser(null)
                        }
                    >
                        Anuluj
                    </button>
                </div>
            )}
        </div>
        </>
    );
}