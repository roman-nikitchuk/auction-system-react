import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';

export function HomePage() {
    const navigate = useNavigate();

    const [auctions, setAuctions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const fetchAuctions = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (filterCategory) params.append('categoryId', filterCategory);
            if (filterStatus) params.append('status', filterStatus);

            const query = params.toString() ? `?${params.toString()}` : '';
            const response = await api.get(`/auctions${query}`);
            setAuctions(response.data);
        } catch {
            setError('Nie udało się załadować aukcji');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch {
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchAuctions();
    }, [filterCategory, filterStatus]);

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                <h1>Aukcje</h1>

                {/* Filtry */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">Wszystkie kategorie</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">Wszystkie statusy</option>
                        <option value="Active">Aktywne</option>
                        <option value="Ended">Zakończone</option>
                    </select>

                    <button
                        onClick={() => { setFilterCategory(''); setFilterStatus(''); }}
                        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        Resetuj filtry
                    </button>
                </div>

                {/* Lista aukcji */}
                {loading && <p>Ładowanie...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                {!loading && !error && auctions.length === 0 && (
                    <p>Brak aukcji spełniających kryteria.</p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {auctions.map((auction) => (
                        <div
                            key={auction.id}
                            onClick={() => navigate(`/auctions/${auction.id}`)}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <h3 style={{ margin: '0 0 8px' }}>{auction.title}</h3>
                            <p style={{ margin: '4px 0', color: '#555', fontSize: '0.9rem' }}>
                                {auction.categoryName || 'Brak kategorii'}
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                <strong>Aktualna oferta:</strong> {auction.currentBid} zł
                            </p>
                            <p style={{ margin: '4px 0' }}>
                                <strong>Status:</strong>{' '}
                                <span style={{ color: auction.status === 'Active' ? 'green' : 'gray' }}>
                                    {auction.status === 'Active' ? 'Aktywna' : 'Zakończona'}
                                </span>
                            </p>
                            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#888' }}>
                                Koniec: {new Date(auction.endDate).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}