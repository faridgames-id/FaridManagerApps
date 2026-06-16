'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Clock, Target, Calendar, ArrowUpRight, Wallet } from 'lucide-react';

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
        <div className={`revenue-snapshot ${animateIn ? 'animate-in' : ''}`}>
            <div className="section-header">
                <div className="section-header-left">
                    <div className="section-icon">
                        <DollarSign size={18} />
                    </div>
                    <div>
                        <h2 className="section-title">Revenue Snapshot</h2>
                        <p className="section-subtitle">Ringkasan pendapatan dan performa finansial</p>
                    </div>
                </div>
                <div className="section-header-right">
                    <div className="section-period">
                        <Calendar size={14} />
                        <span>{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            <div className="revenue-grid">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className={`revenue-card ${metric.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="revenue-card-header">
                                <div className={`revenue-card-icon ${metric.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className={`revenue-trend ${metric.direction}`}>
                                    {metric.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    <span>{metric.trend}</span>
                                </div>
                            </div>
                            <div className="revenue-card-body">
                                <span className="revenue-card-value">{metric.value}</span>
                                <span className="revenue-card-label">{metric.label}</span>
                                <span className="revenue-card-subtitle">{metric.subtitle}</span>
                            </div>
                            <div className="revenue-card-footer">
                                <ArrowUpRight size={14} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
