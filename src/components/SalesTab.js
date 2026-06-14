'use client';
import React from 'react';
import { DollarSign, CreditCard, Trash2 } from 'lucide-react';

export default function SalesTab({
    sales = [],
    onDeleteSale,
    formatRupiah
}) {
    const sortedSales = [...sales].sort((a, b) => new Date(b.saleDate || b.dateIn) - new Date(a.saleDate || a.dateIn));

    return (
        <div id="penjualan" className="tab-content active" style={{ display: 'block' }}>
            <div className="content">
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <h2 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <DollarSign style={{ color: 'var(--accent-green)' }} className="icon-inline" />
                        Riwayat Penjualan
                    </h2>
                    <div className="table-meta" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {sortedSales.length} transaksi
                    </div>
                </div>
                <div className="table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal Jual</th>
                                <th>Game</th>
                                <th>ID/Spesifikasi</th>
                                <th>Harga Jual</th>
                                <th>Pembeli</th>
                                <th>Pembayaran</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSales.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="empty-state">
                                            <p>Belum ada riwayat penjualan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedSales.map((s, index) => (
                                    <tr key={s.id}>
                                        <td>{index + 1}</td>
                                        <td>{s.saleDate || s.dateIn || '-'}</td>
                                        <td>
                                            <span className={`badge badge-${s.game}`}>
                                                {s.game === 'ff' ? 'FF' : 'ML'}
                                            </span>
                                        </td>
                                        <td>{s.accountIdDisplay || s.spek || s.accountId}</td>
                                        <td>{formatRupiah(s.price || s.sellPrice || 0)}</td>
                                        <td>{s.buyerName || s.buyer || '-'}</td>
                                        <td>
                                            <span className={`badge ${s.paymentType === 'cicilan' ? 'badge-cicilan' : 'badge-aktif'}`}>
                                                {s.paymentType === 'cicilan' ? <><CreditCard className="icon-inline" /> Cicilan</> : 'Cash'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-icon"
                                                onClick={() => onDeleteSale(s.id)}
                                                title="Hapus"
                                            >
                                                <Trash2 className="icon-inline" />
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
    );
}
