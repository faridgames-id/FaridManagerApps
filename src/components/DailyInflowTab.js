'use client';
import React, { useState } from 'react';
import { Calendar, DollarSign, FileText, CheckCircle, XCircle, CreditCard } from 'lucide-react';

export default function DailyInflowTab({ accounts, formatRupiah, globalFilterMonth, globalFilterYear }) {
    let year = new Date().getFullYear();
    let month = new Date().getMonth();

    if (globalFilterMonth && globalFilterMonth !== 'all') {
        month = parseInt(globalFilterMonth);
        if (globalFilterYear) year = parseInt(globalFilterYear);
    }
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayNamesLong = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const monthAccounts = accounts.filter(a => {
        if (a.buyDate) {
            const parts = a.buyDate.split('-');
            return parseInt(parts[0]) === year && (parseInt(parts[1]) - 1) === month;
        }
        return false;
    });

    const dailyAccounts = {};
    monthAccounts.forEach(account => {
        if (account.buyDate) {
            if (!dailyAccounts[account.buyDate]) dailyAccounts[account.buyDate] = [];
            dailyAccounts[account.buyDate].push(account);
        }
    });

    const ffAccounts = monthAccounts.filter(a => a.game === 'ff');
    const mlAccounts = monthAccounts.filter(a => a.game === 'ml');
    const totalModal = monthAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0);

    const renderCalendarGrid = () => {
        const cells = [];

        // Day headers — sama persis dengan CalendarTab
        dayNamesShort.forEach((day, index) => {
            cells.push(
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

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            cells.push(
                <div key={`empty-${i}`} style={{ background: 'var(--bg-hover)', padding: '10px', minHeight: '100px', border: '1px solid var(--border-subtle)' }} />
            );
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAccs = dailyAccounts[dateStr] || [];
            const dayCount = dayAccs.length;
            const dayFF = dayAccs.filter(a => a.game === 'ff').length;
            const dayML = dayAccs.filter(a => a.game === 'ml').length;
            const hasAccounts = dayCount > 0;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            let bgColor = 'var(--bg-elevated)';
            if (hasAccounts) bgColor = 'rgba(56, 189, 248, 0.1)';

            cells.push(
                <div
                    key={`day-${day}`}
                    style={{
                        background: bgColor,
                        padding: '10px',
                        minHeight: '100px',
                        border: isToday ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: hasAccounts ? 'pointer' : 'default',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { if (hasAccounts) e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = bgColor; }}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isToday ? 'var(--accent-blue)' : 'var(--text-primary)', textShadow: 'none' }}>
                        {day}
                    </div>
                    <div>
                        {dayCount > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 800 }}>
                                {dayCount} akun
                            </div>
                        )}
                        {dayFF > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                                FF: {dayFF}
                            </div>
                        )}
                        {dayML > 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                                ML: {dayML}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    const sortedAccounts = [...monthAccounts].sort((a, b) => new Date(a.buyDate) - new Date(b.buyDate));

    return (
        <div id="akun-masuk" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}><Calendar width={20} height={20} style={{ display: 'inline', marginRight: '8px' }} />Kalender Akun Masuk Harian</h2>


                {/* Summary Cards */}
                <div className="summary-cards" style={{ marginBottom: '25px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="card" style={{ flex: '1 1 200px', background: 'var(--bg-surface)', borderRadius: '15px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', borderLeft: '4px solid #6366F1' }}>
                        <div>
                            <h3 style={{ fontSize: '.75rem', marginBottom: '5px', opacity: .8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Akun Masuk</h3>
                            <div className="amount" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{monthAccounts.length}</div>
                        </div>
                        <Calendar size={24} color="#6366F1" />
                    </div>
                    <div className="card" style={{ flex: '1 1 200px', background: 'var(--bg-surface)', borderRadius: '15px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', borderLeft: '4px solid #F59E0B' }}>
                        <div>
                            <h3 style={{ fontSize: '.75rem', marginBottom: '5px', opacity: .8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-secondary)' }}>Akun FF</h3>
                            <div className="amount" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{ffAccounts.length}</div>
                        </div>
                        <div style={{ color: '#F59E0B', fontWeight: 'bold' }}>FF</div>
                    </div>
                    <div className="card" style={{ flex: '1 1 200px', background: 'var(--bg-surface)', borderRadius: '15px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', borderLeft: '4px solid #3B82F6' }}>
                        <div>
                            <h3 style={{ fontSize: '.75rem', marginBottom: '5px', opacity: .8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-secondary)' }}>Akun ML</h3>
                            <div className="amount" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{mlAccounts.length}</div>
                        </div>
                        <div style={{ color: '#3B82F6', fontWeight: 'bold' }}>ML</div>
                    </div>
                    <div className="card" style={{ flex: '1 1 200px', background: 'var(--bg-surface)', borderRadius: '15px', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', borderLeft: '4px solid #10B981' }}>
                        <div>
                            <h3 style={{ fontSize: '.75rem', marginBottom: '5px', opacity: .8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: 'var(--text-secondary)' }}>Pengeluaran Modal</h3>
                            <div className="amount" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatRupiah(totalModal)}</div>
                        </div>
                        <DollarSign size={24} color="#10B981" />
                    </div>
                </div>

                {/* Calendar Grid — sama persis layout CalendarTab */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '25px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-subtle)' }}>
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Detail Table — sama persis dengan CalendarTab */}
                <div className="form-section">
                    <h2>📋 Daftar Rincian Akun Masuk</h2>
                    <div className="table-responsive">
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal Masuk</th>
                                    <th>Hari</th>
                                    <th>Game</th>
                                    <th>Spesifikasi</th>
                                    <th>Rank / Level</th>
                                    <th>Harga Beli</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-tertiary)' }}>
                                            Tidak ada akun masuk di {monthNames[month]} {year}
                                        </td>
                                    </tr>
                                ) : (
                                    sortedAccounts.map((a, i) => {
                                        const buyDate = new Date(a.buyDate + 'T00:00:00');
                                        const dayName = dayNamesLong[buyDate.getDay()];
                                        const isAktif = a.status === 'aktif';
                                        const isTerjual = a.status === 'terjual';
                                        const isCicilan = a.status === 'cicilan';

                                        return (
                                            <tr key={a.id}>
                                                <td>{i + 1}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{a.buyDate}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{dayName}</td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: a.game === 'ff' ? 'var(--accent-gold-subtle)' : 'var(--accent-blue-subtle)',
                                                            color: a.game === 'ff' ? 'var(--accent-gold)' : 'var(--accent-blue)',
                                                            border: 'none',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {a.game === 'ff' ? '🔶 FF' : '🔵 ML'}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {a.spek || '-'}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{a.rank || '-'}</td>
                                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>{formatRupiah(a.buyPrice || 0)}</td>
                                                <td>
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            background: isAktif ? '#10B981' : isTerjual ? '#EF4444' : '#F59E0B',
                                                            color: 'var(--text-primary)',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {isAktif ? '✅ Ready' : isTerjual ? '❌ Terjual' : '💳 Cicilan'}
                                                    </span>
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
