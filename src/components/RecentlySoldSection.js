'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, User, Star, TrendingUp, Zap, Eye } from 'lucide-react';

export default function RecentlySoldSection({ accounts = [], formatRupiah }) {
  const [recentSales, setRecentSales] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [animatedPrices, setAnimatedPrices] = useState({});

  // Get recently sold accounts and animate prices
  useEffect(() => {
    const sold = accounts
      .filter(a => a.status === 'terjual' && a.sellDate)
      .sort((a, b) => new Date(b.sellDate) - new Date(a.sellDate))
      .slice(0, showAll ? 12 : 6);

    setRecentSales(sold);

    // Animate prices
    sold.forEach(account => {
      const targetPrice = Number(account.sellPrice || account.nominal || 0);
      setAnimatedPrices(prev => ({ ...prev, [account.id]: 0 }));

      const startAnimation = (accountId) => {
        let start = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(start + (targetPrice - start) * easeOutQuart);

          setAnimatedPrices(prev => ({ ...prev, [accountId]: current }));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      };

      setTimeout(() => startAnimation(account.id), 100);
    });
  }, [accounts, showAll]);

  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const getGameIcon = (game) => {
    const gameIcons = {
      'Mobile Legends': '⚡',
      'Free Fire': '🔥',
      'ML': '⚡',
      'FF': '🔥',
      'PUBG': '🎯',
      'Valorant': '🎮',
      'Genshin Impact': '✨'
    };
    return gameIcons[game?.toLowerCase()] || '🎮';
  };

  return (
    <div className="recently-sold-section">
      <div className="section-header">
        <div className="section-title-with-icon">
          <ShoppingBag size={20} strokeWidth={2.5} />
          <h3>Baru Terjual</h3>
        </div>
        <button
          className="show-all-button"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Tampilkan Sedikit' : 'Lihat Semua'}
        </button>
      </div>

      <div className="recently-sold-grid">
        {recentSales.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={48} strokeWidth={1.5} />
            <p>Belum ada transaksi</p>
          </div>
        ) : (
          recentSales.map((account, index) => (
            <div
              key={account.id || `sale-${index}`}
              className="sold-card"
              style={{ '--card-index': index }}
            >
              <div className="sold-card-header">
                <div className="game-info">
                  <span className="game-icon">{getGameIcon(account.game)}</span>
                  <span className="game-name">{account.game || account.kategori}</span>
                </div>
                <div className="sold-badge">Terjual</div>
              </div>

              <div className="account-name">{account.nama_akun || account.nama || 'Akun Game'}</div>

              <div className="price-section">
                <div className="sold-price">
                  <span className="currency">Rp</span>
                  <span className="amount">{formatRupiah(animatedPrices[account.id] || 0).replace('Rp ', '').replace(/\./g, ' ')}</span>
                </div>
              </div>

              <div className="transaction-details">
                <div className="buyer-info">
                  <User size={12} strokeWidth={2} />
                  <span>{account.pembeli || 'Pembeli'}</span>
                </div>
                <div className="time-info">
                  <Clock size={12} strokeWidth={2} />
                  <span>{formatTimeAgo(account.sellDate)}</span>
                </div>
              </div>

              {account.harga && (
                <div className="original-price">
                  <span>Awal: {formatRupiah(Number(account.harga))}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
