'use client';
import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Clock, Zap, ArrowUpRight, Eye, Star } from 'lucide-react';

export default function FastSellingAccounts({ accounts = [], formatRupiah }) {
  const [fastSellers, setFastSellers] = useState([]);

  useEffect(() => {
    // Calculate sell speed: accounts sold within 3 days
    const sold = accounts.filter(a => a.status === 'terjual' && a.sellDate && a.tanggal);

    const withSpeed = sold.map(a => {
      const created = new Date(a.tanggal);
      const soldDate = new Date(a.sellDate);
      const daysToSell = Math.ceil((soldDate - created) / (1000 * 60 * 60 * 24));
      return { ...a, daysToSell };
    });

    // Sort by fastest sell time, then by most recent
    const fastest = withSpeed
      .filter(a => a.daysToSell >= 0)
      .sort((a, b) => a.daysToSell - b.daysToSell)
      .slice(0, 4);

    setFastSellers(fastest);
  }, [accounts]);

  const getSpeedLabel = (days) => {
    if (days === 0) return { text: 'Hari Ini', color: '#10B981' };
    if (days <= 1) return { text: '1 Hari', color: '#34D399' };
    if (days <= 3) return { text: `${days} Hari`, color: '#FBBF24' };
    return { text: `${days} Hari`, color: '#F97316' };
  };

  const getGameEmoji = (game) => {
    const map = { 'ml': '⚡', 'ff': '🔥', 'pubg': '🎯', 'valorant': '🎮', 'genshin': '✨' };
    return map[game?.toLowerCase().slice(0, 2)] || '🎮';
  };

  return (
    <div className="fast-selling-section">
      <div className="section-header">
        <div className="section-title-with-icon">
          <Flame size={20} strokeWidth={2.5} />
          <h3>Fast Selling</h3>
        </div>
        <span className="section-badge">Terlaris</span>
      </div>

      <div className="fast-selling-list">
        {fastSellers.length === 0 ? (
          <div className="empty-state small">
            <Flame size={32} strokeWidth={1.5} />
            <p>Belum ada data penjualan cepat</p>
          </div>
        ) : (
          fastSellers.map((account, index) => {
            const speed = getSpeedLabel(account.daysToSell);
            return (
              <div key={account.id || `fast-${index}`} className="fast-selling-item">
                <div className="fast-selling-rank">
                  <span className="rank-number">#{index + 1}</span>
                </div>
                <div className="fast-selling-info">
                  <div className="fast-selling-name">
                    <span className="game-emoji">{getGameEmoji(account.game)}</span>
                    <span className="account-title">{account.nama_akun || account.nama || 'Akun Game'}</span>
                  </div>
                  <div className="fast-selling-meta">
                    <span className="game-category">{account.game || account.kategori}</span>
                    <span className="sold-amount">{formatRupiah(Number(account.sellPrice || account.nominal || 0))}</span>
                  </div>
                </div>
                <div className="fast-selling-speed" style={{ color: speed.color }}>
                  <Clock size={12} strokeWidth={2.5} />
                  <span>{speed.text}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
