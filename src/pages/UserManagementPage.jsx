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
    const [editingUser, setEditingUser] = useState(null);
    const [editUserName, setEditUserName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const r = await api.get('/users');
            setUsers(r.data);
        } catch {
            setError('Nie udało się załadować użytkowników');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch {
            alert('Błąd podczas usuwania użytkownika');
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
        setSaving(true);
        try {
            const r = await api.put(`/users/${editingUser.id}`, { userName: editUserName, email: editEmail });
            setUsers(users.map(u => u.id === editingUser.id ? r.data : u));
            setEditSuccess('Zapisano!');
            setTimeout(() => setEditingUser(null), 900);
        } catch (err) {
            setEditError(err.response?.data || 'Błąd podczas zapisywania');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <Navbar />

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 48px' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111', margin: 0 }}>Użytkownicy</h1>
                    <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '6px' }}>Zarządzaj kontami użytkowników systemu</p>
                </div>

                {loading && <p style={{ color: '#888' }}>Ładowanie...</p>}
                {error && <p style={{ color: '#dc2626' }}>{error}</p>}

                {!loading && !error && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={thStyle}>#</th>
                                    <th style={thStyle}>Użytkownik</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Rola</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ ...tdStyle, color: '#aaa', width: '40px' }}>{u.id}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#555' }}>
                                                    {u.userName?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: '500', color: '#111' }}>{u.userName}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, color: '#555' }}>{u.email}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                                                backgroundColor: u.role === 'Admin' ? '#fef3c7' : '#f3f4f6',
                                                color: u.role === 'Admin' ? '#92400e' : '#555',
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button onClick={() => handleEditOpen(u)} style={editBtnStyle}>
                                                    Edytuj
                                                </button>
                                                <button onClick={() => handleDelete(u.id)} style={deleteBtnStyle}>
                                                    Usuń
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit modal */}
                {editingUser && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '4px' }}>Edytuj użytkownika</h2>
                            <p style={{ color: '#888', fontSize: '0.83rem', marginBottom: '24px' }}>ID: {editingUser.id}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Nazwa użytkownika</label>
                                    <input
                                        value={editUserName}
                                        onChange={e => setEditUserName(e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#111'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input
                                        value={editEmail}
                                        onChange={e => setEditEmail(e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = '#111'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>

                                {editError && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '0.83rem' }}>{editError}</div>}
                                {editSuccess && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', color: '#16a34a', fontSize: '0.83rem' }}>{editSuccess}</div>}

                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <button onClick={() => setEditingUser(null)} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', color: '#555', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500' }}>
                                        Anuluj
                                    </button>
                                    <button onClick={handleEditSave} disabled={saving} style={{ flex: 2, padding: '11px', border: 'none', borderRadius: '8px', backgroundColor: saving ? '#555' : '#111', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
                                        {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '12px 16px', fontSize: '0.78rem', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '14px 16px', fontSize: '0.88rem' };
const labelStyle = { display: 'block', fontSize: '0.83rem', fontWeight: '500', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111', outline: 'none', boxSizing: 'border-box' };
const editBtnStyle = { padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' };
const deleteBtnStyle = { padding: '6px 14px', border: '1px solid #fecaca', borderRadius: '6px', backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500' };