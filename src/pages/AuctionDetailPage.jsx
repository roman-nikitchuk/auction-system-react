import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

const statusLabel = { Active: 'Aktywna', Ended: 'Zakończona', Cancelled: 'Anulowana' };
const statusColor = {
    Active: { bg: '#dcfce7', color: '#16a34a' },
    Ended: { bg: '#f3f4f6', color: '#6b7280' },
    Cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

export function AuctionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bidError, setBidError] = useState(null);
    const [bidSuccess, setBidSuccess] = useState(null);
    const [bidLoading, setBidLoading] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [categories, setCategories] = useState([]);
    const [editError, setEditError] = useState(null);
    const [editSaving, setEditSaving] = useState(false);

    const fetchAuction = async () => {
        const r = await api.get(`/auctions/${id}`);
        setAuction(r.data);
    };

    const fetchBids = async () => {
        try {
            const r = await api.get(`/auctions/${id}/bids`);
            setBids(r.data);
        } catch { setBids([]); }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try { await fetchAuction(); await fetchBids(); }
            catch { setError('Nie udało się załadować aukcji'); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const handleBid = async (e) => {
        e.preventDefault();
        setBidError(null); setBidSuccess(null); setBidLoading(true);
        try {
            await api.post(`/auctions/${id}/bids`, { userId: user.id, amount: parseFloat(bidAmount) });
            setBidSuccess('Oferta złożona!');
            setBidAmount('');
            await fetchAuction(); await fetchBids();
        } catch (err) {
            setBidError(err.response?.data || 'Błąd podczas składania oferty');
        } finally { setBidLoading(false); }
    };

    const toLocalInput = (dateStr) => {
        const d = new Date(dateStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const handleEditOpen = async () => {
        setEditForm({
            title: auction.title,
            description: auction.description,
            categoryId: auction.categoryId,
            startDate: toLocalInput(auction.startDate),
            endDate: toLocalInput(auction.endDate),
        });
        setEditError(null);
        if (categories.length === 0) {
            const r = await api.get('/categories');
            setCategories(r.data);
        }
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        if (!editForm.title?.trim()) { setEditError('Podaj tytuł'); return; }
        if (!editForm.endDate) { setEditError('Podaj datę zakończenia'); return; }
        setEditSaving(true);
        setEditError(null);
        try {
            await api.put(`/auctions/${id}`, {
                title: editForm.title,
                description: editForm.description,
                categoryId: Number(editForm.categoryId),
                startDate: new Date(editForm.startDate).toISOString(),
                endDate: new Date(editForm.endDate).toISOString(),
                imageUrl: auction.imageUrl || null,
            });
            await fetchAuction();
            setEditOpen(false);
        } catch (err) {
            setEditError(err.response?.data || 'Błąd podczas zapisywania');
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę aukcję?')) return;
        try { await api.delete(`/auctions/${id}`); navigate('/'); }
        catch { alert('Nie udało się usunąć aukcji'); }
    };

    if (loading) return <><Navbar /><p style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Ładowanie...</p></>;
    if (error) return <><Navbar /><p style={{ textAlign: 'center', padding: '80px', color: '#dc2626' }}>{error}</p></>;
    if (!auction) return null;

    const isOwner = user?.id === auction.ownerId;
    const isAdmin = user?.role === 'Admin';
    const isActive = auction.status === 'Active';
    const badge = statusColor[auction.status] ?? statusColor.Ended;
    const minBid = auction.currentBid + 1;

    return (
        <>
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 48px 60px' }}>

                {/* Back */}
                <button onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.85rem', marginBottom: '20px', padding: 0 }}>
                    ← Powrót do listy
                </button>

                {/* Two-column grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>

                    {/* LEFT */}
                    <div>
                        {/* Image */}
                        {auction.imageUrl ? (
                            <img
                                src={auction.imageUrl}
                                alt={auction.title}
                                style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '12px', marginBottom: '28px' }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '420px', backgroundColor: '#e5e7eb', borderRadius: '12px', marginBottom: '28px' }} />
                        )}

                        {/* Title + badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111', margin: 0 }}>{auction.title}</h1>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', padding: '5px 14px', borderRadius: '20px', whiteSpace: 'nowrap', backgroundColor: badge.bg, color: badge.color }}>
                                {statusLabel[auction.status] ?? auction.status}
                            </span>
                        </div>

                        {/* Description */}
                        <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
                            {auction.description}
                        </p>

                        {/* Meta grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px', padding: '20px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.88rem' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                Kategoria: <strong style={{ color: '#111' }}>{auction.categoryName}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.88rem' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Właściciel: <strong style={{ color: '#111' }}>{auction.ownerName}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.88rem' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Start: <strong style={{ color: '#111' }}>{new Date(auction.startDate).toLocaleString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '0.88rem' }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Koniec: <strong style={{ color: '#111' }}>{new Date(auction.endDate).toLocaleString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                            </div>
                        </div>

                        {/* Price row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '20px 24px', backgroundColor: '#f9fafb', borderRadius: '10px', marginBottom: '32px' }}>
                            <div>
                                <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>Cena wywoławcza</p>
                                <p style={{ fontSize: '1.3rem', fontWeight: '600', color: '#333' }}>{auction.startingPrice.toLocaleString('pl-PL')} zł</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '4px' }}>Aktualna cena</p>
                                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111' }}>{auction.currentBid.toLocaleString('pl-PL')} zł</p>
                            </div>
                        </div>

                        {/* Bid history */}
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '16px' }}>
                                Historia licytacji
                            </h2>
                            {bids.length === 0 ? (
                                <div style={{ backgroundColor: '#f9fafb', borderRadius: '10px', padding: '28px', textAlign: 'center', color: '#aaa', fontSize: '0.9rem' }}>
                                    Brak ofert — bądź pierwszy!
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[...bids].reverse().map((bid) => (
                                        <div key={bid.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 15L22 10.64"/><path d="M20.91 11.7l-1.25-1.25c.53-.78.51-1.82-.15-2.51L15 3.46c-.66-.69-1.7-.71-2.48-.18L11.27 4.53"/><path d="M12.22 3.18l8.56 8.56"/>
                                                </svg>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: '#111', fontSize: '0.9rem', margin: 0 }}>{bid.userName || bid.userId}</p>
                                                    <p style={{ color: '#aaa', fontSize: '0.78rem', margin: 0 }}>
                                                        {new Date(bid.createdAt).toLocaleString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: '#111' }}>
                                                {bid.amount.toLocaleString('pl-PL')} zł
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT — sticky sidebar */}
                    <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* Bid form */}
                        {user && !isOwner && isActive && (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '16px' }}>Złóż ofertę</h3>
                                <form onSubmit={handleBid} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.82rem', color: '#555', display: 'block', marginBottom: '6px' }}>Twoja oferta (zł)</label>
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={e => setBidAmount(e.target.value)}
                                            min={minBid}
                                            step="1"
                                            placeholder={minBid}
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
                                        />
                                        <p style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '5px' }}>Minimalna oferta: {minBid.toLocaleString('pl-PL')} zł</p>
                                    </div>

                                    {bidError && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', color: '#dc2626', fontSize: '0.82rem' }}>{bidError}</div>}
                                    {bidSuccess && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px', color: '#16a34a', fontSize: '0.82rem' }}>{bidSuccess}</div>}

                                    <button type="submit" disabled={bidLoading} style={{ padding: '12px', backgroundColor: bidLoading ? '#555' : '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: bidLoading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                                        {bidLoading ? 'Wysyłanie...' : 'Licytuj'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {!user && (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#555', fontSize: '0.88rem' }}>Aby licytować — <a href="/login" style={{ color: '#111', fontWeight: '600' }}>zaloguj się</a></p>
                            </div>
                        )}

                        {isOwner && <p style={{ color: '#aaa', fontSize: '0.82rem', textAlign: 'center' }}>To Twoja aukcja — nie możesz licytować</p>}
                        {!isActive && <p style={{ color: '#aaa', fontSize: '0.82rem', textAlign: 'center' }}>Aukcja została zakończona</p>}

                        {(isOwner || isAdmin) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {isActive && (
                                    <button onClick={handleEditOpen} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', color: '#333', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                                        Edytuj aukcję
                                    </button>
                                )}
                                <button onClick={handleDelete} style={{ padding: '10px', border: '1px solid #fecaca', borderRadius: '8px', backgroundColor: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>
                                    Usuń aukcję
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Edit modal */}
        {editOpen && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111', marginBottom: '24px' }}>Edytuj aukcję</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={mLabelStyle}>Tytuł</label>
                            <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={mInputStyle}
                                onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                        </div>
                        <div>
                            <label style={mLabelStyle}>Opis</label>
                            <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                                style={{ ...mInputStyle, minHeight: '90px', resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                        </div>
                        <div>
                            <label style={mLabelStyle}>Kategoria</label>
                            <select value={String(editForm.categoryId)} onChange={e => setEditForm({...editForm, categoryId: Number(e.target.value)})} style={{ ...mInputStyle, backgroundColor: '#fff' }}>
                                {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={mLabelStyle}>Data zakończenia</label>
                            <input type="datetime-local" value={editForm.endDate} onChange={e => setEditForm({...editForm, endDate: e.target.value})} style={mInputStyle}
                                onFocus={e => e.target.style.borderColor = '#111'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                        </div>

                        {editError && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '0.83rem' }}>{editError}</div>}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button onClick={() => setEditOpen(false)} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff', color: '#555', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500' }}>
                                Anuluj
                            </button>
                            <button onClick={handleEditSave} disabled={editSaving} style={{ flex: 2, padding: '11px', border: 'none', borderRadius: '8px', backgroundColor: editSaving ? '#555' : '#111', color: '#fff', cursor: editSaving ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
                                {editSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

const mLabelStyle = { display: 'block', fontSize: '0.83rem', fontWeight: '500', color: '#374151', marginBottom: '6px' };
const mInputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#111', outline: 'none', boxSizing: 'border-box' };