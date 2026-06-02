import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
    } catch {
      setError('Nie udało się załadować aukcji');
    }
  };

  const fetchBids = async () => {
    try {
      const response = await api.get(`/auctions/${id}/bids`);
      setBids(response.data);
    } catch {
      setBids([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAuction();
      await fetchBids();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(null);
    try {
      await api.post(`/auctions/${id}/bids`, {
        userId: user.id,
        amount: parseFloat(bidAmount),
      });
      setBidSuccess('Oferta została złożona!');
      setBidAmount('');
      await fetchAuction();
      await fetchBids();
    } catch (err) {
      setBidError(
        err.response?.data?.message || 'Błąd podczas składania oferty'
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę aukcję?')) return;
    try {
      await api.delete(`/auctions/${id}`);
      navigate('/');
    } catch {
      alert('Nie udało się usunąć aukcji');
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!auction) return null;

  const isOwner = user?.id === auction.ownerId;
  const isAdmin = user?.role === 'Admin';
  const isActive = auction.status === 'Active';
  const endDate = new Date(auction.endDate).toLocaleString();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

      
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#aaa',
          fontSize: '14px',
          marginBottom: '20px',
          padding: '0',
        }}
      >
        ← Powrót do listy
      </button>

      <h1>{auction.title}</h1>
      <p><strong>Kategoria:</strong> {auction.category?.name}</p>
      <p><strong>Opis:</strong> {auction.description}</p>
      <p><strong>Cena początkowa:</strong> {auction.startingPrice} zł</p>
      <p><strong>Aktualna oferta:</strong> {auction.currentBid} zł</p>
      <p><strong>Status:</strong> {auction.status}</p>
      <p><strong>Koniec aukcji:</strong> {endDate}</p>
      <p><strong>Właściciel:</strong> {auction.owner?.userName}</p>

      {(isOwner || isAdmin) && (
        <button
          onClick={handleDelete}
          style={{
            marginTop: '10px',
            padding: '8px 20px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Usuń aukcję
        </button>
      )}

      <hr />

      {user && !isOwner && isActive && (
        <div>
          <h2>Złóż ofertę</h2>
          <form onSubmit={handleBid}>
            <input
              type="number"
              placeholder="Wpisz kwotę"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={auction.currentBid + 1}
              required
              style={{ marginRight: '10px', padding: '8px' }}
            />
            <button type="submit" style={{ padding: '8px 16px' }}>
              Licytuj
            </button>
          </form>
          {bidError && <p style={{ color: 'red' }}>{bidError}</p>}
          {bidSuccess && <p style={{ color: 'green' }}>{bidSuccess}</p>}
        </div>
      )}

      {!user && (
        <p>Aby licytować — <a href="/login">zaloguj się</a></p>
      )}

      {isOwner && (
        <p><em>To Twoja aukcja — nie możesz licytować</em></p>
      )}

      {!isActive && (
        <p><em>Aukcja została zakończona</em></p>
      )}

      <hr />

      <h2>Historia ofert</h2>

      {bids.length === 0 ? (
        <p>Brak ofert</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>
                Użytkownik
              </th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>
                Kwota
              </th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}>
                Czas
              </th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{bid.userId}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{bid.amount} zł</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {new Date(bid.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
