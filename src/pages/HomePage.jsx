import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const statusLabel = {
    Active: 'Aktywna',
    Ended: 'Zakończona',
    Cancelled: 'Anulowana',
};

const statusBadgeStyle = {
    Active: { backgroundColor: '#16a34a', color: '#fff' },
    Ended: { backgroundColor: '#e5e7eb', color: '#555' },
    Cancelled: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};

function getTimeLabel(auction) {
    if (auction.status !== 'Active') return statusLabel[auction.status] ?? auction.status;
    return new Date(auction.endDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function HomePage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

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

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchAuctions(); }, [filterCategory, filterStatus]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <Navbar />

            <div style={{ width: '100%', padding: '24px 48px', boxSizing: 'border-box' }}>

                {/* Filters row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Wszystkie kategorie</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Wszystkie</option>
                            <option value="Active">Aktywne</option>
                            <option value="Ended">Zakończone</option>
                        </select>

                        {(filterCategory || filterStatus) && (
                            <button
                                onClick={() => { setFilterCategory(''); setFilterStatus(''); }}
                                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                                ✕ Resetuj
                            </button>
                        )}
                    </div>

                    {isLoggedIn && (
                        <button
                            onClick={() => navigate('/create-auction')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: '#111',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                            }}
                        >
                            + Wystaw przedmiot
                        </button>
                    )}
                </div>

                {/* States */}
                {loading && <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>Ładowanie...</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {!loading && !error && auctions.length === 0 && (
                    <p style={{ color: '#888', textAlign: 'center', padding: '60px 0' }}>Brak aukcji spełniających kryteria.</p>
                )}

                {/* Auction grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px',
                    maxWidth: '1432px',
                    margin: '0 auto',
                }}>
                    {auctions.map((auction) => (
                        <div
                            key={auction.id}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '480px',
                                transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            {auction.imageUrl ? (
                                <img
                                    src={auction.imageUrl}
                                    alt={auction.title}
                                    style={{ height: '200px', width: '100%', objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div style={{ height: '200px', backgroundColor: '#f3f4f6' }} />
                            )}

                            {/* Card body */}
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {/* Title + badge */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auction.title}</span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        whiteSpace: 'nowrap',
                                        ...(statusBadgeStyle[auction.status] ?? { backgroundColor: '#e5e7eb', color: '#555' })
                                    }}>
                                        {statusLabel[auction.status] ?? auction.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0, lineHeight: '1.4', minHeight: '2.8em',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {auction.description}
                                </p>

                                {/* Owner */}
                                <div style={{ color: '#555', fontSize: '0.85rem' }}>
                                    {auction.ownerName}
                                </div>

                                <div style={{ color: '#555', fontSize: '0.85rem' }}>
                                    {getTimeLabel(auction)}
                                </div>

                                {/* Price */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>Aktualna cena:</span>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#111' }}>
                                        {auction.currentBid.toLocaleString('pl-PL')} zł
                                    </span>
                                </div>

                                {/* Button */}
                                <button
                                    onClick={() => navigate(`/auctions/${auction.id}`)}
                                    style={{
                                        marginTop: '8px',
                                        width: '100%',
                                        padding: '11px',
                                        backgroundColor: '#111',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    Zobacz szczegóły
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const selectStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.9rem',
    color: '#333',
    backgroundColor: '#fff',
    cursor: 'pointer',
};