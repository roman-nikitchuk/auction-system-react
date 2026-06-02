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

    const [newCategoryName, setNewCategoryName] = useState('');
    const [createError, setCreateError] = useState(null);
    const [createSuccess, setCreateSuccess] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }

        fetchCategories();
    }, [isAdmin]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch {
            setError('Nie udało się załadować kategorii');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) {
            setCreateError('Nazwa kategorii nie może być pusta');
            return;
        }

        setCreateError(null);
        setCreateSuccess(null);
        setCreating(true);

        try {
            const response = await api.post('/categories', { name: newCategoryName.trim() });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setCreateSuccess('Kategoria została dodana!');
            setTimeout(() => setCreateSuccess(null), 2000);
        } catch (err) {
            setCreateError(
                err.response?.data?.message || 'Błąd podczas tworzenia kategorii'
            );
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <p style={{ padding: '20px' }}>Ładowanie...</p>
        </>
    );

    if (error) return (
        <>
            <Navbar />
            <p style={{ padding: '20px', color: 'red' }}>{error}</p>
        </>
    );

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
                <h1>Zarządzanie kategoriami</h1>

                {/* Formularz tworzenia */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                }}>
                    <h2 style={{ marginTop: 0 }}>Dodaj nową kategorię</h2>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            placeholder="Nazwa kategorii"
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#1a1a2e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: creating ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {creating ? 'Dodawanie...' : 'Dodaj'}
                        </button>
                    </div>

                    {createError && <p style={{ color: 'red', marginTop: '8px' }}>{createError}</p>}
                    {createSuccess && <p style={{ color: 'green', marginTop: '8px' }}>{createSuccess}</p>}
                </div>

                {/* Lista kategorii */}
                <h2>Lista kategorii ({categories.length})</h2>

                {categories.length === 0 ? (
                    <p>Brak kategorii.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Nazwa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: '#888' }}>
                                        {cat.id}
                                    </td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                        {cat.name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}