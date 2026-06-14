'use client';
import React, { useState } from 'react';
import { AlertTriangle, Star, DollarSign, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';

export default function WishlistTab({
    wishlistItems = [],
    onAddWishlistItem,
    onDeleteWishlistItem,
    formatRupiah,
    parseRupiah
}) {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('hp');
    const [budget, setBudget] = useState('');
    const [priority, setPriority] = useState('high');
    const [specs, setSpecs] = useState('');
    const [source, setSource] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('planning');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!itemName.trim()) {
            alert('Nama barang harus diisi!');
            return;
        }

        const parsedBudget = parseRupiah(budget) || 0;

        const newWishlist = {
            itemName: itemName.trim(),
            category: category,
            budget: parsedBudget,
            priority: priority,
            specs: specs.trim() || '-',
            source: source.trim() || '-',
            notes: notes.trim() || '-',
            status: status,
            dateAdded: new Date().toISOString().split('T')[0]
        };

        onAddWishlistItem(newWishlist);

        // Clear Form
        setItemName('');
        setBudget('');
        setSpecs('');
        setSource('');
        setNotes('');

        alert('Wishlist barang berhasil ditambahkan!');
    };

    // Calculate Summary Stats
    const totalItems = wishlistItems.length;
    const highPriorityItems = wishlistItems.filter(item => item.priority === 'high').length;
    const totalBudget = wishlistItems.reduce((sum, item) => sum + (item.budget || 0), 0);
    const receivedItems = wishlistItems.filter(item => item.status === 'received').length;

    // Sort by priority (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedWishlist = [...wishlistItems].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const priorityBadge = (p) => {
        if (p === 'high') return <span style={{ background: '#ef4444', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>🔴 Urgent</span>;
        if (p === 'medium') return <span style={{ background: '#f59e0b', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>🟡 Perlu</span>;
        return <span style={{ background: '#10b981', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>🟢 Nanti</span>;
    };

    const statusBadge = (s) => {
        if (s === 'planning') return <span style={{ background: '#3b82f6', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>📋 Rencana</span>;
        if (s === 'saved') return <span style={{ background: '#f59e0b', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}><Coins width="14" height="14" style={{ marginRight: '4px', verticalAlign: 'middle' }} />Dana Siap</span>;
        if (s === 'ordered') return <span style={{ background: '#8b5cf6', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>🛒 Dipesan</span>;
        return <span style={{ background: '#10b981', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>✅ Terima</span>;
    };

    const categoryText = (cat) => {
        const catMap = {
            hp: '📱 HP/Smartphone',
            tablet: '📱 Tablet/iPad',
            pc: '💻 PC/Laptop',
            network: '🌐 Jaringan/Router',
            accessories: '🎧 Aksesoris',
            software: '💿 Software/Aplikasi',
            other: '📦 Lainnya'
        };
        return catMap[cat] || '📦 Lainnya';
    };

    return (
        <div id="wishlist" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                {/* Form Tambah Wishlist */}
                <div className="form-section" style={{ marginBottom: '30px' }}>
                    <h2>⭐ Tambah Wishlist Barang Bisnis</h2>
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nama Barang/Equipment</label>
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="Contoh: iPhone 13 Pro, Router WiFi 6"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Kategori</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="hp">📱 HP/Smartphone</option>
                                    <option value="tablet">📱 Tablet/iPad</option>
                                    <option value="pc">💻 PC/Laptop</option>
                                    <option value="network">🌐 Jaringan/Router</option>
                                    <option value="accessories">🎧 Aksesoris</option>
                                    <option value="software">💿 Software/Aplikasi</option>
                                    <option value="other">📦 Lainnya</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Estimasi Harga (IDR)</label>
                                <input
                                    type="text"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    placeholder="Rp 0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Prioritas</label>
                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="high">🔴 Tinggi - Urgent</option>
                                    <option value="medium">🟡 Sedang - Perlu</option>
                                    <option value="low">🟢 Rendah - Nanti Dulu</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row" style={{ marginTop: '15px' }}>
                            <div className="form-group">
                                <label>Spesifikasi/Detail</label>
                                <input
                                    type="text"
                                    value={specs}
                                    onChange={(e) => setSpecs(e.target.value)}
                                    placeholder="Contoh: RAM 8GB, Storage 256GB, 5G"
                                />
                            </div>
                            <div className="form-group">
                                <label>Link/Toko</label>
                                <input
                                    type="text"
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    placeholder="Link Shopee/Tokopedia/Offline store"
                                />
                            </div>
                        </div>

                        <div className="form-row" style={{ marginTop: '15px' }}>
                            <div className="form-group">
                                <label>Catatan/Alasan</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Kenapa perlu barang ini untuk bisnis..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Status Pembelian</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="planning">📋 Rencana</option>
                                    <option value="saved"><Coins width="14" height="14" style={{ marginRight: '4px', verticalAlign: 'middle' }} />Dana Tersimpan</option>
                                    <option value="ordered">🛒 Sudah Pesan</option>
                                    <option value="received">✅ Sudah Terima</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
                            ⭐ Simpan Wishlist Barang
                        </button>
                    </form>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards" style={{ marginBottom: '30px' }}>
                    <div className="card" style={{ background: 'rgba(20, 30, 50, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700 }}>📦 Total Item</h3>
                        <div className="amount" style={{ fontSize: '2rem', fontWeight: 800 }}>{totalItems}</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, color: '#ef4444' }}>🔴 Prioritas Tinggi</h3>
                        <div className="amount" style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{highPriorityItems}</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(20, 30, 50, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700 }}><Coins width="14" height="14" style={{ marginRight: '4px', verticalAlign: 'middle' }} />Total Estimasi</h3>
                        <div className="amount" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{formatRupiah(totalBudget)}</div>
                    </div>
                    <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, color: '#10b981' }}>✅ Sudah Terima</h3>
                        <div className="amount" style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{receivedItems}</div>
                    </div>
                </div>

                {/* Wishlist Table */}
                <div style={{ background: 'var(--surface)', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: 'var(--text-primary)', margin: '0 0 20px 0', fontSize: '1.3rem', display: 'flex', alignPageItems: 'center', gap: '10px' }}>
                        ⭐ Wishlist Equipment Bisnis
                    </h2>
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>Spesifikasi</th>
                                    <th>Estimasi Harga</th>
                                    <th>Prioritas</th>
                                    <th>Status</th>
                                    <th>Link/Toko</th>
                                    <th>Catatan</th>
                                    <th>Tanggal</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedWishlist.length === 0 ? (
                                    <tr>
                                        <td colSpan="11">
                                            <div className="empty-state">
                                                <p>Belum ada wishlist barang. Tambahkan equipment yang Anda butuhkan untuk bisnis!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedWishlist.map((item, i) => (
                                        <tr key={item.id}>
                                            <td>{i + 1}</td>
                                            <td><strong>{item.itemName}</strong></td>
                                            <td>{categoryText(item.category)}</td>
                                            <td>{item.specs}</td>
                                            <td style={{ fontWeight: 'bold' }}>{formatRupiah(item.budget)}</td>
                                            <td style={{ textAlign: 'center' }}>{priorityBadge(item.priority)}</td>
                                            <td style={{ textAlign: 'center' }}>{statusBadge(item.status)}</td>
                                            <td>
                                                {item.source && item.source !== '-' ? (
                                                    <a href={item.source.startsWith('http') ? item.source : `https://${item.source}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'underline' }}>
                                                        <Link width="14" height="14" style={{ marginRight: '4px', verticalAlign: 'middle' }} />Link
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td>{item.notes}</td>
                                            <td>{item.dateAdded}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon"
                                                    onClick={() => {
                                                        if (confirm('Hapus item wishlist ini?')) {
                                                            onDeleteWishlistItem(item.id);
                                                        }
                                                    }}
                                                    title="Hapus"
                                                >
                                                    <Trash2 width="14" height="14" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
