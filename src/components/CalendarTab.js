'use client';
import React, { useState } from 'react';
import { Gamepad2, Calendar, Plus, Save, X, DollarSign, TrendingUp, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CalendarTab({
    accounts = [],
    keuanganTransactions = [],
    onAddTransaction,
    onDeleteTransaction,
    formatRupiah,
    parseRupiah,
    globalFilterMonth,
    globalFilterYear
}) {
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    // Form States
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [tipe, setTipe] = useState('pemasukan');
    const [jumlah, setJumlah] = useState('');
    const [kategori, setKategori] = useState('');
    const [keterangan, setKeterangan] = useState('');

    const currentDt = new Date();
    const year = globalFilterYear === 'semua' ? currentDt.getFullYear() : parseInt(globalFilterYear);
    const month = globalFilterMonth === 'semua' ? currentDt.getMonth() : parseInt(globalFilterMonth);
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // 1. Filter manual transactions for this month
    const monthTransactions = keuanganTransactions.filter(t => {
        if (!t.tanggal) return false;
        const parts = t.tanggal.split('-');
        const tYear = parseInt(parts[0]);
        const tMonth = parseInt(parts[1]) - 1;
        return tYear === year && tMonth === month;
    });

    // 2. Filter sold accounts for this month (automatic profit calculations)
    const soldAccountsThisMonth = accounts.filter(a => {
        if (a.sellDate && a.status === 'terjual') {
            const parts = a.sellDate.split('-');
            const accYear = parseInt(parts[0]);
            const accMonth = parseInt(parts[1]) - 1;
            return accYear === year && accMonth === month;
        }
        return false;
    });

    // 3. Compute daily stats for automatic profits
    const dailyKeuntungan = {};
    soldAccountsThisMonth.forEach(account => {
        const dateStr = account.sellDate;
        if (dateStr) {
            if (!dailyKeuntungan[dateStr]) {
                dailyKeuntungan[dateStr] = {
                    pemasukan: 0,
                    pengeluaran: 0,
                    profit: 0,
                    accounts: []
                };
            }
            const sellPrice = account.sellPrice || 0;
            const buyPrice = account.buyPrice || 0;
            const profit = sellPrice - buyPrice;
            dailyKeuntungan[dateStr].pemasukan += sellPrice;
            dailyKeuntungan[dateStr].profit += profit;
            dailyKeuntungan[dateStr].accounts.push({
                game: account.game,
                spek: account.spek || account.id,
                profit: profit
            });
        }
    });

    // 4. Merge manual and automatic transactions (without mutating state)
    let mergedTransactions = monthTransactions.map(t => ({ ...t, isAuto: false }));

    Object.keys(dailyKeuntungan).forEach(date => {
        const data = dailyKeuntungan[date];
        const existingIdx = mergedTransactions.findIndex(t => t.tanggal === date && !t.isAuto);
        if (existingIdx >= 0) {
            // Update copy of manual transaction on the fly
            mergedTransactions[existingIdx] = {
                ...mergedTransactions[existingIdx],
                jumlah: mergedTransactions[existingIdx].jumlah + data.pemasukan,
                autoProfit: data.profit,
                autoAccounts: data.accounts
            };
        } else {
            // Create a virtual automatic transaction
            if (data.pemasukan > 0) {
                mergedTransactions.push({
                    id: `${date}_auto`,
                    tanggal: date,
                    tipe: 'pemasukan',
                    jumlah: data.pemasukan,
                    kategori: 'Penjualan Akun',
                    keterangan: `${data.accounts.length} akun terjual (keuntungan: ${formatRupiah(data.profit)})`,
                    autoProfit: data.profit,
                    autoAccounts: data.accounts,
                    isAuto: true
                });
            }
        }
    });

    // Calculate totals
    const totalPemasukan = mergedTransactions
        .filter(t => t.tipe === 'pemasukan')
        .reduce((sum, t) => sum + t.jumlah, 0);
    const totalPengeluaran = mergedTransactions
        .filter(t => t.tipe === 'pengeluaran')
        .reduce((sum, t) => sum + t.jumlah, 0);
    const keuntungan = totalPemasukan - totalPengeluaran;

    // Handle Form Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedJumlah = parseRupiah(jumlah);
        if (!tanggal) {
            alert('Pilih tanggal terlebih dahulu!');
            return;
        }
        if (!parsedJumlah || parsedJumlah <= 0) {
            alert('Jumlah harus lebih dari 0!');
            return;
        }

        const newTransaction = {
            tanggal: tanggal,
            tipe: tipe,
            jumlah: parsedJumlah,
            kategori: kategori.trim() || '-',
            keterangan: keterangan.trim() || '-'
        };

        onAddTransaction(newTransaction);
        setJumlah('');
        setKategori('');
        setKeterangan('');
        setIsFormVisible(false);
        alert('Transaksi berhasil ditambahkan!');
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus transaksi ini?')) {
            onDeleteTransaction(id);
        }
    };

    // Calendar Grid Days Rendering
    const renderCalendarGrid = () => {
        const gridCells = [];

        // 1. Day headers
        dayNames.forEach((day, index) => {
            gridCells.push(
                <div 
                    key={`header-${index}`} 
                    style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        padding: '12px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                    }}
                >
                    {day}
                </div>
            );
        });

        // 2. Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            gridCells.push(
                <div key={`empty-${i}`} style={{ background: 'var(--c-50)', padding: '10px', minHeight: '100px', border: '1px solid rgba(255,255,255,0.03)' }} />
            );
        }

        // 3. Render each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = String(day).padStart(2, '0');
            const monthStr = String(month + 1).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;

            const dayTransactions = mergedTransactions.filter(t => t.tanggal === dateStr);
            const dayKeuntungan = dailyKeuntungan[dateStr];

            const dayPemasukan = dayTransactions
                .filter(t => t.tipe === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const dayPengeluaran = dayTransactions
                .filter(t => t.tipe === 'pengeluaran')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const dayProfitOtomatis = dayKeuntungan ? dayKeuntungan.profit : 0;

            let bgColor = 'rgba(15, 23, 42, 0.4)';
            if (dayPemasukan > 0 && dayPengeluaran === 0) bgColor = 'rgba(16, 185, 129, 0.15)';
            else if (dayPengeluaran > 0 && dayPemasukan === 0) bgColor = 'rgba(239, 68, 68, 0.15)';
            else if (dayPemasukan > 0 && dayPengeluaran > 0) bgColor = 'rgba(245, 158, 11, 0.15)';

            if (dayProfitOtomatis !== 0) {
                bgColor = dayProfitOtomatis >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
            }

            gridCells.push(
                <div 
                    key={`day-${day}`} 
                    style={{
                        background: bgColor,
                        padding: '10px',
                        minHeight: '100px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{day}</div>
                    <div>
                        {dayProfitOtomatis !== 0 && (
                            <div style={{ fontSize: '0.7rem', color: dayProfitOtomatis >= 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                                <Gamepad className="inline-block mr-1" style={{ verticalAlign: 'middle' }} />{dayProfitOtomatis >= 0 ? '+' : ''}{formatRupiah(dayProfitOtomatis)}
                            </div>
                        )}
                        {dayPemasukan > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                                +{formatRupiah(dayPemasukan)}
                            </div>
                        )}
                        {dayPengeluaran > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                                -{formatRupiah(dayPengeluaran)}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return gridCells;
    };

    const sortedTransactions = [...mergedTransactions].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    return (
        <div id="kalender-keuangan" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>📅 Kalender Keuangan - Pemasukan & Pengeluaran</h2>
                
                {/* Selector & Actions */}
                <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', background: 'rgba(55,138,221,0.1)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(55,138,221,0.2)' }}>
                        Menampilkan: {monthNames[month]} {year}
                    </div>
                    <button className="btn btn-success" onClick={() => setIsFormVisible(true)}>➕ Tambah Transaksi</button>
                </div>

                {/* Form Section */}
                {isFormVisible && (
                    <div className="form-section" style={{ marginBottom: '30px', display: 'block' }}>
                        <h2>➕ Tambah Transaksi Keuangan</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tanggal</label>
                                    <input
                                        type="date"
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipe Transaksi</label>
                                    <select value={tipe} onChange={(e) => setTipe(e.target.value)}>
                                        <option value="pemasukan">💰 Pemasukan</option>
                                        <option value="pengeluaran">💸 Pengeluaran</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Jumlah (IDR)</label>
                                    <input
                                        type="text"
                                        value={jumlah}
                                        onChange={(e) => setJumlah(e.target.value)}
                                        onInput={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                        }}
                                        placeholder="Rp 0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <input
                                        type="text"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                        placeholder="Contoh: Jual Akun FF, Iklan, dll."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Keterangan</label>
                                    <input
                                        type="text"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Catatan tambahan..."
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-success">💾 Simpan Transaksi</button>
                                <button type="button" className="btn btn-danger" onClick={() => setIsFormVisible(false)}>❌ Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="summary-cards" style={{ marginBottom: '25px' }}>
                    <div className="card" style={{ background: 'var(--bg-surface)', borderRadius: '15px', padding: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, color: 'var(--text-secondary)' }}><DollarSign className="inline-block mr-1" style={{ verticalAlign: 'middle' }} /> Total Pemasukan</h3>
                        <div className="amount" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatRupiah(totalPemasukan)}</div>
                    </div>
                    <div className="card" style={{ background: 'var(--bg-surface)', borderRadius: '15px', padding: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, color: 'var(--text-secondary)' }}><ArrowDown className="inline-block mr-1" style={{ verticalAlign: 'middle' }} /> Total Pengeluaran</h3>
                        <div className="amount" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatRupiah(totalPengeluaran)}</div>
                    </div>
                    <div className="card" style={{ background: 'var(--bg-surface)', borderRadius: '15px', padding: '20px', textAlign: 'center', color: 'var(--text-primary)' }}>
                        <h3 style={{ fontSize: '.73rem', marginBottom: '10px', opacity: .92, textTransform: 'uppercase', letterSpacing: '1.3px', fontWeight: 700, color: 'var(--text-secondary)' }}>📊 Keuntungan Bersih</h3>
                        <div className="amount" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{(keuntungan >= 0 ? '+' : '') + formatRupiah(keuntungan)}</div>
                    </div>
                </div>

                {/* Calendar Grid Container */}
                <div style={{ background: 'var(--surface)', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '25px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(255, 255, 255, 0.05)' }}>
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Details Section */}
                <div className="form-section">
                    <h2>📋 Detail Transaksi Bulan Ini</h2>
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th>Jumlah</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                                            Belum ada transaksi di {monthNames[month]} {year}
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTransactions.map((t, i) => {
                                        const isPemasukan = t.tipe === 'pemasukan';
                                        return (
                                            <tr key={t.id} style={{ background: t.isAuto ? 'rgba(139, 92, 246, 0.08)' : 'transparent' }}>
                                                <td>{i + 1}</td>
                                                <td>{t.tanggal}</td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: t.isAuto ? '#8B5CF6' : (isPemasukan ? '#10B981' : '#EF4444'),
                                                            color: 'var(--text-primary)',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {t.isAuto ? '🎮 Otomatis' : (isPemasukan ? '💰 Pemasukan' : '💸 Pengeluaran')}
                                                    </span>
                                                </td>
                                                <td>{t.kategori}</td>
                                                <td>{t.keterangan}</td>
                                                <td style={{ color: isPemasukan ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                                                    {isPemasukan ? '+' : '-'}{formatRupiah(t.jumlah)}
                                                </td>
                                                <td>
                                                    {t.isAuto ? (
                                                        <span style={{ color: '#8B5CF6', fontSize: '0.8rem', fontWeight: 600 }}>Auto</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-icon"
                                                            onClick={() => handleDelete(t.id)}
                                                            title="Hapus"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
