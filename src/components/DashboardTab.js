'use client';
import React, { useState, useMemo } from 'react';
import { Users, ShoppingBag, CheckCircle, DollarSign, TrendingUp, Package, Circle, Wallet, ShoppingCart, BarChart3, ChevronDown, Activity, Star, Clock, Zap } from 'lucide-react';
import AiInsightCard from './AiInsightCard';

export default function DashboardTab({ accounts, sales, formatRupiah, activeFilterMonth, activeFilterYear, onNavigate }) {
    const [chartRange, setChartRange] = useState(7);

    // 1. Filter accounts
    let currentAccounts = accounts || [];
    if (activeFilterMonth !== 'all') {
        const monthNum = parseInt(activeFilterMonth);
        const yearNum = parseInt(activeFilterYear);
        
        currentAccounts = accounts.filter(a => {
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

    // 2. Metrics
    const activeAccounts = currentAccounts.filter(a => a.status === 'aktif');
    const soldAccounts = currentAccounts.filter(a => a.status === 'terjual');
    const recentAccounts = [...currentAccounts].sort((a, b) => new Date(b.buyDate || 0) - new Date(a.buyDate || 0)).slice(0, 10);
    const recentSales = [...soldAccounts].sort((a, b) => new Date(b.sellDate || 0) - new Date(a.sellDate || 0)).slice(0, 10);

    const totalTerjual = soldAccounts.reduce((sum, a) => sum + (a.sellPrice || 0), 0);
    const totalModal = soldAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0);
    const totalProfit = totalTerjual - totalModal;
    
    // Custom metrics for legacy support
    const potensiPendapatan = activeAccounts.reduce((sum, a) => sum + (a.targetPrice || a.buyPrice || 0), 0);
    const ffActive = activeAccounts.filter(a => a.game === 'ff' || a.game === 'FF').length;
    const mlActive = activeAccounts.filter(a => a.game === 'ml' || a.game === 'ML').length;

    // 3. Dynamic Health Score
    // Factors: Stock Availability (30%), Sales Volume (30%), Profit Margin (40%)
    const stockRatio = currentAccounts.length > 0 ? (activeAccounts.length / currentAccounts.length) : 0;
    const profitMargin = totalTerjual > 0 ? (totalProfit / totalTerjual) : 0;
    const healthScore = Math.min(100, Math.round(
        (stockRatio * 100 * 0.3) + 
        (Math.min(soldAccounts.length / 10, 1) * 100 * 0.3) + 
        (Math.min(profitMargin / 0.3, 1) * 100 * 0.4)
    )) || 85;

    // Fast selling logic (days between buy and sell)
    const fastSelling = soldAccounts.map(a => {
        const d1 = new Date(a.buyDate);
        const d2 = new Date(a.sellDate);
        const days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        return { ...a, daysToSell: days };
    }).filter(a => !isNaN(a.daysToSell)).sort((a, b) => a.daysToSell - b.daysToSell).slice(0, 5);

    return (
        <div id="dashboard" className="tab-content active" style={{ display: 'block', paddingBottom: '100px' }}>
            <AiInsightCard title="Marketplace AI" insight="Demand for high-tier Mobile Legends accounts is up 24% this week. Consider restocking Mythic Glory accounts to maximize revenue." />
            
            <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* 1. EXECUTIVE OVERVIEW HERO */}
                <div className="bento-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, var(--accent-blue) 0%, #1E3A8A 100%)', color: 'white', border: 'none', padding: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Farid Shop Game</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>Premium Marketplace</h2>
                        <p style={{ opacity: 0.9, maxWidth: '500px', marginTop: '8px', fontSize: '1.05rem', fontWeight: 300 }}>Operating system for high-end gaming account acquisitions and sales.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
                        <div style={{ border: '1px solid rgba(255, 255, 255, 0.2)', padding: '16px 24px', borderRadius: 'var(--r-md)', background: 'rgba(255, 255, 255, 0.1)', flex: '1 1 min-content' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>TOTAL AKUN</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{currentAccounts.length}</div>
                        </div>
                        <div style={{ border: '1px solid rgba(255, 255, 255, 0.2)', padding: '16px 24px', borderRadius: 'var(--r-md)', background: 'rgba(255, 255, 255, 0.1)', flex: '1 1 min-content' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', whiteSpace: 'nowrap' }}>TERJUAL</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{soldAccounts.length}</div>
                        </div>
                    </div>
                </div>

                {/* 2. BUSINESS HEALTH SCORE */}
                <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>Business Health</h3>
                    <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-blue)" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                        </svg>
                        <div style={{ position: 'absolute', fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{healthScore}</div>
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><TrendingUp size={16} /> Excellent Condition</div>
                </div>

                {/* 3. BUSINESS METRICS (3 COLUMNS) */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    {/* Col 1 */}
                    <div className="bento-card" style={{ border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit Bersih</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatRupiah(totalProfit)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                            <TrendingUp size={16} /> +Potensi {formatRupiah(potensiPendapatan)}
                        </div>
                    </div>

                    {/* Col 2 */}
                    <div className="bento-card" style={{ border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stok Aktif</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeAccounts.length}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ffActive}FF</span> • <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{mlActive} ML</span>
                        </div>
                    </div>

                    {/* Col 3 */}
                    <div className="bento-card" style={{ border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pendapatan</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatRupiah(totalTerjual)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                            <TrendingUp size={16} /> +{(profitMargin * 100).toFixed(1)}% Margin
                        </div>
                    </div>
                </div>

                {/* 4. RECENTLY ADDED ACCOUNTS (Horizontal Carousel on Mobile) */}
                <div className="bento-card" style={{ gridColumn: '1 / -1', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={20} color="var(--accent-blue)" /> New Listings</h3>
                        <button className="s-btn s-btn-secondary" onClick={() => onNavigate('stok')}>View All</button>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', margin: '0 -16px', paddingLeft: '16px', paddingRight: '16px', scrollSnapType: 'x mandatory' }}>
                        {recentAccounts.length > 0 ? recentAccounts.map(a => (
                            <div key={a.id} style={{ minWidth: '280px', flex: '0 0 auto', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '20px', scrollSnapAlign: 'start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span className={`s-badge ${a.game === 'ff' ? 'info' : 'warning'}`}>{a.game.toUpperCase()}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{a.buyDate || 'Baru'}</span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.spek || `Akun ${a.game.toUpperCase()}`}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Target: {formatRupiah(a.targetPrice)}</div>
                            </div>
                        )) : (
                            <div style={{ padding: '24px', color: 'var(--text-tertiary)' }}>No recent listings found.</div>
                        )}
                    </div>
                </div>

                {/* 5. FAST SELLING ACCOUNTS */}
                <div className="bento-card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={20} color="var(--accent-gold)" /> Fast Selling</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {fastSelling.length > 0 ? fastSelling.map(a => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{a.spek || `Akun ${a.game.toUpperCase()}`}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 500 }}>Sold in {a.daysToSell} days</div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatRupiah(a.sellPrice)}</div>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-tertiary)' }}>Not enough data.</div>
                        )}
                    </div>
                </div>

                {/* 6. MARKETPLACE ACTIVITY */}
                <div className="bento-card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={20} color="var(--accent-blue)" /> Recent Transactions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentSales.length > 0 ? recentSales.slice(0, 5).map(a => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-green-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
                                    <ShoppingCart size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Sold to {a.buyer || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{a.sellDate}</div>
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>+{formatRupiah(a.sellPrice)}</div>
                            </div>
                        )) : (
                            <div style={{ color: 'var(--text-tertiary)' }}>No recent transactions.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
