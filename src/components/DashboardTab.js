'use client';
import React, { useState, useMemo } from 'react';
import { Users, ShoppingBag, CheckCircle, DollarSign, TrendingUp, Package, Circle, Wallet, ShoppingCart, BarChart3 } from 'lucide-react';

const KpiIcons = {
    users: <Users size={24} />,
    shoppingBag: <ShoppingBag size={24} />,
    checkCircle: <CheckCircle size={24} />,
    dollarSign: <DollarSign size={24} />,
    trendingUp: <TrendingUp size={14} />,
    ff: <Package size={16} />,
    ml: <Circle size={16} />,
    wallet: <Wallet size={24} />,
    cart: <ShoppingCart size={24} />,
    chartBar: <BarChart3 size={24} />,
    moneyBag: <DollarSign size={24} />
};

export default function DashboardTab({ accounts, sales, formatRupiah, activeFilterMonth, activeFilterYear, onNavigate }) {
    const [chartRange, setChartRange] = useState(7);

    // 1. Filter accounts based on global filter
    let currentAccounts = accounts;
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

    // 2. Count calculations
    const ffAccounts = currentAccounts.filter(a => a.game === 'ff');
    const mlAccounts = currentAccounts.filter(a => a.game === 'ml');
    const activeAccounts = currentAccounts.filter(a => a.status === 'aktif');
    const soldAccounts = currentAccounts.filter(a => a.status === 'terjual');
    const cicilanAccounts = currentAccounts.filter(a => a.status === 'cicilan');
    const holdAccounts = currentAccounts.filter(a => a.status === 'hold');

    const ffReadyCount = ffAccounts.filter(a => a.status === 'aktif').length;
    const mlReadyCount = mlAccounts.filter(a => a.status === 'aktif').length;
    const ffSold = ffAccounts.filter(a => a.status === 'terjual');
    const mlSold = mlAccounts.filter(a => a.status === 'terjual');

    // 3. Financial calculations
    const totalModal = currentAccounts.reduce((sum, a) => sum + (a.buyPrice || 0), 0);
    const totalTerjual = soldAccounts.reduce((sum, a) => sum + (a.sellPrice || 0), 0);
    const totalProfit = soldAccounts.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);
    const potensiPendapatan = activeAccounts.reduce((sum, a) => sum + (a.targetPrice || 0), 0);

    const ffProfit = ffSold.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);
    const mlProfit = mlSold.reduce((sum, a) => sum + ((a.sellPrice || 0) - (a.buyPrice || 0)), 0);

    // Recent Sales (show up to 30 items)
    const recentSales = [...soldAccounts].sort((a, b) => new Date(b.sellDate || 0) - new Date(a.sellDate || 0)).slice(0, 30);

    // Chart Logic
    const chartData = useMemo(() => {
        const data = [];
        const today = new Date();
        // Set time to 0 to avoid timezone shift issues
        today.setHours(0, 0, 0, 0);
        
        for (let i = chartRange - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            
            // Format YYYY-MM-DD for comparison
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${day}`;
            
            const daySales = soldAccounts.filter(a => a.sellDate === dateStr).reduce((sum, a) => sum + (a.sellPrice || 0), 0);
            
            data.push({
                dateStr,
                label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                value: daySales
            });
        }
        return data;
    }, [soldAccounts, chartRange]);

    const maxChartVal = Math.max(...chartData.map(d => d.value), 500000); // minimum 500k scale
    
    // Generate curved path
    const getPath = (points) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const curr = points[i];
            const prev = points[i - 1];
            const cpX = (curr.x + prev.x) / 2;
            path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        return path;
    };

    const chartPoints = chartData.map((d, i) => ({
        x: chartData.length > 1 ? (i / (chartData.length - 1)) * 600 : 300,
        y: 200 - (d.value / maxChartVal) * 160,
        value: d.value,
        label: d.label
    }));
    
    const linePath = getPath(chartPoints);
    const fillPath = `${linePath} L 600 240 L 0 240 Z`;

    return (
        <div id="dashboard" className="tab-content active" style={{ display: 'block' }}>
            
            {/* Modern KPI Grid */}
            <div className="grid-kpi" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <div className="premium-card stagger-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL AKUN</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '8px' }}>{currentAccounts.length.toLocaleString('id-ID')}</div>
                        </div>
                        <div style={{ background: 'var(--accent-indigo-subtle)', color: 'var(--accent-indigo)', padding: '12px', borderRadius: '16px', boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)' }}>
                            {KpiIcons.users}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center' }}>{KpiIcons.trendingUp}</span> {activeAccounts.length} ready
                    </div>
                </div>

                <div className="premium-card stagger-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TERJUAL</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '8px' }}>{soldAccounts.length.toLocaleString('id-ID')}</div>
                        </div>
                        <div style={{ background: 'var(--accent-red-subtle)', color: 'var(--accent-red)', padding: '12px', borderRadius: '16px', boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.2)' }}>
                            {KpiIcons.shoppingBag}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center' }}>{KpiIcons.trendingUp}</span> {cicilanAccounts.length} cicilan
                    </div>
                </div>

                <div className="premium-card stagger-3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEMUA READY</div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '8px' }}>{activeAccounts.length.toLocaleString('id-ID')}</div>
                        </div>
                        <div style={{ background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)', padding: '12px', borderRadius: '16px', boxShadow: 'inset 0 0 0 1px rgba(245, 158, 11, 0.2)' }}>
                            {KpiIcons.checkCircle}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center' }}>{KpiIcons.trendingUp}</span> {ffReadyCount} FF
                    </div>
                </div>

                <div className="premium-card stagger-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL PROFIT</div>
                            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '8px' }}>{formatRupiah(totalProfit)}</div>
                        </div>
                        <div style={{ background: 'var(--accent-green-subtle)', color: 'var(--accent-green)', padding: '12px', borderRadius: '16px', boxShadow: 'inset 0 0 0 1px rgba(34, 197, 94, 0.2)' }}>
                            {KpiIcons.dollarSign}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center' }}>{KpiIcons.trendingUp}</span> Potensi {formatRupiah(potensiPendapatan)}
                    </div>
                </div>
            </div>

            {/* Modern Grid Layout */}
            <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', margin: '32px 0' }}>
                
                {/* Modern Card: Sales Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="premium-card stagger-3" style={{ minHeight: '380px', padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>📈 Grafik Penjualan</h3>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    className="s-btn s-btn-secondary" 
                                    style={{ padding: '6px 28px 6px 12px', fontSize: '0.8rem', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                                    value={chartRange}
                                    onChange={(e) => setChartRange(Number(e.target.value))}
                                >
                                    <option value={7}>7 Hari Terakhir</option>
                                    <option value={14}>14 Hari Terakhir</option>
                                    <option value={30}>30 Hari Terakhir</option>
                                </select>
                                <ChevronDown width="14" height="14" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                        
                        <div style={{ position: 'relative', height: '240px', width: '100%', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end', paddingTop: '20px' }}>
                            {/* Grid lines */}
                            <div style={{ position: 'absolute', top: '20px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '90px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '160px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                            
                            {/* Actual Line Chart SVG */}
                            <svg viewBox="0 0 600 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1, overflow: 'visible' }}>
                                {linePath && <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="2" />}
                                {fillPath && <path d={fillPath} fill="url(#fill-gradient)" opacity="0.15" />}
                                <defs>
                                    <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#60a5fa" />
                                    </linearGradient>
                                    <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                
                                {/* Points */}
                                {chartPoints.map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" style={{ transition: 'all 0.2s ease' }} />
                                ))}
                                
                                {/* Tooltip on last point if exists */}
                                {chartPoints.length > 0 && (() => {
                                    const last = chartPoints[chartPoints.length - 1];
                                    return (
                                        <g transform={`translate(${last.x > 500 ? last.x - 110 : last.x}, ${last.y - 40})`} style={{ transition: 'transform 0.3s ease' }}>
                                            <rect x="-10" y="-15" width="120" height="42" rx="8" fill="#18181b" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                            <text x="5" y="0" fill="white" fontSize="11" fontWeight="bold">{formatRupiah(last.value)}</text>
                                            <text x="5" y="16" fill="#94a3b8" fontSize="10">{last.label}</text>
                                        </g>
                                    );
                                })()}
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {/* Only show max 7 labels evenly distributed */}
                            {chartPoints.filter((_, i, arr) => i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 5) === 0).map((p, i) => (
                                <span key={i}>{p.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Statistik Keuangan (4 Mini Cards) */}
                    <div className="premium-card stagger-1" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>Statistik Keuangan</h3>
                        <div className="finance-stats-grid">
                            <div className="finance-mini-card">
                                <div className="f-icon text-blue">{KpiIcons.wallet}</div>
                                <div className="f-title">TOTAL MODAL</div>
                                <div className="f-value">{formatRupiah(totalModal)}</div>
                            </div>
                            <div className="finance-mini-card">
                                <div className="f-icon text-purple">{KpiIcons.cart}</div>
                                <div className="f-title">TOTAL TERJUAL</div>
                                <div className="f-value">{formatRupiah(totalTerjual)}</div>
                            </div>
                            <div className="finance-mini-card">
                                <div className="f-icon text-green">{KpiIcons.chartBar}</div>
                                <div className="f-title">PROFIT/LOSS</div>
                                <div className="f-value text-green">+{formatRupiah(totalProfit)}</div>
                            </div>
                            <div className="finance-mini-card">
                                <div className="f-icon text-amber">{KpiIcons.moneyBag}</div>
                                <div className="f-title">POTENSI</div>
                                <div className="f-value">{formatRupiah(potensiPendapatan)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Account Stock Summary & Recent Sales */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Modern Card: Account Stock Summary */}
                    <div className="premium-card stagger-4" style={{ flex: 1, padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.5px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ringkasan Stok Akun</h3>
                            <button onClick={() => onNavigate && onNavigate('pencarian')} className="s-btn s-btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>Lihat Semua</button>
                        </div>

                        <div className="stock-summary-list">
                            {/* FF Row */}
                            <div className="stock-summary-item">
                                <div className="stock-summary-game">
                                    <div className="ss-icon bg-amber">{KpiIcons.ff}</div>
                                    <div className="ss-name">FREE FIRE</div>
                                </div>
                                <div className="ss-stats-grid">
                                    <div className="ss-stat-col">
                                        <div className="ss-label">Total Akun</div>
                                        <div className="ss-val lg">{ffAccounts.length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-green">Ready</div>
                                        <div className="ss-val text-green">{ffReadyCount}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-purple">Terjual</div>
                                        <div className="ss-val text-purple">{ffSold.length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-amber">Cicilan</div>
                                        <div className="ss-val text-amber">{ffAccounts.filter(a => a.status === 'cicilan').length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label">Hold</div>
                                        <div className="ss-val">{ffAccounts.filter(a => a.status === 'hold').length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* ML Row */}
                            <div className="stock-summary-item">
                                <div className="stock-summary-game">
                                    <div className="ss-icon bg-blue">{KpiIcons.ml}</div>
                                    <div className="ss-name">MOBILE LEGENDS</div>
                                </div>
                                <div className="ss-stats-grid">
                                    <div className="ss-stat-col">
                                        <div className="ss-label">Total Akun</div>
                                        <div className="ss-val lg">{mlAccounts.length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-green">Ready</div>
                                        <div className="ss-val text-green">{mlReadyCount}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-purple">Terjual</div>
                                        <div className="ss-val text-purple">{mlSold.length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label text-amber">Cicilan</div>
                                        <div className="ss-val text-amber">{mlAccounts.filter(a => a.status === 'cicilan').length}</div>
                                    </div>
                                    <div className="ss-stat-col">
                                        <div className="ss-label">Hold</div>
                                        <div className="ss-val">{mlAccounts.filter(a => a.status === 'hold').length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Sales List */}
                    <div className="premium-card stagger-2" style={{ flex: 1, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Penjualan Terbaru</h3>
                            <button onClick={() => onNavigate && onNavigate('penjualan')} className="s-btn s-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Lihat Semua</button>
                        </div>

                        <div className="recent-sales-list">
                            {recentSales.length > 0 ? recentSales.map((sale, i) => (
                                <div key={i} className="recent-sale-item">
                                    <div className="rs-left">
                                        <div className={`rs-avatar ${sale.game === 'ff' ? 'rs-ff' : 'rs-ml'}`}>
                                            {sale.game === 'ff' ? 'FF' : 'ML'}
                                        </div>
                                        <div className="rs-info">
                                            <div className="rs-name">{sale.name || `Akun ${sale.game ? sale.game.toUpperCase() : ''}`}</div>
                                            <div className="rs-order">Order ID: {sale.id || '#000'}</div>
                                        </div>
                                    </div>
                                    <div className="rs-badge-wrap">
                                        <span className={`rs-badge ${sale.status === 'cicilan' ? 'badge-cicilan' : 'badge-lunas'}`}>
                                            {sale.status === 'cicilan' ? 'Cicilan' : 'Lunas'}
                                        </span>
                                    </div>
                                    <div className="rs-price">{formatRupiah(sale.sellPrice || 0)}</div>
                                    <div className="rs-date">
                                        <div>24 Mei 2026</div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>14:32</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '30px 0', fontSize: '0.9rem' }}>Belum ada penjualan.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
        </div>
    );
}
