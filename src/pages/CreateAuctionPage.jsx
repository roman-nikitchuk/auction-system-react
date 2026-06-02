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

        if (!form.categoryId) {
            setError('Wybierz kategorię');
            return;
        }

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
            console.log(err);
            setError('Nie udało się utworzyć aukcji');
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
                        required
                        style={inputStyle}
                    />

                    <textarea
                        name="description"
                        placeholder="Opis"
                        value={form.description}
                        onChange={handleChange}
                        required
                        style={{ ...inputStyle, minHeight: '150px' }}
                    />

                    <input
                        type="number"
                        name="startingPrice"
                        placeholder="Cena początkowa"
                        value={form.startingPrice}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        required
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
                        required
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
