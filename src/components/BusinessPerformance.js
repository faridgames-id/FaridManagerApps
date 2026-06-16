'use client';
import React, { useMemo } from 'react';
import { TrendingUp, ShoppingBag, Package, DollarSign, Users, Clock, Zap, Star, ArrowUpRight } from 'lucide-react';

export default function BusinessPerformance({ accounts = [], sales = [], formatRupiah }) {
    const metrics = useMemo(() => {
        const totalAccounts = accounts.length;
        const soldAccounts = accounts.filter(a => a.status === 'terjual').length;
        const availableAccounts = totalAccounts - soldAccounts;
        const sellRate = totalAccounts > 0 ? (soldAccounts / totalAccounts) * 100 : 0;
        const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);

        // Average days to sell
        const sellDays = accounts
            .filter(a => a.status === 'terjual' && a.tanggal && a.sellDate)
            .map(a => {
                const created = new Date(a.tanggal);
                const sold = new Date(a.sellDate);
                return Math.max(1, Math.ceil((sold - created) / (1000 * 60 * 60 * 24)));
            });
        const avgDaysToSell = sellDays.length > 0
            ? (sellDays.reduce((sum, d) => sum + d, 0) / sellDays.length).toFixed(1)
            : '—';

        // Games breakdown
        const gameBreakdown = {};
        accounts.forEach(a => {
            const game = a.game || 'Unknown';
            if (!gameBreakdown[game]) gameBreakdown[game] = { total: 0, sold: 0, revenue: 0 };
            gameBreakdown[game].total++;
            if (a.status === 'terjual') {
                gameBreakdown[game].sold++;
                const sale = sales.find(s => s.id_akun === a.id || s.nama_akun === a.nama);
                if (sale) gameBreakdown[game].revenue += Number(sale.nominal) || 0;
            }
        });

        return {
            sellRate,
            avgDaysToSell,
            totalRevenue,
            availableAccounts,
            soldAccounts,
            gameBreakdown: Object.entries(gameBreakdown).sort((a, b) => b[1].total - a[1].total)
        };
    }, [accounts, sales]);

    const items = [
        {
            label: 'Sell Rate',
            value: `${metrics.sellRate.toFixed(1)}%`,
            trend: `${metrics.soldAccounts} dari ${accounts.length} akun`,
            icon: TrendingUp,
            color: 'purple'
        },
        {
            label: 'Rata-rata Waktu Jual',
            value: metrics.avgDaysToSell !== '—' ? `${metrics.avgDaysToSell} hari` : '—',
            trend: 'Dari listing ke terjual',
            icon: Clock,
            color: 'blue'
        },
        {
            label: 'Akun Tersedia',
            value: metrics.availableAccounts.toString(),
            trend: `${metrics.soldAccounts} sudah terjual`,
            icon: Package,
            color: 'green'
        },
        {
            label: 'Total Revenue',
            value: formatRupiah(metrics.totalRevenue),
            trend: 'Sepanjang waktu',
            icon: DollarSign,
            color: 'amber'
        }
    ];

    return (
        <div className="business-performance">
            <div className="section-header">
                <div className="section-header-left">
                    <div className="section-icon">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h2 className="section-title">Business Performance</h2>
                        <p className="section-subtitle">Metrik utama performa bisnis</p>
                    </div>
                </div>
            </div>

            <div className="performance-grid">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className={`performance-card ${item.color}`}>
                            <div className="performance-card-header">
                                <div className={`performance-icon ${item.color}`}>
                                    <Icon size={18} />
                                </div>
                                <ArrowUpRight size={14} className="performance-arrow" />
                            </div>
                            <div className="performance-card-body">
                                <span className="performance-value">{item.value}</span>
                                <span className="performance-label">{item.label}</span>
                                <span className="performance-trend">{item.trend}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Game Breakdown */}
            {metrics.gameBreakdown.length > 0 && (
                <div className="game-breakdown">
                    <h3 className="breakdown-title">Game Distribution</h3>
                    <div className="breakdown-list">
                        {metrics.gameBreakdown.map(([game, data], i) => {
                            const pct = accounts.length > 0 ? (data.total / accounts.length) * 100 : 0;
                            return (
                                <div key={i} className="breakdown-item">
                                    <div className="breakdown-item-header">
                                        <span className="breakdown-game">{game}</span>
                                        <span className="breakdown-count">{data.total} akun</span>
                                    </div>
                                    <div className="breakdown-bar-track">
                                        <div className="breakdown-bar-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="breakdown-item-footer">
                                        <span>{data.sold} terjual</span>
                                        <span>{formatRupiah(data.revenue)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

import { BarChart3 } from 'lucide-react';
