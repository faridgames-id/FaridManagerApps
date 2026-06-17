'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, ShoppingBag, Zap, Clock, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';

export default function MarketplaceHero({ accounts = [], sales = [], formatRupiah }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeIndex, setActiveIndex] = useState(0);
    const [liveStats, setLiveStats] = useState(null);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Real-time statistics subscription
    useEffect(() => {
        const channel = supabase
            .channel('marketplace-stats')
            .on('broadcast', { event: 'stats_update' }, (payload) => {
                if (payload.payload.stats) {
                    setLiveStats(payload.payload.stats);
                    setIsLive(true);
                    setTimeout(() => setIsLive(false), 2000);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Simulate live updates for demo
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of update
                setIsLive(true);
                setTimeout(() => setIsLive(false), 1500);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Auto-rotate featured listings
    useEffect(() => {
        if (featuredListings.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % featuredListings.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [accounts, sales]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const stats = useMemo(() => {
        const totalAccounts = accounts.length;
        const soldAccounts = accounts.filter(a => a.status === 'terjual').length;
        const availableAccounts = totalAccounts - soldAccounts;
        const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);
        const todaySales = sales.filter(s => {
            if (!s.tanggal) return false;
            const today = new Date();
            const saleDate = new Date(s.tanggal);
            return saleDate.toDateString() === today.toDateString();
        });
        const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.nominal) || 0), 0);
        return { totalAccounts, soldAccounts, availableAccounts, totalRevenue, todayRevenue, todayCount: todaySales.length };
    }, [accounts, sales]);

    const featuredListings = useMemo(() => {
        return accounts
            .filter(a => a.status !== 'terjual')
            .slice(0, 5)
            .map(a => ({
                game: a.game || 'Game',
                name: a.nama || a.nama_akun || 'Premium Account',
                price: Number(a.harga) || 0,
                originalPrice: Number(a.harga_asli) || 0,
                discount: Number(a.diskon) || 0,
                level: a.level || '—',
                skin: a.skin_count || a.jml_skin || '—',
            }));
    }, [accounts]);

    const recentActivity = useMemo(() => {
        return sales
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
            .slice(0, 4)
            .map(s => ({
                game: s.game || 'Game',
                account: s.nama_akun || s.nama || 'Account',
                price: Number(s.nominal) || 0,
                time: s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—',
            }));
    }, [sales]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden mb-8"
        >
            {/* Background Accents */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] -top-24 -right-12 pointer-events-none" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px] -bottom-24 -left-24 pointer-events-none" />

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6 relative z-10 pb-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Marketplace Live</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{formatTime(currentTime)}</span>
                </div>
                <div className="text-sm text-slate-500 font-medium">{formatDate(currentTime)}</div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                {/* Left: Hero Content */}
                <div className="flex flex-col justify-center">
                    <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 w-fit">
                        <Sparkles size={14} />
                        <span>Premium Gaming Marketplace</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight font-clash">
                        Farid Shop
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> Game</span>
                    </h1>
                    <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-md font-sans">
                        Platform premium untuk jual beli akun game.
                        Transaksi aman, harga terbaik, proses cepat.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md shadow-slate-900/20" onClick={() => {}}>
                            <ShoppingBag size={18} />
                            Jelajahi Marketplace
                            <ArrowUpRight size={16} />
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-xl font-semibold transition-all" onClick={() => {}}>
                            <Activity size={18} />
                            Lihat Aktivitas
                        </button>
                    </div>
                </div>

                {/* Right: Featured Listings Carousel */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 relative">
                        <div className="flex items-center gap-2 font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">
                            <Zap size={16} className="text-amber-500" />
                            <span>Featured Listings</span>
                        </div>
                        <div className="relative min-h-[140px]">
                            {featuredListings.length > 0 && (
                                <motion.div 
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
                                >
                                    <div className="flex justify-between mb-3">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase">{featuredListings[activeIndex].game}</span>
                                        {featuredListings[activeIndex].discount > 0 && (
                                            <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-md text-xs font-bold">-{featuredListings[activeIndex].discount}%</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-clash">{featuredListings[activeIndex].name}</h3>
                                    <div className="flex gap-2 text-xs text-slate-500 mb-4">
                                        <span>Level {featuredListings[activeIndex].level}</span>
                                        <span>•</span>
                                        <span>{featuredListings[activeIndex].skin} Skins</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {featuredListings[activeIndex].originalPrice > 0 && (
                                            <span className="text-sm text-slate-400 line-through">{formatRupiah(featuredListings[activeIndex].originalPrice)}</span>
                                        )}
                                        <span className="text-xl font-extrabold text-emerald-500 font-clash">{formatRupiah(featuredListings[activeIndex].price)}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex gap-1.5 justify-center mt-4">
                            {featuredListings.map((_, i) => (
                                <button
                                    key={i}
                                    className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'}`}
                                    onClick={() => setActiveIndex(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 relative">
                        {isLive && (
                            <div className="absolute -top-3 right-0 flex items-center gap-1.5 bg-red-50 text-red-500 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider z-10">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span>LIVE</span>
                            </div>
                        )}
                        <motion.div whileHover={{ y: -2 }} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 shrink-0">
                                <ShoppingBag size={18} />
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-xl font-bold text-slate-900 font-clash">{stats.availableAccounts}</span>
                                <span className="text-xs text-slate-500 font-medium">Tersedia</span>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 shrink-0">
                                <TrendingUp size={18} />
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-xl font-bold text-slate-900 font-clash">{stats.soldAccounts}</span>
                                <span className="text-xs text-slate-500 font-medium">Terjual</span>
                            </div>
                        </motion.div>
                        <motion.div whileHover={{ y: -2 }} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-fuchsia-50 text-fuchsia-500 shrink-0">
                                <Users size={18} />
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-xl font-bold text-slate-900 font-clash">{stats.todayCount}</span>
                                <span className="text-xs text-slate-500 font-medium">Hari Ini</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Activity Ticker */}
            {recentActivity.length > 0 && (
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-200/60 relative z-10 overflow-hidden">
                    <div className="text-violet-500 animate-[spin_4s_linear_infinite] shrink-0">
                        <Activity size={14} />
                    </div>
                    <div className="flex gap-4 whitespace-nowrap overflow-hidden animate-[marquee_20s_linear_infinite] text-sm text-slate-600">
                        {recentActivity.map((act, i) => (
                            <span key={i} className="flex items-center">
                                <strong className="text-slate-900 mr-1">{act.game}</strong> — {act.account} terjual {formatRupiah(act.price)}
                                <span className="text-xs text-slate-400 ml-2">{act.time}</span>
                                {i < recentActivity.length - 1 && <span className="text-slate-300 ml-3">•</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
