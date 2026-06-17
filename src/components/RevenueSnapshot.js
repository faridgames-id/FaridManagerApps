'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Clock, Target, Calendar, ArrowUpRight, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
export default function RevenueSnapshot({ sales = [], formatRupiah, activeFilterMonth, activeFilterYear }) {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const { monthlyRevenue, monthlyGrowth, avgTransaction, totalTransactions, bestDay, revenueToday } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthSales = sales.filter(s => {
            if (!s.tanggal) return false;
            const d = new Date(s.tanggal);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const lastMonthSales = sales.filter(s => {
            if (!s.tanggal) return false;
            const d = new Date(s.tanggal);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
        });

        const monthlyRevenue = thisMonthSales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);
        const lastMonthRevenue = lastMonthSales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);
        const monthlyGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
        const totalTransactions = thisMonthSales.length;
        const avgTransaction = totalTransactions > 0 ? monthlyRevenue / totalTransactions : 0;

        // Best day this month
        const dayMap = {};
        thisMonthSales.forEach(s => {
            if (!s.tanggal) return;
            const day = new Date(s.tanggal).toLocaleDateString('id-ID', { weekday: 'long', date: 'numeric' });
            dayMap[day] = (dayMap[day] || 0) + (Number(s.nominal) || 0);
        });
        const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0] || ['—', 0];

        // Today's revenue
        const todaySales = sales.filter(s => {
            if (!s.tanggal) return false;
            const today = new Date();
            const saleDate = new Date(s.tanggal);
            return saleDate.toDateString() === today.toDateString();
        });
        const revenueToday = todaySales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);

        return { monthlyRevenue, monthlyGrowth, avgTransaction, totalTransactions, bestDay, revenueToday };
    }, [sales]);

    const metrics = [
        {
            label: 'Revenue Bulan Ini',
            value: formatRupiah(monthlyRevenue),
            trend: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
            direction: monthlyGrowth >= 0 ? 'up' : 'down',
            icon: DollarSign,
            color: 'purple',
            subtitle: `Dari ${totalTransactions} transaksi`
        },
        {
            label: 'Rata-rata Transaksi',
            value: formatRupiah(avgTransaction),
            trend: `${totalTransactions} transaksi`,
            direction: 'up',
            icon: BarChart3,
            color: 'blue',
            subtitle: 'Bulan ini'
        },
        {
            label: 'Revenue Hari Ini',
            value: formatRupiah(revenueToday),
            trend: 'Hari ini',
            direction: 'up',
            icon: Wallet,
            color: 'green',
            subtitle: new Date().toLocaleDateString('id-ID', { weekday: 'long' })
        },
        {
            label: 'Hari Terbaik',
            value: formatRupiah(bestDay[1]),
            trend: bestDay[0] !== '—' ? bestDay[0].split(',')[0] : '—',
            direction: 'up',
            icon: Target,
            color: 'amber',
            subtitle: 'Bulan ini'
        }
    ];

    return (
        <div className="mb-8 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-clash">Revenue Snapshot</h2>
                        <p className="text-sm text-slate-500 font-sans">Ringkasan pendapatan dan performa finansial</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 font-sans">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            key={index} 
                            className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm text-slate-600">
                                    <Icon size={20} />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${metric.direction === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {metric.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    <span>{metric.trend}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-extrabold text-slate-900 mb-1 font-clash">{metric.value}</span>
                                <span className="text-sm font-semibold text-slate-700 mb-1 font-sans">{metric.label}</span>
                                <span className="text-xs text-slate-400 font-sans">{metric.subtitle}</span>
                            </div>
                            <div className="absolute bottom-4 right-4 text-slate-300 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-slate-400">
                                <ArrowUpRight size={16} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
