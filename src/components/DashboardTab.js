'use client';
import React, { useState, useMemo } from 'react';
import { Users, ShoppingBag, CheckCircle, DollarSign, TrendingUp, Package, Circle, Wallet, ShoppingCart, BarChart3, ChevronDown } from 'lucide-react';

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
            
            <div className="bento-grid">
                
                {/* HERO BENTO (Wide) */}
                <div className="bento-card bento-wide stagger-1">
                    <div className="bento-glow-blue"></div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Farid Shop Game
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px', fontWeight: 500 }}>Premium Account Marketplace</p>
                        </div>
                        <div style={{ display: 'flex', gap: '32px', marginTop: '32px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Akun</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{currentAccounts.length}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Terjual</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)' }}>{soldAccounts.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FINANCIAL BENTO (Square) */}
                <div className="bento-card stagger-2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit Bersih</div>
                        <div style={{ background: 'var(--accent-green-subtle)', color: 'var(--accent-green)', padding: '10px', borderRadius: '14px', boxShadow: 'inset 0 0 0 1px rgba(34, 197, 94, 0.2)' }}>
                            {KpiIcons.dollarSign}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '16px' }}>{formatRupiah(totalProfit)}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                            {KpiIcons.trendingUp} +Potensi {formatRupiah(potensiPendapatan)}
                        </div>
                    </div>
                </div>

                {/* ASSET BENTO (Square) */}
                <div className="bento-card stagger-3" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="bento-glow-gold"></div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Akun Ready</div>
                        <div style={{ background: 'var(--accent-amber-subtle)', color: 'var(--accent-amber)', padding: '10px', borderRadius: '14px', boxShadow: 'inset 0 0 0 1px rgba(245, 158, 11, 0.2)' }}>
                            {KpiIcons.checkCircle}
                        </div>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '16px' }}>{activeAccounts.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            <span style={{ color: 'var(--accent-amber)' }}>•</span> {ffReadyCount} FF &nbsp;
                            <span style={{ color: 'var(--accent-blue)' }}>•</span> {mlReadyCount} ML
                        </div>
                    </div>
                </div>

                {/* CHART BENTO (Wide & Tall) */}
                <div className="bento-card bento-wide bento-tall stagger-4" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>📈 Grafik Penjualan</h3>
                        <div style={{ position: 'relative' }}>
                            <select 
                                className="s-btn s-btn-secondary" 
                                style={{ padding: '6px 28px 6px 12px', fontSize: '0.8rem', appearance: 'none', cursor: 'pointer', outline: 'none' }}
                                value={chartRange}
                                onChange={(e) => setChartRange(Number(e.target.value))}
                            >
                                <option value={7}>7 Hari</option>
                                <option value={14}>14 Hari</option>
                                <option value={30}>30 Hari</option>
                            </select>
                            <ChevronDown width="14" height="14" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                    
                    <div style={{ position: 'relative', flex: 1, minHeight: '220px', width: '100%', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-end', paddingTop: '20px' }}>
                        {/* Grid lines */}
                        <div style={{ position: 'absolute', top: '20px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '90px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: '160px', width: '100%', borderTop: '1px dashed var(--border-subtle)', zIndex: 0 }}></div>
                        
                        {/* Actual Line Chart SVG */}
                        <svg viewBox="0 0 600 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1, overflow: 'visible' }}>
                            {linePath && <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth="2.5" />}
                            {fillPath && <path d={fillPath} fill="url(#fill-gradient)" opacity="0.15" />}
                            <defs>
                                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="var(--text-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-blue)" />
                                </linearGradient>
                                <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent-blue)" />
                                    <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Points */}
                            {chartPoints.map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--text-primary)" stroke="var(--bg-card)" strokeWidth="2" style={{ transition: 'all 0.2s ease' }} />
                            ))}
                            
                            {/* Tooltip on last point if exists */}
                            {chartPoints.length > 0 && (() => {
                                const last = chartPoints[chartPoints.length - 1];
                                return (
                                    <g transform={`translate(${last.x > 500 ? last.x - 110 : last.x}, ${last.y - 40})`} style={{ transition: 'transform 0.3s ease' }}>
                                        <rect x="-10" y="-15" width="120" height="42" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1" />
                                        <text x="5" y="0" fill="var(--text-primary)" fontSize="11" fontWeight="bold">{formatRupiah(last.value)}</text>
                                        <text x="5" y="16" fill="var(--text-secondary)" fontSize="10">{last.label}</text>
                                    </g>
                                );
                            })()}
                        </svg>
                    </div>
                    <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {chartPoints.filter((_, i, arr) => i === 0 || i === arr.length - 1 || i % Math.ceil(arr.length / 5) === 0).map((p, i) => (
                            <span key={i}>{p.label}</span>
                        ))}
                    </div>
                </div>

                {/* RECENT SALES BENTO (Wide & Tall) */}
                <div className="bento-card bento-wide bento-tall stagger-5" style={{ padding: '24px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Penjualan Terbaru</h3>
                        <button onClick={() => onNavigate && onNavigate('penjualan')} className="s-btn s-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Lihat Semua</button>
                    </div>

                    <div className="recent-sales-list sales-list-horizontal" style={{ flex: 1, padding: '0 24px' }}>
                        {recentSales.length > 0 ? recentSales.map((sale, i) => (
                            <div key={i} className="recent-sale-item" style={{ minWidth: '240px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className={`rs-avatar ${sale.game === 'ff' ? 'rs-ff' : 'rs-ml'}`} style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                        {sale.game === 'ff' ? 'FF' : 'ML'}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{sale.name || `Akun ${sale.game ? sale.game.toUpperCase() : ''}`}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>ID: {sale.id || '#000'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-green)' }}>{formatRupiah(sale.sellPrice || 0)}</div>
                                    <span className={`rs-badge ${sale.status === 'cicilan' ? 'badge-cicilan' : 'badge-lunas'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                        {sale.status === 'cicilan' ? 'Cicilan' : 'Lunas'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-tertiary)', padding: '30px 0', fontSize: '0.9rem' }}>Belum ada penjualan.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
