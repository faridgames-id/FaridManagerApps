'use client';
import React, { useState, useMemo } from 'react';
import { Store, Users, Package, DollarSign, TrendingUp, Star, Plus, Filter, Search, ShoppingBag, Zap, Clock, Flame, ArrowUpRight, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8"
        >
            {/* Recently Sold Preview */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg font-clash">
                        <ShoppingBag size={18} className="text-emerald-500" />
                        <h3>Recently Sold</h3>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors" onClick={() => setActiveSection('recently-sold')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketplaceData.recentSales.slice(0, 4).map((acc, i) => (
                        <motion.div whileHover={{ scale: 1.02, y: -2 }} key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Terjual</div>
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl mb-3">{acc.game || '🎮'}</div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 line-clamp-1 mb-1 font-clash">{acc.nama || acc.nama_akun || 'Akun'}</span>
                                <span className="text-lg font-extrabold text-emerald-600 mb-2 font-clash">{formatRupiah(acc.harga || 0)}</span>
                                <span className="text-xs text-slate-400 font-sans">{acc.sellDate}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Fast Selling Preview */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg font-clash">
                        <Zap size={18} className="text-amber-500" />
                        <h3>Fast Selling</h3>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors" onClick={() => setActiveSection('fast-selling')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {marketplaceData.fastSelling.slice(0, 4).map((acc, i) => (
                        <motion.div whileHover={{ scale: 1.02, y: -2 }} key={i} className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1"><Zap size={10} /> Fast</div>
                            <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-xl mb-3 shadow-sm">{acc.game || '🎮'}</div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 line-clamp-1 mb-1 font-clash">{acc.nama || acc.nama_akun || 'Akun'}</span>
                                <span className="text-lg font-extrabold text-amber-600 mb-2 font-clash">{formatRupiah(acc.harga || 0)}</span>
                                <span className="text-xs text-slate-500 font-sans">{acc.sellDate}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* High Demand Categories */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg font-clash">
                        <Flame size={18} className="text-red-500" />
                        <h3>High Demand Categories</h3>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors" onClick={() => setActiveSection('high-demand')}>
                        View All <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {marketplaceData.demandSignals.slice(0, 3).map((d, i) => (
                        <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${d.signal === 'High' ? 'bg-red-50 border-red-100' : d.signal === 'Medium' ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="font-bold text-slate-800 font-sans">{d.category}</span>
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${d.signal === 'High' ? 'bg-red-500 text-white' : d.signal === 'Medium' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'}`}>{d.signal}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderRecentlySold = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-clash">Recently Sold</h3>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{marketplaceData.recentSales.length} items</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketplaceData.recentSales.map((acc, i) => (
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">Terjual</div>
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl mb-3">{acc.game || '🎮'}</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 line-clamp-1 mb-1 font-clash">{acc.nama || acc.nama_akun || 'Akun'}</span>
                            <span className="text-lg font-extrabold text-emerald-600 mb-2 font-clash">{formatRupiah(acc.harga || 0)}</span>
                            <span className="text-xs text-slate-400 font-sans">{acc.sellDate}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderFastSelling = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-clash">Fast Selling Products</h3>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{marketplaceData.fastSelling.length} items</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketplaceData.fastSelling.map((acc, i) => (
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} key={i} className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-100 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1"><Zap size={10} /> Fast</div>
                        <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center text-xl mb-3 shadow-sm">{acc.game || '🎮'}</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 line-clamp-1 mb-1 font-clash">{acc.nama || acc.nama_akun || 'Akun'}</span>
                            <span className="text-lg font-extrabold text-amber-600 mb-2 font-clash">{formatRupiah(acc.harga || 0)}</span>
                            <span className="text-xs text-slate-500 font-sans">{acc.sellDate}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderHighDemand = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-clash">High Demand Categories</h3>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{marketplaceData.highDemand.length} categories</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceData.highDemand.map((cat, i) => (
                    <motion.div whileHover={{ scale: 1.02, y: -2 }} key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-lg font-bold text-slate-900 font-clash">{cat.name}</span>
                            <span className="text-sm font-semibold text-slate-500 font-sans">{cat.total} akun</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div className={`h-full rounded-full ${cat.sellRate > 70 ? 'bg-red-500' : cat.sellRate > 40 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${cat.sellRate}%` }} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-sans">{cat.sold} terjual ({cat.sellRate.toFixed(0)}%)</span>
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded-lg ${cat.sellRate > 70 ? 'bg-red-50 text-red-600' : cat.sellRate > 40 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                {cat.sellRate > 70 ? '🔥 High Demand' : cat.sellRate > 40 ? '📈 Growing' : '💤 Low'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const renderActivity = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-clash">Marketplace Activity Feed</h3>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live</span>
            </div>
            <div className="flex flex-col gap-3">
                {marketplaceData.activityFeed.map((item, i) => (
                    <motion.div whileHover={{ scale: 1.01, x: 4 }} key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${item.type === 'sale' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.type === 'sale' ? <CheckCircle size={18} /> : <Plus size={18} />}
                        </div>
                        <div className="flex flex-col flex-1">
                            {item.type === 'sale' ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                    <span className="text-sm text-slate-700 font-sans">
                                        <strong className="text-slate-900">{item.account}</strong> terjual ke <strong className="text-slate-900">{item.buyer}</strong>
                                    </span>
                                    <span className="text-sm font-extrabold text-emerald-600 font-clash">{formatRupiah(item.amount)}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-slate-700 font-sans">
                                    <strong className="text-slate-900">{item.account}</strong> di-listing ({item.game})
                                </span>
                            )}
                            <span className="text-xs text-slate-400 mt-1">
                                {new Date(item.time).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div className="mb-8 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Store size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-clash">Marketplace</h2>
                        <p className="text-sm text-slate-500 font-sans">Jelajahi aktivitas dan tren marketplace</p>
                    </div>
                </div>
            </div>

            {/* Premium Sliding Tab Bar */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 backdrop-blur rounded-xl overflow-x-auto w-full max-w-full no-scrollbar mb-8">
                {sections.map(s => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                        <button
                            key={s.id}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm shadow-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <Icon size={16} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                            <span>{s.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeSection === 'overview' && <motion.div key="overview">{renderOverview()}</motion.div>}
                    {activeSection === 'recently-sold' && <motion.div key="recently-sold">{renderRecentlySold()}</motion.div>}
                    {activeSection === 'fast-selling' && <motion.div key="fast-selling">{renderFastSelling()}</motion.div>}
                    {activeSection === 'high-demand' && <motion.div key="high-demand">{renderHighDemand()}</motion.div>}
                    {activeSection === 'activity' && <motion.div key="activity">{renderActivity()}</motion.div>}
                </AnimatePresence>
            </div>
        </div>
    );
}
