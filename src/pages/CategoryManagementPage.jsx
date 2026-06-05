import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export function CategoryManagementPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newName, setNewName] = useState('');
    const [createError, setCreateError] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        fetchCategories();
    }, [isAdmin]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const r = await api.get('/categories');
            setCategories(r.data);
        } catch {
            setError('Nie udało się załadować kategorii');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) { setCreateError('Podaj nazwę kategorii'); return; }
        setCreateError(null);
        setCreating(true);
        try {
            const r = await api.post('/categories', { name: newName.trim() });
            setCategories([...categories, r.data]);
            setNewName('');
        } catch (err) {
            setCreateError(err.response?.data || 'Błąd podczas tworzenia kategorii');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <Navbar />

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 32px' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111', margin: 0 }}>Kategorie</h1>
                    <p style={{ color: '#888', fontSize: '0.88rem', marginTop: '6px' }}>Zarządzaj kategoriami aukcji</p>
                </div>

                {/* Add form */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Dodaj nową kategorię</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            placeholder="np. Elektronika, Odzież, Sport..."
                            style={{
                                flex: 1, padding: '10px 14px',
                                border: '1px solid #e5e7eb', borderRadius: '8px',
                                fontSize: '0.9rem', outline: 'none', color: '#111',
                            }}
                            onFocus={e => e.target.style.borderColor = '#111'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            style={{
                                padding: '10px 22px',
                                backgroundColor: creating ? '#555' : '#111',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                cursor: creating ? 'not-allowed' : 'pointer',
                                fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap',
                            }}
                        >
                            {creating ? 'Dodawanie...' : '+ Dodaj'}
                        </button>
                    </div>
                    {createError && (
                        <div style={{ marginTop: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '0.83rem' }}>
                            {createError}
                        </div>
                    )}
                </div>

                {/* List */}
                {loading && <p style={{ color: '#888' }}>Ładowanie...</p>}
                {error && <p style={{ color: '#dc2626' }}>{error}</p>}

                {!loading && !error && (
                    <div>
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#555', margin: 0 }}>
                                Dostępne kategorie
                            </p>
                        </div>

                        {categories.length === 0 ? (
                            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Brak kategorii. Dodaj pierwszą powyżej.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {categories.map(cat => (
                                    <div key={cat.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '9px 16px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '100px',
                                        fontSize: '0.88rem',
                                        fontWeight: '500',
                                        color: '#333',
                                    }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                                        </svg>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
