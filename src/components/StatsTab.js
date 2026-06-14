'use client';
import React from 'react';
import AiInsightCard from './AiInsightCard';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function StatsTab({
    accounts = [],
    globalFilterMonth,
    globalFilterYear,
    formatRupiah
}) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    // 1. Apply Global Filters to accounts
    let currentAccounts = [...accounts];
    if (globalFilterMonth !== 'all') {
        const monthNum = parseInt(globalFilterMonth);
        const yearNum = parseInt(globalFilterYear);

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

    // 2. Core Stats Counters
    const readyCount = currentAccounts.filter(a => a.status === 'aktif').length;
    const soldCount = currentAccounts.filter(a => a.status === 'terjual').length;
    const cicilanCount = currentAccounts.filter(a => a.status === 'cicilan').length;
    const totalAcc = currentAccounts.length;
    const soldPercent = totalAcc > 0 ? Math.round((soldCount / totalAcc) * 100) : 0;

    const ffCount = currentAccounts.filter(a => a.game === 'ff').length;
    const mlCount = currentAccounts.filter(a => a.game === 'ml').length;

    // 3. Group by Month Logic
    const profitByMonth = {};
    const currentDate = new Date();
    
    // We determine what the active month is for the mini KPI cards:
    // If the global filter is active, use the filtered month. Otherwise, use current real-world month.
    let activeYear = currentDate.getFullYear();
    let activeMonthIdx = currentDate.getMonth();

    if (globalFilterMonth !== 'all') {
        activeMonthIdx = parseInt(globalFilterMonth);
        activeYear = parseInt(globalFilterYear);
    }

    const currentMonthKey = `${activeYear}-${activeMonthIdx}`;
    let prevYear = activeYear;
    let prevMonthIndex = activeMonthIdx - 1;
    if (prevMonthIndex < 0) {
        prevMonthIndex = 11;
        prevYear--;
    }
    const prevMonthKey = `${prevYear}-${prevMonthIndex}`;

    // Fill monthly stats based on all accounts (or current filtered accounts)
    // To ensure charts show multi-month data, we calculate profitByMonth from ALL accounts
    const targetAccountsForChart = globalFilterMonth === 'all' ? accounts : currentAccounts;

    targetAccountsForChart.forEach(a => {
        if (a.buyDate) {
            const parts = a.buyDate.split('-');
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const key = `${year}-${month}`;
            if (!profitByMonth[key]) profitByMonth[key] = { profit: 0, sales: 0, revenue: 0, cost: 0 };

            profitByMonth[key].cost += (a.buyPrice || 0);

            if (a.status === 'terjual' && a.sellDate) {
                const sellParts = a.sellDate.split('-');
                const sellYear = parseInt(sellParts[0]);
                const sellMonth = parseInt(sellParts[1]) - 1;
                const sellKey = `${sellYear}-${sellMonth}`;

                if (!profitByMonth[sellKey]) profitByMonth[sellKey] = { profit: 0, sales: 0, revenue: 0, cost: 0 };

                const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                profitByMonth[sellKey].profit += profit;
                profitByMonth[sellKey].revenue += (a.sellPrice || 0);
                profitByMonth[sellKey].sales++;
            }
        }
    });

    const monthKeys = Object.keys(profitByMonth).sort();
    const profitLabels = monthKeys.map(k => {
        const [y, m] = k.split('-');
        return monthNames[parseInt(m)] + ' ' + y;
    });
    const profitData = monthKeys.map(k => profitByMonth[k].profit);
    const revenueData = monthKeys.map(k => profitByMonth[k].revenue);
    const salesData = monthKeys.map(k => profitByMonth[k].sales);

    // Get active and previous month performance metrics
    const currStats = profitByMonth[currentMonthKey] || { profit: 0, sales: 0 };
    const prevStats = profitByMonth[prevMonthKey] || { profit: 0, sales: 0 };

    const profitDiff = prevStats.profit > 0 ? Math.round(((currStats.profit - prevStats.profit) / prevStats.profit) * 100) : 100;
    const salesDiff = prevStats.sales > 0 ? Math.round(((currStats.sales - prevStats.sales) / prevStats.sales) * 100) : 100;

    // Average Margin calculation
    const totalProfits = currentAccounts.reduce((s, a) => s + (a.status === 'terjual' ? ((a.sellPrice || 0) - (a.buyPrice || 0)) : 0), 0);
    const totalBuy = currentAccounts.reduce((s, a) => s + (a.status === 'terjual' ? (a.buyPrice || 0) : 0), 0);
    const avgMargin = totalBuy > 0 ? Math.round((totalProfits / totalBuy) * 100) : 0;

    // Recent activity (latest 4 sales)
    const recentSales = currentAccounts
        .filter(a => a.status === 'terjual' && a.sellDate)
        .sort((a, b) => new Date(b.sellDate) - new Date(a.sellDate))
        .slice(0, 4);

    // Chart 1: Tren Pendapatan & Profitabilitas (Line)
    const lineChartData = {
        labels: profitLabels.length > 0 ? profitLabels : ['No Data'],
        datasets: [
            {
                label: 'Pendapatan (IDR)',
                data: revenueData.length > 0 ? revenueData : [0],
                borderColor: '#3b82f6',
                borderWidth: 3,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundcolor: 'var(--text-primary)',
                pointBorderColor: '#3b82f6',
                pointRadius: 4,
                yAxisID: 'y'
            },
            {
                label: 'Unit Terjual',
                data: salesData.length > 0 ? salesData : [0],
                borderColor: '#f59e0b',
                borderWidth: 3,
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                pointBackgroundcolor: 'var(--text-primary)',
                pointBorderColor: '#f59e0b',
                pointRadius: 4,
                yAxisID: 'y1'
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#CBD5E1', font: { size: 11 } }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94A3B8' }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94A3B8',
                    callback: (val) => formatRupiah(val)
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#94A3B8' }
            }
        }
    };

    // Chart 2: Status Stok (Doughnut)
    const donutChartData = {
        labels: ['Ready', 'Terjual', 'Cicilan'],
        datasets: [{
            data: [readyCount, soldCount, cicilanCount],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const donutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false }
        }
    };

    // Chart 3: Profit Bulanan (Bar)
    const barProfitData = {
        labels: profitLabels.slice(-6).length > 0 ? profitLabels.slice(-6) : ['No Data'],
        datasets: [{
            label: 'Profit',
            data: profitData.slice(-6).length > 0 ? profitData.slice(-6) : [0],
            backgroundColor: (profitData.slice(-6).length > 0 ? profitData.slice(-6) : [0]).map(v => v >= 0 ? '#10b981' : '#ef4444'),
            borderRadius: 4
        }]
    };

    const barProfitOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94A3B8', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94A3B8',
                    font: { size: 10 },
                    callback: (val) => formatRupiah(val)
                }
            }
        }
    };

    // Chart 4: Game Distribution (Horizontal Bar)
    const horizontalBarData = {
        labels: ['Free Fire', 'Mobile Legends'],
        datasets: [{
            data: [ffCount, mlCount],
            backgroundColor: ['#f97316', '#3b82f6'],
            borderRadius: 6,
            barThickness: 20
        }]
    };

    const horizontalBarOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: false, grid: { display: false } },
            y: {
                grid: { display: false },
                ticks: { color: '#CBD5E1', font: { weight: 'bold' } }
            }
        }
    };

    return (
        <div id="statistik" className="tab-content active" style={{ display: 'block' }}>
            <AiInsightCard title="AI Business Intel" insight="Proyeksi margin keuntungan tinggi untuk minggu depan. Disarankan untuk memprioritaskan penjualan akun kategori sultan." />
            <div className="content">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .adv-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-gap: 15px; width: 100%; margin-bottom: 30px; }
                    .adv-card { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.3s ease, box-shadow 0.3s ease; backdrop-filter: blur(10px); }
                    .adv-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); border-color: rgba(59, 130, 246, 0.4); }
                    .adv-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                    .adv-card-title { font-size: 0.85rem; font-weight: 700; color: #CBD5E1; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
                    
                    .adv-mini { display: flex; flex-direction: column; justify-content: space-between; height: 110px; }
                    .adv-mini-title { font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                    .adv-mini-val { font-size: 1.4rem; font-weight: 800; color: #FFFFFF; text-shadow: 0 2px 4px rgba(0,0,0,0.3); word-break: break-all; }
                    .adv-mini-trend { font-size: 0.7rem; font-weight: 600; color: #ef4444; padding: 4px 8px; background: rgba(239, 68, 68, 0.1); border-radius: 6px; display: inline-block; align-self: flex-start; }
                    .adv-mini-trend.positive { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                    
                    .adv-main-chart { grid-column: span 3; grid-row: span 2; min-height: 280px; }
                    .adv-side-chart { grid-column: span 1; grid-row: span 2; min-height: 280px; }
                    .adv-bottom-chart-1 { grid-column: span 2; min-height: 220px; }
                    .adv-bottom-chart-2 { grid-column: span 1; min-height: 220px; }
                    .adv-bottom-chart-3 { grid-column: span 1; min-height: 220px; }
                    
                    @media (max-width: 1200px) {
                        .adv-grid { grid-template-columns: repeat(2, 1fr); }
                        .adv-main-chart { grid-column: span 2; }
                        .adv-side-chart { grid-column: span 2; grid-row: span 1; }
                        .adv-bottom-chart-1, .adv-bottom-chart-2, .adv-bottom-chart-3 { grid-column: span 2; }
                    }
                    @media (max-width: 768px) {
                        .adv-grid { grid-template-columns: 1fr; }
                        .adv-main-chart, .adv-side-chart, .adv-bottom-chart-1, .adv-bottom-chart-2, .adv-bottom-chart-3, .adv-mini { grid-column: span 1; }
                    }
                `}} />

                <div className="adv-grid">
                    {/* Top Summary Cards */}
                    <div className="adv-card adv-mini">
                        <div className="adv-mini-title">Total Keuntungan ({globalFilterMonth !== 'all' ? monthNames[activeMonthIdx] : 'Bulan Ini'})</div>
                        <div className="adv-mini-val">{formatRupiah(currStats.profit)}</div>
                        <div className={`adv-mini-trend ${currStats.profit >= prevStats.profit ? 'positive' : ''}`}>
                            {currStats.profit >= prevStats.profit ? '↑' : '↓'} {Math.abs(profitDiff)}% vs bln lalu
                        </div>
                    </div>
                    <div className="adv-card adv-mini">
                        <div className="adv-mini-title">Akun Terjual ({globalFilterMonth !== 'all' ? monthNames[activeMonthIdx] : 'Bulan Ini'})</div>
                        <div className="adv-mini-val">{currStats.sales}</div>
                        <div className={`adv-mini-trend ${currStats.sales >= prevStats.sales ? 'positive' : ''}`}>
                            {currStats.sales >= prevStats.sales ? '↑' : '↓'} {Math.abs(salesDiff)}% vs bln lalu
                        </div>
                    </div>
                    <div className="adv-card adv-mini">
                        <div className="adv-mini-title">Rata-rata Margin</div>
                        <div className="adv-mini-val">{avgMargin}%</div>
                        <div className="adv-mini-trend positive">Profitabilitas</div>
                    </div>
                    <div className="adv-card adv-mini" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'var(--bg-surface)' }}>
                        <div className="adv-mini-title" style={{ color: 'rgba(255,255,255,0.7)' }}>Performa Sistem</div>
                        <div className="adv-mini-val" style={{ 
                            background: 'linear-gradient(90deg, #00E68A, #00D2FF)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.6rem', 
                            letterSpacing: '1px',
                            fontWeight: 900,
                            filter: 'drop-shadow(0 0 8px rgba(0,230,138,0.5))'
                        }}>EXCELLENT</div>
                    </div>

                    {/* Line Chart */}
                    <div className="adv-card adv-main-chart">
                        <div className="adv-card-header">
                            <h3 className="adv-card-title">Tren Pendapatan & Profitabilitas</h3>
                        </div>
                        <div style={{ height: '230px', width: '100%' }}>
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="adv-card adv-side-chart">
                        <div className="adv-card-header">
                            <h3 className="adv-card-title">Status Stok Keseluruhan</h3>
                        </div>
                        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                            <Doughnut data={donutChartData} options={donutChartOptions} />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{soldPercent}%</div>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Terjual</div>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart: Profit Bulanan */}
                    <div className="adv-card adv-bottom-chart-1">
                        <div className="adv-card-header">
                            <h3 className="adv-card-title">Profit/Loss Bulanan</h3>
                        </div>
                        <div style={{ height: '180px', width: '100%' }}>
                            <Bar data={barProfitData} options={barProfitOptions} />
                        </div>
                    </div>

                    {/* Horizontal Bar Chart: Game Dist */}
                    <div className="adv-card adv-bottom-chart-2">
                        <div className="adv-card-header">
                            <h3 className="adv-card-title">Distribusi Game</h3>
                        </div>
                        <div style={{ height: '180px', width: '100%' }}>
                            <Bar data={horizontalBarData} options={horizontalBarOptions} />
                        </div>
                    </div>

                    {/* Recent Sales List */}
                    <div className="adv-card adv-bottom-chart-3" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="adv-card-header">
                            <h3 className="adv-card-title">Aktivitas Terakhir</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recentSales.length === 0 ? (
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                                    Belum ada penjualan
                                </div>
                            ) : (
                                recentSales.map(a => {
                                    const profit = (a.sellPrice || 0) - (a.buyPrice || 0);
                                    return (
                                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                                                    {a.spek}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                                    {(a.game || '').toUpperCase()} - {a.sellDate}
                                                </div>
                                            </div>
                                            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                                                +{formatRupiah(profit)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
