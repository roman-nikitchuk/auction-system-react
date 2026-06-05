import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myAuctions, setMyAuctions] = useState([]);

    useEffect(() => {
        if (!user) return;
        api.get('/auctions').then(r => {
            setMyAuctions(r.data.filter(a => a.ownerId === user.id));
        }).catch(() => {});
    }, [user]);

    if (!user) return (
        <>
            <Navbar />
            <p style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Nie jesteś zalogowany.</p>
        </>
    );

    const initials = user.userName?.slice(0, 2).toUpperCase() ?? '??';
    const isAdmin = user.role === 'Admin';
    const activeAuctions = myAuctions.filter(a => a.status === 'Active').length;
    const endedAuctions = myAuctions.filter(a => a.status === 'Ended').length;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <Navbar />

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 32px' }}>

                {/* Profile header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: '#111', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.7rem', fontWeight: '700',
                    }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111', margin: 0 }}>{user.userName}</h1>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                                backgroundColor: isAdmin ? '#fef3c7' : '#f3f4f6',
                                color: isAdmin ? '#92400e' : '#555',
                            }}>
                                {user.role}
                            </span>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.88rem', margin: 0 }}>{user.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Wszystkie aukcje', value: myAuctions.length },
                        { label: 'Aktywne', value: activeAuctions, highlight: true },
                        { label: 'Zakończone', value: endedAuctions },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            backgroundColor: '#fff', border: '1px solid #e5e7eb',
                            borderRadius: '10px', padding: '20px',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: '1.9rem', fontWeight: '700', color: stat.highlight ? '#16a34a' : '#111', margin: 0, lineHeight: 1 }}>{stat.value}</p>
                            <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Info card */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Dane konta</p>
                    </div>
                    {[
                        { label: 'Nazwa użytkownika', value: user.userName },
                        { label: 'Adres email', value: user.email },
                        { label: 'Rola w systemie', value: user.role },
                    ].map((row, i, arr) => (
                        <div key={row.label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 20px',
                            borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                            <span style={{ fontSize: '0.88rem', color: '#666' }}>{row.label}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: '500', color: '#111' }}>{row.value}</span>
                        </div>
                    ))}
                </div>

                {/* My auctions */}
                {myAuctions.length > 0 && (
                    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Moje aukcje</p>
                        </div>
                        {myAuctions.slice(0, 4).map((a, i) => (
                            <div
                                key={a.id}
                                onClick={() => navigate(`/auctions/${a.id}`)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '14px 20px', cursor: 'pointer',
                                    borderBottom: i < Math.min(myAuctions.length, 4) - 1 ? '1px solid #f3f4f6' : 'none',
                                    backgroundColor: '#fff', transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                <div>
                                    <p style={{ fontWeight: '500', color: '#111', fontSize: '0.9rem', margin: 0 }}>{a.title}</p>
                                    <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '2px 0 0' }}>{a.categoryName}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: '600', color: '#111', fontSize: '0.9rem' }}>
                                        {a.currentBid.toLocaleString('pl-PL')} zł
                                    </span>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                                        backgroundColor: a.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                                        color: a.status === 'Active' ? '#16a34a' : '#6b7280',
                                    }}>
                                        {a.status === 'Active' ? 'Aktywna' : 'Zakończona'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}