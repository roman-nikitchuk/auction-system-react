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
    });

    const [error, setError] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Błąd pobierania kategorii', error);
            }
        };

        loadCategories();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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
        try {
            const response = await api.post('/auctions', {
                title: form.title,
                description: form.description,
                startingPrice: Number(form.startingPrice),
                categoryId: Number(form.categoryId),
                startDate: new Date().toISOString(),
                endDate: new Date(form.endDate).toISOString(),
                ownerId: user.id,
            });

            navigate(`/auctions/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data || 'Nie udało się utworzyć aukcji');
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ maxWidth: '700px', margin: '40px auto' }}>
                <h1>Dodaj aukcję</h1>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        name="title"
                        placeholder="Tytuł"
                        value={form.title}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <textarea
                        name="description"
                        placeholder="Opis"
                        value={form.description}
                        onChange={handleChange}
                        style={{ ...inputStyle, minHeight: '150px' }}
                    />

                    <input
                        type="number"
                        name="startingPrice"
                        placeholder="Cena początkowa"
                        value={form.startingPrice}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="" disabled>
                            Wybierz kategorię
                        </option>

                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="datetime-local"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <button type="submit" style={buttonStyle}>
                        Utwórz aukcję
                    </button>
                </form>
            </div>
        </>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
};

const buttonStyle = {
    width: '100%',
    padding: '12px',
    cursor: 'pointer',
};
