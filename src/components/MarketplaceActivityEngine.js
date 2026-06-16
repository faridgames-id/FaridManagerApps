'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Package, Star, TrendingUp, Zap, Clock, User, DollarSign, Activity, Flame, ArrowUpRight } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function MarketplaceActivityEngine({ accounts = [], sales = [], formatRupiah }) {
  const [liveFeed, setLiveFeed] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLive, setIsLive] = useState(true);
  const feedRef = useRef(null);
  const intervalRef = useRef(null);

  // Real-time subscriptions
  useEffect(() => {
    if (!supabase) return;

    // Subscribe to accounts changes
    const accountsSubscription = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts'
        },
        (payload) => {
          console.log('Accounts real-time update:', payload);
          // Add to activity feed for real accounts updates
          if (payload.new && payload.new.status === 'terjual') {
            const newActivity = {
              id: `realtime-sale-${Date.now()}`,
              type: 'sale',
              icon: <ShoppingBag className="h-4 w-4" />,
              game: payload.new.game || 'Game',
              username: payload.new.username || 'Account',
              price: payload.new.harga || 0,
              soldDate: new Date(payload.new.updated_at || Date.now()),
              buyer: payload.new.pembeli || 'Pembeli',
              urgency: 'realtime'
            };

            setLiveFeed(prev => [newActivity, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    // Subscribe to sales changes
    const salesSubscription = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales'
        },
        (payload) => {
          console.log('Sales real-time update:', payload);
          // Add to activity feed for real sales updates
          if (payload.new) {
            const newActivity = {
              id: `realtime-sale-transaction-${Date.now()}`,
              type: 'sale',
              icon: <DollarSign className="h-4 w-4" />,
              game: payload.new.game || 'Game',
              username: payload.new.username || 'Account',
              price: payload.new.harga || 0,
              soldDate: new Date(payload.new.created_at || Date.now()),
              buyer: payload.new.pembeli || 'Pembeli',
              urgency: 'realtime'
            };

            setLiveFeed(prev => [newActivity, ...prev.slice(0, 49)]);
          }
        }
      )
      .subscribe();

    return () => {
      accountsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, [supabase]);

  // Build initial activity feed from real data
  useEffect(() => {
    const activities = [];

    // Recent sales
    const sold = accounts.filter(a => a.status === 'terjual' && a.sellDate);
    sold.forEach(a => {
      activities.push({
        id: `sale-${a.id || Math.random()}`,
        type: 'sale',
        message: `${a.nama_akun || a.nama || 'Akun'} terjual`,
        game: a.game || a.kategori || 'Game',
        amount: Number(a.sellPrice || a.nominal || 0),
        time: new Date(a.sellDate).getTime(),
        buyer: a.pembeli || 'Pembeli',
        urgency: 'high'
      });
    });

    // New listings
    const available = accounts.filter(a => a.status !== 'terjual' && a.tanggal);
    available.forEach(a => {
      activities.push({
        id: `list-${a.id || Math.random()}`,
        type: 'listing',
        message: `${a.nama_akun || a.nama || 'Akun'} baru tersedia`,
        game: a.game || a.kategori || 'Game',
        amount: Number(a.harga || a.buyPrice || 0),
        time: new Date(a.tanggal).getTime(),
        urgency: 'medium'
      });
    });

    // Price drops (accounts with harga_before)
    const priceDrops = accounts.filter(a => a.harga_before && a.harga);
    priceDrops.forEach(a => {
      activities.push({
        id: `price-${a.id || Math.random()}`,
        type: 'price_drop',
        message: `${a.nama_akun || a.nama || 'Akun'} turun harga`,
        game: a.game || a.kategori || 'Game',
        amount: Number(a.harga_before) - Number(a.harga),
        time: new Date(a.tanggal || Date.now()).getTime(),
        urgency: 'high'
      });
    });

    // Sort by time, newest first
    activities.sort((a, b) => b.time - a.time);
    setLiveFeed(activities.slice(0, 50));
  }, [accounts]);

  // Simulate live activity every 15-30 seconds
  useEffect(() => {
    const simulateActivity = () => {
      const sold = accounts.filter(a => a.status === 'terjual' && a.sellDate);
      if (sold.length === 0) return;

      const randomSale = sold[Math.floor(Math.random() * sold.length)];
      const activities = [
        {
          id: `live-${Date.now()}`,
          type: 'sale',
          message: `${randomSale.nama_akun || 'Akun'} baru saja terjual`,
          game: randomSale.game || 'Game',
          amount: Number(randomSale.sellPrice || randomSale.nominal || 0),
          time: Date.now(),
          buyer: randomSale.pembeli || 'Pembeli',
          urgency: 'high',
          isLive: true
        },
        {
          id: `live-${Date.now() + 1}`,
          type: 'view',
          message: `${accounts.filter(a => a.status !== 'terjual').length} akun sedang dilihat`,
          game: 'Marketplace',
          amount: 0,
          time: Date.now(),
          urgency: 'low',
          isLive: true
        },
        {
          id: `live-${Date.now() + 2}`,
          type: 'trending',
          message: `${randomSale.game || 'Game'} sedang trending`,
          game: randomSale.game || 'Game',
          amount: 0,
          time: Date.now(),
          urgency: 'medium',
          isLive: true
        }
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setLiveFeed(prev => [randomActivity, ...prev].slice(0, 50));
    };

    intervalRef.current = setInterval(simulateActivity, 15000 + Math.random() * 15000);
    return () => clearInterval(intervalRef.current);
  }, [accounts]);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!supabase) return;

    // Subscribe to accounts changes
    const accountsSubscription = supabase
      .channel('accounts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'accounts'
      }, (payload) => {
        console.log('Accounts change:', payload);

        // Handle different types of changes
        if (payload.eventType === 'UPDATE') {
          const oldRecord = payload.old;
          const newRecord = payload.new;

          // Check if account was sold
          if (oldRecord.status !== 'terjual' && newRecord.status === 'terjual') {
            const saleActivity = {
              id: `realtime-sale-${newRecord.id}-${Date.now()}`,
              type: 'sale',
              message: `${newRecord.nama_akun || 'Akun'} baru saja terjual!`,
              game: newRecord.game || 'Game',
              amount: Number(newRecord.sellPrice || newRecord.nominal || 0),
              time: Date.now(),
              buyer: newRecord.pembeli || 'Pembeli',
              urgency: 'high',
              isLive: true
            };
            setLiveFeed(prev => [saleActivity, ...prev].slice(0, 50));
          }

          // Check for price drops
          if (oldRecord.harga !== newRecord.harga && newRecord.harga < oldRecord.harga) {
            const priceDrop = Number(oldRecord.harga) - Number(newRecord.harga);
            const priceActivity = {
              id: `realtime-price-${newRecord.id}-${Date.now()}`,
              type: 'price_drop',
              message: `${newRecord.nama_akun || 'Akun'} turun harga!`,
              game: newRecord.game || 'Game',
              amount: priceDrop,
              time: Date.now(),
              urgency: 'high',
              isLive: true
            };
            setLiveFeed(prev => [priceActivity, ...prev].slice(0, 50));
          }
        }

        // Handle new listings
        if (payload.eventType === 'INSERT' && newRecord.status !== 'terjual') {
          const listingActivity = {
            id: `realtime-listing-${newRecord.id}-${Date.now()}`,
            type: 'listing',
            message: `Akun baru: ${newRecord.nama_akun || 'Akun'}`,
            game: newRecord.game || 'Game',
            amount: Number(newRecord.harga || 0),
            time: Date.now(),
            urgency: 'medium',
            isLive: true
          };
          setLiveFeed(prev => [listingActivity, ...prev].slice(0, 50));
        }
      })
      .subscribe();

    // Subscribe to sales changes if separate table exists
    const salesSubscription = supabase
      .channel('sales-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sales'
      }, (payload) => {
        console.log('Sales change:', payload);

        if (payload.eventType === 'INSERT') {
          const newSale = payload.new;
          const saleActivity = {
            id: `realtime-sales-${newSale.id}-${Date.now()}`,
            type: 'sale',
            message: `Penjualan baru: ${newSale.nama_akun || 'Akun'}`,
            game: newSale.game || 'Game',
            amount: Number(newSale.nominal || 0),
            time: Date.now(),
            buyer: newSale.pembeli || 'Pembeli',
            urgency: 'high',
            isLive: true
          };
          setLiveFeed(prev => [saleActivity, ...prev].slice(0, 50));
        }
      })
      .subscribe();

    return () => {
      accountsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, [supabase]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return ShoppingBag;
      case 'listing': return Package;
      case 'price_drop': return TrendingUp;
      case 'view': return User;
      case 'trending': return Flame;
      default: return Activity;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return '#10B981';
      case 'listing': return '#8B5CF6';
      case 'price_drop': return '#F59E0B';
      case 'view': return '#60A5FA';
      case 'trending': return '#EC4899';
      default: return '#8B5CF6';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    return `${days}h lalu`;
  };

  const displayedFeed = liveFeed.slice(0, visibleCount);

  return (
    <div className="marketplace-activity-engine">
      <div className="activity-engine-header">
        <div className="activity-engine-title">
          <Activity size={18} strokeWidth={2.5} />
          <span>Aktivitas Marketplace</span>
        </div>
        <div className="activity-engine-live-badge">
          <span className="live-dot" />
          <span>Langsung</span>
        </div>
      </div>

      <div className="activity-engine-feed" ref={feedRef}>
        {displayedFeed.length === 0 ? (
          <div className="activity-empty">
            <Activity size={32} strokeWidth={1.5} />
            <p>Belum ada aktivitas</p>
          </div>
        ) : (
          displayedFeed.map((item, index) => {
            const Icon = getTypeIcon(item.type);
            const color = getTypeColor(item.type);
            return (
              <div
                key={item.id}
                className={`activity-item ${item.isLive ? 'is-live' : ''}`}
                style={{ '--activity-color': color, '--activity-delay': `${index * 0.05}s` }}
              >
                <div className="activity-icon-wrapper" style={{ background: `${color}15` }}>
                  <Icon size={14} strokeWidth={2.5} color={color} />
                </div>
                <div className="activity-content">
                  <div className="activity-message">{item.message}</div>
                  <div className="activity-meta">
                    <span className="activity-game">{item.game}</span>
                    {item.amount > 0 && (
                      <span className="activity-amount">{formatRupiah(item.amount)}</span>
                    )}
                    <span className="activity-time">{formatTimeAgo(item.time)}</span>
                  </div>
                </div>
                {item.isLive && <span className="activity-new-badge">Baru</span>}
              </div>
            );
          })
        )}
      </div>

      {liveFeed.length > visibleCount && (
        <button className="activity-show-more" onClick={() => setVisibleCount(prev => prev + 6)}>
          Tampilkan {Math.min(6, liveFeed.length - visibleCount)} aktivitas lagi
          <ArrowUpRight size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
