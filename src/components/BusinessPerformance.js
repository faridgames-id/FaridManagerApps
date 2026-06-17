'use client';
import React, { useMemo } from 'react';
import { TrendingUp, ShoppingBag, Package, DollarSign, Users, Clock, Zap, Star, ArrowUpRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
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
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <BarChart3 size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-clash">Business Performance</h2>
                    <p className="text-sm text-slate-500 font-sans">Metrik utama performa bisnis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            key={index} 
                            className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600`}>
                                    <Icon size={20} />
                                </div>
                                <ArrowUpRight size={16} className="text-slate-400" />
                            </div>
                            <div className="flex flex-col mt-auto">
                                <span className="text-2xl font-extrabold text-slate-900 mb-1 font-clash">{item.value}</span>
                                <span className="text-sm font-semibold text-slate-700 mb-2 font-sans">{item.label}</span>
                                <span className="text-xs text-slate-500 font-sans">{item.trend}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Game Breakdown */}
            {metrics.gameBreakdown.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6 font-clash">Game Distribution</h3>
                    <div className="flex flex-col gap-5">
                        {metrics.gameBreakdown.map(([game, data], i) => {
                            const pct = accounts.length > 0 ? (data.total / accounts.length) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-slate-800 font-sans">{game}</span>
                                        <span className="text-xs font-semibold text-slate-500">{data.total} akun</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{data.sold} terjual</span>
                                        <span className="font-semibold text-slate-700">{formatRupiah(data.revenue)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
