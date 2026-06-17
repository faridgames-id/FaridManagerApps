'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Users, ShoppingBag, Zap, Clock, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';

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
        <div className="marketplace-hero">
            {/* Background Gradient Effects */}
            <div className="hero-bg-glow top-right" />
            <div className="hero-bg-glow bottom-left" />

            {/* Top Bar */}
            <div className="hero-top-bar">
                <div className="hero-status">
                    <div className="status-dot live" />
                    <span className="status-text">Marketplace Live</span>
                    <span className="status-separator">•</span>
                    <span className="status-time">{formatTime(currentTime)}</span>
                </div>
                <div className="hero-date">{formatDate(currentTime)}</div>
            </div>

            {/* Main Content */}
            <div className="hero-main">
                {/* Left: Hero Content */}
                <div className="hero-content-left">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>Premium Gaming Marketplace</span>
                    </div>
                    <h1 className="hero-title">
                        Farid Shop
                        <span className="hero-title-accent"> Game</span>
                    </h1>
                    <p className="hero-subtitle">
                        Platform premium untuk jual beli akun game.
                        Transaksi aman, harga terbaik, proses cepat.
                    </p>
                    <div className="hero-cta-row">
                        <button className="hero-btn-primary" onClick={() => {}}>
                            <ShoppingBag size={18} />
                            Jelajahi Marketplace
                            <ArrowUpRight size={16} />
                        </button>
                        <button className="hero-btn-secondary" onClick={() => {}}>
                            <Activity size={18} />
                            Lihat Aktivitas
                        </button>
                    </div>
                </div>

                {/* Right: Featured Listings Carousel */}
                <div className="hero-content-right">
                    <div className="hero-carousel">
                        <div className="carousel-header">
                            <Zap size={16} className="carousel-icon" />
                            <span>Featured Listings</span>
                        </div>
                        <div className="carousel-track">
                            {featuredListings.length > 0 && (
                                <div className="carousel-card" key={activeIndex}>
                                    <div className="carousel-card-top">
                                        <span className="carousel-game-badge">{featuredListings[activeIndex].game}</span>
                                        {featuredListings[activeIndex].discount > 0 && (
                                            <span className="carousel-discount-badge">-{featuredListings[activeIndex].discount}%</span>
                                        )}
                                    </div>
                                    <h3 className="carousel-card-title">{featuredListings[activeIndex].name}</h3>
                                    <div className="carousel-card-meta">
                                        <span>Level {featuredListings[activeIndex].level}</span>
                                        <span>•</span>
                                        <span>{featuredListings[activeIndex].skin} Skins</span>
                                    </div>
                                    <div className="carousel-card-price">
                                        {featuredListings[activeIndex].originalPrice > 0 && (
                                            <span className="carousel-original-price">{formatRupiah(featuredListings[activeIndex].originalPrice)}</span>
                                        )}
                                        <span className="carousel-current-price">{formatRupiah(featuredListings[activeIndex].price)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="carousel-dots">
                            {featuredListings.map((_, i) => (
                                <button
                                    key={i}
                                    className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                                    onClick={() => setActiveIndex(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="hero-quick-stats">
                        {isLive && (
                            <div className="stats-live-indicator">
                                <span className="live-pulse"></span>
                                <span>LIVE</span>
                            </div>
                        )}
                        <div className="quick-stat">
                            <div className="quick-stat-icon">
                                <ShoppingBag size={16} />
                            </div>
                            <div className="quick-stat-info">
                                <span className="quick-stat-value">{stats.availableAccounts}</span>
                                <span className="quick-stat-label">Tersedia</span>
                            </div>
                        </div>
                        <div className="quick-stat">
                            <div className="quick-stat-icon sold">
                                <TrendingUp size={16} />
                            </div>
                            <div className="quick-stat-info">
                                <span className="quick-stat-value">{stats.soldAccounts}</span>
                                <span className="quick-stat-label">Terjual</span>
                            </div>
                        </div>
                        <div className="quick-stat">
                            <div className="quick-stat-icon revenue">
                                <Users size={16} />
                            </div>
                            <div className="quick-stat-info">
                                <span className="quick-stat-value">{stats.todayCount}</span>
                                <span className="quick-stat-label">Hari Ini</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Ticker */}
            {recentActivity.length > 0 && (
                <div className="hero-activity-ticker">
                    <div className="ticker-icon">
                        <Activity size={14} />
                    </div>
                    <div className="ticker-content">
                        {recentActivity.map((act, i) => (
                            <span key={i} className="ticker-item">
                                <strong>{act.game}</strong> — {act.account} terjual {formatRupiah(act.price)}
                                <span className="ticker-time">{act.time}</span>
                                {i < recentActivity.length - 1 && <span className="ticker-sep">•</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
