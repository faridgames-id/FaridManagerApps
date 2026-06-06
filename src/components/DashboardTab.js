'use client';
import React, { useState, useMemo } from 'react';

// SVG Icons for KPI Cards
const KpiIcons = {
    users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    shoppingBag: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
    checkCircle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    dollarSign: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    trendingUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    ff: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    ml: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>,
    wallet: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>,
    cart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
    chartBar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    moneyBag: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
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
            
            {/* Top KPI Grid */}
            <div className="grid-kpi" style={{ marginBottom: '32px' }}>
                <div className="s-card kpi-card-v2 stagger-1">
                    <div className="kpi-icon-v2 bg-blue">
                        {KpiIcons.users}
                    </div>
                    <div className="kpi-content-v2">
                        <div className="kpi-title-v2">TOTAL AKUN</div>
                        <div className="kpi-value-v2">{currentAccounts.length.toLocaleString('id-ID')}</div>
                        <div className="kpi-trend-v2 green">
                            {KpiIcons.trendingUp} {activeAccounts.length} ready
                        </div>
                    </div>
                </div>

                <div className="s-card kpi-card-v2 stagger-2">
                    <div className="kpi-icon-v2 bg-purple">
                        {KpiIcons.shoppingBag}
                    </div>
                    <div className="kpi-content-v2">
                        <div className="kpi-title-v2">TERJUAL</div>
                        <div className="kpi-value-v2">{soldAccounts.length.toLocaleString('id-ID')}</div>
                        <div className="kpi-trend-v2 green">
                            {KpiIcons.trendingUp} {cicilanAccounts.length} cicilan
                        </div>
                    </div>
                </div>

                <div className="s-card kpi-card-v2 stagger-3">
                    <div className="kpi-icon-v2 bg-green">
                        {KpiIcons.checkCircle}
                    </div>
                    <div className="kpi-content-v2">
                        <div className="kpi-title-v2">SEMUA READY</div>
                        <div className="kpi-value-v2">{activeAccounts.length.toLocaleString('id-ID')}</div>
                        <div className="kpi-trend-v2 green">
                            {KpiIcons.trendingUp} {ffReadyCount} FF
                        </div>
                    </div>
                </div>

                <div className="s-card kpi-card-v2 stagger-4">
                    <div className="kpi-icon-v2 bg-amber">
                        {KpiIcons.dollarSign}
                    </div>
                    <div className="kpi-content-v2">
                        <div className="kpi-title-v2">TOTAL PROFIT</div>
                        <div className="kpi-value-v2">{formatRupiah(totalProfit)}</div>
                        <div className="kpi-trend-v2 green">
                            {KpiIcons.trendingUp} Potensi {formatRupiah(potensiPendapatan)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Grid */}
            <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                
                {/* Left Column: Chart & Financial Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Dynamic Sales Chart */}
                    <div className="s-card stagger-3" style={{ minHeight: '340px', flex: 1, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Grafik Penjualan</h3>
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
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        
                        <div style={{ position: 'relative', height: '240px', width: '100%', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-end', paddingTop: '20px' }}>
                            {/* Grid lines */}
                            <div style={{ position: 'absolute', top: '20px', width: '100%', borderTop: '1px dashed var(--border-light)', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '90px', width: '100%', borderTop: '1px dashed var(--border-light)', zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '160px', width: '100%', borderTop: '1px dashed var(--border-light)', zIndex: 0 }}></div>
                            
                            {/* Actual Line Chart SVG */}
                            <svg viewBox="0 0 600 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1, overflow: 'visible' }}>
                                {linePath && <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="3" />}
                                {fillPath && <path d={fillPath} fill="url(#fill-gradient)" opacity="0.25" />}
                                <defs>
                                    <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#0052D4" />
                                        <stop offset="50%" stopColor="#00D2FF" />
                                        <stop offset="100%" stopColor="#FFD700" />
                                    </linearGradient>
                                    <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00D2FF" />
                                        <stop offset="100%" stopColor="#0052D4" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                
                                {/* Points */}
                                {chartPoints.map((p, i) => (
                                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#00D2FF" stroke="#0052D4" strokeWidth="1.5" style={{ transition: 'all 0.3s ease', filter: 'drop-shadow(0 0 4px rgba(0, 210, 255, 0.5))' }} />
                                ))}
                                
                                {/* Tooltip on last point if exists */}
                                {chartPoints.length > 0 && (() => {
                                    const last = chartPoints[chartPoints.length - 1];
                                    return (
                                        <g transform={`translate(${last.x > 500 ? last.x - 110 : last.x}, ${last.y - 40})`} style={{ transition: 'transform 0.3s ease' }}>
                                            <rect x="-10" y="-15" width="120" height="42" rx="8" fill="#0A1428" stroke="rgba(0,210,255,0.2)" strokeWidth="1" />
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
                    <div className="s-card stagger-1" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Statistik Keuangan</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Account Stock Summary */}
                    <div className="s-card stagger-4" style={{ flex: 1, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ringkasan Stok Akun</h3>
                            <button onClick={() => onNavigate && onNavigate('pencarian')} className="s-btn s-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Lihat Semua</button>
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
                    <div className="s-card stagger-2" style={{ flex: 1, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Penjualan Terbaru</h3>
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
                                            <div className="rs-name">{sale.name || `Akun ${sale.game.toUpperCase()}`}</div>
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
