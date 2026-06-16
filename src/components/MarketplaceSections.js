'use client';
import React, { useState, useMemo } from 'react';
import { Store, Users, Package, DollarSign, TrendingUp, Star, Plus, Filter, Search, ShoppingBag, Zap, Clock, Flame, ArrowUpRight, Eye, CheckCircle, AlertCircle } from 'lucide-react';

export default function MarketplaceSections({ accounts = [], sales = [], formatRupiah, onNavigate }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Compute marketplace data
    const marketplaceData = useMemo(() => {
        const sold = accounts.filter(a => a.status === 'terjual');
        const available = accounts.filter(a => a.status !== 'terjual');
        const recentSales = [...sold].sort((a, b) => {
            if (!a.sellDate || !b.sellDate) return 0;
            return new Date(b.sellDate) - new Date(a.sellDate);
        }).slice(0, 8);

        // Fast selling: sold within 3 days
        const fastSelling = sold.filter(a => {
            if (!a.tanggal || !a.sellDate) return false;
            const days = Math.ceil((new Date(a.sellDate) - new Date(a.tanggal)) / (1000 * 60 * 60 * 24));
            return days <= 3;
        });

        // High demand categories
        const categoryMap = {};
        accounts.forEach(a => {
            const cat = a.kategori || a.game || 'General';
            if (!categoryMap[cat]) categoryMap[cat] = { total: 0, sold: 0, views: 0 };
            categoryMap[cat].total++;
            if (a.status === 'terjual') categoryMap[cat].sold++;
        });
        const highDemand = Object.entries(categoryMap)
            .map(([name, data]) => ({ name, ...data, sellRate: data.total > 0 ? (data.sold / data.total) * 100 : 0 }))
            .sort((a, b) => b.sellRate - a.sellRate);

        // Activity feed
        const activityFeed = [
            ...sold.map(s => ({
                type: 'sale',
                time: s.tanggal || new Date().toISOString(),
                account: s.nama_akun || 'Unknown',
                amount: Number(s.nominal) || 0,
                buyer: s.pembeli || 'Anonymous'
            })),
            ...accounts.filter(a => a.tanggal).map(a => ({
                type: 'listing',
                time: a.tanggal,
                account: a.nama || a.nama_akun || 'Unknown',
                game: a.game || 'Unknown'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

        // Demand signals
        const demandSignals = highDemand.slice(0, 5).map(c => ({
            category: c.name,
            demand: c.sellRate,
            signal: c.sellRate > 70 ? 'High' : c.sellRate > 40 ? 'Medium' : 'Low'
        }));

        return { sold, available, recentSales, fastSelling, highDemand, activityFeed, demandSignals };
    }, [accounts, sales]);

    const sections = [
        { id: 'overview', label: 'Marketplace', icon: Store },
        { id: 'recently-sold', label: 'Recently Sold', icon: ShoppingBag },
        { id: 'fast-selling', label: 'Fast Selling', icon: Zap },
        { id: 'high-demand', label: 'High Demand', icon: Flame },
        { id: 'activity', label: 'Activity', icon: Clock },
    ];

    const renderOverview = () => (
        <div className="marketplace-overview">
            {/* Recently Sold Preview */}
            <div className="marketplace-preview-section">
                <div className="preview-header">
                    <div className="preview-header-left">
                        <ShoppingBag size={16} />
                        <h3>Recently Sold</h3>
                    </div>
                    <button className="preview-view-all" onClick={() => setActiveSection('recently-sold')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="preview-grid">
                    {marketplaceData.recentSales.slice(0, 4).map((acc, i) => (
                        <div key={i} className="marketplace-card sold">
                            <div className="card-badge sold-badge">Terjual</div>
                            <div className="card-game-icon">{acc.game || '🎮'}</div>
                            <div className="card-info">
                                <span className="card-name">{acc.nama || acc.nama_akun || 'Akun'}</span>
                                <span className="card-price">{formatRupiah(acc.harga || 0)}</span>
                                <span className="card-date">{acc.sellDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fast Selling Preview */}
            <div className="marketplace-preview-section">
                <div className="preview-header">
                    <div className="preview-header-left">
                        <Zap size={16} />
                        <h3>Fast Selling</h3>
                    </div>
                    <button className="preview-view-all" onClick={() => setActiveSection('fast-selling')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="preview-grid">
                    {marketplaceData.fastSelling.slice(0, 4).map((acc, i) => (
                        <div key={i} className="marketplace-card fast">
                            <div className="card-badge fast-badge">
                                <Zap size={10} /> Fast
                            </div>
                            <div className="card-game-icon">{acc.game || '🎮'}</div>
                            <div className="card-info">
                                <span className="card-name">{acc.nama || acc.nama_akun || 'Akun'}</span>
                                <span className="card-price">{formatRupiah(acc.harga || 0)}</span>
                                <span className="card-date">{acc.sellDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* High Demand Categories */}
            <div className="marketplace-preview-section">
                <div className="preview-header">
                    <div className="preview-header-left">
                        <Flame size={16} />
                        <h3>High Demand Categories</h3>
                    </div>
                    <button className="preview-view-all" onClick={() => setActiveSection('high-demand')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="demand-preview">
                    {marketplaceData.demandSignals.slice(0, 3).map((d, i) => (
                        <div key={i} className={`demand-chip ${d.signal.toLowerCase()}`}>
                            <span className="demand-category">{d.category}</span>
                            <span className={`demand-level ${d.signal.toLowerCase()}`}>{d.signal}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRecentlySold = () => (
        <div className="marketplace-list-view">
            <div className="list-header">
                <h3>Recently Sold</h3>
                <span className="list-count">{marketplaceData.recentSales.length} items</span>
            </div>
            <div className="list-grid">
                {marketplaceData.recentSales.map((acc, i) => (
                    <div key={i} className="marketplace-card sold list-card">
                        <div className="card-badge sold-badge">Terjual</div>
                        <div className="card-game-icon">{acc.game || '🎮'}</div>
                        <div className="card-info">
                            <span className="card-name">{acc.nama || acc.nama_akun || 'Akun'}</span>
                            <span className="card-price">{formatRupiah(acc.harga || 0)}</span>
                            <span className="card-date">{acc.sellDate}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFastSelling = () => (
        <div className="marketplace-list-view">
            <div className="list-header">
                <h3>Fast Selling Products</h3>
                <span className="list-count">{marketplaceData.fastSelling.length} items</span>
            </div>
            <div className="list-grid">
                {marketplaceData.fastSelling.map((acc, i) => (
                    <div key={i} className="marketplace-card fast list-card">
                        <div className="card-badge fast-badge">
                            <Zap size={10} /> Fast
                        </div>
                        <div className="card-game-icon">{acc.game || '🎮'}</div>
                        <div className="card-info">
                            <span className="card-name">{acc.nama || acc.nama_akun || 'Akun'}</span>
                            <span className="card-price">{formatRupiah(acc.harga || 0)}</span>
                            <span className="card-date">{acc.sellDate}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHighDemand = () => (
        <div className="marketplace-list-view">
            <div className="list-header">
                <h3>High Demand Categories</h3>
                <span className="list-count">{marketplaceData.highDemand.length} categories</span>
            </div>
            <div className="demand-list">
                {marketplaceData.highDemand.map((cat, i) => (
                    <div key={i} className="demand-item">
                        <div className="demand-item-header">
                            <span className="demand-item-name">{cat.name}</span>
                            <span className="demand-item-count">{cat.total} akun</span>
                        </div>
                        <div className="demand-bar-track">
                            <div className="demand-bar-fill" style={{ width: `${cat.sellRate}%` }} />
                        </div>
                        <div className="demand-item-footer">
                            <span>{cat.sold} terjual ({cat.sellRate.toFixed(0)}%)</span>
                            <span className={`demand-tag ${cat.sellRate > 70 ? 'high' : cat.sellRate > 40 ? 'medium' : 'low'}`}>
                                {cat.sellRate > 70 ? '🔥 High Demand' : cat.sellRate > 40 ? '📈 Growing' : '💤 Low'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActivity = () => (
        <div className="marketplace-list-view">
            <div className="list-header">
                <h3>Marketplace Activity Feed</h3>
                <span className="list-count">Live</span>
            </div>
            <div className="activity-feed">
                {marketplaceData.activityFeed.map((item, i) => (
                    <div key={i} className={`activity-item ${item.type}`}>
                        <div className="activity-dot">
                            {item.type === 'sale' ? <CheckCircle size={12} /> : <Plus size={12} />}
                        </div>
                        <div className="activity-content">
                            {item.type === 'sale' ? (
                                <>
                                    <span className="activity-text">
                                        <strong>{item.account}</strong> terjual ke <strong>{item.buyer}</strong>
                                    </span>
                                    <span className="activity-amount">{formatRupiah(item.amount)}</span>
                                </>
                            ) : (
                                <>
                                    <span className="activity-text">
                                        <strong>{item.account}</strong> di-listing ({item.game})
                                    </span>
                                </>
                            )}
                            <span className="activity-time">
                                {new Date(item.time).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="marketplace-sections">
            <div className="section-header">
                <div className="section-header-left">
                    <div className="section-icon">
                        <Store size={18} />
                    </div>
                    <div>
                        <h2 className="section-title">Marketplace</h2>
                        <p className="section-subtitle">Jelajahi aktivitas dan tren marketplace</p>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="marketplace-tabs">
                {sections.map(s => {
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.id}
                            className={`marketplace-tab ${activeSection === s.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <Icon size={14} />
                            <span>{s.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="marketplace-content">
                {activeSection === 'overview' && renderOverview()}
                {activeSection === 'recently-sold' && renderRecentlySold()}
                {activeSection === 'fast-selling' && renderFastSelling()}
                {activeSection === 'high-demand' && renderHighDemand()}
                {activeSection === 'activity' && renderActivity()}
            </div>
        </div>
    );
}
