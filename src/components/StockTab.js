'use client';
import React, { useState } from 'react';
import { Copy, Calendar, Trash2, Edit, Plus } from 'lucide-react';
import AiInsightCard from './AiInsightCard';

export default function StockTab({ 
    game, 
    accounts, 
    onAddAccount, 
    onUpdateAccount, 
    onDeleteAccount, 
    formatRupiah, 
    parseRupiah,
    globalFilterMonth,
    globalFilterYear
}) {
    const [subTab, setSubTab] = useState('ready'); // 'ready', 'terjual', 'cicilan'
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form state for adding
    const [spek, setSpek] = useState('');
    const [rank, setRank] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [buyMonth, setBuyMonth] = useState('');
    const [buyDate, setBuyDate] = useState('');
    const [seller, setSeller] = useState('');
    const [buyer, setBuyer] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [notes, setNotes] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [keteranganCustom, setKeteranganCustom] = useState('');
    const [device, setDevice] = useState('');

    // Modal States
    const [editingAccount, setEditingAccount] = useState(null);
    const [sellingAccount, setSellingAccount] = useState(null);
    const [payingAccount, setPayingAccount] = useState(null);
    const [movingAccount, setMovingAccount] = useState(null);
    const [editingSellPriceAccount, setEditingSellPriceAccount] = useState(null);

    // Modal Form States
    const [editForm, setEditForm] = useState({});
    const [sellForm, setSellForm] = useState({ sellPrice: '', sellDate: '', buyer: '' });
    const [payForm, setPayForm] = useState({ amount: '', date: '' });
    const [moveForm, setMoveForm] = useState({ month: '' });
    const [editSellPriceForm, setEditSellPriceForm] = useState({ sellPrice: '' });

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // 1. Filter accounts based on global filter and game type
    let gameAccounts = accounts.filter(a => a.game === game);

    // Apply global month filter
    if (globalFilterMonth !== 'all') {
        const monthNum = parseInt(globalFilterMonth);
        const yearNum = parseInt(globalFilterYear);
        gameAccounts = gameAccounts.filter(a => {
            let match = false;
            if (a.buyDate) {
                const bParts = a.buyDate.split('-');
                if (parseInt(bParts[0]) === yearNum && (parseInt(bParts[1]) - 1) === monthNum) match = true;
            }
            if (a.status === 'terjual' && a.sellDate) {
                const sParts = a.sellDate.split('-');
                if (parseInt(sParts[0]) === yearNum && (parseInt(sParts[1]) - 1) === monthNum) match = true;
            }
            return match;
        });
    }

    // Apply search query filter
    const searchedAccounts = gameAccounts.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
            (a.spek && a.spek.toLowerCase().includes(query)) ||
            (a.rank && a.rank.toLowerCase().includes(query)) ||
            (a.seller && a.seller.toLowerCase().includes(query)) ||
            (a.buyer && a.buyer.toLowerCase().includes(query)) ||
            (a.email && a.email.toLowerCase().includes(query)) ||
            (a.keterangan && a.keterangan.toLowerCase().includes(query))
        );
    });

    const readyAccounts = searchedAccounts.filter(a => a.status === 'aktif');
    const soldAccounts = searchedAccounts.filter(a => a.status === 'terjual');
    const cicilanAccounts = searchedAccounts.filter(a => a.status === 'cicilan');

    // Add Account Handler
    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!buyMonth) {
            alert('⚠️ Pilih bulan masuk stok terlebih dahulu!');
            return;
        }

        const [year, month] = buyMonth.split('-').map(Number);
        
        let finalBuyDate = buyDate;
        if (!finalBuyDate) {
            const day = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0');
            finalBuyDate = `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
        }

        const finalKeterangan = keterangan === 'custom' ? keteranganCustom : (keterangan || '-');

        const newAccount = {
            game: game,
            spek: spek || 'Tidak ada spesifikasi',
            rank: rank || '-',
            buyPrice: parseRupiah(buyPrice) || 0,
            targetPrice: parseRupiah(targetPrice) || 0,
            buyDate: finalBuyDate,
            sellDate: '',
            sellPrice: 0,
            seller: seller || '-',
            buyer: buyer || '',
            email: email || '-',
            password: password || '-',
            notes: notes || '-',
            keterangan: finalKeterangan,
            device: device || '-',
            status: buyer ? 'terjual' : 'aktif'
        };

        onAddAccount(newAccount);

        // Clear Form
        setSpek('');
        setRank('');
        setBuyPrice('');
        setTargetPrice('');
        setBuyMonth('');
        setBuyDate('');
        setSeller('');
        setBuyer('');
        setEmail('');
        setPassword('');
        setNotes('');
        setKeterangan('');
        setKeteranganCustom('');
        setDevice('');

        alert(`✅ Akun ${(game || '').toUpperCase()} berhasil disimpan!`);
    };

    // Open Edit Modal
    const openEdit = (account) => {
        setEditingAccount(account);
        setEditForm({
            id: account.id,
            spek: account.spek || '',
            rank: account.rank || '',
            buyPrice: account.buyPrice ? formatRupiah(account.buyPrice) : '',
            targetPrice: account.targetPrice ? formatRupiah(account.targetPrice) : '',
            email: account.email || '',
            password: account.password || '',
            buyDate: account.buyDate || '',
            seller: account.seller || '',
            device: account.device || '',
            keterangan: account.keterangan || '',
            notes: account.notes || '',
            status: account.status
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        onUpdateAccount(editForm.id, {
            spek: editForm.spek,
            rank: editForm.rank,
            buyPrice: parseRupiah(editForm.buyPrice),
            targetPrice: parseRupiah(editForm.targetPrice),
            email: editForm.email,
            password: editForm.password,
            buyDate: editForm.buyDate,
            seller: editForm.seller,
            device: editForm.device,
            keterangan: editForm.keterangan,
            notes: editForm.notes,
            status: editForm.status
        });
        setEditingAccount(null);
    };

    // Open Sell Modal
    const openSell = (account) => {
        setSellingAccount(account);
        setSellForm({
            sellPrice: formatRupiah(account.targetPrice || 0),
            sellDate: new Date().toISOString().split('T')[0],
            buyer: ''
        });
    };

    const handleSellSubmit = (e) => {
        e.preventDefault();
        const price = parseRupiah(sellForm.sellPrice);
        if (!sellForm.buyer) {
            alert('⚠️ Nama pembeli harus diisi!');
            return;
        }
        onUpdateAccount(sellingAccount.id, {
            status: 'terjual',
            sellPrice: price,
            sellDate: sellForm.sellDate,
            buyer: sellForm.buyer
        });
        setSellingAccount(null);
    };

    // Open Pay Installment Modal
    const openPay = (account) => {
        setPayingAccount(account);
        const totalAmount = account.targetPrice || account.sellPrice || 0;
        const paidAmount = account.installmentPaid || 0;
        const remaining = totalAmount - paidAmount;
        setPayForm({
            amount: formatRupiah(remaining),
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        const payAmount = parseRupiah(payForm.amount);
        const currentPaid = payingAccount.installmentPaid || 0;
        const total = payingAccount.targetPrice || payingAccount.sellPrice || 0;
        const newPaid = currentPaid + payAmount;
        
        const updates = {
            installmentPaid: newPaid
        };

        if (newPaid >= total) {
            updates.status = 'terjual';
            updates.sellPrice = total;
            updates.sellDate = payForm.date;
            alert('🎉 Pembayaran lunas! Status akun diubah menjadi Terjual.');
        } else {
            alert(`✅ Pembayaran sebesar ${formatRupiah(payAmount)} berhasil dicatat.`);
        }

        onUpdateAccount(payingAccount.id, updates);
        setPayingAccount(null);
    };

    // Open Move Month Modal
    const openMove = (account) => {
        setMovingAccount(account);
        setMoveForm({
            month: account.buyDate ? account.buyDate.substring(0, 7) : ''
        });
    };

    const handleMoveSubmit = (e) => {
        e.preventDefault();
        if (!moveForm.month) {
            alert('⚠️ Pilih bulan pemindahan!');
            return;
        }
        const [year, month] = moveForm.month.split('-').map(Number);
        const day = movingAccount.buyDate ? movingAccount.buyDate.split('-')[2] : '28';
        const newBuyDate = `${year}-${String(month + 1).padStart(2, '0')}-${day}`;
        onUpdateAccount(movingAccount.id, { buyDate: newBuyDate });
        setMovingAccount(null);
        alert('<Calendar width="16" height="16" /> Bulan masuk stok berhasil dipindahkan!');
    };

    // Open Edit Sell Price Modal
    const openEditSellPrice = (account) => {
        setEditingSellPriceAccount(account);
        setEditSellPriceForm({
            sellPrice: formatRupiah(account.sellPrice || 0)
        });
    };

    const handleEditSellPriceSubmit = (e) => {
        e.preventDefault();
        onUpdateAccount(editingSellPriceAccount.id, {
            sellPrice: parseRupiah(editSellPriceForm.sellPrice)
        });
        setEditingSellPriceAccount(null);
    };

    // Quick Action: Mark as Paid (Lunas)
    const handleMarkAsPaid = (account) => {
        if (!confirm('Tandai akun ini sebagai Lunas?')) return;
        const total = account.targetPrice || account.sellPrice || account.buyPrice || 0;
        onUpdateAccount(account.id, {
            status: 'terjual',
            sellPrice: total,
            sellDate: new Date().toISOString().split('T')[0],
            installmentPaid: total
        });
    };

    // Quick Action: Mark as Cicilan (Installment)
    const handleMarkAsCicilan = (account) => {
        const buyerName = prompt('Masukkan Nama Pembeli untuk Kredit/Cicilan:');
        if (!buyerName) return;
        
        onUpdateAccount(account.id, {
            status: 'cicilan',
            buyer: buyerName,
            installmentPaid: 0,
            sellPrice: account.targetPrice || 0
        });
    };

    // Feature: Copy Format
    const handleCopyFormat = (account, type) => {
        let text = '';
        if (type === 'FF') {
            text = `SPEK AKUN ⬇️\n${account.spek || '-'}\n✨ FARID STOCK #FREE FIRE ✨\n────────────────────\nKETERANGAN : \n✉️ Email          : ${account.email || ''}\n🔐 Password       : ${account.password || ''}\n────────────────────\n⚠️ PENTING DIBACA ⚠️\n1. Jangan langsung amankan akun Google setelah terima  \n   Risiko akun langsung kenonaktif\n2. Simpan semua data dengan baik setelah diterima\n3. Alrefull berlaku 16hari proses bind ulang / rebind / undbind\n4. Garansi hangus jika akun dijual kembali\n────────────────────\nFarid Shop © 2026`;
        } else {
            text = `SPEK AKUN ⬇️\n${account.spek || '-'}\n✨ FARID STOCK #MOBILE LEGEND ✨\n────────────────────\nKETERANGAN : \n✉️ Email          : ${account.email || ''}\n🔐 Password       : ${account.password || ''}\n────────────────────\n⚠️ PENTING DIBACA ⚠️\n1. Jangan langsung amankan akun Google setelah terima  \n   Risiko akun langsung kenonaktif\n2. Simpan semua data dengan baik setelah diterima\n3. Alrefull berlaku 30DAY proses kontak gm\n4. Garansi hangus jika akun dijual kembali\n────────────────────\nFarid Shop © 2026`;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            alert(`✅ Format ${type} berhasil disalin ke clipboard!`);
        }).catch(err => {
            alert('❌ Gagal menyalin: ' + err);
        });
    };

    return (
        <div id={`stok-${game}`} className="tab-content active" style={{ display: 'block' }}>
            <AiInsightCard title="AI Balance Check" insight={`Stok akun ${game.toUpperCase()} terpantau optimal. Rekomendasi: perbanyak stok akun sultan jika profitabilitas terus meningkat.`} />
            <div className="content">
                {/* Form Tambah Akun */}
                <div className="form-section" style={{ marginBottom: '30px' }}>
                    <h2><Plus width="20" height="20" /> Tambah Akun {game === 'ff' ? 'Free Fire' : 'Mobile Legends'}</h2>
                    <form onSubmit={handleAddSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Spesifikasi Akun</label>
                                <input 
                                    type="text" 
                                    value={spek}
                                    onChange={(e) => setSpek(e.target.value)}
                                    placeholder="Contoh: Skin Bundle 10x" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Rank / Level</label>
                                <input 
                                    type="text" 
                                    value={rank}
                                    onChange={(e) => setRank(e.target.value)}
                                    placeholder="Contoh: Heroic / Mythic" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Harga Beli (IDR)</label>
                                <input 
                                    type="text" 
                                    value={buyPrice}
                                    onChange={(e) => setBuyPrice(e.target.value)}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    placeholder="Rp 0" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Harga Target Jual (IDR)</label>
                                <input 
                                    type="text" 
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    placeholder="Rp 0" 
                                />
                            </div>
                        </div>

                        <div className="form-row" style={{ marginTop: '15px' }}>
                            <div className="form-group">
                                <label>Bulan Masuk Stok</label>
                                <select 
                                    value={buyMonth}
                                    onChange={(e) => setBuyMonth(e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Bulan --</option>
                                    <option value="2026-0">Januari 2026</option>
                                    <option value="2026-1">Februari 2026</option>
                                    <option value="2026-2">Maret 2026</option>
                                    <option value="2026-3">April 2026</option>
                                    <option value="2026-4">Mei 2026</option>
                                    <option value="2026-5">Juni 2026</option>
                                    <option value="2026-6">Juli 2026</option>
                                    <option value="2026-7">Agustus 2026</option>
                                    <option value="2026-8">September 2026</option>
                                    <option value="2026-9">Oktober 2026</option>
                                    <option value="2026-10">November 2026</option>
                                    <option value="2026-11">Desember 2026</option>
                                    <option value="2027-0">Januari 2027</option>
                                    <option value="2027-1">Februari 2027</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tanggal Masuk (Opsional)</label>
                                <input 
                                    type="date" 
                                    value={buyDate}
                                    onChange={(e) => setBuyDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nama Penjual (Seller)</label>
                                <input 
                                    type="text" 
                                    value={seller}
                                    onChange={(e) => setSeller(e.target.value)}
                                    placeholder="Contoh: Budi" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Password Akun</label>
                                <input 
                                    type="text" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password login..." 
                                />
                            </div>
                        </div>

                        <div className="form-row" style={{ marginTop: '15px' }}>
                            <div className="form-group">
                                <label>Email / Akun Login</label>
                                <input 
                                    type="text" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@login.com / 0812..." 
                                />
                            </div>

                            <div className="form-group">
                                <label>Keterangan Status</label>
                                <select 
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                >
                                    <option value="">-- Pilih Status --</option>
                                    <option value="Akun Pribadi">Akun Pribadi</option>
                                    <option value="Akun Titipan">Akun Titipan</option>
                                    <option value="Akun Baru">Akun Baru</option>
                                    <option value="Akun Bekas">Akun Bekas</option>
                                    <option value="Akun Sultan">Akun Sultan</option>
                                    <option value="Akun Receh">Akun Receh</option>
                                    <option value="custom">Tulis Sendiri...</option>
                                </select>
                                {keterangan === 'custom' && (
                                    <input 
                                        type="text" 
                                        value={keteranganCustom}
                                        onChange={(e) => setKeteranganCustom(e.target.value)}
                                        placeholder="Ketik keterangan kustom..."
                                        style={{ marginTop: '5px' }}
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label>Merk HP / Device</label>
                                <input 
                                    type="text" 
                                    value={device}
                                    onChange={(e) => setDevice(e.target.value)}
                                    placeholder="Contoh: iPhone 11 / Asus ROG" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Catatan Tambahan</label>
                                <input 
                                    type="text" 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Catatan tambahan login..." 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
                            💾 Simpan Akun {(game || '').toUpperCase()}
                        </button>
                    </form>
                </div>

                {/* Sub-Tabs (Ready, Terjual, Cicilan) */}
                <div className="sub-tabs">
                    <button className={`sub-tab ${subTab === 'ready' ? 'active' : ''}`} onClick={() => setSubTab('ready')}>Ready</button>
                    <button className={`sub-tab ${subTab === 'terjual' ? 'active' : ''}`} onClick={() => setSubTab('terjual')}>Terjual</button>
                    <button className={`sub-tab ${subTab === 'cicilan' ? 'active' : ''}`} onClick={() => setSubTab('cicilan')}>Cicilan</button>
                </div>

                {/* Search Bar */}
                <div className="filter-row">
                    <input 
                        type="text" 
                        className="search-box" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari spesifikasi, email, status..."
                    />
                </div>

                {/* Sub-tab Contents */}
                {subTab === 'ready' && (
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Spesifikasi</th>
                                    <th>Rank/Level</th>
                                    <th>Harga Beli</th>
                                    <th>Harga Jual</th>
                                    <th>Target Jual</th>
                                    <th>Penjual</th>
                                    <th>Pembeli</th>
                                    <th>Email Akun</th>
                                    <th>Keterangan</th>
                                    <th>Device</th>
                                    <th>Tanggal Masuk</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readyAccounts.length === 0 ? (
                                    <tr><td colSpan="13" className="empty-state">Belum ada akun ready untuk bulan / filter ini.</td></tr>
                                ) : (
                                    readyAccounts.map((a, i) => (
                                        <tr key={a.id}>
                                            <td>{i + 1}</td>
                                            <td>{a.spek}</td>
                                            <td>{a.rank}</td>
                                            <td>{formatRupiah(a.buyPrice)}</td>
                                            <td>{formatRupiah(a.sellPrice || 0)}</td>
                                            <td>{formatRupiah(a.targetPrice || 0)}</td>
                                            <td>{a.seller}</td>
                                            <td>{a.buyer || '-'}</td>
                                            <td>{a.email}</td>
                                            <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{a.keterangan}</span></td>
                                            <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>📱 {a.device}</span></td>
                                            <td>{a.buyDate}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <button className="btn btn-primary btn-icon" onClick={() => openEdit(a)} title="Edit"><Edit width="16" height="16" /></button>
                                                <button className="btn btn-success btn-icon" onClick={() => openSell(a)} title="Jual" style={{ marginLeft: '3px' }}>💰</button>
                                                <button className="btn btn-warning btn-icon" onClick={() => handleMarkAsCicilan(a)} title="Cicilan" style={{ marginLeft: '3px' }}>💳</button>
                                                <button className="btn btn-icon" onClick={() => openMove(a)} style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#fff', marginLeft: '3px', border: 'none', boxShadow: '0 2px 6px rgba(139,92,246,0.5)' }} title="Pindah Bulan"><Calendar width="16" height="16" /></button>
                                                {game === 'ff' && (
                                                    <button className="btn btn-icon" onClick={() => handleCopyFormat(a, 'FF')} style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: '#fff', marginLeft: '3px', boxShadow: '0 2px 6px rgba(59,130,246,0.5)', border: 'none' }} title="Copy Format FF">
                                                        <Copy width="16" height="16" />
                                                    </button>
                                                )}
                                                {game === 'ml' && (
                                                    <button className="btn btn-icon" onClick={() => handleCopyFormat(a, 'ML')} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', marginLeft: '3px', boxShadow: '0 2px 6px rgba(16,185,129,0.5)', border: 'none' }} title="Copy Format ML">
                                                        <Copy width="16" height="16" />
                                                    </button>
                                                )}
                                                <button className="btn btn-danger btn-icon" onClick={() => { if(confirm('Hapus akun ini?')) onDeleteAccount(a.id); }} title="Hapus" style={{ marginLeft: '3px' }}><Trash2 width="16" height="16" /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {subTab === 'terjual' && (
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Spesifikasi</th>
                                    <th>Rank/Level</th>
                                    <th>Harga Beli</th>
                                    <th>Harga Jual</th>
                                    <th>Target Jual</th>
                                    <th>Penjual</th>
                                    <th>Pembeli</th>
                                    <th>Email Akun</th>
                                    <th>Profit</th>
                                    <th>Keterangan</th>
                                    <th>Device</th>
                                    <th>Tanggal Jual</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {soldAccounts.length === 0 ? (
                                    <tr><td colSpan="14" className="empty-state">Belum ada riwayat akun terjual.</td></tr>
                                ) : (
                                    soldAccounts.map((a, i) => {
                                        const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                                        return (
                                            <tr key={a.id}>
                                                <td>{i + 1}</td>
                                                <td>{a.spek}</td>
                                                <td>{a.rank}</td>
                                                <td>{formatRupiah(a.buyPrice)}</td>
                                                <td>{formatRupiah(a.sellPrice || 0)}</td>
                                                <td>{formatRupiah(a.targetPrice || 0)}</td>
                                                <td>{a.seller}</td>
                                                <td>{a.buyer || '-'}</td>
                                                <td>{a.email}</td>
                                                <td style={{ color: profit >= 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{formatRupiah(profit)}</td>
                                                <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{a.keterangan}</span></td>
                                                <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>📱 {a.device}</span></td>
                                                <td>{a.sellDate || a.buyDate}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <button className="btn btn-primary btn-icon" onClick={() => openEdit(a)} title="Edit"><Edit width="16" height="16" /></button>
                                                    <button className="btn btn-warning btn-icon" onClick={() => openEditSellPrice(a)} title="Edit Harga Jual" style={{ marginLeft: '3px' }}>💰</button>
                                                    <button className="btn btn-danger btn-icon" onClick={() => { if(confirm('Hapus akun ini?')) onDeleteAccount(a.id); }} title="Hapus" style={{ marginLeft: '3px' }}><Trash2 width="16" height="16" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {subTab === 'cicilan' && (
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Spesifikasi</th>
                                    <th>Rank/Level</th>
                                    <th>Harga Beli</th>
                                    <th>Sudah Bayar</th>
                                    <th>Total Tagihan</th>
                                    <th>Sisa Cicilan</th>
                                    <th>Penjual</th>
                                    <th>Pembeli</th>
                                    <th>Email Akun</th>
                                    <th>Keterangan</th>
                                    <th>Device</th>
                                    <th>Tanggal Masuk</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cicilanAccounts.length === 0 ? (
                                    <tr><td colSpan="14" className="empty-state">Belum ada stok akun dengan cicilan.</td></tr>
                                ) : (
                                    cicilanAccounts.map((a, i) => {
                                        const totalAmount = a.targetPrice || a.sellPrice || a.buyPrice || 0;
                                        const paidAmount = a.installmentPaid || 0;
                                        const remainingAmount = totalAmount - paidAmount;
                                        return (
                                            <tr key={a.id}>
                                                <td>{i + 1}</td>
                                                <td>{a.spek}</td>
                                                <td>{a.rank}</td>
                                                <td>{formatRupiah(a.buyPrice)}</td>
                                                <td style={{ color: '#10B981', fontWeight: 'bold' }}>{formatRupiah(paidAmount)}</td>
                                                <td style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{formatRupiah(totalAmount)}</td>
                                                <td style={{ color: remainingAmount > 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{formatRupiah(remainingAmount)}</td>
                                                <td>{a.seller}</td>
                                                <td>{a.buyer || '-'}</td>
                                                <td>{a.email}</td>
                                                <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{a.keterangan}</span></td>
                                                <td><span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>📱 {a.device}</span></td>
                                                <td>{a.buyDate}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <button className="btn btn-primary btn-icon" onClick={() => openEdit(a)} title="Edit Akun"><Edit width="16" height="16" /></button>
                                                    <button className="btn btn-warning btn-icon" onClick={() => openPay(a)} title="Bayar Cicilan" style={{ marginLeft: '3px' }}>💵</button>
                                                    <button className="btn btn-success btn-icon" onClick={() => handleMarkAsPaid(a)} title="Tandai Lunas" style={{ marginLeft: '3px' }}>✅</button>
                                                    <button className="btn btn-danger btn-icon" onClick={() => { if(confirm('Hapus akun ini?')) onDeleteAccount(a.id); }} title="Hapus" style={{ marginLeft: '3px' }}><Trash2 width="16" height="16" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- MODAL EDIT ACCOUNTS --- */}
            {editingAccount && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><Edit width="16" height="16" /> Edit Data Akun {(game || '').toUpperCase()}</h3>
                            <button className="modal-close" onClick={() => setEditingAccount(null)}>×</button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Spesifikasi Akun</label>
                                <input 
                                    type="text" 
                                    value={editForm.spek} 
                                    onChange={(e) => setEditForm({ ...editForm, spek: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Rank / Level</label>
                                <input 
                                    type="text" 
                                    value={editForm.rank} 
                                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Harga Beli</label>
                                <input 
                                    type="text" 
                                    value={editForm.buyPrice} 
                                    onChange={(e) => setEditForm({ ...editForm, buyPrice: e.target.value })}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Harga Target Jual</label>
                                <input 
                                    type="text" 
                                    value={editForm.targetPrice} 
                                    onChange={(e) => setEditForm({ ...editForm, targetPrice: e.target.value })}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email / Akun Login</label>
                                <input 
                                    type="text" 
                                    value={editForm.email} 
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password Akun</label>
                                <input 
                                    type="text" 
                                    value={editForm.password} 
                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Tanggal Beli / Masuk</label>
                                <input 
                                    type="date" 
                                    value={editForm.buyDate} 
                                    onChange={(e) => setEditForm({ ...editForm, buyDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Penjual (Seller)</label>
                                <input 
                                    type="text" 
                                    value={editForm.seller} 
                                    onChange={(e) => setEditForm({ ...editForm, seller: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Device</label>
                                <input 
                                    type="text" 
                                    value={editForm.device} 
                                    onChange={(e) => setEditForm({ ...editForm, device: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Keterangan</label>
                                <input 
                                    type="text" 
                                    value={editForm.keterangan} 
                                    onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Catatan Tambahan</label>
                                <textarea 
                                    value={editForm.notes} 
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                    rows="2"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" onClick={() => setEditingAccount(null)}>Batal</button>
                                <button type="submit" className="btn btn-success">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL JUAL ACCOUNTS --- */}
            {sellingAccount && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>💰 Jual Akun {(game || '').toUpperCase()}</h3>
                            <button className="modal-close" onClick={() => setSellingAccount(null)}>×</button>
                        </div>
                        <form onSubmit={handleSellSubmit}>
                            <div className="form-group">
                                <label>Nama Pembeli</label>
                                <input 
                                    type="text" 
                                    value={sellForm.buyer} 
                                    onChange={(e) => setSellForm({ ...sellForm, buyer: e.target.value })}
                                    placeholder="Masukkan nama pembeli" 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Harga Jual (IDR)</label>
                                <input 
                                    type="text" 
                                    value={sellForm.sellPrice} 
                                    onChange={(e) => setSellForm({ ...sellForm, sellPrice: e.target.value })}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Tanggal Jual</label>
                                <input 
                                    type="date" 
                                    value={sellForm.sellDate} 
                                    onChange={(e) => setSellForm({ ...sellForm, sellDate: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" onClick={() => setSellingAccount(null)}>Batal</button>
                                <button type="submit" className="btn btn-success">Simpan Penjualan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL BAYAR CICILAN --- */}
            {payingAccount && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>💵 Bayar Cicilan Akun</h3>
                            <button className="modal-close" onClick={() => setPayingAccount(null)}>×</button>
                        </div>
                        <form onSubmit={handlePaySubmit}>
                            <div className="form-group">
                                <label>Jumlah Pembayaran (IDR)</label>
                                <input 
                                    type="text" 
                                    value={payForm.amount} 
                                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Tanggal Pembayaran</label>
                                <input 
                                    type="date" 
                                    value={payForm.date} 
                                    onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                                    required 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" onClick={() => setPayingAccount(null)}>Batal</button>
                                <button type="submit" className="btn btn-success">Simpan Pembayaran</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL PINDAH BULAN --- */}
            {movingAccount && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3><Calendar width="16" height="16" /> Pindahkan ke Bulan Lain</h3>
                            <button className="modal-close" onClick={() => setMovingAccount(null)}>×</button>
                        </div>
                        <form onSubmit={handleMoveSubmit}>
                            <div className="form-group">
                                <label>Bulan Baru</label>
                                <select 
                                    value={moveForm.month}
                                    onChange={(e) => setMoveForm({ ...moveForm, month: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Bulan --</option>
                                    <option value="2026-0">Januari 2026</option>
                                    <option value="2026-1">Februari 2026</option>
                                    <option value="2026-2">Maret 2026</option>
                                    <option value="2026-3">April 2026</option>
                                    <option value="2026-4">Mei 2026</option>
                                    <option value="2026-5">Juni 2026</option>
                                    <option value="2026-6">Juli 2026</option>
                                    <option value="2026-7">Agustus 2026</option>
                                    <option value="2026-8">September 2026</option>
                                    <option value="2026-9">Oktober 2026</option>
                                    <option value="2026-10">November 2026</option>
                                    <option value="2026-11">Desember 2026</option>
                                    <option value="2027-0">Januari 2027</option>
                                    <option value="2027-1">Februari 2027</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" onClick={() => setMovingAccount(null)}>Batal</button>
                                <button type="submit" className="btn btn-success">Pindahkan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL EDIT HARGA JUAL --- */}
            {editingSellPriceAccount && (
                <div className="modal show">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>💰 Edit Harga Jual Akun</h3>
                            <button className="modal-close" onClick={() => setEditingSellPriceAccount(null)}>×</button>
                        </div>
                        <form onSubmit={handleEditSellPriceSubmit}>
                            <div className="form-group">
                                <label>Harga Jual Baru (IDR)</label>
                                <input 
                                    type="text" 
                                    value={editSellPriceForm.sellPrice} 
                                    onChange={(e) => setEditSellPriceForm({ ...editSellPriceForm, sellPrice: e.target.value })}
                                    onInput={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        e.target.value = val ? 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(val)) : '';
                                    }}
                                    required 
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-warning" onClick={() => setEditingSellPriceAccount(null)}>Batal</button>
                                <button type="submit" className="btn btn-success">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
