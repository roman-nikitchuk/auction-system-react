import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export function CreateAuctionPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        startingPrice: '',
        categoryId: '',
        endDate: '',
        imageUrl: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/categories')
            .then(r => setCategories(r.data))
            .catch(() => {});
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm(prev => ({ ...prev, imageUrl: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) { setError('Podaj tytuł'); return; }
        if (!form.description.trim()) { setError('Podaj opis'); return; }
        if (!form.startingPrice || Number(form.startingPrice) <= 0) { setError('Cena początkowa musi być większa od 0'); return; }
        if (!form.categoryId) { setError('Wybierz kategorię'); return; }
        if (!form.endDate) { setError('Podaj datę zakończenia'); return; }
        if (new Date(form.endDate) <= new Date()) { setError('Data zakończenia musi być w przyszłości'); return; }

        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auctions', {
                title: form.title,
                description: form.description,
                startingPrice: Number(form.startingPrice),
                categoryId: Number(form.categoryId),
                startDate: new Date().toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                ownerId: user.id,
                imageUrl: form.imageUrl || null,
            });
            navigate(`/auctions/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data || 'Nie udało się utworzyć aukcji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <Navbar />

            <div style={{ maxWidth: '620px', margin: '40px auto', padding: '0 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111', margin: 0 }}>
                        Dodaj aukcję
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '6px' }}>
                        Wypełnij formularz, aby wystawić przedmiot na licytację
                    </p>
                </div>

                {/* Form card */}
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '32px',
                }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            color: '#dc2626',
                            fontSize: '0.88rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <label style={labelStyle}>Tytuł</label>
                            <input
                                name="title"
                                placeholder="np. Laptop Dell XPS 15"
                                value={form.title}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Opis</label>
                            <textarea
                                name="description"
                                placeholder="Opisz przedmiot, jego stan i szczegóły..."
                                value={form.description}
                                onChange={handleChange}
                                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Cena początkowa (zł)</label>
                                <input
                                    type="number"
                                    name="startingPrice"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    value={form.startingPrice}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#111'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Kategoria</label>
                                <select
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, backgroundColor: '#fff', cursor: 'pointer' }}
                                    onFocus={e => e.target.style.borderColor = '#111'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="" disabled>Wybierz kategorię</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Zdjęcie (opcjonalnie)</label>
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '2px dashed #e5e7eb', borderRadius: '8px', padding: '20px',
                                cursor: 'pointer', backgroundColor: '#fafafa', transition: 'border-color 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                            >
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                {form.imageUrl ? (
                                    <img src={form.imageUrl} alt="preview" style={{ maxHeight: '180px', borderRadius: '6px', objectFit: 'cover' }} />
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                        <span style={{ fontSize: '0.85rem', color: '#888' }}>Kliknij, aby wybrać zdjęcie</span>
                                        <span style={{ fontSize: '0.75rem', color: '#bbb', marginTop: '4px' }}>PNG, JPG, WEBP</span>
                                    </>
                                )}
                            </label>
                            {form.imageUrl && (
                                <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                                    style={{ marginTop: '8px', background: 'none', border: 'none', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    Usuń zdjęcie
                                </button>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Data zakończenia aukcji</label>
                            <input
                                type="datetime-local"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#111'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                    color: '#555',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: loading ? '#555' : '#111',
                                    color: '#fff',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                }}
                            >
                                {loading ? 'Tworzenie...' : 'Utwórz aukcję'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
};

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#111',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
};