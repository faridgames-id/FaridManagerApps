'use client';
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Smartphone, CheckCircle, XCircle, CreditCard, Filter } from 'lucide-react';

export default function SearchTab({ accounts, formatRupiah, globalKeyword }) {
    const [game, setGame] = useState('all'); // 'all', 'ff', 'ml'
    const [status, setStatus] = useState('all'); // 'all', 'aktif', 'terjual', 'cicilan'
    const [keyword, setKeyword] = useState(globalKeyword || '');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Live search logic
    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            const query = keyword.toLowerCase().trim();
            if (!query && game === 'all' && status === 'all') {
                setResults([]);
                setIsSearching(false);
                return;
            }

            const filtered = accounts.filter(a => {
                const matchGame = game === 'all' || a.game === game;
                const matchStatus = status === 'all' || a.status === status;
                
                // Search across multiple fields
                const matchKeyword = !query || (
                    (a.spek && a.spek.toLowerCase().includes(query)) ||
                    (a.rank && a.rank.toLowerCase().includes(query)) ||
                    (a.seller && a.seller.toLowerCase().includes(query)) ||
                    (a.buyer && a.buyer.toLowerCase().includes(query)) ||
                    (a.email && a.email.toLowerCase().includes(query)) ||
                    (a.keterangan && a.keterangan.toLowerCase().includes(query)) ||
                    (a.notes && a.notes.toLowerCase().includes(query))
                );

                return matchGame && matchStatus && matchKeyword;
            });

            setResults(filtered);
            setIsSearching(false);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [keyword, game, status, accounts]);

    return (
        <div id="pencarian" className="tab-content active" style={{ display: 'block', padding: '20px 0' }}>
            <div className="command-center-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* SPOTLIGHT SEARCH BAR */}
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <div style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-blue)' }}>
                        <Search width="28" height="28" strokeWidth={2.5} />
                    </div>
                    <input 
                        type="text" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Cari ID, Email, Penjual, Spesifikasi..."
                        style={{
                            width: '100%',
                            padding: '24px 24px 24px 68px',
                            fontSize: '1.2rem',
                            fontWeight: 500,
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '32px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--shadow-xl)',
                            outline: 'none',
                            transition: 'all 0.3s var(--ease-out)'
                        }}
                        autoFocus
                    />
                    {isSearching && (
                        <div style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        </div>
                    )}
                </div>

                {/* FILTERS */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', padding: '0 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <Filter width="14" height="14" color="var(--text-tertiary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Game:</span>
                        <select 
                            value={game} 
                            onChange={(e) => setGame(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">Semua</option>
                            <option value="ff">Free Fire</option>
                            <option value="ml">Mobile Legends</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <Filter width="14" height="14" color="var(--text-tertiary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="all">Semua</option>
                            <option value="aktif">Ready / Aktif</option>
                            <option value="terjual">Terjual</option>
                            <option value="cicilan">Cicilan</option>
                        </select>
                    </div>
                </div>

                {/* RESULTS */}
                {(keyword || game !== 'all' || status !== 'all') && (
                    <div className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Hasil Pencarian ({results.length})</h3>
                        </div>
                        
                        <div className="table-responsive" style={{ border: 'none', borderRadius: 0, maxHeight: '600px' }}>
                            <table className="stock-table">
                                <thead>
                                    <tr>
                                        <th>Game</th>
                                        <th>Spesifikasi</th>
                                        <th>Status</th>
                                        <th>Harga</th>
                                        <th>Email</th>
                                        <th>Penjual</th>
                                        <th>Pembeli</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                                                <Search width="48" height="48" style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Tidak ada hasil ditemukan</div>
                                                <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>Coba gunakan kata kunci atau filter lain.</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((a, i) => (
                                            <tr key={a.id}>
                                                <td>
                                                    <span className={`badge ${a.game === 'ff' ? 'badge-ff' : 'badge-ml'}`} style={{ fontSize: '0.7rem' }}>
                                                        {a.game === 'ff' ? 'FF' : 'ML'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{a.spek}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Lv. {a.rank || '-'}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${a.status}`} style={{ fontSize: '0.7rem' }}>
                                                        {a.status === 'aktif' ? 'Ready' : a.status === 'terjual' ? 'Terjual' : 'Cicilan'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: a.status === 'terjual' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                                        {formatRupiah(a.sellPrice || a.targetPrice || a.buyPrice || 0)}
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{a.email || '-'}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{a.seller || '-'}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{a.buyer || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {(!keyword && game === 'all' && status === 'all') && (
                    <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-tertiary)' }}>
                        <Search width="64" height="64" style={{ opacity: 0.1, margin: '0 auto 24px' }} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Command Center</h2>
                        <p style={{ fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>Ketik apapun untuk mencari stok akun, data penjual, email login, atau status transaksi.</p>
                    </div>
                )}

            </div>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
