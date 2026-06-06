'use client';
import React, { useState } from 'react';

export default function SearchTab({ accounts, formatRupiah, onUpdateAccount, onDeleteAccount, globalKeyword }) {
    const [game, setGame] = useState('all'); // 'all', 'ff', 'ml'
    const [status, setStatus] = useState('all'); // 'all', 'aktif', 'terjual', 'cicilan'
    const [keyword, setKeyword] = useState(globalKeyword || '');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);

    // Auto-search if globalKeyword changes and is not empty
    React.useEffect(() => {
        if (globalKeyword) {
            setKeyword(globalKeyword);
            const query = globalKeyword.toLowerCase().trim();
            const filtered = accounts.filter(a => {
                const matchKeyword = (
                    (a.spek && a.spek.toLowerCase().includes(query)) ||
                    (a.rank && a.rank.toLowerCase().includes(query)) ||
                    (a.seller && a.seller.toLowerCase().includes(query)) ||
                    (a.buyer && a.buyer.toLowerCase().includes(query)) ||
                    (a.email && a.email.toLowerCase().includes(query)) ||
                    (a.keterangan && a.keterangan.toLowerCase().includes(query)) ||
                    (a.notes && a.notes.toLowerCase().includes(query))
                );
                return matchKeyword;
            });
            setGame('all');
            setStatus('all');
            setResults(filtered);
            setSearched(true);
        }
    }, [globalKeyword, accounts]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        
        const query = keyword.toLowerCase().trim();
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
        setSearched(true);
    };

    return (
        <div id="pencarian" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                <div className="form-section">
                    <h2>🔍 Pencarian Akun & Transaksi Global</h2>
                    <form onSubmit={handleSearch}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Game</label>
                                <select value={game} onChange={(e) => setGame(e.target.value)}>
                                    <option value="all">Semua Game</option>
                                    <option value="ff">Free Fire</option>
                                    <option value="ml">Mobile Legends</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="all">Semua Status</option>
                                    <option value="aktif">Ready / Aktif</option>
                                    <option value="terjual">Terjual</option>
                                    <option value="cicilan">Kredit / Cicilan</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Kata Kunci (Spek, Email, Penjual, Pembeli, dll)</label>
                                <input 
                                    type="text" 
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Ketik kata kunci pencarian..."
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
                            🔍 Mulai Pencarian
                        </button>
                    </form>
                </div>

                {searched && (
                    <div className="stat-finance" style={{ marginTop: '20px' }}>
                        <h2 className="section-title">📊 Hasil Pencarian ({results.length} ditemukan)</h2>
                        <div className="table-responsive">
                            <table className="stock-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Game</th>
                                        <th>Spesifikasi</th>
                                        <th>Rank/Level</th>
                                        <th>Harga Beli</th>
                                        <th>Harga Jual</th>
                                        <th>Status</th>
                                        <th>Penjual</th>
                                        <th>Pembeli</th>
                                        <th>Email Akun</th>
                                        <th>Device</th>
                                        <th>Tanggal Masuk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length === 0 ? (
                                        <tr><td colSpan="12" className="empty-state">Tidak ada hasil pencarian yang cocok.</td></tr>
                                    ) : (
                                        results.map((a, i) => (
                                            <tr key={a.id}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <span className={`badge ${a.game === 'ff' ? 'badge-ff' : 'badge-ml'}`}>
                                                        {a.game === 'ff' ? 'FF' : 'ML'}
                                                    </span>
                                                </td>
                                                <td><strong>{a.spek}</strong></td>
                                                <td>{a.rank}</td>
                                                <td>{formatRupiah(a.buyPrice)}</td>
                                                <td>{formatRupiah(a.sellPrice || a.targetPrice || 0)}</td>
                                                <td>
                                                    <span className={`badge badge-${a.status}`}>
                                                        {a.status === 'aktif' ? '✅ Ready' : a.status === 'terjual' ? '❌ Terjual' : '💳 Cicilan'}
                                                    </span>
                                                </td>
                                                <td>{a.seller || '-'}</td>
                                                <td>{a.buyer || '-'}</td>
                                                <td>{a.email || '-'}</td>
                                                <td>📱 {a.device || '-'}</td>
                                                <td>{a.buyDate || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
